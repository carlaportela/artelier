import { Text, Button, Section } from "@react-email/components";
import EmailLayout from "./EmailLayout";
import { textDark, green, muted, fontBody, fontDisplay } from "./tokens";

interface Props {
  resetUrl: string;
  name?: string | null;
}

export default function PasswordResetEmail({ resetUrl, name }: Props) {
  return (
    <EmailLayout>
      <Text
        style={{
          fontFamily: fontBody,
          color: textDark,
          fontSize: "15px",
          margin: "0 0 16px 0",
        }}
      >
        Hola{name ? ` ${name}` : ""}:
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
        ¡Que no cunda el pánico!
      </Text>
      <Text
        style={{
          fontFamily: fontBody,
          color: textDark,
          fontSize: "14px",
          margin: "0 0 20px 0",
        }}
      >
        Hemos recibido tu solicitud para restablecer la contraseña de tu cuenta en
        Artelier. Si fuiste tú, haz clic en el botón para continuar.
      </Text>

      <Section style={{ marginBottom: "20px" }}>
        <Button
          href={resetUrl}
          style={{
            backgroundColor: green,
            color: "#fff",
            borderRadius: "999px",
            padding: "12px 28px",
            fontSize: "14px",
            fontFamily: fontBody,
            display: "inline-block",
          }}
        >
          Restablecer contraseña
        </Button>
      </Section>

      <Text
        style={{
          fontFamily: fontBody,
          color: muted,
          fontSize: "11px",
          margin: "0 0 20px 0",
        }}
      >
        Este enlace expira en <strong style={{ fontFamily: fontBody }}>1 hora</strong>.
        <br />
        Si no solicitaste recuperar tu contraseña, puedes ignorar este correo
        con seguridad.
      </Text>

    </EmailLayout>
  );
}
