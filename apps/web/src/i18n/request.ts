// next-intl: die Sprache je Anfrage.
//
// OHNE SPRACHPRAEFIX IN DER ADRESSE. `[read]` next-intl bringt
// Routing je Sprache mit (`/de/v2/nutrition`), betreibt aber
// ausdruecklich auch den Betrieb ohne — die offizielle Vorlage heisst
// „App Router without i18n routing" und liest die Sprache aus einem
// Cookie. Genau das hier.
//
// Der Grund steht in `docs/ssot/88-i18n.md`: ein Praefix kollidiert
// mit der `/v2`-Parallelstruktur und mit G-07, wo `/v2` spaeter
// hochgezogen wird. Aus `/de/v2/nutrition` wuerde dann `/de/nutrition`
// — zwei Umbauten statt einem.
//
// Faellt die Datei fuer eine Sprache aus (Thai ist absichtlich leer),
// laedt next-intl die Nachrichten trotzdem; fehlende Schluessel fallen
// zur Laufzeit auf den Schluesselnamen zurueck. Genau diese Luecke
// findet `tools/i18n-pruefen.mjs` vor dem Ausliefern.
import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

import { STANDARD_SPRACHE, SPRACH_COOKIE, istSprache, type Sprache } from './sprachen'

export default getRequestConfig(async () => {
  const speicher = await cookies()
  const roh = speicher.get(SPRACH_COOKIE)?.value
  const locale: Sprache = istSprache(roh) ? roh : STANDARD_SPRACHE

  // Thai ist absichtlich leer. Damit die Seite trotzdem laedt, kommen
  // die deutschen Nachrichten als Grundlage darunter — so faellt ein
  // fehlender Schluessel auf einen lesbaren Text zurueck statt auf den
  // Schluesselnamen. `[annahme]` Sobald Thai befuellt ist, entfaellt
  // dieser Zusammenbau.
  const grundlage = (await import(`../../messages/${STANDARD_SPRACHE}.json`)).default
  if (locale === STANDARD_SPRACHE) return { locale, messages: grundlage }

  const eigene = (await import(`../../messages/${locale}.json`)).default
  return { locale, messages: tiefMischen(grundlage, eigene) }
})

/**
 * Zwei Nachrichtenbaeume verbinden, je Schluessel.
 *
 * Ein flaches `{...a, ...b}` reicht NICHT: die Nachrichten sind nach
 * Namensraeumen gegliedert, und ein flacher Zusammenbau ersetzt einen
 * ganzen Namensraum, sobald die zweite Sprache ihn auch nur teilweise
 * kennt. Aus „Nutrition mit 36 Schluesseln" wuerde dann „Nutrition mit
 * 2 Schluesseln" — die uebrigen 34 waeren weg.
 */
function tiefMischen(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): Record<string, unknown> {
  const aus: Record<string, unknown> = { ...a }
  for (const [k, v] of Object.entries(b)) {
    const vorher = aus[k]
    aus[k] = vorher && typeof vorher === 'object' && !Array.isArray(vorher)
      && v && typeof v === 'object' && !Array.isArray(v)
      ? tiefMischen(vorher as Record<string, unknown>, v as Record<string, unknown>)
      : v
  }
  return aus
}
