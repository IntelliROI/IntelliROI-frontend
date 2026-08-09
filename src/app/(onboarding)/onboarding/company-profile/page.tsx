"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { CompanySettingsForm } from "@/features/organization/components/CompanySettingsForm";
import { organizationApi } from "@/features/organization/api/organization.api";
import { useAuthStore } from "@/stores/auth-store";

export default function OnboardingCompanyProfilePage() {
  const company = useAuthStore((s) => s.company);
  const settings = useQuery({
    queryKey: ["onboarding", "company-settings"],
    queryFn: () => organizationApi.getSettings(),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Step 01"
        title="Company profile & ROI settings"
        description="Confirm tenant identity, then set working hours used by Estimated ROI."
      />

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Company name</Label>
          <Input defaultValue={company?.name ?? ""} readOnly />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input defaultValue={company?.slug ?? ""} readOnly />
        </div>
        <div className="space-y-2">
          <Label>Industry</Label>
          <Input defaultValue={company?.industry ?? "software"} readOnly />
        </div>
      </div>

      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
        Company settings
      </p>
      {settings.isLoading || !settings.data ? (
        <LoadingBlock className="h-40" />
      ) : (
        <CompanySettingsForm
          initial={settings.data}
          submitLabel="Save & continue"
          onSubmit={async (values) => {
            await organizationApi.updateSettings(values);
            toast.success("Company settings saved");
          }}
        />
      )}

      <div className="mt-8 flex justify-end">
        <Button asChild>
          <Link href="/onboarding/job-roles">Continue to job roles</Link>
        </Button>
      </div>
    </div>
  );
}
