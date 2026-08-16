"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Mosaic, Panel } from "@/components/ui/panel";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { organizationApi } from "@/features/organization/api/organization.api";
import { ResendInviteButton } from "@/features/organization/components/ResendInviteButton";
import { roiApi } from "@/features/roi/api/roi.api";
import { ROLE_LABELS } from "@/constants/roles";
import { formatCurrency } from "@/lib/utils";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-hairline px-5 py-3 last:border-b-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary/70">
        {label}
      </p>
      <p className="mt-1 text-[13px] text-text-primary">{value}</p>
    </div>
  );
}

function dash(value?: string | null) {
  const text = (value ?? "").trim();
  if (!text || text === "—") return "—";
  return text;
}

export default function EmployeeDetailPage({
  params,
}: {
  params: { companySlug: string; employeeId: string };
}) {
  const listHref = `/${params.companySlug}/organization/employees`;

  const employeeQ = useQuery({
    queryKey: ["company", params.companySlug, "employee", params.employeeId],
    queryFn: () => organizationApi.getEmployee(params.employeeId),
  });
  const peopleQ = useQuery({
    queryKey: ["company", params.companySlug, "employees"],
    queryFn: () => organizationApi.listEmployees(),
  });
  const projectsQ = useQuery({
    queryKey: ["company", params.companySlug, "projects"],
    queryFn: () => organizationApi.listProjects(),
  });
  const roi = useQuery({
    queryKey: [
      "company",
      params.companySlug,
      "roi",
      "employee",
      params.employeeId,
    ],
    queryFn: () => roiApi.employee(params.employeeId),
    enabled: employeeQ.data?.status !== "invited",
  });

  const employee = employeeQ.data;
  const pending = employee?.status === "invited";

  const managerName = useMemo(() => {
    if (!employee?.manager_employee_id) return "—";
    const mgr = (peopleQ.data ?? []).find(
      (p) => p.id === employee.manager_employee_id,
    );
    return mgr?.display_name ?? "—";
  }, [employee, peopleQ.data]);

  const relatedProjects = useMemo(() => {
    if (!employee) return [];
    return (projectsQ.data ?? []).filter((p) => {
      if (employee.team_id && p.team_id === employee.team_id) return true;
      if (employee.department_id && p.department_id === employee.department_id) {
        return true;
      }
      return false;
    });
  }, [employee, projectsQ.data]);

  if (employeeQ.isLoading) {
    return <LoadingBlock className="h-64" />;
  }

  if (!employee) {
    return (
      <p className="border border-hairline px-4 py-8 text-sm text-text-secondary">
        Could not load this employee.
      </p>
    );
  }

  return (
    <div>
      <Link
        href={listHref}
        className="mb-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary transition-colors hover:text-accent"
      >
        <ChevronLeft className="h-3 w-3" strokeWidth={1.75} />
        Employees
      </Link>
      <PageHeader
        eyebrow="Organization · Employee"
        title={employee.display_name}
        description={
          pending
            ? `${employee.email} has not set a password yet — status is pending until they accept the invite.`
            : `${dash(employee.designation)} · ${dash(employee.department_name)}`
        }
        actions={
          pending && employee.email ? (
            <ResendInviteButton
              email={employee.email}
              displayName={employee.display_name}
            />
          ) : undefined
        }
      />

      <div className="mb-px grid gap-px bg-hairline lg:grid-cols-12">
        <Panel className="border-0 bg-ink lg:col-span-5">
          <div className="border-b border-hairline px-5 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Identity
            </p>
          </div>
          <Field label="Status" value={pending ? "Pending invite" : "Active"} />
          <Field label="Email" value={dash(employee.email)} />
          <Field label="Phone" value={dash(employee.phone)} />
          <Field label="Employee ID" value={dash(employee.employee_code)} />
          <Field label="App role" value={ROLE_LABELS[employee.app_role]} />
          <Field label="Joining date" value={dash(employee.joining_date)} />
        </Panel>

        <Panel className="border-0 bg-ink lg:col-span-7">
          <div className="border-b border-hairline px-5 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Organization
            </p>
          </div>
          <Field label="Department" value={dash(employee.department_name)} />
          <Field label="Team" value={dash(employee.team_name)} />
          <Field label="Manager" value={managerName} />
          <Field label="Designation" value={dash(employee.designation)} />
          <Field
            label="Job role"
            value={
              employee.job_role_name && employee.job_role_name !== "—"
                ? `${employee.job_role_name} · ${formatCurrency(employee.hourly_cost)}/hr`
                : "—"
            }
          />
        </Panel>
      </div>

      <Panel className="mt-px border-0 border-t-0 bg-ink">
        <div className="border-b border-hairline px-5 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Projects
          </p>
          <p className="mt-1 text-[12px] text-text-secondary/70">
            Workstreams in this person’s department or team.
          </p>
        </div>
        {relatedProjects.length === 0 ? (
          <p className="px-5 py-8 text-sm text-text-secondary">
            No projects linked to this department or team yet.
          </p>
        ) : (
          <ul>
            {relatedProjects.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between border-b border-hairline px-5 py-3 last:border-b-0"
              >
                <span className="text-[13px] text-text-primary">
                  {p.project_name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary/60">
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="mt-px">
        <Mosaic cols={4}>
          <KpiTile
            label="Requests"
            value={employee.requests}
            format="number"
          />
          <KpiTile
            label="Spend"
            value={roi.data?.total_spend ?? employee.spend}
            format="currency"
          />
          <KpiTile
            label="Time saved"
            value={`${roi.data?.time_saved_hours ?? 0}h`}
          />
          <KpiTile
            label="Estimated ROI"
            value={roi.data?.roi_pct ?? employee.roi_pct}
            format="percent"
            accent
          />
        </Mosaic>
      </div>
    </div>
  );
}
