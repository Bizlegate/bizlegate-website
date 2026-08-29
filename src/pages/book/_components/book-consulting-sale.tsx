import { toast } from "sonner";
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
      <SectionHeading eyebrow={eyebrow} title={title} description={subtitle} />
      <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
        {BOOK_CONSULTING_TIERS.map((tier) => (
          <div
            key={tier.key}
            className="flex flex-col rounded-xl border border-border bg-card p-7"
          >
            <h3 className="font-serif text-lg font-semibold text-card-foreground">
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
        ))}
      </div>
    </Section>
  );
}
