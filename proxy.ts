import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/signin";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    if (session.user.role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/gallery";
      url.searchParams.set("error", "UnauthorizedAdminAccess");
      return NextResponse.redirect(url);
    }
  }

  // Protect /submit and /my-submissions routes
  if (pathname.startsWith("/submit") || pathname.startsWith("/my-submissions")) {
    if (!session?.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/signin";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const middleware = proxy;

export const config = {
  matcher: ["/admin/:path*", "/submit/:path*", "/my-submissions/:path*"],
};
