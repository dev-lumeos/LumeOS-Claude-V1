// G-628 — „Ziel setzen", Weg A: drei Groessen, eine Rechnung. **Rein, kein I/O.**
//
// `[cmd]` **Dossier `docs/spezifikation/goals-ziel-setzen/dossier.html`,
// Kap. 8.2 (Tom 08.10., Fragen 5 und 10):** Zielgewicht, Zieldatum und
// Programm haengen zusammen. Der Startwert ist gemessen; der Nutzer legt
// fest, was ihm wichtig ist, das System rechnet den Rest. Die Tabelle:
//
//     legt fest            rechnet                          passt nichts
//     Zielgewicht          Standard → Datum                 –
//     Zieldatum            Standard → erreichbares Ziel     –
//     Programm             mit Maximaldauer: Datum + Ziel;  –
//                          ohne: fragt nach Ziel oder Datum
//     Ziel + Datum         noetiges Tempo → mildestes       „Kein Programm schafft
//                          freies Programm                  das bis zu diesem Datum"
//     Programm + Ziel      Datum                            Dauer > Maximaldauer → Planer
//     Programm + Datum     Zielgewicht                      –
//
// `[read]` **Bei Ziel + Datum gilt das NOETIGE Tempo** (Dossier: „Moderate
// Cut · noetig 0,68 %/Woche … ≈ −0,58 kg/Woche"), das Programm ist der
// Rahmen, der es zulaesst. Der Entwurf rechnete hier mit dem Programmtempo
// — bei Abweichung gilt das Dossier (README).
//
// `[read]` **Die Grenzen nach Grad (Tempo, Dauer, BMI, kcal) stehen hier
// NICHT** — sie kommen mit Teil 2 aus der Pruefunktion (G-626), keine Regel
// im Code. Hier nur: Programm gesperrt nach `min_erfahrung` (G-610) und was
// rechnerisch unmoeglich ist (falsche Richtung, kein Programm).
import { kcalAusRate } from './zielrate-einheit'
import { minusWochen } from './anker'
import { gesperrt } from './zielwahl'
import type { Strategie } from './strategie-read'

export type Groesse = 'ziel' | 'datum' | 'programm'
export type Quelle = 'festgelegt' | 'berechnet'

export type Zieleingabe = {
  /** Die Richtung, ihre Varianten (`varianten()` aus `zielwahl.ts`). */
  varianten: Strategie[]
  startKg: number
  heute: string
  /** Was festgelegt ist — hoechstens zwei, die UI haelt das ein. */
  fest: Groesse[]
  ziel: number | null
  datum: string | null
  programm: string | null
  grad: string | null
  /** Angepasster, sonst gerechneter TDEE; `null` = keine kcal. */
  tdee: number | null
}

export type Programmlage = {
  code: string
  status: 'gewaehlt' | 'passt' | 'zu langsam' | 'zu lange' | 'gesperrt'
  text: string
}

export type Zielergebnis = {
  programm: Strategie | null
  warum: string
  ziel: number | null
  datum: string | null
  wochen: number | null
  /** Vorzeichenbehaftet, % Koerpergewicht je Woche. */
  tempoPct: number | null
  kgProWoche: number | null
  kcal: number | null
  proteinG: number | null
  noetigPct: number | null
  quelle: Record<Groesse, Quelle>
  fehler: string | null
  /** Kein Programm schafft es / Dauer ueber Maximum — „Zum Planer". */
  planer: boolean
  hinweis: string | null
  lagen: Programmlage[]
  /** Halten: Wohlfuehlbereich ±1 kg um den Start. */
  halten: { von: number; bis: number } | null
}

const EPS = 1e-9
const rate = (s: Strategie) => Math.abs(s.weight_change_target_percent ?? 0)

/** Ganze Tage → Wochen (auf 0,1 genau ist Sache der Anzeige). */
export function wochenBis(heute: string, datum: string): number {
  return (Date.parse(`${datum}T00:00:00Z`) - Date.parse(`${heute}T00:00:00Z`)) / 86400000 / 7
}

/**
 * Der Startwert ist GEMESSEN (Dossier 8.2, A1): die juengste Messung mit
 * Gewicht aus den letzten 14 Tagen bis heute — sonst `null`, und A1 fragt
 * nach „Gewicht heute".
 */
export function letzteGewichtsmessung<M extends { measurement_date: string; weight_kg: number | null }>(
  messungen: M[], heute: string,
): M | null {
  return messungen
    .filter(m => m.weight_kg !== null && m.measurement_date <= heute
      && wochenBis(m.measurement_date, heute) * 7 <= 14)
    .sort((a, b) => b.measurement_date.localeCompare(a.measurement_date))[0] ?? null
}

/** Heute plus Wochen, auf ganze Tage gerundet. */
export function datumNach(heute: string, wochen: number): string {
  return minusWochen(heute, -Math.round(wochen * 7) / 7) ?? heute
}

/** Die Richtung aus dem Vorzeichen ihres Standards: −1 ab, +1 auf, 0 halten. */
export function richtungsVorzeichen(varianten: Strategie[]): -1 | 0 | 1 {
  const r = varianten.find(v => v.standard)?.weight_change_target_percent ?? 0
  return r < 0 ? -1 : r > 0 ? 1 : 0
}

export function rechneZiel(e: Zieleingabe): Zielergebnis {
  const vz = richtungsVorzeichen(e.varianten)
  const standard = e.varianten.find(v => v.standard) ?? e.varianten[0] ?? null
  const hatZ = e.fest.includes('ziel') && e.ziel !== null && Number.isFinite(e.ziel)
  const hatD = e.fest.includes('datum') && !!e.datum && wochenBis(e.heute, e.datum) > 0
  const hatP = e.fest.includes('programm') && !!e.programm
  const wD = hatD ? wochenBis(e.heute, e.datum!) : null
  const delta = hatZ ? Math.abs(e.ziel! - e.startKg) : null
  const quelle: Record<Groesse, Quelle> = {
    ziel: hatZ ? 'festgelegt' : 'berechnet',
    datum: hatD ? 'festgelegt' : 'berechnet',
    programm: hatP ? 'festgelegt' : 'berechnet',
  }
  const leer: Zielergebnis = {
    programm: null, warum: '', ziel: null, datum: null, wochen: null, tempoPct: null,
    kgProWoche: null, kcal: null, proteinG: null, noetigPct: null, quelle,
    fehler: null, planer: false, hinweis: null, lagen: [], halten: null,
  }

  // ── Halten: kein Zielgewicht, kein Tempo ──────────────────────────
  if (vz === 0) {
    const p = (hatP ? e.varianten.find(v => v.code === e.programm) : null) ?? standard
    return {
      ...leer, programm: p, warum: hatP ? 'von dir gewählt' : 'Standard', tempoPct: 0, kgProWoche: 0,
      kcal: e.tdee, proteinG: p ? protein(p, e.startKg) : null,
      halten: { von: runde1(e.startKg - 1), bis: runde1(e.startKg + 1) },
      lagen: lagen(e, p, null, null, null),
    }
  }

  // `[read]` **Logikfehler, keine Gesundheitsfrage** (Dossier 8.2): ein
  // Zielgewicht in der falschen Richtung laesst sich mit keinem Tempo erreichen.
  if (hatZ && Math.sign(e.ziel! - e.startKg) !== vz) {
    return { ...leer, fehler: `Das Zielgewicht liegt in der falschen Richtung — Start ${fmt(e.startKg)} kg.`,
      lagen: lagen(e, null, null, null, null) }
  }

  let programm: Strategie | null = null
  let warum = ''
  let tempo: number | null = null
  let wochen: number | null = null
  let noetig: number | null = null
  let fehler: string | null = null
  let planer = false
  let hinweis: string | null = null

  if (hatZ && hatD && !hatP) {
    noetig = delta! / e.startKg * 100 / wD!
    const passend = e.varianten.filter(v => rate(v) >= noetig! - EPS
      && (v.max_duration_weeks === null || v.max_duration_weeks >= wD! - EPS))
    const frei = passend.filter(v => !gesperrt(v, e.grad)).sort((a, b) => rate(a) - rate(b))
    if (frei.length) {
      programm = frei[0]!
      warum = 'mildestes Programm, das es bis zum Datum schafft'
      tempo = noetig
      wochen = wD
    } else if (passend.length) {
      const m = [...passend].sort((a, b) => rate(a) - rate(b))[0]!
      fehler = `Dafür braucht es ${m.label} (ab ${m.min_erfahrung}). Datum verschieben oder Ziel ändern.`
    } else {
      fehler = `Kein Programm schafft das bis zu diesem Datum (nötig ${fmt(noetig, 2)} %/Woche).`
      planer = true
    }
  } else {
    programm = (hatP ? e.varianten.find(v => v.code === e.programm) : null) ?? standard
    warum = hatP ? 'von dir gewählt' : 'Standard'
    tempo = programm ? rate(programm) : null
    const kgW = tempo ? e.startKg * tempo / 100 : 0
    if (programm && kgW > 0) {
      if (hatZ) wochen = delta! / kgW
      else if (hatD) wochen = wD
      else if (hatP && programm.max_duration_weeks !== null) wochen = programm.max_duration_weeks
      else if (hatP) fehler = `Für ${programm.label} fehlt noch ein Zielgewicht oder ein Zieldatum.`
    }
    const max = programm?.max_duration_weeks ?? null
    if (hatP && hatZ && max !== null && wochen !== null && wochen > max + EPS) {
      hinweis = `${programm!.label} ist auf ${max} Wochen ausgelegt, gebraucht werden ${fmt(wochen, 1)}.`
      planer = true
    }
  }

  const kgProWoche = tempo !== null ? vz * e.startKg * tempo / 100 : null
  const ziel = hatZ ? e.ziel : (wochen !== null && kgProWoche !== null ? runde1(e.startKg + kgProWoche * wochen) : null)
  const datum = hatD ? e.datum : (wochen !== null ? datumNach(e.heute, wochen) : null)
  const tempoPct = tempo !== null ? vz * tempo : null
  return {
    ...leer, programm, warum, ziel, datum, wochen, tempoPct, kgProWoche, noetigPct: noetig,
    kcal: tageskcal(e.tdee, tempoPct, e.startKg),
    proteinG: programm ? protein(programm, e.startKg) : null,
    fehler, planer, hinweis,
    lagen: lagen(e, programm, noetig, delta, wD),
  }
}

/**
 * Das Tempo, wie es gespeichert wird: `numeric(5,3)`, **dem Betrag nach
 * AUFgerundet.** `[cmd]` **Gemessen 2026-10-08 an `ziel_grenzen_pruefen`:**
 * ein abgerundetes Tempo liegt knapp unter dem noetigen, und die Funktion
 * meldet `vorgehen_zu_langsam` (Toleranz 0,0001). Aufgerundet erreicht das
 * Tempo das Ziel immer bis zum Datum.
 */
export function tempoGespeichert(t: number): number {
  // 1e-6 faengt Gleitkomma-Rauschen (553.0000001), weit unter der Toleranz 0,0001.
  return Math.sign(t) * Math.ceil(Math.abs(t) * 1000 - 1e-6) / 1000
}

/**
 * Das Tagesziel: TDEE plus die Tagesdifferenz aus E-1 (`kcalAusRate`,
 * 7700 kcal/kg) — **dieselbe Stelle wie im Phasen-Editor (G-565).**
 * Auf 10 kcal gerundet wie im Entwurf.
 */
export function tageskcal(tdee: number | null, tempoPct: number | null, kg: number): number | null {
  if (tdee === null) return null
  const d = kcalAusRate(tempoPct ?? 0, kg)
  return d === null ? null : Math.round((tdee + d) / 10) * 10
}

/** Protein aus dem Katalog, auf 5 g gerundet. `[read]` Wird nie gekuerzt (Dossier 8.2). */
export function protein(s: Strategie, kg: number): number | null {
  return s.protein_per_kg === null ? null : Math.round(s.protein_per_kg * kg / 5) * 5
}

function lagen(e: Zieleingabe, gewaehlt: Strategie | null, noetig: number | null,
  delta: number | null, wD: number | null): Programmlage[] {
  return e.varianten.map(v => {
    const w = delta !== null && rate(v) > 0 ? delta / (e.startKg * rate(v) / 100) : wD
    if (gesperrt(v, e.grad)) return { code: v.code, status: 'gesperrt', text: `ab ${v.min_erfahrung}` }
    if (gewaehlt?.code === v.code) return { code: v.code, status: 'gewaehlt', text: 'gewählt' }
    if (noetig !== null && rate(v) < noetig - EPS) return { code: v.code, status: 'zu langsam', text: 'zu langsam für dein Datum' }
    if (v.max_duration_weeks !== null && w !== null && w > v.max_duration_weeks + EPS) {
      return { code: v.code, status: 'zu lange', text: `zu lange (max ${v.max_duration_weeks} Wo)` }
    }
    return { code: v.code, status: 'passt', text: 'passt' }
  })
}

const runde1 = (n: number) => Math.round(n * 10) / 10
/** Deutsche Zahl: Komma, Tausenderpunkt. */
export function fmt(n: number, stellen = 1): string {
  return n.toLocaleString('de-DE', { minimumFractionDigits: stellen, maximumFractionDigits: stellen })
}
