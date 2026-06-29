"use client";

//Componente de confirmación de envío realizado.
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  shippingMethod: string;
}

export default function ConfirmShipmentForm({
  orderId,
  shippingMethod,
}: Props) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  //Función para gestionar la confirmación de envío
  async function handleSubmit() {
    setLoading(true); //Se pone cargando en true

    //Se llama mediante POST a la APi de confirmación de envío
    const res = await fetch(`/api/orders/${orderId}/confirm-shipment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingNumber }),
    });

    //Se vuelve a establecer cargando en false.
    setLoading(false);

    //Se muestra si la confirmación de envío se ha realizado con éxito o no
    if (res.ok) {
      toast.success("¡Envío realizado!");
      router.refresh();
    } else {
      toast.error(
        "No se ha podido confirmar la realización del envío. Por favor, inténtalo de nuevo.",
      );
    }
  }

  return (
    <div className="space-y-3">
      {shippingMethod !== "PICKUP" && ( //Si el método no es recogida en persona, se muestra el input para introducir el número de seguimiento.
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Número de seguimiento"
          className="w-full rounded-xl border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--text] placeholder:text-[--text-muted] focus:ring-2 focus:ring-[#3d5a4f]/30 focus:outline-none"
        />
      )}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full rounded-full bg-[#3d5a4f] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:opacity-50"
      >
        {loading //Si es recogida en persona, en el botón de confirmar el el envío se muestra el texto de "Marcar listo para recogida", sino "Confirmar envío"
          ? "Confirmando..."
          : shippingMethod === "PICKUP"
            ? "Marcar como listo para recogida"
            : "Confirmar envío"}
      </button>
    </div>
  );
}
