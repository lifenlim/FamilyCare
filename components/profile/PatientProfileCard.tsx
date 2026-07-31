"use client";

import { FormEvent, useState } from "react";
import { Check, FileText, Languages, Pencil, User, UsersRound, X } from "lucide-react";
import { savePatientProfile } from "@/lib/actions/profile";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { InfoTile } from "@/components/ui/InfoTile";
import { calculateAge, GENDER_LABEL, type CircleProfile } from "@/lib/types";

function formatDob(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PatientProfileCard({
  profile,
  canEdit,
}: {
  profile: CircleProfile;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const formData = new FormData(e.currentTarget);
    try {
      await savePatientProfile(formData);
      setEditing(false);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not save profile.");
    }
  }

  const dobAge = profile.date_of_birth
    ? `${formatDob(profile.date_of_birth)} · ${calculateAge(profile.date_of_birth)} yrs`
    : "";

  return (
    <Card>
      {!editing && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold sm:text-2xl">Recipient profile</h2>
          {canEdit && (
            <Button
              variant="secondary"
              className="min-h-0 px-4 py-2 text-base"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-5 w-5" aria-hidden="true" />
              Edit
            </Button>
          )}
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Full name" htmlFor="patient-name">
            <TextInput
              id="patient-name"
              name="patient_name"
              defaultValue={profile.patient_name ?? ""}
            />
          </Field>
          <Field label="Date of birth" htmlFor="patient-dob">
            <TextInput
              id="patient-dob"
              name="date_of_birth"
              type="date"
              defaultValue={profile.date_of_birth ?? ""}
            />
          </Field>
          <Field label="Gender" htmlFor="patient-gender">
            <Select
              id="patient-gender"
              name="gender"
              defaultValue={profile.gender ?? ""}
            >
              <option value="">Not set</option>
              {Object.entries(GENDER_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Preferred language" htmlFor="patient-language">
            <TextInput
              id="patient-language"
              name="preferred_language"
              defaultValue={profile.preferred_language ?? ""}
            />
          </Field>
          <Field label="Notes" htmlFor="patient-notes">
            <TextArea
              id="patient-notes"
              name="profile_notes"
              defaultValue={profile.profile_notes ?? ""}
            />
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
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
              <X className="h-5 w-5" aria-hidden="true" />
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl border-2 border-primary bg-primary/5 p-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm"
              aria-hidden="true"
            >
              <User className="h-6 w-6" />
            </span>
            <div>
              <p className="text-lg font-bold sm:text-xl">
                {profile.patient_name || "Not set"}
              </p>
              {dobAge && <p className="text-base text-muted">{dobAge}</p>}
            </div>
          </div>

          <InfoTile
            icon={UsersRound}
            label="Gender"
            value={profile.gender ? GENDER_LABEL[profile.gender] : ""}
            tone="purple"
          />
          <InfoTile
            icon={Languages}
            label="Preferred language"
            value={profile.preferred_language ?? ""}
            tone="blue"
          />
          <InfoTile
            icon={FileText}
            label="Notes"
            value={profile.profile_notes ?? ""}
            tone="gold"
          />
        </div>
      )}
    </Card>
  );
}
