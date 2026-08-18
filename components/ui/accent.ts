export type AccentTone = "primary" | "blue" | "teal" | "gold" | "purple" | "warn";

export const ACCENT_BADGE: Record<AccentTone, string> = {
  primary: "bg-primary/15 text-primary",
  blue: "bg-accent-blue/15 text-accent-blue",
  teal: "bg-accent-teal/15 text-accent-teal",
  gold: "bg-accent-gold/15 text-accent-gold",
  purple: "bg-accent-purple/15 text-accent-purple",
  warn: "bg-warning-border/20 text-warning-text",
};

export const ACCENT_SOLID: Record<AccentTone, string> = {
  primary: "bg-primary text-white",
  blue: "bg-accent-blue text-white",
  teal: "bg-accent-teal text-white",
  gold: "bg-accent-gold text-white",
  purple: "bg-accent-purple text-white",
  warn: "bg-warning-border text-white",
};
