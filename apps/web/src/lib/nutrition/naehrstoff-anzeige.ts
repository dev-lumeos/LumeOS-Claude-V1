// Reine Anzeige-Helfer fuer den Nutrients-Tab (G-121) — bewusst OHNE
// Server-Importe: die Client-Komponente braucht diese Werte und
// Funktionen zur Laufzeit, und ein Import aus `naehrstoff-ordnung.ts`
// wuerde deren Sitzungs-Client mit ins Browser-Bundle ziehen.
import type { NaehrstoffKnoten } from './naehrstoff-ordnung'

/** Die Fenster, die die Oberflaeche anbietet (G-121, Toms Liste). */
export const FENSTER = [1, 7, 14, 30, 45, 60, 90] as const

export function fensterOderTag(roh: string | undefined): number {
  const n = Number(roh)
  return (FENSTER as readonly number[]).includes(n) ? n : 1
}

/** Beschriftung und Farbe je Status — geteilt zwischen Tabelle und
 *  Modal. Aussagen ueber die Zahl, keine Urteile. */
export const STATUS_TEXT: Record<string, string> = {
  unter: 'unter Ziel',
  im: 'im Bereich',
  ueber: 'ueber UL',
}
export const STATUS_FARBE: Record<string, string> = {
  unter: 'var(--warn)',
  im: 'var(--pos)',
  ueber: 'var(--neg)',
}

/** Zahlformat der Naehrstoffanzeige (de-DE, bis 3 Nachkommastellen
 *  unter 1). */
export function zahlMitEinheit(v: number | null, einheit: string | null): string {
  if (v === null) return '—'
  const n = v.toLocaleString('de-DE', { maximumFractionDigits: v < 1 ? 3 : 1 })
  return einheit ? `${n} ${einheit}` : n
}

/**
 * Die acht Karten in fester Reihenfolge (G-129/GO-22, entschieden).
 * Vorher sechs: Fettsaeuren, Aminosaeuren und Kohlenhydrate hingen
 * komplett unter den Makro-Wurzeln. Jetzt tragen die drei Makro-Aeste
 * eigene Karten — wie die wissenschaftliche Klassifikation und
 * Cronometer es tun; die Aeste selbst bleiben ganz.
 */
export const KARTEN_REIHENFOLGE = [
  'Kohlenhydrate', 'Fette', 'Protein',
  'Fettlösliche Vitamine', 'Wasserlösliche Vitamine',
  'Elemente', 'Energie',
  // ══ G-136 / E-48: drei Karten aus *Sonstige* herausgeloest ════
  //
  // `[cmd]` **Gemessen am 2026-09-02:** `WATER`, `ALC`, `OA` und
  // `ASH` tragen alle `group_de = 'Makronährstoffe'` und fielen
  // damit in die Sammelkarte.
  //
  // `[read]` **Sie ist der Auffangzustand seit G-239** (damals fielen
  // 100 von 154 Zeilen in keine Gruppe). **Ehrlich, aber sie
  // sortiert nicht** — und E-48 sagt, wohin die vier gehören.
  'Wasser', 'Organische Säuren', 'Genussmittel',
  'Sonstige',
] as const

/**
 * Was eine Karte ist — G-136.
 *
 * `[read]` **Nur wo der Name allein irreführt.** *Rohasche* klingt
 * nach Rückstand; es ist die Summe aller Mineralstoffe. *Wasser* in
 * einer Nährstoffkarte ist der Wasseranteil der Lebensmittel, nicht
 * die Trinkmenge.
 *
 * `[cmd]` **Die übrigen fünf Karten stehen bewusst ohne Satz** —
 * *Kohlenhydrate*, *Fette*, *Protein*, *Elemente* und die beiden
 * Vitaminkarten erklären sich selbst. **Ein Satz, der nichts
 * hinzufügt, wird beim Lesen übersprungen und macht die nächsten
 * wertlos.**
 */
export const KARTEN_ERKLAERUNG: Readonly<Record<string, string>> = {
  Wasser: 'Der Wasseranteil der Lebensmittel. Die vollständige '
    + 'Flüssigkeitsbilanz — Getrunkenes und Wasser aus dem Essen '
    + 'zusammen — steht im Wassermodul.',
  'Organische Säuren': 'Nicht-essentielle Wirkstoffe. Sie kommen '
    + 'natürlich in Obst und Gemüse vor oder entstehen beim Gären.',
  Genussmittel: 'Liefert Energie, aber keine Nährstoffe.',
  Elemente: 'Rohasche ist die Summe aller Mineralstoffe — im Labor '
    + 'durch Verbrennen bei über 500 Grad bestimmt. Sie liefert keine '
    + 'Energie und ist kein eigener Nährstoff, sondern eine '
    + 'Messgröße.',
}

/**
 * Welche Karte eine Wurzel bekommt — Anzeige, kein Schema.
 *
 * ══ DIE UNTERSCHEIDUNG, DIE DER AUFTRAG VERLANGT ════════════
 *
 * **Karte und Hierarchie sind zwei verschiedene Sachen.** `[read]`
 * **Diese Funktion vergibt Karten.** `[cmd]` **`parent_code` in
 * `nutrient_defs` bleibt unberührt** — kein `FIBT` unter `CHO`, kein
 * `ASH` über den fünfzehn Elementen.
 *
 * `[cmd]` **Warum das wichtig ist, ist gemessen (G-291):** als Kind
 * von `CHO` gerechnet ergäben die Teile **320,78 gegen 281,86** —
 * mehr als das Ganze, und die Differenz wäre negativ. **Bei `ASH`
 * wäre es dasselbe:** die Karte zählte Summe UND Bestandteile.
 *
 * ══ DIE ZUORDNUNG ═════════════════════════════════
 *
 *     CHO, FIBT   Kohlenhydrate   Ballaststoffe SIND Kohlenhydrate
 *     FAT         Fette
 *     PROT625     Protein
 *     WATER       Wasser          E-48, G-136
 *     OA          Organische Säuren
 *     ALC         Genussmittel
 *     ASH         Elemente        Summe der Mineralstoffe
 *     Rest        Sonstige        was in keine passt
 *
 * `[read]` **„Sonstige" bleibt** — eine stumm weggelassene Wurzel
 * wäre derselbe Fehler wie eine Null statt eines Fehlzählers.
 */
export function karteFuerWurzel(code: string, gruppe: string): string {
  if (code === 'CHO' || code === 'FIBT') return 'Kohlenhydrate'
  if (code === 'FAT') return 'Fette'
  if (code === 'PROT625') return 'Protein'
  // G-136 / E-48: die vier Wurzeln, die bisher in *Sonstige* fielen.
  if (code === 'WATER') return 'Wasser'
  if (code === 'OA') return 'Organische Säuren'
  if (code === 'ALC') return 'Genussmittel'
  // `[read]` **`ASH` zu den Elementen, aber NICHT als deren
  // Elternteil** — die Karte ordnet ein, die Hierarchie bleibt.
  if (code === 'ASH') return 'Elemente'
  if (gruppe === 'Makronährstoffe' || gruppe === 'Sonstige Nährstoffe') return 'Sonstige'
  return gruppe
}

/**
 * Suche (G-127): Klein, ohne Akzente, ohne Trennzeichen — „Omega 3"
 * und „Omega-3" werden dieselbe Zeichenkette. Der Preis sind seltene
 * Treffer ueber Wortgrenzen; bei 138 Eintraegen ist das billiger als
 * ein Alias-Schema.
 */
export function normalisiere(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Trifft die Anfrage den Knoten? Jeder Bestandteil der Anfrage muss
 * sitzen — und je kuerzer er ist, desto enger sucht er:
 * - 2 Zeichen: nur der ganze Code (`FE` findet Eisen, faellt aber
 *   nicht in jedes „…fe…" im Text),
 * - 3 Zeichen: Code und Name (`EPA` findet die Eicosapentaensaeure,
 *   aber nicht jedes „Reparatur" in den Erklaertexten),
 * - ab 4 Zeichen: auch Erklaerung und Quellen (`Skorbut`, `Lachs`).
 */
export function trifftSuche(
  code: string, suchName: string, suchText: string, suchAlias: string[],
  anfrage: string,
): boolean {
  const teile = anfrage.split(/\s+/).map(normalisiere).filter(t => t.length >= 2)
  if (teile.length === 0) return false
  const codeNorm = normalisiere(code)
  // G-147/G-142: Aliase (C-165) zaehlen wie Namen — plus die
  // Kurz-Token-Erweiterung: exakte Gleichheit mit einem Alias trifft
  // auch unter drei Zeichen („B5", „kJ"), sonst faende „Vitamin B5"
  // prinzipiell nie etwas. Die Naehe-Regel selbst bleibt: sie
  // verhinderte, dass „EPA" ueber das „epa" in „Reparatur" Valin fand.
  const aliasText = suchAlias.join(' ')
  return teile.every(t =>
    t === codeNorm
    || suchAlias.includes(t)
    || (t.length >= 3 && (suchName.includes(t) || aliasText.includes(t)))
    || (t.length >= 4 && suchText.includes(t)))
}

/**
 * Der Zonenbalken aus der Vorlage (`NutrientSpectrum`,
 * module-nutrition-nutrients.jsx): 0 → unterversorgt → Ziel → Bereich
 * → UL, mit Markierung fuer den Wert. `[read]` Ein Balken, der bei
 * 100 % endet, sagt bei Vitamin A mit 411 % nichts — dieser zeigt, WO
 * der Wert liegt. Alle Angaben in Prozent der Skala; `null`, wenn es
 * kein Ziel gibt (dann gibt es nichts zu verorten).
 */
export type SpektrumLage = {
  /** Skalenende in Einheiten: UL * 1,1 oder Ziel * 2 (Vorlage). */
  skalaMax: number
  zielPos: number
  ulPos: number | null
  /** Position des Werts, an der Skala gekappt; `null` ohne Wert. */
  wertPos: number | null
  wertGekappt: boolean
}

export function spektrumLage(
  wert: number | null, ziel: number | null, obergrenze: number | null,
): SpektrumLage | null {
  if (ziel === null || ziel <= 0) return null
  const skalaMax = obergrenze !== null && obergrenze > ziel
    ? obergrenze * 1.1
    : ziel * 2
  const pos = (v: number) => Math.min((v / skalaMax) * 100, 100)
  return {
    skalaMax,
    zielPos: pos(ziel),
    ulPos: obergrenze !== null && obergrenze > ziel ? pos(obergrenze) : null,
    wertPos: wert === null ? null : pos(wert),
    wertGekappt: wert !== null && wert > skalaMax,
  }
}

/**
 * Die Ursachen-Regel (G-128, Tom: „Wenn ein Total auffaellig als
 * Summe ist, muss man die Childs auch sehen"): unter einem Knoten,
 * der SELBST den Filter trifft, erscheinen zusaetzlich die Kinder,
 * die einen Wert tragen — bei Vitamin A ueber UL also alle vier
 * Formen mit ihren Zahlen. Kinder ohne Wert bleiben draussen, sonst
 * stuenden bei den Fettsaeuren dreissig Zeilen Kontext.
 */
export function zeigeKind(
  elternTrifft: boolean, kind: NaehrstoffKnoten, scope: Scope,
): boolean {
  return sichtbar(kind, scope) || (elternTrifft && kind.wert !== null)
}

export type Scope = 'alle' | 'auffaellig' | 'unter'

export const SCOPES: readonly Scope[] = ['alle', 'auffaellig', 'unter']

/** Der Schluessel der Naehrstoffbaum-Ansicht in
 *  `public.user_display_preferences` (C-161). */
export const ANSICHT_SCHLUESSEL = 'nutrition.nutrient_tree'

/** Die gespeicherte Ansicht: offene Knoten, Fenster, Filter — „die
 *  letzte Sicht wird gespeichert fuer den User" (G-122). */
export type GespeicherteAnsicht = {
  offen: string[]
  fenster: number
  scope: Scope
}

/**
 * Prueft einen `jsonb`-Wert aus der Datenbank bzw. einen
 * Request-Koerper. Laeuft auf Server UND Client — deshalb hier und
 * nicht in der Server-Datenschicht. Kaputte oder fremde Werte werden
 * verworfen, nicht repariert: dann gilt der Start „alles zu".
 */
export function pruefeAnsicht(roh: unknown): GespeicherteAnsicht | null {
  if (!roh || typeof roh !== 'object') return null
  const r = roh as Record<string, unknown>
  if (!Array.isArray(r.offen) || r.offen.length > 300) return null
  const offen = r.offen.filter(
    (x): x is string => typeof x === 'string' && x.length > 0 && x.length <= 60)
  if (offen.length !== r.offen.length) return null
  const fenster = typeof r.fenster === 'number'
    && (FENSTER as readonly number[]).includes(r.fenster) ? r.fenster : null
  const scope = typeof r.scope === 'string'
    && (SCOPES as readonly string[]).includes(r.scope) ? r.scope as Scope : null
  if (fenster === null || scope === null) return null
  return { offen, fenster, scope }
}

/** Trifft der Filter den Knoten selbst? Zeilen ohne Referenz
 *  (`status: null`) sind nicht auffaellig, sondern unbewertet. */
export function trifft(k: NaehrstoffKnoten, scope: Scope): boolean {
  if (scope === 'auffaellig') return k.status === 'unter' || k.status === 'ueber'
  if (scope === 'unter') return k.status === 'unter'
  return true
}

/** Die Rekursion der Vorlage (`hasChildOutOfRange`): ein Elternknoten
 *  bleibt sichtbar, wenn irgendein Nachkomme den Filter trifft. */
export function kindTrifft(k: NaehrstoffKnoten, scope: Scope): boolean {
  return k.kinder.some(c => trifft(c, scope) || kindTrifft(c, scope))
}

export function sichtbar(k: NaehrstoffKnoten, scope: Scope): boolean {
  return trifft(k, scope) || kindTrifft(k, scope)
}

export function zaehleSichtbare(knoten: NaehrstoffKnoten[], scope: Scope): number {
  let n = 0
  for (const k of knoten) {
    if (!sichtbar(k, scope)) continue
    n += 1 + zaehleSichtbare(k.kinder, scope)
  }
  return n
}
