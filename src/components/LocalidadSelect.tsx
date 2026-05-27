//Página de selecciñon de localidad con autocompletado y dropdown de sugerencias basado en la lista de ciudades y municipios de España.

"use client"; //Se renderiza en cliente

import { useState, useRef, useEffect } from "react";
import { provincias } from "~/lib/data/localidades"; //Importa la lista de provincias y municipios desde un archivo local.

// Lista plana generada una sola vez al cargar el módulo
const LOCALIDADES = provincias.flatMap((p) =>
  p.municipios.map((m) => ({ municipio: m, provincia: p.nombre }))
);

//Función de normalización para comprar strings sin acentos, mayúsculas o espacios extra para facilitar la búsqueda de sugerencias.
function norm(str: string) {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

//Argumentos que recibe el componente LocalidadSelect. Permite controlar el valor desde el padre, manejar cambios, mostrar errores y personalizar el placeholder y estilos del input.
interface Props {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  inputClassName?: string;
}

//Clase por defecto para el input.
const DEFAULT_INPUT_CLASS =
  "w-full rounded-lg border border-[--border] bg-white px-3 py-1.5 text-sm text-[--text] placeholder:text-[--text-muted] outline-none transition-colors focus-visible:border-[#3d5a4f]";

//Función principal que maneja la lógica del componente. Permite escribir una localidad y mostrar sugerencias basadas en la lista de localidades.
export default function LocalidadSelect({
  value = "",
  onChange,
  error,
  placeholder = "Ej: Santiago de Compostela, A Coruña",
  inputClassName,
}: Props) {
  const [text, setText] = useState(value);
  const [sugerencias, setSugerencias] = useState<typeof LOCALIDADES>([]);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);

  // Referencia al último valor que este componente emitió vía onChange.
  // Permite distinguir cambios del padre (reset externo) de los que iniciamos nosotros.
  const lastEmitted = useRef(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sincroniza solo cuando el padre cambia el valor externamente (ej: cancelar edición).
  // NO se activa cuando somos nosotros quien llamó a onChange.
  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setText(value);
      setSugerencias([]);
      setAbierto(false);
      setActivo(-1);
    }
  }, [value]);

  // Cierra el dropdown al hacer click fuera del componente
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  //Función para que al escribir: actualiza texto y sugerencias, pero NO llama a onChange todavía.
  // Así el padre no re-renderiza el prop value y no se cierra el dropdown.
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setText(val);
    setActivo(-1);

    if (val.length >= 2) {
      const q = norm(val);
      const matches = LOCALIDADES.filter(
        (l) => norm(l.municipio).startsWith(q) || norm(l.municipio).includes(q)
      )
        .sort((a, b) => {
          const aStart = norm(a.municipio).startsWith(q);
          const bStart = norm(b.municipio).startsWith(q);
          if (aStart && !bStart) return -1;
          if (!aStart && bStart) return 1;
          return a.municipio.localeCompare(b.municipio, "es");
        })
        .slice(0, 8);

      setSugerencias(matches);
      setAbierto(matches.length > 0);
    } else {
      setSugerencias([]);
      setAbierto(false);
      if (!val) {
        // Campo vaciado: notifica inmediatamente
        lastEmitted.current = "";
        onChange("");
      }
    }
  }

  //Función para manejar la selección de la sugerencia por el usuario.
  function handleSelect(item: (typeof LOCALIDADES)[number]) {
    const combined = `${item.municipio}, ${item.provincia}`;
    setText(combined);
    // Marca el valor como "emitido por nosotros" ANTES de llamar a onChange,
    // para que el useEffect no lo trate como cambio externo.
    lastEmitted.current = combined;
    onChange(combined);
    setSugerencias([]);
    setAbierto(false);
    setActivo(-1);
  }

  //Función para que al salir del campo sin seleccionar: guarda el texto libre
  function handleBlur() {
    // Timeout pequeño para que el onMouseDown de la sugerencia se ejecute primero.
    // Si el usuario hizo click en una sugerencia, handleSelect ya actualizó todo.
    setTimeout(() => {
      setAbierto(false);
      const current = text.trim();
      if (current !== lastEmitted.current) {
        lastEmitted.current = current;
        onChange(current);
      }
    }, 120);
  }

  //Función para manejas la navegación por teclado de las sugerencias.
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!abierto && sugerencias.length > 0) setAbierto(true);
      setActivo((prev) => Math.min(prev + 1, sugerencias.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && activo >= 0) {
      e.preventDefault();
      const item = sugerencias[activo];
      if (item) handleSelect(item);
    } else if (e.key === "Escape") {
      setAbierto(false);
    }
  }

  const inputClass = inputClassName ?? DEFAULT_INPUT_CLASS;

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={inputClass}
        autoComplete="off"
        spellCheck={false}
        aria-label="Ubicación"
        role="combobox"
        aria-expanded={abierto}
        aria-controls="localidad-listbox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-activedescendant={activo >= 0 ? `localidad-option-${activo}` : undefined}
      />

      {abierto && sugerencias.length > 0 && (
        <ul
          id="localidad-listbox"
          role="listbox"
          aria-label="Sugerencias de ubicación"
          className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg border border-[--border] bg-[#f4f0e8] shadow-lg"
        >
          {sugerencias.map((item, i) => {
            const isActive = i === activo;
            return (
              <li
                key={`${item.provincia}-${item.municipio}`}
                id={`localidad-option-${i}`}
                role="option"
                aria-selected={isActive}
                onMouseDown={(e) => {
                  // preventDefault evita que el input pierda el foco antes de que
                  // se procese este click, lo que abortaría el handleBlur prematuro.
                  e.preventDefault();
                  handleSelect(item);
                }}
                onMouseEnter={() => setActivo(i)}
                className={`flex cursor-pointer items-baseline gap-1.5 px-3 py-2 transition-colors ${
                  isActive
                    ? "bg-[#ccc8bc] text-[--text]"
                    : "text-[--text] hover:bg-[#ccc8bc]"
                }`}
              >
                <span className="text-sm font-medium">{item.municipio}</span>
                <span
                  className="text-xs text-[--text-muted]"
                >
                  {item.provincia}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
