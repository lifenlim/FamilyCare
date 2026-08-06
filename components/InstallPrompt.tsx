"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";

const DISMISSED_KEY = "familycare:install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallPrompt() {
  const { dictionary } = useLocale();
  const [platform, setPlatform] = useState<"android" | "ios" | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISSED_KEY)) return;

    if (isIOS()) {
      // iOS has no beforeinstallprompt event to subscribe to -- this is a
      // one-time read of navigator.userAgent, not available during SSR, so
      // it has to happen here rather than in a lazy useState initializer.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlatform("ios");
      return;
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform("android");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setPlatform(null);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setPlatform(null);
  }

  if (!platform) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-primary/30 bg-primary/5 px-4 py-3">
      {platform === "android" ? (
        <Download className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      ) : (
        <Share className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      )}
      <p className="flex-1 text-base text-foreground">
        {platform === "android" ? dictionary.install.androidMessage : dictionary.install.iosMessage}
      </p>
      {platform === "android" && (
        <Button
          type="button"
          onClick={handleInstall}
          className="shrink-0 px-3 py-1.5 text-sm"
        >
          {dictionary.install.installButton}
        </Button>
      )}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={dictionary.install.dismiss}
        className="shrink-0 text-muted hover:text-foreground"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
