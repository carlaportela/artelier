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
      <div className="rounded-xl border border-[#ccc8bc]/60 bg-[#f5f0e8]/50 p-5 text-center">
        <p className="text-sm font-medium text-[#3d5a4f]">✓ Solicitud enviada</p>
        <p className="mt-1 text-xs text-[--text-muted]">
          {artisanName ?? "La artesana"} revisará tu encargo y se pondrá en contacto contigo.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-[#ccc8bc]/60 bg-[#f5f0e8]/50 p-5">
      <h2 className="mb-1 font-display text-base font-bold text-[--text]">
        Solicitar encargo personalizado
      </h2>
      <p className="mb-4 text-xs text-[--text-muted]">
        Cuéntale a {artisanName ?? "la artesana"} qué tienes en mente.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Descripción */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[--text]">
            Descripción del encargo <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe qué quieres: material, medidas, colores, para qué ocasión..."
            rows={4}
            maxLength={500}
            className="w-full resize-none rounded-lg border border-[#ccc8bc] bg-white px-3 py-2 text-sm text-[--text] placeholder:text-[--text-muted] focus:border-[#3d5a4f] focus:outline-none"
          />
          <div className="mt-0.5 flex justify-between">
            {fieldErrors.description ? (
              <p className="text-xs text-red-500">{fieldErrors.description[0]}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-[--text-muted]">{description.length}/500</p>
          </div>
        </div>

        {/* Presupuesto (opcional) */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[--text]">
            Presupuesto sugerido{" "}
            <span className="font-normal text-[--text-muted]">(opcional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[--text-muted]">
              €
            </span>
            <input
              type="number"
              value={budgetEuros}
              onChange={(e) => setBudgetEuros(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className="w-full rounded-lg border border-[#ccc8bc] bg-white py-2 pl-7 pr-3 text-sm text-[--text] placeholder:text-[--text-muted] focus:border-[#3d5a4f] focus:outline-none"
            />
          </div>
          {fieldErrors.budgetInCents && (
            <p className="mt-0.5 text-xs text-red-500">{fieldErrors.budgetInCents[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || description.trim().length < 10}
          className="mt-1 rounded-full bg-[#3d5a4f] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Enviando..." : "Enviar solicitud"}
        </button>
      </form>
    </section>
  );
}
