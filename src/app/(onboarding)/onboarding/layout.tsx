"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { ROLES } from "@/constants/roles";
import { cn } from "@/lib/utils";
import { LiveDot } from "@/components/ui/panel";

const STEPS = [
  { href: "/onboarding/company-profile", label: "Company" },
  { href: "/onboarding/departments", label: "Departments" },
  { href: "/onboarding/ai-providers", label: "Providers" },
  { href: "/onboarding/invite-team", label: "Invite" },
];

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <RequireAuth
      roles={[
        ROLES.COMPANY_OWNER,
        ROLES.DEPARTMENT_HEAD,
        ROLES.TEAM_LEAD,
        ROLES.EMPLOYEE,
      ]}
    >
      <div className="min-h-screen bg-ink px-6 py-10 md:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center border border-accent/60 bg-accent/10">
                <span className="h-2 w-2 bg-accent" />
              </div>
              <span className="font-mono text-sm font-semibold tracking-[0.2em]">
                INTELLIROI
              </span>
            </div>
            <LiveDot label="Onboarding" />
          </div>

          <nav className="mb-10 grid grid-cols-2 gap-px bg-hairline md:grid-cols-4">
            {STEPS.map((step, i) => {
              const active = pathname === step.href;
              return (
                <Link
                  key={step.href}
                  href={step.href}
                  className={cn(
                    "bg-ink px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
                    active
                      ? "text-accent"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  0{i + 1} · {step.label}
                </Link>
              );
            })}
          </nav>

          {children}
        </div>
      </div>
    </RequireAuth>
  );
}
