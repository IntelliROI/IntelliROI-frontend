"use client";

import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

/**
 * The backend emails reset links as `/reset-password?token=...` (query
 * param), not a path segment — this route matches that shape. The legacy
 * `/reset-password/[token]` route is kept for any previously-sent emails.
 */
export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  return (
    <div className="mx-auto flex justify-center">
      <ResetPasswordForm token={token} />
    </div>
  );
}
