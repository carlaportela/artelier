//Página de éxito de compra realizada para el comprador.

import Link from "next/link";
import { stripe } from "~/lib/stripe";

//Función que muestra el éxito en la confirmación del pedido.
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  //Se extrae el id de sesión de la URL
  const params = await searchParams;
  const sessionId = params.session_id;

  //Se valida stripe
  if (!stripe || !sessionId) {
    return <div>Error: No se puede verificar el pago</div>;
  }

  //Se obtiene la sesión de Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === "paid") {
    return (
      <main className="flex min-h-screen flex-col items-center gap-6 px-4 pt-24 text-center md:pt-32">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3d5a4f]/10">
            <svg
              className="h-8 w-8 text-[#3d5a4f]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-[--text]">
            ¡Pago realizado!
          </h1>
          <p className="max-w-sm text-sm text-[--text-muted]">
            Tu pedido está siendo procesado.
            <br />
            La artesana recibirá una notificación y comenzará a prepararlo.
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
  } else if (session.payment_status === "unpaid") {
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-[--text]">
            Pago no realizado
          </h1>
          <p className="max-w-sm text-sm text-[--text-muted]">
            Vuelve a la página de finalizar compra para completar el pago.
          </p>
        </div>

        <Link
          href="/checkout"
          className="rounded-full bg-[#3d5a4f] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e]"
        >
          Volver a finalizar compra
        </Link>
      </main>
    );
  }
}
