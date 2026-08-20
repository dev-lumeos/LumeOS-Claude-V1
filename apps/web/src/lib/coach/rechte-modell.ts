// Das Rechtemodell ohne I/O (G-90).
//
// `[cmd]` **Warum diese Datei getrennt von `rechte-read.ts` steht:**
// Dort steht `import { createSessionClient } from '@lumeos/shared/session'`,
// und das zieht `next/headers` nach. **Ein WERT-Import aus einer
// solchen Datei in eine `'use client'`-Datei holt Server-I/O ins
// Browserbuendel** — die Typpruefung bleibt gruen, und jede Seite
// antwortet mit HTTP 500. Gemessen in G-74 und wieder in G-79.
//
// `[read]` Typen darf die Oberflaeche direkt aus `rechte-read.ts`
// nehmen (`import type` wird beim Uebersetzen entfernt). **Alles, was
// zur Laufzeit existiert, steht hier.**

/** Die sieben Module des Schemas — **`buddy`, nicht `body_metrics`.** */
export const MODULE = [
  'nutrition', 'training', 'recovery', 'goals',
  'supplements', 'medical', 'buddy',
] as const
export type Modul = (typeof MODULE)[number]

/** Die drei Sichtstufen der Pruefbedingung des Schemas. */
export const SICHT = ['none', 'summary', 'full'] as const
export type Sicht = (typeof SICHT)[number]

export const MODUL_LABEL: Record<Modul, string> = {
  nutrition: 'Ernährung',
  training: 'Training',
  recovery: 'Erholung',
  goals: 'Ziele',
  supplements: 'Supplemente',
  medical: 'Medizinisch',
  buddy: 'Buddy',
}

/**
 * Was die drei Sichtstufen bedeuten.
 *
 * `[cmd]` Aus dem Entwurf uebernommen (012 des Vorgaengerrepos fuehrt
 * dieselben drei), nicht hier erfunden.
 */
export const SICHT_TEXT: Record<Sicht, string> = {
  none: 'Der Coach sieht das Modul nicht.',
  summary: 'Der Coach sieht Verlauf und Kennzahl, keine Einzeleinträge.',
  full: 'Der Coach sieht jeden Eintrag des Moduls.',
}

export const SICHT_FARBE: Record<Sicht, string> = {
  full: 'var(--pos)',
  summary: 'var(--warn)',
  none: 'var(--fg-dim)',
}

/**
 * Welche Module besonders heikel sind.
 *
 * `[cmd]` **Keine erfundene Einstufung:** `medical` steht im Schema
 * als Voreinstellung auf `none` und traegt in der Recherche Art. 9
 * DSGVO (Gesundheitsdaten); `recovery` fuehrt HRV und Schlaf.
 */
export const HEIKEL: Partial<Record<Modul, string>> = {
  medical: 'Gesundheitsdaten — nur mit ausdrücklicher Freigabe',
  recovery: 'HRV und Schlaf sind personennah',
}

/**
 * Die fuenf Autonomy-Stufen.
 *
 * `[cmd]` Aus `AUTONOMY_ARCHITECTURE.md` des Vorgaengerrepos, ueber
 * die Recherche (Abschnitt 2.1) belegt: 1 Supervised · 2 Guided ·
 * 3 Collaborative · 4 Adaptive · 5 Autonomous.
 *
 * `[read]` **Sie beschreiben die Reife des Athleten, nicht die Rechte
 * des Coaches** — und sie werden hier nur GEZEIGT. Eine Wirkung hat
 * die Stufe im Produkt nicht; das ist ausdruecklich nicht Teil von
 * G-90.
 */
export const STUFEN: Array<{ stufe: number; name: string; text: string }> = [
  { stufe: 1, name: 'Supervised', text: 'Jede Änderung wird begleitet.' },
  { stufe: 2, name: 'Guided', text: 'Erinnerungen und enge Führung.' },
  { stufe: 3, name: 'Collaborative', text: 'Empfehlungen, kleine Anpassungen selbst.' },
  { stufe: 4, name: 'Adaptive', text: 'Deload, Volumen und Übungstausch selbständig.' },
  { stufe: 5, name: 'Autonomous', text: 'Führt das Programm eigenständig.' },
]

export function stufeName(n: number): string {
  return STUFEN.find(s => s.stufe === n)?.name ?? `Stufe ${n}`
}

/** Ein Feldname des Logs als lesbare Beschriftung. */
export function feldLabel(feld: string): string {
  const m = feld.match(/^(.+)_(visibility|auto_apply|level)$/)
  if (!m) return feld
  const modul = MODUL_LABEL[m[1] as Modul] ?? m[1]
  if (m[2] === 'visibility') return `${modul} · Sicht`
  if (m[2] === 'auto_apply') return `${modul} · ohne Bestätigung`
  return `${modul} · Stufe`
}

/** Einen Logwert lesbar machen — `true`/`false` sind sonst nichtssagend. */
export function feldWert(feld: string, wert: unknown): string {
  if (wert === null || wert === undefined) return '—'
  if (feld.endsWith('_auto_apply')) return wert === true ? 'ja' : 'nein'
  if (feld.endsWith('_level')) return `${wert} · ${stufeName(Number(wert))}`
  return String(wert)
}
