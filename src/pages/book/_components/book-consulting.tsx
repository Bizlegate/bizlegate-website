import { toast } from "sonner";
import { Section, SectionHeading } from "@/components/layout/section.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useContentGetter, useContentText } from "@/hooks/use-content.ts";
import {
  BOOK_CONSULTING_DEFAULTS,
  BOOK_CONSULTING_TIERS,
  BOOK_CONSULTING_CTA,
} from "../_lib/book-data.ts";

/**
 * The second product on this page — email-based 1:1 guidance, sold
 * alongside the book itself, shown here at regular price. The same three
 * tiers repeat at the bottom of the page at sale price — see
 * book-consulting-sale.tsx. No checkout wired up yet, same placeholder
 * pattern as the book's buy buttons (see book-hero.tsx).
 */
function handleConsultingClick(tierTitle: string) {
  toast.info(`${tierTitle} checkout is coming soon — thanks for your patience.`);
}

export default function BookConsulting() {
  const get = useContentGetter();
  const eyebrow = useContentText(
    "book.consulting.eyebrow",
    BOOK_CONSULTING_DEFAULTS.eyebrow,
  );
  const title = useContentText(
    "book.consulting.title",
    BOOK_CONSULTING_DEFAULTS.title,
  );
  const subtitle = useContentText(
    "book.consulting.subtitle",
    BOOK_CONSULTING_DEFAULTS.subtitle,
  );
  const note = useContentText(
    "book.consulting.note",
    BOOK_CONSULTING_DEFAULTS.note,
  );
  const ctaLabel = useContentText(
    "book.consulting.cta",
    BOOK_CONSULTING_CTA,
  );

  return (
    <Section className="bg-secondary/40">
      <SectionHeading eyebrow={eyebrow} title={title} description={subtitle} />
      <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
        {BOOK_CONSULTING_TIERS.map((tier) => (
          // Warm champagne-gold card (the site's --accent token) rather
          // than plain white, so this pricing grid reads as branded rather
          // than a generic form on the muted section background.
          <div
            key={tier.key}
            className="flex flex-col rounded-xl border border-border bg-accent p-7"
          >
            <h3 className="font-serif text-lg font-semibold text-accent-foreground">
              {get(`book.consulting.${tier.key}.title`, tier.title)}
            </h3>
            <p className="mt-2 font-serif text-3xl font-bold text-primary">
              {get(`book.consulting.${tier.key}.price`, tier.price)}
            </p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {get(`book.consulting.${tier.key}.body`, tier.body)}
            </p>
            <Button
              variant="outline"
              className="mt-6 cursor-pointer"
              onClick={() =>
                handleConsultingClick(get(`book.consulting.${tier.key}.title`, tier.title))
              }
            >
              {ctaLabel}
            </Button>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">{note}</p>
    </Section>
  );
}
