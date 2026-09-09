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
 * Die einzige Umbenennung zwischen Zeilen-Id und Punkt-Id.
 *
 * ══ WAS HIER STAND, UND WARUM ES FALSCH WURDE ═══════════════════════
 *
 * `[cmd]` **Bis C-445 fuehrte `injection_sites` vier REGIONEN ohne
 * Seite** (`deltoid`, `vastus_lateralis`, `ventrogluteal`,
 * `subcutaneous`), und `KARTEN_ORTE` bildete jede auf ein
 * Links/Rechts-Paar ab. **Der Kommentar war am Vormittag richtig.**
 *
 * `[cmd]` **Seit C-445 heissen die Zeilen selbst `delt_l`, `quad_l`,
 * `vglute_l`** — 16 Stueck. **`KARTEN_ORTE['delt_l']` ist damit
 * `undefined`, und die Karte blieb leer.** Genau die Klasse, vor der
 * ein alter Kommentar nicht schuetzt: er beschrieb einen Zustand, den
 * es nicht mehr gab.
 *
 * `[read]` **Die Zeilen-Id IST jetzt die Punkt-Id** — bis auf einen
 * Fall. Deshalb keine Zuordnungstabelle mehr, sondern nur die
 * Ausnahme.
 *
 * `[cmd]` **Gemessen, 16 gegen 16:**
 *
 *     decken sich (8)   delt_l/r, glute_l/r, lat_l/r, quad_l/r
 *     nur Datenbank     vglute_l/r, abd_l/r, sq_delt_l/r, thigh_sq_l/r
 *     nur Karte         pec_l/r, bicep_l/r, vg_l/r, tricep_l/r
 *
 * `[read]` **`vglute` gegen `vg` ist eine reine Schreibweise** — der
 * Punkt existiert, er heisst nur anders. **Das laesst sich hier
 * abbilden, ohne `packages/ui` anzufassen** (Admin und Coach nutzen
 * es mit). **Damit sind es zehn.**
 *
 * `[read]` **Die sechs SubQ-Orte haben keinen Punkt** — das ist keine
 * Schreibweise, sondern eine fehlende Stelle auf der Figur. **Steht
 * im Bericht, nicht hier erfunden.**
 */
export const PUNKT_UMBENENNUNG: Record<string, string> = {
  vglute_l: 'vg_l',
  vglute_r: 'vg_r',
}

/**
 * Der Kartenpunkt zu einer Zeilen-Id.
 *
 * `[read]` **`null` heisst: dieser Ort hat keine Stelle auf der
 * Figur** — nicht „unbekannt". Die sechs SubQ-Orte fallen so heraus,
 * ohne dass jemand sie einzeln auflisten muss.
 */
export function punktFuerOrt(
  id: string,
  bekannt?: ReadonlySet<string>,
): string | null {
  const ziel = PUNKT_UMBENENNUNG[id] ?? id
  if (bekannt && !bekannt.has(ziel)) return null
  return ziel
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
  /**
   * G-393: welche Punkt-Ids die Figur kennt.
   *
   * `[read]` **Ohne diese Menge kommen auch Orte durch, die keine
   * Stelle auf der Figur haben** — `InjektionsKarte` wirft sie dann
   * still weg, und die Kachel behauptet mehr Punkte als sie zeigt.
   * **Mit ihr faellt die Zahl hier, wo sie messbar ist.**
   *
   * `[read]` **Ohne Angabe kommt alles durch** — dann entscheidet
   * die Karte, wie bisher.
   */
  bekanntePunkte?: ReadonlySet<string>,
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
    // `[cmd]` **G-393: die Zeilen-Id IST die Punkt-Id.** Vorher stand
    // hier `KARTEN_ORTE[ort.id] ?? []` — eine Zuordnung von REGIONEN
    // auf Paare, die seit C-445 fuer jede Zeile `undefined` lieferte.
    // **Die Karte blieb leer, obwohl 16 Zeilen dastanden.**
    const ziel = punktFuerOrt(ort.id, bekanntePunkte)
    if (!ziel) continue
    const letzte = protokoll.find(p => p.site_id === ort.id)
    let tage: number | undefined
    if (letzte) {
      const ms = heute - Date.parse(letzte.injected_at)
      if (Number.isFinite(ms)) tage = Math.max(0, Math.floor(ms / 86400000))
    }
    punkte.push({ id: ziel, daysSince: tage, label: ort.display_name })
  }
  return punkte
}
