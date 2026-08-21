"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { Mosaic } from "@/components/ui/panel";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { PeriodSwitcher, type RoiPeriod } from "@/components/ui/period-switcher";
import { organizationApi } from "@/features/organization/api/organization.api";
import { roiApi } from "@/features/roi/api/roi.api";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/lib/rbac/Can";
import { RemoveMemberAction, RowActions } from "@/components/ui/row-actions";

export function TeamDashboard({
  companySlug,
  departmentId,
  teamId,
}: {
  companySlug: string;
  departmentId: number;
  teamId: number;
}) {
  const [adding, setAdding] = useState(false);
  const [memberUuid, setMemberUuid] = useState("");
  const [period, setPeriod] = useState<RoiPeriod>("month");

  const teams = useQuery({
    queryKey: ["company", companySlug, "teams", departmentId],
    queryFn: () => organizationApi.listTeams(departmentId),
  });
  const employees = useQuery({
    queryKey: ["company", companySlug, "employees"],
    queryFn: () => organizationApi.listEmployees(),
  });
  const roi = useQuery({
    queryKey: ["company", companySlug, "roi", "team", teamId, period],
    queryFn: () => roiApi.team(teamId, period),
  });

  if (teams.isLoading || roi.isLoading) return <LoadingBlock className="h-80" />;

  const team = teams.data?.find((t) => t.id === teamId);
  const members = (employees.data ?? []).filter((e) => e.team_id === teamId);
  const candidates = (employees.data ?? []).filter(
    (e) => e.team_id !== teamId && e.status !== "invited",
  );

  async function addMember() {
    if (!memberUuid) return;
    try {
      await organizationApi.addTeamMember(teamId, memberUuid);
      await organizationApi.assignUser(memberUuid, {
        department_id: departmentId,
        team_id: teamId,
      });
      toast.success("Member added");
      setMemberUuid("");
      setAdding(false);
      employees.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    }
  }

  async function removeMember(uuid: string, name: string) {
    try {
      await organizationApi.removeTeamMember(teamId, uuid);
      await organizationApi.assignUser(uuid, { team_id: null });
      toast.success(`Removed ${name}`);
      employees.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Team"
        title={team?.team_name ?? `Team ${teamId}`}
        description="Member-level usage, projects, and day-to-day AI operations."
        actions={
          <div className="flex items-center gap-2">
            <PeriodSwitcher value={period} onChange={(p) => setPeriod(p as RoiPeriod)} variant="roi" />
            <Can resource="teams" action="edit">
              <Button size="sm" onClick={() => setAdding((v) => !v)}>
                {adding ? "Close" : "Add member"}
              </Button>
            </Can>
          </div>
        }
      />

      {adding && (
        <div className="mb-6 flex flex-wrap items-end gap-3 border border-hairline p-4">
          <div className="min-w-[16rem] flex-1">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              Add to {team?.team_name ?? "team"}
            </p>
            <Select
              value={memberUuid}
              onChange={(e) => setMemberUuid(e.target.value)}
            >
              <option value="">Select employee</option>
              {candidates.map((e) => (
                <option key={e.uuid} value={e.uuid}>
                  {e.display_name}
                </option>
              ))}
            </Select>
          </div>
          <Button size="sm" disabled={!memberUuid} onClick={addMember}>
            Add
          </Button>
        </div>
      )}

      {roi.data ? (
        <Mosaic cols={4}>
          <KpiTile label="Spend" value={roi.data.total_spend} format="currency" />
          <KpiTile
            label="Estimated ROI"
            value={roi.data.roi_pct}
            format="percent"
            accent
          />
          <KpiTile label="Requests" value={roi.data.requests} format="number" />
          <KpiTile label="Members" value={members.length} format="number" />
        </Mosaic>
      ) : (
        <p className="border border-hairline px-4 py-6 text-sm text-text-secondary">
          Estimated ROI is unavailable — members can still be managed below.
        </p>
      )}

      <div className="mt-8">
        <h2 className="mb-4 font-medium text-text-primary">Members</h2>
        <DataTable
          columns={[
            { key: "name", label: "Employee" },
            { key: "requests", label: "Requests", align: "right" },
            { key: "spend", label: "Spend", align: "right" },
            { key: "roi", label: "Est. ROI", align: "right" },
            { key: "action", label: "Actions", align: "right" },
          ]}
          rows={members.map((e) => ({
            name: e.display_name,
            requests: e.requests,
            spend: formatCurrency(e.spend, e.currency, true),
            roi: <span className="text-accent">{e.roi_pct}%</span>,
            action: (
              <RowActions>
                <Can resource="teams" action="edit">
                  <RemoveMemberAction
                    onClick={() => removeMember(e.uuid, e.display_name)}
                  />
                </Can>
                <Link
                  href={`/${companySlug}/organization/employees/${e.uuid}`}
                  className="ml-1 font-mono text-[10px] uppercase tracking-[0.15em] text-accent"
                >
                  Profile
                </Link>
              </RowActions>
            ),
          }))}
        />
      </div>
    </div>
  );
}
