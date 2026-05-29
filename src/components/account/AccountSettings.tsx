"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { changePassword } from "~/app/(buyer)/account/settings/actions";
import { requestDataExport } from "~/app/(buyer)/account/settings/actions";
import { deleteAccount } from "~/app/(buyer)/account/settings/actions";

type Section = "password" | "export" | "delete" | null;

// ── Estilos compartidos ──────────────────────────────────────────────────────

const btnPrimary =
  "cursor-pointer rounded-full bg-[#3d5a4f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:opacity-60 disabled:cursor-not-allowed";

const btnOutline =
  "cursor-pointer rounded-full border border-[#ccc8bc] px-4 py-2 text-sm text-[--text] transition-colors hover:bg-[#ccc8bc]";

const btnDanger =
  "cursor-pointer rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:pointer-events-none";

// ── Sección: Cambiar contraseña ──────────────────────────────────────────────

export function PasswordSection({ onClose }: { onClose: () => void }) {
  const t = useTranslations("settings");
  const tErrors = useTranslations("errors");
  const [fields, setFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    const result = await changePassword(fields);
    if (result?.error) {
      const { code } = result.error;
      if (code === "WRONG_PASSWORD") setError(t("wrongPassword"));
      else if (code === "VALIDATION_ERROR" && result.error.fields) {
        const first = Object.values(result.error.fields).flat()[0];
        setError(first ?? tErrors("generic"));
      } else setError(tErrors("generic"));
    } else {
      setSuccess(true);
      setFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
    setIsPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {(["currentPassword", "newPassword", "confirmPassword"] as const).map((field) => (
        <div key={field} className="space-y-1">
          <Label htmlFor={field} className="font-normal text-[--text-muted]">
            {t(field)}
          </Label>
          <Input
            id={field}
            type="password"
            value={fields[field]}
            onChange={(e) => setFields((prev) => ({ ...prev, [field]: e.target.value }))}
            required
            className="focus-visible:border-[#3d5a4f] focus-visible:ring-0"
          />
        </div>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-[#3d5a4f]">{t("passwordChanged")}</p>}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={isPending || !fields.currentPassword || !fields.newPassword || !fields.confirmPassword} className="cursor-pointer rounded-full bg-[#94a49e] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#a3b1ab] disabled:opacity-50 disabled:pointer-events-none">
          {isPending ? "Guardando..." : "Guardar nueva contraseña"}
        </button>
        <button type="button" onClick={onClose} className={btnOutline}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ── Sección: Exportar datos ──────────────────────────────────────────────────

export function ExportSection({ onClose }: { onClose: () => void }) {
  const t = useTranslations("settings");
  const tErrors = useTranslations("errors");
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");

  async function handleExport() {
    setStatus("pending");
    const result = await requestDataExport();
    setStatus(result?.error ? "error" : "done");
  }

  return (
    <div className="space-y-3 pt-2">
      <p className="text-sm text-[--text-muted]">
        Puedes solicitar una copia de todos tus datos personales almacenados en Artelier.
        Recibirás un correo electrónico con el archivo en un plazo de 48 horas.
      </p>
      {status === "done" && (
        <p className="text-sm text-[#3d5a4f]">{t("exportRequested")}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">{tErrors("generic")}</p>
      )}
      <div className="flex gap-2">
        {status !== "done" && (
          <button
            type="button"
            onClick={handleExport}
            disabled={status === "pending"}
            className="cursor-pointer rounded-full bg-[#94a49e] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "pending" ? "Enviando..." : "Solicitar exportación"}
          </button>
        )}
        <button type="button" onClick={onClose} className={btnOutline}>
          {status === "done" ? "Cerrar" : "Cancelar"}
        </button>
      </div>
    </div>
  );
}

// ── Sección: Eliminar cuenta ─────────────────────────────────────────────────

export function DeleteSection({ onClose }: { onClose: () => void }) {
  const t = useTranslations("settings");
  const tErrors = useTranslations("errors");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    setError(null);
    setIsPending(true);
    const result = await deleteAccount({ password });
    if (result?.error) {
      setError(result.error.code === "WRONG_PASSWORD" ? t("wrongPassword") : tErrors("generic"));
      setIsPending(false);
    }
    // Si no hay error, deleteAccount hace redirect — no llegamos aquí
  }

  return (
    <div className="space-y-3 pt-2">
      <p className="text-sm text-[--text-muted]">
        ¡Nos da mucha pena que te vayas! Esta acción es{" "}
        <strong className="text-[--text]">permanente e irreversible</strong>:{" "}
        se eliminarán tu perfil, productos y todos tus datos de Artelier.
      </p>
      <div className="space-y-1">
        <Label htmlFor="delete-password" className="font-normal text-[--text-muted]">
          Contraseña actual
        </Label>
        <Input
          id="delete-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus-visible:border-red-400 focus-visible:ring-0"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending || !password}
          className={btnDanger}
        >
          {isPending ? "Eliminando..." : "Confirmar eliminación"}
        </button>
        <button type="button" onClick={onClose} className={btnOutline}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function AccountSettings() {
  const [active, setActive] = useState<Section>(null);

  function toggle(section: Section) {
    if (active === section) return; // el botón activo no se puede volver a pulsar
    setActive(section);
  }

  return (
    <div className="space-y-4">
      {/* Tres botones inline */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => toggle("password")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium text-white transition-all ${
            active === "password"
              ? "cursor-default bg-[#3d5a4f] opacity-75 shadow-inner"
              : "cursor-pointer bg-[#3d5a4f] hover:bg-[#4a6b5e] transition-colors"
          }`}
        >
          Cambiar contraseña
        </button>
        <button
          type="button"
          onClick={() => toggle("export")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium text-white transition-all ${
            active === "export"
              ? "cursor-default bg-[#94a49e] opacity-60 shadow-inner"
              : "cursor-pointer bg-[#94a49e] hover:opacity-80"
          }`}
        >
          Exportar datos
        </button>
        <button
          type="button"
          onClick={() => toggle("delete")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium text-white transition-all ${
            active === "delete"
              ? "cursor-default bg-red-700 opacity-60 shadow-inner"
              : "cursor-pointer bg-red-700 hover:bg-red-600"
          }`}
        >
          Eliminar cuenta
        </button>
      </div>

      {/* Sección expandida */}
      {active === "password" && <PasswordSection onClose={() => setActive(null)} />}
      {active === "export"   && <ExportSection   onClose={() => setActive(null)} />}
      {active === "delete"   && <DeleteSection   onClose={() => setActive(null)} />}
    </div>
  );
}
