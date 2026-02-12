/**
 * Next.js 16 Middleware Proxy
 * 
 * This file handles authentication, authorization, and locale validation
 * for all requests entering the application.
 * 
 * In Next.js 16, proxy.ts replaces the traditional middleware.ts file.
 * This proxy integrates NextAuth for authentication and handles route 
 * protection based on user roles.
 */

import { auth } from "@/lib/auth"
import { i18nConfig, type Locale } from "@/i18n-config"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Public routes that don't require authentication
 */
const publicRoutes = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/error",
  "/api/auth",
  "/law-firm",
] as const

/**
 * Protected routes that require authentication
 */
const protectedRoutes = [
  "/dashboard",
  "/appointments",
  "/settings",
  "/admin",
  "/calendar",
  "/services",
  "/staff"
] as const

/**
 * Routes that require admin privileges (full access)
 */
const adminRoutes = [
  "/admin",
] as const

/**
 * Routes that allow authenticated users but may have limited features
 */
const userFeatureRoutes = [
  "/settings/profile",
  "/settings/security",
  "/appointments",
  "/calendar",
  "/services",
  "/staff",
] as const

/**
 * Role hierarchy for permission checking
 * Higher number = more privileges
 */
const roleHierarchy: Record<string, number> = {
  ADMIN: 100,
  OWNER: 70,
  MANAGER: 60,
  MERCHANT: 50,
  STAFF: 40,
  CLIENT: 20,
  GUEST: 10,
}

/**
 * Check if a route is public (doesn't require authentication)
 */
function isPublicRoute(path: string): boolean {
  const pathWithoutLocale = path.replace(/^\/[a-z]{2}/, '') || path
  return publicRoutes.some(route => 
    path === route || 
    path.startsWith(`${route}/`) || 
    pathWithoutLocale === route || 
    pathWithoutLocale.startsWith(`${route}/`)
  )
}

/**
 * Check if a route is protected (requires authentication)
 */
function isProtectedRoute(path: string): boolean {
  const pathWithoutLocale = path.replace(/^\/[a-z]{2}/, '') || path
  return protectedRoutes.some(route => 
    path === `/${pathWithoutLocale}` || 
    path.startsWith(`/${pathWithoutLocale}/`)
  )
}

/**
 * Check if a route requires full admin privileges
 */
function isAdminRoute(path: string): boolean {
  const pathWithoutLocale = path.replace(/^\/[a-z]{2}/, '') || path
  return adminRoutes.some(route => 
    path === `/${pathWithoutLocale}` || 
    path.startsWith(`/${pathWithoutLocale}/`)
  )
}

/**
 * Check if a route is a user feature route (requires auth but limited access)
 */
function isUserFeatureRoute(path: string): boolean {
  const pathWithoutLocale = path.replace(/^\/[a-z]{2}/, '') || path
  return userFeatureRoutes.some(route => 
    path === `/${pathWithoutLocale}` || 
    path.startsWith(`/${pathWithoutLocale}/`)
  )
}

/**
 * Validate and normalize locale from URL
 * Redirects to default locale if locale is invalid
 */
function getValidLocale(lang: string): Locale | null {
  if (i18nConfig.locales.includes(lang as Locale)) {
    return lang as Locale
  }
  return null
}

/**
 * Check if user has required role for route
 */
function hasRequiredRole(userRole: string, routeRole: string): boolean {
  const userLevel = roleHierarchy[userRole] || 0
  const requiredLevel = roleHierarchy[routeRole] || 0
  return userLevel >= requiredLevel
}

/**
 * Extract locale from URL path
 */
function extractLocaleFromPath(pathname: string): { locale: string | null; pathWithoutLocale: string } {
  const segments = pathname.split("/")
  const potentialLocale = segments[1]
  
  const validLocale = getValidLocale(potentialLocale)
  
  if (validLocale) {
    return {
      locale: validLocale,
      pathWithoutLocale: "/" + segments.slice(2).join("/") || "/"
    }
  }
  
  return {
    locale: null,
    pathWithoutLocale: pathname
  }
}

/**
 * Main middleware proxy function
 * 
 * This function intercepts all requests and performs:
 * 1. Locale validation and normalization
 * 2. Authentication checks for protected routes
 * 3. Role-based authorization for admin routes
 * 4. Security headers injection
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // Files with extensions
  ) {
    return NextResponse.next()
  }
  
  // Extract locale and path without locale
  const { locale: validLocale, pathWithoutLocale } = extractLocaleFromPath(pathname)
  
  // Handle root path - redirect to default locale
  if (pathname === "/" || pathname === "") {
    const url = request.nextUrl.clone()
    url.pathname = `/${i18nConfig.defaultLocale}`
    return NextResponse.redirect(url)
  }
  
  // If no valid locale found and not a public route, redirect to default locale
  if (!validLocale && !isPublicRoute(pathWithoutLocale)) {
    const url = request.nextUrl.clone()
    url.pathname = `/${i18nConfig.defaultLocale}${pathWithoutLocale}`
    if (request.nextUrl.search) {
      url.search = request.nextUrl.search
    }
    console.log(`[Middleware] Redirecting to valid locale: ${url.pathname}`)
    return NextResponse.redirect(url)
  }
  
  // Get the session using NextAuth
  let session = null
  try {
    session = await auth()
    if (session?.user) {
      console.log(`[Middleware] User authenticated: ${session.user.username} (${session.user.role})`)
    }
  } catch (error) {
    console.error("[Middleware] Auth error:", error)
    // On auth errors, treat as unauthenticated
    session = null
  }
  
  // Check authentication for protected routes
  if (isProtectedRoute(pathWithoutLocale)) {
    if (!session?.user) {
      // User not authenticated - redirect to signin
      const localePrefix = validLocale ? `/${validLocale}` : ""
      const signinUrl = request.nextUrl.clone()
      signinUrl.pathname = `${localePrefix}/auth/signin`
      signinUrl.searchParams.set("callbackUrl", pathname)
      
      console.log(`[Middleware] User not authenticated, redirecting to signin: ${signinUrl.pathname}`)
      return NextResponse.redirect(signinUrl)
    }
    
    // Check role-based authorization for admin routes
    if (isAdminRoute(pathWithoutLocale)) {
      const userRole = session.user.role || "CLIENT"
      
      // Define minimum role for each admin route
      const routeRole = pathWithoutLocale.startsWith("/admin") ? "ADMIN" : "MANAGER"
      
      if (!hasRequiredRole(userRole, routeRole)) {
        // User doesn't have required role - redirect to dashboard
        const localePrefix = validLocale ? `/${validLocale}` : ""
        const dashboardUrl = request.nextUrl.clone()
        dashboardUrl.pathname = `${localePrefix}/dashboard`
        
        console.log(`[Middleware] User ${session.user.username} (${userRole}) lacks permissions for ${pathWithoutLocale}, redirecting to dashboard`)
        return NextResponse.redirect(dashboardUrl)
      }
    }
    
    // For settings routes - allow authenticated users to access their own settings
    if (pathWithoutLocale.startsWith("/settings")) {
      // All authenticated users can access settings
      console.log(`[Middleware] User ${session.user.username} accessing settings`)
    }
  }
  
  // Prevent authenticated users from accessing public auth pages
  if (session?.user && isPublicRoute(pathWithoutLocale)) {
    // Check if it's an auth page and user is already signed in
    if (pathWithoutLocale.includes("/auth/signin") || pathWithoutLocale.includes("/auth/signup")) {
      // Redirect to dashboard
      const localePrefix = validLocale ? `/${validLocale}` : ""
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = `${localePrefix}/dashboard`
      
      console.log(`[Middleware] Authenticated user trying to access ${pathWithoutLocale}, redirecting to dashboard`)
      return NextResponse.redirect(dashboardUrl)
    }
  }
  
  // Create response for valid requests
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  
  // Add locale info to headers for downstream use
  if (validLocale) {
    response.headers.set("X-Locale", validLocale)
  }
  
  console.log(`[Middleware] Request passed: ${pathname} -> ${pathWithoutLocale}`)
  return response
}

/**
 * Middleware configuration
 * 
 * Configure which routes the middleware should run on.
 * Exclude static files, API routes, and Next.js internals.
 */
export const config = {
  // Match all routes except:
  // - API routes (/api/*)
  // - Static files (_next/*, static/*, *.ico, *.png, etc.)
  // - Public assets
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
