"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { changePassword } from "~/app/(buyer)/account/settings/actions";

export default function ChangePasswordForm() {
  const t = useTranslations("settings");
  const [fields, setFields] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsPending(true);

    const result = await changePassword(fields);

    if (result?.error) {
      if (result.error.code === "WRONG_PASSWORD") setError(t("wrongPassword"));
      else setError(t("wrongPassword"));
    } else {
      setSuccess(true);
      setFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }

    setIsPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="font-display text-lg text-[--text]">{t("changePassword")}</h2>

      {(["currentPassword", "newPassword", "confirmPassword"] as const).map((field) => (
        <div key={field} className="space-y-1">
          <label htmlFor={field} className="text-sm text-[--text-muted]">{t(field)}</label>
          <input
            id={field}
            type="password"
            value={fields[field]}
            onChange={(e) => setFields((prev) => ({ ...prev, [field]: e.target.value }))}
            required
            className="w-full rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--text] outline-none focus:border-[#3d5a4f]"
          />
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-[#3d5a4f]">{t("passwordChanged")}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="cursor-pointer rounded-full bg-[#3d5a4f] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d4a3f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Guardando..." : t("changePassword")}
      </button>
    </form>
  );
}
