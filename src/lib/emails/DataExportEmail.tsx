import { Text } from "@react-email/components";
import EmailLayout from "./EmailLayout";
import { textDark, green, muted, fontBody, fontDisplay } from "./tokens";

interface Props {
  name: string | null;
}

export default function DataExportEmail({ name }: Props) {
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
        Tus datos de Artelier
      </Text>
      <Text
        style={{
          fontFamily: fontBody,
          color: textDark,
          fontSize: "14px",
          margin: "0 0 8px 0",
        }}
      >
        Has solicitado una copia de tus datos personales registrados en
        Artelier.
        <br />
        Los encontrarás adjuntos en formato PDF.
      </Text>
      <Text style={{ fontFamily: fontBody, color: muted, fontSize: "13px", margin: "0 0 20px 0" }}>
        Si no reconoces esta solicitud, por favor ignora este correo con seguridad.
      </Text>
    </EmailLayout>
  );
}
