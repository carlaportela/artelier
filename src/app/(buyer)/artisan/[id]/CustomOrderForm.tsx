//Formulario para que una compradora envíe una solicitud de encargo personalizado.
//Solo visible para compradoras autenticadas que no sean la propia artesana.

"use client";

import { useState } from "react";
import { toast } from "sonner";

import { submitCustomOrderRequest } from "./actions";

interface Props {
  artisanId: string;
  artisanName: string | null;
}

export default function CustomOrderForm({ artisanId, artisanName }: Props) {
  const [description, setDescription] = useState("");
  const [budgetEuros, setBudgetEuros] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    description?: string[];
    budgetInCents?: string[];
  }>({});
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setIsPending(true);

    const parsedBudget = budgetEuros.trim() !== "" ? parseFloat(budgetEuros) : undefined;
    if (parsedBudget !== undefined && Number.isNaN(parsedBudget)) {
      setFieldErrors({ budgetInCents: ["Introduce un número válido"] });
      setIsPending(false);
      return;
    }
    const budgetInCents = parsedBudget !== undefined ? Math.round(parsedBudget * 100) : undefined;

    const result = await submitCustomOrderRequest(artisanId, {
      description,
      budgetInCents,
    });

    setIsPending(false);

    if (result.error) {
      if (result.error.code === "VALIDATION_ERROR" && "fields" in result.error) {
        setFieldErrors(result.error.fields);
      } else {
        toast.error("No se pudo enviar la solicitud. Inténtalo de nuevo.");
      }
      return;
    }

    setSubmitted(true);
    toast.success("Tu solicitud ha sido enviada");
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-border/60 bg-background/50 p-5 text-center">
        <p className="text-sm font-medium text-primary">✓ Solicitud enviada</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {artisanName ?? "La artesana"} revisará tu encargo y se pondrá en contacto contigo.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-border/60 bg-background/50 p-5">
      <h2 className="mb-1 font-display text-base font-bold text-foreground">
        Solicitar encargo personalizado
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Cuéntale a {artisanName ?? "la artesana"} qué tienes en mente.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Descripción */}
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Descripción del encargo <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe qué quieres: material, medidas, colores, para qué ocasión..."
            rows={4}
            maxLength={500}
            className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <div className="mt-0.5 flex justify-between">
            {fieldErrors.description ? (
              <p className="text-xs text-red-500">{fieldErrors.description[0]}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-muted-foreground">{description.length}/500</p>
          </div>
        </div>

        {/* Presupuesto (opcional) */}
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Presupuesto sugerido{" "}
            <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              €
            </span>
            <input
              type="number"
              value={budgetEuros}
              onChange={(e) => setBudgetEuros(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className="w-full rounded-lg border border-border bg-white py-2 pl-7 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          {fieldErrors.budgetInCents && (
            <p className="mt-0.5 text-xs text-red-500">{fieldErrors.budgetInCents[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || description.trim().length < 10}
          className="mt-1 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Enviando..." : "Enviar solicitud"}
        </button>
      </form>
    </section>
  );
}
