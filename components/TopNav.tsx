"use client";

import { useEffect, useRef, useState, type WheelEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  MessageSquareHeart,
  Pill,
  UserCircle,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { CircleSwitcher } from "@/components/CircleSwitcher";
import { BRAND_ICON_VERSION } from "@/lib/brand";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { CircleRole, UserCircleOption } from "@/lib/types";

type NavStringKey = {
  [K in keyof Dictionary["nav"]]: Dictionary["nav"][K] extends string ? K : never;
}[keyof Dictionary["nav"]];

interface Tab {
  href: string;
  labelKey: NavStringKey;
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
  const navRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  // The scrollbar is hidden for a cleaner look, which also removes the only
  // drag handle mouse users (no touch, no trackpad) had to scroll it. This
  // remaps normal vertical wheel scrolling to horizontal, but only when the
  // bar is actually overflowing -- otherwise the page scrolls as normal.
  function handleTabsWheel(e: WheelEvent<HTMLElement>) {
    const el = e.currentTarget;
    if (el.scrollWidth <= el.clientWidth) return;
    el.scrollLeft += e.deltaY;
    e.preventDefault();
  }

  // Belt-and-suspenders alongside wheel/touch scrolling: these arrows are
  // always clickable, so the last tab is reachable no matter what gesture
  // support the device/browser has.
  function updateScrollButtons() {
    const el = navRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateScrollButtons();
    const el = navRef.current;
    if (!el) return;
    const onScroll = () => updateScrollButtons();
    el.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [role]);

  function scrollTabs(direction: -1 | 1) {
    navRef.current?.scrollBy({ left: direction * 160, behavior: "smooth" });
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
            <p className="truncate text-lg leading-tight font-bold sm:text-xl">FamilyCare</p>
            <CircleSwitcher circles={circles} activeCircleId={activeCircleId} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {(email || phone) && (
            <span className="hidden truncate text-xs text-muted sm:inline sm:text-sm">
              {dictionary.nav.signedInAs(email ? email.split("@")[0] : (phone as string))}
            </span>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            aria-label={dictionary.nav.signOut}
            title={dictionary.nav.signOut}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-foreground sm:h-9 sm:w-9"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="relative mx-auto max-w-3xl">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollTabs(-1)}
            aria-label={dictionary.nav.scrollTabsLeft}
            className="absolute top-0 left-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-r from-white via-white/90 to-transparent text-primary"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        <nav
          ref={navRef}
          className="no-scrollbar flex gap-1 overflow-x-auto px-3 sm:px-4"
          onWheel={handleTabsWheel}
        >
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex shrink-0 flex-col items-center justify-center gap-1 border-b-4 px-3 py-2 text-xs font-semibold whitespace-nowrap sm:flex-row sm:gap-2 sm:px-4 sm:py-3 sm:text-lg ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{dictionary.nav[tab.labelKey]}</span>
              </Link>
            );
          })}
        </nav>
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollTabs(1)}
            aria-label={dictionary.nav.scrollTabsRight}
            className="absolute top-0 right-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-l from-white via-white/90 to-transparent text-primary"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  );
}
