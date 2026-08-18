"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Home,
  LogOut,
  MessageSquareHeart,
  Pill,
  UserCircle,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { CircleSwitcher } from "@/components/CircleSwitcher";
import { BRAND_ICON_VERSION } from "@/lib/brand";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { CircleRole, UserCircleOption } from "@/lib/types";

interface Tab {
  href: string;
  labelKey: keyof Dictionary["nav"];
  icon: typeof Home;
  roles: CircleRole[] | null;
}

const TAB_CONFIG: Tab[] = [
  { href: "/for-you", labelKey: "today", icon: Home, roles: null },
  { href: "/profile", labelKey: "profile", icon: UserCircle, roles: null },
  { href: "/medications", labelKey: "medications", icon: Pill, roles: null },
  { href: "/appointments", labelKey: "appointments", icon: CalendarDays, roles: null },
  { href: "/members", labelKey: "members", icon: Users, roles: null },
  { href: "/feedback", labelKey: "feedback", icon: MessageSquareHeart, roles: null },
];

export function TopNav({
  email,
  phone,
  role,
  circles,
  activeCircleId,
}: {
  email: string | null;
  phone: string | null;
  role: CircleRole;
  circles: UserCircleOption[];
  activeCircleId: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { dictionary } = useLocale();

  const roleBadgeLabel: Record<CircleRole, string> = {
    owner: dictionary.nav.roleOwner,
    editor: dictionary.nav.roleCareTaker,
    viewer: dictionary.nav.roleFamilyMember,
  };

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const tabs = TAB_CONFIG.filter(
    (tab) => !tab.roles || tab.roles.includes(role),
  );

  return (
    <header className="border-b-2 border-border bg-white">
      <div className="mx-auto flex max-w-3xl justify-end px-3 pt-1.5 sm:px-4">
        <LanguageSwitcher />
      </div>
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-3 pb-3 sm:gap-3 sm:px-4 sm:pb-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-primary/20 bg-white sm:h-11 sm:w-11"
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- small brand mark, skip the image optimizer's caching layer */}
            <img
              src={`/icons/logo.png?v=${BRAND_ICON_VERSION}`}
              alt=""
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          </span>
          <div className="min-w-0 flex-1">
            <CircleSwitcher circles={circles} activeCircleId={activeCircleId} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span className="shrink-0 rounded-full border border-primary bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary whitespace-nowrap sm:text-[10px]">
            {roleBadgeLabel[role]}
          </span>
          {(email || phone) && (
            <span className="hidden truncate text-xs text-muted sm:inline sm:text-sm">
              {email ?? phone}
            </span>
          )}
          <Button
            variant="secondary"
            onClick={handleSignOut}
            className="min-h-0 shrink-0 px-1.5 py-0.5 text-[11px] sm:px-2 sm:text-xs"
          >
            <LogOut className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{dictionary.nav.signOut}</span>
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
              <span className="truncate">{dictionary.nav[tab.labelKey]}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
