import { useEffectiveLang } from "@/hooks/use-content.ts";

/**
 * Chrome-level UI text that is NOT part of the CMS content system (nav
 * labels, buttons that live outside any content-schema field, form
 * validation messages, the 404 page). These are small, stable strings that
 * don't need to be admin-editable, so they're translated directly in code
 * rather than round-tripping through Convex.
 *
 * CMS-backed copy (hero titles, service descriptions, form field labels,
 * etc.) is NOT here — that's translated via src/lib/zh-translations.ts and
 * is fully editable per-language from /admin.
 */
export const UI_STRINGS = {
  nav: {
    home: { en: "Home", zh: "首頁" },
    services: { en: "Services", zh: "服務項目" },
    process: { en: "Process", zh: "合作流程" },
    inquire: { en: "Inquire", zh: "立即諮詢" },
    requestAccess: { en: "Request Access", zh: "立即諮詢" },
    siteManager: { en: "Site Manager", zh: "後台管理" },
    openMenu: { en: "Open menu", zh: "開啟選單" },
    closeMenu: { en: "Close menu", zh: "關閉選單" },
    langToggle: { en: "中文", zh: "EN" },
  },
  home: {
    exploreServices: { en: "Explore Services", zh: "探索服務項目" },
    seeHowWeServeYou: { en: "See how we serve you", zh: "看看我們如何為您服務" },
  },
  process: {
    beginYourInquiry: { en: "Begin Your Inquiry", zh: "開始諮詢" },
  },
  footer: {
    navigate: { en: "Navigate", zh: "網站導覽" },
    description: {
      en: "Premier US–Taiwan business travel architecture. Direct access, lean execution, and effortless comfort for elite executives crossing the US–Taiwan and Southeast Asia corridor.",
      zh: "頂尖的美台商務出訪規劃服務。為往來美國、台灣與東南亞的企業高層,提供直接的人脈引薦、精簡高效的執行,以及無需操心的舒適體驗。",
    },
    rights: { en: "All rights reserved.", zh: "版權所有,翻印必究。" },
    locations: {
      en: "Taipei · Kuala Lumpur · United States",
      zh: "台北 · 吉隆坡 · 美國",
    },
  },
  form: {
    submitting: { en: "Submitting...", zh: "送出中..." },
    nameRequired: { en: "Please enter your name.", zh: "請輸入您的姓名。" },
    organizationRequired: {
      en: "Please enter your organization.",
      zh: "請輸入您的公司/機構名稱。",
    },
    titleRequired: { en: "Please enter your title.", zh: "請輸入您的職稱。" },
    emailInvalid: {
      en: "Please enter a valid email address.",
      zh: "請輸入有效的電子郵件地址。",
    },
    urlInvalid: { en: "Please enter a valid URL.", zh: "請輸入有效的網址。" },
    partySizeInvalid: {
      en: "Enter a number between 1 and 100.",
      zh: "請輸入 1 到 100 之間的數字。",
    },
    objectivesRequired: {
      en: "Please share your objectives.",
      zh: "請說明您的訪問目的。",
    },
    privacyRequired: {
      en: "Please confirm to continue.",
      zh: "請勾選確認以繼續。",
    },
    departureAfterArrival: {
      en: "Departure must be after arrival.",
      zh: "離開日期必須晚於抵達日期。",
    },
    genericError: {
      en: "Something went wrong. Please try again.",
      zh: "發生錯誤,請再試一次。",
    },
  },
  notFound: {
    title: { en: "Page Not Found", zh: "找不到頁面" },
    body: { en: "This page does not exist.", zh: "這個頁面不存在。" },
    returnHome: { en: "Return to Home", zh: "回到首頁" },
  },
} as const;

type StringPath = {
  [K in keyof typeof UI_STRINGS]: {
    [F in keyof (typeof UI_STRINGS)[K]]: (typeof UI_STRINGS)[K][F];
  };
};

/** Resolve a single { en, zh } pair for the current language. */
export function useUiText(
  group: keyof StringPath,
  key: string,
): string {
  const lang = useEffectiveLang();
  const entry = (UI_STRINGS as Record<string, Record<string, { en: string; zh: string }>>)[
    group as string
  ]?.[key];
  if (!entry) return "";
  return lang === "zh" ? entry.zh : entry.en;
}

/**
 * Non-hook variant for use outside components (e.g. building a zod schema
 * once per render with useMemo). Pass the language explicitly.
 */
export function uiText(
  group: keyof StringPath,
  key: string,
  lang: "en" | "zh",
): string {
  const entry = (UI_STRINGS as Record<string, Record<string, { en: string; zh: string }>>)[
    group as string
  ]?.[key];
  if (!entry) return "";
  return lang === "zh" ? entry.zh : entry.en;
}
