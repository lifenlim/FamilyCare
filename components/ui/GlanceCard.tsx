import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ACCENT_SOLID, type AccentTone } from "./accent";

export function GlanceCard({
  icon: Icon,
  title,
  tone = "primary",
  children,
}: {
  icon: LucideIcon;
  title: string;
  tone?: AccentTone;
  children: ReactNode;
}) {
  return (
    <div className="flex-1 rounded-xl border-2 border-border bg-white p-4 sm:p-5">
      <h3 className="flex items-center gap-2 text-base font-extrabold sm:gap-3 sm:text-xl">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${ACCENT_SOLID[tone]}`}
          aria-hidden="true"
        >
          <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
        </span>
        {title}
      </h3>
      <div className="mt-3 sm:mt-4">{children}</div>
    </div>
  );
}
