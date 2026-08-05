"use client";

import { useTransition, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createCircle, setActiveCircle } from "@/lib/actions/circle";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { CircleRole, UserCircleOption } from "@/lib/types";

const CREATE_NEW = "__create_new__";

export function CircleSwitcher({
  circles,
  activeCircleId,
}: {
  circles: UserCircleOption[];
  activeCircleId: string;
}) {
  const router = useRouter();
  const { dictionary } = useLocale();
  const [pending, startTransition] = useTransition();

  const roleLabel: Record<CircleRole, string> = {
    owner: dictionary.nav.roleOwner,
    editor: dictionary.nav.roleCareTaker,
    viewer: dictionary.nav.roleFamilyMember,
  };

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    startTransition(async () => {
      if (value === CREATE_NEW) {
        await createCircle();
        router.push("/profile");
      } else {
        await setActiveCircle(value);
      }
      router.refresh();
    });
  }

  return (
    <label className="flex min-w-0 flex-1 flex-col">
      <span className="sr-only">{dictionary.nav.switchCircle}</span>
      <select
        value={activeCircleId}
        onChange={handleChange}
        disabled={pending}
        aria-label={dictionary.nav.switchCircle}
        className="min-w-0 max-w-full truncate rounded-lg border-2 border-border bg-white px-2 py-1 text-lg leading-tight font-bold focus-visible:border-primary sm:text-xl"
      >
        {circles.map((c) => (
          <option key={c.circleId} value={c.circleId}>
            {c.patientName || c.circleName} — {roleLabel[c.role]}
          </option>
        ))}
        <option value={CREATE_NEW}>{dictionary.nav.addAnotherCircle}</option>
      </select>
    </label>
  );
}
