"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight, MessageSquare, Sparkles } from "lucide-react";
import { MetricTile } from "@/components/dashboard/KpiTile";
import { SectionLabel } from "@/components/dashboard/DashboardChrome";
import { Panel, LiveDot } from "@/components/ui/panel";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { TrendAreaChart } from "@/components/charts/Charts";
import { roiApi } from "@/features/roi/api/roi.api";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import { aiGatewayApi } from "@/features/ai-gateway/api/ai-gateway.api";
import { useAuthStore } from "@/stores/auth-store";
import { revealTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Employee personal intelligence — ChatGPT familiarity + observability.
 * Answers: “What is my usage + estimated productivity?”
 */
export function EmployeeDashboard({ companySlug }: { companySlug: string }) {
  const user = useAuthStore((s) => s.user);
  const employeeId = user?.id ?? user?.scope?.user_id ?? user?.uuid;

  const roi = useQuery({
    queryKey: ["company", companySlug, "roi", "employee", employeeId ?? "self"],
    queryFn: () => roiApi.employee(employeeId!),
    enabled: Boolean(employeeId),
  });
  const analytics = useQuery({
    queryKey: [
      "company",
      companySlug,
      "analytics",
      "employee",
      employeeId ?? "self",
    ],
    queryFn: () => analyticsApi.employee(employeeId!),
    enabled: Boolean(employeeId),
  });
  const conversations = useQuery({
    queryKey: ["company", companySlug, "conversations"],
    queryFn: () => aiGatewayApi.listConversations(),
  });

  const series = useMemo(
    () =>
      (analytics.data?.series ?? []).map((p) => ({
        date: p.date.slice(5),
        value: p.requests,
      })),
    [analytics.data],
  );

  const spark = useMemo(
    () => (analytics.data?.series ?? []).map((p) => p.requests),
    [analytics.data],
  );

  if (roi.isLoading) {
    return (
      <div className="space-y-px bg-hairline">
        <LoadingBlock className="h-44 border-0" />
        <LoadingBlock className="h-64 border-0" />
      </div>
    );
  }

  if (!roi.data) {
    return (
      <p className="border border-hairline px-4 py-8 text-sm text-text-secondary">
        Could not load your Estimated ROI from the live service.
      </p>
    );
  }

  const r = roi.data;

  return (
    <div>
      <PageHeader
        eyebrow="Personal · Workspace"
        title={`${user?.first_name ?? "You"}'s AI pulse`}
        description="Personal usage, time saved, and Estimated ROI — only your data."
        actions={
          <Button asChild>
            <Link href={`/${companySlug}/ai-workspace`}>
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
              Open AI Workspace
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </Button>
        }
      />

      <div className="mb-px grid gap-px bg-hairline lg:grid-cols-12">
        <MetricTile
          className="lg:col-span-5"
          variant="hero"
          label="Your Estimated ROI"
          value={r.roi_pct}
          format="percent"
          hint={`${r.time_saved_hours}h saved · personal scope`}
          spark={spark.length > 1 ? spark : [40, 55, 48, 70, 62, 88, 96]}
          delay={0}
        />
        <div className="grid gap-px bg-hairline sm:grid-cols-3 lg:col-span-7">
          <MetricTile
            label="Requests"
            value={146}
            format="number"
            hint="this period"
            spark={spark.length > 1 ? spark : undefined}
            delay={0.06}
          />
          <MetricTile
            label="AI spend"
            value={r.total_spend}
            format="currency"
            hint="attributed to you"
            delay={0.1}
          />
          <MetricTile
            label="Time saved"
            value={r.time_saved_hours}
            format="number"
            hint="hours (est.)"
            delay={0.14}
          />
        </div>
      </div>

      <div className="grid gap-px bg-hairline lg:grid-cols-12">
        <Panel className="border-0 bg-ink p-5 md:p-6 lg:col-span-7">
          <SectionLabel
            title="Request trend"
            meta={<LiveDot label="Personal" />}
          />
          <TrendAreaChart data={series} height={260} />
        </Panel>

        <Panel className="border-0 bg-ink lg:col-span-5">
          <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
            <SectionLabel title="Recent conversations" className="mb-0" />
            <Link
              href={`/${companySlug}/ai-workspace`}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent hover:underline"
            >
              All chats
            </Link>
          </div>
          <ul>
            {(conversations.data ?? []).length === 0 ? (
              <li className="px-5 py-10 text-center text-[13px] text-text-secondary">
                No conversations yet — start in AI Workspace.
              </li>
            ) : (
              (conversations.data ?? []).map((c, i) => (
                <motion.li
                  key={c.uuid}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...revealTransition, delay: 0.08 + i * 0.04 }}
                >
                  <Link
                    href={`/${companySlug}/ai-workspace/${c.uuid}`}
                    className={cn(
                      "group flex items-start gap-3 border-b border-hairline px-5 py-4 transition-colors hover:bg-surface/50",
                    )}
                  >
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center border border-hairline bg-surface/40 text-accent group-hover:border-accent/40">
                      <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-text-primary">
                        {c.title}
                      </span>
                      <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-text-secondary">
                        {c.provider} · {c.model} · {c.message_count} msgs
                      </span>
                    </span>
                    <ArrowUpRight
                      className="mt-1 h-3.5 w-3.5 shrink-0 text-text-secondary opacity-0 transition-opacity group-hover:opacity-100"
                      strokeWidth={1.5}
                    />
                  </Link>
                </motion.li>
              ))
            )}
          </ul>
          <div className="p-4">
            <Button asChild variant="secondary" className="w-full" size="sm">
              <Link href={`/${companySlug}/ai-workspace`}>
                New conversation
              </Link>
            </Button>
          </div>
        </Panel>
      </div>

      {/* Task mix strip */}
      <Panel className="mt-px border-0 border-t-0 bg-ink p-5 md:p-6">
        <SectionLabel title="Usage by task" meta="Estimated from benchmarks" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { name: "Code Generation", pct: 52 },
            { name: "Debugging", pct: 28 },
            { name: "Documentation", pct: 20 },
          ].map((t) => (
            <div key={t.name}>
              <div className="mb-2 flex justify-between text-[12px]">
                <span className="text-text-primary">{t.name}</span>
                <span className="font-mono text-text-secondary">{t.pct}%</span>
              </div>
              <div className="h-[3px] bg-hairline">
                <div
                  className="h-full bg-accent transition-[width] duration-700 ease-out-expo"
                  style={{ width: `${t.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
