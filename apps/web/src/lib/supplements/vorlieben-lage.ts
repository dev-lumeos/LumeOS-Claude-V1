// Die Vorlieben eines Nutzers — G-468, serverfrei.
//
// **Tom, seit fuenf Tagen offen:**
//
// > jedes modul braucht seine preferences
// > nutrition haben wir das schon
// > supplement wuerde das auch sinn machen fuer: allergien nochmals
// > ausweisen, meine bevorzugten marken verwaltbar machen, etc
//
// ══ TOMS REGEL AUS E-84 ═════════════════════════════════════════════
//
// > solange es an DENSELBEN ORT geschrieben wird
//
//     zwei Flaechen, EIN Speicher      richtig
//     zwei Flaechen, ZWEI Speicher     zwei Wahrheiten
//
// `[read]` **Deshalb liegen die Allergien NICHT hier.** `[cmd]`
// **`public.user_allergies` bleibt die Wahrheit** (C-498), und der
// Reiter zeigt sie ueber dieselbe `AllergienKachel`, die Settings
// benutzt — **ein Baustein, ein Schreibweg, zwei Orte.**
//
// `[read]` **Serverfrei** (A-30): eine Regel, die im JSX steht, ist
// nicht pruefbar — die Lehre aus G-491.
import { FORMEN, type FormFacette } from './produkt-etikett'

/**
 * Was C-511 je Nutzer fuehrt.
 *
 * `[cmd]` **Gemessen 2026-09-24** (`\d supplements.supplement_preferences`):
 * sieben Felder, alle `NOT NULL` mit Vorgabe. `[read]` **Ein
 * fehlender Satz ist deshalb kein Fehlerfall** — `…_read` liefert
 * die Vorgaben ueber `COALESCE`.
 */
export type SupplementVorlieben = {
  preferred_brands: string[]
  avoided_ingredients: string[]
  only_on_market: boolean
  preferred_forms: string[]
  /** `HH:MM` — C-511 fuehrt `time[]`, die Oberflaeche zeigt Uhrzeiten. */
  preferred_intake_times: string[]
  note: string
}

/** Der Stand eines Nutzers ohne eigenen Satz. */
export const VORGABE: SupplementVorlieben = {
  preferred_brands: [],
  avoided_ingredients: [],
  only_on_market: true,
  preferred_forms: [],
  preferred_intake_times: [],
  note: '',
}

/**
 * Aus der Antwort von `supplement_preferences_read` einen Stand.
 *
 * `[read]` **Jedes Feld einzeln geprueft** — die Funktion gibt
 * `jsonb` zurueck, und ein fehlendes Feld waere `undefined`, nicht
 * ein leeres Feld. `[cmd]` **Die Lehre aus G-484:** wer eine
 * RPC-Antwort ungeprueft ausliest, baut auf eine Form, die niemand
 * zugesagt hat.
 */
export function ausJson(roh: unknown): SupplementVorlieben {
  if (!roh || typeof roh !== 'object') return VORGABE
  const o = roh as Record<string, unknown>
  const liste = (v: unknown): string[] => Array.isArray(v)
    ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '')
    : []
  return {
    preferred_brands: liste(o.preferred_brands),
    avoided_ingredients: liste(o.avoided_ingredients),
    only_on_market: typeof o.only_on_market === 'boolean'
      ? o.only_on_market : true,
    preferred_forms: liste(o.preferred_forms),
    // `[cmd]` **Postgres liefert `time` als `HH:MM:SS`** — die
    // Oberflaeche zeigt Stunden und Minuten.
    preferred_intake_times: liste(o.preferred_intake_times)
      .map(t => t.slice(0, 5)),
    note: typeof o.note === 'string' ? o.note : '',
  }
}

/**
 * Die Formen zur Auswahl — mit ihren gemessenen Zahlen.
 *
 * `[read]` **Nicht nachgebaut** (G-335): `FORMEN` steht in
 * `produkt-etikett.ts` und traegt die Zahlen aus der Datenbank.
 * `[cmd]` **Zwei eigene Listen liefen in G-335 auseinander** —
 * *„Pre-workout"* gegen *„Vor dem Training"* fuer denselben Wert.
 */
export function formenZurWahl(): readonly FormFacette[] {
  // `[read]` **`Unknown` steht nicht zur Wahl** — eine Vorliebe fuer
  // *„unbekannt"* ist keine Aussage ueber das, was man einnehmen
  // will. `[cmd]` **183 Produkte tragen sie** (E-83: 82 % der
  // `Other`-Produkte haben keinen Formhinweis).
  return FORMEN.filter(f => !f.code.startsWith('Unknown'))
}

/**
 * Ist eine Aenderung ueberhaupt eine?
 *
 * `[read]` **Ein Klick, der nichts aendert, soll nicht schreiben** —
 * die RPC ersetzt den ganzen Satz, und ein Lauf ohne Aenderung
 * setzte `updated_at` und die Quelle neu.
 */
export function gleich(a: SupplementVorlieben, b: SupplementVorlieben): boolean {
  const l = (x: string[], y: string[]) =>
    x.length === y.length && x.every((v, i) => v === y[i])
  return l(a.preferred_brands, b.preferred_brands)
    && l(a.avoided_ingredients, b.avoided_ingredients)
    && l(a.preferred_forms, b.preferred_forms)
    && l(a.preferred_intake_times, b.preferred_intake_times)
    && a.only_on_market === b.only_on_market
    && a.note === b.note
}

/**
 * Einen Wert in einer Liste umschalten.
 *
 * `[read]` **Die Reihenfolge bleibt stabil** — neue Werte hinten
 * an. `[cmd]` **Sonst spraenge die Markenliste bei jedem Klick**,
 * und `gleich()` meldete eine Aenderung, wo keine ist.
 */
export function umschalten(liste: string[], wert: string): string[] {
  return liste.includes(wert)
    ? liste.filter(x => x !== wert)
    : [...liste, wert]
}

/**
 * Was der Reiter ueber die Wirkung sagt — A4.
 *
 * `[read]` **Eine Vorliebe, die nichts tut, ist eine Attrappe.**
 * `[cmd]` **Der Satz nennt, WAS wirkt und WO** — und er nennt die
 * Zahl nicht, weil sie von der Suche abhaengt.
 */
export function wirkungsSatz(v: SupplementVorlieben): string {
  const teile: string[] = []
  if (v.preferred_brands.length > 0) {
    teile.push(v.preferred_brands.length === 1
      ? 'deine Marke steht oben'
      : `deine ${v.preferred_brands.length} Marken stehen oben`)
  }
  if (v.preferred_forms.length > 0) {
    teile.push(`${v.preferred_forms.length} Darreichungsform`
      + `${v.preferred_forms.length === 1 ? '' : 'en'} bevorzugt`)
  }
  if (v.only_on_market) teile.push('nur erhältliche Produkte')
  if (v.avoided_ingredients.length > 0) {
    teile.push(`${v.avoided_ingredients.length} Stoff`
      + `${v.avoided_ingredients.length === 1 ? '' : 'e'} gemieden`)
  }
  if (teile.length === 0) {
    // `[read]` **Ein benannter Leerhinweis** (E-72) — nicht schweigen.
    return 'Noch nichts gesetzt — die Produktsuche zeigt alles.'
  }
  const satz = teile.length === 1
    ? teile[0]
    : `${teile.slice(0, -1).join(', ')} und ${teile[teile.length - 1]}`
  return `Im Produkte-Reiter: ${satz}.`
}
