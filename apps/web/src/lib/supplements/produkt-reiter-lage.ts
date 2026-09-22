// Die Reiter der Produkt-Tafel — G-492/A15 bis A18.
//
// **Tom, 2026-09-08:** *„einbauen und ausdokumentieren, sobald daten
// da sind einbinden. plus einen reiter fuer die etikette, den
// bildpfad werden wir mit den 527 daten auch haben. ueberblick und
// inhaltsstoffe auf den ersten reiter, das ist was man sehen will"*
//
// `[read]` **Serverfrei** (A-30) — eine Regel, die im JSX steht, ist
// nicht pruefbar; die Lehre aus G-491.

/** Die vier Reiter, in Toms Reihenfolge. */
export type ProduktReiterId = 'ueberblick' | 'anwendung' | 'hinweise' | 'etikett'

export type ProduktReiter = {
  id: ProduktReiterId
  titel: string
  /** `null`, wo eine Zahl bedeutungslos waere (G-180). */
  zahl: number | null
  /** Wartet dieser Reiter noch auf Daten? */
  wartet: boolean
}

/**
 * Was die vorbereiteten Reiter zeigen, solange C-527 fehlt.
 *
 * ══ WARUM EIN SATZ UND KEIN LEERES FELD ═════════════════════════════
 *
 * `[read]` **Die Lehre aus G-482 und G-486: eine leere Flaeche ohne
 * Grund sieht aus wie ein Fehler.** `[cmd]` **G-486 wurde VIERMAL
 * gemeldet**, weil ein wortloses Fehlen keinen Grund nennt.
 *
 * `[cmd]` **A17 verlangt den Satz ausdruecklich**, A18 die
 * Dokumentation der Quelle.
 */
export const WARTET_AUF: Record<'hinweise' | 'etikett', {
  satz: string
  /** Woher der Inhalt kommen wird — A18. */
  quelle: string
  /** Welcher Punkt sie liefert — A18. */
  punkt: string
}> = {
  // ══ A18: DIE QUELLE, GEMESSEN STATT GERATEN ══════════════════════
  //
  // `[cmd]` **Gemessen 2026-09-22 in `information_schema.columns`:**
  // `supplements.supplier_products` hat **KEINE** Spalte, die auf
  // `precaut`, `formul`, `label`, `image` oder `bild` passt — **0
  // Zeilen.**
  //
  // `[cmd]` **C-527 ist ein RECHERCHEPUNKT** (*„A7 KEINE
  // Umsetzung"*). `[read]` **Die Spaltennamen stehen also noch nicht
  // fest** — hier einen zu nennen waere eine Zusage, die niemand
  // gegeben hat. **Benannt wird die QUELLE, nicht die Spalte.**
  //
  // `[cmd]` **C-527 hat die DSLD-Tafel „Label Statements" gezaehlt**
  // (batch1 von 14): `Precautions` **18.362**, `Formulation`
  // **16.621** Produkte.
  hinweise: {
    satz: 'Die Warnhinweise vom Etikett werden noch übernommen.',
    quelle: 'DSLD „Label Statements“ · Precautions (18.362), Formulation (16.621)',
    punkt: 'C-527',
  },
  // `[cmd]` **Der Etikett-Reiter wartet auf die URL**, nicht auf eine
  // Bilddatei — C-527: *„Etikett wartet auf den Bildpfad (URL)"*.
  // `[cmd]` **Und sie ist rekonstruierbar:** `label/` plus `dsld_id`,
  // **die Spalte steht schon.** `[read]` **Trotzdem nicht hier
  // zusammengebaut:** C-527 hat drei Zeilen geprueft und schreibt
  // selbst *„drei von 121.959 sind kein Beleg. MISS es."*
  etikett: {
    satz: 'Das Etikett vom Hersteller wird noch übernommen.',
    quelle: 'DSLD-Etikettseite · dsld.od.nih.gov/label/<dsld_id>',
    punkt: 'C-527',
  },
}

/**
 * Die Reiterliste zu einem Produkt.
 *
 * `[read]` **Alle vier stehen IMMER** — auch die wartenden.
 *
 * `[cmd]` **Das ist der Unterschied zur Substanz-Tafel**, deren
 * `reiterFuer` nur zeigt, was Inhalt hat. **Hier ist das Warten die
 * Aussage:** ein Reiter, der erst erscheint, wenn C-527 da ist,
 * verrät nicht, dass er kommt — und Tom hat *„einbauen und
 * ausdokumentieren"* verlangt, nicht *„einbauen, sobald"*.
 *
 * `[read]` **Die Zahl steht nur beim Ueberblick** — er traegt die
 * Etikettzeilen, und das ist die einzige Menge, die man vorher
 * wissen will.
 */
export function produktReiter(
  { etikettZeilen }: { etikettZeilen: number },
): ProduktReiter[] {
  return [
    // `[cmd]` **Ueberblick UND Inhaltsstoffe zusammen** — Tom:
    // *„das ist was man sehen will."*
    { id: 'ueberblick', titel: 'Überblick',
      zahl: etikettZeilen > 0 ? etikettZeilen : null, wartet: false },
    { id: 'anwendung', titel: 'Anwendung', zahl: null, wartet: false },
    { id: 'hinweise', titel: 'Hinweise', zahl: null, wartet: true },
    { id: 'etikett', titel: 'Etikett', zahl: null, wartet: true },
  ]
}

/**
 * Welcher Reiter zuerst offen ist.
 *
 * `[read]` **Immer der Ueberblick** — er traegt, was man sehen will,
 * und ist nie leer (die Kacheln stehen auch ohne Etikett).
 */
export function ersterProduktReiter(): ProduktReiterId {
  return 'ueberblick'
}
