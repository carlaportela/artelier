import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies — Artelier",
  description:
    "Qué cookies utiliza Artelier, para qué sirven y cómo puedes gestionarlas.",
};

export default function CookiesPage() {
  return (
    <main className="px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-foreground">Política de Cookies</h1>
      <p className="mt-1 mb-10 text-xs text-muted-foreground">Última actualización: junio de 2026</p>

      <section className="space-y-8 text-sm leading-relaxed text-foreground">

        <div>
          <h2 className="mb-3 text-base font-semibold text-foreground">¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Sirven para recordar preferencias, mantener sesiones iniciadas y recopilar información sobre el uso del sitio.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-foreground">Cookies que utilizamos</h2>
          <p className="mb-4">Artelier utiliza únicamente cookies técnicas estrictamente necesarias para el funcionamiento del servicio. No utilizamos cookies de rastreo publicitario ni de perfilado.</p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="px-3 py-2 text-left font-semibold text-foreground">Nombre</th>
                  <th className="px-3 py-2 text-left font-semibold text-foreground">Dominio</th>
                  <th className="px-3 py-2 text-left font-semibold text-foreground">Finalidad</th>
                  <th className="px-3 py-2 text-left font-semibold text-foreground">Duración</th>
                  <th className="px-3 py-2 text-left font-semibold text-foreground">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-3 py-2 font-mono text-muted-foreground">authjs.session-token</td>
                  <td className="px-3 py-2 text-muted-foreground">artelier.es</td>
                  <td className="px-3 py-2 text-muted-foreground">Mantiene la sesión de usuario iniciada</td>
                  <td className="px-3 py-2 text-muted-foreground">30 días</td>
                  <td className="px-3 py-2 text-muted-foreground">Técnica necesaria</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-muted-foreground">__Secure-authjs.session-token</td>
                  <td className="px-3 py-2 text-muted-foreground">artelier.es</td>
                  <td className="px-3 py-2 text-muted-foreground">Versión segura de la cookie de sesión (HTTPS)</td>
                  <td className="px-3 py-2 text-muted-foreground">30 días</td>
                  <td className="px-3 py-2 text-muted-foreground">Técnica necesaria</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-muted-foreground">
            Las cookies técnicas necesarias no requieren tu consentimiento, ya que son imprescindibles para que el servicio funcione. Sin ellas, no podrías iniciar sesión ni mantener tu carrito de compra.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-foreground">¿Cómo gestionar las cookies?</h2>
          <p>Puedes eliminar o bloquear las cookies desde la configuración de tu navegador. Ten en cuenta que bloquear las cookies técnicas puede impedir el correcto funcionamiento de la plataforma.</p>
          <ul className="mt-3 space-y-2 pl-4 text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Chrome:</span>{" "}
              Configuración → Privacidad y seguridad → Cookies y otros datos de sitios
            </li>
            <li>
              <span className="font-medium text-foreground">Firefox:</span>{" "}
              Ajustes → Privacidad y seguridad → Cookies y datos del sitio
            </li>
            <li>
              <span className="font-medium text-foreground">Safari:</span>{" "}
              Preferencias → Privacidad → Gestionar datos de sitios web
            </li>
            <li>
              <span className="font-medium text-foreground">Edge:</span>{" "}
              Configuración → Privacidad, búsqueda y servicios → Cookies
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-foreground">Actualización de esta política</h2>
          <p>
            Esta política puede actualizarse cuando se introduzcan nuevas cookies o cambien las finalidades existentes. La versión vigente siempre estará disponible en esta página con la fecha de última actualización.
          </p>
        </div>

      </section>
    </main>
  );
}
