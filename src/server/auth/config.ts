import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

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

const adapter = PrismaAdapter(db);

export const authConfig = {
  adapter,
  session: { strategy: "database" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = z
          .object({ email: z.string().email(), password: z.string() })
          .safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: ((): "ARTISAN" | "BUYER" | "ADMIN" => {
          const r = (user as { role?: string }).role;
          return r === "ARTISAN" || r === "ADMIN" ? r : "BUYER";
        })(),
      },
    }),
  },
} satisfies NextAuthConfig;
