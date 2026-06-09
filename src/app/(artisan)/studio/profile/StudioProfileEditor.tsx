// Muestra el banner, avatar y los datos de perfil públicos de la artesana.
// No gestiona edición de texto — eso lo hace ProfilePageClient con ProfileEditSection.

"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Pencil, Plus, Loader2, MapPin, ScanSearch, Camera, Trash2 } from "lucide-react";

import { saveProfile } from "./actions";
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
  const [avatarUrl, setAvatarUrl]         = useState(user.image ?? "");
  const [bannerUrl, setBannerUrl]         = useState(user.bannerImage ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadError, setUploadError]     = useState<string | null>(null);
  const [cropState, setCropState]         = useState<{ file: File; type: "avatar" | "banner" } | null>(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showBannerMenu, setShowBannerMenu] = useState(false);

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
        await saveProfile({
          name: user.name ?? "",
          bio: user.bio ?? "",
          locality: user.locality ?? "",
          image: nextAvatar,
          bannerImage: nextBanner,
        });
      } else {
        setUploadError(json.error?.message ?? "Error al subir la imagen");
      }
    } catch {
      setUploadError("Error de conexión al subir la imagen");
    }
    setUploading(false);
  }

  // ── Eliminar imagen ──────────────────────────────────────────────────────

  async function handleDelete(type: "avatar" | "banner") {
    const prevAvatar = avatarUrl;
    const prevBanner = bannerUrl;
    const nextAvatar = type === "avatar" ? "" : avatarUrl;
    const nextBanner = type === "banner" ? "" : bannerUrl;
    if (type === "avatar") setAvatarUrl("");
    else setBannerUrl("");
    try {
      await saveProfile({
        name: user.name ?? "",
        bio: user.bio ?? "",
        locality: user.locality ?? "",
        image: nextAvatar,
        bannerImage: nextBanner,
      });
    } catch {
      if (type === "avatar") setAvatarUrl(prevAvatar);
      else setBannerUrl(prevBanner);
      setUploadError("No se pudo eliminar la imagen. Inténtalo de nuevo.");
    }
  }

  // ── Reajustar: reabre el CropModal con la imagen actual ──────────────────

  async function handleReajustar(type: "avatar" | "banner") {
    const url = type === "avatar" ? avatarUrl : bannerUrl;
    if (!url) return;
    if (type === "avatar") setShowAvatarMenu(false);
    else setShowBannerMenu(false);
    try {
      const res  = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], `${type}.jpg`, { type: blob.type || "image/jpeg" });
      setCropState({ file, type });
    } catch {
      if (type === "avatar") avatarRef.current?.click();
      else bannerRef.current?.click();
    }
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

        <div className="absolute right-4 top-3">
          <button
            type="button"
            onClick={() => bannerUrl ? setShowBannerMenu(v => !v) : bannerRef.current?.click()}
            disabled={uploadingBanner}
            aria-label="Editar portada"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#3d5a4f] text-white shadow-md transition-colors hover:bg-[#4a6b5e] disabled:opacity-50"
          >
            {uploadingBanner ? <Loader2 size={14} className="animate-spin" /> : bannerUrl ? <Pencil size={14} /> : <Plus size={14} />}
          </button>

          {showBannerMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowBannerMenu(false)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-40 overflow-hidden rounded-xl border border-[--border] bg-[#eae5da] py-1 shadow-lg">
                <button type="button" onClick={() => void handleReajustar("banner")}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-[--text] transition-colors hover:text-[#3d5a4f]">
                  <ScanSearch size={14} className="shrink-0" /> Reajustar
                </button>
                <button type="button" onClick={() => { bannerRef.current?.click(); setShowBannerMenu(false); }}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-[--text] transition-colors hover:text-[#3d5a4f]">
                  <Camera size={14} className="shrink-0" /> Cambiar
                </button>
                <button type="button" onClick={() => { void handleDelete("banner"); setShowBannerMenu(false); }}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition-colors hover:text-red-700">
                  <Trash2 size={14} className="shrink-0" /> Eliminar
                </button>
              </div>
            </>
          )}
        </div>

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
            <PaletteAvatar src={avatarUrl ?? null} name={user.name ?? ""} className="h-40 w-40" />

            <button
              type="button"
              onClick={() => avatarUrl ? setShowAvatarMenu(v => !v) : avatarRef.current?.click()}
              disabled={uploadingAvatar}
              aria-label="Editar imagen de perfil"
              className="absolute bottom-5 right-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#3d5a4f] text-white shadow-md transition-colors hover:bg-[#4a6b5e] disabled:opacity-50"
            >
              {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : avatarUrl ? <Pencil size={14} /> : <Plus size={14} />}
            </button>

            {showAvatarMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowAvatarMenu(false)} />
                <div className="absolute left-full top-1/2 z-20 ml-3 w-40 -translate-y-1/2 overflow-hidden rounded-xl border border-[--border] bg-[#eae5da] py-1 shadow-lg">
                  <button type="button" onClick={() => void handleReajustar("avatar")}
                    className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-[--text] transition-colors hover:text-[#3d5a4f]">
                    <ScanSearch size={14} className="shrink-0" /> Reajustar
                  </button>
                  <button type="button" onClick={() => { avatarRef.current?.click(); setShowAvatarMenu(false); }}
                    className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-[--text] transition-colors hover:text-[#3d5a4f]">
                    <Camera size={14} className="shrink-0" /> Cambiar
                  </button>
                  <button type="button" onClick={() => { void handleDelete("avatar"); setShowAvatarMenu(false); }}
                    className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition-colors hover:text-red-700">
                    <Trash2 size={14} className="shrink-0" /> Eliminar
                  </button>
                </div>
              </>
            )}

            <input ref={avatarRef} type="file" accept="image/*" aria-label="Subir imagen de perfil"
              className="sr-only" disabled={uploadingAvatar}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { e.target.value = ""; setCropState({ file: f, type: "avatar" }); }
              }}
            />
          </div>
        </div>

        {/* ── Info (solo lectura) ── */}
        <div className="mt-4 space-y-2 w-full pl-3">
          {uploadError && (
            <p className="text-xs text-red-600">⚠ {uploadError}</p>
          )}
          <h2 className="font-display text-xl font-bold text-[--text]">
            {user.name ?? <span className="text-[--text-muted]">Sin nombre</span>}
          </h2>
          {user.locality && (
            <p className="flex items-center gap-1 text-sm font-medium text-[#3d5a4f]">
              <MapPin size={12} />
              {user.locality}
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
          {user.bio && <p className="line-clamp-3 text-sm text-[--text-muted]">{user.bio}</p>}
        </div>
      </div>
    </div>

    {cropState && (
      <CropModal
        file={cropState.file}
        aspectRatio={cropState.type === "banner" ? 3 : 1}
        shape={cropState.type === "banner" ? "rect" : "circle"}
        label={cropState.type === "banner" ? "tu imagen de portada" : "tu imagen de perfil"}
        onConfirm={(blob) => {
          const file = new File([blob], `${cropState.type}.jpeg`, { type: "image/jpeg" });
          void handleUpload(file, cropState.type);
          setCropState(null);
        }}
        onCancel={() => setCropState(null)}
      />
    )}
    </>
  );
}
