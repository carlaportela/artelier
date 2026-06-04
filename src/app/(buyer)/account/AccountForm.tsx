"use client";

import { useTransition, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Info, Pencil, Plus, ScanSearch, Camera, Trash2 } from "lucide-react";

import { saveAccount, saveProfileImage } from "./actions";
import CropModal from "~/components/CropModal";

const schema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().trim().optional(),
  locality: z.string().trim().min(2, "Introduce tu localidad"),
  street: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  city: z.string().trim().optional(),
  province: z.string().trim().optional(),
});
type FormInput = z.infer<typeof schema>;

interface AccountFormProps {
  user: {
    name: string | null;
    lastName: string | null;
    locality: string | null;
    email: string | null;
    image: string | null;
    street: string | null;
    postalCode: string | null;
    city: string | null;
    province: string | null;
  };
}

export default function AccountForm({ user }: AccountFormProps) {
  const email = user.email;
  const initial = user.name?.charAt(0).toUpperCase() ?? "A";
  const t = useTranslations("account");
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState(user.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name ?? "",
      lastName: user.lastName ?? "",
      locality: user.locality ?? "",
      street: user.street ?? "",
      postalCode: user.postalCode ?? "",
      city: user.city ?? "",
      province: user.province ?? "",
    },
    mode: "onBlur",
  });

  // ── Foto ─────────────────────────────────────────────────────────────────

  async function handleCropConfirm(blob: Blob) {
    setCropFile(null);
    setUploadError(null);
    setUploading(true);
    const formData = new FormData();
    formData.append("file", blob, "avatar.jpg");
    formData.append("type", "avatar");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) { setUploadError("Error al subir la imagen. Inténtalo de nuevo."); return; }
      const json = await res.json() as { data?: { url: string } };
      if (json.data?.url) {
        const url = json.data.url;
        setImageUrl(url);
        await saveProfileImage(url);
      } else {
        setUploadError("Error al subir la imagen. Inténtalo de nuevo.");
      }
    } catch {
      setUploadError("Error al subir la imagen. Inténtalo de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  async function handleReajustar() {
    setShowPhotoMenu(false);
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const file = new File([blob], "avatar.jpg", { type: blob.type || "image/jpeg" });
      setCropFile(file);
    } catch {
      fileInputRef.current?.click();
    }
  }

  async function handleDeletePhoto() {
    setShowPhotoMenu(false);
    if (!confirm("¿Eliminar tu foto de perfil?")) return;
    setImageUrl("");
    await saveProfileImage(null);
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  function onSubmit(data: FormInput) {
    startTransition(async () => {
      const result = await saveAccount({ ...data, image: imageUrl || undefined });
      if (!result?.error) {
        setEditing(false);
      }
    });
  }

  function handleCancel() {
    form.reset();
    setEditing(false);
  }

  // ── Helpers de visualización ──────────────────────────────────────────────

  const hasAddress = user.street ?? user.city ?? user.postalCode ?? user.province;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
    <div className="space-y-6">

      {/* ── Foto de perfil ── */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative inline-block">
          <div className="relative h-40 w-40 overflow-hidden rounded-full bg-[--surface]">
            {imageUrl ? (
              <Image src={imageUrl} alt="Foto de perfil" fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#c4956a]">
                <span className="font-display text-5xl font-bold text-white">{initial}</span>
              </div>
            )}
          </div>

          {imageUrl ? (
            <button
              type="button"
              aria-label="Editar foto de perfil"
              onClick={() => setShowPhotoMenu((v) => !v)}
              disabled={uploading}
              className="absolute bottom-3 right-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#3d5a4f] text-white shadow-md transition-colors hover:bg-[#4a6b5e] disabled:opacity-60"
            >
              <Pencil size={13} />
            </button>
          ) : (
            <label
              htmlFor="avatar-upload"
              className={`absolute bottom-3 right-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#3d5a4f] text-white shadow-md transition-colors hover:bg-[#4a6b5e] ${uploading ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <Plus size={15} />
            </label>
          )}

          {showPhotoMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowPhotoMenu(false)} />
              <div className="absolute left-full top-1/2 z-20 ml-3 w-40 -translate-y-1/2 overflow-hidden rounded-xl border border-[--border] bg-[#eae5da] py-1 shadow-lg">
                <button
                  type="button"
                  onClick={handleReajustar}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-[--text] transition-colors hover:text-[#3d5a4f]"
                >
                  <ScanSearch size={14} className="shrink-0" />
                  Reajustar
                </button>
                <button
                  type="button"
                  onClick={() => { fileInputRef.current?.click(); setShowPhotoMenu(false); }}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-[--text] transition-colors hover:text-[#3d5a4f]"
                >
                  <Camera size={14} className="shrink-0" />
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition-colors hover:text-red-700"
                >
                  <Trash2 size={14} className="shrink-0" />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          id="avatar-upload"
          type="file"
          accept="image/*"
          aria-label="Subir foto de perfil"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) { e.target.value = ""; setShowPhotoMenu(false); setCropFile(file); }
          }}
        />
        {uploading && <p className="text-xs text-[--text-muted]">Subiendo...</p>}
        {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
      </div>

      {/* ── Modo vista ── */}
      {!editing ? (
        <div className="space-y-5">

          {/* Datos personales */}
          <div className="space-y-3">
            <h2 className="font-display text-lg text-[--text]">Datos personales</h2>
            <div className="space-y-1">
              <label className="text-sm font-medium leading-none text-[--text-muted]">{t("name")}</label>
              <p className="text-sm text-[--text]">{user.name ?? <span className="italic text-[--text-muted]">Sin nombre</span>}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium leading-none text-[--text-muted]">Apellidos</label>
              <p className="text-sm text-[--text]">{user.lastName ?? ""}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium leading-none text-[--text-muted]">{t("locality")}</label>
              <p className="text-sm text-[--text]">{user.locality ?? <span className="italic text-[--text-muted]">Sin localidad</span>}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium leading-none text-[--text-muted]">Correo electrónico</label>
              <p className="text-sm text-[--text-muted]">{email}</p>
            </div>
          </div>

          <div className="border-t border-[--border]" />

          {/* Dirección de envío */}
          <div className="space-y-3">
            <h2 className="font-display text-lg text-[--text]">Dirección de envío</h2>
            {hasAddress ? (
              <div className="space-y-3">
                {user.street && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none text-[--text-muted]">Calle y número</label>
                    <p className="text-sm text-[--text]">{user.street}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {user.postalCode && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium leading-none text-[--text-muted]">Código postal</label>
                      <p className="text-sm text-[--text]">{user.postalCode}</p>
                    </div>
                  )}
                  {user.city && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium leading-none text-[--text-muted]">Ciudad</label>
                      <p className="text-sm text-[--text]">{user.city}</p>
                    </div>
                  )}
                </div>
                {user.province && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none text-[--text-muted]">Provincia</label>
                    <p className="text-sm text-[--text]">{user.province}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[--text-muted]">Aún no se ha guardado ninguna dirección</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setEditing(true)}
            className="w-full cursor-pointer rounded-full bg-[#3d5a4f] py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e]"
          >
            Editar perfil
          </button>
        </div>
      ) : (
        /* ── Modo edición ── */
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="font-display text-lg text-[--text]">Datos personales</h2>
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium leading-none text-[--text-muted]">{t("name")}</label>
            <input
              id="name"
              {...form.register("name")}
              className="w-full rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--text] outline-none focus:border-[#3d5a4f]"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="lastName" className="text-sm font-medium leading-none text-[--text-muted]">Apellidos</label>
            <input
              id="lastName"
              {...form.register("lastName")}
              className="w-full rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--text] outline-none focus:border-[#3d5a4f]"
            />
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
              <p className="text-xs text-red-600">{form.formState.errors.locality.message}</p>
            )}
          </div>

          {email && (
            <div className="space-y-1">
              <label className="text-sm font-medium leading-none text-[--text-muted]">Correo electrónico</label>
              <div className="w-full rounded-md border border-[--border] bg-black/[0.04] px-3 py-2 text-sm text-[--text-muted]">
                {email}
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-[--surface-2] px-3 py-2">
                <Info size={13} className="mt-0.5 shrink-0 text-[#3d5a4f]/60" />
                <p className="text-xs text-[--text-muted]">El correo electrónico no puede modificarse.</p>
              </div>
            </div>
          )}

          <div className="border-t border-[--border] pt-2">
            <h2 className="mb-3 font-display text-lg text-[--text]">Dirección de envío</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="street" className="text-sm font-medium leading-none text-[--text-muted]">Calle y número</label>
                <input
                  id="street"
                  placeholder="Calle Artesanía 123 - 1ºA"
                  {...form.register("street")}
                  className="w-full rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--text] outline-none focus:border-[#3d5a4f]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="postalCode" className="text-sm font-medium leading-none text-[--text-muted]">Código postal</label>
                  <input
                    id="postalCode"
                    placeholder="15001"
                    {...form.register("postalCode")}
                    className="w-full rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--text] outline-none focus:border-[#3d5a4f]"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="city" className="text-sm font-medium leading-none text-[--text-muted]">Ciudad</label>
                  <input
                    id="city"
                    placeholder="Santiago de Compostela"
                    {...form.register("city")}
                    className="w-full rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--text] outline-none focus:border-[#3d5a4f]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="province" className="text-sm font-medium leading-none text-[--text-muted]">Provincia</label>
                <input
                  id="province"
                  placeholder="A Coruña"
                  {...form.register("province")}
                  className="w-full rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--text] outline-none focus:border-[#3d5a4f]"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending || uploading}
              className="flex-1 cursor-pointer rounded-full bg-[#3d5a4f] py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Guardando..." : t("saveChanges")}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 cursor-pointer rounded-full border border-[--border] py-2 text-sm font-medium text-[--text-muted] transition-colors hover:bg-[--surface-2]"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>

    {cropFile && (
      <CropModal
        file={cropFile}
        aspectRatio={1}
        shape="circle"
        label="tu foto de perfil"
        onConfirm={handleCropConfirm}
        onCancel={() => setCropFile(null)}
      />
    )}
    </>
  );
}
