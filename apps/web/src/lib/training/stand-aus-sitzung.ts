// ════════════════════════════════════════════════════════════════════
// DER STAND DER ERFASSUNG — G-217
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg, kein
// `next/headers` — A-30. Dadurch ohne Datenbank testbar, und aus
// einer Browserdatei gefahrlos benutzbar.
//
// ══ DIE ENTSCHEIDUNG: FORTSETZEN, NICHT FRAGEN ══════════════════════
//
// **Auftrag: *„Was passiert beim naechsten Aufruf, wenn eine Sitzung
// offen ist? Fortsetzen, verwerfen, fragen — entscheide und
// begruende."***
//
// **Entschieden: fortsetzen.** Die offene Sitzung wird geladen und
// steht da, wo sie aufgehoert hat. **Verwerfen bleibt moeglich, aber
// als Knopf, nicht als Frage.**
//
// `[read]` **Warum nicht fragen:** Ein Dialog beim Betreten bestraft
// den Normalfall. Wer zwischen zwei Uebungen das Telefon weglegt und
// wiederkommt, hat nichts entschieden — er macht weiter. **Eine
// Frage waere ein Hindernis genau dort, wo nichts unklar ist.**
//
// `[read]` **Warum nicht verwerfen:** Eine offene Sitzung enthaelt
// bereits geschriebene Saetze. Sie beim naechsten Aufruf wegzuwerfen
// hiesse, Messungen zu loeschen, die jemand eingetragen hat —
// **dieselbe Klasse wie „Absetzen ist kein Loeschen" (G-211).**
//
// `[read]` **Und warum das ueberhaupt eine Frage ist:** `[cmd]` der
// offene Zustand war im Bestand unbenutzt (0 von 66, G-216). **Er
// entsteht erst durch dieses Formular — und dann sofort haeufig**,
// weil ein Training zwischen erstem und letztem Satz Minuten bis
// Stunden offen steht.
//
// ══ DIE GRENZE: WAS DAS FORMULAR NICHT ENTSCHEIDET ══════════════════
//
// `[read]` **Eine offene Sitzung von VORGESTERN ist nicht dasselbe
// wie eine von heute** — jemand hat vergessen abzuschliessen.
// **Trotzdem wird sie fortgesetzt und nicht automatisch beendet:**
// wann sie geendet haette, weiss niemand, und eine erfundene
// `ended_time` waere schlimmer als eine offene Sitzung.
//
// `[read]` **Das Formular sagt es nur.** `standSatz()` benennt das
// Alter, damit die Entscheidung beim Menschen bleibt.

/** Was das Formular beim Betreten vorfindet. */
export type Stand = 'keine' | 'offen_heute' | 'offen_aelter'

export type OffeneSitzung = {
  id: string
  session_date: string
  started_time: string | null
  total_sets: number | null
}

/**
 * Der Stand aus der offenen Sitzung und dem heutigen Datum.
 *
 * `[read]` **Verglichen wird das Datum als Text**, nicht ueber
 * `Date` — `session_date` ist eine `date`-Spalte ohne Zeitzone, und
 * ein `new Date('2026-08-28')` verschoebe sie je nach Zone um einen
 * Tag. Genau die Falle, die `sitzungen-read.ts` bei `absolviert`
 * schon vermeidet.
 */
export function standVon(offen: OffeneSitzung | null, heute: string): Stand {
  if (!offen) return 'keine'
  return offen.session_date === heute ? 'offen_heute' : 'offen_aelter'
}

/**
 * Der Satz, der ueber der Erfassung steht.
 *
 * `[read]` **Bei einer aelteren Sitzung wird das Alter benannt**,
 * nicht verschwiegen und nicht automatisch behoben.
 */
export function standSatz(stand: Stand, offen: OffeneSitzung | null): string {
  if (stand === 'keine' || !offen) {
    return 'Kein laufendes Training.'
  }
  const saetze = offen.total_sets ?? 0
  const teil = saetze === 1 ? '1 Satz' : `${saetze} Sätze`
  if (stand === 'offen_heute') {
    return `Laufendes Training von heute, ${teil} eingetragen.`
  }
  return `Laufendes Training vom ${offen.session_date}, ${teil} eingetragen `
    + '— nicht abgeschlossen.'
}

/**
 * Ob abgeschlossen werden kann.
 *
 * `[read]` **Eine Sitzung ohne einen einzigen Satz abzuschliessen
 * ergibt eine absolvierte Einheit ohne Leistung** — dieselbe leere
 * Behauptung, die `status: 'completed'` beim Anlegen waere (G-216).
 * **Verwerfen bleibt erlaubt**, das ist der richtige Weg fuer „doch
 * nicht trainiert".
 */
export function darfAbschliessen(saetzeGesamt: number): boolean {
  return saetzeGesamt > 0
}

export const OHNE_SATZ_HINWEIS =
  'Trag einen Satz ein, bevor du abschließt — oder verwirf das Training.'
