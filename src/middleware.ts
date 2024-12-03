import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes
const protectedRoutes = [
  '/home',
]

// Define public routes that should redirect if user is authenticated
const authRoutes = [
  '/login',
  '/signup'
]

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('message_app_session')
  const { pathname } = request.nextUrl
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Create URLs for redirects
  const homeUrl = new URL('/home', request.url)
  const loginUrl = new URL('/login', request.url)

  // If at root, redirect to home (which will then check auth)
  if (pathname === '/') {
    return NextResponse.redirect(homeUrl)
  }

  // If user is authenticated and tries to access auth routes
  if (currentUser && isAuthRoute) {
    const response = NextResponse.redirect(homeUrl)
    return response
  }

  // If user is not authenticated and tries to access protected routes
  if (!currentUser && isProtectedRoute) {
    const response = NextResponse.redirect(loginUrl)
    return response
  }

  // For all other routes, continue
  return NextResponse.next()
}

// Configure paths that trigger middleware
export const config = {
  matcher: [
    '/',
    '/home',
    '/login',
    '/signup',
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}