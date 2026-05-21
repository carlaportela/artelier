"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { requestPasswordReset } from "./actions";

const schema = z.object({
  email: z.string().email("Introduce un email válido"),
});
type FormInput = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  function onSubmit(data: FormInput) {
    startTransition(async () => {
      await requestPasswordReset(data);
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="font-display text-2xl text-[--text]">{t("forgotPasswordTitle")}</h1>
        <p className="text-[--text-muted]">{t("checkYourEmail")}</p>
        <Link href="/login" className="text-sm text-[--primary] underline">
          {t("login")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-[--text]">{t("forgotPasswordTitle")}</h1>
        <p className="mt-1 text-sm text-[--text-muted]">{t("forgotPasswordDescription")}</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Enviando..." : t("sendInstructions")}
        </Button>
      </form>

      <p className="text-center text-sm text-[--text-muted]">
        <Link href="/login" className="text-[--primary] underline">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
