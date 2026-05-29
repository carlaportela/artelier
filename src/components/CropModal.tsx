//Modal para recortar las imagenes de perfil y portada antes de subirlas.
"use client";

import { useRef, useState, useEffect, useCallback, useId } from "react";

//Argumentos que recibe el componente.
interface Props {
  file: File;
  /** width/height — 1 para avatar cuadrado, 3 para banner panorámico */
  aspectRatio: number;
  /** "circle" muestra un recorte circular (avatar); "rect" rectangular (banner) */
  shape: "circle" | "rect";
  label: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

//Función principal. Permite cargar la imagen, mostrar un recuadro de recorte con la relación de aspecto adecuada, y aplicar zoom y desplazamiento para encuadrar la imagen antes de confirmarla.
export default function CropModal({ file, aspectRatio, shape, label, onConfirm, onCancel }: Props) {

  // ID único por instancia para evitar colisión de SVG mask si hay dos modales abiertos
  const uid = useId().replace(/:/g, "");
  const maskId = `palette-crop-mask-${uid}`;

  // Portada (3:1) usa recuadro más ancho para que el modal no sea diminuto
  const cropW = aspectRatio >= 2 ? 370 : 280;
  const cropH = Math.round(cropW / aspectRatio);

  const [imgSrc, setImgSrc] = useState("");
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const imgRef = useRef<HTMLImageElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ px: 0, py: 0, ox: 0, oy: 0 });

  // Pinch-to-zoom
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const lastPinchDist = useRef<number | null>(null);

  // Cargar archivo como ObjectURL
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Escala mínima: la imagen siempre cubre todo el recuadro
  const minScale = useCallback(() => {
    if (!naturalSize.w) return 1;
    return Math.max(cropW / naturalSize.w, cropH / naturalSize.h);
  }, [naturalSize, cropW, cropH]);

  // Centra y ajusta la imagen cuando se carga
  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    setNaturalSize({ w, h });
    setScale(Math.max(cropW / w, cropH / h));
    setOffset({ x: 0, y: 0 });
  }

  // Mantiene el desplazamiento dentro de los límites (imagen cubre el recuadro)
  function clamp(ox: number, oy: number, s: number) {
    if (!naturalSize.w) return { x: 0, y: 0 };
    const halfExtraX = (naturalSize.w * s - cropW) / 2;
    const halfExtraY = (naturalSize.h * s - cropH) / 2;
    return {
      x: Math.max(-halfExtraX, Math.min(halfExtraX, ox)),
      y: Math.max(-halfExtraY, Math.min(halfExtraY, oy)),
    };
  }

  // ── Drag ─────────────────────────────────────────────────────────────────

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // P32: ignorar tercer dedo (o más) — evita salto al apoyar un dedo extra durante pinch
    if (pointers.current.size >= 2) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 1) {
      isDragging.current = true;
      dragStart.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Pinch-to-zoom con dos dedos
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values()) as [{ x: number; y: number }, { x: number; y: number }];
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      if (lastPinchDist.current !== null) {
        const ratio = dist / lastPinchDist.current;
        const min = minScale();
        const newScale = Math.max(min, Math.min(scale * ratio, min * 5));
        setScale(newScale);
        setOffset((prev) => clamp(prev.x, prev.y, newScale));
      }
      lastPinchDist.current = dist;
      return;
    }

    // Pan con un dedo / ratón
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.px;
    const dy = e.clientY - dragStart.current.py;
    setOffset(clamp(dragStart.current.ox + dx, dragStart.current.oy + dy, scale));
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) lastPinchDist.current = null;
    if (pointers.current.size === 0) isDragging.current = false;
  }

  // ── Zoom con rueda ────────────────────────────────────────────────────────

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    e.preventDefault();
    const min = minScale();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.max(min, Math.min(scale * factor, min * 5));
    setScale(newScale);
    setOffset((prev) => clamp(prev.x, prev.y, newScale));
  }

  // ── Aplicar recorte ───────────────────────────────────────────────────────

  function handleConfirm() {
    const img = imgRef.current;
    if (!img || !naturalSize.w) return;

    // Resolución de salida
    const outW = aspectRatio >= 2 ? 1200 : 800;
    const outH = Math.round(outW / aspectRatio);

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Posición de la imagen en el recuadro de recorte (px de pantalla)
    const renderedW = naturalSize.w * scale;
    const renderedH = naturalSize.h * scale;
    const imgLeft = cropW / 2 - renderedW / 2 + offset.x;
    const imgTop  = cropH / 2 - renderedH / 2 + offset.y;

    // Conversión a coordenadas de píxel en la imagen original
    const srcX = (-imgLeft  / renderedW) * naturalSize.w;
    const srcY = (-imgTop   / renderedH) * naturalSize.h;
    const srcW = (cropW / renderedW) * naturalSize.w;
    const srcH = (cropH / renderedH) * naturalSize.h;

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
    canvas.toBlob((blob) => { if (blob) onConfirm(blob); }, "image/jpeg", 0.92);
  }

  // Posición de la imagen dentro del recuadro (px)
  const renderedW = naturalSize.w * scale;
  const renderedH = naturalSize.h * scale;
  const imgLeft = cropW / 2 - renderedW / 2 + offset.x;
  const imgTop  = cropH / 2 - renderedH / 2 + offset.y;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className={`w-full ${aspectRatio >= 2 ? "max-w-md" : "max-w-sm"} rounded-2xl bg-[#f4f0e8] p-6 shadow-2xl`}>
        <h2 className="mb-4 font-display text-lg font-bold text-[--text]">
          Ajusta {label}
        </h2>

        {/* Recuadro de recorte */}
        <div className="mx-auto flex items-center justify-center">
          <div
            className="relative overflow-hidden bg-black/10 select-none cursor-grab touch-none"
            style={{ width: cropW, height: cropH }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
          >
            {imgSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={imgSrc}
                alt=""
                draggable={false}
                onLoad={onImgLoad}
                className="absolute select-none pointer-events-none max-w-none max-h-none"
                style={{ left: imgLeft, top: imgTop, width: renderedW, height: renderedH }}
              />
            )}
            {/* Guía de tercios */}
            <div
              className="crop-thirds-guide pointer-events-none absolute inset-0"
              style={{ backgroundSize: `${cropW / 3}px ${cropH / 3}px` }}
            />
            {/* Overlay con forma de paleta: cubre lo exterior con el fondo del modal */}
            {shape === "circle" && (
              <svg
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="pointer-events-none absolute inset-0 z-10"
                style={{ width: cropW, height: cropH }}
              >
                <defs>
                  <mask id={maskId}>
                    <rect width="24" height="24" fill="white" />
                    <path
                      d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"
                      fill="black"
                    />
                  </mask>
                </defs>
                {/* Zona exterior → color de fondo del modal */}
                <rect width="24" height="24" fill="#f4f0e8" mask={`url(#${maskId})`} />
                {/* Borde sutil de la paleta */}
                <path
                  d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"
                  fill="none"
                  stroke="#ccc8bc"
                  strokeWidth="0.3"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Botones de zoom */}
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Alejar"
            onClick={() => {
              const min = minScale();
              const newScale = Math.max(min, scale * 0.85);
              setScale(newScale);
              setOffset((prev) => clamp(prev.x, prev.y, newScale));
            }}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#ccc8bc] text-lg font-bold text-[--text] transition-colors hover:bg-[#ccc8bc] disabled:opacity-40"
            disabled={scale <= minScale() + 0.001}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Acercar"
            onClick={() => {
              const min = minScale();
              const newScale = Math.min(scale * 1.15, min * 5);
              setScale(newScale);
              setOffset((prev) => clamp(prev.x, prev.y, newScale));
            }}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#ccc8bc] text-lg font-bold text-[--text] transition-colors hover:bg-[#ccc8bc]"
          >
            +
          </button>
        </div>

        <p className="mt-1.5 text-center text-xs text-[--text-muted]">
          Puedes arrastrar o hacer zoom
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="cursor-pointer rounded-full bg-[#3d5a4f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e]"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-full border border-[#ccc8bc] px-4 py-2 text-sm text-[--text] transition-colors hover:bg-[#ccc8bc]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
