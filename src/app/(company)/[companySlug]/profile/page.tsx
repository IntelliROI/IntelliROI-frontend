"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/feedback/States";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { authApi } from "@/features/auth/api/auth.api";
import { organizationApi } from "@/features/organization/api/organization.api";
import { useAuthStore } from "@/stores/auth-store";
import { ROLE_LABELS } from "@/constants/roles";
import { queryKeys } from "@/lib/api/query-keys";

function initials(first: string, last: string) {
  return `${first.slice(0, 1)}${last.slice(0, 1)}`.toUpperCase() || "·";
}

export default function MyProfilePage({
  params,
}: {
  params: { companySlug: string };
}) {
  const user = useAuthStore((s) => s.user);
  const company = useAuthStore((s) => s.company);
  const setUser = useAuthStore((s) => s.setUser);
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [designation, setDesignation] = useState(user?.designation ?? "");

  useEffect(() => {
    setFirstName(user?.first_name ?? "");
    setLastName(user?.last_name ?? "");
    setPhone(user?.phone ?? "");
    setDesignation(user?.designation ?? "");
  }, [user?.uuid, user?.first_name, user?.last_name, user?.phone, user?.designation]);

  const departments = useQuery({
    queryKey: queryKeys.company.departments(params.companySlug),
    queryFn: () => organizationApi.listDepartments(),
    enabled: Boolean(user?.department_id),
  });
  const teams = useQuery({
    queryKey: queryKeys.company.teams(params.companySlug),
    queryFn: () => organizationApi.listTeams(),
    enabled: Boolean(user?.team_id),
  });

  const deptLabel = useMemo(() => {
    if (!user?.department_id) return "Not assigned";
    return (
      departments.data?.find((d) => d.id === user.department_id)?.department_name ??
      `Department #${user.department_id}`
    );
  }, [departments.data, user?.department_id]);

  const teamLabel = useMemo(() => {
    if (!user?.team_id) return "Not assigned";
    return (
      teams.data?.find((t) => t.id === user.team_id)?.team_name ??
      `Team #${user.team_id}`
    );
  }, [teams.data, user?.team_id]);

  const save = useMutation({
    mutationFn: () =>
      authApi.updateMyProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || null,
        designation: designation.trim() || null,
      }),
    onSuccess: (updated) => {
      setUser({ ...user!, ...updated });
      toast.success("Profile updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Could not update profile");
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    save.mutate();
  }

  if (!user) {
    return (
      <p className="border border-hairline px-4 py-8 text-sm text-text-secondary">
        Sign in to view your profile.
      </p>
    );
  }

  const displayName = `${user.first_name} ${user.last_name}`.trim();

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="My Profile"
        description="Update your personal details. Department, team, and app role are assigned by owners and managers."
      />

      <div className="grid gap-px bg-hairline lg:grid-cols-12">
        <Panel className="border-0 bg-ink p-6 lg:col-span-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-hairline bg-surface font-mono text-[15px] font-medium text-accent">
              {initials(user.first_name, user.last_name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-medium text-text-primary">
                {displayName || "—"}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                {ROLE_LABELS[user.role]}
              </p>
            </div>
          </div>

          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                Email
              </dt>
              <dd className="mt-1 break-all text-text-primary">{user.email}</dd>
            </div>
            {user.employee_code ? (
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                  Employee code
                </dt>
                <dd className="mt-1 font-mono text-text-primary">{user.employee_code}</dd>
              </div>
            ) : null}
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                Company
              </dt>
              <dd className="mt-1 text-text-primary">{company?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                Department
              </dt>
              <dd className="mt-1 text-text-primary">{deptLabel}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                Team
              </dt>
              <dd className="mt-1 text-text-primary">{teamLabel}</dd>
            </div>
          </dl>
          <p className="mt-6 text-[12px] leading-relaxed text-text-secondary/80">
            Org assignment is read-only here. Ask an owner or manager to change
            department, team, or role.
          </p>
        </Panel>

        <Panel className="border-0 bg-ink p-6 lg:col-span-8">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
            Personal details
          </p>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="first_name">First name</Label>
              <Input
                id="first_name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. CEO, Engineering Manager"
              />
            </div>
            <div className="sm:col-span-2 flex flex-wrap items-center justify-end gap-2 border-t border-hairline pt-4">
              <Button type="submit" size="sm" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save profile"}
              </Button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
