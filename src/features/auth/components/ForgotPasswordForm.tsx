"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { authApi } from "@/features/auth/api/auth.api";
import { forgotPasswordSchema } from "@/features/auth/schemas/auth.schema";
import type { AuthMode } from "@/features/auth/types";

type ForgotPasswordFormProps = {
  embedded?: boolean;
  onNavigate?: (mode: AuthMode) => void;
};

export function ForgotPasswordForm({
  embedded,
  onNavigate,
}: ForgotPasswordFormProps) {
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
      toast.success("Reset instructions sent — check your email");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
        {"// Recovery"}
      </p>
      <h1 className="mt-4 text-3xl font-light tracking-tight text-text-primary">
        Forgot password?
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Enter your registered email to reset your password.
      </p>
      {sent ? (
        <p className="mt-8 border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
          If an account exists for that email, a reset link was issued.
        </p>
      ) : (
      <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email*</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
      {embedded && onNavigate ? (
        <div className="mt-8 border-t border-hairline pt-6 text-center text-sm text-text-secondary">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary/50">
            Or
          </span>
          <p className="mt-4">
            Go back to{" "}
            <button
              type="button"
              onClick={() => onNavigate("login")}
              className="font-medium text-accent hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      ) : null}
    </div>
  );
}
