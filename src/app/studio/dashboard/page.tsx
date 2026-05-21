import { logoutUser } from "~/app/(auth)/logout/actions";

export default function StudioDashboardPage() {
  return (
    <main className="p-8">
      <h1 className="font-display text-2xl text-[--text]">Studio Dashboard</h1>
      <form action={logoutUser} className="mt-4">
        <button type="submit" className="text-sm text-[--text-muted] underline hover:text-[--text]">
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
