import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto — Artelier",
  description:
    "Ponte en contacto con el equipo de Artelier para dudas, incidencias o colaboraciones.",
};

const CONTACTOS = [
  {
    titulo: "Atención a compradores/as",
    descripcion: "Para dudas sobre pedidos, devoluciones o incidencias con una compra:",
    email: "compradores@artelier.es",
  },
  {
    titulo: "Artesanas y artesanos",
    descripcion: "Para consultas sobre cómo vender en la plataforma, sellos de verificación o gestión de tu tienda:",
    email: "artesanas@artelier.es",
  },
  {
    titulo: "Asuntos legales y privacidad",
    descripcion: "Para ejercer tus derechos RGPD o consultas relacionadas con la privacidad y los avisos legales:",
    email: "legal@artelier.es",
  },
  {
    titulo: "Colaboraciones y prensa",
    descripcion: "Para propuestas de colaboración, prensa o eventos:",
    email: "holi@artelier.es",
  },
] as const;

export default function ContactoPage() {
  return (
    <main className="px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-[--text]">Contacto</h1>
      <p className="mt-2 mb-10 text-sm text-[--text-muted]">
        Estamos aquí para ayudarte. Escríbenos y te respondemos en menos de 48 horas.
      </p>

      <section className="space-y-8 text-sm leading-relaxed text-[--text]">
        {CONTACTOS.map(({ titulo, descripcion, email }) => (
          <div key={email}>
            <h2 className="mb-3 text-base font-semibold text-[--text]">{titulo}</h2>
            <p className="text-[--text-muted]">{descripcion}</p>
            <a
              href={`mailto:${email}`}
              className="mt-2 inline-block font-medium text-[#3d5a4f] hover:text-[#3d5a4f]/70 transition-colors"
            >
              {email}
            </a>
          </div>
        ))}
      </section>
    </main>
  );
}
