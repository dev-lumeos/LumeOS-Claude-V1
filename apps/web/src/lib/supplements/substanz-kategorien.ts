// Kategorien des Substanzkatalogs (C-227) — serverfrei und rein,
// damit der Waechter Filter, Farben und Textpflicht direkt prueft.
//
// **Quelle ist `canonical_category` (C-197), sonst nichts.** Hier wird
// keine Kategorie erfunden: unbekannte kanonische Werte behalten ihren
// Wortlaut als Label und bekommen die neutrale Sammelfarbe. Die alten
// Spalten `category`/`compound_type` bleiben unberuehrt daneben, bis
// Tom die Taxonomie abgenommen hat.
//
// **`null` ist nicht „sonstige".** `[cmd]` 276 von 566 Zeilen tragen
// keine kanonische Kategorie — das sind F-05-Kandidaten und
// LumeOS-Eintraege ohne Kimi-Satz, keine Restklasse. Sie heissen
// deshalb „unzugeordnet" und sagen es dazu.
//
// **Farben nur als CSS-Variablen** (`--kat-*`, definiert in
// supplements.css) — nie hartkodiert. `[read]` A-31: die elf
// Modul-Akzente liegen alle bei Luminanz 0,74-0,80 und sind unter
// Farbfehlsichtigkeit nicht unterscheidbar; die Kategorie-Toene
// variieren deshalb bewusst die Helligkeit. Und Farbe ist NIE das
// einzige Merkmal: jede Kennzeichnung traegt ihr Textlabel.
import type { SubstanzListenEintrag } from './substanz-read'

export const UNZUGEORDNET_ID = 'unzugeordnet'
export const UNZUGEORDNET_TEXT =
  'ohne kanonische Kategorie — F-05-Kandidaten und LumeOS-Einträge '
  + 'ohne Kimi-Satz, nicht „sonstige"'

/**
 * Die grossen kanonischen Kategorien mit eigener Farbe. `[cmd]` Werte
 * aus `canonicalCategory()` in 134_substance_catalog.ts (C-197);
 * kleinere Kategorien (longevity, sleep, nootropic, sarm, hormone …)
 * teilen sich `--kat-weitere` und bleiben ueber ihr Label
 * unterscheidbar.
 */
export const KATEGORIE_FARBEN: Record<string, string> = {
  peptide: '--kat-peptide',
  aas: '--kat-aas',
  botanical: '--kat-botanical',
  sports_ingredient: '--kat-sports',
  mineral: '--kat-mineral',
  vitamin: '--kat-vitamin',
  performance: '--kat-performance',
  protein_amino_acid: '--kat-protein',
  [UNZUGEORDNET_ID]: '--kat-unzugeordnet',
}

export const KAT_WEITERE_VAR = '--kat-weitere'

/** Die Kategorie eines Eintrags — kanonisch oder „unzugeordnet". */
export function kategorieVon(e: Pick<SubstanzListenEintrag, 'canonical_category'>): string {
  const k = e.canonical_category
  return typeof k === 'string' && k.trim() ? k : UNZUGEORDNET_ID
}

/** Das Textlabel — der kanonische Wert selbst, nur lesbar gemacht. */
export function kategorieLabel(kategorie: string): string {
  return kategorie.replace(/_/g, ' ')
}

/** Die Farbe, immer als `var(--kat-…)` — nie ein Farbwert im Code. */
export function kategorieFarbe(kategorie: string): string {
  return `var(${KATEGORIE_FARBEN[kategorie] ?? KAT_WEITERE_VAR})`
}

/**
 * Zaehlt je Kategorie — die Zahlen an den Filterknoepfen sind
 * gezaehlt, nicht gesetzt. Sortiert nach Groesse, „unzugeordnet"
 * immer ans Ende.
 */
export function zaehleKategorien(
  liste: Array<Pick<SubstanzListenEintrag, 'canonical_category'>>,
): Array<[string, number]> {
  const zaehler = new Map<string, number>()
  for (const e of liste) {
    const k = kategorieVon(e)
    zaehler.set(k, (zaehler.get(k) ?? 0) + 1)
  }
  return Array.from(zaehler.entries()).sort((a, b) => {
    if (a[0] === UNZUGEORDNET_ID) return 1
    if (b[0] === UNZUGEORDNET_ID) return -1
    return b[1] - a[1] || a[0].localeCompare(b[0])
  })
}

/**
 * Mehrfachauswahl: eine leere Auswahl heisst „alle"; sonst bleibt,
 * was in einer der gewaehlten Kategorien liegt (peptide UND sarm).
 */
export function filtereKategorien<T extends Pick<SubstanzListenEintrag, 'canonical_category'>>(
  liste: T[], aktive: ReadonlySet<string>,
): T[] {
  if (aktive.size === 0) return liste
  return liste.filter(e => aktive.has(kategorieVon(e)))
}

/**
 * Der Filterstand nach einem Gruppenwechsel (G-182, Punkt 1).
 *
 * ══ DER FEHLER, DEN DAS BEHEBT ═════════════════════════════════════
 *
 * **Tom, 2026-08-25:** *„waehle ich zb enhanced/fatburner und danach
 * supplements kommt nichts mehr weil er die subkategorie nicht auf
 * alle zuruecksetzt und immer noch auf fatburner steht."*
 *
 * `[cmd]` **`fatburner` gibt es nur unter `enhanced`** — 10 Substanzen,
 * gemessen 2026-08-25. Unter `supplement` (182 Eintraege) trifft die
 * Kategorie auf keine einzige Zeile: **die Liste ist leer, und der
 * Nutzer sieht nicht warum.**
 *
 * `[read]` **Der Fehler ist die Zustandsfuehrung, nicht der fehlende
 * Knopf.** `Alle` aus G-181 loest das Abwaehlen — nicht den
 * Gruppenwechsel. **Wer die Gruppe wechselt, meint einen neuen
 * Anfang.**
 *
 * `[read]` **Warum leeren und nicht schneiden:** man koennte die
 * Kategorien behalten, die es in beiden Gruppen gibt. Das waere
 * unvorhersehbar — mal bleibt ein Filter stehen, mal nicht.
 * **Zuruecksetzen ist die Regel, die man sich merken kann.**
 */
export function nachGruppenwechsel(
  alt: Gruppe | null, neu: Gruppe | null, kategorien: ReadonlySet<string>,
): { gruppe: Gruppe | null; kategorien: ReadonlySet<string> } {
  if (alt === neu) return { gruppe: neu, kategorien }
  return { gruppe: neu, kategorien: new Set<string>() }
}

/**
 * Trifft die Suche diese Substanz? (G-186, Punkt 3)
 *
 * ══ WARUM DIE ZWECKE KEIN FILTER SIND ══════════════════════════════
 *
 * **Tom sinngemaess:** wer *„Schlaf"* sucht, muss heute wissen, dass
 * Magnesium ein Mineralstoff ist — der Katalog filtert danach, WAS ein
 * Stoff ist, nicht wofuer er da ist.
 *
 * `[cmd]` **Gemessen 2026-08-25: 895 Zweck-Eintraege, davon 842
 * VERSCHIEDEN.** Der haeufigste (*„Im Sport verboten (WADA S1.1)"*)
 * trifft **9 von 318**, der zweithaeufigste 7, danach 3 und 2.
 *
 * `[read]` **Das sind Saetze, keine Schlagworte** —
 * *„Muedigkeit bei nachgewiesenem Mangel"*, *„Haare/Naegel: Belege nur
 * bei Mangel"*. **Eine Filterleiste haette 842 Knoepfe**, und die
 * haeufigste Auswahl traefe 9 Substanzen. Auch „die haeufigsten plus
 * Suche" traegt bei dieser Verteilung nicht.
 *
 * `[read]` **Deshalb durchsucht die Suche die Zwecke mit.** Wer
 * „Schlaf" eingibt, findet die Substanzen, deren Zweck das Wort
 * traegt — ohne 842 Knoepfe.
 */
export function trifftSuche(
  e: Pick<SubstanzListenEintrag, 'name' | 'description' | 'zwecke'>,
  frage: string,
): boolean {
  const f = frage.trim().toLowerCase()
  if (!f) return true
  if (e.name.toLowerCase().includes(f)) return true
  if ((e.description ?? '').toLowerCase().includes(f)) return true
  return (e.zwecke ?? []).some(z => z.toLowerCase().includes(f))
}

// ── C-229: die drei Gruppen aus C-228 ────────────────────────────
//
// `[cmd]` Toms Modell: „wir haben normale supplements … peptides …
// enhanced supplement — das ist je eine Gruppe mit ihren Filtern."
// C-228 leitet sie aus domain und category ab (supplement 307 ·
// peptide 82 · enhanced 177 = 566). Hier wird NICHTS abgeleitet —
// die Gruppe kommt aus der Spalte, oder sie ist offen.

export type Gruppe = 'supplement' | 'peptide' | 'enhanced'

export const GRUPPEN: Array<{ id: Gruppe; label: string }> = [
  { id: 'supplement', label: 'Supplements' },
  { id: 'peptide', label: 'Peptide' },
  { id: 'enhanced', label: 'Enhanced' },
]

/**
 * Peptide und Enhanced zeigen sich erst ab `experience_level`
 * pro/elite — dieselbe Schwelle wie das Extended-Gate (G-167,
 * `GRAD_FUER_EXTENDED`). `offen` kommt aus dem Gate-Stand; hier
 * steht nur, WELCHE Gruppen dahinter liegen.
 */
export function gruppeGesperrt(gruppe: Gruppe, gateOffen: boolean): boolean {
  return !gateOffen && gruppe !== 'supplement'
}

export function gruppeVon(
  e: Pick<SubstanzListenEintrag, 'gruppe'>,
): Gruppe | null {
  const g = e.gruppe
  return g === 'supplement' || g === 'peptide' || g === 'enhanced' ? g : null
}

export function zaehleGruppen(
  liste: Array<Pick<SubstanzListenEintrag, 'gruppe'>>,
): Record<Gruppe, number> {
  const z: Record<Gruppe, number> = { supplement: 0, peptide: 0, enhanced: 0 }
  for (const e of liste) {
    const g = gruppeVon(e)
    if (g) z[g] += 1
  }
  return z
}

/** Eine Gruppe gewaehlt: nur sie. Keine gewaehlt: alles Sichtbare. */
export function filtereGruppe<T extends Pick<SubstanzListenEintrag, 'gruppe'>>(
  liste: T[], aktiv: Gruppe | null, gateOffen: boolean,
): T[] {
  if (aktiv) return liste.filter(e => gruppeVon(e) === aktiv)
  if (gateOffen) return liste
  // Ohne pro/elite bleiben nur Supplements und die noch ungruppierten
  // Zeilen — Peptide und Enhanced haengen hinter dem Gate.
  return liste.filter(e => {
    const g = gruppeVon(e)
    return g === null || g === 'supplement'
  })
}
