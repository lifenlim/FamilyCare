export const LOCALES = ["en", "zh", "ms"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "familycare_locale";

export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  ms: "Bahasa Melayu",
};

// BCP 47 tags used for Intl.DateTimeFormat/toLocaleString calls.
export const LOCALE_TAG: Record<Locale, string> = {
  en: "en-US",
  zh: "zh-CN",
  ms: "ms-MY",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
