// Die Rechnung fuer die Rotationskarte — G-388.
//
// ══ WARUM EINE EIGENE DATEI ═════════════════════════════════════════
//
// `[cmd]` **Gemessen: HTTP 500 auf JEDER Route**, nachdem
// `tab-injektionen.tsx` (`'use client'`) `tageSeitInjektion` als WERT
// aus `injektion-read.ts` importierte. **Diese Datei importiert
// `@lumeos/shared/session`** — ein Wert-Import zieht das Servermodul
// ins Browserbuendel.
//
// `[read]` **`tsc --noEmit` bleibt dabei gruen** — der Typecheck sieht
// die Laufzeitgrenze nicht. **Nur der Server sagt es**, und zwar mit
// 500 statt mit einer Meldung.
//
// `[read]` **Also: die reine Rechnung hierher, ohne einen einzigen
// Import.** Der Leseweg behaelt die Abfragen, die Karte bekommt die
// Rechnung. Beide Seiten der Client-Grenze koennen diese Datei laden.

/** Eine Zeile aus `medical.injection_sites`, auf das Noetige verkuerzt. */
export type OrtFuerKarte = {
  id: string
  display_name: string
}

/** Eine Zeile aus `medical.injection_logs`, auf das Noetige verkuerzt. */
export type ProtokollFuerKarte = {
  site_id: string
  injected_at: string
}

/**
 * Welche Punkte der Koerperkarte eine anatomische Region abdeckt.
 *
 * `[cmd]` **`injection_sites` fuehrt REGIONEN ohne Seite** — `deltoid`,
 * `vastus_lateralis`, `ventrogluteal`, `subcutaneous`. **Kein
 * `delt_l`/`delt_r`.**
 *
 * `[cmd]` **Die Ziel-Ids stammen aus `INJEKTIONS_ORTE`**
 * (`packages/ui/src/koerperkarte-pfade.ts:243-262`), nicht aus dem
 * Entwurf. **Geprueft: alle sechs sind dort vorhanden.**
 *
 * `[read]` **`subcutaneous` bleibt leer, und das ist richtig:** es ist
 * ein WEG, kein Ort. Es hat keine Stelle auf der Figur, und
 * `INJEKTIONS_ORTE` fuehrt deshalb keine.
 */
export const KARTEN_ORTE: Record<string, readonly string[]> = {
  deltoid: ['delt_l', 'delt_r'],
  vastus_lateralis: ['quad_l', 'quad_r'],
  ventrogluteal: ['vg_l', 'vg_r'],
  subcutaneous: [],
}

/**
 * Tage seit der letzten Injektion je Kartenpunkt.
 *
 * `[read]` **Herausgezogen, damit die Rechnung pruefbar ist** — eine
 * Rechnung im JSX prueft ein Waechter nur als Wort.
 *
 * `[cmd]` **Ohne Protokollzeile bleibt `daysSince` `undefined`, nicht
 * 0** — **0 hiesse „heute injiziert".** `InjektionsKarte` faerbt
 * `undefined` als „nie" (`var(--fg-dim)`), und genau das ist die
 * Aussage.
 */
export function tageSeitInjektion(
  orte: readonly OrtFuerKarte[],
  protokoll: readonly ProtokollFuerKarte[],
  heute: Date,
): Array<{ id: string; daysSince?: number; label?: string }> {
  const punkte: Array<{ id: string; daysSince?: number; label?: string }> = []
  for (const ort of orte) {
    const ziele = KARTEN_ORTE[ort.id] ?? []
    const letzte = protokoll.find(p => p.site_id === ort.id)
    let tage: number | undefined
    if (letzte) {
      const ms = heute.getTime() - Date.parse(letzte.injected_at)
      if (Number.isFinite(ms)) tage = Math.max(0, Math.floor(ms / 86400000))
    }
    for (const ziel of ziele) {
      punkte.push({ id: ziel, daysSince: tage, label: ort.display_name })
    }
  }
  return punkte
}
