//Este componente implementa el flujo de publicación de un nuevo producto. Se divide en dos pasos: primero se suben las fotos y luego se completan los detalles del producto.

"use client"; //Este archivo se ejecuta en el cliente.

import { useState } from "react"; //Función de React para maneja el estado local como detalles del producto, imágenes subidas...
import { useRouter } from "next/navigation"; //Función para programáticamente navegar a otras páginas después de publicar el producto.
import Image from "next/image"; //Componente optimizado para mostrar las imágenes de los productos.
import { toast } from "sonner"; //Librería para mostrar notificaciones al usuario, como errores de validación o confirmación de publicación.
import { ArrowLeft, ArrowUp, ArrowDown, X, Plus } from "lucide-react"; //Iconos para la interfaz: flechas para reordenar fotos, X para eliminar una foto...

import { Button } from "~/components/ui/button"; //Componente de botón reutilizable de shadcn/ui
import { Input } from "~/components/ui/input"; //Componente de input reutilizable.
import { Label } from "~/components/ui/label"; //Componente de etiqueta reutilizable.
import { createProduct } from "./actions"; //Función que llama a la API para crear un producto nuevo con los datos introducidos. 

//Array para las categorías de productos.
const CATEGORIES = [
  "Joyería y bisutería",
  "Cerámica y alfarería",
  "Textil y costura",
  "Madera",
  "Papel y encuadernación",
  "Pintura y dibujo",
  "Fotografía",
  "Alimentación",
  "Perfumería y cosmética natural",
  "Otros"
] as const;

//Si el producto pertenece a alguna de estas categorías, se fuerza el tipo "Perecedero" porque se asume que tienen fecha de caducidad o preferente de consumo.
const PERISHABLE_CATEGORIES: readonly string[] = ["Alimentación", "Perfumería y cosmética natural"];

//Array de tipos de productos disponibles
const PRODUCT_TYPES = [
  { value: "UNIQUE", label: "Única pieza" },
  { value: "PERISHABLE", label: "Perecedero" },
  { value: "STANDARD", label: "Estándar" },
] as const;

//Descripciones para cada tipo de producto, que se muestran en la interfaz para ayudar a las artesanas a elegir el tipo correcto.
const TYPE_DESCRIPTIONS: Record<"UNIQUE" | "PERISHABLE" | "STANDARD", string> = {
  UNIQUE: "Esta pieza es irrepetible: solo existe un ejemplar. Una vez vendida, no habrá otra igual.",
  PERISHABLE: "Tiene una fecha preferente de compra, pasada la cual no podrá adquirirse por motivos de seguridad y estabilidad del producto.",
  STANDARD: "Producción continuada. Puedes tener varias unidades disponibles a la vez.",
};

//Función auxiliar para mover un elemento dentro de un array, usada para reordenar las fotos del producto.
function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  result.splice(to, 0, result.splice(from, 1)[0]!);
  return result;
}

//Función principal que maneja el estado de todo el formulario de producto nuevo: fotos, detalles, errores de validación...
export default function NewProductWizard() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); //Estado para controlar en que pasó del formulario está el vendedor.
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const [name, setName] = useState("");
  const [priceEuros, setPriceEuros] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"UNIQUE" | "PERISHABLE" | "STANDARD">("UNIQUE");
  const [category, setCategory] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const typeIsForced = PERISHABLE_CATEGORIES.includes(category);

  //Función dentro del componente para manejar cambios en la categoría de producto
  function handleCategoryChange(newCategory: string) {
    setCategory(newCategory);
    if (PERISHABLE_CATEGORIES.includes(newCategory)) {
      setType("PERISHABLE");
    }
  }

  //Función para manejar la subida de fotos. Se encarga de enviar cada foto seleccionada a la API de Cloudinary.
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const toUpload = files.slice(0, 3 - imageUrls.length);
    if (toUpload.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    for (const file of toUpload) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "product");

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const json = await res.json() as { data?: { url: string }; error?: { message: string } };
        if (json.data) {
          setImageUrls((prev) => [...prev, json.data!.url]);
        } else {
          setUploadError(json.error?.message ?? "Error al subir la imagen");
        }
      } catch {
        setUploadError("Error de conexión al subir la imagen");
      }
    }

    setIsUploading(false);
    e.target.value = "";
  }

  //Función para eliminar una foto del producto, actualizando el estado de las URLs de las imágenes.
  function removeImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  //Función para mover una foto en el orden deseado.
  function moveImage(index: number, direction: "up" | "down") {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    setImageUrls((prev) => arrayMove(prev, index, newIndex));
  }

  //Función para mejorar la publicación del producto, valida los datos y llama a la función de creación de producto.
  async function handlePublish() {
    const newErrors: Record<string, string> = {};
    const priceNum = parseFloat(priceEuros.replace(",", ".")); //Convierte el precio introducido a número decimal, permitiendo usar coma o punto como separador decimal.
    const priceInCents = Math.round(priceNum * 100);

    if (!name.trim() || name.trim().length < 2)
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    if (isNaN(priceNum) || priceInCents < 1)
      newErrors.priceInCents = "Introduce un precio válido (mínimo 0,01 €)";
    if (!category)
      newErrors.category = "Selecciona una categoría";
    if (type === "PERISHABLE" && !expiresAt)
      newErrors.expiresAt = "Indica la fecha límite de disponibilidad";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsPending(true);

    //LLama a la función de creación de producto, que se encarga de enviar los datos a la API y crear el producto en la base de datos.
    const result = await createProduct({
      name: name.trim(),
      description: description.trim(),
      priceInCents,
      type,
      imageUrls,
      category,
      expiresAt: expiresAt || undefined,
    });

    setIsPending(false);

    if (result?.error) {
      if (result.error.code === "VALIDATION_ERROR" && "fields" in result.error) {
        const fieldErrors: Record<string, string> = {};
        for (const [field, msgs] of Object.entries(result.error.fields)) {
          if (msgs?.[0]) fieldErrors[field] = msgs[0];
        }
        setErrors(fieldErrors);
      } else {
        toast.error("Algo fue mal. Inténtalo de nuevo.");
      }
      return;
    }

    if (result?.success) {
      if (result.isFirstProduct) {
        toast.custom(() => (
          <div className="rounded-xl border border-[--border] bg-[--surface] px-4 py-3 shadow-md">
            <p className="font-display text-lg text-[#3d5a4f]">
              ¡Tu primera pieza ya está en Artelier!
            </p>
          </div>
        ));
      } else {
        toast.success("Tu producto ya está en línea");
      }
      router.push("/studio/products");
    }
  }

  // ─── Paso 1: fotos ────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <main className="mx-auto max-w-lg space-y-6 px-4 py-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[--text-muted] transition-colors hover:text-[--text]"
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-xl text-[--text]">Nueva publicación</h1>
        </div>

        <p className="text-sm text-[--text-muted]">Paso 1 de 2 — Añade las fotos de tu pieza</p>

        {imageUrls.length > 0 && (
          <div className="space-y-2">
            {imageUrls.map((url, i) => (
              <div
                key={url}
                className="flex items-center gap-3 rounded-xl border border-[--border] bg-[--surface] p-2"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                  <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="64px" />
                </div>
                <div className="flex flex-1 items-center justify-between gap-2">
                  <span className="text-sm text-[--text-muted]">Foto {i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage(i, "up")}
                      disabled={i === 0}
                      className="rounded p-1 text-[--text-muted] transition-colors hover:text-[--text] disabled:opacity-30"
                      aria-label="Mover arriba"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(i, "down")}
                      disabled={i === imageUrls.length - 1}
                      className="rounded p-1 text-[--text-muted] transition-colors hover:text-[--text] disabled:opacity-30"
                      aria-label="Mover abajo"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="rounded p-1 text-red-500 transition-colors hover:text-red-700"
                      aria-label="Eliminar foto"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {imageUrls.length < 3 && (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[--border] bg-[--surface] px-6 py-10 text-center transition-colors hover:border-[#3d5a4f]/50 hover:bg-[--surface-2]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3d5a4f]/10">
              <Plus size={24} className="text-[#3d5a4f]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[--text]">
                {imageUrls.length === 0 ? "Añade tus fotos" : "Añadir otra foto"}
              </p>
              <p className="mt-1 text-xs text-[--text-muted]">
                {imageUrls.length === 0
                  ? "Hasta 3 fotos · JPEG, PNG, WebP"
                  : `${imageUrls.length}/3 fotos añadidas`}
              </p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}

        {isUploading && (
          <p className="text-center text-sm text-[--text-muted]">Subiendo imagen...</p>
        )}
        {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

        <Button
          type="button"
          onClick={() => setStep(2)}
          disabled={imageUrls.length === 0 || isUploading}
          className="w-full rounded-full bg-[#3d5a4f] py-2 text-sm font-medium text-white hover:bg-[#2d4a3f]"
        >
          Siguiente
        </Button>
      </main>
    );
  }

  // ─── Paso 2: datos ────────────────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-lg space-y-6 px-4 py-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-[--text-muted] transition-colors hover:text-[--text]"
          aria-label="Volver al paso 1"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl text-[--text]">Datos del producto</h1>
      </div>

      <p className="text-sm text-[--text-muted]">Paso 2 de 2 — Completa los detalles</p>

      <div className="flex gap-2">
        {imageUrls.map((url, i) => (
          <div key={url} className="relative h-14 w-14 overflow-hidden rounded-lg border border-[--border]">
            <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="56px" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="name" className="font-normal text-[--text-muted]">
            Nombre del producto
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Bol de cerámica raku"
            className="focus-visible:border-[#3d5a4f] focus-visible:ring-0"
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="price" className="font-normal text-[--text-muted]">
            Precio (€)
          </Label>
          <Input
            id="price"
            type="number"
            min="0.01"
            step="0.01"
            value={priceEuros}
            onChange={(e) => setPriceEuros(e.target.value)}
            placeholder="Ej: 45.00"
            className="focus-visible:border-[#3d5a4f] focus-visible:ring-0"
          />
          {errors.priceInCents && <p className="text-xs text-red-600">{errors.priceInCents}</p>}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="description" className="font-normal text-[--text-muted]">
              Descripción breve
            </Label>
            <span
              className={`text-xs ${description.length > 260 ? "text-red-500" : "text-[--text-muted]"}`}
            >
              {description.length}/280
            </span>
          </div>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={280}
            rows={3}
            placeholder="Cuéntanos sobre esta pieza..."
            className="w-full resize-none rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--text] outline-none transition-colors focus:border-[#3d5a4f]"
          />
          {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="category" className="font-normal text-[--text-muted]">
            Categoría
          </Label>
          <select
            id="category"
            title="Categoría"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--text] outline-none transition-colors focus:border-[#3d5a4f]"
          >
            <option value="">Selecciona una categoría</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="type" className="font-normal text-[--text-muted]">
            Tipo de producto
          </Label>
          <select
            id="type"
            title="Tipo de producto"
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            disabled={typeIsForced}
            className={`w-full rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--text] outline-none transition-colors focus:border-[#3d5a4f] ${typeIsForced ? "cursor-not-allowed opacity-60" : ""}`}
          >
            {PRODUCT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <p className="rounded-lg bg-[--surface-2] px-3 py-2 text-xs text-[--text-muted]">
            {TYPE_DESCRIPTIONS[type]}
          </p>
        </div>

        {type === "PERISHABLE" && (
          <div className="space-y-1">
            <Label htmlFor="expiresAt" className="font-normal text-[--text-muted]">
              Fecha límite de disponibilidad
            </Label>
            <Input
              id="expiresAt"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="focus-visible:border-[#3d5a4f] focus-visible:ring-0"
            />
            {errors.expiresAt && <p className="text-xs text-red-600">{errors.expiresAt}</p>}
          </div>
        )}
      </div>

      <Button
        type="button"
        onClick={handlePublish}
        disabled={isPending}
        className="w-full rounded-full bg-[#3d5a4f] py-2 text-sm font-medium text-white hover:bg-[#2d4a3f]"
      >
        {isPending ? "Publicando..." : "Publicar"}
      </Button>
    </main>
  );
}
