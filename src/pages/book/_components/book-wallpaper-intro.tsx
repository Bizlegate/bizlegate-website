import { Section, SectionHeading } from "@/components/layout/section.tsx";
import { useContentText, useMediaValue } from "@/hooks/use-content.ts";
import {
  BOOK_WALLPAPER_INTRO_DEFAULTS,
  BOOK_WALLPAPER_INTRO_IMAGE_KEY,
  BOOK_WALLPAPER_INTRO_IMAGE_DEFAULT,
} from "../_lib/book-data.ts";

/**
 * Introduces the Tier 3 "Wallpaper Library" deliverable, placed right
 * before the pricing tiers (BookTiers) below — added 2026-10-26 because
 * nothing earlier on the page explained what the wallpaper library actually
 * is before a visitor hit the price grid and saw "Wallpaper Library"
 * mentioned with no context. The client supplied a reference mockup (a
 * desktop + laptop on a desk showing sample wallpaper quotes, plus a few
 * floating preview cards) — the image here is a single placeholder, not an
 * attempt to recreate that exact composite; swap it for a real mockup or
 * preview graphic from /admin → Content → Book.
 */
export default function BookWallpaperIntro() {
  const eyebrow = useContentText(
    "book.wallpaperIntro.eyebrow",
    BOOK_WALLPAPER_INTRO_DEFAULTS.eyebrow,
  );
  const title = useContentText(
    "book.wallpaperIntro.title",
    BOOK_WALLPAPER_INTRO_DEFAULTS.title,
  );
  const body = useContentText(
    "book.wallpaperIntro.body",
    BOOK_WALLPAPER_INTRO_DEFAULTS.body,
  );
  const image = useMediaValue(
    BOOK_WALLPAPER_INTRO_IMAGE_KEY,
    BOOK_WALLPAPER_INTRO_IMAGE_DEFAULT,
  );

  return (
    <Section className="bg-background">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
        <img
          src={image.url}
          alt={title}
          className="order-first aspect-[4/3] w-full rounded-xl object-cover shadow-xl md:order-last"
        />
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={body}
          align="left"
        />
      </div>
    </Section>
  );
}
