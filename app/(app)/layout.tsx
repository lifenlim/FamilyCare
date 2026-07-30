import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCircleContext, getCircleProfile } from "@/lib/supabase/queries";
import { TopNav } from "@/components/TopNav";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ctx = await getCircleContext(supabase);
  const profile = await getCircleProfile(supabase, ctx.circleId);

  return (
    <div className="min-h-screen bg-surface">
      <TopNav
        email={user?.email ?? null}
        circleName={ctx.circleName}
        patientName={profile.patient_name}
        role={ctx.role}
      />
      <div className="mx-auto max-w-3xl px-4 py-8">{children}</div>
    </div>
  );
}
