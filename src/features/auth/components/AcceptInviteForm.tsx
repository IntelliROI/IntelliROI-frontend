"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Chapter } from "@/components/ui/panel";
import { authApi } from "@/features/auth/api/auth.api";
import { resetPasswordSchema } from "@/features/auth/schemas/auth.schema";

/**
 * Invited users have no password until they follow this link — the backend
 * creates them with status "invited" and activates the account (status →
 * active) the moment this same /auth/password/reset call succeeds.
 */
export function AcceptInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="w-full max-w-md">
        <Chapter number="02" label="Activate" />
        <h1 className="mt-8 text-3xl font-light tracking-tight text-text-primary">
          Invite link invalid
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          This invitation link is missing its token. Ask your company admin
          to resend the invite.
        </p>
        <p className="mt-6 text-sm text-text-secondary">
          <Link href="/login" className="text-accent hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = resetPasswordSchema.safeParse({
      password,
      confirm_password: confirm,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Invalid password");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, parsed.data.password);
      toast.success("Account activated — sign in with your new password");
      router.replace("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Activation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Chapter number="02" label="Activate" />
      <h1 className="mt-8 text-3xl font-light tracking-tight text-text-primary">
        Welcome — set your password
      </h1>
      <p className="mt-3 text-sm text-text-secondary">
        Choose a password to activate your account and finish joining your
        company workspace.
      </p>
      <form onSubmit={onSubmit} className="mt-10 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Activating…" : "Activate account"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-text-secondary">
        <Link href="/login" className="text-accent hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
