import { HeartHandshake } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <span className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-primary text-white">
        <HeartHandshake className="h-9 w-9" />
      </span>
      <p className="text-lg font-semibold text-muted">Loading…</p>
    </div>
  );
}
