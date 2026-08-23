'use client'

// Der Meal-Plans-Tab des Nutrition-Moduls.
//
// QUELLE: theme-v1/module-nutrition-spec.jsx, `MealPlansView`
// (Zeile 334-521). Drei Unter-Tabs: Active plan · Plan library ·
// Shopping list — und sechs Kacheln, die die Zaehlung nennt:
// Today's ghost entries · Plan settings · Lifecycle types ·
// 7-day compliance · Shopping list · Scale list.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript.
//   2. Klassen auf `v2-`-Praefix.
//   3. `window.MealPlansView` -> Modulexport.
//   4. Wiederkehrende Inline-Raster in `nutrition.css`.
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst.
//
// `[cmd]` ALLES HIER IST ATTRAPPE. Essensplaene, Wochen und Eintraege
// liegen inzwischen im Schema; dieser Entwurfs-Tab ist aber noch nicht
// an `plan-lesen` angebunden. Die Compliance rechnet weiter ueber die
// Vorlagendaten, nicht ueber die Datenbank.
import * as React from 'react'
import { Card, Pill, Icon, Row, Ring, Sparkline } from '@lumeos/ui'

import { GHOST_ENTRIES } from './tabs-daten'
import type { GhostStatus } from './typen'
// G-161: die drei Kacheln, die `plan-lesen` tragen kann.
import {
  PlanKopfEcht, PlanEinstellungenEcht, PlanBibliothekEcht,
} from './plans-echt'
import type { PlanDaten } from '../../../lib/nutrition/plan-lesen'

const ATTRAPPE = 'Aus dem Entwurf uebernommen. Dieser Tab ist noch nicht an die vorhandenen Essensplaene angebunden - die Zahlen sind erfunden.'

/** Farbe und Beschriftung je Zustand (Vorlage Zeile 344-349). */
const ZUSTAND: Record<GhostStatus, { c: string; l: string }> = {
  confirmed: { c: 'var(--pos)', l: 'confirmed' },
  deviated: { c: 'var(--warn)', l: 'deviated' },
  skipped: { c: 'var(--neg)', l: 'skipped' },
  pending: { c: 'var(--fg-dim)', l: 'pending' },
}

/** Die sechs Plaene der Bibliothek (Vorlage Zeile 448-455). */
const BIBLIOTHEK = [
  { n: 'Recomp 5-Meal Plan', src: 'coach', days: 7, kcal: 2700, active: true },
  { n: 'Cut · 4-Meal 2200', src: 'coach', days: 14, kcal: 2200 },
  { n: 'High-Protein Lazy Week', src: 'user', days: 7, kcal: 2650 },
  { n: 'Travel week · flexible', src: 'user', days: 5, kcal: 2500 },
  { n: 'Lean bulk 3100', src: 'marketplace', days: 28, kcal: 3100 },
  { n: 'Buddy auto-plan', src: 'buddy', days: 7, kcal: 2700 },
]

/** Die Einkaufsliste (Vorlage Zeile 478-484). */
const EINKAUF: Array<{ cat: string; items: Array<[string, string]> }> = [
  { cat: 'Fleisch & Fisch', items: [['Hähnchenbrust', '1260 g'], ['Lachsfilet', '1400 g']] },
  { cat: 'Milchprodukte', items: [['Hüttenkäse', '1400 g'], ['Whey Isolat', '455 g'], ['Skyr', '1000 g']] },
  { cat: 'Getreide', items: [['Haferflocken', '560 g'], ['Basmatireis', '1400 g'], ['Reiswaffeln', '280 g']] },
  { cat: 'Gemüse & Obst', items: [['Brokkoli', '1050 g'], ['Süßkartoffel', '1750 g'], ['Banane', '840 g'], ['Blaubeeren', '700 g']] },
  { cat: 'Fette & Nüsse', items: [['Mandeln', '140 g'], ['Olivenöl', '150 ml']] },
]

export function MealPlansTab({ d = null }: { d?: PlanDaten | null }) {
  const [tab, setTab] = React.useState('active')

  // Die Rechnung der Vorlage (Zeile 336-343), unveraendert.
  const confirmed = GHOST_ENTRIES.filter(g => g.status === 'confirmed').length
  const deviated = GHOST_ENTRIES.filter(g => g.status === 'deviated').length
  const skipped = GHOST_ENTRIES.filter(g => g.status === 'skipped').length
  const pending = GHOST_ENTRIES.filter(g => g.status === 'pending').length
  const compliance = Math.round(
    ((confirmed + deviated) / Math.max(1, confirmed + deviated + skipped)) * 100,
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <div className="v2-segmented">
          {([['active', 'Active plan'], ['library', 'Plan library'], ['shopping', 'Shopping list']] as const).map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={tab === k ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
              style={{ height: 24, fontSize: 11, padding: '0 12px', borderRadius: 5 }}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="v2-spacer" />
        <button type="button" className="v2-btn">
          <Icon name="plus" className="v2-ic v2-ic-sm" />New plan
        </button>
      </div>

      {tab === 'active' && (
        <div className="v2-grid v2-grid-15" style={{ gap: 14 }}>
          <div className="v2-col-gap" style={{ gap: 14 }}>
            {/* G-161: Der Plankopf liest echt, sobald ein Plan da ist.
                `[read]` Ohne Plan bleibt der Entwurf mit seiner Marke —
                dasselbe Muster wie bei `prefs` (G-65) und `planner`
                (G-97): eine leere echte Kachel saehe aus wie ein Befund
                und waere doch nur ein fehlendes Cookie. */}
            {d ? <PlanKopfEcht d={d} /> : (
            <Card attrappe={ATTRAPPE}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Ring value={compliance} max={100} color="var(--acc-nutri)" label="compliance" size={92} stroke={7} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>Recomp 5-Meal Plan</span>
                    <Pill variant="acc">active</Pill>
                    <Pill>rollover</Pill>
                  </div>
                  <div className="v2-muted" style={{ fontSize: 12, marginBottom: 8 }}>
                    Day 3 of 7 · started May 14 · source: coach (Jana Bauer)
                  </div>
                  <div className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>
                    ({confirmed} confirmed + {deviated} deviated) / ({confirmed} + {deviated} + {skipped} skipped)
                    {' '}= {compliance}% · {pending} pending not counted
                  </div>
                </div>
              </div>
            </Card>
            )}

            {/* `[cmd]` **Bleibt Attrappe:** `meal_plan_entries` hat
                keine Statusspalte (`pending`/`confirmed`/`deviated`/
                `skipped`). Ohne sie sind Geistereintraege nicht
                ableitbar — gemessen am 2026-08-23. */}
            <Card
              title="Today's ghost entries"
              sub={`${pending} still open · confirm via MealCam or manually`}
              attrappe={ATTRAPPE}
            >
              <div className="v2-col-gap" style={{ gap: 6 }}>
                {GHOST_ENTRIES.map(g => {
                  const st = ZUSTAND[g.status]
                  const offen = g.status === 'pending'
                  return (
                    <div
                      key={g.id}
                      className="v2-ghost-eintrag"
                      style={{
                        background: offen ? 'var(--surface)' : `color-mix(in srgb, ${st.c} 5%, var(--surface))`,
                        border: `1px solid ${offen ? 'var(--border)' : `color-mix(in srgb, ${st.c} 25%, var(--border))`}`,
                        borderStyle: offen ? 'dashed' : 'solid',
                      }}
                    >
                      <div className="v2-ghost-kopf">
                        <span className="v2-num v2-dim" style={{ fontSize: 10, width: 38 }}>{g.time}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{g.meal}</span>
                        <Pill style={{ borderColor: `color-mix(in srgb, ${st.c} 35%, var(--border))`, color: st.c, fontSize: 9.5 }}>
                          {st.l}
                        </Pill>
                        <span className="v2-num v2-dim" style={{ marginLeft: 'auto', fontSize: 11 }}>{g.kcal} kcal</span>
                      </div>
                      <div className="v2-muted v2-ghost-positionen">{g.items.join(' · ')}</div>
                      {g.note && (
                        <div style={{ fontSize: 11, paddingLeft: 46, marginTop: 4, color: 'var(--warn)', fontFamily: 'var(--font-mono)' }}>
                          ↳ {g.note}
                        </div>
                      )}
                      {offen && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, paddingLeft: 46, flexWrap: 'wrap' }}>
                          <button type="button" className="v2-btn v2-btn-primary v2-btn-sm">
                            <Icon name="check" className="v2-ic v2-ic-sm" />Confirm as planned
                          </button>
                          <button type="button" className="v2-btn v2-btn-sm">
                            <Icon name="camera" className="v2-ic v2-ic-sm" />MealCam
                          </button>
                          <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm">Log deviation</button>
                          <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm">Skip</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          <div className="v2-col-gap" style={{ gap: 14 }}>
            {/* G-161: Was im Schema steht, steht echt da — der Rest
                nicht. Vier der fuenf Zeilen der Vorlage haben keine
                Spalte (`lifecycle`, `started_at`, `next_plan_id`,
                `confirm_mode`); die echte Kachel sagt das aus. */}
            {d ? <PlanEinstellungenEcht d={d} /> : (
            <Card title="Plan settings" attrappe={ATTRAPPE}>
              <Row label="Lifecycle" value="rollover" />
              <Row label="Days count" value="7" />
              <Row label="Started" value="May 14" />
              <Row label="Next restart" value="May 21 · Day 1" />
              <Row label="Confirm mode" value="ask" />
              <div className="v2-divider" />
              <div className="v2-hinweis-warn">
                <Icon
                  name="alert"
                  className="v2-ic v2-ic-sm"
                  style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4, color: 'var(--warn)' }}
                />
                Plan items are read-only while active. To edit: pause → duplicate → edit → re-activate.
                Protects compliance history.
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button type="button" className="v2-btn v2-btn-sm">Pause plan</button>
                <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm">Duplicate</button>
              </div>
            </Card>
            )}

            {/* `[cmd]` **Bleibt Attrappe:** Die drei Zeilen beschreiben
                Spalten, die es nicht gibt — `days_count`, `lifecycle`,
                `next_plan_id`. Eine Legende ueber nichts. */}
            <Card title="Lifecycle types" attrappe={ATTRAPPE}>
              <Row label="once" value="ends after days_count" />
              <Row label="rollover" value="restarts at Day 1" />
              <Row label="sequence" value="activates next_plan_id" />
            </Card>

            <Card title="7-day compliance" attrappe={ATTRAPPE}>
              <Sparkline data={[100, 86, 100, 92, 80, 100, compliance]} color="var(--acc-nutri)" h={44} />
              <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11, color: 'var(--fg-muted)' }}>
                <span>Avg <span className="v2-num" style={{ color: 'var(--fg)' }}>94%</span></span>
                <span>Deviations <span className="v2-num" style={{ color: 'var(--warn)' }}>4</span></span>
                <span>Skips <span className="v2-num" style={{ color: 'var(--fg)' }}>1</span></span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* G-161: Die Bibliothek zeigt den echten Plan mit seinen
          Wochen. `[cmd]` **Einen, nicht zwei** — der zweite gehoert
          einem anderen Konto und faellt per RLS heraus. */}
      {tab === 'library' && d && (
        <div className="v2-col-gap" style={{ gap: 12 }}>
          <PlanBibliothekEcht d={d} />
        </div>
      )}

      {tab === 'library' && !d && (
        <div className="v2-grid v2-g-cols-3" style={{ gap: 12 }}>
          {BIBLIOTHEK.map(p => (
            <Card
              key={p.n}
              attrappe={ATTRAPPE}
              style={{
                padding: 14,
                border: p.active ? '1px solid color-mix(in srgb, var(--acc-nutri) 35%, var(--border))' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{p.n}</span>
                {p.active && <Pill variant="acc" style={{ fontSize: 9 }}>active</Pill>}
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                <Pill style={{ fontSize: 9.5 }}>{p.src}</Pill>
                <Pill style={{ fontSize: 9.5 }}>{p.days} days</Pill>
                <Pill style={{ fontSize: 9.5 }}>{p.kcal} kcal</Pill>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {!p.active && <button type="button" className="v2-btn v2-btn-primary v2-btn-sm">Activate</button>}
                <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm">Preview</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'shopping' && (
        <div className="v2-grid v2-grid-14" style={{ gap: 14 }}>
          <Card
            title="Shopping list"
            sub="from Recomp 5-Meal Plan · 7 days · 1 serving"
            attrappe={ATTRAPPE}
            actions={(
              <>
                <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm">Print</button>
                <button type="button" className="v2-btn v2-btn-sm">
                  <Icon name="download" className="v2-ic v2-ic-sm" />Export
                </button>
              </>
            )}
          >
            {EINKAUF.map(g => (
              <div key={g.cat} style={{ marginBottom: 14 }}>
                <div className="v2-eyebrow" style={{ marginBottom: 6 }}>{g.cat}</div>
                <div className="v2-col-gap" style={{ gap: 3 }}>
                  {g.items.map(([n, q], i) => {
                    // Die Vorlage hakt die ersten zwei je Gruppe ab.
                    const ab = i < 2
                    return (
                      <div key={n} className="v2-einkauf-zeile">
                        <span
                          className="v2-einkauf-haken"
                          style={{
                            border: `1px solid ${ab ? 'var(--pos)' : 'var(--border-strong)'}`,
                            background: ab ? 'var(--pos)' : 'transparent',
                          }}
                        >
                          {ab && (
                            <Icon name="check" className="v2-ic" style={{ width: 10, height: 10, color: 'var(--bg)', strokeWidth: 3 }} />
                          )}
                        </span>
                        <span style={{ flex: 1, fontSize: 12, textDecoration: ab ? 'line-through' : 'none', opacity: ab ? 0.5 : 1 }}>
                          {n}
                        </span>
                        <span className="v2-num v2-dim" style={{ fontSize: 11 }}>{q}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </Card>

          <Card title="Scale list" attrappe={ATTRAPPE}>
            <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Servings</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  type="button"
                  className={n === 1 ? 'v2-btn v2-btn-primary v2-btn-sm' : 'v2-btn v2-btn-sm'}
                  style={{ flex: 1 }}
                >
                  {n}×
                </button>
              ))}
            </div>
            <Row label="Total items" value="14" />
            <Row label="Checked" value="2 of 14" />
            <Row label="Est. cost" value="≈ €78" />
            <div className="v2-divider" />
            <button type="button" className="v2-btn" style={{ width: '100%' }}>
              <Icon name="plus" className="v2-ic v2-ic-sm" />Add item manually
            </button>
          </Card>
        </div>
      )}
    </div>
  )
}
