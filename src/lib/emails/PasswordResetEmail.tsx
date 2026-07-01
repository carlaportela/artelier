import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  resetUrl: string;
}

export default function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Recupera tu contraseña en Artelier</Preview>
      <Body style={{ backgroundColor: "#f4f0e8", fontFamily: "sans-serif", margin: "0" }}>
        <Container style={{ maxWidth: "480px", margin: "40px auto", padding: "32px", backgroundColor: "#ffffff", borderRadius: "8px" }}>
          <Heading style={{ color: "#2c1a0e", fontSize: "24px", fontWeight: "600", marginBottom: "16px" }}>
            Recupera tu contraseña
          </Heading>
          <Text style={{ color: "#4a3728", fontSize: "16px", lineHeight: "1.5", marginBottom: "24px" }}>
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en Artelier.
          </Text>
          <Section style={{ textAlign: "center", marginBottom: "24px" }}>
            <Button
              href={resetUrl}
              style={{
                backgroundColor: "#4a3728",
                color: "#ffffff",
                padding: "12px 28px",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "600",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Restablecer contraseña
            </Button>
          </Section>
          <Text style={{ color: "#6b5c52", fontSize: "14px", lineHeight: "1.5" }}>
            Este enlace expira en <strong>1 hora</strong>. Si no solicitaste este cambio, puedes ignorar este email con seguridad.
          </Text>
          <Text style={{ color: "#9e8e84", fontSize: "12px", marginTop: "24px", borderTop: "1px solid #e8e0d8", paddingTop: "16px" }}>
            Artelier · Mercado de artesanía
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
