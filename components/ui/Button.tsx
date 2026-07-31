import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-white text-foreground border-2 border-border hover:bg-surface",
  danger: "bg-danger text-white hover:bg-danger-dark",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-base font-semibold transition-colors disabled:hover:bg-none ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
