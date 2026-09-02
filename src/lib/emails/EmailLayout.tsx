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
  Img,
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
        {/* En pantallas estrechas (móvil), los pares de botones pasan de estar en línea a
        apilarse a ancho completo, para que el texto no se parta dentro de la píldora. */}
        <style>
          {`@media only screen and (max-width: 480px) {
            .btn-stack-table { width: 100% !important; }
            .btn-stack-td { display: block !important; width: 100% !important; padding-right: 0 !important; padding-bottom: 8px !important; }
            .btn-stack-btn { display: block !important; width: 100% !important; text-align: center !important; }
          }`}
        </style>
      </Head>
      <Body style={{ backgroundColor: "#faf9f7", fontFamily: fontBody, margin: 0, color: textDark }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "48px 32px" }}>

          {/* Header — logo (imagen alojada en Cloudinary, no SVG inline: la mayoría de clientes
          de correo, sobre todo en móvil, no soportan SVG embebido en el HTML) + nombre de marca */}
          <table role="presentation" cellPadding="0" cellSpacing="0" style={{ marginBottom: "6px" }}>
            <tbody>
              <tr>
                <td style={{ paddingRight: "10px", verticalAlign: "middle" }}>
                  <Img
                    src="https://res.cloudinary.com/dsjuqvbyz/image/upload/v1786094164/artelier/email-logo.svg"
                    width="40"
                    height="23"
                    alt="Artelier"
                  />
                </td>
                <td style={{ verticalAlign: "middle" }}>
                  <Text style={{ fontFamily: fontDisplay, color: green, fontSize: "22px", fontWeight: "700", margin: 0 }}>
                    Artelier
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>

          <Hr style={{ borderColor: "#e0dbd0", margin: "16px 0 24px 0" }} />

          {/* Contenido específico de cada email */}
          {children}

          {/* Firma común */}
          <Text style={{ fontFamily: fontBody, color: muted, fontSize: "13px", margin: "0 0 20px 0" }}>
            Si tienes alguna duda o consulta, puedes ponerte en contacto con nosotras en{" "}
            <Link href="mailto:holi@artelier.es" style={{ color: green, fontFamily: fontBody }}>holi@artelier.es</Link>.
          </Text>
          <Text style={{ fontFamily: fontDisplay, color: green, fontSize: "16px", fontWeight: "700", margin: "0 0 4px 0" }}>
            Atentamente,
          </Text>
          <Text style={{ fontFamily: fontDisplay, color: green, fontSize: "16px", fontWeight: "700", margin: 0 }}>
            El equipo de Artelier
          </Text>

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
