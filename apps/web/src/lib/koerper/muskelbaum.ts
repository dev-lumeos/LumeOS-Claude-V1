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

/**
 * Ein Ast mit Schnitt und Engpass — die Ansicht aus G-436.
 *
 * `[cmd]` **`kinder` wird ueberschrieben** — ohne das erbt es
 * `Ast[]` von `Ast`, und die Kinder haetten keine Werte. **`tsc`
 * meldet das erst an der Verwendungsstelle**, nicht an der
 * Typdefinition.
 */
export type AstMitWert = Omit<Ast, 'kinder'> & {
  kinder: AstMitWert[]
  /** Der eigene Wert, `null` wenn keiner zugeordnet ist. */
  wert: number | null
  /**
   * Der Schnitt ueber die Kinder MIT Wert — `null`, wenn keines
   * einen hat.
   *
   * `[cmd]` **Tom:** *„der schnitt rechnet NUR ueber kinder MIT
   * wert."* `[read]` **Ein Kind ohne Volumen zieht ihn nicht
   * herunter** — sonst saehe eine Gruppe schlechter aus, als sie
   * ist, nur weil ein Muskel noch keine Zuordnung hat.
   */
  schnitt: number | null
  /** Wieviele Kinder in den Schnitt eingegangen sind. */
  schnittAus: number
  /** Das schwaechste Glied unterhalb — der Engpass. */
  engpass: { name: string; wert: number } | null
}

/**
 * Schnitt und Engpass je Ast rechnen.
 *
 * **Tom (G-436):** *„wieso waehlen wenn man beides haben kann?
 * schnitt von kindern mit werten und daneben schwaechstes glied."*
 *
 * `[read]` **Der Schnitt sagt, wie es der Gruppe im Mittel geht.**
 * `[read]` **Der Engpass sagt, was einen aufhaelt** — wer trainieren
 * will, sieht sofort, was nicht bereit ist.
 *
 * `[cmd]` **Beide beziehen NUR Knoten mit Wert ein.** `[read]` **Wo
 * keiner ist, steht `null`** — und die Ansicht schreibt `--`, nicht
 * `0`. **Eine Null saehe aus wie „voellig unerholt".**
 *
 * Der Engpass sucht ueber ALLE Nachfahren, nicht nur die direkten
 * Kinder — ein Engpass zwei Ebenen tiefer ist derselbe Engpass.
 */
export function mitWerten(
  aeste: Ast[], wertVon: (a: Ast) => number | null,
): AstMitWert[] {
  function rechne(a: Ast): AstMitWert {
    const kinder = a.kinder.map(rechne)
    const wert = wertVon(a)

    // ══ Der Schnitt: nur direkte Kinder MIT Wert ═════════════════
    //
    // `[read]` **Ueber die DIREKTEN Kinder**, nicht ueber alle
    // Nachfahren — sonst zaehlte ein tief verzweigter Zweig
    // schwerer als ein flacher.
    const mitZahl = kinder
      .map(k => k.wert ?? k.schnitt)
      .filter((z): z is number => z != null)
    const schnitt = mitZahl.length > 0
      ? Math.round(mitZahl.reduce((s, z) => s + z, 0) / mitZahl.length)
      : null

    // ══ Der Engpass: das schwaechste Glied unterhalb ═════════════
    let engpass: { name: string; wert: number } | null = null
    for (const k of kinder) {
      // Der eigene Wert des Kindes zaehlt, und der Engpass, den es
      // selbst meldet — so faellt ein Enkel nicht durch.
      const kandidaten = [
        k.wert != null ? { name: k.name, wert: k.wert } : null,
        k.engpass,
      ].filter((x): x is { name: string; wert: number } => x != null)
      for (const c of kandidaten) {
        if (!engpass || c.wert < engpass.wert) engpass = c
      }
    }

    return { ...a, kinder, wert, schnitt, schnittAus: mitZahl.length, engpass }
  }
  return aeste.map(rechne)
}

/**
 * Die NACHBARSCHAFT eines Muskels — fuer das Modal EINES Muskels.
 *
 * **Tom (G-435):** *„in den details hat es eine auflistung ‚Alle
 * Muskelgruppen · 22 von 95 gezeichnet · 73 Lücken' — für was ist
 * die?"*
 *
 * `[read]` **Wer den Latissimus anklickt, will den Latissimus
 * sehen** — nicht die 95 Namen des ganzen Baums. `[cmd]` **Die
 * vollstaendige Hierarchie gehoert in die Kachel `Per-muscle
 * detail`, nicht ins Modal.**
 *
 * Zurueck kommt: der Muskel, seine Gruppe (der direkte Elternteil),
 * seine Geschwister (die anderen Kinder derselben Gruppe, OHNE ihn)
 * und seine eigenen Kinder, falls er welche traegt.
 */
export function nachbarschaft(knoten: MuskelKnoten[], name: string): {
  muskel: MuskelKnoten
  gruppe: MuskelKnoten | null
  geschwister: MuskelKnoten[]
  kinder: MuskelKnoten[]
} | null {
  const k = knoten.find(x => x.name.toLowerCase() === name.toLowerCase())
  // `[read]` **Ein unbekannter Name liefert `null`** — nicht den
  // ganzen Baum. Sonst zeigte ein Tippfehler wieder alles.
  if (!k) return null
  const gruppe = k.parent_id
    ? knoten.find(x => x.id === k.parent_id) ?? null
    : null
  const geschwister = knoten
    .filter(x => x.parent_id === k.parent_id && x.id !== k.id)
    .sort((a, b) => a.name.localeCompare(b.name))
  const kinder = knoten
    .filter(x => x.parent_id === k.id)
    .sort((a, b) => a.name.localeCompare(b.name))
  return { muskel: k, gruppe, geschwister, kinder }
}

/** Wieviele Namen der Baum traegt, und wieviele davon gezeichnet sind. */
export function deckung(
  knoten: MuskelKnoten[], zeigt: Record<string, string>,
): { gesamt: number; gezeichnet: number; luecken: number } {
  const klein = new Set(Object.keys(zeigt).map(n => n.toLowerCase()))
  const gezeichnet = knoten.filter(k => klein.has(k.name.toLowerCase())).length
  return { gesamt: knoten.length, gezeichnet, luecken: knoten.length - gezeichnet }
}
