"use client";

import { useState } from "react";
import { unstable_rethrow, useSearchParams } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Button } from "@/components/ui/Button";
import { confirmSignIn } from "@/lib/actions/auth";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function ConfirmSignIn() {
  const searchParams = useSearchParams();
  const { dictionary } = useLocale();
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/for-you";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const params =
    tokenHash && type ? { tokenHash, type } : code ? { code } : null;

  async function handleClick() {
    if (!params) return;
    setLoading(true);
    setError("");
    try {
      await confirmSignIn(params, next);
    } catch (err) {
      // redirect() throws internally to signal navigation -- let that
      // propagate; only a real failure (bad/expired link) reaches here.
      unstable_rethrow(err);
      setError(dictionary.authConfirm.failed);
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <HeartHandshake className="h-12 w-12 text-primary" aria-hidden="true" />
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {dictionary.authConfirm.heading}
        </h1>
        <p className="mt-2 text-lg text-muted">{dictionary.authConfirm.subtitle}</p>
      </div>
      {error && (
        <p role="alert" className="text-lg text-danger">
          {error}
        </p>
      )}
      {!params && (
        <p role="alert" className="text-lg text-danger">
          {dictionary.authConfirm.missingDetails}
        </p>
      )}
      <Button onClick={handleClick} disabled={loading || !params}>
        {loading ? dictionary.authConfirm.signingIn : dictionary.authConfirm.button}
      </Button>
    </main>
  );
}
