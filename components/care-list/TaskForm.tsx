"use client";

import { FormEvent, useState } from "react";
import { Check, X } from "lucide-react";
import { saveCareTask } from "@/lib/actions/care-list";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import {
  RECURRENCE_LABEL,
  TASK_STATUS_LABEL,
  type CareTask,
  type TaskScheduleType,
} from "@/lib/types";

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
      setMessage(err instanceof Error ? err.message : "Could not save task.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {task && <input type="hidden" name="id" value={task.id} />}
      <Field label="Task name" htmlFor="task-name">
        <TextInput
          id="task-name"
          name="name"
          required
          placeholder="e.g. Blood test, Change dressing"
          defaultValue={task?.name}
        />
      </Field>
      <Field label="Frequency" htmlFor="task-schedule-type">
        <Select
          id="task-schedule-type"
          name="schedule_type"
          required
          value={scheduleType}
          onChange={(e) =>
            setScheduleType(e.target.value as TaskScheduleType)
          }
        >
          <option value="ongoing">Recurring</option>
          <option value="one_time">One time</option>
        </Select>
      </Field>
      {scheduleType === "ongoing" ? (
        <Field label="When" htmlFor="task-recurrence">
          <Select
            id="task-recurrence"
            name="recurrence"
            required
            defaultValue={task?.recurrence ?? ""}
          >
            <option value="" disabled>
              Select how often
            </option>
            {Object.entries(RECURRENCE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <Field label="When" htmlFor="task-scheduled-at">
          <TextInput
            id="task-scheduled-at"
            name="scheduled_at"
            type="datetime-local"
            required
            defaultValue={toLocalInputValue(task?.scheduled_at)}
          />
        </Field>
      )}
      <Field label="Status" htmlFor="task-status">
        <Select
          id="task-status"
          name="status"
          required
          defaultValue={task?.status ?? "active"}
        >
          {Object.entries(TASK_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Notes (optional)" htmlFor="task-notes">
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
