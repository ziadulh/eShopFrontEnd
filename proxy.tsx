import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy
 * The file is 'proxy.tsx' and the function is now named 'proxy'
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isAdminPath = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/login";

  // 1. Redirect to login if accessing admin without a token
  if (isAdminPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Redirect to admin if already logged in and hitting login page
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

/**
 * The matcher remains the same
 */
export const config = {
  matcher: ["/admin/:path*", "/login"],
};
