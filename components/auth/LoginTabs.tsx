"use client";

import { useState } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function LoginTabs() {
  const { dictionary } = useLocale();
  const [method, setMethod] = useState<"email" | "phone">("email");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex rounded-lg border-2 border-border p-1">
        <button
          type="button"
          onClick={() => setMethod("email")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-base font-semibold ${
            method === "email" ? "bg-primary text-white" : "text-muted"
          }`}
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          {dictionary.login.emailTab}
        </button>
        <button
          type="button"
          onClick={() => setMethod("phone")}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-md py-1.5 text-base font-semibold sm:flex-row sm:gap-2 sm:py-2 ${
            method === "phone" ? "bg-primary text-white" : "text-muted"
          }`}
        >
          <span className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {dictionary.login.phoneTab}
          </span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:ml-1 ${
              method === "phone" ? "bg-white/20 text-white" : "bg-warning-bg text-warning-text"
            }`}
          >
            {dictionary.login.comingSoon}
          </span>
        </button>
      </div>
      {method === "email" ? (
        <LoginForm />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-warning-border bg-warning-bg p-6 text-center text-lg text-warning-text">
          <MessageCircle className="h-8 w-8" aria-hidden="true" />
          {dictionary.login.whatsappComingSoonMessage}
        </div>
      )}
    </div>
  );
}
