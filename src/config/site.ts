/**
 * Public api-gateway (:8080). Per-service NEXT_PUBLIC_*_BASE overrides are optional.
 *
 * On HTTPS hosts (e.g. Netlify) the browser MUST use same-origin `/api-proxy/*`.
 * Next/Netlify then forward to HTTP upstreams (avoids Mixed Content).
 * Upstream hosts are configured via *_UPSTREAM / next.config / netlify.toml.
 */

/** HTTPS pages cannot call http:// backends — browsers block Mixed Content. */
export function shouldUseApiProxy(): boolean {
  if (process.env.NEXT_PUBLIC_USE_API_PROXY === "true") return true;
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return true;
  }
  return false;
}

function directApiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8080";
}

function serviceBase(
  proxyPath: string,
  envValue: string | undefined,
): string {
  if (shouldUseApiProxy()) return proxyPath;
  return envValue ?? directApiBase();
}

export const API_BASE = shouldUseApiProxy()
  ? "/api-proxy/gateway"
  : directApiBase();

/**
 * Service roots. Getters re-evaluate so an HTTPS tab never keeps a baked-in
 * `http://` NEXT_PUBLIC_*_BASE (Mixed Content).
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
