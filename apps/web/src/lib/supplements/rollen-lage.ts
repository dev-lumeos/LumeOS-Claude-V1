// Die drei Zustaende einer Transporter- und Enzympruefung — G-186.
//
// ══ DER BEFUND, DER DIE FORM BESTIMMT ═══════════════════════════════
//
// `[cmd]` **Gemessen 2026-08-28, NUR die Katalogzeilen**
// (`entity_type = 'supplement'`):
//
//     entity_transporters   135   unknown 64 · not_relevant 54
//                                 inhibitor 16 · inducer 1
//     entity_cyp            816   not_relevant 565 · unknown 190
//                                 inhibitor 57 · substrate 2 · inducer 2
//
// `[read]` **Das weicht vom Punkt ab, und der Unterschied traegt.**
// Der Punkt nennt 4.617 und 3.001 — das sind ALLE Zeilen, ueberwiegend
// Medikamente (4.482 bzw. 1.890) und Performance-Verbindungen (295).
// **Der Substanzkatalog sieht davon 951, nicht 7.618.**
//
// `[read]` **Und die Verteilung dreht sich damit:** bei den
// Transportern ist `unknown` die groesste Gruppe (64 von 135), nicht
// `not_relevant`. **Wer nur „91 Prozent geprueft" liest, baut die
// falsche Betonung.**
//
// ══ WARUM DREI ZUSTAENDE UND NICHT ZWEI ═════════════════════════════
//
// `[read]` **Dieselbe Klasse wie `begruendet_leer` gegen
// `nicht_bearbeitet` (G-208) und wie `DosisZustand` (G-199).** Der
// Unterschied ist sicherheitsrelevant:
//
//     rolle          „hemmt CYP3A4"      ein Befund
//     ohne_befund    „geprueft, nichts"  eine AUSSAGE ueber die Pruefung
//     ungeprueft     —                   niemand hat nachgesehen
//
// `[read]` **„Nichts angezeigt" darf nicht beides bedeuten koennen.**
// Wer eine Substanz mit 6 `not_relevant`-Zeilen genauso leer sieht
// wie eine mit 6 `unknown`-Zeilen, haelt Ungeprueftes fuer
// unbedenklich.
//
// ══ WARUM SERVERFREI ════════════════════════════════════════════════
//
// `[read]` **Dasselbe Muster wie `dosis-zustand.ts` (G-199) und
// `wirkstoff-luecke.ts` (G-208).** Die Anzeige importiert von hier
// Werte; der Lesepfad zieht `next/headers` und darf es nicht (A-30).

/** Die drei Zustaende. Mehr gibt es nicht. */
export type RollenZustand = 'rolle' | 'ohne_befund' | 'ungeprueft'

/**
 * Eine Zeile aus `entity_cyp` oder `entity_transporters`.
 *
 * `[read]` **`name` ist Enzym ODER Transporter** — die zwei Tabellen
 * haben dieselbe Form mit verschiedenen Spaltennamen (`enzyme` bzw.
 * `transporter`). Der Lesepfad vereinheitlicht sie hier.
 */
export type RollenZeile = {
  art: 'enzym' | 'transporter'
  name: string
  rolle: string
  evidenz: string | null
  hinweis: string | null
}

/**
 * Was eine Substanz an Transporter- und Enzymlage traegt.
 *
 * `[read]` **Die zwei Zahlen sind der Punkt.** Ohne sie waere die
 * Anzeige wieder zweiwertig — Befund oder nichts.
 */
export type RollenLage = {
  /** Die echten Befunde, entdoppelt und sortiert. */
  befunde: RollenZeile[]
  /** `not_relevant` — geprueft, ohne Befund. */
  ohne_befund: number
  /** `unknown` — nicht geprueft. */
  ungeprueft: number
}

export const LEERE_LAGE: RollenLage = {
  befunde: [], ohne_befund: 0, ungeprueft: 0,
}

/**
 * Die Rolle eines Eintrags einordnen.
 *
 * `[cmd]` **Die Werte stammen aus dem Bestand, nicht aus einer
 * Annahme:** `not_relevant`, `unknown`, `inhibitor`, `substrate`,
 * `inducer`, `substrate_and_inhibitor`.
 *
 * `[read]` **Ein unbekannter Wert gilt als BEFUND, nicht als
 * ungeprueft.** Das ist die Lehre aus `b?.abbr ?? m` (G-207): was die
 * Anzeige nicht kennt, darf sie nicht stillschweigend zu „nichts"
 * machen. **Eine neue Rolle in der Pipeline erscheint dann als das,
 * was sie ist — ein Befund, den jemand ansehen muss.**
 */
export function zustandVon(rolle: string | null | undefined): RollenZustand {
  const r = String(rolle ?? '').trim().toLowerCase()
  if (!r) return 'ungeprueft'
  if (r === 'not_relevant') return 'ohne_befund'
  if (r === 'unknown') return 'ungeprueft'
  return 'rolle'
}

/** Der deutsche Name einer Rolle — oder der Rohwert. */
const ROLLE_TEXT: Record<string, string> = {
  inhibitor: 'hemmt',
  substrate: 'wird darüber abgebaut',
  inducer: 'steigert',
  substrate_and_inhibitor: 'wird abgebaut und hemmt',
}

export function rolleText(rolle: string): string {
  return ROLLE_TEXT[String(rolle).trim().toLowerCase()] ?? rolle
}

/**
 * Aus Rohzeilen eine Lage machen.
 *
 * `[read]` **Nichts wird weggeworfen — es wird gezaehlt.** Das ist der
 * Unterschied zu `.filter(Boolean)` aus G-207: eine Zeile, die keinen
 * Befund traegt, verschwindet nicht, sie erhoeht einen Zaehler.
 *
 * `[read]` **Entdoppelt wird ueber Art, Name und Rolle** — der
 * Bestand fuehrt dieselbe Aussage mehrfach, wenn mehrere Quellen sie
 * belegen (wie bei den Laborwirkungen in G-186, 271 Zeilen auf 156
 * verschiedene).
 */
export function lageAus(
  zeilen: Array<{
    art: 'enzym' | 'transporter'
    name: unknown
    rolle: unknown
    evidenz?: unknown
    hinweis?: unknown
  }>,
): RollenLage {
  const befunde: RollenZeile[] = []
  const gesehen = new Set<string>()
  let ohneBefund = 0
  let ungeprueft = 0

  for (const z of zeilen) {
    const zustand = zustandVon(z.rolle as string)
    if (zustand === 'ohne_befund') { ohneBefund += 1; continue }
    if (zustand === 'ungeprueft') { ungeprueft += 1; continue }

    const name = typeof z.name === 'string' ? z.name.trim() : ''
    if (!name) {
      // `[read]` **Eine Rolle ohne Namen ist kein Befund, sondern ein
      // Datenfehler.** Sie faellt zu „ungeprueft" — sichtbar, statt
      // als halbe Zeile angezeigt zu werden.
      ungeprueft += 1
      continue
    }
    const rolle = String(z.rolle ?? '').trim()
    const schluessel = `${z.art}|${name.toLowerCase()}|${rolle.toLowerCase()}`
    if (gesehen.has(schluessel)) continue
    gesehen.add(schluessel)
    befunde.push({
      art: z.art,
      name,
      rolle,
      evidenz: typeof z.evidenz === 'string' && z.evidenz.trim()
        ? z.evidenz.trim() : null,
      hinweis: typeof z.hinweis === 'string' && z.hinweis.trim()
        ? z.hinweis.trim() : null,
    })
  }

  befunde.sort((a, b) => a.art.localeCompare(b.art)
    || a.name.localeCompare(b.name, 'de'))
  return { befunde, ohne_befund: ohneBefund, ungeprueft }
}

/**
 * Der Satz unter den Befunden.
 *
 * `[read]` **Er nennt beide Zahlen getrennt oder gar nicht.** Ein
 * gemeinsames *„N geprueft"* waere wieder die Zweiwertigkeit, gegen
 * die dieser Punkt gebaut ist.
 *
 * `[cmd]` **Beispiel aus dem Bestand:** Apigenin traegt 3 `inhibitor`
 * und 3 `unknown` — der Satz sagt dann *„3 weitere Enzyme und
 * Transporter sind nicht geprueft"*, nicht *„6 geprueft"*.
 */
export function lageSatz(lage: RollenLage): string | null {
  const teile: string[] = []
  if (lage.ohne_befund > 0) {
    teile.push(`${lage.ohne_befund} geprüft, ohne Befund`)
  }
  if (lage.ungeprueft > 0) {
    teile.push(`${lage.ungeprueft} nicht geprüft`)
  }
  if (teile.length === 0) return null
  return `Weitere Enzyme und Transporter: ${teile.join(' · ')}.`
}

/**
 * Der Satz, wenn es GAR NICHTS gibt.
 *
 * `[read]` **Auch das ist eine Auskunft.** `[cmd]` Von 412 sichtbaren
 * Substanzen haben **111 CYP-Daten und 14 Transporterdaten** — die
 * uebrigen haben keine Zeile, und das heisst weder „geprueft" noch
 * „unbedenklich".
 */
export const KEINE_LAGE =
  'Zu diesem Stoff liegt keine Untersuchung von Enzymen und '
  + 'Transportern vor — weder ein Befund noch das Ergebnis, dass '
  + 'keiner besteht.'
