import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getServerSession } from "~/server/auth/session";
import { db } from "~/server/db";
import AccountForm from "./AccountForm";
import SecuritySection from "./SecuritySection";
import ExportDataButton from "~/components/account/ExportDataButton";

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
    <main className="min-h-screen bg-[--bg] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="font-display text-xl font-bold text-[--text] md:text-2xl">Mi cuenta</h1>
        <AccountForm user={user} />
        <div className="rounded-xl border border-[--border] bg-[--surface] p-4 sm:p-5">
          <ExportDataButton />
        </div>
        <div className="rounded-xl border border-[--border] bg-[--surface] p-4 sm:p-5">
          <SecuritySection />
        </div>
      </div>
    </main>
  );
}
