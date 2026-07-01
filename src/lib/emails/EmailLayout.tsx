//Plantilla compartida de correo electrónicos de notificación.

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Font,
} from "@react-email/components";

import { green, muted, fontDisplay, fontBody } from "./tokens";

const textDark = "#2c2c2c";

interface Props {
  children: React.ReactNode;
}

export default function EmailLayout({ children }: Props) {
  return (
    <Html lang="es">
      <Head>
        {/* Carga de The Girl Next Door desde Google Fonts para la cabecera */}
        <Font
          fontFamily="The Girl Next Door"
          fallbackFontFamily="Georgia"
          webFont={{
            url: "https://fonts.gstatic.com/s/thegirlnextdoor/v25/pe0zMJCIMIsBjFxqYBIcZ6_OI5oFHCYIVw.ttf",
            format: "truetype",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Body style={{ backgroundColor: "#faf9f7", fontFamily: fontBody, margin: 0, color: textDark }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "48px 32px" }}>

          {/* Header — logo inline SVG + nombre de marca */}
          {/* TODO producción: reemplazar SVG inline por <Img src="https://artelier.es/logo.png" width="40" height="23" alt="Artelier" /> para compatibilidad con Outlook desktop */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <svg width="40" height="23" viewBox="0 0 80 46" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Logo Artelier">
              <polygon points="5,20 21,20 13,36" fill="#3d5a4f" transform="rotate(26, 13, 20)" />
              <polygon points="22,25 38,25 30,41" fill="#c4956a" transform="rotate(9, 30, 25)" />
              <polygon points="42,25 58,25 50,41" fill="#3d5a4f" opacity="0.55" transform="rotate(-9, 50, 25)" />
              <polygon points="59,20 75,20 67,36" fill="#3d5a4f" transform="rotate(-26, 67, 20)" />
              <path d="M 2 12 C 22 30, 58 30, 78 12" stroke="#3d5a4f" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </svg>
            <Text style={{ fontFamily: fontDisplay, color: green, fontSize: "22px", margin: 0 }}>
              Artelier
            </Text>
          </div>

          <Hr style={{ borderColor: "#e0dbd0", margin: "16px 0 24px 0" }} />

          {/* Contenido específico de cada email */}
          {children}

          <Hr style={{ borderColor: "#e0dbd0", margin: "24px 0 16px 0" }} />

          {/* Footer con links de baja */}
          <Section style={{ textAlign: "center" }}>
            <Text style={{ fontSize: "11px", color: muted, margin: 0, fontFamily: fontBody }}>
              <Link href="https://artelier.es/cuenta/notificaciones" style={{ color: muted, fontFamily: fontBody }}>
                Preferencias de notificación
              </Link>
              {" · "}
              <Link href="https://artelier.es/baja" style={{ color: muted, fontFamily: fontBody }}>
                Darse de baja
              </Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}
