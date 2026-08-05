import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

// Runs on a schedule (see vercel.json) with no user session -- it uses the
// anon key plus a separate secret (stored in public.app_secrets, checked
// inside the RPCs) so this project never needs a service-role key.

type AlertRow = {
  circle_id: string;
  alert_type: string;
  entity_id: string;
  title: string;
  body: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
};

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase.rpc("get_due_critical_alerts", {
    p_secret: cronSecret,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as AlertRow[];

  // Group rows by the underlying alert -- each alert can have multiple
  // recipient subscriptions, but should only be marked "sent" once.
  const alertGroups = new Map<string, AlertRow[]>();
  for (const row of rows) {
    const key = `${row.alert_type}:${row.entity_id}`;
    const group = alertGroups.get(key) ?? [];
    group.push(row);
    alertGroups.set(key, group);
  }

  let sentCount = 0;
  let removedCount = 0;

  for (const group of alertGroups.values()) {
    const [{ circle_id, alert_type, entity_id, title, body }] = group;

    await Promise.all(
      group.map(async (row) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: row.endpoint,
              keys: { p256dh: row.p256dh, auth: row.auth_key },
            },
            JSON.stringify({ title, body, tag: `${alert_type}-${entity_id}`, url: "/for-you" }),
          );
          sentCount++;
        } catch (err) {
          const statusCode = (err as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await supabase.rpc("remove_push_subscription", {
              p_secret: cronSecret,
              p_endpoint: row.endpoint,
            });
            removedCount++;
          }
        }
      }),
    );

    await supabase.rpc("mark_alert_sent", {
      p_secret: cronSecret,
      p_circle_id: circle_id,
      p_alert_type: alert_type,
      p_entity_id: entity_id,
    });
  }

  return NextResponse.json({
    alerts: alertGroups.size,
    pushesSent: sentCount,
    subscriptionsRemoved: removedCount,
  });
}
