// Der Daumen je Produkt — die Rechnung, G-455.
//
// `[read]` **Reine Rechnung, keine Importe.** Serverfrei, damit der
// Reiter sie als WERT importieren darf (A-30 — in G-453 zweimal
// gestolpert, in G-450 beim dritten Mal erkannt).

/** Die drei Zustaende — dieselben wie bei den Lebensmitteln (G-67). */
export type Daumen = 'neutral' | 'liked' | 'disliked'

/**
 * Wohin ein Klick fuehrt.
 *
 * `[read]` **Ein Klick auf den aktiven Knopf hebt auf** — sonst gaebe
 * es keinen Weg zurueck ausser ueber den anderen Knopf. Dieselbe
 * Mechanik wie in `daumen.tsx`.
 */
export function naechsterProduktDaumen(
  jetzt: Daumen, richtung: 'liked' | 'disliked',
): Daumen {
  return jetzt === richtung ? 'neutral' : richtung
}

// ══ G-455: gruene zuoberst ══════════════════════════════════════════
//
// **Tom:** *„Der Daumen je Produkt, gruene zuoberst."*
//
// `[cmd]` **Die Sortierung liegt in `search_supplier_products`:**
// `liked -> neutral -> disliked`, danach `similarity` (laut Auftrag).
//
// `[read]` **Aber nur dort.** `[cmd]` **Der Tabellenweg** — der laeuft,
// sobald ein Kategorie- oder Formfilter gesetzt ist oder kein
// Suchbegriff dasteht (G-453) — **sortiert nach `name_en`.**
//
// `[read]` **Deshalb wird hier nachsortiert**, und zwar STABIL: die
// vorhandene Reihenfolge bleibt innerhalb einer Gruppe erhalten.
// **Sonst sprangen die Zeilen bei jedem Daumenklick.**

/** Der Rang einer Zeile: gruen zuoberst, rot zuunterst. */
export function daumenRang(d: Daumen | undefined): number {
  return d === 'liked' ? 0 : d === 'disliked' ? 2 : 1
}

/**
 * Die Liste nach Daumen sortieren — stabil.
 *
 * `[read]` **`Array.prototype.sort` ist seit ES2019 stabil**, also
 * bleibt die Reihenfolge innerhalb einer Gruppe die der Datenbank
 * (Aehnlichkeit bzw. Name). **Wer das aendert, muss es messen.**
 */
export function nachDaumen<T extends { id: string }>(
  zeilen: readonly T[], stand: Record<string, Daumen>,
): T[] {
  return [...zeilen].sort(
    (a, b) => daumenRang(stand[a.id]) - daumenRang(stand[b.id]))
}
