"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function PhoneLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dictionary } = useLocale();
  const next = searchParams.get("next") || "/for-you";

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: { channel: "whatsapp" },
    });
    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("idle");
      setStep("code");
    }
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: "sms",
    });
    if (error) {
      setStatus("error");
      setErrorMessage(dictionary.login.invalidCode);
    } else {
      router.push(next);
      router.refresh();
    }
  }

  if (step === "code") {
    return (
      <form onSubmit={handleVerifyCode} className="flex flex-col gap-5">
        <div className="flex items-center gap-3 rounded-xl border-2 border-success bg-white p-4 text-lg">
          <CheckCircle2 className="h-8 w-8 shrink-0 text-success" aria-hidden="true" />
          {dictionary.login.codeSentMessage}
        </div>
        <Field label={dictionary.login.codeLabel} htmlFor="phone-code">
          <div className="relative">
            <KeyRound
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <TextInput
              id="phone-code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={dictionary.login.codePlaceholder}
              className="pl-12"
            />
          </div>
        </Field>
        {status === "error" && (
          <p role="alert" className="text-lg text-danger">
            {errorMessage}
          </p>
        )}
        <Button type="submit" disabled={status === "sending"}>
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          {status === "sending" ? dictionary.login.verifyingCode : dictionary.login.verifyCodeButton}
        </Button>
        <div className="flex flex-wrap justify-between gap-3 text-base">
          <button
            type="button"
            className="text-primary underline underline-offset-2"
            onClick={handleSendCode}
          >
            {dictionary.login.resendCode}
          </button>
          <button
            type="button"
            className="text-primary underline underline-offset-2"
            onClick={() => {
              setStep("phone");
              setCode("");
              setStatus("idle");
              setErrorMessage("");
            }}
          >
            {dictionary.login.changePhoneNumber}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendCode} className="flex flex-col gap-5">
      <Field label={dictionary.login.phoneLabel} htmlFor="phone-number">
        <TextInput
          id="phone-number"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={dictionary.login.phonePlaceholder}
        />
      </Field>
      {status === "error" && (
        <p role="alert" className="text-lg text-danger">
          {errorMessage}
        </p>
      )}
      <Button type="submit" disabled={status === "sending"}>
        <Send className="h-5 w-5" aria-hidden="true" />
        {status === "sending" ? dictionary.login.sendingCode : dictionary.login.sendCodeButton}
      </Button>
    </form>
  );
}
