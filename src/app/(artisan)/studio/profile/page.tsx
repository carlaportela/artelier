import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import ProfileForm from "./ProfileForm";
import ProcessUpdateForm from "./ProcessUpdateForm";
import ProcessUpdateList from "./ProcessUpdateList";

export default async function StudioProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ARTISAN") redirect("/feed");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      processUpdates: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-[--bg] px-4 py-8">
      <div className="mx-auto max-w-xl space-y-10">
        <h1 className="font-display text-2xl text-[--text]">Mi perfil</h1>

        <ProfileForm user={user} />

        <section className="space-y-4">
          <h2 className="font-display text-xl text-[--text]">Actualizaciones de proceso</h2>
          <ProcessUpdateForm />
          <ProcessUpdateList updates={user.processUpdates} />
        </section>
      </div>
    </main>
  );
}
