"use client";

import { useState, useTransition } from "react";
import { toggleChecklist } from "@/lib/actions/care-list";
import { CheckToggle } from "@/components/ui/CheckToggle";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { DoseChecklistEntry, Medication } from "@/lib/types";

export function ChecklistSection({
  medications,
  checklist,
}: {
  medications: Medication[];
  checklist: DoseChecklistEntry[];
}) {
  const { dictionary } = useLocale();
  const [, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});

  const takenMap = new Map(checklist.map((c) => [c.medication_id, c.taken]));

  function handleToggle(medicationId: string, currentlyTaken: boolean) {
    setOptimistic((prev) => ({ ...prev, [medicationId]: !currentlyTaken }));
    startTransition(async () => {
      await toggleChecklist(medicationId, !currentlyTaken);
    });
  }

  if (medications.length === 0) {
    return (
      <p className="text-lg text-muted">{dictionary.forYou.noMedicationsYet}</p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {medications.map((med) => {
        const taken = optimistic[med.id] ?? takenMap.get(med.id) ?? false;
        return (
          <CheckToggle
            key={med.id}
            checked={taken}
            onChange={() => handleToggle(med.id, taken)}
          >
            {med.name}
          </CheckToggle>
        );
      })}
    </div>
  );
}
