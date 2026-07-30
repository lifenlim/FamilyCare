"use client";

import { useState, useTransition } from "react";
import { Clock, ShieldOff, User, UserX } from "lucide-react";
import { revokeInvite, revokeMember } from "@/lib/actions/circle";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { CircleInvite, CircleMember } from "@/lib/types";

const ROLE_LABEL: Record<string, string> = {
  owner: "Account Owner",
  editor: "Primary/Secondary Caretaker",
  viewer: "Family Member",
};

export function MemberList({
  owner,
  members,
  invites,
  isOwner,
}: {
  owner: { id: string; email: string | null };
  members: CircleMember[];
  invites: CircleInvite[];
  isOwner: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

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
              {owner.email ?? "Account owner"}
            </p>
            <Badge tone="primary">{ROLE_LABEL.owner}</Badge>
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
                {m.email ?? "Circle member"}
              </p>
              <Badge>{ROLE_LABEL[m.role]}</Badge>
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
                ? "Revoking..."
                : "Revoke access"}
            </Button>
          )}
        </div>
      ))}

      {members.length === 0 && (
        <p className="text-lg text-muted">
          No one else has joined this circle yet.
        </p>
      )}

      {isOwner && invites.length > 0 && (
        <div className="mt-4">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
            Pending invites
          </h3>
          <div className="mt-2 flex flex-col gap-3">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-dashed border-border px-4 py-3"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-lg">Waiting for someone to accept</p>
                  <Badge tone="warning">{ROLE_LABEL[inv.role]}</Badge>
                </div>
                <Button
                  variant="danger"
                  className="min-h-0 px-4 py-2 text-base"
                  disabled={isPending && pendingId === inv.id}
                  onClick={() => handleRevokeInvite(inv.id)}
                >
                  <ShieldOff className="h-5 w-5" aria-hidden="true" />
                  {isPending && pendingId === inv.id
                    ? "Cancelling..."
                    : "Cancel invite"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
