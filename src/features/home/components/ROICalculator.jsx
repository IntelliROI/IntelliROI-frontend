import { useState } from "react";
import { Reveal, Chapter, SectionShell, CountUp } from "./shared";

const fmt = (n) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const ROICalculator = () => {
  const [employees, setEmployees] = useState(250);
  const [spend, setSpend] = useState(140);

  const monthlyCost = employees * spend;
  const hoursSaved = employees * 6.5;
  const businessValue = hoursSaved * 95;
  const roi = Math.round(((businessValue - monthlyCost) / monthlyCost) * 100);

  return (
    <SectionShell id="roi" className="border-t border-hairline">
      <Reveal>
        <Chapter number="05" label="ROI Engine" id="roi" />
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="mt-10 max-w-3xl text-3xl font-medium tracking-tight text-text-primary md:text-5xl" data-testid="roi-headline">
          Run your own numbers. <span className="text-accent">The math is the pitch.</span>
        </h2>
      </Reveal>

      <div className="mt-16 grid grid-cols-1 gap-px border border-hairline bg-hairline lg:grid-cols-2" data-testid="roi-calculator">
        <Reveal className="h-full">
          <div className="flex h-full flex-col justify-center gap-12 bg-ink p-8 md:p-12">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <label htmlFor="roi-employees" className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                  Employees using AI
                </label>
                <span className="font-mono text-lg text-text-primary" data-testid="roi-employees-value">{fmt(employees)}</span>
              </div>
              <input
                id="roi-employees"
                type="range"
                min="10"
                max="5000"
                step="10"
                value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                className="w-full"
                data-testid="roi-employees-slider"
              />
              <div className="mt-2 flex justify-between font-mono text-[9px] text-text-secondary/50">
                <span>10</span><span>5,000</span>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <label htmlFor="roi-spend" className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                  Monthly AI spend per employee
                </label>
                <span className="font-mono text-lg text-text-primary" data-testid="roi-spend-value">${fmt(spend)}</span>
              </div>
              <input
                id="roi-spend"
                type="range"
                min="5"
                max="400"
                step="5"
                value={spend}
                onChange={(e) => setSpend(Number(e.target.value))}
                className="w-full"
                data-testid="roi-spend-slider"
              />
              <div className="mt-2 flex justify-between font-mono text-[9px] text-text-secondary/50">
                <span>$5</span><span>$400</span>
              </div>
            </div>

            <p className="font-mono text-[10px] leading-relaxed tracking-wider text-text-secondary/60">
              MODEL ASSUMES 6.5 HOURS SAVED / EMPLOYEE / MO AT $95 BLENDED HOURLY VALUE — CONSERVATIVE VS. PUBLISHED ENTERPRISE BENCHMARKS.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="h-full">
          <div className="flex h-full flex-col bg-surface/60 p-8 md:p-12">
            <div className="mb-8 flex items-center justify-between border-b border-hairline pb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                OUTPUT / MONTHLY
              </span>
              <span className="font-mono text-[10px] text-accent">LIVE CALC</span>
            </div>

            <div className="grid flex-1 grid-cols-2 content-start gap-px border border-hairline bg-hairline">
              <div className="bg-ink p-6" data-testid="roi-output-cost">
                <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-secondary">AI Cost</div>
                <div className="mt-2 font-mono text-2xl font-light text-text-primary md:text-3xl">
                  $<CountUp value={monthlyCost} />
                </div>
              </div>
              <div className="bg-ink p-6" data-testid="roi-output-value">
                <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-secondary">Business Value</div>
                <div className="mt-2 font-mono text-2xl font-light text-text-primary md:text-3xl">
                  $<CountUp value={Math.round(businessValue)} />
                </div>
              </div>
              <div className="bg-ink p-6" data-testid="roi-output-hours">
                <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-secondary">Hours Saved</div>
                <div className="mt-2 font-mono text-2xl font-light text-text-primary md:text-3xl">
                  <CountUp value={Math.round(hoursSaved)} suffix="h" />
                </div>
              </div>
              <div className="bg-ink p-6" data-testid="roi-output-payback">
                <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-secondary">Net Gain</div>
                <div className="mt-2 font-mono text-2xl font-light text-text-primary md:text-3xl">
                  $<CountUp value={Math.round(businessValue - monthlyCost)} />
                </div>
              </div>
            </div>

            <div className="mt-8 border border-accent/40 bg-accent/5 p-6 text-center" data-testid="roi-output-roi">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#CBD5E1]">
                Return on AI Investment
              </div>
              <div className="mt-2 font-mono text-6xl font-light text-accent md:text-7xl">
                <CountUp value={roi} suffix="%" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
};

export default ROICalculator;
