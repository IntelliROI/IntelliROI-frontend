"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronLeft, ChevronRight, LogOut, Menu } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { type NavItem } from "@/config/navigation";
import { site } from "@/config/site";
import { ROLE_LABELS } from "@/constants/roles";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { LiveDot } from "@/components/ui/panel";
import { authApi } from "@/features/auth/api/auth.api";
import { useRouter } from "next/navigation";

function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center border border-accent/60 bg-accent/10">
        <span className="h-2 w-2 bg-accent" />
      </div>
      <span className="font-mono text-sm font-semibold tracking-[0.2em] text-text-primary">
        {site.name.toUpperCase()}
      </span>
    </div>
  );
}

export function AppShell({
  nav,
  children,
  contextLabel,
  companySlug,
}: {
  nav: NavItem[];
  children: ReactNode;
  contextLabel?: string;
  companySlug?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const user = useAuthStore((s) => s.user);
  const company = useAuthStore((s) => s.company);
  const clearSession = useAuthStore((s) => s.clearSession);
  const notifyHref =
    companySlug ?? company?.slug
      ? `/${companySlug ?? company?.slug}/notifications`
      : "#";

  async function handleLogout() {
    try {
      await authApi.logout();
    } finally {
      clearSession();
      router.replace("/login");
    }
  }

  return (
    <div className="flex min-h-screen bg-ink">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen flex-col border-r border-hairline bg-ink transition-all duration-300 lg:flex",
          sidebarCollapsed ? "w-[72px]" : "w-[260px]",
        )}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-hairline px-4">
          {!sidebarCollapsed && <LogoMark />}
          {sidebarCollapsed && (
            <div className="mx-auto flex h-7 w-7 items-center justify-center border border-accent/60 bg-accent/10">
              <span className="h-2 w-2 bg-accent" />
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <ul className="space-y-1">
            {nav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
                      active
                        ? "border border-accent/40 bg-accent/10 text-accent"
                        : "border border-transparent text-text-secondary hover:border-hairline hover:text-text-primary",
                    )}
                    title={item.label}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-hairline p-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center gap-2 border border-hairline px-3 py-2 text-text-secondary transition-colors hover:border-accent/50 hover:text-accent"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                  Collapse
                </span>
              </>
            )}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-hairline bg-ink/80 px-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="border border-hairline p-2 text-text-secondary lg:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <div>
              <LiveDot label="Systems Operational" />
              {contextLabel && (
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                  {contextLabel}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={notifyHref}
              className="relative border border-hairline p-2 text-text-secondary transition-colors hover:border-accent/50 hover:text-accent"
            >
              <Bell className="h-4 w-4" strokeWidth={1.5} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </Link>
            <div className="hidden border border-hairline px-3 py-2 sm:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-secondary">
                {user ? ROLE_LABELS[user.role] : "Guest"}
              </p>
              <p className="text-sm text-text-primary">
                {user
                  ? `${user.first_name} ${user.last_name}`
                  : "Not signed in"}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
