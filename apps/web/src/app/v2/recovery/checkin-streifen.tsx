'use client'

// Die erfassten Check-ins — die einzige Kachel mit echten Daten (G-55).
//
// `[read]` Der Auftrag: „Anbinden heisst hier: die erfassten Werte
// zeigen, keine Kennzahl daraus rechnen."
//
// **Diese Kachel rechnet nichts.** Sie zeigt, was in
// `recovery.checkins` steht: Schlaf, Stimmung, Muskelkater, Stress,
// Ruhepuls, HRV. Der Erholungswert daneben bleibt Attrappe — er ist
// `SPEC_09` und braucht eine Gewichtung, die niemand beschlossen hat.
//
// **Deshalb traegt diese eine Kachel KEINE Attrappenmarke.** Alle
// anderen des Moduls behalten sie.
import * as React from 'react'
import { Card, Pill, Row } from '@lumeos/ui'

import type { CheckinStand } from '../../../lib/recovery/checkin-read'
import { MUSCLE_LABEL } from './motor'

/** Die fuenf Stimmungen des Schemas (120_recovery_checkins.sql:54). */
const STIMMUNG: Record<string, { label: string; c: string }> = {
  motivated: { label: 'motivated', c: 'var(--pos)' },
  good: { label: 'good', c: 'var(--acc-recov)' },
  neutral: { label: 'neutral', c: 'var(--fg-muted)' },
  tired: { label: 'tired', c: 'var(--warn)' },
  sick: { label: 'sick', c: 'var(--neg)' },
}

export function CheckinStreifen({ stand }: { stand?: CheckinStand }) {
  // Kein Stand, kein Schema, kein Zugriff — dann sagt die Kachel das,
  // statt eine leere Flaeche zu zeigen.
  if (!stand || stand.fehler) {
    return (
      <Card
        title="Morning check-ins"
        sub="recovery.checkins"
        attrappe={stand?.fehler
          ? `Die Tabelle ist da, aber nicht lesbar: ${stand.fehler}`
          : 'Noch nicht geladen.'}
      >
        <div className="v2-attrappe-flaeche" style={{ height: 80 }} />
      </Card>
    )
  }

  if (stand.zeilen.length === 0) {
    return (
      <Card title="Morning check-ins" sub="recovery.checkins">
        <p className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
          Noch kein Check-in erfasst. Die Tabelle liegt seit Kettenschritt
          120 bereit — sobald der erste Eintrag da ist, steht er hier.
        </p>
      </Card>
    )
  }

  const n = stand.neuster!
  const kater = Object.entries(n.soreness ?? {})
    .filter(([, v]) => typeof v === 'number' && v > 0)
    .sort((a, b) => b[1] - a[1])
  const stimmung = STIMMUNG[n.mood] ?? STIMMUNG.neutral

  return (
    <Card
      title="Morning check-ins"
      sub={`${stand.zeilen.length} erfasst · ${stand.mitHrv} mit HRV`}
      actions={<Pill variant="pos">echte Daten</Pill>}
    >
      {/* `[cmd]` KEINE ATTRAPPENMARKE an dieser Kachel — sie zeigt,
          was erfasst wurde. Die Marke der uebrigen Kacheln bleibt. */}
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
        Neuster Eintrag · {n.entry_date}{n.checkin_time ? ` · ${n.checkin_time.slice(0, 5)}` : ''}
      </div>

      <div className="v2-grid v2-g-cols-3" style={{ gap: 8, marginBottom: 12 }}>
        {([
          ['Schlaf', n.sleep_hours != null ? `${n.sleep_hours} h` : '—'],
          ['Schlafguete', n.sleep_quality != null ? `${n.sleep_quality}/10` : '—'],
          ['Gefuehl', n.subjective_feeling != null ? `${n.subjective_feeling}/10` : '—'],
          ['Energie', n.energy_level != null ? `${n.energy_level}/10` : '—'],
          ['Ruhepuls', n.resting_hr != null ? `${n.resting_hr} bpm` : '—'],
          ['HRV', n.hrv_rmssd != null ? `${n.hrv_rmssd} ms` : '—'],
        ] as Array<[string, string]>).map(([l, v]) => (
          <div key={l} className="v2-rec-feld">
            <div className="v2-eyebrow" style={{ marginBottom: 2 }}>{l}</div>
            <div className="v2-num" style={{ fontSize: 14 }}>{v}</div>
          </div>
        ))}
      </div>

      <Row
        label="Stimmung"
        value={<span style={{ color: stimmung.c }}>{stimmung.label}</span>}
      />
      {n.stress_level != null && <Row label="Stress" value={`${n.stress_level}/10`} />}

      {kater.length > 0 && (
        <>
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
            Muskelkater · {kater.length} Gruppe{kater.length === 1 ? '' : 'n'}
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {kater.map(([slug, stufe]) => (
              <Pill
                key={slug}
                style={{
                  fontSize: 9.5,
                  color: stufe >= 2 ? 'var(--neg)' : 'var(--warn)',
                }}
              >
                {MUSCLE_LABEL[slug] ?? slug} {stufe}/3
              </Pill>
            ))}
          </div>
        </>
      )}

      {n.pain_areas?.length > 0 && (
        <>
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Schmerzstellen</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {n.pain_areas.map(a => <Pill key={a} variant="warn" style={{ fontSize: 9.5 }}>{a}</Pill>)}
          </div>
        </>
      )}

      {/* G-76: Der Satz stand hier bis heute anders — „kein
          Erholungswert daraus gerechnet". Seit G-76 wird einer
          gerechnet, und ein Hinweis, der das Gegenteil behauptet,
          waere schlechter als keiner. */}
      <div className="v2-divider" />
      <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
        `[read]` Hier steht, was erfasst wurde. Der Erholungswert darunter
        rechnet daraus die <strong>Manual-Gewichte</strong> (30/15/15/10/15/10/5)
        — <strong>eine Zahl, keine Einordnung</strong>. Die Readiness-Stufen
        aus `SPEC_09` („Optimal", „Vorsicht") sind Urteilssprache und
        bleiben offen, bis Tom sie entschieden hat.
      </div>
    </Card>
  )
}
