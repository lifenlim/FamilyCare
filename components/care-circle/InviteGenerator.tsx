"use client";

import { useState } from "react";
import { Check, Copy, UserPlus } from "lucide-react";
import { createInvite } from "@/lib/actions/circle";
import { Button } from "@/components/ui/Button";
import type { MemberRole } from "@/lib/types";

const ROLE_OPTIONS: { value: MemberRole; label: string; hint: string }[] = [
  {
    value: "viewer",
    label: "Family Member",
    hint: "Can view the care list only",
  },
  {
    value: "editor",
    label: "Primary/Secondary Caretaker",
    hint: "Can view and edit the care list",
  },
];

export function InviteGenerator() {
  const [role, setRole] = useState<MemberRole>("viewer");
  const [link, setLink] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setStatus("loading");
    setLink(null);
    setCopied(false);
    try {
      const id = await createInvite(role);
      setLink(`${window.location.origin}/invite/${id}`);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "Could not create invite.",
      );
    }
  }

  async function handleCopy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-lg font-medium">Role for this person</legend>
        {ROLE_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer flex-col rounded-lg border-2 px-4 py-3 ${
              role === opt.value
                ? "border-primary bg-surface"
                : "border-border"
            }`}
          >
            <span className="flex items-center gap-3 text-lg font-semibold">
              <input
                type="radio"
                name="role"
                value={opt.value}
                checked={role === opt.value}
                onChange={() => setRole(opt.value)}
                className="h-5 w-5"
              />
              {opt.label}
            </span>
            <span className="ml-8 text-base text-muted">{opt.hint}</span>
          </label>
        ))}
      </fieldset>

      <Button
        onClick={handleGenerate}
        disabled={status === "loading"}
        className="w-full sm:w-auto"
      >
        <UserPlus className="h-5 w-5" aria-hidden="true" />
        {status === "loading" ? "Generating..." : "Generate invite link"}
      </Button>

      {status === "error" && (
        <p role="alert" className="text-lg text-danger">
          {message}
        </p>
      )}

      {link && (
        <div className="flex flex-col gap-2 rounded-lg border-2 border-success bg-white p-4">
          <p className="text-base text-muted">Share this link:</p>
          <p className="break-all text-lg font-medium">{link}</p>
          <Button
            variant="secondary"
            onClick={handleCopy}
            className="w-full sm:w-auto"
          >
            {copied ? (
              <Check className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Copy className="h-5 w-5" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </div>
      )}
    </div>
  );
}
