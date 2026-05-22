import Link from "next/link";
import ArtelierLogo from "~/components/ArtelierLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[--bg] px-4 py-10">
      <div className="mx-auto max-w-[400px]">
        <Link href="/" className="mb-10 flex flex-col items-center gap-1" aria-label="Artelier — inicio">
          <ArtelierLogo width={120} height={69} />
          <span className="font-display text-4xl text-[#3d5a4f]">Artelier</span>
        </Link>
        {children}
      </div>
    </main>
  );
}
