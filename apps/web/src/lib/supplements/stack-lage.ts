// ════════════════════════════════════════════════════════════════════
// DIE LAGE DER STACKS — G-253
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg, kein
// `next/headers` — A-30. Nur Typen kommen von dort.
//
// ══ WORAN DIE VIER KACHELN HAENGEN — GEMESSEN ═══════════════════════
//
// `[cmd]` **Gemessen am 2026-08-29, `dev@lumeos.app`:**
//
//     My stacks            `user_stacks` — dev 1 Zeile, Bestand 3.
//                          **Anbindung, sonst nichts.**
//     System templates     `stack_templates` EXISTIERT, ist aber
//                          **leer: 0 Zeilen, 0 Posten.**
//                          **Tabelle da, Inhalt fehlt.**
//     Frequency options    `stack_items.frequency` — gezaehlt aus
//                          den Posten des aktiven Stacks. **Im ganzen
//                          Bestand ein einziger Wert: `daily` (11x),
//                          bei dev 4 von 4.**
//     Item customization   `stack_items` traegt `dose`, `dose_unit`,
//                          `timing`, `frequency`, `cycling`, `notes`.
//                          **Anbindung.**
//
// `[read]` **Zwei der vier sind anbindbar, zwei nicht** — und die zwei
// anderen aus verschiedenen Gruenden. **Eine leere Tabelle ist kein
// fehlender Bau, sondern fehlender Inhalt**; ihn zu erfinden waere
// Katalogausbau, und der ist ausgeschlossen.

import type { EigenerStack } from './substanz-read'

/**
 * Was die Kachel „System templates" zeigt.
 *
 * `[read]` **Drei Zustaende, nicht zwei** — dieselbe Unterscheidung
 * wie in G-208 und G-239: es gibt einen Unterschied zwischen „keine
 * Tabelle", „Tabelle ohne Inhalt" und „Inhalt da".
 */
export type VorlagenLage = 'vorlagen_da' | 'tabelle_leer'

export function vorlagenLageVon(anzahl: number): VorlagenLage {
  return anzahl > 0 ? 'vorlagen_da' : 'tabelle_leer'
}

export const VORLAGEN_LEER_SATZ =
  'Für Vorlagen gibt es eine Tabelle, aber noch keinen Inhalt. '
  + 'Das ist kein Fehler in der Anzeige — es ist noch nichts hinterlegt.'

/**
 * Der Satz zur Stack-Liste.
 *
 * `[read]` **Ein Nutzer ohne Stack ist etwas anderes als ein
 * Ladefehler.** Der Satz sagt, was zu tun ist, statt eine leere
 * Flaeche zu lassen.
 */
export function stackListeSatz(zeilen: readonly EigenerStack[]): string {
  if (zeilen.length === 0) {
    return 'Noch kein Stack angelegt. Ein Stack fasst zusammen, '
      + 'was du regelmäßig nimmst.'
  }
  const aktiv = zeilen.filter(z => z.is_active).length
  if (aktiv === 0) {
    return `${zeilen.length} Stacks, keiner aktiv. `
      + 'Ohne aktiven Stack entstehen keine Einnahme-Einträge.'
  }
  return ''
}

/**
 * Die Frequenzen, die im Bestand tatsaechlich vorkommen.
 *
 * `[cmd]` **Gemessen 2026-08-29: im Bestand ein einziger Wert,
 * `daily`, elfmal; bei `dev` 4 von 4 Posten.** `[read]`
 * **Die Kachel zeigt deshalb, was da ist, und sagt es** — eine Liste
 * mit sieben Auswahlmoeglichkeiten, von denen sechs nie vorkommen,
 * behauptet eine Vielfalt, die die Daten nicht hergeben.
 */
export type Frequenz = { wert: string; anzahl: number }

export function frequenzSatz(f: readonly Frequenz[]): string {
  if (f.length === 0) return 'Noch keine Einnahmefrequenz hinterlegt.'
  if (f.length === 1) {
    return `Alle ${f[0].anzahl} Einträge nutzen „${f[0].wert}". `
      + 'Weitere Frequenzen sind im Schema möglich, aber nicht belegt.'
  }
  return ''
}

/**
 * Ob eine Position einen Anzeigenamen hat.
 *
 * `[cmd]` **Der Befund, gemessen am 2026-08-29:** zwei der vier
 * Posten von `dev` tragen weder `custom_name` noch `name_de` — der
 * Name steht nur in `name_en` („Creatine monohydrate", „Omega-3
 * (EPA/DHA)"). `[read]` **Der Leseweg faellt bereits auf `name_en`
 * zurueck** (`anzeigename`); **die Luecke steht in den Daten, nicht
 * in der Anzeige.** Gemeldet, nicht gefuellt.
 */
export const NAME_LUECKE_SATZ =
  'Für einzelne Einträge fehlt der deutsche Name; angezeigt wird der englische.'
