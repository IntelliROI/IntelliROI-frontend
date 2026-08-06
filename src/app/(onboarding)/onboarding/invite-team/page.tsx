"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { authApi } from "@/features/auth/api/auth.api";
import { inviteSchema } from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/stores/auth-store";

export default function OnboardingInviteTeamPage() {
  const router = useRouter();
  const company = useAuthStore((s) => s.company);
  const setOnboardingComplete = useAuthStore((s) => s.setOnboardingComplete);
  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    role: "EMPLOYEE" as const,
  });
  const [loading, setLoading] = useState(false);

  async function invite(e: FormEvent) {
    e.preventDefault();
    const parsed = inviteSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Invalid invite");
      return;
    }
    setLoading(true);
    try {
      await authApi.invite(parsed.data);
      toast.success(`Invited ${parsed.data.email}`);
      setForm({ email: "", first_name: "", last_name: "", role: "EMPLOYEE" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setLoading(false);
    }
  }

  function finish() {
    setOnboardingComplete(true);
    const slug = company?.slug ?? "acme";
    toast.success("Onboarding complete");
    router.replace(`/${slug}/dashboard`);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Step 04"
        title="Invite your team"
        description="Send invites now or skip and invite later from Employees."
      />
      <form onSubmit={invite} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>First name</Label>
          <Input
            value={form.first_name}
            onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Last name</Label>
          <Input
            value={form.last_name}
            onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" variant="secondary" disabled={loading}>
            {loading ? "Sending…" : "Send invite"}
          </Button>
        </div>
      </form>
      <div className="mt-8 flex justify-end">
        <Button type="button" onClick={finish}>
          Finish & open dashboard
        </Button>
      </div>
    </div>
  );
}
