// Template del correo de cancelación de pedido por la compradora, dirigido a la artesana.

import { Text, Button, Section, Row, Column, Img, Link } from "@react-email/components";
import EmailLayout from "./EmailLayout";
import { textDark, green, muted, fontBody, fontDisplay } from "./tokens";

interface Props {
  artisanName: string;
  orderId: string;
  productName: string;
  productImageUrl: string | null;
  buyerName: string;
  cancellationReason: string | null;
}

export default function OrderCancelledByBuyerEmail({
  artisanName,
  orderId,
  productName,
  productImageUrl,
  buyerName,
  cancellationReason,
}: Props) {
  const reason = cancellationReason ?? "A petición de la compradora.";
  return (
    <EmailLayout>

      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "15px", margin: "0 0 16px 0" }}>
        Hola{artisanName ? ` ${artisanName}` : ""}:
      </Text>
      <Text style={{ fontFamily: fontDisplay, color: green, fontSize: "22px", fontWeight: "700", margin: "0 0 12px 0" }}>
        ¡Tu pedido ha sido cancelado!
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 8px 0" }}>
        Lamentamos informarte de que {buyerName ?? "la compradora"} ha cancelado su pedido por lo que ya no es necesario que lo prepares ni lo envíes.
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 8px 0" }}>
        Pero no te desanimes. Aunque esta venta no se haya completado, el producto ya vuelve a estar disponible en tu estudio y pronto encontrará un nuevo hogar.
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 20px 0" }}>
       Mientras tanto, aquí tienes los detalles del pedido cancelado:
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
              Identificador de pedido
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
        <Text style={{ fontFamily: fontBody, color: muted, fontSize: "13px", margin: "0 0 1px 0" }}>
          Motivo de cancelación
        </Text>
        <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "13px", margin: 0 }}>
          {reason}
        </Text>

        <div style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 0 0" }} />
        <Row style={{ marginTop: "16px" }}>
          <Column style={{ textAlign: "right" }}>
            <Button
              href={`https://artelier.es/studio/orders/${orderId}`}
              style={{ backgroundColor: green, color: "#fff", borderRadius: "999px", padding: "12px 24px", fontSize: "14px", fontFamily: fontBody, display: "inline-block" }}
            >
              Ver pedido
            </Button>
          </Column>
        </Row>
        <Text style={{ fontFamily: fontBody, color: "#9ca3af", fontSize: "11px", textAlign: "right", margin: "8px 0 0 0" }}>
          Recuerda que un pedido puede ser cancelado por la compradora durante un plazo de 24 horas a su realización.
        </Text>

      </Section>

      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 20px 0" }}>
        Puedes gestionar tus pedidos desde la sección{" "}
        <Link href="https://artelier.es/studio/orders" style={{ color: green, fontFamily: fontBody }}>Mis pedidos</Link>
        {" "}de tu estudio.
      </Text>

    </EmailLayout>
  );
}
