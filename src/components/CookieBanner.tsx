"use client";

import { useState, useEffect } from "react";

const COOKIE_NAME = "artelier-cookie-consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 12 meses en segundos

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasConsent = document.cookie
      .split("; ")
      .some((c) => c.startsWith(`${COOKIE_NAME}=`));
    if (!hasConsent) setVisible(true);
  }, []);

  function saveConsent(value: "all" | "necessary") {
    document.cookie = `${COOKIE_NAME}=${value}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[--border] bg-[--bg]/98 px-4 py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[--text]">
          Usamos cookies necesarias para que la app funcione.{" "}
          <span className="text-[--text-muted]">
            ¿Aceptas también las cookies analíticas para ayudarnos a mejorar?
          </span>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => saveConsent("necessary")}
            className="cursor-pointer rounded-full border border-[--border] px-4 py-1.5 text-sm text-[--text-muted] transition-colors hover:bg-black/[0.06]"
          >
            Solo necesarias
          </button>
          <button
            type="button"
            onClick={() => saveConsent("all")}
            className="cursor-pointer rounded-full bg-[#c4956a] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#b5894e]"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
