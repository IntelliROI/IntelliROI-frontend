"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

/**
 * The backend emails reset links as `/reset-password?token=...` (query
 * param), not a path segment — this route matches that shape. The legacy
 * `/reset-password/[token]` route is kept for any previously-sent emails.
 */
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  return (
    <div className="mx-auto flex min-h-screen items-center justify-center px-6 py-16">
      <ResetPasswordForm token={token} />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex justify-center py-16 font-mono text-[11px] uppercase tracking-[0.16em] text-text-secondary/60">
          Loading reset…
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
