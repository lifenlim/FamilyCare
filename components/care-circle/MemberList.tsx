"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, Crown, ShieldOff, User, UserX } from "lucide-react";
import { revokeInvite, revokeMember, transferOwnership } from "@/lib/actions/circle";
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
  const router = useRouter();
  const { dictionary } = useLocale();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string | null>(null);
  const [transferError, setTransferError] = useState("");

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

  function handleConfirmTransfer(member: CircleMember) {
    setPendingId(member.id);
    setTransferError("");
    startTransition(async () => {
      const result = await transferOwnership(member.user_id);
      setPendingId(null);
      if (result.error) {
        setTransferError(result.error);
        return;
      }
      setTransferTargetId(null);
      router.refresh();
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
          className="flex flex-col gap-3 rounded-lg border-2 border-border px-4 py-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
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
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  className="min-h-0 px-4 py-2 text-base"
                  disabled={isPending && pendingId === m.id}
                  onClick={() => {
                    setTransferError("");
                    setTransferTargetId(m.id);
                  }}
                >
                  <Crown className="h-5 w-5" aria-hidden="true" />
                  {dictionary.members.transferOwnership}
                </Button>
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
              </div>
            )}
          </div>

          {transferTargetId === m.id && (
            <div className="flex flex-col gap-3 rounded-lg border-2 border-primary bg-white p-3">
              <p className="text-lg font-medium">
                {dictionary.members.transferConfirm(
                  m.email ?? m.phone ?? dictionary.members.circleMember,
                )}
              </p>
              <p className="text-base text-muted">{dictionary.members.transferWarning}</p>
              {transferError && (
                <p role="alert" className="text-lg text-danger">
                  {transferError}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <Button
                  className="min-h-0 px-4 py-2 text-base"
                  disabled={isPending && pendingId === m.id}
                  onClick={() => handleConfirmTransfer(m)}
                >
                  <Crown className="h-5 w-5" aria-hidden="true" />
                  {isPending && pendingId === m.id
                    ? dictionary.members.transferring
                    : dictionary.members.transferOwnership}
                </Button>
                <Button
                  variant="secondary"
                  className="min-h-0 px-4 py-2 text-base"
                  disabled={isPending && pendingId === m.id}
                  onClick={() => setTransferTargetId(null)}
                >
                  {dictionary.common.cancel}
                </Button>
              </div>
            </div>
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
