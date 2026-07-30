import { CalendarDays, ClipboardList, Pill } from "lucide-react";
import { GlanceCard } from "@/components/ui/GlanceCard";
import { ChecklistSection } from "./ChecklistSection";
import { TaskChecklistSection } from "./TaskChecklistSection";
import {
  isTaskDueToday,
  type Appointment,
  type CareTask,
  type DoseChecklistEntry,
  type Medication,
  type TaskChecklistEntry,
} from "@/lib/types";

function formatAppointmentDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SummaryCard({
  medications,
  appointments,
  tasks,
  checklist,
  taskChecklist,
}: {
  medications: Medication[];
  appointments: Appointment[];
  tasks: CareTask[];
  checklist: DoseChecklistEntry[];
  taskChecklist: TaskChecklistEntry[];
}) {
  const todaysTasks = tasks.filter(isTaskDueToday);
  const nextAppointment = appointments
    .filter(
      (a) => new Date(a.appointment_at).getTime() >= Date.now() - 60 * 60 * 1000,
    )
    .sort(
      (a, b) =>
        new Date(a.appointment_at).getTime() - new Date(b.appointment_at).getTime(),
    )[0];

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <GlanceCard icon={CalendarDays} title="Upcoming appointment" tone="blue">
        {nextAppointment ? (
          <div>
            <p className="text-lg font-semibold">{nextAppointment.title}</p>
            <p className="text-lg text-muted">
              {formatAppointmentDate(nextAppointment.appointment_at)}
            </p>
            {nextAppointment.location && (
              <p className="text-lg text-muted">{nextAppointment.location}</p>
            )}
          </div>
        ) : (
          <p className="text-lg text-muted">Nothing scheduled.</p>
        )}
      </GlanceCard>

      <GlanceCard icon={Pill} title="Today's medications" tone="teal">
        <ChecklistSection medications={medications} checklist={checklist} />
      </GlanceCard>

      <GlanceCard icon={ClipboardList} title="Activities & Tasks" tone="purple">
        <TaskChecklistSection tasks={todaysTasks} checklist={taskChecklist} />
      </GlanceCard>
    </div>
  );
}
