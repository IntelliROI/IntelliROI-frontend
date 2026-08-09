"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { CreateTeamForm } from "@/features/organization/components/CreateTeamForm";
import { organizationApi } from "@/features/organization/api/organization.api";

export default function OnboardingTeamsPage() {
  const departments = useQuery({
    queryKey: ["onboarding", "departments"],
    queryFn: () => organizationApi.listDepartments(),
  });
  const teams = useQuery({
    queryKey: ["onboarding", "teams"],
    queryFn: () => organizationApi.listTeams(),
  });
  const employees = useQuery({
    queryKey: ["onboarding", "employees"],
    queryFn: () => organizationApi.listEmployees(),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Step 04"
        title="Teams"
        description="Teams belong to a department (e.g. Engineering → Frontend Team)."
      />
      {departments.isLoading || !departments.data?.length ? (
        <LoadingBlock className="h-40" />
      ) : (
        <CreateTeamForm
          departments={departments.data}
          leads={employees.data ?? []}
          onSubmit={async (values) => {
            await organizationApi.createTeam(values);
            toast.success(`Created ${values.team_name}`);
            teams.refetch();
          }}
        />
      )}
      <div className="mt-8">
        {teams.isLoading ? (
          <LoadingBlock className="h-40" />
        ) : (
          <DataTable
            columns={[
              { key: "code", label: "Code" },
              { key: "name", label: "Team" },
              { key: "dept", label: "Department" },
            ]}
            rows={(teams.data ?? []).map((t) => ({
              code: t.team_code,
              name: t.team_name,
              dept:
                departments.data?.find((d) => d.id === t.department_id)
                  ?.department_name ?? "—",
            }))}
          />
        )}
      </div>
      <div className="mt-8 flex justify-between">
        <Button asChild variant="secondary">
          <Link href="/onboarding/departments">Back</Link>
        </Button>
        <Button asChild>
          <Link href="/onboarding/ai-providers">Continue</Link>
        </Button>
      </div>
    </div>
  );
}
