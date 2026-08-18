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
import { TasksSection } from "@/components/care-list/TasksSection";
import { ViewLogger } from "@/components/care-list/ViewLogger";
import { CriticalAlertsToggle } from "@/components/notifications/CriticalAlertsToggle";
import { getDictionary, getLocale } from "@/lib/i18n/getDictionary";
import { LOCALE_TAG } from "@/lib/i18n/config";

function formatToday(localeTag: string) {
  return new Date().toLocaleDateString(localeTag, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ForYouPage() {
  const supabase = await createClient();
  const ctx = await getCircleContext(supabase);
  const [dictionary, locale, medications, appointments, tasks, checklist, taskChecklist] =
    await Promise.all([
      getDictionary(),
      getLocale(),
      getMedications(supabase, ctx.circleId),
      getAppointments(supabase, ctx.circleId),
      getCareTasks(supabase, ctx.circleId),
      getTodayChecklist(supabase, ctx.circleId),
      getTodayTaskChecklist(supabase, ctx.circleId),
    ]);

  const canEdit = ctx.role !== "viewer";

  return (
    <div className="flex flex-col gap-8">
      <ViewLogger circleId={ctx.circleId} />
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {dictionary.forYou.heading}
          </h1>
          <p className="mt-1 text-base text-muted sm:text-lg">
            {formatToday(LOCALE_TAG[locale])}
          </p>
        </div>
        {canEdit && (
          <div className="flex justify-end">
            <CriticalAlertsToggle />
          </div>
        )}
        <LowStockBanner medications={medications} />
      </div>

      <SummaryCard
        medications={medications}
        appointments={appointments}
        tasks={tasks}
        checklist={checklist}
        taskChecklist={taskChecklist}
      />
      <TasksSection tasks={tasks} canEdit={canEdit} />
    </div>
  );
}
