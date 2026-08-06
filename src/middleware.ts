import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/cookie-names";
import { ROLES } from "@/constants/roles";

const PUBLIC_PREFIXES = [
  "/",
  "/login",
  "/register-company",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/forbidden",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some(
    (p) => p !== "/" && (pathname === p || pathname.startsWith(`${p}/`)),
  );
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname) || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE.access)?.value;
  const role = request.cookies.get(AUTH_COOKIE.role)?.value;
  const slug = request.cookies.get(AUTH_COOKIE.slug)?.value;
  const onboarding =
    request.cookies.get(AUTH_COOKIE.onboarding)?.value ?? "1";

  if (!token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/super-admin")) {
    if (role !== ROLES.SUPER_ADMIN) {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/onboarding")) {
    if (role === ROLES.SUPER_ADMIN) {
      return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Tenant routes: /{companySlug}/...
  const segments = pathname.split("/").filter(Boolean);
  const companySlug = segments[0];
  const reserved = new Set([
    "login",
    "register-company",
    "forgot-password",
    "reset-password",
    "verify-email",
    "forbidden",
    "super-admin",
    "onboarding",
    "api",
  ]);

  if (companySlug && !reserved.has(companySlug)) {
    if (role === ROLES.SUPER_ADMIN) {
      return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));
    }
    if (slug && companySlug !== slug) {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
    if (onboarding === "0" && !pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(
        new URL("/onboarding/company-profile", request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
