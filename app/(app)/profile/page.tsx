import { UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getAllergies,
  getCircleContext,
  getCircleProfile,
} from "@/lib/supabase/queries";
import { PatientProfileCard } from "@/components/profile/PatientProfileCard";
import { EmergencyContactCard } from "@/components/profile/EmergencyContactCard";
import { PreferencesCard } from "@/components/profile/PreferencesCard";
import { AllergiesSection } from "@/components/care-list/AllergiesSection";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function ProfilePage() {
  const supabase = await createClient();
  const ctx = await getCircleContext(supabase);
  const [profile, allergies, dictionary] = await Promise.all([
    getCircleProfile(supabase, ctx.circleId),
    getAllergies(supabase, ctx.circleId),
    getDictionary(),
  ]);

  const canEdit = ctx.role !== "viewer";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <UserCircle className="h-6 w-6 text-primary sm:h-8 sm:w-8" aria-hidden="true" />
          {dictionary.profile.heading}
        </h1>
        <p className="mt-1 text-base text-muted sm:text-lg">{ctx.circleName}</p>
      </div>

      <PatientProfileCard profile={profile} canEdit={canEdit} />
      <EmergencyContactCard profile={profile} canEdit={canEdit} />
      <AllergiesSection allergies={allergies} canEdit={canEdit} />
      <PreferencesCard profile={profile} canEdit={canEdit} />
    </div>
  );
}
