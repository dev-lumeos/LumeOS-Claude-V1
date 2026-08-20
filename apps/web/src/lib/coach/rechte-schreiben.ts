'use server'

// Schreibpfad fuer Coach-Rechte (G-90).
//
// **NUR PERMISSIONS, NICHT AUTONOMY.** `[read]` Der Klient setzt
// Sicht und Aenderungsrecht; den Reifegrad setzt der Coach auf seiner
// Plattform. Diese Datei kennt deshalb keinen Autonomy-Schreibweg —
// das waere genau der Fehler, den die Recherche am Vorgaenger
// benennt (F-04, 7.3).
//
// `[cmd]` **Die Historie schreibt der Trigger, nicht diese Datei.**
// `client_permissions_change_log` haengt AFTER INSERT OR UPDATE OR
// DELETE an der Tabelle und legt Alt- und Neuwert als JSONB ab.
// **Wer hier eine Logzeile von Hand schriebe, erzeugte sie doppelt.**
//
// `[cmd]` **Und `changed_by` setzt ebenfalls der Trigger**
// (`set_changed_by`, BEFORE INSERT OR UPDATE, aus `auth.uid()`). Ein
// mitgeschickter Wert wird ueberschrieben — richtig so: der Akteur
// soll nicht aus dem Browser kommen.
import { revalidatePath } from 'next/cache'
import { createSessionClient } from '@lumeos/shared/session'

import { MODULE, SICHT, type Modul, type Sicht } from './rechte-modell'

export type SchreibErgebnis =
  | { ok: true }
  | { ok: false; fehler: string }

/**
 * Setzt eine Sichtstufe oder das Aenderungsrecht eines Moduls.
 *
 * `[read]` **Die Zeile wird angelegt, wenn es sie nicht gibt.** Ein
 * Klient, der zum ersten Mal etwas freigibt, hat noch keine Zeile;
 * ein `update` auf nichts waere still erfolglos.
 *
 * `[cmd]` **`.select()` ist Pflicht, nicht Zierde.** G-79 hat
 * gemessen, dass PostgREST ein `update` als erfolgreich meldet, das
 * die Zeilenrechte auf null Zeilen gefiltert haben. Ohne die
 * Rueckgabe faende man den Fall erst, wenn der Nutzer die Seite neu
 * laedt und seine Aenderung fehlt.
 */
export async function setzeRecht(eingabe: {
  coachId: string
  modul: Modul
  sicht?: Sicht
  autoAendern?: boolean
}): Promise<SchreibErgebnis> {
  const { coachId, modul } = eingabe

  // Gegen die Pruefbedingungen des Schemas, bevor die Datenbank es tut
  // — die Meldung ist hier verstaendlicher.
  if (!MODULE.includes(modul)) {
    return { ok: false, fehler: `Unbekanntes Modul: ${modul}` }
  }
  if (eingabe.sicht !== undefined && !SICHT.includes(eingabe.sicht)) {
    return { ok: false, fehler: `Unbekannte Sichtstufe: ${eingabe.sicht}` }
  }
  if (eingabe.sicht === undefined && eingabe.autoAendern === undefined) {
    return { ok: false, fehler: 'Nichts zu setzen.' }
  }

  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { ok: false, fehler: 'Nicht angemeldet.' }
    if (user.id === coachId) {
      // Das Schema faengt es auch ab (`..._not_self_ck`), aber mit
      // einer Meldung, die niemand lesen will.
      return { ok: false, fehler: 'Coach und Klient sind dieselbe Person.' }
    }

    const feld: Record<string, unknown> = {}
    if (eingabe.sicht !== undefined) feld[`${modul}_visibility`] = eingabe.sicht
    if (eingabe.autoAendern !== undefined) feld[`${modul}_auto_apply`] = eingabe.autoAendern

    const { data, error } = await client
      .schema('coach')
      .from('client_permissions')
      .upsert(
        { coach_id: coachId, client_id: user.id, ...feld },
        { onConflict: 'coach_id,client_id' },
      )
      .select('id')

    if (error) return { ok: false, fehler: error.message }
    if (!data || data.length === 0) {
      // Kein Fehler, aber auch keine Zeile: die Zeilenrechte haben
      // gefiltert. Genau der Fall aus G-79.
      return {
        ok: false,
        fehler: 'Nicht gespeichert — die Zeilenrechte haben den Schreibvorgang '
          + 'gefiltert. Rechte setzt nur der Klient selbst.',
      }
    }

    revalidatePath('/v2/coach')
    return { ok: true }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}

/**
 * Bestaetigt oder verwirft eine wartende Coach-Aktion.
 *
 * `[cmd]` **Das ist Anzeige plus Zustandswechsel, nicht Ausfuehrung.**
 * Die Tabelle traegt `payload`, aber es gibt keinen Ausfuehrer, der
 * ihn auf das Zielmodul anwendet. Was hier geschieht: `status` geht
 * auf `confirmed` oder `rejected`, `confirmed_at`/`confirmed_by`
 * werden gesetzt. **Was fehlt, steht im Bericht.**
 *
 * `[cmd]` **Der Verfall wird geprueft, nicht nur angezeigt.** Die
 * Spalte `expires_at` steht auf zehn Minuten; eine abgelaufene Aktion
 * darf nicht mehr bestaetigt werden. Die Datenbank erzwingt das
 * nicht — die Pruefbedingung deckt nur, dass `confirmed_at` und
 * `confirmed_by` gesetzt sind.
 */
export async function entscheideAktion(
  aktionId: string, entscheidung: 'confirmed' | 'rejected',
): Promise<SchreibErgebnis> {
  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { ok: false, fehler: 'Nicht angemeldet.' }

    const { data: vorher, error: leseFehler } = await client
      .schema('coach').from('pending_actions')
      .select('id,status,expires_at,client_id').eq('id', aktionId).limit(1)
    if (leseFehler) return { ok: false, fehler: leseFehler.message }
    const a = vorher?.[0] as unknown as Record<string, unknown> | undefined
    if (!a) return { ok: false, fehler: 'Aktion nicht gefunden.' }

    if (a.status !== 'pending') {
      return { ok: false, fehler: `Aktion steht auf „${String(a.status)}" — nicht mehr offen.` }
    }
    if (new Date(String(a.expires_at)).getTime() < Date.now()) {
      return { ok: false, fehler: 'Die Aktion ist abgelaufen (10-Minuten-Frist).' }
    }

    const felder: Record<string, unknown> = { status: entscheidung }
    if (entscheidung === 'confirmed') {
      felder.confirmed_at = new Date().toISOString()
      felder.confirmed_by = user.id
    }

    const { data, error } = await client
      .schema('coach').from('pending_actions')
      .update(felder).eq('id', aktionId).select('id')

    if (error) return { ok: false, fehler: error.message }
    if (!data || data.length === 0) {
      return { ok: false, fehler: 'Nicht gespeichert — die Zeilenrechte haben gefiltert.' }
    }

    revalidatePath('/v2/coach')
    return { ok: true }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}
