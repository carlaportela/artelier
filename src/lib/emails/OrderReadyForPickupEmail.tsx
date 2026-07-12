// Template del correo de pedido listo para recogida, dirigido a la compradora.

import { Text, Button, Section, Row, Column, Img, Link } from "@react-email/components";
import EmailLayout from "./EmailLayout";
import { textDark, green, muted, fontBody, fontDisplay } from "./tokens";

interface Props {
  buyerName: string;
  orderId: string;
  productName: string;
  productImageUrl: string | null;
  artisanName: string;
  pickupAddress: string;
  pickupSchedule: string | null;
}

export default function OrderReadyForPickupEmail({
  buyerName,
  orderId,
  productName,
  productImageUrl,
  artisanName,
  pickupAddress,
  pickupSchedule,
}: Props) {
  return (
    <EmailLayout>

      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "15px", margin: "0 0 16px 0" }}>
        Hola{buyerName ? ` ${buyerName}` : ""}:
      </Text>
      <Text style={{ fontFamily: fontDisplay, color: green, fontSize: "22px", fontWeight: "700", margin: "0 0 12px 0" }}>
        ¡Tu pedido está listo para recoger!
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 8px 0" }}>
        {artisanName ?? "La artesana"} ha preparado tu pedido y ya puedes pasar a recogerlo.
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 20px 0" }}>
        Aquí tienes los detalles para la recogida:
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

        {/* Datos de recogida */}
        <div style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 12px 0" }} />
        <Text style={{ fontFamily: fontBody, color: muted, fontSize: "13px", margin: "0 0 1px 0" }}>
          Dirección de recogida
        </Text>
        <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "13px", fontWeight: "600", margin: "0 0 10px 0" }}>
          {pickupAddress}
        </Text>
        {pickupSchedule && (
          <>
            <Text style={{ fontFamily: fontBody, color: muted, fontSize: "13px", margin: "0 0 1px 0" }}>
              Horario de recogida
            </Text>
            <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "13px", margin: 0 }}>
              {pickupSchedule}
            </Text>
          </>
        )}

        <div style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 0 0" }} />
        <Row style={{ marginTop: "16px" }}>
          <Column style={{ textAlign: "right" }}>
            <Button
              href={`https://artelier.es/orders/${orderId}`}
              style={{ backgroundColor: green, color: "#fff", borderRadius: "999px", padding: "12px 24px", fontSize: "14px", fontFamily: fontBody, display: "inline-block" }}
            >
              Confirmar recogida
            </Button>
          </Column>
        </Row>
        <Text style={{ fontFamily: fontBody, color: "#9ca3af", fontSize: "11px", textAlign: "right", margin: "8px 0 0 0" }}>
          Recuerda confirmar la recogida en el momento en el que la artesana te entrega el pedido para verificar tu identidad.
        </Text>

      </Section>


    </EmailLayout>
  );
}
