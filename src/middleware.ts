import { NextRequest, NextResponse } from "next/server";

const blockedPaths = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (blockedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
