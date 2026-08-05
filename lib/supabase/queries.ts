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
  TaskChecklistEntry,
  UserCircleOption,
} from "@/lib/types";

export const ACTIVE_CIRCLE_COOKIE = "active_circle_id";

// Every circle a user can access -- circles they own (any number, now that
// one user can own several) plus any they've been invited into and
// accepted. Used to populate the circle switcher and to validate a
// requested active-circle switch. Backed by list_my_circles(), a single RPC
// that uses auth.uid() internally -- no separate auth.getUser() round trip
// needed just to get an id to filter by.
export async function listUserCircles(
  supabase: SupabaseClient,
): Promise<UserCircleOption[]> {
  const { data, error } = await supabase.rpc("list_my_circles");
  if (error || !data) return [];
  return (
    data as {
      circle_id: string;
      circle_name: string;
      patient_name: string | null;
      role: string;
    }[]
  ).map((c) => ({
    circleId: c.circle_id,
    circleName: c.circle_name,
    patientName: c.patient_name,
    role: c.role as UserCircleOption["role"],
  }));
}

function pickActiveCircle(
  circles: UserCircleOption[],
  activeId: string | undefined,
): CircleContext {
  const chosen =
    circles.find((c) => c.circleId === activeId) ??
    circles.find((c) => c.role === "owner") ??
    circles[0];
  return { circleId: chosen.circleId, circleName: chosen.circleName, role: chosen.role };
}

// Resolves both the active circle and the full switcher list from a single
// fetch -- used by the app layout, which needs both on every navigation.
// The circle list and the auth check run in parallel since list_my_circles
// no longer depends on a pre-fetched user id.
export async function getCircleContextAndOptions(
  supabase: SupabaseClient,
): Promise<{ ctx: CircleContext; circles: UserCircleOption[] }> {
  const [circles, { data: { user } }] = await Promise.all([
    listUserCircles(supabase),
    supabase.auth.getUser(),
  ]);
  if (!user) throw new Error("Not authenticated");

  if (circles.length > 0) {
    const cookieStore = await cookies();
    const activeId = cookieStore.get(ACTIVE_CIRCLE_COOKIE)?.value;
    return { ctx: pickActiveCircle(circles, activeId), circles };
  }

  const { data: created, error } = await supabase
    .rpc("ensure_my_circle")
    .single();
  if (error || !created) {
    throw new Error(error?.message ?? "Could not set up your care circle.");
  }
  const circle = created as { id: string; name: string };
  const option: UserCircleOption = {
    circleId: circle.id,
    circleName: circle.name,
    patientName: null,
    role: "owner",
  };
  return { ctx: option, circles: [option] };
}

export async function getCircleContext(
  supabase: SupabaseClient,
): Promise<CircleContext> {
  const { ctx } = await getCircleContextAndOptions(supabase);
  return ctx;
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
  circleId: string,
): Promise<DoseChecklistEntry[]> {
  // Filtering through the medications join (rather than requiring a
  // pre-fetched list of medication ids) lets this run in parallel with
  // getMedications instead of waiting on it.
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("dose_checklist")
    .select("id, medication_id, checklist_date, taken, taken_by, taken_at, medications!inner(circle_id)")
    .eq("medications.circle_id", circleId)
    .eq("checklist_date", today);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    medication_id: row.medication_id,
    checklist_date: row.checklist_date,
    taken: row.taken,
    taken_by: row.taken_by,
    taken_at: row.taken_at,
  }));
}

export async function getTodayTaskChecklist(
  supabase: SupabaseClient,
  circleId: string,
): Promise<TaskChecklistEntry[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("task_checklist")
    .select("id, task_id, checklist_date, done, done_by, done_at, care_tasks!inner(circle_id)")
    .eq("care_tasks.circle_id", circleId)
    .eq("checklist_date", today);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    task_id: row.task_id,
    checklist_date: row.checklist_date,
    done: row.done,
    done_by: row.done_by,
    done_at: row.done_at,
  }));
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
