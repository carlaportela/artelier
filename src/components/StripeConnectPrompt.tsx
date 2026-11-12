//Banner que verá la artesana en lugar del formulario de producto nuevo para agregar.

import StripeConnectButton from "~/components/StripeConnectButton";

//Función principal que muestra el mensaje en el botón que redirige al onboarding de Stripe
export default function StripeConnectPrompt() {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
      <p className="text-lg font-medium text-foreground">
        Conecta una cuenta bancaria para empezar a vender
      </p>
      <p className="text-sm text-muted-foreground">
        Necesitas vincular una cuenta bancaria con Stripe para recibir los pagos de tus ventas
      </p>
      <StripeConnectButton />
    </div>
  );
}
