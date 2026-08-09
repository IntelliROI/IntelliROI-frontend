"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { CreateEmployeeForm } from "@/features/organization/components/CreateEmployeeForm";
import { organizationApi } from "@/features/organization/api/organization.api";
import { useAuthStore } from "@/stores/auth-store";

export default function OnboardingEmployeesPage() {
  const router = useRouter();
  const company = useAuthStore((s) => s.company);
  const setOnboardingComplete = useAuthStore((s) => s.setOnboardingComplete);

  const departments = useQuery({
    queryKey: ["onboarding", "departments"],
    queryFn: () => organizationApi.listDepartments(),
  });
  const teams = useQuery({
    queryKey: ["onboarding", "teams"],
    queryFn: () => organizationApi.listTeams(),
  });
  const jobRoles = useQuery({
    queryKey: ["onboarding", "job-roles"],
    queryFn: () => organizationApi.listJobRoles(),
  });
  const employees = useQuery({
    queryKey: ["onboarding", "employees"],
    queryFn: () => organizationApi.listEmployees(),
  });

  const ready =
    !departments.isLoading &&
    !teams.isLoading &&
    !jobRoles.isLoading &&
    departments.data &&
    teams.data &&
    jobRoles.data;

  function finish() {
    setOnboardingComplete(true);
    const slug = company?.slug ?? "acme";
    toast.success("Onboarding complete");
    router.replace(`/${slug}/dashboard`);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Step 06"
        title="Employees"
        description="Capture full org identity: dept → team → job role → app role. Required for analytics & Estimated ROI."
      />
      {!ready ? (
        <LoadingBlock className="h-64" />
      ) : departments.data!.length === 0 || jobRoles.data!.length === 0 ? (
        <p className="text-sm text-warning">
          Create at least one department and one job role before adding employees.
        </p>
      ) : (
        <CreateEmployeeForm
          departments={departments.data!}
          teams={teams.data!}
          jobRoles={jobRoles.data!}
          managers={employees.data ?? []}
          submitLabel="Add employee"
          onSubmit={async (values) => {
            const row = await organizationApi.createEmployee(values);
            toast.success(`Added ${row.display_name} (${row.employee_code})`);
            employees.refetch();
          }}
        />
      )}

      <div className="mt-10">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
          Directory
        </p>
        {employees.isLoading ? (
          <LoadingBlock className="h-40" />
        ) : (
          <DataTable
            columns={[
              { key: "code", label: "ID" },
              { key: "name", label: "Name" },
              { key: "dept", label: "Department" },
              { key: "team", label: "Team" },
              { key: "role", label: "Job role" },
            ]}
            rows={(employees.data ?? []).map((e) => ({
              code: e.employee_code,
              name: e.display_name,
              dept: e.department_name,
              team: e.team_name,
              role: `${e.job_role_name} ($${e.hourly_cost}/hr)`,
            }))}
          />
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button asChild variant="secondary">
          <Link href="/onboarding/ai-providers">Back</Link>
        </Button>
        <Button type="button" onClick={finish}>
          Finish & open dashboard
        </Button>
      </div>
    </div>
  );
}
