// Template del correo de primera venta para la artesana.

import { Text, Button, Section, Row, Column, Img, Link } from "@react-email/components";
import EmailLayout from "./EmailLayout";
import { textDark, green, muted, fontBody, fontDisplay } from "./tokens";

interface Props {
  artisanName: string;
  orderId: string;
  productName: string;
  productImageUrl: string | null;
  buyerName: string;
  buyerLastName: string | null;
  street: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  shippingMethod: string;
  shippingLabelUrl: string | null;
  netEarningsInCents: number;
}

const fmt = (cents: number) =>
  (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

export default function FirstSaleEmail({
  artisanName,
  orderId,
  productName,
  productImageUrl,
  buyerName,
  buyerLastName,
  street,
  city,
  province,
  postalCode,
  shippingMethod,
  shippingLabelUrl,
  netEarningsInCents,
}: Props) {
  const buyerFullName = [buyerName, buyerLastName].filter(Boolean).join(" ");
  const cityLine = [postalCode, city, province].filter(Boolean).join(", ");

  return (
    <EmailLayout>

      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "15px", margin: "0 0 16px 0" }}>
        Hola{artisanName ? ` ${artisanName}` : ""}:
      </Text>
      <Text style={{ fontFamily: fontDisplay, color: green, fontSize: "22px", fontWeight: "700", margin: "0 0 12px 0" }}>
        ¡Enhorabuena, has vendido tu primer producto!
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 8px 0" }}>
        Este es un momento muy especial. Alguien ha elegido tu trabajo de entre todo lo que ofrecen otras artesanas, y eso dice mucho de lo que creas.
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 20px 0" }}>
        {buyerName || "Una compradora"} ha comprado uno de tus productos. 
      </Text>

      {/* Pasos */}
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 12px 0" }}>
        <strong style={{ fontFamily: fontBody }}>¡Ahora toca ponerse manos a la obra!</strong><br />Realiza los siguiente pasos para completar tu primera venta con éxito:
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 8px 0", paddingLeft: "16px" }}>
        <strong style={{ fontFamily: fontBody }}>1. Acepta o rechaza el pedido</strong><br />
        Tienes <strong style={{ fontFamily: fontBody }}>24 horas</strong> desde la compra para decidir. Si no respondes a tiempo, el pedido se cancelará automáticamente y se aplicará una penalización.
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 8px 0", paddingLeft: "16px" }}>
        <strong style={{ fontFamily: fontBody }}>2. Prepara tu creación</strong><br />
        Envuélvela con cariño, que va a hacer a alguien muy feliz.
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 8px 0", paddingLeft: "16px" }}>
        <strong style={{ fontFamily: fontBody }}>3. Envía o confirma que el pedido está listo para la recogida</strong><br />
        Tienes <strong style={{ fontFamily: fontBody }}>5 días</strong> desde que aceptas el pedido para confirmar el envío o marcar el pedido como listo para recogida (según el método elegido por la compradora).
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 20px 0", paddingLeft: "16px" }}>
        <strong style={{ fontFamily: fontBody }}>4. ¡Recibe tu dinero!</strong><br />
        Cuando la compradora confirme que ha recibido el pedido o lo ha recogido, recibirás el importe de la venta.
      </Text>

      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 8px 0" }}>
        Aquí tienes los detalles del pedido:
      </Text>

      {/* Card */}
      <Section style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        border: "1px solid #e0dbd0",
        padding: "16px",
        marginBottom: "20px",
        marginTop: "20px",
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

        {/* Datos de envío */}
        <div style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 12px 0" }} />
        <Text style={{ fontFamily: fontBody, color: muted, fontSize: "13px", margin: "0 0 2px 0" }}>
          Método de envío
        </Text>
        <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "13px", fontWeight: "600", margin: "0 0 12px 0" }}>
          {shippingMethod}
        </Text>
        <Text style={{ fontFamily: fontBody, color: muted, fontSize: "13px", margin: "0 0 6px 0" }}>
          Datos de envío
        </Text>
        <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "13px", fontWeight: "600", margin: "0 0 2px 0" }}>
          {buyerFullName}
        </Text>
        {street && (
          <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "13px", margin: "0 0 2px 0" }}>
            {street}
          </Text>
        )}
        {cityLine && (
          <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "13px", margin: 0 }}>
            {cityLine}
          </Text>
        )}

        {/* Etiqueta de envío */}
        {shippingLabelUrl && (
          <>
            <div style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 12px 0" }} />
            <Text style={{ fontFamily: fontBody, color: muted, fontSize: "13px", margin: "0 0 8px 0" }}>
              Etiqueta de envío
            </Text>
            <Img src={shippingLabelUrl} alt="Código de envío" style={{ maxWidth: "200px", display: "block" }} />
          </>
        )}

        {/* Ganancia */}
        <div style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 12px 0" }} />
        <div style={{ paddingTop: "4px", marginBottom: "16px" }}>
          <Row>
            <Column>
              <Text style={{ fontFamily: fontBody, color: green, fontSize: "14px", fontWeight: "700", margin: 0 }}>
                Has ganado
              </Text>
            </Column>
            <Column style={{ textAlign: "right" }}>
              <Text style={{ fontFamily: fontBody, color: green, fontSize: "14px", fontWeight: "700", margin: 0 }}>
                {fmt(netEarningsInCents)}
              </Text>
            </Column>
          </Row>
        </div>

        {/* Botón */}
        <Row>
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
          Recuerda que dispones de <strong style={{ fontFamily: fontBody }}>24 horas</strong> para aceptar o rechazar este pedido.<br />Si no respondes a tiempo, el pedido se cancelará automáticamente y se aplicará una penalización.
        </Text>

      </Section>

      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 20px 0" }}>
        Si necesitas gestionar tus pedidos, puedes acceder a la sección{" "}
        <Link href="https://artelier.es/studio/orders" style={{ color: green, fontFamily: fontBody }}>Mis pedidos</Link>
        {" "}de tu estudio.
      </Text>

    </EmailLayout>
  );
}
