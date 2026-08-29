import { toast } from "sonner";
import { Mail, MessagesSquare, Crown } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useContentGetter, useContentText } from "@/hooks/use-content.ts";
import {
  BOOK_CONSULTING_SALE_DEFAULTS,
  BOOK_CONSULTING_TIERS,
  BOOK_CONSULTING_CTA,
} from "../_lib/book-data.ts";
import { PriceTag } from "./price-tag.tsx";

/**
 * The same three consulting tiers as BookConsulting (mid-page), repeated
 * here at sale price as the final push at the very bottom of the page,
 * alongside the book's own sale-priced final CTA. Always shows the sale
 * price — unlike the book's single sale-price toggle, there's no on/off
 * switch here; the per-tier salePrice values in BOOK_CONSULTING_TIERS are
 * what's displayed.
 */
function handleConsultingClick(tierTitle: string) {
  toast.info(`${tierTitle} checkout is coming soon — thanks for your patience.`);
}

// Keep in sync with the same map in book-consulting.tsx — see the comment
// there.
const TIER_ICONS: Record<string, typeof Mail> = {
  two: Mail,
  five: MessagesSquare,
  ten: Crown,
};

const HIGHLIGHTED_TIER = "five";

export default function BookConsultingSale() {
  const get = useContentGetter();
  const eyebrow = useContentText(
    "book.consultingSale.eyebrow",
    BOOK_CONSULTING_SALE_DEFAULTS.eyebrow,
  );
  const title = useContentText(
    "book.consultingSale.title",
    BOOK_CONSULTING_SALE_DEFAULTS.title,
  );
  const subtitle = useContentText(
    "book.consultingSale.subtitle",
    BOOK_CONSULTING_SALE_DEFAULTS.subtitle,
  );
  const ctaLabel = useContentText("book.consulting.cta", BOOK_CONSULTING_CTA);

  return (
    <Section className="bg-secondary/40">
      {/* Same fix as book-consulting.tsx: gold reads as barely-visible on
          this section's bg-secondary/40 backdrop. */}
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={subtitle}
        eyebrowClassName="text-foreground"
      />
      <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
        {BOOK_CONSULTING_TIERS.map((tier) => {
          const Icon = TIER_ICONS[tier.key];
          const highlighted = tier.key === HIGHLIGHTED_TIER;
          return (
            // Matches the champagne-gold card treatment used for the
            // regular-price consulting grid mid-page (see
            // book-consulting.tsx) so the two line up as an intentional
            // pair rather than one looking unfinished next to the other —
            // including the same icon badge and "Most Popular" highlight.
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
                {get(`book.consulting.${tier.key}.title`, tier.title)}
              </h3>
              <div className="mt-2">
                <PriceTag
                  regularPrice={get(
                    `book.consulting.${tier.key}.price`,
                    tier.price,
                  )}
                  salePrice={get(
                    `book.consulting.${tier.key}.salePrice`,
                    tier.salePrice,
                  )}
                  onSale
                  onCard
                  size="md"
                />
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {get(`book.consulting.${tier.key}.body`, tier.body)}
              </p>
              <Button
                className="mt-6 cursor-pointer"
                onClick={() =>
                  handleConsultingClick(
                    get(`book.consulting.${tier.key}.title`, tier.title),
                  )
                }
              >
                {ctaLabel}
              </Button>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
