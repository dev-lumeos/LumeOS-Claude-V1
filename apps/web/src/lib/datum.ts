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

// ══ G-487: nach F5 auf HEUTE ════════════════════════════════════════
//
// **Tom, 2026-09-21:** *„der daychooser war auf 18.9. und nicht heute,
// sprich das ist eine boesartige falle"* — **und die Regel:** *„der
// tageswechsler muss bloss auf heute gestellt werden, wenn ein
// refresh/server restart/F5/ctrl F5 gemacht wird"*.
//
// `[cmd]` **GEMESSEN am 2026-09-21:** `?datum=2026-09-18` + F5 →
// Adresse und Anzeige blieben auf *,,Fr., 18. Sept. 2026"*.
// **Das Datum lebt nur in der Adresse** — es wird nirgends
// gespeichert, und F5 laedt dieselbe Adresse erneut.
//
// ══ WARUM NICHT EINFACH „BEI reload AUF HEUTE" ══════════════════════
//
// `[cmd]` **Gemessen, was der Browser meldet:**
//
//     frische Adresse (goto)      navigate
//     F5                          reload
//     Tageswechsel (router.push)  reload   <- BLEIBT
//     danach frische Adresse      navigate
//
// `[read]` **`reload` bleibt ueber `router.push` hinweg stehen** —
// eine Regel, die bei jedem Rendern darauf schaut, sprAenge nach dem
// ersten Blaettern sofort zurueck auf heute. **Der Nutzer koennte
// keinen anderen Tag mehr ansehen.**
//
// `[read]` **Deshalb: EINMAL je Dokument.** `[cmd]` **Ein Merker im
// `sessionStorage` taugt dafuer NICHT** — gemessen: er ueberlebt
// das Neuladen und stand schon vor dem F5 auf `1`. **Der Merker
// ist ein Modulzustand** (`heute-nach-f5.ts`).


/**
 * Soll der Tageswechsler auf heute springen?
 *
 * @param navigationstyp  `performance.getEntriesByType('navigation')[0].type`
 * @param schonGeprueft   stand der Merker schon?
 * @param datum           der Tag in der Adresse
 *
 * `[read]` **Reine Regel, ohne Browser** — pruefbar ohne Server.
 */
export function springtAufHeute(
  navigationstyp: string | null,
  schonGeprueft: boolean,
  datum: string,
): boolean {
  // `[read]` **Schon entschieden** — sonst faengt die Regel jeden
  // Tageswechsel ab.
  if (schonGeprueft) return false
  // `[cmd]` **NUR `reload`** — F5, Strg-F5, Serverneustart.
  //
  // `[read]` **`navigate` waere zu breit:** ein geteilter Link
  // `?datum=2026-09-18` ist eine ABSICHT, keine alte Sitzung. **Wer
  // ihn oeffnet, will genau diesen Tag sehen** — ihn auf heute
  // umzuleiten waere dieselbe Falle, nur andersherum.
  //
  // `[read]` **Toms Begruendung traegt das:** *,,wenn ein refresh/
  // server restart/F5/ctrl F5 gemacht wird"* — **er nennt Neuladen,
  // nicht Aufrufen.**
  if (navigationstyp !== 'reload') return false
  // `[read]` **Steht schon heute da, ist nichts zu tun** — ein
  // Sprung auf denselben Tag waere eine unnoetige Navigation.
  return !istHeute(datum)
}
