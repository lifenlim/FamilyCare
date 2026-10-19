"use client";

import { FormEvent, useState } from "react";
import { Check, X } from "lucide-react";
import { saveVisit } from "@/lib/actions/visits";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { toTimeInputValue } from "@/lib/visits";
import type { Visit } from "@/lib/types";

const DEFAULT_START = "10:00";
const DEFAULT_END = "12:00";

export function VisitForm({
  visit,
  defaultDate,
  onDone,
}: {
  visit?: Visit;
  defaultDate: string;
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
      const result = await saveVisit(formData);
      if (result.error) {
        setStatus("error");
        setMessage(result.error);
        return;
      }
      onDone();
    } catch {
      setStatus("error");
      setMessage(dictionary.visits.couldNotSave);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {visit && <input type="hidden" name="id" value={visit.id} />}
      <Field label={dictionary.visits.dateLabel} htmlFor="visit-date">
        <TextInput
          id="visit-date"
          name="visit_date"
          type="date"
          required
          defaultValue={visit?.visit_date ?? defaultDate}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={dictionary.visits.startLabel} htmlFor="visit-start">
          <TextInput
            id="visit-start"
            name="start_time"
            type="time"
            required
            defaultValue={visit ? toTimeInputValue(visit.start_time) : DEFAULT_START}
          />
        </Field>
        <Field label={dictionary.visits.endLabel} htmlFor="visit-end">
          <TextInput
            id="visit-end"
            name="end_time"
            type="time"
            required
            defaultValue={visit ? toTimeInputValue(visit.end_time) : DEFAULT_END}
          />
        </Field>
      </div>
      <Field label={dictionary.visits.noteLabel} htmlFor="visit-note">
        <TextInput
          id="visit-note"
          name="note"
          defaultValue={visit?.note ?? ""}
          placeholder={dictionary.visits.notePlaceholder}
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
