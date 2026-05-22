import AppHeader from "~/components/AppHeader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-[--bg] px-4 py-10">
        <div className="mx-auto max-w-[400px]">{children}</div>
      </main>
    </>
  );
}
