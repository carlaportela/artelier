"use client";

//Componente de botón para iniciar el onboarding con STripe de la artesana.
//Se renderiza en cliente con los hooks de React useState para el estado de carga y useRouter para redirigir.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; //Para mostrar notificaciones pequeñas que desaparecen automáticamente después de unos segundos.

interface Props {
  //Permite sobrescribir el color por defecto (verde) cuando el botón se muestra en un contexto con
  //su propio color, p. ej. dentro de una pestaña de un color distinto en /studio/profile.
  className?: string;
  //Permite sobrescribir el texto por defecto, p. ej. una versión más corta ("Conectar") cuando el
  //botón ya aparece junto a un texto que deja claro de qué se trata.
  label?: string;
  //Página a la que Stripe debe devolver a la artesana tras completar el onboarding con éxito — para
  //que vuelva justo a donde empezó, no siempre al mismo sitio genérico. El servidor valida este
  //valor contra una lista blanca antes de usarlo.
  returnTo?: string;
}

//Función principal del componente.
export default function StripeConnectButton({ className, label, returnTo }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  //Función que gestiona la conexión mediante el endpoint de la API de Stripe
  async function handleConnect() {
    //Modifica el estado a cargando.
    setLoading(true);

    try {
      //Llamada a la API, si no responde se lanza el error correspondiente.
      const res = await fetch("/api/artisan/stripe-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnTo }),
      });
      if (!res.ok) throw new Error("Error al conectar con Stripe");

      //Recibe la respuesta de la API en formato JSON y establecemos un type assertion (la forma que va a tener el JSON, que contendra un atributo url de tipo string).
      const { data } = (await res.json()) as { data: { url: string } };

      //Redirige a la URL obtenida en los datos de respuesta en JSON.
      router.push(data.url);
    } catch {
      setLoading(false);
      toast.error("No pudimos conectar tu cuenta. Intenta de nuevo.");
    }
  }

  //Devuelve el botón que al clicarse llama a la API de Stripe y que muestra Conectar con cuenta bancaria y cargando si se encuentra mientras se ejecuta la conexión con la API
  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={loading}
      className={
        className ??
        "mt-3 cursor-pointer rounded-full bg-[#3d5a4f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a6b5e] disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {loading ? "Cargando..." : (label ?? "Conectar cuenta bancaria")}
    </button>
  );
}
