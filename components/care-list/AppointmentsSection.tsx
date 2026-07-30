"use client";

import { useState } from "react";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AppointmentForm } from "./AppointmentForm";
import { deleteAppointment } from "@/lib/actions/care-list";
import type { Appointment } from "@/lib/types";

function formatAppointmentDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AppointmentsSection({
  appointments,
  canEdit,
}: {
  appointments: Appointment[];
  canEdit: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  async function handleConfirmRemove(id: string, title: string) {
    setDeletingId(id);
    setDeleteError("");
    try {
      await deleteAppointment(id, title);
      setRemovingId(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Could not remove appointment.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card className="border-l-4 border-l-accent-blue">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <CalendarDays className="h-6 w-6 text-accent-blue" aria-hidden="true" />
          Appointments
        </h2>
        {canEdit && !addingNew && (
          <Button
            className="min-h-0 px-4 py-2 text-base"
            onClick={() => setAddingNew(true)}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            Add appointment
          </Button>
        )}
      </div>

      {addingNew && (
        <div className="mt-4">
          <AppointmentForm onDone={() => setAddingNew(false)} />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {appointments.length === 0 && (
          <p className="text-lg text-muted">No appointments added yet.</p>
        )}
        {appointments.map((appt) => {
          if (editingId === appt.id) {
            return (
              <div
                key={appt.id}
                className="rounded-lg border-2 border-primary p-4"
              >
                <AppointmentForm
                  appointment={appt}
                  onDone={() => setEditingId(null)}
                />
              </div>
            );
          }
          return (
            <div
              key={appt.id}
              className="flex flex-col gap-3 rounded-lg border-2 border-border p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold">{appt.title}</p>
                  <p className="text-lg text-muted">
                    {formatAppointmentDate(appt.appointment_at)}
                  </p>
                  {appt.location && (
                    <p className="text-lg text-muted">{appt.location}</p>
                  )}
                </div>
                {canEdit && (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      className="min-h-0 px-4 py-2 text-base"
                      onClick={() => setEditingId(appt.id)}
                    >
                      <Pencil className="h-5 w-5" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      className="min-h-0 px-4 py-2 text-base"
                      onClick={() => {
                        setDeleteError("");
                        setRemovingId(appt.id);
                      }}
                    >
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {removingId === appt.id && (
                <div className="flex flex-col gap-3 rounded-lg border-2 border-danger bg-white p-3">
                  <p className="text-lg font-medium">
                    Remove {appt.title}? This can&apos;t be undone.
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
                      disabled={deletingId === appt.id}
                      onClick={() => handleConfirmRemove(appt.id, appt.title)}
                    >
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                      {deletingId === appt.id ? "Removing..." : "Yes, remove"}
                    </Button>
                    <Button
                      variant="secondary"
                      className="min-h-0 px-4 py-2 text-base"
                      disabled={deletingId === appt.id}
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
