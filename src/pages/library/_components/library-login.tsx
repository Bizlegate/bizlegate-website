import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { BookLock, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";

export type LibraryCredentials = { email: string; code: string };

const STORAGE_KEY = "bizlegate.library.credentials";

/**
 * Remembers the buyer's email + access code across visits so they don't have
 * to retype it every time — a plain convenience, not a security boundary.
 * Every read of book content still re-checks these credentials against the
 * live grant on the server (see bookAccess.ts's verifyAccess/getChapters),
 * so a revoked or expired credential stops working immediately regardless of
 * what's still sitting in this browser's storage.
 */
export function useLibraryCredentials() {
  const [creds, setCreds] = useState<LibraryCredentials | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setCreds(JSON.parse(raw));
    } catch {
      // Private browsing / blocked storage — just start signed out.
    }
    setHydrated(true);
  }, []);

  const save = (next: LibraryCredentials) => {
    setCreds(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const clear = () => {
    setCreds(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return { creds, hydrated, save, clear };
}

export default function LibraryLogin({
  onVerified,
}: {
  onVerified: (creds: LibraryCredentials) => void;
}) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [attempt, setAttempt] = useState<LibraryCredentials | null>(null);

  const result = useQuery(
    api.bookAccess.verifyAccess,
    attempt ? { email: attempt.email, code: attempt.code } : "skip",
  );

  useEffect(() => {
    if (attempt && result?.ok) {
      onVerified(attempt);
    }
  }, [attempt, result, onVerified]);

  const checking = attempt !== null && result === undefined;
  const failed = attempt !== null && result !== undefined && !result.ok;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BookLock className="size-7" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Be the Outsmarter
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with the email and access code from your confirmation
          email.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setAttempt({ email: email.trim(), code: code.trim() });
        }}
        className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="space-y-1.5">
          <Label htmlFor="library-email">Email</Label>
          <Input
            id="library-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="library-code">Access code</Label>
          <Input
            id="library-code"
            required
            autoComplete="off"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="XXXXX-XXXXX"
            className="font-mono uppercase tracking-wide"
          />
        </div>

        {failed && (
          <Alert variant="destructive">
            <AlertTitle>Invalid email or access code</AlertTitle>
            <AlertDescription>
              Double-check the email and code from your confirmation email —
              or reply to that email if you've lost your code.
            </AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full cursor-pointer" disabled={checking}>
          {checking ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Checking…
            </>
          ) : (
            "Read the book"
          )}
        </Button>
      </form>
    </div>
  );
}
