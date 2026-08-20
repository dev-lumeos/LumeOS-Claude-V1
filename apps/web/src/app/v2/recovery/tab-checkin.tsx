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
import { Card, Pill, Icon, Ring, InEntwicklungKnopf, Koerperkarte } from '@lumeos/ui'

import {
  CHECKIN, MOOD_META, MOOD_MULTIPLIER, MUSCLE_LABEL, MUSCLE_STATE,
  READINESS_LEVELS,
} from './motor'
// G-26: die anatomische Karte kommt jetzt aus packages/ui.
import { katerAlsMuskeln, RECOVERY_ZU_KARTE, KARTE_ZU_RECOVERY } from './muskel-zuordnung'
import { ATTRAPPE } from './ansicht'
// G-82: die Vorschau rechnet mit denselben Gewichten wie alles andere.
import { vorschauScore } from '../../../lib/recovery/score'

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
          {/* G-26: dieselbe anatomische Karte wie in Today.
              `[cmd]` HIER NICHT `ErmuedungsKarte`: die bringt die
              Legende „Ready / Caution / Rest" mit, und der Check-in
              misst in Stufen 0-3. Zwei Legenden nebeneinander, die
              dieselbe Flaeche verschieden benennen, sind schlimmer als
              keine. Deshalb die Grundkomponente mit der Legende, die
              zu dieser Skala gehoert. */}
          <Koerperkarte
            muskeln={katerAlsMuskeln(soreness)}
            breite={160}
            ausgewaehlt={sel ? RECOVERY_ZU_KARTE[sel] : null}
            legende={[
              { color: 'var(--surface-2)', label: '0 none' },
              { color: 'var(--acc-recov)', label: '1 mild' },
              { color: 'var(--warn)', label: '2 moderate' },
              { color: 'var(--neg)', label: '3 severe' },
            ]}
            onPick={(id, typ) => {
              if (typ !== 'muscle') return
              const slug = KARTE_ZU_RECOVERY[id]
              if (slug) { cycle(slug); setSel(slug) }
            }}
          />
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
        <LiveVorschau hours={hours} quality={quality} feeling={feeling}
                      soreness={soreness} mood={mood} />

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
 * Die Live-Vorschau — **der verbliebene Zweck von `score.ts`** (G-82).
 *
 * `[cmd]` **Vorher stand hier die Formel des Entwurfs**
 * (module-recovery-v2.jsx:335-355): eigene Gewichte 15/15/25/10/10/15/10
 * statt der 30/15/15/10/15/10/5 des stabilen Kerns, ein HRV-Term aus
 * `CHECKIN` statt aus dem Formular, `0.88 * 10` als feste Ernaehrung —
 * **eine erfundene Zahl** — und `readinessFor`, also genau die
 * Urteilssprache, die G-76 aus der Kachel entfernt hat.
 *
 * `[read]` **Jetzt rechnet sie mit `berechneScore`**, also mit
 * denselben Gewichten wie alles andere, und nennt kein Urteil. Was
 * nicht im Formular steht, zaehlt nicht mit — statt es zu erfinden.
 * Die Kachel sagt darunter, welche Anteile das sind und dass der
 * gespeicherte Wert deshalb hoeher ausfaellt.
 */
function LiveVorschau({ hours, quality, feeling, soreness, mood }: {
  hours: number; quality: number; feeling: number
  soreness: Record<string, number>; mood: string
}) {
  const v = React.useMemo(() => vorschauScore({
    sleep_quality: quality, sleep_hours: hours, subjective_feeling: feeling,
    mood, soreness,
  }), [quality, hours, feeling, mood, soreness])

  const offen = v.teile.filter(t => t.punkte === null)

  return (
    <Card title="Vorschau" sub="rechnet mit, während du eingibst">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Ring value={v.score ?? 0} max={100} color="var(--acc-recov)"
              label="score" size={96} stroke={7} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* `[read]` Die Zahl, kein Urteil — dieselbe Regel wie in der
              Kachel auf `Today`. */}
          <div className="v2-num" style={{
            fontSize: 22, lineHeight: 1, color: 'var(--acc-recov)', marginBottom: 6,
          }}>
            {v.score ?? '—'}
          </div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.45 }}>
            {v.gewichtBasis} von 100 Gewichtspunkten aus dem Formular.
          </div>
          {offen.length > 0 && (
            <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 6, lineHeight: 1.45 }}>
              Nicht dabei: {offen.map(t => `${t.label} (${t.roh})`).join(' · ')}.
              Beim Speichern werden sie ergänzt — der gespeicherte Wert
              weicht deshalb ab.
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
