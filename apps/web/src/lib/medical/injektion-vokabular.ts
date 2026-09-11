// Die erlaubten Werte fuer `medical.injection_logs` — G-389.
//
// ══ WARUM DIESE DATEI GETRENNT STEHT ════════════════════════════════
//
// `[read]` **Das Erfassungsfenster traegt `'use client'`** und braucht
// die Auswahllisten. `[cmd]` **Ein Import aus `injektion-write.ts`
// zoege `createSessionClient` und damit `next/headers` in den
// Browser** — gemessen in C-468: **HTTP 500 auf JEDER Seite**, auch
// auf `/login`, und `tsc` bleibt dabei gruen.
//
// `[read]` **Eine Konstante, die beide Seiten brauchen, gehoert in
// eine Datei ohne Serverimporte.**
//
// ══ ZWEI VOKABULARE FUER DENSELBEN WEG ══════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-11 gegen `pg_constraint`:**
//
//     injection_logs.route                    im | sc
//     user_injection_site_selections.route    injection_im |
//                                             injection_subq
//
// `[read]` **Dieselbe Sache, zwei Schreibweisen** — wer die eine in
// die andere Spalte schreibt, bekommt einen CHECK-Fehler. **Die
// Umrechnung steht hier, an einer Stelle.**

/** Was `injection_logs.route` erlaubt. */
export const INJEKTIONSWEGE_LOG = ['im', 'sc'] as const
export type Injektionsweg_Log = typeof INJEKTIONSWEGE_LOG[number]

/** Was `user_injection_site_selections.route` erlaubt (G-423). */
export const INJEKTIONSWEGE_KONFIG = ['injection_im', 'injection_subq'] as const
export type Injektionsweg_Konfig = typeof INJEKTIONSWEGE_KONFIG[number]

/**
 * Von der Konfiguration in das Protokoll.
 *
 * `[read]` **Ohne diese Zeile schreibt die Vorbelegung aus G-423
 * `injection_subq` in eine Spalte, die nur `sc` kennt.**
 */
export function wegFuerProtokoll(konfig: string): Injektionsweg_Log {
  return konfig === 'injection_im' ? 'im' : 'sc'
}

/** Umgekehrt — fuer die Suche nach der passenden Konfiguration. */
export function wegFuerKonfig(log: string): Injektionsweg_Konfig {
  return log === 'im' ? 'injection_im' : 'injection_subq'
}

/**
 * Die sieben Komplikationen aus dem CHECK.
 *
 * `[cmd]` **`complication <@ ARRAY[...]`** — eine Liste, kein
 * Einzelwert. `[read]` **Eine Auswahlliste ist eine Zusage:** steht
 * hier ein achter Wert, weist die Datenbank ab, und die Nutzerin
 * sieht eine Datenbankmeldung statt eines Feldfehlers.
 */
export const KOMPLIKATIONEN = [
  'none', 'bleeding', 'lump', 'swelling',
  'redness', 'leakage', 'nerve_sensation',
] as const
export type Komplikation = typeof KOMPLIKATIONEN[number]

/** Die deutschen Beschriftungen — die Karte spricht Deutsch. */
export const KOMPLIKATION_TEXT: Record<Komplikation, string> = {
  none: 'keine',
  bleeding: 'Blutung',
  lump: 'Knoten',
  swelling: 'Schwellung',
  redness: 'Rötung',
  leakage: 'Austritt',
  nerve_sensation: 'Nervgefühl',
}

/** `pain_score` liegt zwischen 0 und 3 (CHECK). */
export const SCHMERZ_MIN = 0
export const SCHMERZ_MAX = 3
