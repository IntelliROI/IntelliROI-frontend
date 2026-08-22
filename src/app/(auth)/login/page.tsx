import { Suspense } from "react";
import { AuthSplitShell } from "@/features/auth/components/AuthSplitShell";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-ink font-mono text-[11px] uppercase tracking-[0.16em] text-text-secondary/60">
          Loading…
        </div>
      }
    >
      <AuthSplitShell />
    </Suspense>
  );
}
