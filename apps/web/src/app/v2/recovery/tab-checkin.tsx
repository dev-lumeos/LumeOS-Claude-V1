'use client'

// Der Tab „Check-in".
//
// QUELLE: theme-v1/module-recovery-v2.jsx:245-375 (`RecCheckin`).
//
// `[read]` Die Vorlage nennt ihn selbst „the one required
// interaction" — er ist der einzige Tab, der wirklich etwas erfasst.
// Deshalb rechnet die Vorschau links live mit: Schieberegler bewegen,
// Ring rechts aendert sich. Das ist uebernommen, samt Formel.
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// `color-mix(in srgb, …)` -> `in oklch`, `<div onClick>` -> `<button>`.
// Der Speichern-Knopf oeffnet `InEntwicklung` — es gibt keine Tabelle,
// in die er schreiben koennte.
//
// `[cmd]` ALLES IST ATTRAPPE.
import * as React from 'react'
import { Card, Pill, Icon, Ring, InEntwicklungKnopf } from '@lumeos/ui'

import {
  CHECKIN, MOOD_META, MOOD_MULTIPLIER, MUSCLE_LABEL, MUSCLE_STATE,
  READINESS_LEVELS, ACWR_DATA, TODAY_MODALITIES,
  calcTrainingLoadScore, calcModalityBonus, calcHRVScore, readinessFor,
} from './motor'
import { Koerperkarte } from './koerperkarte'
import { ATTRAPPE } from './ansicht'

/** Die zehn Gesichter der Vorlage. [cmd] module-recovery-v2.jsx:254. */
const EMOJI = ['😫', '😣', '😕', '😐', '🙂', '😌', '😊', '😃', '😁', '🤩']

export function RecCheckin() {
  const [hours, setHours] = React.useState(CHECKIN.sleep_hours)
  const [quality, setQuality] = React.useState(CHECKIN.sleep_quality)
  const [feeling, setFeeling] = React.useState(CHECKIN.subjective_feeling)
  const [mood, setMood] = React.useState(CHECKIN.mood)
  const [soreness, setSoreness] = React.useState<Record<string, number>>({ ...CHECKIN.soreness })
  const [sel, setSel] = React.useState<string | null>(null)
  const [more, setMore] = React.useState(false)

  const cycle = (slug: string) =>
    setSoreness(s => ({ ...s, [slug]: ((s[slug] ?? 0) + 1) % 4 }))

  return (
    <div className="v2-rec-grid-13">
      <Card
        title="Morning check-in" sub="target: under 30 seconds · overwrite any time today"
        attrappe={ATTRAPPE}
        actions={<Pill variant="pos">logged {CHECKIN.logged_at}</Pill>}
      >
        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Sleep duration · {hours} h</div>
        <input type="range" min="0" max="12" step="0.5" value={hours}
               aria-label="Sleep duration"
               onChange={e => setHours(Number(e.target.value))}
               style={{ width: '100%', accentColor: 'var(--acc-recov)', marginBottom: 4 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)', marginBottom: 14 }}>
          <span>0</span><span>4</span><span>8</span><span>12 h</span>
        </div>

        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
          Sleep quality · {quality}/10 {EMOJI[Math.max(0, Math.min(9, quality - 1))]}
        </div>
        <input type="range" min="1" max="10" value={quality}
               aria-label="Sleep quality"
               onChange={e => setQuality(Number(e.target.value))}
               style={{ width: '100%', accentColor: 'var(--acc-recov)', marginBottom: 4 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 14 }}>
          {EMOJI.map((e, i) => (
            <span key={e} style={{
              opacity: i + 1 === quality ? 1 : 0.28,
              fontSize: i + 1 === quality ? 17 : 12,
              transition: 'all .12s',
            }}>{e}</span>
          ))}
        </div>

        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>How do you feel · {feeling}/10</div>
        <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <button key={i} type="button" onClick={() => setFeeling(i + 1)}
                    aria-label={`Feeling ${i + 1} of 10`} aria-pressed={i + 1 === feeling}
                    style={{
                      flex: 1, height: 28, borderRadius: 4, border: 0, cursor: 'pointer',
                      background: i < feeling ? 'var(--acc-recov)' : 'var(--surface-2)',
                      opacity: i < feeling ? 0.35 + (i / 10) * 0.65 : 1,
                      color: i + 1 === feeling ? 'var(--bg)' : 'var(--fg-dim)',
                      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                    }}>{i + 1}</button>
          ))}
        </div>

        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Mood</div>
        <div className="v2-rec-mood">
          {MOOD_META.map(m => (
            <button key={m.id} type="button" onClick={() => setMood(m.id)}
                    aria-pressed={mood === m.id}
                    style={{
                      flex: 1, padding: '9px 6px', borderRadius: 6, cursor: 'pointer',
                      background: mood === m.id ? `color-mix(in oklch, ${m.c} 14%, var(--surface))` : 'var(--surface)',
                      border: `1px solid ${mood === m.id ? `color-mix(in oklch, ${m.c} 40%, var(--border))` : 'var(--border)'}`,
                      color: mood === m.id ? m.c : 'var(--fg-muted)',
                    }}>
              <div style={{ fontSize: 11.5, fontWeight: 600 }}>{m.label}</div>
              <div className="v2-mono" style={{ fontSize: 9, marginTop: 2, opacity: 0.8 }}>
                ×{MOOD_MULTIPLIER[m.id]} = {m.pts}pt
              </div>
            </button>
          ))}
        </div>

        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Soreness · tap a muscle to cycle 0 → 3</div>
        <Card className="v2-card-tight" style={{ padding: 12, marginBottom: 12 }}>
          <Koerperkarte values={soreness} mode="soreness"
                        onPick={slug => { cycle(slug); setSel(slug) }}
                        selected={sel} size={180} />
          <div className="v2-rec-legende">
            {([['0 none', 'var(--surface-2)'], ['1 mild', 'var(--acc-recov)'],
               ['2 moderate', 'var(--warn)'], ['3 severe', 'var(--neg)']] as Array<[string, string]>).map(([l, c]) => (
              <span key={l} className="v2-row-gap">
                <span style={{ width: 10, height: 10, borderRadius: 2, background: c, opacity: 0.68 }} />{l}
              </span>
            ))}
          </div>
          {sel && (
            <div style={{
              marginTop: 10, padding: 9, background: 'var(--bg-elev)',
              border: '1px solid var(--border)', borderRadius: 5,
              display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{MUSCLE_LABEL[sel]}</span>
              <span className="v2-num" style={{ fontSize: 12 }}>{soreness[sel]}/3</span>
              <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                {MUSCLE_STATE[sel]?.lastSession ?? 'no recent session'}
              </span>
            </div>
          )}
        </Card>

        <button type="button" className="v2-btn v2-btn-ghost" onClick={() => setMore(v => !v)}
                aria-expanded={more} style={{ marginBottom: more ? 12 : 0 }}>
          <Icon name={more ? 'chevron_down' : 'chevron_right'} className="v2-ic v2-ic-sm" />
          {more ? 'Hide' : 'Add more'} · stress, alcohol, caffeine, screen time
        </button>
        {more && (
          <div className="v2-grid v2-g-cols-2" style={{ gap: 10, marginBottom: 12 }}>
            {([
              ['Stress level · 1–10', CHECKIN.stress_level],
              ['Alcohol · units', CHECKIN.alcohol_units],
              ['Caffeine · mg', CHECKIN.caffeine_mg],
              ['Screen time before bed · min', CHECKIN.screen_time_before_bed],
            ] as Array<[string, number]>).map(([l, v]) => (
              <div key={l}>
                <div className="v2-eyebrow" style={{ marginBottom: 4 }}>{l}</div>
                <input type="number" defaultValue={v} aria-label={l} style={{
                  width: '100%', height: 30, background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 6, padding: '0 10px',
                  fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg)',
                }} />
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <InEntwicklungKnopf
            titel="Save check-in" className="v2-btn v2-btn-primary"
            grund="Der Check-in braucht eine Tabelle recovery.checkins — das Schema recovery gibt es noch nicht."
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Icon name="check" className="v2-ic v2-ic-sm" />Save check-in · recalculates score
          </InEntwicklungKnopf>
        </div>
      </Card>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <LiveVorschau hours={hours} quality={quality} feeling={feeling} soreness={soreness} />

        <Card title="Readiness levels" sub="score → training recommendation" attrappe={ATTRAPPE}>
          {READINESS_LEVELS.map((l, i) => (
            <div key={l.label} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0',
              borderBottom: i < READINESS_LEVELS.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span className="v2-num" style={{ fontSize: 11, width: 56, color: l.c }}>
                {l.min}{i === 0 ? '–100' : `–${READINESS_LEVELS[i - 1].min - 1}`}
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 600, width: 82 }}>{l.label}</span>
              <span className="v2-dim" style={{ fontSize: 10.5, flex: 1, lineHeight: 1.4 }}>{l.advice}</span>
            </div>
          ))}
        </Card>

        <Card title="Why check in daily" sub="the one required interaction" attrappe={ATTRAPPE}>
          <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
            Sleep quality and subjective feeling carry 45% of the manual score. Without a check-in the engine falls back on wearable data alone, which cannot see soreness, mood, or how you actually feel. The map only takes a few taps because it remembers yesterday.
          </div>
        </Card>
      </div>
    </div>
  )
}

/**
 * Die Live-Vorschau.
 *
 * `[cmd]` module-recovery-v2.jsx:335-355. Die Vorlage rechnet hier den
 * `hrv`-Modus NACH — nicht ueber `calcRecoveryScore`, sondern als
 * eigener Ausdruck, weil Schlaf, Gefuehl und Muskelkater aus dem
 * Formular kommen und nicht aus `CHECKIN`. Die Gewichte sind dieselben
 * (15/15/25/10/10/15/10); uebernommen wie sie dasteht.
 */
function LiveVorschau({ hours, quality, feeling, soreness }: {
  hours: number; quality: number; feeling: number; soreness: Record<string, number>
}) {
  const werte = Object.values(soreness)
  const sor = werte.length ? werte.reduce((s, v) => s + v, 0) / werte.length : 0
  const tls = calcTrainingLoadScore(ACWR_DATA.acwr)
  const bonus = calcModalityBonus(TODAY_MODALITIES)
  const hrv = calcHRVScore(CHECKIN.hrv_rmssd)
  const val = (quality / 10) * 15 + (Math.min(hours, 8) / 8) * 15 + (hrv.score / 100) * 25
    + (feeling / 10) * 10 + (1 - sor / 3) * 10 + tls * 15 + 0.88 * 10
  const total = Math.round(Math.min(100, val + bonus.capped))
  const rd = readinessFor(total)

  return (
    <Card title="Live score preview" sub="updates as you edit" attrappe={ATTRAPPE}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Ring value={total} max={100} color={rd.c} label={rd.level} size={96} stroke={7} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: rd.c, marginBottom: 3 }}>{rd.label}</div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.45 }}>{rd.advice}</div>
          <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 6 }}>
            avg soreness {sor.toFixed(2)}/3 · bonus +{bonus.capped}
          </div>
        </div>
      </div>
    </Card>
  )
}
