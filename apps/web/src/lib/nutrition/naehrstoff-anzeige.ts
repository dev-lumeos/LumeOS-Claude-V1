// Reine Anzeige-Helfer fuer den Nutrients-Tab (G-121) — bewusst OHNE
// Server-Importe: die Client-Komponente braucht diese Werte und
// Funktionen zur Laufzeit, und ein Import aus `naehrstoff-ordnung.ts`
// wuerde deren Sitzungs-Client mit ins Browser-Bundle ziehen.
import type { NaehrstoffKnoten } from './naehrstoff-ordnung'

/** Die Fenster, die die Oberflaeche anbietet (G-121, Toms Liste). */
export const FENSTER = [1, 7, 14, 30, 45, 60, 90] as const

export function fensterOderTag(roh: string | undefined): number {
  const n = Number(roh)
  return (FENSTER as readonly number[]).includes(n) ? n : 1
}

export type Scope = 'alle' | 'auffaellig' | 'unter'

/** Trifft der Filter den Knoten selbst? Zeilen ohne Referenz
 *  (`status: null`) sind nicht auffaellig, sondern unbewertet. */
export function trifft(k: NaehrstoffKnoten, scope: Scope): boolean {
  if (scope === 'auffaellig') return k.status === 'unter' || k.status === 'ueber'
  if (scope === 'unter') return k.status === 'unter'
  return true
}

/** Die Rekursion der Vorlage (`hasChildOutOfRange`): ein Elternknoten
 *  bleibt sichtbar, wenn irgendein Nachkomme den Filter trifft. */
export function kindTrifft(k: NaehrstoffKnoten, scope: Scope): boolean {
  return k.kinder.some(c => trifft(c, scope) || kindTrifft(c, scope))
}

export function sichtbar(k: NaehrstoffKnoten, scope: Scope): boolean {
  return trifft(k, scope) || kindTrifft(k, scope)
}

export function zaehleSichtbare(knoten: NaehrstoffKnoten[], scope: Scope): number {
  let n = 0
  for (const k of knoten) {
    if (!sichtbar(k, scope)) continue
    n += 1 + zaehleSichtbare(k.kinder, scope)
  }
  return n
}
