import { createClient } from "@/lib/supabase/server";
import { getCircleContext, getVisits } from "@/lib/supabase/queries";
import { VisitsWeek } from "@/components/visits/VisitsWeek";
import { addDays, isDateString, startOfWeek, todayString } from "@/lib/visits";

export default async function VisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const today = todayString();
  const weekStart = startOfWeek(isDateString(week) ? week : today);

  const supabase = await createClient();
  const [ctx, { data: { user } }] = await Promise.all([
    getCircleContext(supabase),
    supabase.auth.getUser(),
  ]);
  const visits = await getVisits(supabase, ctx.circleId, weekStart, addDays(weekStart, 6));

  return (
    <div className="flex flex-col gap-8">
      {/* key resets any half-filled form when moving to another week */}
      <VisitsWeek
        key={weekStart}
        weekStart={weekStart}
        today={today}
        visits={visits}
        currentUserId={user?.id ?? ""}
        canManageAll={ctx.role !== "viewer"}
      />
    </div>
  );
}
