import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getServerSession } from "~/server/auth/session";
import ChangePasswordForm from "~/components/account/ChangePasswordForm";
import DeleteAccountForm from "~/components/account/DeleteAccountForm";
import ExportDataButton from "~/components/account/ExportDataButton";

export const metadata: Metadata = { title: "Configuración — Artelier" };

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");

  return (
    <main className="min-h-screen bg-[--bg] px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-lg space-y-10">
        <h1 className="font-display text-2xl font-bold text-[--text] sm:text-3xl">Configuración</h1>
        <ChangePasswordForm />
        <hr className="border-[--border]" />
        <ExportDataButton />
        <hr className="border-[--border]" />
        <DeleteAccountForm />
      </div>
    </main>
  );
}
