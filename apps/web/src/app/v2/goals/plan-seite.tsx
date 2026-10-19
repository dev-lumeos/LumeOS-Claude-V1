'use client'

// G-629, seit G-649 1:1 nach `entwurf/PhaseEngine.dc.html` (Dossier 8.7). Ganze
// Seite ab Pro; darunter gesperrt mit Hinweis. Abschnitte in der Reihenfolge
// des Entwurfs:
//
//   Neuer Plan        Name + Ausgangspunkt (`goal_plan_templates`, G-644) + Anker
//   Aktiver Plan      Kopf, Monatsachse mit Balken und Terminen, Details:
//                     Phasentabelle, Wachen, Als naechstes, woechentliche Anpassung
//   Bearbeiten        Name, Termine, Phasen (anlegen / verschieben / loeschen /
//                     ab Stichtag aendern), Als Vorlage, Pausieren, Beenden, Loeschen
//   Weitere Plaene    Entwuerfe und pausierte; Aktivieren mit Rueckfrage
//   Abgeschlossene    lesbar, Als Vorlage
//   Vorlagen          LumeOS-Standard · Eigene · Vom Coach
//
// `[read]` **Grenzen nur aus `ziel_grenzen_pruefen`** — Sperre rot mit „frei ab",
// Warnung mit Haken, dieselbe Anzeige wie „Ziel setzen" (G-628 Teil 2).
// `[read]` **Was der Kette fehlt, steht als „kommt (Punkt)"** — keine Attrappe.
import * as React from 'react'

import { Befunde } from './befunde'
import { zielPruefenAktion } from './ziel-aktionen'
import { phaseBeendenAktion } from './phase-aktionen'
import {
  planAktivierenAktion, planAlsVorlageAktion, planAnlegenAktion, planAnlegenAusAktion, planBeendenAktion, planFertigLoeschenAktion, planLoeschenAktion, planNeuStartenAktion, positionNeuBerechnenAktion,
  planPausierenAktion, planUmbenennenAktion, positionAendernAbAktion, positionLoeschenAktion, positionSpeichernAktion,
  positionVerschiebenAktion, terminLoeschenAktion, terminSpeichernAktion,
} from './plan-aktionen'
import {
  EIGENE_WERTE, PLAN_STATUS_TEXT, PROGRAMM_TEXT, SAETZE_644, TERMIN_ART, abPro, cardioText, defizitText, eigeneWerte, katalogwerte, monatsachse,
  naechstePosition, phasenname, programmFarbe, richtungFuer, zeitachse, type Positionszustand, type Terminart, type Wertzeile,
} from '../../../lib/goals/plan'
import { bestaetigteSchluessel, waechterSatz, weiterErlaubt, type Pruefung } from '../../../lib/goals/zielpruefung'
import { phasenartFuerStrategie } from '../../../lib/goals/strategie-regeln'
import type { Anpassungswoche, Plan, Planposition, Vorlage } from '../../../lib/goals/plan-read'
import type { Ausblick, Wochendaten, Wache } from '../../../lib/goals/reiter-read'
import { kalenderwoche } from '../../../lib/goals/reiter'
import type { Planergebnis } from '../../../lib/goals/plan-write'
import type { Strategie } from '../../../lib/goals/strategie-read'
import type { ZielFortschritt } from '../../../lib/goals/lesen'

/** Datum wie im Entwurf: „08.10.26". */
/** Entwurf: „06.01.–25.03.2026" im selben Jahr, sonst beide Daten mit Jahr. */
export const zeitraumDe = (von: string | null, bis: string | null) => {
  if (!von || !bis) return `${dstr(von)} – ${dstr(bis)}`
  const t = (d: string) => `${d.slice(8, 10)}.${d.slice(5, 7)}.`
  return von.slice(0, 4) === bis.slice(0, 4) ? `${t(von)}–${t(bis)}${bis.slice(0, 4)}` : `${t(von)}${von.slice(0, 4)}–${t(bis)}${bis.slice(0, 4)}`
}
const dstr = (iso: string | null) => (iso ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(2, 4)}` : '—')
const tagPlus = (tag: string, n: number) => {
  const [j, m, t] = tag.split('-').map(Number)
  const d = new Date(Date.UTC(j!, m! - 1, t! + n))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}
const STATUS_ZEILE: Record<Positionszustand, string> = { laufend: '● läuft', abgeschlossen: 'vorbei', geplant: 'geplant', ruht: 'ruht' }
const KALENDER = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
)

/** G-644 Teil 2: eine Wache als Zeile des Entwurfs — „Regel → Folge" links, Stand rechts. */
export function wacheZeile(w: Wache): { t: string; s: string } {
  const pz = (n: number | null | undefined) => n == null ? '–' : `${n.toLocaleString('de-DE', { maximumFractionDigits: 1 })} %`
  const st = w.status === 'keine_daten' ? 'keine Daten' : w.status === 'ausgeloest' ? 'ausgelöst' : 'ok'
  if (w.key === 'kraftverlust_4w')
    // `wert_pct` ist der Verlust (prior − recent) / prior — der Entwurf zeigt die Veraenderung („ok · −2 %")
    return { t: `Kraftverlust > ${pz(w.grenze_pct)} in 4 Wochen → Defizit senken / Überschuss erhöhen`,
      s: w.wert_pct == null ? st : `${st} · ${w.wert_pct > 0 ? '−' : w.wert_pct < 0 ? '+' : '±'}${pz(Math.abs(w.wert_pct))}` }
  if (w.key === 'trend_3w')
    return { t: `Trend ${w.grenze_wochen ?? 3} Wochen neben Soll → ±100 kcal`,
      s: w.status === 'ausgeloest' ? `ausgelöst KW ${kalenderwoche(w.stand_am)}` : w.status === 'ok' ? `ok · ${w.wochen_neben_soll ?? 0} von ${w.grenze_wochen ?? 3}` : st }
  return { t: w.richtung === 'min' ? `Körperfett < ${pz(w.grenze_pct)}` : `Körperfett > ${pz(w.grenze_pct)} → Mini Cut vorschlagen`,
    s: w.wert_pct == null ? st : `${st} · ${pz(w.wert_pct)}` }
}

/**
 * G-627: Anpassung und Grund einer Woche aus dem Protokoll (`goal_weekly_adjustments_at`).
 * `anp: null` heisst „kommt" — die Kette ist nicht live. Eine laufende Woche hat noch keine Zeile.
 */
export function anpassungZeile(protokoll: Anpassungswoche[] | null | undefined, wocheAb: string, vollstaendig: boolean, juengste = false): { anp: string | null; grund: string; regel: string | null } {
  if (!protokoll) return { anp: null, grund: '–', regel: null }
  const z = protokoll.find(x => x.week_start === wocheAb)
  // Die juengste Woche endet am Stichtag: der Tageslauf (G-660) schreibt sie erst nach Mitternacht
  if (!z && vollstaendig && juengste) return { anp: '—', grund: 'Protokoll folgt nach dem Tageslauf', regel: null }
  if (!z) return vollstaendig ? { anp: '—', grund: 'kein Protokoll für diese Woche', regel: null } : { anp: '—', grund: 'Woche läuft noch', regel: null }
  const vz = (n: number) => `${n > 0 ? '+' : '−'}${Math.abs(n)}`
  const teile = [z.kcal_delta !== 0 ? `${vz(z.kcal_delta)} kcal` : null, z.protein_delta_g !== 0 ? `${vz(z.protein_delta_g)} g Protein` : null].filter(Boolean)
  return { anp: teile.length ? teile.join(' · ') : 'keine', grund: z.reason, regel: z.rule_key }
}

/** G-644 Teil 2: der Plantyp aus `ausgangspunkt_name`; ohne ihn (vor der Kette) die Phasenzahl. */
const planTyp = (p: Plan) => p.typ ?? `${p.positionen.length} ${p.positionen.length === 1 ? 'Phase' : 'Phasen'}`

function Kommt({ was, punkt }: { was?: string; punkt: string }) {
  return <span className="ge-kommt" data-kommt={punkt}>{was ? `${was} — ` : ''}kommt ({punkt})</span>
}
function Satz({ r }: { r: Planergebnis | null }) {
  return r && !r.ok ? <div data-plan-fehler style={{ fontSize: 11.5, color: 'var(--neg)' }}>{r.fehler}</div> : null
}

/** Werte einer Position: Stufe (`sub_phases`), eigene Werte oder Katalog. `null` heisst „keine Vorgabe". */
function wertzeilen(p: Pick<Planposition, 'strategie_code' | 'eigene_werte' | 'sub_phase_code' | 'zielrate_pct_kg_woche'>, strategien: Strategie[]): Wertzeile[] {
  if (p.eigene_werte) return eigeneWerte(p.eigene_werte)
  const s = strategien.find(x => x.code === p.strategie_code)
  const t = p.sub_phase_code ? s?.sub_phases.find(x => x.name === p.sub_phase_code)?.roh : null
  if (t) {
    const n = (k: string) => (typeof t[k] === 'number' ? (t[k] as number).toLocaleString('de-DE') : null)
    const c = t.cardio as { type?: string; sessions_per_week?: number[] } | undefined
    return [
      { label: 'kcal', wert: typeof t.tdee_multiplier === 'number' ? `${Math.round((t.tdee_multiplier - 1) * 100)} %`.replace('-', '−') : null },
      { label: 'Protein', wert: n('protein_g_per_kg') && `${n('protein_g_per_kg')} g/kg` },
      { label: 'Fett', wert: n('fat_g_per_kg') && `${n('fat_g_per_kg')} g/kg` },
      { label: 'Cardio', wert: c?.sessions_per_week ? `${c.sessions_per_week.join('–')}× ${c.type ?? ''}`.trim() : null },
    ]
  }
  return s ? katalogwerte(s, p.zielrate_pct_kg_woche) : []
}
function Werte({ p, strategien }: { p: Parameters<typeof wertzeilen>[0] & { id: string }; strategien: Strategie[] }) {
  return (
    <div data-programmwerte={p.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
      <span style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>Werte des Programms:</span>
      {wertzeilen(p, strategien).map(z => (
        <span key={z.label} className="ge-chip" style={{ background: 'var(--bg)' }}>
          <span style={{ color: 'var(--fg-subtle)' }}>{z.label}</span>{' '}
          {z.wert === null ? <i data-keine-vorgabe>keine Vorgabe</i> : <b className="ge-num">{z.wert}</b>}</span>
      ))}
    </div>
  )
}

const wochen = (p: Plan) => p.positionen.reduce((a, x) => a + (x.duration_weeks ?? 0), 0)
const beginn = (p: Plan) => p.positionen.map(x => x.gueltig_ab).filter((x): x is string => !!x).sort()[0] ?? null
const ende = (p: Plan) => p.positionen.map(x => x.projected_end_date).filter((x): x is string => !!x).sort().at(-1) ?? null
const aTermin = (p: Plan) => p.termine.filter(t => t.kind === 'A').map(t => t.event_date).sort()[0] ?? null

function Segmente({ plan, hoehe }: { plan: Plan; hoehe: number }) {
  return (
    <div data-plan-segmente={plan.id} style={{ display: 'flex', height: hoehe, borderRadius: 999, overflow: 'hidden', gap: 2 }}>
      {plan.positionen.map(p => <span key={p.id} style={{ flex: p.duration_weeks ?? 4, background: programmFarbe(p), opacity: p.zustand === 'abgeschlossen' ? 0.55 : 1 }} />)}
    </div>
  )
}

// ── Aktiver Plan: Achse und Details ──────────────────────────────

function Achse({ plan, stichtag, strategien }: { plan: Plan; stichtag: string; strategien: Strategie[] }) {
  const a = zeitachse(plan.positionen, plan.termine, stichtag)
  const m = monatsachse(a.von, a.bis)
  const laufend = plan.positionen.find(p => p.zustand === 'laufend')
  return (
    <div style={{ overflowX: 'auto' }}>
      <div data-plan-zeitachse={plan.id} style={{ minWidth: 900, position: 'relative' }}>
        <div data-plan-monate={m.monate.length} style={{ display: 'grid', gridTemplateColumns: `repeat(${m.monate.length},minmax(0,1fr))`, fontSize: 11,
          color: 'var(--fg-subtle)', borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
          {m.monate.map((x, i) => <span key={i}>{x}</span>)}
        </div>
        <div style={{ position: 'relative', height: 72, marginTop: 8 }}>
          {plan.positionen.filter(p => p.gueltig_ab).map(p => {
            const l = m.pos(p.gueltig_ab!), r = m.pos(p.projected_end_date ?? tagPlus(stichtag, 28))
            return (
              <div key={p.id} data-segment={p.zustand} style={{ position: 'absolute', top: 6, left: `${l}%`, width: `${Math.max(1, r - l)}%`, height: 28,
                borderRadius: 6, fontSize: 11, fontWeight: 600, padding: '0 6px', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden',
                boxSizing: 'border-box', background: programmFarbe(p), color: PROGRAMM_TEXT,
                outline: p === laufend ? '2px solid var(--fg)' : undefined, opacity: p.zustand === 'abgeschlossen' ? 0.55 : 1 }}>
                {phasenname(p, strategien)}{p.duration_weeks ? ` · ${p.duration_weeks} Wo` : ''}
              </div>
            )
          })}
          {plan.termine.map(t => (
            <div key={t.id} data-termin-marke={t.kind} style={{ position: 'absolute', top: 40, left: `${m.pos(t.event_date)}%`, transform: 'translateX(-50%)',
              fontSize: 10.5, whiteSpace: 'nowrap', color: t.kind === 'A' ? 'var(--neg)' : 'var(--fg-muted)', fontWeight: t.kind === 'A' ? 700 : 400 }}>
              ▲ {t.kind === 'S' ? '' : `${t.kind} `}{t.name}</div>
          ))}
          <div title={`heute ${dstr(stichtag)}`} style={{ position: 'absolute', top: 0, height: 40, left: `${m.pos(stichtag)}%`, width: 2, background: 'var(--neg)' }} />
        </div>
      </div>
    </div>
  )
}

const kg1 = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const vzKg = (n: number | null) => (n === null ? '—' : `${n > 0 ? '+' : n < 0 ? '−' : '±'}${Math.abs(n).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)

function Details({ plan, strategien, alsNaechstes, ausblick, wachen }: { plan: Plan; strategien: Strategie[]; alsNaechstes: React.ReactNode | null; ausblick: Ausblick | null; wachen: Wache[] | null }) {
  return (
    <div data-plan-details={plan.id} style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ overflowX: 'auto' }}><div className="ge-eb" style={{ marginBottom: 4 }}>Phasen</div>
        <table className="ge-tbl" style={{ minWidth: 640 }}>
          <thead><tr><th>Phase</th><th>Wochen</th><th>Beginn</th><th>Ende</th><th>Defizit / Überschuss</th><th>Cardio</th><th>Status</th></tr></thead>
          <tbody>
            {plan.positionen.map(p => (
              <tr key={p.id} data-position-zeile={p.zustand} style={p.zustand === 'laufend' ? { background: 'color-mix(in oklab, var(--acc-goals) 8%, var(--surface))' } : undefined}>
                <td style={{ fontWeight: 600 }}>{phasenname(p, strategien)}</td>
                <td className="ge-num">{p.duration_weeks ?? 'offen'}</td>
                <td className="ge-num">{dstr(p.gueltig_ab)}</td><td className="ge-num">{dstr(p.projected_end_date)}</td>
                <td className="ge-num" data-defizit>{defizitText(p, strategien)}</td><td className="ge-num" data-cardio>{cardioText(p, strategien)}</td>
                <td>{STATUS_ZEILE[p.zustand]}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
        <div style={{ flex: '1 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}><span className="ge-eb">Wachen der aktuellen Phase</span>
          {/* G-644 Teil 2: `goal_phase_guards_at` — Regel → Folge, rechts der Stand */}
          {wachen === null ? <div style={{ fontSize: 12.5, padding: '4px 0', color: 'var(--fg-subtle)' }} data-wachen-leer>keine laufende Phase</div>
            : wachen.filter(w => w.status !== 'nicht_anwendbar').map(w => { const z = wacheZeile(w); return (
              <div key={w.key} data-wache={w.key} data-wache-status={w.status} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12.5, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                <span>{z.t}</span><span className="ge-num" style={{ whiteSpace: 'nowrap', color: w.status === 'ok' ? 'var(--pos)' : w.status === 'ausgeloest' ? 'var(--warn)' : 'var(--fg-subtle)' }}>{z.s}</span>
              </div>) })}</div>
        {alsNaechstes && <div style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}><span className="ge-eb">Als nächstes</span>
          <div data-als-naechstes style={{ background: 'color-mix(in oklab, var(--acc-goals) 8%, var(--surface))', borderRadius: 8, padding: '10px 12px', fontSize: 12.5 }}>{alsNaechstes}</div></div>}
      </div>
      <div style={{ overflowX: 'auto' }}><div className="ge-eb" style={{ marginBottom: 4 }}>Wöchentliche Anpassung · feste Regeln, keine KI</div>
        <table className="ge-tbl" style={{ minWidth: 600 }}>
          <thead><tr><th>Woche</th><th>Trend Δ</th><th>Soll Δ</th><th>Logtage</th><th>Anpassung</th><th>Grund</th></tr></thead>
          <tbody>
            {ausblick === null && <tr data-anpassung-kommt><td colSpan={6}><Kommt was="Wochenwerte" punkt="G-650" /></td></tr>}
            {/* Trend Δ, Soll Δ, Logtage aus `controlling_goal_outlook` (G-650); Anpassung und Grund aus dem Protokoll (G-627) */}
            {[...(ausblick?.wochen ?? [])].reverse().slice(0, 3).map(w => {
              const a = anpassungZeile(plan.anpassungen, w.woche_ab, w.vollstaendig, w.woche_ab === ausblick?.wochen.at(-1)?.woche_ab)
              return (
                <tr key={w.woche_ab} data-anpassung-woche={w.woche_ab} data-anpassung-regel={a.regel ?? ''}>
                  <td>KW {kalenderwoche(w.woche_ab)}</td><td className="ge-num">{vzKg(w.trend_delta_kg)}</td><td className="ge-num">{vzKg(w.soll_delta_kg)}</td>
                  <td className="ge-num">{w.logtage}/7</td><td className="ge-num" style={{ fontWeight: 600 }}>{a.anp ?? <Kommt punkt="G-627" />}</td><td>{a.grund}</td>
                </tr>
              )
            })}
          </tbody>
        </table></div>
    </div>
  )
}

// ── Bearbeiten: eine Position anlegen / ab Stichtag aendern ──────

type Formular = { code: string; wochen: string; werte: Record<string, string> }
// `custom` fehlt bewusst: seine Vorschau ist G-624 und noch nicht in der Kette.
const auswahl = (strategien: Strategie[]) => strategien.filter(s => s.code !== 'custom')
function alsDaten(f: Formular, strategien: Strategie[]) {
  const s = strategien.find(x => x.code === f.code) ?? null
  const eigen = !!s && s.code.startsWith('eigene_werte_')
  const phase_type = s ? phasenartFuerStrategie(s.code, s.category) ?? 'maintenance' : 'maintenance'
  const werte: Record<string, number> = {}
  for (const [k, v] of Object.entries(f.werte)) { const n = Number(v.replace(',', '.')); if (v.trim() !== '' && Number.isFinite(n)) werte[k] = n }
  const w = Number(f.wochen)
  return {
    s, eigen, phase_type, richtung: richtungFuer(s?.auswahl_gruppe ?? null, phase_type),
    strategie_code: eigen ? null : s?.code ?? null, eigene_werte: eigen ? werte : null,
    duration_weeks: Number.isInteger(w) && w > 0 ? w : null,
    zielrate: eigen ? null : s?.weight_change_target_percent ?? null,
  }
}

function PositionFormular({ plan, strategien, startKg, stichtag, art, position, onFertig }: {
  plan: Plan; strategien: Strategie[]; startKg: number | null; stichtag: string
  art: 'neu' | 'aendern'; position?: Planposition; onFertig: () => void
}) {
  const [f, setF] = React.useState<Formular>({ code: position?.strategie_code ?? '', wochen: String(position?.duration_weeks ?? 4), werte: {} })
  const [ab, setAb] = React.useState(tagPlus(stichtag, 1))
  const [pruefung, setPruefung] = React.useState<Pruefung | null>(null)
  const [haken, setHaken] = React.useState<Set<string>>(new Set())
  const [r, setR] = React.useState<Planergebnis | null>(null)
  const [laeuft, setLaeuft] = React.useState(false)
  const d = alsDaten(f, strategien)
  const naechste = naechstePosition(plan.positionen, stichtag)
  const von = art === 'aendern' ? ab : naechste.gueltig_ab
  const bis = d.duration_weeks ? tagPlus(von, d.duration_weeks * 7 - 1) : null

  // Grenzen nur aus der Kette — wie „Ziel setzen" (G-628 Teil 2).
  React.useEffect(() => {
    if (!d.s || startKg === null) { setPruefung(null); return }
    const t = setTimeout(() => {
      void zielPruefenAktion({
        richtung: d.richtung, startKg, zielKg: plan.ziel?.target_value ?? null, startdatum: von, zieldatum: bis,
        programm: d.strategie_code, tempo: d.zielrate, eigeneWerte: d.eigene_werte,
      }).then(setPruefung)
    }, 350)
    return () => clearTimeout(t)
  }, [f.code, f.wochen, JSON.stringify(f.werte), von]) // eslint-disable-line react-hooks/exhaustive-deps

  const speichern = async () => {
    if (!d.s) return
    setLaeuft(true); setR(null)
    const bestaetigt = bestaetigteSchluessel(pruefung, haken)
    const x = art === 'aendern' && position
      ? await positionAendernAbAktion(position.id, {
        strategie_code: d.strategie_code, eigene_werte: d.eigene_werte, duration_weeks: d.duration_weeks,
        confirmed_warnings: bestaetigt, stichtag: ab, zielrate_pct_kg_woche: d.zielrate,
      })
      : await positionSpeichernAktion(plan.id, null, {
        position: naechste.position, strategie_code: d.strategie_code, eigene_werte: d.eigene_werte, richtung: d.richtung,
        phase_type: d.phase_type, duration_weeks: d.duration_weeks, gueltig_ab: von, projected_end_date: bis,
        confirmed_warnings: bestaetigt, zielrate_pct_kg_woche: d.zielrate,
      })
    setLaeuft(false)
    if (!x.ok && /G626_(BLOCK|CONFIRM):/.test(x.roh)) {
      setR({ ...x, fehler: waechterSatz(x.roh, pruefung?.stand === 'geprueft' ? pruefung.befunde : []) ?? x.fehler })
      return
    }
    setR(x)
    if (x.ok) onFertig()
  }

  const gruppen = Array.from(new Set(auswahl(strategien).map(s => s.auswahl_gruppe ?? '—')))
  return (
    <div data-position-formular={art} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <b style={{ fontSize: 12.5 }}>{art === 'aendern' ? `„${position ? phasenname(position, strategien) : ''}“ ab Stichtag ändern` : `Neue Phase an Stelle ${naechste.position}`}</b>
      {art === 'neu' && naechste.offenesEnde && (
        <span style={{ fontSize: 11.5, color: 'var(--fg-subtle)' }} data-offenes-ende>Die letzte Phase hat kein Ende — die neue beginnt heute; die Kette ordnet sie ein.</span>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: art === 'aendern' ? 'minmax(0,2fr) auto minmax(0,1fr) minmax(0,1.5fr)' : 'minmax(0,2fr) auto minmax(0,1.5fr)', gap: 8, alignItems: 'center' }}>
        <select className="ge-inp" aria-label="Programm" data-position-feld="programm" value={f.code} onChange={e => setF({ ...f, code: e.target.value, werte: {} })}>
          <option value="">wählen …</option>
          {gruppen.map(g => (
            <optgroup key={g} label={g}>
              {auswahl(strategien).filter(s => (s.auswahl_gruppe ?? '—') === g).map(s => <option key={s.code} value={s.code}>{s.label}</option>)}
            </optgroup>
          ))}
        </select>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button type="button" className="ge-btn ge-ico" aria-label="Woche weniger" onClick={() => setF({ ...f, wochen: String(Math.max(1, (d.duration_weeks ?? 1) - 1)) })}>−</button>
          <span className="ge-num" data-position-feld="wochen" style={{ minWidth: 56, textAlign: 'center' }}>{d.duration_weeks ?? '–'} Wo</span>
          <button type="button" className="ge-btn ge-ico" aria-label="Woche mehr" onClick={() => setF({ ...f, wochen: String((d.duration_weeks ?? 0) + 1) })}>+</button>
        </div>
        {art === 'aendern' && <input className="ge-inp ge-num" type="date" aria-label="ab" data-position-feld="ab" value={ab} min={stichtag} onChange={e => setAb(e.target.value)} />}
        <span className="ge-num" style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{dstr(von)} – {dstr(bis)}</span>
      </div>
      {d.s && !d.eigen && <Werte p={{ id: 'vorschau', strategie_code: d.s.code, eigene_werte: null, sub_phase_code: null, zielrate_pct_kg_woche: d.zielrate }} strategien={strategien} />}
      {d.eigen && (
        <div data-eigene-werte style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 8 }}>
          {EIGENE_WERTE.map(w => (
            <div key={w.key}><label className="ge-lbl" htmlFor={`pf-${w.key}`}>{w.label}</label>
              <input id={`pf-${w.key}`} className="ge-inp ge-num" data-eigener-wert={w.key} inputMode="decimal" value={f.werte[w.key] ?? ''}
                     onChange={e => setF({ ...f, werte: { ...f.werte, [w.key]: e.target.value } })} /></div>
          ))}
        </div>
      )}
      {startKg === null && <span style={{ fontSize: 11.5, color: 'var(--fg-subtle)' }}>Ohne Gewichtsmessung prüft erst die Datenbank beim Speichern.</span>}
      <Befunde pruefung={pruefung} bestaetigt={haken} setBestaetigt={setHaken} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="ge-btn ge-btn-p" data-position-speichern
                disabled={laeuft || !d.s || (startKg !== null && !weiterErlaubt(pruefung, haken))}
                onClick={() => { void speichern() }}>{art === 'aendern' ? 'Ab Stichtag ändern' : 'Phase anlegen'}</button>
        <button type="button" className="ge-btn" onClick={onFertig}>Abbrechen</button>
      </div>
      <Satz r={r} />
    </div>
  )
}

function Terminzeile({ t }: { t: Plan['termine'][number] & { plan_id: string } }) {
  const [name, setName] = React.useState(t.name)
  const [r, setR] = React.useState<Planergebnis | null>(null)
  const sichern = async (n: string, kind: string, datum: string) => setR(await terminSpeichernAktion(t.plan_id, t.id, n, kind, datum))
  return (
    <>
      {/* die Art braucht ihren ganzen Text („Wettkampf A · Hauptwettkampf") — sonst schneidet die Auswahl ab */}
      <div data-termin={t.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(260px,1.3fr) minmax(150px,1fr) 36px', gap: 8, alignItems: 'center' }}>
        <input className="ge-inp" aria-label="Name des Termins" value={name} onChange={e => setName(e.target.value)}
               onBlur={() => { if (name.trim() && name !== t.name) void sichern(name.trim(), t.kind, t.event_date) }} />
        <select className="ge-inp" aria-label="Art" data-termin-feld="art" value={t.kind} onChange={e => { void sichern(t.name, e.target.value, t.event_date) }}>
          {(Object.keys(TERMIN_ART) as Terminart[]).map(k => <option key={k} value={k}>{TERMIN_ART[k]}</option>)}
        </select>
        <input type="date" className="ge-inp ge-num" aria-label="Datum" value={t.event_date} onChange={e => { if (e.target.value) void sichern(t.name, t.kind, e.target.value) }} />
        <button type="button" className="ge-btn ge-btn-g ge-ico" aria-label="Termin löschen" data-termin-loeschen={t.id}
                onClick={async () => setR(await terminLoeschenAktion(t.id))}>✕</button>
      </div>
      <Satz r={r} />
    </>
  )
}

/** G-649 (aus `PhaseBeenden`, G-645): die laufende Phase mit Grund beenden — `goal_phase_end` weist einen leeren Grund ab. */
function PhaseBeendenFormular({ phaseId, stichtag, ab, onFertig, melde }: {
  phaseId: string; stichtag: string; ab: string | null; onFertig: () => void; melde: (s: string) => void
}) {
  const [grund, setGrund] = React.useState('')
  const [ende, setEnde] = React.useState(stichtag)
  const [fehler, setFehler] = React.useState('')
  const [laeuft, setLaeuft] = React.useState(false)
  return (
    <div data-phase-beenden-formular style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr) auto auto', gap: 8, alignItems: 'center' }}>
      <input className="ge-inp" aria-label="Grund" data-phasenfeld="grund" placeholder="Grund, z. B. Zielgewicht erreicht" value={grund} onChange={e => setGrund(e.target.value)} />
      <input type="date" className="ge-inp ge-num" aria-label="Endet am" data-phasenfeld="endedatum" value={ende} min={ab ?? undefined} onChange={e => setEnde(e.target.value)} />
      <button type="button" className="ge-btn ge-btn-p" data-phase-beenden disabled={laeuft || !grund.trim()}
              onClick={async () => {
                setLaeuft(true); setFehler('')
                const r = await phaseBeendenAktion(phaseId, grund.trim(), ende)
                setLaeuft(false)
                if (r.ok) { melde('Phase beendet.'); onFertig() } else setFehler(r.text)
              }}>Phase beenden</button>
      <button type="button" className="ge-btn" onClick={onFertig}>Abbrechen</button>
      {fehler && <span style={{ gridColumn: '1 / -1', fontSize: 11.5, color: 'var(--neg)' }}>{fehler}</span>}
    </div>
  )
}

function Bearbeiten({ plan, strategien, startKg, stichtag, vorlagenLive, onFertig, melde }: {
  plan: Plan; strategien: Strategie[]; startKg: number | null; stichtag: string; vorlagenLive: boolean
  onFertig: () => void; melde: (s: string) => void
}) {
  const [name, setName] = React.useState(plan.name)
  const [formular, setFormular] = React.useState<{ art: 'neu' | 'aendern'; position?: Planposition } | null>(null)
  const [frage, setFrage] = React.useState(false)
  const [beenden, setBeenden] = React.useState(false)
  const [r, setR] = React.useState<Planergebnis | null>(null)
  // G-644 Teil 2: Programm und Wochen geplanter Phasen, erst mit „Speichern und neu berechnen" geschrieben
  const [aend, setAend] = React.useState<Record<string, { code: string | null; wo: number }>>({})
  const geplant = plan.positionen.filter(p => p.zustand === 'geplant')
  const wahl = (p: Planposition) => aend[p.id] ?? { code: p.strategie_code, wo: p.duration_weeks ?? 4 }
  const setze = (p: Planposition, x: Partial<{ code: string | null; wo: number }>) => setAend(a => ({ ...a, [p.id]: { ...wahl(p), ...x } }))
  const programme = strategien.filter(x => !x.code.startsWith('eigene_werte') && x.code !== 'custom' && x.code !== 'expert_bb_annual')
  const neuBerechnen = async () => {
    for (const p of plan.positionen.filter(x => aend[x.id])) {
      const x = await positionNeuBerechnenAktion(p.id, aend[p.id]!.code, p.eigene_werte, aend[p.id]!.wo)
      if (!x.ok) { setR(x); return }
    }
    setAend({}); aus({ ok: true, id: plan.id }, `„${plan.name}“ neu berechnet.`)
  }
  const aus = (x: Planergebnis, satz: string, schliessen = true) => { setR(x); if (x.ok) { melde(satz); if (schliessen) onFertig() } }
  const fehler = plan.termine.length === 0 && plan.positionen.some(p => p.strategie_code === 'contest_prep')
    ? 'Dieser Plan rechnet vom Hauptwettkampf rückwärts – lege einen Termin der Art „Wettkampf A“ an.' : ''
  return (
    <section aria-label="Plan bearbeiten" data-plan-bearbeiten={plan.id} className="ge-card"
             style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, border: '2px solid var(--fg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="ge-eb">Bearbeiten · {plan.status === 'aktiv' ? 'aktiver Plan' : PLAN_STATUS_TEXT[plan.status]}</span>
        <button type="button" className="ge-btn ge-btn-g ge-ico" aria-label="Schließen" onClick={onFertig}>✕</button>
      </div>
      <div><label className="ge-lbl" htmlFor="ed-name">Name</label>
        <input id="ed-name" className="ge-inp" style={{ maxWidth: 420 }} value={name} onChange={e => setName(e.target.value)} /></div>

      <div data-plan-termine style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="ge-lbl" style={{ margin: 0 }}>Termine · frei benennbar</span>
        {plan.termine.map(t => <Terminzeile key={`${t.id}-${t.kind}-${t.event_date}`} t={{ ...t, plan_id: plan.id }} />)}
        <button type="button" className="ge-btn" data-termin-anlegen style={{ alignSelf: 'flex-start' }}
                onClick={async () => setR(await terminSpeichernAktion(plan.id, null, 'Neuer Termin', 'X', tagPlus(stichtag, 56)))}>+ Termin</button>
        <div style={{ fontSize: 11.5, color: 'var(--fg-subtle)' }}>A: der Plan rechnet vom ersten A-Termin rückwärts · B: kurzer Peak ohne neue Prep · Sperrtermin: wird Diätpause
          {' '}<Kommt was="Verschieben bei geändertem Termin, Sperrtermin als Pause" punkt="G-644" /></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="ge-lbl" style={{ margin: 0 }}>Phasen</span>
        {plan.positionen.map(p => (
          <div key={p.id} data-bearbeiten-position={p.zustand} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Flex mit Umbruch: an der laufenden Phase stehen zwei Knoepfe — im Raster brach dort das Datum um */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              {p.zustand === 'geplant' && !p.eigene_werte ? (
                <select className="ge-inp" aria-label="Programm" data-position-programm={p.id} style={{ flex: '1 1 140px', maxWidth: 260 }}
                        value={wahl(p).code ?? ''} onChange={e => setze(p, { code: e.target.value })}>
                  {!programme.some(x => x.code === p.strategie_code) && <option value={p.strategie_code ?? ''}>{phasenname(p, strategien)}</option>}
                  {programme.map(x => <option key={x.code} value={x.code}>{x.label}</option>)}
                </select>
              ) : <b style={{ fontSize: 13, flex: '1 1 140px' }}>{phasenname(p, strategien)}</b>}
              {p.zustand === 'geplant' ? (
                <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                  <button type="button" className="ge-btn ge-ico" aria-label="Woche weniger" data-position-minus={p.id} disabled={wahl(p).wo <= 1} onClick={() => setze(p, { wo: wahl(p).wo - 1 })}>−</button>
                  <span className="ge-num" data-position-wochen={p.id} style={{ minWidth: 56, textAlign: 'center' }}>{wahl(p).wo} Wo</span>
                  <button type="button" className="ge-btn ge-ico" aria-label="Woche mehr" data-position-plus={p.id} disabled={wahl(p).wo >= 520} onClick={() => setze(p, { wo: wahl(p).wo + 1 })}>+</button>
                </span>
              ) : <span className="ge-num" style={{ minWidth: 56, textAlign: 'center' }}>{p.duration_weeks ? `${p.duration_weeks} Wo` : 'offen'}</span>}
              <span className="ge-num" data-position-zeitraum style={{ fontSize: 12, color: 'var(--fg-muted)', whiteSpace: 'nowrap' }}>{dstr(p.gueltig_ab)} – {dstr(p.projected_end_date)} · {STATUS_ZEILE[p.zustand]}</span>
              <span style={{ display: 'inline-flex', gap: 2, marginLeft: 'auto' }}>
                {p.zustand === 'geplant' && <>
                  <button type="button" className="ge-btn ge-btn-g ge-ico" data-position-hoch={p.id} aria-label="früher"
                          disabled={p.position <= Math.min(...geplant.map(x => x.position))}
                          onClick={async () => setR(await positionVerschiebenAktion(p.id, p.position - 1))}>↑</button>
                  <button type="button" className="ge-btn ge-btn-g ge-ico" data-position-runter={p.id} aria-label="später"
                          disabled={p.position >= Math.max(...plan.positionen.map(x => x.position))}
                          onClick={async () => setR(await positionVerschiebenAktion(p.id, p.position + 1))}>↓</button>
                  {vorlagenLive
                    ? <button type="button" className="ge-btn ge-btn-g ge-ico" data-position-loeschen={p.id} aria-label="Phase entfernen"
                              onClick={async () => setR(await positionLoeschenAktion(p.id))}>✕</button>
                    : <Kommt was="Entfernen" punkt="G-644" />}
                </>}
                {p.zustand === 'laufend' && plan.status === 'aktiv' && <>
                  <button type="button" className="ge-btn" data-position-aendern={p.id} onClick={() => setFormular({ art: 'aendern', position: p })}>ab Stichtag ändern</button>
                  {p.goal_phase_id && <button type="button" className="ge-btn" data-phase-beenden-oeffnen={p.id} onClick={() => setBeenden(b => !b)}>Phase beenden</button>}
                </>}
              </span>
            </div>
            {beenden && p.zustand === 'laufend' && p.goal_phase_id && (
              <PhaseBeendenFormular phaseId={p.goal_phase_id} stichtag={stichtag} ab={p.gueltig_ab} onFertig={() => setBeenden(false)} melde={melde} />
            )}
            <Werte p={p} strategien={strategien} />
          </div>
        ))}
        {formular ? (
          <PositionFormular plan={plan} strategien={strategien} startKg={startKg} stichtag={stichtag}
                            art={formular.art} position={formular.position} onFertig={() => setFormular(null)} />
        ) : (
          <button type="button" className="ge-btn" data-phase-anlegen style={{ alignSelf: 'flex-start' }} onClick={() => setFormular({ art: 'neu' })}>+ Phase</button>
        )}
      </div>

      {fehler && <div className="ge-hinweis-rot" style={{ padding: '10px 12px', fontSize: 12.5 }}><b>{fehler}</b></div>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" className="ge-btn ge-btn-p" data-plan-speichern
                  onClick={async () => { if (name.trim() && name.trim() !== plan.name) aus(await planUmbenennenAktion(plan.id, name.trim()), `„${name.trim()}“ gespeichert.`); else onFertig() }}>Speichern</button>
          <button type="button" className="ge-btn" data-plan-neu-berechnen disabled={Object.keys(aend).length === 0}
                  onClick={() => { void neuBerechnen() }}>Speichern und neu berechnen</button>
          {vorlagenLive
            ? <button type="button" className="ge-btn" data-plan-als-vorlage
                      onClick={async () => aus(await planAlsVorlageAktion(plan.id, plan.name), `„${plan.name}“ als eigene Vorlage gespeichert.`, false)}>Als Vorlage speichern</button>
            : <Kommt was="Als Vorlage speichern" punkt="G-644" />}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {plan.status === 'aktiv' && <>
            <button type="button" className="ge-btn" data-plan-pausieren
                    onClick={async () => aus(await planPausierenAktion(plan.id), 'Plan pausiert. Kein Plan aktiv – Erhaltung mit Warnung.')}>Pausieren</button>
            <button type="button" className="ge-btn" data-plan-beenden
                    onClick={async () => aus(await planBeendenAktion(plan.id), 'Plan beendet und unter „Abgeschlossene Pläne“ abgelegt.')}>Beenden</button>
          </>}
          {/* `goal_plan_delete` loescht nur Entwuerfe (G625_BLOCK:nur_entwurf_loeschbar) */}
          {plan.status === 'entwurf' && <button type="button" className="ge-btn ge-btn-r" data-plan-loeschen onClick={() => setFrage(f => !f)}>Löschen</button>}
        </div>
      </div>
      {frage && (
        <div data-plan-frage="loeschen" className="ge-hinweis-rot" style={{ padding: '10px 12px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Plan „{plan.name}“ mit allen Phasen endgültig löschen?</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="ge-btn" onClick={() => setFrage(false)}>Abbrechen</button>
            <button type="button" className="ge-btn ge-btn-r" data-plan-frage-ja
                    onClick={async () => aus(await planLoeschenAktion(plan.id), `Plan „${plan.name}“ gelöscht.`)}>Endgültig löschen</button>
          </div>
        </div>
      )}
      <Satz r={r} />
    </section>
  )
}

// ── Neuer Plan ───────────────────────────────────────────────────

function NeuerPlan({ ziele, vorlagen, stichtag, onZu, onAngelegt, vomTermin }: {
  ziele: ZielFortschritt[]; vorlagen: Vorlage[] | null; stichtag: string
  onZu: () => void; onAngelegt: (id: string | null, name: string) => void; vomTermin?: React.ReactNode
}) {
  // Am steuernden Ziel (Tom, G-644 16.10.): das laufende, sonst das ruhende.
  const steuer = ziele.find(z => z.goal_role === 'controlling' && z.zustand.zustand === 'active')
    ?? ziele.find(z => z.goal_role === 'controlling' && ['paused', 'on_hold'].includes(z.zustand.zustand ?? ''))
  const [name, setName] = React.useState('Neuer Plan')
  const [quelle, setQuelle] = React.useState(vorlagen?.[0]?.code ?? '')
  const v = vorlagen?.find(x => x.code === quelle) ?? null
  // Vorbelegung wie der Entwurf: A-Termin in 20 Wochen, sonst Beginn in einer Woche.
  const [anker, setAnker] = React.useState<{ A: string; start: string }>({ A: tagPlus(stichtag, 140), start: tagPlus(stichtag, 7) })
  const [r, setR] = React.useState<Planergebnis | null>(null)
  const eigene = vorlagen?.filter(x => x.quelle === 'eigen') ?? []
  const info = (x: Vorlage) => {
    const w = x.positionen.reduce((a, p) => a + p.dauer_wochen, 0)
    return `${x.quelle === 'lumeos' ? 'LumeOS-Standard' : 'eigene'} · ${x.positionen.length} ${x.positionen.length === 1 ? 'Phase' : 'Phasen'}, ${w} Wochen${x.anker_art === 'A' ? ', rückwärts vom Wettkampf' : ''}`
  }
  const knopf = (k: { code: string; n: string; i: string; aus: boolean }) => (
    <button key={k.code} type="button" data-ausgangspunkt={k.code} disabled={k.aus} aria-pressed={quelle === k.code} onClick={() => setQuelle(k.code)}
            style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: quelle === k.code ? '2px solid var(--acc-goals)' : '1px solid var(--border)',
              background: quelle === k.code ? 'color-mix(in oklab, var(--acc-goals) 6%, var(--surface))' : 'var(--surface)', font: 'inherit', color: 'var(--fg)',
              cursor: k.aus ? 'not-allowed' : 'pointer', minHeight: 44, opacity: k.aus ? 0.5 : 1 }}>
      <div style={{ fontWeight: 600 }}>{k.n}</div><div style={{ fontSize: 11.5, color: 'var(--fg-subtle)' }}>{k.i}</div>
    </button>
  )
  const anlegen = async () => {
    if (!steuer) return
    const x = vorlagen === null || !v
      ? await planAnlegenAktion(steuer.goal_id, name.trim())
      : await planAnlegenAusAktion(steuer.goal_id, name.trim(), v.code, v.anker_art === 'A' ? anker.A : anker.start)
    setR(x)
    if (x.ok) onAngelegt(x.id, name.trim())
  }
  return (
    <section aria-label="Neuer Plan" data-neuer-plan className="ge-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, border: '2px solid var(--acc-goals)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="ge-eb">Neuer Plan · wird als Entwurf angelegt, aktiv erst über „Aktivieren“</span>
        <button type="button" className="ge-btn ge-btn-g ge-ico" aria-label="Schließen" onClick={onZu}>✕</button>
      </div>
      {!steuer ? (
        <span data-neuer-plan-ohne-ziel style={{ fontSize: 12.5 }}>Ein Plan hängt am steuernden Ziel — setze zuerst in Goals eine Richtung.</span>
      ) : <>
        <div><label className="ge-lbl" htmlFor="np-name">Name</label>
          <input id="np-name" className="ge-inp" style={{ maxWidth: 420 }} data-neuer-plan-feld="name" value={name} onChange={e => setName(e.target.value)} /></div>
        <div><span className="ge-lbl">Ausgangspunkt</span>
          {vorlagen === null ? <Kommt was="LumeOS-Vorlagen, eigene Vorlagen" punkt="G-644" /> : (
            <div data-ausgangspunkte={vorlagen.length} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 8 }}>
              {vorlagen.filter(x => x.quelle === 'lumeos').map(x => knopf({ code: x.code, n: x.name, i: info(x), aus: false }))}
              {eigene.length ? eigene.map(x => knopf({ code: x.code, n: x.name, i: info(x), aus: false }))
                : knopf({ code: '__eigen', n: 'Eigene Vorlage', i: 'noch keine gespeichert', aus: true })}
              {knopf({ code: '__coach', n: 'Vom Coach', i: 'kommt mit dem Coach-Modul', aus: true })}
            </div>
          )}
        </div>
        {v && (
          <div style={{ maxWidth: 220 }}>
            <label className="ge-lbl" htmlFor="np-anker">{v.anker_art === 'A' ? 'Hauptwettkampf (A-Termin) · der Plan rechnet rückwärts' : 'Beginn'}</label>
            <input id="np-anker" type="date" className="ge-inp ge-num" data-neuer-plan-feld="anker" min={stichtag}
                   value={v.anker_art === 'A' ? anker.A : anker.start} onChange={e => setAnker(a => ({ ...a, [v.anker_art]: e.target.value }))} />
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="ge-btn ge-btn-p" data-neuer-plan-anlegen disabled={!name.trim() || (vorlagen !== null && !v)}
                  onClick={() => { void anlegen() }}>Als Entwurf anlegen</button>
          <button type="button" className="ge-btn" onClick={onZu}>Abbrechen</button>
        </div>
      </>}
      <Satz r={r} />
      {/* G-645/3: „vom Termin aus" (G-615) — nur bis die Vorlagen der Kette da sind (G-644). */}
      {vorlagen === null && vomTermin}
    </section>
  )
}

// ── Weitere / abgeschlossene Plaene ──────────────────────────────

function WeitererPlan({ plan, aktiv, strategien, onBearbeiten, melde }: {
  plan: Plan; aktiv: Plan | null; strategien: Strategie[]; onBearbeiten: () => void; melde: (s: string) => void
}) {
  const [frage, setFrage] = React.useState(false)
  const [wahl, setWahl] = React.useState<'pausieren' | 'beenden' | null>(null)
  const [gelesen, setGelesen] = React.useState(false)
  const [loeschen, setLoeschen] = React.useState(false)
  const [r, setR] = React.useState<Planergebnis | null>(null)
  const a = aTermin(plan), start = beginn(plan)
  const wettkampf = plan.positionen.some(p => p.strategie_code === 'contest_prep' || p.strategie_code === 'peak_week')
  const fehler = wettkampf && !a ? 'Kein Wettkampf A eingetragen (✎).' : ''
  const gesperrt = !!fehler || (!!aktiv && !wahl) || (wettkampf && !gelesen)
  const bestaetigen = async () => {
    if (aktiv && wahl === 'beenden') { const b = await planBeendenAktion(aktiv.id); if (!b.ok) { setR(b); return } }
    const x = await planAktivierenAktion(plan.id)
    setR(x)
    if (x.ok) { setFrage(false); melde(`„${plan.name}“ ist jetzt aktiv und steuert dein Ziel in Goals.${aktiv ? ` „${aktiv.name}“ ist ${wahl === 'beenden' ? 'beendet' : 'pausiert'}.` : ''}`) }
  }
  return (
    <div data-plan-kachel={plan.status} className="ge-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div className="ge-sq ge-grau" style={{ border: '1px solid var(--border)' }}>{KALENDER}</div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="ge-typ" data-plan-typ>{planTyp(plan)}</span>
            <span className="ge-chip">{PLAN_STATUS_TEXT[plan.status]}</span>
            <button type="button" className="ge-btn ge-btn-g ge-ico" style={{ marginLeft: 'auto' }} aria-label={`${plan.name} bearbeiten`} onClick={onBearbeiten}>✎</button>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{plan.name}</div>
          <div className="ge-num" style={{ fontSize: 11.5, color: 'var(--fg-subtle)' }}>{a ? `A ${dstr(a)} · ` : ''}Start {dstr(start)} · {wochen(plan)} Wochen</div>
        </div>
      </div>
      <Segmente plan={plan} hoehe={10} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="ge-btn ge-btn-p" data-plan-aktivieren={plan.id} onClick={() => { setFrage(f => !f); setWahl(null); setGelesen(false) }}>Aktivieren</button>
        {plan.status === 'entwurf' && <button type="button" className="ge-btn ge-btn-r" data-plan-loeschen={plan.id} onClick={() => setLoeschen(l => !l)}>Löschen</button>}
      </div>
      {loeschen && (
        <div className="ge-hinweis-rot" style={{ padding: '10px 12px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Plan „{plan.name}“ mit allen Phasen endgültig löschen?</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="ge-btn" onClick={() => setLoeschen(false)}>Abbrechen</button>
            <button type="button" className="ge-btn ge-btn-r" onClick={async () => { const x = await planLoeschenAktion(plan.id); setR(x); if (x.ok) melde(`Plan „${plan.name}“ gelöscht.`) }}>Endgültig löschen</button>
          </div>
        </div>
      )}
      {frage && (
        <div data-aktivieren-frage style={{ border: '1px solid color-mix(in oklab, var(--warn) 45%, var(--border))', background: 'color-mix(in oklab, var(--warn) 7%, var(--surface))',
          borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
          {aktiv && <>
            <b>„{aktiv.name}“ steuert gerade. Was damit?</b>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['pausieren', 'beenden'] as const).map(w => (
                <button key={w} type="button" className={`ge-chip${wahl === w ? ' ge-chip-an' : ''}`} data-aktivieren-wahl={w} style={{ minHeight: 32 }} onClick={() => setWahl(w)}>{w}</button>
              ))}
            </div>
          </>}
          {wettkampf && <>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', minHeight: 32 }}>
              <input type="checkbox" data-aktivieren-gelesen checked={gelesen} onChange={() => setGelesen(g => !g)} /> Gelesen: Nur für erfahrene Wettkampf-Athleten · Coach-Betreuung empfohlen</label>
            <div><b>Dein Coach:</b> <Kommt was="Freigabe durch den Coach" punkt="G-644" /></div>
          </>}
          {fehler && <div style={{ color: 'var(--neg)' }}><b>{fehler}</b></div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="ge-btn ge-btn-p" data-aktivieren-ja disabled={gesperrt} onClick={() => { void bestaetigen() }}>Jetzt aktivieren</button>
            <button type="button" className="ge-btn" onClick={() => setFrage(false)}>Abbrechen</button>
          </div>
        </div>
      )}
      <Satz r={r} />
    </div>
  )
}

function FertigerPlan({ plan, strategien, vorlagenLive, melde, stichtag }: { plan: Plan; strategien: Strategie[]; vorlagenLive: boolean; melde: (s: string) => void; stichtag: string }) {
  const [offen, setOffen] = React.useState(false)
  const [loeschen, setLoeschen] = React.useState(false)
  const [r, setR] = React.useState<Planergebnis | null>(null)
  const ohneDauer = plan.positionen.some(p => p.duration_weeks == null)
  const erreicht = plan.ziel?.status === 'achieved'
  // Entwurf: ein Plan mit A-Termin, der bis dahin endete, zeigt „✓ Termin gehalten" und das Bühnengewicht
  const termin = aTermin(plan)
  const gehalten = !!termin && !!ende(plan) && ende(plan)! <= termin
  return (
    <div data-plan-kachel="abgeschlossen" className="ge-card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg)' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="ge-typ" data-plan-typ>{planTyp(plan)}</span>
        <span className={`ge-chip${erreicht || gehalten ? ' ge-lage-voraus' : ' ge-grau'}`} data-plan-abschluss={gehalten ? 'termin' : erreicht ? 'erreicht' : 'beendet'}>{gehalten ? '✓ Termin gehalten' : erreicht ? '✓ erreicht' : 'beendet'}</span>
      </div>
      <div style={{ fontWeight: 600 }}>{plan.name}</div>
      {/* Entwurf: „06.01.–25.03.2026 · 88,6 → 84,0 kg" — Start und Stand des Ziels (`user_goals`), ohne beide die Wochen */}
      <div className="ge-num" data-plan-ergebnis style={{ fontSize: 11.5, color: 'var(--fg-subtle)' }}>{zeitraumDe(beginn(plan), ende(plan))} · {gehalten && plan.ziel?.current_value != null ? `Bühnengewicht ${kg1(plan.ziel.current_value)} kg`
        : plan.ziel?.start_value != null && plan.ziel.current_value != null
        ? `${kg1(plan.ziel.start_value)} → ${kg1(plan.ziel.current_value)} kg` : `${wochen(plan)} Wochen`}</div>
      <div style={{ opacity: 0.7 }}><Segmente plan={plan} hoehe={8} /></div>
      {offen && <div data-plan-details={plan.id} style={{ fontSize: 12.5, background: 'var(--surface)', borderRadius: 8, padding: '8px 10px' }}>
        {plan.positionen.map(p => `${phasenname(p, strategien)} ${p.duration_weeks ?? '–'} Wo`).join(' · ')}{plan.ziel ? ` · Ziel „${plan.ziel.title}“` : ''}</div>}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" className="ge-btn" data-plan-kachel-details={plan.id} onClick={() => setOffen(o => !o)}>Details</button>
        {vorlagenLive && <button type="button" className="ge-btn" data-plan-als-vorlage={plan.id}
                                 onClick={async () => { const x = await planAlsVorlageAktion(plan.id, plan.name); setR(x); if (x.ok) melde(`„${plan.name}“ als eigene Vorlage gespeichert.`) }}>Als Vorlage</button>}
        {/* Entwurf: „Name (neu)" als Entwurf ab naechster Woche (`goal_plan_restart`) */}
        {/* `goal_plan_restart` braucht je Phase eine Dauer (G644_BLOCK:neustart_braucht_dauer) — vorher sperren, mit Grund */}
        <button type="button" className="ge-btn" data-plan-neu-starten={plan.id} disabled={ohneDauer} title={ohneDauer ? SAETZE_644.neustart_braucht_dauer : undefined}
                onClick={async () => { const x = await planNeuStartenAktion(plan.id, `${plan.name} (neu)`, tagPlus(stichtag, 7)); setR(x); if (x.ok) melde(`„${plan.name} (neu)“ liegt als Entwurf unter „Weitere Pläne“.`) }}>Neu starten</button>
        <button type="button" className="ge-btn ge-btn-r" data-plan-fertig-loeschen={plan.id} onClick={() => setLoeschen(l => !l)}>Löschen</button>
      </div>
      {/* `goal_plan_delete_completed` loescht nur bestaetigt — die Bestaetigung ist dieser zweite Klick */}
      {loeschen && (
        <div className="ge-hinweis-rot" style={{ padding: '10px 12px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Abgeschlossenen Plan „{plan.name}“ endgültig löschen?</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="ge-btn" onClick={() => setLoeschen(false)}>Abbrechen</button>
            <button type="button" className="ge-btn ge-btn-r" data-plan-fertig-loeschen-ja={plan.id}
                    onClick={async () => { const x = await planFertigLoeschenAktion(plan.id); setR(x); if (x.ok) melde(`„${plan.name}“ gelöscht.`) }}>Endgültig löschen</button>
          </div>
        </div>
      )}
      <Satz r={r} />
    </div>
  )
}

function Vorlagen({ vorlagen }: { vorlagen: Vorlage[] | null }) {
  const zeile = (n: string, i: string, leise = false) => (
    <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)',
      fontSize: 12.5, color: leise ? 'var(--fg-subtle)' : undefined }}>
      <span>{n} <span style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{i}</span></span></div>
  )
  const w = (v: Vorlage) => `${v.positionen.reduce((a, p) => a + p.dauer_wochen, 0)} Wochen`
  const eigene = vorlagen?.filter(v => v.quelle === 'eigen') ?? []
  return (
    <section aria-label="Vorlagen" data-vorlagen={vorlagen?.length ?? 'kommt'} className="ge-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span className="ge-eb">Vorlagen</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><div style={{ fontWeight: 600, fontSize: 12.5 }}>LumeOS-Standard</div>
          {vorlagen === null ? <Kommt punkt="G-644" /> : vorlagen.filter(v => v.quelle === 'lumeos').map(v => zeile(v.name, w(v)))}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><div style={{ fontWeight: 600, fontSize: 12.5 }}>Eigene</div>
          {vorlagen === null ? <Kommt punkt="G-644" />
            : eigene.length ? eigene.map(v => zeile(v.name, 'gespeichert')) : zeile('noch keine', '„Als Vorlage speichern“ an einem Plan', true)}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><div style={{ fontWeight: 600, fontSize: 12.5 }}>Vom Coach · später</div>
          <div data-kommt="coach">{zeile('kommt mit dem Coach-Modul', 'Zuweisung = Vorschlag', true)}</div></div>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--fg-subtle)' }}>Vom Coach zugewiesene Programme kommen als Vorschlag und landen als Entwurf unter „Weitere Pläne“.</div>
    </section>
  )
}

export function PlanSeite({ plaene, neu: neuVonAussen, onNeu, vorlagen = null, ausblick = null, wachen = null, alsNaechstes = null, strategien, grad, ziele, stichtag, startKg, onZuGoals, vomTermin }: {
  /** Tom 16.10.: „+ Neuer Plan" steht im Kopf der Seite — dann steuert der Kopf den Dialog. */
  neu?: boolean; onNeu?: (offen: boolean) => void
  plaene: Plan[]; vorlagen?: Vorlage[] | null; ausblick?: Ausblick | null; wachen?: Wache[] | null; strategien: Strategie[]; grad: string | null; ziele: ZielFortschritt[]
  stichtag: string; startKg: number | null; onZuGoals: () => void
  /** G-669: `goal_als_naechstes` — die gespeicherte Empfehlung; `null` = keine. */
  alsNaechstes?: Wochendaten['alsNaechstes']
  /** G-645/3: „vom Termin aus" als Einschub, solange `goal_plan_templates` fehlt. */
  vomTermin?: React.ReactNode
}) {
  const [bearbeitet, setBearbeitet] = React.useState<string | null>(null)
  const [neuIntern, setNeuIntern] = React.useState(false)
  const neu = neuVonAussen ?? neuIntern
  const setNeu = onNeu ?? setNeuIntern
  const [details, setDetails] = React.useState(true)
  const [toast, setToast] = React.useState('')
  if (!abPro(grad)) {
    const st = ziele.find(z => z.goal_role === 'controlling' && z.zustand.zustand === 'active')
    return (
      <section data-plan-gesperrt={grad ?? 'ohne'} className="ge-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>🔒 Die Phase engine ist ab Grad Pro frei</div>
        <div style={{ color: 'var(--fg-muted)', maxWidth: '68ch' }}>Dein Ziel läuft trotzdem{st ? <>: In Goals steuert „{st.title}“ – dahinter steht ein einfacher Plan</> : ''}.
          {' '}Ab Pro kannst du Pläne mit mehreren Phasen, Wettkampfterminen und Vorlagen bauen.</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" className="ge-btn ge-btn-p" onClick={onZuGoals}>Zu deinem Ziel in Goals</button>
          <span className="ge-chip">Dein Grad: {grad ?? 'nicht gesetzt'}</span>
        </div>
      </section>
    )
  }
  const aktiv = plaene.find(p => p.status === 'aktiv') ?? null
  const laufend = aktiv?.positionen.find(p => p.zustand === 'laufend') ?? null
  // Die naechste Phase liegt NACH dem Stichtag — eine vergangene Position mit Zustand „geplant" (dev 18.10.: Halten
  // 19.07.–09.10.) ist keine Folgephase
  const naechste = aktiv?.positionen.filter(p => p.zustand === 'geplant' && (p.gueltig_ab ?? '') > stichtag)
    .sort((a, b) => (a.gueltig_ab ?? '').localeCompare(b.gueltig_ab ?? ''))[0] ?? null
  const weitere = plaene.filter(p => p.status === 'entwurf' || p.status === 'pausiert')
  const fertig = plaene.filter(p => p.status === 'abgeschlossen')
  const imBearbeiten = plaene.find(p => p.id === bearbeitet) ?? null
  const vorlagenLive = vorlagen !== null
  const bearbeiten = (p: Plan) => <Bearbeiten key={p.id} plan={p} strategien={strategien} startKg={startKg} stichtag={stichtag}
                                              vorlagenLive={vorlagenLive} onFertig={() => setBearbeitet(null)} melde={setToast} />
  return (
    <div data-plan-seite className="ge" style={{ gap: 18 }}>
      {!onNeu && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="ge-btn ge-btn-p" data-neuer-plan-oeffnen style={{ minHeight: 40 }} onClick={() => setNeu(!neu)}>+ Neuer Plan</button>
        </div>
      )}
      {toast && <div data-plan-toast className="ge-hinweis-gruen" style={{ padding: '10px 14px', fontSize: 12.5 }}>{toast}</div>}
      {neu && <NeuerPlan ziele={ziele} vorlagen={vorlagen} stichtag={stichtag} vomTermin={vomTermin} onZu={() => setNeu(false)}
                         onAngelegt={(id, name) => { setNeu(false); setBearbeitet(id); setToast(`Entwurf „${name}“ angelegt – jetzt Termine und Phasen anpassen.`) }} />}
      {aktiv ? (
        <section aria-label="Aktiver Plan" data-aktiver-plan={aktiv.id} className="ge-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div className="ge-sq ge-ton-goals">{KALENDER}</div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <span className="ge-typ" data-plan-typ>Aktiver Plan · {planTyp(aktiv)}</span>
                <span className="ge-chip ge-lage-voraus">● läuft</span>
                <span className="ge-num" data-plan-zeitraum style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--fg-subtle)' }}>
                  {dstr(beginn(aktiv))} – {dstr(ende(aktiv))} · {wochen(aktiv)} Wochen</span>
                <div style={{ display: 'flex', gap: 2 }}>
                  <button type="button" className="ge-btn ge-btn-g ge-ico" data-aktiver-plan-details aria-label="Details" aria-expanded={details} onClick={() => setDetails(d => !d)}>{details ? '▴' : '▾'}</button>
                  <button type="button" className="ge-btn ge-btn-g ge-ico" data-aktiver-plan-bearbeiten aria-label="Bearbeiten" onClick={() => setBearbeitet(aktiv.id)}>✎</button>
                </div>
              </div>
              <div style={{ fontSize: 19, fontWeight: 700 }}>{aktiv.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>
                Aktuelle Phase: <b>{laufend ? phasenname(laufend, strategien) : 'keine laufende Phase'}</b>
                {laufend?.woche && <> · <span data-plan-woche>{laufend.woche}</span></>}
                {' · '}steuert dein Ziel in <button type="button" className="ge-link" onClick={onZuGoals}>Goals</button>
              </div>
            </div>
          </div>
          <Achse plan={aktiv} stichtag={stichtag} strategien={strategien} />
          {details && <Details plan={aktiv} strategien={strategien} ausblick={ausblick} wachen={wachen} alsNaechstes={
            // Entwurf PhaseEngine.dc.html (`naechstes`): liefert `goal_als_naechstes` etwas, steht die Empfehlung da
            // (G-669: Datum, Programm, Dauer, Grund); sonst die naechste Stufe laut Plan; hat der Plan keine
            // Folgephase, der Satz aus G-677 (Tom 19.10.) — der Stift oeffnet das Bearbeiten. Keine eigene Empfehlung.
            alsNaechstes ? <span data-plan-empfohlen>Empfohlen ab {dstr(alsNaechstes.startdatum)}: <b>{phasenname({ strategie_code: alsNaechstes.programm, phase_type: alsNaechstes.programm, sub_phase_code: null, eigene_werte: null }, strategien)}</b> {alsNaechstes.dauer_wochen} Wochen. Grund: {alsNaechstes.grund}. Übernehmen = Phase im Plan ergänzen (✎).</span>
            : naechste ? <span data-plan-naechste>Nächste Stufe laut Plan: <b>{phasenname(naechste, strategien)}</b>.</span>
              : <span data-plan-ohne-folge>Nach Planende ohne Folgephase: Erhaltung. Phase ergänzen (<button type="button" data-als-naechstes-bearbeiten aria-label="Plan bearbeiten" onClick={() => setBearbeitet(aktiv.id)} style={{ border: 0, background: 'none', padding: 0, font: 'inherit', color: 'var(--acc-goals)', cursor: 'pointer' }}>✎</button>)</span>} />}
        </section>
      ) : (
        <section data-kein-aktiver-plan className="ge-card" style={{ padding: 20, border: '2px solid color-mix(in oklab, var(--neg) 55%, var(--border))', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--neg)' }}>Kein Plan aktiv – du läufst auf Erhaltung</div>
          <div style={{ color: 'var(--fg-muted)' }}>Aktiviere einen Plan unten, lege einen neuen an oder setze in Goals eine Richtung.</div>
        </section>
      )}
      {/* Tom 16.10.: „Bearbeiten" steht unter dem jeweiligen Plan */}
      {aktiv && imBearbeiten?.id === aktiv.id && bearbeiten(aktiv)}
      <section aria-label="Weitere Pläne" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span className="ge-eb">Weitere Pläne · Entwürfe und pausierte · immer nur einer aktiv</span>
        {weitere.length === 0 ? <span style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>Keine weiteren Pläne.</span> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(380px,100%),1fr))', gap: 14, alignItems: 'start' }}>
            {weitere.map(p => (
              <React.Fragment key={p.id}>
                <WeitererPlan plan={p} aktiv={aktiv} strategien={strategien} onBearbeiten={() => setBearbeitet(b => (b === p.id ? null : p.id))} melde={setToast} />
                {imBearbeiten?.id === p.id && <div style={{ gridColumn: '1 / -1' }}>{bearbeiten(p)}</div>}
              </React.Fragment>
            ))}
          </div>
        )}
      </section>
      <section aria-label="Abgeschlossene Pläne" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span className="ge-eb">Abgeschlossene Pläne · {fertig.length}</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(300px,100%),1fr))', gap: 14, alignItems: 'start' }}>
          {fertig.map(p => <FertigerPlan key={p.id} plan={p} strategien={strategien} vorlagenLive={vorlagenLive} melde={setToast} stichtag={stichtag} />)}
        </div>
      </section>
      <Vorlagen vorlagen={vorlagen} />
    </div>
  )
}
