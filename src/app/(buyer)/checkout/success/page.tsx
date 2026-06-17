//Página de éxito de compra realizada para el comprador.

import Link from "next/link";

//Función que muestra el éxito en la confirmación del pedido.
export default function CheckoutSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3d5a4f]/10">
          <svg
            className="h-8 w-8 text-[#3d5a4f]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold text-[--text]">
          ¡Pago realizado!
        </h1>
        <p className="max-w-sm text-sm text-[--text-muted]">
          Tu pedido está siendo procesado. La artesana recibirá una notificación
          y comenzará a prepararlo.
        </p>
      </div>

      <Link
        href="/orders"
        className="rounded-full bg-[#3d5a4f] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e]"
      >
        Ver mis pedidos
      </Link>
    </main>
  );
}
