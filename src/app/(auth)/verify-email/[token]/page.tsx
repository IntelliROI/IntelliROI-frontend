import { redirect } from "next/navigation";

export default function VerifyEmailPage({
  params,
}: {
  params: { token: string };
}) {
  redirect(`/accept-invite?token=${encodeURIComponent(params.token)}`);
}
