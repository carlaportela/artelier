"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { requestPasswordReset } from "./actions";

const schema = z.object({
  email: z.string().email("Introduce un correo electrónico válido"),
});
type FormInput = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
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
        <h1 className="font-display text-xl sm:text-2xl text-[--text]">Recupera tu contraseña</h1>
        <p className="text-sm sm:text-base text-[--text-muted]">
          Si existe una cuenta con ese email, recibirás las instrucciones en breve.
        </p>
        <Link
          href="/login"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-[--text-muted] transition-all hover:bg-[#3d5a4f]/10 hover:text-[#3d5a4f]"
        >
          <ArrowLeft size={14} />
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Volver — solo envuelve el texto */}
      <Link
        href="/login"
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-[--text-muted] transition-all hover:bg-[#3d5a4f]/10 hover:text-[#3d5a4f]"
      >
        <ArrowLeft size={14} />
        Volver al inicio de sesión
      </Link>

      <div>
        <h1 className="font-display text-xl sm:text-2xl text-[--text]">Recupera tu contraseña</h1>
        <p className="mt-1 text-sm text-[--text-muted]">
          Introduce tu correo electrónico y te enviaremos el enlace de recuperación.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...form.register("email")}
            className="focus-visible:border-[#3d5a4f] focus-visible:ring-0"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-600">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full cursor-pointer rounded-full bg-[#3d5a4f] py-2 sm:py-2.5 text-sm font-medium text-white hover:bg-[#4a6b5e] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Enviando..." : "Recuperar contraseña"}
        </Button>
      </form>
    </div>
  );
}
