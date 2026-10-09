import { useEffect } from "react";
import { Section, SectionHeading } from "@/components/layout/section.tsx";
import { useContentText } from "@/hooks/use-content.ts";
import ShopSections from "./_components/shop-sections.tsx";
import { SHOP_HERO_DEFAULTS } from "./_lib/shop-data.ts";

/**
 * The Office Original merch storefront — replaces /book-consult as the
 * site's primary sales URL (see claude/00_project_status.md, 2026-10-09
 * pivot). /book-consult now redirects here (see App.tsx) rather than
 * rendering the old three-tier book funnel, so any link already pointing
 * at /book-consult (the printed book's back cover, rendered Office
 * Original video end-cards) still lands somewhere real.
 */
export default function Shop() {
  const eyebrow = useContentText(
    "shop.hero.eyebrow",
    SHOP_HERO_DEFAULTS.eyebrow,
  );
  const title = useContentText("shop.hero.title", SHOP_HERO_DEFAULTS.title);
  const subtitle = useContentText(
    "shop.hero.subtitle",
    SHOP_HERO_DEFAULTS.subtitle,
  );

  // Same light-theme lock /book-consult used — the champagne-gold
  // card/price styling here doesn't render correctly against the site's
  // default dark navy theme (see the ".book-page" rule in index.css).
  // Toggled on <html> rather than a wrapper div so it also reaches
  // dialogs, which Radix portals to document.body outside this
  // component's own DOM tree.
  useEffect(() => {
    document.documentElement.classList.add("book-page");
    return () => {
      document.documentElement.classList.remove("book-page");
    };
  }, []);

  return (
    <>
      <Section>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={subtitle}
        />
      </Section>
      <ShopSections />
    </>
  );
}
