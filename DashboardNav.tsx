"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { logoutAction } from "@/lib/actions/auth";

export default function DashboardNav({
  nom,
  links,
  homeHref,
}: {
  nom: string;
  links: { href: string; label: string }[];
  homeHref: string;
}) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 text-sm font-medium text-slate-500 lg:flex">
          {links.map((l) => {
            const active = l.href === homeHref ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap rounded-full px-3.5 py-2 ${
                  active ? "bg-brand-teal/10 text-brand-deep" : "hover:bg-slate-50"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[140px] truncate text-sm text-slate-500 sm:block">
            Bonjour, {nom}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full border border-slate-200 px-3.5 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-50 px-4 py-2 text-sm font-medium text-slate-500 lg:hidden">
        {links.map((l) => {
          const active = l.href === homeHref ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`shrink-0 rounded-full px-3.5 py-1.5 ${
                active ? "bg-brand-teal/10 text-brand-deep" : ""
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
