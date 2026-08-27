// Der Unterschied zwischen „begruendet leer" und „nicht bearbeitet"
// — G-208.
//
// ══ WORAUS DIESE DATEI ENTSTAND ═════════════════════════════════════
//
// `[read]` **Aus dem G-207-Fund.** Dort schluckte
// `.filter(Boolean)` jede Zuordnung, deren Marker der Katalog nicht
// kannte, und `b?.abbr ?? m` liess einen unbekannten Marker aussehen
// wie einen bekannten. **Beides war dieselbe Sorte Fehler: eine
// Luecke, die sich als Bestand ausgibt.**
//
// `[read]` **Hier ist derselbe Fehler moeglich, nur oefter.** Ein
// Wirkstoff ohne CAS-Nummer und ein Wirkstoff ohne
// Vorsichtsmassnahmen sehen als leeres Feld gleich aus — sind aber
// das Gegenteil voneinander:
//
//     9 ohne CAS           Mischpraeparate. Eine einzelne CAS-Nummer
//                          gibt es fuer sie NICHT. Der Datensatz ist
//                          VOLLSTAENDIG.
//     101 ohne precautions Niemand hat sie recherchiert. Der Datensatz
//                          ist UNVOLLSTAENDIG.
//
// ══ DIE UNTERSCHEIDUNG STEHT SCHON IN DEN DATEN ═════════════════════
//
// `[cmd]` **Gemessen 2026-08-27** — sie wird nicht erfunden, sie wird
// gelesen. Zwei Spalten tragen sie, in zwei verschiedenen Gestalten:
//
//   `medication_active_substances.evidence_provenance`
//     Ein Objekt je Feldbereich. `c292_precautions` und
//     `c292_mechanism_of_action` sind OBJEKTE mit `missing_reason`;
//     `c292_identifiers` ist ein ARRAY von Objekten, je eines
//     mit eigenem `missing_reason`.
//
//   `medication_user_texts.null_context`
//     Ein Objekt je Textfeld, mit `reason_status` (`not_supplied`),
//     `reason_basis` und `source_value`.
//
// `[cmd]` **Belegt an den Zahlen des Auftrags, alle drei getroffen:**
//
//     cas_number leer            9   davon  9 mit missing_reason
//     mechanism leer             4   davon  4 mit missing_reason
//     precautions leer         105   davon  4 mit missing_reason
//     zu_wenig_de leer          40   davon 40 mit null_context
//     mythen_de leer           115   davon 115 mit null_context
//
// `[read]` **Nur bei `precautions` gehen die Zahlen auseinander** —
// 4 begruendet, 101 nicht. **Genau diese 101 sind der Grund fuer den
// dritten Zustand.**
//
// ══ WARUM SERVERFREI ════════════════════════════════════════════════
//
// `[read]` **Dasselbe Muster wie `substanz-luecken.ts` (C-252) und
// `symptome.ts` (G-207):** die Regel steht ohne I/O daneben, damit
// sie ohne Browser und ohne Datenbank pruefbar ist. Der Lesepfad zieht
// `next/headers` und laesst sich in einem Test nicht laden.

/**
 * Die drei Zustaende eines Feldes.
 *
 * `[read]` **Dieselbe Dreiteilung wie `DosisZustand` (G-199)**, und
 * aus demselben Grund: *„nie untersucht"* darf nicht aussehen wie
 * *„geprueft, gibt es nicht"*. Bei einer Dosisobergrenze ist das der
 * Unterschied zwischen Vorsicht und falscher Sicherheit; bei einem
 * Medikament ist er derselbe.
 *
 *     wert            „657-24-9"                     ein Inhalt
 *     begruendet_leer „Mischpraeparat, keine
 *                      einzelne CAS-Nummer"          eine AUSSAGE
 *     nicht_bearbeitet —                             niemand hat
 *                                                    nachgesehen
 */
export type FeldZustand = 'wert' | 'begruendet_leer' | 'nicht_bearbeitet'

/**
 * Ein Feld mit seinem Zustand.
 *
 * `[read]` **`grund` ist der Roh-Code, `grundText` der Satz.** Beide,
 * weil der Code kurz genug fuer eine Kachel ist und der Satz die
 * Herkunft traegt — wer nur den Satz zeigt, verliert die
 * Vergleichbarkeit; wer nur den Code zeigt, zeigt
 * `MIXTURE_NO_SINGLE_CAS`.
 */
export type Feld = {
  id: string
  label: string
  zustand: FeldZustand
  wert: string | null
  /** Der Rohcode, z. B. `MIXTURE_NO_SINGLE_CAS` — nur bei `begruendet_leer`. */
  grund: string | null
  /** Der deutsche Satz dazu — nur bei `begruendet_leer`. */
  grundText: string | null
}

/**
 * Der Text bei `nicht_bearbeitet`.
 *
 * `[read]` **„Nicht recherchiert", nicht „keine Angabe".** Dieselbe
 * Wortwahl-Entscheidung wie `NICHT_ERHOBEN` in G-199: *keine Angabe*
 * klingt nach einer Luecke im Formular, *nicht recherchiert* sagt,
 * dass niemand nachgesehen hat. **Es ist eine Aussage ueber die
 * Arbeit, nicht ueber den Wirkstoff.**
 */
export const NICHT_BEARBEITET = 'Nicht recherchiert'

/**
 * Die Begruendungscodes, die im Bestand vorkommen — auf Deutsch.
 *
 * `[cmd]` **Gemessen 2026-08-27, es sind genau vier:**
 *
 *     MIXTURE_NO_SINGLE_CAS   8  Buprenorphine/Naloxone, Carbidopa/
 *                                Levodopa, Sennosides USP …
 *     BIOLOGIC_NO_CAS         1  Protamine Hydrochloride
 *     NOT_FOUND_IN_SOURCES    5  4x precautions, 1x mechanism
 *     MECHANISM_UNKNOWN       3  mechanism_of_action
 *
 * `[read]` **Ein unbekannter Code wird NICHT verschluckt.** Er kommt
 * als er selbst durch — das ist die Lehre aus `b?.abbr ?? m`: was die
 * Anzeige nicht kennt, darf sie nicht wie etwas Bekanntes aussehen
 * lassen, aber auch nicht wegwerfen.
 */
export const GRUND_TEXT: Record<string, string> = {
  MIXTURE_NO_SINGLE_CAS:
    'Mischpräparat — für eine Kombination aus mehreren Wirkstoffen gibt es '
    + 'keine einzelne CAS-Nummer. Der Datensatz ist vollständig.',
  BIOLOGIC_NO_CAS:
    'Biologikum — für Stoffe biologischen Ursprungs vergibt der CAS-Dienst '
    + 'keine Nummer. Der Datensatz ist vollständig.',
  NOT_FOUND_IN_SOURCES:
    'In den verwendeten Quellen nicht gefunden. Gesucht wurde, gefunden nichts.',
  MECHANISM_UNKNOWN:
    'Der Wirkmechanismus ist nicht abschliessend geklärt — das ist der '
    + 'Forschungsstand, keine Lücke in der Recherche.',
  not_supplied:
    'Die Quelldatei führt zu diesem Feld kein Begründungsfeld — es wurde '
    + 'nichts geliefert, und geraten wird nicht.',
}

/**
 * Den deutschen Satz zu einem Code holen — oder den Code selbst.
 *
 * `[read]` **Der Rueckfall ist der Code, nicht `null`.** Ein
 * unbekannter Code bedeutet, dass die Pipeline einen neuen
 * Begruendungsgrund eingefuehrt hat. **Ihn stumm auf „nicht
 * bearbeitet" fallen zu lassen waere die Luege**, gegen die diese
 * Datei gebaut ist: ein begruendetes Feld saehe aus wie ein
 * unbearbeitetes.
 */
export function grundText(code: string | null): string | null {
  if (!code) return null
  return GRUND_TEXT[code] ?? code
}

/** Ein Text ist da, wenn er nach dem Trimmen etwas enthaelt. */
function da(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

/**
 * Ein Feld aus Wert und Begruendung bauen.
 *
 * `[read]` **Die Reihenfolge ist die Aussagekraft** — wie bei
 * `kachel()` in G-199: ein Wert schlaegt eine Begruendung, eine
 * Begruendung schlaegt Schweigen.
 */
export function feld(
  id: string, label: string,
  wert: unknown, grund: string | null,
): Feld {
  const w = da(wert) ? wert.trim() : null
  if (w) return { id, label, zustand: 'wert', wert: w, grund: null, grundText: null }
  const g = da(grund) ? grund.trim() : null
  if (g) {
    return {
      id, label, zustand: 'begruendet_leer',
      wert: null, grund: g, grundText: grundText(g),
    }
  }
  return {
    id, label, zustand: 'nicht_bearbeitet',
    wert: null, grund: null, grundText: null,
  }
}

/**
 * Den `missing_reason` aus `evidence_provenance` ziehen.
 *
 * `[cmd]` **Zwei Gestalten, gemessen 2026-08-27** — deshalb beide:
 *
 *     c292_precautions           OBJEKT  {missing_reason: …}
 *     c292_mechanism_of_action   OBJEKT  {missing_reason: …}
 *     c292_identifiers           ARRAY   [{missing_reason: …}, …]
 *
 * `[read]` **Beim Array zaehlt der erste Eintrag mit einem Grund.**
 * Bei allen neun Wirkstoffen ohne CAS traegt genau ein Eintrag einen;
 * gaebe es mehrere, waere der erste so gut wie jeder andere — und
 * einen zu waehlen ist ehrlicher, als alle wegzulassen.
 */
export function grundAus(
  provenance: unknown, schluessel: string,
): string | null {
  if (!provenance || typeof provenance !== 'object') return null
  const block = (provenance as Record<string, unknown>)[schluessel]
  if (!block) return null
  if (Array.isArray(block)) {
    for (const e of block) {
      const r = (e as Record<string, unknown>)?.missing_reason
      if (da(r)) return r.trim()
    }
    return null
  }
  const r = (block as Record<string, unknown>).missing_reason
  return da(r) ? r.trim() : null
}

/**
 * Den `reason_status` aus `null_context` ziehen — fuer die Textfelder.
 *
 * `[cmd]` **`null_context` traegt genau zwei Schluessel, gemessen
 * 2026-08-27:** `mythen_de` (115) und `zu_wenig_de` (40). **Beide
 * tragen durchgaengig `reason_status: "not_supplied"`** und denselben
 * `reason_basis`-Satz.
 *
 * `[read]` **Der Status ist der Code, nicht die Begruendung.** Er
 * uebersetzt sich ueber dieselbe Tabelle wie die
 * `missing_reason`-Codes — eine Uebersetzungsstelle, nicht zwei.
 */
export function textGrundAus(
  nullContext: unknown, feldName: string,
): string | null {
  if (!nullContext || typeof nullContext !== 'object') return null
  const block = (nullContext as Record<string, unknown>)[feldName]
  if (!block || typeof block !== 'object') return null
  const s = (block as Record<string, unknown>).reason_status
  return da(s) ? s.trim() : null
}

/**
 * Ein Feld, dessen Text aus `medication_user_texts` kommt.
 *
 * `[read]` **Eigene Funktion, weil die Begruendung anderswo steht** —
 * `null_context` statt `evidence_provenance`. Wer beides ueber
 * dieselbe Funktion zoege, muesste dort raten, welche Spalte gemeint
 * ist.
 */
export function textFeld(
  id: string, label: string,
  wert: unknown, nullContext: unknown, feldName: string,
): Feld {
  return feld(id, label, wert, textGrundAus(nullContext, feldName))
}

/**
 * Ab wann ein Kachelwert als Fliesstext gesetzt wird.
 *
 * ══ DIE MESSUNG, DIE DIESE ZAHL ENTSCHIED ══════════════════════════
 *
 * `[cmd]` **Beim ersten Bildschirmfoto stand `Dopamine replacement:
 * levodopa crosses the blood-brain barrier and is decarboxylated…`
 * in 18-px-Fettschrift** und sprengte die Kachel — die Wertform ist
 * fuer `N04BA` und `103-90-2` gebaut, nicht fuer Saetze.
 *
 * `[cmd]` **Gemessen 2026-08-27, warum eine feste Zahl genuegt:**
 *
 *     cas_number             max  13 Zeichen
 *     atc_code (verkettet)   max  47
 *     mechanism_of_action    Median 151, max 300
 *     zu_viel_de / absetzen  mehrere hundert
 *
 * `[read]` **Zwischen 47 und 151 liegt die Grenze, und sie ist
 * breit** — 40 trennt sauber, ohne dass ein Grenzfall wackelt. **Das
 * ist dieselbe Falle wie G-191**, nur eine Ebene hoeher: dort war ein
 * Objekt als Zeichenkette in der Kachel, hier ein Absatz in der
 * Zahlenform.
 */
export const KURZ_GRENZE = 40

/** Ist der Wert kurz genug fuer die grosse Wertform? */
export function istKurz(wert: string | null): boolean {
  return wert !== null && wert.length <= KURZ_GRENZE
}

/**
 * Wie viele Felder in welchem Zustand sind — fuer die Zeile unter der
 * Tafel.
 *
 * `[read]` **Die Zahl gehoert sichtbar, nicht in den Bericht.** Wer
 * einen Wirkstoff aufklappt, soll sehen koennen, wie vollstaendig der
 * Datensatz ist, ohne jedes Feld einzeln zu pruefen — dieselbe Linie
 * wie *„5 von 7 Markern"* beim Health score (G-135).
 */
export function zaehleZustaende(felder: Feld[]): {
  wert: number; begruendet_leer: number; nicht_bearbeitet: number
} {
  const aus = { wert: 0, begruendet_leer: 0, nicht_bearbeitet: 0 }
  for (const f of felder) aus[f.zustand] += 1
  return aus
}

/**
 * Der deutsche Name eines Risikomarkers — oder der Code selbst.
 *
 * ══ WARUM DIESE FUNKTION HIER STEHT UND NICHT IM LESEWEG ═══════════
 *
 * `[cmd]` **Sie stand in `wirkstoff-read.ts`, und der Build brach
 * ab** — A-30, beim ersten Versuch: `wirkstoff-tafel.tsx` ist
 * `'use client'` und importierte sie als **Wert**. Damit zog sie den
 * ganzen Leseweg ins Browserbuendel, und mit ihm
 * `createSessionClient` und `next/headers`.
 *
 * `[read]` **Der Typecheck sah es nicht** — er kennt keine
 * Buendelgrenzen. Erst der Build meldete es, mit der Importspur.
 * **Genau dafuer gibt es diese Datei:** hier liegt, was die Anzeige
 * als Wert braucht, ohne I/O daneben.
 *
 * `[cmd]` **`risk_flags` ist bei allen 498 ein Objekt mit denselben
 * neun Booleschen** (gemessen 2026-08-27). `[read]` **Ein unbekannter
 * Code faellt auf sich selbst zurueck**, nicht auf Leere — dieselbe
 * Regel wie bei `grundText`.
 */
export function risikoLabel(code: string): string {
  return RISIKO_LABEL[code] ?? code
}

const RISIKO_LABEL: Record<string, string> = {
  QT_risk: 'QT-Verlängerung',
  bleeding_risk: 'Blutungsrisiko',
  hepatotoxicity_risk: 'Leberschädigung',
  hyperkalemia_risk: 'Kaliumanstieg',
  hypoglycemia_risk: 'Unterzuckerung',
  myelosuppression_risk: 'Knochenmarkdämpfung',
  nephrotoxicity_risk: 'Nierenschädigung',
  seizure_risk: 'Krampfanfälle',
  serotonergic_risk: 'Serotonerges Syndrom',
}

/**
 * Die ATC-Codes aus der Spalte holen.
 *
 * ══ EINE FALLE, DIE DIE ANZEIGE SONST TRIFFT ═══════════════════════
 *
 * `[cmd]` **`atc_code` ist eine `text`-Spalte, die bei 419 von 497
 * Zeilen einen JSON-Array als Zeichenkette traegt** (gemessen
 * 2026-08-27): `["J05AF", "J05AR"]`. **78 tragen einen glatten Code**
 * (`A10BA02`).
 *
 * `[read]` **Ungefiltert stuende in der Kachel woertlich
 * `["B02AA"]`** — mit Klammern und Anfuehrungszeichen. Das ist
 * dieselbe Sorte Fehler wie G-191, wo ein Objekt als Zeichenkette in
 * der Dosiskachel landete: **technisch ein Wert, fuer den Leser
 * Unsinn.**
 */
export function atcCodes(roh: unknown): string[] {
  if (!da(roh)) return []
  const t = roh.trim()
  if (t.startsWith('[')) {
    try {
      const j: unknown = JSON.parse(t)
      if (Array.isArray(j)) {
        return j.map(e => String(e ?? '').trim()).filter(Boolean)
      }
    } catch {
      // `[read]` Kein stiller Rueckfall auf `[]`: was sich nicht
      // zerlegen laesst, wird als Rohtext gezeigt. Ein leeres Feld
      // waere hier wieder die Luege — es gibt einen Wert, er ist nur
      // nicht lesbar.
      return [t]
    }
  }
  return [t]
}
