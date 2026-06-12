//Banner que verá la artesana en lugar del formulario de producto nuevo para agregar.

import StripeConnectButton from "~/components/StripeConnectButton";

//Función principal que muestra el mensaje en el botón que redirige al onboarding de Stripe
export default function StripeConnectPrompt() {
  return (
    <div>
      <p>Conecta tu cuenta bancaria para poder empezar a vender</p>
      <StripeConnectButton />
    </div>
  );
}
