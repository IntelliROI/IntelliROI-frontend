import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-danger">
        ERR-403
      </p>
      <h1 className="mt-4 text-3xl font-medium text-text-primary">
        Access denied
      </h1>
      <p className="mt-2 max-w-md text-text-secondary">
        Your role cannot open this route. Return to a workspace you are allowed to view.
      </p>
      <Button asChild className="mt-8" variant="secondary">
        <Link href="/login">Back to login</Link>
      </Button>
    </div>
  );
}
