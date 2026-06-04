import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import AccountForm from "./AccountForm";

export const metadata: Metadata = { title: "Mi cuenta — Artelier" };

export default async function AccountPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login");
  if (session.user.role === "ARTISAN") redirect("/studio/profile");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, lastName: true, locality: true, email: true, image: true, street: true, postalCode: true, city: true, province: true },
  });

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-[--bg] px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="font-display text-2xl font-bold text-[--text] sm:text-3xl">Mi cuenta</h1>
        <AccountForm user={user} />
      </div>
    </main>
  );
}
