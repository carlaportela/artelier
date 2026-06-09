//Vista client-side de pedidos: botones de aceptar/rechazar con modales de confirmación.

"use client";

import { useState } from "react";
import { toast } from "sonner";
import PaletteAvatar from "~/components/PaletteAvatar";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { acceptCustomOrder, rejectCustomOrder } from "./actions";

interface CustomOrder {
  id: string;
  description: string;
  budgetInCents: number | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: Date;
  buyer: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface Props {
  pending: CustomOrder[];
  processed: CustomOrder[];
}

function formatBudget(cents: number | null) {
  if (!cents) return null;
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(date),
  );
}

function StatusBadge({ status }: { status: CustomOrder["status"] }) {
  if (status === "ACCEPTED") {
    return (
      <span className="rounded px-2 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-50">
        Aceptado
      </span>
    );
  }
  return (
    <span className="rounded px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100">
      Rechazado
    </span>
  );
}

function OrderCard({
  order,
  onAccept,
  onReject,
  isLoading,
}: {
  order: CustomOrder;
  onAccept?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
}) {
  const budget = formatBudget(order.budgetInCents);

  return (
    <div className="rounded-xl border border-[#ccc8bc]/60 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <PaletteAvatar
            src={order.buyer.image}
            name={order.buyer.name}
            className="h-8 w-8 shrink-0"
            fillColor="#c4956a"
          />
          <div>
            <p className="text-sm font-medium text-[--text]">{order.buyer.name ?? "Compradora"}</p>
            <p className="text-xs text-[--text-muted]">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        {order.status !== "PENDING" && <StatusBadge status={order.status} />}
      </div>

      <p className="mt-3 text-sm text-[--text]">{order.description}</p>

      {budget && (
        <p className="mt-2 text-xs text-[--text-muted]">
          Presupuesto sugerido: <span className="font-medium text-[--text]">{budget}</span>
        </p>
      )}

      {order.status === "PENDING" && onAccept && onReject && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={onAccept}
            disabled={isLoading}
            className="rounded-full bg-[#3d5a4f] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:opacity-50"
          >
            Aceptar
          </button>
          <button
            onClick={onReject}
            disabled={isLoading}
            className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            Rechazar
          </button>
        </div>
      )}
    </div>
  );
}

export default function PedidosView({ pending, processed }: Props) {
  const [confirmAccept, setConfirmAccept] = useState<string | null>(null);
  const [confirmReject, setConfirmReject] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAccept(id: string) {
    setLoadingId(id);
    setConfirmAccept(null);
    const result = await acceptCustomOrder(id);
    setLoadingId(null);
    if (result.error) {
      toast.error("No se pudo aceptar el encargo. Inténtalo de nuevo.");
    } else {
      toast.success("Encargo aceptado. Puedes continuar en mensajes.");
    }
  }

  async function handleReject(id: string) {
    setLoadingId(id);
    setConfirmReject(null);
    const result = await rejectCustomOrder(id);
    setLoadingId(null);
    if (result.error) {
      toast.error("No se pudo rechazar la solicitud. Inténtalo de nuevo.");
    } else {
      toast.success("Solicitud rechazada.");
    }
  }

  if (pending.length === 0 && processed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3d5a4f]/10">
          <span className="text-2xl">📦</span>
        </div>
        <div>
          <p className="font-display text-base font-bold text-[--text]">
            Aún no has recibido encargos personalizados
          </p>
          <p className="mt-1 max-w-xs text-sm text-[--text-muted]">
            Cuando una compradora solicite un encargo desde tu perfil público, aparecerá aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Solicitudes pendientes */}
      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[--text-muted]">
            Pendientes ({pending.length})
          </h2>
          <div className="flex flex-col gap-3">
            {pending.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={() => setConfirmAccept(order.id)}
                onReject={() => setConfirmReject(order.id)}
                isLoading={loadingId === order.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Histórico */}
      {processed.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[--text-muted]">
            Histórico
          </h2>
          <div className="flex flex-col gap-3">
            {processed.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}

      {/* Modal confirmar aceptar */}
      <Dialog open={!!confirmAccept} onOpenChange={() => setConfirmAccept(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Aceptar este encargo?</DialogTitle>
            <DialogDescription>
              Se abrirá una conversación con la compradora para que podáis coordinar los detalles.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setConfirmAccept(null)}
              className="rounded-full border border-[#ccc8bc] px-4 py-2 text-sm text-[--text] hover:bg-[#ccc8bc]/30"
            >
              Cancelar
            </button>
            <button
              onClick={() => confirmAccept && handleAccept(confirmAccept)}
              className="rounded-full bg-[#3d5a4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#4a6b5e]"
            >
              Aceptar encargo
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal confirmar rechazar */}
      <Dialog open={!!confirmReject} onOpenChange={() => setConfirmReject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Rechazar esta solicitud?</DialogTitle>
            <DialogDescription>
              La solicitud pasará al histórico. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setConfirmReject(null)}
              className="rounded-full border border-[#ccc8bc] px-4 py-2 text-sm text-[--text] hover:bg-[#ccc8bc]/30"
            >
              Cancelar
            </button>
            <button
              onClick={() => confirmReject && handleReject(confirmReject)}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Rechazar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
