// Template del correo de nueva seguidora para la artesana.

import { Text, Button, Section, Link } from "@react-email/components";
import EmailLayout from "./EmailLayout";
import { textDark, green, fontBody, fontDisplay } from "./tokens";

interface Props {
  artisanName: string;
  followerName: string;
}

export default function NewFollowerEmail({ artisanName, followerName }: Props) {
  return (
    <EmailLayout>

      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "15px", margin: "0 0 16px 0" }}>
        Hola{artisanName ? ` ${artisanName}` : ""}:
      </Text>
      <Text style={{ fontFamily: fontDisplay, color: green, fontSize: "22px", fontWeight: "700", margin: "0 0 12px 0" }}>
        ¡Tienes una nueva seguidora!
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 8px 0" }}>
        <strong style={{ fontFamily: fontBody }}>{followerName}</strong> ha empezado a seguirte en Artelier y estará al tanto de todos tus nuevos productos.
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 24px 0" }}>
        Sigue creando y compartiendo tu trabajo. ¡Cada nueva seguidora es alguien que aprecia lo que haces!
      </Text>

      <Section style={{ marginBottom: "24px" }}>
        <Button
          href="https://artelier.es/studio/followers"
          style={{ backgroundColor: green, color: "#fff", borderRadius: "999px", padding: "12px 28px", fontSize: "14px", fontFamily: fontBody, display: "inline-block" }}
        >
          Ver mis seguidoras
        </Button>
      </Section>


    </EmailLayout>
  );
}
