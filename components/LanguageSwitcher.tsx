"use client";

import { Languages } from "lucide-react";
import { LOCALES, LOCALE_LABEL, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function LanguageSwitcher() {
  const { locale, setLocale, dictionary } = useLocale();

  return (
    <label className="flex shrink-0 items-center gap-1">
      <span className="sr-only">{dictionary.nav.language}</span>
      <Languages
        className="h-4 w-4 shrink-0 text-muted"
        aria-hidden="true"
      />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={dictionary.nav.language}
        className="min-h-0 rounded-md border-2 border-border bg-white py-1 pl-1 pr-5 text-sm font-medium focus-visible:border-primary sm:text-base"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_LABEL[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
