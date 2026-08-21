import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { Reveal, Chapter, SectionShell } from "./shared";

const FAQS = [
  {
    q: "How is ROI actually calculated?",
    a: "The ROI engine correlates token consumption with task completion signals from your integrated tools (Jira, GitHub, ticketing), then converts time saved and output gains into dollar value using your loaded cost rates. Every figure is traceable back to raw usage data — no black-box estimates.",
  },
  {
    q: "How secure is the platform?",
    a: "SOC 2 Type II ready controls, AES-256 encryption in transit and at rest, SSO/SAML with SCIM, immutable audit logs, and optional in-VPC deployment. Your prompts and data are never used to train any model.",
  },
  {
    q: "Can we keep our own AI provider contracts?",
    a: "Yes. IntelliROI brokers your existing OpenAI, Anthropic, Azure, Bedrock, and Gemini agreements. You keep your negotiated rates — we add the intelligence layer on top.",
  },
  {
    q: "Do employees need new accounts or workflows?",
    a: "No. Employees keep using the tools they already use. Requests route through the gateway transparently, with under 12ms of added latency. Provisioning happens through your existing IdP.",
  },
  {
    q: "Does it work with ChatGPT Enterprise?",
    a: "Yes. ChatGPT Enterprise, Claude for Enterprise, and Gemini for Workspace are all first-class sources. We ingest their admin telemetry and unify it with API traffic in one view.",
  },
  {
    q: "How long does onboarding take?",
    a: "Most enterprises see their first unified dashboard within 24 hours. Full org-chart mapping, budgets, and executive reporting typically complete inside the first week with a dedicated engineer.",
  },
];

const FAQ = () => {
  const [open, setOpen] = useState(0);

  return (
    <SectionShell id="faq" className="border-t border-hairline bg-surface/20">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Reveal>
            <Chapter number="10" label="Executive FAQ" id="faq" />
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-10 text-3xl font-medium tracking-tight text-text-primary md:text-4xl" data-testid="faq-headline">
              The questions your board <span className="text-accent">will ask.</span>
            </h2>
          </Reveal>
        </div>

        <div className="lg:col-span-8" data-testid="faq-list">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 0.04}>
                <div className="border-b border-hairline">
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    data-testid={`faq-question-${i}`}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className={`text-base font-medium tracking-tight transition-colors duration-300 md:text-lg ${isOpen ? "text-accent" : "text-text-primary"}`}>
                      {f.q}
                    </span>
                    <span className="shrink-0 text-text-secondary">
                      {isOpen ? <Minus size={18} strokeWidth={1.5} /> : <Plus size={18} strokeWidth={1.5} />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-7 text-sm leading-relaxed text-text-secondary md:text-base" data-testid={`faq-answer-${i}`}>
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
};

export default FAQ;
