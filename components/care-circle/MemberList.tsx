"use client";

import { useState, useTransition } from "react";
import { Clock, ShieldOff, User, UserX } from "lucide-react";
import { revokeInvite, revokeMember } from "@/lib/actions/circle";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { CircleInvite, CircleMember } from "@/lib/types";

export function MemberList({
  owner,
  members,
  invites,
  isOwner,
}: {
  owner: { id: string; email: string | null; phone: string | null };
  members: CircleMember[];
  invites: CircleInvite[];
  isOwner: boolean;
}) {
  const { dictionary } = useLocale();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const roleLabel: Record<string, string> = {
    owner: dictionary.nav.roleOwner,
    editor: dictionary.nav.roleCareTaker,
    viewer: dictionary.nav.roleFamilyMember,
  };

  function handleRevokeMember(id: string) {
    setPendingId(id);
    startTransition(async () => {
      await revokeMember(id);
      setPendingId(null);
    });
  }

  function handleRevokeInvite(id: string) {
    setPendingId(id);
    startTransition(async () => {
      await revokeInvite(id);
      setPendingId(null);
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center justify-between rounded-lg border-2 border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold">
              {owner.email ?? owner.phone ?? dictionary.members.accountOwner}
            </p>
            <Badge tone="primary">{roleLabel.owner}</Badge>
          </div>
        </div>
      </div>

      {members.map((m) => (
        <div
          key={m.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-border px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <p className="text-lg font-semibold">
                {m.email ?? m.phone ?? dictionary.members.circleMember}
              </p>
              <Badge>{roleLabel[m.role]}</Badge>
            </div>
          </div>
          {isOwner && (
            <Button
              variant="danger"
              className="min-h-0 px-4 py-2 text-base"
              disabled={isPending && pendingId === m.id}
              onClick={() => handleRevokeMember(m.id)}
            >
              <UserX className="h-5 w-5" aria-hidden="true" />
              {isPending && pendingId === m.id
                ? dictionary.members.revoking
                : dictionary.members.revokeAccess}
            </Button>
          )}
        </div>
      ))}

      {members.length === 0 && (
        <p className="text-lg text-muted">{dictionary.members.noOneJoinedYet}</p>
      )}

      {isOwner && invites.length > 0 && (
        <div className="mt-4">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
            {dictionary.members.pendingInvites}
          </h3>
          <div className="mt-2 flex flex-col gap-3">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-dashed border-border px-4 py-3"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-lg">{dictionary.members.waitingForAccept}</p>
                  <Badge tone="warning">{roleLabel[inv.role]}</Badge>
                </div>
                <Button
                  variant="danger"
                  className="min-h-0 px-4 py-2 text-base"
                  disabled={isPending && pendingId === inv.id}
                  onClick={() => handleRevokeInvite(inv.id)}
                >
                  <ShieldOff className="h-5 w-5" aria-hidden="true" />
                  {isPending && pendingId === inv.id
                    ? dictionary.members.cancelling
                    : dictionary.members.cancelInvite}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
