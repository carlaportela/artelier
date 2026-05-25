//Este layout se aplica a todas las páginas dentro de /artisan

import AppHeader from "~/components/AppHeader";
import ArtisanBottomNav from "~/components/ArtisanBottomNav";

export default function ArtisanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <div className="pb-20">{children}</div>
      <ArtisanBottomNav />
    </>
  );
}
