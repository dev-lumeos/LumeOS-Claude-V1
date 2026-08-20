// Session-Middleware fuer apps/coach.
//
// Bauart wie apps/admin/src/middleware.ts: kein oeffentlicher Teil
// ausser dem, was die Anmeldung selbst braucht. Diese Middleware prueft
// NUR die Anmeldung, nicht die Coach-Eigenschaft — die gehoert in die
// Seite (Server Component), weil sie eine ABSAGE zeigen muss statt
// einer Umleitung (T2 ist offen; bis dahin gilt: Coach ist, wer eine
// Beziehung hat — siehe page.tsx).
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { authCookieOptions } from '@lumeos/shared/cookie-name'
import { NextResponse, type NextRequest } from 'next/server'

function isPublicPath(pathname: string): boolean {
  return pathname === '/login' || pathname === '/auth/callback'
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  // Eigener Cookiename fuer das Portal (B-12, Weg B):
  // NEXT_PUBLIC_AUTH_COOKIE_SCOPE=coach -> sb-<ref>-coach-auth-token.
  const cookieOptions = authCookieOptions()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...(cookieOptions ? { cookieOptions } : {}),
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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)',
  ],
}
