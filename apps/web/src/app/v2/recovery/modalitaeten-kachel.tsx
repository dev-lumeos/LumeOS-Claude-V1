'use client'

// Die Modalitaeten aus `recovery.modality_log` (G-82).
//
// FORM: Kachel #4 des Entwurfs und die Posten 20–25 — Sauna, Massage,
// Eisbad, Dehnen.
//
// `[cmd]` **89 Zeilen auf `dev@lumeos.app`**, vier Arten:
// `stretching` 42 · `sauna` 19 · `cold_plunge` 15 · `massage` 13.
//
// `[read]` **Der Bonus ist auf allen 89 Zeilen 0**, mit
// `bonus_source = 'pending_c124_e5'`. Das ist kein Fehler, sondern der
// Stand: die Bonuswerte je Art sind Entscheidungspunkt E5 und warten
// auf die Recherche in C-124. **Die Kachel zeigt die 0 und sagt,
// worauf sie wartet** — einen Wert zu erfinden waere schlimmer als
// eine ehrliche Null.
import * as React from 'react'
import { Card, Pill } from '@lumeos/ui'

import type { ModalitaetenStand } from '../../../lib/recovery/scores-read'

/** Die vier Arten, die vorkommen — Beschriftung wie im Entwurf. */
const ART_LABEL: Record<string, string> = {
  sauna: 'Sauna',
  massage: 'Massage',
  cold_plunge: 'Eisbad',
  stretching: 'Dehnen',
  foam_rolling: 'Faszienrolle',
  contrast_therapy: 'Wechselbad',
  compression: 'Kompression',
  yoga: 'Yoga',
  nap: 'Schlaf am Tag',
  breathwork: 'Atemübung',
  meditation: 'Meditation',
  other: 'Sonstiges',
}

function label(art: string): string {
  return ART_LABEL[art] ?? art.replace(/_/g, ' ')
}

export function ModalitaetenKachel({ stand }: { stand: ModalitaetenStand }) {
  if (stand.fehler) {
    return (
      <Card title="Modalitäten">
        <div style={{ fontSize: 12, color: 'var(--neg)' }}>
          Nicht geladen: {stand.fehler}
        </div>
      </Card>
    )
  }

  if (stand.gesamt === 0) {
    return (
      <Card title="Modalitäten">
        <div className="v2-dim" style={{ fontSize: 11.5, padding: '10px 0' }}>
          Noch keine Modalität erfasst.
        </div>
      </Card>
    )
  }

  const tag = stand.heute[0]?.entry_date ?? null
  const bonusSumme = stand.heute.reduce((s, m) => s + m.bonus_value, 0)

  return (
    <Card
      title="Modalitäten"
      sub={`${stand.gesamt} erfasst · ${stand.jeArt.length} Arten`}
    >
      {/* Der juengste Tag ausfuehrlich — Kachel #4 des Entwurfs. */}
      {stand.heute.length > 0 && (
        <>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
            {`Letzter Tag · ${tag}`}
          </div>
          <div className="v2-col-gap" style={{ gap: 6, marginBottom: 12 }}>
            {/* `[cmd]` Bei 1440 px quetschte `flex` den Namen auf eine
                Spalte, weil der freie Text (`detail`) beliebig lang
                ist. Die Zeile bricht deshalb um. */}
            {stand.heute.map((m, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px',
                background: 'var(--bg-elev)', border: '1px solid var(--border)',
                borderRadius: 5, flexWrap: 'wrap',
              }}>
                <div style={{ flex: '1 1 120px', minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>
                    {label(m.modality_type)}
                  </div>
                  <div className="v2-dim v2-mono" style={{ fontSize: 10, lineHeight: 1.4 }}>
                    {[
                      m.logged_time ? m.logged_time.slice(0, 5) : null,
                      m.duration_min != null ? `${m.duration_min} min` : null,
                      m.detail,
                    ].filter(Boolean).join(' · ')}
                  </div>
                </div>
                {/* `[cmd]` Die Skala ist 1–10, nicht 1–5:
                    `121_recovery_scores_modalities.sql:216` setzt
                    `CHECK (… BETWEEN 1 AND 10)`. Gemessen liegen die
                    89 Zeilen zwischen 6 und 8. Beide Wirkungen stehen
                    da — wie erfasst, ohne Deutung. */}
                {(m.immediate_effect != null || m.next_day_effect != null) && (
                  <span className="v2-dim v2-mono" style={{ fontSize: 10, whiteSpace: 'nowrap' }}>
                    {[
                      m.immediate_effect != null ? `sofort ${m.immediate_effect}/10` : null,
                      m.next_day_effect != null ? `Folgetag ${m.next_day_effect}/10` : null,
                    ].filter(Boolean).join(' · ')}
                  </span>
                )}
                <span className="v2-num" style={{
                  color: m.bonus_value > 0 ? 'var(--pos)' : 'var(--fg-dim)',
                  fontSize: 11.5,
                }}>
                  +{m.bonus_value.toFixed(1)}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
            flexWrap: 'wrap',
          }}>
            <span className="v2-num" style={{ fontSize: 12 }}>
              Bonus {bonusSumme.toFixed(1)}
              <span className="v2-dim"> von höchstens 5</span>
            </span>
            {bonusSumme === 0 && (
              <Pill variant="warn">Bonuswerte offen</Pill>
            )}
          </div>
        </>
      )}

      {/* Die Verteilung ueber alles Geladene. */}
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Wie oft</div>
      <div className="v2-col-gap" style={{ gap: 4 }}>
        {stand.jeArt.map(a => (
          <div key={a.art} style={{
            display: 'grid', gridTemplateColumns: '110px 1fr 60px 68px',
            alignItems: 'center', gap: 8, fontSize: 11.5,
          }}>
            <span style={{ color: 'var(--fg-muted)' }}>{label(a.art)}</span>
            <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999 }}>
              <div style={{
                height: '100%',
                width: `${(a.anzahl / stand.jeArt[0].anzahl) * 100}%`,
                background: 'var(--acc-recov)', borderRadius: 999,
              }} />
            </div>
            <span className="v2-num v2-dim" style={{ textAlign: 'right', fontSize: 10.5 }}>
              {a.anzahl}{a.minutenSchnitt != null ? ` · ${a.minutenSchnitt}′` : ''}
            </span>
            {/*
              G-123, C-153: der GEMESSENE Unterschied am Folgetag.

              `[read]` **Kein Urteil, kein Vorzeichen als Wertung.** Die
              Zahl steht da, wie sie gerechnet wurde: Erholungswert am
              Tag danach minus Erholungswert am Tag selbst, gemittelt.
              Ob +2,8 „gut" ist, sagt die Kachel nicht.
            */}
            <span
              className="v2-num"
              style={{
                textAlign: 'right', fontSize: 10.5,
                color: a.deltaSchnitt == null
                  ? 'var(--fg-dim)'
                  : a.deltaSchnitt > 0 ? 'var(--pos)' : 'var(--fg-muted)',
              }}
              title={a.deltaSchnitt == null
                ? 'Kein Folgetagswert erfasst'
                : `Schnitt aus ${a.mitDelta} Messung${a.mitDelta === 1 ? '' : 'en'}`}
            >
              {a.deltaSchnitt == null
                ? '—'
                : `${a.deltaSchnitt > 0 ? '+' : ''}${a.deltaSchnitt.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
        ))}
      </div>
      <div className="v2-dim" style={{ fontSize: 10, marginTop: 6, lineHeight: 1.45 }}>
        Die rechte Spalte ist der <strong>gemessene</strong> Unterschied
        des Erholungswerts am Folgetag (C-153) — Tag danach minus Tag
        selbst, über alle erfassten Fälle gemittelt.{' '}
        <span className="v2-mono">next_day_score_delta</span>, nicht die
        Selbsteinschätzung.
      </div>

      {/* `[read]` Der Hinweis steht DA, wo die Null steht. */}
      <div className="v2-divider" />
      <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
        Der Bonus je Art ist noch nicht festgelegt — die Zeilen tragen
        {' '}<span className="v2-mono">pending_c124_e5</span>. Bis dahin
        zählt jede Modalität mit <strong>0</strong> in den Erholungswert.
        Erfasst wird sie trotzdem.
      </div>
    </Card>
  )
}
