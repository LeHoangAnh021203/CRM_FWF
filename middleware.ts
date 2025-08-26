import { NextRequest, NextResponse } from "next/server";

// Types
interface RateLimitInfo {
  count: number;
  resetTime: number;
}

interface UserLocation {
  country: string;
  region: string;
  city: string;
}

interface ABTestConfig {
  variants: string[];
  weights: number[];
}

interface ABTests {
  [key: string]: ABTestConfig;
}

interface Locales {
  [key: string]: string;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitInfo>();

// Configuration
const CONFIG = {
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // requests per window
    API_WINDOW_MS: 60 * 1000, // 1 minute for API
    API_MAX_REQUESTS: 30, // API requests per minute
  },

  // Security
  SECURITY: {
    ALLOWED_ORIGINS: ["https://yourdomain.com", "http://localhost:3000"],
    BLOCKED_USER_AGENTS: ["bot", "crawler", "spider"],
    BLOCKED_IPS: [] as string[], // Add IPs to block
  },

  // A/B Testing
  AB_TESTING: {
    ENABLED: true,
    TESTS: {
      homepage: {
        variants: ["A", "B"],
        weights: [0.5, 0.5], // 50% each
      },
      pricing: {
        variants: ["standard", "premium"],
        weights: [0.7, 0.3], // 70% standard, 30% premium
      },
    } as ABTests,
  },

  // Localization
  LOCALES: {
    VN: "vi",
    US: "en",
    JP: "ja",
    KR: "ko",
  } as Locales,

  // Public routes that don't need authentication
  PUBLIC_ROUTES: [
    "/login",
    "/signup",
    "/forgotPassword",
    "/reset-password",
    "/dashboard",

    "/test-customers",
    "/api/proxy/auth/login",
    "/api/proxy/auth/refresh",
    "/api/proxy/auth/signup",
    "/api/ai/generate",
    "/api/health",
  ],

  // Admin-only routes
  ADMIN_ROUTES: ["/dashboard/admin", "/api/admin", "/settings/admin"],
};

// Utility functions
function getClientIP(request: NextRequest): string {
  return (
    (request as { ip?: string }).ip ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function getUserLocation(request: NextRequest): UserLocation {
  // In production, use a real geo-location service
  const country =
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    "US";

  return {
    country,
    region: request.headers.get("x-vercel-ip-region") || "Unknown",
    city: request.headers.get("x-vercel-ip-city") || "Unknown",
  };
}

function isRateLimited(identifier: string, isApi: boolean = false): boolean {
  const now = Date.now();
  const config = isApi
    ? {
        window: CONFIG.RATE_LIMIT.API_WINDOW_MS,
        max: CONFIG.RATE_LIMIT.API_MAX_REQUESTS,
      }
    : {
        window: CONFIG.RATE_LIMIT.WINDOW_MS,
        max: CONFIG.RATE_LIMIT.MAX_REQUESTS,
      };

  const info = rateLimitStore.get(identifier);

  if (!info || now > info.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.window,
    });
    return false;
  }

  if (info.count >= config.max) {
    return true;
  }

  info.count++;
  return false;
}

function getABTestVariant(testName: string, userId: string): string {
  if (!CONFIG.AB_TESTING.ENABLED || !CONFIG.AB_TESTING.TESTS[testName]) {
    return "A"; // default
  }

  const test = CONFIG.AB_TESTING.TESTS[testName];
  const hash = userId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const random = Math.abs(hash) % 100;
  let cumulative = 0;

  for (let i = 0; i < test.variants.length; i++) {
    cumulative += test.weights[i] * 100;
    if (random < cumulative) {
      return test.variants[i];
    }
  }

  return test.variants[0];
}

function getLocaleFromCountry(country: string): string {
  return CONFIG.LOCALES[country] || "en";
}

function isBlockedRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get("user-agent") || "";
  const ip = getClientIP(request);

  // Check blocked User-Agents
  if (
    CONFIG.SECURITY.BLOCKED_USER_AGENTS.some((blocked) =>
      userAgent.toLowerCase().includes(blocked.toLowerCase()),
    )
  ) {
    return true;
  }

  // Check blocked IPs
  if (CONFIG.SECURITY.BLOCKED_IPS.includes(ip)) {
    return true;
  }

  return false;
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "media-src 'self' data: blob:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https:; " +
      "frame-ancestors 'none';",
  );

  // CORS headers for API routes
  if (response.headers.get("content-type")?.includes("application/json")) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
  }

  return response;
}

function checkAuthentication(request: NextRequest): {
  isAuthenticated: boolean;
  token: string | null;
  userRole: string | null;
} {
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  console.log("[Middleware] Checking authentication:", {
    hasCookieToken: !!request.cookies.get("token")?.value,
    hasAuthHeader: !!request.headers.get("authorization"),
    token: token ? "present" : "missing",
  });

  if (!token) {
    return { isAuthenticated: false, token: null, userRole: null };
  }

  try {
    // Decode JWT token to get user info
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userRole = payload.authorities?.[0] || "USER";

    console.log("[Middleware] Token decoded successfully:", {
      userRole,
      exp: payload.exp,
      iat: payload.iat,
    });

    return { isAuthenticated: true, token, userRole };
  } catch (error) {
    console.error("Token decode error:", error);
    return { isAuthenticated: false, token: null, userRole: null };
  }
}

// Main middleware function
export default function middleware(request: NextRequest) {
  const startTime = Date.now();
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  console.log(
    `[Middleware] ${method} ${pathname} - ${new Date().toISOString()}`,
  );

  // Special handling for forgotPassword route
  if (pathname.startsWith("/forgotPassword")) {
    console.log(`[Middleware] Processing forgotPassword route: ${pathname}`);
    let response = NextResponse.next();
    response = addSecurityHeaders(response);
    response.headers.set("X-ForgetPassword-Route", "true");
    return response;
  }

  // 1. Security checks
  if (!pathname.startsWith("/forgotPassword") && isBlockedRequest(request)) {
    console.log(`[Middleware] Blocked request from ${getClientIP(request)}`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. Rate limiting
  const clientIP = getClientIP(request);
  const isApiRoute = pathname.startsWith("/api");
  const rateLimitKey = `${clientIP}:${pathname}`;

  // Skip rate limiting for forgotPassword route
  if (
    !pathname.startsWith("/forgotPassword") &&
    isRateLimited(rateLimitKey, isApiRoute)
  ) {
    console.log(`[Middleware] Rate limited: ${clientIP} for ${pathname}`);
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  // 3. Authentication & Authorization
  const { isAuthenticated, token, userRole } = checkAuthentication(request);
  const isPublicRoute = CONFIG.PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminRoute = CONFIG.ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  console.log(`[Middleware] Auth check for ${pathname}:`, {
    isAuthenticated,
    hasToken: !!token,
    userRole,
    isPublicRoute,
    isAdminRoute,
    publicRoutes: CONFIG.PUBLIC_ROUTES,
    pathname,
  });

  // Check if route requires authentication
  // Allow access to media files without authentication
  const isMediaFile =
    /\.(mp4|webm|ogg|jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/i.test(
      pathname,
    );

  // If user is authenticated, allow access to all routes
  if (isAuthenticated) {
    console.log(`[Middleware] Authenticated user accessing ${pathname}`);
  } else if (
    !isPublicRoute &&
    !isMediaFile &&
    !pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/forgotPassword")
  ) {
    console.log(
      `[Middleware] Unauthenticated access to ${pathname}, redirecting to login`,
    );
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin permissions
  if (
    !pathname.startsWith("/forgotPassword") &&
    isAdminRoute &&
    userRole !== "ROLE_ADMIN"
  ) {
    console.log(
      `[Middleware] Unauthorized admin access: ${userRole} to ${pathname}`,
    );
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 4. Localization redirects
  const userLocation = getUserLocation(request);
  const preferredLocale = getLocaleFromCountry(userLocation.country);

  // Only redirect if not already on a localized route and not an auth route
  const isAuthRoute =
    pathname.includes("/login") ||
    pathname.includes("/signup") ||
    pathname.includes("/forgotPassword") ||
    pathname.includes("/reset-password");

  // Skip localization for dashboard routes when authenticated and media files
  if (
    !pathname.startsWith(`/${preferredLocale}`) &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !isAuthRoute &&
    pathname !== "/" &&
    !pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/forgotPassword") &&
    !pathname.startsWith("/test-customers") &&

    !isMediaFile
  ) {
    const localizedUrl = new URL(`/${preferredLocale}${pathname}`, request.url);
    console.log(
      `[Middleware] Localization redirect: ${pathname} -> ${localizedUrl.pathname}`,
    );
    return NextResponse.redirect(localizedUrl);
  }

  // 5. A/B Testing
  let response = NextResponse.next();

  if (CONFIG.AB_TESTING.ENABLED && !pathname.startsWith("/forgotPassword")) {
    const userId = token || clientIP; // Use token as user ID if available

    // Homepage A/B testing
    if (pathname === "/" || pathname === "/homepage") {
      const variant = getABTestVariant("homepage", userId);
      response.headers.set("X-AB-Test-Homepage", variant);
      console.log(
        `[Middleware] A/B Test - Homepage variant: ${variant} for user: ${userId}`,
      );
    }

    // Pricing page A/B testing
    if (pathname.startsWith("/pricing")) {
      const variant = getABTestVariant("pricing", userId);
      response.headers.set("X-AB-Test-Pricing", variant);
      console.log(
        `[Middleware] A/B Test - Pricing variant: ${variant} for user: ${userId}`,
      );
    }
  }

  // 6. Add security headers
  response = addSecurityHeaders(response);

  // 7. Add custom headers
  response.headers.set(
    "X-Request-ID",
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  );
  response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`);
  response.headers.set("X-User-Country", userLocation.country);
  response.headers.set("X-User-Region", userLocation.region);
  response.headers.set("X-User-City", userLocation.city);

  if (isAuthenticated) {
    response.headers.set("X-User-Role", userRole || "USER");
    response.headers.set("X-Authenticated", "true");
  }

  // 8. Logging
  const processingTime = Date.now() - startTime;
  console.log(
    `[Middleware] Completed ${method} ${pathname} in ${processingTime}ms - Auth: ${isAuthenticated}, Role: ${userRole}, Country: ${userLocation.country}`,
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (including media files)
     * - robots.txt
     * - sitemap.xml
     */
    "/((?!_next/static|_next/image|favicon.ico|public|robots.txt|sitemap.xml|fox.mp4).*)",
  ],
};
