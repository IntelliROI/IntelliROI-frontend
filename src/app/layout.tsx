import type { Metadata } from "next";
import "@/styles/globals.css";
import { AppProviders } from "./providers";

/**
 * Fonts are CSS stacks (no next/font/google) so `next dev` works offline /
 * when fonts.googleapis.com DNS fails. Inter-like sans + JetBrains-like mono.
 */
export const metadata: Metadata = {
  title: "IntelliROI — Enterprise AI Intelligence",
  description:
    "Meter, cost, and measure ROI on employee AI usage across your organization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
