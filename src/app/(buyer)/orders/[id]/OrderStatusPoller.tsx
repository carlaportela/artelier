"use client";

//Mantiene actualizado el timeline del pedido para la compradora: pregunta al servidor cada 30s si
//hay novedades (polling + Page Visibility API), replicando el patrón ya establecido en
//src/components/MessageArea.tsx para el chat.
import { useEffect, useRef, useState } from "react";
import type { OrderStatus, ShippingMethod } from "generated/prisma";
import OrderStatusTimeline from "~/components/order/OrderStatusTimeline";
import OrderStatusUpdate from "~/components/order/OrderStatusUpdate";

export interface StatusUpdateData {
  id: string;
  status: OrderStatus;
  message: string | null;
  createdAt: string;
}

interface Props {
  orderId: string;
  initialStatus: OrderStatus;
  shippingMethod: ShippingMethod;
  initialStatusUpdates: StatusUpdateData[];
}

export default function OrderStatusPoller({
  orderId,
  initialStatus,
  shippingMethod,
  initialStatusUpdates,
}: Props) {
  //Estado local para el estado del pedido y las actualizaciones de estado, que se actualizan con los datos del servidor.
  const [status, setStatus] = useState(initialStatus);
  const [statusUpdates, setStatusUpdates] = useState(initialStatusUpdates);

  //Referencia para acceder a la última actualización dentro del setInterval sin closures obsoletas.
  const statusUpdatesRef = useRef(statusUpdates);
  useEffect(() => {
    statusUpdatesRef.current = statusUpdates;
  }, [statusUpdates]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function poll() {
      const last = statusUpdatesRef.current.at(-1);
      const query = last ? `?since=${encodeURIComponent(last.createdAt)}` : "";
      try {
        const res = await fetch(`/api/orders/${orderId}${query}`);
        if (!res.ok) return;
        const { data } = (await res.json()) as {
          data: { status: OrderStatus; statusUpdates: StatusUpdateData[] };
        };
        setStatus(data.status);
        if (data.statusUpdates.length > 0) {
          setStatusUpdates((prev) => [...prev, ...data.statusUpdates]);
        }
      } catch {
        // Error de red silencioso — no interrumpir la UX
      }
    }

    //Inicia el polling cada 30s y lo pausa cuando la pestaña está oculta, reanudándolo al volver a estar visible.
    function startPolling() {
      intervalId = setInterval(() => void poll(), 30_000);
    }

    //Manejador de visibilidad de la pestaña: pausa el polling cuando la pestaña está oculta y lo reanuda al volver a estar visible.
    function handleVisibilityChange() {
      if (document.hidden) {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;
      } else {
        startPolling();
      }
    }

    //Inicia el polling y agrega el manejador de visibilidad al montar el componente, y lo limpia al desmontar.
    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [orderId]);

  return (
    <>
      <div className="rounded-xl border border-[--border] bg-[--surface] p-4">
        <OrderStatusTimeline status={status} shippingMethod={shippingMethod} />
      </div>

      {statusUpdates.length > 0 && ( //Solo renderiza la lista de actualizaciones si hay alguna, para evitar un espacio vacío innecesario.
        <ol className="space-y-2">
          {statusUpdates.map((update) => (
            <OrderStatusUpdate
              key={update.id}
              status={update.status}
              message={update.message}
              createdAt={update.createdAt}
              shippingMethod={shippingMethod}
            />
          ))}
        </ol>
      )}
    </>
  );
}
