/**
 * Static fallback copy for /shop — the Office Original merch storefront
 * (see claude/00_project_status.md, 2026-10-09 pivot, and the 2026-10-09
 * follow-up that replaced the flat product grid with one full promotional
 * section per item — client reference: 嘖嘖/zeczec-style campaign pages,
 * where every reward tier gets its own real estate instead of a small
 * card). Replaces the old /book-consult page as the site's primary sales
 * URL; /book-consult now redirects here (see App.tsx) so the printed
 * book's back cover and any already-rendered Office Original video
 * end-cards still land somewhere real. Every string here is a code-level
 * default — the admin can override any of them from /admin → Content →
 * Shop.
 *
 * The digital book is deliberately a single flat item here (reusing the
 * existing "book-full" product + its book.hero.price / salePrice pair from
 * book-data.ts) rather than the old three-tier sample/full/deluxe grid —
 * the client asked to simplify it down to one item once it's just one of
 * several things sold on this page. The old three-tier /book-consult sales
 * funnel (book/page.tsx and friends) is left on disk, unrouted, in case any
 * of its copy or components get reused later — see the "stub out, don't
 * delete" convention used for book-consulting.tsx.
 *
 * Buying more than one item: rather than a shopping cart (which would need
 * a real multi-item checkout, a new notice shape, and multi-item
 * fulfillment tracking), this follows the client's own suggestion — a
 * small number of pre-made BUNDLES (see SHOP_BUNDLES below), each its own
 * purchasable "product" with one combined price, bought through the exact
 * same single-item PurchaseDialog flow as everything else. No cart, no
 * per-line-item checkout — a bundle is just one more product.
 */

export const SHOP_HERO_DEFAULTS = {
  eyebrow: "Office Original",
  title: "Everything that gets you through the office.",
  subtitle:
    "Playbooks and keepsakes for the executive building their own win — pick what you need.",
};

// Every /shop product (including bundles) maps to one
// bookPurchaseNotices/bookPaymentLinks "product" literal on the Convex side
// (see convex/bookAccess.ts). Kept as the same literal set rather than a
// separate "shop product" type so the admin's existing Book Access panel
// (pending notices, payment links, mark-fulfilled) works for every item
// here without a parallel admin surface.
export type ShopProductKey =
  | "book-full"
  | "wallpaper"
  | "print-book"
  | "tiger-figurine"
  | "tail-ring"
  | "bundle-starter"
  | "bundle-collector";

// Placeholder prices (client-confirmed: ship with placeholders, she'll set
// the real ones herself from /admin → Content → Shop). "book-full" is the
// one exception — it reuses the book's existing real price pair instead of
// a placeholder, since that price is already live.
export const SHOP_WALLPAPER_PRICE_KEY = "shop.wallpaper.price";
export const SHOP_WALLPAPER_PRICE_DEFAULT = "$15";
export const SHOP_PRINT_BOOK_PRICE_KEY = "shop.printBook.price";
export const SHOP_PRINT_BOOK_PRICE_DEFAULT = "$50";
export const SHOP_TIGER_FIGURINE_PRICE_KEY = "shop.tigerFigurine.price";
export const SHOP_TIGER_FIGURINE_PRICE_DEFAULT = "$30";
export const SHOP_TAIL_RING_PRICE_KEY = "shop.tailRing.price";
export const SHOP_TAIL_RING_PRICE_DEFAULT = "$25";
export const SHOP_BUNDLE_STARTER_PRICE_KEY = "shop.bundleStarter.price";
export const SHOP_BUNDLE_STARTER_PRICE_DEFAULT = "$0";
export const SHOP_BUNDLE_COLLECTOR_PRICE_KEY = "shop.bundleCollector.price";
export const SHOP_BUNDLE_COLLECTOR_PRICE_DEFAULT = "$0";

export type ShopItem = {
  key: string;
  product: ShopProductKey;
  // Small label above the title (e.g. "Digital", "Office Original",
  // "Bundle") — same role as SectionHeading's `eyebrow`.
  tagline: string;
  title: string;
  body: string;
  // 2-3 short "why this" lines, rendered as an icon-chip list (same idiom
  // as BOOK_VALUE_ITEMS in book-value-stack.tsx).
  highlights: string[];
  // Physical items collect a shipping address on the purchase form (see
  // purchase-dialog.tsx); digital items don't.
  physical: boolean;
  // Left undefined for "book-full", which prices itself separately via
  // useBookPrice() in shop-sections.tsx (reusing the regular/sale price
  // pair), same pattern as book-tiers.tsx used for the old middle tier.
  priceKey?: string;
  priceDefault?: string;
};

// One full promotional section per item (image panel + headline + body +
// highlights + price/CTA) — see shop-sections.tsx. No "Most Popular"
// badge, no item visually favored over another, same as the book's old
// three-tier grid.
export const SHOP_ITEMS: ShopItem[] = [
  {
    key: "book",
    product: "book-full",
    tagline: "Digital",
    title: "Be the Outsmarter",
    body: "The complete 30-chapter office politics playbook. Instant access at bizlegate.com/library — no download, no app, read it on your desk or your phone before your next meeting.",
    highlights: [
      "Instant access — no download, no app",
      "Read online at bizlegate.com/library on any device",
      "All 30 chapters, both the tactics and the discipline",
    ],
    physical: false,
  },
  {
    key: "wallpaper",
    product: "wallpaper",
    tagline: "Digital",
    title: "Custom Desktop Wallpaper",
    body: "A desktop wallpaper built around your own goal date and a one-line reminder written for your specific situation — a small, private nudge every time you open your laptop.",
    highlights: [
      "Built around your own goal-achievement date",
      "A one-line reminder written for your situation",
      "Delivered to you directly — no automated generator",
    ],
    physical: false,
    priceKey: SHOP_WALLPAPER_PRICE_KEY,
    priceDefault: SHOP_WALLPAPER_PRICE_DEFAULT,
  },
  {
    key: "printBook",
    product: "print-book",
    tagline: "Office Original",
    title: "Be the Outsmarter — Printed Copy",
    body: "A printed copy of the full book, shipped to your office or home — a desk reference you can flip through in the five minutes before a high-stakes meeting.",
    highlights: [
      "The complete 30-chapter printed edition",
      "A tangible reference for your desk or briefcase",
      "Ships to your office or home",
    ],
    physical: true,
    priceKey: SHOP_PRINT_BOOK_PRICE_KEY,
    priceDefault: SHOP_PRINT_BOOK_PRICE_DEFAULT,
  },
  {
    key: "tigerFigurine",
    product: "tiger-figurine",
    tagline: "Office Original",
    title: "虎爺擺飾 — Tiger General Figurine",
    body: "A desk companion for the executive who wants a little extra luck walking into the room — Office Original's own take on a classic desk keepsake.",
    highlights: [
      "A desk companion for good fortune",
      "Office Original's signature keepsake",
      "Ships to your office or home",
    ],
    physical: true,
    priceKey: SHOP_TIGER_FIGURINE_PRICE_KEY,
    priceDefault: SHOP_TIGER_FIGURINE_PRICE_DEFAULT,
  },
  {
    key: "tailRing",
    product: "tail-ring",
    tagline: "Office Original",
    title: "尾戒 — Tail Ring",
    body: "A quiet, personal reminder you can wear every day in the office — small enough that only you know what it means.",
    highlights: [
      "A quiet, personal daily reminder",
      "Wear it every day in the office",
      "Ships to your office or home",
    ],
    physical: true,
    priceKey: SHOP_TAIL_RING_PRICE_KEY,
    priceDefault: SHOP_TAIL_RING_PRICE_DEFAULT,
  },
];

// Pre-made combination packages — the client's own alternative to a
// shopping cart (buy several items together without building multi-item
// checkout). Each bundle is a single purchasable product with one combined
// price; "whatIncluded" is a plain CMS text field (not a structured list
// of item keys) so the client can decide and edit the exact contents
// herself from /admin → Content → Shop without needing another code
// change. Placeholder contents/prices below are deliberately labeled as
// placeholders — fill them in once the real bundles are decided.
export type ShopBundle = {
  key: string;
  product: ShopProductKey;
  tagline: string;
  title: string;
  body: string;
  // Plain-text description of what's inside — admin-editable, not a
  // structured reference to SHOP_ITEMS (see comment above).
  whatIncludedKey: string;
  whatIncludedDefault: string;
  highlights: string[];
  priceKey: string;
  priceDefault: string;
};

export const SHOP_BUNDLES: ShopBundle[] = [
  {
    key: "bundleStarter",
    product: "bundle-starter",
    tagline: "Bundle",
    title: "Starter Bundle",
    body: "A placeholder bundle — pick which items belong in it and edit this text from /admin → Content → Shop. Ships as one package, one shipping address, one checkout.",
    whatIncludedKey: "shop.bundleStarter.included",
    whatIncludedDefault: "Contents — set from /admin → Content → Shop.",
    highlights: [
      "One shipment, one checkout",
      "Priced together at a savings vs. buying separately",
    ],
    priceKey: SHOP_BUNDLE_STARTER_PRICE_KEY,
    priceDefault: SHOP_BUNDLE_STARTER_PRICE_DEFAULT,
  },
  {
    key: "bundleCollector",
    product: "bundle-collector",
    tagline: "Bundle",
    title: "Collector Bundle",
    body: "A placeholder bundle for the complete set — pick which items belong in it and edit this text from /admin → Content → Shop. Ships as one package, one shipping address, one checkout.",
    whatIncludedKey: "shop.bundleCollector.included",
    whatIncludedDefault: "Contents — set from /admin → Content → Shop.",
    highlights: [
      "The complete Office Original set",
      "One shipment, one checkout",
    ],
    priceKey: SHOP_BUNDLE_COLLECTOR_PRICE_KEY,
    priceDefault: SHOP_BUNDLE_COLLECTOR_PRICE_DEFAULT,
  },
];

export const SHOP_BUNDLES_HEADING = {
  eyebrow: "Buying More Than One?",
  title: "Bundle deals.",
  subtitle:
    "Pre-made combinations instead of a shopping cart — one price, one shipment, one checkout.",
};

export const SHOP_CTA = "Get it";
