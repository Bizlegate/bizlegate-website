import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { useContentText } from "@/hooks/use-content.ts";
import { BOOK_CTA_DEFAULTS, BOOK_HERO_DEFAULTS } from "../_lib/book-data.ts";
import { markBuyClicked } from "../_lib/use-exit-intent.ts";
import { useBookPrice } from "../_lib/use-book-price.ts";
import { PriceTag } from "./price-tag.tsx";

function handleBuyClick() {
  markBuyClicked();
  toast.info("Checkout is coming soon — thanks for your patience.");
}

/**
 * The book's final CTA — this is the slot that carries whatever sale price
 * is currently active (see BOOK_SALE_PRICE_KEY in book-data.ts). Swap that
 * one admin field to the deeper holiday-sale price during a major
 * promotion and this section picks it up automatically.
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
          <Button size="lg" className="cursor-pointer" onClick={handleBuyClick}>
            {buyLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
