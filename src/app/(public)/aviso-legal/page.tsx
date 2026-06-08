//Página de aviso legal del footer de Artelier.

import type { Metadata } from "next"; //Tipo de Next.js para definir lo que aparece en el <head> del HTML (usado por navegadores).

export const metadata: Metadata = {
  title: "Aviso Legal — Artelier",
  description:
    "Información legal del titular de la plataforma Artelier: identificación, condiciones de uso y propiedad intelectual.",
};

export default function AvisoLegalPage() {
  return (
    <main className="px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-[--text]">Aviso Legal</h1>
      <p className="mt-1 mb-10 text-xs text-[--text-muted]">Última actualización: junio de 2026</p>

      <section className="space-y-8 text-sm leading-relaxed text-[--text]">

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">1. Datos identificativos</h2>
          <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se informa:</p>
          <ul className="mt-3 space-y-1 pl-4">
            <li><span className="font-medium">Titular:</span> Maldita Carlita </li>
            <li><span className="font-medium">CIF/NIF:</span> B-XXXXXXXX </li>
            <li><span className="font-medium">Domicilio:</span> 36955, Moaña, Pontevedra </li>
            <li><span className="font-medium">Correo electrónico:</span> legal@artelier.es </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">2. Objeto y ámbito de aplicación</h2>
          <p>
            Artelier es una plataforma de comercio electrónico que conecta artesanas y artesanos con personas interesadas en adquirir productos de artesanía local. El acceso y uso de este sitio web implica la aceptación plena de las presentes condiciones legales.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">3. Propiedad intelectual e industrial</h2>
          <p>
            Los contenidos de este sitio web —textos, imágenes, logotipos, diseños, código fuente y demás elementos— son propiedad de Artelier o de sus respectivos titulares, y están protegidos por la legislación española e internacional sobre propiedad intelectual e industrial.
          </p>
          <p className="mt-3">
            Queda prohibida su reproducción, distribución, comunicación pública o transformación sin autorización expresa. Los contenidos publicados por artesanas y artesanos son responsabilidad de sus respectivos autores/as.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">4. Condiciones de uso</h2>
          <p>
            La usuaria se compromete a hacer un uso lícito de la plataforma, absteniéndose de publicar contenidos falsos, ofensivos o que infrinjan derechos de terceros. Artelier se reserva el derecho de suspender cuentas que incumplan estas condiciones.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">5. Exclusión de responsabilidad</h2>
          <p>
            Artelier actúa como intermediario tecnológico entre compradoras y artesanas/os. No es parte en los contratos de compraventa y no responde por el incumplimiento de las obligaciones entre las partes, salvo en los supuestos establecidos por la normativa aplicable.
          </p>
          <p className="mt-3">
            Artelier no garantiza la disponibilidad continua del servicio y no será responsable de los daños derivados de interrupciones técnicas ajenas a su control.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">6. Legislación aplicable y jurisdicción</h2>
          <p>
            Las presentes condiciones se rigen por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los juzgados y tribunales del domicilio del titular, salvo que la normativa de consumo aplicable disponga otro fuero en favor de la usuaria.
          </p>
        </div>

      </section>
    </main>
  );
}
