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
        className="h-3 w-3 shrink-0 text-accent-blue"
        aria-hidden="true"
      />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={dictionary.nav.language}
        className="min-h-0 rounded-md border border-accent-blue/40 bg-white py-0.5 pl-1 pr-4 text-xs font-medium text-accent-blue focus-visible:border-primary"
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
