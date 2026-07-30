"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getCircleContext } from "@/lib/supabase/queries";
import type { CircleContext } from "@/lib/types";

async function requireEditor(): Promise<{
  supabase: SupabaseClient;
  ctx: CircleContext;
}> {
  const supabase = await createClient();
  const ctx = await getCircleContext(supabase);
  if (ctx.role === "viewer") {
    throw new Error("Family members can view the care list but not edit it.");
  }
  return { supabase, ctx };
}

async function logEdit(
  supabase: SupabaseClient,
  circleId: string,
  action: string,
  entityType: string,
  entityId: string,
  detail: string,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("activity_log").insert({
    circle_id: circleId,
    user_id: user.id,
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
  const { supabase, ctx } = await requireEditor();
  const id = (formData.get("id") as string) || null;
  const name = (formData.get("name") as string).trim();
  if (!name) throw new Error("Medication name is required.");
  const dosageRaw = (formData.get("dose_amount") as string) ?? "";
  if (dosageRaw.trim() === "") throw new Error("Per-dosage amount is required.");
  const dose_amount = Number(dosageRaw);
  const frequency = ((formData.get("frequency") as string) || "").trim();
  if (!frequency) throw new Error("Please choose how often it's taken.");
  const notes = ((formData.get("notes") as string) || "").trim() || null;

  if (id) {
    const { error } = await supabase
      .from("medications")
      .update({ name, dose_amount, frequency, notes })
      .eq("id", id);
    if (error) throw error;
    await logEdit(supabase, ctx.circleId, "updated_medication", "medications", id, name);
  } else {
    const initialBalanceRaw = (formData.get("initial_balance") as string) ?? "";
    if (initialBalanceRaw.trim() === "") {
      throw new Error("Current medication balance is required.");
    }
    const initialBalance = Number(initialBalanceRaw);
    const { data, error } = await supabase
      .from("medications")
      .insert({
        circle_id: ctx.circleId,
        name,
        dose_amount,
        frequency,
        notes,
        last_refill_balance: initialBalance,
        last_refill_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw error;
    await logEdit(
      supabase,
      ctx.circleId,
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
  const { supabase, ctx } = await requireEditor();
  const { error } = await supabase
    .from("medications")
    .delete()
    .eq("id", medicationId);
  if (error) throw error;
  await logEdit(
    supabase,
    ctx.circleId,
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
  const { supabase, ctx } = await requireEditor();
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter a top-up amount greater than zero.");
  }

  const { data: med, error: fetchErr } = await supabase
    .from("medications_with_balance")
    .select("current_balance")
    .eq("id", medicationId)
    .single();
  if (fetchErr) throw fetchErr;

  const newBalance = Number(med.current_balance ?? 0) + amount;
  const { error } = await supabase
    .from("medications")
    .update({
      last_refill_balance: newBalance,
      last_refill_at: new Date().toISOString(),
    })
    .eq("id", medicationId);
  if (error) throw error;
  await logEdit(
    supabase,
    ctx.circleId,
    "topped_up_medication",
    "medications",
    medicationId,
    medicationName,
  );
  revalidateCareList();
}

export async function saveAppointment(formData: FormData): Promise<void> {
  const { supabase, ctx } = await requireEditor();
  const id = (formData.get("id") as string) || null;
  const title = (formData.get("title") as string).trim();
  if (!title) throw new Error("Appointment title is required.");
  const appointment_at = formData.get("appointment_at") as string;
  if (!appointment_at) throw new Error("Appointment date and time is required.");
  const location = ((formData.get("location") as string) || "").trim() || null;
  const notes = ((formData.get("notes") as string) || "").trim() || null;

  if (id) {
    const { error } = await supabase
      .from("appointments")
      .update({ title, appointment_at, location, notes })
      .eq("id", id);
    if (error) throw error;
    await logEdit(supabase, ctx.circleId, "updated_appointment", "appointments", id, title);
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
  const { supabase, ctx } = await requireEditor();
  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", appointmentId);
  if (error) throw error;
  await logEdit(
    supabase,
    ctx.circleId,
    "deleted_appointment",
    "appointments",
    appointmentId,
    title,
  );
  revalidateCareList();
}

export async function saveAllergy(formData: FormData): Promise<void> {
  const { supabase, ctx } = await requireEditor();
  const id = (formData.get("id") as string) || null;
  const name = (formData.get("name") as string).trim();
  if (!name) throw new Error("Allergy name is required.");
  const severity = ((formData.get("severity") as string) || "").trim() || null;
  const notes = ((formData.get("notes") as string) || "").trim() || null;

  if (id) {
    const { error } = await supabase
      .from("allergies")
      .update({ name, severity, notes })
      .eq("id", id);
    if (error) throw error;
    await logEdit(supabase, ctx.circleId, "updated_allergy", "allergies", id, name);
  } else {
    const { data, error } = await supabase
      .from("allergies")
      .insert({ circle_id: ctx.circleId, name, severity, notes })
      .select("id")
      .single();
    if (error) throw error;
    await logEdit(supabase, ctx.circleId, "created_allergy", "allergies", data.id, name);
  }
  revalidateCareList();
}

export async function deleteAllergy(
  allergyId: string,
  name: string,
): Promise<void> {
  const { supabase, ctx } = await requireEditor();
  const { error } = await supabase.from("allergies").delete().eq("id", allergyId);
  if (error) throw error;
  await logEdit(supabase, ctx.circleId, "deleted_allergy", "allergies", allergyId, name);
  revalidateCareList();
}

export async function saveCareTask(formData: FormData): Promise<void> {
  const { supabase, ctx } = await requireEditor();
  const id = (formData.get("id") as string) || null;
  const name = (formData.get("name") as string).trim();
  if (!name) throw new Error("Task name is required.");

  const scheduleType = (formData.get("schedule_type") as string) || "";
  if (scheduleType !== "ongoing" && scheduleType !== "one_time") {
    throw new Error("Please choose Recurring or One Time.");
  }

  let recurrence: string | null = null;
  let scheduledAt: string | null = null;

  if (scheduleType === "ongoing") {
    recurrence = ((formData.get("recurrence") as string) || "").trim();
    if (!recurrence) throw new Error("Please choose how often this repeats.");
  } else {
    // TaskForm already converts the local datetime-local value to ISO
    // before calling this action, same as AppointmentForm does.
    scheduledAt = (formData.get("scheduled_at") as string) || "";
    if (!scheduledAt) throw new Error("Please choose the date and time.");
  }

  const status = ((formData.get("status") as string) || "active").trim();
  const notes = ((formData.get("notes") as string) || "").trim() || null;

  const payload = {
    name,
    schedule_type: scheduleType,
    recurrence,
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
    await logEdit(supabase, ctx.circleId, "updated_task", "care_tasks", id, name);
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
  const { supabase, ctx } = await requireEditor();
  const { error } = await supabase.from("care_tasks").delete().eq("id", taskId);
  if (error) throw error;
  await logEdit(supabase, ctx.circleId, "deleted_task", "care_tasks", taskId, name);
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
  if (!user) throw new Error("Not signed in");

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
  if (!user) throw new Error("Not signed in");

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
