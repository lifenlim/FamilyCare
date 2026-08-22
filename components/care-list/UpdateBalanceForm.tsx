"use client";

import { FormEvent, useState } from "react";
import { updateMedicationBalance } from "@/lib/actions/care-list";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function UpdateBalanceForm({
  medicationId,
  medicationName,
  currentBalance,
  onDone,
}: {
  medicationId: string;
  medicationName: string;
  currentBalance: number;
  onDone: () => void;
}) {
  const { dictionary } = useLocale();
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const formData = new FormData(e.currentTarget);
    const newBalance = Number(formData.get("balance"));
    try {
      await updateMedicationBalance(medicationId, newBalance, medicationName);
      onDone();
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : dictionary.medications.couldNotUpdateBalance,
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-lg bg-surface p-3"
    >
      <Field label={dictionary.medications.newBalanceLabel} htmlFor="update-balance-amount">
        <TextInput
          id="update-balance-amount"
          name="balance"
          type="number"
          min={0}
          step="any"
          required
          defaultValue={Math.round(currentBalance)}
          autoFocus
        />
      </Field>
      <Button
        type="submit"
        disabled={status === "saving"}
        className="min-h-0 px-4 py-2 text-base"
      >
        {status === "saving" ? dictionary.common.saving : dictionary.common.save}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={onDone}
        className="min-h-0 px-4 py-2 text-base"
      >
        {dictionary.common.cancel}
      </Button>
      {status === "error" && (
        <p role="alert" className="w-full text-lg text-danger">
          {message}
        </p>
      )}
    </form>
  );
}
