"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCircleContext } from "@/lib/supabase/queries";
import { getDictionary } from "@/lib/i18n/getDictionary";

async function requireEditor() {
  const supabase = await createClient();
  const [ctx, dictionary] = await Promise.all([
    getCircleContext(supabase),
    getDictionary(),
  ]);
  if (ctx.role === "viewer") {
    throw new Error(dictionary.common.viewerReadOnlyProfile);
  }
  return { supabase, ctx };
}

export async function savePatientProfile(formData: FormData): Promise<void> {
  const { supabase, ctx } = await requireEditor();

  const patient_name = ((formData.get("patient_name") as string) || "").trim() || null;
  const date_of_birth = ((formData.get("date_of_birth") as string) || "").trim() || null;
  const gender = ((formData.get("gender") as string) || "").trim() || null;
  const preferred_language =
    ((formData.get("preferred_language") as string) || "").trim() || null;
  const profile_notes = ((formData.get("profile_notes") as string) || "").trim() || null;

  const { error } = await supabase
    .from("care_circles")
    .update({ patient_name, date_of_birth, gender, preferred_language, profile_notes })
    .eq("id", ctx.circleId);
  if (error) throw error;

  revalidatePath("/profile");
  revalidatePath("/for-you");
}

export async function savePreferences(formData: FormData): Promise<void> {
  const { supabase, ctx } = await requireEditor();

  const food_preference = ((formData.get("food_preference") as string) || "").trim() || null;
  const drink_preference =
    ((formData.get("drink_preference") as string) || "").trim() || null;
  const hobbies_interests =
    ((formData.get("hobbies_interests") as string) || "").trim() || null;

  const { error } = await supabase
    .from("care_circles")
    .update({ food_preference, drink_preference, hobbies_interests })
    .eq("id", ctx.circleId);
  if (error) throw error;

  revalidatePath("/profile");
}

export async function saveEmergencyContact(formData: FormData): Promise<void> {
  const { supabase, ctx } = await requireEditor();

  const emergency_contact_name =
    ((formData.get("emergency_contact_name") as string) || "").trim() || null;
  const emergency_contact_phone =
    ((formData.get("emergency_contact_phone") as string) || "").trim() || null;
  const emergency_contact_relationship =
    ((formData.get("emergency_contact_relationship") as string) || "").trim() || null;

  const { error } = await supabase
    .from("care_circles")
    .update({
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
    })
    .eq("id", ctx.circleId);
  if (error) throw error;

  revalidatePath("/profile");
}
