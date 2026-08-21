import { ShieldCheck, KeyRound, ScrollText, Lock, Users, BadgeCheck } from "lucide-react";
import { Reveal, Chapter, SectionShell } from "./shared";

const ITEMS = [
  { icon: ShieldCheck, title: "SOC 2 Type II Ready", desc: "Controls mapped and evidence exportable for your auditors." },
  { icon: KeyRound, title: "SSO & SAML", desc: "Okta, Entra ID, Google Workspace. SCIM provisioning included." },
  { icon: ScrollText, title: "Immutable Audit Logs", desc: "Every request, policy decision, and admin action — forever queryable." },
  { icon: Lock, title: "AES-256 Encryption", desc: "Encrypted in transit and at rest. Zero model training on your data." },
  { icon: Users, title: "Role-Based Access", desc: "Permissions that mirror your org chart, down to a single dashboard." },
  { icon: BadgeCheck, title: "Compliance", desc: "GDPR and CCPA aligned. Regional data residency on Enterprise." },
];

const Security = () => (
  <SectionShell id="security" className="border-t border-hairline bg-surface/20">
    <Reveal>
      <Chapter number="08" label="Security & Compliance" id="security" />
    </Reveal>
    <Reveal delay={0.1}>
      <h2 className="mt-10 max-w-3xl text-3xl font-medium tracking-tight text-text-primary md:text-5xl" data-testid="security-headline">
        Governance your CISO <span className="text-accent">will sign off on.</span>
      </h2>
    </Reveal>

    <div className="mt-16 grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3" data-testid="security-grid">
      {ITEMS.map((s, i) => (
        <Reveal key={s.title} delay={i * 0.06} className="h-full">
          <div className="group flex h-full gap-5 bg-ink p-8 transition-colors duration-500 hover:bg-surface" data-testid={`security-item-${s.title.toLowerCase().replace(/[\s&]+/g, "-")}`}>
            <s.icon size={22} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <h3 className="text-base font-medium tracking-tight text-text-primary">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{s.desc}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  </SectionShell>
);

export default Security;
