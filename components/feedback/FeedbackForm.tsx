"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitFeedback } from "@/lib/actions/feedback";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextArea } from "@/components/ui/Field";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function FeedbackForm() {
  const { dictionary } = useLocale();
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "sent">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const formData = new FormData(e.currentTarget);
    try {
      await submitFeedback(formData);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : dictionary.feedback.couldNotSubmit,
      );
    }
  }

  if (status === "sent") {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" aria-hidden="true" />
          <p className="text-xl font-bold">{dictionary.feedback.thankYouTitle}</p>
          <p className="text-lg text-muted">{dictionary.feedback.thankYouBody}</p>
          <Button
            variant="secondary"
            className="min-h-0 px-4 py-2 text-base"
            onClick={() => setStatus("idle")}
          >
            {dictionary.feedback.sendAnother}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label={dictionary.feedback.categoryLabel} htmlFor="feedback-category">
          <Select id="feedback-category" name="category" defaultValue="">
            <option value="">{dictionary.feedback.categoryPlaceholder}</option>
            {Object.entries(dictionary.enums.feedbackCategory).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={dictionary.feedback.messageLabel} htmlFor="feedback-message">
          <TextArea
            id="feedback-message"
            name="message"
            required
            placeholder={dictionary.feedback.messagePlaceholder}
          />
        </Field>

        {status === "error" && (
          <p role="alert" className="text-lg text-danger">
            {message}
          </p>
        )}

        <Button type="submit" disabled={status === "saving"}>
          <Send className="h-5 w-5" aria-hidden="true" />
          {status === "saving" ? dictionary.feedback.submitting : dictionary.feedback.submit}
        </Button>
      </form>
    </Card>
  );
}
