// G-629 — die Phase Engine als Planer (Entwurf `entwurf/PhaseEngine.dc.html`,
// Dossier 8.7), rein: kein I/O, kein React.
//
// `[cmd]` **Datenseite G-625 (live):** `goals.goal_programs` (Status entwurf /
// aktiv / pausiert / abgeschlossen, hoechstens ein aktiver je Nutzer),
// `goal_program_positions` (Katalogcode ODER eigene Werte, Richtung,
// Phasenart, Dauer, Zeitraum, `goal_phase_id` sobald gestartet),
// `goal_program_events` (A / B / S / X). Schreibwege: `goal_plan_*`.
//
// `[read]` **Hier wird nichts entschieden, was die Kette entscheidet:** ob eine
// Position laeuft, sagt `phase_am` (bzw. das Phasenende), welche Werte ein
// Programm hat, sagt `goal_strategies`, was erlaubt ist, sagt
// `ziel_grenzen_pruefen` und der Phasen-Waechter.

import { utcTagIso } from '@lumeos/shared/datum'

import { EXPERIENCE_LEVELS } from '../profile/profile-model'

export type Planstatus = 'entwurf' | 'aktiv' | 'pausiert' | 'abgeschlossen'
export const PLAN_STATUS_TEXT: Record<Planstatus, string> = {
  entwurf: 'Entwurf', aktiv: 'läuft', pausiert: 'pausiert', abgeschlossen: 'abgeschlossen',
}

export type Terminart = 'A' | 'B' | 'S' | 'X'
/** Die vier Arten aus `goal_program_events_kind_check` — Text wie im Entwurf. */
export const TERMIN_ART: Record<Terminart, string> = {
  A: 'Wettkampf A · Hauptwettkampf', B: 'Wettkampf B · weiterer', S: 'Sperrtermin · Urlaub, Reise …', X: 'Sonstiges',
}

export type Positionszustand = 'abgeschlossen' | 'laufend' | 'ruht' | 'geplant'
export const POSITION_ZUSTAND_TEXT: Record<Positionszustand, string> = {
  abgeschlossen: 'abgeschlossen', laufend: 'läuft', ruht: 'ruht', geplant: 'geplant',
}

/**
 * Der Zustand einer Position — **aus der Kette:** ohne `goal_phase_id` ist sie
 * geplant; mit Phase entscheidet das Phasenende bzw. `phase_am` (laeuft nur
 * bei aktivem Ziel, G-613). Eine offene Phase eines ruhenden Ziels „ruht".
 */
export function positionszustand(p: { goal_phase_id: string | null; gueltig_ab?: string | null }, phase: { actual_end_date: string | null } | null,
  laufend: ReadonlySet<string>, stichtag: string): Positionszustand {
  if (!p.goal_phase_id) return 'geplant'
  if (laufend.has(p.goal_phase_id)) return 'laufend'
  // `[cmd]` **Gemessen am Schirm 2026-10-10:** nach `goal_plan_position_revise` ab
  // morgen hat die neue Position schon eine Phase, `phase_am` liefert sie aber erst
  // ab ihrem Beginn — ohne diese Zeile hiess sie „ruht". Sie beginnt erst.
  if (p.gueltig_ab && p.gueltig_ab > stichtag) return 'geplant'
  if (phase?.actual_end_date && phase.actual_end_date < stichtag) return 'abgeschlossen'
  return 'ruht'
}

/** Ganze Seite ab Pro (Dossier 8.7): Grad aus `profiles.experience_level`. */
export function abPro(grad: string | null | undefined): boolean {
  const r = (EXPERIENCE_LEVELS as readonly string[]).indexOf(grad ?? '')
  return r >= (EXPERIENCE_LEVELS as readonly string[]).indexOf('pro')
}

// ── Programmwerte ────────────────────────────────────────────────

export interface Katalogwerte {
  weight_change_target_percent: number | null
  protein_per_kg: number | null
  fat_percent: number | null
  fett_g_kg: number | null
  cardio_pro_woche: number | null
  refeed_pro_woche: number | null
  max_duration_weeks: number | null
  refeeds: unknown
}
export type Wertzeile = { label: string; wert: string | null }

const z = (n: number, s = 2) => n.toLocaleString('de-DE', { maximumFractionDigits: s })

/** `refeeds` aus dem Katalog in Worten — `every_weeks`/`duration_weeks`; anderes bleibt „siehe Katalog". */
export function refeedRhythmus(r: unknown): string | null {
  if (!r || typeof r !== 'object') return null
  const o = r as Record<string, unknown>
  if (typeof o.every_weeks === 'number') {
    return `alle ${o.every_weeks} Wochen${typeof o.duration_weeks === 'number' ? ` · ${o.duration_weeks} Woche${o.duration_weeks === 1 ? '' : 'n'}` : ''}`
  }
  if (typeof o.frequency === 'string') return o.frequency
  if (typeof o.type === 'string') return o.type
  return null
}

/**
 * Die Werte eines Programms (Katalog) — **`null` heisst „keine Vorgabe"** und
 * wird so gezeigt (G-625: unbelegte Fachwerte bleiben NULL; `fat_percent` ist
 * kein g/kg-Wert, `refeeds.every_weeks` keine Refeed-Tage pro Woche).
 * `zielrate` ist die gespeicherte Rate der Position, falls gesetzt.
 */
export function katalogwerte(k: Katalogwerte, zielrate: number | null): Wertzeile[] {
  const tempo = zielrate ?? k.weight_change_target_percent
  return [
    { label: 'Tempo', wert: tempo === null ? null : `${tempo > 0 ? '+' : ''}${z(tempo)} % Körpergewicht/Woche` },
    { label: 'Protein', wert: k.protein_per_kg === null ? null : `${z(k.protein_per_kg)} g/kg` },
    { label: 'Fett', wert: k.fat_percent === null ? null : `${z(k.fat_percent * 100, 0)} % der kcal` },
    { label: 'Fett g/kg', wert: k.fett_g_kg === null ? null : `${z(k.fett_g_kg)} g/kg` },
    { label: 'Cardio', wert: k.cardio_pro_woche === null ? null : `${z(k.cardio_pro_woche, 1)} je Woche` },
    { label: 'Refeed', wert: refeedRhythmus(k.refeeds) ?? (k.refeed_pro_woche === null ? null : `${z(k.refeed_pro_woche, 1)} Tage je Woche`) },
    { label: 'Höchstdauer', wert: k.max_duration_weeks === null ? null : `${k.max_duration_weeks} Wochen` },
  ]
}

/** Die Schluessel der eigenen Werte (`goal_program_position_validate`). */
export const EIGENE_WERTE = [
  { key: 'tempo_pct_kg_woche', label: 'Tempo % Körpergewicht/Woche' },
  { key: 'kcal_pct_erhaltung', label: 'kcal % zur Erhaltung' },
  { key: 'protein_g_kg', label: 'Protein g/kg' },
  { key: 'fett_g_kg', label: 'Fett g/kg' },
  { key: 'cardio_pro_woche', label: 'Cardio je Woche' },
  { key: 'refeed_pro_woche', label: 'Refeed-Tage je Woche' },
  { key: 'max_duration_weeks', label: 'Höchstdauer Wochen' },
] as const

export function eigeneWerte(e: Record<string, unknown>): Wertzeile[] {
  return EIGENE_WERTE.map(f => ({ label: f.label, wert: typeof e[f.key] === 'number' ? z(e[f.key] as number) : null }))
}

// ── Zeitachse ────────────────────────────────────────────────────

export type Segment = { id: string; anteil: number; versatz: number; zustand: Positionszustand }

/** Positionen als Balken ueber den Planzeitraum (Prozent). Offenes Ende: bis heute + 4 Wochen. */
export function zeitachse(pos: Array<{ id: string; gueltig_ab: string | null; projected_end_date: string | null; zustand: Positionszustand }>,
  termine: Array<{ event_date: string }>, stichtag: string): { von: string; bis: string; segmente: Segment[]; marke: (tag: string) => number } {
  const tage = (a: string, b: string) => (Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000
  const plus = (t: string, n: number) => { const d = new Date(`${t}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return utcTagIso(d) }
  const starts = pos.map(p => p.gueltig_ab).filter((x): x is string => !!x)
  const von = [stichtag, ...starts, ...termine.map(t => t.event_date)].sort()[0]!
  const enden = pos.map(p => p.projected_end_date ?? plus(stichtag, 28))
  const bis = [plus(stichtag, 28), ...enden, ...termine.map(t => t.event_date)].sort().at(-1)!
  const breite = Math.max(1, tage(von, bis))
  const marke = (t: string) => Math.max(0, Math.min(100, tage(von, t) / breite * 100))
  return {
    von, bis, marke,
    segmente: pos.filter(p => p.gueltig_ab).map(p => {
      const a = marke(p.gueltig_ab!), e = marke(p.projected_end_date ?? plus(stichtag, 28))
      return { id: p.id, versatz: a, anteil: Math.max(1.5, e - a), zustand: p.zustand }
    }),
  }
}

/** Beginn und Nummer einer neuen Position: nach der letzten. */
export function naechstePosition(pos: Array<{ position: number; projected_end_date: string | null; gueltig_ab: string | null }>, stichtag: string) {
  const letzte = [...pos].sort((a, b) => b.position - a.position)[0]
  const plus1 = (t: string) => { const d = new Date(`${t}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return utcTagIso(d) }
  return {
    position: (letzte?.position ?? 0) + 1,
    gueltig_ab: letzte?.projected_end_date ? plus1(letzte.projected_end_date) : stichtag,
    offenesEnde: !!letzte && !letzte.projected_end_date,
  }
}

/**
 * Die Richtung einer Position — CHECK `abnehmen | halten | aufbauen`. Bei
 * `uebergang`/`plan`-Programmen dieselbe Zuordnung wie der Trigger
 * `g625_phase_to_plan` (fat_loss/mini_cut → abnehmen, lean_bulk → aufbauen,
 * sonst halten).
 */
export function richtungFuer(auswahlGruppe: string | null, phaseType: string | null): 'abnehmen' | 'halten' | 'aufbauen' {
  if (auswahlGruppe === 'abnehmen' || auswahlGruppe === 'halten' || auswahlGruppe === 'aufbauen') return auswahlGruppe
  if (phaseType === 'fat_loss' || phaseType === 'mini_cut') return 'abnehmen'
  if (phaseType === 'lean_bulk') return 'aufbauen'
  return 'halten'
}

// ── Fehler der Kette als Satz ────────────────────────────────────

/** Jeder `G625_BLOCK`-Schluessel aus `625_goal_plan_*.sql` hat einen Satz (Test). */
const SAETZE: Record<string, string> = {
  plan_ziel_zuordnung: 'Der Plan gehört nicht zu diesem Ziel.',
  ziel_nicht_aktiv: 'Das Ziel dieses Plans ist nicht aktiv.',
  plan_fehlt: 'Der Plan fehlt.',
  vorgehen_doppelt_oder_fehlt: 'Wähle genau eins: ein Programm aus dem Katalog oder eigene Werte.',
  eigene_werte_statt_katalogcode: '„Eigene Werte" ist kein Programm — trag die Werte selbst ein.',
  unterphase_passt_nicht: 'Diese Unterphase gehört nicht zum gewählten Programm.',
  eigene_werte_und_katalograte: 'Eigene Werte tragen ihr Tempo selbst — eine Katalograte passt nicht dazu.',
  eigene_werte_grad: 'Eigene Werte sind ab Grad Pro frei.',
  eigene_werte_tempo_oder_kcal: 'Gib genau eins an: Tempo oder kcal zur Erhaltung.',
  eigene_werte_tempo: 'Das Tempo passt nicht zur Richtung (Halten 0, sonst über 0).',
  eigene_werte_kcal_richtung: 'Die kcal zur Erhaltung passen nicht zur Richtung.',
  eigene_werte_protein_g_kg: 'Protein g/kg muss über 0 liegen.',
  eigene_werte_fett_g_kg: 'Fett g/kg muss über 0 liegen.',
  eigene_werte_cardio_pro_woche: 'Cardio je Woche darf nicht negativ sein.',
  eigene_werte_refeed_pro_woche: 'Refeed-Tage je Woche dürfen nicht negativ sein.',
  eigene_werte_dauer: 'Die Höchstdauer muss über 0 Wochen liegen.',
  phase_passt_nicht: 'Die Phase passt nicht zu dieser Position.',
  ziel_fremd: 'Das Ziel fehlt oder gehört nicht zu deinem Konto.',
  plan_fremd: 'Der Plan fehlt oder gehört nicht zu deinem Konto.',
  plan_abgeschlossen: 'Ein abgeschlossener Plan lässt sich nicht aktivieren.',
  plan_ohne_position: 'Der Plan hat noch keine Phase — leg zuerst eine an.',
  plan_nicht_aktiv: 'Der Plan läuft gerade nicht.',
  nur_entwurf_loeschbar: 'Nur Entwürfe lassen sich löschen.',
  position_nicht_editierbar: 'Eine gestartete Phase änderst du über „ab Stichtag ändern".',
  position_fremd: 'Die Phase fehlt oder gehört nicht zu deinem Konto.',
  position_ausserhalb: 'Diese Stelle gibt es im Plan nicht.',
  termin_fremd: 'Der Termin fehlt oder gehört nicht zu deinem Konto.',
  position_passt_nicht: 'Die Phase passt nicht zur vorbereiteten Position.',
  position_nicht_laufend: 'Nur die laufende Phase lässt sich ab einem Stichtag ändern.',
  stichtag_nach_beginn: 'Der Stichtag muss heute oder später liegen und nicht vor dem Phasenbeginn.',
  dauer: 'Die Dauer muss mindestens eine Woche sein.',
  startphase_hat_abhaengige_daten: 'Am ersten Tag lässt sich die Startphase nicht ersetzen — es hängen schon Daten daran.',
  richtungsstandard_fehlt: 'Für diese Richtung fehlt das Standardprogramm.',
  position_bereits_gestartet: 'Diese Phase läuft schon.',
  phase_richtung: 'Die Phasenart passt nicht zur Richtung.',
  erhaltung_nicht_berechenbar: 'Die Erhaltung lässt sich nicht berechnen — es fehlt eine TDEE-Basis.',
}
/** G-649: jeder `G644_BLOCK`-Schluessel aus `644_goal_plan_*.sql` (Test). */
export const SAETZE_644: Record<string, string> = {
  steuerziel_fremd: 'Ein Plan braucht ein steuerndes Ziel — setze in Goals eine Richtung.',
  vorlage_fehlt: 'Diese Vorlage gibt es nicht (mehr).',
  anker_datum_fehlt: 'Wähle das Datum, von dem aus der Plan rechnet.',
  plan_fremd: 'Der Plan fehlt oder gehört nicht zu deinem Konto.',
  vorlage_braucht_dauer: 'Als Vorlage braucht jede Phase eine Dauer in Wochen.',
  nur_geplante_position: 'Nur eine geplante Phase lässt sich löschen — eine gestartete nicht.',
  eigener_vorlagencode: 'Die Vorlage hat keinen gültigen Schlüssel.',
  vorlage_programm_oder_dauer: 'Eine Phase der Vorlage hat kein Programm oder keine gültige Dauer.',
  vorlage_unterphase: 'Eine Stufe der Vorlage gehört nicht zu ihrem Programm.',
  aktive_position_fehlt: 'Die Phase gehört zu keinem aktiven Plan.',
  // G-644 Teil 2 (`644_plan_editor_part2.sql`, Kette — live noch nicht eingespielt am 16.10.)
  position_fremd: 'Die Phase fehlt oder gehört nicht zu deinem Konto.',
  programm_oder_dauer: 'Eine Phase braucht entweder ein Programm oder eigene Werte – und eine Dauer von 1 bis 520 Wochen.',
  historische_position_nach_planung: 'Nach dieser Phase ist schon eine gestartet – neu berechnen geht nur bis dorthin.',
  dauer_fehlt: 'Eine geplante Phase hat keine Dauer in Wochen.',
  anker_mit_laufender_phase: 'Mit der laufenden Phase lässt sich der Termin nicht erreichen – passe die Dauer an.',
  programm_fehlt: 'Dieses Programm gibt es nicht (mehr).',
  nur_abgeschlossenen_plan_neustarten: 'Neu starten geht nur mit einem abgeschlossenen Plan.',
  name_oder_start_fehlt: 'Gib dem neuen Plan einen Namen und ein Startdatum.',
  neustart_braucht_dauer: 'Zum Neustart braucht jede Phase eine Dauer in Wochen.',
  nur_eigenen_abgeschlossenen_plan_loeschen: 'Löschen geht hier nur mit einem eigenen abgeschlossenen Plan.',
}

export function planFehler(text: string): { satz: string; schluessel: string | null } {
  const m = /G625_BLOCK:([a-z_]+)/.exec(text)
  const n = /G644_BLOCK:([a-z_]+)/.exec(text)
  if (n) return { satz: SAETZE_644[n[1]!] ?? 'Die Datenbank hat das abgelehnt.', schluessel: n[1]! }
  if (!m) return { satz: text, schluessel: null }
  return { satz: SAETZE[m[1]!] ?? 'Die Datenbank hat das abgelehnt.', schluessel: m[1]! }
}

// ══ G-645/2: „Woche x von y" — EINE Rechnung ═══════════════════════
//
// `[cmd]` **Am Schirm 10.10.: Steuerungskarte „Woche 1 von 14", Phase engine
// „Woche 1 von 15"** — dieselbe Phase, zwei Rechnungen (`Math.round` gegen
// `Math.ceil` ueber die Gesamttage). Beide lesen jetzt diese Funktion, aus
// derselben Zeile `goal_phases` (Steuerung ueber `phase_am`, Planer ueber
// `goal_program_positions.goal_phase_id`).

/** Tage zwischen zwei ISO-Tagen, ohne Zeitzonenfalle. */
function tageZwischen(vonISO: string, bisISO: string): number | null {
  const von = Date.parse(`${vonISO}T12:00:00Z`)
  const bis = Date.parse(`${bisISO}T12:00:00Z`)
  if (!Number.isFinite(von) || !Number.isFinite(bis)) return null
  return Math.round((bis - von) / 86_400_000)
}

/** Was sich aus den Daten einer Phase rechnen laesst — und nur das. */
export function phasenLauf(p: { gueltig_ab: string | null; projected_end_date: string | null; actual_end_date: string | null }, stichtag: string) {
  const start = p.gueltig_ab
  const ende = p.actual_end_date ?? p.projected_end_date
  const tageBisher = start ? tageZwischen(start, stichtag) : null
  const tageGesamt = start && ende ? tageZwischen(start, ende) : null
  return {
    tageBisher,
    tageGesamt,
    /** Woche 1 ist die erste — Tag 0 bis 6. */
    woche: tageBisher != null && tageBisher >= 0 ? Math.floor(tageBisher / 7) + 1 : null,
    wochenGesamt: tageGesamt != null && tageGesamt > 0 ? Math.ceil(tageGesamt / 7) : null,
    tageRest: tageGesamt != null && tageBisher != null ? tageGesamt - tageBisher : null,
    beendet: Boolean(p.actual_end_date),
  }
}

/**
 * Der Satz dazu. `[cmd]` **„Woche 12 von 7" stand zuerst da** (G-5xx) — ueber
 * das geplante Ende hinaus gibt es kein „von", die Phase laeuft laenger.
 */
export function wocheText(l: ReturnType<typeof phasenLauf>, maxWochen: number | null = null): string | null {
  if (l.woche == null) return null
  // G-648: offenes Ende — der Entwurf nennt die Hoechstdauer des Programms („Woche 17 von max 52")
  if (l.wochenGesamt == null || l.tageRest == null) return maxWochen ? `Woche ${l.woche} von max ${maxWochen}` : `Woche ${l.woche}`
  return l.tageRest >= 0 ? `Woche ${l.woche} von ${l.wochenGesamt}` : `Woche ${l.woche} · ${Math.abs(l.tageRest)} Tage über das geplante Ende`
}

// ══ G-649: Spalten und Achse des Entwurfs (`PhaseEngine.dc.html`) ═══
//
// `[cmd]` **„Defizit / Überschuss" ist `goal_strategies.tdee_modifier`** (lean_bulk
// 0,10 → „+10 %", mini_cut −0,25 → „−25 %", gemessen 16.10.) — genau die Zahlen
// des Entwurfs. Stufen (contest_prep early/mid/late) tragen `tdee_multiplier` in
// `sub_phases`, eigene Werte `kcal_pct_erhaltung`. Ohne Quelle: „–".

type Katalogzeile = { code: string; label: string; tdee_modifier: number | null; cardio_pro_woche: number | null; sub_phases: Array<{ name: string; roh: Record<string, unknown> }> }
type Pos = { strategie_code: string | null; sub_phase_code: string | null; eigene_werte: Record<string, unknown> | null; phase_type: string }

const vz = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${z(Math.abs(n), 1)}`
const stufe = (p: Pos, k: Katalogzeile[]) => p.sub_phase_code ? k.find(s => s.code === p.strategie_code)?.sub_phases.find(t => t.name === p.sub_phase_code)?.roh ?? null : null

/** Name einer Position: Stufe („early"), sonst Programm, eigene Werte, zuletzt die Phasenart in Worten. */
export function phasenname(p: Pos, k: Katalogzeile[]): string {
  if (p.eigene_werte) return 'Eigene Werte'
  if (p.sub_phase_code) return p.sub_phase_code
  return k.find(s => s.code === p.strategie_code)?.label ?? p.phase_type.replace(/_/g, ' ')
}

export function defizitText(p: Pos, k: Katalogzeile[]): string {
  const e = p.eigene_werte?.kcal_pct_erhaltung
  if (typeof e === 'number') return `${vz(e)} % · eigene`
  const m = stufe(p, k)?.tdee_multiplier
  if (typeof m === 'number') return `${vz(Math.round((m - 1) * 100))} %`
  const t = k.find(s => s.code === p.strategie_code)?.tdee_modifier
  return typeof t === 'number' ? `${vz(Math.round(t * 100))} %` : '–'
}

export function cardioText(p: Pos, k: Katalogzeile[]): string {
  const e = p.eigene_werte?.cardio_pro_woche
  if (typeof e === 'number') return `${z(e, 1)}×`
  const c = stufe(p, k)?.cardio as { sessions_per_week?: number[] } | undefined
  if (Array.isArray(c?.sessions_per_week)) return `${c.sessions_per_week.join('–')}×`
  const s = k.find(x => x.code === p.strategie_code)?.cardio_pro_woche
  return typeof s === 'number' ? `${z(s, 1)}×` : '–'
}

const MONAT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
/** Ganze Monate von `von` bis `bis` — Spalten wie im Entwurf („Jun … Jan 27"), `pos` in Prozent. */
export function monatsachse(von: string, bis: string) {
  const j0 = Number(von.slice(0, 4)), m0 = Number(von.slice(5, 7)) - 1
  const j1 = Number(bis.slice(0, 4)), m1 = Number(bis.slice(5, 7)) - 1
  const anzahl = (j1 - j0) * 12 + (m1 - m0) + 1
  const monate = Array.from({ length: anzahl }, (_, i) => {
    const m = (m0 + i) % 12, j = j0 + Math.floor((m0 + i) / 12)
    return j === j0 ? MONAT[m]! : `${MONAT[m]} ${String(j).slice(2)}`
  })
  const a = Date.UTC(j0, m0, 1), b = Date.UTC(j0, m0 + anzahl, 1)
  const pos = (tag: string) => Math.max(0, Math.min(100, (Date.parse(`${tag}T00:00:00Z`) - a) / (b - a) * 100))
  return { monate, pos }
}

// ══ G-649: Segmentfarbe je Programm, wie `PhaseEngine.dc.html` (FARBE) ══
//
// `[read]` **Der Entwurf faerbt nach Programm**, nicht nach Zustand; der Zustand steht
// in Deckkraft (vorbei .55) und Umriss (laufend). Unbenannte Programme nach Richtung.
const PROGRAMMFARBE: Record<string, string> = {
  'contest_prep:early': 'oklch(0.80 0.10 60)', 'contest_prep:mid': 'oklch(0.74 0.12 50)', 'contest_prep:late': 'oklch(0.68 0.14 40)',
  peak_week: 'oklch(0.60 0.16 30)', lean_bulk: 'oklch(0.82 0.09 90)', clean_bulk: 'oklch(0.78 0.10 95)',
  mini_cut: 'oklch(0.76 0.10 60)', moderate_cut: 'oklch(0.74 0.10 60)',
  maintain: 'oklch(0.85 0.04 165)', maintenance_diet_break: 'oklch(0.85 0.04 165)', reverse_diet: 'oklch(0.80 0.06 165)',
}
const RICHTUNGSFARBE: Record<string, string> = { abnehmen: 'oklch(0.74 0.10 60)', aufbauen: 'oklch(0.82 0.09 90)', halten: 'oklch(0.85 0.04 165)' }
/** Text auf den hellen Programmfarben — in beiden Modi dunkel, wie im Entwurf. */
export const PROGRAMM_TEXT = 'oklch(0.25 0.005 270)'
export function programmFarbe(p: { strategie_code: string | null; sub_phase_code: string | null; eigene_werte: unknown; richtung: string | null }): string {
  if (p.eigene_werte) return 'oklch(0.80 0.08 300)'
  const c = p.strategie_code ?? ''
  return PROGRAMMFARBE[`${c}:${p.sub_phase_code ?? ''}`] ?? PROGRAMMFARBE[c] ?? RICHTUNGSFARBE[p.richtung ?? ''] ?? 'oklch(0.85 0.005 270)'
}
