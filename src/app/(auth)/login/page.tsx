"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { loginSchema, type LoginInput } from "~/lib/validations/auth";
import { loginUser } from "./actions";

export default function LoginPage() {
  const t = useTranslations("auth");
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  function onSubmit(data: LoginInput) {
    startTransition(async () => {
      const result = await loginUser(data);
      if (!result?.error) return;

      if (result.error.code === "INVALID_CREDENTIALS") {
        form.setError("root", { message: t("invalidCredentials") });
        return;
      }

      if (result.error.code === "VALIDATION_ERROR" && "fields" in result.error) {
        const fields = result.error.fields as Record<string, string[]>;
        Object.entries(fields).forEach(([field, messages]) => {
          form.setError(field as keyof LoginInput, {
            message: messages[0] ?? "Error de validación",
          });
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {form.formState.errors.root && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {form.formState.errors.root.message}
          </p>
        )}

        <div className="space-y-1">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-600">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("password")}</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-[--text-muted] hover:text-[--text] underline"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-red-600">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Iniciando sesión..." : t("login")}
        </Button>
      </form>

      <p className="text-center text-sm text-[--text-muted]">
        ¿No tienes cuenta?{" "}
        <Link
          href="/register"
          className="font-medium underline underline-offset-2 transition-colors hover:text-[#c4956a]"
        >
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
