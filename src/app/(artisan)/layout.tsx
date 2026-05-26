//Este layout (plantilla o distribución de los elementos)se aplica a todas las páginas que se muestran a los usuarios con rol de artesano.

import AppHeader from "~/components/AppHeader";
import ArtisanBottomNav from "~/components/ArtisanBottomNav";

export default function ArtisanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <AppHeader />
      <div className="flex-1 overflow-y-auto min-h-0 pb-16">
        <div className="mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-4xl">
          {children}
        </div>
      </div>
      <ArtisanBottomNav />
    </div>
  );
}
