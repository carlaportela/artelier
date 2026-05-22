import AppHeader from "~/components/AppHeader";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
