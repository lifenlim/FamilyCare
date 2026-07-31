import { History } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActivityLog, getCircleContext } from "@/lib/supabase/queries";
import { Card } from "@/components/ui/Card";
import { ActivityFeed } from "@/components/care-circle/ActivityFeed";

export default async function ActivityPage() {
  const supabase = await createClient();
  const ctx = await getCircleContext(supabase);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <History className="h-6 w-6 text-primary sm:h-8 sm:w-8" aria-hidden="true" />
          Activity
        </h1>
        <p className="mt-1 text-base text-muted sm:text-lg">{ctx.circleName}</p>
      </div>

      <Card>
        <h2 className="text-xl font-bold sm:text-2xl">Activity log</h2>
        <p className="mt-1 text-base text-muted sm:text-lg">
          Who viewed or edited the care list recently.
        </p>
        {ctx.role === "viewer" ? (
          <p className="mt-4 text-base text-muted sm:text-lg">
            Family members don&apos;t have access to the activity log.
          </p>
        ) : (
          <ActivityFeed entries={await getActivityLog(supabase, ctx.circleId)} />
        )}
      </Card>
    </div>
  );
}
