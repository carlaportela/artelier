"use client";

//Formulario para que la artesana avance el estado del pedido: En preparación → Listo → Enviado.
//Sustituye a ConfirmShipmentForm.tsx (Historia 6.3) — el paso ahora es genérico (lo decide el
//servidor en /advance-status), no un único salto directo a "enviado".
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { OrderStatus, ShippingMethod } from "generated/prisma";

import { ORDER_STATUS_UPDATE_MESSAGE_MAX_LENGTH } from "~/lib/order-constants";
import { getNextAdvanceableStatus } from "~/lib/order-status-transitions";

interface Props {
  orderId: string;
  status: OrderStatus;
  shippingMethod: ShippingMethod;
}

export default function AdvanceStatusForm({ orderId, status, shippingMethod }: Props) {
  const t = useTranslations("account");
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  //Traduce el código de error del servidor a un mensaje que la artesana pueda entender.
  async function getErrorMessage(res: Response, fallback: string) {
    const body = (await res.json().catch(() => null)) as
      | { error?: { code?: string; message?: string } }
      | null;
    switch (body?.error?.code) {
      case "ORDER_NOT_ADVANCEABLE":
        return t("advanceStatus.errorNotAdvanceable");
      case "INVALID_TRACKING_NUMBER":
        return t("advanceStatus.errorInvalidTracking");
      case "INVALID_MESSAGE":
        return t("advanceStatus.errorMessageTooLong", { max: ORDER_STATUS_UPDATE_MESSAGE_MAX_LENGTH });
      default:
        return body?.error?.message ?? fallback;
    }
  }

  //Solo el paso Listo -> Enviado (envío por plataforma o propio) necesita número de seguimiento.
  const requiresTracking = getNextAdvanceableStatus(status, shippingMethod) === "SHIPPED";
  const canSubmit =
    !loading &&
    (!requiresTracking || trackingNumber.trim().length > 0) &&
    message.trim().length <= ORDER_STATUS_UPDATE_MESSAGE_MAX_LENGTH;

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/advance-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), trackingNumber: trackingNumber.trim() }),
      });
      if (!res.ok) {
        toast.error(await getErrorMessage(res, t("advanceStatus.errorFallback")));
        setLoading(false);
        return;
      }
      toast.success(t("advanceStatus.success"));
      router.refresh();
    } catch {
      toast.error(t("advanceStatus.connectionError"));
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-[--border] bg-[--surface] p-4">
      {requiresTracking && (
        <>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder={t("trackingNumber")}
            className="w-full rounded-xl border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--text] placeholder:text-[--text-muted] focus:ring-2 focus:ring-[#3d5a4f]/30 focus:outline-none"
          />
          {trackingNumber.trim().length === 0 && (
            <p className="text-xs text-[--text-muted]">{t("advanceStatus.trackingNumberHelp")}</p>
          )}
        </>
      )}

      <div className="space-y-1">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("advanceStatus.messagePlaceholder")}
          rows={3}
          className="w-full resize-none rounded-xl border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--text] placeholder:text-[--text-muted] focus:outline-none focus:ring-2 focus:ring-[#3d5a4f]/30"
        />
        <p
          className={`text-xs ${
            message.trim().length > ORDER_STATUS_UPDATE_MESSAGE_MAX_LENGTH ? "text-red-500" : "text-[--text-muted]"
          }`}
        >
          {message.length}/{ORDER_STATUS_UPDATE_MESSAGE_MAX_LENGTH}
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full rounded-full bg-[#3d5a4f] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:opacity-50"
      >
        {loading ? t("advanceStatus.submitting") : t("advanceStatus.submit")}
      </button>
    </div>
  );
}
