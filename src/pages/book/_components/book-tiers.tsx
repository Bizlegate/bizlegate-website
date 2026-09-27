import { Sparkles, BookOpen, Monitor } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useContentGetter, useContentText } from "@/hooks/use-content.ts";
import { BOOK_TIERS, BOOK_TIERS_SECTION_DEFAULTS, BOOK_TIERS_CTA } from "../_lib/book-data.ts";
import { useBookPrice } from "../_lib/use-book-price.ts";
import { PriceTag, CARD_GOLD } from "./price-tag.tsx";
import PurchaseDialog, { type Product } from "./purchase-dialog.tsx";

/**
 * The book's three-tier pricing grid — replaces the old single book price
 * (still available on its own further up, at the hero) plus the separate
 * consulting tiers (see claude/00_project_status.md, 2026-09-27 pricing
 * pivot: consulting is retired, this reuses the same "three cards, middle
 * one highlighted" layout that book-consulting.tsx used). All three grant
 * /library access — they differ in which chapters that covers, and whether
 * a hand-made custom desktop wallpaper is included.
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
          const highlighted = tier.highlighted;
          const tierTitle = get(`book.tiers.${tier.key}.title`, tier.title);
          const tierBody = get(`book.tiers.${tier.key}.body`, tier.body);
          return (
            <div
              key={tier.key}
              className={
                highlighted
                  ? "relative flex flex-col rounded-xl border-2 border-primary bg-accent p-7 shadow-lg sm:-translate-y-2"
                  : "flex flex-col rounded-xl border border-border bg-accent p-7"
              }
            >
              {highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                  Most Popular
                </span>
              )}
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-accent-foreground">
                {tierTitle}
              </h3>
              <div className="mt-2">
                {tier.key === "full" ? (
                  <PriceTag
                    regularPrice={regularPrice}
                    salePrice={salePrice}
                    onSale={onSale}
                    onCard
                    size="md"
                  />
                ) : (
                  <TierPrice
                    priceKey={tier.priceKey!}
                    priceDefault={tier.priceDefault!}
                  />
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

// Small helper so the two flat-priced tiers (sample, deluxe) read the same
// CMS-editable price and render it in the same style as the "full" tier's
// PriceTag — see CARD_GOLD in price-tag.tsx for why this specific gold
// (rather than the default --primary gold) is used directly on this card
// background.
function TierPrice({
  priceKey,
  priceDefault,
}: {
  priceKey: string;
  priceDefault: string;
}) {
  const price = useContentText(priceKey, priceDefault);
  return (
    <span className="font-serif text-3xl font-bold" style={{ color: CARD_GOLD }}>
      {price}
    </span>
  );
}
