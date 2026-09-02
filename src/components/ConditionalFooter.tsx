"use client";

import { usePathname } from "next/navigation";
import AppFooter from "~/components/AppFooter";

// El chat de conversación es pantalla completa — sin footer.
// En móvil/tablet el footer se sustituye por BuyerBottomNav; en escritorio (lg+) esas mismas
// opciones viven en el desplegable del avatar, así que el footer vuelve a mostrarse ahí.
export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/messages/")) return null;
  return (
    <div className="hidden lg:block">
      <AppFooter />
    </div>
  );
}
