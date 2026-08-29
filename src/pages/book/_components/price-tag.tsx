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

/**
 * The digits 0-9 are cropped directly out of the exact calligraphy artwork
 * the client supplied (not a look-alike font — no Google Font matched the
 * brush texture closely enough). Each is a small transparent WebP,
 * recolored to the site's champagne-gold accent, stored under
 * /public/book/digits. That source artwork only contained the ten digits,
 * so "$" borrows a real calligraphy face (Ma Shan Zheng — see --font-hand
 * in index.css) tilted slightly back to read as the same brush family,
 * and "." falls back to the site's bold serif face — both in the same
 * gold color to frame the digits.
 */
function digitSrc(char: string): string | null {
  return /^[0-9]$/.test(char) ? `/book/digits/digit-${char}.webp` : null;
}

function BrushPrice({
  value,
  size,
  className,
}: {
  value: string;
  size: keyof typeof SALE_SIZE_CLASSES;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={value}
      className={cn(
        "inline-flex items-baseline text-primary",
        SALE_SIZE_CLASSES[size],
        className,
      )}
    >
      {[...value].map((char, i) => {
        const src = digitSrc(char);
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
          SIZE_CLASSES[size],
          dark ? "text-white" : "text-foreground",
          className,
        )}
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
      <span
        className={cn(
          "font-normal line-through",
          REGULAR_STRIKE_SIZE_CLASSES[size],
          // Wine red rather than the destructive/pure-red accent — reads
          // as "struck through" without being harsh next to the gold sale
          // price. Lightened a touch on dark (navy) backgrounds so it
          // stays visible there too.
          dark ? "text-[#c98a92]" : "text-[#7c2d3a]",
        )}
      >
        {regularPrice}
      </span>
      <BrushPrice value={salePrice} size={size} />
    </span>
  );
}
