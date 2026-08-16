"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { QUERY_DEFAULTS } from "@/lib/performance";

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            ...QUERY_DEFAULTS,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        richColors
        closeButton
        expand={false}
        gap={10}
        duration={4500}
        toastOptions={{
          classNames: {
            toast:
              "!border !border-hairline !bg-surface !text-text-primary !shadow-2xl !rounded-md",
            title: "!text-sm !font-medium !text-text-primary",
            description: "!text-xs !text-text-secondary",
            actionButton:
              "!bg-accent !text-ink !text-xs !font-medium !rounded-sm",
            cancelButton:
              "!bg-surface-2 !text-text-secondary !text-xs !rounded-sm",
            closeButton:
              "!bg-surface-2 !border-hairline !text-text-secondary",
          },
        }}
      />
    </QueryClientProvider>
  );
}
