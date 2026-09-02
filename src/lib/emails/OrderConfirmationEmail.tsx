//Template del correo de confirmación de pedido para la compradora.

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
      <Text
        style={{
          fontFamily: fontBody,
          color: textDark,
          fontSize: "15px",
          margin: "0 0 16px 0",
        }}
      >
        Hola{buyerName ? ` ${buyerName}` : ""}:
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
        ¡Gracias por comprar en Artelier!
      </Text>
      <Text
        style={{
          fontFamily: fontBody,
          color: textDark,
          fontSize: "14px",
          margin: "0 0 4px 0",
        }}
      >
        Tu pago se ha realizado correctamente. {artisanName} tiene ahora 24
        horas para aceptar tu pedido y empezar a prepararlo.
      </Text>
      <Text
        style={{
          fontFamily: fontBody,
          color: textDark,
          fontSize: "14px",
          margin: "0 0 4px 0",
        }}
      >
        Te avisaremos en cuanto lo acepte.
      </Text>
      <Text
        style={{
          fontFamily: fontBody,
          color: textDark,
          fontSize: "14px",
          margin: "0 0 20px 0",
        }}
      >
        Mientras tanto, aquí tienes el resumen de tu pedido:
      </Text>

      {/* Card */}
      <Section
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #e0dbd0",
          padding: "16px",
          marginBottom: "20px",
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
              Identificador de pedido
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

        {/* Separador */}
        <div
          style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 12px 0" }}
        />

        {/* Desglose de precios */}
        <Row style={{ marginBottom: "6px" }}>
          <Column>
            <Text
              style={{
                fontFamily: fontBody,
                color: muted,
                fontSize: "13px",
                margin: 0,
              }}
            >
              Precio
            </Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text
              style={{
                fontFamily: fontBody,
                color: textDark,
                fontSize: "13px",
                margin: 0,
              }}
            >
              {fmt(priceInCents)}
            </Text>
          </Column>
        </Row>
        <Row style={{ marginBottom: "6px" }}>
          <Column>
            <Text
              style={{
                fontFamily: fontBody,
                color: muted,
                fontSize: "13px",
                margin: 0,
              }}
            >
              Gastos de envío
            </Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text
              style={{
                fontFamily: fontBody,
                color: textDark,
                fontSize: "13px",
                margin: 0,
              }}
            >
              {fmt(shippingCostInCents)}
            </Text>
          </Column>
        </Row>
        <Row style={{ marginBottom: "6px" }}>
          <Column>
            <Text
              style={{
                fontFamily: fontBody,
                color: muted,
                fontSize: "13px",
                margin: 0,
              }}
            >
              Seguro de la plataforma
            </Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text
              style={{
                fontFamily: fontBody,
                color: muted,
                fontSize: "13px",
                margin: 0,
              }}
            >
              {fmt(insuranceFeeInCents)}
            </Text>
          </Column>
        </Row>
        <Row style={{ marginBottom: "10px" }}>
          <Column>
            <Text
              style={{
                fontFamily: fontBody,
                color: muted,
                fontSize: "13px",
                margin: 0,
              }}
            >
              Pasarela de pago
            </Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text
              style={{
                fontFamily: fontBody,
                color: muted,
                fontSize: "13px",
                margin: 0,
              }}
            >
              {fmt(stripeFeeInCents)}
            </Text>
          </Column>
        </Row>

        {/* Total */}
        <div
          style={{
            borderTop: "1px solid #e0dbd0",
            paddingTop: "10px",
            marginBottom: "16px",
          }}
        >
          <Row>
            <Column>
              <Text
                style={{
                  fontFamily: fontBody,
                  color: textDark,
                  fontSize: "14px",
                  fontWeight: "700",
                  margin: 0,
                }}
              >
                Total
              </Text>
            </Column>
            <Column style={{ textAlign: "right" }}>
              <Text
                style={{
                  fontFamily: fontBody,
                  color: textDark,
                  fontSize: "14px",
                  fontWeight: "700",
                  margin: 0,
                }}
              >
                {fmt(totalInCents)}
              </Text>
            </Column>
          </Row>
        </div>

        {/* Botones alineados a la derecha — tabla explícita en vez de inline-block, más fiable
        en clientes de correo para garantizar que queden en línea y con espacio entre ellos. */}
        <Row>
          <Column style={{ textAlign: "right" }}>
            <table role="presentation" cellPadding="0" cellSpacing="0" className="btn-stack-table" style={{ marginLeft: "auto" }}>
              <tbody>
                <tr>
                  <td className="btn-stack-td" style={{ paddingRight: "8px" }}>
                    <Button
                      href={`https://artelier.es/orders/${orderId}`}
                      className="btn-stack-btn"
                      style={{
                        backgroundColor: green,
                        color: "#fff",
                        borderRadius: "999px",
                        padding: "12px 24px",
                        fontSize: "14px",
                        fontFamily: fontBody,
                        display: "inline-block",
                      }}
                    >
                      Ver pedido
                    </Button>
                  </td>
                  <td className="btn-stack-td">
                    <Button
                      href={`https://artelier.es/orders/${orderId}`}
                      className="btn-stack-btn"
                      style={{
                        backgroundColor: "transparent",
                        color: muted,
                        borderRadius: "999px",
                        padding: "12px 24px",
                        fontSize: "14px",
                        fontFamily: fontBody,
                        display: "inline-block",
                        border: "1px solid #e0dbd0",
                      }}
                    >
                      Cancelar pedido
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </Column>
        </Row>
        <Text
          style={{
            fontFamily: fontBody,
            color: "#9ca3af",
            fontSize: "11px",
            textAlign: "right",
            margin: "8px 0 0 0",
          }}
        >
          Recuerda que puedes cancelar tu pedido en un plazo de 24 horas desde la
          confirmación de compra.
        </Text>
      </Section>

    </EmailLayout>
  );
}
