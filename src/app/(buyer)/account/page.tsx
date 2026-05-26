import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import AccountForm from "./AccountForm";

import Link from "next/link";


export const metadata: Metadata = { title: "Mi cuenta — Artelier" };

export default async function AccountPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  if (session.user.role === "ARTISAN") redirect("/studio/profile");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, locality: true, email: true },
  });

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-[--bg] px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="font-display text-2xl font-bold text-[--text]">Mi cuenta</h1>
        <AccountForm user={user} />
        <div className="text-center">
          <Link href="/account/settings" className="text-sm text-[--text-muted] transition-colors hover:text-[#3d5a4f]">
            Configuración y privacidad
          </Link>
        </div>
      </div>
    </main>
  );
}
