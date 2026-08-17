import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "aliverso_secret_key_2026",
    });

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/signin";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    if (token.role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/gallery";
      url.searchParams.set("error", "UnauthorizedAdminAccess");
      return NextResponse.redirect(url);
    }
  }

  // Protect /submit and /my-submissions routes
  if (pathname.startsWith("/submit") || pathname.startsWith("/my-submissions")) {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "aliverso_secret_key_2026",
    });

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/signin";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/submit/:path*", "/my-submissions/:path*"],
};

export async function middleware(req: NextRequest) {
  return proxy(req);
}
