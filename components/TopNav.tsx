"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
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
  { href: "/for-you", label: "For You", icon: Home, roles: null },
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
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white"
            aria-hidden="true"
          >
            <Heart className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xl font-bold leading-tight">{circleName}</p>
            {patientName && (
              <p className="text-base leading-tight text-muted">
                {patientName}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border-2 border-primary bg-primary/10 px-3 py-1 text-base font-semibold text-primary">
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
            className="min-h-0 px-4 py-2 text-base"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </div>
      <nav className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 border-b-4 px-4 py-3 text-lg font-semibold whitespace-nowrap ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
