"use client";

import { useState } from "react";
import { AlertTriangle, Hash, Pencil, Pill, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MedicationForm } from "./MedicationForm";
import { TopUpForm } from "./TopUpForm";
import { UpdateBalanceForm } from "./UpdateBalanceForm";
import { deleteMedication } from "@/lib/actions/care-list";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { daysOfSupply, isRunningLow, type Medication } from "@/lib/types";

function formatBalance(n: number) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(1);
}

export function MedicationsSection({
  medications,
  canEdit,
}: {
  medications: Medication[];
  canEdit: boolean;
}) {
  const { dictionary } = useLocale();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [toppingUpId, setToppingUpId] = useState<string | null>(null);
  const [updatingBalanceId, setUpdatingBalanceId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  async function handleConfirmRemove(id: string, name: string) {
    setDeletingId(id);
    setDeleteError("");
    try {
      await deleteMedication(id, name);
      setRemovingId(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : dictionary.medications.couldNotRemove,
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card className="border-l-4 border-l-accent-teal">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Pill className="h-6 w-6 text-accent-teal" aria-hidden="true" />
          {dictionary.medications.heading}
        </h2>
        {canEdit && !addingNew && (
          <Button
            className="min-h-0 px-4 py-2 text-base"
            onClick={() => setAddingNew(true)}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            {dictionary.medications.addMedication}
          </Button>
        )}
      </div>

      {addingNew && (
        <div className="mt-4">
          <MedicationForm onDone={() => setAddingNew(false)} />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {medications.length === 0 && (
          <p className="text-lg text-muted">{dictionary.medications.noMedicationsYet}</p>
        )}
        {medications.map((med) => {
          const low = isRunningLow(med);
          const days = daysOfSupply(med);
          const isEditing = editingId === med.id;
          const isToppingUp = toppingUpId === med.id;
          const isUpdatingBalance = updatingBalanceId === med.id;

          if (isEditing) {
            return (
              <div
                key={med.id}
                className="rounded-lg border-2 border-primary p-4"
              >
                <MedicationForm
                  medication={med}
                  onDone={() => setEditingId(null)}
                />
              </div>
            );
          }

          return (
            <div
              key={med.id}
              className="flex flex-col gap-3 rounded-lg border-2 border-border p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold">{med.name}</p>
                  {med.dose_amount ? (
                    <p className="text-lg text-muted">
                      {dictionary.medications.perDose(
                        String(med.dose_amount),
                        med.frequency ? dictionary.enums.frequency[med.frequency] : "",
                      )}
                    </p>
                  ) : (
                    <p className="text-lg text-muted">{dictionary.medications.dosageNotSet}</p>
                  )}
                </div>
                {low && (
                  <Badge tone="warning">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                      {dictionary.medications.runningLow}
                    </span>
                  </Badge>
                )}
              </div>

              <p className="text-lg">
                {dictionary.medications.balanceLabel}{" "}
                <span className="font-semibold">
                  {formatBalance(med.current_balance)}
                </span>
                {days !== null && (
                  <span className="text-muted">
                    {" "}
                    ({dictionary.medications.daysLeft(Math.round(days))})
                  </span>
                )}
              </p>

              {canEdit && (
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    className="min-h-0 px-4 py-2 text-base"
                    onClick={() => setEditingId(med.id)}
                  >
                    <Pencil className="h-5 w-5" aria-hidden="true" />
                    {dictionary.common.edit}
                  </Button>
                  <Button
                    variant="secondary"
                    className="min-h-0 px-4 py-2 text-base"
                    onClick={() => setToppingUpId(isToppingUp ? null : med.id)}
                  >
                    <RefreshCw className="h-5 w-5" aria-hidden="true" />
                    {dictionary.medications.topUp}
                  </Button>
                  <Button
                    variant="secondary"
                    className="min-h-0 px-4 py-2 text-base"
                    onClick={() =>
                      setUpdatingBalanceId(isUpdatingBalance ? null : med.id)
                    }
                  >
                    <Hash className="h-5 w-5" aria-hidden="true" />
                    {dictionary.medications.updateBalance}
                  </Button>
                  <Button
                    variant="danger"
                    className="min-h-0 px-4 py-2 text-base"
                    onClick={() => {
                      setDeleteError("");
                      setRemovingId(med.id);
                    }}
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                    {dictionary.common.remove}
                  </Button>
                </div>
              )}

              {isToppingUp && (
                <TopUpForm
                  medicationId={med.id}
                  medicationName={med.name}
                  onDone={() => setToppingUpId(null)}
                />
              )}

              {isUpdatingBalance && (
                <UpdateBalanceForm
                  medicationId={med.id}
                  medicationName={med.name}
                  currentBalance={med.current_balance}
                  onDone={() => setUpdatingBalanceId(null)}
                />
              )}

              {removingId === med.id && (
                <div className="flex flex-col gap-3 rounded-lg border-2 border-danger bg-white p-3">
                  <p className="text-lg font-medium">
                    {dictionary.medications.removeConfirm(med.name)}
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
                      disabled={deletingId === med.id}
                      onClick={() => handleConfirmRemove(med.id, med.name)}
                    >
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                      {deletingId === med.id
                        ? dictionary.common.removing
                        : dictionary.common.yesRemove}
                    </Button>
                    <Button
                      variant="secondary"
                      className="min-h-0 px-4 py-2 text-base"
                      disabled={deletingId === med.id}
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
