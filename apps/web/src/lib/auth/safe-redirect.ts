// Sicheres Ziel für `?redirect=` (D-04-Fund, 2026-08-06).
// KEIN I/O — reine Funktion, damit sie testbar ist und an genau einer
// Stelle steht. Vorher lag dieselbe Prüfung zweimal inline (login/page.tsx
// und auth/callback/route.ts), beide Male als `raw.startsWith('/')`.
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

/** Ziel, wenn kein gültiges angegeben wurde. */
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
export function safeRedirect(raw: unknown): string {
  if (typeof raw !== 'string' || raw.length === 0) return DEFAULT_REDIRECT
  if (!raw.startsWith('/')) return DEFAULT_REDIRECT
  // Zweites Zeichen entscheidet: `//` und `/\` verlassen die eigene Herkunft.
  if (raw.length > 1 && (raw[1] === '/' || raw[1] === '\\')) return DEFAULT_REDIRECT
  return raw
}
