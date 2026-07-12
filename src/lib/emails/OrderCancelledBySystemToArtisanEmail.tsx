// Template del correo de cancelación automática por incumplimiento de plazo, dirigido a la artesana.

import { Text, Button, Section, Row, Column, Img, Link } from "@react-email/components";
import EmailLayout from "./EmailLayout";
import { textDark, green, muted, fontBody, fontDisplay } from "./tokens";

interface Props {
  artisanName: string;
  orderId: string;
  productName: string;
  productImageUrl: string | null;
  penaltyInCents: number;
}

const fmt = (cents: number) =>
  (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

export default function OrderCancelledBySystemToArtisanEmail({
  artisanName,
  orderId,
  productName,
  productImageUrl,
  penaltyInCents,
}: Props) {
  return (
    <EmailLayout>

      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "15px", margin: "0 0 16px 0" }}>
        Hola{artisanName ? ` ${artisanName}` : ""}:
      </Text>
      <Text style={{ fontFamily: fontDisplay, color: green, fontSize: "22px", fontWeight: "700", margin: "0 0 12px 0" }}>
        Tu pedido se ha cancelado automáticamente
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 8px 0" }}>
        No confirmaste el envío ni marcaste el pedido como listo para recogida dentro del plazo de 5 días, así que el sistema lo ha cancelado y hemos iniciado el reembolso a la compradora.
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 20px 0" }}>
        Como consecuencia, se ha aplicado una penalización que se descontará de tu próxima liquidación.
      </Text>

      {/* Card */}
      <Section style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        border: "1px solid #e0dbd0",
        padding: "16px",
        marginBottom: "20px",
      }}>

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
            <Text style={{ fontFamily: fontBody, color: muted, fontSize: "13px", margin: "0 0 1px 0" }}>
              Número de pedido
            </Text>
            <Text style={{ fontFamily: "monospace", color: textDark, fontSize: "13px", margin: "0 0 10px 0" }}>
              {orderId}
            </Text>
            <Text style={{ fontFamily: fontBody, color: muted, fontSize: "13px", margin: "0 0 1px 0" }}>
              Producto
            </Text>
            <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "13px", fontWeight: "600", margin: 0 }}>
              {productName}
            </Text>
          </Column>
        </Row>

        <div style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 12px 0" }} />
        <Row>
          <Column>
            <Text style={{ fontFamily: fontBody, color: muted, fontSize: "13px", margin: 0 }}>
              Penalización aplicada
            </Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text style={{ fontFamily: fontBody, color: "#b45309", fontSize: "13px", fontWeight: "700", margin: 0 }}>
              {fmt(penaltyInCents)}
            </Text>
          </Column>
        </Row>

        <div style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 0 0" }} />
        <Row style={{ marginTop: "16px" }}>
          <Column style={{ textAlign: "right" }}>
            <Button
              href="https://artelier.es/studio/orders"
              style={{ backgroundColor: green, color: "#fff", borderRadius: "999px", padding: "12px 24px", fontSize: "14px", fontFamily: fontBody, display: "inline-block" }}
            >
              Ver mis pedidos
            </Button>
          </Column>
        </Row>

      </Section>

    </EmailLayout>
  );
}
