// Die eine Suche kennt mehrere Quellen — G-480.
//
// ══ WARUM DIESE DATEI OHNE SERVER AUSKOMMT ══════════════════════════
//
// `[read]` **Hier stehen die Regeln, nicht die Abfragen.** **Wer
// wissen will, ob ein Produkt in eine Mahlzeit darf, soll das
// nachrechnen koennen, ohne eine Datenbank zu starten.**
//
// ══ TOMS REGEL ══════════════════════════════════════════════════════
//
// **Tom, 2026-09-08:** *„wie bringt man was in essen rein? antwort:
// powder/liquid/bar und allfaellige andere formen, die man
// daruntermischen kann"*
//
// **Und die Gegenrichtung:** *„pillen/tablet/capsule gehoeren nicht in
// meals — der wird nicht eine tablette zerhacken, nur dass es in einen
// shake rein passt."*
//
// `[read]` **Die Kapsel wird nicht ausgeschlossen** — sie steht im
// Stack, und ihre Kalorien zaehlen dort.

/**
 * Woher ein Treffer stammt.
 *
 * `[cmd]` **Der Mockup zeigt die Quelle JE ZEILE**
 * (`module-nutrition.jsx:581`: `<Pill>{f.src}</Pill>`). `[read]`
 * **Nicht als Ueberschrift einer Sektion** — wer sortiert, mischt die
 * Sektionen, und dann beschriftet die Ueberschrift die falschen
 * Zeilen.
 */
export type Quelle = 'bls' | 'supplement'

/** Was auf der Pille steht. */
export const QUELLE_TEXT: Readonly<Record<Quelle, string>> = {
  bls: 'BLS',
  supplement: 'Supplement',
}

/**
 * Die Filterpillen der Suche — `module-nutrition.jsx:557`.
 *
 * `[cmd]` **Die Vorlage listet zehn**, darunter Kategorien (Meat,
 * Fish, …) und `Supplements`. `[read]` **Hier stehen nur die
 * QUELLEN-Pillen** — die Kategoriefilter hat die Suche bereits, und
 * zwei Filterleisten uebereinander waeren eine Bedienfalle.
 */
export type Filter = 'alle' | Quelle

export const FILTER: readonly Filter[] = ['alle', 'bls', 'supplement']

export const FILTER_TEXT: Readonly<Record<Filter, string>> = {
  alle: 'Alle',
  bls: 'Lebensmittel',
  supplement: 'Supplemente',
}

// ══ DIE FORMEN ══════════════════════════════════════════════════════
//
// `[cmd]` **`supplier_products.produktform` traegt einen DSLD-Code:**
// `Powder [E0162]`, **nicht** `Powder`. `[cmd]` **Gemessen am
// 2026-09-18: ein Filter auf `= 'Bar'` findet NULL Zeilen** — es gibt
// 40, und alle heissen `Bar [E0164]`.
//
// `[read]` **Deshalb wird auf den ANFANG geprueft, nie auf
// Gleichheit.**

/** Die Formen, die man untermischen kann — Toms Regel. */
export const MEAL_FORMEN = [
  'Powder', 'Liquid', 'Bar', 'Gummy',
] as const

/**
 * Die Formen, die man schluckt.
 *
 * `[read]` **Nur zur Dokumentation und fuer den Waechter** — gefiltert
 * wird ueber `MEAL_FORMEN`, damit eine neue Form nicht stillschweigend
 * in die Mahlzeit rutscht.
 *
 * `[cmd]` **`Lozenge` steht hier, nicht oben:** gemessen sind es
 * Melatonin, Zink-Lutschtabletten und sublinguales B12 — **sublingual
 * ist der Zweck, nicht die Verpackung.**
 */
export const STACK_FORMEN = [
  'Capsule', 'Tablet', 'Softgel', 'Lozenge',
] as const

/**
 * Darf dieses Produkt in eine Mahlzeit?
 *
 * `[cmd]` **Gemessen, On Market:** 47.655 von 121.959 (39,1 %).
 *
 * `[read]` **`Other (e.g. tea bag)` und `Unknown` fallen durch** —
 * und das ist Absicht: **82 % der 3.569 `Other`-Produkte tragen im
 * Namen keinen Formhinweis** (E-83). `[read]` **Wer sie anbietet,
 * bietet Teebeutel zum Unterruehren an.**
 */
export function darfInMahlzeit(produktform: string | null | undefined): boolean {
  if (!produktform) return false
  return MEAL_FORMEN.some(f => produktform.startsWith(f))
}

/**
 * Die Anfrage an PostgREST — `produktform=like.Powder%,…`.
 *
 * `[read]` **Eine Zeichenkette statt vier Abfragen** — und derselbe
 * Satz Formen wie in `darfInMahlzeit`, damit Filter und Regel nicht
 * auseinanderlaufen koennen.
 */
export function mealFormenFilter(): string {
  return MEAL_FORMEN.map(f => `produktform.like.${f}%`).join(',')
}

/**
 * Zeigt dieser Filter die Quelle?
 *
 * `[read]` **Ein eigener Ausdruck, weil er zweimal gebraucht wird** —
 * beim Laden und beim Anzeigen. **Zwei Vergleiche waeren zwei
 * Wahrheiten.**
 */
export function zeigt(filter: Filter, quelle: Quelle): boolean {
  return filter === 'alle' || filter === quelle
}

/**
 * Der Hinweis unter der Trefferliste, wenn Supplemente dabei sind.
 *
 * `[read]` **Die Regel muss dastehen, nicht nur wirken** — sonst
 * sucht jemand sein Kreatin-Pulver, findet es, sucht seine
 * Vitamin-D-Kapsel und haelt die Suche fuer kaputt.
 */
export const NUR_UNTERMISCHBAR_SATZ =
  'Nur Formen, die sich untermischen lassen (Pulver, Flüssig, Riegel, '
  + 'Gummi). Kapseln und Tabletten gehören in den Stack.'
