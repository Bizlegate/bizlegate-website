import { Sparkles, BookOpen, Monitor } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useContentGetter, useContentText } from "@/hooks/use-content.ts";
import { BOOK_TIERS, BOOK_TIERS_SECTION_DEFAULTS, BOOK_TIERS_CTA } from "../_lib/book-data.ts";
import { useBookPrice } from "../_lib/use-book-price.ts";
import { CARD_GOLD } from "./price-tag.tsx";
import PurchaseDialog, { type Product } from "./purchase-dialog.tsx";

/**
 * The book's three-tier pricing grid — replaces the old single book price
 * (still available on its own further up, at the hero) plus the separate
 * consulting tiers (see claude/00_project_status.md, 2026-09-27 pricing
 * pivot). All three grant /library access — they differ in which chapters
 * that covers, and whether a hand-made custom desktop wallpaper is
 * included.
 *
 * Deliberately un-opinionated layout (2026-09-27 follow-up): the original
 * version of this grid reused the old consulting page's "highlight the
 * middle tier" treatment (raised card, thicker border, a "Most Popular"
 * badge) plus the site's ornate brushed-calligraphy price digits (see
 * BrushPrice in price-tag.tsx) on the middle tier only, while the other two
 * used plain font-serif numerals. The client asked for both to go: buyers
 * should compare these three purely on their own merits, and the visual
 * mismatch between the middle card's hand-drawn digits and the outer two
 * cards' plain serif numerals (whose old-style figures made a digit like
 * "8" read as an odd, uneven height next to its neighbors) made it worse.
 * All three cards now share one flat, identical treatment via TierPrice
 * below — same border, same alignment, no badge — including tier "full"'s
 * strike-through sale price, which now renders as plain text instead of
 * brushed digits.
 */
const TIER_PRODUCT: Record<string, Product> = {
  sample: "book-sample",
  full: "book-full",
  deluxe: "book-deluxe",
};

const TIER_ICONS: Record<string, typeof Sparkles> = {
  sample: Sparkles,
  full: BookOpen,
  deluxe: Monitor,
};

export default function BookTiers() {
  const get = useContentGetter();
  const eyebrow = useContentText(
    "book.tiers.eyebrow",
    BOOK_TIERS_SECTION_DEFAULTS.eyebrow,
  );
  const title = useContentText(
    "book.tiers.title",
    BOOK_TIERS_SECTION_DEFAULTS.title,
  );
  const subtitle = useContentText(
    "book.tiers.subtitle",
    BOOK_TIERS_SECTION_DEFAULTS.subtitle,
  );
  const ctaLabel = useContentText("book.tiers.cta", BOOK_TIERS_CTA);
  const { regularPrice, salePrice, onSale } = useBookPrice();

  return (
    <Section className="bg-secondary/40">
      {/* eyebrowClassName: this section's bg-secondary/40 backdrop composites
          to a mid gray that the default gold eyebrow measures well under
          2:1 against — see the comment on SectionHeading. */}
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={subtitle}
        eyebrowClassName="text-foreground"
      />
      <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
        {BOOK_TIERS.map((tier) => {
          const Icon = TIER_ICONS[tier.key];
          const tierTitle = get(`book.tiers.${tier.key}.title`, tier.title);
          const tierBody = get(`book.tiers.${tier.key}.body`, tier.body);
          return (
            // Same border/background/padding for every card, on purpose —
            // see the header comment above.
            <div
              key={tier.key}
              className="flex flex-col rounded-xl border border-border bg-accent p-7"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-accent-foreground">
                {tierTitle}
              </h3>
              <div className="mt-2">
                {tier.key === "full" ? (
                  <TierPrice
                    price={salePrice}
                    wasPrice={onSale ? regularPrice : undefined}
                  />
                ) : (
                  <TierPrice price={get(tier.priceKey!, tier.priceDefault!)} />
                )}
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {tierBody}
              </p>
              <PurchaseDialog
                product={TIER_PRODUCT[tier.key]}
                productLabel={tierTitle}
              >
                <Button className="mt-6 cursor-pointer">{ctaLabel}</Button>
              </PurchaseDialog>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// One shared, deliberately plain price display for all three cards — see
// the header comment above for why this replaced the brushed-calligraphy
// treatment that used to be on the "full" tier only. `lining-nums` forces
// uniform-height (lining) figures instead of the serif face's default
// old-style figures, which is what made a digit like "8" read as oddly
// tall next to its neighbors — the mismatch the client flagged.
function TierPrice({
  price,
  wasPrice,
}: {
  price: string;
  /** The struck-through original price — only passed for a tier currently
   * on sale (just "full", when onSale is true). */
  wasPrice?: string;
}) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      {wasPrice && (
        <span
          className="lining-nums text-lg font-normal line-through decoration-2"
          style={{ color: CARD_GOLD, textDecorationColor: CARD_GOLD }}
        >
          {wasPrice}
        </span>
      )}
      <span
        className="lining-nums font-serif text-3xl font-bold"
        style={{ color: CARD_GOLD }}
      >
        {price}
      </span>
    </span>
  );
}
