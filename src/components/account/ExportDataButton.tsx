"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { requestDataExport } from "~/app/(buyer)/account/settings/actions";

export default function ExportDataButton() {
  const t = useTranslations("settings");
  const tErrors = useTranslations("errors");
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");

  async function handleExport() {
    setStatus("pending");
    const result = await requestDataExport();
    setStatus(result?.error ? "error" : "done");
  }

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg text-[--text]">{t("exportData")}</h2>
      <p className="text-sm text-[--text-muted]">{t("exportDataDescription")}</p>

      <button
        type="button"
        onClick={handleExport}
        disabled={status === "pending" || status === "done"}
        className="cursor-pointer rounded-full bg-[#8f9e94] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#a0afa5] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "pending" ? "Enviando..." : t("exportData")}
      </button>

      {status === "done" && (
        <p className="text-sm text-[#3d5a4f]">{t("exportRequested")}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">{tErrors("generic")}</p>
      )}
    </div>
  );
}
