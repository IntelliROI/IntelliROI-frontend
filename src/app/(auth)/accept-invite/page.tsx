"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AcceptInviteForm } from "@/features/auth/components/AcceptInviteForm";

/**
 * Matches the invite email link shape emitted by auth-service:
 * `/accept-invite?token=...`.
 */
function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  return (
    <div className="mx-auto flex justify-center">
      <AcceptInviteForm token={token} />
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex justify-center py-16 font-mono text-[11px] uppercase tracking-[0.16em] text-text-secondary/60">
          Loading invite…
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
