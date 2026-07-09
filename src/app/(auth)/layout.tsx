export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      {children}
    </div>
  );
}
