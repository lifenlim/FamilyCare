import { createClient } from "@/lib/supabase/server";
import { getCircleContext, getMedications } from "@/lib/supabase/queries";
import { MedicationsSection } from "@/components/care-list/MedicationsSection";

export default async function MedicationsPage() {
  const supabase = await createClient();
  const ctx = await getCircleContext(supabase);
  const medications = await getMedications(supabase, ctx.circleId);
  const canEdit = ctx.role !== "viewer";

  return (
    <div className="flex flex-col gap-8">
      <MedicationsSection medications={medications} canEdit={canEdit} />
    </div>
  );
}
