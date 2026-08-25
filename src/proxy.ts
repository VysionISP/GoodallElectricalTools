import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/login", "/signup", "/suspended"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isLanding = pathname === "/";
  const isPublic =
    isLanding || PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthed = !!req.auth;

  if (!isAuthed && !isPublic) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Signed-in users skip the marketing/auth pages and go to their home:
  // the platform console for the platform admin, the dashboard otherwise.
  if (isAuthed && (isLanding || pathname === "/login" || pathname === "/signup")) {
    const home = req.auth?.user?.isPlatformAdmin ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(home, req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  // brand/ and icon.png are public static assets (logo lockups, favicon) —
  // without excluding them the auth redirect breaks the logo images on the
  // public pages themselves.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|icon.png|brand/).*)"],
};
