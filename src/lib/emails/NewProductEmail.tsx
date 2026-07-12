// Template del correo de nuevo producto para las seguidoras de la artesana.

import { Text, Button, Section, Row, Column, Img, Link } from "@react-email/components";
import EmailLayout from "./EmailLayout";
import { textDark, green, muted, fontBody, fontDisplay } from "./tokens";

interface Props {
  followerName: string;
  artisanName: string;
  productName: string;
  productImageUrl: string | null;
  productUrl: string;
  productDescription: string | null;
  priceInCents: number;
}

const fmt = (cents: number) =>
  (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

export default function NewProductEmail({
  followerName,
  artisanName,
  productName,
  productImageUrl,
  productUrl,
  productDescription,
  priceInCents,
}: Props) {
  return (
    <EmailLayout>

      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "15px", margin: "0 0 16px 0" }}>
        Hola{followerName ? ` ${followerName}` : ""}:
      </Text>
      <Text style={{ fontFamily: fontDisplay, color: green, fontSize: "22px", fontWeight: "700", margin: "0 0 12px 0" }}>
        ¡{artisanName ?? "Una artesana"} tiene algo nuevo para ti!
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 20px 0" }}>
        Una de las artesanas que sigues acaba de publicar una nueva creación. ¡Echa un vistazo antes de que se vaya!
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
              <Link href={productUrl}>
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
              Producto
            </Text>
            <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "13px", fontWeight: "600", margin: "0 0 10px 0" }}>
              {productName}
            </Text>
            <Text style={{ fontFamily: fontBody, color: muted, fontSize: "13px", margin: "0 0 1px 0" }}>
              Precio
            </Text>
            <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "13px", fontWeight: "600", margin: "0 0 10px 0" }}>
              {fmt(priceInCents)}
            </Text>
            {productDescription && (
              <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "13px", margin: 0 }}>
                {productDescription}
              </Text>
            )}
          </Column>
        </Row>

        <div style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 0 0" }} />
        <Row style={{ marginTop: "16px" }}>
          <Column style={{ textAlign: "right" }}>
            <Button
              href={productUrl}
              style={{ backgroundColor: green, color: "#fff", borderRadius: "999px", padding: "12px 24px", fontSize: "14px", fontFamily: fontBody, display: "inline-block" }}
            >
              Ver producto
            </Button>
          </Column>
        </Row>

      </Section>


    </EmailLayout>
  );
}
