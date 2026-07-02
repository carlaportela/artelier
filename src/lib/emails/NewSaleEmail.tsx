// Template del correo de nueva venta para la artesana.

import {
  Text,
  Button,
  Section,
  Row,
  Column,
  Img,
  Link,
} from "@react-email/components";
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

export default function NewSaleEmail({
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
      {/* Saludo */}
      <Text
        style={{
          fontFamily: fontBody,
          color: textDark,
          fontSize: "15px",
          margin: "0 0 16px 0",
        }}
      >
        Hola{artisanName ? ` ${artisanName}` : ""}:
      </Text>
      <Text
        style={{
          fontFamily: fontDisplay,
          color: green,
          fontSize: "22px",
          fontWeight: "700",
          margin: "0 0 12px 0",
        }}
      >
        ¡Tienes un nuevo pedido!
      </Text>
      <Text
        style={{
          fontFamily: fontBody,
          color: textDark,
          fontSize: "14px",
          margin: "0 0 8px 0",
        }}
      >
        {buyerName} ha comprado uno de tus productos. Aquí tienes los detalles
        del pedido:
      </Text>

      {/* Card */}
      <Section
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #e0dbd0",
          padding: "16px",
          marginBottom: "20px",
          marginTop: "20px",
        }}
      >
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
                  style={{
                    borderRadius: "8px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Link>
            ) : (
              <div
                style={{
                  width: 76,
                  height: 76,
                  backgroundColor: "#f0ece6",
                  borderRadius: "8px",
                }}
              />
            )}
          </Column>

          <Column style={{ verticalAlign: "top", paddingLeft: "8px" }}>
            <Text
              style={{
                fontFamily: fontBody,
                color: muted,
                fontSize: "13px",
                margin: "0 0 1px 0",
              }}
            >
              Número de pedido
            </Text>
            <Text
              style={{
                fontFamily: "monospace",
                color: textDark,
                fontSize: "13px",
                margin: "0 0 10px 0",
              }}
            >
              {orderId}
            </Text>
            <Text
              style={{
                fontFamily: fontBody,
                color: muted,
                fontSize: "13px",
                margin: "0 0 1px 0",
              }}
            >
              Producto
            </Text>
            <Text
              style={{
                fontFamily: fontBody,
                color: textDark,
                fontSize: "13px",
                fontWeight: "600",
                margin: 0,
              }}
            >
              {productName}
            </Text>
          </Column>
        </Row>

        {/* Datos de envío */}
        <div
          style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 12px 0" }}
        />
        <Text
          style={{
            fontFamily: fontBody,
            color: muted,
            fontSize: "13px",
            margin: "0 0 2px 0",
          }}
        >
          Método de envío
        </Text>
        <Text
          style={{
            fontFamily: fontBody,
            color: textDark,
            fontSize: "13px",
            fontWeight: "600",
            margin: "0 0 12px 0",
          }}
        >
          {shippingMethod}
        </Text>
        <Text
          style={{
            fontFamily: fontBody,
            color: muted,
            fontSize: "13px",
            margin: "0 0 6px 0",
          }}
        >
          Datos de envío
        </Text>
        <Text
          style={{
            fontFamily: fontBody,
            color: textDark,
            fontSize: "13px",
            fontWeight: "600",
            margin: "0 0 2px 0",
          }}
        >
          {buyerFullName}
        </Text>
        {street && (
          <Text
            style={{
              fontFamily: fontBody,
              color: textDark,
              fontSize: "13px",
              margin: "0 0 2px 0",
            }}
          >
            {street}
          </Text>
        )}
        {cityLine && (
          <Text
            style={{
              fontFamily: fontBody,
              color: textDark,
              fontSize: "13px",
              margin: 0,
            }}
          >
            {cityLine}
          </Text>
        )}

        {/* Etiqueta de envío (solo si viene del envío a través de la plataforma) */}
        {shippingLabelUrl && (
          <>
            <div
              style={{
                borderTop: "1px solid #e0dbd0",
                margin: "16px 0 12px 0",
              }}
            />
            <Text
              style={{
                fontFamily: fontBody,
                color: muted,
                fontSize: "13px",
                margin: "0 0 8px 0",
              }}
            >
              Etiqueta de envío
            </Text>
            <Img
              src={shippingLabelUrl}
              alt="Código de envío"
              style={{ maxWidth: "200px", display: "block" }}
            />
          </>
        )}

        {/* Desglose de ingresos */}
        <div
          style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 12px 0" }}
        />
        {/* Ganancia neta */}
        <div
          style={{
            paddingTop: "4px",
            marginBottom: "16px",
          }}
        >
          <Row>
            <Column>
              <Text
                style={{
                  fontFamily: fontBody,
                  color: green,
                  fontSize: "14px",
                  fontWeight: "700",
                  margin: 0,
                }}
              >
                Has ganado
              </Text>
            </Column>
            <Column style={{ textAlign: "right" }}>
              <Text
                style={{
                  fontFamily: fontBody,
                  color: green,
                  fontSize: "14px",
                  fontWeight: "700",
                  margin: 0,
                }}
              >
                {fmt(netEarningsInCents)}
              </Text>
            </Column>
          </Row>
        </div>

        {/* Botones */}
        <Row>
          <Column style={{ textAlign: "right" }}>
            <Button
              href={`https://artelier.es/studio/orders/${orderId}`}
              style={{ backgroundColor: green, color: "#fff", borderRadius: "999px", padding: "12px 24px", fontSize: "14px", fontFamily: fontBody, display: "inline-block", marginRight: "8px" }}
            >
              Confirmar pedido
            </Button>
            <Button
              href={`https://artelier.es/studio/orders/${orderId}`}
              style={{ backgroundColor: "transparent", color: muted, borderRadius: "999px", padding: "12px 24px", fontSize: "14px", fontFamily: fontBody, display: "inline-block", border: "1px solid #e0dbd0" }}
            >
              Cancelar pedido
            </Button>
          </Column>
        </Row>
        <Text style={{ fontFamily: fontBody, color: "#9ca3af", fontSize: "11px", textAlign: "right", margin: "8px 0 0 0" }}>
          Recuerda que dispones de <strong style={{ fontFamily: fontBody}}>24 horas</strong> para confirmar o cancelar este pedido.<br/>En caso contrario, el pedido se cancelará automáticamente.
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
