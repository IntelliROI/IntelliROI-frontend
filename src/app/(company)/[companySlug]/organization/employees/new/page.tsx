"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
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

  const loading =
    departments.isLoading ||
    teams.isLoading ||
    jobRoles.isLoading ||
    employees.isLoading;

  return (
    <div>
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
        {loading ? (
          <LoadingBlock className="h-64" />
        ) : (
          <CreateEmployeeForm
            departments={departments.data ?? []}
            teams={teams.data ?? []}
            jobRoles={jobRoles.data ?? []}
            managers={employees.data ?? []}
            onSubmit={async (values) => {
              const { employee, temporary_password } =
                await organizationApi.createEmployee(values);
              toast.success(`Invited ${employee.display_name}`);
              if (temporary_password) {
                toast.message(`Temporary password for ${employee.email}`, {
                  description: temporary_password,
                });
              }
              router.push(
                `/${params.companySlug}/organization/employees/${employee.uuid}`,
              );
            }}
          />
        )}
      </Can>
    </div>
  );
}
