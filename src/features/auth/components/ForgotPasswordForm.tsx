"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Chapter } from "@/components/ui/panel";
import { authApi } from "@/features/auth/api/auth.api";
import { forgotPasswordSchema } from "@/features/auth/schemas/auth.schema";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Invalid email");
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(parsed.data.email);
      setSent(true);
      toast.success("Reset instructions sent (check email / mock inbox)");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Chapter number="03" label="Recovery" />
      <h1 className="mt-8 text-3xl font-light tracking-tight text-text-primary">
        Forgot password
      </h1>
      <p className="mt-3 text-sm text-text-secondary">
        We will email a reset link. In mock mode this always succeeds.
      </p>
      {sent ? (
        <p className="mt-8 border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
          If an account exists for that email, a reset link was issued.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
      <p className="mt-6 text-sm text-text-secondary">
        <Link href="/login" className="text-accent hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
