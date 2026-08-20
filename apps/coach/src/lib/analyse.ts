// Deterministische Check-in-Vorauswertung — reine Funktion, kein LLM,
// keine Persistenz (153: die Analyse rechnet die Anwendung beim Lesen;
// der Vorgaenger persistierte in Spalten, die es nie gab, und der
// Fehler verschwand im catch — F-06 5.1).
//
// KEINE URTEILE: jeder Befund ist "Wert gegen Schwelle", als Satz mit
// Zahl. Keine Ampelfarben, kein Gesamtstatus ueber die Person —
// Dringlichkeitsstufen sind T7 (offen).

export type CheckinWerte = {
  gewicht_kg?: number
  energie?: number
  schlaf?: number
}

export type Befund = {
  feld: string
  text: string
}

const SCHWELLE_GEWICHT_KG = 1.5
const SCHWELLE_ENERGIE = 3
const SCHWELLE_SCHLAF = 4

function zahl(wert: unknown): number | undefined {
  return typeof wert === 'number' && Number.isFinite(wert) ? wert : undefined
}

/** Befunde eines eingereichten Check-ins gegen feste Schwellen.
 *  `vorherGewicht` ist das Gewicht des letzten reviewten Check-ins. */
export function checkinBefunde(
  clientData: Record<string, unknown>,
  vorherGewicht?: number,
): Befund[] {
  const raus: Befund[] = []
  const gewicht = zahl(clientData['gewicht_kg'])
  const energie = zahl(clientData['energie'])
  const schlaf = zahl(clientData['schlaf'])

  if (gewicht !== undefined && vorherGewicht !== undefined) {
    const delta = Math.round((gewicht - vorherGewicht) * 10) / 10
    if (Math.abs(delta) > SCHWELLE_GEWICHT_KG) {
      raus.push({
        feld: 'gewicht_kg',
        text: `Gewicht ${delta > 0 ? '+' : ''}${delta} kg seit dem letzten Review — ueber der ${SCHWELLE_GEWICHT_KG}-kg-Schwelle`,
      })
    }
  }

  if (energie !== undefined && energie <= SCHWELLE_ENERGIE) {
    raus.push({
      feld: 'energie',
      text: `Energie ${energie} von 10 — auf oder unter der Schwelle ${SCHWELLE_ENERGIE}`,
    })
  }

  if (schlaf !== undefined && schlaf <= SCHWELLE_SCHLAF) {
    raus.push({
      feld: 'schlaf',
      text: `Schlaf ${schlaf} von 10 — auf oder unter der Schwelle ${SCHWELLE_SCHLAF}`,
    })
  }

  return raus
}
