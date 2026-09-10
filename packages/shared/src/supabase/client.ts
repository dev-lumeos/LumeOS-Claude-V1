// Supabase Client — Browser
// packages/shared/src/supabase/client.ts
//
// ══ G-411: WARUM HIER EINE EIGENE COOKIE-UMSETZUNG STEHT ═══════════
//
// **BEFUND F-07, gemessen 2026-09-10 an `apps/admin`:**
//
// `[cmd]` **Diese Funktion uebergab an `createBrowserClient` ein
// Options-Objekt mit `cookieOptions`, aber OHNE `cookies`.** `[cmd]`
// **In `@supabase/ssr` 0.1.0 ueberschreibt die Destrukturierung
// `({ cookies, ... } = options)` dann den Vorgabewert mit
// `undefined`** — und `typeof cookies.get` wirft beim ersten
// Speichern der Sitzung:
//
//     TypeError: Cannot read properties of undefined (reading 'get')
//
// `[cmd]` **Am Schirm gemessen: `apps/admin` liess sich NICHT
// anmelden** — Anmeldeseite blieb stehen, kein Cookie, obige
// Ausnahme in der Konsole.
//
// `[read]` **Betroffen war jede App MIT Cookie-Scope** — ohne Scope
// ist `cookieOptions` `undefined`, das Options-Objekt entfaellt, und
// der Vorgabewert greift. **Deshalb lief `apps/web` immer.**
//
// `[cmd]` **`apps/coach` hatte die Umgehung seit F-07 in einer
// eigenen Datei** (`lib/browser-client.ts`) — mit dem Vermerk
// *„apps/admin nutzt denselben Pfad und waere zu pruefen"*.
// `[cmd]` **Geprueft: der Befund traf zu.**
//
// `[read]` **Die Umgehung gehoert hierher, nicht in eine App** —
// sonst haette jede App, die einen Scope setzt, denselben Fehler neu
// zu finden.
import { createBrowserClient } from '@supabase/ssr'

import { authCookieOptions } from './cookie-name'

type CookieOptionen = {
  path?: string
  maxAge?: number
  domain?: string
  sameSite?: boolean | 'lax' | 'strict' | 'none'
  secure?: boolean
}

function lesen(name: string): string | undefined {
  const treffer = document.cookie
    .split('; ')
    .find(teil => teil.startsWith(`${name}=`))
  return treffer ? decodeURIComponent(treffer.slice(name.length + 1)) : undefined
}

function schreiben(name: string, value: string, optionen: CookieOptionen): void {
  const teile = [`${name}=${encodeURIComponent(value)}`]
  teile.push(`Path=${optionen.path ?? '/'}`)
  if (optionen.maxAge !== undefined) teile.push(`Max-Age=${optionen.maxAge}`)
  if (optionen.domain) teile.push(`Domain=${optionen.domain}`)
  const sameSite = optionen.sameSite === true ? 'strict' : optionen.sameSite
  if (sameSite) teile.push(`SameSite=${sameSite}`)
  if (optionen.secure) teile.push('Secure')
  document.cookie = teile.join('; ')
}

export function createClient() {
  // cookieOptions nur, wenn diese App einen eigenen Namen führt (B-12,
  // Weg B). Ohne die Variable bleibt es bei der Ableitung von
  // supabase-js — siehe cookie-name.ts.
  const cookieOptions = authCookieOptions()

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // `[cmd]` **Zweiter 0.1.0-Befund:** `createServerClient`
      // uebernimmt `cookieOptions.name` als `storageKey`
      // (dist:230-233), `createBrowserClient` NICHT — ohne die
      // explizite Angabe schriebe der Browser `sb-127-auth-token`
      // (den web-Namen) statt `sb-127-coach-auth-token`.
      // `[cmd]` **Gemessen ueber `kontext.cookies()`.**
      ...(cookieOptions
        ? { cookieOptions, auth: { storageKey: cookieOptions.name } }
        : {}),
      // `[read]` **Ohne diesen Block wirft 0.1.0**, sobald oben
      // `cookieOptions` steht — das ist F-07.
      cookies: {
        get: lesen,
        set: schreiben,
        remove: (name: string, optionen: CookieOptionen) =>
          schreiben(name, '', { ...optionen, maxAge: 0 }),
      },
    },
  )
}
