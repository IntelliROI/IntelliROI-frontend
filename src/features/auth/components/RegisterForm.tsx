"use client";

import { useState, type FormEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { authApi } from "@/features/auth/api/auth.api";
import {
  registerAdminStepSchema,
  registerCompanyStepSchema,
  registerSchema,
} from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/stores/auth-store";
import { getHomePath } from "@/lib/rbac/route-access";
import { ROLES } from "@/constants/roles";
import { COUNTRIES, CURRENCIES } from "@/constants/locale";
import {
  COMPANY_INDUSTRIES,
  COMPANY_SIZES,
  COMPANY_TIMEZONES,
} from "@/constants/company-profile";
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
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    company_name: "",
    company_code: "",
    industry: "",
    company_size: "",
    country: "",
    timezone: "",
    currency: "",
    website: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
  });

  function update(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldError) setFieldError(null);
  }

  function goToStep(next: 1 | 2) {
    setFieldError(null);
    setStep(next);
  }

  function handleBack(e?: MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();
    goToStep(1);
  }

  function handleNext(e?: MouseEvent<HTMLButtonElement>) {
    e?.preventDefault();
    e?.stopPropagation();

    const parsed = registerCompanyStepSchema.safeParse({
      ...form,
      company_name: form.company_name.trim(),
      company_code: form.company_code.trim(),
      industry: form.industry.trim(),
      company_size: form.company_size.trim(),
      country: form.country.trim(),
      timezone: form.timezone.trim(),
      website: form.website.trim(),
    });
    if (!parsed.success) {
      const msg =
        parsed.error.errors[0]?.message ?? "Fill company details to continue";
      setFieldError(msg);
      toast.error(msg);
      return;
    }
    setForm((f) => ({
      ...f,
      company_name: parsed.data.company_name,
      company_code: parsed.data.company_code,
      website: parsed.data.website,
    }));
    goToStep(2);
  }

  async function handleSignUp() {
    const admin = registerAdminStepSchema.safeParse({
      ...form,
      email: form.email.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
    });
    if (!admin.success) {
      const msg =
        admin.error.errors[0]?.message ?? "Invalid admin details";
      setFieldError(msg);
      toast.error(msg);
      return;
    }

    const parsed = registerSchema.safeParse({
      ...form,
      email: form.email.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
    });
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Invalid input";
      setFieldError(msg);
      toast.error(msg);
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

  const fieldClass = "h-10";

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
            {"// Register"}
          </p>
          <h1 className="mt-3 text-3xl font-light tracking-tight text-text-primary">
            Sign Up
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {step === 1
              ? "Company details — then your admin account."
              : "Admin account for this tenant."}
          </p>
        </div>
        <div className="flex items-center gap-3 pb-0.5">
          <button
            type="button"
            onClick={handleBack}
            className={cn(
              "font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
              step === 1 ? "text-accent" : "text-text-secondary/60 hover:text-accent",
            )}
          >
            01 Company
          </button>
          <span className="h-px w-6 bg-hairline" />
          <button
            type="button"
            onClick={handleNext}
            className={cn(
              "font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
              step === 2 ? "text-accent" : "text-text-secondary/60",
            )}
          >
            02 Admin
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-8">
        <div>
          {step === 1 ? (
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="company_name">Company name*</Label>
                <Input
                  id="company_name"
                  className={fieldClass}
                  value={form.company_name}
                  onChange={(e) => update("company_name", e.target.value)}
                  placeholder="Company name"
                  autoComplete="organization"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_code">Company code*</Label>
                <Input
                  id="company_code"
                  className={fieldClass}
                  value={form.company_code}
                  onChange={(e) => update("company_code", e.target.value)}
                  placeholder="PENGWIN"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry*</Label>
                <Select
                  id="industry"
                  className={fieldClass}
                  value={form.industry}
                  onChange={(e) => update("industry", e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select industry
                  </option>
                  {COMPANY_INDUSTRIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_size">Company size*</Label>
                <Select
                  id="company_size"
                  className={fieldClass}
                  value={form.company_size}
                  onChange={(e) => update("company_size", e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select company size
                  </option>
                  {COMPANY_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country*</Label>
                <Select
                  id="country"
                  className={fieldClass}
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select country
                  </option>
                  {COUNTRIES.map((c) => (
                    <option key={c.iso} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone*</Label>
                <Select
                  id="timezone"
                  className={fieldClass}
                  value={form.timezone}
                  onChange={(e) => update("timezone", e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select timezone
                  </option>
                  {COMPANY_TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency*</Label>
                <Select
                  id="currency"
                  className={fieldClass}
                  value={form.currency}
                  onChange={(e) => update("currency", e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select currency
                  </option>
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="website">Website</Label>
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
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Admin email*</Label>
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

              <div className="space-y-2">
                <Label htmlFor="first_name">First name*</Label>
                <Input
                  id="first_name"
                  className={fieldClass}
                  value={form.first_name}
                  onChange={(e) => update("first_name", e.target.value)}
                  placeholder="First name"
                  autoComplete="given-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last name*</Label>
                <Input
                  id="last_name"
                  className={fieldClass}
                  value={form.last_name}
                  onChange={(e) => update("last_name", e.target.value)}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="password">Password*</Label>
                <PasswordInput
                  id="password"
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
          <p className="mt-4 font-mono text-[11px] text-danger">{fieldError}</p>
        ) : null}

        <div className="mt-8 flex gap-3">
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
            <Button type="button" className="w-full" onClick={handleNext}>
              Next
            </Button>
          )}
        </div>
      </form>

      {embedded && onNavigate ? (
        <p className="mt-8 border-t border-hairline pt-6 text-center text-sm text-text-secondary">
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
