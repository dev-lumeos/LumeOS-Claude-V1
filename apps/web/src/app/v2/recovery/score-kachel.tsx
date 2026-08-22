'use client'

// Die Erholungswert-Kachel — **aus `recovery.scores`** (G-82).
//
// `[read]` **Die Zahl, nicht das Urteil.** Die Vorlage zeigt neben dem
// Ring einen Readiness-Text („Optimal", „Vorsicht") und einen
// Ratschlag. `SPEC_09` liefert sechs solcher Stufen — sie sind
// Entscheidungspunkt E3 und Tom nimmt sie einzeln ab. **Hier steht
// deshalb der Wert und woraus er besteht, und sonst nichts.**
//
// **G-82 gegenueber G-76 geaendert:** die Kachel rechnet nicht mehr
// selbst, sie liest. `[cmd]` Die Tabelle traegt je Tag alle sieben
// Einzelterme, die benutzte Schlafdauer, den Soreness-Schnitt mit der
// Zahl der gemeldeten Muskeln, den ACWR und die Herkunft je
// Rueckfall. Das laesst sich zeigen; eine Browserrechnung nicht.
import * as React from 'react'
import { Card, Ring } from '@lumeos/ui'

import type { ScoreZeile } from '../../../lib/recovery/scores-read'
import type { CheckinZeile } from '../../../lib/recovery/checkin-read'

/** Was die Herkunftsvermerke der Tabelle im Klartext heissen. */
const QUELLE_TEXT: Record<string, string> = {
  fallback_c123_e9: 'Rückfallwert — Ernährung steht nicht im Check-in (E9)',
  not_used_manual_mode: 'im manual-Modus nicht benutzt',
  // C-124 ist entschieden: alle 32 Registry-Zeilen sagen
  // REMOVE_NUMERIC_VALUE — der Bonus bleibt dauerhaft 0, die Quelle
  // in der Datenbank heisst weiter `pending_c124_e5` (Codex-Bereich).
  pending_c124_e5: 'ohne Punktbonus — C-124: keine Evidenz für Bonuswerte',
}

export function ScoreKachel({
  zeile, checkin,
}: {
  zeile: ScoreZeile
  /** Fuer die Rohwerte daneben; `null`, wenn keiner vorliegt. */
  checkin: CheckinZeile | null
}) {
  // `[read]` Ein Anteil mit 0 Punkten ist NICHT dasselbe wie ein
  // fehlender: die Tabelle rechnet alle sieben, aber zwei davon aus
  // Rueckfallwerten. Der Unterschied steht an der Zeile.
  const summe = zeile.anteile.reduce((s, a) => s + a.punkte, 0)
  const mitRueckfall = zeile.anteile.filter(a => a.quelle?.startsWith('fallback')).length

  return (
    <Card>
      <div className="v2-rec-score-kopf">
        <Ring
          value={zeile.score}
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
            Aus <strong>{zeile.mode}</strong>-Modus, gespeichert als{' '}
            <span className="v2-mono">{zeile.algorithm_version}</span>.
            {mitRueckfall > 0 && (
              <> {mitRueckfall === 1 ? 'Ein Anteil beruht' : `${mitRueckfall} Anteile beruhen`}
                {' '}auf einem Rückfallwert — an der Zeile vermerkt.</>
            )}
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {([
              ['Schlaf',
                zeile.sleep_hours_used == null ? '—' : `${zeile.sleep_hours_used} h`,
                checkin?.sleep_quality == null ? '' : `q ${checkin.sleep_quality}/10`],
              ['Muskelkater',
                zeile.soreness_avg_used == null ? '—' : zeile.soreness_avg_used.toFixed(2),
                zeile.soreness_reported_count == null ? ''
                  : `${zeile.soreness_reported_count} gemeldet`],
              // C-181: die ACWR-Zelle ist aus der Oberflaeche
              // entfernt (Safe-Zone/Ratio ohne Beleg). Die DB-Spalte
              // `scores.acwr_used` und ihr Formelterm sind
              // Codex-Bereich — gemeldet, nicht angefasst.
              ['HRV',
                checkin?.hrv_rmssd == null ? '—' : `${checkin.hrv_rmssd} ms`,
                QUELLE_TEXT[zeile.hrv_source ?? ''] ?? zeile.hrv_source ?? ''],
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
        Zusammensetzung · {zeile.mode}
      </div>
      <div className="v2-col-gap" style={{ gap: 5 }}>
        {zeile.anteile.map(a => (
          <div key={a.code} className="v2-rec-term">
            <span style={{ color: 'var(--fg-muted)' }}>{a.label}</span>
            <span className="v2-mono v2-dim" style={{ fontSize: 10 }}>
              {a.quelle ? (QUELLE_TEXT[a.quelle] ?? a.quelle) : ''}
            </span>
            <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999 }}>
              <div style={{
                height: '100%',
                width: `${Math.max(0, Math.min(100, (a.punkte / a.gewicht) * 100))}%`,
                background: 'var(--acc-recov)', borderRadius: 999,
                opacity: a.quelle?.startsWith('fallback') ? 0.45 : 1,
              }} />
            </div>
            <span className="v2-num" style={{ textAlign: 'right' }}>
              {a.punkte.toFixed(1)}
              <span className="v2-dim" style={{ fontSize: 9 }}>/{a.gewicht}</span>
            </span>
          </div>
        ))}

        {/* Der Modalitaetsbonus steht eigens — er kommt nicht aus dem
            Check-in, sondern aus `modality_log`. */}
        <div className="v2-rec-term" style={{
          paddingTop: 6, borderTop: '1px solid var(--border)',
        }}>
          <span style={{ fontWeight: 600 }}>Modalitätsbonus</span>
          <span className="v2-mono v2-dim" style={{ fontSize: 10 }}>
            {QUELLE_TEXT[zeile.modality_bonus_source ?? ''] ?? zeile.modality_bonus_source ?? ''}
          </span>
          <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999 }}>
            <div style={{
              height: '100%', width: `${Math.min(100, (zeile.modality_bonus / 5) * 100)}%`,
              background: 'var(--pos)', borderRadius: 999,
            }} />
          </div>
          <span className="v2-num" style={{
            textAlign: 'right', color: zeile.modality_bonus > 0 ? 'var(--pos)' : 'var(--fg-dim)',
          }}>
            +{zeile.modality_bonus.toFixed(1)}
          </span>
        </div>

        <div className="v2-rec-term" style={{
          fontSize: 12, paddingTop: 6, borderTop: '1px solid var(--border-strong)',
        }}>
          <span style={{ fontWeight: 700 }}>Summe</span>
          <span className="v2-mono v2-dim" style={{ fontSize: 10 }}>
            {summe.toFixed(1)} von 100 Gewichtspunkten
          </span>
          <span />
          <span className="v2-num" style={{
            textAlign: 'right', fontSize: 16, fontWeight: 600, color: 'var(--acc-recov)',
          }}>
            {zeile.score.toFixed(1)}
          </span>
        </div>
      </div>
    </Card>
  )
}

/**
 * Die Verlaufskurve — **170 Tage, die es im Browser nicht gaebe.**
 *
 * `[read]` Der Auftrag nennt sie als eigentlichen Grund fuer die
 * Tabelle: „170 Tage lassen sich nicht im Browser rechnen, wenn die
 * Kachel eine Kurve zeigen soll."
 */
export function ScoreVerlauf({
  verlauf, gesamt,
}: {
  verlauf: Array<{ entry_date: string; score: number }>
  gesamt: number
}) {
  if (verlauf.length < 2) return null

  const werte = verlauf.map(v => v.score)
  const min = Math.min(...werte)
  const max = Math.max(...werte)

  // `[cmd]` **Die erste Fassung log — nicht in den Zahlen, im Bild.**
  // Sie spannte min..max auf die volle Hoehe und zeichnete in ein
  // 100x100-Feld mit `preserveAspectRatio="none"`. Gemessen liegen von
  // 170 Tagen **genau einer** unter 60 (2026-06-05, 43,0) und es gibt
  // **keine Datumsluecke**; die Kurve zeigte trotzdem ein Dutzend
  // Zacken bis auf die Achse. Der Grund war die Streckung: 170 Punkte
  // in ein quadratisches Feld gerechnet und dann breit gezogen macht
  // aus jeder kleinen Delle eine Spitze.
  //
  // `[read]` **Jetzt hat das Feld die Form, in der es steht** (600x90),
  // und die Skala beginnt bei 0 statt bei `min`. Eine Kurve, deren
  // Grundlinie das Minimum ist, behauptet einen Absturz, wo nur der
  // schlechteste Tag steht.
  const B = 600, H = 90, RAND = 4
  const obenWert = Math.max(100, Math.ceil(max / 10) * 10)
  const punkte = verlauf.map((v, i) => {
    const x = (i / (verlauf.length - 1)) * B
    const y = H - RAND - (v.score / obenWert) * (H - RAND * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  return (
    <Card
      title="Verlauf"
      sub={`${verlauf.length} von ${gesamt} Tagen · ${verlauf[0].entry_date} bis ${verlauf[verlauf.length - 1].entry_date}`}
    >
      <svg viewBox={`0 0 ${B} ${H}`} preserveAspectRatio="none"
           style={{ width: '100%', height: H, display: 'block' }}
           role="img"
           aria-label={`Erholungswert über ${verlauf.length} Tage, `
             + `zwischen ${min.toFixed(1)} und ${max.toFixed(1)}`}>
        {/* Die Achse, damit die Kurve eine Bezugslinie hat. */}
        <line x1="0" y1={H - RAND} x2={B} y2={H - RAND}
              stroke="var(--border)" strokeWidth="1"
              vectorEffect="non-scaling-stroke" />
        <polyline
          points={punkte}
          fill="none"
          stroke="var(--acc-recov)"
          strokeWidth="1.4"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 4,
      }}>
        <span className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>
          {`tiefster ${min.toFixed(1)} · Skala 0–${obenWert}`}
        </span>
        <span className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>
          {`höchster ${max.toFixed(1)}`}
        </span>
      </div>
    </Card>
  )
}
