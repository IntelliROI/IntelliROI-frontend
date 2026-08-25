"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/feedback/States";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { authApi } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/stores/auth-store";
import { ROLE_LABELS } from "@/constants/roles";

export default function MyProfilePage() {
  const user = useAuthStore((s) => s.user);
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

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="My Profile"
        description="Update your personal details. Org assignment (department, team, role) is managed by owners and managers."
      />
      <Panel className="border-0 bg-ink p-6">
        <dl className="mb-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
              Email
            </dt>
            <dd className="mt-1 text-text-primary">{user.email}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
              Role
            </dt>
            <dd className="mt-1 text-text-primary">{ROLE_LABELS[user.role]}</dd>
          </div>
          {user.employee_code ? (
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                Employee code
              </dt>
              <dd className="mt-1 font-mono text-text-primary">{user.employee_code}</dd>
            </div>
          ) : null}
        </dl>

        <form onSubmit={onSubmit} className="grid max-w-xl gap-4 sm:grid-cols-2">
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
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" size="sm" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
