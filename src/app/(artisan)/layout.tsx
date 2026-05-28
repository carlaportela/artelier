//Este layout (plantilla o distribución de los elementos)se aplica a todas las páginas que se muestran a los usuarios con rol de artesano.

import AppHeader from "~/components/AppHeader";
import ArtisanBottomNav from "~/components/ArtisanBottomNav";

// El scroll ocurre en el body (un solo scrollbar). AppHeader es sticky y ArtisanBottomNav es fixed.
export default function ArtisanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <div className="mx-auto w-full max-w-lg pb-24 md:max-w-2xl lg:max-w-4xl">
        {children}
      </div>
      <ArtisanBottomNav />
    </>
  );
}
