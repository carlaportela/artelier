import { type NextRequest, NextResponse } from "next/server";

// Cookie name used by Auth.js v5 with database sessions.
// With JWT sessions this would be "authjs.session-token" too, but the value
// would be a signed JWT rather than a random session ID.
const SESSION_COOKIE = "authjs.session-token";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLoggedIn =
    req.cookies.has(SESSION_COOKIE) ||
    req.cookies.has(`__Secure-${SESSION_COOKIE}`);

  // AC3: /studio/* → requires authentication
  if (pathname.startsWith("/studio") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // AC4: /admin/* → requires authentication (role check deferred to Historia 1.2)
  if (pathname.startsWith("/admin") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/feed", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static assets, API routes, and Next.js internals.
  matcher: ["/((?!api|_next/static|_next/image|fonts|favicon\\.ico).*)"],
};
