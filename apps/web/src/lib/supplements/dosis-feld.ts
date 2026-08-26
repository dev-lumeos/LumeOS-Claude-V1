/**
 * Die Dosisfelder aus `supplement_dosing` lesen — G-191.
 *
 * ══ DER BEFUND ═════════════════════════════════════════════════════
 *
 * **Tom, 2026-08-25**, nach dem Durchklicken von Astaxanthin, GHK-Cu
 * und Drostanolon: *„woher kommen diese unterschiedlichen
 * darstellungen?"*
 *
 * `[cmd]` **Es sind nicht drei Darstellungen, sondern ein Fehler in
 * drei Auspraegungen.** `guideline_dose` und `upper_limit` sind
 * **Objekte**, keine Texte:
 *
 *     {"value": null,
 *      "source_ids": [],
 *      "missing_reason": "No validated clinical guideline dose (…)",
 *      "provenance_type": "CLINICAL_GUIDELINE"}
 *
 * `[cmd]` Die alte Lesefunktion fiel bei `value: null` auf
 * `Object.values(o).join(' · ')` zurueck — **und schrieb damit den
 * Grund und den Statuscode in die Kachel**, wo eine Menge stehen
 * sollte.
 *
 * `[cmd]` **Gemessen 2026-08-26 ueber die 412 Katalogzeilen, gegen die
 * alte Funktion simuliert:**
 *
 *     Menge:      250 Statuscode ·   8 echter Wert · 154 leer
 *     Obergrenze: 241 Statuscode ·   0 echter Wert · 171 leer
 *
 * `[read]` **Die Obergrenze-Kachel hat noch nie einen richtigen Wert
 * gezeigt** — 0 von 412.
 *
 * `[cmd]` **`Testosterone Enanthate` sah gut aus, weil das Feld dort
 * NULL ist** — nicht weil es besser gepflegt waere.
 *
 * ══ DER ZWEITE FEHLER ══════════════════════════════════════════════
 *
 * `[cmd]` **Auch bei gefuelltem `value` war die Anzeige falsch.**
 * `value` ist bei `studied_dose_ranges` ein Array strukturierter
 * Spannen (`min`, `max`, `units`, `population`, `route_form`, …). Die
 * alte Funktion flachte auch das ein:
 *
 *     Beta-carotene → „50 · 15 · mg/day · years (ATBC 20 mg; …)"
 *
 * **Das sind zusammenhanglose Zahlen.** Deshalb setzt `spanneText`
 * die Spanne aus `min`/`max`/`units` zusammen, statt alle Werte zu
 * verketten.
 *
 * ══ WAS HIER NICHT PASSIERT ════════════════════════════════════════
 *
 * **Kein Wert wird erfunden**, wo `value` null ist.
 * **Die Objekte werden nicht flachgeklopft** — `source_ids` und
 * `provenance_type` bleiben in der Spalte und gehoeren zur
 * Belegkette (C-270).
 */

/** Ein gelesenes Dosisfeld: entweder ein Wert oder ein Grund. */
export type DosisFeld = {
  /** Die Menge als Text — nur wenn `value` wirklich gesetzt ist. */
  wert: string | null
  /**
   * Warum es keine gibt, auf Deutsch.
   *
   * `[read]` **Das ist die Unterscheidung, an der der Katalog
   * haengt:** *„es gibt keine"* ist etwas anderes als *„wir wissen es
   * nicht"*. Sie darf nicht verschwinden, nur weil sie klein gesetzt
   * gehoert.
   */
  grund: string | null
}

export const LEERES_FELD: DosisFeld = { wert: null, grund: null }

/**
 * Die wiederkehrenden Gruende auf Deutsch.
 *
 * `[cmd]` **Gemessen 2026-08-26 ueber alle vier Felder: 857 belegte
 * Gruende, aber nur 16 verschiedene.** Die acht haeufigsten decken
 * **836 von 857 (97,6 %)** ab:
 *
 *     272  No validated clinical guideline dose (…)
 *     154  Manufacturer serving sizes are product-specific (…)
 *     104  UL concept applies to nutrients (IOM/EFSA DRI framework) (…)
 *      75  NOT_APPLICABLE: no regulatory UL concept for unapproved (…)
 *      74  NO_RELIABLE_EVIDENCE: no reliable human dose-finding (…)
 *      61  NOT_APPLICABLE: UL is a nutrient DRI concept (…)
 *      50  NOT_APPLICABLE: no approved medicinal product label (…)
 *      46  NOT_APPLICABLE: no approved medicinal product label (…)
 *
 * `[read]` **Deshalb Abbildung in der Anzeige statt Nachforderung bei
 * Kimi** — die Entscheidung aus Punkt 2 des Auftrags, mit dieser Zahl
 * als Begruendung:
 *
 * - **Es sind 8 Saetze, keine 272.** Eine Nachforderung fuer acht
 *   wiederkehrende Formeln waere ein Auftrag mit Wartezeit fuer etwas,
 *   das hier eine Tabelle ist.
 * - **Der Grund ist keine Inhaltsangabe, sondern ein Zustand.** *„Es
 *   gibt keine Leitliniendosis"* ist eine Aussage ueber den
 *   Forschungsstand, nicht ueber die Substanz — sie aendert sich nicht
 *   je Eintrag.
 * - **Der Rest bleibt lesbar:** die uebrigen 21 Belege sind
 *   substanzeigene Saetze (Beta-Carotin, Tryptophan, Chrom). Sie
 *   werden **nicht** abgebildet, sondern unveraendert gezeigt — sie
 *   tragen echte Information, und eine Abbildung wuerde sie
 *   verschlucken.
 *
 * `[read]` **Kein Text wird geaendert** (Auftrag: *„Keine Texte
 * aendern"*). Die Spalte bleibt englisch; uebersetzt wird bei der
 * Anzeige.
 */
const GRUND_DE: Array<[RegExp, string]> = [
  [/^No validated clinical guideline dose/i,
    'Keine Leitlinie nennt eine Dosis.'],
  [/^Manufacturer serving sizes are product-specific/i,
    'Herstellerangaben sind produktabhängig — keine einheitliche Menge.'],
  [/^UL concept applies to nutrients/i,
    'Eine Obergrenze gibt es nur für Nährstoffe — für diesen Stoff keine.'],
  [/^NOT_APPLICABLE: no regulatory UL concept for unapproved/i,
    'Für nicht zugelassene Wirkstoffe gibt es keine Obergrenze.'],
  [/^NO_RELIABLE_EVIDENCE/i,
    'Keine belastbare Studie zur Dosierung gefunden.'],
  [/^NOT_APPLICABLE: UL is a nutrient DRI concept/i,
    'Für Peptide gibt es keine Obergrenze.'],
  [/^NOT_APPLICABLE: no approved medicinal product label/i,
    'Kein zugelassenes Arzneimittel — daher keine Packungsangabe.'],
  [/^NOT_APPLICABLE: cross-reference record/i,
    'Verweiseintrag — die Angaben stehen beim Haupteintrag.'],
  [/^Cross-ref record/i,
    'Verweiseintrag — die Angaben stehen beim Haupteintrag.'],
  [/^No tolerable upper intake level established/i,
    'IOM und EFSA haben keine Obergrenze festgelegt.'],
]

/**
 * Einen Grund auf Deutsch bringen.
 *
 * `[read]` **Trifft keine Zeile, bleibt der Satz stehen.** Das ist
 * Absicht: die 21 substanzeigenen Gruende tragen echte Information
 * (*„EMS-Ausbruch 1989 durch verunreinigtes Tryptophan"*), und eine
 * ausgedachte Ersatzformel waere schlechter als ein englischer Satz.
 */
export function grundAufDeutsch(roh: string): string {
  const s = roh.trim()
  for (const [muster, de] of GRUND_DE) {
    if (muster.test(s)) return de
  }
  return s
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

function zahl(v: unknown): string | null {
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return null
}

/**
 * Eine einzelne Dosisspanne lesbar machen.
 *
 * `[cmd]` Aufbau aus dem Import: `{min, max, units, duration,
 * population, route_form, source_ids, provenance_type,
 * endpoint_context}`.
 *
 * `[read]` **Nur Menge und Einheit.** Population, Route und Endpunkt
 * gehoeren in den Fliesstext, nicht in eine Kachel mit einer Zeile —
 * genau der Fehler, den G-177 schon einmal geruegt hat.
 */
function spanneText(o: Record<string, unknown>): string | null {
  const min = zahl(o.min) ?? text(o.min)
  const max = zahl(o.max) ?? text(o.max)
  const einheit = text(o.units) ?? text(o.unit)
  const menge = min && max
    ? (min === max ? min : `${min}–${max}`)
    : (min ?? max)
  if (!menge) return text(o.text) ?? text(o.display)
  return einheit ? `${menge} ${einheit}` : menge
}

/** Was in `value` steht — eine Zahl, ein Text oder Spannen. */
function wertText(v: unknown): string | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'string') {
    const s = v.trim()
    return s && s !== 'null' && s !== '[]' && s !== '{}' ? s : null
  }
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : null
  if (Array.isArray(v)) {
    const teile: string[] = []
    for (const x of v) {
      const t = typeof x === 'object' && x !== null && !Array.isArray(x)
        ? spanneText(x as Record<string, unknown>)
        : wertText(x)
      // `[read]` Hoechstens zwei Spannen — mehr sprengt die Kachel,
      // und die vollstaendige Liste steht im Reiter „Dosierung".
      if (t && !teile.includes(t)) teile.push(t)
      if (teile.length === 2) break
    }
    return teile.length ? teile.join(' · ') : null
  }
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>
    return spanneText(o)
  }
  return null
}

/**
 * Ein Dosisfeld lesen: Wert ODER Grund, nie beides vermischt.
 *
 * `[read]` **Die ganze Zusage in einem Satz:** Steht in `value`
 * nichts, entsteht kein Wert — auch dann nicht, wenn das Objekt
 * technisch gefuellt ist. Das war der Fehler.
 */
export function dosisFeld(v: unknown): DosisFeld {
  if (v === null || v === undefined) return LEERES_FELD

  // Altbestand: manche Zeilen sind noch reiner Text.
  if (typeof v === 'string' || typeof v === 'number') {
    return { wert: wertText(v), grund: null }
  }

  if (Array.isArray(v)) {
    return { wert: wertText(v), grund: null }
  }

  if (typeof v === 'object') {
    const o = v as Record<string, unknown>
    // Ein Objekt OHNE `value`-Schluessel ist eine einzelne Spanne.
    if (!('value' in o)) {
      const t = spanneText(o)
      return t ? { wert: t, grund: null } : LEERES_FELD
    }
    const wert = wertText(o.value)
    if (wert) return { wert, grund: null }
    const roh = text(o.missing_reason)
    return { wert: null, grund: roh ? grundAufDeutsch(roh) : null }
  }

  return LEERES_FELD
}

/**
 * Menge und Obergrenze aus einer `supplement_dosing`-Zeile.
 *
 * `[read]` **`studied_dose_ranges` vor `guideline_dose`** — dieselbe
 * Reihenfolge wie bisher: was gemessen wurde, schlaegt was empfohlen
 * wird. Der Grund wird nur uebernommen, wenn KEINES der beiden einen
 * Wert traegt.
 */
export function dosisFelder(d: Record<string, unknown> | null | undefined): {
  menge: DosisFeld
  obergrenze: DosisFeld
} {
  const studiert = dosisFeld(d?.studied_dose_ranges)
  const leitlinie = dosisFeld(d?.guideline_dose)
  const menge = studiert.wert
    ? studiert
    : (leitlinie.wert ? leitlinie : (leitlinie.grund ? leitlinie : studiert))
  return { menge, obergrenze: dosisFeld(d?.upper_limit) }
}
