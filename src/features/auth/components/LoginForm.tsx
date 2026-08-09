"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { authApi } from "@/features/auth/api/auth.api";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/stores/auth-store";
import { ROLES } from "@/constants/roles";
import { Chapter } from "@/components/ui/panel";
import { getHomePath } from "@/lib/rbac/route-access";

const DEMO_ACCOUNTS = [
  { email: "super@intelliroi.com", label: "Super Admin" },
  { email: "ceo@acme.test", label: "Company Owner" },
  { email: "dept@acme.test", label: "Department Head" },
  { email: "lead@acme.test", label: "Team Lead" },
  { email: "emp@acme.test", label: "Employee" },
];

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("ceo@acme.test");
  const [password, setPassword] = useState("Password123!");
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
      // Demo accounts are treated as already onboarded
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
        const slug =
          session.company?.slug ?? session.user.company?.slug ?? "acme";
        router.replace(getHomePath(session.user.role, slug));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Chapter number="01" label="Access" />
      <h1 className="mt-8 text-3xl font-light tracking-tight text-text-primary">
        Sign in to <span className="text-accent">IntelliROI</span>
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        Enterprise AI intelligence — gateway, metering, and financial ROI.
      </p>

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
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {fieldError && (
          <p className="font-mono text-[11px] text-danger">{fieldError}</p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Authenticating…" : "Enter platform"}
        </Button>
      </form>

      <div className="mt-8 border border-hairline p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
          Demo personas · password Password123!
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => setEmail(a.email)}
              className="border border-hairline px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-text-secondary transition-colors hover:border-accent/50 hover:text-accent"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-text-secondary">
        <Link href="/forgot-password" className="text-accent hover:underline">
          Forgot password
        </Link>
        {" · "}
        New company?{" "}
        <Link href="/register-company" className="text-accent hover:underline">
          Register tenant
        </Link>
      </p>
    </div>
  );
}
