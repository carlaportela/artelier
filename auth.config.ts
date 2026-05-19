import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Edge-safe: no Prisma imports here.
// Used by src/middleware.ts for route protection.
// Full auth config with DB callbacks lives in src/server/auth/config.ts
export default {
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
} satisfies NextAuthConfig;
