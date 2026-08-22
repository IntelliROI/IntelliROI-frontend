import { z } from "zod";
import { CURRENCIES } from "@/constants/locale";

const currencyCodes = CURRENCIES.map((c) => c.code) as [string, ...string[]];

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerCompanyStepSchema = z.object({
  company_name: z.string().min(2, "Company name required"),
  company_code: z
    .string()
    .min(2, "Company code required")
    .max(16)
    .transform((v) => v.toUpperCase()),
  industry: z.string().min(2, "Industry required"),
  company_size: z.string().min(1, "Company size required"),
  country: z.string().min(2, "Country required"),
  timezone: z.string().min(1, "Timezone required"),
  currency: z.enum(currencyCodes),
  website: z
    .string()
    .transform((v) => {
      const t = v.trim();
      if (!t || t === "https://" || t === "http://") return "";
      return t;
    })
    .refine(
      (v) => v === "" || z.string().url().safeParse(v).success,
      "Enter a valid website URL",
    ),
});

export const registerAdminStepSchema = z.object({
  email: z.string().email("Valid admin email required"),
  first_name: z.string().min(1, "First name required"),
  last_name: z.string().min(1, "Last name required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = registerCompanyStepSchema.merge(
  registerAdminStepSchema,
);

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
