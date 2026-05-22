"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { deleteAccount } from "~/app/(buyer)/account/settings/actions";

export default function DeleteAccountForm() {
  const t = useTranslations("settings");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    setError(null);
    setIsPending(true);

    const result = await deleteAccount({ password });

    if (result?.error) {
      setError(result.error.code === "WRONG_PASSWORD" ? t("wrongPassword") : t("wrongPassword"));
      setIsPending(false);
    }
    // Si no hay error, deleteAccount hace redirect("/") — no llegamos aquí
  }

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg text-[--text]">{t("deleteAccount")}</h2>
      <p className="text-sm text-[--text-muted]">{t("deleteAccountWarning")}</p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-pointer rounded-full bg-red-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-800"
        >
          {t("deleteAccount")}
        </button>
      ) : (
        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-[--text]">{t("confirmWithPassword")}</p>
          <div className="space-y-1">
            <label htmlFor="delete-password" className="text-sm text-[--text-muted]">
              {t("confirmWithPassword")}
            </label>
            <input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[--border] bg-white px-3 py-2 text-sm text-[--text] outline-none focus:border-red-400"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending || !password}
              className="cursor-pointer rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Eliminando..." : t("deleteAccount")}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setError(null); setPassword(""); }}
              className="cursor-pointer rounded-full border border-[--border] px-5 py-2 text-sm font-medium text-[--text-muted] transition-colors hover:bg-black/[0.06]"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
