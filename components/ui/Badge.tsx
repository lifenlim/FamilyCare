import { ReactNode } from "react";

type Tone = "neutral" | "warning" | "success" | "primary" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-surface text-foreground border-border",
  warning: "bg-warning-bg text-warning-text border-warning-border",
  success: "bg-white text-success border-success",
  primary: "bg-white text-primary border-primary",
  danger: "bg-danger text-white border-danger-dark",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-block rounded-full border-2 px-3 py-1 text-base font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
