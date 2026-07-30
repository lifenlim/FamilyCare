import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ActivityLogEntry,
  Allergy,
  Appointment,
  CareTask,
  CircleContext,
  CircleInvite,
  CircleMember,
  CircleProfile,
  DoseChecklistEntry,
  Medication,
  MemberRole,
  TaskChecklistEntry,
} from "@/lib/types";

export async function getCircleContext(
  supabase: SupabaseClient,
): Promise<CircleContext> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: owned } = await supabase
    .from("care_circles")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (owned) {
    return { circleId: owned.id, circleName: owned.name, role: "owner" };
  }

  const { data: membership } = await supabase
    .from("care_circle_members")
    .select("circle_id, role, care_circles(name)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membership) {
    const circle = membership.care_circles as unknown as { name: string } | null;
    return {
      circleId: membership.circle_id,
      circleName: circle?.name ?? "Care Circle",
      role: membership.role as MemberRole,
    };
  }

  const { data: created, error } = await supabase
    .rpc("ensure_my_circle")
    .single();
  if (error || !created) {
    throw new Error(error?.message ?? "Could not set up your care circle.");
  }
  const circle = created as { id: string; name: string };
  return { circleId: circle.id, circleName: circle.name, role: "owner" };
}

export async function getCircleProfile(
  supabase: SupabaseClient,
  circleId: string,
): Promise<CircleProfile> {
  const { data, error } = await supabase
    .from("care_circles")
    .select(
      "id, name, patient_name, date_of_birth, gender, preferred_language, profile_notes, food_preference, drink_preference, hobbies_interests",
    )
    .eq("id", circleId)
    .single();
  if (error) throw error;
  return data as CircleProfile;
}

export async function getMedications(
  supabase: SupabaseClient,
  circleId: string,
): Promise<Medication[]> {
  const { data, error } = await supabase
    .from("medications_with_balance")
    .select("*")
    .eq("circle_id", circleId)
    .order("name");
  if (error) throw error;
  return (data ?? []) as Medication[];
}

export async function getAppointments(
  supabase: SupabaseClient,
  circleId: string,
): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("circle_id", circleId)
    .order("appointment_at");
  if (error) throw error;
  return (data ?? []) as Appointment[];
}

export async function getAllergies(
  supabase: SupabaseClient,
  circleId: string,
): Promise<Allergy[]> {
  const { data, error } = await supabase
    .from("allergies")
    .select("*")
    .eq("circle_id", circleId)
    .order("name");
  if (error) throw error;
  return (data ?? []) as Allergy[];
}

export async function getCareTasks(
  supabase: SupabaseClient,
  circleId: string,
): Promise<CareTask[]> {
  const { data, error } = await supabase
    .from("care_tasks")
    .select("*")
    .eq("circle_id", circleId)
    .order("name");
  if (error) throw error;
  return (data ?? []) as CareTask[];
}

export async function getTodayChecklist(
  supabase: SupabaseClient,
  medicationIds: string[],
): Promise<DoseChecklistEntry[]> {
  if (medicationIds.length === 0) return [];
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("dose_checklist")
    .select("*")
    .in("medication_id", medicationIds)
    .eq("checklist_date", today);
  if (error) throw error;
  return (data ?? []) as DoseChecklistEntry[];
}

export async function getTodayTaskChecklist(
  supabase: SupabaseClient,
  taskIds: string[],
): Promise<TaskChecklistEntry[]> {
  if (taskIds.length === 0) return [];
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("task_checklist")
    .select("*")
    .in("task_id", taskIds)
    .eq("checklist_date", today);
  if (error) throw error;
  return (data ?? []) as TaskChecklistEntry[];
}

export async function getCircleOwner(
  supabase: SupabaseClient,
  circleId: string,
): Promise<{ id: string; email: string | null }> {
  const { data, error } = await supabase
    .from("care_circles")
    .select("owner_id, profiles(email)")
    .eq("id", circleId)
    .single();
  if (error) throw error;
  const profile = data.profiles as unknown as { email: string | null } | null;
  return { id: data.owner_id as string, email: profile?.email ?? null };
}

export async function getMembers(
  supabase: SupabaseClient,
  circleId: string,
): Promise<CircleMember[]> {
  const { data, error } = await supabase
    .from("care_circle_members")
    .select("*, profiles(email)")
    .eq("circle_id", circleId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map((m) => ({
    ...m,
    email: (m as unknown as { profiles: { email: string | null } | null }).profiles
      ?.email ?? null,
  })) as CircleMember[];
}

export async function getPendingInvites(
  supabase: SupabaseClient,
  circleId: string,
): Promise<CircleInvite[]> {
  const { data, error } = await supabase
    .from("care_circle_invites")
    .select("*")
    .eq("circle_id", circleId)
    .is("revoked_at", null)
    .is("accepted_by", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CircleInvite[];
}

export async function getActivityLog(
  supabase: SupabaseClient,
  circleId: string,
  limit = 40,
): Promise<ActivityLogEntry[]> {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*, profiles(email)")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((a) => ({
    ...a,
    email: (a as unknown as { profiles: { email: string | null } | null }).profiles
      ?.email ?? null,
  })) as ActivityLogEntry[];
}
