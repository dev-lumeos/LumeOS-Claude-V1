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

export function planFehler(text: string): { satz: string; schluessel: string | null } {
  const m = /G625_BLOCK:([a-z_]+)/.exec(text)
  if (!m) return { satz: text, schluessel: null }
  return { satz: SAETZE[m[1]!] ?? 'Die Datenbank hat das abgelehnt.', schluessel: m[1]! }
}
