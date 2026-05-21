"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { saveProfile } from "./actions";

const schema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  bio: z.string().trim().max(150, "La bio no puede superar 150 caracteres"),
  locality: z.string().trim().min(2, "Introduce tu localidad"),
  image: z.string().optional(),
  bannerImage: z.string().optional(),
});
type FormInput = z.infer<typeof schema>;

interface ProfileFormProps {
  user: {
    name: string | null;
    bio: string | null;
    locality: string | null;
    image: string | null;
    bannerImage: string | null;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations("profile");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.image ?? "");
  const [bannerUrl, setBannerUrl] = useState(user.bannerImage ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name ?? "",
      bio: user.bio ?? "",
      locality: user.locality ?? "",
      image: user.image ?? "",
      bannerImage: user.bannerImage ?? "",
    },
    mode: "onBlur",
  });

  async function handleImageUpload(
    file: File,
    type: "avatar" | "banner",
    onSuccess: (url: string) => void,
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        setUploadError("Error al subir la imagen. Inténtalo de nuevo.");
        return;
      }
      const json = await res.json() as { data?: { url: string } };
      if (json.data?.url) {
        setUploadError(null);
        onSuccess(json.data.url);
      }
    } catch {
      setUploadError("Error al subir la imagen. Inténtalo de nuevo.");
    }
  }

  function onSubmit(data: FormInput) {
    startTransition(async () => {
      const result = await saveProfile({ ...data, image: avatarUrl, bannerImage: bannerUrl });
      if (!result?.error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Banner */}
      <div className="space-y-2">
        <Label htmlFor="banner-upload">{t("uploadBanner")}</Label>
        <div className="relative h-[100px] w-full overflow-hidden rounded-lg bg-[--surface]">
          {bannerUrl && (
            <Image src={bannerUrl} alt="Banner" fill className="object-cover" />
          )}
        </div>
        <input
          id="banner-upload"
          type="file"
          accept="image/*"
          aria-label="Subir imagen de portada"
          className="text-sm text-[--text-muted]"
          disabled={uploadingBanner}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setUploadingBanner(true);
            await handleImageUpload(file, "banner", (url) => {
              setBannerUrl(url);
              form.setValue("bannerImage", url);
            });
            setUploadingBanner(false);
          }}
        />
        {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
      </div>

      {/* Avatar */}
      <div className="space-y-2">
        <Label htmlFor="avatar-upload">{t("uploadAvatar")}</Label>
        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-[--surface]">
          {avatarUrl && (
            <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
          )}
        </div>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          aria-label="Subir foto de perfil"
          className="text-sm text-[--text-muted]"
          disabled={uploadingAvatar}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setUploadingAvatar(true);
            await handleImageUpload(file, "avatar", (url) => {
              setAvatarUrl(url);
              form.setValue("image", url);
            });
            setUploadingAvatar(false);
          }}
        />
        {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
      </div>

      {/* Nombre */}
      <div className="space-y-1">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-1">
        <Label htmlFor="bio">{t("bio")}</Label>
        <textarea
          id="bio"
          rows={3}
          maxLength={150}
          placeholder={t("bioPlaceholder")}
          className="w-full rounded-md border border-[--border] bg-white px-3 py-2 text-sm text-[--text] placeholder:text-[--text-muted] focus:outline-none focus:ring-2 focus:ring-[--primary]"
          {...form.register("bio")}
        />
        <p className="text-right text-xs text-[--text-muted]">
          {form.watch("bio")?.length ?? 0}/150
        </p>
        {form.formState.errors.bio && (
          <p className="text-sm text-red-600">{form.formState.errors.bio.message}</p>
        )}
      </div>

      {/* Localidad */}
      <div className="space-y-1">
        <Label htmlFor="locality">Localidad</Label>
        <Input id="locality" {...form.register("locality")} />
        {form.formState.errors.locality && (
          <p className="text-sm text-red-600">{form.formState.errors.locality.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending || uploadingAvatar || uploadingBanner}>
        {isPending ? "Guardando..." : saved ? t("profileSaved") : t("saveChanges")}
      </Button>
    </form>
  );
}
