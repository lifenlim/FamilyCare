"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HeartHandshake,
  History,
  Home,
  LogOut,
  UserCircle,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { CircleRole } from "@/lib/types";

const TABS = [
  { href: "/for-you", label: "Caring Hub", icon: Home, roles: null },
  { href: "/profile", label: "Profile", icon: UserCircle, roles: null },
  { href: "/members", label: "Members", icon: Users, roles: null },
  {
    href: "/activity",
    label: "Activity",
    icon: History,
    roles: ["owner", "editor"] as CircleRole[],
  },
];

const ROLE_BADGE_LABEL: Record<CircleRole, string> = {
  owner: "Owner",
  editor: "Care Taker",
  viewer: "Family Member",
};

export function TopNav({
  email,
  circleName,
  patientName,
  role,
}: {
  email: string | null;
  circleName: string;
  patientName: string | null;
  role: CircleRole;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const tabs = TABS.filter((tab) => !tab.roles || tab.roles.includes(role));

  return (
    <header className="border-b-2 border-border bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white sm:h-11 sm:w-11"
            aria-hidden="true"
          >
            <HeartHandshake className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg leading-tight font-bold sm:text-xl">
              {circleName}
            </p>
            {patientName && (
              <p className="truncate text-sm leading-tight text-muted sm:text-base">
                {patientName}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <span className="rounded-full border-2 border-primary bg-primary/10 px-2 py-1 text-sm font-semibold text-primary whitespace-nowrap sm:px-3 sm:text-base">
            {ROLE_BADGE_LABEL[role]}
          </span>
          {email && (
            <span className="hidden text-base text-muted lg:inline">
              {email}
            </span>
          )}
          <Button
            variant="secondary"
            onClick={handleSignOut}
            className="min-h-0 px-3 py-2 text-sm sm:px-4 sm:text-base"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
      <nav className="mx-auto flex max-w-3xl px-1 sm:gap-1 sm:px-4">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 border-b-4 px-1 py-2 text-xs font-semibold sm:flex-row sm:gap-2 sm:px-4 sm:py-3 sm:text-lg ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
