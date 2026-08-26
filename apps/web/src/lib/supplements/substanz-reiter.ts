// Welche Reiter das Ausklappen zeigt — und welche nicht (G-180).
//
// ── WARUM DAS HIER STEHT UND NICHT IN DER KOMPONENTE ────────────────
//
// `[read]` **Serverfrei und ohne React**, damit die Regel „ein Reiter
// ohne Inhalt erscheint nicht" ohne Browser pruefbar ist. Dasselbe
// Muster wie `substanz-luecken.ts` (C-252) und `extended-regel.ts`
// (G-167).
//
// `[cmd]` **Und die Regel greift oft:** gemessen am 2026-08-25 haben
// **15 von 318** Katalogeintraegen Unterformen — bei 303 entfaellt der
// Reiter „Formen". **28 haben gar keine Nutzertextzeile**, darunter
// alle 15 Sammeleintraege; dort bleiben nur „Formen" oder nichts.
import type {
  Nutzertexte, Unterform, Frage, Quelle, Laborwirkung, Wechselwirkung,
  CommunityHinweise,
} from './substanz-read'

export type ReiterId = 'ueberblick' | 'dosierung' | 'sicherheit' | 'formen'
  | 'community' | 'rechtslage' | 'fragen' | 'quellen'

export type Reiter = {
  id: ReiterId
  titel: string
  /** Die Zahl hinter dem Titel — nur wo es eine gibt (§: „Fragen · 5"). */
  zahl: number | null
}

/** Die Zahlen, die der Dosierungs-Reiter zeigt. */
export type Zahlen = {
  menge: string | null
  obergrenze: string | null
  einnahme: string | null
  mitEssen: string | null
  /**
   * Warum es keine Menge gibt — G-191.
   *
   * `[read]` **Getrennt vom Wert, nicht statt seiner.** Die alte
   * Fassung schrieb den Grund in dasselbe Feld wie die Menge; dadurch
   * stand *„No validated clinical guideline dose"* dort, wo eine Zahl
   * hingehoert. Zwei Felder koennen nicht verwechselt werden.
   */
  mengeGrund?: string | null
  /** Warum es keine Obergrenze gibt — G-191. */
  obergrenzeGrund?: string | null
}

function da(v: string | null | undefined): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

/**
 * Die Reiter, die Inhalt haben — in fester Reihenfolge.
 *
 * `[read]` **Die Reihenfolge ist nicht verhandelbar**, die Auswahl
 * schon: Ueberblick zuerst, weil dort steht, was der Stoff ist.
 * `[read]` **Ein leerer Reiter wird nicht ausgegraut, sondern
 * weggelassen** — ein Reiter, der nichts zeigt, ist ein Versprechen,
 * das er nicht einloest (dieselbe Regel wie §9, dritte).
 */
export function reiterFuer(
  texte: Nutzertexte | null | undefined,
  zahlen: Zahlen,
  formen: Unterform[] | null | undefined,
  fragen: Frage[] | null | undefined,
  labor?: string | null,
  quellen?: Quelle[] | null,
  laborwirkungen?: Laborwirkung[] | null,
  wechselwirkungen?: Wechselwirkung[] | null,
  community?: CommunityHinweise | null,
  /**
   * G-195: die zwei Felder des Rechtslage-Reiters.
   *
   * `[cmd]` **Gemessen 2026-08-26 ueber die 412 sichtbaren:**
   * `note_de` bei **305**, `rechtslage_klartext_de` bei **201** —
   * zusammen **345 mit Reiter, 67 ohne.**
   */
  wadaNote?: string | null,
  rechtslage?: string | null,
): Reiter[] {
  const t = texte ?? null
  const aus: Reiter[] = []

  if (da(t?.kurz_was) || da(t?.wie_wirkt) || da(t?.was_bringt_es)) {
    aus.push({ id: 'ueberblick', titel: 'Überblick', zahl: null })
  }
  if (da(zahlen.menge) || da(zahlen.obergrenze) || da(zahlen.einnahme)
      || da(zahlen.mitEssen) || da(t?.wann_wie)) {
    aus.push({ id: 'dosierung', titel: 'Dosierung', zahl: null })
  }
  // `[read]` `irreversibel`/`ueberwachung`/`reinheit` zaehlen mit:
  // bei Enhanced ist das der Sicherheitsteil, und er steht heute bei
  // 0 von 290 — der Reiter erscheint, sobald C-266 durch ist.
  // G-186: Wechselwirkungen und Laborwirkung zaehlen mit — 121 der 318
  // haben welche, und bei einigen ist es der einzige Sicherheitsinhalt.
  if (da(t?.zu_viel) || da(t?.zu_wenig) || da(t?.mythen)
      || (t?.wer_nicht?.length ?? 0) > 0
      || da(t?.irreversibel) || da(t?.ueberwachung) || da(t?.reinheit)
      || da(labor)
      || (laborwirkungen?.length ?? 0) > 0
      || (wechselwirkungen?.length ?? 0) > 0) {
    aus.push({ id: 'sicherheit', titel: 'Sicherheit', zahl: null })
  }
  if (formen && formen.length > 0) {
    aus.push({ id: 'formen', titel: 'Formen', zahl: formen.length })
  }
  const communityZahl = (community?.nebenwirkungen.length ?? 0)
    + (community?.tradeoffs.length ?? 0)
    + (community?.mythen.length ?? 0)
    + (community?.qualitaet.length ?? 0)
    + (community?.begriffe.length ?? 0)
  if (communityZahl > 0) {
    aus.push({ id: 'community', titel: 'Aus der Community', zahl: communityZahl })
  }
  if (fragen && fragen.length > 0) {
    aus.push({ id: 'fragen', titel: 'Fragen', zahl: fragen.length })
  }
  // ══ G-195: der Reiter „Rechtslage" ═══════════════════════════════
  //
  // **Tom, 2026-08-26:** *„wuerde es nicht sinn machen wada als
  // eigenen reiter zu haben anstatt das ganze bild zu zerstoeren?"*
  // Und zur Stelle: *„am ende reiter vor quellen, das ist alles nice
  // to have aber wird kaum einen interessieren."*
  //
  // `[cmd]` **Gemessen 2026-08-26, warum es das Bild zerstoerte:** der
  // WADA-Block nahm im Ueberblick **155–235 px** von 580 sichtbaren —
  // **27 bis 41 Prozent**, fuer eine Angabe, die die Kachel darueber
  // in drei Worten macht.
  //
  // `[read]` **Ein Thema, nicht drei Felder:** WADA ist eine
  // Rechtsfrage. Sie steht neben der Rechtslage je Land, nicht neben
  // *„Wie es wirkt"*.
  //
  // `[read]` **Vor „Quellen", nach „Fragen"** — beides sind
  // Nachschlagereiter. Wer wissen will, OB ein Stoff erlaubt ist,
  // liest die Kachel im Ueberblick; wer die Ligen und Paragraphen
  // braucht, sucht gezielt.
  if (da(wadaNote) || da(rechtslage)) {
    aus.push({ id: 'rechtslage', titel: 'Rechtslage', zahl: null })
  }
  // G-182 Punkt 4: die Quellen bekommen einen eigenen Reiter.
  //
  // `[read]` **Nicht als Ausklappen unter dem Chip:** der Chip stand
  // in der Fusszeile und tat nichts — Tom: *„quellen haben keine
  // funktion."* Ein Reiter ist der Ort, an dem die Tafel ohnehin
  // Inhalte fuehrt, und er traegt seine Zahl wie die anderen.
  if (quellen && quellen.length > 0) {
    aus.push({ id: 'quellen', titel: 'Quellen', zahl: quellen.length })
  }
  return aus
}

/**
 * Der Reiter, der beim Aufklappen offen ist.
 *
 * `[read]` **Der erste vorhandene, nicht ein fester.** Bei den 15
 * Sammeleintraegen ohne Textzeile ist das „Formen" — ein fest auf
 * „Überblick" gesetzter Startwert zeigte dort eine leere Flaeche.
 */
export function ersterReiter(reiter: Reiter[]): ReiterId | null {
  return reiter.length > 0 ? reiter[0].id : null
}
