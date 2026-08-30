// ════════════════════════════════════════════════════════════════════
// DER NUTRITION-TAGESSCORE — C-49 / C-324, GEMESSEN STATT GEBAUT
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg — A-30.
//
// `[read]` **Diese Datei baut den Score NICHT.** Sie haelt fest, was am
// 2026-08-30 gemessen wurde, **damit der naechste Auftrag nicht
// dieselbe Messung wiederholt** — und damit niemand die Formel baut,
// bevor die Datengrundlage traegt.
//
// ══ E-25 GILT UNVERAENDERT ══════════════════════════════════════════
//
// **NRF9.3 in der Originalfassung**, Deckelung je Naehrstoff bei 100
// Prozent, Gesamtzucker statt *added sugars*, **und ein Tag mit
// Fehlzaehlern liefert `incomplete` statt einer kuenstlich niedrigen
// Zahl.** `[read]` **Keine Sportler-Variante** — sie waere unsere
// Formel, nicht die belegte.
//
// ══ WARUM ER TROTZDEM NICHT BAUBAR IST ══════════════════════════════
//
// `[cmd]` **Gemessen fuer `dev@lumeos.app`, 30 Tage (2026-08-01 bis
// -08-30), gegen die laufende Datenbank:**
//
//     Naehrstoff   vollstaendige Tage   fehlende Posten
//     PROT625              30 / 30                    0
//     CA, FE, MG, K        30 / 30                    0
//     FASAT, SUGAR         30 / 30                    0
//     NACL                 30 / 30                    0
//     VITE                 25 / 30                    5
//     FIBT                 24 / 30                    6
//     NA                   23 / 30                    7
//     VITC                  0 / 30                   98
//     Vitamin A (IE)        0 / 30    je 2 von 3 Komponenten
//
// `[read]` **Zwei der neun positiven Naehrstoffe sind an KEINEM Tag
// vollstaendig.** Ohne sie ist NRF9.3 nicht rechenbar, und E-25
// verbietet ausdruecklich, die Luecke als Mangel auszugeben.
//
// ══ DIE URSACHE IST EINE DATENSEMANTIK, KEIN BAUFEHLER ══════════════
//
// `[cmd]` **`daily_nutrient_summary_long` setzt `value_complete` nur,
// wenn JEDER Posten des Tages den Wert traegt:**
//
//     value_complete = item_count > 0 AND item_count = value_count
//
// `[cmd]` **Und der BLS verzeichnet ein Nichtvorkommen als FEHLEND,
// nicht als 0.** Am 2026-08-29 fehlte `VITC` bei genau vier Posten:
// **Ei, Kabeljau, weisser Reis, Ziegenfleisch** — tierische Produkte
// und geschaelter Reis, die tatsaechlich kein Vitamin C enthalten.
//
// `[cmd]` **Das ist systematisch, nicht zufaellig.** Von 7.140
// Lebensmitteln fuehren
//
//     RETOL       7.092  (99,3 %)
//     VITC        6.720  (94,1 %)   420 ohne Zeile
//     CARTB       6.325  (88,6 %)
//     CAROTPAXB   5.093  (71,3 %)
//
// `[cmd]` **Die 420 ohne `VITC` sind erwartbar:** 126 Lamm/Schaf, 64
// rohe Koerner, 32 Schweinefleisch, 26 magerer Seefisch, 15
// Pflanzenoele. `[read]` **Kein Datenfehler — eine Luecke im
// Erfassungsmodell.**
//
// `[cmd]` **Bei Vitamin A dasselbe, nur frueher:** `vitamin_a_iu_daily`
// braucht `RETOL` + `CARTB` + `CAROTPAXB`. **`RETOL` allein ist an
// allen 30 Tagen vollstaendig; mit `CARTB` sind es 0.** Beta-Carotin
// allein bricht jeden Tag.
//
// ══ WAS DAS FUER C-49 HEISST ════════════════════════════════════════
//
// `[read]` **C-324 bleibt blockiert, und der Blocker ist ein anderer
// als angenommen.** Der Nachtrag zu E-25 nannte zwei: die
// Vitamin-A-Einheit (C-342, erledigt — die Faktoren stehen) und die
// Vitamin-C-Luecke (C-343, als „keine" geschlossen).
//
// `[cmd]` **C-343 ist zu frueh geschlossen worden.** Die Luecke ist
// da und ist die groesste von allen: **0 von 30 Tagen, 98 fehlende
// Posten.**
//
// `[read]` **Was fehlt, ist eine Entscheidung, keine Rechnung:** darf
// ein fehlender Naehrwert bei einem Lebensmittel, das ihn
// erwartungsgemaess nicht enthaelt, als 0 zaehlen? **Das ist eine
// fachliche Frage** — sie betrifft jede Deckungsrechnung, nicht nur
// den Score.

/** Die zwoelf Naehrstoffe der Formel (E-25). */
export type NrfNaehrstoff =
  | 'PROT625' | 'FIBT' | 'VITA_IU' | 'VITC' | 'VITE'
  | 'CA' | 'FE' | 'MG' | 'K'
  | 'FASAT' | 'SUGAR' | 'NA'

/**
 * Wie viele der 30 gemessenen Tage vollstaendig waren.
 *
 * `[cmd]` Gemessen am 2026-08-30 fuer `dev@lumeos.app`.
 * `[read]` **Die Zahl steht hier, nicht die Rechnung** — wer den Score
 * baut, prueft zuerst, ob sich diese Lage geaendert hat.
 */
export const VOLLSTAENDIGE_TAGE: Record<NrfNaehrstoff, number> = {
  PROT625: 30, CA: 30, FE: 30, MG: 30, K: 30,
  FASAT: 30, SUGAR: 30, NA: 23,
  VITE: 25, FIBT: 24,
  VITC: 0,
  VITA_IU: 0,
}

export const GEMESSEN_AM = '2026-08-30'
export const GEMESSENE_TAGE = 30

/** Die Naehrstoffe, die den Bau heute verhindern. */
export const BLOCKER: NrfNaehrstoff[] = ['VITC', 'VITA_IU']

/**
 * Ist der Score mit der heutigen Datenlage baubar?
 *
 * `[read]` **Nein, und zwar nicht knapp:** zwei von neun positiven
 * Naehrstoffen sind an keinem einzigen Tag vollstaendig.
 */
export function istBaubar(lage: Record<NrfNaehrstoff, number> = VOLLSTAENDIGE_TAGE): boolean {
  return Object.values(lage).every(t => t > 0)
}

/**
 * Die offene Frage, die vor dem Bau entschieden werden muss.
 *
 * `[read]` **Sie ist fachlich, nicht technisch** — und sie betrifft
 * mehr als den Score: jede Deckungsrechnung haengt daran.
 */
export const OFFENE_FRAGE =
  'Darf ein fehlender Nährwert als 0 zählen, wenn das Lebensmittel ihn '
  + 'erwartungsgemäß nicht enthält? Der BLS verzeichnet ein '
  + 'Nichtvorkommen als fehlend, nicht als 0 — deshalb macht ein '
  + 'einziges Stück Fleisch den Vitamin-C-Tag unvollständig. Ohne diese '
  + 'Entscheidung ist NRF9.3 an 0 von 30 Tagen rechenbar.'
