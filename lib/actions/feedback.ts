"use server";

import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { FeedbackCategory } from "@/lib/types";

const FEEDBACK_NOTIFICATION_RECIPIENTS = ["xialzan@gmail.com", "lifenlim88@gmail.com"];
const FEEDBACK_FROM_ADDRESS = "FamilyCare Feedback <feedback@familycare.com.sg>";

async function notifyFeedbackSubmitted(params: {
  message: string;
  category: string;
  submitterEmail: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set; skipping feedback notification email");
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FEEDBACK_FROM_ADDRESS,
        to: FEEDBACK_NOTIFICATION_RECIPIENTS,
        subject: "New FamilyCare feedback submitted",
        text: [
          `From: ${params.submitterEmail ?? "Unknown user"}`,
          `Category: ${params.category || "None"}`,
          "",
          params.message,
        ].join("\n"),
      }),
    });
    if (!res.ok) {
      console.error(
        "Resend rejected feedback notification email",
        res.status,
        await res.text(),
      );
    }
  } catch (err) {
    // Feedback is already saved -- a failed notification shouldn't fail the submission.
    console.error("Failed to send feedback notification email", err);
  }
}

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

  await notifyFeedbackSubmitted({
    message,
    category,
    submitterEmail: user.email ?? null,
  });
}
