"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";

import { saveAccount } from "./actions";

const schema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  locality: z.string().trim().min(2, "Introduce tu localidad"),
});
type FormInput = z.infer<typeof schema>;

interface AccountFormProps {
  user: { name: string | null; locality: string | null; email: string | null };
}

export default function AccountForm({ user }: AccountFormProps) {
  const email = user.email;
  const t = useTranslations("account");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name ?? "",
      locality: user.locality ?? "",
    },
    mode: "onBlur",
  });

  function onSubmit(data: FormInput) {
    startTransition(async () => {
      const result = await saveAccount(data);
      if (!result?.error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium leading-none text-[--text-muted]">{t("name")}</label>
        <input
          id="name"
          {...form.register("name")}
          className="w-full rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--text] outline-none focus:border-[#3d5a4f]"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="locality" className="text-sm font-medium leading-none text-[--text-muted]">{t("locality")}</label>
        <input
          id="locality"
          placeholder="Ej: Santiago de Compostela"
          {...form.register("locality")}
          className="w-full rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--text] outline-none focus:border-[#3d5a4f]"
        />
        {form.formState.errors.locality && (
          <p className="text-sm text-red-600">{form.formState.errors.locality.message}</p>
        )}
      </div>

      {email && (
        <div className="space-y-1">
          <label className="text-sm font-medium leading-none text-[--text-muted]">Correo electrónico</label>
          <div className="w-full rounded-md border border-[--border] bg-black/[0.04] px-3 py-2 text-sm text-[--text-muted]">
            {email}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full cursor-pointer rounded-full bg-[#3d5a4f] py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d4a3f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Guardando..." : saved ? t("profileSaved") : t("saveChanges")}
      </button>
    </form>
  );
}
