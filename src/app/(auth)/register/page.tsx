"use client";

import { useState, useTransition, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Palette, ShoppingBag, ArrowLeft } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { registerSchema, type RegisterInput } from "~/lib/validations/auth";
import { registerUser } from "./actions";
import LocalidadSelect from "~/components/LocalidadSelect";

function RoleSelector({
  onSelect,
}: {
  onSelect: (role: "ARTISAN" | "BUYER") => void;
}) {
  const t = useTranslations("auth");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          {t("chooseRole")}
        </h1>
      </div>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onSelect("ARTISAN")}
          className="group flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all duration-200 hover:scale-[1.02] hover:border-primary hover:shadow-md active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/20">
            <Palette size={24} strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-foreground">
              {t("artisan")}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("artisanDescription")}
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onSelect("BUYER")}
          className="group flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all duration-200 hover:scale-[1.02] hover:border-primary hover:shadow-md active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/20">
            <ShoppingBag size={24} strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-foreground">
              {t("buyer")}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("buyerDescription")}
            </p>
          </div>
        </button>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {t("alreadyHaveAccount")}{" "}
        <Link href="/login" className="cursor-pointer font-medium underline underline-offset-2 transition-colors duration-200 hover:text-teal">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}

function RegisterContent() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? undefined;
  const [role, setRole] = useState<"ARTISAN" | "BUYER" | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", locality: "", role: "BUYER" },
    mode: "onBlur",
  });

  function handleRoleSelect(selected: "ARTISAN" | "BUYER") {
    setRole(selected);
    form.setValue("role", selected);
  }

  function onSubmit(data: RegisterInput) {
    startTransition(async () => {
      const result = await registerUser(data, next);
      if (!result?.error) return;

      if (result.error.code === "EMAIL_EXISTS") {
        form.setError("email", { message: result.error.message });
        return;
      }

      if (
        result.error.code === "VALIDATION_ERROR" &&
        "fields" in result.error
      ) {
        const fields = result.error.fields as Record<string, string[]>;
        Object.entries(fields).forEach(([field, messages]) => {
          form.setError(field as keyof RegisterInput, {
            message: messages[0] ?? "Error de validación",
          });
        });
      }
    });
  }

  if (!role) {
    return <RoleSelector onSelect={handleRoleSelect} />;
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setRole(null)}
        className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
      >
        <ArrowLeft size={14} />
        {role === "ARTISAN" ? t("artisan") : t("buyer")}
      </button>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...form.register("email")}
            className="focus-visible:border-primary focus-visible:ring-0"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-600">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...form.register("password")}
            className="focus-visible:border-primary focus-visible:ring-0"
          />
          {form.formState.errors.password && (
            <p className="text-sm text-red-600">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label>{t("locality")}</Label>
          <LocalidadSelect
            value={form.watch("locality")}
            onChange={(val) => form.setValue("locality", val, { shouldValidate: true })}
            error={form.formState.errors.locality?.message}
            inputClassName="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors focus-visible:border-primary focus-visible:ring-0 md:text-sm"
          />
        </div>

        <Button type="submit" disabled={isPending} className="w-full cursor-pointer rounded-full bg-primary py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? "Creando cuenta..." : t("createAccount")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("alreadyHaveAccount")}{" "}
        <Link href="/login" className="cursor-pointer font-medium underline underline-offset-2 transition-colors duration-200 hover:text-teal">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}
