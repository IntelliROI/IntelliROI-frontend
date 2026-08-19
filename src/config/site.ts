/** Public api-gateway (:8080). Per-service NEXT_PUBLIC_*_BASE overrides are optional. */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8080";

export const services = {
  auth: process.env.NEXT_PUBLIC_AUTH_BASE ?? API_BASE,
  org: process.env.NEXT_PUBLIC_ORG_BASE ?? API_BASE,
  bc: process.env.NEXT_PUBLIC_BC_BASE ?? API_BASE,
  ai: process.env.NEXT_PUBLIC_AI_BASE ?? API_BASE,
  cost: process.env.NEXT_PUBLIC_COST_BASE ?? API_BASE,
  roi: process.env.NEXT_PUBLIC_ROI_BASE ?? API_BASE,
  analytics: process.env.NEXT_PUBLIC_ANALYTICS_BASE ?? API_BASE,
  notify: process.env.NEXT_PUBLIC_NOTIFY_BASE ?? API_BASE,
  billing: process.env.NEXT_PUBLIC_BILLING_BASE ?? API_BASE,
} as const;

export type ServiceKey = keyof typeof services;

export const site = {
  name: "IntelliROI",
  tagline: "Enterprise AI Intelligence OS",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};
