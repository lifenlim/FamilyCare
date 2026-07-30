"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Mail, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";

function friendlyLinkError(errorCode: string | null, description: string | null) {
  if (errorCode === "otp_expired") {
    return "That sign-in link has already been used or has expired. Please request a new one below.";
  }
  if (description) {
    return decodeURIComponent(description.replace(/\+/g, " "));
  }
  return "That sign-in link didn't work. Please request a new one below.";
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/for-you";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Supabase reports expired/used-link errors in the URL hash, which never
    // reaches the server -- read it here and show something useful instead
    // of silently landing back on a blank form.
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashError = hash.get("error_code");
    const hashDescription = hash.get("error_description");
    const queryError = searchParams.get("error");

    if (hashError || queryError) {
      setStatus("error");
      setErrorMessage(friendlyLinkError(hashError, hashDescription));
      window.history.replaceState(null, "", window.location.pathname + window.location.search.replace(/[?&]error=[^&]*/, ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-success bg-white p-6 text-center text-lg">
        <CheckCircle2 className="h-10 w-10 text-success" aria-hidden="true" />
        Check your email for a link to sign in. You can close this tab.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="Email address" htmlFor="email">
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <TextInput
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
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
        <Send className="h-5 w-5" aria-hidden="true" />
        {status === "sending" ? "Sending link..." : "Send me a sign-in link"}
      </Button>
    </form>
  );
}
