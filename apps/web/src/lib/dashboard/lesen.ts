// Lesepfad fuer das Dashboard (G-100).
//
// **DAS DASHBOARD BAUT NICHTS NEU.** `[read]` Es ist die Zusammenschau
// der sieben Module; jede Zahl hat ihren Ursprung dort und wird hier
// nur geholt. Wo ein Modul schon eine Lesefunktion hat, wird sie
// benutzt — eine zweite Leseroutine waere eine zweite Wahrheit.
//
// **DIE GRENZE, DIE HIER BESONDERS GILT:** `[read]` Zahlen ja, Urteile
// nein. Auf dem Dashboard laeuft alles zusammen, und gerade deshalb
// steht hier kein Gesamtwert, keine Ampel und kein Ratschlag. Was das
// Mockup an Urteilen zeigt („Push hard", „green light", ein
// Readiness-Komposit aus fuenf erfundenen Anteilen), ist gemeldet und
// nicht gebaut — Begruendung im Bericht 149.
//
// **DIE SEEDS REICHEN IN DIE ZUKUNFT** (±90 Tage, C-78). `[cmd]`
// `recovery.scores` laeuft bis 2026-11-06, heute ist der 2026-08-20.
// Deshalb fragt jede Funktion nach dem STICHTAG und nimmt nicht die
// juengste Zeile — sonst zeigte das Dashboard einen Wert aus dem
// November als „heute".
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

// `[read]` DIE MEDICAL-ZAHLEN WERDEN NICHT NACHGEBAUT. G-84 hat die
// Trennung „ausserhalb des Laborbereichs" gegen „ausserhalb des
// Optimalbands" entschieden und geprueft; hier laeuft dieselbe Kette.
import { ladeBefundwerte, ladeMarkerStamm } from '../medical/lesen'
import { zuReihen } from '../medical/reihe'
import { zaehleLagen } from '../medical/lagezaehlung'
// Die Tagesziele — dieselbe Quelle wie im Nutrition-Modul.
import { getZielwerteAm } from '../profile/zielwerte-read'

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

/** Ein Punkt der Sparkline. */
export type Punkt = { datum: string; wert: number }

export type RecoveryKachel = {
  /** Der Wert AM STICHTAG, nicht der juengste vorhandene. */
  heute: number | null
  /** Der Schnitt der sieben Tage davor — der Vergleich, den das
   *  Mockup als „+4 wk avg" zeigt. */
  schnitt7: number | null
  verlauf: Punkt[]
  /**
   * Wie der Wert entstanden ist. `[cmd]` Bei `dev` steht
   * `nutrition_source` auf `fallback_c123_e9` und `hrv_source` auf
   * `not_used_manual_mode` — das gehoert an die Zahl, sonst sieht ein
   * Rueckfallwert aus wie eine Messung.
   */
  modus: string | null
  nutrition_quelle: string | null
  hrv_quelle: string | null
}

export type TrainingKachel = {
  /**
   * Die naechste geplante Sitzung ab Stichtag.
   *
   * `[cmd]` Zeit, Dauer und Ort sind auf allen 14 geplanten Sitzungen
   * gesetzt (17:30, 75 min, Gym). **`total_sets` und
   * `total_volume_kg` stehen dort auf 0** — die Spalten gibt es, sie
   * sind fuer Plaene nur nicht gefuellt.
   */
  naechste: {
    datum: string; name: string | null
    zeit: string | null; dauer: number | null; ort: string | null
  } | null
  /** Die letzte absolvierte bis Stichtag, mit ihren Kennzahlen. */
  letzte: {
    datum: string; name: string | null
    saetze: number | null; volumen: number | null; dauer: number | null
  } | null
  absolviert: number
  geplant: number
  /**
   * Bestleistungen bis zum Stichtag — `workout_sets.is_pr`.
   *
   * `[cmd]` Die Spalte ist gesetzt (41 von 101 Saetzen), `estimated_1rm`
   * auf 90. **Kein e1RM wird hier gerechnet** — die Datenbank fuehrt
   * ihn, und eine zweite Formel waere eine zweite Wahrheit.
   */
  prs: Array<{
    datum: string
    uebung: string
    gewicht: number | null
    wdh: number | null
    e1rm: number | null
  }>
}

export type SchlafKachel = {
  stunden: number | null
  /** `sleep_quality` steht 1–10 in `recovery.checkins`. */
  qualitaet: number | null
  /** `[cmd]` HRV liegt nur auf 43 von 170 Check-ins. */
  hrv: number | null
  verlauf: Punkt[]
}

export type NutritionKachel = {
  kcal: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  positionen: number
  /** Die Tagessummen der letzten Tage, fuer die Sparkline. */
  verlauf: Punkt[]
  /**
   * Die Tagesziele aus `goals.zielwerte_am`.
   *
   * `[read]` `null` heisst: fuer diesen Tag gilt kein Ziel. Dann zeigt
   * die Kachel **keinen Fortschrittsbalken** — ein Balken ohne
   * Bezugsgroesse behauptet einen Fortschritt, den niemand gemessen
   * hat.
   */
  ziele: {
    kcal: number | null
    protein: number | null
    carbs: number | null
    fat: number | null
    herkunft: string | null
  } | null
}

export type GoalsKachel = {
  aktiv: Array<{
    art: string
    prioritaet: number | null
    ziel: number | null
    stand: number | null
    zieldatum: string | null
  }>
  erreicht: number
  offen: number
}

export type MedicalKachel = {
  /**
   * `[read]` ZWEI ZAHLEN, NICHT EINE — die Trennung aus G-84.
   * „ausserhalb des Laborbereichs" ist ein Befund des Labors,
   * „ausserhalb des Optimalbands" eine Empfehlung aus der Literatur.
   * Sie zusammenzuzaehlen hiesse, beiden dieselbe Autoritaet zu geben.
   */
  ausserhalbLabor: number | null
  ausserhalbOptimal: number | null
  werte: number
  befunde: number
  letzterBefund: string | null
}

export type SupplementsKachel = {
  genommen: number
  uebersprungen: number
  /** Quote ueber den gemessenen Zeitraum, nicht ueber „immer". */
  quote: number | null
}

export type DashboardDaten = {
  stichtag: string
  recovery: RecoveryKachel
  schlaf: SchlafKachel
  training: TrainingKachel
  nutrition: NutritionKachel
  goals: GoalsKachel
  medical: MedicalKachel
  supplements: SupplementsKachel
  /** Keine Sitzung: alle Kacheln leer, aber kein Fehler. */
  angemeldet: boolean
  fehler: string | null
}

/** `2026-08-20` minus n Tage. */
function minusTage(datum: string, n: number): string {
  const d = new Date(`${datum}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}

const LEER: Omit<DashboardDaten, 'stichtag' | 'angemeldet' | 'fehler'> = {
  recovery: {
    heute: null, schnitt7: null, verlauf: [],
    modus: null, nutrition_quelle: null, hrv_quelle: null,
  },
  schlaf: { stunden: null, qualitaet: null, hrv: null, verlauf: [] },
  training: { naechste: null, letzte: null, absolviert: 0, geplant: 0, prs: [] },
  nutrition: {
    kcal: null, protein: null, carbs: null, fat: null,
    positionen: 0, verlauf: [], ziele: null,
  },
  goals: { aktiv: [], erreicht: 0, offen: 0 },
  medical: {
    ausserhalbLabor: null, ausserhalbOptimal: null,
    werte: 0, befunde: 0, letzterBefund: null,
  },
  supplements: { genommen: 0, uebersprungen: 0, quote: null },
}

export async function ladeDashboard(stichtag: string): Promise<DashboardDaten> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) {
    return { stichtag, ...LEER, angemeldet: false, fehler: null }
  }

  const vor7 = minusTage(stichtag, 7)
  const vor30 = minusTage(stichtag, 30)

  // `[read]` Die Zeilenrechte der Tabellen greifen — kein
  // `user_id`-Filter in den Abfragen. Sechs Module, parallel: faellt
  // eines aus, bleiben die uebrigen gueltig.
  const [rec, chk, tr, nut, zie, med, sup] = await Promise.allSettled([
    client.schema('recovery').from('scores')
      .select('entry_date, score, mode, nutrition_source, hrv_source')
      .lte('entry_date', stichtag).gte('entry_date', vor30)
      .order('entry_date', { ascending: false }),
    client.schema('recovery').from('checkins')
      .select('entry_date, sleep_hours, sleep_quality, hrv_rmssd')
      .lte('entry_date', stichtag).gte('entry_date', vor7)
      .order('entry_date', { ascending: false }),
    client.schema('training').from('workout_sessions')
      .select('session_date, name, status, started_time, duration_minutes, '
        + 'location, total_sets, total_volume_kg')
      .order('session_date', { ascending: true }),
    client.schema('nutrition').from('daily_summary')
      .select('entry_date, enercc, prot625, cho, fat, item_count')
      .lte('entry_date', stichtag).gte('entry_date', vor7)
      .order('entry_date', { ascending: false }),
    client.schema('goals').from('user_goals')
      .select('goal_type, status, priority, target_value, current_value, target_date')
      .order('priority', { ascending: true }),
    client.schema('medical').from('lab_reports')
      .select('id, report_date').order('report_date', { ascending: false }),
    // `[cmd]` Die Spalte heisst `intake_date`, nicht `taken_date` —
    // beim Bauen geraten und beim Messen aufgefallen.
    client.schema('supplements').from('intake_logs')
      .select('status, intake_date')
      .gte('intake_date', vor30).lte('intake_date', stichtag),
  ])

  const daten = { stichtag, ...structuredClone(LEER), angemeldet: true, fehler: null as string | null }

  // ── Recovery ──────────────────────────────────────────────────
  if (rec.status === 'fulfilled' && !rec.value.error) {
    const zeilen = (rec.value.data ?? []) as Array<Record<string, unknown>>
    const amTag = zeilen.find(z => text(z.entry_date) === stichtag)
    daten.recovery.heute = zahl(amTag?.score)
    daten.recovery.modus = text(amTag?.mode)
    daten.recovery.nutrition_quelle = text(amTag?.nutrition_source)
    daten.recovery.hrv_quelle = text(amTag?.hrv_source)
    // Der Schnitt der SIEBEN TAGE DAVOR, den Stichtag ausgenommen —
    // sonst vergliche man den Wert mit sich selbst.
    const davor = zeilen
      .filter(z => {
        const d = text(z.entry_date)
        return d !== null && d < stichtag && d >= vor7
      })
      .map(z => zahl(z.score))
      .filter((n): n is number => n !== null)
    daten.recovery.schnitt7 = davor.length > 0
      ? Math.round((davor.reduce((s, n) => s + n, 0) / davor.length) * 10) / 10
      : null
    daten.recovery.verlauf = zeilen.slice().reverse().flatMap(z => {
      const d = text(z.entry_date); const w = zahl(z.score)
      return d !== null && w !== null ? [{ datum: d, wert: w }] : []
    })
  }

  // ── Schlaf ────────────────────────────────────────────────────
  if (chk.status === 'fulfilled' && !chk.value.error) {
    const zeilen = (chk.value.data ?? []) as Array<Record<string, unknown>>
    const amTag = zeilen.find(z => text(z.entry_date) === stichtag)
    daten.schlaf.stunden = zahl(amTag?.sleep_hours)
    daten.schlaf.qualitaet = zahl(amTag?.sleep_quality)
    daten.schlaf.hrv = zahl(amTag?.hrv_rmssd)
    daten.schlaf.verlauf = zeilen.slice().reverse().flatMap(z => {
      const d = text(z.entry_date); const w = zahl(z.sleep_hours)
      return d !== null && w !== null ? [{ datum: d, wert: w }] : []
    })
  }

  // ── Training ──────────────────────────────────────────────────
  if (tr.status === 'fulfilled' && !tr.value.error) {
    // Ueber `unknown`, weil supabase-js die Zeilen als „Wert ODER
    // Fehlerobjekt" typisiert — ein Typproblem, kein Laufzeitproblem.
    const zeilen = (tr.value.data ?? []) as unknown as Array<Record<string, unknown>>
    daten.training.absolviert = zeilen.filter(z => text(z.status) === 'completed').length
    daten.training.geplant = zeilen.filter(z => text(z.status) === 'planned').length
    const naechste = zeilen.find(z =>
      text(z.status) === 'planned' && (text(z.session_date) ?? '') > stichtag)
    const letzte = zeilen.slice().reverse().find(z =>
      text(z.status) === 'completed' && (text(z.session_date) ?? '') <= stichtag)
    if (naechste) {
      daten.training.naechste = {
        datum: text(naechste.session_date) ?? '',
        name: text(naechste.name),
        // `HH:MM:SS` zu `HH:MM` — die Sekunden sagen nichts.
        zeit: text(naechste.started_time)?.slice(0, 5) ?? null,
        dauer: zahl(naechste.duration_minutes),
        ort: text(naechste.location),
      }
    }
    if (letzte) {
      // `[read]` Eine 0 bei Saetzen und Volumen heisst „nicht
      // gefuehrt", nicht „null Saetze absolviert" — deshalb `null`.
      const saetze = zahl(letzte.total_sets)
      const volumen = zahl(letzte.total_volume_kg)
      daten.training.letzte = {
        datum: text(letzte.session_date) ?? '',
        name: text(letzte.name),
        saetze: saetze !== null && saetze > 0 ? saetze : null,
        volumen: volumen !== null && volumen > 0 ? volumen : null,
        dauer: zahl(letzte.duration_minutes),
      }
    }
  }

  // ── Nutrition ─────────────────────────────────────────────────
  if (nut.status === 'fulfilled' && !nut.value.error) {
    const zeilen = (nut.value.data ?? []) as Array<Record<string, unknown>>
    const amTag = zeilen.find(z => text(z.entry_date) === stichtag)
    daten.nutrition.kcal = zahl(amTag?.enercc)
    daten.nutrition.protein = zahl(amTag?.prot625)
    daten.nutrition.carbs = zahl(amTag?.cho)
    daten.nutrition.fat = zahl(amTag?.fat)
    daten.nutrition.positionen = zahl(amTag?.item_count) ?? 0
    daten.nutrition.verlauf = zeilen.slice().reverse().flatMap(z => {
      const d = text(z.entry_date); const w = zahl(z.enercc)
      return d !== null && w !== null ? [{ datum: d, wert: Math.round(w) }] : []
    })
  }

  // ── Goals ─────────────────────────────────────────────────────
  if (zie.status === 'fulfilled' && !zie.value.error) {
    const zeilen = (zie.value.data ?? []) as Array<Record<string, unknown>>
    daten.goals.erreicht = zeilen.filter(z => text(z.status) === 'achieved').length
    daten.goals.offen = zeilen.filter(z => text(z.status) === 'active').length
    daten.goals.aktiv = zeilen
      .filter(z => text(z.status) === 'active')
      .map(z => ({
        art: text(z.goal_type) ?? '—',
        prioritaet: zahl(z.priority),
        ziel: zahl(z.target_value),
        stand: zahl(z.current_value),
        zieldatum: text(z.target_date),
      }))
  }

  // ── Medical ───────────────────────────────────────────────────
  if (med.status === 'fulfilled' && !med.value.error) {
    const zeilen = (med.value.data ?? []) as Array<Record<string, unknown>>
    daten.medical.befunde = zeilen.length
    daten.medical.letzterBefund = text(zeilen[0]?.report_date)
  }

  // Die Tagesziele. `[read]` Ueber `getZielwerteAm`, dieselbe Funktion,
  // die das Nutrition-Modul benutzt — nicht nachgebaut.
  try {
    const ziele = await getZielwerteAm(stichtag)
    if (ziele) {
      daten.nutrition.ziele = {
        kcal: ziele.kcal, protein: ziele.protein_g,
        carbs: ziele.carbs_g, fat: ziele.fat_g,
        herkunft: ziele.herkunft,
      }
    }
  } catch {
    // Ohne Ziel keine Balken — das ist der richtige Zustand, kein Fehler.
  }

  // Die Bestleistungen. `[read]` Eigene Abfrage, weil sie ueber drei
  // Tabellen geht (`workout_sets` → `workout_exercises` →
  // `workout_sessions`) und die Uebung dazu braucht. Faellt sie aus,
  // bleibt die Liste leer und die Kachel sagt das.
  try {
    const { data } = await client.schema('training').from('workout_sets')
      .select('weight_kg, reps, estimated_1rm, is_pr, '
        + 'workout_exercises!inner ( exercises ( name ), '
        + 'workout_sessions!inner ( session_date ) )')
      .eq('is_pr', true)
      .limit(60)
    const zeilen = (data ?? []) as unknown as Array<Record<string, unknown>>
    const prs = zeilen.flatMap(z => {
      const ue = (z.workout_exercises ?? null) as Record<string, unknown> | null
      const si = (ue?.workout_sessions ?? null) as Record<string, unknown> | null
      const datum = text(si?.session_date)
      // Nur bis zum Stichtag — die Seeds reichen in die Zukunft.
      if (datum === null || datum > stichtag) return []
      const ex = (ue?.exercises ?? null) as Record<string, unknown> | null
      return [{
        datum,
        uebung: text(ex?.name) ?? '—',
        gewicht: zahl(z.weight_kg),
        wdh: zahl(z.reps),
        e1rm: zahl(z.estimated_1rm),
      }]
    })
    prs.sort((a, b) => b.datum.localeCompare(a.datum))
    daten.training.prs = prs.slice(0, 3)
  } catch {
    // Leere Liste bleibt stehen.
  }

  // Die Lage der Marker ueber dieselbe Kette wie das Medical-Modul
  // (G-84). `[read]` Eigener try: faellt sie aus, bleiben die zwei
  // Zahlen `null` und die Kachel sagt das — die uebrigen Module sind
  // davon nicht betroffen.
  try {
    const werte = await ladeBefundwerte(user.id)
    daten.medical.werte = werte.length
    const codes = Array.from(new Set(
      werte.flatMap(w => (w.loinc_code ? [w.loinc_code] : [])),
    ))
    const reihen = zuReihen(werte, await ladeMarkerStamm(codes))
    const lagen = zaehleLagen(reihen)
    daten.medical.ausserhalbLabor = lagen.ausserhalb_bereich
    daten.medical.ausserhalbOptimal = lagen.ausserhalb_optimal
  } catch {
    // Vorgabe (null) bleibt stehen.
  }

  // ── Supplements ───────────────────────────────────────────────
  if (sup.status === 'fulfilled' && !sup.value.error) {
    const zeilen = (sup.value.data ?? []) as Array<Record<string, unknown>>
    daten.supplements.genommen = zeilen.filter(z => text(z.status) === 'taken').length
    daten.supplements.uebersprungen = zeilen.filter(z => text(z.status) === 'skipped').length
    const gesamt = daten.supplements.genommen + daten.supplements.uebersprungen
    daten.supplements.quote = gesamt > 0
      ? Math.round((daten.supplements.genommen / gesamt) * 1000) / 10
      : null
  }

  return daten
}


// ══ G-152: der Aktivitaetsstrom ═══════════════════════════
//
// `[cmd]` **`public.activity_stream` steht seit C-412/C-414** —
// 5.426 Zeilen ueber fuenf Konten — **und keine Datei in `apps/`
// hat sie gelesen.** Achter Fall von A-71.
//
// `[cmd]` **Es ist eine SICHT, kein Tisch**, mit
// `security_invoker=true`: **die Zeilenrechte der zugrunde
// liegenden Tabellen greifen**, jede Nutzerin sieht nur ihre
// eigenen Zeilen.
//
// `[cmd]` **Der Mockup zeigt EINE gemischte Liste**, neueste zuerst
// (`module-dashboard.jsx:105`) — nicht je Modul getrennt. Zeit,
// modulfarbenes Zeichen, Text.
//
// `[cmd]` **Die Sicht traegt NUR `summary_de`** — kein `_en`, kein
// `_th`. **Das ist gemessen und gemeldet, nicht hier geloest**
// (G-152, A5).

/** Ein Ereignis aus `public.activity_stream` — G-152. */
export type StromEreignis = {
  datum: string
  /** `HH:MM`, oder `null` wenn die Zeile nur ein Datum traegt. */
  zeit: string | null
  modul: string
  art: string
  /** Der deutsche Text der Sicht — die einzige Sprache, die sie hat. */
  text: string
}

export type StromStand = {
  ereignisse: StromEreignis[]
  /** Wie viele Zeilen die Sicht fuer diese Nutzerin insgesamt fuehrt. */
  gesamt: number
  /** Welche Module ueberhaupt vorkommen — fuer den Leerhinweis. */
  module: string[]
  fehler: string | null
}

const STROM_LEER: StromStand = {
  ereignisse: [], gesamt: 0, module: [], fehler: null,
}

/**
 * Der Aktivitaetsstrom — G-152.
 *
 * `[read]` **Neueste zuerst, wie der Mockup** — sortiert nach
 * `occurred_at`, nicht nach `event_date`: zwei Ereignisse am selben
 * Tag haetten sonst keine Reihenfolge.
 *
 * `[read]` **Die Zahl `grenze` ist die ANZEIGE, nicht der Bestand** —
 * `gesamt` kommt aus einer eigenen Zaehlung, damit die Kachel sagen
 * kann, wie viel sie NICHT zeigt.
 */
// `[cmd]` **Warum 40 und nicht 20:** auf `test-user` erscheint
// `recovery` erst ab Zeile 23, `training` ab Zeile 30 — gemessen
// ueber `row_number() over (order by occurred_at desc)`. **Bei 20
// waeren zwei der vier Module strukturell unsichtbar**, und die
// Kachel saehe nach ,,nur Ernaehrung und Supplemente" aus.
//
// `[read]` **Die Zahl ist die ANZEIGE, nicht der Bestand** —
// `gesamt` sagt weiter, wie viel dahinter liegt.
export async function ladeAktivitaetsstrom(grenze = 40): Promise<StromStand> {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return STROM_LEER

  // `[read]` **`user_id` steht trotz `security_invoker` explizit
  // dabei** — zwei Schloesser sind kein Widerspruch, und die Abfrage
  // sagt dann selbst, wessen Zeilen sie meint.
  const [liste, zahl] = await Promise.all([
    client.from('activity_stream')
      .select('event_date, event_time, occurred_at, module, event_type, summary_de')
      .eq('user_id', user.id)
      .order('occurred_at', { ascending: false })
      .limit(grenze),
    client.from('activity_stream')
      .select('module', { count: 'exact', head: false })
      .eq('user_id', user.id)
      .limit(2000),
  ])

  if (liste.error) return { ...STROM_LEER, fehler: liste.error.message }

  const zeilen = (liste.data ?? []) as unknown as Array<Record<string, unknown>>
  const alle = (zahl.data ?? []) as unknown as Array<Record<string, unknown>>

  return {
    ereignisse: zeilen.map(z => ({
      datum: String(z.event_date ?? ''),
      // `event_time` kommt als `HH:MM:SS` — die Sekunden traegt der
      // Mockup nicht.
      zeit: typeof z.event_time === 'string' ? z.event_time.slice(0, 5) : null,
      modul: String(z.module ?? ''),
      art: String(z.event_type ?? ''),
      text: String(z.summary_de ?? ''),
    })),
    gesamt: zahl.count ?? alle.length,
    module: Array.from(new Set(alle.map(z => String(z.module)))).sort(),
    fehler: null,
  }
}
