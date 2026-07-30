"use client";

import { FormEvent, useState } from "react";
import { Check, X } from "lucide-react";
import { saveMedication } from "@/lib/actions/care-list";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { FREQUENCY_LABEL, type Medication } from "@/lib/types";

export function MedicationForm({
  medication,
  onDone,
}: {
  medication?: Medication;
  onDone: () => void;
}) {
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
        err instanceof Error ? err.message : "Could not save medication.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {medication && <input type="hidden" name="id" value={medication.id} />}
      <Field label="Medication name" htmlFor="med-name">
        <TextInput
          id="med-name"
          name="name"
          required
          defaultValue={medication?.name}
        />
      </Field>
      <Field label="Per dosage (amount per dose)" htmlFor="med-dosage">
        <TextInput
          id="med-dosage"
          name="dose_amount"
          type="number"
          min={0}
          step="any"
          required
          defaultValue={medication?.dose_amount ?? ""}
          placeholder="e.g. 2"
        />
      </Field>
      <Field label="How often is it taken?" htmlFor="med-frequency">
        <Select
          id="med-frequency"
          name="frequency"
          required
          defaultValue={medication?.frequency ?? ""}
        >
          <option value="" disabled>
            Select how often
          </option>
          {Object.entries(FREQUENCY_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      {!medication && (
        <Field label="Current medication balance" htmlFor="med-balance">
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
      <Field label="Notes (optional)" htmlFor="med-notes">
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
          {status === "saving" ? "Saving..." : "Save"}
        </Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          <X className="h-5 w-5" aria-hidden="true" />
          Cancel
        </Button>
      </div>
    </form>
  );
}
