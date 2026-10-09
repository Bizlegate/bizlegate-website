/**
 * Static fallback copy for /shop — the Office Original merch storefront
 * (see claude/00_project_status.md, 2026-10-09 pivot). Replaces the old
 * /book-consult page as the site's primary sales URL; /book-consult now
 * redirects here (see App.tsx) so the printed book's back cover and any
 * already-rendered Office Original video end-cards still land somewhere
 * real. Every string here is a code-level default — the admin can override
 * any of them from /admin → Content → Shop.
 *
 * The digital book is deliberately a single flat item here (reusing the
 * existing "book-full" product + its book.hero.price / salePrice pair from
 * book-data.ts) rather than the old three-tier sample/full/deluxe grid —
 * the client asked to simplify it down to one item once it's just one of
 * several things sold on this page. The old three-tier /book-consult sales
 * funnel (book/page.tsx and friends) is left on disk, unrouted, in case any
 * of its copy or components get reused later — see the "stub out, don't
 * delete" convention used for book-consulting.tsx.
 */

export const SHOP_HERO_DEFAULTS = {
  eyebrow: "Office Original",
  title: "Everything that gets you through the office.",
  subtitle:
    "Playbooks and keepsakes for the executive building their own win — pick what you need.",
};

// Every /shop product maps to one bookPurchaseNotices/bookPaymentLinks
// "product" literal on the Convex side (see convex/bookAccess.ts). Kept as
// the same literal set rather than a separate "shop product" type so the
// admin's existing Book Access panel (pending notices, payment links) works
// for every item here without a parallel admin surface.
export type ShopProductKey =
  | "book-full"
  | "wallpaper"
  | "print-book"
  | "tiger-figurine"
  | "tail-ring";

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

export type ShopItem = {
  key: string;
  product: ShopProductKey;
  title: string;
  body: string;
  // Physical items collect a shipping address on the purchase form (see
  // purchase-dialog.tsx); digital items don't.
  physical: boolean;
  // Left undefined for "book-full", which prices itself separately via
  // useBookPrice() in shop-grid.tsx (reusing the regular/sale price pair),
  // same pattern as book-tiers.tsx used for the old middle tier.
  priceKey?: string;
  priceDefault?: string;
};

// Deliberately un-opinionated layout, same house style as the book's
// three-tier grid (see book-tiers.tsx) — no "Most Popular" badge, no raised
// card, every item compared purely on its own merits.
export const SHOP_ITEMS: ShopItem[] = [
  {
    key: "book",
    product: "book-full",
    title: "Be the Outsmarter (Digital)",
    body: "The complete 30-chapter office politics playbook. Instant access at bizlegate.com/library — no download, no app.",
    physical: false,
  },
  {
    key: "wallpaper",
    product: "wallpaper",
    title: "Custom Desktop Wallpaper",
    body: "A desktop wallpaper built around your own goal date and a one-line reminder written for your specific situation.",
    physical: false,
    priceKey: SHOP_WALLPAPER_PRICE_KEY,
    priceDefault: SHOP_WALLPAPER_PRICE_DEFAULT,
  },
  {
    key: "printBook",
    product: "print-book",
    title: "Be the Outsmarter — Printed Copy",
    body: "A printed copy of the full book, shipped to your office or home.",
    physical: true,
    priceKey: SHOP_PRINT_BOOK_PRICE_KEY,
    priceDefault: SHOP_PRINT_BOOK_PRICE_DEFAULT,
  },
  {
    key: "tigerFigurine",
    product: "tiger-figurine",
    title: "虎爺擺飾 — Tiger General Figurine",
    body: "A desk companion for the executive who wants a little extra luck walking into the room.",
    physical: true,
    priceKey: SHOP_TIGER_FIGURINE_PRICE_KEY,
    priceDefault: SHOP_TIGER_FIGURINE_PRICE_DEFAULT,
  },
  {
    key: "tailRing",
    product: "tail-ring",
    title: "尾戒 — Tail Ring",
    body: "A quiet, personal reminder you can wear every day in the office.",
    physical: true,
    priceKey: SHOP_TAIL_RING_PRICE_KEY,
    priceDefault: SHOP_TAIL_RING_PRICE_DEFAULT,
  },
];

export const SHOP_CTA = "Get it";
