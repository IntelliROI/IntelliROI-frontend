"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { CreateJobRoleForm } from "@/features/organization/components/CreateJobRoleForm";
import { organizationApi } from "@/features/organization/api/organization.api";
import { formatCurrency } from "@/lib/utils";

export default function OnboardingJobRolesPage() {
  const roles = useQuery({
    queryKey: ["onboarding", "job-roles"],
    queryFn: () => organizationApi.listJobRoles(),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Step 02"
        title="Job roles"
        description="Config entity: hourly cost is inherited by employees for Estimated ROI."
      />
      <CreateJobRoleForm
        onSubmit={async (values) => {
          await organizationApi.createJobRole(values);
          toast.success(`Added ${values.role_name}`);
          roles.refetch();
        }}
      />
      <div className="mt-8">
        {roles.isLoading ? (
          <LoadingBlock className="h-40" />
        ) : (
          <DataTable
            columns={[
              { key: "name", label: "Role" },
              { key: "rate", label: "Hourly cost", align: "right" },
              { key: "currency", label: "Currency" },
            ]}
            rows={(roles.data ?? []).map((r) => ({
              name: r.role_name,
              rate: formatCurrency(r.hourly_cost, r.currency),
              currency: r.currency,
            }))}
          />
        )}
      </div>
      <div className="mt-8 flex justify-between">
        <Button asChild variant="secondary">
          <Link href="/onboarding/company-profile">Back</Link>
        </Button>
        <Button asChild>
          <Link href="/onboarding/departments">Continue</Link>
        </Button>
      </div>
    </div>
  );
}
