import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

export type BookPage = {
  order: number;
  chapterNumber?: number;
  url: string;
};

// The handful of UI chrome strings around the page images themselves (the
// images are the actual printed page, so they're already in whichever
// language that edition is — this is just the prev/next/jump controls
// wrapped around them). Added 2026-10-27 when the English edition's pages
// were added — before that this was hardcoded to Chinese since only the
// Chinese edition existed yet.
const STRINGS = {
  zh: {
    pageAlt: (n: number) => `第 ${n} 頁`,
    nextPage: "下一頁",
    prevPage: "上一頁",
    coverAlt: "書封面",
    coverHint: "輕觸封面翻開",
    cover: "封面",
    theEnd: "全書完",
    jumpPlaceholder: "跳到章節…",
    chapterOption: (n: number) => `第 ${n} 章`,
    caption:
      "點封面打開書本，之後可以點左右按鈕、點頁面右下角、或用鍵盤左右鍵一頁一頁翻。",
  },
  en: {
    pageAlt: (n: number) => `Page ${n}`,
    nextPage: "Next page",
    prevPage: "Previous page",
    coverAlt: "Book cover",
    coverHint: "TAP THE COVER TO OPEN",
    cover: "Cover",
    theEnd: "The End",
    jumpPlaceholder: "Jump to chapter…",
    chapterOption: (n: number) => `Chapter ${n}`,
    caption:
      "Click the cover to open the book, then use the arrow buttons, the page corners, or your keyboard's left/right arrow keys to flip through.",
  },
} as const;

/**
 * The real-page-image reading view (2026-10-26, English edition added
 * 2026-10-27) — renders the actual printed book (screenshotted from the
 * manuscript PDF via convex/bookAccess.ts getBookPages, chapter numbers
 * 1-30, cover is chapterNumber 0) as a 3D CSS page-flip, instead of
 * re-typesetting the text in HTML. See claude/16_payment_processor_decision.md
 * — the brief was explicitly "use the real pages as-is, don't redesign them."
 *
 * `pages` must already be narrowed to what this buyer is allowed to see
 * (sample vs full) — this component has no access-control opinion of its
 * own, it just flips through whatever array it's given, in `order`.
 */
export default function BookFlipReader({
  pages,
  language = "zh",
}: {
  pages: BookPage[];
  language?: "en" | "zh";
}) {
  const t = STRINGS[language];
  const sorted = useMemo(
    () => [...pages].sort((a, b) => a.order - b.order),
    [pages],
  );
  const cover = sorted.find((p) => p.chapterNumber === 0) ?? sorted[0];
  const leaves = useMemo(
    () => sorted.filter((p) => p !== cover),
    [sorted, cover],
  );

  // Every chapter number present, in first-appearance order, each paired
  // with the leaf index (into `leaves`) where that chapter starts — powers
  // the "jump to chapter" dropdown below.
  const chapterStarts = useMemo(() => {
    const seen = new Set<number>();
    const list: { chapterNumber: number; leafIndex: number }[] = [];
    leaves.forEach((p, i) => {
      if (
        p.chapterNumber !== undefined &&
        p.chapterNumber !== 0 &&
        !seen.has(p.chapterNumber)
      ) {
        seen.add(p.chapterNumber);
        list.push({ chapterNumber: p.chapterNumber, leafIndex: i });
      }
    });
    return list;
  }, [leaves]);

  const [opened, setOpened] = useState(false);
  const [current, setCurrent] = useState(0); // leaves flipped so far

  const atStart = !opened || current === 0;
  const atEnd = !opened || current >= leaves.length - 1;

  const openBook = () => setOpened(true);
  const flipNext = () => {
    if (!opened) return openBook();
    if (current >= leaves.length - 1) return;
    setCurrent((c) => c + 1);
  };
  const flipPrev = () => {
    if (!opened || current === 0) return;
    setCurrent((c) => c - 1);
  };
  const jumpToChapter = (chapterNumber: number) => {
    const target = chapterStarts.find((c) => c.chapterNumber === chapterNumber);
    if (!target) return;
    if (!opened) setOpened(true);
    setCurrent(target.leafIndex);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") flipNext();
      if (e.key === "ArrowLeft") flipPrev();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, current, leaves.length]);

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <style>{`
        .bfr-wrap { perspective: 2400px; perspective-origin: 50% 50%; }
        .bfr-book {
          position: relative;
          width: min(82vw, 380px);
          aspect-ratio: 765 / 1190;
          transform-style: preserve-3d;
        }
        .bfr-case {
          position: absolute; inset: -14px -14px -14px -22px; border-radius: 6px;
          background: linear-gradient(135deg, #15304a 0%, #0A1B2A 55%, #081420 100%);
          box-shadow: 0 30px 60px -15px rgba(0,0,0,0.65), 0 10px 24px -8px rgba(0,0,0,0.5),
            inset 0 0 0 1px rgba(197,160,89,0.18);
        }
        .bfr-case::before {
          content: ""; position: absolute; left: 14px; top: 0; bottom: 0; width: 10px;
          background: linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0) 70%);
        }
        .bfr-edges {
          position: absolute; right: -6px; top: 6px; bottom: 6px; width: 10px;
          background: repeating-linear-gradient(to bottom, #efe6d2 0px, #efe6d2 1.4px, #e3d8bf 1.4px, #e3d8bf 2.4px);
          border-radius: 0 3px 3px 0; box-shadow: inset -2px 0 3px rgba(0,0,0,0.25);
        }
        .bfr-cover {
          position: absolute; inset: 0; transform-origin: left center;
          transform-style: preserve-3d; transition: transform 1.05s cubic-bezier(.65,0,.35,1);
          cursor: pointer; z-index: 999;
        }
        .bfr-cover.open { transform: rotateY(-156deg); pointer-events: none; }
        .bfr-cover-face {
          position: absolute; inset: 0; backface-visibility: hidden; border-radius: 3px; overflow: hidden;
        }
        .bfr-cover-face img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .bfr-cover-front { box-shadow: inset 0 0 0 1px rgba(197,160,89,0.25), inset 0 0 40px rgba(0,0,0,0.35); }
        .bfr-cover-back { background: linear-gradient(160deg, #0d2338 0%, #0A1B2A 100%); transform: rotateY(180deg); }
        .bfr-cover-hint {
          position: absolute; bottom: 4%; left: 0; right: 0; text-align: center;
          color: rgba(255,255,255,0.75); font-size: 11px; letter-spacing: 0.18em;
          text-shadow: 0 1px 4px rgba(0,0,0,0.6); animation: bfr-pulse 2.2s ease-in-out infinite; pointer-events: none;
        }
        @keyframes bfr-pulse { 0%,100%{opacity:.35} 50%{opacity:.85} }
        .bfr-pages { position: absolute; inset: 0; border-radius: 3px; overflow: hidden; box-shadow: 0 2px 18px rgba(0,0,0,0.35); }
        .bfr-page {
          position: absolute; inset: 0; transform-origin: left center; transform-style: preserve-3d;
          transition: transform 0.55s cubic-bezier(.65,0,.35,1); will-change: transform;
        }
        .bfr-page.flipped { transform: rotateY(-178deg); }
        .bfr-page.flipped .bfr-page-front { box-shadow: inset -40px 0 50px -20px rgba(0,0,0,0.35); }
        .bfr-page-face { position: absolute; inset: 0; backface-visibility: hidden; overflow: hidden; }
        .bfr-page-face img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .bfr-page-front { z-index: 2; }
        .bfr-page-front::before {
          content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 22px;
          background: linear-gradient(90deg, rgba(0,0,0,0.16), rgba(0,0,0,0)); pointer-events: none; z-index: 3;
        }
        .bfr-page-back { transform: rotateY(180deg); background: #FAF7F0; }
        .bfr-corner { position: absolute; bottom: 0; width: 54px; height: 54px; z-index: 5; cursor: pointer; }
        .bfr-corner-next { right: 0; background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.08) 50%); border-bottom-right-radius: 3px; }
        .bfr-corner-prev { left: 0; background: linear-gradient(225deg, transparent 50%, rgba(0,0,0,0.08) 50%); border-bottom-left-radius: 3px; }
      `}</style>

      <div className="bfr-wrap">
        <div className="bfr-book">
          <div className="bfr-case" />
          <div className="bfr-edges" />
          <div className="bfr-pages">
            {leaves.map((p, i) => (
              <div
                key={p.order}
                className={`bfr-page${i < current ? " flipped" : ""}`}
                style={{ zIndex: leaves.length - i }}
              >
                <div className="bfr-page-face bfr-page-front">
                  <img src={p.url} alt={t.pageAlt(i + 2)} loading="lazy" />
                  {i < leaves.length - 1 && (
                    <div
                      className="bfr-corner bfr-corner-next"
                      onClick={flipNext}
                      title={t.nextPage}
                    />
                  )}
                  {i > 0 && (
                    <div
                      className="bfr-corner bfr-corner-prev"
                      onClick={flipPrev}
                      title={t.prevPage}
                    />
                  )}
                </div>
                <div className="bfr-page-face bfr-page-back" />
              </div>
            ))}
          </div>
          {cover && (
            <div className={`bfr-cover${opened ? " open" : ""}`} onClick={openBook}>
              <div className="bfr-cover-face bfr-cover-front">
                <img src={cover.url} alt={t.coverAlt} />
                {!opened && <div className="bfr-cover-hint">{t.coverHint}</div>}
              </div>
              <div className="bfr-cover-face bfr-cover-back" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          size="icon"
          variant="outline"
          className="cursor-pointer rounded-full"
          disabled={atStart}
          onClick={flipPrev}
          aria-label={t.prevPage}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-20 text-center text-xs text-muted-foreground">
          {!opened ? t.cover : atEnd ? t.theEnd : `${current + 1} / ${leaves.length}`}
        </span>
        <Button
          size="icon"
          variant="outline"
          className="cursor-pointer rounded-full"
          disabled={atEnd}
          onClick={flipNext}
          aria-label={t.nextPage}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {chapterStarts.length > 1 && (
        <Select
          onValueChange={(v) => jumpToChapter(Number(v))}
        >
          <SelectTrigger className="w-full max-w-xs cursor-pointer">
            <SelectValue placeholder={t.jumpPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {chapterStarts.map((c) => (
              <SelectItem key={c.chapterNumber} value={String(c.chapterNumber)}>
                {t.chapterOption(c.chapterNumber)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <p className="max-w-sm text-center text-xs text-muted-foreground">
        {t.caption}
      </p>
    </div>
  );
}
