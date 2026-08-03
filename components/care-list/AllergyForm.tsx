"use client";

import { FormEvent, useState } from "react";
import { Check, X } from "lucide-react";
import { saveAllergy } from "@/lib/actions/care-list";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Allergy } from "@/lib/types";

export function AllergyForm({
  allergy,
  onDone,
}: {
  allergy?: Allergy;
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
      await saveAllergy(formData);
      onDone();
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : dictionary.allergies.couldNotSave,
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {allergy && <input type="hidden" name="id" value={allergy.id} />}
      <Field label={dictionary.allergies.nameLabel} htmlFor="allergy-name">
        <TextInput
          id="allergy-name"
          name="name"
          required
          defaultValue={allergy?.name}
        />
      </Field>
      <Field label={dictionary.allergies.severityLabel} htmlFor="allergy-severity">
        <Select
          id="allergy-severity"
          name="severity"
          defaultValue={allergy?.severity ?? ""}
        >
          <option value="">{dictionary.common.notSet}</option>
          {Object.entries(dictionary.enums.severity).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={dictionary.common.notesLabel} htmlFor="allergy-notes">
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
