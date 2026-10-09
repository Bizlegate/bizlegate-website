import { BookOpen, Monitor, Package, Cat, Gem } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useContentGetter, useContentText } from "@/hooks/use-content.ts";
import { SHOP_ITEMS, SHOP_CTA } from "../_lib/shop-data.ts";
import { useBookPrice } from "@/pages/book/_lib/use-book-price.ts";
import { CARD_GOLD } from "@/pages/book/_components/price-tag.tsx";
import PurchaseDialog from "@/pages/book/_components/purchase-dialog.tsx";

/**
 * The /shop product grid — one flat, equal-treatment row of cards (see
 * claude/00_project_status.md, 2026-10-09). Deliberately reuses the house
 * style settled on for the book's old three-tier grid (book-tiers.tsx):
 * identical card treatment for every item, no "Most Popular" badge, one
 * plain price typography shared by all — see ShopPrice below.
 */
const ICON_FOR_KEY: Record<string, typeof BookOpen> = {
  book: BookOpen,
  wallpaper: Monitor,
  printBook: Package,
  tigerFigurine: Cat,
  tailRing: Gem,
};

export default function ShopGrid() {
  const get = useContentGetter();
  const ctaLabel = useContentText("shop.cta", SHOP_CTA);
  const { regularPrice, salePrice, onSale } = useBookPrice();

  return (
    <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {SHOP_ITEMS.map((item) => {
        const Icon = ICON_FOR_KEY[item.key] ?? Package;
        const itemTitle = get(`shop.${item.key}.title`, item.title);
        const itemBody = get(`shop.${item.key}.body`, item.body);
        return (
          <div
            key={item.key}
            className="flex flex-col rounded-xl border border-border bg-accent p-7"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              <Icon className="size-5" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-accent-foreground">
              {itemTitle}
            </h3>
            <div className="mt-2">
              {item.product === "book-full" ? (
                <ShopPrice
                  price={salePrice}
                  wasPrice={onSale ? regularPrice : undefined}
                />
              ) : (
                <ShopPrice price={get(item.priceKey!, item.priceDefault!)} />
              )}
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {itemBody}
            </p>
            <PurchaseDialog product={item.product} productLabel={itemTitle}>
              <Button className="mt-6 cursor-pointer">{ctaLabel}</Button>
            </PurchaseDialog>
          </div>
        );
      })}
    </div>
  );
}

// Same plain, uniform-height-numeral price display used on the book's old
// three-tier grid (see TierPrice in book-tiers.tsx) — kept as its own copy
// here rather than exported/shared, since the two pages are independent and
// this is a handful of lines.
function ShopPrice({ price, wasPrice }: { price: string; wasPrice?: string }) {
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
