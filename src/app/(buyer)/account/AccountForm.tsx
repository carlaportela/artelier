"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { saveAccount } from "./actions";

const schema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  locality: z.string().trim().min(2, "Introduce tu localidad"),
});
type FormInput = z.infer<typeof schema>;

interface AccountFormProps {
  user: { name: string | null; locality: string | null };
}

export default function AccountForm({ user }: AccountFormProps) {
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
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="locality">{t("locality")}</Label>
        <Input
          id="locality"
          placeholder="Ej: Santiago de Compostela"
          {...form.register("locality")}
        />
        {form.formState.errors.locality && (
          <p className="text-sm text-red-600">{form.formState.errors.locality.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : saved ? t("profileSaved") : t("saveChanges")}
      </Button>
    </form>
  );
}
