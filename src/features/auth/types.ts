export type AuthMode = "login" | "register" | "forgot";

export function parseAuthMode(value: string | null | undefined): AuthMode {
  if (value === "register" || value === "forgot") return value;
  return "login";
}

export function authModeHref(mode: AuthMode): string {
  if (mode === "login") return "/login";
  return `/login?mode=${mode}`;
}
