import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  getCircleContext,
  getCircleProfile,
  listUserCircles,
} from "@/lib/supabase/queries";
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
  const [profile, circles] = await Promise.all([
    getCircleProfile(supabase, ctx.circleId),
    listUserCircles(supabase),
  ]);

  return (
    <div className="min-h-screen bg-surface">
      <TopNav
        email={user?.email ?? null}
        phone={user?.phone ?? null}
        circleName={ctx.circleName}
        patientName={profile.patient_name}
        role={ctx.role}
        circles={circles}
        activeCircleId={ctx.circleId}
      />
      <div className="mx-auto max-w-3xl px-3 py-6 sm:px-4 sm:py-8">
        {children}
      </div>
    </div>
  );
}
