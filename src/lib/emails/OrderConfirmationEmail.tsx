//Template del correo de confirmación de pedido para la compradora.

import { Text, Button, Section, Row, Column, Img, Link } from "@react-email/components";
import EmailLayout from "./EmailLayout";
import { textDark, green, muted, fontBody, fontDisplay } from "./tokens";

interface Props {
  orderId: string;
  productName: string;
  productImageUrl: string | null;
  artisanName: string;
  buyerName: string;
  priceInCents: number;
  shippingCostInCents: number;
  insuranceFeeInCents: number;
  stripeFeeInCents: number;
  totalInCents: number;
}

const fmt = (cents: number) =>
  (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

export default function OrderConfirmationEmail({
  orderId,
  productName,
  productImageUrl,
  artisanName,
  buyerName,
  priceInCents,
  shippingCostInCents,
  insuranceFeeInCents,
  stripeFeeInCents,
  totalInCents,
}: Props) {
  return (
    <EmailLayout>

      {/* Saludo */}
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "15px", margin: "0 0 16px 0" }}>
        Hola {buyerName}:
      </Text>
      <Text style={{ fontFamily: fontDisplay, color: green, fontSize: "22px", fontWeight: "700", margin: "0 0 12px 0" }}>
        ¡Gracias por comprar en Artelier!
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 4px 0" }}>
        {artisanName} ha confirmado tu pedido y lo está preparando con mucho mimo en estos momentos.
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 4px 0" }}>
        Te informaremos de nuevo cuando el pedido esté listo.
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 20px 0" }}>
        Mientras tanto, aquí tienes el resumen de tu pedido:
      </Text>

      {/* Card */}
      <Section style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        border: "1px solid #e0dbd0",
        padding: "16px",
        marginBottom: "20px",
      }}>

        {/* Imagen + datos básicos */}
        <Row>
          <Column style={{ width: "88px", verticalAlign: "top" }}>
            {productImageUrl ? (
              <Link href={productImageUrl}>
                <Img
                  src={productImageUrl}
                  width="76"
                  height="76"
                  alt={productName}
                  style={{ borderRadius: "8px", objectFit: "cover", display: "block" }}
                />
              </Link>
            ) : (
              <div style={{ width: 76, height: 76, backgroundColor: "#f0ece6", borderRadius: "8px" }} />
            )}
          </Column>

          <Column style={{ verticalAlign: "top", paddingLeft: "8px" }}>
            <Text style={{ fontFamily: fontBody, color: muted, fontSize: "11px", margin: "0 0 1px 0" }}>
              Número de pedido
            </Text>
            <Text style={{ fontFamily: "monospace", color: muted, fontSize: "11px", margin: "0 0 10px 0" }}>
              {orderId}
            </Text>
            <Text style={{ fontFamily: fontBody, color: muted, fontSize: "11px", margin: "0 0 1px 0" }}>
              Producto
            </Text>
            <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "13px", fontWeight: "600", margin: 0 }}>
              {productName}
            </Text>
          </Column>
        </Row>

        {/* Separador */}
        <div style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 12px 0" }} />

        {/* Desglose de precios */}
        <Row style={{ marginBottom: "6px" }}>
          <Column>
            <Text style={{ fontFamily: fontBody, color: muted, fontSize: "12px", margin: 0 }}>Precio</Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "12px", margin: 0 }}>{fmt(priceInCents)}</Text>
          </Column>
        </Row>
        <Row style={{ marginBottom: "6px" }}>
          <Column>
            <Text style={{ fontFamily: fontBody, color: muted, fontSize: "12px", margin: 0 }}>Gastos de envío</Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "12px", margin: 0 }}>{fmt(shippingCostInCents)}</Text>
          </Column>
        </Row>
        <Row style={{ marginBottom: "6px" }}>
          <Column>
            <Text style={{ fontFamily: fontBody, color: muted, fontSize: "12px", margin: 0 }}>Seguro de la plataforma</Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text style={{ fontFamily: fontBody, color: muted, fontSize: "12px", margin: 0 }}>{fmt(insuranceFeeInCents)}</Text>
          </Column>
        </Row>
        <Row style={{ marginBottom: "10px" }}>
          <Column>
            <Text style={{ fontFamily: fontBody, color: muted, fontSize: "12px", margin: 0 }}>Pasarela de pago</Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text style={{ fontFamily: fontBody, color: muted, fontSize: "12px", margin: 0 }}>{fmt(stripeFeeInCents)}</Text>
          </Column>
        </Row>

        {/* Total */}
        <div style={{ borderTop: "1px solid #e0dbd0", paddingTop: "10px", marginBottom: "16px" }}>
          <Row>
            <Column>
              <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", fontWeight: "700", margin: 0 }}>Total</Text>
            </Column>
            <Column style={{ textAlign: "right" }}>
              <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", fontWeight: "700", margin: 0 }}>{fmt(totalInCents)}</Text>
            </Column>
          </Row>
        </div>

        {/* Botones inline dentro del card alineados a la derecha */}
        <Row>
          <Column style={{ textAlign: "right" }}>
            <Button
              href={`https://artelier.es/orders/${orderId}`}
              style={{ backgroundColor: green, color: "#fff", borderRadius: "999px", padding: "12px 24px", fontSize: "14px", fontFamily: fontBody, display: "inline-block", marginRight: "8px" }}
            >
              Ver mi pedido
            </Button>
            <Button
              href={`https://artelier.es/orders/${orderId}`}
              style={{ backgroundColor: "transparent", color: muted, borderRadius: "999px", padding: "12px 24px", fontSize: "14px", fontFamily: fontBody, display: "inline-block", border: "1px solid #e0dbd0" }}
            >
              Cancelar pedido
            </Button>
          </Column>
        </Row>
        <Text style={{ fontFamily: fontBody, color: "#9ca3af", fontSize: "10px", textAlign: "right", margin: "8px 0 0 0" }}>
          Puedes cancelar tu pedido en un plazo de 24 horas desde la confirmación de compra.
        </Text>

      </Section>

      {/* Firma */}
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "13px", margin: "20px 0 0 0" }}>
        Atentamente,<br />
        El equipo de Artelier
      </Text>

    </EmailLayout>
  );
}
