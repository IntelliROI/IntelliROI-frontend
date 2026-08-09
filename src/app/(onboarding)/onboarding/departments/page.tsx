"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { CreateDepartmentForm } from "@/features/organization/components/CreateDepartmentForm";
import { organizationApi } from "@/features/organization/api/organization.api";

export default function OnboardingDepartmentsPage() {
  const departments = useQuery({
    queryKey: ["onboarding", "departments"],
    queryFn: () => organizationApi.listDepartments(),
  });
  const employees = useQuery({
    queryKey: ["onboarding", "employees"],
    queryFn: () => organizationApi.listEmployees(),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Step 03"
        title="Departments"
        description="Create structural units (e.g. Engineering) that own teams and budgets."
      />
      <CreateDepartmentForm
        managers={employees.data ?? []}
        onSubmit={async (values) => {
          await organizationApi.createDepartment(values);
          toast.success(`Created ${values.department_name}`);
          departments.refetch();
        }}
      />
      <div className="mt-8">
        {departments.isLoading ? (
          <LoadingBlock className="h-40" />
        ) : (
          <DataTable
            columns={[
              { key: "code", label: "Code" },
              { key: "name", label: "Department" },
              { key: "status", label: "Status" },
            ]}
            rows={(departments.data ?? []).map((d) => ({
              code: d.department_code,
              name: d.department_name,
              status: d.status,
            }))}
          />
        )}
      </div>
      <div className="mt-8 flex justify-between">
        <Button asChild variant="secondary">
          <Link href="/onboarding/job-roles">Back</Link>
        </Button>
        <Button asChild>
          <Link href="/onboarding/teams">Continue</Link>
        </Button>
      </div>
    </div>
  );
}
