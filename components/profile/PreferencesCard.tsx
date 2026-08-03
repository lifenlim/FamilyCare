"use client";

import { FormEvent, useState } from "react";
import { Check, Coffee, Pencil, Sparkles, Utensils, X } from "lucide-react";
import { savePreferences } from "@/lib/actions/profile";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { InfoTile } from "@/components/ui/InfoTile";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { CircleProfile } from "@/lib/types";

export function PreferencesCard({
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
      await savePreferences(formData);
      setEditing(false);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : dictionary.preferences.couldNotSave,
      );
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <Sparkles className="h-5 w-5 text-primary sm:h-6 sm:w-6" aria-hidden="true" />
          {dictionary.preferences.heading}
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
          <Field label={dictionary.preferences.foodLabel} htmlFor="food-preference">
            <TextInput
              id="food-preference"
              name="food_preference"
              placeholder={dictionary.preferences.foodPlaceholder}
              defaultValue={profile.food_preference ?? ""}
            />
          </Field>
          <Field label={dictionary.preferences.drinkLabel} htmlFor="drink-preference">
            <TextInput
              id="drink-preference"
              name="drink_preference"
              placeholder={dictionary.preferences.drinkPlaceholder}
              defaultValue={profile.drink_preference ?? ""}
            />
          </Field>
          <Field label={dictionary.preferences.hobbiesLabel} htmlFor="hobbies-interests">
            <TextInput
              id="hobbies-interests"
              name="hobbies_interests"
              placeholder={dictionary.preferences.hobbiesPlaceholder}
              defaultValue={profile.hobbies_interests ?? ""}
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
            icon={Utensils}
            label={dictionary.preferences.foodLabel}
            value={profile.food_preference ?? ""}
            tone="gold"
          />
          <InfoTile
            icon={Coffee}
            label={dictionary.preferences.drinkLabel}
            value={profile.drink_preference ?? ""}
            tone="teal"
          />
          <InfoTile
            icon={Sparkles}
            label={dictionary.preferences.hobbiesLabel}
            value={profile.hobbies_interests ?? ""}
            tone="purple"
          />
        </div>
      )}
    </Card>
  );
}
