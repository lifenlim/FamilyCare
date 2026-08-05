"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  disablePush,
  enablePush,
  getExistingSubscription,
  pushSupported,
} from "@/lib/push/client";

type Status = "checking" | "unsupported" | "off" | "on" | "enabling" | "disabling";

export function CriticalAlertsToggle() {
  const { dictionary } = useLocale();
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!pushSupported()) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      const subscription = await getExistingSubscription();
      if (!cancelled) setStatus(subscription ? "on" : "off");
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggle() {
    setError(null);
    if (status === "on") {
      setStatus("disabling");
      try {
        await disablePush();
        setStatus("off");
      } catch {
        setStatus("on");
        setError(dictionary.alerts.couldNotDisable);
      }
      return;
    }

    setStatus("enabling");
    try {
      await enablePush();
      setStatus("on");
    } catch (err) {
      setStatus("off");
      const detail = err instanceof Error ? err.message : String(err);
      setError(
        detail === "permission-denied"
          ? dictionary.alerts.permissionDeniedMessage
          : `${dictionary.alerts.couldNotEnable} (${detail})`,
      );
    }
  }

  if (status === "unsupported") return null;

  const isOn = status === "on";
  const busy = status === "checking" || status === "enabling" || status === "disabling";

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2.5">
        <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="text-sm font-medium text-foreground">
          {dictionary.alerts.heading}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label={dictionary.alerts.heading}
          onClick={handleToggle}
          disabled={busy}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
            isOn ? "bg-primary" : "bg-border"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
              isOn ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      {error && <p className="text-sm font-medium text-danger-dark">{error}</p>}
    </div>
  );
}
