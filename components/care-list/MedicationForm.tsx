"use client";

import { FormEvent, useState } from "react";
import { Check, X } from "lucide-react";
import { saveMedication } from "@/lib/actions/care-list";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Medication } from "@/lib/types";

export function MedicationForm({
  medication,
  onDone,
}: {
  medication?: Medication;
  onDone: () => void;
}) {
  const { dictionary } = useLocale();
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const formData = new FormData(e.currentTarget);
    try {
      await saveMedication(formData);
      onDone();
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : dictionary.medications.couldNotSave,
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {medication && <input type="hidden" name="id" value={medication.id} />}
      <Field label={dictionary.medications.nameLabel} htmlFor="med-name">
        <TextInput
          id="med-name"
          name="name"
          required
          defaultValue={medication?.name}
        />
      </Field>
      <Field label={dictionary.medications.dosageLabel} htmlFor="med-dosage">
        <TextInput
          id="med-dosage"
          name="dose_amount"
          type="number"
          min={0}
          step="any"
          required
          defaultValue={medication?.dose_amount ?? ""}
          placeholder={dictionary.medications.dosagePlaceholder}
        />
      </Field>
      <Field label={dictionary.medications.frequencyLabel} htmlFor="med-frequency">
        <Select
          id="med-frequency"
          name="frequency"
          required
          defaultValue={medication?.frequency ?? ""}
        >
          <option value="" disabled>
            {dictionary.medications.selectFrequency}
          </option>
          {Object.entries(dictionary.enums.frequency).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      {!medication && (
        <Field label={dictionary.medications.currentBalanceLabel} htmlFor="med-balance">
          <TextInput
            id="med-balance"
            name="initial_balance"
            type="number"
            min={0}
            step="any"
            required
            defaultValue={0}
          />
        </Field>
      )}
      <Field label={dictionary.common.notesLabel} htmlFor="med-notes">
        <TextArea
          id="med-notes"
          name="notes"
          defaultValue={medication?.notes ?? ""}
        />
      </Field>

      {status === "error" && (
        <p role="alert" className="text-lg text-danger">
          {message}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={status === "saving"}>
          <Check className="h-5 w-5" aria-hidden="true" />
          {status === "saving" ? dictionary.common.saving : dictionary.common.save}
        </Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          <X className="h-5 w-5" aria-hidden="true" />
          {dictionary.common.cancel}
        </Button>
      </div>
    </form>
  );
}
