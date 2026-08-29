import { useContentText } from "@/hooks/use-content.ts";
import {
  BOOK_HERO_DEFAULTS,
  BOOK_SALE_PRICE_KEY,
  BOOK_SALE_PRICE_DEFAULT,
} from "./book-data.ts";

/**
 * Reads both the regular price and the optional seasonal sale price and
 * works out which one is actually in effect. A sale is "on" purely by
 * having a non-empty sale price set in /admin — there's no separate on/off
 * switch to keep in sync, so it can't drift out of sync with itself.
 */
export function useBookPrice() {
  const regularPrice = useContentText(
    "book.hero.price",
    BOOK_HERO_DEFAULTS.price,
  );
  const salePrice = useContentText(
    BOOK_SALE_PRICE_KEY,
    BOOK_SALE_PRICE_DEFAULT,
  );
  const onSale = salePrice.trim() !== "";
  const displayPrice = onSale ? salePrice.trim() : regularPrice;

  return { regularPrice, salePrice: salePrice.trim(), onSale, displayPrice };
}
