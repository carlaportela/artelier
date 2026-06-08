import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Condiciones de Uso — Artelier",
  description:
    "Condiciones generales de uso y venta de la plataforma Artelier para compradores y artesanas/os.",
};

export default function CondicionesPage() {
  return (
    <main className="px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-[--text]">Condiciones de Uso y Venta</h1>
      <p className="mt-1 mb-10 text-xs text-[--text-muted]">Última actualización: junio de 2026</p>

      <section className="space-y-8 text-sm leading-relaxed text-[--text]">

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">1. Objeto</h2>
          <p>
            Artelier es una plataforma que facilita la compraventa de productos de artesanía entre artesanas/os (vendedoras/es) y compradores/as. Artelier actúa como intermediario tecnológico y no es parte en los contratos de compraventa celebrados entre las usuarias.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">2. Partes</h2>
          <ul className="space-y-2 pl-4">
            <li><span className="font-medium">Artesana/o:</span> persona física o jurídica que publica y vende productos de artesanía a través de la plataforma.</li>
            <li><span className="font-medium">Compradora/or:</span> persona que adquiere productos a través de la plataforma.</li>
            <li><span className="font-medium">Artelier:</span> titular de la plataforma, que proporciona el servicio de intermediación tecnológica.</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">3. Proceso de compra</h2>
          <p>El proceso de compra sigue estos pasos:</p>
          <ol className="mt-3 space-y-1 pl-4 list-decimal list-inside">
            <li>La compradora selecciona el producto y lo añade al carrito.</li>
            <li>Elige el método de entrega (envío o recogida si está disponible).</li>
            <li>Confirma el pedido y realiza el pago a través de Stripe.</li>
            <li>La artesana/o recibe la notificación y prepara el pedido.</li>
            <li>El importe queda retenido hasta la confirmación de entrega.</li>
          </ol>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">4. Precios e IVA</h2>
          <p>
            Los precios mostrados en la plataforma incluyen el IVA aplicable según la legislación española. Artelier se reserva el derecho de modificar los precios de las comisiones de servicio con previo aviso a las artesanas/os.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">5. Entrega y plazos</h2>
          <p>
            Los plazos y métodos de entrega los fija cada artesana/o en su perfil. Artelier no es responsable de los retrasos derivados de causas ajenas a su control (transportistas, fuerza mayor, etc.).
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">6. Derecho de desistimiento</h2>
          <p>
            De acuerdo con el Real Decreto Legislativo 1/2007 (TRLGDCU), la compradora dispone de <span className="font-medium">14 días naturales</span> desde la recepción del pedido para ejercer el derecho de desistimiento sin necesidad de justificación.
          </p>
          <p className="mt-3">
            <span className="font-medium">Excepciones:</span> quedan excluidos del derecho de desistimiento los productos fabricados a medida o personalizados, y los productos perecederos (alimentación, cosmética natural) que por su naturaleza no puedan ser devueltos.
          </p>
          <p className="mt-3">
            Para ejercer el desistimiento, la compradora debe comunicarlo a la artesana/o a través de la plataforma dentro del plazo indicado. Los gastos de devolución corren a cargo de la compradora salvo acuerdo en contrario.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">7. Garantías</h2>
          <p>
            Los productos vendidos a través de Artelier disponen de las garantías legales establecidas por la normativa española de consumo. En caso de producto defectuoso, la compradora puede solicitar la reparación, sustitución, rebaja del precio o resolución del contrato según corresponda.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">8. Resolución de disputas</h2>
          <p>
            Ante cualquier incidencia con un pedido, la compradora puede abrir una disputa desde su cuenta. Artelier actuará como mediador entre las partes para facilitar una solución. Si la disputa no se resuelve internamente, las partes pueden acudir a la plataforma europea de resolución de litigios en línea (ODR) disponible en{" "}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3d5a4f] underline hover:text-[#3d5a4f]/70"
            >
              ec.europa.eu/consumers/odr
            </a>.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-[--text]">9. Legislación aplicable</h2>
          <p>
            Las presentes condiciones se rigen por la legislación española. Para cualquier controversia no resuelta por los mecanismos anteriores, las partes se someten a los juzgados y tribunales competentes conforme a la normativa de consumo aplicable.
          </p>
        </div>

      </section>
    </main>
  );
}
