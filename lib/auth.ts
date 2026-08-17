import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import "next-auth/jwt";

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

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string | null;
    role?: Role;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db) as any,
  session: { strategy: "jwt" },
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role || Role.USER;
      } else if (token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, username: true, role: true },
        });
        if (dbUser) {
          token.username = dbUser.username;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string | null;
        session.user.role = (token.role as Role) || Role.USER;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "aliverso_secret_key_2026",
});
