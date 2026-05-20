"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { registerSchema, type RegisterInput } from "~/lib/validations/auth";
import { registerUser } from "./actions";

function RoleSelector({
  onSelect,
}: {
  onSelect: (role: "ARTISAN" | "BUYER") => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl text-[--text]">
          ¿Cómo quieres usar Artelier?
        </h1>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect("ARTISAN")}
          className="flex flex-col items-center gap-3 rounded-xl border border-[--border] bg-[--surface] p-6 text-center transition-colors hover:border-[--primary] hover:bg-[--surface-2]"
        >
          <span className="text-4xl">🎨</span>
          <div>
            <p className="font-display text-sm font-semibold text-[--text]">
              Artesana / Productora
            </p>
            <p className="mt-1 text-xs text-[--text-muted]">
              Vende tu trabajo artesanal
            </p>
          </div>
        </button>
        <button
          onClick={() => onSelect("BUYER")}
          className="flex flex-col items-center gap-3 rounded-xl border border-[--border] bg-[--surface] p-6 text-center transition-colors hover:border-[--primary] hover:bg-[--surface-2]"
        >
          <span className="text-4xl">🛍️</span>
          <div>
            <p className="font-display text-sm font-semibold text-[--text]">
              Compradora
            </p>
            <p className="mt-1 text-xs text-[--text-muted]">
              Descubre artesanía única
            </p>
          </div>
        </button>
      </div>
      <p className="text-center text-sm text-[--text-muted]">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-[--primary] underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
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
      const result = await registerUser(data);
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
            message: messages[0],
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
      <div>
        <button
          onClick={() => setRole(null)}
          className="mb-4 flex items-center gap-1 text-sm text-[--text-muted] hover:text-[--text]"
        >
          ← {role === "ARTISAN" ? "Artesana / Productora" : "Compradora"}
        </button>
        <h1 className="font-display text-2xl text-[--text]">Crear cuenta</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Correo electrónico</Label>
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
          <Label htmlFor="password">Contraseña</Label>
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

        <div className="space-y-1">
          <Label htmlFor="locality">Localidad</Label>
          <Input
            id="locality"
            type="text"
            placeholder="Ej: Santiago de Compostela"
            {...form.register("locality")}
          />
          {form.formState.errors.locality && (
            <p className="text-sm text-red-600">
              {form.formState.errors.locality.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>

      <p className="text-center text-sm text-[--text-muted]">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-[--primary] underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
