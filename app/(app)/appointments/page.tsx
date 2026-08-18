import { createClient } from "@/lib/supabase/server";
import { getAppointments, getCircleContext } from "@/lib/supabase/queries";
import { AppointmentsSection } from "@/components/care-list/AppointmentsSection";

export default async function AppointmentsPage() {
  const supabase = await createClient();
  const ctx = await getCircleContext(supabase);
  const appointments = await getAppointments(supabase, ctx.circleId);
  const canEdit = ctx.role !== "viewer";

  return (
    <div className="flex flex-col gap-8">
      <AppointmentsSection appointments={appointments} canEdit={canEdit} />
    </div>
  );
}
