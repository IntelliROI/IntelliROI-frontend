import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, scrollToId } from "./shared";

const FinalCTA = () => (
  <>
    <section className="relative overflow-hidden border-t border-hairline py-28 md:py-40" data-testid="final-cta-section">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,229,168,0.1)_0%,rgba(9,9,11,0)_65%)]" />
      </div>
      <div className="relative mx-auto max-w-[1100px] px-6 text-center md:px-12">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-secondary">
            // Final Transmission
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-8 text-4xl font-light leading-[1.05] tracking-tighter text-text-primary md:text-6xl lg:text-7xl" data-testid="final-cta-headline">
            Turn AI Spending Into{" "}
            <span className="text-accent">
              Business Intelligence
            </span>
            <span className="animate-blink text-accent">_</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-text-secondary md:text-lg">
            Join the enterprises that treat AI as a measured investment — not an
            act of faith.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register-company"
              data-testid="final-cta-register-button"
              className="group flex items-center gap-2 border border-accent bg-accent px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink shadow-[0_0_50px_rgba(0,229,168,0.3)] transition-all duration-300 hover:bg-transparent hover:text-accent"
            >
              Register
              <ArrowUpRight size={15} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/login"
              data-testid="final-cta-login-button"
              className="border border-hairline px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] text-text-primary transition-colors duration-300 hover:border-accent/50 hover:text-accent"
            >
              Login
            </Link>
          </div>
        </Reveal>
      </div>
    </section>

    <footer className="border-t border-hairline" data-testid="footer">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-12 px-6 py-16 md:grid-cols-12 md:px-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center border border-accent/60 bg-accent/10">
              <span className="h-2 w-2 bg-accent" />
            </span>
            <span className="font-mono text-sm font-semibold tracking-[0.2em] text-text-primary">INTELLIROI</span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-text-secondary">
            The operating system for enterprise AI intelligence and ROI. Every
            token accountable. Every dollar visible.
          </p>
          <div className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
            All systems operational
          </div>
        </div>
        {[
          { h: "PLATFORM", links: [["AI Gateway", "#solution"], ["ROI Engine", "#roi"], ["Dashboard", "#dashboard"], ["Integrations", "#integrations"]] },
          { h: "COMPANY", links: [["Security", "#security"], ["Pricing", "#pricing"], ["FAQ", "#faq"], ["Register", "/register-company"], ["Login", "/login"]] },
          { h: "COMPLIANCE", links: [["SOC 2", "#security"], ["GDPR", "#security"], ["Audit Logs", "#security"], ["SSO / SAML", "#security"]] },
        ].map((col) => (
          <div key={col.h} className="md:col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-secondary/60">{col.h}</div>
            <ul className="mt-5 space-y-3">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  {href.startsWith("/") ? (
                    <Link
                      href={href}
                      className="text-sm text-text-secondary transition-colors duration-300 hover:text-accent"
                    >
                      {label}
                    </Link>
                  ) : (
                    <a
                      href={href}
                      onClick={(e) => { e.preventDefault(); scrollToId(href); }}
                      className="text-sm text-text-secondary transition-colors duration-300 hover:text-accent"
                    >
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="md:col-span-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-secondary/60">SIGNAL</div>
          <p className="mt-5 text-sm leading-relaxed text-text-secondary">
            Monthly intelligence on enterprise AI economics. No noise.
          </p>
          <div className="mt-4 flex border border-hairline">
            <input
              type="email"
              placeholder="you@company.com"
              data-testid="footer-newsletter-input"
              className="w-full bg-transparent px-4 py-3 font-mono text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none"
            />
            <button
              data-testid="footer-newsletter-button"
              className="shrink-0 border-l border-hairline px-4 font-mono text-[10px] uppercase tracking-widest text-accent transition-colors duration-300 hover:bg-accent hover:text-ink"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-hairline">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start justify-between gap-3 px-6 py-6 font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary/50 md:flex-row md:items-center md:px-12">
          <span>© 2026 INTELLIROI INC. — ALL TOKENS ACCOUNTED FOR</span>
          <span>BUILT FOR THE ENTERPRISE // V1.0</span>
        </div>
      </div>
    </footer>
  </>
);

export default FinalCTA;
