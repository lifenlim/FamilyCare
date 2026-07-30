import type { LucideIcon } from "lucide-react";
import { ACCENT_SOLID, type AccentTone } from "./accent";

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
  return (
    <div className="flex items-start gap-3 rounded-xl border-2 border-border bg-surface p-4">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ACCENT_SOLID[tone]}`}
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-base font-semibold tracking-wide text-muted uppercase">
          {label}
        </p>
        <p className="mt-0.5 text-lg font-medium">{value || "Not set"}</p>
      </div>
    </div>
  );
}
