import Link from "next/link";
import { Check, ArrowUpRight } from "lucide-react";
import { Reveal, Chapter, SectionShell } from "./shared";

const PLANS = [
  {
    name: "Starter",
    price: "$490",
    period: "/ MO",
    tag: "FOR FIRST AI TEAMS",
    features: ["Up to 50 seats", "Token tracking", "Cost monitoring", "Core analytics", "Email support"],
    cta: "Register",
    href: "/register-company",
    featured: false,
  },
  {
    name: "Growth",
    price: "$1,900",
    period: "/ MO",
    tag: "FOR SCALING ADOPTION",
    features: ["Up to 500 seats", "Department analytics", "Model comparison", "Budget alerts", "Slack + Teams alerts", "Priority support"],
    cta: "Register",
    href: "/register-company",
    featured: false,
  },
  {
    name: "Enterprise",
    price: "CUSTOM",
    period: "",
    tag: "RECOMMENDED",
    features: ["Unlimited seats", "ROI engine + exec dashboard", "SSO / SAML + SCIM", "Immutable audit logs", "VPC deployment", "Dedicated CSM + 99.99% SLA"],
    cta: "Register",
    href: "/register-company",
    featured: true,
  },
];

const Pricing = () => (
  <SectionShell id="pricing" className="border-t border-hairline">
    <Reveal>
      <Chapter number="09" label="Pricing" id="pricing" />
    </Reveal>
    <Reveal delay={0.1}>
      <h2 className="mt-10 max-w-3xl text-3xl font-medium tracking-tight text-text-primary md:text-5xl" data-testid="pricing-headline">
        Priced like infrastructure. <span className="text-accent">Returns like leverage.</span>
      </h2>
    </Reveal>

    <div className="mt-16 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3" data-testid="pricing-grid">
      {PLANS.map((p, i) => (
        <Reveal key={p.name} delay={i * 0.1} className="h-full">
          <div
            className={`relative flex h-full flex-col p-8 transition-colors duration-500 md:p-10 ${
              p.featured
                ? "border border-accent/60 bg-surface shadow-[0_0_60px_rgba(0,229,168,0.12)] lg:-my-4 lg:py-14"
                : "border border-hairline bg-ink hover:border-accent/40"
            }`}
            data-testid={`pricing-card-${p.name.toLowerCase()}`}
          >
            {p.featured && (
              <span className="absolute -top-3 left-8 border border-accent bg-ink px-3 py-1 font-mono text-[9px] tracking-[0.25em] text-accent">
                {p.tag}
              </span>
            )}
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-secondary">
              {p.featured ? "ENTERPRISE" : p.tag}
            </div>
            <h3 className="mt-3 text-2xl font-medium tracking-tight text-text-primary">{p.name}</h3>
            <div className="mt-6 flex items-baseline gap-2">
              <span className={`font-mono text-4xl font-light md:text-5xl ${p.featured ? "text-accent" : "text-text-primary"}`}>
                {p.price}
              </span>
              {p.period && <span className="font-mono text-xs text-text-secondary">{p.period}</span>}
            </div>
            <ul className="mt-8 flex-1 space-y-3 border-t border-hairline pt-8">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-text-secondary">
                  <Check size={15} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={p.href}
              data-testid={`pricing-cta-${p.name.toLowerCase()}`}
              className={`group mt-10 flex items-center justify-center gap-2 px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300 ${
                p.featured
                  ? "border border-accent bg-accent text-ink hover:bg-transparent hover:text-accent"
                  : "border border-hairline text-text-primary hover:border-accent/60 hover:text-accent"
              }`}
            >
              {p.cta}
              <ArrowUpRight size={14} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </Reveal>
      ))}
    </div>
  </SectionShell>
);

export default Pricing;
