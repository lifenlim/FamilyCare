import { createClient } from "@/lib/supabase/server";
import {
  getAppointments,
  getCareTasks,
  getCircleContext,
  getMedications,
  getTodayChecklist,
  getTodayTaskChecklist,
} from "@/lib/supabase/queries";
import { SummaryCard } from "@/components/care-list/SummaryCard";
import { LowStockBanner } from "@/components/care-list/LowStockBanner";
import { MedicationsSection } from "@/components/care-list/MedicationsSection";
import { AppointmentsSection } from "@/components/care-list/AppointmentsSection";
import { TasksSection } from "@/components/care-list/TasksSection";
import { ViewLogger } from "@/components/care-list/ViewLogger";

function formatToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ForYouPage() {
  const supabase = await createClient();
  const ctx = await getCircleContext(supabase);

  const [medications, appointments, tasks] = await Promise.all([
    getMedications(supabase, ctx.circleId),
    getAppointments(supabase, ctx.circleId),
    getCareTasks(supabase, ctx.circleId),
  ]);
  const [checklist, taskChecklist] = await Promise.all([
    getTodayChecklist(
      supabase,
      medications.map((m) => m.id),
    ),
    getTodayTaskChecklist(
      supabase,
      tasks.map((t) => t.id),
    ),
  ]);

  const canEdit = ctx.role !== "viewer";

  return (
    <div className="flex flex-col gap-8">
      <ViewLogger circleId={ctx.circleId} />
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Today, at a glance</h1>
        <p className="mt-1 text-base text-muted sm:text-lg">{formatToday()}</p>
      </div>
      <LowStockBanner medications={medications} />

      <SummaryCard
        medications={medications}
        appointments={appointments}
        tasks={tasks}
        checklist={checklist}
        taskChecklist={taskChecklist}
      />
      <AppointmentsSection appointments={appointments} canEdit={canEdit} />
      <TasksSection tasks={tasks} canEdit={canEdit} />
      <MedicationsSection medications={medications} canEdit={canEdit} />
    </div>
  );
}
