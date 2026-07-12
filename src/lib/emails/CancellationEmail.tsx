// Template del correo de cancelación de pedido para la compradora.

import { Text, Button, Section, Row, Column, Img, Link } from "@react-email/components";
import EmailLayout from "./EmailLayout";
import { textDark, green, muted, fontBody, fontDisplay } from "./tokens";

interface Props {
  buyerName: string;
  orderId: string;
  productName: string;
  productImageUrl: string | null;
  cancellationReason: string | null;
  totalInCents: number;
}

export default function CancellationEmail({
  buyerName,
  orderId,
  productName,
  productImageUrl,
  cancellationReason,
  totalInCents,
}: Props) {
  const fmt = (cents: number) =>
    (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  const reason = cancellationReason ?? "La artesana no ha confirmado el pedido dentro del plazo indicado.";
  return (
    <EmailLayout>

      {/* Saludo */}
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "15px", margin: "0 0 16px 0" }}>
        Hola{buyerName ? ` ${buyerName}` : ""}:
      </Text>
      <Text style={{ fontFamily: fontDisplay, color: green, fontSize: "22px", fontWeight: "700", margin: "0 0 12px 0" }}>
        ¡Tu pedido ha sido cancelado!
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 8px 0" }}>
        Lamentamos informarte de que tu pedido ha sido cancelado.
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 20px 0" }}>
        Si realizaste el pago, el importe será reembolsado automáticamente en un plazo de <strong style={{ fontFamily: fontBody }}>5 a 7 días hábiles</strong> a través del mismo método de pago utilizado.
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

        {/* Importe */}
        <div style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 12px 0" }} />
        <Row style={{ marginBottom: "6px" }}>
          <Column>
            <Text style={{ fontFamily: fontBody, color: muted, fontSize: "13px", margin: 0 }}>Importe pagado</Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "13px", margin: 0 }}>{fmt(totalInCents)}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={{ fontFamily: fontBody, color: muted, fontSize: "13px", margin: 0 }}>Importe a reembolsar</Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text style={{ fontFamily: fontBody, color: green, fontSize: "13px", fontWeight: "700", margin: 0 }}>{fmt(totalInCents)}</Text>
          </Column>
        </Row>

        {/* Motivo */}
        <div style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 12px 0" }} />
        <Text style={{ fontFamily: fontBody, color: muted, fontSize: "13px", margin: "0 0 4px 0" }}>
          Motivo de cancelación
        </Text>
        <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "13px", margin: 0 }}>
          {reason}
        </Text>

        {/* Botón */}
        <div style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 0 0" }} />
        <Row style={{ marginTop: "16px" }}>
          <Column style={{ textAlign: "right" }}>
            <Button
              href={`https://artelier.es/orders/${orderId}`}
              style={{ backgroundColor: green, color: "#fff", borderRadius: "999px", padding: "12px 24px", fontSize: "14px", fontFamily: fontBody, display: "inline-block" }}
            >
              Ver pedido
            </Button>
          </Column>
        </Row>

      </Section>


    </EmailLayout>
  );
}
