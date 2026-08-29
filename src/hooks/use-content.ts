import { createContext, useContext } from "react";
import { useLanguage } from "@/lib/language.tsx";
import { ZH_TRANSLATIONS } from "@/lib/zh-translations.ts";

export type MediaValue = { url: string; type: string };

type ContentContextValue = {
  content: Record<string, string> | undefined;
  media: Record<string, MediaValue> | undefined;
};

export const ContentContext = createContext<ContentContextValue>({
  content: undefined,
  media: undefined,
});

/**
 * Admin-only kill switch for the entire Chinese site, stored as a plain
 * content row (no schema change needed) — "true"/unset = enabled, "false" =
 * hidden. Lives here (not in a page schema) since it's a single global flag,
 * not per-page content.
 */
export const ZH_ENABLED_KEY = "site.zhEnabled";

/**
 * Whether the Chinese version of the site is currently turned on. Defaults
 * to enabled when the flag has never been set, since the bilingual feature
 * ships live by default. Toggled from /admin (see ZhSiteToggle).
 */
export function useZhEnabled(): boolean {
  const { content } = useContext(ContentContext);
  return content?.[ZH_ENABLED_KEY] !== "false";
}

/**
 * The language every page should actually render in right now: the
 * visitor's chosen language, unless the Chinese site has been hidden by the
 * admin — in which case everyone sees English, even a visitor whose
 * localStorage still remembers a "zh" choice from before it was hidden.
 * This is the single place that combines "what the visitor wants" with
 * "what the admin currently allows"; every language-aware hook below (and
 * useUiText / the inquire form) should read language through this rather
 * than calling useLanguage() directly, so hiding 中文 never leaves some
 * parts of the page in Chinese and others in English.
 */
export function useEffectiveLang(): "en" | "zh" {
  const { lang } = useLanguage();
  const zhEnabled = useZhEnabled();
  return zhEnabled ? lang : "en";
}

/**
 * Every piece of CMS-driven text/media is stored under its original
 * (English) key, e.g. "home.hero.title". The Chinese version of the same
 * field lives under the same key with a ".zh" suffix, e.g.
 * "home.hero.title.zh" — a completely independent CMS row, editable from
 * /admin under the "中文" tab without touching the English one.
 *
 * When the visitor is viewing the Chinese site and no admin override exists
 * yet for a ".zh" key, we fall back to the draft translation in
 * ZH_TRANSLATIONS rather than silently showing the English fallback — so
 * switching to 中文 never shows stray English text.
 */
function resolveKey(key: string, lang: "en" | "zh"): string {
  return lang === "zh" ? `${key}.zh` : key;
}

function resolveTextFallback(key: string, fallback: string, lang: "en" | "zh"): string {
  if (lang === "en") return fallback;
  return ZH_TRANSLATIONS[key] ?? fallback;
}

/**
 * Returns editable text for a given key, falling back to the provided default
 * until an admin overrides it in the backend. Automatically resolves to the
 * current site language (see resolveKey/resolveTextFallback above).
 */
export function useContentText(key: string, fallback: string): string {
  const { content } = useContext(ContentContext);
  const lang = useEffectiveLang();
  const effectiveKey = resolveKey(key, lang);
  const value = content?.[effectiveKey];
  return value !== undefined && value !== ""
    ? value
    : resolveTextFallback(key, fallback, lang);
}

/**
 * Returns editable media for a given key, falling back to the provided default
 * until an admin overrides it in the backend. Automatically resolves to the
 * current site language.
 *
 * If no Chinese-specific image has been uploaded yet (no ".zh" row), this
 * falls back to whatever is CURRENTLY live on the English side — i.e. the
 * admin's actual uploaded photo, not the original hardcoded placeholder —
 * so switching to 中文 shows the same real photos until the admin uploads
 * Chinese-specific ones. Only if neither exists does it fall back to the
 * hardcoded code default.
 */
export function useMediaValue(
  key: string,
  fallback: MediaValue,
): MediaValue {
  const { media } = useContext(ContentContext);
  const lang = useEffectiveLang();
  if (lang === "zh") {
    return media?.[resolveKey(key, "zh")] ?? media?.[key] ?? fallback;
  }
  return media?.[key] ?? fallback;
}

/**
 * Returns a stable getter for looking up editable text by key with a fallback.
 * Use this when you need to resolve many keys (e.g. inside a list), since hooks
 * cannot be called inside loops or callbacks.
 */
export function useContentGetter(): (key: string, fallback: string) => string {
  const { content } = useContext(ContentContext);
  const lang = useEffectiveLang();
  return (key: string, fallback: string) => {
    const effectiveKey = resolveKey(key, lang);
    const value = content?.[effectiveKey];
    return value !== undefined && value !== ""
      ? value
      : resolveTextFallback(key, fallback, lang);
  };
}
