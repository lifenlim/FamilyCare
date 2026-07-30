"use client";

import { FormEvent, useState } from "react";
import { Check, Coffee, Pencil, Sparkles, Utensils, X } from "lucide-react";
import { savePreferences } from "@/lib/actions/profile";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { InfoTile } from "@/components/ui/InfoTile";
import type { CircleProfile } from "@/lib/types";

export function PreferencesCard({
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
      await savePreferences(formData);
      setEditing(false);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "Could not save preferences.",
      );
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
          Personal preferences
        </h2>
        {canEdit && !editing && (
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

      {editing ? (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <Field label="Food preference" htmlFor="food-preference">
            <TextInput
              id="food-preference"
              name="food_preference"
              placeholder="e.g. Loves soup, avoids spicy food"
              defaultValue={profile.food_preference ?? ""}
            />
          </Field>
          <Field label="Drink preference" htmlFor="drink-preference">
            <TextInput
              id="drink-preference"
              name="drink_preference"
              placeholder="e.g. Warm tea, no coffee after noon"
              defaultValue={profile.drink_preference ?? ""}
            />
          </Field>
          <Field label="Hobbies & interests" htmlFor="hobbies-interests">
            <TextInput
              id="hobbies-interests"
              name="hobbies_interests"
              placeholder="e.g. Gardening, jigsaw puzzles"
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
              {status === "saving" ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
              <X className="h-5 w-5" aria-hidden="true" />
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <InfoTile
            icon={Utensils}
            label="Food preference"
            value={profile.food_preference ?? ""}
            tone="gold"
          />
          <InfoTile
            icon={Coffee}
            label="Drink preference"
            value={profile.drink_preference ?? ""}
            tone="teal"
          />
          <InfoTile
            icon={Sparkles}
            label="Hobbies & interests"
            value={profile.hobbies_interests ?? ""}
            tone="purple"
          />
        </div>
      )}
    </Card>
  );
}
