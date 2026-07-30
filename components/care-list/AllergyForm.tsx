"use client";

import { FormEvent, useState } from "react";
import { Check, X } from "lucide-react";
import { saveAllergy } from "@/lib/actions/care-list";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { SEVERITY_LABEL, type Allergy } from "@/lib/types";

export function AllergyForm({
  allergy,
  onDone,
}: {
  allergy?: Allergy;
  onDone: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const formData = new FormData(e.currentTarget);
    try {
      await saveAllergy(formData);
      onDone();
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "Could not save allergy.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {allergy && <input type="hidden" name="id" value={allergy.id} />}
      <Field label="Allergy" htmlFor="allergy-name">
        <TextInput
          id="allergy-name"
          name="name"
          required
          defaultValue={allergy?.name}
        />
      </Field>
      <Field label="Severity (optional)" htmlFor="allergy-severity">
        <Select
          id="allergy-severity"
          name="severity"
          defaultValue={allergy?.severity ?? ""}
        >
          <option value="">Not set</option>
          {Object.entries(SEVERITY_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Notes (optional)" htmlFor="allergy-notes">
        <TextArea
          id="allergy-notes"
          name="notes"
          defaultValue={allergy?.notes ?? ""}
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
