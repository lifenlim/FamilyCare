"use client";

import type { LucideIcon } from "lucide-react";
import { ACCENT_SOLID, type AccentTone } from "./accent";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function InfoTile({
  icon: Icon,
  label,
  value,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: AccentTone;
}) {
  const { dictionary } = useLocale();

  return (
    <div className="flex items-start gap-3 rounded-xl border-2 border-border bg-surface p-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${ACCENT_SOLID[tone]}`}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-semibold tracking-wide text-muted uppercase">
          {label}
        </p>
        <p className="mt-0.5 text-lg font-medium">
          {value || dictionary.common.notSet}
        </p>
      </div>
    </div>
  );
}
