import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import LibraryLogin, {
  useLibraryCredentials,
} from "./_components/library-login.tsx";
import LibraryReader from "./_components/library-reader.tsx";

/**
 * The gated online-reading page for "Be the Outsmarter" — the default/free
 * way to read (see claude/16_payment_processor_decision.md for why selling
 * a plain downloadable PDF was originally ruled out, to avoid piracy). A
 * paid "keepsake PDF download" add-on was added 2026-10-27 on top of this —
 * see pdfAccess below — deliberately as an extra for a buyer who already
 * has full access, not a replacement for this reader. A saved email+code is
 * remembered in this browser (see useLibraryCredentials), but is re-checked
 * against the live grant on every visit via verifyAccess — a revoked or
 * stale credential never renders the reader, it just falls back to the
 * login form.
 */
export default function Library() {
  const { creds, hydrated, save, clear } = useLibraryCredentials();

  const verify = useQuery(
    api.bookAccess.verifyAccess,
    creds ? { email: creds.email, code: creds.code } : "skip",
  );

  useEffect(() => {
    if (creds && verify && !verify.ok) {
      clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creds, verify]);

  if (!hydrated) {
    return null;
  }

  // A saved credential is being (re)checked — avoid flashing the login form
  // for a split second while that request is in flight.
  if (creds && verify === undefined) {
    return null;
  }

  if (creds && verify?.ok) {
    return (
      <LibraryReader
        creds={creds}
        grantLanguage={verify.language}
        chapterAccess={verify.chapterAccess}
        wallpaperAccess={verify.wallpaperAccess}
        pdfAccess={verify.pdfAccess}
        onSignOut={clear}
      />
    );
  }

  return <LibraryLogin onVerified={save} />;
}
