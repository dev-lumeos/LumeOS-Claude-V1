// Die Katalogvorschlaege — G-459, Toms Punkt 2.
//
// **Tom, 2026-09-08:** *„smartsearch mit vorschlaegen im pulldown,
// live bei der eingabe."*
//
// **Und die Reihenfolge, die er festgelegt hat:** *„user gibt ein, ob
// es um nahrung/supplement/medikament geht, dementsprechend wissen
// wir, welche produktkataloge SSOT sind."*
//
// ══ C-503 LIEFERT SIE — HIER WIRD NICHTS NACHGEBAUT ═════════════════
//
// `[cmd]` **Gemessen 2026-09-16 gegen die laufende Instanz:**
//
//     public.allergy_catalog_suggestions(p_art, p_query, p_limit)
//       -> catalog_code, display_name, matched_text,
//          occurrence_count, catalog_source,
//          product_check_available, notice, similarity_score
//
// `[cmd]` **Vier Proben, je gegen die Datenbank:**
//
//     nahrung     laktose       nutrition:contains_lactose   1.021
//     nahrung     milchzucker   nutrition:contains_lactose   1.021
//     supplement  magnesium     supplements:magnesium       30.349
//     medikament  penicillin    0 Codes, dafuer `notice`
//     nahrung     qzvwxjplk     0 Zeilen
//
// `[read]` **Die Synonymaufloesung ist die Leistung der Funktion** —
// *milchzucker* findet *Enthält Laktose*, ohne dass hier ein Wort
// uebersetzt wird.
//
// ══ DIE ART ENTSCHEIDET, WELCHER KATALOG GILT ═══════════════════════
//
// `[cmd]` **Die Funktion traegt es selbst:** `catalog_source` sagt,
// woher der Vorschlag kommt (`nutrition.tag_definitions`,
// `supplements.product_contents_or_warnings`, `medical`), und
// `product_check_available` sagt, ob dahinter ueberhaupt ein
// Produktabgleich steht.
//
// `[read]` **Bei `medikament` kommt eine Zeile OHNE Code, aber MIT
// `notice`** — *„Kein Medikamentenkatalog mit Allergie-Verknuepfung"*.
// **Das ist die Antwort, die Tom verlangt hat:** sagen, dass es
// keinen Katalog gibt, statt ins Leere zu suchen.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import type { Vorschlag } from './allergie-lage'

function s(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null
}

function n(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const z = Number(v)
    return Number.isFinite(z) ? z : 0
  }
  return 0
}

export type VorschlagStand = {
  vorschlaege: Vorschlag[]
  /**
   * Der Hinweis der Funktion, wenn es fuer die Art keinen Katalog
   * gibt.
   *
   * `[read]` **Er kommt aus der Datenbank, nicht von hier** — wer ihn
   * aendern will, aendert C-503. **Ein zweiter Wortlaut in der
   * Oberflaeche waere Drift.**
   */
  hinweis: string | null
  fehler: string | null
}

/**
 * Vorschlaege zu Art und Begriff.
 *
 * `[read]` **Die Funktion wird GERUFEN, nicht nachgebaut** — der
 * Auftrag verbietet es, und sie kann Synonyme und Trefferzahlen,
 * die hier niemand nachrechnen sollte.
 */
export async function ladeVorschlaege(
  art: string, frage: string, grenze = 8,
): Promise<VorschlagStand> {
  try {
    const c = createSessionClient()
    const { data, error } = await c.rpc('allergy_catalog_suggestions', {
      p_art: art,
      p_query: frage,
      p_limit: grenze,
    })
    if (error) return { vorschlaege: [], hinweis: null, fehler: error.message }

    const roh = (Array.isArray(data) ? data : []) as Array<Record<string, unknown>>

    // `[read]` **Eine Zeile OHNE `catalog_code` ist kein Vorschlag,
    // sondern eine Auskunft** — so meldet die Funktion die
    // Kataloglucke bei `medikament`. **Sie wird getrennt
    // weitergereicht, nicht als leerer Eintrag in die Liste
    // gestellt.**
    const hinweis = roh.find(r => !s(r.catalog_code) && s(r.notice))
    return {
      vorschlaege: roh.flatMap(r => {
        const code = s(r.catalog_code)
        if (!code) return []
        return [{
          code,
          name: s(r.display_name) ?? code,
          treffer: n(r.occurrence_count),
          quelle: s(r.catalog_source) ?? '',
          // `[read]` **Die Funktion sagt, ob dahinter ein
          // Produktabgleich steht** — die Oberflaeche muss es nicht
          // raten.
          prueftProdukte: r.product_check_available === true,
          // Warum die Zeile getroffen hat — bei Synonymen ist das
          // ein anderes Wort als der Name.
          treffertext: s(r.matched_text),
        }]
      }),
      hinweis: hinweis ? s(hinweis.notice) : null,
      fehler: null,
    }
  } catch (e) {
    return {
      vorschlaege: [], hinweis: null,
      fehler: e instanceof Error ? e.message : String(e),
    }
  }
}

/**
 * Wie viele Produkte die bestehenden Allergien treffen.
 *
 * **A8:** *„die drei bestehenden Allergien bleiben, mit ihren
 * Trefferzahlen."*
 *
 * `[cmd]` **`public.user_allergy_catalog_matches` (C-503)** gibt je
 * Allergie die getroffenen Katalogzeilen. `[read]` **Gezaehlt wird
 * hier, nicht dort** — die Funktion liefert Zeilen, die Kachel
 * braucht eine Zahl je Allergie.
 *
 * `[cmd]` **PostgREST deckelt bei 1.000** (G-453/G-455) — **deshalb
 * geblaettert.** `[read]` **`magnesium_stearate` trifft 56.948
 * Produkte**, ein einzelner Aufruf gaebe also 1.000 und eine
 * Zahl, die um Faktor 57 zu klein waere.
 */
export async function ladeTrefferzahlen(
  userId?: string,
): Promise<{ zahlen: Record<string, number>; fehler: string | null }> {
  try {
    const c = createSessionClient()
    // `[read]` **Ohne Kennung die eigene nehmen** — die Seite hat sie
    // nicht zur Hand, und der Leseweg hat ohnehin eine Sitzung. **Die
    // RLS-Policies schneiden zusaetzlich auf `auth.uid()`**, die
    // Kennung ist also die Absicht, nicht die Sperre.
    let wer = userId
    if (!wer) {
      const { data: { user } } = await c.auth.getUser()
      if (!user) return { zahlen: {}, fehler: 'Keine angemeldete Sitzung.' }
      wer = user.id
    }
    // ══ GEZAEHLT WIRD IN DER DATENBANK, NICHT HIER ════════════════
    //
    // `[cmd]` **Ein erster Entwurf blaetterte die Zeilen herueber und
    // zaehlte sie im Javascript** — 57 Runden a 1.000, weil
    // `magnesium_stearate` 56.948 Produkte trifft.
    //
    // `[cmd]` **GEMESSEN, was das kostet:**
    //
    //     mit den Zahlen        27.677 / 27.696 / 27.775 ms
    //     Gegenprobe ohne sie      774 /    728 /    718 ms
    //
    // `[read]` **27 Sekunden fuer drei Zahlen** — und die Seite war
    // nicht langsam, sie war unbenutzbar. **Die Gegenprobe hat den
    // Grund allein auf diese Funktion eingegrenzt.**
    //
    // `[read]` **PostgREST kann zaehlen, ohne zu uebertragen:**
    // `head: true` schickt keine Zeilen, `count: 'exact'` gibt die
    // Zahl im `Content-Range`. `[read]` **Damit ist es EINE Anfrage
    // je Allergie statt 57 fuer alle** — und die 1.000er-Grenze
    // greift gar nicht erst, weil nichts uebertragen wird.
    //
    // `[read]` **Eine eigene Zaehlfunktion in der Datenbank waere
    // schoener** — aber `supabase/` ist in diesem Auftrag gesperrt
    // (Codex arbeitet an G-454). **Gemeldet, nicht gebaut.**
    const { data: eigene, error: eFehler } = await c
      .from('user_allergies').select('id').eq('user_id', wer)
    if (eFehler) return { zahlen: {}, fehler: eFehler.message }

    const zahlen: Record<string, number> = {}
    for (const zeile of (eigene ?? []) as Array<{ id: string }>) {
      const { count, error } = await c
        .rpc('user_allergy_catalog_matches', { p_user_id: wer },
          { head: true, count: 'exact' })
        .eq('allergy_id', zeile.id)
      // `[read]` **Ein Fehler laesst die Zahl WEG, statt sie auf 0 zu
      // setzen** — eine 0 saehe aus wie *„trifft nichts"*, und das
      // ist eine andere Aussage als *„nicht gemessen"*.
      if (error || typeof count !== 'number') continue
      zahlen[zeile.id] = count
    }
    return { zahlen, fehler: null }
  } catch (e) {
    return { zahlen: {}, fehler: e instanceof Error ? e.message : String(e) }
  }
}
