import { ShoppingBag } from "lucide-react";

/**
 * Shown at /shop (and therefore also at /book-consult, which redirects
 * here) while site.shopEnabled is off. Mirrors the old book/
 * _components/book-coming-soon.tsx placeholder — see shop-site-toggle.tsx
 * for the admin switch that controls this (2026-10-09, repurposed from the
 * retired book-site-toggle.tsx now that /shop is the site's sales page).
 * Deliberately gives away nothing about the page underneath.
 */
export default function ShopComingSoon() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mb-6 inline-flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
        <ShoppingBag className="size-7" />
      </div>
      <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
        This page isn't live yet.
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Check back soon.
      </p>
    </div>
  );
}
