import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/signup']
const API_AUTH_PREFIX = '/api/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const isApiAuth = pathname.startsWith(API_AUTH_PREFIX)
  const session = request.cookies.get('session')?.value

  if (isApiAuth) return NextResponse.next()
  if (isPublic) {
    if (session) return NextResponse.redirect(new URL('/', request.url))
    return NextResponse.next()
  }
  if (!session) return NextResponse.redirect(new URL('/login', request.url))
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
