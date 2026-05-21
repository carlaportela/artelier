import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import AccountForm from "./AccountForm";

export const metadata: Metadata = { title: "Mi cuenta — Artelier" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, locality: true, email: true },
  });

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-[--bg] px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="font-display text-2xl text-[--text]">Mi cuenta</h1>
        {user.email && (
          <p className="text-sm text-[--text-muted]">{user.email}</p>
        )}
        <AccountForm user={user} />
      </div>
    </main>
  );
}
