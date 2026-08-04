// Session-Middleware (M3 Login).
// Erneuert die Session bei jedem Aufruf (offizielles @supabase/ssr-Muster
// v0.1.x mit Request/Response-Cookies — dieser Client kann nicht aus
// packages/shared kommen, weil er an NextRequest/NextResponse hängt).
// Unangemeldete Aufrufe geschützter Routen -> /login?redirect=<ziel>.
// Bewusst KEINE cookieOptions (Spez. login/00-modul-login.md §10).
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isPublicPath(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/auth/callback'
  )
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    },
  )

  // getUser() validiert gegen den Auth-Server und erneuert die Session.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl
  if (!user && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = ''
    loginUrl.searchParams.set('redirect', pathname + search)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  // Alles ausser Next-Interna und statischen Dateien (inkl. /mockup).
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|mockup|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)',
  ],
}
