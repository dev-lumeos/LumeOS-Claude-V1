// Allergien — die Rechnung, G-455.
//
// `[read]` **Reine Rechnung, keine Importe.** Serverfrei, damit die
// Anzeige sie als WERT importieren darf und eine Probe sie ohne
// Datenbank laufen lassen kann (A-30 — in G-453 zweimal gestolpert).
//
// ══ WAS C-498 GEBAUT HAT ════════════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-15 gegen die laufende Instanz:**
//
//     public.user_allergies
//       stoff_code   text NULL
//       stoff_text   text NOT NULL, btrim <> ''
//       art          nahrung | supplement | medikament |
//                    umwelt | sonstiges
//       schwere      unvertraeglichkeit | allergie | anaphylaxie
//       quelle       text NOT NULL, btrim <> ''
//       seit         date NULL
//       notiz        text NULL
//
// `[read]` **Die beiden CHECKs sind die Wahrheit ueber die
// Auswahllisten** — sie werden hier abgeschrieben, damit die
// Oberflaeche nichts anbietet, was die Datenbank abweist
// (*Auswahlliste ist eine Zusage*).

/** `[cmd]` **Genau die fuenf Werte aus `user_allergies_art_check`.** */
export const ARTEN = [
  { code: 'nahrung', label: 'Nahrung' },
  { code: 'supplement', label: 'Supplement' },
  { code: 'medikament', label: 'Medikament' },
  { code: 'umwelt', label: 'Umwelt' },
  { code: 'sonstiges', label: 'Sonstiges' },
] as const

export type ArtCode = typeof ARTEN[number]['code']

/**
 * `[cmd]` **Genau die drei Werte aus `user_allergies_schwere_check`.**
 *
 * `[read]` **Die Reihenfolge ist die Steigerung** — sie entscheidet,
 * was zuerst steht und welche Farbe die Marke traegt.
 */
export const SCHWEREN = [
  { code: 'unvertraeglichkeit', label: 'Unverträglichkeit', ton: 'warn' },
  { code: 'allergie', label: 'Allergie', ton: 'neg' },
  { code: 'anaphylaxie', label: 'Anaphylaxie', ton: 'neg' },
] as const

export type SchwereCode = typeof SCHWEREN[number]['code']

/**
 * Woher eine Zeile stammt.
 *
 * ══ WARUM DIE QUELLE ZAEHLT ════════════════════════════════════════
 *
 * `[cmd]` **`nutrition.food_preferences_write` loescht und schreibt
 * neu** — aber NUR mit `art = 'nahrung' AND quelle =
 * 'nutrition_preferences'` (gemessen 2026-09-15 im Funktionsrumpf).
 *
 * `[read]` **Deshalb ueberleben Settings-Zeilen einen Speichervorgang
 * in den Vorlieben** — sie tragen eine andere Quelle. **Ohne diese
 * Einschraenkung haette ein Klick in Preferences jede
 * Medikamentenallergie geloescht.**
 *
 * `[read]` **Settings schreibt deshalb `settings`, nicht
 * `nutrition_preferences`** — die Trennung ist die Sicherung.
 */
export const QUELLE_SETTINGS = 'settings'
export const QUELLE_VORLIEBEN = 'nutrition_preferences'

export type Allergie = {
  id: string
  stoff_code: string | null
  stoff_text: string
  art: ArtCode
  schwere: SchwereCode
  quelle: string
  seit: string | null
  notiz: string | null
}

export function artLabel(code: string): string {
  return ARTEN.find(a => a.code === code)?.label ?? code
}

export function schwereLabel(code: string): string {
  return SCHWEREN.find(s => s.code === code)?.label ?? code
}

export function schwereTon(code: string): 'warn' | 'neg' | undefined {
  const s = SCHWEREN.find(x => x.code === code)
  return s ? s.ton : undefined
}

/**
 * Der Code, unter dem ein Stoff gesucht wird.
 *
 * `[cmd]` **`food_preferences_write` bildet ihn so:**
 * `lower(btrim(value))` — und der Anzeigetext ist derselbe Wert mit
 * `_` durch Leerzeichen ersetzt. **Hier dieselbe Regel**, damit eine
 * in Settings angelegte Allergie und eine aus den Vorlieben
 * denselben Code tragen.
 *
 * `[read]` **Sonst stuenden „Tree Nuts" und „tree_nuts" als zwei
 * Eintraege da**, und der Filter fände nur einen.
 */
export function stoffCode(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, '_')
}

/**
 * Sortierung der Liste.
 *
 * `[read]` **Schwerste zuerst** — eine Anaphylaxie oben, eine
 * Unvertraeglichkeit unten. **Innerhalb derselben Schwere nach
 * Stoff**, damit die Reihenfolge stabil ist und nicht mit jedem
 * Laden springt.
 */
export function sortiere(liste: readonly Allergie[]): Allergie[] {
  const rang = (s: string) =>
    s === 'anaphylaxie' ? 0 : s === 'allergie' ? 1 : 2
  return [...liste].sort((a, b) =>
    rang(a.schwere) - rang(b.schwere)
    || a.stoff_text.localeCompare(b.stoff_text))
}

/**
 * Was die Datenbank annehmen wird — geprueft, BEVOR geschrieben wird.
 *
 * `[read]` **Die CHECKs stehen oben abgeschrieben; hier wird gegen
 * sie geprueft.** `[cmd]` **Ein leerer `stoff_text` faellt sonst erst
 * in der Datenbank auf** (`btrim(stoff_text) <> ''`), und der Nutzer
 * saehe eine Postgres-Meldung statt eines Satzes.
 */
export function pruefeEingabe(
  e: { stoff_text: string; art: string; schwere: string },
): string | null {
  if (!e.stoff_text.trim()) return 'Bitte einen Stoff eintragen.'
  if (!ARTEN.some(a => a.code === e.art)) return 'Unbekannte Art.'
  if (!SCHWEREN.some(s => s.code === e.schwere)) return 'Unbekannte Schwere.'
  return null
}

// ══ G-455: die zwei Filter in den Produkten ═════════════════════════
//
// **Tom:** *„Eine Nussallergie gilt ueberall. ‚Keine Farbstoffe' ist
// eine Haltung, keine Diagnose."*
//
// `[read]` **Deshalb zwei Filter mit verschiedener HAERTE:**
//
//     MEINE ALLERGIEN   public.user_allergies
//                       HART -- das Produkt verschwindet
//     MEIDESTOFFE       food_preference_items
//                       WEICH -- das Produkt wird markiert
//
// `[read]` **Die Haerte ist die eigentliche Entscheidung.** Wer etwas
// nicht vertraegt, will es nicht sehen; wer etwas nicht mag, will es
// erkennen und selbst entscheiden. **Ein gemeinsamer Filter waere fuer
// beide falsch.**

/** Ein Treffer: welches Produkt, wegen welcher Zutat. */
export type AllergieTreffer = {
  product_id: string
  ingredient_name: string
  stoff_text: string
}

/**
 * Die Produkt-Ids, die hart ausfallen.
 *
 * `[read]` **Als `Set`-freie Liste** — sie geht ueber die
 * `'use client'`-Grenze, und ein `Set` kaeme dort als `{}` an
 * (G-388/G-445).
 */
export function harteIds(treffer: readonly AllergieTreffer[]): string[] {
  const gesehen: Record<string, true> = {}
  const aus: string[] = []
  for (const t of treffer) {
    if (gesehen[t.product_id]) continue
    gesehen[t.product_id] = true
    aus.push(t.product_id)
  }
  return aus
}

// ══ G-455: der WEICHE Filter — die Meidestoffe ══════════════════════
//
// **Tom:** *„MEIDESTOFFE aus food_preference_items, WEICH: Produkt
// wird markiert. ‚Keine Farbstoffe' ist eine Haltung, keine
// Diagnose."*
//
// ══ DIE CODES SIND NAHRUNGS-TAGS, DIE ZUTATEN SIND TEXT ═════════════
//
// `[cmd]` **Gemessen 2026-09-15 fuer `dev@lumeos.app`:**
//
//     tag  soft_dislike  ultra_processed
//     tag  soft_dislike  contains_lactose
//     tag  hard_exclude  contains_nuts
//     category soft_dislike (2x)
//
// `[cmd]` **Die Zutatnamen heissen aber `Lactose`, nicht
// `contains_lactose`** — ein Vergleich Code gegen Text traefe nichts.
//
// `[read]` **Deshalb wird der Suchbegriff aus dem Code ABGELEITET:**
// die Vorsilben `contains_` und `is_` fallen weg, `_` wird zum
// Leerzeichen. **Gemessen, was das trifft:** `contains_lactose` ->
// *lactose* -> **846 Zutatzeilen**, `contains_nuts` -> *nuts* ->
// **10.969**.
//
// `[read]` **Das ist eine NAEHERUNG, und sie wird als solche
// behandelt:** sie markiert, sie entfernt nicht. **Ein falsch
// markiertes Produkt kostet einen Blick; ein falsch entferntes waere
// unsichtbar.** Genau deshalb ist der weiche Filter der richtige Ort
// fuer eine Naeherung — und der harte nicht.

/**
 * Der Suchbegriff zu einem Meidecode.
 *
 * `[cmd]` **`ultra_processed` bleibt uebrig und trifft 2 Zeilen** —
 * es ist ein Verarbeitungsgrad, kein Stoff. `[read]` **Es wird nicht
 * ausgeschlossen:** wer es gesetzt hat, soll die zwei Treffer sehen,
 * statt sich zu fragen, warum sein Filter fehlt.
 */
export function meideBegriff(code: string): string {
  return code
    .replace(/^(contains|is|has)_/, '')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * Trifft ein Meidestoff eine der Zutaten?
 *
 * `[read]` **Auf dem gelesenen Etikett**, nicht in der Datenbank —
 * die Tafel hat die Zutaten ohnehin, und eine zweite Abfrage je Zeile
 * waere bei 500 Zeilen ein Sturm.
 */
export function meideTreffer(
  zutaten: readonly string[], codes: readonly string[],
): string | null {
  for (const code of codes) {
    const wort = meideBegriff(code)
    if (!wort) continue
    const treffer = zutaten.find(z => z.toLowerCase().includes(wort))
    if (treffer) return treffer
  }
  return null
}

/**
 * Je Produkt der Grund — fuer die Marke am weichen Treffer.
 *
 * `[read]` **Ein Objekt, keine `Map`** — dieselbe Grenze.
 */
export function gruende(
  treffer: readonly AllergieTreffer[],
): Record<string, string> {
  const aus: Record<string, string> = {}
  for (const t of treffer) {
    // `[read]` **Der erste Grund gewinnt** — zwei Marken an einer
    // Zeile waeren Rauschen; wer mehr wissen will, klappt auf.
    if (!aus[t.product_id]) aus[t.product_id] = t.ingredient_name
  }
  return aus
}
