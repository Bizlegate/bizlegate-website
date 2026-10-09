import { type LucideIcon, BookOpen, Monitor, Package, Cat, Gem, Gift, Boxes, CheckCircle2, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Section, SectionHeading } from "@/components/layout/section.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useContentGetter, useContentText } from "@/hooks/use-content.ts";
import {
  SHOP_ITEMS,
  SHOP_BUNDLES,
  SHOP_BUNDLES_HEADING,
  SHOP_CTA,
  type ShopItem,
  type ShopBundle,
} from "../_lib/shop-data.ts";
import { useBookPrice } from "@/pages/book/_lib/use-book-price.ts";
import { CARD_GOLD } from "@/pages/book/_components/price-tag.tsx";
import PurchaseDialog from "@/pages/book/_components/purchase-dialog.tsx";

/**
 * /shop's product sections — one full promotional block per item (image
 * panel, headline, body, highlights, price, buy button), not a small
 * grid card. Client reference: 嘖嘖/zeczec-style crowdfunding campaign
 * pages, where every reward tier gets its own real estate (see
 * claude/00_project_status.md, 2026-10-09 follow-up). Alternates the
 * image panel left/right per item for visual rhythm, same idiom as
 * book-value-stack.tsx.
 *
 * No real product photography exists yet — PhotoPlaceholder below is a
 * deliberately plain stand-in (icon + "Product photo coming soon") rather
 * than a generic stock photo, since showing an unrelated stock image next
 * to a real, priced, physical item would misrepresent what's being sold.
 * Swap it for a real photo (and wire up a media field in content-schema.ts
 * the same way book-data.ts does for BOOK_COVER_KEY) once photos exist.
 */
const ICON_FOR_ITEM_KEY: Record<string, LucideIcon> = {
  book: BookOpen,
  wallpaper: Monitor,
  printBook: Package,
  tigerFigurine: Cat,
  tailRing: Gem,
};

const ICON_FOR_BUNDLE_KEY: Record<string, LucideIcon> = {
  bundleStarter: Gift,
  bundleCollector: Boxes,
};

function PhotoPlaceholder({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-gradient-to-br from-accent to-secondary">
      <Icon className="size-16 text-primary/60" strokeWidth={1.5} />
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ImageOff className="size-3.5" />
        Product photo coming soon
      </span>
    </div>
  );
}

// Same plain, uniform-height-numeral price display used on the book's old
// three-tier grid (see TierPrice in book-tiers.tsx).
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

function Highlights({ items }: { items: string[] }) {
  return (
    <div className="mt-6 space-y-3">
      {items.map((text) => (
        <div key={text} className="flex items-start gap-3">
          <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
            <CheckCircle2 className="size-3.5" />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {text}
          </p>
        </div>
      ))}
    </div>
  );
}

function ProductSection({
  item,
  index,
  Icon,
  ctaLabel,
  price,
  wasPrice,
}: {
  item: ShopItem | ShopBundle;
  index: number;
  Icon: LucideIcon;
  ctaLabel: string;
  price: string;
  wasPrice?: string;
}) {
  const get = useContentGetter();
  const reversed = index % 2 === 1;
  const title = get(`shop.${item.key}.title`, item.title);
  const body = get(`shop.${item.key}.body`, item.body);
  const tagline = get(`shop.${item.key}.tagline`, item.tagline);

  return (
    <Section className={reversed ? "bg-secondary/40" : "bg-background"}>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div
          className={cn(
            "mx-auto w-full max-w-md",
            reversed && "lg:order-2",
          )}
        >
          <PhotoPlaceholder icon={Icon} />
        </div>
        <div className={reversed ? "lg:order-1" : undefined}>
          <p
            className={cn(
              "mb-3 text-xs font-semibold uppercase tracking-[0.3em]",
              reversed ? "text-foreground" : "text-primary",
            )}
          >
            {tagline}
          </p>
          <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h3>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {body}
          </p>
          {"whatIncludedKey" in item && (
            <p className="mt-4 rounded-lg border border-dashed border-border bg-accent/40 p-3 text-sm text-accent-foreground">
              {get(item.whatIncludedKey, item.whatIncludedDefault)}
            </p>
          )}
          <Highlights items={item.highlights} />
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <ShopPrice price={price} wasPrice={wasPrice} />
            <PurchaseDialog product={item.product} productLabel={title}>
              <Button size="lg" className="cursor-pointer">
                {ctaLabel}
              </Button>
            </PurchaseDialog>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default function ShopSections() {
  const get = useContentGetter();
  const ctaLabel = useContentText("shop.cta", SHOP_CTA);
  const { regularPrice, salePrice, onSale } = useBookPrice();
  const bundlesEyebrow = useContentText(
    "shop.bundles.eyebrow",
    SHOP_BUNDLES_HEADING.eyebrow,
  );
  const bundlesTitle = useContentText(
    "shop.bundles.title",
    SHOP_BUNDLES_HEADING.title,
  );
  const bundlesSubtitle = useContentText(
    "shop.bundles.subtitle",
    SHOP_BUNDLES_HEADING.subtitle,
  );

  return (
    <>
      {SHOP_ITEMS.map((item, index) => (
        <ProductSection
          key={item.key}
          item={item}
          index={index}
          Icon={ICON_FOR_ITEM_KEY[item.key] ?? Package}
          ctaLabel={ctaLabel}
          price={
            item.product === "book-full"
              ? salePrice
              : get(item.priceKey!, item.priceDefault!)
          }
          wasPrice={
            item.product === "book-full" && onSale ? regularPrice : undefined
          }
        />
      ))}

      <Section className={SHOP_ITEMS.length % 2 === 1 ? "bg-secondary/40" : "bg-background"}>
        <SectionHeading
          eyebrow={bundlesEyebrow}
          title={bundlesTitle}
          description={bundlesSubtitle}
          eyebrowClassName={
            SHOP_ITEMS.length % 2 === 1 ? "text-foreground" : undefined
          }
        />
      </Section>

      {SHOP_BUNDLES.map((bundle, index) => (
        <ProductSection
          key={bundle.key}
          item={bundle}
          index={SHOP_ITEMS.length + 1 + index}
          Icon={ICON_FOR_BUNDLE_KEY[bundle.key] ?? Gift}
          ctaLabel={ctaLabel}
          price={get(bundle.priceKey, bundle.priceDefault)}
        />
      ))}
    </>
  );
}
