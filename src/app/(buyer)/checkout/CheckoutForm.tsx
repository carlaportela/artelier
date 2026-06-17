"use client";

//Componente de formulario de finalización de compra que se renderiza en cliente.
import { useState } from "react";
import { useRouter } from "next/navigation";

//Se importan tipos de métodos de envío y funcionalidad para calcular comisiones.
import { calcFees, type ShippingMethod } from "~/lib/fees";


//Se define el tipo Producto
type Product = {
  id: string;
  name: string;
  priceInCents: number;
  type: "UNIQUE" | "PERISHABLE" | "STANDARD";
  artisan: { stripeAccountId: string | null };
};

//Función para mostrar el precio en base de datos en euros.
function fmt(cents: number) {
  return (cents / 100).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
  });
}


//Función principal para finalizar la compra
export default function CheckoutForm({ product }: { product: Product }) {
  const router = useRouter();
  const [shipping, setShipping] = useState<ShippingMethod>("PLATFORM");
  const [shippingWarningAccepted, setShippingWarningAccepted] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  //Se muestran las comisiones por realizar la compra y que se cobraran al comprador.
  const fees = calcFees(product.priceInCents, shipping);

  //Mostrar advertencia de envío para envío a cuenta del vendedor y recogida en persona.
  const needsShippingWarning =
    shipping === "ARTISAN_OWN" || shipping === "PICKUP";

  //Mostrar advertencia legal para productos perecederos y piezas únicas.
  const needsLegalWarning =
    product.type === "PERISHABLE" || product.type === "UNIQUE";

  //Se permite el pago siempre que no se necesite mostrar adevertencias o se hayan aceptado.
  const canPay =
    (!needsShippingWarning || shippingWarningAccepted) &&
    (!needsLegalWarning || legalAccepted);

  //Función para manejar el pago que se ejecuta cuando el comprador pincha en el botón de Finalizar compra.
  async function handlePay() {
    setLoading(true);
    //Se intenta llamar al endopoint de la API de Stripe. Si no hay respuesta de éxito se muestra el error correspondiente, sino se redirige a la URL de Stripe para realizar el pago.
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          shippingMethod: shipping,
        }),
      });
      if (!res.ok) throw new Error();
      const { data } = (await res.json()) as { data: { url: string } }; //Desestructuración del campo data de la respuesta del endpoint de la API de Stripe. Mediante el type assertion indicamos que el acampo data va a ser de tipo string.
      router.push(data.url); //Redirige a la URL de Stripe Checkout que devolvió el endpoint Para finalizar el pago.
    } catch {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-display mb-6 text-2xl font-bold text-[--text]">
        Finalizar compra
      </h1>

      {/* Producto */}
      <div className="mb-6 rounded-xl border border-[--border] bg-[--surface] p-4">
        <p className="font-medium text-[--text]">{product.name}</p>
        <p className="text-sm text-[--text-muted]">
          {fmt(product.priceInCents)}
        </p>
      </div>

      {/* Método de envío */}
      <fieldset className="mb-6">
        <legend className="mb-3 text-sm font-medium text-[--text]">
          Método de envío
        </legend>
        <div className="flex flex-col gap-2">
          {(["PLATFORM", "ARTISAN_OWN", "PICKUP"] as ShippingMethod[]).map(
            (method) => (
              <label
                key={method}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-[--border] p-3"
              >
                <input
                  type="radio"
                  name="shipping"
                  value={method}
                  checked={shipping === method}
                  onChange={() => {
                    setShipping(method);
                    setShippingWarningAccepted(false);
                  }}
                />
                <span className="text-sm text-[--text]">
                  {method === "PLATFORM" && "Envío con la plataforma (4,90€)"}
                  {method === "ARTISAN_OWN" && "Envío propio de la artesana"}
                  {method === "PICKUP" && "Recogida en persona"}
                </span>
              </label>
            ),
          )}
        </div>
      </fieldset>

      {/* Desglose de costes */}
      <div className="mb-6 flex flex-col gap-2 rounded-xl border border-[--border] bg-[--surface] p-4 text-sm">
        <div className="flex justify-between text-[--text]">
          <span>Precio del producto</span>
          <span>{fmt(product.priceInCents)}</span>
        </div>
        {fees.shippingCost > 0 && (
          <div className="flex justify-between text-[--text]">
            <span>Coste de envío</span>
            <span>{fmt(fees.shippingCost)}</span>
          </div>
        )}
        <div className="flex justify-between text-[--text-muted]">
          <span>Comisión de seguro (2%)</span>
          <span>{fmt(fees.insuranceFee)}</span>
        </div>
        <div className="flex justify-between text-[--text-muted]">
          <span>Fee Stripe (1,5% + 0,25€)</span>
          <span>{fmt(fees.stripeFee)}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-[--border] pt-2 font-semibold text-[--text]">
          <span>Total</span>
          <span>{fmt(fees.total)}</span>
        </div>
      </div>

      {/* Aviso envío sin garantía */}
      {needsShippingWarning && (
        <label className="mb-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={shippingWarningAccepted}
            onChange={(e) => setShippingWarningAccepted(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-sm text-[--text-muted]">
            Entiendo que sin envío de la plataforma, el seguimiento y la
            protección ante incidencias son limitados.
          </span>
        </label>
      )}

      {/* Aviso legal desistimiento */}
      {needsLegalWarning && (
        <label className="mb-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={legalAccepted}
            onChange={(e) => setLegalAccepted(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-sm text-[--text-muted]">
            Entiendo que este producto está exento del derecho de desistimiento
            (Art. 103 Directiva 2011/83/UE).
          </span>
        </label>
      )}

      {/* Botón de pago */}
      <button
        onClick={handlePay}
        disabled={!canPay || loading}
        className="w-full cursor-pointer rounded-full bg-[#3d5a4f] py-3 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Procesando..." : `Pagar ${fmt(fees.total)}`}
      </button>
    </main>
  );
}
