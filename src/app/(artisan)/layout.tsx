import AppHeader from "~/components/AppHeader";

export default function ArtisanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
