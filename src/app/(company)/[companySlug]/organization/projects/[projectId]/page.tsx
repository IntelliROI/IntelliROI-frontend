import { ProjectMonitor } from "@/features/organization/components/ProjectMonitor";

export default function ProjectMonitorPage({
  params,
}: {
  params: { companySlug: string; projectId: string };
}) {
  return (
    <ProjectMonitor
      companySlug={params.companySlug}
      projectId={Number(params.projectId)}
    />
  );
}
