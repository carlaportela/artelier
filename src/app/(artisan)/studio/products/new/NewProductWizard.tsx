//Este componente implementa el flujo de publicación de un nuevo producto. Se divide en dos pasos: primero se suben las fotos y luego se completan los detalles del producto.

"use client"; //Este archivo se ejecuta en el cliente.

import { useState, useRef, useEffect, useId } from "react"; //Función de React para maneja el estado local como detalles del producto, imágenes subidas...
import { useRouter } from "next/navigation"; //Función para programáticamente navegar a otras páginas después de publicar el producto.
import Image from "next/image"; //Componente optimizado para mostrar las imágenes de los productos.
import { toast } from "sonner"; //Librería para mostrar notificaciones al usuario, como errores de validación o confirmación de publicación.
import { X, Pencil, ChevronDown, ChevronLeft, ChevronRight, CalendarDays, Info } from "lucide-react";
import CropModal from "~/components/CropModal";

import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core"; //Librería para implementar la funcionalidad de arrastrar y soltar (drag & drop) en el grid de fotos.
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable"; //Funciones específicas de dnd-kit para hacer que las fotos sean ordenables dentro del grid.
import { CSS } from "@dnd-kit/utilities"; //Utilidad para convertir las transformaciones de arrastre en estilos CSS aplicables a los elementos.

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
  { value: "STANDARD", label: "Otro" },
] as const;

//Número máximo de imágenes por producto: 1 portada 2×2 + 2 laterales + 3 en fila inferior.
const MAX_IMAGES = 6;

//Descripciones para cada tipo de producto, que se muestran en la interfaz para ayudar a las artesanas a elegir el tipo correcto.
const TYPE_DESCRIPTIONS: Record<"UNIQUE" | "PERISHABLE" | "STANDARD", string> = {
  UNIQUE: "Esta pieza es irrepetible: solo existe un ejemplar. Una vez vendida, no habrá otra igual.",
  PERISHABLE: "Tiene una fecha límite de compra pasada la cual no podrá adquirirse.",
  STANDARD: "Producción continuada. Puedes tener varias unidades disponibles a la vez aunque no tienen porque ser exactamente iguales entre sí.",
};

//Selector personalizado con dropdown estilizado con la paleta de la app, igual que LocalidadSelect.
//Evita el dropdown nativo del navegador (que no se puede estilizar) y usa un <ul> custom.
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
        <label htmlFor={uid} className="block text-sm font-normal text-[--text-muted]">
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
            {placeholder && (
              <li
                onMouseDown={(e) => { e.preventDefault(); onChange(""); setOpen(false); }}
                className="cursor-pointer px-3 py-2 text-sm text-[--text-muted] transition-colors hover:bg-[#ccc8bc]"
              >
                {placeholder}
              </li>
            )}
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

//Cada imagen del grid — arrastrable con dnd-kit.
//isHero=true para la portada: ocupa las 3 columnas del grid (col-span-3) y muestra badge "Portada".
//Los botones de acción paran la propagación del pointer para que un clic no active el drag.
function SortablePhoto({
  id, url, index, isHero = false, onEdit, onRemove,
}: {
  id: string; url: string; index: number; isHero?: boolean; onEdit: () => void; onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined }}
      {...attributes}
      {...listeners}
      className={`group relative aspect-square cursor-grab overflow-hidden rounded-xl active:cursor-grabbing${isHero ? " col-span-2 row-span-2" : ""}${isDragging ? " opacity-70 ring-2 ring-[#3d5a4f]" : ""}`}
    >
      <Image
        src={url}
        alt={isHero ? "Imagen de portada" : `Imagen ${index + 1}`}
        fill
        className="object-cover"
        sizes={isHero ? "(max-width: 640px) 67vw, 340px" : "33vw"}
      />
      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />
      <div className="absolute right-1.5 top-1.5 flex flex-row gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          aria-label="Editar encuadre"
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-transparent bg-black/50 text-white transition-colors hover:border-white/40"
        >
          <Pencil size={13} />
        </button>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label="Eliminar imagen"
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-transparent bg-black/50 text-white transition-colors hover:border-white/40"
        >
          <X size={13} />
        </button>
      </div>
      {isHero ? (
        <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white">
          Portada
        </span>
      ) : (
        <span className="absolute bottom-1.5 left-1.5 rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white">
          {index + 1}
        </span>
      )}
    </div>
  );
}

//Selector de fecha custom: input de texto (dd/mm/aaaa) + calendario popup estilizado.
//El input permite escribir la fecha a mano; el icono abre el calendario visual.
//El cierre al clic exterior ignora la barra de scroll del navegador para que el usuario
//pueda hacer scroll sin que el calendario se cierre.
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"] as const;
const DAYS_ES = ["L","M","X","J","V","S","D"] as const;

function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function dateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function DatePickerField({
  label, value, onChange, min,
}: {
  label?: string;
  value: string; // YYYY-MM-DD o vacío
  onChange: (value: string) => void;
  min?: string;  // YYYY-MM-DD
}) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Texto visible en el input, controlado independientemente del valor ISO
  const [inputText, setInputText] = useState(() => value ? isoToDisplay(value) : "");

  const now = new Date();
  const todayY = now.getFullYear();
  const todayM = now.getMonth();
  const todayD = now.getDate();

  const selectedDate = value ? new Date(value + "T12:00:00") : null;

  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? todayY);
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? todayM);

  // Cierre al clic exterior — ignora clics en la barra de scroll vertical del navegador
  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (e.clientX > document.documentElement.clientWidth - 1) return; // barra de scroll
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOut);
    return () => document.removeEventListener("mousedown", onOut);
  }, []);

  // Celdas del mes (null = hueco vacío al principio, semana empieza el lunes)
  const firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const minDate = min ? new Date(min + "T00:00:00") : null;

  function isDisabled(day: number) {
    return !!minDate && new Date(viewYear, viewMonth, day) < minDate;
  }
  function isSelected(day: number) {
    return !!selectedDate &&
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day;
  }
  function isToday(day: number) {
    return todayY === viewYear && todayM === viewMonth && todayD === day;
  }

  function selectDay(day: number) {
    const date = new Date(viewYear, viewMonth, day);
    const iso = dateToISO(date);
    onChange(iso);
    setInputText(isoToDisplay(iso)); // sincroniza el texto con la selección del calendario
    setOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  // Escritura manual: auto-formatea a dd/mm/aaaa y valida al llegar a 8 dígitos
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
      const valid = date.getDate() === d && date.getMonth() === m - 1 && date.getFullYear() === y;
      if (valid) {
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
        <label htmlFor={uid} className="block text-sm font-normal text-[--text-muted]">
          {label}
        </label>
      )}
      <div ref={ref} className="relative">
      {/* Trigger: input de texto + botón icono calendario */}
      <div className="flex items-center overflow-hidden rounded-lg border border-[--border] bg-white transition-colors focus-within:border-[#3d5a4f]">
        <input
          id={uid}
          type="text"
          inputMode="numeric"
          value={inputText}
          onChange={handleTextChange}
          placeholder="dd/mm/aaaa"
          className="flex-1 bg-transparent px-3 py-1.5 text-sm text-[--text] outline-none placeholder:text-[--text-muted]"
        />
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Cerrar calendario" : "Abrir calendario"}
          className="cursor-pointer px-3 py-1.5 text-[--text-muted] transition-colors hover:text-[--text]"
        >
          <CalendarDays size={14} />
        </button>
      </div>

      {/* Popup del calendario */}
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-xl border border-[--border] bg-white p-3 shadow-lg">
          {/* Navegación de mes */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={prevMonth}
              className="cursor-pointer rounded-full p-1 text-[--text-muted] transition-colors hover:bg-[#f4f0e8]"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-[--text]">
              {MONTHS_ES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={nextMonth}
              className="cursor-pointer rounded-full p-1 text-[--text-muted] transition-colors hover:bg-[#f4f0e8]"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Cabecera días de la semana */}
          <div className="mb-1 grid grid-cols-7 text-center">
            {DAYS_ES.map((d) => (
              <span key={d} className="py-0.5 text-[10px] font-medium text-[--text-muted]">{d}</span>
            ))}
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-7 gap-y-0.5 text-center">
            {cells.map((day, idx) => {
              if (!day) return <span key={`e-${idx}`} />;
              const disabled = isDisabled(day);
              const selected = isSelected(day);
              const today = isToday(day);
              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                  className={[
                    "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors",
                    selected
                      ? "bg-[#3d5a4f] font-medium text-white"
                      : today
                      ? "cursor-pointer border border-[#3d5a4f] font-medium text-[#3d5a4f] hover:bg-[#f4f0e8]"
                      : disabled
                      ? "cursor-not-allowed text-[--text-muted] opacity-40"
                      : "cursor-pointer text-[--text] hover:bg-[#f4f0e8]",
                  ].join(" ")}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Borrar selección */}
          {value && (
            <div className="mt-2 border-t border-[--border] pt-2 text-right">
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="cursor-pointer text-xs text-[--text-muted] transition-colors hover:text-[--text]"
              >
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
  // Cada foto guarda la URL ya subida + el File original para poder re-recortar
  const [images, setImages] = useState<Array<{ url: string; file: File }>>([]);
  const [cropState, setCropState] = useState<{ file: File; replacingIndex: number | null } | null>(null);
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [stepOneError, setStepOneError] = useState<string | null>(null); // P31: error de validación del paso 1
  const [isPending, setIsPending] = useState(false);

  const [name, setName] = useState("");
  const [priceEuros, setPriceEuros] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"UNIQUE" | "PERISHABLE" | "STANDARD">("UNIQUE");
  const [category, setCategory] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const typeIsForced = PERISHABLE_CATEGORIES.includes(category);

  // Sensores: ratón (drag tras mover 8px) y táctil (drag tras 200ms quieto)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((img) => img.url === active.id);
    const newIndex = images.findIndex((img) => img.url === over.id);
    if (oldIndex !== -1 && newIndex !== -1) setImages((prev) => arrayMove(prev, oldIndex, newIndex));
  }

  //Función dentro del componente para manejar cambios en la categoría de producto
  function handleCategoryChange(newCategory: string) {
    setCategory(newCategory);
    if (PERISHABLE_CATEGORIES.includes(newCategory)) {
      setType("PERISHABLE");
    } else if (type === "PERISHABLE") {
      // Si la nueva categoría ya no es perecedera, resetear el tipo
      setType("STANDARD");
      setExpiresAt("");
    }
  }

  // Al seleccionar archivos: abre CropModal para el primero y encola el resto.
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

  // Tras confirmar el recorte: sube el blob y procesa la cola.
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
        const newEntry = { url: json.data.url, file: current.file };
        if (current.replacingIndex !== null) {
          setImages((prev) => prev.map((img, i) => i === current.replacingIndex ? newEntry : img));
        } else {
          setImages((prev) => [...prev, newEntry]);
          setStepOneError(null); // P31: limpiar error de "sin fotos" al añadir la primera
          // P4: lee la cola con updater funcional para evitar stale closure
          setCropQueue((prev) => {
            const [next, ...remaining] = prev;
            if (next) setCropState({ file: next, replacingIndex: null });
            return remaining;
          });
        }
      } else {
        // P5: vaciar la cola en caso de error para no abrir el siguiente modal
        setCropQueue([]);
        setUploadError(json.error?.message ?? "Error al subir la imagen");
      }
    } catch {
      // P5: vaciar la cola también si el fetch lanza
      setCropQueue([]);
      setUploadError("Error de conexión al subir la imagen");
    }

    setIsUploading(false);
  }

  // Reabre el CropModal con el archivo original para re-encuadrar.
  function handleEditImage(index: number) {
    const img = images[index];
    if (img) setCropState({ file: img.file, replacingIndex: index });
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
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
      imageUrls: images.map((img) => img.url),
      category,
      expiresAt: expiresAt || undefined,
    });

    setIsPending(false);

    if (!result) {
      toast.error("Algo fue mal. Inténtalo de nuevo.");
      return;
    }

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
      <div className="bg-[--bg]"><div className="space-y-6 px-4 py-8">
        <h1 className="font-display text-xl font-bold text-[--text]">Añadir producto</h1>

        <p className="text-sm text-[--text-muted]">Paso 1 de 2 — Añade las imágenes del producto</p>

        {/* Grid de 3 huecos con drag & drop — siempre visible:
              - DndContext es el contenedor que habilita el drag & drop.
              - SortableContext es el que hace que los elementos dentro sean ordenables.
              - useSortable se usa en cada foto para hacerla arrastrable y obtener los props necesarios.
              - arrayMove se usa para reordenar el estado de las fotos cuando se suelta una foto en una nueva posición.
              - sensors detectan tanto el arrastre con ratón como con táctil, con activación tras cierta distancia o tiempo para evitar conflictos con clicks o taps normales.
              - collisionDetection determina cómo se detecta el elemento sobre el que se suelta la foto (decide cuando un item entras en una zona). 
        */}
        {/* Grid mosaico: portada 2×2 (col-span-2 row-span-2) + 2 laterales a la derecha + 3 en fila inferior.
              El primer elemento siempre es la portada.
              Al arrastrar cualquier imagen a la primera posición, pasa a ser portada automáticamente. */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((img) => img.url)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: MAX_IMAGES }).map((_, i) => {
                const img = images[i];
                const isHero = i === 0;
                if (img) {
                  //Hueco ocupado: imagen arrastrable con botones de acción
                  return (
                    <SortablePhoto
                      key={img.url}
                      id={img.url}
                      url={img.url}
                      index={i}
                      isHero={isHero}
                      onEdit={() => handleEditImage(i)}
                      onRemove={() => removeImage(i)}
                    />
                  );
                }
                //Hueco vacío: zona de añadir imagen
                return (
                  <label
                    key={`empty-${i}`}
                    className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[--border] bg-[--surface] transition-colors hover:border-[#3d5a4f]/50 hover:bg-[--surface-2]${isHero ? " col-span-2 row-span-2" : ""}`}
                  >
                    <span className={`select-none font-extralight leading-none text-[#3d5a4f]/50 ${isHero ? "text-5xl" : "text-3xl"}`}>+</span>
                    <span className={`text-[--text-muted] ${isHero ? "text-sm font-medium" : "text-[10px]"}`}>
                      {isHero ? "Portada" : `Imagen ${i + 1}`}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={isUploading || i !== images.length}
                    />
                  </label>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
        
        
        <p className="text-center text-xs text-[--text-muted]">
          {images.length === 0
            ? "Puedes subir hasta 6 imágenes en formato JPEG, PNG o WebP"
            : `${images.length}/${MAX_IMAGES} imagen${images.length > 1 ? "es" : ""} añadida${images.length > 1 ? "s" : ""} · Arrastra para reordenar`}
        </p>

        {isUploading && (
          <p className="text-center text-sm text-[--text-muted]">Subiendo imagen...</p>
        )}
        {uploadError && <p className="text-center text-sm text-red-600">{uploadError}</p>}
        {stepOneError && <p className="text-center text-sm text-red-600">{stepOneError}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              if (images.length === 0) {
                setStepOneError("Añade al menos una imagen del producto para continuar.");
                return;
              }
              setStepOneError(null);
              setStep(2);
            }}
            disabled={isUploading}
            className="flex-1 cursor-pointer rounded-full bg-[#3d5a4f] py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Siguiente
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 cursor-pointer rounded-full border border-[#ccc8bc] py-2 text-sm text-[--text] transition-colors hover:bg-[#ccc8bc]"
          >
            Cancelar
          </button>
        </div>
      </div>

      {cropState && (
        <CropModal
          file={cropState.file}
          aspectRatio={1}
          shape="rect"
          label="la imagen del producto"
          onConfirm={(blob) => { void handleCropConfirm(blob); }}
          onCancel={() => { setCropState(null); setCropQueue([]); }}
        />
      )}
    </div>
    );
  }

  // ─── Paso 2: datos ────────────────────────────────────────────────────────
  return (
    <div className="bg-[--bg]"><div className="space-y-6 px-4 py-8">
      <h1 className="font-display text-xl font-bold text-[--text]">Añadir producto</h1>

      <p className="text-sm text-[--text-muted]">Paso 2 de 2 — Completa los detalles</p>

      <div className="flex gap-2">
        {images.map(({ url }, i) => (
          <div key={url} className="relative h-14 w-14 overflow-hidden rounded-lg border border-[--border]">
            <Image src={url} alt={`Imagen ${i + 1}`} fill className="object-cover" sizes="56px" />
            {i === 0 ? (
              <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1 py-0.5 text-[8px] font-medium leading-none text-white">
                Portada
              </span>
            ) : (
              <span className="absolute bottom-1 left-1 rounded bg-black/40 px-1 py-0.5 text-[8px] leading-none text-white">
                {i + 1}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="block pl-1 font-normal text-[--text-muted]">
            Nombre del producto
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Bol de cerámica raku"
            className="bg-white focus-visible:border-[#3d5a4f] focus-visible:ring-0"
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="block pl-1 font-normal text-[--text-muted]">
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
            className="bg-white focus-visible:border-[#3d5a4f] focus-visible:ring-0"
          />
          {errors.priceInCents && <p className="text-xs text-red-600">{errors.priceInCents}</p>}
        </div>

        <div>
          <div className="space-y-2">
            <Label htmlFor="description" className="block pl-1 font-normal text-[--text-muted]">
              Descripción breve
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={280}
              rows={3}
              placeholder="Cuéntanos sobre esta pieza..."
              className="w-full resize-none rounded-lg border border-[--border] bg-white px-3 py-2 text-sm text-[--text] outline-none transition-colors focus-visible:border-[#3d5a4f]"
            />
          </div>
          <p className={`mt-1 text-right text-xs ${description.length > 260 ? "text-red-500" : "text-[--text-muted]"}`}>
            {280 - description.length} restantes
          </p>
          {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
        </div>

        <div className="!mt-1 space-y-2">
          <SelectField
            label="Categoría"
            value={category}
            onChange={handleCategoryChange}
            placeholder="Selecciona una categoría"
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
          {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
        </div>

        <div className="space-y-2">
          <SelectField
            label="Tipo de producto"
            value={type}
            onChange={(v) => setType(v as typeof type)}
            disabled={typeIsForced}
            options={PRODUCT_TYPES}
          />
          <div className="flex items-start gap-2 rounded-lg bg-[--surface-2] px-3 py-2">
            <Info size={13} className="mt-0.5 shrink-0 text-[#3d5a4f]/60" />
            <p className="text-xs text-[--text-muted]">{TYPE_DESCRIPTIONS[type]}</p>
          </div>
        </div>

        {type === "PERISHABLE" && (
          <div className="space-y-2">
            <DatePickerField
              label="Fecha límite de disponibilidad"
              value={expiresAt}
              onChange={setExpiresAt}
              min={(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`; })()}
            />
            <div className="flex items-start gap-2 rounded-lg bg-[--surface-2] px-3 py-2">
              <Info size={13} className="mt-0.5 shrink-0 text-[#3d5a4f]/60" />
              <p className="text-xs text-[--text-muted]">Después de esta fecha el producto se eliminará automáticamente de tu catálogo.</p>
            </div>
            {errors.expiresAt && <p className="text-xs text-red-600">{errors.expiresAt}</p>}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handlePublish}
          disabled={isPending}
          className="flex-1 cursor-pointer rounded-full bg-[#3d5a4f] py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Publicando..." : "Publicar"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/studio/products")}
          className="flex-1 cursor-pointer rounded-full border border-[#ccc8bc] py-2 text-sm text-[--text] transition-colors hover:bg-[#ccc8bc]"
        >
          Cancelar
        </button>
      </div>
      </div>
    </div>
  );
}
