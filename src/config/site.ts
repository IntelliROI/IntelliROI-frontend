/**
 * Public api-gateway (:8080). Per-service NEXT_PUBLIC_*_BASE overrides are optional.
 *
 * On HTTPS hosts (e.g. Netlify), set NEXT_PUBLIC_USE_API_PROXY=true so the browser
 * only calls same-origin `/api-proxy/*`. Next/Netlify then forward to HTTP upstreams
 * (avoids Mixed Content). Upstream hosts are configured via *_UPSTREAM / next.config.
 */
const useApiProxy = process.env.NEXT_PUBLIC_USE_API_PROXY === "true";

export const API_BASE = useApiProxy
  ? "/api-proxy/gateway"
  : (process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8080");

function serviceBase(
  proxyPath: string,
  envValue: string | undefined,
): string {
  if (useApiProxy) return proxyPath;
  return envValue ?? API_BASE;
}

export const services = {
  auth: serviceBase("/api-proxy/auth", process.env.NEXT_PUBLIC_AUTH_BASE),
  org: serviceBase("/api-proxy/org", process.env.NEXT_PUBLIC_ORG_BASE),
  bc: serviceBase("/api-proxy/bc", process.env.NEXT_PUBLIC_BC_BASE),
  ai: serviceBase("/api-proxy/ai", process.env.NEXT_PUBLIC_AI_BASE),
  cost: serviceBase("/api-proxy/cost", process.env.NEXT_PUBLIC_COST_BASE),
  roi: serviceBase("/api-proxy/roi", process.env.NEXT_PUBLIC_ROI_BASE),
  analytics: serviceBase(
    "/api-proxy/analytics",
    process.env.NEXT_PUBLIC_ANALYTICS_BASE,
  ),
  notify: serviceBase("/api-proxy/notify", process.env.NEXT_PUBLIC_NOTIFY_BASE),
  billing: serviceBase(
    "/api-proxy/billing",
    process.env.NEXT_PUBLIC_BILLING_BASE,
  ),
} as const;

export type ServiceKey = keyof typeof services;

export const site = {
  name: "IntelliROI",
  tagline: "Enterprise AI Intelligence OS",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};
