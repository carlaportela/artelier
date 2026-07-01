import { Html, Head, Body, Text, Hr } from "@react-email/components";

interface DataExportEmailProps {
  name: string | null;
}

export default function DataExportEmail({ name }: DataExportEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Body style={{ fontFamily: "sans-serif", color: "#3d3d3d", padding: "32px" }}>
        <Text>Hola {name ?? "usuaria"},</Text>
        <Text>
          Has solicitado una copia de tus datos personales registrados en Artelier.
          Los encontrarás adjuntos en formato PDF.
        </Text>
        <Hr />
        <Text style={{ fontSize: "13px", color: "#888" }}>
          Si no reconoces esta solicitud, escríbenos a holi@artelier.es.
        </Text>
        <Text style={{ fontSize: "13px", color: "#888" }}>
          El equipo de Artelier
        </Text>
      </Body>
    </Html>
  );
}
