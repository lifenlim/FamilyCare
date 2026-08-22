"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getCircleContext } from "@/lib/supabase/queries";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { CircleContext } from "@/lib/types";

async function requireEditor(): Promise<{
  supabase: SupabaseClient;
  ctx: CircleContext;
  dictionary: Dictionary;
  userId: string;
}> {
  const supabase = await createClient();
  const [ctx, dictionary, { data: { user } }] = await Promise.all([
    getCircleContext(supabase),
    getDictionary(),
    supabase.auth.getUser(),
  ]);
  if (ctx.role === "viewer") {
    throw new Error(dictionary.common.viewerReadOnlyCareInfo);
  }
  if (!user) {
    throw new Error(dictionary.common.notSignedIn);
  }
  return { supabase, ctx, dictionary, userId: user.id };
}

function logEdit(
  supabase: SupabaseClient,
  circleId: string,
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  detail: string,
) {
  return supabase.from("activity_log").insert({
    circle_id: circleId,
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    detail,
  });
}

function revalidateCareList() {
  revalidatePath("/for-you");
}

export async function saveMedication(formData: FormData): Promise<void> {
  const { supabase, ctx, dictionary, userId } = await requireEditor();
  const id = (formData.get("id") as string) || null;
  const name = (formData.get("name") as string).trim();
  if (!name) throw new Error(dictionary.medications.nameRequired);
  const dosageRaw = (formData.get("dose_amount") as string) ?? "";
  if (dosageRaw.trim() === "") throw new Error(dictionary.medications.dosageRequired);
  const dose_amount = Number(dosageRaw);
  const frequency = ((formData.get("frequency") as string) || "").trim();
  if (!frequency) throw new Error(dictionary.medications.frequencyRequired);
  const notes = ((formData.get("notes") as string) || "").trim() || null;

  const balanceRaw = (formData.get("balance") as string) ?? "";
  if (balanceRaw.trim() === "") throw new Error(dictionary.medications.balanceRequired);
  const balance = Number(balanceRaw);
  if (!Number.isFinite(balance) || balance < 0) {
    throw new Error(dictionary.medications.updateBalanceInvalid);
  }

  if (id) {
    // Changing the balance here resets the depletion anchor the same way
    // Top Up does -- harmless if the field was left untouched (resetting
    // last_refill_at to now() with the same balance value doesn't change
    // anything observable), and correctly re-arms the countdown when it
    // was actually edited.
    const { error } = await supabase
      .from("medications")
      .update({
        name,
        dose_amount,
        frequency,
        notes,
        last_refill_balance: Math.round(balance),
        last_refill_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
    await logEdit(supabase, ctx.circleId, userId, "updated_medication", "medications", id, name);
  } else {
    const { data, error } = await supabase
      .from("medications")
      .insert({
        circle_id: ctx.circleId,
        name,
        dose_amount,
        frequency,
        notes,
        last_refill_balance: Math.round(balance),
        last_refill_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw error;
    await logEdit(
      supabase,
      ctx.circleId,
      userId,
      "created_medication",
      "medications",
      data.id,
      name,
    );
  }
  revalidateCareList();
}

export async function deleteMedication(
  medicationId: string,
  medicationName: string,
): Promise<void> {
  const { supabase, ctx, userId } = await requireEditor();
  const { error } = await supabase
    .from("medications")
    .delete()
    .eq("id", medicationId);
  if (error) throw error;
  await logEdit(
    supabase,
    ctx.circleId,
    userId,
    "deleted_medication",
    "medications",
    medicationId,
    medicationName,
  );
  revalidateCareList();
}

export async function topUpMedication(
  medicationId: string,
  amount: number,
  medicationName: string,
): Promise<void> {
  const { supabase, ctx, dictionary, userId } = await requireEditor();
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(dictionary.medications.topUpAmountInvalid);
  }

  const { data: med, error: fetchErr } = await supabase
    .from("medications_with_balance")
    .select("current_balance")
    .eq("id", medicationId)
    .single();
  if (fetchErr) throw fetchErr;

  // Round rather than carry forward whatever fractional remainder
  // current_balance happens to have -- last_refill_balance tracks a
  // physical count of units, which should stay a whole number.
  const newBalance = Math.round(Number(med.current_balance ?? 0) + amount);
  const { error } = await supabase
    .from("medications")
    .update({
      last_refill_balance: newBalance,
      last_refill_at: new Date().toISOString(),
    })
    .eq("id", medicationId);
  if (error) throw error;

  // A trigger clears the medication_zero dedup record on this update --
  // see supabase/migrations/0018_auto_clear_critical_alerts.sql.

  await logEdit(
    supabase,
    ctx.circleId,
    userId,
    "topped_up_medication",
    "medications",
    medicationId,
    medicationName,
  );
  revalidateCareList();
}

export async function saveAppointment(formData: FormData): Promise<void> {
  const { supabase, ctx, dictionary, userId } = await requireEditor();
  const id = (formData.get("id") as string) || null;
  const title = (formData.get("title") as string).trim();
  if (!title) throw new Error(dictionary.appointments.titleRequired);
  const appointment_at = formData.get("appointment_at") as string;
  if (!appointment_at) throw new Error(dictionary.appointments.dateTimeRequired);
  const location = ((formData.get("location") as string) || "").trim() || null;
  const notes = ((formData.get("notes") as string) || "").trim() || null;

  if (id) {
    const { error } = await supabase
      .from("appointments")
      .update({ title, appointment_at, location, notes })
      .eq("id", id);
    if (error) throw error;

    // A trigger clears the appointment_today dedup record when the date
    // actually changes -- see 0018_auto_clear_critical_alerts.sql.

    await logEdit(supabase, ctx.circleId, userId, "updated_appointment", "appointments", id, title);
  } else {
    const { data, error } = await supabase
      .from("appointments")
      .insert({ circle_id: ctx.circleId, title, appointment_at, location, notes })
      .select("id")
      .single();
    if (error) throw error;
    await logEdit(
      supabase,
      ctx.circleId,
      userId,
      "created_appointment",
      "appointments",
      data.id,
      title,
    );
  }
  revalidateCareList();
}

export async function deleteAppointment(
  appointmentId: string,
  title: string,
): Promise<void> {
  const { supabase, ctx, userId } = await requireEditor();
  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", appointmentId);
  if (error) throw error;
  await logEdit(
    supabase,
    ctx.circleId,
    userId,
    "deleted_appointment",
    "appointments",
    appointmentId,
    title,
  );
  revalidateCareList();
}

export async function saveAllergy(formData: FormData): Promise<void> {
  const { supabase, ctx, dictionary, userId } = await requireEditor();
  const id = (formData.get("id") as string) || null;
  const name = (formData.get("name") as string).trim();
  if (!name) throw new Error(dictionary.allergies.nameRequired);
  const severity = ((formData.get("severity") as string) || "").trim() || null;
  const notes = ((formData.get("notes") as string) || "").trim() || null;

  if (id) {
    const { error } = await supabase
      .from("allergies")
      .update({ name, severity, notes })
      .eq("id", id);
    if (error) throw error;
    await logEdit(supabase, ctx.circleId, userId, "updated_allergy", "allergies", id, name);
  } else {
    const { data, error } = await supabase
      .from("allergies")
      .insert({ circle_id: ctx.circleId, name, severity, notes })
      .select("id")
      .single();
    if (error) throw error;
    await logEdit(supabase, ctx.circleId, userId, "created_allergy", "allergies", data.id, name);
  }
  revalidateCareList();
}

export async function deleteAllergy(
  allergyId: string,
  name: string,
): Promise<void> {
  const { supabase, ctx, userId } = await requireEditor();
  const { error } = await supabase.from("allergies").delete().eq("id", allergyId);
  if (error) throw error;
  await logEdit(supabase, ctx.circleId, userId, "deleted_allergy", "allergies", allergyId, name);
  revalidateCareList();
}

export async function saveCareTask(formData: FormData): Promise<void> {
  const { supabase, ctx, dictionary, userId } = await requireEditor();
  const id = (formData.get("id") as string) || null;
  const name = (formData.get("name") as string).trim();
  if (!name) throw new Error(dictionary.tasks.nameRequired);

  const scheduleType = (formData.get("schedule_type") as string) || "";
  if (scheduleType !== "ongoing" && scheduleType !== "one_time") {
    throw new Error(dictionary.tasks.scheduleTypeRequired);
  }

  let recurrence: string | null = null;
  let recurrenceDayOfWeek: number | null = null;
  let scheduledAt: string | null = null;

  if (scheduleType === "ongoing") {
    recurrence = ((formData.get("recurrence") as string) || "").trim();
    if (!recurrence) throw new Error(dictionary.tasks.recurrenceRequired);
    if (recurrence === "weekly") {
      const dayRaw = (formData.get("recurrence_day_of_week") as string) || "";
      if (dayRaw === "") throw new Error(dictionary.tasks.dayOfWeekRequired);
      recurrenceDayOfWeek = Number(dayRaw);
    }
  } else {
    // TaskForm already converts the local datetime-local value to ISO
    // before calling this action, same as AppointmentForm does.
    scheduledAt = (formData.get("scheduled_at") as string) || "";
    if (!scheduledAt) throw new Error(dictionary.tasks.dateTimeRequired);
  }

  const status = ((formData.get("status") as string) || "active").trim();
  const notes = ((formData.get("notes") as string) || "").trim() || null;

  const payload = {
    name,
    schedule_type: scheduleType,
    recurrence,
    recurrence_day_of_week: recurrenceDayOfWeek,
    scheduled_at: scheduledAt,
    status,
    notes,
  };

  if (id) {
    const { error } = await supabase
      .from("care_tasks")
      .update(payload)
      .eq("id", id);
    if (error) throw error;
    await logEdit(supabase, ctx.circleId, userId, "updated_task", "care_tasks", id, name);
  } else {
    const { data, error } = await supabase
      .from("care_tasks")
      .insert({ circle_id: ctx.circleId, ...payload })
      .select("id")
      .single();
    if (error) throw error;
    await logEdit(
      supabase,
      ctx.circleId,
      userId,
      "created_task",
      "care_tasks",
      data.id,
      name,
    );
  }
  revalidateCareList();
}

export async function deleteCareTask(
  taskId: string,
  name: string,
): Promise<void> {
  const { supabase, ctx, userId } = await requireEditor();
  const { error } = await supabase.from("care_tasks").delete().eq("id", taskId);
  if (error) throw error;
  await logEdit(supabase, ctx.circleId, userId, "deleted_task", "care_tasks", taskId, name);
  revalidateCareList();
}

export async function toggleChecklist(
  medicationId: string,
  taken: boolean,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error((await getDictionary()).common.notSignedIn);

  const today = new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from("dose_checklist").upsert(
    {
      medication_id: medicationId,
      checklist_date: today,
      taken,
      taken_by: user.id,
      taken_at: taken ? new Date().toISOString() : null,
    },
    { onConflict: "medication_id,checklist_date" },
  );
  if (error) throw error;
  revalidateCareList();
}

export async function toggleTaskChecklist(
  taskId: string,
  done: boolean,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error((await getDictionary()).common.notSignedIn);

  const today = new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from("task_checklist").upsert(
    {
      task_id: taskId,
      checklist_date: today,
      done,
      done_by: user.id,
      done_at: done ? new Date().toISOString() : null,
    },
    { onConflict: "task_id,checklist_date" },
  );
  if (error) throw error;
  revalidateCareList();
}
