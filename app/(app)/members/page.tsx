import { History, UserPlus, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getActivityLog,
  getCircleContext,
  getCircleOwner,
  getMembers,
  getPendingInvites,
} from "@/lib/supabase/queries";
import { Card } from "@/components/ui/Card";
import { InviteGenerator } from "@/components/care-circle/InviteGenerator";
import { MemberList } from "@/components/care-circle/MemberList";
import { ActivityFeed } from "@/components/care-circle/ActivityFeed";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function MembersPage() {
  const supabase = await createClient();
  const ctx = await getCircleContext(supabase);
  const [owner, members, invites, activity, dictionary] = await Promise.all([
    getCircleOwner(supabase, ctx.circleId),
    getMembers(supabase, ctx.circleId),
    getPendingInvites(supabase, ctx.circleId),
    getActivityLog(supabase, ctx.circleId),
    getDictionary(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Users className="h-6 w-6 text-primary sm:h-8 sm:w-8" aria-hidden="true" />
          {dictionary.members.heading}
        </h1>
        <p className="mt-1 text-base text-muted sm:text-lg">
          {dictionary.members.subheading}
        </p>
      </div>

      {ctx.role === "owner" && (
        <Card>
          <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <UserPlus className="h-5 w-5 text-primary sm:h-6 sm:w-6" aria-hidden="true" />
            {dictionary.members.inviteSomeone}
          </h2>
          <p className="mt-1 text-base text-muted sm:text-lg">
            {dictionary.members.inviteBlurb}
          </p>
          <div className="mt-4">
            <InviteGenerator />
          </div>
        </Card>
      )}

      <Card>
        <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <Users className="h-5 w-5 text-primary sm:h-6 sm:w-6" aria-hidden="true" />
          {dictionary.members.peopleInCircle}
        </h2>
        <MemberList
          owner={owner}
          members={members}
          invites={invites}
          isOwner={ctx.role === "owner"}
        />
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <History className="h-5 w-5 text-primary sm:h-6 sm:w-6" aria-hidden="true" />
          {dictionary.activity.activityLog}
        </h2>
        <p className="mt-1 text-base text-muted sm:text-lg">
          {dictionary.activity.activityLogBlurb}
        </p>
        {ctx.role === "viewer" ? (
          <p className="mt-4 text-base text-muted sm:text-lg">
            {dictionary.activity.viewerNoAccess}
          </p>
        ) : (
          <ActivityFeed entries={activity} />
        )}
      </Card>
    </div>
  );
}
