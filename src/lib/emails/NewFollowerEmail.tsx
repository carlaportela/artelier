// Template del correo de nueva seguidora para la artesana.

import { Text, Button, Section, Row, Column, Img } from "@react-email/components";
import EmailLayout from "./EmailLayout";
import { textDark, green, fontBody, fontDisplay } from "./tokens";

interface Props {
  artisanName: string;
  followerName: string;
  followerImageUrl: string | null;
  followersUrl: string;
}

export default function NewFollowerEmail({ artisanName, followerName, followerImageUrl, followersUrl }: Props) {
  return (
    <EmailLayout>

      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "15px", margin: "0 0 16px 0" }}>
        Hola{artisanName ? ` ${artisanName}` : ""}:
      </Text>
      <Text style={{ fontFamily: fontDisplay, color: green, fontSize: "22px", fontWeight: "700", margin: "0 0 12px 0" }}>
        ¡Tienes una nueva seguidora!
      </Text>

      <Row style={{ marginBottom: "16px" }}>
        <Column style={{ width: "52px", verticalAlign: "middle" }}>
          {followerImageUrl ? (
            <Img
              src={followerImageUrl}
              width="44"
              height="44"
              alt={followerName}
              style={{ borderRadius: "9999px", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: "9999px", backgroundColor: "#f0ece6" }} />
          )}
        </Column>
        <Column style={{ verticalAlign: "middle" }}>
          <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", fontWeight: "600", margin: 0 }}>
            {followerName}
          </Text>
        </Column>
      </Row>

      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 8px 0" }}>
        <strong style={{ fontFamily: fontBody }}>{followerName}</strong> ha empezado a seguirte en Artelier y estará al tanto de todos tus nuevos productos.
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 24px 0" }}>
        Sigue creando y compartiendo tu trabajo. ¡Cada nueva seguidora es alguien que aprecia lo que haces!
      </Text>

      <Section style={{ marginBottom: "24px" }}>
        <Button
          href={followersUrl}
          style={{ backgroundColor: green, color: "#fff", borderRadius: "999px", padding: "12px 28px", fontSize: "14px", fontFamily: fontBody, display: "inline-block" }}
        >
          Ver mis seguidores
        </Button>
      </Section>


    </EmailLayout>
  );
}
