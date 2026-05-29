//Formulario de edición de producto. Client Component.
//Reutiliza los patrones visuales de NewProductWizard (SelectField, DatePickerField, SortablePhoto).
//Los sellos se muestran como read-only — son asignados por el sistema, no por la artesana.

"use client";

import { useState, useRef, useEffect, useTransition, useId } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  X, Pencil, ChevronDown, ChevronRight, CalendarDays, AlertTriangle,
} from "lucide-react";

//Librerías de Drag and Drop (DND kit) para reordenar las fotos.
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import CropModal from "~/components/CropModal";
import { SealBadge } from "~/components/artisan/SealBadge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { updateProduct, deleteProduct } from "./actions";

// ─── Constantes ──────────────────────────────────────────────────────────────

//Categorías disponibles para los productos.
const CATEGORIES = [
  "Joyería y bisutería", "Cerámica y alfarería", "Textil y costura", "Madera",
  "Papel y encuadernación", "Pintura y dibujo", "Fotografía", "Alimentación",
  "Perfumería y cosmética natural", "Otros",
] as const;

//Categorías que fuerzan el "tipo perecedero" y muestran el campo de fecha límite de compra.
const PERISHABLE_CATEGORIES: readonly string[] = ["Alimentación", "Perfumería y cosmética natural"];

//Tipos de producto disponibles.
const PRODUCT_TYPES = [
  { value: "UNIQUE", label: "Única pieza" },
  { value: "PERISHABLE", label: "Perecedero" },
  { value: "STANDARD", label: "Otro" },
] as const;

//Número maximo de fotos por producto.
const MAX_IMAGES = 6;

//Descripciones de cada tipo de producto, mostrada como ayuda contextual debajo del selector de tipo.
const TYPE_DESCRIPTIONS: Record<"UNIQUE" | "PERISHABLE" | "STANDARD", string> = {
  UNIQUE: "Esta pieza es irrepetible: solo existe un ejemplar. Una vez vendida, no habrá otra igual.",
  PERISHABLE: "Tiene una fecha límite de compra pasada la cual no podrá adquirirse.",
  STANDARD: "Producción continuada. Puedes tener varias unidades disponibles a la vez.",
};

// ─── Tipos ───────────────────────────────────────────────────────────────────

//Las fotos existentes solo tienen URL. Las recién añadidas también tienen el File para re-recortar.
type PhotoEntry = { url: string; file: File | null };

//Datos del producto.
interface ProductData {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  type: "UNIQUE" | "PERISHABLE" | "STANDARD";
  status: "ACTIVE" | "SOLD" | "EXPIRED";
  imageUrls: string[];
  category: string;
  expiresAt?: string; // YYYY-MM-DD
}

//Datos de un sello.
interface SealData {
  id: string;
  name: string;
}

//Argumentos que recibe el método editProductForm.
interface EditProductFormProps {
  product: ProductData;
  seals: SealData[];
  hasActiveOrders: boolean;
}

// ─── Helpers de fecha ────────────────────────────────────────────────────────
//El datepicker muestra las fechas en formato DD/MM/YYYY, pero el backend usa ISO YYYY-MM-DD.

//Constantes para mostrar meses y días en español en el datepicker.
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"] as const;
const DAYS_ES = ["L","M","X","J","V","S","D"] as const;

//Convierte fecha ISO (YYYY-MM-DD) a formato display (DD/MM/YYYY).
function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

//Función inversa a la anterior.
function dateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

//Función para reordenar un array al arrastrar y soltar un foto.
function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  result.splice(to, 0, result.splice(from, 1)[0]!);
  return result;
}

// ─── SelectField ─────────────────────────────────────────────────────────────
//Componente de selector personalizado, usado para elegir categoria y tipo de producto.

function SelectField({
  label, value, onChange, options, placeholder, disabled = false,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <>
      {label && (
        <label htmlFor={uid} className="block pl-1 text-sm font-medium text-[--text]">
          {label}
        </label>
      )}
      <div ref={ref} className="relative">
        <button
          type="button"
          id={uid}
          disabled={disabled}
          onClick={() => { if (!disabled) setOpen((prev) => !prev); }}
          className={`flex w-full items-center justify-between rounded-lg border border-[--border] bg-white px-3 py-1.5 text-left text-sm outline-none transition-colors focus-visible:border-[#3d5a4f] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${!value ? "text-[--text-muted]" : "text-[--text]"}`}
        >
          <span>{selected?.label ?? placeholder ?? "Selecciona..."}</span>
          <ChevronDown size={14} className={`shrink-0 text-[--text-muted] transition-transform${open ? " rotate-180" : ""}`} />
        </button>
        {open && (
          <ul className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg border border-[--border] bg-white shadow-lg">
            {options.map((opt) => (
              <li
                key={opt.value}
                onMouseDown={(e) => { e.preventDefault(); onChange(opt.value); setOpen(false); }}
                className={`cursor-pointer px-3 py-2 text-sm transition-colors ${value === opt.value ? "bg-[#ccc8bc] text-[--text]" : "text-[--text] hover:bg-[#ccc8bc]"}`}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

// ─── DatePickerField ─────────────────────────────────────────────────────────
//Componente de selector de fecha personalizado, usado para elegir la fecha límite de compra en productos perecederos.

function DatePickerField({
  label, value, onChange, min, disabled = false,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  disabled?: boolean;
}) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState(() => value ? isoToDisplay(value) : "");

  const now = new Date();
  const todayY = now.getFullYear();
  const todayM = now.getMonth();
  const todayD = now.getDate();
  const selectedDate = value ? new Date(value + "T12:00:00") : null;
  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? todayY);
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? todayM);

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (e.clientX > document.documentElement.clientWidth - 1) return;
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOut);
    return () => document.removeEventListener("mousedown", onOut);
  }, []);

  const firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const minDate = min ? new Date(min + "T00:00:00") : null;

  function isDisabled(day: number) { return !!minDate && new Date(viewYear, viewMonth, day) < minDate; }
  function isSelected(day: number) {
    return !!selectedDate && selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === day;
  }
  function isToday(day: number) { return todayY === viewYear && todayM === viewMonth && todayD === day; }

  function selectDay(day: number) {
    const iso = dateToISO(new Date(viewYear, viewMonth, day));
    onChange(iso);
    setInputText(isoToDisplay(iso));
    setOpen(false);
  }

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    let formatted = digits;
    if (digits.length > 2) formatted = digits.slice(0, 2) + "/" + digits.slice(2);
    if (digits.length > 4) formatted = formatted.slice(0, 5) + "/" + digits.slice(4);
    setInputText(formatted);
    if (digits.length === 8) {
      const d = parseInt(digits.slice(0, 2), 10);
      const m = parseInt(digits.slice(2, 4), 10);
      const y = parseInt(digits.slice(4, 8), 10);
      const date = new Date(y, m - 1, d);
      if (date.getDate() === d && date.getMonth() === m - 1) {
        const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        if (!minDate || new Date(iso + "T12:00:00") >= minDate) {
          onChange(iso);
          setViewYear(y);
          setViewMonth(m - 1);
        }
      }
    } else if (digits.length === 0) {
      onChange("");
    }
  }

  return (
    <>
      {label && (
        <label htmlFor={uid} className="block pl-1 text-sm font-medium text-[--text]">
          {label}
        </label>
      )}
      <div ref={ref} className="relative">
      <div className={`flex items-center overflow-hidden rounded-lg border border-[--border] bg-white transition-colors focus-within:border-[#3d5a4f] ${disabled ? "opacity-60" : ""}`}>
        <input
          id={uid}
          type="text"
          inputMode="numeric"
          value={inputText}
          onChange={handleTextChange}
          placeholder="dd/mm/aaaa"
          disabled={disabled}
          className="flex-1 bg-transparent px-3 py-1.5 text-sm text-[--text] outline-none placeholder:text-[--text-muted] disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={() => !disabled && setOpen((prev) => !prev)}
          disabled={disabled}
          aria-label={open ? "Cerrar calendario" : "Abrir calendario"}
          className="cursor-pointer px-3 py-1.5 text-[--text-muted] transition-colors hover:text-[--text] disabled:cursor-not-allowed"
        >
          <CalendarDays size={14} />
        </button>
      </div>
      {open && !disabled && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-xl border border-[--border] bg-white p-3 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" aria-label="Mes anterior" onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); } else setViewMonth((m) => m - 1); }} className="cursor-pointer rounded-full p-1 text-[--text-muted] hover:bg-[#f4f0e8]"><ChevronLeft size={16} /></button>
            <span className="text-sm font-medium text-[--text]">{MONTHS_ES[viewMonth]} {viewYear}</span>
            <button type="button" aria-label="Mes siguiente" onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); } else setViewMonth((m) => m + 1); }} className="cursor-pointer rounded-full p-1 text-[--text-muted] hover:bg-[#f4f0e8]"><ChevronRight size={16} /></button>
          </div>
          <div className="mb-1 grid grid-cols-7 text-center">
            {DAYS_ES.map((d) => <span key={d} className="py-0.5 text-[10px] font-medium text-[--text-muted]">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5 text-center">
            {cells.map((day, idx) => {
              if (!day) return <span key={`e-${idx}`} />;
              const dis = isDisabled(day);
              const sel = isSelected(day);
              const tod = isToday(day);
              return (
                <button key={day} type="button" disabled={dis} onClick={() => selectDay(day)}
                  className={["mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors", sel ? "bg-[#3d5a4f] font-medium text-white" : tod ? "cursor-pointer border border-[#3d5a4f] font-medium text-[#3d5a4f] hover:bg-[#f4f0e8]" : dis ? "cursor-not-allowed text-[--text-muted] opacity-40" : "cursor-pointer text-[--text] hover:bg-[#f4f0e8]"].join(" ")}>
                  {day}
                </button>
              );
            })}
          </div>
          {value && (
            <div className="mt-2 border-t border-[--border] pt-2 text-right">
              <button type="button" onClick={() => { onChange(""); setInputText(""); setOpen(false); }} className="cursor-pointer text-xs text-[--text-muted] hover:text-[--text]">
                Borrar selección
              </button>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}

// ─── SortablePhoto ────────────────────────────────────────────────────────────
//Componente que muestra cada foto del producto con funcionalidad para reordenar arrastrando, editar y eliminar.

function SortablePhoto({
  id, url, index, isHero = false, canEdit, onEdit, onRemove, disabled,
}: {
  id: string; url: string; index: number; isHero?: boolean;
  canEdit: boolean; onEdit: () => void; onRemove: () => void; disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined }}
      {...attributes}
      {...listeners}
      className={`group relative aspect-square ${disabled ? "cursor-not-allowed opacity-60" : "cursor-grab"} overflow-hidden rounded-xl active:cursor-grabbing${isHero ? " col-span-2 row-span-2" : ""}${isDragging ? " opacity-70 ring-2 ring-[#3d5a4f]" : ""}`}
    >
      <Image src={url} alt={isHero ? "Imagen de portada" : `Imagen ${index + 1}`} fill className="object-cover"
        sizes={isHero ? "(max-width: 640px) 67vw, 340px" : "33vw"} />
      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />
      {!disabled && (
        <div className="absolute right-1.5 top-1.5 flex flex-row gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {canEdit && (
            <button type="button" onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onEdit(); }} aria-label="Editar encuadre"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-transparent bg-black/50 text-white transition-colors hover:border-white/40">
              <Pencil size={13} />
            </button>
          )}
          <button type="button" onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onRemove(); }} aria-label="Eliminar imagen"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-transparent bg-black/50 text-white transition-colors hover:border-white/40">
            <X size={13} />
          </button>
        </div>
      )}
      {isHero ? (
        <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white">Portada</span>
      ) : (
        <span className="absolute bottom-1.5 left-1.5 rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white">{index + 1}</span>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
//Componenete para edición de producto.

export default function EditProductForm({ product, seals, hasActiveOrders }: EditProductFormProps) {
  const router = useRouter();
  const [isPendingSave, startSave] = useTransition();
  const [isPendingDelete, startDelete] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  //Las fotos existentes no tienen File (no se pueden re-recortar)
  const [images, setImages] = useState<PhotoEntry[]>(
    () => product.imageUrls.map((url) => ({ url, file: null }))
  );
  const [cropState, setCropState] = useState<{ file: File; replacingIndex: number | null } | null>(null);
  const [_cropQueue, setCropQueue] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  //Campos del formulario, pre-rellenados con los datos del producto
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [priceEuros, setPriceEuros] = useState(() => (product.priceInCents / 100).toFixed(2));
  const [type, setType] = useState<"UNIQUE" | "PERISHABLE" | "STANDARD">(product.type);
  const [category, setCategory] = useState(product.category);
  const [expiresAt, setExpiresAt] = useState(product.expiresAt ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const typeIsForced = PERISHABLE_CATEGORIES.includes(category);
  const isDisabled = hasActiveOrders || isPendingSave || isPendingDelete;

  //Fecha mínima para el datepicker: hoy
  const todayMin = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  })();

  //Sensores para el drag and drop de las foto.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  //Función que se ejecuta al soltar la foto después de arrastrarla para reordenar. Actualiza el orden de las fotos en el estado (arrayMove),
  function handleDragEnd(event: DragEndEvent) {
    if (isDisabled) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((img) => img.url === active.id);
    const newIndex = images.findIndex((img) => img.url === over.id);
    if (oldIndex !== -1 && newIndex !== -1) setImages((prev) => arrayMove(prev, oldIndex, newIndex));
  }

  //Función para cambiar la categoría del producto. Si la nueva categoría es de tipo perecedero, fuerza el tipo a perishable y limpia la fecha de caducidad.
  function handleCategoryChange(newCategory: string) {
    setCategory(newCategory);
    if (PERISHABLE_CATEGORIES.includes(newCategory)) {
      setType("PERISHABLE");
    } else if (type === "PERISHABLE") {
      setType("STANDARD");
      setExpiresAt("");
    }
  }

  //Función que se ejecuta al seleccionar una nueva foto para subir. Agregar la foto a una cola de recorte y abre el Modal de recorte para la primera foto de la cola.
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_IMAGES - images.length);
    e.target.value = "";
    if (files.length === 0) return;
    const [first, ...rest] = files;
    if (first) {
      setCropQueue(rest);
      setCropState({ file: first, replacingIndex: null });
    }
  }

  //Función que se ejecuta al confirmar el recorte de una foto en el Modal de recorte. Sube la foto recortada a Cloudinary, obtiene la URL resultante y la agrega al estado de fotos.
  async function handleCropConfirm(blob: Blob) {
    const current = cropState;
    setCropState(null);
    if (!current) return;

    setIsUploading(true);
    setUploadError(null);

    const croppedFile = new File([blob], current.file.name, { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("file", croppedFile);
    formData.append("type", "product");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json() as { data?: { url: string }; error?: { message: string } };
      if (json.data?.url) {
        const newEntry: PhotoEntry = { url: json.data.url, file: current.file };
        if (current.replacingIndex !== null) {
          setImages((prev) => prev.map((img, i) => i === current.replacingIndex ? newEntry : img));
        } else {
          setImages((prev) => [...prev, newEntry]);
          setCropQueue((prev) => {
            const [next, ...remaining] = prev;
            if (next) setCropState({ file: next, replacingIndex: null });
            return remaining;
          });
        }
      } else {
        setUploadError("Error al subir la imagen. Inténtalo de nuevo.");
      }
    } catch {
      setUploadError("Error al subir la imagen. Inténtalo de nuevo.");
    } finally {
      setIsUploading(false);
    }
  }

  //Función que se ejecuta al hacer click en Guardar cambios.
  function handleSave() {
    const cents = Math.round(parseFloat(priceEuros.replace(",", ".")) * 100); //Convierte el precio a céntimos, manejando decimales y comas.

    startSave(async () => {
      const result = await updateProduct(product.id, {
        name: name.trim(),
        description: description.trim(),
        priceInCents: cents,
        type,
        imageUrls: images.map((img) => img.url),
        category,
        expiresAt: expiresAt || undefined,
      });

      if (result.error) {
        if (result.error.code === "VALIDATION_ERROR" && "fields" in result.error) {
          const flat: Record<string, string> = {};
          for (const [k, msgs] of Object.entries(result.error.fields ?? {})) {
            flat[k] = msgs[0] ?? "";
          }
          setFieldErrors(flat);
        } else if (result.error.code === "HAS_ACTIVE_ORDERS") {
          toast.error("No puedes editar este producto porque tiene pedidos en curso.");
        } else {
          toast.error("Error al guardar. Inténtalo de nuevo.");
        }
        return;
      }

      setFieldErrors({});
      toast.success("Cambios guardados");
    });
  }

  //Función que se ejecuta al confirmar la eliminación del producto.
  function handleDelete() {
    startDelete(async () => {
      const result = await deleteProduct(product.id);
      if (result.error) {
        if (result.error.code === "HAS_ACTIVE_ORDERS") {
          toast.error("No puedes eliminar este producto porque tiene pedidos en curso.");
        } else {
          toast.error("Error al eliminar. Inténtalo de nuevo.");
        }
        setShowDeleteDialog(false);
        return;
      }
      toast.success("Producto eliminado");
      router.push("/studio/products");
    });
  }

  return (
    <main className="bg-[--bg]">
      <div className="px-4 py-8">

        {/* Cabecera */}
        <div className="mb-6">
          <h1 className="font-display text-xl font-bold text-[--text]">Editar producto</h1>
        </div>

        {/* Aviso pedidos activos */}
        {hasActiveOrders && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              Este producto tiene pedidos en curso. No puedes editarlo ni eliminarlo hasta que finalicen.
            </p>
          </div>
        )}

        <div className="space-y-6">

          {/* ── Fotos ─────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-[--text]">Imágenes del producto</p>
            {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={images.map((img) => img.url)} strategy={rectSortingStrategy}>
                {/* Siempre mostramos los 6 huecos: rellenos con foto o vacíos con slot de carga */}
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: MAX_IMAGES }, (_, i) => {
                    const img = images[i];
                    const isHero = i === 0;
                    if (img) {
                      return (
                        <SortablePhoto
                          key={img.url}
                          id={img.url}
                          url={img.url}
                          index={i}
                          isHero={isHero}
                          canEdit={img.file !== null}
                          disabled={isDisabled}
                          onEdit={() => {
                            if (img.file) setCropState({ file: img.file, replacingIndex: i });
                          }}
                          onRemove={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                        />
                      );
                    }
                    // Hueco vacío — siempre visible para indicar el espacio disponible
                    return (
                      <label
                        key={`empty-${i}`}
                        className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[--border] bg-[--surface] text-[--text-muted] transition-colors${isHero ? " col-span-2 row-span-2" : ""}${isDisabled ? " pointer-events-none opacity-50" : " cursor-pointer hover:border-[#c4956a]/40 hover:text-[#c4956a]"}`}
                      >
                        <span className={`select-none font-extralight leading-none ${isHero ? "text-5xl" : "text-3xl"}`}>+</span>
                        <span className={`${isHero ? "text-sm font-medium" : "text-[10px]"}`}>
                          {isHero ? "Portada" : `Imagen ${i + 1}`}
                        </span>
                        <input
                          type="file" accept="image/*" multiple className="sr-only"
                          disabled={isUploading || isDisabled}
                          onChange={handleFileChange}
                        />
                      </label>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* ── Nombre ────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <label htmlFor="name" className="block pl-1 text-sm font-medium text-[--text]">Nombre</label>
            <input
              id="name" type="text" value={name} disabled={isDisabled}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[--border] bg-white px-3 py-1.5 text-sm text-[--text] outline-none placeholder:text-[--text-muted] focus:border-[#3d5a4f] disabled:cursor-not-allowed disabled:opacity-60"
            />
            {fieldErrors.name && <p className="text-xs text-red-600">{fieldErrors.name}</p>}
          </div>

          {/* ── Descripción ───────────────────────────────────────────── */}
          <div className="space-y-2">
            <label htmlFor="description" className="block pl-1 text-sm font-medium text-[--text]">Descripción</label>
            <textarea
              id="description" rows={3} maxLength={280} value={description}
              disabled={isDisabled}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-[--border] bg-white px-3 py-2 text-sm text-[--text] outline-none placeholder:text-[--text-muted] focus:border-[#3d5a4f] disabled:cursor-not-allowed disabled:opacity-60"
            />
            <p className={`text-right text-xs ${description.length > 260 ? "text-red-500" : "text-[--text-muted]"}`}>
              {280 - description.length} restantes
            </p>
            {fieldErrors.description && <p className="text-xs text-red-600">{fieldErrors.description}</p>}
          </div>

          {/* ── Precio ────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <label htmlFor="price" className="block pl-1 text-sm font-medium text-[--text]">Precio (€)</label>
            <input
              id="price" type="number" min="0.01" step="0.01" value={priceEuros}
              disabled={isDisabled}
              onChange={(e) => setPriceEuros(e.target.value)}
              className="w-full rounded-lg border border-[--border] bg-white px-3 py-1.5 text-sm text-[--text] outline-none focus:border-[#3d5a4f] disabled:cursor-not-allowed disabled:opacity-60"
            />
            {fieldErrors.priceInCents && <p className="text-xs text-red-600">{fieldErrors.priceInCents}</p>}
          </div>

          {/* ── Categoría ─────────────────────────────────────────────── */}
          <div className="space-y-2">
            <SelectField
              label="Categoría"
              value={category}
              onChange={handleCategoryChange}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              disabled={isDisabled}
            />
            {fieldErrors.category && <p className="text-xs text-red-600">{fieldErrors.category}</p>}
          </div>

          {/* ── Tipo ──────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <SelectField
              label="Tipo de producto"
              value={type}
              onChange={(v) => setType(v as "UNIQUE" | "PERISHABLE" | "STANDARD")}
              options={PRODUCT_TYPES}
              disabled={isDisabled || typeIsForced}
            />
            {typeIsForced && (
              <p className="text-xs text-[--text-muted]">
                La categoría seleccionada requiere el tipo Perecedero.
              </p>
            )}
            <p className="text-xs text-[--text-muted]">{TYPE_DESCRIPTIONS[type]}</p>
            {fieldErrors.type && <p className="text-xs text-red-600">{fieldErrors.type}</p>}
          </div>

          {/* ── Fecha de caducidad (solo perecederos) ─────────────────── */}
          {type === "PERISHABLE" && (
            <div className="space-y-2">
              <DatePickerField
                label="Fecha límite de compra"
                value={expiresAt}
                onChange={setExpiresAt}
                min={todayMin}
                disabled={isDisabled}
              />
              {fieldErrors.expiresAt && <p className="text-xs text-red-600">{fieldErrors.expiresAt}</p>}
            </div>
          )}

          {/* ── Sellos verificados (read-only) ────────────────────────── */}
          {seals.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-[--text]">Sellos verificados</p>
              <div className="flex flex-wrap gap-2">
                {seals.map((seal) => (
                  <SealBadge key={seal.id} name={seal.name} />
                ))}
              </div>
              <p className="text-xs text-[--text-muted]">
                Los sellos son asignados automáticamente por el sistema según los criterios de verificación.
              </p>
            </div>
          )}

          {/* ── Acciones ──────────────────────────────────────────────── */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isDisabled}
              className="w-full cursor-pointer rounded-full bg-[#3d5a4f] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPendingSave ? "Guardando..." : "Guardar cambios"}
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/studio/products")}
                disabled={isPendingSave || isPendingDelete}
                className="flex-1 cursor-pointer rounded-full border border-[#ccc8bc] px-5 py-2.5 text-sm font-medium text-[--text] transition-colors hover:bg-[#ccc8bc] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
              {!hasActiveOrders && (
                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isPendingSave || isPendingDelete}
                  className="flex-1 cursor-pointer rounded-full bg-red-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPendingDelete ? "Eliminando..." : "Eliminar producto"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal de confirmación de borrado ──────────────────────────── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar este producto?</DialogTitle>
            <DialogDescription>
              El producto desaparecerá de tu catálogo y del feed. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isPendingDelete}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPendingDelete}
            >
              {isPendingDelete ? "Eliminando..." : "Sí, eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal de recorte ──────────────────────────────────────────── */}
      {cropState && (
        <CropModal
          file={cropState.file}
          aspectRatio={1}
          shape="rect"
          label="Foto del producto"
          onConfirm={handleCropConfirm}
          onCancel={() => {
            setCropState(null);
            setCropQueue([]);
          }}
        />
      )}
    </main>
  );
}
