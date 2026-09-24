/** Cookie names shared by browser sync and Edge middleware (no DOM APIs). */
export const AUTH_COOKIE = {
  access: "intelROI_access_token",
  role: "intelROI_role",
  slug: "intelROI_company_slug",
  onboarding: "intelROI_onboarding_complete",
} as const;
