"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { deleteAccount } from "~/app/(buyer)/account/settings/actions";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function DeleteAccountForm() {
  const t = useTranslations("settings");
  const tErrors = useTranslations("errors");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    setError(null);
    setIsPending(true);

    const result = await deleteAccount({ password });

    if (result?.error) {
      setError(result.error.code === "WRONG_PASSWORD" ? t("wrongPassword") : tErrors("generic"));
      setIsPending(false);
    }
    // Si no hay error, deleteAccount hace redirect("/") — no llegamos aquí
  }

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg text-[--text]">{t("deleteAccount")}</h2>
      <p className="text-sm text-[--text-muted]">{t("deleteAccountWarning")}</p>

      {!open ? (
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-red-700 px-5 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          {t("deleteAccount")}
        </Button>
      ) : (
        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-[--text]">{t("confirmWithPassword")}</p>
          <div className="space-y-1">
            <Label htmlFor="delete-password" className="font-normal text-[--text-muted]">
              {t("confirmWithPassword")}
            </Label>
            <Input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white focus-visible:border-red-400 focus-visible:ring-0"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isPending || !password}
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              {isPending ? "Eliminando..." : t("deleteAccount")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setOpen(false); setError(null); setPassword(""); }}
              className="rounded-full px-5 py-2 text-sm font-medium text-[--text-muted] hover:bg-black/[0.06]"
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
