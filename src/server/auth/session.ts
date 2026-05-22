import { cookies } from "next/headers";

import { db } from "~/server/db";

const SESSION_COOKIE = "authjs.session-token";

export async function getServerSession() {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";
  const token =
    cookieStore.get(isProduction ? `__Secure-${SESSION_COOKIE}` : SESSION_COOKIE)
      ?.value;
  if (!token) return null;

  const row = await db.session.findUnique({
    where: { sessionToken: token },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true, role: true },
      },
    },
  });

  if (!row || row.expires < new Date()) return null;
  return { user: row.user };
}
