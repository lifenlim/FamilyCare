"use client";

import { FormEvent, useState } from "react";
import { Check, X } from "lucide-react";
import { saveCareTask } from "@/lib/actions/care-list";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { CareTask, TaskScheduleType } from "@/lib/types";

function toLocalInputValue(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function TaskForm({
  task,
  onDone,
}: {
  task?: CareTask;
  onDone: () => void;
}) {
  const { dictionary } = useLocale();
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");
  const [scheduleType, setScheduleType] = useState<TaskScheduleType>(
    task?.schedule_type ?? "ongoing",
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const formData = new FormData(e.currentTarget);
    if (scheduleType === "one_time") {
      const localValue = formData.get("scheduled_at") as string;
      formData.set("scheduled_at", new Date(localValue).toISOString());
    }
    try {
      await saveCareTask(formData);
      onDone();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : dictionary.tasks.couldNotSave);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {task && <input type="hidden" name="id" value={task.id} />}
      <Field label={dictionary.tasks.nameLabel} htmlFor="task-name">
        <TextInput
          id="task-name"
          name="name"
          required
          placeholder={dictionary.tasks.namePlaceholder}
          defaultValue={task?.name}
        />
      </Field>
      <Field label={dictionary.tasks.frequencyLabel} htmlFor="task-schedule-type">
        <Select
          id="task-schedule-type"
          name="schedule_type"
          required
          value={scheduleType}
          onChange={(e) =>
            setScheduleType(e.target.value as TaskScheduleType)
          }
        >
          <option value="ongoing">{dictionary.tasks.recurring}</option>
          <option value="one_time">{dictionary.tasks.oneTime}</option>
        </Select>
      </Field>
      {scheduleType === "ongoing" ? (
        <Field label={dictionary.tasks.whenLabel} htmlFor="task-recurrence">
          <Select
            id="task-recurrence"
            name="recurrence"
            required
            defaultValue={task?.recurrence ?? ""}
          >
            <option value="" disabled>
              {dictionary.tasks.selectFrequency}
            </option>
            {Object.entries(dictionary.enums.recurrence).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <Field label={dictionary.tasks.whenLabel} htmlFor="task-scheduled-at">
          <TextInput
            id="task-scheduled-at"
            name="scheduled_at"
            type="datetime-local"
            required
            defaultValue={toLocalInputValue(task?.scheduled_at)}
          />
        </Field>
      )}
      <Field label={dictionary.tasks.statusLabel} htmlFor="task-status">
        <Select
          id="task-status"
          name="status"
          required
          defaultValue={task?.status ?? "active"}
        >
          {Object.entries(dictionary.enums.taskStatus).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={dictionary.common.notesLabel} htmlFor="task-notes">
        <TextArea id="task-notes" name="notes" defaultValue={task?.notes ?? ""} />
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
