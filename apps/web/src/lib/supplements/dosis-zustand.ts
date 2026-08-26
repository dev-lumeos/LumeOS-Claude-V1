/**
 * Die drei Zustaende einer Dosiskachel — G-199.
 *
 * ══ WARUM DREI UND NICHT ZWEI ══════════════════════════════════════
 *
 * **Tom, 2026-08-26:** *„von mir aus muessen immer alle kacheln
 * angezeigt werden dass es einheitlich wirkt, wenn wir keine daten zur
 * kachel haben das halt in der kachel ausweisen."*
 *
 * `[read]` **Der Unterschied ist sicherheitsrelevant:** *„nie
 * untersucht"* darf nicht aussehen wie *„unbedenklich"*. Bei
 * Enhanced-Stoffen ist das der Unterschied zwischen Vorsicht und
 * falscher Sicherheit.
 *
 *     wert           „3–5 g/day"          eine Zahl
 *     gibt_es_nicht  „Fuer nicht zugelassene Wirkstoffe gibt es
 *                     keine Obergrenze"   eine AUSSAGE
 *     nicht_erhoben  —                    niemand hat gemessen
 *
 * ══ DIE MESSUNG, DIE DIE FORM ENTSCHIED ════════════════════════════
 *
 * **Auftrag: *„Miss, wie viele in welchen Zustand fallen, bevor du die
 * Darstellung waehlst. Wenn Zustand drei fast nie vorkommt, brauchen
 * zwei Zustaende eine eigene Form und der dritte nicht."***
 *
 * `[cmd]` **Gemessen 2026-08-26 ueber die 412 sichtbaren Substanzen:**
 *
 *                          Wert   Grund   nicht erhoben
 *     guideline_dose         14     261             137
 *     upper_limit             9     246             157
 *     studied_dose_ranges    98      85             229
 *     official_label_dose    40     236             136
 *
 * `[read]` **Zustand drei ist nicht selten — er ist bei drei von vier
 * Feldern die zweitgroesste Gruppe, bei `studied_dose_ranges` sogar
 * die groesste.** Damit braucht er eine eigene Form; die Bedingung des
 * Auftrags ist nicht eingetreten.
 *
 * `[read]` **Und die Zahlen sagen noch etwas:** ein echter Wert ist die
 * AUSNAHME (9–98 von 412). Wer nur „Wert oder nichts" baut, zeigt bei
 * neun von zehn Substanzen eine leere Kachel.
 */

/** Die drei Zustaende. Mehr gibt es nicht. */
export type DosisZustand = 'wert' | 'gibt_es_nicht' | 'nicht_erhoben'

export type DosisKachel = {
  id: string
  label: string
  zustand: DosisZustand
  /** Der Wert — nur bei `wert`. */
  wert: string | null
  /** Der Grund — nur bei `gibt_es_nicht`, auf Deutsch (G-191). */
  grund: string | null
}

/**
 * Der Text, der bei `nicht_erhoben` in der Kachel steht.
 *
 * `[read]` **„Nicht erhoben", nicht „keine Angabe".** Der Unterschied
 * ist die Aussage ueber die Welt: *keine Angabe* klingt nach einer
 * Luecke im Katalog, *nicht erhoben* sagt, dass niemand gemessen hat.
 * **Das ist der Zustand, der nicht wie Unbedenklichkeit aussehen
 * darf.**
 */
export const NICHT_ERHOBEN = 'Nicht erhoben'

/**
 * Eine Kachel aus Wert und Grund bauen.
 *
 * `[read]` **Die Reihenfolge ist die Aussagekraft:** ein Wert schlaegt
 * einen Grund, ein Grund schlaegt Schweigen.
 */
export function kachel(
  id: string, label: string,
  wert: string | null | undefined, grund: string | null | undefined,
): DosisKachel {
  const w = typeof wert === 'string' && wert.trim() ? wert.trim() : null
  if (w) return { id, label, zustand: 'wert', wert: w, grund: null }
  const g = typeof grund === 'string' && grund.trim() ? grund.trim() : null
  if (g) return { id, label, zustand: 'gibt_es_nicht', wert: null, grund: g }
  return { id, label, zustand: 'nicht_erhoben', wert: null, grund: null }
}

/**
 * Die feste Kachelmenge des Dosierungs-Reiters.
 *
 * ══ DIE AENDERUNG AN §9 ════════════════════════════════════════════
 *
 * `[read]` **§9 sagte: „kein Block ohne Inhalt."** Fuer Textbloecke
 * gilt das weiter — ein leerer Absatz ist ein Versprechen, das er
 * nicht einloest.
 *
 * **Fuer Zahlenkacheln gilt ab G-199: feste Menge je Reiter.** Toms
 * Begruendung traegt: wer drei Substanzen durchklickt, will die Zahlen
 * an derselben Stelle finden. **Eine fehlende Kachel verschiebt alle
 * anderen** — und dann sucht man bei jeder Substanz neu.
 */
export function dosisKacheln(z: {
  menge: string | null
  mengeGrund?: string | null
  obergrenze: string | null
  obergrenzeGrund?: string | null
  einnahme: string | null
  mitEssen: string | null
}): DosisKachel[] {
  return [
    kachel('menge', 'Übliche Menge', z.menge, z.mengeGrund),
    kachel('obergrenze', 'Obergrenze', z.obergrenze, z.obergrenzeGrund),
    // `[read]` Einnahme und Einheit haben keinen Grund im Bestand —
    // sie sind entweder da oder nicht erhoben.
    kachel('einnahme', 'Einnahme', z.einnahme, null),
    kachel('mitessen', 'Einheit', z.mitEssen, null),
  ]
}
