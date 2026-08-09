import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Chapter } from "@/components/ui/panel";

export default function VerifyEmailPage({
  params,
}: {
  params: { token: string };
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center">
      <Chapter number="05" label="Verify" />
      <h1 className="mt-8 text-3xl font-light tracking-tight text-text-primary">
        Email verified
      </h1>
      <p className="mt-3 text-sm text-text-secondary">
        Token <span className="font-mono text-accent">{params.token}</span>{" "}
        accepted. You can sign in to IntelliROI.
      </p>
      <Button asChild className="mt-8">
        <Link href="/login">Continue to login</Link>
      </Button>
    </div>
  );
}
