"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import StudioProfileEditor from "./StudioProfileEditor";
import { PasswordSection, DeleteSection } from "~/components/account/AccountSettings";
import { saveProfileInfo } from "./actions";
import { requestDataExport } from "~/app/(buyer)/account/settings/actions";
import LocalidadSelect from "~/components/LocalidadSelect";
import StripeConnectButton from "~/components/StripeConnectButton";

type ActiveSection = "profile" | "export" | "account" | null;

interface Props {
  user: {
    id: string;
    name: string | null;
    bio: string | null;
    locality: string | null;
    image: string | null;
    bannerImage: string | null;
    email: string | null;
    stripeAccountId: string | null;
  };
  sealRequests: Array<{ id: string; seal: { name: string; type: string } }>;
  followersCount: number;
  //Si venimos de completar el onboarding de Stripe, abrimos directamente "Gestionar cuenta" para
  //que se vea de inmediato el nuevo estado "✓ Tu cuenta bancaria está conectada."
  justConnectedStripe?: boolean;
}

export default function ProfilePageClient({ user, sealRequests, followersCount, justConnectedStripe }: Props) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<ActiveSection>(
    justConnectedStripe ? "account" : null,
  );

  function toggle(section: ActiveSection) {
    if (activeSection === section) return; // el botón activo no se puede volver a pulsar
    setActiveSection(section);
  }

  return (
    <>
      {/* ── Banner, avatar y datos en modo lectura ── */}
      <StudioProfileEditor user={user} sealRequests={sealRequests} followersCount={followersCount} />

      {/* ── Sección de cuenta ── */}
      <section className="mt-8 space-y-6 px-5 pb-8">
        <hr className="border-[#ccc8bc]" />

        {/* ── 3 botones principales ── */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toggle("profile")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium text-white transition-all ${
              activeSection === "profile"
                ? "cursor-default bg-[#3d5a4f] opacity-75 shadow-inner"
                : "cursor-pointer bg-[#3d5a4f] hover:bg-[#4a6b5e]"
            }`}
          >
            Editar perfil
          </button>

          <button
            type="button"
            onClick={() => toggle("account")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium text-white transition-all ${
              activeSection === "account"
                ? "cursor-default bg-[#94a49e] opacity-60 shadow-inner"
                : "cursor-pointer bg-[#94a49e] hover:bg-[#a3b1ab]"
            }`}
          >
            Gestionar cuenta
          </button>

          <button
            type="button"
            onClick={() => toggle("export")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium text-white transition-all ${
              activeSection === "export"
                ? "cursor-default bg-[#c4956a] opacity-75 shadow-inner"
                : "cursor-pointer bg-[#c4956a] hover:bg-[#d4a57a]"
            }`}
          >
            Exportar datos
          </button>
        </div>

        {/* ── Secciones expandidas ── */}
        {activeSection === "profile" && (
          <ProfileEditSection
            user={user}
            onClose={() => setActiveSection(null)}
            onSaved={() => { setActiveSection(null); router.refresh(); }}
          />
        )}
        {activeSection === "export" && (
          <ExportDataSection onClose={() => setActiveSection(null)} />
        )}
        {activeSection === "account" && (
          <AccountSection
            user={user}
            justConnectedStripe={justConnectedStripe}
            onClose={() => setActiveSection(null)}
          />
        )}
      </section>
    </>
  );
}

// ── Editar perfil (nombre, localidad, bio) ───────────────────────────────────

function ProfileEditSection({
  user,
  onClose,
  onSaved,
}: {
  user: Props["user"];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [locality, setLocality] = useState(user.locality ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setErrors({});
    startTransition(async () => {
      const result = await saveProfileInfo({ name, bio, locality });
      if (!result) { setErrors({ general: "Algo fue mal. Inténtalo de nuevo." }); return; }
      if ("error" in result) {
        if (result.error?.code === "VALIDATION_ERROR") {
          const fields = (result.error as { code: string; fields: Record<string, string[]> }).fields;
          const flat: Record<string, string> = {};
          Object.entries(fields).forEach(([k, v]) => { if (v?.[0]) flat[k] = v[0]; });
          setErrors(flat);
        } else {
          setErrors({ general: "Algo fue mal. Inténtalo de nuevo." });
        }
        return;
      }
      onSaved();
    });
  }

  return (
    <div className="space-y-4 pt-2">
      {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}

      <div className="space-y-2">
        <label className="block pl-1 text-sm font-medium text-[--text]">Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="w-full rounded-lg border border-[#ccc8bc] bg-white px-3 py-1.5 text-sm text-[--text] outline-none transition-colors focus-visible:border-[#3d5a4f]"
        />
        {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <label className="block pl-1 text-sm font-medium text-[--text]">Localidad</label>
        <LocalidadSelect value={locality} onChange={setLocality} error={errors.locality} />
      </div>

      <div>
        <div className="space-y-2">
          <label className="block pl-1 text-sm font-medium text-[--text]">Biografía</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={150}
            placeholder="Cuéntanos algo sobre ti..."
            className="w-full resize-none rounded-lg border border-[#ccc8bc] bg-white px-3 py-2 text-sm text-[--text] outline-none placeholder:text-[--text-muted] transition-colors focus-visible:border-[#3d5a4f]"
          />
        </div>
        <p className={`mt-1 text-right text-xs ${bio.length > 130 ? "text-red-500" : "text-[--text-muted]"}`}>
          {150 - bio.length} restantes
        </p>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="cursor-pointer rounded-full bg-[#3d5a4f] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="cursor-pointer rounded-full border border-[#ccc8bc] px-4 py-1.5 text-sm text-[--text] transition-colors hover:bg-[#ccc8bc] disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Exportar datos ───────────────────────────────────────────────────────────

function ExportDataSection({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");

  async function handleExport() {
    setStatus("pending");
    const result = await requestDataExport();
    setStatus(result?.error ? "error" : "done");
  }

  return (
    <div className="space-y-4 pt-2">
      <p className="text-sm text-[--text-muted]">
        Recibirás un correo electrónico en la dirección de tu cuenta con el archivo adjunto en pdf en un plazo de 48 horas.
      </p>

      {status === "done" && (
        <p className="text-sm text-[#3d5a4f]">✓ Solicitud enviada. Revisa tu correo en las próximas 48 horas.</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">No se pudo enviar la solicitud. Inténtalo de nuevo.</p>
      )}

      <div className="flex gap-2">
        {status !== "done" && (
          <button
            type="button"
            onClick={() => { void handleExport(); }}
            disabled={status === "pending"}
            className="cursor-pointer rounded-full bg-[#c4956a] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#d4a57a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "pending" ? "Enviando..." : "Confirmar exportación"}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-full border border-[#ccc8bc] px-4 py-1.5 text-sm text-[--text] transition-colors hover:bg-[#ccc8bc]"
        >
          {status === "done" ? "Cerrar" : "Cancelar"}
        </button>
      </div>
    </div>
  );
}

// ── Gestionar cuenta (email + contraseña + eliminar + pagos) ─────────────────

function AccountSection({
  user,
  justConnectedStripe,
  onClose,
}: {
  user: Props["user"];
  justConnectedStripe?: boolean;
  onClose: () => void;
}) {
  const [subSection, setSubSection] = useState<"password" | "delete" | null>(null);

  function toggleSub(section: "password" | "delete") {
    if (subSection === section) return; // el botón activo no se puede volver a pulsar
    setSubSection(section);
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Email — solo lectura */}
      <div className="space-y-2">
        <label htmlFor="account-email" className="block pl-1 text-sm font-medium text-[--text]">
          Correo electrónico
        </label>
        <input
          id="account-email"
          type="email"
          value={user.email ?? ""}
          readOnly
          className="w-full cursor-default rounded-lg border border-[#ccc8bc] bg-[--surface] px-3 py-1.5 text-sm text-[--text-muted] outline-none"
        />
        <div className="flex items-start gap-2 rounded-lg bg-[--surface-2] px-3 py-2">
          <Info size={13} className="mt-0.5 shrink-0 text-[#3d5a4f]/60" />
          <p className="text-xs text-[--text-muted]">El correo electrónico no puede modificarse desde la aplicación.</p>
        </div>
      </div>

      {/* Cuentas vinculadas (Stripe Connect) — siempre visible, no hace falta desplegarla */}
      <div className="space-y-2">
        <label className="block pl-1 text-sm font-medium text-[--text]">Recepción de pagos</label>
        {user.stripeAccountId ? (
          <p className="rounded-lg bg-[--surface-2] px-3 py-2 text-sm text-[#3d5a4f]">
            {justConnectedStripe
              ? "✓ Tu cuenta bancaria se ha conectado con éxito."
              : "✓ Tu cuenta bancaria está conectada."}
          </p>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-[--surface-2] px-3 py-2">
            <Info size={13} className="shrink-0 text-[#3d5a4f]/60" />
            <p className="flex-1 text-xs text-[--text-muted]">
              Debes conectar una cuenta bancaria para poder recibir los pagos.
            </p>
            <StripeConnectButton
              label="Conectar"
              returnTo="/studio/profile"
              className="shrink-0 cursor-pointer rounded-full bg-[#3d5a4f] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        )}
      </div>

      {/* Botones de acciones de cuenta */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => toggleSub("password")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium text-white transition-all ${
            subSection === "password"
              ? "cursor-default bg-[#94a49e] opacity-60 shadow-inner"
              : "cursor-pointer bg-[#94a49e] hover:bg-[#a3b1ab]"
          }`}
        >
          Cambiar contraseña
        </button>
        <button
          type="button"
          onClick={() => toggleSub("delete")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium text-white transition-all ${
            subSection === "delete"
              ? "cursor-default bg-red-700 opacity-60 shadow-inner"
              : "cursor-pointer bg-red-700 hover:bg-red-600"
          }`}
        >
          Eliminar cuenta
        </button>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-full border border-[#ccc8bc] px-4 py-1.5 text-sm text-[--text] transition-colors hover:bg-[#ccc8bc]"
        >
          Cancelar
        </button>
      </div>

      {subSection === "password" && (
        <PasswordSection onClose={() => setSubSection(null)} />
      )}
      {subSection === "delete" && (
        <DeleteSection onClose={() => setSubSection(null)} />
      )}
    </div>
  );
}
