import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicRoutes = [
    "/",
    "/home",
    "/about",
    "/mapa",
    "/calendario-eventos",
    "/organizadores",
    "/event-calender",
    "/discover-organiser",
    "/activity-details",
    "/event-detail",
  ];

  if (pathname.startsWith("/discover-organiser/")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/organizadores/")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/calendario-eventos/")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/mapa/")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/activity-details/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/event-detail/")) {
    return NextResponse.next();
  }

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "mycotur-secret-key",
  });
  if (
    pathname === "/admin/login" ||
    pathname === "/login" ||
    pathname.startsWith("/register/")
  ) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    const isAdminRoute =
      pathname.startsWith("/agents") || pathname.startsWith("/admin");
    return NextResponse.redirect(
      new URL(isAdminRoute ? "/admin/login" : "/login", request.url)
    );
  }

  if (pathname.startsWith("/agents") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (pathname.startsWith("/profile") && token.role !== "agent") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/activities/:path*",
    "/events/:path*",
    "/agents/:path*",
    "/profile/:path*",
    "/login",
    "/admin/login",
    "/register/:path*",
    "/",
    "/home",
    "/about",
    "/mapa",
    "/mapa/:path*",
    "/calendario-eventos",
    "/calendario-eventos/:path*",
    "/organizadores/:path*",
    "/activity-details/:path*",
    "/event-detail/:path*",
  ],
};
