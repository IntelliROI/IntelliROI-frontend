"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageHeader,
  LoadingBlock,
  DataTable,
  GridView,
  ViewToggle,
  EmptyState,
  type ViewMode,
  type GridCard,
} from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
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
    confidence_score: "70",
  });
  const [editing, setEditing] = useState<null | {
    id: number;
    estimated_minutes_saved: string;
    confidence_score: string;
  }>(null);

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

  const visible = (benchmarks.data ?? []).filter((b) => b.status !== "archived");

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

  async function onSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      await businessContextApi.updateBenchmark(editing.id, {
        estimated_minutes_saved: Number(editing.estimated_minutes_saved),
        confidence_score: Number(editing.confidence_score) || 0,
      });
      toast.success("Benchmark updated");
      setEditing(null);
      benchmarks.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    }
  }

  async function onCreateBenchmark(e: FormEvent) {
    e.preventDefault();
    try {
      const created = await businessContextApi.createBenchmark({
        task_category_id: Number(form.task_category_id),
        job_role_id: Number(form.job_role_id),
        estimated_minutes_saved: Number(form.estimated_minutes_saved),
        confidence_score: Number(form.confidence_score) || 50,
      });
      toast.success(
        created.status === "approved"
          ? "Benchmark created and approved"
          : "Benchmark submitted for approval",
      );
      setForm({
        task_category_id: "",
        job_role_id: "",
        estimated_minutes_saved: "",
        confidence_score: "70",
      });
      setShowForm(false);
      benchmarks.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    }
  }

  const rows = visible.map((b) => ({
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
    confidence: (
      <span className="font-mono text-[12px] text-text-secondary">
        {b.confidence_score}%
      </span>
    ),
    status: (
      <span
        className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
          b.status === "approved"
            ? "text-accent"
            : b.status === "rejected"
              ? "text-danger"
              : "text-warning"
        }`}
      >
        {b.status}
      </span>
    ),
    action: (
      <Can resource="benchmarks" action="approve">
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              setEditing({
                id: b.id,
                estimated_minutes_saved: String(b.estimated_minutes_saved),
                confidence_score: String(b.confidence_score),
              })
            }
          >
            Edit
          </Button>
          {b.status === "pending" ? (
            <>
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    await businessContextApi.approveBenchmark(b.id);
                    toast.success("Approved");
                    benchmarks.refetch();
                  } catch (err) {
                    toast.error(
                      err instanceof Error ? err.message : "Request failed",
                    );
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
                    toast.error(
                      err instanceof Error ? err.message : "Request failed",
                    );
                  }
                }}
              >
                Reject
              </Button>
            </>
          ) : null}
          {b.status === "pending" || b.status === "rejected" ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                try {
                  await businessContextApi.archiveBenchmark(b.id);
                  toast.message("Archived");
                  benchmarks.refetch();
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : "Request failed",
                  );
                }
              }}
            >
              Archive
            </Button>
          ) : null}
        </div>
      </Can>
    ),
  }));

  const cards: GridCard[] = visible.map((b) => ({
    title: catMap[b.task_category_id] ?? `Category ${b.task_category_id}`,
    subtitle: roleMap[b.job_role_id] ?? `Role ${b.job_role_id}`,
    badge: (
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary/60">
        {b.status}
      </span>
    ),
    metrics: [
      {
        label: "Minutes saved",
        value: <span className="text-accent">−{b.estimated_minutes_saved}m</span>,
      },
      { label: "Confidence", value: `${b.confidence_score}%` },
    ],
  }));

  const noCategories = (categories.data ?? []).length === 0;

  return (
    <div>
      <PageHeader
        eyebrow="Governance · Business Context"
        title="Task Benchmarks"
        description="Minutes saved by task category and job role — the backbone of Estimated ROI. Create a category, then submit a benchmark (owners auto-approve)."
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} />
            <Can resource="benchmarks" action="create">
              <Button size="sm" onClick={() => setShowForm(true)}>
                Add benchmark
              </Button>
            </Can>
          </div>
        }
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        eyebrow="Business context"
        title="Add benchmark"
        description="Create a task category if needed, then submit minutes saved by job role."
        size="lg"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={onCreateCategory} className="space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              1 · Task category
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
            {noCategories ? (
              <p className="text-xs text-text-secondary">
                Create at least one category before submitting a benchmark.
              </p>
            ) : null}
          </form>
          <form onSubmit={onCreateBenchmark} className="space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              2 · Benchmark
            </p>
            <Label>Category</Label>
            <Select
              value={form.task_category_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, task_category_id: e.target.value }))
              }
              required
              disabled={noCategories}
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
            <Label>Confidence (0–100)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.confidence_score}
              onChange={(e) =>
                setForm((f) => ({ ...f, confidence_score: e.target.value }))
              }
            />
            <Button type="submit" size="sm" disabled={noCategories}>
              Submit benchmark
            </Button>
          </form>
        </div>
      </Modal>

      <Modal
        open={editing != null}
        onClose={() => setEditing(null)}
        eyebrow="Business context"
        title="Edit benchmark"
        description="Update minutes saved or confidence for this task/job-role pair."
        size="sm"
      >
        {editing ? (
          <form onSubmit={onSaveEdit} className="space-y-3">
            <Label>Estimated minutes saved</Label>
            <Input
              type="number"
              min={1}
              step="0.5"
              value={editing.estimated_minutes_saved}
              onChange={(e) =>
                setEditing((cur) =>
                  cur
                    ? { ...cur, estimated_minutes_saved: e.target.value }
                    : cur,
                )
              }
              required
            />
            <Label>Confidence (0–100)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={editing.confidence_score}
              onChange={(e) =>
                setEditing((cur) =>
                  cur ? { ...cur, confidence_score: e.target.value } : cur,
                )
              }
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save changes
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>

      {benchmarks.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No task benchmarks yet"
          description="Add a task category, then submit minutes-saved per job role so Estimated ROI can compute business value."
          action={
            <Can resource="benchmarks" action="create">
              <Button size="sm" onClick={() => setShowForm(true)}>
                Add benchmark
              </Button>
            </Can>
          }
        />
      ) : view === "table" ? (
        <DataTable
          columns={[
            { key: "category", label: "Category", sortable: true },
            { key: "role", label: "Job role" },
            { key: "saved", label: "Time saved", align: "right" },
            { key: "confidence", label: "Confidence", align: "right" },
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
