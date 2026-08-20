'use client'

// Die Erholungswert-Kachel mit echten Daten (G-76).
//
// `[read]` **Die Zahl, nicht das Urteil.** Die Vorlage zeigt neben dem
// Ring einen Readiness-Text („Optimal", „Vorsicht") und einen Ratschlag
// („Train hard"). `SPEC_09` liefert sechs solcher Stufen — der
// Schemaentwurf fuehrt sie als Entscheidungspunkt, weil sie
// Urteilssprache sind. **Hier steht deshalb der Wert und woraus er
// besteht, und sonst nichts.**
//
// Dieselbe Regel wie bei Medical: „Im Bereich / Ueber / Unter" ja,
// „Optimal" nein — es benennt keine Lage.
import * as React from 'react'
import { Card, Ring } from '@lumeos/ui'

import type { ScoreErgebnis } from '../../../lib/recovery/score'
import type { CheckinZeile } from '../../../lib/recovery/checkin-read'

export function ScoreKachel({
  ergebnis, zeile,
}: {
  ergebnis: ScoreErgebnis
  zeile: CheckinZeile
}) {
  const gerechnet = ergebnis.teile.filter(t => t.punkte !== null)
  const offen = ergebnis.teile.filter(t => t.punkte === null)

  return (
    <Card>
      <div className="v2-rec-score-kopf">
        <Ring
          value={ergebnis.score ?? 0}
          max={100}
          color="var(--acc-recov)"
          label="score"
          size={140}
          stroke={10}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
            Erholungswert · {zeile.entry_date}
          </div>

          {/* `[read]` Kein Readiness-Text. Was hier steht, ist die
              Herkunft der Zahl — nicht ihre Deutung. */}
          <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', lineHeight: 1.5, marginBottom: 10 }}>
            Gerechnet aus {gerechnet.length} von {ergebnis.teile.length} Anteilen
            ({ergebnis.gewichtBasis} von 100 Gewichtspunkten).
            {ergebnis.fehlendeTeile > 0 && (
              <> Die übrigen {ergebnis.fehlendeTeile} zählen nicht mit — weder als
              null noch als voll.</>
            )}
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {([
              ['Schlaf', zeile.sleep_hours === null ? '—' : `${zeile.sleep_hours} h`,
                zeile.sleep_quality === null ? '—' : `q ${zeile.sleep_quality}/10`],
              ['Gefühl', zeile.subjective_feeling === null ? '—' : `${zeile.subjective_feeling}/10`,
                zeile.mood],
              ['HRV', zeile.hrv_rmssd === null ? '—' : `${zeile.hrv_rmssd} ms`,
                zeile.hrv_rmssd === null ? 'nicht erfasst' : 'erfasst'],
              ['Stress', zeile.stress_level === null ? '—' : `${zeile.stress_level}/10`, ''],
            ] as Array<[string, string, string]>).map(([l, v, s]) => (
              <div key={l}>
                <div className="v2-eyebrow" style={{ marginBottom: 2 }}>{l}</div>
                <div className="v2-num" style={{ fontSize: 16, lineHeight: 1 }}>{v}</div>
                {s && <div className="v2-dim v2-mono" style={{ fontSize: 9.5, marginTop: 2 }}>{s}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="v2-divider" />
      <div className="v2-eyebrow" style={{ marginBottom: 8 }}>
        Zusammensetzung · manual
      </div>
      <div className="v2-col-gap" style={{ gap: 5 }}>
        {gerechnet.map(t => (
          <div key={t.code} className="v2-rec-term">
            <span style={{ color: 'var(--fg-muted)' }}>{t.label}</span>
            <span className="v2-mono v2-dim" style={{ fontSize: 10 }}>{t.roh}</span>
            <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999 }}>
              <div style={{
                height: '100%',
                width: `${((t.punkte ?? 0) / t.gewicht) * 100}%`,
                background: 'var(--acc-recov)', borderRadius: 999,
              }} />
            </div>
            <span className="v2-num" style={{ textAlign: 'right' }}>
              {(t.punkte ?? 0).toFixed(1)}
              <span className="v2-dim" style={{ fontSize: 9 }}>/{t.gewicht}</span>
            </span>
          </div>
        ))}

        {/* `[read]` Die offenen Anteile stehen DA, mit Grund — sie
            wegzulassen liesse den Score vollstaendiger aussehen, als
            er ist. */}
        {offen.map(t => (
          <div key={t.code} className="v2-rec-term" style={{ opacity: 0.6 }}>
            <span style={{ color: 'var(--fg-muted)' }}>{t.label}</span>
            <span className="v2-mono v2-dim" style={{ fontSize: 10 }}>{t.roh}</span>
            <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999 }} />
            <span className="v2-num v2-dim" style={{ textAlign: 'right' }}>
              —<span style={{ fontSize: 9 }}>/{t.gewicht}</span>
            </span>
          </div>
        ))}

        <div className="v2-rec-term" style={{
          fontSize: 12, paddingTop: 6, borderTop: '1px solid var(--border-strong)',
        }}>
          <span style={{ fontWeight: 700 }}>Summe</span>
          <span className="v2-mono v2-dim" style={{ fontSize: 10 }}>
            {ergebnis.gewichtBasis} von 100 Gewichtspunkten
          </span>
          <span />
          <span className="v2-num" style={{
            textAlign: 'right', fontSize: 16, fontWeight: 600, color: 'var(--acc-recov)',
          }}>
            {ergebnis.score ?? '—'}
          </span>
        </div>
      </div>
    </Card>
  )
}
