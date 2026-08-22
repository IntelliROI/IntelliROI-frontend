import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  return (
    <div className="mx-auto flex min-h-screen items-center justify-center px-6 py-16">
      <ResetPasswordForm token={params.token} />
    </div>
  );
}
