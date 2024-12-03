import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/home']
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('message_app_session')
  const { pathname } = request.nextUrl

  // Create URLs for redirects
  const homeUrl = new URL('/home', request.url)
  const loginUrl = new URL('/login', request.url)

  // Verify authentication by making a request to your backend
  const isAuthenticated = sessionCookie ? await verifyAuth(request) : false

  // If at root, redirect to home
  if (pathname === '/') {
    return NextResponse.redirect(homeUrl)
  }

  // If user is authenticated and tries to access auth routes
  if (isAuthenticated && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(homeUrl)
  }

  // If user is not authenticated and tries to access protected routes
  if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

async function verifyAuth(request: NextRequest): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
      credentials: 'include',
    })
    return response.ok
  } catch (error) {
    console.error('Auth verification failed:', error)
    return false
  }
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