// Lese- und Schreibweg fuer `public.user_allergies` — G-455.
//
// ══ WAS C-498 GEBAUT HAT UND WAS DAVON GENUTZT WIRD ═════════════════
//
// `[cmd]` **Gemessen 2026-09-15:**
//
//     public.user_allergies                    2 Zeilen
//     public.allergen_aliases                  3 Aliase
//     public.user_allergy_codes(uuid)          -> text[]
//     public.supplier_product_allergy_matches(uuid)
//       -> TABLE(allergy_id, product_id, ingredient_name,
//                stoff_code, stoff_text)
//
// `[read]` **Die Trefferfunktion wird GERUFEN, nicht nachgebaut** —
// sie kennt die Aliasaufloesung, und eine zweite Fassung hier waere
// genau die Drift, vor der C-495/G-452 gewarnt hat.
//
// ══ DIE RECHTE ══════════════════════════════════════════════════════
//
// `[cmd]` **Gemessen:** `authenticated` hat SELECT/INSERT/UPDATE/
// DELETE, und vier Policies schneiden auf `auth.uid() = user_id`.
// **`SELECT` erlaubt zusaetzlich `coach.hat_allergie_sicht`** — der
// Coach darf sehen, nicht schreiben.
//
// `[read]` **Deshalb Session-Client, kein Service-Client** — die
// Zeilenrechte sind die Sperre, dieser Weg ist nur die Absicht.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import {
  QUELLE_SETTINGS, sortiere, stoffCode,
  type Allergie, type AllergieTreffer, type ArtCode, type SchwereCode,
} from './allergie-lage'

export type AllergieStand = {
  allergien: Allergie[]
  fehler: string | null
}

const LEER: AllergieStand = { allergien: [], fehler: null }

function s(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null
}

/** Die eigenen Allergien, schwerste zuerst. */
export async function ladeAllergien(): Promise<AllergieStand> {
  try {
    const c = createSessionClient()
    const { data, error } = await c.from('user_allergies')
      .select('id,stoff_code,stoff_text,art,schwere,quelle,seit,notiz')
    if (error) return { allergien: [], fehler: error.message }
    const roh = (Array.isArray(data) ? data : []) as Array<Record<string, unknown>>
    return {
      allergien: sortiere(roh.flatMap(r => {
        const id = s(r.id)
        const text = s(r.stoff_text)
        if (!id || !text) return []
        return [{
          id,
          stoff_code: s(r.stoff_code),
          stoff_text: text,
          art: (s(r.art) ?? 'sonstiges') as ArtCode,
          schwere: (s(r.schwere) ?? 'allergie') as SchwereCode,
          quelle: s(r.quelle) ?? '',
          seit: s(r.seit),
          notiz: s(r.notiz),
        }]
      })),
      fehler: null,
    }
  } catch (e) {
    return { ...LEER, fehler: e instanceof Error ? e.message : String(e) }
  }
}

/**
 * Die Produkte, die wegen einer Allergie HART ausfallen.
 *
 * `[cmd]` **`public.supplier_product_allergy_matches` trifft ueber
 * `allergen_aliases` ODER ueber exakten `stoff_text`** (gemessen im
 * Funktionsrumpf, 2026-09-15):
 *
 *     Zweig 1   stoff_code -> allergen_aliases -> ingredient_name
 *     Zweig 2   stoff_code IS NULL -> stoff_text = ingredient_name
 *
 * `[read]` **Daraus folgt eine Grenze, die die Oberflaeche nennen
 * muss:** `[cmd]` **eine Allergie mit `stoff_code`, zu dem es KEINEN
 * Alias gibt, trifft NICHTS** — beide Zweige fallen aus. **Gemessen
 * 2026-09-15: `lactose` und `tree_nuts` haben je 0 Aliase**, und die
 * Funktion gibt fuer `dev@lumeos.app` **0 Treffer**, obwohl 418
 * Zutatzeilen woertlich `lactose` heissen.
 *
 * `[read]` **Das ist ein Datenbefund, kein Fehler dieses Weges** —
 * und er wird gemeldet, nicht zugedeckt (die Oberflaeche sagt, wenn
 * ein Filter nichts findet, WARUM).
 */
export async function ladeAllergieTreffer(
  userId: string,
): Promise<{ treffer: AllergieTreffer[]; fehler: string | null }> {
  try {
    const c = createSessionClient()
    // ══ POSTGREST DECKELT BEI 1.000 ═══════════════════════════════
    //
    // `[cmd]` **Hier stand ein blosses `.rpc(...)`, und die Antwort
    // trug genau 1.000 Zeilen** — gemessen 2026-09-15, waehrend die
    // Funktion in der Datenbank **56.909** Produkte liefert.
    //
    // `[cmd]` **Die Wirkung war schlimmer als eine falsche Zahl:**
    // von den ersten 500 Produkten sind **42** betroffen, entfernt
    // wurden **0** — die abgeschnittenen 1.000 enthielten keines
    // davon. **Der Filter sah aus, als griffe er nicht.**
    //
    // `[read]` **`.limit()` hebt die Grenze NICHT auf** — was hilft,
    // ist geblaettertes Lesen mit `range` (dieselbe Lehre wie bei der
    // Markenliste in G-453).
    //
    // `[cmd]` **Gedeckelt bei 60 Runden a 1.000** — das traegt 60.000
    // Produkte und damit die gemessenen 56.909. **Die Reissleine
    // meldet sich, statt stumm abzuschneiden.**
    const GROESSE = 1000
    const RUNDEN = 60
    const alle: AllergieTreffer[] = []
    let abgeschnitten = false
    for (let runde = 0; runde < RUNDEN; runde++) {
      const von = runde * GROESSE
      const { data, error } = await c.rpc('supplier_product_allergy_matches',
        { p_user_id: userId }).range(von, von + GROESSE - 1)
      if (error) return { treffer: alle, fehler: error.message }
      const stueck = (Array.isArray(data) ? data : []) as Array<Record<string, unknown>>
      for (const r of stueck) {
        const pid = s(r.product_id)
        if (!pid) continue
        alle.push({
          product_id: pid,
          ingredient_name: s(r.ingredient_name) ?? '',
          stoff_text: s(r.stoff_text) ?? '',
        })
      }
      if (stueck.length < GROESSE) break
      if (runde === RUNDEN - 1) abgeschnitten = true
    }
    return {
      treffer: alle,
      // `[read]` **Abschneiden wird GEMELDET, nicht verschwiegen** —
      // ein Filter, der nur teilweise greift, ist gefaehrlicher als
      // einer, der gar nicht greift: er sieht vollstaendig aus.
      fehler: abgeschnitten
        ? `Mehr als ${RUNDEN * GROESSE} betroffene Produkte — die Liste `
          + 'ist unvollständig.'
        : null,
    }
  } catch (e) {
    return { treffer: [], fehler: e instanceof Error ? e.message : String(e) }
  }
}

export type SchreibErgebnis = { ok: true } | { ok: false; fehler: string }

/**
 * Eine Allergie anlegen.
 *
 * `[read]` **`quelle: 'settings'`, NICHT `nutrition_preferences`** —
 * `[cmd]` **`food_preferences_write` loescht bei jedem Speichern
 * `art='nahrung' AND quelle='nutrition_preferences'`.** **Eine hier
 * angelegte Zeile traegt eine andere Quelle und ueberlebt** (gemessen
 * im Funktionsrumpf).
 *
 * `[read]` **Der `stoff_code` wird nach derselben Regel gebildet wie
 * dort** (`lower`, Leerzeichen zu `_`) — sonst stuenden „Tree Nuts"
 * und „tree_nuts" als zwei Eintraege da.
 */
export async function legeAllergieAn(e: {
  stoff_text: string
  art: ArtCode
  schwere: SchwereCode
  seit?: string | null
  notiz?: string | null
}): Promise<SchreibErgebnis> {
  try {
    const c = createSessionClient()
    const { data: { user } } = await c.auth.getUser()
    if (!user) return { ok: false, fehler: 'Keine angemeldete Sitzung.' }
    const text = e.stoff_text.trim()
    const { error } = await c.from('user_allergies').insert({
      user_id: user.id,
      stoff_code: stoffCode(text),
      stoff_text: text,
      art: e.art,
      schwere: e.schwere,
      quelle: QUELLE_SETTINGS,
      seit: e.seit?.trim() || null,
      notiz: e.notiz?.trim() || null,
    })
    if (error) return { ok: false, fehler: error.message }
    return { ok: true }
  } catch (err) {
    return { ok: false, fehler: err instanceof Error ? err.message : String(err) }
  }
}

/**
 * Eine Allergie loeschen.
 *
 * `[read]` **Ohne Nutzerfilter im Aufruf** — die Policy
 * (`auth.uid() = user_id`) entscheidet. **Ein Filter hier waere
 * Ziertat**, die Sperre liegt in der Datenbank.
 */
export async function loescheAllergie(id: string): Promise<SchreibErgebnis> {
  try {
    const c = createSessionClient()
    const { error } = await c.from('user_allergies').delete().eq('id', id)
    if (error) return { ok: false, fehler: error.message }
    return { ok: true }
  } catch (err) {
    return { ok: false, fehler: err instanceof Error ? err.message : String(err) }
  }
}

/** Art oder Schwere einer bestehenden Zeile aendern. */
export async function aendereAllergie(
  id: string, feld: { art?: ArtCode; schwere?: SchwereCode },
): Promise<SchreibErgebnis> {
  try {
    const c = createSessionClient()
    const { error } = await c.from('user_allergies').update(feld).eq('id', id)
    if (error) return { ok: false, fehler: error.message }
    return { ok: true }
  } catch (err) {
    return { ok: false, fehler: err instanceof Error ? err.message : String(err) }
  }
}
