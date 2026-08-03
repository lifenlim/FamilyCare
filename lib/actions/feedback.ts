"use server";

import { createClient } from "@/lib/supabase/server";
import type { FeedbackCategory } from "@/lib/types";

export async function submitFeedback(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const message = ((formData.get("message") as string) || "").trim();
  if (!message) throw new Error("Please enter a message.");
  const category = ((formData.get("category") as string) || "").trim();

  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    message,
    category: (category || null) as FeedbackCategory | null,
  });
  if (error) throw error;
}
