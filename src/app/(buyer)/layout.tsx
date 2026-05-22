import AppHeader from "~/components/AppHeader";

export const dynamic = "force-dynamic";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
