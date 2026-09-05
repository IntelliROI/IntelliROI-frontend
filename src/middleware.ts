import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/cookie-names";
import { ROLES, type Role } from "@/constants/roles";
import {
  canAccessCompanyPath,
  getHomePath,
} from "@/lib/rbac/route-access";

const PUBLIC_PREFIXES = [
  "/",
  "/login",
  "/register-company",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/accept-invite",
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

/** Same-origin Netlify/Next proxy to HTTP backends — never treat as an app route. */
function isApiProxy(pathname: string): boolean {
  return pathname === "/api-proxy" || pathname.startsWith("/api-proxy/");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isApiProxy(pathname)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("ngrok-skip-browser-warning", "true");
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (isStaticAsset(pathname) || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE.access)?.value;
  const role = request.cookies.get(AUTH_COOKIE.role)?.value as Role | undefined;
  const slug = request.cookies.get(AUTH_COOKIE.slug)?.value;

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

  const segments = pathname.split("/").filter(Boolean);
  const companySlug = segments[0];
  const reserved = new Set([
    "login",
    "register-company",
    "forgot-password",
    "reset-password",
    "verify-email",
    "accept-invite",
    "forbidden",
    "super-admin",
    "api-proxy",
  ]);

  if (companySlug && !reserved.has(companySlug)) {
    if (role === ROLES.SUPER_ADMIN) {
      return NextResponse.redirect(
        new URL("/super-admin/dashboard", request.url),
      );
    }
    if (slug && companySlug !== slug) {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }

    if (role && !canAccessCompanyPath(role, companySlug, pathname)) {
      return NextResponse.redirect(
        new URL(getHomePath(role, companySlug), request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api-proxy/:path*",
    "/((?!_next/static|_next/image|favicon.ico|api-proxy|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
