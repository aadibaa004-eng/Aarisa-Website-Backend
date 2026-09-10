import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";

/**
 * Public routes – requests matching these patterns bypass JWT verification.
 * Everything else under /api/ requires a valid auth_token cookie.
 */
const PUBLIC_PATTERNS: Array<{ methods: string[]; pattern: RegExp }> = [
  // Auth endpoints are always public
  { methods: ["GET", "POST", "DELETE", "HEAD"], pattern: /^\/api\/auth\// },
  // Public read access to blogs (list + single)
  { methods: ["GET", "HEAD"], pattern: /^\/api\/blogs(\/[^/]+)?$/ },
  // Public read access to reviews
  { methods: ["GET", "HEAD"], pattern: /^\/api\/reviews$/ },
  // Public read access to all review screenshots
  { methods: ["GET", "HEAD"], pattern: /^\/api\/reviews\/screenshots$/ },
  // Public read access to per-review screenshots
  { methods: ["GET", "HEAD"], pattern: /^\/api\/reviews\/[^/]+\/screenshots$/ },
  // Public read access to gallery
  { methods: ["GET", "HEAD"], pattern: /^\/api\/gallery$/ },
  // Public read access to gallery categories (list + single) and their images.
  // Mutations (POST/PUT/PATCH/DELETE) remain protected.
  {
    methods: ["GET", "HEAD"],
    pattern: /^\/api\/gallery\/categories(\/[^/]+)?(\/images)?$/,
  },
  // Public read access to uncategorized gallery images.
  // Mutations (POST) and per-image updates (PATCH/DELETE /api/gallery/images/:id)
  // remain protected.
  { methods: ["GET", "HEAD"], pattern: /^\/api\/gallery\/images$/ },
  // Public contact form submission
  { methods: ["POST"], pattern: /^\/api\/contact$/ },
];

function isPublic(method: string, pathname: string): boolean {
  return PUBLIC_PATTERNS.some(
    (r) => r.methods.includes(method) && r.pattern.test(pathname)
  );
}

function addCorsHeaders(response: NextResponse, origin: string | null): void {
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const origin = request.headers.get("origin");

  // Only process API routes
  if (!pathname.startsWith("/api/")) return NextResponse.next();

  // Handle CORS preflight requests — always allow
  if (method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin ?? "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  // Allow public routes through without checking auth
  if (isPublic(method, pathname)) {
    const response = NextResponse.next();
    addCorsHeaders(response, origin);
    return response;
  }

  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    console.error("[MIDDLEWARE] No token found in cookies for", pathname);
    const response = NextResponse.json(
      { success: false, message: "Unauthorized. Please login to continue." },
      { status: 401 }
    );
    addCorsHeaders(response, origin);
    return response;
  }

  try {
    await verifyToken(token);
    const response = NextResponse.next();
    addCorsHeaders(response, origin);
    return response;
  } catch (error) {
    console.error("[MIDDLEWARE] Token verification failed for", pathname, error);
    const response = NextResponse.json(
      { success: false, message: "Invalid or expired token. Please login again." },
      { status: 401 }
    );
    addCorsHeaders(response, origin);
    return response;
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
