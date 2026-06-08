import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies — Artelier",
  description:
    "Qué cookies utiliza Artelier, para qué sirven y cómo puedes gestionarlas.",
};

export default function CookiesPage() {
  return (
    <main className="px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-[--text]">Política de Cookies</h1>
      <p className="mt-1 mb-10 text-xs text-[--text-muted]">Última actualización: junio de 2026</p>

      <section className="space-y-8 text-sm leading-relaxed text-[--text]">

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Sirven para recordar preferencias, mantener sesiones iniciadas y recopilar información sobre el uso del sitio.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">Cookies que utilizamos</h2>
          <p className="mb-4">Artelier utiliza únicamente cookies técnicas estrictamente necesarias para el funcionamiento del servicio. No utilizamos cookies de rastreo publicitario ni de perfilado.</p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-[--border] bg-[--surface]">
                  <th className="px-3 py-2 text-left font-semibold text-[--text]">Nombre</th>
                  <th className="px-3 py-2 text-left font-semibold text-[--text]">Dominio</th>
                  <th className="px-3 py-2 text-left font-semibold text-[--text]">Finalidad</th>
                  <th className="px-3 py-2 text-left font-semibold text-[--text]">Duración</th>
                  <th className="px-3 py-2 text-left font-semibold text-[--text]">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--border]">
                <tr>
                  <td className="px-3 py-2 font-mono text-[--text-muted]">authjs.session-token</td>
                  <td className="px-3 py-2 text-[--text-muted]">artelier.es</td>
                  <td className="px-3 py-2 text-[--text-muted]">Mantiene la sesión de usuario iniciada</td>
                  <td className="px-3 py-2 text-[--text-muted]">30 días</td>
                  <td className="px-3 py-2 text-[--text-muted]">Técnica necesaria</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-[--text-muted]">__Secure-authjs.session-token</td>
                  <td className="px-3 py-2 text-[--text-muted]">artelier.es</td>
                  <td className="px-3 py-2 text-[--text-muted]">Versión segura de la cookie de sesión (HTTPS)</td>
                  <td className="px-3 py-2 text-[--text-muted]">30 días</td>
                  <td className="px-3 py-2 text-[--text-muted]">Técnica necesaria</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-[--text-muted]">
            Las cookies técnicas necesarias no requieren tu consentimiento, ya que son imprescindibles para que el servicio funcione. Sin ellas, no podrías iniciar sesión ni mantener tu carrito de compra.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">¿Cómo gestionar las cookies?</h2>
          <p>Puedes eliminar o bloquear las cookies desde la configuración de tu navegador. Ten en cuenta que bloquear las cookies técnicas puede impedir el correcto funcionamiento de la plataforma.</p>
          <ul className="mt-3 space-y-2 pl-4 text-[--text-muted]">
            <li>
              <span className="font-medium text-[--text]">Chrome:</span>{" "}
              Configuración → Privacidad y seguridad → Cookies y otros datos de sitios
            </li>
            <li>
              <span className="font-medium text-[--text]">Firefox:</span>{" "}
              Ajustes → Privacidad y seguridad → Cookies y datos del sitio
            </li>
            <li>
              <span className="font-medium text-[--text]">Safari:</span>{" "}
              Preferencias → Privacidad → Gestionar datos de sitios web
            </li>
            <li>
              <span className="font-medium text-[--text]">Edge:</span>{" "}
              Configuración → Privacidad, búsqueda y servicios → Cookies
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">Actualización de esta política</h2>
          <p>
            Esta política puede actualizarse cuando se introduzcan nuevas cookies o cambien las finalidades existentes. La versión vigente siempre estará disponible en esta página con la fecha de última actualización.
          </p>
        </div>

      </section>
    </main>
  );
}
