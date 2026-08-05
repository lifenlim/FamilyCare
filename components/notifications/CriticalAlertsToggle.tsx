"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
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

  async function handleEnable() {
    setError(null);
    setStatus("enabling");
    try {
      await enablePush();
      setStatus("on");
    } catch (err) {
      setStatus("off");
      setError(
        err instanceof Error && err.message === "permission-denied"
          ? dictionary.alerts.permissionDeniedMessage
          : dictionary.alerts.couldNotEnable,
      );
    }
  }

  async function handleDisable() {
    setError(null);
    setStatus("disabling");
    try {
      await disablePush();
      setStatus("off");
    } catch {
      setStatus("on");
      setError(dictionary.alerts.couldNotDisable);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border-2 border-border bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bell className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-lg font-semibold text-foreground">{dictionary.alerts.heading}</p>
          <p className="text-base text-muted">{dictionary.alerts.blurb}</p>
        </div>
      </div>

      {status === "unsupported" ? (
        <p className="text-base text-muted">{dictionary.alerts.unsupportedMessage}</p>
      ) : status === "on" ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base font-medium text-foreground">
            {dictionary.alerts.enabledMessage}
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={handleDisable}
            disabled={status !== "on"}
          >
            <BellOff className="h-5 w-5" aria-hidden="true" />
            {dictionary.alerts.disableButton}
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          onClick={handleEnable}
          disabled={status === "checking" || status === "enabling"}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {status === "enabling" ? dictionary.alerts.enabling : dictionary.alerts.enableButton}
        </Button>
      )}

      {error && <p className="text-base font-medium text-danger-dark">{error}</p>}
    </div>
  );
}
