// Template del correo de aceptación de pedido para la compradora.

import { Text, Button, Section, Row, Column, Img, Link } from "@react-email/components";
import EmailLayout from "./EmailLayout";
import { textDark, green, muted, fontBody, fontDisplay } from "./tokens";

interface Props {
  buyerName: string;
  orderId: string;
  productName: string;
  productImageUrl: string | null;
  artisanName: string;
}

export default function OrderAcceptedEmail({
  buyerName,
  orderId,
  productName,
  productImageUrl,
  artisanName,
}: Props) {
  return (
    <EmailLayout>

      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "15px", margin: "0 0 16px 0" }}>
        Hola{buyerName ? ` ${buyerName}` : ""}:
      </Text>
      <Text style={{ fontFamily: fontDisplay, color: green, fontSize: "22px", fontWeight: "700", margin: "0 0 12px 0" }}>
        ¡Tu pedido ha sido aceptado!
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 8px 0" }}>
        {artisanName ?? "La artesana"} ha aceptado tu pedido y ya se ha puesto manos a la obra.
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 20px 0" }}>
        Te avisaremos de nuevo cuando el pedido avance de estado.
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

        <div style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 0 0" }} />
        <Row style={{ marginTop: "16px" }}>
          <Column style={{ textAlign: "right" }}>
            <Button
              href={`https://artelier.es/orders/${orderId}`}
              style={{ backgroundColor: green, color: "#fff", borderRadius: "999px", padding: "12px 24px", fontSize: "14px", fontFamily: fontBody, display: "inline-block" }}
            >
              Ver mi pedido
            </Button>
          </Column>
        </Row>

      </Section>

    </EmailLayout>
  );
}
