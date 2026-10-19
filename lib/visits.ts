// Week/date helpers for the visit planner. Dates are plain "YYYY-MM-DD"
// strings and all arithmetic happens in UTC so a device's timezone or DST
// can never shift a visit onto the wrong day.

// "Today" decides which week opens by default and which day is highlighted.
// The server has no idea what timezone the viewer is in, so it uses the
// timezone the patients live in rather than the server's (UTC on Vercel),
// which would still show yesterday for the first 8 hours of every day.
export const CARE_TIME_ZONE = "Asia/Singapore";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isDateString(value: string | null | undefined): value is string {
  if (!value || !DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function todayString(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: CARE_TIME_ZONE }).format(
    new Date(),
  );
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Weeks run Monday to Sunday.
export function startOfWeek(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const sinceMonday = (d.getUTCDay() + 6) % 7;
  return addDays(date, -sinceMonday);
}

export function weekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

// "14:00:00" -> "14:00", the format <input type="time"> expects.
export function toTimeInputValue(time: string): string {
  return time.slice(0, 5);
}
