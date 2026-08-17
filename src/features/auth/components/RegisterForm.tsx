"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Chapter } from "@/components/ui/panel";
import { authApi } from "@/features/auth/api/auth.api";
import { registerSchema } from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/stores/auth-store";
import { getHomePath } from "@/lib/rbac/route-access";
import { ROLES } from "@/constants/roles";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/constants/locale";

export function RegisterForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [form, setForm] = useState({
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

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
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

  return (
    <div className="w-full max-w-xl">
      <Chapter number="02" label="Register" />
      <h1 className="mt-8 text-3xl font-light tracking-tight text-text-primary">
        Register your company
      </h1>
      <p className="mt-3 text-sm text-text-secondary">
        Creates the tenant and Company Owner. You land on the dashboard — add a
        manager later from Organization.
      </p>

      <form onSubmit={onSubmit} className="mt-10 grid gap-4 sm:grid-cols-2">
        {(
          [
            ["company_name", "Company name"],
            ["company_code", "Company code"],
            ["industry", "Industry"],
            ["company_size", "Company size"],
            ["country", "Country"],
            ["timezone", "Timezone"],
            ["currency", "Currency"],
            ["website", "Website"],
            ["email", "Admin email"],
            ["first_name", "First name"],
            ["last_name", "Last name"],
            ["password", "Password"],
          ] as const
        ).map(([key, label]) => (
          <div
            key={key}
            className={`space-y-2 ${
              key === "company_name" ||
              key === "email" ||
              key === "password" ||
              key === "website"
                ? "sm:col-span-2"
                : ""
            }`}
          >
            <Label htmlFor={key}>{label}</Label>
            {key === "currency" ? (
              <Select
                id={key}
                value={form.currency}
                onChange={(e) => update("currency", e.target.value)}
                required
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                id={key}
                type={
                  key === "password"
                    ? "password"
                    : key === "email"
                      ? "email"
                      : key === "website"
                        ? "url"
                        : "text"
                }
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                required={key !== "website"}
                placeholder={
                  key === "company_code"
                    ? "PENGWIN"
                    : key === "website"
                      ? "https://"
                      : undefined
                }
              />
            )}
          </div>
        ))}
        {fieldError && (
          <p className="font-mono text-[11px] text-danger sm:col-span-2">
            {fieldError}
          </p>
        )}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating tenant…" : "Create company"}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-sm text-text-secondary">
        Already have access?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
