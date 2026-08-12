// Auth-Callback fuer apps/admin: Code gegen Session tauschen, dann weiter.
// Route Handler darf Cookies schreiben — hier landet die Session im Cookie.
// Bauart wie apps/web/src/app/auth/callback/route.ts.
import { NextResponse } from 'next/server'
import { createSessionClient } from '@lumeos/shared/session'
import { safeRedirect } from '@lumeos/shared/auth/safe-redirect'

export const dynamic = 'force-dynamic'

/** Standardziel dieser App (apps/web nutzt /dashboard). */
const ADMIN_DEFAULT = '/'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  // `//evil.com` besteht ein blosses startsWith('/') und fuehrt auf einen
  // fremden Host ([cmd] belegt, D-04-Fund 2026-08-06) — deshalb die
  // gemeinsame Pruefung aus packages/shared, nicht inline.
  const target = safeRedirect(url.searchParams.get('redirect'), ADMIN_DEFAULT)

  if (code) {
    const supabase = createSessionClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(target, url.origin))
}
