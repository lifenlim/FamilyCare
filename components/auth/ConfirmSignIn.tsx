"use client";

import { useState } from "react";
import { unstable_rethrow, useSearchParams } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Button } from "@/components/ui/Button";
import { confirmSignIn } from "@/lib/actions/auth";

export function ConfirmSignIn() {
  const searchParams = useSearchParams();
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
      setError("That sign-in link didn't work. Please request a new one.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <HeartHandshake className="h-12 w-12 text-primary" aria-hidden="true" />
      <div>
        <h1 className="text-2xl font-bold text-primary">Finish signing in</h1>
        <p className="mt-2 text-lg text-muted">
          Tap the button below to complete signing in to FamilyCare.
        </p>
      </div>
      {error && (
        <p role="alert" className="text-lg text-danger">
          {error}
        </p>
      )}
      {!params && (
        <p role="alert" className="text-lg text-danger">
          This link is missing its sign-in details. Please request a new one.
        </p>
      )}
      <Button onClick={handleClick} disabled={loading || !params}>
        {loading ? "Signing in..." : "Finish signing in"}
      </Button>
    </main>
  );
}
