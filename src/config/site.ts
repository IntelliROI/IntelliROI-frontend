/**
 * Public api-gateway (:8080). Per-service NEXT_PUBLIC_*_BASE overrides are optional.
 *
 * Routing rules (in order):
 * 1. Explicit https:// bases (ngrok / real TLS API) → call them directly.
 *    Avoids Netlify /api-proxy idle timeouts on long chat completions.
 * 2. NEXT_PUBLIC_USE_API_PROXY=true → same-origin /api-proxy/* (Netlify Mixed Content).
 * 3. HTTPS page + http:// API base → /api-proxy/* (browser would block Mixed Content).
 * 4. Otherwise → env base or local gateway :8080.
 */

/** True when value is an absolute https URL (ngrok, Cloudflare Tunnel, etc.). */
export function isHttpsApiBase(value?: string | null): boolean {
  return Boolean(value && /^https:\/\//i.test(value.trim()));
}

/** HTTPS pages cannot call http:// backends — browsers block Mixed Content. */
export function shouldUseApiProxy(): boolean {
  if (process.env.NEXT_PUBLIC_USE_API_PROXY === "true") return true;
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return true;
  }
  return false;
}

function trimBase(value: string): string {
  return value.replace(/\/$/, "");
}

function directApiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8080";
}

/**
 * Resolve a service root. Prefer explicit HTTPS (ngrok) over /api-proxy even when
 * the page is HTTPS or USE_API_PROXY is set — Mixed Content is not an issue then.
 */
function serviceBase(
  proxyPath: string,
  envValue: string | undefined,
): string {
  const explicit = envValue?.trim();
  if (explicit && isHttpsApiBase(explicit)) {
    return trimBase(explicit);
  }

  if (process.env.NEXT_PUBLIC_USE_API_PROXY === "true") {
    return proxyPath;
  }

  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    // HTTPS UI + missing/HTTP API → same-origin proxy only.
    if (!explicit || /^http:\/\//i.test(explicit)) {
      return proxyPath;
    }
  }

  return trimBase(explicit ?? directApiBase());
}

export const API_BASE = (() => {
  const gateway = process.env.NEXT_PUBLIC_API_BASE?.trim();
  if (gateway && isHttpsApiBase(gateway)) return trimBase(gateway);
  if (shouldUseApiProxy()) return "/api-proxy/gateway";
  return trimBase(directApiBase());
})();

/**
 * Service roots. Getters re-evaluate so an HTTPS tab never keeps a baked-in
 * `http://` NEXT_PUBLIC_*_BASE (Mixed Content) unless an https override is set.
 */
export const services = {
  get auth() {
    return serviceBase("/api-proxy/auth", process.env.NEXT_PUBLIC_AUTH_BASE);
  },
  get org() {
    return serviceBase("/api-proxy/org", process.env.NEXT_PUBLIC_ORG_BASE);
  },
  get bc() {
    return serviceBase("/api-proxy/bc", process.env.NEXT_PUBLIC_BC_BASE);
  },
  get ai() {
    return serviceBase("/api-proxy/ai", process.env.NEXT_PUBLIC_AI_BASE);
  },
  get cost() {
    return serviceBase("/api-proxy/cost", process.env.NEXT_PUBLIC_COST_BASE);
  },
  get roi() {
    return serviceBase("/api-proxy/roi", process.env.NEXT_PUBLIC_ROI_BASE);
  },
  get analytics() {
    return serviceBase(
      "/api-proxy/analytics",
      process.env.NEXT_PUBLIC_ANALYTICS_BASE,
    );
  },
  get notify() {
    return serviceBase("/api-proxy/notify", process.env.NEXT_PUBLIC_NOTIFY_BASE);
  },
  get billing() {
    return serviceBase(
      "/api-proxy/billing",
      process.env.NEXT_PUBLIC_BILLING_BASE,
    );
  },
} as const;

export type ServiceKey = keyof typeof services;

export const site = {
  name: "IntelliROI",
  tagline: "Enterprise AI Intelligence OS",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};
