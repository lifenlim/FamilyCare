"use client";

import { AlertTriangle } from "lucide-react";
import { ACCENT_SOLID } from "@/components/ui/accent";
import { daysOfSupply, isRunningLow, type Medication } from "@/lib/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function LowStockBanner({ medications }: { medications: Medication[] }) {
  const { dictionary } = useLocale();
  const lowMeds = medications.filter(isRunningLow);
  if (lowMeds.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border-2 border-danger bg-danger/10 px-4 py-3">
      {lowMeds.map((med) => {
        const days = daysOfSupply(med);
        return (
          <div key={med.id} className="flex items-center gap-2 sm:gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${ACCENT_SOLID.danger}`}
              aria-hidden="true"
            >
              <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6" />
            </span>
            <div>
              <p className="text-base font-extrabold text-foreground sm:text-xl">
                {dictionary.forYou.lowStockTitle(med.name)}
              </p>
              {days !== null && (
                <p className="text-sm text-foreground/80">
                  {dictionary.forYou.lowStockDetail(Math.floor(days))}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
