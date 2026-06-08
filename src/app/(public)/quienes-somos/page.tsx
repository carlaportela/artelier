import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiénes somos — Artelier",
  description:
    "Artelier es un mercado de artesanía local que conecta artesanas y artesanos con personas que valoran lo hecho a mano.",
};

export default function QuienesSomosPage() {
  return (
    <main className="px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-[--text]">Quiénes somos</h1>

      <section className="mt-10 space-y-8 text-sm leading-relaxed text-[--text]">

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">Nuestra misión</h2>
          <p>
            Artelier nació para dar visibilidad a las artesanas y artesanos de proximidad — personas que crean con sus manos, con materiales locales y con técnicas transmitidas durante generaciones. Queremos que encontrar artesanía auténtica sea tan fácil como buscar en tu barrio.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">Qué hacemos</h2>
          <p>
            Somos un mercado en línea donde artesanas y artesanos publican sus productos y compradores/as los descubren, contactan directamente con quien los crea y los adquieren de forma segura. Cada compra apoya directamente a una persona que vive de su oficio.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">Por qué artesanía local</h2>
          <p>
            La artesanía local reduce la huella de transporte, mantiene vivos los oficios tradicionales y genera economía en el territorio. Cuando compras en Artelier, no solo llevas a casa un objeto único — también contribuyes a que esos oficios sigan existiendo.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">Sellos de confianza</h2>
          <p>
            Artelier verifica que los productos etiquetados como <span className="font-medium">Km 0</span> o <span className="font-medium">Ecológico</span> cumplen los criterios correspondientes. Los sellos de verificación son revisados por nuestro equipo antes de aparecer en el producto.
          </p>
        </div>

      </section>
    </main>
  );
}
