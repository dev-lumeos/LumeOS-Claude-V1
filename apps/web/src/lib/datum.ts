// Datumsrechnung fuer die Oberflaeche. Eine Stelle, nicht drei.
//
// `[read]` Uebernommen aus `referenz/lumeos-2026/src/contexts/DateContext.tsx`:
//
//   1. `getLocalDateStr` baut die Zeichenkette aus `getFullYear`,
//      `getMonth` und `getDate` — LOKAL, nicht ueber `toISOString()`.
//      Der Unterschied ist real: oestlich von Greenwich liefert
//      `toISOString()` vor 01:00 Uhr noch den Vortag.
//
//   2. Beim Blaettern `new Date(datum + 'T12:00:00')` — MITTAG.
//      `[cmd]` Die bisherige Umsetzung nahm `T00:00:00`. An einem Tag
//      mit Zeitumstellung springt Mitternacht um eine Stunde; aus
//      00:00 wird 23:00 des Vortags, und `setDate(+1)` landet auf
//      demselben Tag statt auf dem naechsten. Mittags kann das nicht
//      passieren — zwoelf Stunden Abstand zu beiden Raendern.
//      Fuer Thailand folgenlos (keine Sommerzeit), fuer Europa nicht.
//
// NICHT uebernommen: der Vorgaenger prueft `isToday` ueber
// `toISOString()` und widerspricht damit seinem eigenen
// `getLocalDateStr`. Hier ist beides lokal.

/** Heute als YYYY-MM-DD in lokaler Zeit. */
export function heute(): string {
  return alsDatum(new Date())
}

/** Ein `Date` als YYYY-MM-DD in lokaler Zeit. */
export function alsDatum(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const t = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${t}`
}

/** Ein Datum um `tage` verschieben. Mittag als Anker (siehe Kopf). */
export function verschiebe(datum: string, tage: number): string {
  const d = new Date(`${datum}T12:00:00`)
  d.setDate(d.getDate() + tage)
  return alsDatum(d)
}

export const vortag = (datum: string) => verschiebe(datum, -1)
export const folgetag = (datum: string) => verschiebe(datum, 1)

export function istHeute(datum: string): boolean {
  return datum === heute()
}

/** Liegt das Datum nach heute? */
export function istZukunft(datum: string): boolean {
  return datum > heute()
}

/** Nur YYYY-MM-DD, sonst heute. Gegen getippte Adressen. */
export function datumOderHeute(roh: string | undefined): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(roh ?? '') ? roh! : heute()
}
