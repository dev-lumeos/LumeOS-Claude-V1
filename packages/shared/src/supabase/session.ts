// Supabase Client — Server mit Session (Cookies via next/headers)
// packages/shared/src/supabase/session.ts
//
// Eigener Einstiegspunkt `@lumeos/shared/session` (nicht im Barrel):
// `next/headers` ist nur in Server Components / Route Handlers erlaubt —
// im Barrel würde jeder Client-Component-Import daran scheitern.
//
// Offizielles @supabase/ssr-Muster (v0.1.x: get/set/remove).
// Bewusst KEINE cookieOptions — @supabase/ssr richtet PKCE und
// Cookie-Handhabung selbst ein (Spez. login/00-modul-login.md §10).

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createSessionClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
