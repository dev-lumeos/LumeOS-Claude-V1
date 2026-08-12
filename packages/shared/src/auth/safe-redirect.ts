// Sicheres Ziel für `?redirect=` (D-04-Fund, 2026-08-06).
// packages/shared/src/auth/safe-redirect.ts
//
// Hierher verschoben aus apps/web/src/lib/auth/safe-redirect.ts
// (Block 19, 2026-08-12), als apps/admin dazukam: beide Apps leiten nach
// der Anmeldung weiter, und ein offener Redirect waere in beiden
// gleichermassen eine Phishing-Lücke. Sicherheitslogik wird nicht kopiert.
//
// KEIN I/O — reine Funktion, damit sie testbar ist und an genau einer
// Stelle steht. Vorher lag dieselbe Prüfung zweimal inline
// (login/page.tsx und auth/callback/route.ts), beide Male als
// `raw.startsWith('/')`.
//
// WARUM startsWith('/') NICHT genügt:
// `[cmd]` 2026-08-06 gegen den laufenden Dev-Server belegt —
//   GET /auth/callback?redirect=%2F%2Fevil.com
//   -> Location: http://evil.com/
// `//evil.com` beginnt mit `/` und besteht die alte Prüfung, ist aber eine
// protokollrelative URL: der Browser liest sie als „gleiches Protokoll,
// FREMDER Host". Damit war `?redirect=` ein offener Redirect — genau das,
// was der Kommentar an beiden Stellen auszuschliessen behauptete.
// Ein offener Redirect ist die halbe Miete jedes Phishing-Versuchs: der
// Link zeigt auf die echte Domain und landet woanders.
//
// Regel hier: ein Ziel ist nur gültig, wenn es mit genau EINEM `/`
// beginnt. Alles andere fällt auf das Standardziel zurück.

/**
 * Standardziel von apps/web. Bleibt als Vorgabewert erhalten, damit die
 * bestehenden Aufrufe in apps/web unveraendert gelten.
 * apps/admin reicht sein eigenes Ziel als zweites Argument herein — die
 * App bestimmt ihr Ziel, die Regel bleibt gemeinsam.
 */
export const DEFAULT_REDIRECT = '/dashboard'

/**
 * Prüft ein `?redirect=`-Ziel und liefert entweder es selbst oder das
 * Standardziel. Gibt niemals ein fremdes Ziel zurück.
 *
 * Abgelehnt werden:
 *   - alles, was nicht mit `/` beginnt (`https://evil.com`, `evil.com`)
 *   - protokollrelative Ziele (`//evil.com`)
 *   - Backslash-Varianten (`/\evil.com`) — manche Browser behandeln `\`
 *     wie `/`, damit wäre `/\evil.com` erneut protokollrelativ
 *   - leere Werte und Nicht-Zeichenketten
 */
export function safeRedirect(raw: unknown, fallback: string = DEFAULT_REDIRECT): string {
  if (typeof raw !== 'string' || raw.length === 0) return fallback
  if (!raw.startsWith('/')) return fallback
  // Zweites Zeichen entscheidet: `//` und `/\` verlassen die eigene Herkunft.
  if (raw.length > 1 && (raw[1] === '/' || raw[1] === '\\')) return fallback
  return raw
}
