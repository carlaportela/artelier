"use client";

import { Suspense, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { resetPassword } from "./actions";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});
type FormInput = z.infer<typeof schema>;

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { token, password: "" },
    mode: "onBlur",
  });

  function onSubmit(data: FormInput) {
    startTransition(async () => {
      const result = await resetPassword(data);
      if (!result?.error) return;

      if (result.error.code === "INVALID_TOKEN") {
        form.setError("root", { message: t("invalidToken") });
        return;
      }

      if (result.error.code === "VALIDATION_ERROR" && "fields" in result.error) {
        const fields = result.error.fields as Record<string, string[]>;
        Object.entries(fields).forEach(([field, messages]) => {
          form.setError(field as keyof FormInput, {
            message: messages[0] ?? "Error de validación",
          });
        });
      }
    });
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-[--text-muted]">{t("invalidToken")}</p>
        <Link href="/forgot-password" className="text-sm text-[--primary] underline">
          {t("forgotPasswordTitle")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-[--text]">{t("resetPasswordTitle")}</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...form.register("token")} />

        {form.formState.errors.root && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {form.formState.errors.root.message}
          </p>
        )}

        <div className="space-y-1">
          <Label htmlFor="password">{t("newPassword")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-red-600">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Guardando..." : t("savePassword")}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
