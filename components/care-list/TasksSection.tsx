"use client";

import { useState } from "react";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TaskForm } from "./TaskForm";
import { deleteCareTask } from "@/lib/actions/care-list";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALE_TAG } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { CareTask } from "@/lib/types";

function formatWhen(iso: string, localeTag: string) {
  return new Date(iso).toLocaleString(localeTag, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function scheduleSummary(dictionary: Dictionary, localeTag: string, task: CareTask) {
  if (task.schedule_type === "ongoing" && task.recurrence) {
    if (task.recurrence === "weekly" && task.recurrence_day_of_week !== null) {
      return dictionary.tasks.weeklyOnDay(
        dictionary.enums.dayOfWeek[
          String(task.recurrence_day_of_week) as keyof typeof dictionary.enums.dayOfWeek
        ],
      );
    }
    return dictionary.enums.recurrence[task.recurrence];
  }
  if (task.schedule_type === "one_time" && task.scheduled_at) {
    return formatWhen(task.scheduled_at, localeTag);
  }
  return null;
}

export function TasksSection({
  tasks,
  canEdit,
}: {
  tasks: CareTask[];
  canEdit: boolean;
}) {
  const { dictionary, locale } = useLocale();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  async function handleConfirmRemove(id: string, name: string) {
    setDeletingId(id);
    setDeleteError("");
    try {
      await deleteCareTask(id, name);
      setRemovingId(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : dictionary.tasks.couldNotRemove,
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card className="border-l-4 border-l-accent-purple">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <ClipboardList className="h-6 w-6 text-accent-purple" aria-hidden="true" />
          {dictionary.tasks.heading}
        </h2>
        {canEdit && !addingNew && (
          <Button
            className="min-h-0 px-4 py-2 text-base"
            onClick={() => setAddingNew(true)}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            {dictionary.tasks.addTask}
          </Button>
        )}
      </div>

      {addingNew && (
        <div className="mt-4">
          <TaskForm onDone={() => setAddingNew(false)} />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {tasks.length === 0 && (
          <p className="text-lg text-muted">{dictionary.tasks.noTasksYet}</p>
        )}
        {tasks.map((task) => {
          if (editingId === task.id) {
            return (
              <div
                key={task.id}
                className="rounded-lg border-2 border-primary p-4"
              >
                <TaskForm task={task} onDone={() => setEditingId(null)} />
              </div>
            );
          }
          const when = scheduleSummary(dictionary, LOCALE_TAG[locale], task);
          return (
            <div
              key={task.id}
              className="flex flex-col gap-3 rounded-lg border-2 border-border p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold">{task.name}</p>
                  <p className="text-lg text-muted">
                    {task.schedule_type === "ongoing"
                      ? dictionary.tasks.recurring
                      : dictionary.tasks.oneTime}
                    {when ? ` — ${when}` : ""}
                  </p>
                  {task.notes && (
                    <p className="mt-1 text-lg text-muted">{task.notes}</p>
                  )}
                </div>
                <Badge
                  tone={
                    task.status === "active"
                      ? "primary"
                      : task.status === "completed"
                        ? "success"
                        : "neutral"
                  }
                >
                  {dictionary.enums.taskStatus[task.status]}
                </Badge>
              </div>

              {canEdit && (
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    className="min-h-0 px-4 py-2 text-base"
                    onClick={() => setEditingId(task.id)}
                  >
                    <Pencil className="h-5 w-5" aria-hidden="true" />
                    {dictionary.common.edit}
                  </Button>
                  <Button
                    variant="danger"
                    className="min-h-0 px-4 py-2 text-base"
                    onClick={() => {
                      setDeleteError("");
                      setRemovingId(task.id);
                    }}
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                    {dictionary.common.remove}
                  </Button>
                </div>
              )}

              {removingId === task.id && (
                <div className="flex flex-col gap-3 rounded-lg border-2 border-danger bg-white p-3">
                  <p className="text-lg font-medium">
                    {dictionary.tasks.removeConfirm(task.name)}
                  </p>
                  {deleteError && (
                    <p role="alert" className="text-lg text-danger">
                      {deleteError}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="danger"
                      className="min-h-0 px-4 py-2 text-base"
                      disabled={deletingId === task.id}
                      onClick={() => handleConfirmRemove(task.id, task.name)}
                    >
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                      {deletingId === task.id
                        ? dictionary.common.removing
                        : dictionary.common.yesRemove}
                    </Button>
                    <Button
                      variant="secondary"
                      className="min-h-0 px-4 py-2 text-base"
                      disabled={deletingId === task.id}
                      onClick={() => setRemovingId(null)}
                    >
                      {dictionary.common.cancel}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
