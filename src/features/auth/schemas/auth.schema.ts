import { z } from "zod";
import { CURRENCIES } from "@/constants/locale";

const currencyCodes = CURRENCIES.map((c) => c.code) as [string, ...string[]];

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  company_name: z.string().min(2),
  company_code: z
    .string()
    .min(2)
    .max(16)
    .transform((v) => v.toUpperCase()),
  industry: z.string().min(2),
  company_size: z.string().min(1),
  country: z.string().min(2),
  timezone: z.string().min(1),
  currency: z.enum(currencyCodes),
  website: z.string().url().optional().or(z.literal("")),
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  password: z.string().min(8),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8),
    confirm_password: z.string().min(8),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords must match",
    path: ["confirm_password"],
  });

export const inviteSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: z.enum([
    "COMPANY_OWNER",
    "DEPARTMENT_HEAD",
    "TEAM_LEAD",
    "EMPLOYEE",
  ]),
});
