"use client";

import { useTransition, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Info, Pencil, Plus, Camera, Trash2 } from "lucide-react";

import { saveAccount, saveProfileImage } from "./actions";
import CropModal from "~/components/CropModal";

const schema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  locality: z.string().trim().min(2, "Introduce tu localidad"),
});
type FormInput = z.infer<typeof schema>;

interface AccountFormProps {
  user: { name: string | null; locality: string | null; email: string | null; image: string | null };
}

export default function AccountForm({ user }: AccountFormProps) {
  const email = user.email;
  const initial = user.name?.charAt(0).toUpperCase() ?? "A";
  const t = useTranslations("account");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [imageUrl, setImageUrl] = useState(user.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        // Guardar en BD inmediatamente para que el nav se actualice sin esperar al submit
        await saveProfileImage(url);
      }
    } catch {
      setUploadError("Error al subir la imagen. Inténtalo de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeletePhoto() {
    setShowPhotoMenu(false);
    setImageUrl("");
    await saveProfileImage(null);
  }

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
      const result = await saveAccount({ ...data, image: imageUrl || undefined });
      if (!result?.error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

      {/* ── Foto de perfil ── */}
      <div className="flex flex-col items-center gap-2 pb-2">
        <div className="relative inline-block">
          {/* Avatar */}
          <div className="relative h-40 w-40 overflow-hidden rounded-full bg-[--surface]">
            {imageUrl ? (
              <Image src={imageUrl} alt="Foto de perfil" fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#c4956a]">
                <span className="font-display text-5xl font-bold text-white">{initial}</span>
              </div>
            )}
          </div>

          {/* Botón overlay */}
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

          {/* Mini panel del lápiz — aparece a la derecha del avatar */}
          {showPhotoMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowPhotoMenu(false)} />
              <div className="absolute left-full top-1/2 z-20 ml-3 w-40 -translate-y-1/2 overflow-hidden rounded-xl border border-[--border] bg-[#eae5da] py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => { fileInputRef.current?.click(); setShowPhotoMenu(false); }}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-[--text] transition-colors hover:text-[#3d5a4f]"
                >
                  <Camera size={14} className="shrink-0" />
                  Cambiar foto
                </button>
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition-colors hover:text-red-700"
                >
                  <Trash2 size={14} className="shrink-0" />
                  Eliminar foto
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
        <div className="space-y-2">
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

      <button
        type="submit"
        disabled={isPending || uploading}
        className="w-full cursor-pointer rounded-full bg-[#3d5a4f] py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Guardando..." : saved ? t("profileSaved") : t("saveChanges")}
      </button>
    </form>

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
