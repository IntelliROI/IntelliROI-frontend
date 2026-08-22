"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Chapter } from "@/components/ui/panel";
import { authApi } from "@/features/auth/api/auth.api";
import { resetPasswordSchema } from "@/features/auth/schemas/auth.schema";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="w-full max-w-md">
        <Chapter number="04" label="Reset" />
        <h1 className="mt-8 text-3xl font-light tracking-tight text-text-primary">
          Link expired or invalid
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          This reset link is missing its token. Request a new one from the
          forgot password page.
        </p>
        <p className="mt-6 text-sm text-text-secondary">
          <Link href="/forgot-password" className="text-accent hover:underline">
            Request a new link
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
      toast.success("Password updated");
      router.replace("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Chapter number="04" label="Reset" />
      <h1 className="mt-8 text-3xl font-light tracking-tight text-text-primary">
        Set a new password
      </h1>
      <form onSubmit={onSubmit} className="mt-10 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <PasswordInput
            id="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving…" : "Update password"}
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
