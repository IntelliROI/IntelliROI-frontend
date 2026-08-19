"use client";

import { useSearchParams } from "next/navigation";
import { AcceptInviteForm } from "@/features/auth/components/AcceptInviteForm";

/**
 * Matches the invite email link shape emitted by auth-service:
 * `/accept-invite?token=...`.
 */
export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  return (
    <div className="mx-auto flex justify-center">
      <AcceptInviteForm token={token} />
    </div>
  );
}
