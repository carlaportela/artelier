"use client";

//Modal que se muestra cuando el comprador pulsa en el botón de cancelar pedido.
import { useState } from "react";
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

interface Props {
  orderId: string;
}

export default function CancelOrderDialog({ orderId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  //Función para gestionar la cancelación de un pedido.
  async function handleCancel() {
    if (reason.trim().length < 10) return; //La razón de cancelación es obligatoria y tiene además un mínimo de 10 caracteres.

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: { code?: string } };
        if (data.error?.code === "CANCELLATION_WINDOW_CLOSED") {
          toast.error("La ventana de cancelación de 24h ha expirado.");
        } else {
          toast.error("No se pudo cancelar el pedido. Inténtalo de nuevo.");
        }
        setLoading(false);
        return;
      }

      toast.success("Pedido cancelado. El reembolso llegará en 5-10 días hábiles.");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full cursor-pointer rounded-full bg-red-700 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
      >
        Cancelar pedido
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">¿Quieres cancelar este pedido?</DialogTitle>
            <DialogDescription>
              Esta acción es irreversible.
              <br />
              Cuando se cancele el pedido te reembolsaremos íntegramente el importe en el
              método de pago seleccionado en un plazo de 5 a 7 días hábiles.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explica el motivo de tu cancelación (mínimo 10 caracteres)"
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
              onClick={() => setOpen(false)}
              disabled={loading}
              className="cursor-pointer rounded-full border border-[--border] px-4 py-2 text-sm text-[--text] transition-colors hover:bg-[--surface-2] disabled:opacity-50"
            >
              Volver
            </button>
            <button
              onClick={handleCancel}
              disabled={loading || reason.trim().length < 10}
              className="cursor-pointer rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? "Cancelando..." : "Confirmar cancelación"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
