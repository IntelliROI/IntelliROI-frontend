"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Can } from "@/lib/rbac/Can";
import { organizationApi } from "@/features/organization/api/organization.api";

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
  const who = displayName ?? email;

  async function onResend() {
    setLoading(true);
    try {
      const result = await organizationApi.resendInvite(email);
      if (result.emailSent) {
        toast.success(`Invite resent to ${who}`, {
          description: `A new activation link was emailed to ${email}.`,
        });
      } else if (result.inviteUrl) {
        toast.success(`Invite resent for ${who}`, {
          description:
            "No mail provider configured — share this link to activate the account.",
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
        toast.success(`Invite resent to ${who}`, {
          description: result.message,
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resend invite");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Can resource="employees" action="create">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={loading}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void onResend();
        }}
      >
        {loading ? "Sending…" : compact ? "Resend" : "Resend invite"}
      </Button>
    </Can>
  );
}
