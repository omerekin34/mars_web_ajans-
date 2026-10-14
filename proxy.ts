import { NextResponse, type NextRequest } from "next/server";
import { adminSessionCookieName, readAdminSession } from "@/lib/admin/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await readAdminSession(request.cookies.get(adminSessionCookieName())?.value);
  const loginUrl = new URL("/admin/login", request.url);
  const isAdminApi = pathname.startsWith("/api/admin/");
  const isPublicAdminApi = pathname === "/api/admin/login" || pathname === "/api/admin/logout";

  if (pathname === "/admin/login") {
    if (session) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (isAdminApi) {
    if (isPublicAdminApi) return NextResponse.next();
    if (!session) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
    return NextResponse.next();
  }

  if (!session) {
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
