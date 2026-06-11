"use client";

import { usePathname } from "next/navigation";
import AppFooter from "~/components/AppFooter";

// El chat de conversación es pantalla completa — sin footer
export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/messages/")) return null;
  return <AppFooter />;
}
