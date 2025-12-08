import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que requieren autenticación
const protectedRoutes = [
  "/dashboard",
  "/chat",
  "/settings",
  "/subscription",
  "/profile",
];

// Rutas de auth (redirigen a dashboard si ya están autenticados)
const authRoutes = ["/login", "/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Obtener token de las cookies
  const accessToken = request.cookies.get("nexo_access_token")?.value;
  const isAuthenticated = !!accessToken;

  // Debug en desarrollo
  if (process.env.NODE_ENV === "development") {
    console.log(`[Middleware] Path: ${pathname}, Auth: ${isAuthenticated}`);
  }

  // Verificar si es una ruta protegida
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Verificar si es una ruta de auth (login, register)
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Si intenta acceder a ruta protegida sin auth → redirigir a login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Guardar la URL original para redirigir después del login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si está autenticado e intenta acceder a login/register → redirigir a dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Continuar normalmente
  return NextResponse.next();
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/).*)",
  ],
};

