"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { organizationApi } from "@/features/organization/api/organization.api";

export default function OnboardingDepartmentsPage() {
  const [name, setName] = useState("Engineering");
  const [created, setCreated] = useState<string[]>([]);

  async function addDepartment() {
    if (!name.trim()) return;
    await organizationApi.createDepartment({ department_name: name.trim() });
    setCreated((c) => [...c, name.trim()]);
    toast.success(`Created ${name.trim()}`);
    setName("");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Step 02"
        title="Seed departments"
        description="Create the first structural units for budgets and analytics."
      />
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <Label>Department name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <Button className="self-end" type="button" onClick={addDepartment}>
          Add
        </Button>
      </div>
      {created.length > 0 && (
        <ul className="mt-6 space-y-2">
          {created.map((d) => (
            <li
              key={d}
              className="border border-hairline px-3 py-2 font-mono text-xs uppercase tracking-[0.15em] text-accent"
            >
              {d}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8 flex justify-between">
        <Button asChild variant="secondary">
          <Link href="/onboarding/company-profile">Back</Link>
        </Button>
        <Button asChild>
          <Link href="/onboarding/ai-providers">Continue</Link>
        </Button>
      </div>
    </div>
  );
}
