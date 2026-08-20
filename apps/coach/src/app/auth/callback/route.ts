// Auth-Callback fuer apps/coach: Code gegen Session tauschen, dann
// weiter. Bauart wie apps/admin/src/app/auth/callback/route.ts.
import { NextResponse } from 'next/server'
import { createSessionClient } from '@lumeos/shared/session'
import { safeRedirect } from '@lumeos/shared/auth/safe-redirect'

export const dynamic = 'force-dynamic'

const COACH_DEFAULT = '/'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const target = safeRedirect(url.searchParams.get('redirect'), COACH_DEFAULT)

  if (code) {
    const supabase = createSessionClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(target, url.origin))
}
