//Componentes para editar el perfil del estudio.

"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { Pencil, MapPin, Loader2, Trash2 } from "lucide-react";

import { saveProfile } from "./actions";
import LocalidadSelect from "~/components/LocalidadSelect";
import PaletteAvatar from "~/components/PaletteAvatar";
import CropModal from "~/components/CropModal";

const SEAL_CLASS: Record<string, string> = {
  mano:      "seal-mano",
  eco:       "seal-eco",
  reciclado: "seal-reciclado",
  galicia:   "seal-galicia",
  km0:       "seal-km0",
};

interface Props {
  user: {
    id: string;
    name: string | null;
    bio: string | null;
    locality: string | null;
    image: string | null;
    bannerImage: string | null;
  };
  sealRequests: Array<{ id: string; seal: { name: string; type: string } }>;
}

export default function StudioProfileEditor({ user, sealRequests }: Props) {
  const [avatarUrl, setAvatarUrl] = useState(user.image ?? "");
  const [bannerUrl, setBannerUrl] = useState(user.bannerImage ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [locality, setLocality] = useState(user.locality ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // P21: último estado guardado con éxito — Cancelar revierte a esto, no al prop original
  const [lastSaved, setLastSaved] = useState({
    name: user.name ?? "",
    bio: user.bio ?? "",
    locality: user.locality ?? "",
  });

  // P20: refs que siempre reflejan el valor actual, sin stale closure en funciones async
  const nameRef = useRef(name);
  const bioRef = useRef(bio);
  const localityRef = useRef(locality);
  nameRef.current = name;
  bioRef.current = bio;
  localityRef.current = locality;

  const [cropState, setCropState] = useState<{ file: File; type: "avatar" | "banner" } | null>(null);
  const [optionsOpen, setOptionsOpen] = useState<"avatar" | "banner" | null>(null);

  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  // ── Upload + auto-guardar imagen ─────────────────────────────────────────

  async function handleUpload(file: File, type: "avatar" | "banner") {
    const setUploading = type === "avatar" ? setUploadingAvatar : setUploadingBanner;
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = (await res.json()) as { data?: { url: string }; error?: { code: string; message: string } };
      if (json.data?.url) {
        const newUrl = json.data.url;
        const nextAvatar = type === "avatar" ? newUrl : avatarUrl;
        const nextBanner = type === "banner" ? newUrl : bannerUrl;
        if (type === "avatar") setAvatarUrl(newUrl);
        else setBannerUrl(newUrl);
        // P20: leer desde refs para tener siempre el valor actual (evita stale closure en async)
        await saveProfile({ name: nameRef.current, bio: bioRef.current, locality: localityRef.current, image: nextAvatar, bannerImage: nextBanner });
      } else {
        const msg = json.error?.message ?? "Error al subir la imagen";
        console.error("[upload]", json.error);
        setUploadError(msg);
      }
    } catch (err) {
      console.error("[upload] red error:", err);
      setUploadError("Error de conexión al subir la imagen");
    }
    setUploading(false);
  }

  // ── Eliminar imagen ─────────────────────────────────────────────────────

  async function handleDelete(type: "avatar" | "banner") {
    // Guardar URLs previas por si hay que revertir
    const prevAvatar = avatarUrl;
    const prevBanner = bannerUrl;
    const nextAvatar = type === "avatar" ? "" : avatarUrl;
    const nextBanner = type === "banner" ? "" : bannerUrl;
    if (type === "avatar") setAvatarUrl("");
    else setBannerUrl("");
    try {
      await saveProfile({ name, bio, locality, image: nextAvatar, bannerImage: nextBanner });
    } catch {
      // Revertir el estado visual si el servidor falló
      if (type === "avatar") setAvatarUrl(prevAvatar);
      else setBannerUrl(prevBanner);
      setUploadError("No se pudo eliminar la imagen. Inténtalo de nuevo.");
    }
  }

  // ── Guardar campos de texto ──────────────────────────────────────────────

  function handleSave() {
    setErrors({});
    setUploadError(null);
    startTransition(async () => {
      const result = await saveProfile({ name, bio, locality, image: avatarUrl, bannerImage: bannerUrl });
      if (!result) {
        setUploadError("Algo fue mal. Inténtalo de nuevo.");
        return;
      }
      if ("error" in result) {
        if (result.error?.code === "VALIDATION_ERROR") {
          const fields = (result.error as { code: string; fields: Record<string, string[]> }).fields;
          const flat: Record<string, string> = {};
          Object.entries(fields).forEach(([k, v]) => { if (v?.[0]) flat[k] = v[0]; });
          setErrors(flat);
        } else {
          setUploadError("Algo fue mal. Inténtalo de nuevo.");
        }
        return;
      }
      // P21: guardar los valores confirmados para que Cancelar revierta a esto
      setLastSaved({ name, bio, locality });
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  function handleCancel() {
    // P21: revertir al último guardado exitoso, no al prop original del servidor
    setName(lastSaved.name);
    setBio(lastSaved.bio);
    setLocality(lastSaved.locality);
    setErrors({});
    setIsEditing(false);
  }

  return (
    <>
    <div>
      {/* ── Banner ── */}
      <div className="relative h-[155px] w-full overflow-hidden md:h-[175px]">
        {bannerUrl ? (
          <Image src={bannerUrl} alt="" fill className="object-cover" priority />
        ) : (
          <div className="banner-lino h-full w-full" />
        )}
        <button
          type="button"
          onClick={() => setOptionsOpen("banner")}
          disabled={uploadingBanner}
          aria-label="Editar portada"
          className="absolute right-4 top-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#3d5a4f] text-white shadow-md transition-colors hover:bg-[#4a6b5e] disabled:opacity-50"
        >
          {uploadingBanner ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />}
        </button>
        <input ref={bannerRef} type="file" accept="image/*" aria-label="Subir imagen de portada"
          className="sr-only" disabled={uploadingBanner}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) { e.target.value = ""; setCropState({ file: f, type: "banner" }); }
          }}
        />
      </div>

      {/* ── Avatar ── */}
      <div className="px-2">
        <div className="relative -mt-[79px] flex items-end justify-start">
          <div className="relative">
            <PaletteAvatar src={avatarUrl || null} name={name} className="h-40 w-40" />
            <button
              type="button"
              onClick={() => setOptionsOpen("avatar")}
              disabled={uploadingAvatar}
              aria-label="Editar imagen de perfil"
              className="absolute bottom-10 right-5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#3d5a4f] text-white shadow-md transition-colors hover:bg-[#4a6b5e] disabled:opacity-50"
            >
              {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />}
            </button>
            <input ref={avatarRef} type="file" accept="image/*" aria-label="Subir imagen de perfil"
              className="sr-only" disabled={uploadingAvatar}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { e.target.value = ""; setCropState({ file: f, type: "avatar" }); }
              }}
            />
          </div>
        </div>

        {/* ── Info ── */}
        <div className="mt-4 space-y-2 w-full pl-3">
          {uploadError && (
            <p className="text-xs text-red-600">⚠ {uploadError}</p>
          )}

          {/* Vista previa — se oculta mientras se edita para evitar duplicados */}
          {!isEditing && (
            <>
              <h2 className="font-display text-xl font-bold text-[--text]">
                {name || <span className="text-[--text-muted]">Sin nombre</span>}
              </h2>
              {locality && (
                <p className="flex items-center gap-1 text-sm font-medium text-[#3d5a4f]">
                  <MapPin size={12} />
                  {locality}
                </p>
              )}
              {sealRequests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {sealRequests.map((sr) => (
                    <span key={sr.id} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SEAL_CLASS[sr.seal.type] ?? "bg-[--surface] text-[--text-muted]"}`}>
                      {sr.seal.name}
                    </span>
                  ))}
                </div>
              )}
              {bio && <p className="line-clamp-3 text-sm text-[--text-muted]">{bio}</p>}
              {saved && <p className="text-xs text-[#3d5a4f]">✓ Cambios guardados</p>}

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[#3d5a4f] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e]"
                >
                  <Pencil size={12} />
                  Editar perfil
                </button>
              </div>
            </>
          )}

          {/* Formulario de edición — se expande al activar */}
          {isEditing && (
            <div className="space-y-4 pt-2">
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
                <LocalidadSelect
                  value={locality}
                  onChange={(val) => setLocality(val)}
                  error={errors.locality}
                />
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
                    className="w-full rounded-lg border border-[#ccc8bc] bg-white px-3 py-2 text-sm text-[--text] outline-none placeholder:text-[--text-muted] transition-colors focus-visible:border-[#3d5a4f]"
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
                  className="flex-1 cursor-pointer rounded-full bg-[#3d5a4f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:opacity-60"
                >
                  {isPending ? "Guardando..." : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="flex-1 cursor-pointer rounded-full border border-[#ccc8bc] px-4 py-2 text-sm text-[--text] transition-colors hover:bg-[#ccc8bc] disabled:opacity-60"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* ── Modal de opciones de imagen ── */}
    {optionsOpen && (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
        onClick={() => setOptionsOpen(null)}
      >
        <div
          className="w-full max-w-sm rounded-2xl bg-[#f4f0e8] p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="mb-4 font-display text-base font-bold text-[--text]">
            {optionsOpen === "avatar" ? "Imagen de perfil" : "Imagen de portada"}
          </h2>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                if (optionsOpen === "avatar") avatarRef.current?.click();
                else bannerRef.current?.click();
                setOptionsOpen(null);
              }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[#ccc8bc] px-4 py-3 text-sm text-[--text] transition-colors hover:bg-[#ccc8bc]"
            >
              <Pencil size={16} />
              Seleccionar nueva
            </button>
            {(optionsOpen === "avatar" ? avatarUrl : bannerUrl) && (
              <button
                type="button"
                onClick={() => { void handleDelete(optionsOpen); setOptionsOpen(null); }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-full bg-red-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                <Trash2 size={16} />
                Eliminar actual
              </button>
            )}
            <button
              type="button"
              onClick={() => setOptionsOpen(null)}
              className="mt-1 w-full cursor-pointer rounded-xl px-4 py-3 text-sm text-[--text-muted] transition-colors hover:bg-[#ddd7c8]"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )}

    {cropState && (
      <CropModal
        file={cropState.file}
        aspectRatio={cropState.type === "banner" ? 3 : 1}
        shape={cropState.type === "banner" ? "rect" : "circle"}
        label={cropState.type === "banner" ? "tu imagen de portada" : "tu imagen de perfil"}
        onConfirm={(blob) => {
          const ext = "jpeg";
          const file = new File([blob], `${cropState.type}.${ext}`, { type: "image/jpeg" });
          void handleUpload(file, cropState.type);
          setCropState(null);
        }}
        onCancel={() => setCropState(null)}
      />
    )}
    </>
  );
}
