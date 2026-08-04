// Auth-Callback (M3 Login): Code gegen Session tauschen, dann weiter.
// Route Handler darf Cookies schreiben — hier landet die Session im Cookie.
import { NextResponse } from 'next/server'
import { createSessionClient } from '@lumeos/shared/session'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const raw = url.searchParams.get('redirect')
  const target = raw && raw.startsWith('/') ? raw : '/dashboard'

  if (code) {
    const supabase = createSessionClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(target, url.origin))
}
