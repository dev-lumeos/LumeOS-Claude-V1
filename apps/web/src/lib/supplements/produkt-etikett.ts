// Das Etikett eines Produkts, geordnet — G-452.
//
// `[read]` **Reine Rechnung, kein I/O.** Serverfrei, damit die Anzeige
// sie als Wert importieren darf (A-30) und ein Test sie ohne Datenbank
// pruefen kann.
//
// ══ DIE DREI SACHEN, DIE DER AUFTRAG VERLANGT ═══════════════════════
//
// **1 — Zeilen OHNE Menge gehoeren gezeigt.**
//
// `[cmd]` **Gemessen 2026-09-14 ueber 3.000.982 Zeilen:**
// `not_stated` **1.591.063**, `exact` **1.394.584**, `less_than`
// **14.598**, `greater_than` **737**. `[read]` **Die Mehrheit hat
// keine Zahl** — `Vitamin A`, `Iron`, `Whey Protein concentrate` stehen
// so auf der Packung. **Wer nur Zahlen zeigt, zeigt die Minderheit.**
//
// **2 — Mischungen tragen die Gesamtmenge, die Zutaten folgen.**
//
// `[cmd]` **`blend_id` zeigt auf die `id` der Kopfzeile**, gemessen an
// `21cfe048` (MRI N.O. Black Powder, 54 Zeilen): Zeile 13 traegt
// *Proprietary Blend for Size & Recovery*, **3000 mg**, `blend_id =
// null`; die Zeilen 14 und 15 tragen `blend_id` = deren `id` und keine
// Menge.
//
// `[read]` **Damit braucht die Einrueckung keine Heuristik** — sie
// steht in den Daten. Ein Kopf ist, worauf gezeigt wird.
//
// **3 — Was LumeOS nicht kennt, ist erkennbar.**
//
// `[cmd]` **`supplement_id` ist bei 2.698.689 von 3.000.982 Zeilen
// null** (89,9 %). `[read]` **Deshalb wird NICHT das Unbekannte
// markiert, sondern das Bekannte** — eine Marke auf neun von zehn
// Zeilen ist keine Auskunft mehr, sondern Rauschen.
import type { InhaltsZeile } from './produkte-read'

/** Eine Zeile, wie sie auf dem Schirm steht. */
export type EtikettZeile = InhaltsZeile & {
  /** Steht sie eingerueckt unter einer Mischung? */
  eingerueckt: boolean
  /** Ist sie der Kopf einer Mischung — hat also Zutaten unter sich? */
  istMischung: boolean
}

/**
 * Die Zeilen in Etikettreihenfolge, Mischungen mit ihren Zutaten.
 *
 * `[read]` **Die Reihenfolge kommt aus `reihenfolge`, nicht aus der
 * Verschachtelung** — C-485 hat sie in Etikettreihenfolge geschrieben,
 * und auf der Packung steht die Zutat einer Mischung direkt unter ihr.
 * **Es reicht also, die Zeilen zu sortieren und jede zu markieren**;
 * ein Baum waere hier eine Umstellung, die die Packung nicht hat.
 *
 * `[cmd]` **Gegenprobe an `21cfe048`:** nach `reihenfolge` sortiert
 * folgen auf Zeile 13 (Kopf, 3000 mg) genau die Zeilen 14 und 15 mit
 * ihrem `blend_id` — die Sortierung allein stellt die Packung her.
 */
export function etikettZeilen(inhalt: readonly InhaltsZeile[]): EtikettZeile[] {
  // `[read]` **Zeilen ohne `reihenfolge` ans Ende, in gegebener
  // Folge** — sie tragen keine Aussage ueber ihren Platz, und eine
  // erfundene waere schlimmer als eine angehaengte.
  const sortiert = [...inhalt].sort((a, b) => {
    if (a.reihenfolge === null && b.reihenfolge === null) return 0
    if (a.reihenfolge === null) return 1
    if (b.reihenfolge === null) return -1
    return a.reihenfolge - b.reihenfolge
  })

  // Ein Kopf ist, worauf ein `blend_id` zeigt — gemessen, nicht geraten.
  const koepfe = new Set(
    sortiert.flatMap(z => z.blend_id ? [z.blend_id] : []),
  )

  return sortiert.map(z => ({
    ...z,
    eingerueckt: z.blend_id !== null,
    istMischung: koepfe.has(z.id),
  }))
}

/**
 * Die Menge als Text — oder der Grund, dass keine dasteht.
 *
 * `[cmd]` **`not_stated` heisst NICHT null.** Der Hersteller nennt die
 * Zutat auf dem Etikett ohne Zahl; eine `0` waere eine Behauptung, ein
 * `—` saehe aus wie eine Angabe.
 *
 * `[read]` **Deshalb gibt diese Funktion `null` zurueck, wenn es keine
 * Menge gibt** — die Anzeige setzt dann den benannten Hinweis, nicht
 * ein Zeichen.
 */
export function mengeText(z: InhaltsZeile): string | null {
  if (z.amount_per_serving === null) return null
  // `[cmd]` **Die Einheit kann `{Calories}` sein** (gemessen bei
  // `Calories` und `Calories from Fat`) — die geschweiften Klammern
  // stehen so in den DSLD-Daten und gehoeren nicht auf den Schirm.
  const einheit = (z.unit ?? '').replace(/[{}]/g, '').trim()
  const zahl = String(z.amount_per_serving)
  const vor = z.amount_qualifier === 'less_than' ? '< '
    : z.amount_qualifier === 'greater_than' ? '> '
    : ''
  return einheit ? `${vor}${zahl} ${einheit}` : `${vor}${zahl}`
}

/**
 * Wie viele Zutaten LumeOS auswerten kann.
 *
 * `[read]` **Zwei Zahlen, nicht eine Quote** — „11 %" sagt nicht, ob
 * von neun oder von neunhundert die Rede ist.
 */
export function bekanntZaehlen(
  inhalt: readonly InhaltsZeile[],
): { bekannt: number; gesamt: number } {
  return {
    bekannt: inhalt.filter(z => z.bekannt).length,
    gesamt: inhalt.length,
  }
}

/**
 * Die Portion als Text — `40 g [2 scoops]`.
 *
 * `[cmd]` **Die Einheit traegt die Klammerangabe bereits:** gemessen
 * bei Dr. Mercola steht in `portionseinheit` woertlich `Gram(s) [2
 * scoops]`. **Sie wird NICHT zerlegt** — was der Hersteller in einem
 * Feld nennt, gehoert in einer Zeile gezeigt.
 */
export function portionText(
  groesse: number | null, einheit: string | null,
): string | null {
  if (groesse === null && !einheit) return null
  if (groesse === null) return einheit
  return einheit ? `${groesse} ${einheit}` : String(groesse)
}
