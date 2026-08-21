"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, CalendarIcon, HeartIcon, UserIcon, UsersIcon } from "./icons";

const TABS = [
  { href: "/", label: "Accueil", icon: HomeIcon, match: (p: string) => p === "/" },
  {
    href: "/mes-reservations",
    label: "Réservations",
    icon: CalendarIcon,
    match: (p: string) => p.startsWith("/mes-reservations"),
  },
  {
    href: "/communaute",
    label: "Communauté",
    icon: UsersIcon,
    match: (p: string) => p.startsWith("/communaute"),
  },
  {
    href: "/favoris",
    label: "Favoris",
    icon: HeartIcon,
    match: (p: string) => p.startsWith("/favoris"),
  },
  {
    href: "/profil",
    label: "Profil",
    icon: UserIcon,
    match: (p: string) => p.startsWith("/profil"),
  },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="app-tabbar-shadow fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-100 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 md:hidden"
      aria-label="Navigation principale"
    >
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium ${
              active ? "text-brand-teal" : "text-slate-400"
            }`}
          >
            <Icon className="h-5 w-5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

