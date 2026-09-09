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
  stichtag: string,
): Array<{ id: string; daysSince?: number; label?: string }> {
  // ══ G-390: ein STICHTAG, kein `new Date()` ═════════════════════════
  //
  // `[cmd]` **Hier stand `heute: Date`, und der Aufrufer gab
  // `new Date()` hinein** — im Browser eine andere Uhr als beim
  // Rendern auf dem Server. **Gemessen: Hydrationsfehler auf allen
  // elf Reitern des Moduls**, weil `tab-injektionen` in `ansicht.tsx`
  // importiert wird und die Rechnung schon beim Anstrich der Schale
  // laeuft.
  //
  // `[cmd]` **G-74 hatte genau das schon behoben**, und die Warnung
  // stand woertlich in `ansicht.tsx:193`: *„nie `new Date()`, das
  // zerlegte die Hydration."* **G-388 hat es wieder eingebaut.**
  //
  // `[read]` **Ein `string` statt `Date` macht den Fehler
  // unmoeglich** — wer keinen Zeitpunkt annimmt, kann keinen
  // falschen annehmen. Der Aufrufer muss einen Tag NENNEN, und der
  // kommt serverseitig.
  const heute = Date.parse(`${stichtag}T00:00:00Z`)
  if (!Number.isFinite(heute)) return []
  const punkte: Array<{ id: string; daysSince?: number; label?: string }> = []
  for (const ort of orte) {
    const ziele = KARTEN_ORTE[ort.id] ?? []
    const letzte = protokoll.find(p => p.site_id === ort.id)
    let tage: number | undefined
    if (letzte) {
      const ms = heute - Date.parse(letzte.injected_at)
      if (Number.isFinite(ms)) tage = Math.max(0, Math.floor(ms / 86400000))
    }
    for (const ziel of ziele) {
      punkte.push({ id: ziel, daysSince: tage, label: ort.display_name })
    }
  }
  return punkte
}
