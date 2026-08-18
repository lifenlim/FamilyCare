"use client";

import { AlertTriangle } from "lucide-react";
import { daysOfSupply, isRunningLow, type Medication } from "@/lib/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function LowStockBanner({ medications }: { medications: Medication[] }) {
  const { dictionary } = useLocale();
  const lowMeds = medications.filter(isRunningLow);
  if (lowMeds.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-xl border-2 border-danger bg-danger/10 px-4 py-3">
      {lowMeds.map((med) => {
        const days = daysOfSupply(med);
        return (
          <div key={med.id} className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-danger-dark"
              aria-hidden="true"
            />
            <div>
              <p className="text-base font-semibold text-danger-dark">
                {dictionary.forYou.lowStockTitle(med.name)}
              </p>
              {days !== null && (
                <p className="text-sm text-danger-dark/80">
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
