"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { changePassword } from "~/app/(buyer)/account/settings/actions";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function ChangePasswordForm() {
  const t = useTranslations("settings");
  const tErrors = useTranslations("errors");
  const [fields, setFields] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsPending(true);

    const result = await changePassword(fields);

    if (result?.error) {
      const { code } = result.error;
      if (code === "WRONG_PASSWORD") {
        setError(t("wrongPassword"));
      } else if (code === "VALIDATION_ERROR" && result.error.fields) {
        const firstError = Object.values(result.error.fields).flat()[0];
        setError(firstError ?? tErrors("generic"));
      } else {
        setError(tErrors("generic"));
      }
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
          <Label htmlFor={field} className="font-normal text-[--text-muted]">{t(field)}</Label>
          <Input
            id={field}
            type="password"
            value={fields[field]}
            onChange={(e) => setFields((prev) => ({ ...prev, [field]: e.target.value }))}
            required
            className="focus-visible:border-[#3d5a4f] focus-visible:ring-0 focus-visible:outline-none"
          />
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-[#3d5a4f]">{t("passwordChanged")}</p>}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full cursor-pointer rounded-full bg-[#3d5a4f] px-5 py-2 text-sm font-medium text-white hover:bg-[#4a6b5e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Guardando..." : t("changePassword")}
      </Button>
    </form>
  );
}
