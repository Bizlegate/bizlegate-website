import { useContext, useEffect } from "react";
import { Section, SectionHeading } from "@/components/layout/section.tsx";
import { ContentContext, useContentText } from "@/hooks/use-content.ts";
import ShopSections from "./_components/shop-sections.tsx";
import ShopComingSoon from "./_components/shop-coming-soon.tsx";
import { SHOP_HERO_DEFAULTS } from "./_lib/shop-data.ts";
import { SHOP_ENABLED_KEY } from "@/pages/admin/_components/shop-site-toggle.tsx";

/**
 * The Office Original merch storefront — a separate page from /book (see
 * App.tsx). The two used to be linked (/book-consult briefly redirected
 * here during the 2026-10-09 /shop pivot) but /book-consult now redirects
 * to /book instead (renamed back 2026-10-26), so /shop stands alone.
 *
 * Gated behind the site.shopEnabled admin flag (default OFF as of the
 * 2026-10-10 Bizlegate/Office Original separation decision — see
 * claude/22_shop_office_original_separation_strategy.md and
 * ShopSiteToggle) so the storefront stays hidden behind a "coming soon"
 * placeholder by default, without deleting any of the built page.
 */
export default function Shop() {
  const { content } = useContext(ContentContext);
  const enabled = content?.[SHOP_ENABLED_KEY] === "true";

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

  if (!enabled) {
    return <ShopComingSoon />;
  }

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
