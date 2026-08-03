"use client";

import { FormEvent, useState } from "react";
import { Check, Phone, Pencil, User, Users, X } from "lucide-react";
import { saveEmergencyContact } from "@/lib/actions/profile";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { InfoTile } from "@/components/ui/InfoTile";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { CircleProfile } from "@/lib/types";

export function EmergencyContactCard({
  profile,
  canEdit,
}: {
  profile: CircleProfile;
  canEdit: boolean;
}) {
  const { dictionary } = useLocale();
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const formData = new FormData(e.currentTarget);
    try {
      await saveEmergencyContact(formData);
      setEditing(false);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : dictionary.emergencyContact.couldNotSave,
      );
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <Phone className="h-5 w-5 text-danger sm:h-6 sm:w-6" aria-hidden="true" />
          {dictionary.emergencyContact.heading}
        </h2>
        {canEdit && !editing && (
          <Button
            variant="secondary"
            className="min-h-0 px-4 py-2 text-base"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-5 w-5" aria-hidden="true" />
            {dictionary.common.edit}
          </Button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <Field
            label={dictionary.emergencyContact.contactNameLabel}
            htmlFor="emergency-name"
          >
            <TextInput
              id="emergency-name"
              name="emergency_contact_name"
              defaultValue={profile.emergency_contact_name ?? ""}
            />
          </Field>
          <Field label={dictionary.emergencyContact.phoneLabel} htmlFor="emergency-phone">
            <TextInput
              id="emergency-phone"
              name="emergency_contact_phone"
              type="tel"
              placeholder={dictionary.emergencyContact.phonePlaceholder}
              defaultValue={profile.emergency_contact_phone ?? ""}
            />
          </Field>
          <Field
            label={dictionary.emergencyContact.relationshipLabel}
            htmlFor="emergency-relationship"
          >
            <TextInput
              id="emergency-relationship"
              name="emergency_contact_relationship"
              placeholder={dictionary.emergencyContact.relationshipPlaceholder}
              defaultValue={profile.emergency_contact_relationship ?? ""}
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
              {status === "saving" ? dictionary.common.saving : dictionary.common.save}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
              <X className="h-5 w-5" aria-hidden="true" />
              {dictionary.common.cancel}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <InfoTile
            icon={User}
            label={dictionary.emergencyContact.contactNameLabel}
            value={profile.emergency_contact_name ?? ""}
            tone="warn"
          />
          <InfoTile
            icon={Phone}
            label={dictionary.emergencyContact.phoneLabel}
            value={profile.emergency_contact_phone ?? ""}
            tone="warn"
          />
          <InfoTile
            icon={Users}
            label={dictionary.emergencyContact.relationshipLabel}
            value={profile.emergency_contact_relationship ?? ""}
            tone="warn"
          />
        </div>
      )}
    </Card>
  );
}
