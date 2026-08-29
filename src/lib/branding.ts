import { type MediaValue } from "@/hooks/use-content.ts";

/**
 * Stable CMS key + default value for the site logo. Shared by the navbar,
 * footer, and the admin content editor so an admin can swap the logo from the
 * Site Manager without touching code.
 */
export const LOGO_KEY = "site.logo";

export const LOGO_DEFAULT: MediaValue = {
  // Self-hosted fallback (see public/logo.png), replacing the old
  // Hercules-hosted URL. In practice the `media` table already has a
  // `site.logo` row that overrides this default, so this value is only ever
  // used if that row is ever deleted — but it must not depend on Hercules.
  url: "/logo.png",
  type: "image",
};
