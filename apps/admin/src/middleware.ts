// Session-Middleware fuer apps/admin.
//
// Bauart wie apps/web/src/middleware.ts — dieser Client kann NICHT aus
// packages/shared kommen, weil er an NextRequest/NextResponse haengt
// (dort steht dieselbe Begruendung).
//
// UNTERSCHIED ZU apps/web, bewusst:
//   web hat einen oeffentlichen Teil (Landingpage, /login, /auth/callback).
//   admin hat KEINEN. `[read]` Die Spezifikation fuehrt admin unter
//   "angemeldet + Admin-Zugehoerigkeit" (10-plattform/auth-sso §2) und
//   verlinkt es bewusst nicht aus web (20-apps/web §6: "ein Link aus web
//   wuerde nahelegen, dass sie zum Produkt gehoeren").
//   Oeffentlich bleibt hier deshalb nur, was die Anmeldung selbst braucht.
//
// Diese Middleware prueft NUR die Anmeldung, nicht die Admin-Rolle.
// Die Rollenpruefung gehoert in die Seite (Server Component), weil sie
// eine ABSAGE zeigen muss statt einer Umleitung — siehe page.tsx.
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isPublicPath(pathname: string): boolean {
  return pathname === '/login' || pathname === '/auth/callback'
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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)',
  ],
}
