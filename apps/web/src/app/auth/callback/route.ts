// Auth-Callback (M3 Login): Code gegen Session tauschen, dann weiter.
// Route Handler darf Cookies schreiben — hier landet die Session im Cookie.
import { NextResponse } from 'next/server'
import { createSessionClient } from '@lumeos/shared/session'

import { safeRedirect } from '../../../lib/auth/safe-redirect'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  // Vorher: raw.startsWith('/') — das liess `//evil.com` durch und war
  // damit ein offener Redirect ([cmd] belegt, D-04-Fund 2026-08-06).
  const target = safeRedirect(url.searchParams.get('redirect'))

  if (code) {
    const supabase = createSessionClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(target, url.origin))
}
