import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // If at root, redirect to home
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Allow access to public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/home',
    '/login',
    '/signup',
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}