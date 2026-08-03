"use server";

import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { FeedbackCategory } from "@/lib/types";

export async function submitFeedback(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const [{ data: { user } }, dictionary] = await Promise.all([
    supabase.auth.getUser(),
    getDictionary(),
  ]);
  if (!user) throw new Error(dictionary.common.notSignedIn);

  const message = ((formData.get("message") as string) || "").trim();
  if (!message) throw new Error(dictionary.feedback.messageRequired);
  const category = ((formData.get("category") as string) || "").trim();

  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    message,
    category: (category || null) as FeedbackCategory | null,
  });
  if (error) throw error;
}
