"use client";

import { useState } from "react";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AllergyForm } from "./AllergyForm";
import { deleteAllergy } from "@/lib/actions/care-list";
import { SEVERITY_LABEL, type AllergySeverity, type Allergy } from "@/lib/types";

const SEVERITY_TONE: Record<AllergySeverity, "success" | "warning" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

export function AllergiesSection({
  allergies,
  canEdit,
}: {
  allergies: Allergy[];
  canEdit: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  async function handleConfirmRemove(id: string, name: string) {
    setDeletingId(id);
    setDeleteError("");
    try {
      await deleteAllergy(id, name);
      setRemovingId(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Could not remove allergy.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <AlertTriangle className="h-5 w-5 text-primary sm:h-6 sm:w-6" aria-hidden="true" />
          Allergies
        </h2>
        {canEdit && !addingNew && (
          <Button
            className="min-h-0 px-4 py-2 text-base"
            onClick={() => setAddingNew(true)}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            Add allergy
          </Button>
        )}
      </div>

      {addingNew && (
        <div className="mt-4">
          <AllergyForm onDone={() => setAddingNew(false)} />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {allergies.length === 0 && (
          <p className="text-lg text-muted">No allergies recorded.</p>
        )}
        {allergies.map((a) => {
          if (editingId === a.id) {
            return (
              <div
                key={a.id}
                className="rounded-lg border-2 border-primary p-4"
              >
                <AllergyForm allergy={a} onDone={() => setEditingId(null)} />
              </div>
            );
          }
          return (
            <div
              key={a.id}
              className="flex flex-col gap-3 rounded-lg border-2 border-border p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold sm:text-xl">{a.name}</p>
                  {a.severity && (
                    <Badge tone={SEVERITY_TONE[a.severity]}>
                      {SEVERITY_LABEL[a.severity]}
                    </Badge>
                  )}
                  {a.notes && (
                    <p className="mt-1 text-lg text-muted">{a.notes}</p>
                  )}
                </div>
                {canEdit && (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      className="min-h-0 px-4 py-2 text-base"
                      onClick={() => setEditingId(a.id)}
                    >
                      <Pencil className="h-5 w-5" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      className="min-h-0 px-4 py-2 text-base"
                      onClick={() => {
                        setDeleteError("");
                        setRemovingId(a.id);
                      }}
                    >
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {removingId === a.id && (
                <div className="flex flex-col gap-3 rounded-lg border-2 border-danger bg-white p-3">
                  <p className="text-lg font-medium">
                    Remove {a.name}? This can&apos;t be undone.
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
                      disabled={deletingId === a.id}
                      onClick={() => handleConfirmRemove(a.id, a.name)}
                    >
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                      {deletingId === a.id ? "Removing..." : "Yes, remove"}
                    </Button>
                    <Button
                      variant="secondary"
                      className="min-h-0 px-4 py-2 text-base"
                      disabled={deletingId === a.id}
                      onClick={() => setRemovingId(null)}
                    >
                      Cancel
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
