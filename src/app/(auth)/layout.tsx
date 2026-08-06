export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-ink px-6 py-16">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-40" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,229,168,0.08) 0%, transparent 65%)",
        }}
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
