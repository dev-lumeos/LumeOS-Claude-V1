'use client'

// G-618 + G-636 — der Reiter Goals nach dem Entwurf
// (`docs/spezifikation/goals-ziel-setzen/entwurf/Main.dc.html`, Dossier 8.4–8.6).
//
//   Steuerung      das eine aktive steuernde Ziel (`goal_role`), Phase aus
//                  `phase_am`, Tempo, Tagesziel; Zustaende laeuft / kein
//                  Ziel / pausiert / ohne laufende Phase (G-637)
//   Diese Woche    Gewicht gegen Soll, Trainings, Gewohnheiten, erreichte
//                  Meilensteine — was fehlt, steht als „kommt"
//   Module         `goal_contributions` des Steuerziels, 7 Tage
//   Messziele      Kacheln je Kategorie, Details (Verlauf) und Bearbeiten
//   Abgeschlossen  erreicht / verfehlt / beendet, eingeklappt
//
// `[read]` **Keine Attrappen-Zahl:** jede Zahl hier kommt aus einem Leseweg.
// **Kein Loeschen-Knopf** — der Loeschweg fehlt (G-611); ein Knopf ohne Weg
// waere eine Attrappe.
import * as React from 'react'
import { Card, Icon, Pill } from '@lumeos/ui'

import { KeinZielWarnung } from '../kein-ziel-warnung'
import { SteuerungOhneZiel } from './steuerung-ohne-ziel'
import { ZielEditor } from './ziel-editor'
import { verlaufAktion } from './ziel-aktionen'
import {
  ABSCHLUSS, KATEGORIE_NAME, KATEGORIE_REIHE, LAGE_TEXT, MODUL_NAME,
  engpass, gewichtWoche, istAbgeschlossen, kalenderwoche, kategorieVon, lageVon,
  modulSchnitt, moduleVon, quelleLesbar, steuerZustand, steuerziel, wertMitEinheit, wochenStart,
  type Lage, type Modul,
} from '../../../lib/goals/reiter'
import { MESSARTEN, type Kategorie } from '../../../lib/goals/messziel'
import { PHASENARTEN } from '../../../lib/goals/phase-regeln'
import { empfohlenDanach, richtungen } from '../../../lib/goals/zielwahl'
import type { Koerpermessung, Meilenstein, Phase, ZielFortschritt, Zielphase } from '../../../lib/goals/lesen'
import type { Strategie } from '../../../lib/goals/strategie-read'
import type { Zielvorschlag, Zielwerte } from '../../../lib/profile/zielwerte-read'
import type { Verlauf, Wochendaten } from '../../../lib/goals/reiter-read'

const datumDe = (iso: string | null) => iso ? iso.split('-').reverse().join('.') : '—'
const zahl = (n: number, s = 0) => n.toLocaleString('de-DE', { minimumFractionDigits: s, maximumFractionDigits: s })
const tageBis = (frist: string | null, heute: string) =>
  frist ? Math.round((Date.parse(`${frist}T12:00:00Z`) - Date.parse(`${heute}T12:00:00Z`)) / 86400000) : null

const KAT_ICON: Record<Kategorie, 'training' | 'goals' | 'refresh' | 'pin'> = {
  kraft: 'training', koerper: 'goals', gewohnheit: 'refresh', eigenes: 'pin',
}
const MODUL_ICON: Record<Modul, 'training' | 'nutrition' | 'recovery' | 'supplements' | 'medical' | 'goals'> = {
  training: 'training', nutrition: 'nutrition', recovery: 'recovery',
  supplements: 'supplements', medical: 'medical', koerper: 'goals',
}

function LagePill({ lage, grund }: { lage: Lage | null; grund: string | null }) {
  if (!lage) return <span className="v2-dim" data-lage="" style={{ fontSize: 10, fontStyle: 'italic' }}>{grund}</span>
  return <span data-lage={lage}><Pill variant={lage === 'hinterher' ? 'warn' : lage === 'voraus' ? 'pos' : undefined}>{LAGE_TEXT[lage]}</Pill></span>
}

function Kommt({ was }: { was: string }) {
  return <span className="v2-dim" data-kommt style={{ fontSize: 11, fontStyle: 'italic' }}>{was} — kommt</span>
}

// ── Steuerung ────────────────────────────────────────────────────

function Steuerung({ ziele, phasen, offenePhasen, zielwerte, vorschlag, strategien, stichtag, onZielSetzen, onPhaseEngine }: {
  ziele: ZielFortschritt[]; phasen: Phase[]; offenePhasen: Zielphase[]; zielwerte: Zielwerte | null; vorschlag: Zielvorschlag | null
  strategien: Strategie[]; stichtag: string; onZielSetzen: () => void; onPhaseEngine: () => void
}) {
  const [bearbeiten, setBearbeiten] = React.useState(false)
  const st = steuerziel(ziele)
  const phase = st ? phasen.find(p => p.goal_id === st.goal_id) ?? null : null
  const zustand = steuerZustand({
    herkunft: zielwerte?.herkunft ?? null, ruhend: !!zielwerte?.ruhendes_ziel,
    steuerziel: st, laufendePhaseZumZiel: !!phase,
  })
  const kopf = (
    <span className="v2-eyebrow" style={{ fontSize: 10.5 }}>Steuerung · bestimmt Kalorien und Makros</span>
  )

  if (zustand === 'kein_ziel' || zustand === 'pausiert') {
    return (
      <Card>
        <div data-steuerung={zustand} className="v2-col-gap" style={{ gap: 8 }}>
          {kopf}
          <SteuerungOhneZiel zielwerte={zielwerte} onZielSetzen={onZielSetzen} />
        </div>
      </Card>
    )
  }
  if (zustand === 'ohne_phase') {
    return (
      <Card>
        <div data-steuerung={zustand} className="v2-col-gap" style={{ gap: 8 }}>
          {kopf}
          <KeinZielWarnung herkunft="ziel_ohne_laufende_phase" kcal={zielwerte?.kcal ?? null}
                           protein={zielwerte?.protein_g ?? null} ruhend={null}
                           luecke={zielwerte?.luecke ?? (st ? { title: st.title, letzte_phase_ende: null, recommended_next: null } : null)}
                           weg={<button type="button" className="v2-btn v2-btn-primary v2-btn-sm" data-steuerung-phase
                                        onClick={onPhaseEngine}>Nächste Phase wählen</button>} />
        </div>
      </Card>
    )
  }

  // laeuft
  const g = st!
  const p = phase!
  // `[read]` **Laufend sagt `phase_am`; die Variante steht in `goal_phases.strategie_code`**
  // (G-609) — `phase_am` fuehrt die Spalte nicht, die Zeile derselben Phase schon.
  const code = offenePhasen.find(o => o.phase_id === p.phase_id)?.strategie_code ?? null
  const variante = code ? strategien.find(s => s.code === code) ?? null : null
  // G-610: Richtung · Variante und „danach empfohlen" (Tom: „danach grafisch in den Reiter").
  const richtung = variante ? richtungen(strategien).find(r => r.gruppe === variante.auswahl_gruppe)?.standard.label ?? null : null
  const danach = variante ? empfohlenDanach(variante, strategien) : []
  const art = PHASENARTEN.find(a => a.id === p.phase_type)?.name ?? p.phase_type
  const { lage, grund } = lageVon(g, stichtag)
  const kcal = zielwerte?.kcal ?? vorschlag?.kcal ?? null
  const protein = zielwerte?.protein_g ?? vorschlag?.protein_g ?? null
  const woche = p.gueltig_ab ? Math.floor((Date.parse(stichtag) - Date.parse(p.gueltig_ab)) / (7 * 86400000)) + 1 : null
  const wochenGesamt = p.gueltig_ab && p.projected_end_date
    ? Math.round((Date.parse(p.projected_end_date) - Date.parse(p.gueltig_ab)) / (7 * 86400000)) : null
  const rest = tageBis(g.target_date, stichtag)
  const pct = g.progress_status === 'measured' ? g.progress_pct : null

  if (bearbeiten) return <ZielEditor ziel={g} onFertig={() => setBearbeiten(false)} />
  return (
    <Card>
      <div data-steuerung="laeuft" data-steuerziel={g.goal_id} className="v2-col-gap" style={{ gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {kopf}
          <LagePill lage={lage} grund={grund} />
          <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10.5 }}>
            Frist {datumDe(g.target_date)}{rest !== null ? ` · ${rest >= 0 ? `noch ${rest} Tage` : `${-rest} Tage vorbei`}` : ''}
          </span>
          <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" aria-label={`${g.title} bearbeiten`}
                  data-steuerung-bearbeiten onClick={() => setBearbeiten(true)}>
            <Icon name="edit" className="v2-ic v2-ic-sm" />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700 }} data-steuerung-variante
              data-ziel-richtung={variante?.code ?? ''}>
            {variante ? `${richtung ? `${richtung} · ` : ''}${variante.label}` : art}
          </h2>
          {!variante && (
            <span className="v2-dim" data-steuerung-ohne-variante style={{ fontSize: 10.5, fontStyle: 'italic' }}
                  title="Die Variante steht in goal_phases.strategie_code (G-609).">ohne Variante</span>
          )}
          <span className="v2-dim" style={{ fontSize: 12 }}>„{g.title}“</span>
          {danach.length > 0 && (
            <span className="v2-dim" data-ziel-naechster style={{ fontSize: 11 }}
                  title={danach.map(d => d.description).join(' · ')}>
              danach empfohlen: {danach.map(d => d.label).join(', ')}
            </span>
          )}
        </div>
        <div className="v2-dim" style={{ fontSize: 12 }} data-steuerung-plan>
          Phase <b>{art}</b>{p.gueltig_ab ? ` seit ${datumDe(p.gueltig_ab)}` : ''} ·{' '}
          <button type="button" className="v2-link" style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
                  onClick={onPhaseEngine}>in der Phase engine</button>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 12.5, flexWrap: 'wrap', alignItems: 'baseline' }}>
          <span><span className="v2-dim">Start </span><b className="v2-num">{wertMitEinheit(g.start_value, g.target_unit)}</b></span>
          <span><span className="v2-dim">aktuell </span><b className="v2-num">{wertMitEinheit(g.current_value, g.target_unit)}</b></span>
          <span className="v2-dim">→</span>
          <span><span className="v2-dim">Ziel </span><b className="v2-num" style={{ color: 'var(--acc-goals)' }}>{wertMitEinheit(g.target_value, g.target_unit)}</b></span>
        </div>
        {pct !== null && (
          <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
            <div style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%', background: 'var(--acc-goals)' }} />
          </div>
        )}
        <div className="v2-grid v2-g-cols-3" style={{ gap: 10, fontSize: 12 }}>
          <div data-steuerung-tempo><div className="v2-dim" style={{ fontSize: 10.5 }}>Tempo</div>
            {p.zielrate_pct_kg_woche !== null ? `${zahl(p.zielrate_pct_kg_woche, 2)} % / Woche` : '—'}</div>
          <div data-steuerung-kcal><div className="v2-dim" style={{ fontSize: 10.5 }}>Tagesziel</div>
            {kcal !== null ? `${zahl(kcal)} kcal${protein !== null ? ` · ${zahl(protein)} g Protein` : ''}` : 'kein Tagesziel gerechnet'}</div>
          <div data-steuerung-woche><div className="v2-dim" style={{ fontSize: 10.5 }}>Phase</div>
            {woche !== null ? `Woche ${woche}${wochenGesamt ? ` von ${wochenGesamt}` : ''}` : '—'}</div>
        </div>
      </div>
    </Card>
  )
}

// ── Diese Woche + Module ─────────────────────────────────────────

function DieseWoche({ ziele, phasen, messungen, meilensteine, woche, stichtag }: {
  ziele: ZielFortschritt[]; phasen: Phase[]; messungen: Koerpermessung[]; meilensteine: Meilenstein[]
  woche: Wochendaten; stichtag: string
}) {
  const st = steuerziel(ziele)
  const tempo = st ? phasen.find(p => p.goal_id === st.goal_id)?.zielrate_pct_kg_woche ?? null : null
  const gw = gewichtWoche(messungen.map(m => ({ measurement_date: m.measurement_date, weight_kg: m.weight_kg })), stichtag, tempo)
  const gewohnheiten = ziele.filter(g => g.status === 'active' && g.measurement_rhythm === 'weekly')
  const ab = wochenStart(stichtag)
  const erreichte = meilensteine.filter(m => m.computed_status === 'achieved' && m.target_date && m.target_date >= ab && m.target_date <= stichtag)
  const Zeile = ({ t, v, marke }: { t: string; v: React.ReactNode; marke: string }) => (
    <div data-woche={marke} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
      <span>{t}</span><span className="v2-num" style={{ textAlign: 'right' }}>{v}</span>
    </div>
  )
  const vz = (n: number) => (n > 0 ? '+' : n < 0 ? '−' : '±') + zahl(Math.abs(n), 1)
  return (
    <Card title={`Diese Woche · KW ${kalenderwoche(stichtag)}`} sub="Bewegung gegen Soll">
      <Zeile marke="gewicht" t="Gewicht" v={gw.delta !== null
        ? <>{vz(gw.delta)} kg{gw.soll !== null && <span className="v2-dim"> (Soll {vz(gw.soll)})</span>}</>
        : <span className="v2-dim">{gw.grund}</span>} />
      <Zeile marke="trainings" t="Trainings" v={woche.trainings === null ? <span className="v2-dim">nicht lesbar</span> : `${woche.trainings} abgeschlossen`} />
      {gewohnheiten.map(g => (
        <Zeile key={g.goal_id} marke={`gewohnheit-${g.goal_id}`} t={g.title}
               v={`${wertMitEinheit(g.current_value, g.target_unit)} von ${wertMitEinheit(g.target_value, g.target_unit)}`} />
      ))}
      <Zeile marke="meilensteine" t="Meilensteine erreicht" v={erreichte.length ? erreichte.map(m => m.title).join(', ') : <span className="v2-dim">keiner diese Woche</span>} />
      <div style={{ paddingTop: 7 }}><Kommt was="Kraft je Woche (Bestwert-Differenz)" /></div>
    </Card>
  )
}

const MODULE_DER_KETTE = ['nutrition', 'training', 'recovery', 'supplements'] as const

function Module({ ziele, woche }: { ziele: ZielFortschritt[]; woche: Wochendaten }) {
  const st = steuerziel(ziele)
  const schnitte = modulSchnitt(woche.beitraege, [...MODULE_DER_KETTE])
  const eng = engpass(schnitte)
  return (
    <Card title="Module" sub="Beitrag zum steuernden Ziel · 7 Tage">
      {!st ? (
        <div className="v2-dim" data-module-leer style={{ fontSize: 11.5 }}>Ohne steuerndes Ziel gibt es keinen Beitrag.</div>
      ) : (
        <div className="v2-col-gap" style={{ gap: 7 }}>
          {schnitte.map(s => (
            <div key={s.module} data-modul={s.module} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 64px', gap: 10, alignItems: 'center', fontSize: 11.5 }}>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Icon name={MODUL_ICON[s.module as Modul]} className="v2-ic v2-ic-sm" />{MODUL_NAME[s.module as Modul]}
              </span>
              {s.schnitt === null ? <Kommt was="noch keine Beiträge" /> : (
                <div style={{ height: 7, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.schnitt}%`, background: 'var(--acc-goals)' }} />
                </div>
              )}
              <span className="v2-num" style={{ textAlign: 'right' }}>{s.schnitt === null ? '' : `${s.schnitt} / 100`}</span>
            </div>
          ))}
          <div className="v2-dim" data-engpass style={{ fontSize: 11, marginTop: 4 }}>
            {eng ? <><b>Engpass:</b> {MODUL_NAME[eng.module as Modul]} – Ø {eng.schnitt} / 100.</> : 'Engpass: erst mit Beiträgen.'}
          </div>
        </div>
      )}
    </Card>
  )
}

// ── Messziele ────────────────────────────────────────────────────

function VerlaufBild({ punkte, ziel }: { punkte: Verlauf['punkte']; ziel: number | null }) {
  if (punkte.length === 0) return <div className="v2-dim" style={{ fontSize: 11 }}>Noch keine Datenpunkte.</div>
  const werte = punkte.map(p => p.wert).concat(ziel !== null ? [ziel] : [])
  const lo = Math.min(...werte), hi = Math.max(...werte), sp = hi - lo || 1
  const x = (i: number) => 30 + (punkte.length === 1 ? 190 : (i / (punkte.length - 1)) * 380)
  const y = (v: number) => 110 - ((v - lo) / sp) * 90
  return (
    <svg viewBox="0 0 420 130" width="100%" role="img" aria-label="Verlauf" data-verlauf-bild={punkte.length}>
      {ziel !== null && <line x1="30" x2="410" y1={y(ziel)} y2={y(ziel)} stroke="var(--acc-goals)" strokeDasharray="2 3" />}
      <polyline points={punkte.map((p, i) => `${x(i)},${y(p.wert)}`).join(' ')} fill="none" stroke="var(--acc-goals)" strokeWidth="2" />
      {punkte.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.wert)} r="2.5" fill="var(--acc-goals)" />)}
    </svg>
  )
}

function Details({ g, stichtag, meilensteine }: { g: ZielFortschritt; stichtag: string; meilensteine: Meilenstein[] }) {
  const [v, setV] = React.useState<Verlauf | null>(null)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const woechentlich = g.measurement_rhythm === 'weekly'
  React.useEffect(() => {
    void verlaufAktion(g.goal_id, stichtag, woechentlich).then(r => (r.ok ? setV(r.verlauf) : setFehler(r.fehler)))
  }, [g.goal_id, stichtag, woechentlich])
  const eigene = meilensteine.filter(m => m.goal_id === g.goal_id)
  // Ein Datenpunkt einer Zaehl-Gewohnheit ist EINE Einheit (`measurement_points`
  // liefert 1 je Sitzung) — „1 pro Woche" waere falsch. Schlaf bleibt „h".
  const punktEinheit = g.target_unit === 'sessions_per_week' ? null : g.target_unit
  if (fehler) return <div data-details-fehler style={{ fontSize: 11.5, color: 'var(--neg)' }}>{fehler}</div>
  if (!v) return <div className="v2-dim" style={{ fontSize: 11 }}>lädt …</div>
  return (
    <div data-details={g.goal_id} className="v2-col-gap" style={{ gap: 8, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
      {woechentlich ? (
        <div data-details-wochen={v.wochen.length}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {v.wochen.slice(-12).map(w => (
              <span key={w.woche} title={`ab ${datumDe(w.woche)}: ${w.wert ?? '—'}`}
                    style={{ width: 14, height: 14, borderRadius: 3, background: w.erreicht ? 'var(--acc-goals)' : 'var(--surface-2)', border: '1px solid var(--border)' }} />
            ))}
          </div>
          <div className="v2-dim" style={{ fontSize: 11, marginTop: 4 }}>
            {v.wochen.length} Woche(n) · Serie {v.wochen.at(-1)?.serie ?? 0}
          </div>
        </div>
      ) : <VerlaufBild punkte={v.punkte} ziel={g.target_value} />}
      <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }} data-details-punkte={v.punkte.length}>
        <thead><tr className="v2-dim"><th style={{ textAlign: 'left' }}>Datum</th><th style={{ textAlign: 'right' }}>Wert</th><th style={{ textAlign: 'left', paddingLeft: 10 }}>Quelle</th></tr></thead>
        <tbody>
          {v.punkte.slice(-8).reverse().map((p, i) => (
            <tr key={i}><td>{datumDe(p.tag)}</td><td className="v2-num" style={{ textAlign: 'right' }}>{wertMitEinheit(p.wert, punktEinheit)}</td>
              <td style={{ paddingLeft: 10 }}>{quelleLesbar(p.quelle) ?? 'Quelle unbekannt'}</td></tr>
          ))}
        </tbody>
      </table>
      {eigene.length > 0 && (
        <div data-details-meilensteine={eigene.length} style={{ fontSize: 11 }}>
          <b>Meilensteine:</b> {eigene.map(m => `${m.title} (${m.computed_status === 'achieved' ? 'erreicht' : m.computed_status === 'missed' ? 'verfehlt' : 'offen'})`).join(' · ')}
        </div>
      )}
    </div>
  )
}

function MesszielKachel({ g, stichtag, meilensteine }: { g: ZielFortschritt; stichtag: string; meilensteine: Meilenstein[] }) {
  const [offen, setOffen] = React.useState(false)
  const [bearbeiten, setBearbeiten] = React.useState(false)
  if (bearbeiten) return <ZielEditor ziel={g} onFertig={() => setBearbeiten(false)} />
  const kat = kategorieVon(g)
  const { lage, grund } = lageVon(g, stichtag)
  const quelle = quelleLesbar(g.current_source)
  const pct = g.progress_status === 'measured' ? g.progress_pct : null
  const art = g.measurement_type && g.measurement_type in MESSARTEN
    ? MESSARTEN[g.measurement_type as keyof typeof MESSARTEN].name : null
  return (
    <div data-messziel-kachel={g.goal_id} data-kategorie={kat} style={{
      border: '1px solid var(--border)', borderRadius: 8, padding: 12, background: 'var(--surface)',
    }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, display: 'grid', placeItems: 'center', flexShrink: 0,
          background: 'color-mix(in oklch, var(--acc-goals) 14%, transparent)', color: 'var(--acc-goals)' }}>
          <Icon name={KAT_ICON[kat]} className="v2-ic" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="v2-eyebrow" style={{ fontSize: 10 }}>{art ?? KATEGORIE_NAME[kat]}</span>
            {g.status !== 'active' && <Pill>{g.status === 'paused' ? 'pausiert' : g.status === 'on_hold' ? 'zurückgestellt' : g.status}</Pill>}
            <LagePill lage={lage} grund={grund} />
            <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 2, alignItems: 'center', whiteSpace: 'nowrap' }}>
              <span className="v2-dim v2-mono" style={{ fontSize: 10, marginRight: 4 }}>Frist {datumDe(g.target_date)}</span>
              <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" aria-expanded={offen} data-messziel-details={g.goal_id}
                      aria-label={`${g.title} Details`} onClick={() => setOffen(o => !o)}>
                <Icon name={offen ? 'chevron_up' : 'chevron_down'} className="v2-ic v2-ic-sm" />
              </button>
              <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" data-messziel-bearbeiten={g.goal_id}
                      aria-label={`${g.title} bearbeiten`} onClick={() => setBearbeiten(true)}>
                <Icon name="edit" className="v2-ic v2-ic-sm" />
              </button>
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, margin: '4px 0' }}>{g.title}</div>
          <div style={{ display: 'flex', gap: 10, fontSize: 12, flexWrap: 'wrap', alignItems: 'baseline' }} data-messziel-werte>
            <span><span className="v2-dim">aktuell </span><b className="v2-num">{wertMitEinheit(g.current_value, g.target_unit)}</b></span>
            <span className="v2-dim">→</span>
            <span><span className="v2-dim">Ziel </span><b className="v2-num" style={{ color: 'var(--acc-goals)' }}>{wertMitEinheit(g.target_value, g.target_unit)}</b></span>
            {g.measurement_rhythm === 'weekly' && <span className="v2-dim">je Woche</span>}
          </div>
          {pct !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%', background: 'var(--acc-goals)' }} />
              </div>
              <span className="v2-num v2-dim" style={{ fontSize: 10.5 }}>{zahl(pct)} %</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
            {moduleVon(g).map(m => (
              <span key={m} data-messziel-modul={m}><Pill><Icon name={MODUL_ICON[m]} className="v2-ic v2-ic-sm" /> {MODUL_NAME[m]}</Pill></span>
            ))}
            <span className="v2-dim" data-messziel-quelle style={{ fontSize: 10.5 }}>
              {quelle ?? (g.progress_status === 'measured' ? 'Quelle unbekannt' : 'noch kein Messwert')}
            </span>
          </div>
        </div>
      </div>
      {offen && <Details g={g} stichtag={stichtag} meilensteine={meilensteine} />}
    </div>
  )
}

function Messziele({ ziele, stichtag, meilensteine, onMessziel }: {
  ziele: ZielFortschritt[]; stichtag: string; meilensteine: Meilenstein[]; onMessziel: () => void
}) {
  const offen = ziele.filter(g => g.goal_role !== 'controlling' && !istAbgeschlossen(g))
  return (
    <Card title="Messziele" sub="steuern nichts, beliebig viele"
          actions={<button type="button" className="v2-btn v2-btn-sm" data-messziele-neu onClick={onMessziel}>
            <Icon name="plus" className="v2-ic v2-ic-sm" /> Messziel</button>}>
      {offen.length === 0 ? (
        <div className="v2-dim" data-messziele-leer style={{ fontSize: 11.5 }}>Noch kein Messziel.</div>
      ) : KATEGORIE_REIHE.map(k => {
        const liste = offen.filter(g => kategorieVon(g) === k)
        if (!liste.length) return null
        return (
          <div key={k} data-messziel-gruppe={k} style={{ marginBottom: 12 }}>
            <div className="v2-eyebrow" style={{ fontSize: 10.5, marginBottom: 6 }}>{KATEGORIE_NAME[k]} · {liste.length}</div>
            <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
              {liste.map(g => <MesszielKachel key={g.goal_id} g={g} stichtag={stichtag} meilensteine={meilensteine} />)}
            </div>
          </div>
        )
      })}
    </Card>
  )
}

function Abgeschlossen({ ziele }: { ziele: ZielFortschritt[] }) {
  const [auf, setAuf] = React.useState(false)
  const zu = ziele.filter(istAbgeschlossen)
  if (zu.length === 0) return null
  return (
    <Card>
      <button type="button" className="v2-btn v2-btn-ghost" data-abgeschlossen={zu.length} aria-expanded={auf}
              onClick={() => setAuf(a => !a)} style={{ width: '100%', justifyContent: 'space-between' }}>
        <span>Abgeschlossen · {zu.length}</span>
        <Icon name={auf ? 'chevron_up' : 'chevron_down'} className="v2-ic v2-ic-sm" />
      </button>
      {auf && (
        <div className="v2-col-gap" style={{ gap: 6, marginTop: 8 }}>
          {zu.map(g => (
            <div key={g.goal_id} data-abgeschlossen-ziel={g.status} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <Icon name={KAT_ICON[kategorieVon(g)]} className="v2-ic v2-ic-sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{g.title}</div>
                <div className="v2-dim" style={{ fontSize: 10.5 }}>
                  {g.achievement_date ? `am ${datumDe(g.achievement_date)}` : g.target_date ? `Frist ${datumDe(g.target_date)}` : ''}
                  {g.target_value !== null
                    ? `${g.achievement_date || g.target_date ? ' · ' : ''}${wertMitEinheit(g.current_value, g.target_unit)} von ${wertMitEinheit(g.target_value, g.target_unit)}`
                    : (g.achievement_date || g.target_date ? '' : 'ohne Zielwert')}
                </div>
              </div>
              <Pill variant={g.status === 'achieved' ? 'pos' : undefined}>{ABSCHLUSS[g.status!]}</Pill>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export function ReiterGoals(p: {
  ziele: ZielFortschritt[]; phasen: Phase[]; zielwerte: Zielwerte | null; vorschlag: Zielvorschlag | null
  offenePhasen: Zielphase[]
  messungen: Koerpermessung[]; meilensteine: Meilenstein[]; strategien: Strategie[]; woche: Wochendaten
  stichtag: string; onZielSetzen: () => void; onMessziel: () => void; onPhaseEngine: () => void
}) {
  return (
    <div className="v2-col-gap" style={{ gap: 14 }} data-reiter-goals>
      <Steuerung ziele={p.ziele} phasen={p.phasen} offenePhasen={p.offenePhasen} zielwerte={p.zielwerte} vorschlag={p.vorschlag}
                 strategien={p.strategien} stichtag={p.stichtag} onZielSetzen={p.onZielSetzen} onPhaseEngine={p.onPhaseEngine} />
      <div className="v2-grid v2-g-cols-2" style={{ gap: 14 }}>
        <DieseWoche ziele={p.ziele} phasen={p.phasen} messungen={p.messungen} meilensteine={p.meilensteine}
                    woche={p.woche} stichtag={p.stichtag} />
        <Module ziele={p.ziele} woche={p.woche} />
      </div>
      <Messziele ziele={p.ziele} stichtag={p.stichtag} meilensteine={p.meilensteine} onMessziel={p.onMessziel} />
      <Abgeschlossen ziele={p.ziele} />
    </div>
  )
}
