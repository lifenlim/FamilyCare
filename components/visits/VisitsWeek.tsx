"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, HeartHandshake, Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VisitForm } from "./VisitForm";
import { deleteVisit } from "@/lib/actions/visits";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { addDays, startOfWeek, weekDays } from "@/lib/visits";
import type { Visit } from "@/lib/types";

// Dates are plain "YYYY-MM-DD" strings; format them as UTC so the viewer's
// own timezone can't shift them to a neighbouring day.
function formatDate(date: string, localeTag: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(localeTag, { ...options, timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

function formatTime(time: string, localeTag: string) {
  return new Intl.DateTimeFormat(localeTag, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`2000-01-01T${time}Z`));
}

// People who picked the exact same start and end on a day share one row.
// Input is already ordered by start time, so groups come out in time order.
function groupVisitsBySlot(visits: Visit[]): Visit[][] {
  const groups = new Map<string, Visit[]>();
  for (const v of visits) {
    const key = `${v.start_time}-${v.end_time}`;
    const group = groups.get(key);
    if (group) group.push(v);
    else groups.set(key, [v]);
  }
  return [...groups.values()];
}

type FormState = { mode: "add"; date: string } | { mode: "edit"; visit: Visit } | null;

export function VisitsWeek({
  weekStart,
  today,
  visits,
  currentUserId,
  canManageAll,
}: {
  weekStart: string;
  today: string;
  visits: Visit[];
  currentUserId: string;
  canManageAll: boolean;
}) {
  const { dictionary, locale } = useLocale();
  const tag = LOCALE_TAG[locale];
  const [form, setForm] = useState<FormState>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const days = weekDays(weekStart);
  const isCurrentWeek = weekStart === startOfWeek(today);

  async function handleConfirmRemove(id: string) {
    setDeletingId(id);
    setDeleteError("");
    try {
      const result = await deleteVisit(id);
      if (result.error) {
        setDeleteError(result.error);
        return;
      }
      setRemovingId(null);
    } catch {
      setDeleteError(dictionary.visits.couldNotRemove);
    } finally {
      setDeletingId(null);
    }
  }

  function visitorName(visit: Visit) {
    if (visit.user_id === currentUserId) return dictionary.visits.you;
    if (visit.email) return visit.email.split("@")[0];
    return visit.phone ?? dictionary.visits.someone;
  }

  const rangeLabel = `${formatDate(days[0], tag, { day: "numeric", month: "short" })} – ${formatDate(
    days[6],
    tag,
    { day: "numeric", month: "short", year: "numeric" },
  )}`;

  return (
    <Card className="border-l-4 border-l-accent-purple">
      <h2 className="flex items-center gap-2 text-2xl font-bold">
        <HeartHandshake className="h-6 w-6 text-accent-purple" aria-hidden="true" />
        {dictionary.visits.heading}
      </h2>
      <p className="mt-1 text-lg text-muted">{dictionary.visits.intro}</p>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Link
          href={`/visits?week=${addDays(weekStart, -7)}`}
          aria-label={dictionary.visits.previousWeek}
          title={dictionary.visits.previousWeek}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-border text-primary hover:bg-surface"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </Link>
        <div className="flex min-w-0 flex-col items-center gap-1 text-center">
          <p className="text-lg font-semibold sm:text-xl">{rangeLabel}</p>
          {!isCurrentWeek && (
            <Link href="/visits" className="text-base font-semibold text-primary underline">
              {dictionary.visits.thisWeek}
            </Link>
          )}
        </div>
        <Link
          href={`/visits?week=${addDays(weekStart, 7)}`}
          aria-label={dictionary.visits.nextWeek}
          title={dictionary.visits.nextWeek}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-border text-primary hover:bg-surface"
        >
          <ChevronRight className="h-6 w-6" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {days.map((date) => {
          const isToday = date === today;
          const dayVisits = visits.filter((v) => v.visit_date === date);
          const addingHere = form?.mode === "add" && form.date === date;
          return (
            <section
              key={date}
              className={`flex flex-col gap-3 rounded-lg border-2 p-3 sm:p-4 ${
                isToday ? "border-primary bg-surface" : "border-border"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold sm:text-xl">
                    {formatDate(date, tag, { weekday: "short", day: "numeric", month: "short" })}
                  </h3>
                  {isToday && <Badge tone="primary">{dictionary.nav.today}</Badge>}
                </div>
                {!addingHere && (
                  <Button
                    variant="secondary"
                    className="min-h-0 px-3 py-1.5 text-base"
                    onClick={() => setForm({ mode: "add", date })}
                  >
                    <Plus className="h-5 w-5" aria-hidden="true" />
                    {dictionary.visits.addVisit}
                  </Button>
                )}
              </div>

              {addingHere && (
                <div className="rounded-lg border-2 border-primary bg-white p-3 sm:p-4">
                  <VisitForm defaultDate={date} onDone={() => setForm(null)} />
                </div>
              )}

              {dayVisits.length === 0 && !addingHere && (
                <p className="text-base text-muted">{dictionary.visits.noVisitsPlanned}</p>
              )}

              {groupVisitsBySlot(dayVisits).map((group) => {
                const { start_time, end_time } = group[0];
                const shared = group.length > 1;
                const when = `${formatTime(start_time, tag)} – ${formatTime(end_time, tag)}`;
                const dateLabel = formatDate(date, tag, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                });
                const editing =
                  form?.mode === "edit" ? group.find((v) => v.id === form.visit.id) : undefined;
                const changeable = group.filter(
                  (v) => canManageAll || v.user_id === currentUserId,
                );
                return (
                  <div key={`${start_time}-${end_time}`} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 rounded-lg border-2 border-border bg-white p-3">
                      <p className="text-lg font-semibold">{when}</p>
                      <p className="text-lg">
                        {group.map((visit, i) => (
                          <span key={visit.id}>
                            {i > 0 && ", "}
                            <span
                              className={
                                visit.user_id === currentUserId ? "font-semibold text-primary" : ""
                              }
                            >
                              {visitorName(visit)}
                            </span>
                          </span>
                        ))}
                      </p>
                      {group
                        .filter((v) => v.note)
                        .map((visit) => (
                          <p key={visit.id} className="text-base break-words text-muted">
                            {shared ? `${visitorName(visit)}: ${visit.note}` : visit.note}
                          </p>
                        ))}

                      {changeable.map((visit) => (
                        <div key={visit.id} className="flex flex-col gap-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            {shared && (
                              <span className="text-base font-medium">{visitorName(visit)}</span>
                            )}
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                className="min-h-0 px-3 py-1.5 text-base"
                                onClick={() => setForm({ mode: "edit", visit })}
                              >
                                <Pencil className="h-5 w-5" aria-hidden="true" />
                                {dictionary.common.edit}
                              </Button>
                              <Button
                                variant="danger"
                                className="min-h-0 px-3 py-1.5 text-base"
                                aria-label={dictionary.common.remove}
                                title={dictionary.common.remove}
                                onClick={() => {
                                  setDeleteError("");
                                  setRemovingId(visit.id);
                                }}
                              >
                                <Trash2 className="h-5 w-5" aria-hidden="true" />
                              </Button>
                            </div>
                          </div>

                          {removingId === visit.id && (
                            <div className="flex flex-col gap-3 rounded-lg border-2 border-danger bg-white p-3">
                              <p className="text-lg font-medium">
                                {dictionary.visits.removeConfirm(`${dateLabel}, ${when}`)}
                              </p>
                              {deleteError && (
                                <p role="alert" className="text-lg text-danger">
                                  {deleteError}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-3">
                                <Button
                                  variant="danger"
                                  className="min-h-0 px-4 py-2 text-base"
                                  disabled={deletingId === visit.id}
                                  onClick={() => handleConfirmRemove(visit.id)}
                                >
                                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                                  {deletingId === visit.id
                                    ? dictionary.common.removing
                                    : dictionary.common.yesRemove}
                                </Button>
                                <Button
                                  variant="secondary"
                                  className="min-h-0 px-4 py-2 text-base"
                                  disabled={deletingId === visit.id}
                                  onClick={() => setRemovingId(null)}
                                >
                                  {dictionary.common.cancel}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {editing && (
                      <div className="rounded-lg border-2 border-primary bg-white p-3 sm:p-4">
                        <VisitForm
                          key={editing.id}
                          visit={editing}
                          defaultDate={date}
                          onDone={() => setForm(null)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </Card>
  );
}
