import { Button } from "@/components/ui/button.tsx";
import { useContentText } from "@/hooks/use-content.ts";
import { BOOK_CTA_DEFAULTS, BOOK_HERO_DEFAULTS } from "../_lib/book-data.ts";
import { markBuyClicked } from "../_lib/use-exit-intent.ts";
import { useBookPrice } from "../_lib/use-book-price.ts";
import { PriceTag } from "./price-tag.tsx";
import PurchaseDialog from "./purchase-dialog.tsx";

/**
 * The book's final CTA — carries the same $42.39 price as the hero (see
 * book-hero.tsx) as a last reinforcement at the bottom of the page. Swap
 * BOOK_SALE_PRICE_KEY in book-data.ts to a deeper holiday-sale price during
 * a major promotion and both this section and the hero pick it up
 * automatically. The button opens the same purchase flow as the hero and
 * the book-tiers grid's middle card — previously this only showed a
 * "coming soon" toast, a leftover from before the manual-transfer flow
 * shipped; fixed here to actually let someone buy.
 */
export default function BookFinalCta() {
  const title = useContentText("book.cta.title", BOOK_CTA_DEFAULTS.title);
  const body = useContentText("book.cta.body", BOOK_CTA_DEFAULTS.body);
  const { regularPrice, salePrice, onSale } = useBookPrice();
  const buyLabel = useContentText(
    "book.hero.buyLabel",
    BOOK_HERO_DEFAULTS.buyLabel,
  );

  return (
    <section className="bg-[#0A1B2A]">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-24">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/70">
          {body}
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <PriceTag
            regularPrice={regularPrice}
            salePrice={salePrice}
            onSale={onSale}
            size="xl"
            dark
          />
          <PurchaseDialog product="book-full" productLabel={title}>
            <Button size="lg" className="cursor-pointer" onClick={markBuyClicked}>
              {buyLabel}
            </Button>
          </PurchaseDialog>
        </div>
      </div>
    </section>
  );
}
