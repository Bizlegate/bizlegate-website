import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { useContentText, useMediaValue } from "@/hooks/use-content.ts";
import {
  BOOK_HERO_DEFAULTS,
  BOOK_COVER_KEY,
  BOOK_COVER_DEFAULT,
} from "../_lib/book-data.ts";
import Book3dCover from "./book-3d-cover.tsx";
import { markBuyClicked } from "../_lib/use-exit-intent.ts";
import { useBookPrice } from "../_lib/use-book-price.ts";
import { PriceTag } from "./price-tag.tsx";

/**
 * The buy button doesn't have a real checkout wired up yet (payment
 * platform still being decided — see revenue plan). It looks and behaves
 * like a real button so the page can be reviewed as-is; clicking it shows a
 * toast instead of a dead link until checkout is connected.
 */
function handleBuyClick() {
  markBuyClicked();
  toast.info("Checkout is coming soon — thanks for your patience.");
}

export default function BookHero() {
  const eyebrow = useContentText("book.hero.eyebrow", BOOK_HERO_DEFAULTS.eyebrow);
  const title = useContentText("book.hero.title", BOOK_HERO_DEFAULTS.title);
  const subtitle = useContentText(
    "book.hero.subtitle",
    BOOK_HERO_DEFAULTS.subtitle,
  );
  const { regularPrice, salePrice, onSale } = useBookPrice();
  const priceNote = useContentText(
    "book.hero.priceNote",
    BOOK_HERO_DEFAULTS.priceNote,
  );
  const buyLabel = useContentText(
    "book.hero.buyLabel",
    BOOK_HERO_DEFAULTS.buyLabel,
  );
  const cover = useMediaValue(BOOK_COVER_KEY, BOOK_COVER_DEFAULT);

  return (
    <section className="relative overflow-hidden bg-[#0A1B2A]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 20%, #C5A059 0, transparent 42%), radial-gradient(circle at 88% 10%, #C5A059 0, transparent 38%)",
        }}
      />
      <div className="relative mx-auto grid max-w-5xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 md:grid-cols-[1.1fr_0.9fr] md:gap-8 md:text-left">
        <div className="order-2 text-center md:order-1 md:text-left">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            {eyebrow}
          </p>
          <h1 className="font-serif text-4xl font-bold leading-[1.1] tracking-tight text-white text-balance sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70 md:mx-0">
            {subtitle}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 md:items-start">
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
            <p className="text-xs text-white/50">{priceNote}</p>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <Book3dCover src={cover.url} alt={`${title} — book cover`} />
        </div>
      </div>
    </section>
  );
}
