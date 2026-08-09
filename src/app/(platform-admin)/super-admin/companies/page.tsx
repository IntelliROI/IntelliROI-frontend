"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  PageHeader,
  LoadingBlock,
  DataTable,
  GridView,
  ViewToggle,
  type ViewMode,
  type GridCard,
} from "@/components/feedback/States";
import { platformApi } from "@/features/system-config/api/platform.api";
import { useState } from "react";

const planBadge = (plan?: string | null) => {
  const p = plan ?? "free";
  const cls =
    p === "enterprise"
      ? "text-accent"
      : p === "pro"
        ? "text-accent-blue"
        : "text-text-secondary/60";
  return (
    <span className={`font-mono text-[11px] uppercase tracking-[0.12em] ${cls}`}>
      {p}
    </span>
  );
};

const statusBadge = (status: string) => {
  const cls =
    status === "active"
      ? "text-accent"
      : status === "trial"
        ? "text-warning"
        : "text-danger";
  return (
    <span className={`font-mono text-[11px] uppercase tracking-[0.12em] ${cls}`}>
      {status}
    </span>
  );
};

export default function CompaniesPage() {
  const [view, setView] = useState<ViewMode>("table");

  const companies = useQuery({
    queryKey: ["platform", "companies"],
    queryFn: () => platformApi.companies(),
  });

  const rows = (companies.data ?? []).map((c) => ({
    name: <span className="font-medium text-text-primary">{c.name}</span>,
    plan: planBadge(c.plan),
    status: statusBadge(c.status),
    industry: c.industry ?? "—",
    action: (
      <Link
        href={`/super-admin/companies/${c.uuid}`}
        className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent transition-colors hover:text-accent/70"
      >
        Inspect →
      </Link>
    ),
  }));

  const cards: GridCard[] = (companies.data ?? []).map((c) => ({
    title: c.name,
    subtitle: c.industry ?? "—",
    badge: statusBadge(c.status),
    metrics: [
      { label: "Plan", value: planBadge(c.plan) },
      { label: "Status", value: statusBadge(c.status) },
    ],
    action: (
      <Link
        href={`/super-admin/companies/${c.uuid}`}
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent transition-colors hover:text-accent/70"
      >
        Inspect →
      </Link>
    ),
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Platform · Tenants"
        title="Organizations"
        description="All companies registered on the IntelliROI platform."
        actions={
          <ViewToggle view={view} onViewChange={setView} />
        }
      />

      {companies.isLoading ? (
        <LoadingBlock className="h-64" />
      ) : view === "table" ? (
        <DataTable
          columns={[
            { key: "name", label: "Company", sortable: true },
            { key: "plan", label: "Plan" },
            { key: "status", label: "Status" },
            { key: "industry", label: "Industry", sortable: true },
            { key: "action", label: "", width: "w-24" },
          ]}
          rows={rows}
          showIndex
        />
      ) : (
        <GridView cards={cards} cols={3} />
      )}
    </div>
  );
}
