import { redirect } from "next/navigation";

/**
 * Legacy invite URL — invite lives on Employees (modal) and Team dashboard.
 * Keep this path as a redirect so old bookmarks do not 404.
 */
export default function NewEmployeeRedirectPage({
  params,
}: {
  params: { companySlug: string };
}) {
  redirect(`/${params.companySlug}/organization/employees`);
}
