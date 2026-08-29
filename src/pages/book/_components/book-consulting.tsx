import { toast } from "sonner";
import { Mail, MessagesSquare, Crown } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useContentGetter, useContentText } from "@/hooks/use-content.ts";
import {
  BOOK_CONSULTING_DEFAULTS,
  BOOK_CONSULTING_TIERS,
  BOOK_CONSULTING_CTA,
} from "../_lib/book-data.ts";
import { CARD_GOLD } from "./price-tag.tsx";

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

// One icon per tier, echoing the depth of engagement (a single exchange ->
// an extended back-and-forth -> ongoing support) — same "icon in a dark
// rounded badge" pattern used in book-value-stack.tsx, reused here so the
// two sections feel like one design system rather than two.
const TIER_ICONS: Record<string, typeof Mail> = {
  two: Mail,
  five: MessagesSquare,
  ten: Crown,
};

// Highlighting one recommended tier (typically the middle option) is one of
// the most consistently replicated patterns in pricing-page conversion
// research — it anchors the other two prices, and removes some of the
// decision friction of an unranked three-way choice. Five-Pack sits at the
// natural middle of this ladder.
const HIGHLIGHTED_TIER = "five";

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
        {BOOK_CONSULTING_TIERS.map((tier) => {
          const Icon = TIER_ICONS[tier.key];
          const highlighted = tier.key === HIGHLIGHTED_TIER;
          return (
            // Warm champagne-gold card (the site's --accent token) rather
            // than plain white, so this pricing grid reads as branded rather
            // than a generic form on the muted section background. The
            // highlighted tier gets a visible ring instead of the plain
            // border, so it reads as "the recommended pick" at a glance.
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
              {/* CARD_GOLD, not text-primary — see the comment on that
                  constant in price-tag.tsx: the standard gold's contrast
                  against this same-hue card background measures ~2:1. */}
              <p
                className="mt-2 font-serif text-3xl font-bold"
                style={{ color: CARD_GOLD }}
              >
                {get(`book.consulting.${tier.key}.price`, tier.price)}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {get(`book.consulting.${tier.key}.body`, tier.body)}
              </p>
              {/* Filled, not outline — an outline button's only visible
                  edge (a 1px border close in tone to this card's own
                  background) measured well under a 2:1 contrast ratio
                  against --accent, which is why it read as invisible. The
                  sale-priced repeat of this grid (book-consulting-sale.tsx)
                  already uses the filled default button on the same card
                  and reads fine — this just matches it. */}
              <Button
                className="mt-6 cursor-pointer"
                onClick={() =>
                  handleConsultingClick(get(`book.consulting.${tier.key}.title`, tier.title))
                }
              >
                {ctaLabel}
              </Button>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">{note}</p>
    </Section>
  );
}
