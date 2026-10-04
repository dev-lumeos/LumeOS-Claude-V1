// Der Kalendertag — EINE Definition fuer alle Apps (G-600).
//
// ══ DER BEFUND ═════════════════════════════════════════════════════
//
// `[cmd]` **32 Stellen bildeten den Tag mit
// `new Date().toISOString().slice(0, 10)`** (gemessen 2026-10-04) —
// das ist UTC. **In Bangkok (UTC+7) ist das von 00:00 bis 07:00 der
// Vortag:** eine Einnahme um 06:30 landete auf gestern. Daneben gab es
// sechs eigene, richtige Helfer (`heuteIso`, `heuteISO`, `heute`) —
// **zwei Definitionen von „heute" im selben Produkt.**
//
// ══ ZWEI FUNKTIONEN, ZWEI FRAGEN ═══════════════════════════════════
//
//     tagIso(d)      Welcher Kalendertag ist dieser ZEITPUNKT hier?
//                    Ortszeit — fuer „heute", „jetzt", Formulare.
//     utcTagIso(d)   Rechnung auf DATUMSZEICHENKETTEN:
//                    `new Date('…T00:00:00Z')` + `setUTCDate` —
//                    zeitzonenfest, weil Hin- und Rueckweg UTC sind.
//
// `[read]` **Die zweite gibt es, damit die erste nicht missbraucht
// wird:** wer auf einem UTC-Mitternachtsdatum `tagIso` ruft, bekommt
// westlich von Greenwich den Vortag. **Der Name sagt, welche Frage.**
//
// `[cmd]` **ESLint verbietet `.toISOString().slice(0, 10)`** in den Apps
// (`.eslintrc.json`, G-600) — diese Datei ist die eine Stelle.

/** `YYYY-MM-DD` des Zeitpunkts `d` in ORTSZEIT. Ohne Argument: heute. */
export function tagIso(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const t = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${t}`
}

/**
 * `YYYY-MM-DD` eines UTC-Zeitpunkts — **nur** fuer Rechnung auf
 * Datumszeichenketten (`new Date(\`${iso}T00:00:00Z\`)` + `setUTCDate`).
 */
export function utcTagIso(d: Date): string {
  // eslint-disable-next-line no-restricted-syntax -- die eine erlaubte Stelle (G-600)
  return d.toISOString().slice(0, 10)
}
