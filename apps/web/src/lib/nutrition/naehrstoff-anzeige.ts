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
  'Elemente', 'Energie', 'Sonstige',
] as const

/**
 * Welche Karte eine Wurzel bekommt. Die Zuordnung ist Anzeige, kein
 * Schema: `CHO` und `FIBT` unter „Kohlenhydrate" (Ballaststoffe SIND
 * Kohlenhydrate — so auch Cronometer), `FAT` unter „Fette",
 * `PROT625` unter „Protein"; die restlichen Makro-Wurzeln (Wasser,
 * Alkohol, Organische Saeuren, Rohasche) und `group_de = 'Sonstige
 * Naehrstoffe'` sammeln sich unter „Sonstige". Vitamine, Elemente und
 * Energie behalten ihr `group_de`.
 */
export function karteFuerWurzel(code: string, gruppe: string): string {
  if (code === 'CHO' || code === 'FIBT') return 'Kohlenhydrate'
  if (code === 'FAT') return 'Fette'
  if (code === 'PROT625') return 'Protein'
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
  code: string, suchName: string, suchText: string, anfrage: string,
): boolean {
  const teile = anfrage.split(/\s+/).map(normalisiere).filter(t => t.length >= 2)
  if (teile.length === 0) return false
  const codeNorm = normalisiere(code)
  return teile.every(t =>
    t === codeNorm
    || (t.length >= 3 && suchName.includes(t))
    || (t.length >= 4 && suchText.includes(t)))
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
