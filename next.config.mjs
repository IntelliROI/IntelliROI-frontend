/**
 * Absolute upstream for same-origin /api-proxy/* rewrites.
 * Never use a relative path as destination (avoids rewrite loops).
 */
function absoluteUpstream(...candidates) {
  for (const value of candidates) {
    if (!value) continue;
    const trimmed = value.replace(/\/$/, "");
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
  }
  return null;
}

function proxyRewrites() {
  if (process.env.NEXT_PUBLIC_USE_API_PROXY !== "true") {
    return [];
  }

  const gateway =
    absoluteUpstream(
      process.env.GATEWAY_UPSTREAM,
      process.env.NEXT_PUBLIC_API_BASE,
    ) ?? "http://127.0.0.1:8080";

  const map = [
    ["auth", process.env.AUTH_UPSTREAM, process.env.NEXT_PUBLIC_AUTH_BASE, 8081],
    ["org", process.env.ORG_UPSTREAM, process.env.NEXT_PUBLIC_ORG_BASE, 8082],
    ["bc", process.env.BC_UPSTREAM, process.env.NEXT_PUBLIC_BC_BASE, 8083],
    ["ai", process.env.AI_UPSTREAM, process.env.NEXT_PUBLIC_AI_BASE, 8084],
    ["cost", process.env.COST_UPSTREAM, process.env.NEXT_PUBLIC_COST_BASE, 8085],
    ["roi", process.env.ROI_UPSTREAM, process.env.NEXT_PUBLIC_ROI_BASE, 8086],
    [
      "analytics",
      process.env.ANALYTICS_UPSTREAM,
      process.env.NEXT_PUBLIC_ANALYTICS_BASE,
      8087,
    ],
    [
      "notify",
      process.env.NOTIFY_UPSTREAM,
      process.env.NEXT_PUBLIC_NOTIFY_BASE,
      8088,
    ],
    [
      "billing",
      process.env.BILLING_UPSTREAM,
      process.env.NEXT_PUBLIC_BILLING_BASE,
      8089,
    ],
  ];

  const rewrites = [
    {
      source: "/api-proxy/gateway/:path*",
      destination: `${gateway}/:path*`,
    },
  ];

  for (const [key, upstreamEnv, publicBase, port] of map) {
    const dest =
      absoluteUpstream(upstreamEnv, publicBase, gateway) ??
      `http://127.0.0.1:${port}`;
    rewrites.push({
      source: `/api-proxy/${key}/:path*`,
      destination: `${dest}/:path*`,
    });
  }

  return rewrites;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  async rewrites() {
    return proxyRewrites();
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
