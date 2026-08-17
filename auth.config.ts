import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role || "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string | null;
        session.user.role = (token.role as any) || "USER";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "aliverso_super_secret_auth_key_2026_vercel",
} satisfies NextAuthConfig;
