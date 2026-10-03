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
// `[cmd]` **G-586: der erneuernde `fetch` liegt in
// `uhrensprung.ts`** -- er haengt an keinem `next/headers` und
// ist deshalb ohne Next-Umgebung pruefbar.
import { fetchMitEinmaligerErneuerung } from './uhrensprung'

export function createSessionClient() {
  const cookieStore = cookies()
  const cookieOptions = authCookieOptions()

  // `[read]` **Der Client muss sich selbst erneuern koennen** —
  // deshalb die Vorwaertsreferenz: `fetch` braucht ihn, und er
  // braucht `fetch`.
  let selbst: ReturnType<typeof createServerClient> | null = null

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...(cookieOptions ? { cookieOptions } : {}),
      // ══ G-586: einmal erneuern statt rausschmeissen ════════════
      //
      // `[cmd]` **`refreshSession()` geht ueber
      // `grant_type=refresh_token`** — gemessen: der traegt kein
      // `iat` und faellt an keiner Uhr. **Genau deshalb hilft er.**
      //
      // `[read]` **Der neue Keks kann hier nicht ankommen** (Server
      // Components duerfen nicht schreiben, siehe `set` unten) —
      // **aber das ist egal:** `supabase-js` haelt das frische
      // Token im Speicher, und die Wiederholung laeuft damit. Die
      // naechste Anfrage erneuert die Middleware.
      global: {
        fetch: fetchMitEinmaligerErneuerung(async () => {
          const { data, error } = await selbst!.auth.refreshSession()
          // `[read]` **Das TOKEN zurueckgeben, nicht `true`** — die
          // Wiederholung setzt es in den Kopf.
          return error ? null : data.session?.access_token ?? null
        }),
      },
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
  selbst = client
  return client
}
