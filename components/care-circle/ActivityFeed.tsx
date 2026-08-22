"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALE_TAG } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { ActivityLogEntry } from "@/lib/types";

function actionLabel(dictionary: Dictionary, action: string): string {
  const map: Record<string, string> = {
    viewed_care_list: dictionary.activity.actions.viewedCareList,
    created_medication: dictionary.activity.actions.createdMedication,
    updated_medication: dictionary.activity.actions.updatedMedication,
    topped_up_medication: dictionary.activity.actions.toppedUpMedication,
    deleted_medication: dictionary.activity.actions.deletedMedication,
    created_appointment: dictionary.activity.actions.createdAppointment,
    updated_appointment: dictionary.activity.actions.updatedAppointment,
    deleted_appointment: dictionary.activity.actions.deletedAppointment,
    created_allergy: dictionary.activity.actions.createdAllergy,
    updated_allergy: dictionary.activity.actions.updatedAllergy,
    deleted_allergy: dictionary.activity.actions.deletedAllergy,
    created_task: dictionary.activity.actions.createdTask,
    updated_task: dictionary.activity.actions.updatedTask,
    deleted_task: dictionary.activity.actions.deletedTask,
    accepted_invite: dictionary.activity.actions.acceptedInvite,
    transferred_ownership: dictionary.activity.actions.transferredOwnership,
  };
  return map[action] ?? action;
}

function formatWhen(iso: string, localeTag: string) {
  return new Date(iso).toLocaleString(localeTag, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ActivityFeed({ entries }: { entries: ActivityLogEntry[] }) {
  const { dictionary, locale } = useLocale();

  if (entries.length === 0) {
    return <p className="mt-4 text-lg text-muted">{dictionary.activity.noActivityYet}</p>;
  }

  return (
    <ul className="mt-4 flex flex-col gap-3">
      {entries.map((entry) => {
        const label = actionLabel(dictionary, entry.action);
        return (
          <li
            key={entry.id}
            className="border-b border-border pb-3 text-lg last:border-0"
          >
            <span className="font-semibold">
              {entry.email ?? entry.phone ?? dictionary.activity.someone}
            </span>{" "}
            {label}
            {entry.detail ? <> — {entry.detail}</> : null}
            <span className="block text-base text-muted">
              {formatWhen(entry.created_at, LOCALE_TAG[locale])}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
