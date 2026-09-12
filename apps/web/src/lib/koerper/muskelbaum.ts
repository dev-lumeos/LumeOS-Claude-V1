// G-432/A6 — die Rechnung auf `training.muscle_groups`. OHNE Importe.
//
// **Tom:** *„per muscle detail bildet ALLE muskelgruppen und deren
// childs ab."* **Und:** *„Was nicht gezeichnet ist, steht als Luecke
// drin — nicht weggelassen."*
//
// ══ WARUM OHNE IMPORTE ══════════════════════════════════════════════
//
// `[cmd]` **G-430 hat es gemessen:** ein WERT-Import aus einem
// Leseweg zieht `next/headers` ueber die `'use client'`-Grenze und
// ergibt **HTTP 500 auf jeder Route** — waehrend `tsc` gruen bleibt.
// **Nur der Typ darf aus `-read` kommen.**

/** Eine Zeile aus `training.muscle_groups`. */
export type MuskelKnoten = {
  id: string
  name: string
  parent_id: string | null
}

export type MuskelbaumStand = {
  knoten: MuskelKnoten[]
  /** `null`, wenn gelesen wurde; sonst der Grund. */
  fehler: string | null
}

/** Ein Ast der Anzeige — Gruppe, Kinder, und was gezeichnet ist. */
export type Ast = {
  name: string
  /** Die Kartenflaeche, die diesen Namen zeigt — `null` heisst Luecke. */
  flaeche: string | null
  kinder: Ast[]
  ebene: number
}

/**
 * Den Baum aufspannen, von den Wurzeln abwaerts.
 *
 * `[read]` **`zeigt` bildet Muskelname -> Kartenflaeche ab.** Wo es
 * keinen Eintrag gibt, ist `flaeche` gleich `null` — **das IST die
 * Luecke**, und sie wird angezeigt, nicht weggelassen.
 */
export function baueBaum(
  knoten: MuskelKnoten[],
  zeigt: Record<string, string>,
): Ast[] {
  const klein: Record<string, string> = {}
  for (const [name, f] of Object.entries(zeigt)) klein[name.toLowerCase()] = f

  function ast(k: MuskelKnoten, ebene: number): Ast {
    // `[read]` **Tiefe begrenzt** — `parent_id` ist ungeprueft, und
    // ein Zyklus in den Daten haengte sonst die Seite auf (G-430).
    const kinder = ebene >= 6 ? [] : knoten
      .filter(x => x.parent_id === k.id)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(x => ast(x, ebene + 1))
    return {
      name: k.name,
      flaeche: klein[k.name.toLowerCase()] ?? null,
      kinder,
      ebene,
    }
  }

  return knoten
    .filter(k => !k.parent_id)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(k => ast(k, 1))
}

/** Der Weg von der Wurzel bis zu einem Namen, ihn eingeschlossen. */
export function wegZu(knoten: MuskelKnoten[], name: string): string[] {
  const nachId = new Map(knoten.map(k => [k.id, k]))
  let k = knoten.find(x => x.name.toLowerCase() === name.toLowerCase()) ?? null
  const aus: string[] = []
  let tiefe = 0
  while (k && tiefe < 10) {
    aus.unshift(k.name)
    k = k.parent_id ? nachId.get(k.parent_id) ?? null : null
    tiefe += 1
  }
  return aus
}

/**
 * Die Wurzel eines Namens — das ist die „Zugehoerigkeit" aus A5.
 *
 * `[read]` **Tom:** *„Latissimus dorsi / gehoert zu: Ruecken."*
 */
export function wurzelVon(knoten: MuskelKnoten[], name: string): string | null {
  const weg = wegZu(knoten, name)
  return weg.length > 0 ? weg[0] : null
}

/** Wieviele Namen der Baum traegt, und wieviele davon gezeichnet sind. */
export function deckung(
  knoten: MuskelKnoten[], zeigt: Record<string, string>,
): { gesamt: number; gezeichnet: number; luecken: number } {
  const klein = new Set(Object.keys(zeigt).map(n => n.toLowerCase()))
  const gezeichnet = knoten.filter(k => klein.has(k.name.toLowerCase())).length
  return { gesamt: knoten.length, gezeichnet, luecken: knoten.length - gezeichnet }
}
