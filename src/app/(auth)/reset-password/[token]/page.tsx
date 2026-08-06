import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  return (
    <div className="mx-auto flex justify-center">
      <ResetPasswordForm token={params.token} />
    </div>
  );
}
