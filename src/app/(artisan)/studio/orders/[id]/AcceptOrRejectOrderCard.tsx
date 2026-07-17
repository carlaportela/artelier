"use client";

//Tarjeta que se muestra a la artesana en un pedido recién confirmado, para que lo acepte o lo rechace
//dentro del plazo de 24 horas. Mismo patrón de recogida de motivo que CancelOrderDialog (comprador).
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ACCEPTANCE_WINDOW_MS } from "~/lib/order-constants";

interface Props {
  orderId: string;
  createdAt: string; //ISO string — Date no cruza el límite servidor→cliente como instancia.
}

//Formatea los milisegundos restantes como "Xh Ymin".
function formatRemaining(ms: number) {
  if (ms <= 0) return "0h 0min";
  const totalMinutes = Math.floor(ms / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}min`;
}

//Traduce el código de error del servidor a un mensaje que la artesana pueda entender —
//distingue errores permanentes (reintentar nunca funcionará) de fallos transitorios.
async function getErrorMessage(res: Response, fallback: string) {
  const body = (await res.json().catch(() => null)) as
    | { error?: { code?: string; message?: string } }
    | null;
  switch (body?.error?.code) {
    case "ACCEPTANCE_WINDOW_CLOSED":
      return "El plazo de 24h para decidir sobre este pedido ya ha expirado.";
    case "ORDER_NOT_ACCEPTABLE":
      return "Este pedido ya ha sido procesado.";
    case "INVALID_REASON":
      return "El motivo debe tener al menos 10 caracteres.";
    case "SERVICE_UNAVAILABLE":
      return "El servicio de pagos no está disponible ahora mismo. Inténtalo de nuevo en unos minutos.";
    default:
      return body?.error?.message ?? fallback;
  }
}

export default function AcceptOrRejectOrderCard({ orderId, createdAt }: Props) {
  const router = useRouter();
  const deadline = new Date(createdAt).getTime() + ACCEPTANCE_WINDOW_MS;

  const [remaining, setRemaining] = useState(() => deadline - Date.now());
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  //El plazo ya ha expirado: el servidor rechazaría accept/reject con 409, así que deshabilitamos
  //los botones en vez de dejar que la artesana lo intente y reciba un error.
  const expired = remaining <= 0;

  //Contador visual: se actualiza cada 30s, no hace falta más precisión para un plazo de 24h.
  useEffect(() => {
    const interval = setInterval(() => setRemaining(deadline - Date.now()), 30_000);
    return () => clearInterval(interval);
  }, [deadline]);

  async function handleAccept() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/accept`, { method: "POST" });
      if (!res.ok) {
        toast.error(await getErrorMessage(res, "No se pudo aceptar el pedido. Inténtalo de nuevo."));
        setLoading(false);
        return;
      }
      toast.success("Pedido aceptado. ¡Manos a la obra!");
      router.refresh();
    } catch {
      toast.error("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  async function handleReject() {
    if (reason.trim().length < 10) return; //El motivo es obligatorio, mínimo 10 caracteres.

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      if (!res.ok) {
        toast.error(await getErrorMessage(res, "No se pudo rechazar el pedido. Inténtalo de nuevo."));
        setLoading(false);
        return;
      }
      toast.success("Pedido rechazado. Se ha reembolsado a la compradora.");
      setRejectOpen(false);
      router.refresh();
    } catch {
      toast.error("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-[--border] bg-[--surface] p-4">
      <p className="text-sm font-medium text-[--text]">
        Tienes un pedido nuevo — decide si lo aceptas
      </p>
      <p className="text-xs text-[--text-muted]">
        {expired
          ? "El plazo para decidir ha expirado. El pedido se cancelará automáticamente."
          : `Quedan ${formatRemaining(remaining)} para decidir. Si no respondes a tiempo, el pedido se cancelará automáticamente.`}
      </p>

      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          disabled={loading || expired}
          className="flex-1 rounded-full bg-[#3d5a4f] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:opacity-50"
        >
          Aceptar pedido
        </button>
        <button
          onClick={() => setRejectOpen(true)}
          disabled={loading || expired}
          className="flex-1 rounded-full border border-red-200 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          No puedo con este pedido
        </button>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Rechazar este pedido?</DialogTitle>
            <DialogDescription>
              Se reembolsará íntegramente a la compradora. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="reject-reason" className="text-sm font-medium text-[--text]">
              Motivo del rechazo
            </label>
            <textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explica el motivo (mínimo 10 caracteres)"
              rows={3}
              className="w-full resize-none rounded-xl border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--text] placeholder:text-[--text-muted] focus:outline-none focus:ring-2 focus:ring-[#3d5a4f]/30"
            />
            {reason.trim().length > 0 && reason.trim().length < 10 && (
              <p className="text-xs text-red-500">
                Mínimo 10 caracteres ({reason.trim().length}/10)
              </p>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => setRejectOpen(false)}
              disabled={loading}
              className="rounded-full border border-[--border] px-4 py-2 text-sm text-[--text] transition-colors hover:bg-[--surface-2] disabled:opacity-50"
            >
              Volver
            </button>
            <button
              onClick={handleReject}
              disabled={loading || expired || reason.trim().length < 10}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Rechazando..." : "Confirmar rechazo"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
