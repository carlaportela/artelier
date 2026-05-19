import { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Edge-safe config: no Prisma, no Node.js APIs.
// Scaffolding for Historia 1.2 — will be wired into middleware once
// Upstash Redis session-role caching is implemented.
// Full auth config (with PrismaAdapter) lives in config.ts.
export const authConfigEdge = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async () => null,
    }),
  ],
} satisfies NextAuthConfig;
