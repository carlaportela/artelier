import AppHeader from "~/components/AppHeader";
import ConditionalFooter from "~/components/ConditionalFooter";
import BuyerBottomNav from "~/components/BuyerBottomNav";
import { getServerSession } from "~/server/auth/session";

//SSR (Server Side Renderind): esta instrucción indica que esta página se renderiza en el servidor en cada visita (Nunca es estática) y se hereda hacia abajo (Todas las páginas de buyer quedan afectadas).
export const dynamic = "force-dynamic";

//Este grupo de rutas también sirve páginas públicas (producto, perfil de artesana, búsqueda)
//visibles para artesanas y visitantes anónimos — el bottom nav es exclusivo de compradoras
//autenticadas, así que se comprueba la sesión aquí en vez de mostrarlo siempre.
export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  const isBuyer = session?.user?.role === "BUYER";

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className={`mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-4xl ${isBuyer ? "pb-24 lg:pb-0" : ""}`}>
        {children}
      </div>
      <ConditionalFooter />
      {isBuyer && <BuyerBottomNav />}
    </div>
  );
}
