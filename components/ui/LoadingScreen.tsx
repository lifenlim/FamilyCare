"use client";

import { BRAND_ICON_VERSION } from "@/lib/brand";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function LoadingScreen() {
  const { dictionary } = useLocale();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      {/* eslint-disable-next-line @next/next/no-img-element -- small brand mark, skip the image optimizer's caching layer */}
      <img
        src={`/icons/logo.png?v=${BRAND_ICON_VERSION}`}
        alt="FamilyCare"
        width={64}
        height={64}
        className="h-16 w-16 animate-pulse rounded-xl border-2 border-primary/20"
      />
      <p className="text-lg font-semibold text-muted">{dictionary.loading.text}</p>
    </div>
  );
}
