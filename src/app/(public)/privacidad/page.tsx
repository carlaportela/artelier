import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — Artelier",
  description:
    "Cómo Artelier trata tus datos personales, tus derechos RGPD y cómo ejercerlos.",
};

export default function PrivacidadPage() {
  return (
    <main className="px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-[--text]">Política de Privacidad</h1>
      <p className="mt-1 mb-10 text-xs text-[--text-muted]">Última actualización: junio de 2026</p>

      <section className="space-y-8 text-sm leading-relaxed text-[--text]">

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">1. Responsable del tratamiento</h2>
          <ul className="space-y-1 pl-4">
            <li><span className="font-medium">Titular:</span> [PLACEHOLDER: Nombre legal completo]</li>
            <li><span className="font-medium">CIF/NIF:</span> [PLACEHOLDER: B-XXXXXXXX]</li>
            <li><span className="font-medium">Domicilio:</span> [PLACEHOLDER: Calle, número, CP, ciudad, provincia]</li>
            <li><span className="font-medium">Contacto:</span> [PLACEHOLDER: privacidad@artelier.es]</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">2. Datos personales que tratamos</h2>
          <p>Artelier trata los siguientes datos personales según el tipo de cuenta:</p>
          <div className="mt-3 space-y-3">
            <div>
              <h3 className="font-medium text-[--text]">Cuenta de compradora</h3>
              <ul className="mt-1 space-y-1 pl-4 text-[--text-muted]">
                <li>Nombre, dirección de correo electrónico y localidad (registro)</li>
                <li>Historial de compras y favoritos</li>
                <li>Mensajes intercambiados con artesanas/os</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-[--text]">Cuenta de artesana/o</h3>
              <ul className="mt-1 space-y-1 pl-4 text-[--text-muted]">
                <li>Nombre, correo electrónico y localidad (registro)</li>
                <li>Foto de perfil, banner y biografía (opcionales)</li>
                <li>Productos publicados, precios, imágenes y descripción</li>
                <li>Datos bancarios para cobros (gestionados por Stripe — no almacenados en Artelier)</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">3. Finalidades y base legal (RGPD art. 6)</h2>
          <div className="space-y-3">
            <div>
              <p className="font-medium">Ejecución del contrato (art. 6.1.b)</p>
              <p className="text-[--text-muted]">Gestión de la cuenta de usuario, procesamiento de compras, mensajería entre compradoras y artesanas/os, y emisión de facturas.</p>
            </div>
            <div>
              <p className="font-medium">Interés legítimo (art. 6.1.f)</p>
              <p className="text-[--text-muted]">Seguridad de la plataforma, prevención de fraude, detección de abusos y mejora del servicio.</p>
            </div>
            <div>
              <p className="font-medium">Consentimiento (art. 6.1.a)</p>
              <p className="text-[--text-muted]">Cookies analíticas o de marketing, si las hubiera. Puedes retirar el consentimiento en cualquier momento.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">4. Destinatarios de los datos</h2>
          <p>Artelier comparte datos únicamente con proveedores técnicos imprescindibles para el funcionamiento del servicio:</p>
          <ul className="mt-3 space-y-1 pl-4 text-[--text-muted]">
            <li>Stripe (procesamiento de pagos) — sus políticas están disponibles en stripe.com/es/privacy</li>
            <li>Cloudinary (almacenamiento de imágenes) — con acuerdo de encargado del tratamiento</li>
            <li>Resend (envío de correos transaccionales) — con acuerdo de encargado del tratamiento</li>
            <li>Vercel (infraestructura de servidor) — con acuerdo de encargado del tratamiento</li>
          </ul>
          <p className="mt-3">No se ceden datos a terceros con fines comerciales ni publicitarios.</p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">5. Conservación de datos</h2>
          <p>
            Los datos se conservan mientras la cuenta esté activa. Tras la baja, los datos se eliminan en un plazo máximo de 30 días, salvo obligación legal de conservación (p. ej., facturas durante 5 años por la Ley General Tributaria).
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">6. Tus derechos</h2>
          <p>Puedes ejercer en cualquier momento los siguientes derechos:</p>
          <ul className="mt-3 space-y-1 pl-4">
            <li><span className="font-medium">Acceso:</span> conocer qué datos tenemos sobre ti.</li>
            <li><span className="font-medium">Rectificación:</span> corregir datos inexactos.</li>
            <li><span className="font-medium">Supresión:</span> solicitar la eliminación de tus datos.</li>
            <li><span className="font-medium">Portabilidad:</span> recibir tus datos en formato estructurado.</li>
            <li><span className="font-medium">Oposición:</span> oponerte al tratamiento basado en interés legítimo.</li>
            <li><span className="font-medium">Limitación:</span> solicitar que se limite el uso de tus datos.</li>
          </ul>
          <p className="mt-3">
            Para ejercer tus derechos, escribe a <span className="font-medium">[PLACEHOLDER: privacidad@artelier.es]</span> indicando el derecho que deseas ejercer y adjuntando una copia de tu documento de identidad.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">7. Autoridad de control</h2>
          <p>
            Si consideras que el tratamiento de tus datos no es conforme al RGPD, puedes presentar una reclamación ante la Agencia Española de Protección de Datos en{" "}
            <a
              href="https://www.aepd.es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3d5a4f] underline hover:text-[#3d5a4f]/70"
            >
              aepd.es
            </a>.
          </p>
        </div>

      </section>
    </main>
  );
}
