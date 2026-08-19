"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  ACTIVE_CIRCLE_COOKIE,
  getCircleContext,
  listUserCircles,
} from "@/lib/supabase/queries";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { MemberRole } from "@/lib/types";

async function setActiveCircleCookie(circleId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_CIRCLE_COOKIE, circleId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

export async function setActiveCircle(circleId: string): Promise<void> {
  const supabase = await createClient();
  const circles = await listUserCircles(supabase);
  if (!circles.some((c) => c.circleId === circleId)) {
    throw new Error("You don't have access to that circle.");
  }
  await setActiveCircleCookie(circleId);
  revalidatePath("/", "layout");
}

// A plain insert is enough -- RLS's "circle created by owner" policy
// already permits owner_id = auth.uid(), no RPC needed. Used for a
// deliberate "care for someone else too" action, as opposed to
// ensure_my_circle's implicit first-visit bootstrap.
export async function createCircle(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("care_circles")
    .insert({ owner_id: user.id })
    .select("id")
    .single();
  if (error) throw error;

  await setActiveCircleCookie(data.id);
  revalidatePath("/", "layout");
  return data.id as string;
}

export async function createInvite(role: MemberRole): Promise<string> {
  const supabase = await createClient();
  const [ctx, dictionary, { data: { user } }] = await Promise.all([
    getCircleContext(supabase),
    getDictionary(),
    supabase.auth.getUser(),
  ]);
  if (ctx.role !== "owner") {
    throw new Error(dictionary.members.ownerOnlyInvite);
  }

  const { data, error } = await supabase
    .from("care_circle_invites")
    .insert({ circle_id: ctx.circleId, role, created_by: user!.id })
    .select("id")
    .single();
  if (error) throw error;

  revalidatePath("/members");
  return data.id as string;
}

export async function revokeInvite(inviteId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("care_circle_invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", inviteId);
  if (error) throw error;
  revalidatePath("/members");
}

export async function revokeMember(memberId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("care_circle_members")
    .delete()
    .eq("id", memberId);
  if (error) throw error;
  revalidatePath("/members");
}

// transfer_ownership (0021_transfer_ownership.sql) raises these exact
// messages -- translate the ones we know about and fall back to the raw
// message for anything else.
const TRANSFER_OWNERSHIP_ERRORS: Record<string, keyof Dictionary["members"]["transferErrors"]> = {
  "Must be signed in": "mustBeSignedIn",
  "You already own this circle": "alreadyOwner",
  "You do not own this care circle": "notOwner",
  "That person is not a member of this circle": "notAMember",
};

// Returns a result object rather than throwing, same reasoning as
// acceptInvite -- keeps the translated message reaching the client intact.
export async function transferOwnership(
  newOwnerUserId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const [ctx, dictionary] = await Promise.all([
    getCircleContext(supabase),
    getDictionary(),
  ]);
  if (ctx.role !== "owner") {
    return { error: dictionary.members.ownerOnlyInvite };
  }

  const { error } = await supabase.rpc("transfer_ownership", {
    p_circle_id: ctx.circleId,
    p_new_owner_id: newOwnerUserId,
  });
  if (error) {
    const key = TRANSFER_OWNERSHIP_ERRORS[error.message];
    return { error: key ? dictionary.members.transferErrors[key] : error.message };
  }

  revalidatePath("/members");
  revalidatePath("/", "layout");
  return {};
}

// accept_invite (0001_init.sql) raises these exact messages -- translate the
// ones we know about and fall back to the raw message for anything else.
const ACCEPT_INVITE_ERRORS: Record<string, keyof Dictionary["invite"]["errors"]> = {
  "Must be signed in to accept an invite": "mustBeSignedIn",
  "Invite not found": "notFound",
  "This invite has been revoked": "revoked",
  "This invite has expired": "expired",
  "This invite has already been used": "alreadyUsed",
  "You already own this care circle": "alreadyOwn",
};

// Returns a result object rather than throwing -- Next.js's handling of
// errors thrown from a plain async Server Action call (as opposed to the
// <form action>/useActionState pattern) redacted this to the generic
// production error page instead of the translated message reaching
// AcceptInviteButton's catch block.
export async function acceptInvite(token: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("accept_invite", { p_token: token })
    .single();
  if (error) {
    const dictionary = await getDictionary();
    const key = ACCEPT_INVITE_ERRORS[error.message];
    return { error: key ? dictionary.invite.errors[key] : error.message };
  }

  // Joining a circle is a deliberate choice -- switch to it immediately
  // rather than leaving whichever circle happened to be active before.
  const result = data as { out_circle_id: string } | null;
  if (result) {
    await setActiveCircleCookie(result.out_circle_id);
  }

  revalidatePath("/for-you");
  return {};
}

export async function logView(action: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const ctx = await getCircleContext(supabase);
  if (ctx.role === "owner") return;
  await supabase
    .from("activity_log")
    .insert({ circle_id: ctx.circleId, user_id: user.id, action });
}
