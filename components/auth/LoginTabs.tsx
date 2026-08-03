"use client";

import { useState } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { PhoneLoginForm } from "@/components/auth/PhoneLoginForm";
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
          className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-base font-semibold ${
            method === "phone" ? "bg-primary text-white" : "text-muted"
          }`}
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          {dictionary.login.phoneTab}
        </button>
      </div>
      {method === "email" ? <LoginForm /> : <PhoneLoginForm />}
    </div>
  );
}
