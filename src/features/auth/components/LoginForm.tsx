"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { authApi } from "@/features/auth/api/auth.api";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/stores/auth-store";
import { ROLES } from "@/constants/roles";
import { getHomePath } from "@/lib/rbac/route-access";
import type { AuthMode } from "@/features/auth/types";

type LoginFormProps = {
  embedded?: boolean;
  onNavigate?: (mode: AuthMode) => void;
};

export function LoginForm({ embedded, onNavigate }: LoginFormProps) {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldError(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }
    setFieldError(null);
    setLoading(true);
    try {
      const session = await authApi.login(parsed.data);
      setSession({
        user: session.user,
        company: session.company ?? session.user.company,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        onboardingComplete: true,
      });
      toast.success("Authenticated");

      if (session.user.role === ROLES.SUPER_ADMIN) {
        router.replace("/super-admin/dashboard");
      } else {
        const slug = session.company?.slug ?? session.user.company?.slug;
        if (!slug) {
          toast.error("No company on this account");
          return;
        }
        router.replace(getHomePath(session.user.role, slug));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
        {"// Access"}
      </p>
      <h1 className="mt-4 text-3xl font-light tracking-tight text-text-primary">
        Login
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        Login to access your IntelliROI account.
      </p>

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
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password">Password*</Label>
            {embedded && onNavigate ? (
              <button
                type="button"
                onClick={() => onNavigate("forgot")}
                className="font-mono text-[11px] text-accent hover:underline"
              >
                Forgot password?
              </button>
            ) : null}
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {fieldError && (
          <p className="font-mono text-[11px] text-danger">{fieldError}</p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Authenticating…" : "Login"}
        </Button>
      </form>

      {embedded && onNavigate ? (
        <div className="mt-8 border-t border-hairline pt-6 text-center text-sm text-text-secondary">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary/50">
            Or
          </span>
          <p className="mt-4">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => onNavigate("register")}
              className="font-medium text-accent hover:underline"
            >
              Sign Up Now
            </button>
          </p>
        </div>
      ) : null}
    </div>
  );
}
