//Página para gestionar las publicaciones del estudio: crear, editar y liminar publicaciones y elegir entre vista de cuadrícula o lista.

"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import Image from "next/image";
import { LayoutGrid, List, Plus, X, Upload, Pencil, Trash2 } from "lucide-react";
import type { ProcessUpdate } from "generated/prisma";

import { createPublicacion, updatePublicacion, deletePublicacion } from "./actions";

type View = "grid" | "scroll";

// ─── Form (new / edit) ────────────────────────────────────────────────────────

function PublicacionForm({
  initial,
  onCancel,
  onSuccess,
}: {
  initial?: ProcessUpdate;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [content, setContent] = useState(initial?.content ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "process");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = (await res.json()) as { data?: { url: string } };
      if (json.data?.url) setImageUrl(json.data.url);
      else setUploadError("Error al subir la imagen.");
    } catch {
      setUploadError("Error al subir la imagen.");
    }
    setUploading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl) {
      setUploadError("La imagen es obligatoria.");
      return;
    }
    startTransition(async () => {
      if (initial) {
        await updatePublicacion(initial.id, { content, imageUrl });
      } else {
        await createPublicacion({ content, imageUrl });
      }
      onSuccess();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image area */}
      <div className="space-y-2">
        {imageUrl ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-xl">
            <Image src={imageUrl} alt="Preview" fill className="object-cover" />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:opacity-80"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[--border] bg-[--surface] text-[--text-muted] transition-colors hover:border-[#3d5a4f] hover:text-[#3d5a4f] disabled:opacity-50"
          >
            <Upload size={28} strokeWidth={1.5} />
            <span className="text-sm">{uploading ? "Subiendo..." : "Añadir imagen"}</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          aria-label="Subir imagen de publicación"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
          }}
        />
        {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
      </div>

      {/* Text */}
      <div>
        <textarea
          rows={4}
          maxLength={500}
          placeholder="Describe esta publicación..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-lg border border-[--border] bg-white px-3 py-2 text-sm text-[--text] placeholder:text-[--text-muted] outline-none transition-colors focus-visible:border-[#3d5a4f] focus-visible:ring-0"
        />
        <p className="mt-1 text-right text-xs text-[--text-muted]">{content.length}/500</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 cursor-pointer rounded-full border border-[--border] py-2 text-sm text-[--text] transition-colors hover:bg-[--surface]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending || uploading || !imageUrl}
          className="flex-1 cursor-pointer rounded-full bg-[#3d5a4f] py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Guardando..." : initial ? "Guardar" : "Publicar"}
        </button>
      </div>
    </form>
  );
}

// ─── Bottom sheet ─────────────────────────────────────────────────────────────

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-[--bg] p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-[--text]">{title}</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-[--text-muted] transition-colors hover:text-[--text]"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function PublicacionesView({ posts }: { posts: ProcessUpdate[] }) {
  const [view, setView] = useState<View>("grid");
  const [viewPost, setViewPost] = useState<ProcessUpdate | null>(null);
  const [editPost, setEditPost] = useState<ProcessUpdate | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const saved = localStorage.getItem("publicaciones-view") as View | null;
    if (saved === "grid" || saved === "scroll") setView(saved);
  }, []);

  function switchView(v: View) {
    setView(v);
    localStorage.setItem("publicaciones-view", v);
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletePublicacion(id);
      setViewPost(null);
      setConfirmDeleteId(null);
    });
  }

  function openEdit(post: ProcessUpdate) {
    setViewPost(null);
    setEditPost(post);
  }

  const fmt = (date: Date) =>
    new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(
      new Date(date),
    );

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <button
            onClick={() => switchView("grid")}
            aria-label="Vista cuadrícula"
            className={`cursor-pointer rounded-lg p-2 transition-colors ${
              view === "grid"
                ? "bg-[--surface-2] text-[#3d5a4f]"
                : "text-[--text-muted] hover:text-[--text]"
            }`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => switchView("scroll")}
            aria-label="Vista lista"
            className={`cursor-pointer rounded-lg p-2 transition-colors ${
              view === "scroll"
                ? "bg-[--surface-2] text-[#3d5a4f]"
                : "text-[--text-muted] hover:text-[--text]"
            }`}
          >
            <List size={18} />
          </button>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[#3d5a4f] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e]"
        >
          <Plus size={14} />
          Nueva
        </button>
      </div>

      {/* ── Empty state ── */}
      {posts.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-sm text-[--text-muted]">Aún no tienes publicaciones.</p>
          <button
            onClick={() => setShowNew(true)}
            className="cursor-pointer text-sm font-medium text-[#3d5a4f] underline underline-offset-2"
          >
            Añade tu primera publicación
          </button>
        </div>
      )}

      {/* ── Grid view ── */}
      {posts.length > 0 && view === "grid" && (
        <div className="grid grid-cols-3 gap-0.5 overflow-hidden rounded-xl">
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => setViewPost(post)}
              className="relative aspect-square cursor-pointer overflow-hidden bg-[--surface]"
            >
              {post.imageUrl && (
                <Image
                  src={post.imageUrl}
                  alt=""
                  fill
                  className="object-cover transition-opacity hover:opacity-85"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Scroll view ── */}
      {posts.length > 0 && view === "scroll" && (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-xl border border-[--border] bg-[--surface]"
            >
              {post.imageUrl && (
                <div className="relative aspect-square w-full">
                  <Image src={post.imageUrl} alt="" fill className="object-cover" />
                </div>
              )}
              <div className="space-y-2 p-4">
                <p className="text-xs text-[--text-muted]">{fmt(post.createdAt)}</p>
                <p className="text-sm text-[--text]">{post.content}</p>
                <div className="flex gap-4 pt-1">
                  <button
                    onClick={() => openEdit(post)}
                    className="flex cursor-pointer items-center gap-1 text-xs text-[--text-muted] transition-colors hover:text-[#3d5a4f]"
                  >
                    <Pencil size={12} />
                    Editar
                  </button>
                  {confirmDeleteId === post.id ? (
                    <span className="flex items-center gap-2 text-xs">
                      <span className="text-[--text-muted]">¿Seguro?</span>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="cursor-pointer font-medium text-red-600 hover:underline"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="cursor-pointer text-[--text-muted] hover:underline"
                      >
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(post.id)}
                      className="flex cursor-pointer items-center gap-1 text-xs text-[--text-muted] transition-colors hover:text-red-600"
                    >
                      <Trash2 size={12} />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── View modal (grid) ── */}
      {viewPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => { setViewPost(null); setConfirmDeleteId(null); }}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-[--bg]"
            onClick={(e) => e.stopPropagation()}
          >
            {viewPost.imageUrl && (
              <div className="relative aspect-square w-full">
                <Image src={viewPost.imageUrl} alt="" fill className="object-cover" />
                <button
                  onClick={() => { setViewPost(null); setConfirmDeleteId(null); }}
                  className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:opacity-80"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="space-y-2 p-4">
              <p className="text-xs text-[--text-muted]">{fmt(viewPost.createdAt)}</p>
              <p className="text-sm text-[--text]">{viewPost.content}</p>
              <div className="flex gap-4 pt-1">
                <button
                  onClick={() => openEdit(viewPost)}
                  className="flex cursor-pointer items-center gap-1.5 text-sm text-[--text-muted] transition-colors hover:text-[#3d5a4f]"
                >
                  <Pencil size={14} />
                  Editar
                </button>
                {confirmDeleteId === viewPost.id ? (
                  <span className="flex items-center gap-2 text-sm">
                    <span className="text-[--text-muted]">¿Seguro?</span>
                    <button
                      onClick={() => handleDelete(viewPost.id)}
                      className="cursor-pointer font-medium text-red-600 hover:underline"
                    >
                      Sí
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="cursor-pointer text-[--text-muted] hover:underline"
                    >
                      No
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(viewPost.id)}
                    className="flex cursor-pointer items-center gap-1.5 text-sm text-[--text-muted] transition-colors hover:text-red-600"
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── New publication sheet ── */}
      {showNew && (
        <Sheet title="Nueva publicación" onClose={() => setShowNew(false)}>
          <PublicacionForm
            onCancel={() => setShowNew(false)}
            onSuccess={() => setShowNew(false)}
          />
        </Sheet>
      )}

      {/* ── Edit sheet ── */}
      {editPost && (
        <Sheet title="Editar publicación" onClose={() => setEditPost(null)}>
          <PublicacionForm
            initial={editPost}
            onCancel={() => setEditPost(null)}
            onSuccess={() => setEditPost(null)}
          />
        </Sheet>
      )}
    </>
  );
}
