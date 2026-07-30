import type { ActivityLogEntry } from "@/lib/types";

const ACTION_LABEL: Record<string, string> = {
  viewed_care_list: "viewed the care list",
  created_medication: "added a medication",
  updated_medication: "updated a medication",
  topped_up_medication: "topped up a medication",
  deleted_medication: "removed a medication",
  created_appointment: "added an appointment",
  updated_appointment: "updated an appointment",
  deleted_appointment: "removed an appointment",
  created_allergy: "added an allergy",
  updated_allergy: "updated an allergy",
  deleted_allergy: "removed an allergy",
  created_task: "added a task",
  updated_task: "updated a task",
  deleted_task: "removed a task",
  accepted_invite: "joined the care circle",
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ActivityFeed({ entries }: { entries: ActivityLogEntry[] }) {
  if (entries.length === 0) {
    return <p className="mt-4 text-lg text-muted">No activity yet.</p>;
  }

  return (
    <ul className="mt-4 flex flex-col gap-3">
      {entries.map((entry) => {
        const label = ACTION_LABEL[entry.action] ?? entry.action;
        return (
          <li
            key={entry.id}
            className="border-b border-border pb-3 text-lg last:border-0"
          >
            <span className="font-semibold">{entry.email ?? "Someone"}</span>{" "}
            {label}
            {entry.detail ? <> — {entry.detail}</> : null}
            <span className="block text-base text-muted">
              {formatWhen(entry.created_at)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
