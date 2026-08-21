const LOGOS = [
  "OPENAI", "ANTHROPIC", "GOOGLE CLOUD", "AZURE", "AWS BEDROCK",
  "GITHUB", "SNOWFLAKE", "DATADOG", "PALANTIR", "STRIPE", "VERCEL", "GRAFANA",
];

const Marquee = () => (
  <section className="border-y border-hairline py-10" data-testid="trusted-by-section">
    <p className="mb-8 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-text-secondary">
      Trusted by enterprises running on the world's leading AI stack
    </p>
    <div
      className="relative overflow-hidden"
      style={{
        maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <div className="flex w-max animate-marquee items-center gap-16 pr-16">
        {[...LOGOS, ...LOGOS].map((logo, i) => (
          <span
            key={`${logo}-${i}`}
            className="whitespace-nowrap font-mono text-lg tracking-[0.3em] text-text-secondary/40 transition-colors duration-300 hover:text-accent"
            data-testid={i < LOGOS.length ? `marquee-logo-${logo.toLowerCase().replace(/\s+/g, "-")}` : undefined}
          >
            {logo}
            <span className="ml-16 text-accent/30">//</span>
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default Marquee;
