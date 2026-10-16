'use client'

// G-629 — die Phase Engine als Planer (Entwurf `entwurf/PhaseEngine.dc.html`,
// Dossier 8.7). Ganze Seite ab Pro; darunter gesperrt mit Hinweis.
//
//   Aktiver Plan      Zeitachse der Positionen (abgeschlossen / laeuft / geplant)
//                     mit Terminen, Details je Phase mit den Programmwerten
//   Bearbeiten        Termine; Phase anlegen / verschieben; laufende Phase ab
//                     Stichtag aendern (`goal_plan_position_revise`); eigene Werte
//   Weitere Plaene    Aktivieren mit Rueckfrage; Entwurf loeschen; + Neuer Plan
//   Abgeschlossen     lesbar
//
// `[read]` **Grenzen nur aus `ziel_grenzen_pruefen`** — Sperre rot mit „frei ab",
// Warnung mit Haken, dieselbe Anzeige wie „Ziel setzen" (G-628 Teil 2).
// `[read]` **Was der Kette fehlt, steht als „kommt"** — keine Attrappe.
import * as React from 'react'
import { Card, Icon, Pill } from '@lumeos/ui'

import { Befunde } from './befunde'
import { zielPruefenAktion } from './ziel-aktionen'
import {
  planAktivierenAktion, planAnlegenAktion, planBeendenAktion, planLoeschenAktion, planPausierenAktion,
  positionAendernAbAktion, positionSpeichernAktion, positionVerschiebenAktion, terminLoeschenAktion, terminSpeichernAktion,
} from './plan-aktionen'
import {
  EIGENE_WERTE, PLAN_STATUS_TEXT, POSITION_ZUSTAND_TEXT, TERMIN_ART, abPro, eigeneWerte, katalogwerte,
  naechstePosition, richtungFuer, zeitachse, type Positionszustand, type Terminart,
} from '../../../lib/goals/plan'
import { bestaetigteSchluessel, waechterSatz, weiterErlaubt, type Pruefung } from '../../../lib/goals/zielpruefung'
import { phasenartFuerStrategie } from '../../../lib/goals/strategie-regeln'
import { naechsteNamen } from '../../../lib/goals/zielwahl'
import type { Plan, Planposition } from '../../../lib/goals/plan-read'
import type { Planergebnis } from '../../../lib/goals/plan-write'
import type { Strategie } from '../../../lib/goals/strategie-read'
import type { ZielFortschritt } from '../../../lib/goals/lesen'

const datumDe = (iso: string | null) => (iso ? iso.split('-').reverse().join('.') : '—')
const tagPlus = (tag: string, n: number) => {
  const [j, m, t] = tag.split('-').map(Number)
  const d = new Date(Date.UTC(j!, m! - 1, t! + n))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}
const FARBE: Record<Positionszustand, string> = {
  abgeschlossen: 'color-mix(in oklch, var(--acc-goals) 25%, var(--surface-2))',
  laufend: 'var(--acc-goals)',
  ruht: 'color-mix(in oklch, var(--acc-goals) 45%, var(--surface-2))',
  geplant: 'var(--surface-2)',
}

function Kommt({ was, befund }: { was: string; befund: string }) {
  return <span className="v2-dim" data-kommt={befund} style={{ fontSize: 11, fontStyle: 'italic' }}>{was} — kommt</span>
}
function Satz({ r }: { r: Planergebnis | null }) {
  return r && !r.ok ? <div data-plan-fehler style={{ fontSize: 11.5, color: 'var(--neg)', marginTop: 6 }}>{r.fehler}</div> : null
}

/** Name und Werte einer Position: Katalogprogramm oder eigene Werte. */
function phaseName(p: Pick<Planposition, 'strategie_code' | 'eigene_werte' | 'phase_type'>, strategien: Strategie[]) {
  if (p.eigene_werte) return 'Eigene Werte'
  return strategien.find(s => s.code === p.strategie_code)?.label ?? p.strategie_code ?? p.phase_type
}
function Werte({ p, strategien }: { p: Planposition; strategien: Strategie[] }) {
  const s = strategien.find(x => x.code === p.strategie_code)
  const zeilen = p.eigene_werte ? eigeneWerte(p.eigene_werte) : s ? katalogwerte(s, p.zielrate_pct_kg_woche) : []
  return (
    <span data-programmwerte={p.id} style={{ display: 'inline-flex', gap: 10, flexWrap: 'wrap' }}>
      {zeilen.map(z => (
        <span key={z.label}><span className="v2-dim">{z.label} </span>
          {z.wert === null ? <i className="v2-dim" data-keine-vorgabe>keine Vorgabe</i> : <b>{z.wert}</b>}</span>
      ))}
    </span>
  )
}

function Zeitachse({ plan, stichtag, strategien }: { plan: Plan; stichtag: string; strategien: Strategie[] }) {
  const a = zeitachse(plan.positionen, plan.termine, stichtag)
  return (
    <div data-plan-zeitachse={plan.id} style={{ position: 'relative', margin: '8px 0 4px' }}>
      <div style={{ position: 'relative', height: 30, background: 'var(--surface-2)', borderRadius: 6, overflow: 'hidden' }}>
        {a.segmente.map(s => {
          const p = plan.positionen.find(x => x.id === s.id)!
          return (
            <div key={s.id} data-segment={s.zustand} title={`${phaseName(p, strategien)} · ${POSITION_ZUSTAND_TEXT[s.zustand]}`}
                 style={{ position: 'absolute', left: `${s.versatz}%`, width: `${s.anteil}%`, top: 3, bottom: 3, borderRadius: 4,
                   background: FARBE[s.zustand], border: s.zustand === 'geplant' ? '1px dashed var(--border-strong)' : undefined,
                   fontSize: 10.5, padding: '3px 6px', overflow: 'hidden', whiteSpace: 'nowrap', color: s.zustand === 'laufend' ? 'var(--bg)' : 'var(--fg)' }}>
              {phaseName(p, strategien)}
            </div>
          )
        })}
        <div title={`heute ${datumDe(stichtag)}`} style={{ position: 'absolute', left: `${a.marke(stichtag)}%`, top: 0, bottom: 0, width: 2, background: 'var(--fg)' }} />
      </div>
      <div style={{ position: 'relative', height: plan.termine.length ? 18 : 4 }}>
        {plan.termine.map(t => (
          <span key={t.id} data-termin-marke={t.kind} style={{ position: 'absolute', left: `${a.marke(t.event_date)}%`, fontSize: 10, whiteSpace: 'nowrap',
            // rechts der Mitte nach links aufklappen, sonst ragt die Marke aus der Karte
            transform: a.marke(t.event_date) > 50 ? 'translateX(calc(-100% + 4px))' : 'translateX(-4px)' }}>
            ▲ {t.kind} {t.name}
          </span>
        ))}
      </div>
      <div className="v2-dim v2-mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
        <span>{datumDe(a.von)}</span><span>{datumDe(a.bis)}</span>
      </div>
    </div>
  )
}

function Details({ plan, strategien }: { plan: Plan; strategien: Strategie[] }) {
  return (
    <div data-plan-details={plan.id} className="v2-col-gap" style={{ gap: 10, marginTop: 8 }}>
      <table style={{ width: '100%', fontSize: 11.5, borderCollapse: 'collapse' }}>
        <thead><tr className="v2-dim" style={{ textAlign: 'left' }}>
          <th>#</th><th>Phase</th><th>Wochen</th><th>Beginn</th><th>Ende</th><th>Status</th></tr></thead>
        <tbody>
          {plan.positionen.map(p => (
            <React.Fragment key={p.id}>
              <tr data-position-zeile={p.zustand} style={{ borderTop: '1px solid var(--border)' }}>
                <td>{p.position}</td><td><b>{phaseName(p, strategien)}</b></td><td>{p.duration_weeks ?? 'offen'}</td>
                <td>{datumDe(p.gueltig_ab)}</td><td>{datumDe(p.projected_end_date)}</td><td>{POSITION_ZUSTAND_TEXT[p.zustand]}</td>
              </tr>
              <tr><td /><td colSpan={5} style={{ paddingBottom: 6, fontSize: 11 }}><Werte p={p} strategien={strategien} /></td></tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Kommt was="Wachen der aktuellen Phase" befund="wachen" />
        <Kommt was="Wöchentliche Anpassung (feste Regeln)" befund="wochenanpassung" />
      </div>
    </div>
  )
}

// ── Grenzen + Formular einer Position ────────────────────────────

type Formular = { code: string; wochen: string; werte: Record<string, string> }
function auswahl(strategien: Strategie[]) {
  // `eigene_werte_*` sind die Einstiege fuer eigene Werte (G-625: kein Katalogcode).
  // `custom` fehlt bewusst: seine Vorschau ist G-624 und noch nicht in der Kette.
  return strategien.filter(s => s.code !== 'custom')
}
function alsDaten(f: Formular, strategien: Strategie[]) {
  const s = strategien.find(x => x.code === f.code) ?? null
  const eigen = !!s && s.code.startsWith('eigene_werte_')
  const phase_type = s ? phasenartFuerStrategie(s.code, s.category) ?? 'maintenance' : 'maintenance'
  const werte: Record<string, number> = {}
  for (const [k, v] of Object.entries(f.werte)) { const n = Number(v.replace(',', '.')); if (v.trim() !== '' && Number.isFinite(n)) werte[k] = n }
  const wochen = Number(f.wochen)
  return {
    s, eigen, phase_type, richtung: richtungFuer(s?.auswahl_gruppe ?? null, phase_type),
    strategie_code: eigen ? null : s?.code ?? null, eigene_werte: eigen ? werte : null,
    duration_weeks: Number.isInteger(wochen) && wochen > 0 ? wochen : null,
    zielrate: eigen ? null : s?.weight_change_target_percent ?? null,
  }
}

function PositionFormular({ plan, strategien, startKg, stichtag, art, position, onFertig }: {
  plan: Plan; strategien: Strategie[]; startKg: number | null; stichtag: string
  art: 'neu' | 'aendern'; position?: Planposition; onFertig: () => void
}) {
  const [f, setF] = React.useState<Formular>({ code: position?.strategie_code ?? '', wochen: String(position?.duration_weeks ?? 8), werte: {} })
  const [ab, setAb] = React.useState(tagPlus(stichtag, 1))
  const [pruefung, setPruefung] = React.useState<Pruefung | null>(null)
  const [haken, setHaken] = React.useState<Set<string>>(new Set())
  const [r, setR] = React.useState<Planergebnis | null>(null)
  const [laeuft, setLaeuft] = React.useState(false)
  const d = alsDaten(f, strategien)
  const naechste = naechstePosition(plan.positionen, stichtag)
  const beginn = art === 'aendern' ? ab : naechste.gueltig_ab
  const ende = d.duration_weeks ? tagPlus(beginn, d.duration_weeks * 7 - 1) : null

  // Grenzen nur aus der Kette — wie „Ziel setzen" (G-628 Teil 2).
  React.useEffect(() => {
    if (!d.s || startKg === null) { setPruefung(null); return }
    const t = setTimeout(() => {
      void zielPruefenAktion({
        richtung: d.richtung, startKg, zielKg: plan.ziel?.target_value ?? null, startdatum: beginn, zieldatum: ende,
        programm: d.strategie_code, tempo: d.zielrate, eigeneWerte: d.eigene_werte,
      }).then(setPruefung)
    }, 350)
    return () => clearTimeout(t)
  }, [f.code, f.wochen, JSON.stringify(f.werte), beginn]) // eslint-disable-line react-hooks/exhaustive-deps

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
        phase_type: d.phase_type, duration_weeks: d.duration_weeks, gueltig_ab: beginn, projected_end_date: ende,
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
    <div data-position-formular={art} className="v2-col-gap" style={{ gap: 8, border: '1px solid var(--border)', borderRadius: 8, padding: 10, fontSize: 12 }}>
      <b>{art === 'aendern' ? `„${position ? phaseName(position, strategien) : ''}“ ab Stichtag ändern` : `Neue Phase an Stelle ${naechste.position}`}</b>
      {art === 'neu' && naechste.offenesEnde && (
        <span className="v2-dim" data-offenes-ende>Die letzte Phase hat kein Ende — die neue beginnt heute; die Kette ordnet sie ein.</span>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><span className="v2-eyebrow">Programm</span>
          <select className="v2-feld" data-position-feld="programm" value={f.code} onChange={e => setF({ ...f, code: e.target.value, werte: {} })}>
            <option value="">wählen …</option>
            {gruppen.map(g => (
              <optgroup key={g} label={g}>
                {auswahl(strategien).filter(s => (s.auswahl_gruppe ?? '—') === g).map(s => <option key={s.code} value={s.code}>{s.label}</option>)}
              </optgroup>
            ))}
          </select></label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><span className="v2-eyebrow">Wochen</span>
          <input className="v2-feld" data-position-feld="wochen" style={{ width: 70 }} inputMode="numeric" value={f.wochen} onChange={e => setF({ ...f, wochen: e.target.value })} /></label>
        {art === 'aendern' && (
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><span className="v2-eyebrow">ab</span>
            <input className="v2-feld" type="date" data-position-feld="ab" value={ab} min={stichtag} onChange={e => setAb(e.target.value)} /></label>
        )}
        <span className="v2-dim">{datumDe(beginn)} – {datumDe(ende)}</span>
      </div>
      {d.s && !d.eigen && <Werte p={{ id: 'vorschau', position: 0, strategie_code: d.s.code, eigene_werte: null, richtung: d.richtung, phase_type: d.phase_type,
        duration_weeks: d.duration_weeks, gueltig_ab: beginn, projected_end_date: ende, goal_phase_id: null, zielrate_pct_kg_woche: d.zielrate,
        sub_phase_code: null, confirmed_warnings: [], zustand: 'geplant', woche: null }} strategien={strategien} />}
      {d.eigen && (
        <div data-eigene-werte className="v2-grid v2-g-cols-3" style={{ gap: 6 }}>
          {EIGENE_WERTE.map(w => (
            <label key={w.key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="v2-eyebrow" style={{ fontSize: 9.5 }}>{w.label}</span>
              <input className="v2-feld" data-eigener-wert={w.key} inputMode="decimal" value={f.werte[w.key] ?? ''}
                     onChange={e => setF({ ...f, werte: { ...f.werte, [w.key]: e.target.value } })} /></label>
          ))}
        </div>
      )}
      {startKg === null && <span className="v2-dim">Ohne Gewichtsmessung prüft erst die Datenbank beim Speichern.</span>}
      <Befunde pruefung={pruefung} bestaetigt={haken} setBestaetigt={setHaken} />
      <div style={{ display: 'flex', gap: 6 }}>
        <button type="button" className="v2-btn v2-btn-sm v2-btn-primary" data-position-speichern
                disabled={laeuft || !d.s || (startKg !== null && !weiterErlaubt(pruefung, haken))}
                onClick={() => { void speichern() }}>{art === 'aendern' ? 'Ab Stichtag ändern' : 'Phase anlegen'}</button>
        <button type="button" className="v2-btn v2-btn-sm v2-btn-ghost" onClick={onFertig}>Abbrechen</button>
      </div>
      <Satz r={r} />
    </div>
  )
}

function Termine({ plan }: { plan: Plan }) {
  const [neu, setNeu] = React.useState({ name: '', kind: 'A' as Terminart, datum: '' })
  const [r, setR] = React.useState<Planergebnis | null>(null)
  return (
    <div data-plan-termine className="v2-col-gap" style={{ gap: 6 }}>
      <span className="v2-eyebrow">Termine · frei benennbar</span>
      {plan.termine.length === 0 && <span className="v2-dim" style={{ fontSize: 11 }}>Noch kein Termin.</span>}
      {plan.termine.map(t => (
        <div key={t.id} data-termin={t.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
          <b>{t.name}</b><span className="v2-dim">{TERMIN_ART[t.kind]}</span><span>{datumDe(t.event_date)}</span>
          <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" data-termin-loeschen={t.id} aria-label={`${t.name} löschen`}
                  onClick={async () => setR(await terminLoeschenAktion(t.id))}><Icon name="x" className="v2-ic v2-ic-sm" /></button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <input className="v2-feld" placeholder="Name" data-termin-feld="name" value={neu.name} onChange={e => setNeu({ ...neu, name: e.target.value })} />
        <select className="v2-feld" data-termin-feld="art" value={neu.kind} onChange={e => setNeu({ ...neu, kind: e.target.value as Terminart })}>
          {(Object.keys(TERMIN_ART) as Terminart[]).map(k => <option key={k} value={k}>{TERMIN_ART[k]}</option>)}
        </select>
        <input className="v2-feld" type="date" data-termin-feld="datum" value={neu.datum} onChange={e => setNeu({ ...neu, datum: e.target.value })} />
        <button type="button" className="v2-btn v2-btn-sm" data-termin-anlegen disabled={!neu.name.trim() || !neu.datum}
                onClick={async () => { const x = await terminSpeichernAktion(plan.id, null, neu.name.trim(), neu.kind, neu.datum); setR(x); if (x.ok) setNeu({ name: '', kind: 'A', datum: '' }) }}>
          + Termin</button>
      </div>
      <span className="v2-dim" style={{ fontSize: 10.5 }}>A: der Plan rechnet vom ersten A-Termin rückwärts · B: kurzer Peak · Sperrtermin: wird Diätpause — <Kommt was="das Rückwärtsrechnen" befund="termine_rechnen" /></span>
      <Satz r={r} />
    </div>
  )
}

function Bearbeiten({ plan, strategien, startKg, stichtag, onFertig }: {
  plan: Plan; strategien: Strategie[]; startKg: number | null; stichtag: string; onFertig: () => void
}) {
  const [formular, setFormular] = React.useState<{ art: 'neu' | 'aendern'; position?: Planposition } | null>(null)
  const [frage, setFrage] = React.useState<'pausieren' | 'beenden' | 'loeschen' | null>(null)
  const [r, setR] = React.useState<Planergebnis | null>(null)
  const geplant = plan.positionen.filter(p => p.zustand === 'geplant')
  const tun = async (was: 'pausieren' | 'beenden' | 'loeschen') => {
    const x = was === 'pausieren' ? await planPausierenAktion(plan.id) : was === 'beenden' ? await planBeendenAktion(plan.id) : await planLoeschenAktion(plan.id)
    setR(x); setFrage(null); if (x.ok) onFertig()
  }
  return (
    <Card title={`Bearbeiten · ${plan.name}`} sub={PLAN_STATUS_TEXT[plan.status]}
          actions={<button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" onClick={onFertig} aria-label="Bearbeiten schließen"><Icon name="x" className="v2-ic v2-ic-sm" /></button>}>
      <div data-plan-bearbeiten={plan.id} className="v2-col-gap" style={{ gap: 14 }}>
        <Termine plan={plan} />
        <div className="v2-col-gap" style={{ gap: 6 }}>
          <span className="v2-eyebrow">Phasen</span>
          {plan.positionen.map(p => (
            <div key={p.id} data-bearbeiten-position={p.zustand} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, flexWrap: 'wrap' }}>
              <span className="v2-mono">{p.position}</span><b>{phaseName(p, strategien)}</b>
              <span className="v2-dim">{p.duration_weeks ? `${p.duration_weeks} Wo` : 'offen'} · {POSITION_ZUSTAND_TEXT[p.zustand]}</span>
              {p.zustand === 'geplant' && (
                <span style={{ display: 'inline-flex', gap: 2 }}>
                  <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" data-position-hoch={p.id} aria-label="früher"
                          disabled={p.position <= Math.min(...geplant.map(x => x.position))}
                          onClick={async () => setR(await positionVerschiebenAktion(p.id, p.position - 1))}><Icon name="chevron_up" className="v2-ic v2-ic-sm" /></button>
                  <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" data-position-runter={p.id} aria-label="später"
                          disabled={p.position >= Math.max(...plan.positionen.map(x => x.position))}
                          onClick={async () => setR(await positionVerschiebenAktion(p.id, p.position + 1))}><Icon name="chevron_down" className="v2-ic v2-ic-sm" /></button>
                  <Kommt was="Löschen" befund="position_loeschen" />
                </span>
              )}
              {p.zustand === 'laufend' && plan.status === 'aktiv' && (
                <button type="button" className="v2-btn v2-btn-sm" data-position-aendern={p.id}
                        onClick={() => setFormular({ art: 'aendern', position: p })}>ab Stichtag ändern</button>
              )}
            </div>
          ))}
          {formular ? (
            <PositionFormular plan={plan} strategien={strategien} startKg={startKg} stichtag={stichtag}
                              art={formular.art} position={formular.position} onFertig={() => setFormular(null)} />
          ) : (
            <button type="button" className="v2-btn v2-btn-sm" data-phase-anlegen style={{ alignSelf: 'flex-start' }}
                    onClick={() => setFormular({ art: 'neu' })}>+ Phase</button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Kommt was="Speichern und neu berechnen" befund="neu_berechnen" />
          <Kommt was="Als Vorlage speichern" befund="vorlage_speichern" />
          <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 6 }}>
            {plan.status === 'aktiv' && <>
              <button type="button" className="v2-btn v2-btn-sm" data-plan-pausieren onClick={() => setFrage('pausieren')}>Pausieren</button>
              <button type="button" className="v2-btn v2-btn-sm" data-plan-beenden onClick={() => setFrage('beenden')}>Beenden</button>
            </>}
            {plan.status === 'entwurf' && (
              <button type="button" className="v2-btn v2-btn-sm" data-plan-loeschen style={{ color: 'var(--neg)' }} onClick={() => setFrage('loeschen')}>Löschen</button>
            )}
          </span>
        </div>
        {frage && (
          <div data-plan-frage={frage} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
            {frage === 'pausieren' ? <>„{plan.name}“ pausieren? Das Ziel ruht, die Phase bleibt gespeichert; du läufst auf Erhaltung.</>
              : frage === 'beenden' ? <>„{plan.name}“ beenden? Plan und Ziel werden abgeschlossen.</>
              : <>Entwurf „{plan.name}“ endgültig löschen?</>}
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <button type="button" className="v2-btn v2-btn-sm" onClick={() => setFrage(null)}>Abbrechen</button>
              <button type="button" className="v2-btn v2-btn-sm v2-btn-primary" data-plan-frage-ja onClick={() => { void tun(frage) }}>Ja</button>
            </div>
          </div>
        )}
        <Satz r={r} />
      </div>
    </Card>
  )
}

function NeuerPlan({ ziele, plaene, onFertig, vomTermin }: { ziele: ZielFortschritt[]; plaene: Plan[]; onFertig: () => void; vomTermin?: React.ReactNode }) {
  // `[cmd]` **`goal_plan_create(p_goal_id, p_name)`**: ein Plan gehoert zu einem Ziel,
  // `goal_programs_one_per_goal` — nur Steuerziele ohne Plan kommen in Frage.
  const frei = ziele.filter(z => z.goal_role === 'controlling' && !plaene.some(p => p.goal_id === z.goal_id))
  const [ziel, setZiel] = React.useState(frei[0]?.goal_id ?? '')
  const [name, setName] = React.useState('')
  const [r, setR] = React.useState<Planergebnis | null>(null)
  return (
    <Card title="Neuer Plan" sub="wird als Entwurf angelegt, aktiv erst über „Aktivieren“">
      <div data-neuer-plan className="v2-col-gap" style={{ gap: 8, fontSize: 12 }}>
        {frei.length === 0 ? (
          <span data-neuer-plan-ohne-ziel>Jedes Steuerziel hat schon einen Plan. Ein neuer Plan entsteht mit einem neuen Ziel — über „Ziel setzen“ in Goals.</span>
        ) : <>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><span className="v2-eyebrow">Ziel</span>
            <select className="v2-feld" data-neuer-plan-feld="ziel" value={ziel} onChange={e => setZiel(e.target.value)}>
              {frei.map(z => <option key={z.goal_id} value={z.goal_id}>{z.title}</option>)}
            </select></label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><span className="v2-eyebrow">Name</span>
            <input className="v2-feld" data-neuer-plan-feld="name" value={name} onChange={e => setName(e.target.value)} /></label>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" className="v2-btn v2-btn-sm v2-btn-primary" data-neuer-plan-anlegen disabled={!ziel || !name.trim()}
                    onClick={async () => { const x = await planAnlegenAktion(ziel, name.trim()); setR(x); if (x.ok) onFertig() }}>Als Entwurf anlegen</button>
            <button type="button" className="v2-btn v2-btn-sm v2-btn-ghost" onClick={onFertig}>Abbrechen</button>
          </div>
        </>}
        <span>Ausgangspunkt: <Kommt was="LumeOS-Vorlage, eigene Vorlage, vom Coach" befund="vorlagen" /></span>
        <Satz r={r} />
        {/* G-645/3: der Weg „vom Termin aus" (G-615) stand als eigener Block unter dem
            Planer — er legt Ziel und Phase in einem Schritt an, die Kette macht den Plan. */}
        {vomTermin}
      </div>
    </Card>
  )
}

function PlanKachel({ plan, aktiv, strategien, onBearbeiten }: {
  plan: Plan; aktiv: Plan | null; strategien: Strategie[]; onBearbeiten: () => void
}) {
  const [offen, setOffen] = React.useState(false)
  const [frage, setFrage] = React.useState(false)
  const [r, setR] = React.useState<Planergebnis | null>(null)
  const coachPflicht = plan.positionen.some(p => p.phase_type === 'contest_prep' || p.phase_type === 'peak_week')
  return (
    <div data-plan-kachel={plan.status} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10, fontSize: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Pill>{PLAN_STATUS_TEXT[plan.status]}</Pill><b>{plan.name}</b>
        <span className="v2-dim">{plan.positionen.length} Phase{plan.positionen.length === 1 ? '' : 'n'}{plan.ziel ? ` · Ziel „${plan.ziel.title}“` : ''}</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 4 }}>
          <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" data-plan-kachel-details={plan.id} onClick={() => setOffen(o => !o)}>Details</button>
          {plan.status !== 'abgeschlossen' && <>
            <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" aria-label={`${plan.name} bearbeiten`} onClick={onBearbeiten}><Icon name="edit" className="v2-ic v2-ic-sm" /></button>
            <button type="button" className="v2-btn v2-btn-sm" data-plan-aktivieren={plan.id} onClick={() => setFrage(true)}>Aktivieren</button>
          </>}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
        {plan.positionen.map(p => <span key={p.id} title={phaseName(p, strategien)} style={{ flex: p.duration_weeks ?? 4, height: 6, borderRadius: 3, background: FARBE[p.zustand] }} />)}
      </div>
      {frage && (
        <div data-aktivieren-frage style={{ marginTop: 8, border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
          {aktiv ? <><b>„{aktiv.name}“ steuert gerade.</b> Er wird pausiert, sein Ziel ruht. „{plan.name}“ übernimmt.</> : <>„{plan.name}“ übernimmt die Steuerung.</>}
          {coachPflicht && <div style={{ marginTop: 4 }}><Kommt was="Bestätigung durch Nutzer und Coach (Contest Prep / Peak Week)" befund="zweiwege_coach" /></div>}
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button type="button" className="v2-btn v2-btn-sm" onClick={() => setFrage(false)}>Abbrechen</button>
            <button type="button" className="v2-btn v2-btn-sm v2-btn-primary" data-aktivieren-ja
                    onClick={async () => { const x = await planAktivierenAktion(plan.id); setR(x); if (x.ok) setFrage(false) }}>Jetzt aktivieren</button>
          </div>
        </div>
      )}
      {offen && <Details plan={plan} strategien={strategien} />}
      <Satz r={r} />
    </div>
  )
}

export function PlanSeite({ plaene, strategien, grad, ziele, stichtag, startKg, onZuGoals, vomTermin, werkzeuge }: {
  plaene: Plan[]; strategien: Strategie[]; grad: string | null; ziele: ZielFortschritt[]
  stichtag: string; startKg: number | null; onZuGoals: () => void
  /** G-645/3: was die alten Bauteile konnten und der Planer nicht — als Einschub, nicht daneben. */
  vomTermin?: React.ReactNode; werkzeuge?: React.ReactNode
}) {
  const [bearbeitet, setBearbeitet] = React.useState<string | null>(null)
  const [neu, setNeu] = React.useState(false)
  const [details, setDetails] = React.useState(false)
  if (!abPro(grad)) {
    const st = ziele.find(z => z.goal_role === 'controlling' && z.zustand.zustand === 'active')
    return (
      <Card>
        <div data-plan-gesperrt={grad ?? 'ohne'} className="v2-col-gap" style={{ gap: 8, fontSize: 12.5 }}>
          <b style={{ fontSize: 14 }}>Die Phase engine ist ab Grad Pro frei</b>
          <span>Dein Ziel läuft trotzdem{st ? <>: „{st.title}“ steuert in Goals, dahinter steht ein einfacher Plan</> : ''}.
            Ab Pro baust du Pläne mit mehreren Phasen, Terminen und eigenen Werten.</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button type="button" className="v2-btn v2-btn-sm" onClick={onZuGoals}>Zu deinem Ziel in Goals</button>
            <span className="v2-dim">Dein Grad: {grad ?? 'nicht gesetzt'}</span>
          </div>
        </div>
      </Card>
    )
  }
  const aktiv = plaene.find(p => p.status === 'aktiv') ?? null
  const laufend = aktiv?.positionen.find(p => p.zustand === 'laufend') ?? null
  const variante = laufend?.strategie_code ? strategien.find(s => s.code === laufend.strategie_code) ?? null : null
  // G-645/3: aus `PhasenZustand` uebernommen — `next_codes` mit Namen (Strategie oder Phasenart)
  const danach = variante ? naechsteNamen(variante, strategien) : []
  const weitere = plaene.filter(p => p.status === 'entwurf' || p.status === 'pausiert')
  const fertig = plaene.filter(p => p.status === 'abgeschlossen')
  const imBearbeiten = plaene.find(p => p.id === bearbeitet) ?? null
  return (
    <div data-plan-seite className="v2-col-gap" style={{ gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="v2-btn v2-btn-sm" data-neuer-plan-oeffnen onClick={() => setNeu(true)}>+ Neuer Plan</button>
      </div>
      {neu && <NeuerPlan ziele={ziele} plaene={plaene} onFertig={() => setNeu(false)} vomTermin={vomTermin} />}
      {aktiv ? (
        <Card>
          <div data-aktiver-plan={aktiv.id} className="v2-col-gap" style={{ gap: 6 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="v2-eyebrow" style={{ fontSize: 10.5 }}>Aktiver Plan</span><Pill variant="pos">● läuft</Pill>
              <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 4 }}>
                <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" data-aktiver-plan-details aria-expanded={details} onClick={() => setDetails(d => !d)}>
                  <Icon name={details ? 'chevron_up' : 'chevron_down'} className="v2-ic v2-ic-sm" /></button>
                <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" data-aktiver-plan-bearbeiten aria-label={`${aktiv.name} bearbeiten`}
                        onClick={() => setBearbeitet(aktiv.id)}><Icon name="edit" className="v2-ic v2-ic-sm" /></button>
              </span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{aktiv.name}</div>
            <div className="v2-dim" style={{ fontSize: 12 }}>
              Aktuelle Phase: <b>{laufend ? phaseName(laufend, strategien) : 'keine laufende Phase'}</b>
              {laufend?.gueltig_ab ? ` seit ${datumDe(laufend.gueltig_ab)}` : ''}
              {laufend?.woche && <> · <span data-plan-woche>{laufend.woche}</span></>}
              {aktiv.ziel ? ` · steuert „${aktiv.ziel.title}“` : ''}
            </div>
            {danach.length > 0 && (
              <div className="v2-dim" data-plan-danach style={{ fontSize: 11.5 }}>Danach empfohlen: {danach.join(' · ')}</div>
            )}
            <Zeitachse plan={aktiv} stichtag={stichtag} strategien={strategien} />
            {details && <Details plan={aktiv} strategien={strategien} />}
          </div>
        </Card>
      ) : (
        <Card><div data-kein-aktiver-plan style={{ fontSize: 12.5 }}><b>Kein Plan aktiv – du läufst auf Erhaltung.</b> Aktiviere unten einen Plan, lege einen neuen an oder setze in Goals eine Richtung.</div></Card>
      )}
      {werkzeuge}
      {imBearbeiten && <Bearbeiten plan={imBearbeiten} strategien={strategien} startKg={startKg} stichtag={stichtag} onFertig={() => setBearbeitet(null)} />}
      <Card title="Weitere Pläne" sub="Entwürfe und pausierte · immer nur einer aktiv">
        <div className="v2-col-gap" style={{ gap: 8 }}>
          {weitere.length === 0 ? <span className="v2-dim" style={{ fontSize: 11.5 }}>Keine weiteren Pläne.</span>
            : weitere.map(p => <PlanKachel key={p.id} plan={p} aktiv={aktiv} strategien={strategien} onBearbeiten={() => setBearbeitet(p.id)} />)}
        </div>
      </Card>
      <Card title={`Abgeschlossene Pläne · ${fertig.length}`}>
        <div className="v2-col-gap" style={{ gap: 8 }}>
          {fertig.length === 0 ? <span className="v2-dim" style={{ fontSize: 11.5 }}>Noch keiner.</span>
            : fertig.map(p => <PlanKachel key={p.id} plan={p} aktiv={aktiv} strategien={strategien} onBearbeiten={() => {}} />)}
        </div>
      </Card>
      <Card title="Vorlagen"><Kommt was="LumeOS-Standard · Eigene · Vom Coach" befund="vorlagen" /></Card>
    </div>
  )
}
