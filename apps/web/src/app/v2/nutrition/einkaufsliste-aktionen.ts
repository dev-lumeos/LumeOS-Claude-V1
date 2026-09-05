'use server'
// ════════════════════════════════════════════════════════════════════
// SCHREIBWEG: DIE EINKAUFSLISTEN — G-345
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Gemessen am 2026-09-07, `authenticated`:**
//
//     shopping_lists        SELECT, INSERT, UPDATE   — kein DELETE
//     shopping_list_items   SELECT, INSERT, UPDATE, DELETE
//
// `[read]` **Das Fehlen von DELETE auf `shopping_lists` ist die
// Entscheidung, nicht ein Versehen:** *,,Loeschen heisst
// archivieren — eine Einkaufsliste ist ein Beleg, was man gekauft
// hat."* **Die Datenbank setzt sie durch, nicht die Oberflaeche.**
//
// `[read]` **Posten duerfen weg** — das ist Bearbeiten, nicht
// Loeschen der Liste.
import { revalidatePath } from 'next/cache'

import { createSessionClient } from '@lumeos/shared/session'

export type Antwort =
  | { ok: true; id?: string }
  | { ok: false; fehler: string }

async function sitzung() {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet.')
  return { db: client.schema('nutrition'), userId: user.id }
}

/** Nach jeder Aenderung: die Serverkomponenten neu rechnen lassen. */
function neu() {
  revalidatePath('/v2/nutrition')
}

/**
 * Eine Liste mit Posten holen — G-345.
 *
 * `[cmd]` **Als Serveraktion, NICHT als Import.** `[read]`
 * **`einkaufsliste-lesen.ts` zieht `next/headers` mit** — ein
 * Wert-Import aus einer `'use client'`-Datei brächte die Seite mit
 * HTTP 500 zu Fall, **bei gruenem Typecheck.**
 *
 * `[cmd]` **Derselbe Fehler wie in G-74, G-79 und G-97** — hier beim
 * Bauen bemerkt, bevor er wirkte.
 */
export async function listeHolen(id: string) {
  try {
    const { ladeEinkaufsliste } = await import(
      '../../../lib/nutrition/einkaufsliste-lesen')
    return await ladeEinkaufsliste(id)
  } catch {
    return null
  }
}

/**
 * Einen Posten ab- oder wieder anhaken — G-345.
 *
 * `[read]` **Der einzige Vorgang, der beim Einkaufen selbst
 * passiert** — er muss ohne Nachfrage und ohne Neuladen wirken.
 *
 * ══ WARUM HIER UND NICHT UEBER `/api/nutrition/rezept` ═══════════
 *
 * `[cmd]` **Es gibt einen zweiten Weg:** `postenHakenSchema` in
 * `rezept-write.ts`, gerufen ueber `art: 'posten_haken'`. **Die
 * Rezeptkarte (Flow 8) benutzt ihn seit G-289.**
 *
 * `[read]` **Beide schreiben dieselbe Spalte** — `is_checked`.
 * **Zwei Wege fuer einen Vorgang sind zwei Wahrheiten**, und die
 * naechste Aenderung trifft nur einen davon.
 *
 * `[read]` **Der Unterschied ist der Ort, nicht die Sache:** die
 * Route liegt unter `rezept`, die Liste gehoert aber seit E-64 auch
 * an die Planwoche und in den eigenen Reiter. **Eine
 * Einkaufslisten-Aktion unter `/rezept` waere am falschen Ort.**
 *
 * **MELDUNG:** `rezepte-echt.tsx` sollte auf diese Aktion umziehen,
 * damit es wieder einen Weg gibt. **Nicht in diesem Auftrag** — er
 * nennt die Rezeptkarte nicht, und sie funktioniert.
 */
export async function postenAbhaken(
  postenId: string, gehakt: boolean,
): Promise<Antwort> {
  try {
    const { db, userId } = await sitzung()
    const { error } = await db
      .from('shopping_list_items')
      .update({ is_checked: gehakt })
      .eq('id', postenId)
      // `[read]` **Der Wachhund prueft es ohnehin** — aber eine
      // Bedingung, die nie greift, ist billiger als ein Fehler, der
      // erst aus der Datenbank kommt.
      .eq('user_id', userId)
    if (error) return { ok: false, fehler: error.message }
    neu()
    return { ok: true }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}

/**
 * Die Menge eines Postens aendern — G-345.
 *
 * `[cmd]` **Entweder `amount_g` oder `quantity`** — die Tabelle
 * fuehrt beides, und welches gilt, sagt `unit_display`.
 *
 * `[read]` **Nichts wird umgerechnet:** aus 360 g wird keine
 * Stueckzahl. **Wer die Einheit wechseln will, legt den Posten neu
 * an.**
 */
export async function postenMenge(
  postenId: string, menge: number,
): Promise<Antwort> {
  if (!Number.isFinite(menge) || menge <= 0) {
    return { ok: false, fehler: 'Die Menge muss groesser als 0 sein.' }
  }
  try {
    const { db, userId } = await sitzung()
    // `[read]` **Erst lesen, welche Spalte gilt** — sonst schriebe
    // man Gramm in ein Stueckzahlfeld.
    const { data, error: leseFehler } = await db
      .from('shopping_list_items')
      .select('amount_g, quantity')
      .eq('id', postenId)
      .eq('user_id', userId)
      .limit(1)
    if (leseFehler) return { ok: false, fehler: leseFehler.message }
    const p = (data ?? [])[0] as Record<string, unknown> | undefined
    if (!p) return { ok: false, fehler: 'Posten nicht gefunden.' }

    const feld = p.amount_g !== null && p.amount_g !== undefined
      ? 'amount_g' : 'quantity'
    const { error } = await db
      .from('shopping_list_items')
      .update({ [feld]: menge })
      .eq('id', postenId)
      .eq('user_id', userId)
    if (error) return { ok: false, fehler: error.message }
    neu()
    return { ok: true }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}

/**
 * Einen Posten entfernen — G-345.
 *
 * `[read]` **Das ist Bearbeiten, nicht Loeschen der Liste.**
 * `[cmd]` **`authenticated` hat DELETE auf den Posten**, aber nicht
 * auf der Liste — genau diese Trennung.
 */
export async function postenEntfernen(postenId: string): Promise<Antwort> {
  try {
    const { db, userId } = await sitzung()
    const { error } = await db
      .from('shopping_list_items')
      .delete()
      .eq('id', postenId)
      .eq('user_id', userId)
    if (error) return { ok: false, fehler: error.message }
    neu()
    return { ok: true }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}

/**
 * Einen freien Posten hinzufuegen — G-345.
 *
 * `[cmd]` **`item_source = 'manual'`** — dieselbe Trennung wie bei
 * `meal_items` (G-340): kein `food_id`, kein `custom_food_id`.
 *
 * `[read]` **Wer *Spuelmittel* auf die Liste schreibt, sucht es
 * nicht im Lebensmittelkatalog.**
 */
export async function postenHinzufuegen(
  listeId: string, name: string, menge: number | null, einheit: string,
): Promise<Antwort> {
  const n = name.trim()
  if (n.length === 0) return { ok: false, fehler: 'Der Name darf nicht leer sein.' }
  try {
    const { db, userId } = await sitzung()

    // `[read]` **Ans Ende sortieren** — `sort_order` ist NOT NULL,
    // und ein neuer Posten gehoert unten hin.
    const { data: letzte } = await db
      .from('shopping_list_items')
      .select('sort_order')
      .eq('shopping_list_id', listeId)
      .order('sort_order', { ascending: false })
      .limit(1)
    const naechste = (((letzte ?? [])[0] as Record<string, unknown> | undefined)
      ?.sort_order as number | undefined ?? -1) + 1

    const { error } = await db.from('shopping_list_items').insert({
      shopping_list_id: listeId,
      user_id: userId,
      sort_order: naechste,
      item_source: 'manual',
      food_id: null,
      custom_food_id: null,
      food_name: n,
      // `[read]` **Gramm ODER Stueck** — nie beides, sonst weiss
      // niemand, welche Zahl gilt.
      amount_g: einheit === 'g' ? menge : null,
      quantity: einheit === 'g' ? null : menge,
      unit_display: einheit,
      is_checked: false,
    })
    if (error) return { ok: false, fehler: error.message }
    neu()
    return { ok: true }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}

/**
 * Eine Liste archivieren — ueber `shopping_list_archive` (C-407).
 *
 * `[cmd]` **`authenticated` hat KEIN DELETE auf `shopping_lists`.**
 * `[read]` **Das ist der Punkt:** *,,eine Einkaufsliste ist ein
 * Beleg, was man gekauft hat."* **Sie verschwindet aus der offenen
 * Ansicht und bleibt lesbar.**
 */
export async function listeArchivieren(listeId: string): Promise<Antwort> {
  try {
    const { db } = await sitzung()
    const { error } = await db.rpc('shopping_list_archive', {
      p_shopping_list_id: listeId,
    })
    if (error) return { ok: false, fehler: error.message }
    neu()
    return { ok: true }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}

/**
 * Aus einer Planwoche eine Liste erzeugen — E-64, der Hauptfall.
 *
 * `[cmd]` **`shopping_list_from_meal_plan_week` (C-407)** summiert
 * gleiche `food_id` in Gramm und haelt gleiche Freitextnamen
 * getrennt.
 *
 * `[read]` **Der Name ist optional** — die Funktion baut sonst
 * einen aus der Woche.
 */
export async function wochenlisteErzeugen(
  wocheId: string, name?: string,
): Promise<Antwort> {
  try {
    const { db } = await sitzung()
    const { data, error } = await db.rpc('shopping_list_from_meal_plan_week', {
      p_week_id: wocheId,
      p_name: name && name.trim().length >= 2 ? name.trim() : null,
    })
    if (error) return { ok: false, fehler: error.message }
    neu()
    return { ok: true, id: typeof data === 'string' ? data : undefined }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}
