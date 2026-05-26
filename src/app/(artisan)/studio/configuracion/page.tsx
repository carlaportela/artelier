import { redirect } from "next/navigation";

// Ajustes de configuración de perfil de artesano integrados en /studio/profile desde Historia 2.1
export default function StudioConfigRedirect() {
  redirect("/studio/profile");
}
