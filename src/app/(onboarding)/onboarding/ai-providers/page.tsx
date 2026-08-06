"use client";

import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { aiGatewayApi } from "@/features/ai-gateway/api/ai-gateway.api";

export default function OnboardingProvidersPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Step 03"
        title="Connect AI providers"
        description="Employees never see raw keys — IntelliROI gateway holds them."
      />
      <div className="grid gap-px bg-hairline md:grid-cols-3">
        {["openai", "anthropic", "google"].map((provider) => (
          <div key={provider} className="bg-ink p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              {provider}
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="mt-4"
              onClick={async () => {
                await aiGatewayApi.addKey(provider, {
                  api_key: "sk-onboarding-demo",
                  key_alias: `${provider}-primary`,
                });
                toast.success(`${provider} key connected (mock)`);
              }}
            >
              Connect
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-between">
        <Button asChild variant="secondary">
          <Link href="/onboarding/departments">Back</Link>
        </Button>
        <Button asChild>
          <Link href="/onboarding/invite-team">Continue</Link>
        </Button>
      </div>
    </div>
  );
}
