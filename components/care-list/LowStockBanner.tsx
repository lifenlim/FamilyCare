"use client";

import { AlertTriangle } from "lucide-react";
import { daysOfSupply, isRunningLow, type Medication } from "@/lib/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function LowStockBanner({ medications }: { medications: Medication[] }) {
  const { dictionary } = useLocale();
  const lowMeds = medications.filter(isRunningLow);
  if (lowMeds.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border-2 border-danger-dark bg-danger px-5 py-4">
      {lowMeds.map((med) => {
        const days = daysOfSupply(med);
        return (
          <div key={med.id} className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 h-6 w-6 shrink-0 text-white"
              aria-hidden="true"
            />
            <div>
              <p className="text-lg font-semibold text-white">
                {dictionary.forYou.lowStockTitle(med.name)}
              </p>
              {days !== null && (
                <p className="text-sm text-white/85">
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
