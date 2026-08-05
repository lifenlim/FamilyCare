import { cookies } from "next/headers";
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
  UserCircleOption,
} from "@/lib/types";

export const ACTIVE_CIRCLE_COOKIE = "active_circle_id";

// Every circle a user can access -- the one they own (a user owns at most
// one, enforced by a unique constraint) plus any they've been invited into
// and accepted. Used to populate the circle switcher and to validate a
// requested active-circle switch.
export async function listUserCircles(
  supabase: SupabaseClient,
): Promise<UserCircleOption[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: owned }, { data: memberships }] = await Promise.all([
    supabase
      .from("care_circles")
      .select("id, name, patient_name")
      .eq("owner_id", user.id),
    supabase
      .from("care_circle_members")
      .select("circle_id, role, care_circles(name, patient_name)")
      .eq("user_id", user.id),
  ]);

  const circles: UserCircleOption[] = (owned ?? []).map((c) => ({
    circleId: c.id,
    circleName: c.name,
    patientName: c.patient_name,
    role: "owner" as const,
  }));

  for (const m of memberships ?? []) {
    const circle = m.care_circles as unknown as {
      name: string;
      patient_name: string | null;
    } | null;
    circles.push({
      circleId: m.circle_id,
      circleName: circle?.name ?? "Family Care",
      patientName: circle?.patient_name ?? null,
      role: m.role as MemberRole,
    });
  }

  return circles;
}

export async function getCircleContext(
  supabase: SupabaseClient,
): Promise<CircleContext> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const circles = await listUserCircles(supabase);

  if (circles.length > 0) {
    const cookieStore = await cookies();
    const activeId = cookieStore.get(ACTIVE_CIRCLE_COOKIE)?.value;
    const chosen =
      circles.find((c) => c.circleId === activeId) ??
      circles.find((c) => c.role === "owner") ??
      circles[0];
    return { circleId: chosen.circleId, circleName: chosen.circleName, role: chosen.role };
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
      "id, name, patient_name, date_of_birth, gender, preferred_language, profile_notes, food_preference, drink_preference, hobbies_interests, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship",
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
): Promise<{ id: string; email: string | null; phone: string | null }> {
  const { data, error } = await supabase
    .from("care_circles")
    .select("owner_id, profiles(email, phone)")
    .eq("id", circleId)
    .single();
  if (error) throw error;
  const profile = data.profiles as unknown as {
    email: string | null;
    phone: string | null;
  } | null;
  return {
    id: data.owner_id as string,
    email: profile?.email ?? null,
    phone: profile?.phone ?? null,
  };
}

export async function getMembers(
  supabase: SupabaseClient,
  circleId: string,
): Promise<CircleMember[]> {
  const { data, error } = await supabase
    .from("care_circle_members")
    .select("*, profiles(email, phone)")
    .eq("circle_id", circleId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map((m) => {
    const profile = (
      m as unknown as {
        profiles: { email: string | null; phone: string | null } | null;
      }
    ).profiles;
    return {
      ...m,
      email: profile?.email ?? null,
      phone: profile?.phone ?? null,
    };
  }) as CircleMember[];
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
    .select("*, profiles(email, phone)")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((a) => {
    const profile = (
      a as unknown as {
        profiles: { email: string | null; phone: string | null } | null;
      }
    ).profiles;
    return {
      ...a,
      email: profile?.email ?? null,
      phone: profile?.phone ?? null,
    };
  }) as ActivityLogEntry[];
}
