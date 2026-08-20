'use client'

// Die Timeline mit echten Daten (G-79).
//
// **Tom, 2026-08-18:** *„Wenn wir uns Timeline anschauen — das wuerde
// das schon von sich aus darstellen. Da muesste aber jede Zeile
// anwaehlbar sein fuer Details."*
//
// FORM: `theme-v1/module-goals.jsx:360-407` (`GanttRow`) — ein
// Zwoelfmonatsraster, je Zeile ein Balken von Beginn bis Frist.
//
// `[cmd]` **Die Daten tragen es:** Ziele haben `gueltig_ab` und
// `target_date`, Phasen `gueltig_ab` und `projected_end_date`,
// Meilensteine ein `target_date` als Punkt. Alles im Jahr 2026.
//
// **KEINE BEWERTUNG.** Der Balken zeigt Zeitraum und Fortschritt —
// nicht, ob jemand im Plan liegt. Die Attrappe fuehrte dafuer
// `pace: 'ahead' | 'on-track' | 'behind'`; das wird hier nicht
// nachgebaut.
import * as React from 'react'
import { Card, Pill } from '@lumeos/ui'

import type { Meilenstein, Phase, ZielFortschritt } from '../../../lib/goals/lesen'
import { ABGESCHLOSSEN, STATUS_LABEL, type ZielStatus } from '../../../lib/goals/ziel-regeln'

const MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

/** Anteil im Jahr, 0–1. Ausserhalb des Jahres wird gekappt. */
function jahresAnteil(datum: string, jahr: number): number | null {
  const d = new Date(`${datum}T12:00:00`)
  if (Number.isNaN(d.getTime())) return null
  const start = new Date(`${jahr}-01-01T12:00:00`).getTime()
  const ende = new Date(`${jahr}-12-31T12:00:00`).getTime()
  const p = (d.getTime() - start) / (ende - start)
  return Math.max(0, Math.min(1, p))
}

type Zeile = {
  id: string
  art: 'Ziel' | 'Phase' | 'Meilenstein'
  titel: string
  von: string | null
  bis: string | null
  status: string | null
  /** Fortschritt in Prozent, wenn gerechnet. */
  pct: number | null
  detail: string
}

export function TimelineTab({
  ziele, phase, meilensteine, stichtag,
}: {
  ziele: ZielFortschritt[]
  /** `[cmd]` `ladePhase` liefert die EINE Phase am Stichtag, keine Liste. */
  phase: Phase | null
  meilensteine: Meilenstein[]
  stichtag: string
}) {
  const phasen = phase ? [phase] : []
  const [gewaehlt, setGewaehlt] = React.useState<string | null>(null)

  const jahr = Number(stichtag.slice(0, 4))

  const zeilen: Zeile[] = [
    ...ziele.map(g => ({
      id: `ziel-${g.goal_id}`,
      art: 'Ziel' as const,
      titel: g.title,
      von: null,
      bis: g.target_date,
      status: g.status,
      pct: g.progress_status === 'measured' ? g.progress_pct : null,
      detail: [
        g.goal_type ? `Typ ${g.goal_type.replace(/_/g, ' ')}` : null,
        g.priority != null ? `Priorität ${g.priority}` : null,
        g.target_value != null
          ? `Ziel ${g.target_value} ${g.target_unit ?? ''}`.trim() : null,
        g.current_value != null
          ? `aktuell ${g.current_value} ${g.target_unit ?? ''}`.trim() : null,
      ].filter(Boolean).join(' · '),
    })),
    ...phasen.map((p, i) => ({
      id: `phase-${i}`,
      art: 'Phase' as const,
      titel: (p.phase_type ?? '').replace(/_/g, ' '),
      von: p.gueltig_ab,
      bis: p.projected_end_date ?? p.actual_end_date,
      status: p.actual_end_date ? 'beendet' : 'laufend',
      pct: null,
      detail: [
        p.variant ? `Variante ${p.variant}` : null,
        p.actual_end_date ? `beendet ${p.actual_end_date}` : 'läuft',
      ].filter(Boolean).join(' · '),
    })),
    ...meilensteine.map(m => ({
      id: `ms-${m.milestone_id}`,
      art: 'Meilenstein' as const,
      titel: m.title,
      von: null,
      bis: m.target_date,
      status: m.computed_status ?? m.stored_status,
      pct: null,
      detail: [
        m.target_value != null
          ? `Ziel ${m.target_value} ${m.target_unit ?? ''}`.trim() : null,
        m.current_value != null ? `aktuell ${m.current_value}` : null,
      ].filter(Boolean).join(' · '),
    })),
  ].sort((a, b) => (a.bis ?? '9999').localeCompare(b.bis ?? '9999'))

  const heute = jahresAnteil(stichtag, jahr)

  return (
    <Card
      title={`Zeitachse · ${jahr}`}
      sub={`${ziele.length} Ziele · ${phasen.length} Phasen · ${meilensteine.length} Meilensteine`}
    >
      {/* Monatsraster */}
      <div style={{
        display: 'grid', gridTemplateColumns: '190px 1fr', gap: 10, marginBottom: 6,
      }}>
        <div />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2,
          fontSize: 9.5, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)',
        }}>
          {MONATE.map(m => <span key={m}>{m}</span>)}
        </div>
      </div>

      <div className="v2-col-gap" style={{ gap: 4 }}>
        {zeilen.map(z => (
          <TimelineZeile
            key={z.id} z={z} jahr={jahr} heute={heute}
            offen={gewaehlt === z.id}
            onWahl={() => setGewaehlt(gewaehlt === z.id ? null : z.id)}
          />
        ))}
      </div>

      {zeilen.length === 0 && (
        <div className="v2-dim" style={{ fontSize: 11.5, padding: '12px 0' }}>
          Noch nichts mit Datum hinterlegt.
        </div>
      )}

      <div className="v2-divider" />
      <div className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>
        {`Heute · ${stichtag} · eine Zeile anklicken für Details`}
      </div>
    </Card>
  )
}

function TimelineZeile({
  z, jahr, heute, offen, onWahl,
}: {
  z: Zeile
  jahr: number
  heute: number | null
  offen: boolean
  onWahl: () => void
}) {
  const von = z.von ? jahresAnteil(z.von, jahr) : null
  const bis = z.bis ? jahresAnteil(z.bis, jahr) : null

  const farbe = z.art === 'Ziel' ? 'var(--acc-goals)'
    : z.art === 'Phase' ? 'var(--acc-recov)' : 'var(--acc-nutri)'

  const abgeschlossen = z.status
    ? ABGESCHLOSSEN.includes(z.status as ZielStatus) || z.status === 'achieved'
    : false

  return (
    <div>
      {/* `[read]` Tom: „Da muesste aber jede Zeile anwaehlbar sein fuer
          Details." Ein Knopf, keine Zeile mit `onClick` — sonst ist er
          per Tastatur nicht erreichbar. */}
      <button
        type="button"
        onClick={onWahl}
        aria-expanded={offen}
        style={{
          width: '100%', display: 'grid', gridTemplateColumns: '190px 1fr',
          gap: 10, alignItems: 'center', background: 'none', border: 0,
          padding: '4px 0', cursor: 'pointer', textAlign: 'left', font: 'inherit',
        }}
      >
        <span style={{
          fontSize: 11.5, color: 'var(--fg)', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          <span className="v2-dim v2-mono" style={{ fontSize: 9.5, marginRight: 5 }}>
            {z.art.slice(0, 1)}
          </span>
          {z.titel}
        </span>

        <span style={{
          position: 'relative', height: 16, background: 'var(--surface-2)',
          borderRadius: 3, overflow: 'hidden', display: 'block',
        }}>
          {/* Der Balken: Zeitraum, wo einer da ist; sonst ein Punkt. */}
          {von != null && bis != null ? (
            <span style={{
              position: 'absolute', left: `${von * 100}%`,
              width: `${Math.max(1, (bis - von) * 100)}%`,
              top: 3, bottom: 3, borderRadius: 3,
              background: farbe, opacity: abgeschlossen ? 0.45 : 0.8,
            }} />
          ) : bis != null ? (
            <span style={{
              position: 'absolute', left: `calc(${bis * 100}% - 4px)`,
              top: 4, width: 8, height: 8, borderRadius: 999,
              background: farbe,
            }} />
          ) : null}

          {/* Heute-Linie */}
          {heute != null && (
            <span style={{
              position: 'absolute', left: `${heute * 100}%`, top: 0, bottom: 0,
              width: 1, background: 'var(--fg-dim)', opacity: 0.6,
            }} />
          )}
        </span>
      </button>

      {offen && (
        <div style={{
          margin: '2px 0 6px 200px', padding: '8px 10px',
          background: 'var(--bg-elev)', border: '1px solid var(--border)',
          borderRadius: 5,
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
            <Pill>{z.art}</Pill>
            {z.status && (
              <Pill>{STATUS_LABEL[z.status as ZielStatus] ?? z.status}</Pill>
            )}
            {z.pct != null && (
              <span className="v2-num v2-dim" style={{ fontSize: 10.5 }}>
                {z.pct.toFixed(1)} %
              </span>
            )}
          </div>
          <div className="v2-dim v2-mono" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
            {z.von ? `von ${z.von} ` : ''}{z.bis ? `bis ${z.bis}` : 'ohne Datum'}
            {z.detail ? ` · ${z.detail}` : ''}
          </div>
        </div>
      )}
    </div>
  )
}
