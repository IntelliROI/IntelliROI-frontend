"use client";

import Link from "next/link";
import { Panel } from "@/components/ui/panel";

/**
 * Shown when AI spend exists but Estimated ROI value/time-saved are still 0.
 * Matches backend ComputeROIv1: needs job role hourly_cost + approved task benchmark.
 */
export function EstimatedRoiSetupHint({
  companySlug,
  visible,
}: {
  companySlug: string;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <Panel className="mt-px border-0 border-l-2 border-l-accent bg-ink p-5 md:p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
        Estimated ROI setup
      </p>
      <p className="mt-2 max-w-2xl text-sm text-text-secondary">
        Time saved and business value stay at zero until the chatting employee has a{" "}
        <strong className="font-medium text-text-primary">job role</strong> (hourly cost)
        and an{" "}
        <strong className="font-medium text-text-primary">approved task benchmark</strong>{" "}
        for the task category used in AI Workspace. After you set those up, the ROI worker
        recomputes placeholder (zero) rows automatically — hard-refresh the dashboard after
        ~30s. Provider AI cost (USD) is converted into company currency via{" "}
        <code className="font-mono text-[11px] text-text-primary">usd_fx_rate</code>{" "}
        (default INR 83) so value and spend use the same currency.
      </p>
      <ol className="mt-3 list-decimal space-y-1 pl-5 font-mono text-[11px] text-text-secondary">
        <li>
          <Link
            href={`/${companySlug}/organization/job-roles`}
            className="text-accent underline-offset-2 hover:underline"
          >
            Create / set job role hourly cost
          </Link>
          {" · "}
          assign it on the employee
        </li>
        <li>
          <Link
            href={`/${companySlug}/business-context/task-benchmarks`}
            className="text-accent underline-offset-2 hover:underline"
          >
            Add task benchmark
          </Link>
          {" "}
          (category + job role + minutes saved) → Approve
        </li>
        <li>
          In AI Workspace select that project + task category → send a prompt (or wait for
          pending ROI recompute on older chats)
        </li>
      </ol>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary/70">
        Formula · hours = minutes/60 · value = hourly_cost × hours · ROI% =
        (value − AI cost local) / AI cost local × 100
      </p>
    </Panel>
  );
}
