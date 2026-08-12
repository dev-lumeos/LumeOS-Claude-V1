// Supabase Client — Server mit Session (Cookies via next/headers)
// packages/shared/src/supabase/session.ts
//
// Eigener Einstiegspunkt `@lumeos/shared/session` (nicht im Barrel):
// `next/headers` ist nur in Server Components / Route Handlers erlaubt —
// im Barrel würde jeder Client-Component-Import daran scheitern.
//
// Offizielles @supabase/ssr-Muster (v0.1.x: get/set/remove).
// PKCE und Cookie-Handhabung richtet @supabase/ssr selbst ein
// (Spez. login/00-modul-login.md §10) — gesetzt wird ausschliesslich
// der NAME, und auch der nur, wenn die App einen eigenen führt
// (B-12, Weg B; siehe cookie-name.ts). Insbesondere KEIN `domain`.

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { authCookieOptions } from './cookie-name'

export function createSessionClient() {
  const cookieStore = cookies()
  const cookieOptions = authCookieOptions()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...(cookieOptions ? { cookieOptions } : {}),
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Server Components dürfen keine Cookies schreiben —
            // die Session-Erneuerung übernimmt die Middleware.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // wie oben
          }
        },
      },
    },
  )
}
