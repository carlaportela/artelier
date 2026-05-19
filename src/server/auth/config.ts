import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { db } from "~/server/db";

// Role added to session type — full implementation in Historia 1.2
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "ARTISAN" | "BUYER" | "ADMIN";
    } & DefaultSession["user"];
  }
}

// PrismaAdapter has a type conflict with next-auth's bundled @auth/core.
// This is a known issue in next-auth v5 beta. Suppressed until upstream fix.
const adapter = PrismaAdapter(db);

export const authConfig = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  adapter,
  session: { strategy: "database" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // authorize() implemented in Historia 1.2
      authorize: async () => null,
    }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: (user as { role?: string }).role ?? "BUYER",
      },
    }),
  },
} satisfies NextAuthConfig;
