import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ACCENT_BORDER, ACCENT_SOLID, type AccentTone } from "./accent";

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
    <div
      className={`flex-1 rounded-xl border-2 border-t-8 bg-white p-5 shadow-md ${ACCENT_BORDER[tone]}`}
    >
      <h3 className="flex items-center gap-3 text-xl font-extrabold">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm ${ACCENT_SOLID[tone]}`}
          aria-hidden="true"
        >
          <Icon className="h-6 w-6" />
        </span>
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
