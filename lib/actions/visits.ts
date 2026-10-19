"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCircleContext } from "@/lib/supabase/queries";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isDateString } from "@/lib/visits";

// These return { error } instead of throwing: Next redacts thrown messages in
// production, which would hide the validation text from the user.
//
// Unlike the care-list actions, there is no editor gate: family members
// (viewers) are the main visitors, so any circle member can post a visit.
// Row-level security decides who may change an existing one -- the author, or
// the owner/caretakers.
export async function saveVisit(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const [ctx, dictionary, { data: { user } }] = await Promise.all([
    getCircleContext(supabase),
    getDictionary(),
    supabase.auth.getUser(),
  ]);
  if (!user) return { error: dictionary.common.notSignedIn };

  const id = (formData.get("id") as string) || null;
  const visit_date = ((formData.get("visit_date") as string) || "").trim();
  if (!isDateString(visit_date)) return { error: dictionary.visits.dateRequired };
  const start_time = ((formData.get("start_time") as string) || "").trim();
  const end_time = ((formData.get("end_time") as string) || "").trim();
  if (!start_time || !end_time) return { error: dictionary.visits.timeRequired };
  // Same-format "HH:MM" strings compare correctly as text.
  if (end_time <= start_time) return { error: dictionary.visits.endAfterStart };
  const note = ((formData.get("note") as string) || "").trim() || null;

  if (id) {
    // RLS silently filters out rows the user may not change, so ask for the
    // updated row back to tell "saved" apart from "not allowed".
    const { data, error } = await supabase
      .from("visits")
      .update({ visit_date, start_time, end_time, note })
      .eq("id", id)
      .eq("circle_id", ctx.circleId)
      .select("id");
    if (error) return { error: dictionary.visits.couldNotSave };
    if (!data || data.length === 0) return { error: dictionary.visits.notAllowed };
  } else {
    const { error } = await supabase.from("visits").insert({
      circle_id: ctx.circleId,
      user_id: user.id,
      visit_date,
      start_time,
      end_time,
      note,
    });
    if (error) return { error: dictionary.visits.couldNotSave };
  }
  revalidatePath("/visits");
  return {};
}

export async function deleteVisit(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const [ctx, dictionary] = await Promise.all([
    getCircleContext(supabase),
    getDictionary(),
  ]);
  const { data, error } = await supabase
    .from("visits")
    .delete()
    .eq("id", id)
    .eq("circle_id", ctx.circleId)
    .select("id");
  if (error) return { error: dictionary.visits.couldNotRemove };
  if (!data || data.length === 0) return { error: dictionary.visits.notAllowed };
  revalidatePath("/visits");
  return {};
}
