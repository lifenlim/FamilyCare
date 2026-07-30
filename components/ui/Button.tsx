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
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-6 py-3 text-lg font-semibold transition-colors disabled:hover:bg-none ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
