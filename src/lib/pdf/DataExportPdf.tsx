import { Document, Page, Text, View, StyleSheet, Font, Svg, G, Polygon, Path } from "@react-pdf/renderer";

Font.register({
  family: "TheGirlNextDoor",
  src: "https://fonts.gstatic.com/s/thegirlnextdoor/v25/pe0zMJCIMIsBjFxqYBIcZ6_OI5oFHCYIVw.ttf",
});

const GREEN = "#3d5a4f";
const MUSTARD = "#c4956a";
const MUTED = "#888888";
const BORDER = "#e0dbd0";
const BG_LIGHT = "#f5f0e8";
const TEXT = "#2c2c2c";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: TEXT,
    backgroundColor: "#faf9f7",
    paddingTop: 48,
    paddingBottom: 60,
    paddingHorizontal: 48,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 14,
    borderBottom: `1pt solid ${BORDER}`,
  },
  headerLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  brand: {
    fontSize: 22,
    fontFamily: "TheGirlNextDoor",
    color: GREEN,
  },
  accentLine: {
    width: 24,
    height: 2,
    backgroundColor: MUSTARD,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 8,
    color: MUTED,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: GREEN,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: `0.5pt solid ${BORDER}`,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 110,
    fontSize: 9,
    color: MUTED,
  },
  value: {
    flex: 1,
    fontSize: 9,
    color: TEXT,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: BG_LIGHT,
    paddingVertical: 5,
    paddingHorizontal: 6,
    marginBottom: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottom: `0.5pt solid ${BORDER}`,
  },
  tableHeadText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: MUTED,
  },
  tableCell: {
    fontSize: 8,
    color: TEXT,
  },
  colProduct: { flex: 3 },
  colArtisan: { flex: 2 },
  colDate: { flex: 2 },
  colAmount: { flex: 1.5 },
  colStatus: { flex: 2 },
  noOrders: {
    fontSize: 9,
    color: MUTED,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    fontSize: 7,
    color: MUTED,
    borderTop: `0.5pt solid ${BORDER}`,
    paddingTop: 8,
  },
});

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmado",
  IN_PREPARATION: "En preparación",
  READY: "Listo",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  ACCEPTED: "Aceptado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
  IN_DISPUTE: "En disputa",
};

interface Order {
  id: string;
  createdAt: Date;
  status: string;
  totalInCents: number;
  product: { name: string };
  artisan: { name: string | null };
}

interface Props {
  name: string | null;
  email: string;
  locality: string | null;
  bio: string | null;
  createdAt: Date;
  orders: Order[];
  generatedAt: Date;
}

export function DataExportPdf({ name, email, locality, bio, createdAt, orders, generatedAt }: Props) {
  const fmt = (date: Date) =>
    new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));

  const fmtMoney = (cents: number) =>
    (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Cabecera */}
        <View style={s.header}>
          <View style={s.headerLogoRow}>
            <View style={{ width: 60, height: 35 }}>
              <Svg viewBox="0 0 80 46" style={{ width: 60, height: 35 }}>
                <G>
                  <Polygon points="5,20 21,20 13,36" fill="#3d5a4f" transform="rotate(26, 13, 20)" />
                  <Polygon points="22,25 38,25 30,41" fill="#c4956a" transform="rotate(9, 30, 25)" />
                  <Polygon points="42,25 58,25 50,41" fill="#3d5a4f" fillOpacity={0.55} transform="rotate(-9, 50, 25)" />
                  <Polygon points="59,20 75,20 67,36" fill="#3d5a4f" transform="rotate(-26, 67, 20)" />
                  <Path d="M 2 12 C 22 30, 58 30, 78 12" stroke="#3d5a4f" strokeWidth={1.2} strokeLinecap="round" fill="none" />
                </G>
              </Svg>
            </View>
            <View style={{ flex: 1, paddingLeft: 10 }}>
              <Text style={s.brand}>Artelier</Text>
            </View>
          </View>
          <View style={s.accentLine} />
          <Text style={s.headerSub}>Exportación de datos · {fmt(generatedAt)}</Text>
        </View>

        {/* Perfil */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Datos de perfil</Text>
          <View style={s.row}>
            <Text style={s.label}>Nombre</Text>
            <Text style={s.value}>{name ?? "—"}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Correo electrónico</Text>
            <Text style={s.value}>{email}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Localidad</Text>
            <Text style={s.value}>{locality ?? "—"}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Bio</Text>
            <Text style={s.value}>{bio ?? "—"}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Cuenta creada</Text>
            <Text style={s.value}>{fmt(createdAt)}</Text>
          </View>
        </View>

        {/* Pedidos */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Historial de pedidos</Text>
          {orders.length === 0 ? (
            <Text style={s.noOrders}>No hay pedidos registrados.</Text>
          ) : (
            <View>
              <View style={s.tableHead}>
                <Text style={[s.tableHeadText, s.colProduct]}>Producto</Text>
                <Text style={[s.tableHeadText, s.colArtisan]}>Artesana</Text>
                <Text style={[s.tableHeadText, s.colDate]}>Fecha</Text>
                <Text style={[s.tableHeadText, s.colAmount]}>Importe</Text>
                <Text style={[s.tableHeadText, s.colStatus]}>Estado</Text>
              </View>
              {orders.map((order) => (
                <View key={order.id} style={s.tableRow}>
                  <Text style={[s.tableCell, s.colProduct]}>{order.product.name}</Text>
                  <Text style={[s.tableCell, s.colArtisan]}>{order.artisan.name ?? "—"}</Text>
                  <Text style={[s.tableCell, s.colDate]}>{fmt(order.createdAt)}</Text>
                  <Text style={[s.tableCell, s.colAmount]}>{fmtMoney(order.totalInCents)}</Text>
                  <Text style={[s.tableCell, s.colStatus]}>{STATUS_LABELS[order.status] ?? order.status}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Pie */}
        <View style={s.footer}>
          <Text>
            Documento generado en cumplimiento del art. 15 del RGPD. Si tienes alguna duda puedes escribirnos a holi@artelier.es
          </Text>
        </View>

      </Page>
    </Document>
  );
}
