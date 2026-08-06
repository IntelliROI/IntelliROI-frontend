"use client";

import Link from "next/link";
import { PageHeader } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";

export default function OnboardingCompanyProfilePage() {
  const company = useAuthStore((s) => s.company);

  return (
    <div>
      <PageHeader
        eyebrow="Step 01"
        title="Company profile"
        description="Confirm tenant identity before seeding departments."
      />
      <div className="grid gap-4 sm:grid-cols-2">
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
          <Input defaultValue={company?.industry ?? "software"} />
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <Button asChild>
          <Link href="/onboarding/departments">Continue</Link>
        </Button>
      </div>
    </div>
  );
}
