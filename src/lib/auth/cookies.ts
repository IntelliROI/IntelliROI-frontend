import { AUTH_COOKIE } from "@/lib/auth/cookie-names";

export { AUTH_COOKIE };

const IS_PROD = process.env.NODE_ENV === "production";

function setCookie(
  name: string,
  value: string,
  maxAgeSeconds = 60 * 60 * 24 * 7,
) {
  if (typeof document === "undefined") return;
  const secure = IS_PROD ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  const secure = IS_PROD ? "; Secure" : "";
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

/**
 * Sync lightweight session hints for middleware (role / slug / onboarding).
 * Access token also lives in memory + localStorage via auth-store for API calls.
 * Prefer httpOnly cookies from the auth service when backend supports it.
 */
export function syncAuthCookies(payload: {
  accessToken: string;
  role: string;
  companySlug?: string | null;
  onboardingComplete?: boolean;
}) {
  setCookie(AUTH_COOKIE.access, payload.accessToken);
  setCookie(AUTH_COOKIE.role, payload.role);
  if (payload.companySlug) setCookie(AUTH_COOKIE.slug, payload.companySlug);
  else clearCookie(AUTH_COOKIE.slug);
  setCookie(
    AUTH_COOKIE.onboarding,
    payload.onboardingComplete === false ? "0" : "1",
  );
}

export function clearAuthCookies() {
  clearCookie(AUTH_COOKIE.access);
  clearCookie(AUTH_COOKIE.role);
  clearCookie(AUTH_COOKIE.slug);
  clearCookie(AUTH_COOKIE.onboarding);
}
