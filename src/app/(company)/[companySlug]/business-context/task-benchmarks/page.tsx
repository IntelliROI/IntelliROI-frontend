"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageHeader,
  LoadingBlock,
  DataTable,
  GridView,
  ViewToggle,
  type ViewMode,
  type GridCard,
} from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { businessContextApi } from "@/features/business-context/api/business-context.api";
import { organizationApi } from "@/features/organization/api/organization.api";
import { Can } from "@/lib/rbac/Can";
import { toast } from "sonner";

export default function TaskBenchmarksPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const [view, setView] = useState<ViewMode>("table");
  const [showForm, setShowForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [form, setForm] = useState({
    task_category_id: "",
    job_role_id: "",
    estimated_minutes_saved: "",
  });

  const benchmarks = useQuery({
    queryKey: ["company", params.companySlug, "benchmarks"],
    queryFn: () => businessContextApi.listBenchmarks(),
  });
  const categories = useQuery({
    queryKey: ["company", params.companySlug, "task-categories"],
    queryFn: () => businessContextApi.listTaskCategories(),
  });
  const roles = useQuery({
    queryKey: ["company", params.companySlug, "job-roles"],
    queryFn: () => organizationApi.listJobRoles(),
  });

  const catMap = useMemo(
    () =>
      Object.fromEntries((categories.data ?? []).map((c) => [c.id, c.name])),
    [categories.data],
  );
  const roleMap = useMemo(
    () =>
      Object.fromEntries((roles.data ?? []).map((r) => [r.id, r.role_name])),
    [roles.data],
  );

  async function onCreateCategory(e: FormEvent) {
    e.preventDefault();
    if (!categoryName.trim()) return;
    try {
      await businessContextApi.createTaskCategory({ name: categoryName.trim() });
      toast.success("Category created");
      setCategoryName("");
      categories.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    }
  }

  async function onCreateBenchmark(e: FormEvent) {
    e.preventDefault();
    try {
      await businessContextApi.createBenchmark({
        task_category_id: Number(form.task_category_id),
        job_role_id: Number(form.job_role_id),
        estimated_minutes_saved: Number(form.estimated_minutes_saved),
      });
      toast.success("Benchmark submitted");
      setForm({ task_category_id: "", job_role_id: "", estimated_minutes_saved: "" });
      setShowForm(false);
      benchmarks.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    }
  }

  const rows = (benchmarks.data ?? []).map((b) => ({
    category: (
      <span className="font-medium text-text-primary">
        {catMap[b.task_category_id] ?? `Category ${b.task_category_id}`}
      </span>
    ),
    role: roleMap[b.job_role_id] ?? `Role ${b.job_role_id}`,
    saved: (
      <span className="font-mono text-[12px] font-medium text-accent">
        −{b.estimated_minutes_saved}m
      </span>
    ),
    status: (
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary/60">
        {b.status}
      </span>
    ),
    action:
      b.status === "pending" ? (
        <Can resource="benchmarks" action="approve">
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await businessContextApi.approveBenchmark(b.id);
                  toast.success("Approved");
                  benchmarks.refetch();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Request failed");
                }
              }}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                try {
                  await businessContextApi.rejectBenchmark(b.id);
                  toast.message("Rejected");
                  benchmarks.refetch();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Request failed");
                }
              }}
            >
              Reject
            </Button>
          </div>
        </Can>
      ) : null,
  }));

  const cards: GridCard[] = (benchmarks.data ?? []).map((b) => ({
    title: catMap[b.task_category_id] ?? `Category ${b.task_category_id}`,
    subtitle: roleMap[b.job_role_id] ?? `Role ${b.job_role_id}`,
    badge: (
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary/60">
        {b.status}
      </span>
    ),
    metrics: [
      { label: "Minutes saved", value: <span className="text-accent">−{b.estimated_minutes_saved}m</span> },
    ],
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Governance · Business Context"
        title="Task Benchmarks"
        description="Minutes saved by task category and job role — the backbone of Estimated ROI math."
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} />
            <Can resource="benchmarks" action="create">
              <Button size="sm" onClick={() => setShowForm((v) => !v)}>
                {showForm ? "Close" : "Add benchmark"}
              </Button>
            </Can>
          </div>
        }
      />

      {showForm && (
        <div className="mb-8 grid gap-6 border border-hairline p-6 lg:grid-cols-2">
          <form onSubmit={onCreateCategory} className="space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Task category
            </p>
            <Label>Name</Label>
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Code Generation"
            />
            <Button type="submit" size="sm" variant="secondary">
              Add category
            </Button>
          </form>
          <form onSubmit={onCreateBenchmark} className="space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Benchmark
            </p>
            <Label>Category</Label>
            <Select
              value={form.task_category_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, task_category_id: e.target.value }))
              }
              required
            >
              <option value="">Select category</option>
              {(categories.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Label>Job role</Label>
            <Select
              value={form.job_role_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, job_role_id: e.target.value }))
              }
              required
            >
              <option value="">Select job role</option>
              {(roles.data ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.role_name}
                </option>
              ))}
            </Select>
            <Label>Estimated minutes saved</Label>
            <Input
              type="number"
              min={1}
              step="0.5"
              value={form.estimated_minutes_saved}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  estimated_minutes_saved: e.target.value,
                }))
              }
              required
            />
            <Button type="submit" size="sm">
              Submit benchmark
            </Button>
          </form>
        </div>
      )}

      {benchmarks.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : view === "table" ? (
        <DataTable
          columns={[
            { key: "category", label: "Category", sortable: true },
            { key: "role", label: "Job role" },
            { key: "saved", label: "Time saved", align: "right" },
            { key: "status", label: "Status" },
            { key: "action", label: "Actions", align: "right" },
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
