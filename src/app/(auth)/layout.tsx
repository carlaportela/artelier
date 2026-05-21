import ArtelierLogo from "~/components/ArtelierLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[--bg] px-4">
      <div className="mb-8">
        <ArtelierLogo />
      </div>
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
