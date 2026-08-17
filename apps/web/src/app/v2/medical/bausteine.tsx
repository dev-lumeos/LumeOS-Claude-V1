'use client'

// Die drei geteilten Bausteine des Medical-Moduls.
//
// QUELLE: theme-v1/module-medical-v2.jsx:62-111 — `RangeIndicator`,
// `FlagPill`, `TrendBadge`. Die Vorlage exportiert sie ausdruecklich
// (`Object.assign(window, { …, RangeIndicator, FlagPill, TrendBadge, … })`,
// Zeile 818), weil mehrere Tabs sie brauchen.
//
// `[read]` Sie stehen in einer eigenen Datei, weil vier Stellen sie
// benutzen: die Biomarker-Tabelle, das Biomarker-Modal, der
// Insights-Tab und die Symptomverknuepfung.
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// `color-mix(in srgb, …)` -> `in oklch`.
import * as React from 'react'
import { Pill } from '@lumeos/ui'

import {
  FLAG_META, calcBiomarkerFlag, calcBiomarkerTrend, type Biomarker,
} from './daten'

/**
 * Der Doppelbereich: Laborband, Optimumband und der eigene Wert.
 *
 * `[cmd]` module-medical-v2.jsx:62-94. **Das ist die Kernaussage des
 * Moduls** — die Vorlage nennt es „dual-range": ein Wert kann im
 * Laborbereich liegen und trotzdem ausserhalb des Optimums. Wer nur
 * einen Bereich zeichnet, verliert genau die Unterscheidung, um die
 * es geht.
 */
export function RangeIndicator({ b, height = 26, showLabels = true }: {
  b: Biomarker; height?: number; showLabels?: boolean
}) {
  const flag = calcBiomarkerFlag(b.value, b)
  const meta = FLAG_META[flag]
  const lo = b.critical_low ?? (b.lab_min != null ? b.lab_min * 0.5 : 0)
  const hi = b.critical_high ?? (b.lab_max != null ? b.lab_max * 1.5 : b.value * 1.5)
  const span = hi - lo || 1
  const pos = (v: number) => Math.max(0, Math.min(100, ((v - lo) / span) * 100))
  const labL = b.lab_min != null ? pos(b.lab_min) : 0
  const labR = b.lab_max != null ? pos(b.lab_max) : 100
  const optL = b.optimal_min != null ? pos(b.optimal_min) : labL
  const optR = b.optimal_max != null ? pos(b.optimal_max) : labR
  const valPos = pos(b.value)

  return (
    <div>
      <div style={{
        position: 'relative', height, borderRadius: 5, overflow: 'hidden',
        background: 'color-mix(in oklch, var(--neg) 20%, var(--surface-2))',
        border: '1px solid var(--border)',
      }}>
        {/* Laborband */}
        <div style={{
          position: 'absolute', left: `${labL}%`, width: `${labR - labL}%`, top: 0, bottom: 0,
          background: 'color-mix(in oklch, var(--acc-recov) 26%, transparent)',
        }} />
        {/* Optimumband */}
        <div style={{
          position: 'absolute', left: `${optL}%`, width: `${optR - optL}%`, top: 0, bottom: 0,
          background: 'color-mix(in oklch, var(--pos) 34%, transparent)',
        }} />
        {/* Der Wert */}
        <div style={{
          position: 'absolute', left: `${valPos}%`, top: -2, bottom: -2, width: 2.5,
          background: meta.c, boxShadow: '0 0 0 1.5px var(--bg)', borderRadius: 2,
        }} />
      </div>
      {showLabels && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 4,
          fontSize: 9, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)',
        }}>
          <span>{b.critical_low ?? '—'}</span>
          <span style={{ color: 'var(--acc-recov)' }}>lab {b.lab_min}–{b.lab_max}</span>
          <span style={{ color: 'var(--pos)' }}>optimal {b.optimal_min}–{b.optimal_max}</span>
          <span>{b.critical_high ?? '—'}</span>
        </div>
      )}
    </div>
  )
}

/** [cmd] module-medical-v2.jsx:96-99. */
export function FlagPill({ flag, small }: { flag: string; small?: boolean }) {
  const m = FLAG_META[flag]
  return (
    <Pill style={{
      borderColor: `color-mix(in oklch, ${m.c} 35%, var(--border))`,
      color: m.c,
      background: `color-mix(in oklch, ${m.c} 8%, transparent)`,
      fontSize: small ? 9 : undefined,
    }}>{m.label}</Pill>
  )
}

/** [cmd] module-medical-v2.jsx:101-111. */
export function TrendBadge({ hist }: { hist: number[] }) {
  const t = calcBiomarkerTrend(hist)
  if (t.direction === 'insufficient_data') {
    return <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>n&lt;3</span>
  }
  const arrow = t.direction === 'rising' ? '↑' : t.direction === 'falling' ? '↓' : '→'
  const c = t.strength === 'significant' ? 'var(--fg)'
    : t.strength === 'mild' ? 'var(--fg-muted)' : 'var(--fg-dim)'
  return (
    <span className="v2-mono" style={{ fontSize: 10.5, color: c }}
          title={`${t.direction} · ${t.strength} · ${t.change_pct}% over ${t.n} points`}>
      {arrow} {t.change_pct > 0 ? '+' : ''}{t.change_pct}%
    </span>
  )
}
