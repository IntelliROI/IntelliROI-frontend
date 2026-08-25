"use client";

import { PageHeader } from "@/components/feedback/States";
import { ROLE_LABELS, type Role } from "@/constants/roles";

export function ScopeUnassigned({
  role,
  missing,
  title = "Dashboard",
}: {
  role: Role;
  missing: "department" | "team";
  title?: string;
}) {
  const label = ROLE_LABELS[role] ?? role;
  return (
    <div>
      <PageHeader
        eyebrow="Scope"
        title={title}
        description={`${label} views require an assigned ${missing}.`}
      />
      <p className="border border-hairline px-4 py-8 text-sm text-text-secondary">
        Your account is not assigned to a {missing} yet. Ask a company owner or
        department manager to place you in the org chart, then sign out and back
        in so scope refreshes.
      </p>
    </div>
  );
}
