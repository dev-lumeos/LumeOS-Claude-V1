'use client'

// Neun Tabs des AI-Coach-Moduls: Plan & gate, Engines, Journey,
// Watcher, BSS, Signature, Interventions, Safety, Butler.
//
// QUELLE: theme-v1/module-buddy-engines.jsx —
//   :222-275  `BuddyTiers`         Plan & gate
//   :277-369  `BuddyEngines`       Engines
//   :371-440  `BuddyJourney`       Journey
//   :442-510  `BuddyWatcher`       Watcher
//   :512-593  `BuddyBSS`           BSS
//   :595-642  `BuddySignature`     Signature
//   :644-728  `BuddyInterventions` Interventions
//   :730-785  `BuddySafety`        Safety
//   :787-845  `BuddyButler`        Butler
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript, jede Requisite und jeder
//      Abbildungsparameter getippt; kein `any`.
//   2. Klassen auf `v2-`-Praefix, jede `<table>` in `v2-tbl-wrap`.
//   3. `window.X` -> Importe aus `./daten` (siehe unten).
//   4. `color-mix(in srgb, …)` -> `in oklch`, wie in jeder V2-Datei.
//   5. Die sechs Rasterangaben aus dem `style` in Klassen —
//      `v2-grid-14`, `v2-grid-15`, `v2-g-cols-2` sind geteilt,
//      `v2-buddy-grid-13`, `v2-buddy-stufen`, `v2-buddy-stabil`,
//      `v2-buddy-konfidenz`, `v2-buddy-messung` liegen in buddy.css.
//      Der Grund ist der Haltepunkt: der Entwurf hat null `@media`.
//   6. Icon `shield` -> `admin` (siehe unten).
//   7. `<Pill variant="block">` -> `variant="neg"` (siehe unten).
//   8. Mehrteilige JSX-Textknoten zu einem Template-Literal
//      zusammengezogen — getrennte Ausdruecke wie `{a} · {b}` erzeugen
//      sonst eine Hydration-Meldung. Betroffen sind neun Stellen:
//      `{v}{note}` (Stabilitaet), `dismissed {n}× · …` (Watcher),
//      `next · {j.next}` (Cron), `n = {p.n}` und `first`/`last`
//      (Signatur), `bucket · {iv.bucket}`, `expected`/`observed`,
//      `{v} / {max}` (Lastbudget), `{p.share}% of traffic` (Pfade),
//      `conf {b.conf.toFixed(2)}` (Butler).
//
// `[cmd]` DIE DATEN STEHEN IN `./daten`. Die Vorlage laeuft als
// Sammlung von Skripten in einem Browser, die sich ueber `window`
// sehen; `module-buddy-engines.jsx:5-220` ist bereits nach `daten.ts`
// uebernommen und wird hier nur importiert. Dieselben Zahlen, derselbe
// Inhalt, ohne den globalen Umweg. Hier wird nichts neu definiert.
//
// `[cmd]` `BuddyTiers` NIMMT KEINE REQUISITEN MEHR. Die Vorlage
// (:222) schreibt `({ tier, setTier })` und der Rahmen reicht sie durch
// (`module-buddy.jsx`). Hier liefert der Kontext sie: `ansicht.tsx:143`
// rendert `<BuddyTiers />` ohne Requisiten, `useBuddy()` gibt `tier`
// und `setTier`. Es ist derselbe Zustand, nur ein anderer Weg dorthin.
//
// `[cmd]` `<Icon name="shield">` (:263 in Tiers, :733 in Safety) gibt
// es in `packages/ui` nicht — `icons.tsx` fuehrt den Namen nicht.
// Genommen ist `admin` (icons.tsx:41), dessen Pfad genau ein Schild
// zeichnet — dieselbe Ersetzung wie in G-36 und G-40, damit dasselbe
// Motiv nicht dreimal anders faellt. Vermerkt in buddy.css, gemeldet
// fuer G-43.
//
// `[cmd]` `<Pill variant="block">` (:452, Watcher) gibt es nicht —
// `PillVariant` in primitives.tsx:80 kennt `pos | warn | neg | acc`.
// Abgebildet auf `neg`; `critical` ist dort die Bedeutung.
//
// `[cmd]` KEINE HYDRATIONSFALLE: null `Math.random()`, null
// `Date.now()`, null `new Date()`, null `Math.sin`. Jede Zahl steht
// fest, wie in der Vorlage.
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst. Knoepfe, die in der Vorlage kein `onClick`
// tragen, bleiben ohne — `Upgrade` (Tiers), `Act` und `Dismiss`
// (Watcher), `That's not me` und `Explain` (Signatur). Sie stehen da
// und tun nichts, genau wie dort.
//
// `[cmd]` ALLES IST ATTRAPPE. Ein Buddy-Schema gibt es nicht.
import * as React from 'react'
import { Card, Pill, Icon, Row, Meter, Ring, LineChart } from '@lumeos/ui'

import { ATTRAPPE } from './ansicht'
import {
  AI_PATHS, BSS, BUTLER_INTENTS, BUTLER_LOG, CHECKPOINTS, CRON_JOBS,
  DOW, ENGINES, GATED_FEATURES, GATE_LOG, INTERVENTIONS,
  INTERVENTION_LOAD, PATH_LOG, PERSONA_LABEL, SAFETY_RULES, SIGNATURE,
  STATE_COLOR, TIERS, TIER_LABEL, TIER_PRICE, WATCHER_ALERTS,
  WATCHER_RULES, hasFeature,
  type Checkpoint, type Intervention, type SignaturePattern,
} from './daten'
import { useBuddy } from './kontext'

// ═══ TAB · PLAN & GATE ═══════════════════════════════════════════
// [cmd] module-buddy-engines.jsx:222-275.
export function BuddyTiers() {
  const { tier, setTier } = useBuddy()
  const gesperrt = GATED_FEATURES.filter(f => !hasFeature(tier, f.min))

  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      <Card
        title="Your plan"
        sub="feature gate is middleware — every gated endpoint checks the tier"
        attrappe={ATTRAPPE}
      >
        {/* [cmd] :225 — "repeat(4, 1fr)", hier `v2-buddy-stufen`. */}
        <div className="v2-buddy-stufen">
          {TIERS.map(t => (
            <div
              key={t}
              onClick={() => setTier(t)}
              style={{
                padding: 14, borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                background: tier === t
                  ? 'color-mix(in oklch, var(--acc-buddy) 12%, var(--surface))'
                  : 'var(--surface)',
                border: `1px solid ${tier === t
                  ? 'color-mix(in oklch, var(--acc-buddy) 40%, var(--border))'
                  : 'var(--border)'}`,
              }}
            >
              <div
                style={{
                  fontSize: 14, fontWeight: 600, marginBottom: 3,
                  color: tier === t ? 'var(--acc-buddy)' : 'var(--fg)',
                }}
              >
                {TIER_LABEL[t]}
              </div>
              <div className="v2-num" style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                {TIER_PRICE[t]}
              </div>
              {tier === t && <Pill variant="acc" style={{ marginTop: 6 }}>current</Pill>}
            </div>
          ))}
        </div>
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Feature</th>
                <th style={{ width: 90 }}>Requires</th>
                {TIERS.map(t => (
                  <th key={t} style={{ width: 70, textAlign: 'center' }}>{TIER_LABEL[t]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GATED_FEATURES.map(f => (
                <tr key={f.key}>
                  <td style={{ fontSize: 12.5 }}>{f.label}</td>
                  <td><Pill style={{ fontSize: 9.5 }}>{f.min}</Pill></td>
                  {TIERS.map(t => (
                    <td key={t} style={{ textAlign: 'center' }}>
                      {hasFeature(t, f.min)
                        ? (
                          <Icon
                            name="check"
                            className="v2-ic v2-ic-sm"
                            style={{ color: t === tier ? 'var(--pos)' : 'var(--fg-dim)' }}
                          />
                        )
                        : <span className="v2-dim">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card
        title="What's locked for you right now"
        sub={`tier: ${TIER_LABEL[tier]}`}
        attrappe={ATTRAPPE}
      >
        {gesperrt.length === 0
          ? <div className="v2-dim" style={{ fontSize: 12, padding: 12 }}>Nothing — you have everything.</div>
          : (
            <div className="v2-col-gap" style={{ gap: 6 }}>
              {gesperrt.map(f => (
                <div
                  key={f.key}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6,
                  }}
                >
                  {/* [cmd] Vorlage: `shield` — gibt es nicht, siehe Kopf. */}
                  <Icon name="admin" className="v2-ic v2-ic-sm" style={{ color: 'var(--fg-dim)' }} />
                  <span style={{ fontSize: 12.5, flex: 1 }}>{f.label}</span>
                  <Pill variant="acc">{TIER_LABEL[f.min] || f.min}</Pill>
                  <button className="v2-btn v2-btn-sm">Upgrade</button>
                </div>
              ))}
            </div>
          )}
      </Card>
    </div>
  )
}

// ═══ TAB · ENGINES ═══════════════════════════════════════════════
// [cmd] module-buddy-engines.jsx:277-369.
export function BuddyEngines() {
  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      <div
        style={{
          display: 'flex', gap: 12, padding: 14,
          background: 'color-mix(in oklch, var(--acc-buddy) 5%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--acc-buddy) 22%, var(--border))',
          borderRadius: 8,
        }}
      >
        <Icon name="brain" className="v2-ic" style={{ color: 'var(--acc-buddy)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
            Numbers come from engines, words come from the model
          </div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Eleven deterministic engines run order-independently and produce every figure I quote. The language model only phrases them —
            it is never the source of a number.
          </div>
        </div>
      </div>

      <Card title="Engines" sub="11 · deterministic · order-independent" attrappe={ATTRAPPE}>
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th style={{ width: 170 }}>Engine</th>
                <th>Outputs</th>
                <th style={{ width: 110, textAlign: 'right' }}>Current</th>
                <th style={{ width: 70 }}>State</th>
              </tr>
            </thead>
            <tbody>
              {ENGINES.map(e => (
                <tr key={e.id}>
                  <td style={{ fontSize: 12.5, fontWeight: 500 }}>{e.label}</td>
                  <td className="v2-mono v2-muted" style={{ fontSize: 10.5 }}>{e.out}</td>
                  <td className="v2-num" style={{ textAlign: 'right', color: STATE_COLOR[e.state] }}>{e.val}</td>
                  <td>
                    <span
                      className="v2-dot"
                      style={{ background: STATE_COLOR[e.state], display: 'inline-block', width: 7, height: 7 }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* [cmd] :306 — "1.3fr 1fr", hier `v2-buddy-grid-13`. */}
      <div className="v2-buddy-grid-13">
        <Card title="Request routing" sub="three paths · cost per request" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 8, marginBottom: 14 }}>
            {AI_PATHS.map(p => (
              <div
                key={p.id}
                style={{
                  padding: 12, background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{p.label}</span>
                  <Pill className="v2-mono" style={{ fontSize: 9.5 }}>{p.cost}</Pill>
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                    {`${p.share}% of traffic`}
                  </span>
                </div>
                <div className="v2-muted" style={{ fontSize: 11.5, marginBottom: 6 }}>{p.when}</div>
                <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 999 }}>
                  <div
                    style={{
                      height: '100%', width: `${p.share}%`, background: 'var(--acc-buddy)',
                      borderRadius: 999, opacity: 0.7,
                    }}
                  />
                </div>
                <div className="v2-dim v2-mono" style={{ fontSize: 9.5, marginTop: 4 }}>{p.model}</div>
              </div>
            ))}
          </div>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Recent routing</div>
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>When</th>
                  <th>Message</th>
                  <th style={{ width: 90 }}>Path</th>
                  <th style={{ width: 70, textAlign: 'right' }}>Cost</th>
                  <th style={{ width: 60, textAlign: 'right' }}>ms</th>
                </tr>
              </thead>
              <tbody>
                {PATH_LOG.map((l, i) => (
                  <tr key={i}>
                    <td className="v2-num v2-muted" style={{ fontSize: 10.5 }}>{l.at}</td>
                    <td
                      className="v2-muted"
                      style={{
                        fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden',
                        textOverflow: 'ellipsis', maxWidth: 240,
                      }}
                    >
                      {l.msg}
                    </td>
                    <td>
                      <Pill
                        style={{
                          fontSize: 9.5,
                          color: l.path === 'fast'
                            ? 'var(--pos)'
                            : l.path === 'knowledge' ? 'var(--acc-recov)' : 'var(--acc-buddy)',
                        }}
                      >
                        {l.path}
                      </Pill>
                    </td>
                    <td className="v2-num v2-muted" style={{ textAlign: 'right', fontSize: 11 }}>
                      {l.cost === 0 ? '$0' : `$${l.cost.toFixed(3)}`}
                    </td>
                    <td className="v2-num v2-muted" style={{ textAlign: 'right', fontSize: 11 }}>{l.ms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Cost this month" sub="your tier" attrappe={ATTRAPPE}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
              <span className="v2-num" style={{ fontSize: 26, fontWeight: 500 }}>$3.42</span>
              <span className="v2-dim" style={{ fontSize: 11 }}>· Pro budget ≈ $3.50</span>
            </div>
            <Meter value={97} color="var(--warn)" />
            <div className="v2-divider" />
            <Row label="Fast path" value="412 calls · $0" />
            <Row label="Knowledge path" value="38 calls · $0.08" />
            <Row label="Hybrid path" value="167 calls · $3.34" />
          </Card>
          <Card title="Cron" sub="6 jobs" attrappe={ATTRAPPE}>
            <div className="v2-col-gap" style={{ gap: 0 }}>
              {CRON_JOBS.map(j => (
                <div key={j.job} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{j.job}</span>
                    <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>{j.schedule}</span>
                  </div>
                  <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 2 }}>{`next · ${j.next}`}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ═══ TAB · JOURNEY ═══════════════════════════════════════════════
// [cmd] module-buddy-engines.jsx:371-440.
export function BuddyJourney() {
  const [cps, setCps] = React.useState<Checkpoint[]>(CHECKPOINTS)
  const toggle = (id: string) =>
    setCps(c => c.map(x => (x.id === id ? { ...x, enabled: !x.enabled } : x)))
  const toggleDay = (id: string, d: number) =>
    setCps(c => c.map(x => (x.id === id
      ? {
        ...x,
        days: x.days.includes(d)
          ? x.days.filter(y => y !== d)
          : [...x.days, d].sort(),
      }
      : x)))

  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      <div
        style={{
          display: 'flex', gap: 12, padding: 14,
          background: 'color-mix(in oklch, var(--acc-buddy) 5%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--acc-buddy) 22%, var(--border))',
          borderRadius: 8,
        }}
      >
        <Icon name="calendar" className="v2-ic" style={{ color: 'var(--acc-buddy)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Heartbeat</div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Scheduled briefings. Each slot carries its own persona, its own module set, and its own weekdays — mornings can be
            a drill sergeant while evenings are a zen master.
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="v2-num" style={{ fontSize: 20 }}>{cps.filter(c => c.enabled).length}</div>
          <div className="v2-dim" style={{ fontSize: 10 }}>{`of ${cps.length} active`}</div>
        </div>
      </div>

      {cps.map(cp => (
        <Card key={cp.id} style={{ opacity: cp.enabled ? 1 : 0.6 }} attrappe={ATTRAPPE}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ fontSize: 22, lineHeight: 1, marginTop: 2 }}>{cp.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span className="v2-num" style={{ fontSize: 15, fontWeight: 600 }}>{cp.time}</span>
                <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{cp.id}</span>
                <Pill variant="acc">{PERSONA_LABEL[cp.persona]}</Pill>
                {cp.push && <Pill><Icon name="bell" className="v2-ic v2-ic-sm" />push</Pill>}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{cp.enabled ? 'on' : 'off'}</span>
                  <div
                    onClick={() => toggle(cp.id)}
                    style={{
                      cursor: 'pointer', width: 32, height: 18, borderRadius: 999, padding: 2,
                      background: cp.enabled ? 'var(--acc-buddy)' : 'var(--surface-2)',
                    }}
                  >
                    <div
                      style={{
                        width: 14, height: 14, borderRadius: 999, background: 'var(--bg)',
                        marginLeft: cp.enabled ? 14 : 0, transition: 'margin .15s',
                      }}
                    />
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: 'grid', gridTemplateColumns: 'auto 1fr',
                  gap: '8px 14px', alignItems: 'center',
                }}
              >
                <span className="v2-eyebrow">Days</span>
                <div style={{ display: 'flex', gap: 3 }}>
                  {DOW.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => toggleDay(cp.id, i)}
                      style={{
                        width: 24, height: 24, borderRadius: 5, cursor: 'pointer',
                        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                        background: cp.days.includes(i)
                          ? 'color-mix(in oklch, var(--acc-buddy) 22%, transparent)'
                          : 'var(--surface-2)',
                        border: `1px solid ${cp.days.includes(i)
                          ? 'color-mix(in oklch, var(--acc-buddy) 40%, var(--border))'
                          : 'var(--border)'}`,
                        color: cp.days.includes(i) ? 'var(--acc-buddy)' : 'var(--fg-dim)',
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <span className="v2-eyebrow">Modules</span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {cp.modules.map(m => <Pill key={m}>{m}</Pill>)}
                </div>
                <span className="v2-eyebrow">Content</span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {Object.entries(cp.content).map(([k, v]) => (
                    <Pill key={k} style={{ opacity: v ? 1 : 0.4, fontSize: 9.5 }}>
                      {`${k.replace('show_', '')}${v ? '' : ' ✕'}`}
                    </Pill>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ═══ TAB · WATCHER ═══════════════════════════════════════════════
// [cmd] module-buddy-engines.jsx:442-510. `[cmd]` :443 — "1.4fr 1fr",
// hier `v2-grid v2-grid-14`.
export function BuddyWatcher() {
  return (
    <div className="v2-grid v2-grid-14">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card
          title="Watcher rules"
          sub="evaluated nightly at 02:00 · Pro tier and up"
          attrappe={ATTRAPPE}
        >
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 210 }}>Rule</th>
                  <th style={{ width: 80 }}>Level</th>
                  <th>Condition · current value</th>
                  <th style={{ width: 70 }}>Fires</th>
                </tr>
              </thead>
              <tbody>
                {WATCHER_RULES.map(r => (
                  <tr
                    key={r.id}
                    style={r.fires ? { background: 'color-mix(in oklch, var(--warn) 6%, transparent)' } : undefined}
                  >
                    <td className="v2-mono" style={{ fontSize: 11 }}>{r.id}</td>
                    {/* [cmd] Vorlage: `variant="block"` — gibt es nicht, siehe Kopf. */}
                    <td><Pill variant={r.level === 'critical' ? 'neg' : 'warn'}>{r.level}</Pill></td>
                    <td>
                      <div className="v2-mono" style={{ fontSize: 10.5, color: 'var(--fg-muted)' }}>{r.cond}</div>
                      <div style={{ fontSize: 11, marginTop: 2, color: r.fires ? 'var(--warn)' : 'var(--fg-dim)' }}>
                        {r.now}
                      </div>
                    </td>
                    <td>{r.fires ? <Pill variant="warn">yes</Pill> : <span className="v2-dim">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="Open alerts"
          sub="dedup 24 h · 3 dismissals downgrade the level"
          attrappe={ATTRAPPE}
        >
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {WATCHER_ALERTS.map(a => {
              const col = a.level === 'critical'
                ? 'var(--neg)'
                : a.level === 'warning' ? 'var(--warn)' : 'var(--fg-dim)'
              return (
                <div
                  key={a.id}
                  style={{
                    display: 'flex', gap: 12, padding: 12, background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: 6,
                    opacity: a.expires === 'expired' ? 0.55 : 1,
                  }}
                >
                  <div style={{ width: 3, alignSelf: 'stretch', background: col, borderRadius: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Pill style={{ color: col, borderColor: `color-mix(in oklch, ${col} 35%, var(--border))` }}>
                        {a.level}
                      </Pill>
                      <Pill>{a.category}</Pill>
                      <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                        {`${a.created} · ${a.expires}`}
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>{a.message}</div>
                    {a.dismissCount > 0 && (
                      <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 6 }}>
                        {`dismissed ${a.dismissCount}× · ${a.dismissCount >= 3
                          ? 'downgraded to info'
                          : `${3 - a.dismissCount} more downgrades it`}`}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <button className="v2-btn v2-btn-sm">Act</button>
                    <button className="v2-btn v2-btn-ghost v2-btn-sm">Dismiss</button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Card title="Watcher settings" attrappe={ATTRAPPE}>
        <Row label="Runs" value="daily 02:00" />
        <Row label="Minimum tier" value="Pro" />
        <Row label="Dedup window" value="24 h per category" />
        <Row label="Smart mute" value="3 dismissals → downgrade" />
        <Row label="Alert TTL" value="48 h" />
        <Row label="Critical delivery" value="push, bypasses quiet hours" />
        <div className="v2-divider" />
        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Quiet hours</div>
        <div className="v2-mono" style={{ fontSize: 13 }}>22:00 — 06:00</div>
        <div className="v2-dim" style={{ fontSize: 11, marginTop: 4, lineHeight: 1.45 }}>
          Warnings wait for the morning briefing. Critical alerts do not.
        </div>
      </Card>
    </div>
  )
}

// ═══ TAB · BSS ═══════════════════════════════════════════════════
// [cmd] module-buddy-engines.jsx:512-593. `[cmd]` :513 — "1.4fr 1fr",
// hier `v2-grid v2-grid-14`.

/** [cmd] :537-542 — fuenf Zeilen, die dritte Spalte nur bei zweien. */
const BSS_STABIL: Array<[string, number, string?]> = [
  ['Training consistency', BSS.stability.training_consistency],
  ['Nutrition adherence stability', BSS.stability.nutrition_adherence_stability],
  ['Recovery stability', BSS.stability.recovery_stability],
  ['Dropout events', BSS.stability.dropout_events.score, `${BSS.stability.dropout_events.count} in 90 d`],
  ['Bounceback time', BSS.stability.bounceback_time.score, `${BSS.stability.bounceback_time.avg_days} d avg`],
]

export function BuddyBSS() {
  return (
    <div className="v2-grid v2-grid-14">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card attrappe={ATTRAPPE}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
            <Ring value={BSS.total} max={100} color="var(--acc-buddy)" label="BSS" size={128} stroke={9} />
            <div style={{ flex: 1 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
                {`Behavior Stability Score · ${BSS.period.replace('_', ' ')}`}
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>
                {`${BSS.delta > 0 ? '+' : ''}${BSS.delta} versus the prior period`}
              </div>
              <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 10 }}>
                Not how strong you are — how reliably you come back. Lapses are getting shorter: a setback used to cost five days,
                now it costs two.
              </div>
              <Pill variant="pos">{BSS.trend}</Pill>
            </div>
          </div>
          <div
            className="v2-mono"
            style={{
              fontSize: 11, padding: 10, background: 'var(--surface-2)',
              borderRadius: 6, color: 'var(--fg-muted)',
            }}
          >
            {BSS.formula}
          </div>
        </Card>

        <Card
          title="Stability"
          sub={`sub-score ${BSS.stability.stability_score} · weight 0.6`}
          attrappe={ATTRAPPE}
        >
          <div className="v2-col-gap" style={{ gap: 10 }}>
            {BSS_STABIL.map(([k, v, note]) => (
              /* [cmd] :544 — "200px 1fr 90px", hier `v2-buddy-stabil`. */
              <div key={k} className="v2-buddy-stabil">
                <span className="v2-muted">{k}</span>
                <Meter value={v} color={v >= 80 ? 'var(--pos)' : v >= 65 ? 'var(--warn)' : 'var(--neg)'} />
                <span className="v2-num" style={{ textAlign: 'right' }}>
                  {v}
                  {note && <span className="v2-dim" style={{ fontSize: 10 }}>{` · ${note}`}</span>}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Goal alignment"
          sub={`sub-score ${BSS.alignment.alignment_score} · weight 0.4`}
          attrappe={ATTRAPPE}
        >
          <Row label="Training · target per week" value={`${BSS.alignment.training.target_per_week}`} />
          <Row label="Training · actual average" value={`${BSS.alignment.training.actual_avg}`} />
          <Row label="Training alignment" value={`${BSS.alignment.training.alignment}%`} />
          <Row label="Protein target hit rate" value={`${BSS.alignment.nutrition.protein_target_hit_rate}%`} />
          <Row label="Calorie target hit rate" value={`${BSS.alignment.nutrition.calorie_target_hit_rate}%`} />
          <Row label="Body composition goal" value={BSS.alignment.body_composition.goal} />
          <Row label="On track" value={BSS.alignment.body_composition.on_track ? 'yes' : 'no'} />
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="90-day trend" attrappe={ATTRAPPE}>
          <LineChart
            h={180}
            range={[45, 80]}
            xLabels={['', '', 'Mar', '', '', 'Apr', '', '', '', 'May', '', '']}
            series={[{ data: BSS.history, color: 'var(--acc-buddy)' }]}
          />
          <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11, color: 'var(--fg-muted)' }}>
            <span>Now <span className="v2-num" style={{ color: 'var(--fg)' }}>{BSS.total}</span></span>
            <span>Prior <span className="v2-num" style={{ color: 'var(--fg)' }}>{BSS.prior}</span></span>
            <span>Δ <span className="v2-num" style={{ color: 'var(--pos)' }}>{`+${BSS.delta}`}</span></span>
          </div>
        </Card>
        <Card title="What moves it" sub="biggest levers right now" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            <div
              style={{
                padding: 10,
                background: 'color-mix(in oklch, var(--warn) 6%, var(--surface))',
                border: '1px solid color-mix(in oklch, var(--warn) 22%, var(--border))',
                borderRadius: 6, fontSize: 11.5, lineHeight: 1.5,
              }}
            >
              <span style={{ fontWeight: 600 }}>Calorie target hit rate · 64%</span><br />
              <span className="v2-muted">The weakest input. Closing it to 80% would move BSS about 6 points.</span>
            </div>
            <div
              style={{
                padding: 10,
                background: 'color-mix(in oklch, var(--warn) 6%, var(--surface))',
                border: '1px solid color-mix(in oklch, var(--warn) 22%, var(--border))',
                borderRadius: 6, fontSize: 11.5, lineHeight: 1.5,
              }}
            >
              <span style={{ fontWeight: 600 }}>Recovery stability · 66</span><br />
              <span className="v2-muted">Sleep variance drives this more than sleep length.</span>
            </div>
            <div
              style={{
                padding: 10,
                background: 'color-mix(in oklch, var(--pos) 6%, var(--surface))',
                border: '1px solid color-mix(in oklch, var(--pos) 22%, var(--border))',
                borderRadius: 6, fontSize: 11.5, lineHeight: 1.5,
              }}
            >
              <span style={{ fontWeight: 600 }}>Bounceback · 2 days</span><br />
              <span className="v2-muted">Your strongest component. Protect it.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ═══ TAB · SIGNATURE ═════════════════════════════════════════════
// [cmd] module-buddy-engines.jsx:595-642.
export function BuddySignature() {
  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      <div
        style={{
          display: 'flex', gap: 12, padding: 14,
          background: 'color-mix(in oklch, var(--acc-buddy) 5%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--acc-buddy) 22%, var(--border))',
          borderRadius: 8,
        }}
      >
        <Icon name="brain" className="v2-ic" style={{ color: 'var(--acc-buddy)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Behavioral signature</div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            {`Patterns found in ${SIGNATURE.eventCount} logged events across ${SIGNATURE.weeksOfData} weeks. `
              + `Detection needs at least ${SIGNATURE.minWeeks} weeks, and only patterns above 0.5 confidence are kept. `
              + 'Everything here is visible to you and editable.'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="v2-num" style={{ fontSize: 20 }}>
            {SIGNATURE.patterns.filter((p: SignaturePattern) => p.detected).length}
          </div>
          <div className="v2-dim" style={{ fontSize: 10 }}>patterns held</div>
        </div>
      </div>

      {/* [cmd] :612 — `grid g-cols-2`, hier `v2-grid v2-g-cols-2`. */}
      <div className="v2-grid v2-g-cols-2" style={{ gap: 12 }}>
        {SIGNATURE.patterns.map((p: SignaturePattern) => (
          <Card key={p.key} style={{ opacity: p.detected ? 1 : 0.6 }} attrappe={ATTRAPPE}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{p.label}</span>
              {p.detected ? <Pill variant="acc">detected</Pill> : <Pill>below threshold</Pill>}
              <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>{`n = ${p.n}`}</span>
            </div>
            <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 10 }}>{p.detail}</div>
            {/* [cmd] :621 — "70px 1fr 44px", hier `v2-buddy-konfidenz`. */}
            <div className="v2-buddy-konfidenz">
              <span className="v2-eyebrow">Confidence</span>
              <Meter
                value={p.confidence * 100}
                color={p.confidence >= 0.7
                  ? 'var(--acc-buddy)'
                  : p.confidence >= 0.5 ? 'var(--warn)' : 'var(--fg-dim)'}
              />
              <span className="v2-num" style={{ textAlign: 'right', fontSize: 11.5 }}>
                {`${(p.confidence * 100).toFixed(0)}%`}
              </span>
            </div>
            {p.detected && (
              <div
                style={{
                  display: 'flex', gap: 12, fontSize: 10.5,
                  color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)',
                }}
              >
                <span>{`first ${p.first}`}</span><span>{`last ${p.last}`}</span>
                {p.pattern && <span style={{ marginLeft: 'auto' }}>{p.pattern}</span>}
              </div>
            )}
            {p.detected && (
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button className="v2-btn v2-btn-ghost v2-btn-sm">That&apos;s not me</button>
                <button className="v2-btn v2-btn-ghost v2-btn-sm">Explain</button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

// ═══ TAB · INTERVENTIONS ═════════════════════════════════════════
// [cmd] module-buddy-engines.jsx:644-728. `[cmd]` :645 — "1.5fr 1fr",
// hier `v2-grid v2-grid-15`.

/** [cmd] :680-683 — drei Zeilen des Lastbudgets. */
const IV_LAST: Array<[string, number, number]> = [
  ['Total interventions', INTERVENTION_LOAD.total, INTERVENTION_LOAD.max],
  ['Confrontations', INTERVENTION_LOAD.confrontations, INTERVENTION_LOAD.maxConfrontations],
  ['Identity statements', INTERVENTION_LOAD.identity, INTERVENTION_LOAD.maxIdentity],
]

/** [cmd] :707-712 — fuenf Typen mit ihrer Erklaerung. */
const IV_TYPEN: Array<[string, string]> = [
  ['confrontation', 'names the gap directly'],
  ['encouragement', 'reinforces what is working'],
  ['adjustment', 'proposes a concrete change'],
  ['redirect', 'moves effort somewhere better'],
  ['silence', 'deliberately says nothing'],
]

export function BuddyInterventions() {
  return (
    <div className="v2-grid v2-grid-15">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Intervention log" sub="what I said, and whether it worked" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {INTERVENTIONS.map((iv: Intervention) => {
              const eff = iv.effectiveness
              const col = eff == null
                ? 'var(--fg-dim)'
                : eff >= 0.7 ? 'var(--pos)' : eff >= 0.4 ? 'var(--warn)' : 'var(--neg)'
              return (
                <div
                  key={iv.id}
                  style={{
                    padding: 12, background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span className="v2-mono v2-dim" style={{ fontSize: 10 }}>{iv.id}</span>
                    <Pill variant="acc">{iv.type}</Pill>
                    {iv.tone !== '—' && <Pill>{iv.tone}</Pill>}
                    <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>{iv.at}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 12.5, lineHeight: 1.5, marginBottom: 8,
                      fontStyle: iv.type === 'silence' ? 'italic' : 'normal',
                      color: iv.type === 'silence' ? 'var(--fg-dim)' : 'var(--fg)',
                    }}
                  >
                    {iv.content}
                  </div>
                  <div className="v2-mono v2-dim" style={{ fontSize: 10, marginBottom: 6 }}>
                    {`bucket · ${iv.bucket}`}
                  </div>
                  {/* [cmd] :664 — "auto auto 1fr 44px", hier `v2-buddy-messung`. */}
                  <div className="v2-buddy-messung">
                    <span className="v2-dim">
                      expected <span style={{ color: 'var(--fg-muted)' }}>{iv.expected}</span>
                    </span>
                    <span className="v2-dim">
                      observed <span style={{ color: iv.observed === 'rejected' ? 'var(--neg)' : 'var(--fg-muted)' }}>
                        {iv.observed}
                      </span>
                    </span>
                    {eff != null ? <Meter value={eff * 100} color={col} /> : <div />}
                    <span className="v2-num" style={{ textAlign: 'right', color: col }}>
                      {eff != null ? eff.toFixed(2) : '—'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Load budget" sub={`rolling ${INTERVENTION_LOAD.window}`} attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 12 }}>
            {IV_LAST.map(([k, v, max]) => (
              <div key={k}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11.5 }}>
                  <span className="v2-muted">{k}</span>
                  <span className="v2-num">{`${v} / ${max}`}</span>
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: max }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1, height: 8, borderRadius: 2,
                        background: i < v ? 'var(--acc-buddy)' : 'var(--surface-2)',
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="v2-divider" />
          <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
            A hard ceiling. When the budget is spent, silence is the intervention — the engine picks it deliberately rather than
            running out of things to say.
          </div>
        </Card>

        <Card title="Types" sub="5 · with tone variants" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 4 }}>
            {IV_TYPEN.map(([t, d]) => (
              <div
                key={t}
                style={{
                  display: 'flex', gap: 10, padding: '7px 10px', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 5, fontSize: 11.5,
                }}
              >
                <span className="v2-mono" style={{ width: 108, color: 'var(--acc-buddy)' }}>{t}</span>
                <span className="v2-muted">{d}</span>
              </div>
            ))}
          </div>
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Tone variants</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {['direct', 'soft', 'humorous', 'analytical', 'tough_love'].map(t => <Pill key={t}>{t}</Pill>)}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ═══ TAB · SAFETY ════════════════════════════════════════════════
// [cmd] module-buddy-engines.jsx:730-785.
export function BuddySafety() {
  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      <div
        style={{
          display: 'flex', gap: 12, padding: 14,
          background: 'color-mix(in oklch, var(--neg) 5%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--neg) 22%, var(--border))',
          borderRadius: 8,
        }}
      >
        {/* [cmd] Vorlage: `shield` — gibt es nicht, siehe Kopf. */}
        <Icon name="admin" className="v2-ic" style={{ color: 'var(--neg)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Policy gate</div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Every response passes server-side review before it reaches you: <span className="v2-mono">PASS</span>,
            <span className="v2-mono"> REDACT</span> (rewritten) or <span className="v2-mono">BLOCK</span> (replaced with a safe redirect).
            These nine rules cannot be turned off by any tier, coach or gym.
          </div>
        </div>
      </div>

      <Card title="Immutable rules" sub="9" attrappe={ATTRAPPE}>
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th style={{ width: 250 }}>Rule</th>
                <th>What it means</th>
              </tr>
            </thead>
            <tbody>
              {SAFETY_RULES.map(r => (
                <tr key={r.rule}>
                  <td style={{ fontSize: 12.5, fontWeight: 500 }}>{r.rule}</td>
                  <td className="v2-muted" style={{ fontSize: 11.5 }}>{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Gate log" sub="what the gate changed" attrappe={ATTRAPPE}>
        <div className="v2-col-gap" style={{ gap: 8 }}>
          {GATE_LOG.map((g, i) => {
            const col = g.verdict === 'BLOCK'
              ? 'var(--neg)'
              : g.verdict === 'REDACT' ? 'var(--warn)' : 'var(--pos)'
            return (
              <div
                key={i}
                style={{
                  padding: 12, background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Pill
                    style={{
                      color: col,
                      borderColor: `color-mix(in oklch, ${col} 35%, var(--border))`,
                      background: `color-mix(in oklch, ${col} 8%, transparent)`,
                    }}
                  >
                    {g.verdict}
                  </Pill>
                  {g.reason !== '—' && <Pill className="v2-mono" style={{ fontSize: 9.5 }}>{g.reason}</Pill>}
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>{g.at}</span>
                </div>
                {g.before !== '—' && (
                  <div style={{ marginBottom: 8 }}>
                    <div className="v2-eyebrow" style={{ marginBottom: 3, color: 'var(--neg)' }}>
                      Model wanted to say
                    </div>
                    <div
                      style={{
                        fontSize: 12, lineHeight: 1.5, color: 'var(--fg-muted)',
                        textDecoration: 'line-through',
                        textDecorationColor: 'color-mix(in oklch, var(--neg) 50%, transparent)',
                      }}
                    >
                      {g.before}
                    </div>
                  </div>
                )}
                <div>
                  <div className="v2-eyebrow" style={{ marginBottom: 3, color: 'var(--pos)' }}>You received</div>
                  <div style={{ fontSize: 12, lineHeight: 1.5 }}>{g.after}</div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

// ═══ TAB · BUTLER ════════════════════════════════════════════════
// [cmd] module-buddy-engines.jsx:787-845. `[cmd]` :788 — "1.4fr 1fr",
// hier `v2-grid v2-grid-14`.
export function BuddyButler() {
  return (
    <div className="v2-grid v2-grid-14">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Recent actions" sub="intent → confidence → preview → write" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {BUTLER_LOG.map((b, i) => {
              const col = b.status === 'clarification' ? 'var(--warn)' : 'var(--pos)'
              return (
                <div
                  key={i}
                  style={{
                    padding: 12, background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Pill className="v2-mono" style={{ fontSize: 9.5 }}>{b.intent}</Pill>
                    <Pill style={{ color: b.conf >= 0.8 ? 'var(--pos)' : 'var(--warn)' }}>
                      {`conf ${b.conf.toFixed(2)}`}
                    </Pill>
                    <Pill style={{ color: col, borderColor: `color-mix(in oklch, ${col} 35%, var(--border))` }}>
                      {b.status}
                    </Pill>
                    <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>{b.at}</span>
                  </div>
                  <div style={{ fontSize: 12.5, marginBottom: 6 }}>&ldquo;{b.said}&rdquo;</div>
                  <div className="v2-mono" style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{b.result}</div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card title="Confidence threshold" sub="below 0.80 I ask instead of acting" attrappe={ATTRAPPE}>
          <div
            style={{
              position: 'relative', height: 28, borderRadius: 5, overflow: 'hidden',
              display: 'flex', border: '1px solid var(--border)', marginBottom: 8,
            }}
          >
            <div
              style={{
                width: '80%', background: 'var(--warn)', opacity: 0.35, display: 'grid',
                placeItems: 'center', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--fg)',
              }}
            >
              ask back
            </div>
            <div
              style={{
                width: '20%', background: 'var(--pos)', opacity: 0.35, display: 'grid',
                placeItems: 'center', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--fg)',
              }}
            >
              execute
            </div>
            <div style={{ position: 'absolute', left: '80%', top: -3, bottom: -3, width: 2, background: 'var(--fg)' }} />
          </div>
          <div
            style={{
              display: 'flex', justifyContent: 'space-between', fontSize: 10,
              color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)',
            }}
          >
            <span>0.00</span><span>0.80 threshold</span><span>1.00</span>
          </div>
          <div className="v2-divider" />
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Meals always show a preview before writing, regardless of confidence — quantities are too easy to get wrong.
          </div>
        </Card>
      </div>

      <Card title="What I can write" sub="6 intents · each targets one module" attrappe={ATTRAPPE}>
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {BUTLER_INTENTS.map(i => (
            <div
              key={i.type}
              style={{
                padding: 10, background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="v2-mono" style={{ fontSize: 11, color: 'var(--acc-buddy)' }}>{i.type}</span>
                <Pill style={{ fontSize: 9.5 }}>{i.target}</Pill>
                {i.preview && <Pill variant="warn" style={{ fontSize: 9.5 }}>preview first</Pill>}
              </div>
              <div className="v2-dim" style={{ fontSize: 11, fontStyle: 'italic' }}>&ldquo;{i.ex}&rdquo;</div>
            </div>
          ))}
        </div>
        <div className="v2-divider" />
        <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
          Every write goes through the module&apos;s own API with your user id — never a direct database write.
        </div>
      </Card>
    </div>
  )
}
