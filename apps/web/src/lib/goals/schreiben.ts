// Schreib-I/O fuer Ziele (G-79).
//
// **Tom, 2026-08-18:** *„Goals brauchen noch Prioritaeten, die man
// festlegen kann — das bildet dann auch die Reihenfolge. Bestehende
// muessen auch editierbar sein."*
//
// `[cmd]` **Kein Schema geaendert.** `goals.user_goals` traegt bereits
// `priority` (smallint, Vorgabe 5) und `status` (Vorgabe `active`);
// alle vier Zeilenschutzregeln (SELECT/INSERT/UPDATE/DELETE) sind auf
// `auth.uid() = user_id` geschnitten, die Rechte stehen. Es fehlte nur
// der Weg dorthin — `lib/goals/lesen.ts` hat keinen.
//
// **DIE REGELN STEHEN NEBENAN**, in `ziel-regeln.ts`: diese Datei
// importiert `createSessionClient` und damit `next/headers`. Wer sie
// aus einer `'use client'`-Datei als WERT importiert, zieht das
// Server-I/O ins Browserbuendel — gemessen: HTTP 500 auf jeder Seite.
// Begruendung dort im Kopf.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import { pruefeAenderung, type ZielAenderung } from './ziel-regeln'

export type SchreibErgebnis =
  | { ok: true }
  | { ok: false; fehler: string }

/**
 * Ein bestehendes Ziel aendern.
 *
 * `[read]` **Keine Bewertung.** Diese Funktion schreibt, was die
 * Nutzerin eingibt — sie prueft nicht, ob ein Ziel realistisch ist
 * oder gut verfolgt wird. Die Grenzen, die sie durchsetzt, sind die
 * der Tabelle.
 */
export async function zielAendern(
  zielId: string,
  aenderung: ZielAenderung,
): Promise<SchreibErgebnis> {
  // `[cmd]` OHNE `await`: `createSessionClient()` ist synchron
  // (`packages/shared/src/supabase/session.ts:19`). `lesen.ts` ruft es
  // ebenso — zwei Schreibweisen fuer dieselbe Funktion waeren eine
  // Stolperstelle.
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, fehler: 'Keine angemeldete Sitzung.' }

  const pruefung = pruefeAenderung(aenderung)
  if (pruefung) return { ok: false, fehler: pruefung }

  // `.select()` erzwingt eine Rueckmeldung, wie viele Zeilen die
  // Aenderung getroffen hat. `[read]` Ohne sie meldet PostgREST auch
  // dann Erfolg, wenn der Zeilenschutz alles weggefiltert hat — die
  // Oberflaeche schloesse den Editor und nichts waere geschrieben.
  const { data, error } = await supabase
    .schema('goals')
    .from('user_goals')
    .update({ ...aenderung, updated_at: new Date().toISOString() })
    .eq('id', zielId)
    .eq('user_id', user.id)
    .select('id')

  if (error) {
    // `[cmd]` `uq_user_goals_active_slot` — ein eindeutiger Index auf
    // (user_id, priority) fuer AKTIVE Ziele. Zusammen mit
    // `user_goals_check1` (1–3) heisst das: **es gibt genau drei
    // aktive Plaetze, jeder einmal.** Wer einen belegten Rang waehlt,
    // bekaeme sonst eine Postgres-Meldung.
    if (error.code === '23505' && error.message.includes('active_slot')) {
      return {
        ok: false,
        fehler: `Priorität ${aenderung.priority} ist schon vergeben. `
          + 'Aktive Ziele belegen die Plätze 1 bis 3, jeden nur einmal.',
      }
    }
    return { ok: false, fehler: error.message }
  }
  if (!data || data.length === 0) {
    return { ok: false, fehler: 'Kein Ziel geändert — gehört es dieser Sitzung?' }
  }
  return { ok: true }
}

/**
 * Die Reihenfolge mehrerer Ziele setzen.
 *
 * `[read]` Ein Aufruf je Ziel statt einer Stapelabfrage: die
 * Zeilenschutzregel prueft `auth.uid() = user_id` je Zeile, und die
 * Liste ist kurz (aktive Ziele tragen Rang 1–3). Ein Fehler bricht ab
 * und meldet, statt die uebrigen still zu schreiben.
 */
export async function reihenfolgeSetzen(
  paare: Array<{ id: string; priority: number }>,
): Promise<SchreibErgebnis> {
  for (const p of paare) {
    const e = await zielAendern(p.id, { priority: p.priority })
    if (!e.ok) return e
  }
  return { ok: true }
}
