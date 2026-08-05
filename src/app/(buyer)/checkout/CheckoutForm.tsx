"use client";

//Componente de formulario de finalización de compra que se renderiza en cliente.
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Info } from "lucide-react";

//Se importan tipos de métodos de envío y funcionalidad para calcular comisiones.
import { calcFees, type ShippingMethod } from "~/lib/fees";


//Se define el tipo Producto
type Product = {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  type: "UNIQUE" | "PERISHABLE" | "STANDARD";
  isPersonalized: boolean;
  imageUrls: string[];
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
  const [error, setError] = useState<string | null>(null);
  const [showInsuranceInfo, setShowInsuranceInfo] = useState(false);
  const [showStripeInfo, setShowStripeInfo] = useState(false);

  //Se muestran las comisiones por realizar la compra y que se cobraran al comprador.
  const fees = calcFees(product.priceInCents, shipping);

  //Mostrar advertencia de envío para envío a cuenta del vendedor y recogida en persona.
  const needsShippingWarning =
    shipping === "ARTISAN_OWN" || shipping === "PICKUP";

  //Mostrar advertencia legal para productos perecederos y personalizados/hechos a medida
  //(art. 103.c TRLGDCU) — una pieza única en stock, sin más, no está exenta del desistimiento.
  const needsLegalWarning =
    product.type === "PERISHABLE" || product.isPersonalized;

  //Se permite el pago siempre que no se necesite mostrar adevertencias o se hayan aceptado.
  const canPay =
    (!needsShippingWarning || shippingWarningAccepted) &&
    (!needsLegalWarning || legalAccepted);

  //Función para manejar el pago que se ejecuta cuando el comprador pincha en el botón de Finalizar compra.
  async function handlePay() {
    setError(null);
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
      if (!res.ok) throw new Error("No se pudo crear la sesión de pago");
      const { data } = (await res.json()) as { data: { url: string } }; //Desestructuración del campo data de la respuesta del endpoint de la API de Stripe. Mediante el type assertion indicamos que el acampo data va a ser de tipo string.
      router.push(data.url); //Redirige a la URL de Stripe Checkout que devolvió el endpoint Para finalizar el pago.
    } catch {
      setError("No se ha podido iniciar el pago. Revisa tu conexión e inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <main className="px-4 py-8 md:px-6 md:py-10">
      <h1 className="font-display mb-6 text-xl font-bold text-[--text] md:text-2xl">
        Finalizar compra
      </h1>

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-6">
        {/* Columna izquierda — producto, envío y avisos */}
        <div>
          {/* Producto */}
          <div className="mb-4 rounded-xl border border-[--border] bg-[--surface] p-4">
            <p className="font-display mb-3 text-base font-bold text-[--text]">Producto</p>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[--surface-2]">
                {product.imageUrls[0] ? (
                  <Image src={product.imageUrls[0]} alt={product.name} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-[10px] text-[--text-muted]">Sin foto</span>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-sm text-[--text]">{product.name}</p>
                <p className="line-clamp-2 text-xs text-[--text-muted]">
                  {product.description}
                </p>
              </div>
            </div>
          </div>

          {/* Método de envío */}
          <div role="radiogroup" aria-label="Método de envío" className="mb-4 rounded-xl border border-[--border] bg-[--surface] p-4">
            <p className="font-display mb-3 text-base font-bold text-[--text]">
              Método de envío
            </p>
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
                      className="accent-[#3d5a4f]"
                    />
                    <span className="text-sm text-[--text]">
                      {method === "PLATFORM" && "Envío a través de la plataforma (4,90€)"}
                      {method === "ARTISAN_OWN" && "Envío por cuenta de la artesana (sin coste adicional)"}
                      {method === "PICKUP" && "Recogida en persona (sin coste adicional)"}
                    </span>
                  </label>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha — desglose y pago, fija al hacer scroll en escritorio */}
        <div className="mt-4 lg:sticky lg:top-20 lg:mt-0">
          {/* Desglose de costes */}
          <div className="mb-4 rounded-xl border border-[--border] bg-[--surface] p-4">
            <p className="font-display mb-3 text-base font-bold text-[--text]">Desglose de importe</p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-[--text]">
                <span>Producto</span>
                <span>{fmt(product.priceInCents)}</span>
              </div>
              {fees.shippingCost > 0 && (
                <div className="flex justify-between text-[--text]">
                  <span>Envío</span>
                  <span>{fmt(fees.shippingCost)}</span>
                </div>
              )}

              <div>
                <div className="flex justify-between text-[--text-muted]">
                  <span className="flex items-center gap-1">
                    Seguro de la plataforma (2%)
                    <button
                      type="button"
                      onClick={() => setShowInsuranceInfo((prev) => !prev)}
                      aria-label={showInsuranceInfo ? "Ocultar detalle del seguro" : "Ver detalle del seguro"}
                      className="cursor-pointer text-[--text-muted]/50 transition-colors hover:text-[#3d5a4f]"
                    >
                      <Info size={13} />
                    </button>
                  </span>
                  <span>{fmt(fees.insuranceFee)}</span>
                </div>
                {showInsuranceInfo && (
                  <p className="mt-1 rounded-lg bg-[--surface-2] px-3 py-2 text-xs text-[--text-muted]/70">
                    Cubre incidencias de pedido como pérdida, daños y disputas.
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between text-[--text-muted]">
                  <span className="flex items-center gap-1">
                    Pasarela de pago (1,5% + 0,25€)
                    <button
                      type="button"
                      onClick={() => setShowStripeInfo((prev) => !prev)}
                      aria-label={showStripeInfo ? "Ocultar detalle de la pasarela de pago" : "Ver detalle de la pasarela de pago"}
                      className="cursor-pointer text-[--text-muted]/50 transition-colors hover:text-[#3d5a4f]"
                    >
                      <Info size={13} />
                    </button>
                  </span>
                  <span>{fmt(fees.stripeFee)}</span>
                </div>
                {showStripeInfo && (
                  <p className="mt-1 rounded-lg bg-[--surface-2] px-3 py-2 text-xs text-[--text-muted]/70">
                    Comisión de Stripe por procesar el pago.
                  </p>
                )}
              </div>

              <div className="mt-1 flex justify-between border-t border-[--border] pt-2 font-semibold text-[--text]">
                <span>Total</span>
                <span>{fmt(fees.total)}</span>
              </div>
            </div>
          </div>

          {/* Condiciones a aceptar antes de pagar */}
          {(needsShippingWarning || needsLegalWarning) && (
            <div className="mb-4 rounded-xl border border-[--border] bg-[--surface] p-4">
              <p className="font-display mb-3 text-base font-bold text-[--text]">Antes de pagar</p>
              <div className="flex flex-col gap-3">
                {needsShippingWarning && (
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={shippingWarningAccepted}
                      onChange={(e) => setShippingWarningAccepted(e.target.checked)}
                      className="mt-0.5 accent-[#3d5a4f]"
                    />
                    <span className="text-sm text-[--text-muted]">
                      Entiendo que sin envío a través de la plataforma, el seguimiento y la
                      protección ante incidencias son limitados.
                    </span>
                  </label>
                )}

                {needsLegalWarning && (
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={legalAccepted}
                      onChange={(e) => setLegalAccepted(e.target.checked)}
                      className="mt-0.5 accent-[#3d5a4f]"
                    />
                    <span className="text-sm text-[--text-muted]">
                      Acepto que este producto está exento del{" "}
                      <Link
                        href="/condiciones#desistimiento"
                        target="_blank"
                        className="underline hover:text-[--text]"
                      >
                        derecho de desistimiento (Art. 103 Directiva 2011/83/UE)
                      </Link>{" "}
                      al tratarse de{" "}
                      {product.type === "PERISHABLE"
                        ? "un producto perecedero"
                        : "un producto personalizado o hecho a medida"}
                      .
                    </span>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <p className="mb-4 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Botón de pago */}
          <button
            onClick={handlePay}
            disabled={!canPay || loading}
            className="w-full cursor-pointer rounded-full bg-[#3d5a4f] py-3 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Procesando..." : `Pagar ${fmt(fees.total)}`}
          </button>

          {/* Cancelar compra */}
          <Link
            href={`/product/${product.id}`}
            className="mt-3 block w-full cursor-pointer rounded-full border border-[#ccc8bc] py-3 text-center text-sm text-[--text] transition-colors hover:bg-[#ccc8bc]"
          >
            Cancelar compra
          </Link>
        </div>
      </div>
    </main>
  );
}
