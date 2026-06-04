import Link from "next/link";
import ArtelierLogo from "~/components/ArtelierLogo";
import AppFooter from "~/components/AppFooter";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[--bg]">
      <main className="flex flex-1 flex-col px-4 py-6 sm:py-10 md:py-14">
        <div className="mx-auto w-full max-w-sm sm:max-w-[400px] md:max-w-[440px]">
          <Link href="/" className="mb-6 sm:mb-10 flex flex-col items-center gap-1" aria-label="Artelier — inicio">
            <ArtelierLogo width={96} height={55} />
            <span className="font-display text-3xl sm:text-4xl text-[#3d5a4f]">Artelier</span>
          </Link>
          {children}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
