import "~/styles/globals.css";

import { type Metadata } from "next";
import localFont from "next/font/local";

export const metadata: Metadata = {
  title: "Artelier",
  description: "Marketplace de artesanía gallega",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const dmSans = localFont({
  src: [
    {
      path: "../../public/fonts/DMSans-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const theGirlNextDoor = localFont({
  src: "../../public/fonts/TheGirlNextDoor-Regular.woff2",
  variable: "--font-display",
  weight: "400",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${theGirlNextDoor.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
