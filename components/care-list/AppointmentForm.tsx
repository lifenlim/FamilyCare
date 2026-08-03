"use client";

import { FormEvent, useState } from "react";
import { Check, X } from "lucide-react";
import { saveAppointment } from "@/lib/actions/care-list";
import { Button } from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Appointment } from "@/lib/types";

function toLocalInputValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function AppointmentForm({
  appointment,
  onDone,
}: {
  appointment?: Appointment;
  onDone: () => void;
}) {
  const { dictionary } = useLocale();
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const formData = new FormData(e.currentTarget);
    const localValue = formData.get("appointment_at") as string;
    formData.set("appointment_at", new Date(localValue).toISOString());
    try {
      await saveAppointment(formData);
      onDone();
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : dictionary.appointments.couldNotSave,
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {appointment && (
        <input type="hidden" name="id" value={appointment.id} />
      )}
      <Field label={dictionary.appointments.whatFor} htmlFor="appt-title">
        <TextInput
          id="appt-title"
          name="title"
          required
          defaultValue={appointment?.title}
        />
      </Field>
      <Field label={dictionary.appointments.dateAndTime} htmlFor="appt-when">
        <TextInput
          id="appt-when"
          name="appointment_at"
          type="datetime-local"
          required
          defaultValue={toLocalInputValue(appointment?.appointment_at)}
        />
      </Field>
      <Field label={dictionary.appointments.locationLabel} htmlFor="appt-location">
        <TextInput
          id="appt-location"
          name="location"
          defaultValue={appointment?.location ?? ""}
        />
      </Field>
      <Field label={dictionary.common.notesLabel} htmlFor="appt-notes">
        <TextArea
          id="appt-notes"
          name="notes"
          defaultValue={appointment?.notes ?? ""}
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
