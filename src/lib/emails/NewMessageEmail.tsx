// Template del correo de notificación de mensaje nuevo.

import { Text, Button, Section, Row, Column, Link } from "@react-email/components";
import EmailLayout from "./EmailLayout";
import { textDark, green, muted, fontBody, fontDisplay } from "./tokens";

interface Props {
  recipientName: string;
  senderName: string;
  senderAvatarUrl: string | null;
  messagePreview: string | null;
  conversationUrl: string;
}

export default function NewMessageEmail({
  recipientName,
  senderName,
  senderAvatarUrl,
  messagePreview,
  conversationUrl,
}: Props) {
  const displayName = senderName || "";

  return (
    <EmailLayout>

      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "15px", margin: "0 0 16px 0" }}>
        Hola{recipientName ? ` ${recipientName}` : ""}:
      </Text>
      <Text style={{ fontFamily: fontDisplay, color: green, fontSize: "22px", fontWeight: "700", margin: "0 0 12px 0" }}>
        ¡Tienes un nuevo mensaje!
      </Text>
      <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "14px", margin: "0 0 20px 0" }}>
        {senderName ? <strong style={{ fontFamily: fontBody }}>{senderName}</strong> : "Una seguidora"} te ha enviado un mensaje en Artelier.
      </Text>

      {/* Card */}
      <Section style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        border: "1px solid #e0dbd0",
        padding: "16px",
        marginBottom: "20px",
      }}>

        {/* Foto + nombre */}
        <Row>
          <Column style={{ width: "52px", verticalAlign: "middle" }}>
            <svg width="44" height="44" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id="cookie-clip">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="21" cy="12" r="3" />
                  <circle cx="19.28" cy="17.29" r="3" />
                  <circle cx="14.78" cy="20.56" r="3" />
                  <circle cx="9.22" cy="20.56" r="3" />
                  <circle cx="4.72" cy="17.29" r="3" />
                  <circle cx="3" cy="12" r="3" />
                  <circle cx="4.72" cy="6.71" r="3" />
                  <circle cx="9.22" cy="3.44" r="3" />
                  <circle cx="14.78" cy="3.44" r="3" />
                  <circle cx="19.28" cy="6.71" r="3" />
                </clipPath>
              </defs>
              {senderAvatarUrl ? (
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                <image
                  href={senderAvatarUrl}
                  x="0" y="0" width="24" height="24"
                  clipPath="url(#cookie-clip)"
                  preserveAspectRatio="xMidYMid slice"
                />
              ) : (
                <g clipPath="url(#cookie-clip)">
                  <rect width="24" height="24" fill="#f0ece6" />
                </g>
              )}
            </svg>
          </Column>
          {senderName && (
            <Column style={{ verticalAlign: "middle" }}>
              <Text style={{ fontFamily: fontBody, color: textDark, fontSize: "13px", fontWeight: "600", margin: 0 }}>
                {senderName}
              </Text>
            </Column>
          )}
        </Row>

        {messagePreview && (
          <>
            <div style={{ borderTop: "1px solid #e0dbd0", margin: "14px 0 12px 0" }} />
            <Text style={{ fontFamily: fontBody, color: muted, fontSize: "13px", margin: 0, fontStyle: "italic" }}>
              "{messagePreview}"
            </Text>
          </>
        )}

        <div style={{ borderTop: "1px solid #e0dbd0", margin: "16px 0 0 0" }} />
        <Row style={{ marginTop: "16px" }}>
          <Column style={{ textAlign: "right" }}>
            <Button
              href={conversationUrl}
              style={{ backgroundColor: green, color: "#fff", borderRadius: "999px", padding: "12px 24px", fontSize: "14px", fontFamily: fontBody, display: "inline-block" }}
            >
              Ver mensaje
            </Button>
          </Column>
        </Row>

      </Section>


    </EmailLayout>
  );
}
