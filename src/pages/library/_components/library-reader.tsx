import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { BookOpen, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { LibraryCredentials } from "./library-login.tsx";

type Language = "en" | "zh";

// Mirrors the shape returned by convex/bookAccess.ts's getChapters (itself
// re-exporting the BookChapter shape from the server-only
// convex/bookContentData.ts — deliberately redeclared here instead of
// imported, since that file must never be imported from client code, see
// its header comment). Declaring this explicitly keeps this component
// type-safe even at a moment when convex/_generated/api.d.ts hasn't been
// regenerated yet (e.g. before `npx convex dev` has been run after adding
// bookAccess.ts) — without it, TS falls back to `any` for the query result
// and every .map() callback below trips noImplicitAny.
type ChapterBlock = { type: "p" | "subhead" | "takeaway"; text: string };
type Chapter = {
  number: number;
  title: string;
  part: string;
  blocks: ChapterBlock[];
};

export default function LibraryReader({
  creds,
  grantLanguage,
  onSignOut,
}: {
  creds: LibraryCredentials;
  grantLanguage: "en" | "zh" | "both";
  onSignOut: () => void;
}) {
  const [language, setLanguage] = useState<Language>(
    grantLanguage === "zh" ? "zh" : "en",
  );
  const [chapterIndex, setChapterIndex] = useState(0);

  const chapters = useQuery(api.bookAccess.getChapters, {
    email: creds.email,
    code: creds.code,
    language,
  }) as Chapter[] | undefined;

  // Jump back to chapter one whenever the reader switches language — the two
  // editions aren't guaranteed to line up chapter-for-chapter in the UI, and
  // this avoids landing on an out-of-range index.
  useEffect(() => {
    setChapterIndex(0);
  }, [language]);

  // Deliberately soft anti-copy hardening — this deters casual copy/paste,
  // right-click "save as", and printing. It is not real DRM (nothing can
  // stop a determined screenshot), and isn't meant to be — see
  // claude/16_payment_processor_decision.md for why the actual protection
  // here is the manual-reconciliation + per-buyer access code model, not
  // client-side tricks.
  useEffect(() => {
    const blockContextMenu = (e: MouseEvent) => e.preventDefault();
    const blockShortcuts = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const blocked =
        (e.ctrlKey || e.metaKey) &&
        (key === "p" || key === "s" || key === "c" || key === "u");
      if (blocked) e.preventDefault();
    };
    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockShortcuts);
    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockShortcuts);
    };
  }, []);

  const chapter = chapters?.[chapterIndex];
  const canGoPrev = chapterIndex > 0;
  const canGoNext = chapters ? chapterIndex < chapters.length - 1 : false;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-3xl flex-col px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="size-4" />
          Be the Outsmarter — signed in as {creds.email}
        </div>
        <div className="flex items-center gap-3">
          {grantLanguage === "both" && (
            <Select
              value={language}
              onValueChange={(v) => setLanguage(v as Language)}
            >
              <SelectTrigger className="w-28 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button variant="ghost" size="sm" className="cursor-pointer" onClick={onSignOut}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </div>

      {chapters === undefined ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : (
        <>
          <div className="mb-6">
            <Select
              value={String(chapterIndex)}
              onValueChange={(v) => setChapterIndex(Number(v))}
            >
              <SelectTrigger className="w-full max-w-md cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chapters.map((c, i) => (
                  <SelectItem key={c.number} value={String(i)}>
                    {c.number}. {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {chapter && (
            <article className="select-none space-y-5 leading-relaxed text-foreground">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {chapter.part}
              </p>
              <h1 className="font-serif text-3xl font-bold">
                {chapter.number}. {chapter.title}
              </h1>
              {chapter.blocks.map((block, i) => {
                if (block.type === "subhead") {
                  return (
                    <h3
                      key={i}
                      className="pt-2 font-serif text-lg font-semibold text-foreground"
                    >
                      {block.text}
                    </h3>
                  );
                }
                if (block.type === "takeaway") {
                  return (
                    <div
                      key={i}
                      className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm font-medium italic text-foreground"
                    >
                      {block.text}
                    </div>
                  );
                }
                return (
                  <p key={i} className="text-base">
                    {block.text}
                  </p>
                );
              })}
            </article>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={!canGoPrev}
              onClick={() => setChapterIndex((i) => i - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={!canGoNext}
              onClick={() => setChapterIndex((i) => i + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
