export default function SuperAdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-8 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}