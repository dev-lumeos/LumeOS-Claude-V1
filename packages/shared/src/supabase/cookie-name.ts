// Cookiename der Sitzung — eine Quelle für alle vier Client-Stellen.
// packages/shared/src/supabase/cookie-name.ts
//
// ANLASS: B-12, Weg B (Tom, 2026-08-12). `apps/admin` bekommt eine
// EIGENE Sitzung, getrennt von `apps/web` — lokal wie in Produktion,
// ohne umgebungsabhängigen Sonderweg.
//
// WARUM ES BISHER NICHT GETRENNT WAR: `[cmd]` An keiner der vier
// Client-Stellen wurde `cookieOptions.name` gesetzt. supabase-js leitet
// den `storageKey` dann selbst ab —
//     `sb-${url.hostname.split('.')[0]}-auth-token`
// (SupabaseClient-Konstruktor, 2.104.0). Beide Apps zeigen auf dieselbe
// Supabase-URL, bekamen also denselben Namen. Auf `localhost` teilen sie
// sich damit die Sitzung, weil Cookies nach HOST getrennt werden und
// nicht nach Port.
//
// ---------------------------------------------------------------------
// WARUM DER UMGEBUNGSTEIL BLEIBT
// Der abgeleitete Name trägt die Projekt-Referenz: lokal
// `sb-127-auth-token`, in der Cloud `sb-<ref>-auth-token`. Damit
// kollidieren die Sitzungen verschiedener Umgebungen nie — wer lokal und
// gegen die Cloud arbeitet, hat zwei getrennte Cookies.
// `[cmd]` Ein flacher Name wie `sb-admin-auth-token` würde genau das
// aufgeben: lokale und Cloud-Sitzung der Verwaltung trügen denselben
// Namen und überschrieben sich gegenseitig.
// Deshalb wird hier NICHT ersetzt, sondern ERGÄNZT: der Umgebungsteil
// bleibt abgeleitet, die App hängt ihr Kürzel dazwischen.
//
//   web    sb-127-auth-token          (unverändert, kein Suffix)
//   admin  sb-127-admin-auth-token
//
// WARUM `web` UNVERÄNDERT BLEIBT: Es ist die App mit den Nutzerkonten.
// Ein neuer Name dort würde jede bestehende Sitzung ungültig machen,
// ohne dass es dem Zweck dient — getrennt sind die beiden schon, sobald
// EINE von beiden einen eigenen Namen trägt.
//
// ---------------------------------------------------------------------
// WIE DIE APP IHR KÜRZEL SETZT: über `NEXT_PUBLIC_AUTH_COOKIE_SCOPE`.
// Eine Umgebungsvariable und kein Funktionsparameter, weil
// `packages/shared` von BEIDEN Apps benutzt wird und die vier
// Client-Stellen von vielen Aufrufern erreicht werden `[cmd]` (14
// Dateien rufen createClient/createSessionClient). Ein Parameter müsste
// durch jede einzelne durchgereicht werden — eine vergessene Stelle
// fiele auf den geteilten Namen zurück und wäre still wieder verbunden.
// `NEXT_PUBLIC_*` inlined Next.js in den Browser-Bundle, dieselbe
// Mechanik wie bei URL und anon-Schlüssel; damit gilt der Wert in
// `client.ts` (Browser) und in den Server-Pfaden gleichermassen.
//
// Ein fester Wert HIER wäre falsch: dann trügen beide Apps ihn.

/**
 * Der Cookiename, den diese App für die Supabase-Sitzung benutzt.
 *
 * Ohne `NEXT_PUBLIC_AUTH_COOKIE_SCOPE` liefert die Funktion `undefined`
 * — dann bleibt es bei der Ableitung von supabase-js, also beim
 * bisherigen Verhalten. `apps/web` setzt die Variable bewusst nicht.
 */
export function authCookieName(): string | undefined {
  const scope = process.env.NEXT_PUBLIC_AUTH_COOKIE_SCOPE?.trim()
  if (!scope) return undefined

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return undefined

  let ref: string
  try {
    ref = new URL(url).hostname.split('.')[0]
  } catch {
    return undefined
  }
  if (!ref) return undefined

  return `sb-${ref}-${scope}-auth-token`
}

/**
 * `cookieOptions` für die @supabase/ssr-Clients.
 *
 * Bewusst NUR `name` — kein `domain`. Das ist der Kern von Weg B:
 * `[read]` Weg A hätte `domain` auf `.lumeos.app` gesetzt, was lokal
 * nicht setzbar ist (ein `domain`, das nicht zum Host passt, verwirft
 * der Browser) und in Produktion zwingend wäre. Ein Weg, der lokal
 * anders funktioniert als in Produktion, ist ein Weg, den niemand
 * wirklich testet. Ein eigener NAME verhält sich überall gleich.
 *
 * Liefert `undefined`, wenn kein eigener Name gilt — dann übergeben die
 * Aufrufer gar keine `cookieOptions` und es bleibt beim Standard.
 */
export function authCookieOptions(): { name: string } | undefined {
  const name = authCookieName()
  return name ? { name } : undefined
}
