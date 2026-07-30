import { AlertTriangle } from "lucide-react";
import { isRunningLow, type Medication } from "@/lib/types";

export function LowStockBanner({ medications }: { medications: Medication[] }) {
  const lowMeds = medications.filter(isRunningLow);
  if (lowMeds.length === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border-2 border-danger-dark bg-danger px-5 py-4">
      <AlertTriangle
        className="mt-0.5 h-6 w-6 shrink-0 text-white"
        aria-hidden="true"
      />
      <p className="text-lg font-semibold text-white">
        {lowMeds.length} medication{lowMeds.length === 1 ? " is" : "s are"}{" "}
        running low — {lowMeds.map((m) => m.name).join(", ")}. Time to top up!
      </p>
    </div>
  );
}
