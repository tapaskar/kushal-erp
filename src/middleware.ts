import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-in-production-min-32-chars!!"
);

const PUBLIC_PATHS = ["/login", "/verify-otp", "/api/auth", "/api/webhooks", "/api/health", "/quote", "/vendor-register"];

// Society dashboard routes that super admins should not access
const SOCIETY_PATHS = [
  "/members",
  "/billing",
  "/payments",
  "/defaulters",
  "/inventory",
  "/notices",
  "/complaints",
  "/reports",
  "/society",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check session cookie
  const token = request.cookies.get("rwa-session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role as string | undefined;

    // Super admin visiting society pages → redirect to /admin
    if (role === "super_admin" && SOCIETY_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Super admin visiting / (dashboard root) → redirect to /admin
    if (role === "super_admin" && pathname === "/") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Non-super-admin visiting /admin → redirect to /
    if (role !== "super_admin" && pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    // Invalid/expired token
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
