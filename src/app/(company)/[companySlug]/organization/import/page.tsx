"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { PageHeader, DataTable, EmptyState } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Can } from "@/lib/rbac/Can";
import { ApiError } from "@/lib/api/client";
import {
  organizationApi,
  type ImportJob,
  type ImportPreview,
  type ImportPreviewAction,
} from "@/features/organization/api/organization.api";
import {
  useImportJob,
  useImportRows,
} from "@/features/organization/hooks/useOrganizationQueries";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 8 * 1024 * 1024;

const TEMPLATE_CSV = `email,first_name,last_name,role,employee_code,phone,designation,department_name,team_name,manager_email,joining_date,department_code,team_code,lead_email,project_name,project_members
priya.rao@example.com,Priya,Rao,department_manager,EMP-101,,Head of Engineering,Engineering,,,2024-01-15,ENG,,,,
arun.kumar@example.com,Arun,Kumar,team_lead,EMP-102,,Team Lead,Engineering,Platform,priya.rao@example.com,2024-02-01,ENG,PLT,,,
sara.jain@example.com,Sara,Jain,employee,EMP-103,,Software Engineer,Engineering,Platform,arun.kumar@example.com,2024-03-10,ENG,PLT,arun.kumar@example.com,Gateway Rollout,
`;

type Step = "upload" | "previewed" | "job";

const ACTION_STYLES: Record<ImportPreviewAction, string> = {
  create: "text-accent",
  update: "text-accent-blue",
  skip: "text-text-secondary/60",
  fail: "text-danger",
};

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "intelliroi-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function countDataRows(csvText: string): number {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim() !== "");
  return Math.max(0, lines.length - 1);
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "accent" | "danger" | "muted";
}) {
  return (
    <div className="border border-hairline bg-surface/10 px-4 py-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-secondary/55">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-[20px] font-semibold",
          tone === "accent" && "text-accent",
          tone === "danger" && "text-danger",
          tone === "muted" && "text-text-secondary/70",
          !tone && "text-text-primary",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function JobStatusBadge({ status }: { status: ImportJob["status"] }) {
  const map: Record<ImportJob["status"], { label: string; className: string }> = {
    queued: { label: "Queued", className: "text-text-secondary/70" },
    running: { label: "Running", className: "text-accent" },
    completed: { label: "Completed", className: "text-accent" },
    failed: { label: "Failed", className: "text-danger" },
    cancelled: { label: "Cancelled", className: "text-text-secondary/60" },
  };
  const s = map[status];
  return (
    <span
      className={cn(
        "font-mono text-[10px] font-semibold uppercase tracking-[0.18em]",
        s.className,
      )}
    >
      {s.label}
    </span>
  );
}

export default function BulkImportPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvText, setCsvText] = useState<string>("");
  const [rowCount, setRowCount] = useState(0);

  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [confirmed, setConfirmed] = useState(false);
  const [sendInviteEmails, setSendInviteEmails] = useState(true);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const [importUuid, setImportUuid] = useState<string | null>(null);
  const jobQuery = useImportJob(params.companySlug, importUuid);
  const job = jobQuery.data ?? null;
  const jobDone =
    job != null &&
    (job.status === "completed" ||
      job.status === "failed" ||
      job.status === "cancelled");

  const failedRows = useImportRows(params.companySlug, importUuid, {
    page: 1,
    pageSize: 50,
    status: "failed",
  });

  const [cancelling, setCancelling] = useState(false);

  const resetAll = useCallback(() => {
    setStep("upload");
    setFileName(null);
    setCsvText("");
    setRowCount(0);
    setPreview(null);
    setPreviewError(null);
    setConfirmed(false);
    setStartError(null);
    setImportUuid(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  function onFileSelected(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please choose a .csv file");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("File is too large (max 8 MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setFileName(file.name);
      setCsvText(text);
      setRowCount(countDataRows(text));
      setPreview(null);
      setPreviewError(null);
      setConfirmed(false);
      setStep("upload");
    };
    reader.onerror = () => toast.error("Could not read file");
    reader.readAsText(file);
  }

  async function runPreview() {
    if (!csvText) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const result = await organizationApi.previewImport(csvText);
      setPreview(result);
      setStep("previewed");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Preview failed";
      setPreviewError(message);
      toast.error(message);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function startImport() {
    if (!csvText || !confirmed) return;
    setStarting(true);
    setStartError(null);
    try {
      const created = await organizationApi.startImport(csvText, sendInviteEmails);
      setImportUuid(created.import_uuid);
      setStep("job");
      toast.success("Import started — processing in the background");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not start import";
      setStartError(message);
      toast.error(message);
    } finally {
      setStarting(false);
    }
  }

  async function cancelJob() {
    if (!importUuid) return;
    setCancelling(true);
    try {
      await organizationApi.cancelImport(importUuid);
      toast.success("Cancel requested");
      await jobQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel import");
    } finally {
      setCancelling(false);
    }
  }

  const previewRows = useMemo(
    () =>
      (preview?.rows ?? []).map((r) => ({
        row: r.row_number,
        pass: (
          <span className="font-mono text-[11px] text-text-secondary/70">
            {r.pass}
          </span>
        ),
        entity: (
          <span className="font-mono text-[11px] text-text-secondary/70">
            {r.entity}
          </span>
        ),
        key: <span className="text-[13px] text-text-primary">{r.natural_key}</span>,
        action: (
          <span
            className={cn(
              "font-mono text-[10px] font-semibold uppercase tracking-[0.14em]",
              ACTION_STYLES[r.action],
            )}
          >
            {r.action}
          </span>
        ),
        message: (
          <span className="text-[12px] text-text-secondary/70">
            {r.message ?? "—"}
          </span>
        ),
      })),
    [preview],
  );

  const progressPct =
    job && job.total_rows > 0
      ? Math.min(100, Math.round((job.processed_rows / job.total_rows) * 100))
      : 0;

  return (
    <Can
      resource="departments"
      action="manage"
      fallback={
        <EmptyState
          title="Not available"
          description="Bulk import is restricted to the company owner."
        />
      }
    >
      <div>
        <PageHeader
          eyebrow="Organization"
          title="Bulk Import"
          description="Upload a CSV of departments, teams, and people. Always preview before you import — nothing is written to your company data until you confirm."
        />

        {/* Step 1 — upload */}
        <Panel className="mb-6 p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Step 1 · Upload CSV
            </p>
            <Button variant="secondary" size="sm" onClick={downloadTemplate}>
              <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
              Download template
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelected(file);
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 border border-dashed border-hairline bg-surface/10 px-6 py-10 text-center transition-colors hover:border-accent/40 hover:bg-accent/[0.03]"
          >
            <UploadCloud
              className="h-8 w-8 text-text-secondary/40"
              strokeWidth={1.25}
            />
            {fileName ? (
              <>
                <span className="flex items-center gap-2 text-[13px] font-medium text-text-primary">
                  <FileSpreadsheet className="h-4 w-4 text-accent" strokeWidth={1.5} />
                  {fileName}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary/55">
                  {rowCount} data row{rowCount === 1 ? "" : "s"} detected · click to
                  replace
                </span>
              </>
            ) : (
              <>
                <span className="text-[13px] text-text-primary">
                  Click to choose a .csv file
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary/55">
                  Max 8 MB · 2,000 rows · requires an email column
                </span>
              </>
            )}
          </button>

          {rowCount > 2000 && (
            <p className="mt-3 flex items-center gap-2 font-mono text-[11px] text-danger">
              <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />
              This file has {rowCount} rows — imports are capped at 2,000 rows.
            </p>
          )}

          {fileName && (
            <div className="mt-4 flex items-center gap-2">
              <Button
                onClick={runPreview}
                disabled={previewLoading || rowCount === 0 || rowCount > 2000}
              >
                {previewLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                ) : null}
                {previewLoading ? "Previewing…" : "Preview import"}
              </Button>
              {previewError && (
                <span className="font-mono text-[11px] text-danger">
                  {previewError}
                </span>
              )}
            </div>
          )}
        </Panel>

        {/* Step 2 — preview + confirm */}
        {preview && step !== "job" && (
          <Panel className="mb-6 p-6">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Step 2 · Review before you import
            </p>

            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatTile label="Total rows" value={preview.total_rows} />
              <StatTile label="Will create" value={preview.would_create} tone="accent" />
              <StatTile label="Will skip" value={preview.would_skip} tone="muted" />
              <StatTile label="Will fail" value={preview.would_fail} tone="danger" />
            </div>

            {preview.would_fail > 0 && (
              <p className="mb-4 flex items-start gap-2 border border-danger/30 bg-danger/5 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-danger">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                {preview.would_fail} row(s) will fail and be skipped during import
                (see messages below). Rows that succeed are unaffected.
              </p>
            )}

            <div className="mb-4 max-h-96 overflow-y-auto">
              <DataTable
                columns={[
                  { key: "row", label: "Row", width: "w-14" },
                  { key: "pass", label: "Pass", width: "w-28" },
                  { key: "entity", label: "Entity", width: "w-24" },
                  { key: "key", label: "Key" },
                  { key: "action", label: "Action", width: "w-20" },
                  { key: "message", label: "Message" },
                ]}
                rows={previewRows}
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-hairline pt-4">
              <label className="flex items-center gap-2 text-[13px] text-text-primary">
                <input
                  type="checkbox"
                  checked={sendInviteEmails}
                  onChange={(e) => setSendInviteEmails(e.target.checked)}
                  className="h-4 w-4"
                  style={{ accentColor: "var(--role-accent)" }}
                />
                Send invite emails to new employees
              </label>
              <label className="flex items-center gap-2 text-[13px] text-text-primary">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="h-4 w-4"
                  style={{ accentColor: "var(--role-accent)" }}
                />
                I have reviewed this preview and want to import{" "}
                {preview.would_create + preview.would_update} record(s) into live
                company data.
              </label>

              <div className="flex items-center gap-3">
                <Button onClick={startImport} disabled={!confirmed || starting}>
                  {starting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                  ) : null}
                  {starting ? "Starting…" : "Confirm & start import"}
                </Button>
                <Button variant="ghost" size="sm" onClick={resetAll}>
                  Cancel
                </Button>
                {startError && (
                  <span className="font-mono text-[11px] text-danger">
                    {startError}
                  </span>
                )}
              </div>
            </div>
          </Panel>
        )}

        {/* Step 3 — running job */}
        {importUuid && (
          <Panel className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                Step 3 · Import progress
              </p>
              {job && <JobStatusBadge status={job.status} />}
            </div>

            {!job ? (
              <p className="font-mono text-[11px] text-text-secondary/60">
                Loading job…
              </p>
            ) : (
              <>
                <div className="mb-3 h-2 w-full overflow-hidden border border-hairline bg-surface/20">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="mb-4 font-mono text-[11px] text-text-secondary/60">
                  {job.processed_rows} / {job.total_rows} rows processed
                  {job.status === "running" ? ` · current pass: ${job.current_pass}` : ""}
                </p>

                <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatTile label="Total" value={job.total_rows} />
                  <StatTile label="Created" value={job.created_rows} tone="accent" />
                  <StatTile label="Skipped" value={job.skipped_rows} tone="muted" />
                  <StatTile label="Failed" value={job.failed_rows} tone="danger" />
                </div>

                {job.error_summary && (
                  <p className="mb-4 flex items-start gap-2 border border-danger/30 bg-danger/5 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-danger">
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                    {job.error_summary}
                  </p>
                )}

                {!jobDone && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={cancelJob}
                    disabled={cancelling}
                  >
                    {cancelling ? "Cancelling…" : "Cancel import"}
                  </Button>
                )}

                {jobDone && (
                  <div className="border-t border-hairline pt-4">
                    <p className="mb-3 flex items-center gap-2 text-[13px] text-text-primary">
                      {job.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-accent" strokeWidth={1.5} />
                      ) : (
                        <XCircle className="h-4 w-4 text-danger" strokeWidth={1.5} />
                      )}
                      Import {job.status}
                      {job.finished_at
                        ? ` at ${new Date(job.finished_at).toLocaleString()}`
                        : ""}
                      .
                    </p>

                    {job.failed_rows > 0 && failedRows.data && (
                      <div className="mb-4 max-h-72 overflow-y-auto">
                        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary/55">
                          Failed rows
                        </p>
                        <DataTable
                          columns={[
                            { key: "row", label: "Row", width: "w-14" },
                            { key: "entity", label: "Entity", width: "w-24" },
                            { key: "key", label: "Key" },
                            { key: "error", label: "Error" },
                          ]}
                          rows={failedRows.data.items.map((r) => ({
                            row: r.row_number,
                            entity: (
                              <span className="font-mono text-[11px] text-text-secondary/70">
                                {r.entity}
                              </span>
                            ),
                            key: (
                              <span className="text-[13px] text-text-primary">
                                {r.natural_key}
                              </span>
                            ),
                            error: (
                              <span className="text-[12px] text-danger">
                                {r.error_message || r.error_code || "Unknown error"}
                              </span>
                            ),
                          }))}
                        />
                      </div>
                    )}

                    <Button variant="secondary" size="sm" onClick={resetAll}>
                      Start another import
                    </Button>
                  </div>
                )}
              </>
            )}
          </Panel>
        )}
      </div>
    </Can>
  );
}
