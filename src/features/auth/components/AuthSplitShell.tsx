"use client";

import Link from "next/link";
import { Suspense } from "react";
import { AuthMarketingPanel } from "@/features/auth/components/AuthMarketingPanel";
import { AuthFormSwitcher } from "@/features/auth/components/AuthFormSwitcher";
import {
  authModeHref,
  parseAuthMode,
  type AuthMode,
} from "@/features/auth/types";
import { useSearchParams } from "next/navigation";

function AuthCornerLink({ mode }: { mode: AuthMode }) {
  if (mode === "forgot") {
    return (
      <p className="text-sm text-text-secondary">
        Remembered it?{" "}
        <Link
          href={authModeHref("login")}
          className="font-medium text-accent hover:underline"
          replace
          scroll={false}
        >
          Login
        </Link>
      </p>
    );
  }
  return null;
}

function AuthRightHeader() {
  const searchParams = useSearchParams();
  const mode = parseAuthMode(searchParams.get("mode"));
  const corner = <AuthCornerLink mode={mode} />;
  const showDesktopBar = mode === "forgot";

  return (
    <div
      className={
        showDesktopBar
          ? "relative z-10 flex shrink-0 items-center justify-between px-6 py-3 md:px-10 lg:px-12 lg:py-4"
          : "relative z-10 flex shrink-0 items-center justify-between px-6 py-3 md:px-10 lg:hidden"
      }
    >
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center border border-accent/60 bg-accent/10">
          <span className="h-1.5 w-1.5 bg-accent" />
        </span>
        <span className="font-mono text-xs font-semibold tracking-[0.2em] text-text-primary">
          INTELLIROI
        </span>
      </Link>
      {corner}
    </div>
  );
}

/**
 * Split auth experience: fixed left marketing + right form switcher.
 */
export function AuthSplitShell() {
  return (
    <div className="grid h-dvh max-h-dvh w-full overflow-hidden bg-ink lg:grid-cols-2">
      <AuthMarketingPanel />

      <section className="relative flex h-full min-h-0 flex-col overflow-hidden bg-surface/20">
        <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-20" />

        <Suspense fallback={null}>
          <AuthRightHeader />
        </Suspense>

        <div className="relative z-10 flex min-h-0 flex-1 items-start justify-center overflow-y-auto px-6 py-6 md:px-10 lg:items-center lg:px-12 lg:py-10">
          <div className="w-full max-w-xl py-2">
            <Suspense
              fallback={
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-secondary/60">
                  Loading…
                </p>
              }
            >
              <AuthFormSwitcher />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
