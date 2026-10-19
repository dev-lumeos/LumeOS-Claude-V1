// G-674/2 — die aufklappbare Zeile eines Datenpunkts (Entwurf Main.dc.html V57, Messziel-Details,
// Tabelle „Datenpunkte"): Kopf, Inhalt und der Link ins Modul. Rein: kein I/O, kein React.
//
// Ziele der Links — es gibt keine Route fuer EINE Trainingseinheit (`app/v2/training/page.tsx`
// ist die einzige Seite des Moduls). History zeigt die Einheiten schon, und die Seite laedt
// Einheiten, Uebungen und Saetze vollstaendig; die Auswahl `?einheit=` / `?woche=` braucht
// deshalb keinen weiteren Abruf. Messungen zeigen auf den Reiter Measurements mit `?am=`.
import { kalenderwoche, wochenStart } from './reiter'

export interface Punktdetail {
  kopf: string
  inhalt: string
  link: { text: string; href: string }
}

const WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
/** „Mo 06.10." */
export function tagDe(iso: string): string {
  return `${WT[new Date(`${iso}T12:00:00Z`).getUTCDay()]} ${iso.slice(8, 10)}.${iso.slice(5, 7)}.`
}
const de = (n: number, st = 1) => n.toLocaleString('de-DE', { minimumFractionDigits: st, maximumFractionDigits: st })
const kg = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 2 })

export const zurTraining = (p: { einheit?: string; woche?: string }) =>
  `/v2/training?tab=history&${p.einheit ? `einheit=${p.einheit}` : `woche=${p.woche}`}&von=goals`
export const zuMessungen = (datum: string) => `/v2/goals?tab=measure&am=${datum}`

export interface Satzzeile { weight_kg: number | null; reps: number | null; duration_seconds: number | null; distance_meters: number | null }

/** „140×1", sonst Wiederholungen, Dauer oder Strecke — was der Satz traegt. */
export function satzText(s: Satzzeile): string | null {
  if (s.weight_kg !== null && s.reps !== null) return `${kg(s.weight_kg)}×${s.reps}`
  if (s.duration_seconds !== null && s.distance_meters !== null) return `${kg(s.distance_meters)} m in ${s.duration_seconds} s`
  if (s.reps !== null) return `${s.reps} Wdh.`
  if (s.duration_seconds !== null) return `${s.duration_seconds} s`
  if (s.distance_meters !== null) return `${kg(s.distance_meters)} m`
  return null
}

/** Entwurf: „Einheit Mo 06.10. · Push/Legs · 62 min" / „Back Squat · 120×5 · 130×3 · 140×1". */
export function einheitDetail(
  e: { id: string; datum: string; name: string | null; minuten: number | null },
  uebung: { name: string; saetze: Satzzeile[] } | null,
): Punktdetail {
  const saetze = uebung ? uebung.saetze.map(satzText).filter((t): t is string => !!t) : []
  return {
    kopf: [`Einheit ${tagDe(e.datum)}`, e.name, e.minuten !== null ? `${e.minuten} min` : null].filter(Boolean).join(' · '),
    inhalt: uebung ? [uebung.name, ...saetze].join(' · ') : (e.name ?? 'Einheit ohne Namen'),
    link: { text: 'Einheit in Training öffnen', href: zurTraining({ einheit: e.id }) },
  }
}

const METHODE: Record<string, string> = { navy: 'Navy-Methode', manual: 'von Hand eingetragen' }

/** Entwurf: „Messung Do 02.10. · Navy-Methode" / „Hals 40,0 cm · Bauch 87,5 cm · Größe 182 cm · Gewicht 84,7 kg". */
export function messungDetail(
  m: { datum: string; weight_kg: number | null; body_fat_pct: number | null; bf_method: string | null; height_cm: number | null },
  umfang: { neck_cm: number | null; waist_cm: number | null } | null,
  kfa: boolean,
): Punktdetail {
  const teile = [
    kfa && umfang?.neck_cm != null ? `Hals ${de(umfang.neck_cm)} cm` : null,
    kfa && umfang?.waist_cm != null ? `Bauch ${de(umfang.waist_cm)} cm` : null,
    kfa && m.height_cm !== null ? `Größe ${kg(m.height_cm)} cm` : null,
    m.weight_kg !== null ? `Gewicht ${de(m.weight_kg)} kg` : null,
    !kfa && m.body_fat_pct !== null ? `Körperfett ${de(m.body_fat_pct)} %` : null,
  ].filter(Boolean)
  const methode = kfa && m.bf_method ? METHODE[m.bf_method] ?? m.bf_method : null
  return {
    kopf: [`Messung ${tagDe(m.datum)}`, methode].filter(Boolean).join(' · '),
    inhalt: teile.join(' · ') || 'keine weiteren Werte',
    link: { text: 'Messung in Measurements öffnen', href: zuMessungen(m.datum) },
  }
}

export const UMFANG_NAME: Record<string, string> = {
  neck_cm: 'Hals', shoulders_cm: 'Schultern', chest_cm: 'Brust', waist_cm: 'Bauch', hip_cm: 'Hüfte',
  upper_arm_right_cm: 'Oberarm re.', upper_arm_left_cm: 'Oberarm li.', forearm_right_cm: 'Unterarm re.',
  forearm_left_cm: 'Unterarm li.', thigh_right_cm: 'Oberschenkel re.', thigh_left_cm: 'Oberschenkel li.',
  calf_right_cm: 'Wade re.', calf_left_cm: 'Wade li.',
}

/** Eine Umfangsmessung: alle gemessenen Stellen des Tages. */
export function umfangDetail(datum: string, werte: Record<string, number | null>): Punktdetail {
  const teile = Object.keys(UMFANG_NAME).filter(k => werte[k] != null).map(k => `${UMFANG_NAME[k]} ${de(werte[k]!)} cm`)
  return {
    kopf: `Messung ${tagDe(datum)} · Umfänge`,
    inhalt: teile.join(' · ') || 'keine Stelle gemessen',
    link: { text: 'Messung in Measurements öffnen', href: zuMessungen(datum) },
  }
}

/** Entwurf (Zaehl-Gewohnheit): je Woche eine Zeile „KW 40 · 4 Einheiten" / „Mo Push/Legs · Di Pull". */
export function wochenZeilen(punkte: Array<{ tag: string; einheit?: string | null }>): Array<{ woche: string; kw: number; anzahl: number; detail: Punktdetail }> {
  const je = new Map<string, Array<{ tag: string; einheit?: string | null }>>()
  for (const p of punkte) je.set(wochenStart(p.tag), [...(je.get(wochenStart(p.tag)) ?? []), p])
  return Array.from(je.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([woche, ps]) => ({
    woche, kw: kalenderwoche(woche), anzahl: ps.length,
    detail: {
      kopf: `KW ${kalenderwoche(woche)} · ${ps.length} ${ps.length === 1 ? 'Einheit' : 'Einheiten'}`,
      inhalt: ps.slice().sort((a, b) => a.tag.localeCompare(b.tag)).map(p => `${tagDe(p.tag).slice(0, 2)} ${p.einheit ?? 'Einheit'}`).join(' · '),
      link: { text: 'Woche in Training öffnen', href: zurTraining({ woche }) },
    },
  }))
}

/**
 * G-667/G-678: Kraftkurve — je Zeile aus `goals.measurement_points` genau ein Punkt (eine Einheit, eine Messung),
 * nach Tag sortiert. Hier wird nichts zusammengefasst und nichts in Saetze zerlegt; zwei Einheiten am selben Tag
 * sind zwei Punkte.
 */
export function punkteAusKette(zeilen: Array<Record<string, unknown>>) {
  return zeilen
    .map(r => ({ tag: String(r.measured_on), wert: Number(r.value), quelle: String(r.source_name), id: String(r.source_id ?? ''), einheit: null as string | null, detail: null as Punktdetail | null }))
    .sort((a, b) => a.tag.localeCompare(b.tag))
}

/**
 * G-678 (Nachtrag 19.10.): die graue Planlinie ist der Sollweg seit Zielbeginn — `planlinien_am.historisch_kg`.
 * `vorwaerts_kg` (ab heutigem Trend) ist keine Planlinie.
 */
export function sollwegKg(antwort: Record<string, unknown> | null): number | null {
  const v = antwort?.historisch_kg
  return v === null || v === undefined ? null : Number(v)
}
