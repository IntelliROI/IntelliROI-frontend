"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/feedback/States";
import { CreateEmployeeForm } from "@/features/organization/components/CreateEmployeeForm";
import { organizationApi } from "@/features/organization/api/organization.api";
import { Can } from "@/lib/rbac/Can";

export default function NewEmployeePage({
  params,
}: {
  params: { companySlug: string };
}) {
  const router = useRouter();
  const departments = useQuery({
    queryKey: ["company", params.companySlug, "departments"],
    queryFn: () => organizationApi.listDepartments(),
  });
  const teams = useQuery({
    queryKey: ["company", params.companySlug, "teams"],
    queryFn: () => organizationApi.listTeams(),
  });
  const jobRoles = useQuery({
    queryKey: ["company", params.companySlug, "job-roles"],
    queryFn: () => organizationApi.listJobRoles(),
  });
  const employees = useQuery({
    queryKey: ["company", params.companySlug, "employees"],
    queryFn: () => organizationApi.listEmployees(),
  });

  const listHref = `/${params.companySlug}/organization/employees`;

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
        eyebrow="Organization"
        title="Invite person"
        description="Start with a Department Head if you want them to hire the team. Department, team, and job role can wait."
      />
      <Can
        resource="employees"
        action="create"
        fallback={
          <p className="text-sm text-text-secondary">
            You do not have permission to create employees.
          </p>
        }
      >
        {/*
         * Every dropdown here is optional (org.schema.ts), so the form
         * renders immediately instead of blocking on all four queries —
         * a single slow/unreachable service (e.g. job-roles on :8083)
         * no longer freezes the whole invite screen.
         */}
        <CreateEmployeeForm
          departments={departments.data ?? []}
          teams={teams.data ?? []}
          jobRoles={jobRoles.data ?? []}
          managers={employees.data ?? []}
          onSubmit={async (values) => {
            const { employee, emailSent, inviteUrl, warnings } =
              await organizationApi.createEmployee(values);
            if (emailSent) {
              toast.success(`Invited ${employee.display_name}`, {
                description: `An email was sent to ${employee.email} to set their password.`,
              });
            } else if (inviteUrl) {
              // Development only — no mail provider configured, so the
              // accept-invite link is surfaced here instead of an inbox.
              toast.success(`Invited ${employee.display_name}`, {
                description: "No mail provider configured — share this link to activate the account.",
                action: {
                  label: "Copy link",
                  onClick: () => {
                    navigator.clipboard?.writeText(inviteUrl);
                    toast.message("Invite link copied");
                  },
                },
                duration: 15000,
              });
            } else {
              toast.success(`Invited ${employee.display_name}`);
            }
            for (const warning of warnings) {
              toast.warning(warning);
            }
            router.push(listHref);
          }}
        />
      </Can>
    </div>
  );
}
