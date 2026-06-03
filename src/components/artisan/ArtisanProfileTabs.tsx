"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Product, ProcessUpdate } from "generated/prisma";
import { getProductBadge } from "~/lib/product-badges";

interface ArtisanProfileTabsProps {
  products: Product[];
  processUpdates: ProcessUpdate[];
  artisanName: string | null;
}

export default function ArtisanProfileTabs({
  products,
  processUpdates,
  artisanName,
}: ArtisanProfileTabsProps) {
  const t = useTranslations("profile");
  const [activeTab, setActiveTab] = useState<"shop" | "process">("shop");

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-[--border]">
        <button
          onClick={() => setActiveTab("shop")}
          className={`-mb-px cursor-pointer border-b-[3px] px-4 pb-3 text-sm font-medium transition-colors ${
            activeTab === "shop"
              ? "border-[#3d5a4f] text-[#3d5a4f] font-semibold"
              : "border-transparent text-[--text-muted] hover:text-[#3d5a4f]/70"
          }`}
        >
          {t("products")}
        </button>
        <button
          onClick={() => setActiveTab("process")}
          className={`-mb-px cursor-pointer border-b-[3px] px-4 pb-3 text-sm font-medium transition-colors ${
            activeTab === "process"
              ? "border-[#3d5a4f] text-[#3d5a4f] font-semibold"
              : "border-transparent text-[--text-muted] hover:text-[#3d5a4f]/70"
          }`}
        >
          {t("process")}
        </button>
      </div>

      {/* Tienda */}
      {activeTab === "shop" && (
        <div className="mt-4 pb-8">
          {products.length === 0 ? (
            <p className="py-12 text-center text-sm text-[--text-muted]">
              {t("noProducts")}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`group overflow-hidden rounded-lg border border-[--border] bg-[--surface] transition-all duration-200 ${
                    product.status === "ACTIVE" ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
                  }`}
                >
                  <div className="relative aspect-square w-full overflow-hidden">
                    {product.imageUrls[0] ? (
                      <Image
                        src={product.imageUrls[0]}
                        alt={product.name}
                        fill
                        className={`object-cover transition-transform duration-300 ${
                          product.status === "ACTIVE" ? "group-hover:scale-105" : ""
                        }`}
                      />
                    ) : (
                      <div className="h-full w-full bg-[--border]" />
                    )}
                    {/* Overlay oscuro permanente para no-activos */}
                    {product.status !== "ACTIVE" && (
                      <div className="pointer-events-none absolute inset-0 bg-black/50" />
                    )}
                    {/* Badge de estado */}
                    {(() => {
                      const badge = getProductBadge(product.status, product.expiresAt);
                      return badge ? (
                        <span className={`absolute bottom-2 left-2 rounded px-1.5 py-0.5 text-xs font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <div className="p-2">
                    <p className={`truncate font-display text-base ${product.status !== "ACTIVE" ? "text-[--text-muted]" : "text-[--text]"}`}>{product.name}</p>
                    <p className="text-xs text-[#3d5a4f]">
                      {(product.priceInCents / 100).toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Proceso */}
      {activeTab === "process" && (
        <div className="mt-4 space-y-4">
          {processUpdates.length === 0 ? (
            <p className="py-12 text-center text-sm text-[--text-muted]">
              {t("noProcessUpdates")}
            </p>
          ) : (
            processUpdates.map((update) => (
              <div key={update.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-semibold text-[--text]">
                    {artisanName ?? "Artesana"}
                  </span>
                  <span className="text-xs text-[--text-muted]">
                    {new Intl.DateTimeFormat("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(update.createdAt))}
                  </span>
                </div>
                <blockquote className="rounded-lg bg-[--surface] px-4 py-3 font-display text-sm text-[--text]">
                  {update.content}
                </blockquote>
                {update.imageUrl && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    <Image
                      src={update.imageUrl}
                      alt={t("processImageAlt")}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
