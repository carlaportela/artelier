import AppHeader from "~/components/AppHeader";

export const dynamic = "force-dynamic";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <div className="mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-4xl">
        {children}
      </div>
    </>
  );
}
