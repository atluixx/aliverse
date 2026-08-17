import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string | null;
    role?: Role;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db) as any,
  providers: [
    Credentials({
      name: "Username & Password",
      credentials: {
        username: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const identifier = (credentials.username as string).trim().toLowerCase();
        const inputPassword = credentials.password as string;

        // Search by username or email
        const user = await db.user.findFirst({
          where: {
            OR: [
              { username: identifier },
              { email: identifier },
            ],
          },
        });

        if (!user) {
          return null;
        }

        // Validate password if user has a password set
        if (user.password) {
          const isValid = await bcrypt.compare(inputPassword, user.password);
          if (!isValid) return null;
        }

        return {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
});
