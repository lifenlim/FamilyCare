"use server";

import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function confirmSignIn(
  params: { tokenHash: string; type: EmailOtpType } | { code: string },
  next: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } =
    "code" in params
      ? await supabase.auth.exchangeCodeForSession(params.code)
      : await supabase.auth.verifyOtp({
          token_hash: params.tokenHash,
          type: params.type,
        });

  if (error) {
    redirect("/login?error=auth");
  }

  redirect(next || "/for-you");
}
