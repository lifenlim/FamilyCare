"use client";

import { FormEvent, useState } from "react";
import { topUpMedication } from "@/lib/actions/care-list";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";

export function TopUpForm({
  medicationId,
  medicationName,
  onDone,
}: {
  medicationId: string;
  medicationName: string;
  onDone: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get("amount"));
    try {
      await topUpMedication(medicationId, amount, medicationName);
      onDone();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not top up.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-lg bg-surface p-3"
    >
      <Field label="Add to balance" htmlFor="topup-amount">
        <TextInput
          id="topup-amount"
          name="amount"
          type="number"
          min={0}
          step="any"
          required
          autoFocus
        />
      </Field>
      <Button
        type="submit"
        disabled={status === "saving"}
        className="min-h-0 px-4 py-2 text-base"
      >
        {status === "saving" ? "Saving..." : "Confirm top-up"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={onDone}
        className="min-h-0 px-4 py-2 text-base"
      >
        Cancel
      </Button>
      {status === "error" && (
        <p role="alert" className="w-full text-lg text-danger">
          {message}
        </p>
      )}
    </form>
  );
}
