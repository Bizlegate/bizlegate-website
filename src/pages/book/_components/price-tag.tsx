import { cn } from "@/lib/utils.ts";

const SIZE_CLASSES = {
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
} as const;

// The sale price is bumped up a step from SIZE_CLASSES so the brushed
// digits (see BrushPrice below) still land as the biggest, boldest thing
// in the price tag.
const SALE_SIZE_CLASSES = {
  md: "text-3xl",
  lg: "text-4xl",
  xl: "text-5xl",
} as const;

// The small struck-through "was $X" price — one step up from a flat
// text-base so it stays legible once the strike-through line is drawn
// through it, without closing the gap with the (much larger) sale price.
const REGULAR_STRIKE_SIZE_CLASSES = {
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
} as const;

// Height each brushed digit sprite renders at, in em relative to the
// surrounding text — tuned by eye so the digits sit at roughly the same
// scale as the "$" / "." characters next to them.
const DIGIT_HEIGHT_EM = 1.15;

// Same wine-red pairing used for the strike-through stroke below: the
// deeper tone for light section backgrounds, the lightened one so it still
// reads on the dark navy sections (hero / final CTA). WINE_ON_DARK was
// originally a desaturated dusty-rose (#c98a92, oklch chroma 0.08) so it
// wouldn't sink into the navy — measured contrast was fine (6.3:1), but it
// read as pale "salmon" rather than a sale/urgency color. Deepened to a
// fully saturated red (oklch chroma 0.19) that still clears WCAG AA for
// large text against #0A1B2A (4.9:1). The sale-price *digits* are separate
// raster sprite files (see digitSrc below) and were recolored to match —
// this constant only drives the "$" and "." characters next to them.
const WINE = "#7c2d3a";
const WINE_ON_DARK = "#ec515d";

// The regular --primary gold (oklch L0.72) reads fine on white or dark-navy
// backgrounds, but measured contrast against this page's --accent
// champagne-gold card background (oklch L0.93, nearly the same hue) is only
// ~2:1 — well under WCAG's 3:1 floor even for large text, which is why the
// consulting-tier prices read as illegible on the new gold cards. This is a
// darker, card-specific gold (~5.5:1 against --accent) used only when a
// gold price sits directly on that card surface — see the `onCard` prop.
export const CARD_GOLD = "#7a5320";

type BrushTone = "gold" | "wine";

/**
 * The digits 0-9 are cropped directly out of the exact calligraphy artwork
 * the client supplied (not a look-alike font — no Google Font matched the
 * brush texture closely enough). Each is a small transparent WebP. The
 * source artwork only contained the ten digits, so "$" borrows a real
 * calligraphy face (Ma Shan Zheng — see --font-hand in index.css) tilted
 * slightly back to read as the same brush family, and "." falls back to
 * the site's bold serif face.
 *
 * Three colorways of every digit are pre-rendered to /public/book/digits
 * (same alpha mask, different fill) rather than recoloring in CSS, because
 * the digits are raster art, not font glyphs — a CSS `color` can't reach
 * the pixels inside an <img>: `digit-N.webp` (gold, the price shown with
 * confidence — hero, any regular price), `digit-N-wine.webp` (the deal
 * price on light section backgrounds) and `digit-N-wine-dark.webp` (the
 * deal price on the dark navy sections, lightened so it doesn't sink into
 * the background the way the darker wine would).
 */
function digitSrc(char: string, tone: BrushTone, dark: boolean): string | null {
  if (!/^[0-9]$/.test(char)) return null;
  const suffix = tone === "gold" ? "" : dark ? "-wine-dark" : "-wine";
  return `/book/digits/digit-${char}${suffix}.webp`;
}

function BrushPrice({
  value,
  size,
  className,
  tone = "gold",
  dark = false,
}: {
  value: string;
  size: keyof typeof SALE_SIZE_CLASSES;
  className?: string;
  /** "gold": the confident, non-discounted price (hero, any regular
   *  price). "wine": the deal price shown next to a struck-through
   *  compare price. */
  tone?: BrushTone;
  /** True on dark (navy) section backgrounds — only matters for
   *  tone="wine", where it swaps in the lightened wine so the digits
   *  stay legible against navy instead of both reading as near-black. */
  dark?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label={value}
      className={cn(
        "inline-flex items-baseline",
        tone === "gold" && "text-primary",
        SALE_SIZE_CLASSES[size],
        className,
      )}
      style={tone === "wine" ? { color: dark ? WINE_ON_DARK : WINE } : undefined}
    >
      {[...value].map((char, i) => {
        const src = digitSrc(char, tone, dark);
        if (src) {
          return (
            <img
              key={i}
              src={src}
              alt=""
              aria-hidden="true"
              className="inline-block w-auto"
              style={{ height: `${DIGIT_HEIGHT_EM}em` }}
            />
          );
        }
        if (char === "$") {
          return (
            <span
              key={i}
              className="inline-block -rotate-6 font-hand"
              aria-hidden="true"
            >
              {char}
            </span>
          );
        }
        return (
          <span key={i} className="font-serif font-black" aria-hidden="true">
            {char}
          </span>
        );
      })}
    </span>
  );
}

/**
 * A single confident brush swipe drawn over the struck-through regular
 * price, top-right to bottom-left — standing in for a plain CSS
 * line-through so the "strike" reads as a hand-drawn mark instead of a
 * ruled line. Sized in a viewBox that roughly matches a price's aspect
 * ratio and stretched to fill its wrapper via preserveAspectRatio="none",
 * so it scales with whatever text it's laid over.
 */
function StrikeStroke({ dark = false }: { dark?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="pointer-events-none absolute"
      style={{ left: "-8%", right: "-8%", top: "-22%", bottom: "-22%", width: "116%", height: "144%" }}
    >
      <path
        d="M 92 4 Q 97 3 94 9 L 11 35 Q 5 39 3 34 Q 2 30 8 27 L 87 1 Q 91 0 92 4 Z"
        fill={dark ? WINE_ON_DARK : WINE}
      />
    </svg>
  );
}

/**
 * A standalone, visually prominent price display — deliberately NOT tucked
 * inside a button label. When a sale is active, the regular price shows
 * small and struck through, and the sale price is rendered large as brushed
 * calligraphy digits (see BrushPrice) in the site's existing champagne-gold
 * accent color, so it reads as a deal rather than blending into the
 * surrounding text. See use-book-price.ts for how
 * regularPrice/salePrice/onSale are worked out.
 *
 * `variant="brushOnly"` skips the compare-price logic entirely and always
 * renders `regularPrice` alone in the big brushed-calligraphy style —
 * used for the book's very first price mention (the hero), which should
 * read as a confident price rather than a discount, while the sale-styled
 * compare price is reserved for the lower, deal-focused sections of the
 * page (final CTA, exit popup, quiz result).
 */
export function PriceTag({
  regularPrice,
  salePrice,
  onSale,
  size = "lg",
  dark = false,
  onCard = false,
  className,
  variant = "compare",
}: {
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  size?: keyof typeof SIZE_CLASSES;
  /** True on dark (navy) section backgrounds, so the regular price stays
   * readable instead of using the light-background muted gray. */
  dark?: boolean;
  /** True when this price sits directly on the --accent champagne-gold
   * card background (the consulting-tier cards) rather than the page's
   * plain background — swaps the regular gold price to CARD_GOLD, a
   * darker gold with enough contrast against that specific card tone (see
   * the comment on CARD_GOLD above). Has no effect on the sale-price
   * brush digits, which already use the (unrelated, high-contrast) wine
   * tone. */
  onCard?: boolean;
  className?: string;
  variant?: "compare" | "brushOnly";
}) {
  if (variant === "brushOnly") {
    return <BrushPrice value={regularPrice} size={size} className={className} />;
  }

  if (!onSale) {
    return (
      <span
        className={cn(
          "font-serif font-bold",
          !onCard && "text-primary",
          SIZE_CLASSES[size],
          className,
        )}
        style={onCard ? { color: CARD_GOLD } : undefined}
      >
        {regularPrice}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-baseline gap-x-3 gap-y-1",
        className,
      )}
    >
      {/* Gold like every other regular price on the page, crossed out by a
          hand-drawn wine-red brush stroke (see StrikeStroke) rather than a
          plain CSS line-through — the deal price next to it carries the
          wine-red instead. */}
      <span
        className={cn(
          "relative inline-block font-normal",
          !onCard && "text-primary",
          REGULAR_STRIKE_SIZE_CLASSES[size],
        )}
        style={onCard ? { color: CARD_GOLD } : undefined}
      >
        {regularPrice}
        <StrikeStroke dark={dark} />
      </span>
      <BrushPrice value={salePrice} size={size} tone="wine" dark={dark} />
    </span>
  );
}
