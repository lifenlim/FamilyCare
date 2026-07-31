import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border-2 border-border bg-white p-4 sm:p-5 ${className}`}>
      {children}
    </div>
  );
}
