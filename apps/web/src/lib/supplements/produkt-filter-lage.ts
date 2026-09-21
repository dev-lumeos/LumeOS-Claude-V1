// Die gespeicherten Produktfilter — G-467.
//
// **Tom, 2026-09-08:** *„meine filtereinstellungen werden nicht
// gespeichert"* — und, zwei Stunden spaeter, noch einmal:
//
// > wenn endlich die filters speicherbar waeren und ich meine
// > favoriten marken vernuenftig setzen koennte, wuerden die daten
// > automatisch schrumpfen, denn dann wuerden auch kalt viel weniger
// > daten kommen
//
// ══ DER SPEICHER IST DA, ER WURDE NUR NIE GELESEN ═══════════════════
//
// `[cmd]` **`public.user_display_preferences` (C-504)**, gemessen
// 2026-09-17:
//
//     user_id, preference_key, value jsonb, created_at, updated_at
//     PRIMARY KEY (user_id, preference_key)
//     CHECK preference_key ~ '^[a-z0-9_.:-]{3,120}$'
//     CHECK jsonb_typeof(value) = 'object'
//     vier RLS-Policies auf auth.uid()
//
// `[cmd]` **Dieselbe Tabelle traegt schon `nutrition.nutrient_tree`**
// (G-122) — **dieser Weg folgt ihr, statt einen zweiten zu bauen.**
//
// ══ WAS GESPEICHERT WIRD UND WAS NICHT ══════════════════════════════
//
// **Der Auftrag zieht die Grenze:** *„Marktstatus, Kategorie, Form,
// Marken, ob Allergien ausgeblendet sind. NICHT die Sucheingabe — die
// ist augenblicklich."*
//
// `[read]` **Ein Suchwort ist eine Frage, ein Filter eine
// Einstellung.** **Wer morgen wiederkommt, will seine Marken sehen,
// nicht sein letztes Suchwort.**
//
// `[read]` **Serverfrei** — diese Datei rechnet nur. `[cmd]` **Der
// Leseweg liegt in `produkt-filter-read.ts`** (A-30: ein Wertimport
// aus einer Serverdatei zieht `next/headers` ins Browserbuendel und
// wirft HTTP 500 — dreimal getroffen in G-450/G-453).

/**
 * Der Schluessel in `user_display_preferences`.
 *
 * `[cmd]` **Muss `^[a-z0-9_.:-]{3,120}$` erfuellen** — der CHECK der
 * Tabelle, gemessen. `[read]` **Punktform wie beim Vorbild**
 * (`nutrition.nutrient_tree`): Modul, dann Sache.
 */
export const FILTER_SCHLUESSEL = 'supplements.produkt_filter'

/** Toms Vorgabe: nur „On Market" (G-452). */
export const STANDARD_STATUS = 'On Market'

/**
 * Was gespeichert wird.
 *
 * `[read]` **Kein `frage`-Feld** — und das ist keine Auslassung,
 * sondern die Zusage aus A3. **Eine Suchanfrage gehoert nicht in
 * eine Einstellung.**
 */
export type ProduktFilter = {
  /** `null` heisst „alle Marktstatus". */
  status: string | null
  kategorie: string | null
  form: string | null
  marken: string[]
  /** Ob der harte Allergiefilter greift. Vorgabe: an. */
  allergienAn: boolean
  /** Ob die Filterleiste offen startet. Toms zweite Forderung. */
  leisteOffen: boolean
}

/**
 * Die Vorgabe fuer einen Nutzer OHNE gespeicherte Filter.
 *
 * **A5:** *„Gegenprobe: ein Nutzer ohne gespeicherte Filter ->
 * Vorgabe."*
 *
 * `[read]` **`leisteOffen: true` ist die Aenderung aus Punkt 2** —
 * *„die zusatzfilter sollen bei start eingeblendet sein."* `[cmd]`
 * **Vorher stand `useState(false)` im Reiter.**
 */
export const VORGABE: ProduktFilter = {
  status: STANDARD_STATUS,
  kategorie: null,
  form: null,
  marken: [],
  allergienAn: true,
  leisteOffen: true,
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null
}

/**
 * Einen `jsonb`-Wert aus der Datenbank pruefen.
 *
 * `[read]` **Jedes Feld einzeln, mit Rueckfall auf die Vorgabe** —
 * `[cmd]` **ein alter Stand aus einer frueheren Fassung darf die
 * Oberflaeche nicht umwerfen.** **Was fehlt, ist die Vorgabe; was
 * falsch getippt ist, ebenso.**
 *
 * `[read]` **Laeuft auf Server UND Client** — deshalb serverfrei.
 */
export function ausJson(roh: unknown): ProduktFilter {
  if (!roh || typeof roh !== 'object' || Array.isArray(roh)) return VORGABE
  const o = roh as Record<string, unknown>
  return {
    // `[read]` **`null` ist ein WERT hier, nicht „fehlt"** — er heisst
    // „alle Marktstatus". **Deshalb wird auf das Vorhandensein des
    // Feldes geprueft, nicht auf seine Wahrheit.**
    status: 'status' in o ? text(o.status) : VORGABE.status,
    kategorie: text(o.kategorie),
    form: text(o.form),
    marken: Array.isArray(o.marken)
      ? Array.from(new Set(o.marken.flatMap(m => text(m) ?? []))).sort()
      : [],
    allergienAn: typeof o.allergienAn === 'boolean'
      ? o.allergienAn
      : VORGABE.allergienAn,
    leisteOffen: typeof o.leisteOffen === 'boolean'
      ? o.leisteOffen
      : VORGABE.leisteOffen,
  }
}

/**
 * Ob sich ein Filter von der Vorgabe unterscheidet.
 *
 * `[read]` **Wer nichts geaendert hat, braucht keine Zeile in der
 * Datenbank** — und die Gegenprobe A5 bleibt so ehrlich: ein Nutzer
 * ohne Zeile bekommt die Vorgabe, weil es nichts zu lesen gibt.
 */
export function istVorgabe(f: ProduktFilter): boolean {
  return f.status === VORGABE.status
    && f.kategorie === VORGABE.kategorie
    && f.form === VORGABE.form
    && f.marken.length === 0
    && f.allergienAn === VORGABE.allergienAn
    && f.leisteOffen === VORGABE.leisteOffen
}

/**
 * Wie viele Filter gesetzt sind — die Zahl am Filterknopf.
 *
 * `[read]` **Der Marktstatus zaehlt nur, wenn er NICHT die Vorgabe
 * ist** — sonst traegt der Knopf ab Werk eine 1, und die Zahl sagt
 * nichts mehr.
 */
export function aktiveFilter(f: ProduktFilter): number {
  return f.marken.length
    + (f.kategorie ? 1 : 0)
    + (f.form ? 1 : 0)
    + (f.status !== VORGABE.status ? 1 : 0)
    + (f.allergienAn !== VORGABE.allergienAn ? 1 : 0)
}

/**
 * Welche Filter gerade WIRKEN — je einer in Worten.
 *
 * ══ G-491: DER LEERSATZ NANNTE NUR DIE KATEGORIE ════════════════
 *
 * `[cmd]` **Gemessen am 2026-09-21** (`tools/_g491-anteile.mjs`,
 * jeder Filter einzeln angelegt):
 *
 *     "Micronized Creatine Monohydrate"
 *       200  smart    ohne Filter
 *         0  einfach  + kategorie=protein
 *        10  einfach  + form=Powder [E0162]
 *         2  smart    + marke=Optimum Nutrition
 *
 * `[cmd]` **Alle 18 Zeilen dieses Namens SIND Powder** — es war die
 * MARKE, die sie nahm. `[read]` **Der Satz behauptete die Kategorie,
 * und `form` kam ueberhaupt nicht vor.** `[read]` **Ein Vermerk mit
 * falschem Grund schickt den Leser zum falschen Regler.**
 *
 * `[read]` **Hier zaehlt die WIRKUNG, nicht die Abweichung von der
 * Vorgabe** — anders als bei `aktiveFilter`. `[cmd]` **Eine
 * eingeschaltete Allergenmeidung nimmt Zeilen weg**, auch wenn sie
 * die Vorgabe ist; **ein Status auf der Vorgabe steht dagegen fuer
 * „noch nichts eingegrenzt" und gehoert nicht in den Satz.**
 */
export function wirkendeFilter(f: ProduktFilter): string[] {
  const aus: string[] = []
  if (f.kategorie) aus.push(`Kategorie „${f.kategorie}“`)
  if (f.form) aus.push(`Darreichungsform „${f.form}“`)
  if (f.marken.length === 1) aus.push(`Marke „${f.marken[0]}“`)
  else if (f.marken.length > 1) aus.push(`${f.marken.length} gewählte Marken`)
  if (f.status !== VORGABE.status) {
    aus.push(f.status ? `Status „${f.status}“` : 'Status „alle“')
  }
  if (f.allergienAn) aus.push('deine Allergenmeidung')
  return aus
}

/**
 * Warum die Liste leer ist — in einem Satz (G-182, G-491).
 *
 * `[read]` **Er nennt JEDEN wirkenden Filter, nicht einen
 * ausgesuchten** — und den Suchweg dazu, wenn er gefallen ist.
 *
 * `[cmd]` **`weg === 'einfach'` heisst: diese Abfrage nutzt C-495
 * nicht.** `[cmd]` **Gemessen: der Weg kippt von `smart` auf
 * `einfach`, sobald EIN Filter gesetzt ist** — *„Ultraplex Vitamin
 * D3"* findet ohne Filter 200 Zeilen, mit jedem einzelnen 0.
 * `[read]` **Ohne diesen Satz sieht es aus, als gaebe es das Produkt
 * nicht.**
 */
export function grundFuerLeer(
  frage: string, f: ProduktFilter, weg: string | null, fehler?: string | null,
): string {
  if (fehler) return `Die Abfrage ist fehlgeschlagen: ${fehler}`
  const q = frage.trim()
  const aktiv = wirkendeFilter(f)
  if (aktiv.length === 0) {
    return q ? `Keine Treffer für „${q}“.` : 'Keine Treffer.'
  }
  const liste = aktiv.length === 1
    ? aktiv[0]
    : `${aktiv.slice(0, -1).join(', ')} und ${aktiv[aktiv.length - 1]}`
  if (!q) return `Kein Produkt passt zu ${liste}.`
  const wegSatz = weg === 'einfach'
    ? ' Mit gesetztem Filter sucht LumeOS auf genauen Text — die '
      + 'Smartsuche, die Fehleingaben versteht, läuft nur ohne Filter.'
    : ''
  return `Kein Produkt enthält „${q}“ und passt zugleich zu ${liste}.${wegSatz}`
}

/**
 * Der Satz unter der Trefferzahl — G-467, Toms Befund aus G-465.
 *
 * **Aus meinem eigenen Bericht:** *„Die Leiste zeigt weiterhin
 * 214.780, die Trefferliste sind 445 — das ist richtig, aber ohne
 * Erklaerung verwirrend."*
 *
 * `[cmd]` **Die 214.780 ist der KATALOG, die 445 sind das geladene
 * Fenster** (G-453/3: ein wachsendes Fenster, keine Seite). `[read]`
 * **Beide Zahlen stimmen, sie beantworten nur verschiedene Fragen** —
 * und genau das muss dastehen.
 *
 * `[read]` **Null Treffer ist ein eigener Fall** — *„0 von 214.780"*
 * saehe aus wie ein Fehler, ist aber eine Auskunft ueber den Filter.
 */
export function trefferSatz(
  geladen: number, gesamt: number, unscharf = false,
): string {
  if (gesamt === 0) return 'Kein Produkt passt zu diesen Filtern.'
  const g = gesamt.toLocaleString('de-DE')
  if (geladen >= gesamt) {
    return `Alle ${g} Treffer geladen.`
  }
  const n = geladen.toLocaleString('de-DE')
  // `[read]` **„von" ist hier zweideutig** — deshalb ausgeschrieben,
  // was die grosse Zahl bedeutet.
  return unscharf
    ? `${n} geladen · der Filter trifft mindestens ${g} Produkte`
    : `${n} von ${g} Treffern geladen · weitere über „Mehr laden"`
}
