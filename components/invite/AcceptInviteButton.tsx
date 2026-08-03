"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck } from "lucide-react";
import { acceptInvite } from "@/lib/actions/circle";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const { dictionary } = useLocale();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleAccept() {
    setStatus("loading");
    try {
      await acceptInvite(token);
      router.push("/for-you");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : dictionary.invite.somethingWentWrong,
      );
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {status === "error" && (
        <p role="alert" className="text-lg text-danger">
          {message}
        </p>
      )}
      <Button
        onClick={handleAccept}
        disabled={status === "loading"}
        className="w-full"
      >
        <UserCheck className="h-5 w-5" aria-hidden="true" />
        {status === "loading" ? dictionary.invite.joining : dictionary.invite.acceptAndJoin}
      </Button>
    </div>
  );
}
