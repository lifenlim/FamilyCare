"use client";

import { useState, useTransition } from "react";
import { toggleTaskChecklist } from "@/lib/actions/care-list";
import { CheckToggle } from "@/components/ui/CheckToggle";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { CareTask, TaskChecklistEntry } from "@/lib/types";

export function TaskChecklistSection({
  tasks,
  checklist,
}: {
  tasks: CareTask[];
  checklist: TaskChecklistEntry[];
}) {
  const { dictionary } = useLocale();
  const [, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});

  const doneMap = new Map(checklist.map((c) => [c.task_id, c.done]));

  function handleToggle(taskId: string, currentlyDone: boolean) {
    setOptimistic((prev) => ({ ...prev, [taskId]: !currentlyDone }));
    startTransition(async () => {
      await toggleTaskChecklist(taskId, !currentlyDone);
    });
  }

  if (tasks.length === 0) {
    return (
      <p className="text-lg text-muted">{dictionary.forYou.nothingScheduledToday}</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => {
        const done = optimistic[task.id] ?? doneMap.get(task.id) ?? false;
        return (
          <CheckToggle
            key={task.id}
            checked={done}
            onChange={() => handleToggle(task.id, done)}
          >
            {task.name}
            {task.schedule_type === "ongoing" && task.recurrence ? (
              <span className="block text-base font-normal text-muted">
                {dictionary.enums.recurrence[task.recurrence]}
              </span>
            ) : null}
          </CheckToggle>
        );
      })}
    </div>
  );
}
