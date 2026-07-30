export type MemberRole = "editor" | "viewer";
export type CircleRole = "owner" | MemberRole;

export interface CircleContext {
  circleId: string;
  circleName: string;
  role: CircleRole;
}

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export const GENDER_LABEL: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};

export interface CircleProfile {
  id: string;
  name: string;
  patient_name: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  preferred_language: string | null;
  profile_notes: string | null;
  food_preference: string | null;
  drink_preference: string | null;
  hobbies_interests: string | null;
}

export function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export type MedicationFrequency =
  | "once_daily"
  | "twice_daily"
  | "thrice_daily"
  | "as_needed";

export const FREQUENCY_LABEL: Record<MedicationFrequency, string> = {
  once_daily: "Once a day",
  twice_daily: "Twice a day",
  thrice_daily: "Three times a day",
  as_needed: "Only when required",
};

// "as_needed" has no fixed daily rate, so it's intentionally left out here --
// daysOfSupply/isRunningLow treat a missing entry as "can't compute, skip".
export const FREQUENCY_PER_DAY: Partial<Record<MedicationFrequency, number>> = {
  once_daily: 1,
  twice_daily: 2,
  thrice_daily: 3,
};

export interface Medication {
  id: string;
  circle_id: string;
  name: string;
  dose_amount: number | null;
  frequency: MedicationFrequency | null;
  last_refill_balance: number;
  last_refill_at: string;
  current_balance: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  circle_id: string;
  title: string;
  appointment_at: string;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type AllergySeverity = "low" | "medium" | "high";

export const SEVERITY_LABEL: Record<AllergySeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export interface Allergy {
  id: string;
  circle_id: string;
  name: string;
  severity: AllergySeverity | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskScheduleType = "ongoing" | "one_time";
export type TaskRecurrence =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly";
export type TaskStatus = "active" | "completed" | "cancelled";

export const RECURRENCE_LABEL: Record<TaskRecurrence, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Every two weeks",
  monthly: "Monthly",
  quarterly: "Every three months",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export interface CareTask {
  id: string;
  circle_id: string;
  name: string;
  schedule_type: TaskScheduleType;
  recurrence: TaskRecurrence | null;
  scheduled_at: string | null;
  status: TaskStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Ongoing tasks have no anchor/start date to compute an exact "next due"
 * from, so any active ongoing task is treated as relevant every day. A
 * one-time task only counts for today if its date is today.
 */
export function isTaskDueToday(task: CareTask): boolean {
  if (task.status !== "active") return false;
  if (task.schedule_type === "ongoing") return true;
  return task.scheduled_at !== null && isToday(task.scheduled_at);
}

export interface DoseChecklistEntry {
  id: string;
  medication_id: string;
  checklist_date: string;
  taken: boolean;
  taken_by: string | null;
  taken_at: string | null;
}

export interface TaskChecklistEntry {
  id: string;
  task_id: string;
  checklist_date: string;
  done: boolean;
  done_by: string | null;
  done_at: string | null;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
  email: string | null;
}

export interface CircleInvite {
  id: string;
  circle_id: string;
  role: MemberRole;
  created_by: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  accepted_by: string | null;
  accepted_at: string | null;
}

export interface ActivityLogEntry {
  id: string;
  circle_id: string;
  user_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  detail: string | null;
  created_at: string;
  email: string | null;
}

/**
 * Running-low math needs a daily total, but the form now captures dose
 * amount and frequency separately -- skip (return null) unless both are set
 * to a schedule with a known daily rate. "as_needed" has no fixed rate, so
 * it's treated the same as dosage/frequency being unset: plain balance only.
 */
export function daysOfSupply(med: Medication): number | null {
  if (!med.dose_amount || med.dose_amount <= 0 || !med.frequency) return null;
  const perDay = FREQUENCY_PER_DAY[med.frequency];
  if (!perDay) return null;
  return med.current_balance / (med.dose_amount * perDay);
}

export function isRunningLow(med: Medication): boolean {
  const days = daysOfSupply(med);
  return days !== null && days <= 3;
}
