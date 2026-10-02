// Die Pruefung der Umfangseingabe — G-577. **Server-frei.**
//
// ══ DER BEFUND ═════════════════════════════════════════════════════
//
// `[cmd]` **`goals.body_circumference_write` hatte null Aufrufer** in
// `apps/` und `packages/` — gezaehlt bei der Abnahme von G-535.
// **Die Funktion ist gebaut, geprueft, seit G-535 auf `auth.uid()`
// umgestellt — und ein Nutzer konnte keinen Umfang eintragen.**
//
// `[read]` **Die Gegenseite stand die ganze Zeit:** `KoerperUmfaenge`
// (`tab-koerper.tsx:167`) liest `body_circumferences` seit GO-16.
// **Es fehlte der Weg hinein, nicht der Weg heraus.**
//
// ══ DIE GRENZEN KOMMEN AUS DEM CHECK, NICHT AUS DEM KOPF ═══════════
//
// `[cmd]` **`body_circumferences_positive_ck`, gelesen am
// 2026-10-01 aus `pg_constraint`** — je Stelle ein eigenes Paar:
//
//     neck          10- 80      waist         40-220
//     shoulders     40-220      hip           40-220
//     chest         40-220      thigh  l/r    20-140
//     upper_arm l/r 10- 90      calf   l/r    10- 90
//     forearm   l/r 10- 70
//
// `[read]` **Diese Pruefung ersetzt den CHECK nicht, sie kommt ihm
// zuvor** — dieselbe Linie wie G-122/G-211: ein Constraint-Fehler ist
// eine englische Postgres-Meldung, ein Mensch braucht einen Satz am
// Feld.

/** Eine Messstelle, wie die Tabelle sie fuehrt. */
export type Umfangsfeld =
  | 'neck_cm' | 'shoulders_cm' | 'chest_cm'
  | 'upper_arm_left_cm' | 'upper_arm_right_cm'
  | 'forearm_left_cm' | 'forearm_right_cm'
  | 'waist_cm' | 'hip_cm'
  | 'thigh_left_cm' | 'thigh_right_cm'
  | 'calf_left_cm' | 'calf_right_cm'

/**
 * Die dreizehn Stellen mit ihren Grenzen.
 *
 * `[cmd]` **Reihenfolge und Beschriftung wie in der Leseansicht**
 * (`tab-koerper.tsx:40`, `UMFAENGE`) — **damit Eingabe und Tabelle
 * dieselbe Folge haben.** `[read]` **Zwei Listen, die dasselbe
 * benennen, driften** — hier ist die Leseansicht die Vorlage, weil
 * sie aelter ist.
 *
 * `[cmd]` **Die Attrappe fuehrt ZWOELF Stellen mit EINEM Unterarm**
 * (`daten.ts:150`), die Tabelle **dreizehn mit zweien.** Die
 * Eingabe folgt der Tabelle.
 */
export const UMFANGSSTELLEN: Array<{
  feld: Umfangsfeld; label: string; min: number; max: number
}> = [
  { feld: 'neck_cm', label: 'Neck', min: 10, max: 80 },
  { feld: 'shoulders_cm', label: 'Shoulders', min: 40, max: 220 },
  { feld: 'chest_cm', label: 'Chest', min: 40, max: 220 },
  { feld: 'waist_cm', label: 'Waist (navel)', min: 40, max: 220 },
  { feld: 'hip_cm', label: 'Hip', min: 40, max: 220 },
  { feld: 'upper_arm_right_cm', label: 'Arm · right', min: 10, max: 90 },
  { feld: 'upper_arm_left_cm', label: 'Arm · left', min: 10, max: 90 },
  { feld: 'forearm_right_cm', label: 'Forearm · right', min: 10, max: 70 },
  { feld: 'forearm_left_cm', label: 'Forearm · left', min: 10, max: 70 },
  { feld: 'thigh_right_cm', label: 'Thigh · right', min: 20, max: 140 },
  { feld: 'thigh_left_cm', label: 'Thigh · left', min: 20, max: 140 },
  { feld: 'calf_right_cm', label: 'Calf · right', min: 10, max: 90 },
  { feld: 'calf_left_cm', label: 'Calf · left', min: 10, max: 90 },
]

/**
 * Die Quellen, die die Datenbank zulaesst.
 *
 * `[cmd]` **Aus `body_circumferences_source_ck` gelesen**, nicht
 * erfunden — vier Werte, nicht die zehn aus `BF_METHODEN` (das ist
 * ein anderer CHECK, an einer anderen Tabelle).
 */
export const UMFANG_QUELLEN = ['manual', 'device', 'import', 'admin'] as const

/** Was das Formular haelt — alles als Text, wie bei G-122. */
export type UmfangEingabe = {
  measurement_date: string
  measurement_time: string
  measurement_source: string
  notes: string
  /** Je Stelle ein Rohtext; leer heisst „nicht gemessen". */
  werte: Partial<Record<Umfangsfeld, string>>
}

export const LEERE_UMFANGSEINGABE: UmfangEingabe = {
  measurement_date: '', measurement_time: '',
  measurement_source: 'manual', notes: '', werte: {},
}

export type Feldfehler = { feld: string; text: string }

/** Rohtext zu Zahl — Komma wie Punkt, leer bleibt `null`. */
export function zahl(roh: string | undefined): number | null {
  const t = String(roh ?? '').trim().replace(',', '.')
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : NaN
}

/**
 * Die Eingabe pruefen — dieselben Grenzen, die die Datenbank erzwingt.
 *
 * `[cmd]` **Drei Regeln aus drei Constraints:**
 *
 *   1  `measurement_date`/`_time` sind `NOT NULL` **und bilden mit
 *      `user_id` den Eindeutigkeitsschluessel**
 *      (`body_circumferences_user_date_time_uq`). **Ohne Uhrzeit
 *      kaeme ein Konflikt statt einer Meldung.**
 *   2  `body_circumferences_at_least_one_ck`: **mindestens eine
 *      Stelle muss einen Wert tragen.** Ein Satz aus dreizehn
 *      Leerfeldern ist kein Satz.
 *   3  `body_circumferences_positive_ck`: je Stelle ihr Bereich.
 */
export function pruefeUmfang(e: UmfangEingabe): Feldfehler[] {
  const fehler: Feldfehler[] = []
  if (!e.measurement_date.trim()) {
    fehler.push({ feld: 'measurement_date', text: 'Wann wurde gemessen?' })
  }
  if (!e.measurement_time.trim()) {
    // `[cmd]` **Teil des Eindeutigkeitsschluessels** — und damit auch
    // die Antwort auf A4: **zwei Messungen am selben Tag sind
    // erlaubt**, solange die Uhrzeit sich unterscheidet.
    fehler.push({ feld: 'measurement_time', text: 'Um welche Uhrzeit?' })
  }
  if (e.measurement_source.trim()
      && !(UMFANG_QUELLEN as readonly string[]).includes(e.measurement_source.trim())) {
    fehler.push({ feld: 'measurement_source', text: 'Unbekannte Quelle.' })
  }

  let gesetzt = 0
  for (const s of UMFANGSSTELLEN) {
    const n = zahl(e.werte[s.feld])
    if (n === null) continue
    if (Number.isNaN(n)) {
      fehler.push({ feld: s.feld, text: 'Keine Zahl.' })
      continue
    }
    if (n < s.min || n > s.max) {
      fehler.push({ feld: s.feld, text: `Zwischen ${s.min} und ${s.max} cm.` })
      continue
    }
    gesetzt++
  }

  // `[read]` **Der Satz nennt die Regel, nicht den Constraint-Namen.**
  if (gesetzt === 0 && !fehler.some(f => f.feld !== 'measurement_date'
      && f.feld !== 'measurement_time' && f.feld !== 'measurement_source')) {
    fehler.push({
      feld: 'werte',
      text: 'Mindestens eine Stelle braucht einen Wert.',
    })
  }
  return fehler
}

/**
 * Die Eingabe in die Parameter der Datenbankfunktion.
 *
 * `[cmd]` **Die Namen stammen aus `pg_get_function_arguments`**
 * (2026-10-01), nicht aus einer Abschrift: `p_measurement_date`,
 * `p_measurement_time`, `p_measurement_source`, `p_source_detail`,
 * `p_notes` und dreizehn `p_<stelle>_cm`.
 *
 * `[read]` **Leere Felder werden `null`, nicht `0`** — eine Null
 * waere ein gemessener Wert, und `0 cm` faellt am CHECK.
 */
export function alsParameter(e: UmfangEingabe): Record<string, unknown> {
  const p: Record<string, unknown> = {
    p_measurement_date: e.measurement_date.trim(),
    p_measurement_time: e.measurement_time.trim(),
    p_measurement_source: e.measurement_source.trim() || 'manual',
    p_notes: e.notes.trim() || null,
  }
  for (const s of UMFANGSSTELLEN) {
    const n = zahl(e.werte[s.feld])
    p[`p_${s.feld}`] = n === null || Number.isNaN(n) ? null : n
  }
  return p
}
