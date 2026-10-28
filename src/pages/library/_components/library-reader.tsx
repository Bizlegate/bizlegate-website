import { useEffect, useState } from "react";
import { useAction, useQuery } from "convex/react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  Image as ImageIcon,
  LogOut,
  Sparkles,
} from "lucide-react";
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
import PurchaseDialog from "@/pages/book/_components/purchase-dialog.tsx";
import BookFlipReader, { type BookPage } from "./book-flip-reader.tsx";
import type { LibraryCredentials } from "./library-login.tsx";

type Language = "en" | "zh";
type View = "read" | "wallpapers";

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
  chapterAccess,
  wallpaperAccess,
  pdfAccess,
  onSignOut,
}: {
  creds: LibraryCredentials;
  grantLanguage: "en" | "zh" | "both";
  /** "sample" = the $10 tier's two chapters only; getChapters already
   * narrows the returned array server-side, this is only used here to show
   * the upsell banner below. */
  chapterAccess: "sample" | "full";
  /** Unlocks the "Wallpapers" tab below — only the $83.59 deluxe tier grants
   * this (see convex/bookAccess.ts). */
  wallpaperAccess: boolean;
  /** Unlocks the paid "download a PDF keepsake copy" add-on below (added
   * 2026-10-27) — only ever true for a buyer who also has chapterAccess
   * "full" (see PDF_ACCESS_FOR_PRODUCT in book-access-panel.tsx), never
   * offered on top of the $10 sample tier. */
  pdfAccess: boolean;
  onSignOut: () => void;
}) {
  const [language, setLanguage] = useState<Language>(
    grantLanguage === "zh" ? "zh" : "en",
  );
  const [chapterIndex, setChapterIndex] = useState(0);
  const [view, setView] = useState<View>("read");

  const chapters = useQuery(api.bookAccess.getChapters, {
    email: creds.email,
    code: creds.code,
    language,
  }) as Chapter[] | undefined;

  // The real-page-image flip reader (2026-10-26, English edition added
  // 2026-10-27) — queried for whichever language is currently selected.
  // Falls back to the plain-text reader below whenever this comes back
  // empty, so each edition keeps working seamlessly through the admin's
  // page-by-page upload rather than needing a manual "go live" toggle per
  // language — see convex/bookAccess.ts getBookPages / book-flip-reader.tsx.
  const bookPages = useQuery(api.bookAccess.getBookPages, {
    email: creds.email,
    code: creds.code,
    language,
  }) as BookPage[] | undefined;
  const useFlipReader = !!bookPages && bookPages.length > 0;

  // The paid "keepsake PDF download" add-on (2026-10-27, watermarked with
  // the buyer's email 2026-10-27 — see convex/bookPdfWatermark.ts for why
  // this is an action, not a query: generating the watermarked copy needs
  // file storage writes, which only an action can do). Deliberately NOT
  // auto-fetched on render like getChapters/getBookPages above — stamping a
  // fresh copy takes a few seconds, so this only runs when the buyer
  // actually clicks "Download PDF" below. `language` here is always covered
  // by the grant: the language Select further up only appears (and only
  // lets the buyer switch) when grantLanguage is "both", in which case the
  // grant covers both anyway.
  const getWatermarkedPdf = useAction(api.bookPdfWatermark.getWatermarkedBookPdf);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [pdfDownloadError, setPdfDownloadError] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    setPdfDownloading(true);
    setPdfDownloadError(null);
    try {
      const result = await getWatermarkedPdf({
        email: creds.email,
        code: creds.code,
        language,
      });
      if (!result) {
        setPdfDownloadError("Not ready yet — check back soon.");
        return;
      }
      // The URL only exists once the action resolves, so there's no <a
      // href> to render ahead of time — build one and click it
      // programmatically to trigger the browser's normal download flow.
      const link = document.createElement("a");
      link.href = result.url;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setPdfDownloadError("Could not prepare your PDF — please try again.");
    } finally {
      setPdfDownloading(false);
    }
  };

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

      {wallpaperAccess && (
        <div className="mb-6 flex gap-2">
          <Button
            size="sm"
            variant={view === "read" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setView("read")}
          >
            <BookOpen className="size-4" />
            Read
          </Button>
          <Button
            size="sm"
            variant={view === "wallpapers" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setView("wallpapers")}
          >
            <ImageIcon className="size-4" />
            Wallpapers
          </Button>
        </div>
      )}

      {view === "wallpapers" ? (
        <WallpaperGallery creds={creds} />
      ) : (
        <>
          {chapterAccess === "sample" && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-foreground">
                <Sparkles className="size-4 text-primary" />
                You have access to 2 sample chapters.
              </span>
              {/* "book-upgrade" product, $32.39 (= $42.39 - $10 already
                  paid), not a plain link to /book — a Tier 1 reader should
                  never be asked to pay the full price again (decided with
                  the client 2026-10-26). grantAccess upserts by email, so
                  granting chapterAccess "full" here upgrades this same
                  bookAccess row in place rather than creating a new one. */}
              <PurchaseDialog
                product="book-upgrade"
                productLabel="the full booklet (upgrade — you've already paid $10)"
              >
                <Button size="sm" variant="secondary" className="cursor-pointer">
                  Get the full booklet
                </Button>
              </PurchaseDialog>
            </div>
          )}

          {chapterAccess === "full" &&
            (pdfAccess ? (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
                <span className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-foreground">
                    <FileDown className="size-4 text-primary" />
                    Your PDF keepsake copy
                  </span>
                  {pdfDownloadError && (
                    <span className="text-xs text-destructive">
                      {pdfDownloadError}
                    </span>
                  )}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  className="cursor-pointer"
                  disabled={pdfDownloading}
                  onClick={handleDownloadPdf}
                >
                  <Download className="size-4" />
                  {pdfDownloading ? "Preparing…" : "Download PDF"}
                </Button>
              </div>
            ) : (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <FileDown className="size-4 text-primary" />
                  Want to keep a copy? Download it as a PDF.
                </span>
                <PurchaseDialog
                  product="book-pdf"
                  productLabel="a downloadable PDF keepsake copy ($14.99)"
                >
                  <Button size="sm" variant="secondary" className="cursor-pointer">
                    Collect the PDF ($14.99)
                  </Button>
                </PurchaseDialog>
              </div>
            ))}

          {useFlipReader ? (
            <BookFlipReader pages={bookPages!} language={language} />
          ) : chapters === undefined ? (
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
        </>
      )}
    </div>
  );
}

type Wallpaper = { _id: string; url: string; label?: string };

/**
 * The $83.59 deluxe tier's deliverable, since the 2026-10-26 pivot away
 * from a one-off hand-made-per-buyer wallpaper: a shared, growing pool of
 * pre-made desktop wallpapers (reminder quotes on a background image) that
 * anyone with wallpaperAccess can freely browse and download — the admin
 * uploads to the pool once from /admin → Book Access, instead of
 * fulfilling each order by hand. See getWallpapers in convex/bookAccess.ts.
 */
function WallpaperGallery({ creds }: { creds: LibraryCredentials }) {
  const wallpapers = useQuery(api.bookAccess.getWallpapers, {
    email: creds.email,
    code: creds.code,
  }) as Wallpaper[] | undefined;

  if (wallpapers === undefined) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-video w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (wallpapers.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        No wallpapers uploaded yet — check back soon.
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {wallpapers.map((w) => (
        <div
          key={w._id}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <img
            src={w.url}
            alt={w.label || "Desktop wallpaper"}
            className="aspect-video w-full object-cover"
          />
          <div className="flex items-center justify-between gap-3 p-4">
            <p className="truncate text-sm font-medium text-card-foreground">
              {w.label || "Desktop wallpaper"}
            </p>
            <Button asChild size="sm" variant="secondary" className="cursor-pointer">
              <a href={w.url} download>
                <Download className="size-4" />
                Download
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
