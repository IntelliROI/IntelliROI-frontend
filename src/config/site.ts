export const services = {
  auth: process.env.NEXT_PUBLIC_AUTH_BASE ?? "http://127.0.0.1:8081",
  org: process.env.NEXT_PUBLIC_ORG_BASE ?? "http://127.0.0.1:8082",
  bc: process.env.NEXT_PUBLIC_BC_BASE ?? "http://127.0.0.1:8083",
  ai: process.env.NEXT_PUBLIC_AI_BASE ?? "http://127.0.0.1:8084",
  cost: process.env.NEXT_PUBLIC_COST_BASE ?? "http://127.0.0.1:8085",
  roi: process.env.NEXT_PUBLIC_ROI_BASE ?? "http://127.0.0.1:8086",
  analytics: process.env.NEXT_PUBLIC_ANALYTICS_BASE ?? "http://127.0.0.1:8087",
  notify: process.env.NEXT_PUBLIC_NOTIFY_BASE ?? "http://127.0.0.1:8088",
  billing: process.env.NEXT_PUBLIC_BILLING_BASE ?? "http://127.0.0.1:8089",
} as const;

export type ServiceKey = keyof typeof services;

export const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export const site = {
  name: "IntelliROI",
  tagline: "Enterprise AI Intelligence OS",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};
