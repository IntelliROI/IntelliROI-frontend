"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Can } from "@/lib/rbac/Can";
import { organizationApi } from "@/features/organization/api/organization.api";
import { cn } from "@/lib/utils";

type Props = {
  email: string;
  displayName?: string;
  compact?: boolean;
};

/**
 * Owner/manager control — issues a new accept-invite token via
 * POST /auth/invite/resend for people still status "invited".
 */
export function ResendInviteButton({ email, displayName, compact }: Props) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const who = displayName ?? email;

  async function onResend() {
    if (loading || sent) return;
    setLoading(true);
    try {
      const result = await organizationApi.resendInvite(email);
      if (result.emailSent) {
        toast.success(`Invite sent to ${email}`);
      } else if (result.inviteUrl) {
        toast.success(`Invite ready for ${who}`, {
          description:
            "No mail provider configured — copy the link and share it.",
          action: {
            label: "Copy link",
            onClick: () => {
              void navigator.clipboard?.writeText(result.inviteUrl!);
              toast.message("Invite link copied");
            },
          },
          duration: 15000,
        });
      } else {
        toast.success(result.message || `Invite resent to ${who}`);
      }
      setSent(true);
      window.setTimeout(() => setSent(false), 4000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resend invite");
    } finally {
      setLoading(false);
    }
  }

  const label = sent
    ? "Sent"
    : loading
      ? "Sending…"
      : compact
        ? "Resend"
        : "Resend invite";

  return (
    <Can resource="employees" action="create">
      <button
        type="button"
        disabled={loading || sent}
        aria-live="polite"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void onResend();
        }}
        className={cn(
          "font-mono text-[10px] uppercase tracking-[0.15em] transition-colors",
          sent
            ? "text-accent"
            : "text-accent hover:text-accent/70",
          "disabled:cursor-default disabled:opacity-70",
        )}
      >
        {label}
      </button>
    </Can>
  );
}
