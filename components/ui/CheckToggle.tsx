import { Check } from "lucide-react";
import type { ReactNode } from "react";

export function CheckToggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-2 text-lg font-medium hover:bg-surface">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-focus-ring peer-focus-visible:ring-offset-2 ${
          checked ? "border-success bg-success" : "border-border bg-white"
        }`}
        aria-hidden="true"
      >
        {checked && <Check className="h-5 w-5 text-white" />}
      </span>
      <span className={checked ? "text-success line-through decoration-2" : undefined}>
        {children}
      </span>
    </label>
  );
}
