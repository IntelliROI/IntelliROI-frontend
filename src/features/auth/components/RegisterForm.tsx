"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import anime from "animejs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { authApi } from "@/features/auth/api/auth.api";
import {
  registerAdminStepSchema,
  registerCompanyStepSchema,
  registerSchema,
} from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/stores/auth-store";
import { getHomePath } from "@/lib/rbac/route-access";
import { ROLES } from "@/constants/roles";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/constants/locale";
import type { AuthMode } from "@/features/auth/types";
import { cn } from "@/lib/utils";

type RegisterFormProps = {
  embedded?: boolean;
  onNavigate?: (mode: AuthMode) => void;
};

type FormState = {
  company_name: string;
  company_code: string;
  industry: string;
  company_size: string;
  country: string;
  timezone: string;
  currency: string;
  website: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
};

export function RegisterForm({ embedded, onNavigate }: RegisterFormProps) {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const panelRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    company_name: "",
    company_code: "",
    industry: "Software / Technology",
    company_size: "1-50",
    country: "India",
    timezone: "Asia/Kolkata",
    currency: DEFAULT_CURRENCY,
    website: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
  });

  function update(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    anime.remove(el);
    anime.set(el, { opacity: 0, translateX: step === 1 ? -16 : 16 });
    anime({
      targets: el,
      opacity: 1,
      translateX: 0,
      duration: 360,
      easing: "easeOutExpo",
    });
  }, [step]);

  function goToStep(next: 1 | 2) {
    setFieldError(null);
    setStep(next);
  }

  function handleBack(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    goToStep(1);
  }

  function handleNext() {
    const parsed = registerCompanyStepSchema.safeParse(form);
    if (!parsed.success) {
      setFieldError(parsed.error.errors[0]?.message ?? "Invalid company details");
      return;
    }
    setForm((f) => ({
      ...f,
      company_code: parsed.data.company_code,
      website: parsed.data.website,
    }));
    goToStep(2);
  }

  async function handleSignUp() {
    const admin = registerAdminStepSchema.safeParse(form);
    if (!admin.success) {
      setFieldError(admin.error.errors[0]?.message ?? "Invalid admin details");
      return;
    }

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      setFieldError(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }

    setFieldError(null);
    setLoading(true);
    try {
      const session = await authApi.register(parsed.data);
      setSession({
        user: session.user,
        company: session.company,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        onboardingComplete: true,
      });
      toast.success("Company registered");
      if (session.user.role === ROLES.SUPER_ADMIN) {
        router.replace("/super-admin/dashboard");
      } else {
        const slug = session.company?.slug ?? session.user.company?.slug ?? "";
        router.replace(getHomePath(session.user.role, slug));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step === 1) handleNext();
    else void handleSignUp();
  }

  const fieldClass = "h-8";

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
            // Register
          </p>
          <h1 className="mt-1 text-2xl font-light tracking-tight text-text-primary">
            Sign Up
          </h1>
        </div>
        <div className="flex items-center gap-2 pb-1">
          <button
            type="button"
            onClick={handleBack}
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
              step === 1 ? "text-accent" : "text-text-secondary/60 hover:text-accent",
            )}
          >
            01
          </button>
          <span className="h-px w-4 bg-hairline" />
          <button
            type="button"
            onClick={() => {
              if (step === 1) handleNext();
            }}
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
              step === 2 ? "text-accent" : "text-text-secondary/60",
            )}
          >
            02
          </button>
        </div>
      </div>
      <p className="mt-1 text-xs text-text-secondary">
        {step === 1
          ? "Company details — then admin account."
          : "Admin account for this tenant."}
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-3">
        <div ref={panelRef}>
          {step === 1 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              <div className="col-span-2 space-y-0.5">
                <Label htmlFor="company_name" className="mb-0.5">
                  Company name*
                </Label>
                <Input
                  id="company_name"
                  className={fieldClass}
                  value={form.company_name}
                  onChange={(e) => update("company_name", e.target.value)}
                  placeholder="Company name"
                  autoComplete="organization"
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="company_code" className="mb-0.5">
                  Company code*
                </Label>
                <Input
                  id="company_code"
                  className={fieldClass}
                  value={form.company_code}
                  onChange={(e) => update("company_code", e.target.value)}
                  placeholder="PENGWIN"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="industry" className="mb-0.5">
                  Industry*
                </Label>
                <Input
                  id="industry"
                  className={fieldClass}
                  value={form.industry}
                  onChange={(e) => update("industry", e.target.value)}
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="company_size" className="mb-0.5">
                  Company size*
                </Label>
                <Input
                  id="company_size"
                  className={fieldClass}
                  value={form.company_size}
                  onChange={(e) => update("company_size", e.target.value)}
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="country" className="mb-0.5">
                  Country*
                </Label>
                <Input
                  id="country"
                  className={fieldClass}
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="timezone" className="mb-0.5">
                  Timezone*
                </Label>
                <Input
                  id="timezone"
                  className={fieldClass}
                  value={form.timezone}
                  onChange={(e) => update("timezone", e.target.value)}
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="currency" className="mb-0.5">
                  Currency*
                </Label>
                <Select
                  id="currency"
                  className={fieldClass}
                  value={form.currency}
                  onChange={(e) => update("currency", e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="col-span-2 space-y-0.5">
                <Label htmlFor="website" className="mb-0.5">
                  Website
                </Label>
                <Input
                  id="website"
                  type="text"
                  inputMode="url"
                  className={fieldClass}
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  placeholder="https://"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              <div className="col-span-2 space-y-0.5">
                <Label htmlFor="email" className="mb-0.5">
                  Admin email*
                </Label>
                <Input
                  id="email"
                  type="email"
                  className={fieldClass}
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="Admin email"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="first_name" className="mb-0.5">
                  First name*
                </Label>
                <Input
                  id="first_name"
                  className={fieldClass}
                  value={form.first_name}
                  onChange={(e) => update("first_name", e.target.value)}
                  placeholder="First name"
                  autoComplete="given-name"
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="last_name" className="mb-0.5">
                  Last name*
                </Label>
                <Input
                  id="last_name"
                  className={fieldClass}
                  value={form.last_name}
                  onChange={(e) => update("last_name", e.target.value)}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
              </div>

              <div className="col-span-2 space-y-0.5">
                <Label htmlFor="password" className="mb-0.5">
                  Password*
                </Label>
                <Input
                  id="password"
                  type="password"
                  className={fieldClass}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Password"
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}
        </div>

        {fieldError ? (
          <p className="mt-1.5 font-mono text-[11px] text-danger">{fieldError}</p>
        ) : null}

        <div className="mt-3 flex gap-3">
          {step === 2 ? (
            <>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating tenant…" : "Sign Up"}
              </Button>
            </>
          ) : (
            <Button type="submit" className="w-full">
              Next
            </Button>
          )}
        </div>
      </form>

      {embedded && onNavigate ? (
        <p className="mt-3 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => onNavigate("login")}
            className="font-medium text-accent hover:underline"
          >
            Login
          </button>
        </p>
      ) : null}
    </div>
  );
}
