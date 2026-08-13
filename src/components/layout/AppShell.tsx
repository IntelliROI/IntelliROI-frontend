"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronRight,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  ChevronsUpDown,
} from "lucide-react";
import { type ReactNode, useMemo, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { type NavItem } from "@/config/navigation";
import { site } from "@/config/site";
import { ROLE_LABELS } from "@/constants/roles";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { LiveDot } from "@/components/ui/panel";
import { authApi } from "@/features/auth/api/auth.api";
import { roleThemeFromRole } from "@/lib/theme/role-theme";

/* ─────────────────────────────────────────────
   Avatar helpers
───────────────────────────────────────────── */
function getInitials(firstName?: string, lastName?: string): string {
  const f = (firstName?.[0] ?? "").toUpperCase();
  const l = (lastName?.[0] ?? "").toUpperCase();
  return f + l || "?";
}

function Avatar({
  firstName,
  lastName,
  size = "md",
}: {
  firstName?: string;
  lastName?: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = getInitials(firstName, lastName);
  const sizeClass = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-[11px]",
    lg: "h-9 w-9 text-[12px]",
  }[size];

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full font-semibold",
        "bg-gradient-to-br from-accent/30 to-accent/10 text-accent ring-1 ring-accent/30",
        sizeClass,
      )}
    >
      {initials}
      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-ink bg-success" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Logo
───────────────────────────────────────────── */
function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5 min-w-0", compact && "justify-center")}>
      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden bg-brand/10 ring-1 ring-brand/30">
        <span className="absolute h-2.5 w-2.5 bg-brand shadow-[0_0_8px_var(--brand-accent)]" />
      </div>
      {!compact && (
        <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-text-primary">
          {site.name.toUpperCase()}
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Tooltip (for collapsed state)
───────────────────────────────────────────── */
function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="group/tip relative">
      {children}
      <div
        className={cn(
          "pointer-events-none absolute left-full top-1/2 z-[100] ml-3 -translate-y-1/2",
          "whitespace-nowrap border border-hairline bg-surface-2 px-2.5 py-1.5",
          "font-sans text-[12px] font-medium text-text-primary shadow-xl",
          "opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100",
        )}
      >
        {label}
        <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-surface-2" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Nav item
───────────────────────────────────────────── */
function NavListItem({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  const linkContent = (
    <Link
      href={item.href}
      prefetch
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 transition-all duration-150",
        collapsed ? "h-9 w-9 justify-center p-0" : "h-9 px-3",
        active
          ? "bg-accent/10 text-accent"
          : "text-text-secondary/80 hover:bg-surface/70 hover:text-text-primary",
      )}
      title={collapsed ? item.label : undefined}
    >
      {/* Left accent bar */}
      {active && (
        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
      )}

      <Icon
        className={cn(
          "h-[15px] w-[15px] shrink-0 transition-colors",
          active
            ? "text-accent"
            : "text-text-secondary/60 group-hover:text-text-primary",
        )}
        strokeWidth={1.75}
      />

      {!collapsed && (
        <>
          <span className="flex-1 truncate text-[13px] font-medium leading-none tracking-tight">
            {item.label}
          </span>
          {active && (
            <span className="ml-auto h-1 w-1 shrink-0 rounded-full bg-accent" />
          )}
        </>
      )}
    </Link>
  );

  if (collapsed) {
    return <Tooltip label={item.label}>{linkContent}</Tooltip>;
  }

  return linkContent;
}

/* ─────────────────────────────────────────────
   Nav list with section headers
───────────────────────────────────────────── */
function NavList({
  nav,
  pathname,
  collapsed,
  onNavigate,
}: {
  nav: NavItem[];
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  let lastSection: string | undefined;

  return (
    <ul className="flex flex-col gap-0.5">
      {nav.map((item) => {
        const showSection =
          !collapsed && item.section && item.section !== lastSection;
        if (item.section) lastSection = item.section;

        return (
          <li key={item.id}>
            {showSection && (
              <p className="mb-1 mt-5 px-2 font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-text-secondary/40 first:mt-1">
                {item.section}
              </p>
            )}
            {collapsed && showSection && (
              <div className="mb-1 mt-4 flex justify-center first:mt-1">
                <span className="h-px w-5 bg-hairline" />
              </div>
            )}
            <NavListItem
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          </li>
        );
      })}
    </ul>
  );
}

/* ─────────────────────────────────────────────
   User dropdown (header)
───────────────────────────────────────────── */
function UserMenu({
  firstName,
  lastName,
  roleLabel,
  onLogout,
}: {
  firstName?: string;
  lastName?: string;
  roleLabel: string;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2.5 px-2 py-1.5 transition-colors duration-150",
          "hover:bg-surface/70",
          open && "bg-surface/70",
        )}
        aria-label="User menu"
        aria-expanded={open}
      >
        <Avatar firstName={firstName} lastName={lastName} size="md" />
        <div className="hidden flex-col items-start sm:flex">
          <span className="max-w-[120px] truncate text-[13px] font-semibold leading-none text-text-primary">
            {firstName} {lastName}
          </span>
          <span className="mt-0.5 text-[11px] font-medium leading-none text-accent">
            {roleLabel}
          </span>
        </div>
        <ChevronsUpDown
          className="hidden h-3.5 w-3.5 shrink-0 text-text-secondary/50 sm:block"
          strokeWidth={2}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-0 top-full z-[100] mt-1.5 w-52",
            "overflow-hidden border border-hairline bg-surface-2 shadow-2xl shadow-black/40",
          )}
        >
          {/* User info */}
          <div className="border-b border-hairline px-3.5 py-3">
            <div className="flex items-center gap-2.5">
              <Avatar firstName={firstName} lastName={lastName} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-text-primary">
                  {firstName} {lastName}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-accent">
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <button
              type="button"
              onClick={() => { setOpen(false); onLogout(); }}
              className={cn(
                "flex w-full items-center gap-2.5 px-3 py-2 text-[13px]",
                "text-danger/80 transition-colors hover:bg-danger/10 hover:text-danger",
              )}
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   AppShell
───────────────────────────────────────────── */
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const company = useAuthStore((s) => s.company);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearSession = useAuthStore((s) => s.clearSession);
  const roleTheme = useMemo(
    () => roleThemeFromRole(user?.role),
    [user?.role],
  );
  const notifyHref =
    companySlug ?? company?.slug
      ? `/${companySlug ?? company?.slug}/notifications`
      : "#";
  const roleLabel = user ? ROLE_LABELS[user.role] : "Guest";

  async function handleLogout() {
    try {
      await authApi.logout(refreshToken);
    } finally {
      clearSession();
      router.replace("/login");
    }
  }

  /* Close mobile drawer on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div data-role-theme={roleTheme} className="flex min-h-screen bg-ink">

      {/* ── Desktop rail ── */}
      <aside
        className={cn(
          "sticky top-0 z-30 hidden h-screen flex-col border-r border-hairline bg-ink lg:flex",
          "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          sidebarCollapsed ? "w-[64px]" : "w-[224px]",
        )}
      >
        {/* Top: Logo + collapse toggle */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-hairline",
            sidebarCollapsed ? "justify-center px-2" : "justify-between px-3.5",
          )}
        >
          <LogoMark compact={sidebarCollapsed} />

          {!sidebarCollapsed && (
            <Tooltip label="Collapse sidebar">
              <button
                type="button"
                onClick={toggleSidebar}
                className={cn(
                  "flex h-7 w-7 items-center justify-center",
                  "text-text-secondary/50 transition-colors hover:bg-surface/70 hover:text-text-primary",
                )}
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </Tooltip>
          )}

          {sidebarCollapsed && (
            <Tooltip label="Expand sidebar">
              <button
                type="button"
                onClick={toggleSidebar}
                className={cn(
                  "absolute right-0 top-14 translate-x-1/2 z-10",
                  "flex h-5 w-5 items-center justify-center rounded-full",
                  "border border-hairline bg-surface-2 text-text-secondary shadow-md",
                  "transition-colors hover:border-accent/40 hover:text-accent",
                )}
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-3 w-3" strokeWidth={2.5} />
              </button>
            </Tooltip>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3" aria-label="Primary">
          <NavList nav={nav} pathname={pathname} collapsed={sidebarCollapsed} />
        </nav>

        {/* Bottom user strip */}
        <div className="border-t border-hairline p-2.5">
          {sidebarCollapsed ? (
            <Tooltip label={`${user?.first_name ?? ""} ${user?.last_name ?? ""} · ${roleLabel}`}>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-surface/70"
                aria-label="User"
              >
                <Avatar
                  firstName={user?.first_name}
                  lastName={user?.last_name}
                  size="sm"
                />
              </button>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <Avatar
                firstName={user?.first_name}
                lastName={user?.last_name}
                size="sm"
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[12px] font-semibold leading-none text-text-primary">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="mt-0.5 truncate text-[10px] font-medium leading-none text-accent">
                  {roleLabel}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[240px] flex-col border-r border-hairline bg-ink shadow-2xl">
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b border-hairline px-3.5">
              <LogoMark />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface/70 hover:text-text-primary"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-2.5 py-3">
              <NavList
                nav={nav}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </nav>

            {/* User strip */}
            <div className="border-t border-hairline p-2.5">
              <div className="flex items-center gap-2.5 px-2 py-1.5">
                <Avatar
                  firstName={user?.first_name}
                  lastName={user?.last_name}
                  size="sm"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[12px] font-semibold leading-none text-text-primary">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <span className="mt-0.5 text-[10px] font-medium leading-none text-accent">
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main content area ── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* ── Header ── */}
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-hairline bg-ink/80 backdrop-blur-md">
          <div className="flex flex-1 items-center gap-3 px-4 md:px-5">

            {/* Mobile hamburger */}
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center text-text-secondary transition-colors hover:bg-surface/70 hover:text-text-primary lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-4.5 w-4.5" strokeWidth={1.75} />
            </button>

            {/* Context / breadcrumb */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <LiveDot label="Operational" />
              {contextLabel && (
                <p className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-text-secondary/55">
                  {contextLabel}
                  {user ? ` · ${ROLE_LABELS[user.role]}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-1 px-4 md:px-5">

            {/* Notifications */}
            <Link
              href={notifyHref}
              prefetch
              className={cn(
                "relative flex h-8 w-8 items-center justify-center",
                "text-text-secondary/70 transition-colors hover:bg-surface/70 hover:text-text-primary",
              )}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" strokeWidth={1.75} />
              {/* Unread dot */}
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_4px_var(--accent)]" />
            </Link>

            {/* Divider */}
            <span className="mx-1 h-5 w-px bg-hairline" />

            {/* User menu */}
            <UserMenu
              firstName={user?.first_name}
              lastName={user?.last_name}
              roleLabel={roleLabel}
              onLogout={handleLogout}
            />
          </div>
        </header>

        {/* ── Page content ── */}
        <main
          className={cn(
            "flex min-h-0 w-full flex-1 flex-col",
            pathname.includes("/ai-workspace")
              ? "max-w-none overflow-hidden p-0"
              : "mx-auto max-w-[1400px] px-4 py-6 md:px-6 md:py-8",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
