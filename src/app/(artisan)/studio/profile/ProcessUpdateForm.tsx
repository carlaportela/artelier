//Página que permite a la artesana agregar actualizaciones de proceso (publicaciones)

"use client"; //Se renderiza en cliente

import { useTransition, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { createProcessUpdate } from "./actions";

//Esquema de validación para el formulación de nueva publicación
const schema = z.object({
  content: z.string().trim().min(1, "El contenido no puede estar vacío").max(500),
  imageUrl: z.string().optional(),
});

type FormInput = z.infer<typeof schema>;

//Función principal que renderiza el formulario para aregar una actualización de proceso o publicación
export default function ProcessUpdateForm() {
  const t = useTranslations("profile");
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { content: "", imageUrl: "" },
  });

  //Función que se ejecuta al enviar el formulario, crea una nueva actualización de proceso con el contenido y la imagen y luego resetea el formulario y limpia la imagen subida.
  function onSubmit(data: FormInput) {
    startTransition(async () => {
      const result = await createProcessUpdate({ ...data, imageUrl: imageUrl || undefined });
      if (!result?.error) {
        form.reset();
        setImageUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="content">{t("addProcessUpdate")}</Label>
        <textarea
          id="content"
          rows={3}
          maxLength={500}
          placeholder={t("processUpdatePlaceholder")}
          className="w-full rounded-lg border border-[--border] bg-white px-3 py-2 text-sm text-[--text] placeholder:text-[--text-muted] outline-none transition-colors focus-visible:border-[#3d5a4f] focus-visible:ring-0"
          {...form.register("content")}
        />
        <p className="text-right text-xs text-[--text-muted]">
          {form.watch("content")?.length ?? 0}/500
        </p>
        {form.formState.errors.content && (
          <p className="text-sm text-red-600">{form.formState.errors.content.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="process-image">{t("imageOptional")}</Label>
        <input
          ref={fileInputRef}
          id="process-image"
          type="file"
          accept="image/*"
          aria-label="Imagen opcional para la actualización de proceso"
          className="sr-only"
          disabled={uploading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "process");
            try {
              const res = await fetch("/api/upload", { method: "POST", body: formData });
              if (res.ok) {
                const json = await res.json() as { data?: { url: string } };
                if (json.data?.url) {
                  setUploadError(null);
                  setImageUrl(json.data.url);
                }
              } else {
                setUploadError("Error al subir la imagen. Inténtalo de nuevo.");
              }
            } catch {
              setUploadError("Error al subir la imagen. Inténtalo de nuevo.");
            }
            setUploading(false);
          }}
        />
        <label
          htmlFor="process-image"
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[--border] bg-white px-3 py-1.5 text-xs text-[--text] transition-colors hover:bg-[--surface-2] ${uploading ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <Upload size={13} />
          {uploading ? "Subiendo..." : imageUrl ? "Cambiar imagen" : "Adjuntar imagen"}
        </label>
        {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
      </div>

      <Button type="submit" disabled={isPending || uploading} className="w-full cursor-pointer hover:bg-[#4a6b5e]">
        {isPending ? t("publishing") : t("addProcessUpdate")}
      </Button>
    </form>
  );
}
