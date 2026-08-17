// Die Sprachen und der Cookiename — ohne Serverabhaengigkeit.
//
// Eigene Datei, weil `request.ts` `next/headers` importiert. Zoege ein
// Client-Baustein (die Sprachwahl) seine Konstanten von dort, landete
// `next/headers` im Browserbuendel und der Build braeche ab — genau so
// geschehen, bevor diese Datei entstand.
export const SPRACHEN = ['de', 'en', 'th'] as const
export type Sprache = (typeof SPRACHEN)[number]

/** Die befuellte Hauptsprache. Thai ist vorgesehen, nicht befuellt. */
export const STANDARD_SPRACHE: Sprache = 'de'

/** Cookiename. Dieselbe Mechanik wie Theme und Modus. */
export const SPRACH_COOKIE = 'lumeos-sprache'

export function istSprache(v: unknown): v is Sprache {
  return typeof v === 'string' && (SPRACHEN as readonly string[]).includes(v)
}
