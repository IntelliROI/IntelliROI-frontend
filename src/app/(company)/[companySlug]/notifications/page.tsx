import { NotificationsInbox } from "@/features/notifications/components/NotificationsInbox";

export default function NotificationsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  return <NotificationsInbox companySlug={params.companySlug} />;
}
