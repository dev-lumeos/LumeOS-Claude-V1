// Browser-Client des Portals — mit EXPLIZITER Cookie-Implementierung.
//
// BEFUND F-07: `createClient()` aus packages/shared uebergibt an
// createBrowserClient ein Options-Objekt mit `cookieOptions`, aber ohne
// `cookies`. In @supabase/ssr 0.1.0 ueberschreibt die Destrukturierung
// `({ cookies, ... } = options)` dann den Default mit undefined, und
// `typeof cookies.get` wirft beim ersten Speichern der Session:
// "Cannot read properties of undefined (reading 'get')" —
// [cmd] im Browser gemessen (AUTH 200, danach PAGEERROR aus
// @supabase/ssr/dist/index.mjs:137). apps/web ist nicht betroffen
// (kein Cookie-Scope -> options undefined -> Default greift);
// apps/admin nutzt denselben Pfad und waere zu pruefen — gehoert dem
// Admin-Auftrag, hier nur gemeldet.
import { createBrowserClient } from '@supabase/ssr'
import { authCookieOptions } from '@lumeos/shared/cookie-name'

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
  const cookieOptions = authCookieOptions()

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Zweiter 0.1.0-Befund: createServerClient uebernimmt
      // cookieOptions.name als storageKey (dist:230-233),
      // createBrowserClient NICHT — ohne die explizite Angabe schriebe
      // der Browser sb-127-auth-token (den web-Namen) statt
      // sb-127-coach-auth-token. [cmd] gemessen ueber kontext.cookies().
      ...(cookieOptions
        ? { cookieOptions, auth: { storageKey: cookieOptions.name } }
        : {}),
      cookies: {
        get: lesen,
        set: schreiben,
        remove: (name: string, optionen: CookieOptionen) =>
          schreiben(name, '', { ...optionen, maxAge: 0 }),
      },
    },
  )
}
