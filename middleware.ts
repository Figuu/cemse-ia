import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Auth pages (sign-in, sign-up, etc.)
  const authPages = [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ];
  const isAuthPage = authPages.some(route => pathname.startsWith(route));

  // Check if route requires authentication
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/users");

  // API routes that require different handling
  const isAPIProtectedRoute =
    pathname.startsWith("/api/profile") ||
    pathname.startsWith("/api/files") ||
    pathname.startsWith("/api/users");

  // Check session for auth pages - redirect to dashboard if already authenticated
  if (isAuthPage) {
    try {
      const supabase = await createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // User is already authenticated, redirect to dashboard
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/dashboard";
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error("Auth page session check error:", error);
    }
    // No session, allow access to auth pages
    return NextResponse.next();
  }

  // Allow home page and auth API routes without session check
  if (pathname === "/" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Get session for protected routes
  if (isProtectedRoute || isAPIProtectedRoute) {
    try {
      const supabase = await createClient();
      
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Redirect to sign-in if no session
      if (!session) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/sign-in";
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Get user with profile
      const currentUser = await getCurrentUser();

      if (!currentUser || !currentUser.profile) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/sign-in";
        redirectUrl.searchParams.set("error", "invalid_session");
        return NextResponse.redirect(redirectUrl);
      }

      const { profile } = currentUser;

      // Allow access to dashboard and change-password route when password change is forced
      // The dashboard will show a modal prompting the user to change their password

      // 5.4: Dashboard route protection (authenticated users only)
      if (pathname.startsWith("/dashboard")) {
        // All authenticated users can access dashboard
        return NextResponse.next();
      }

      // 5.5 & 5.6: Users route protection (Admin and Super Admin only)
      if (pathname.startsWith("/users")) {
        const isAdmin =
          profile.role === "ADMIN" || profile.role === "SUPER_ADMIN";

        if (!isAdmin) {
          // Redirect non-admin users to dashboard
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = "/dashboard";
          redirectUrl.searchParams.set("error", "unauthorized");
          return NextResponse.redirect(redirectUrl);
        }

        // Admin and Super Admin can access all /users routes including /users/create
        return NextResponse.next();
      }

      // Profile route protection (authenticated users only)
      if (pathname.startsWith("/profile")) {
        return NextResponse.next();
      }

      // API routes protection
      if (pathname.startsWith("/api/profile")) {
        // Profile API routes (authenticated users only)
        return NextResponse.next();
      }

      if (pathname.startsWith("/api/files")) {
        // File API routes (authenticated users only)
        return NextResponse.next();
      }

      if (pathname.startsWith("/api/users")) {
        // Users API routes (Admin and Super Admin only)
        const isAdmin =
          profile.role === "ADMIN" || profile.role === "SUPER_ADMIN";

        if (!isAdmin) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        return NextResponse.next();
      }

      // Allow access to other authenticated routes
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware error:", error);

      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/sign-in";
      redirectUrl.searchParams.set("error", "session_error");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
