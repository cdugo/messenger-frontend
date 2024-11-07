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

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (authRoutes.some(route => pathname.startsWith(route)) && currentUser) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Protect routes that require authentication
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !currentUser) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Configure paths that trigger middleware
export const config = {
  matcher: [...protectedRoutes, ...authRoutes]
}