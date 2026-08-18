'use client'

// Drei Tabs: „Knowledge", „Rules" und „Clone & Gym".
//
// QUELLE: theme-v1/module-buddy-knowledge.jsx:29-82 (`BuddyKnowledge`),
// :103-194 (`BuddyRules`), :197-277 (`BuddyClone`). Die Datei hat 279
// Zeilen; uebernommen ist alles ausser der `Object.assign`-Zeile am Ende,
// die es hier nicht braucht.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript, jede Requisite und jeder Zustand
//      getippt; kein `any`.
//   2. Klassen auf `v2-`-Praefix, jede `<table>` in `v2-tbl-wrap`.
//   3. `window.X` -> Importe, `useState` -> `React.useState`.
//   4. `color-mix(in srgb, …)` -> `color-mix(in oklch, …)`, wie im
//      ganzen V2-Bestand.
//   5. Das Wurzelraster von `BuddyClone` in eine Klasse mit Haltepunkt
//      (siehe unten).
//   6. Icon `file` -> `copy` (siehe unten).
//   7. Mehrteilige JSX-Textknoten zu einem Template-Literal
//      zusammengezogen — getrennte Ausdruecke wie `{a} · {b}` erzeugen
//      sonst eine Hydration-Meldung. Betrifft vier Stellen:
//      `pgvector · {KB_ENTRIES.length} of 1,240` (Zeile 44),
//      `confidence {k.conf.toFixed(2)}` (:56),
//      `cited {k.used}× · {k.lastUsed}` (:57),
//      `{r.trigger} → {r.action}` (:130).
//
// `[cmd]` `KB_ENTRIES` (Zeile 4) und `USER_RULES` (Zeile 85) stehen
// NICHT in `./daten` — die Uebernahme der Daten (G-42) hat sie
// ausgelassen, obwohl der Kopf von `daten.ts:15` sie auffuehrt.
// Gemessen: `grep -n "KB_ENTRIES\|USER_RULES" ai/daten.ts` findet nur
// diese Kommentarzeile, keine Deklaration. Beide stehen deshalb hier,
// getippt und mit der Quellzeile benannt. Gemeldet ist es im Bericht.
//
// `[cmd]` `<Icon name="file">` (Zeile 68, die Belegkarte) gibt es in
// `packages/ui` nicht — `icons.tsx` fuehrt den Namen nicht. Genommen ist
// `copy` (icons.tsx:93), das Blattmotiv des Satzes — dieselbe Ersetzung
// wie in G-36, damit dasselbe Motiv nicht zweimal anders faellt. Der
// Auftrag sperrt `packages/ui/`; gemeldet ist es im Bericht.
//
// `[cmd]` `<Pill variant="">` kennt `PillVariant` (primitives.tsx:80)
// nicht — gueltig sind `pos | warn | neg | acc`. In dieser Vorlagendatei
// steht kein `variant="block"`; die drei benutzten (`acc`, `warn`, `pos`)
// sind alle gueltig und bleiben unveraendert.
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst. Lebendig bleibt, was in der Vorlage lebendig ist
// — die Suche und das Auf- und Zuklappen der Belegkarte in
// `BuddyKnowledge`, das Oeffnen und Schliessen des Fensters in
// `BuddyRules`. Tot bleibt, was dort tot ist: „Create rule" und
// saemtliche Felder des Fensters tragen in der Vorlage kein `onChange`
// und kein `onClick` — sie stehen da und tun nichts, genau wie dort.
//
// `[cmd]` KEINE HYDRATIONSFALLE: null `Math.random()`, null `Date.now()`,
// null `new Date()`, null `Math.sin`. Jede Zahl steht fest.
//
// `[cmd]` ALLES IST ATTRAPPE. Ein Buddy-Schema gibt es nicht.
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import { ATTRAPPE } from './ansicht'

// ═══ DATEN ═══════════════════════════════════════════════════════
// [cmd] module-buddy-knowledge.jsx:4-27 und :85-101, 1:1 uebernommen.

export type KbRef = { t: string; y: number; doi: string }

export type KbEntry = {
  id: string
  title: string
  topic: string
  conf: number
  claim: string
  refs: KbRef[]
  used: number
  lastUsed: string
}

/** [cmd] module-buddy-knowledge.jsx:4-27 — fuenf Eintraege. */
const KB_ENTRIES: KbEntry[] = [
  {
    id: 'KB-118', title: 'Creatine loading is optional', topic: 'Supplements', conf: 0.96,
    claim: 'A 20 g/day loading phase saturates muscle stores in about a week; 3–5 g daily reaches the same saturation in three to four weeks with less GI upset.',
    refs: [
      { t: 'Hultman et al. · J Appl Physiol', y: 1996, doi: '10.1152/jappl.1996.81.1.232' },
      { t: 'ISSN Position Stand: Creatine', y: 2017, doi: '10.1186/s12970-017-0173-z' },
    ],
    used: 4, lastUsed: 'yesterday',
  },
  {
    id: 'KB-104', title: 'Protein distribution across the day', topic: 'Nutrition', conf: 0.91,
    claim: 'Four doses of roughly 0.4 g/kg spread evenly outperform two large doses for 24-hour muscle protein synthesis.',
    refs: [
      { t: 'Areta et al. · J Physiol', y: 2013, doi: '10.1113/jphysiol.2012.244897' },
      { t: 'Schoenfeld & Aragon · JISSN', y: 2018, doi: '10.1186/s12970-018-0215-1' },
    ],
    used: 11, lastUsed: 'today',
  },
  {
    id: 'KB-092', title: 'HRV responds to sleep debt before it responds to load', topic: 'Recovery', conf: 0.84,
    claim: 'Overnight rMSSD tracks cumulative sleep deficit more tightly than acute training volume in trained populations.',
    refs: [{ t: 'Plews et al. · Sports Med', y: 2013, doi: '10.1007/s40279-013-0071-8' }],
    used: 6, lastUsed: '2 days ago',
  },
  {
    id: 'KB-076', title: 'Caffeine half-life and sleep onset', topic: 'Supplements', conf: 0.93,
    claim: 'With a five-hour half-life, 200 mg at 17:00 still leaves roughly 100 mg circulating at 22:00 — enough to delay sleep onset in most people.',
    refs: [{ t: 'Drake et al. · J Clin Sleep Med', y: 2013, doi: '10.5664/jcsm.3170' }],
    used: 8, lastUsed: 'yesterday',
  },
  {
    id: 'KB-061', title: 'Volume landmarks are individual', topic: 'Training', conf: 0.72,
    claim: 'MEV and MRV vary widely between lifters; population defaults are a starting point, not a prescription.',
    refs: [{ t: 'Israetel et al. · Scientific Principles of Hypertrophy', y: 2021, doi: '—' }],
    used: 3, lastUsed: 'last week',
  },
]

export type RuleSource = 'user' | 'system' | 'coach'

export type UserRule = {
  id: string
  name: string
  cat: string
  by: RuleSource
  active: boolean
  trigger: string
  action: string
  priority: number
  cooldown: number
  maxPerDay: number
  fired: number
  /** `[cmd]` Zwei der fuenf Regeln fuehren `null` (:94, :100). */
  success: number | null
}

/** [cmd] module-buddy-knowledge.jsx:85-101 — fuenf Regeln. */
const USER_RULES: UserRule[] = [
  {
    id: 'UR-04', name: 'Remind me about casein', cat: 'nutrition', by: 'user', active: true,
    trigger: 'protein_remaining > 30 AND hour >= 20', action: 'message', priority: 4,
    cooldown: 24, maxPerDay: 1, fired: 12, success: 0.75,
  },
  {
    id: 'UR-03', name: 'Flag late caffeine', cat: 'supplements', by: 'user', active: true,
    trigger: 'caffeine_logged AND hour >= 16', action: 'alert · info', priority: 6,
    cooldown: 12, maxPerDay: 2, fired: 5, success: 0.60,
  },
  {
    id: 'UR-02', name: 'No training talk on Sundays', cat: 'general', by: 'user', active: true,
    trigger: 'day = sunday', action: 'suppress training reminders', priority: 2,
    cooldown: 0, maxPerDay: 1, fired: 8, success: null,
  },
  {
    id: 'SR-11', name: 'Recovery below 50 · warn', cat: 'recovery', by: 'system', active: true,
    trigger: 'recovery_score < 50 AND heavy_training_day', action: 'alert · warning', priority: 1,
    cooldown: 24, maxPerDay: 1, fired: 2, success: 0.88,
  },
  {
    id: 'CR-02', name: 'Peaking block · no confrontation', cat: 'training', by: 'coach', active: true,
    trigger: 'block_phase = peaking', action: 'cap intervention tone', priority: 1,
    cooldown: 0, maxPerDay: 99, fired: 1, success: null,
  },
]

// ═══ TAB · KNOWLEDGE ═════════════════════════════════════════════
// [cmd] module-buddy-knowledge.jsx:29-82.
export function BuddyKnowledge() {
  const [q, setQ] = React.useState('')
  const [sel, setSel] = React.useState<KbEntry | null>(null)

  const rows = KB_ENTRIES.filter(
    k => !q || (k.title + k.claim + k.topic).toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      {/* Banner — module-buddy-knowledge.jsx:35-45. */}
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
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Knowledge base</div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Retrieval runs before any science claim. If nothing is retrieved, I don&apos;t make the claim — and the citation lands in a card,
            never inside spoken text.
          </div>
        </div>
        <Pill variant="acc">{`pgvector · ${KB_ENTRIES.length} of 1,240`}</Pill>
      </div>

      {/* Suche — module-buddy-knowledge.jsx:47-48. Lebendig. */}
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search the knowledge base…"
        aria-label="Search the knowledge base"
        style={{
          width: '100%', height: 34, background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 7,
          padding: '0 12px', fontSize: 13,
        }}
      />

      {/* Treffer — module-buddy-knowledge.jsx:50-79. */}
      <div className="v2-col-gap" style={{ gap: 8 }}>
        {rows.map(k => (
          <Card
            key={k.id}
            onClick={() => setSel(sel?.id === k.id ? null : k)}
            style={{ cursor: 'pointer' }}
            attrappe={ATTRAPPE}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <span className="v2-mono v2-dim" style={{ fontSize: 10 }}>{k.id}</span>
              <Pill>{k.topic}</Pill>
              <Pill
                style={{
                  color: k.conf >= 0.9
                    ? 'var(--pos)'
                    : k.conf >= 0.8 ? 'var(--acc-recov)' : 'var(--warn)',
                }}
              >
                {`confidence ${k.conf.toFixed(2)}`}
              </Pill>
              <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                {`cited ${k.used}× · ${k.lastUsed}`}
              </span>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 5 }}>{k.title}</div>
            <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>{k.claim}</div>
            {sel?.id === k.id && (
              <>
                <div className="v2-divider" />
                <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Evidence card · shown in UI, never spoken</div>
                <div className="v2-col-gap" style={{ gap: 4 }}>
                  {k.refs.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                        background: 'var(--surface-2)', borderRadius: 5, fontSize: 11.5,
                      }}
                    >
                      {/* [cmd] Vorlage: `<Icon name="file">` — gibt es in
                          packages/ui nicht. `copy` wie in G-36. */}
                      <Icon name="copy" className="v2-ic v2-ic-sm" style={{ color: 'var(--acc-buddy)' }} />
                      <span style={{ flex: 1 }}>{r.t}</span>
                      <span className="v2-num v2-dim">{r.y}</span>
                      <span className="v2-mono v2-dim" style={{ fontSize: 10 }}>{r.doi}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

// ═══ TAB · RULES ═════════════════════════════════════════════════
// [cmd] module-buddy-knowledge.jsx:103-194.

/** [cmd] module-buddy-knowledge.jsx:105-106. */
const BY_LABEL: Record<RuleSource, string> = { user: 'you', system: 'system', coach: 'coach' }
const BY_COLOR: Record<RuleSource, string> = {
  user: 'var(--acc-buddy)', system: 'var(--fg-dim)', coach: 'var(--acc-coach)',
}

export function BuddyRules() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      {/* Banner — module-buddy-knowledge.jsx:109-119. */}
      <div
        style={{
          display: 'flex', gap: 12, padding: 14,
          background: 'color-mix(in oklch, var(--acc-buddy) 5%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--acc-buddy) 22%, var(--border))',
          borderRadius: 8,
        }}
      >
        <Icon name="bolt" className="v2-ic" style={{ color: 'var(--acc-buddy)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Your rules</div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Write your own triggers. Yours run alongside the system rules and any your coach has set — priority decides who wins,
            cooldown decides how often.
          </div>
        </div>
        <button className="v2-btn v2-btn-primary" onClick={() => setOpen(true)}>
          <Icon name="plus" className="v2-ic v2-ic-sm" />
          New rule
        </button>
      </div>

      {/* Die Tabelle — module-buddy-knowledge.jsx:121-144. */}
      <Card attrappe={ATTRAPPE}>
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Rule</th>
                <th style={{ width: 80 }}>Source</th>
                <th style={{ width: 60, textAlign: 'right' }}>Prio</th>
                <th style={{ width: 90, textAlign: 'right' }}>Cooldown</th>
                <th style={{ width: 80, textAlign: 'right' }}>Max/day</th>
                <th style={{ width: 70, textAlign: 'right' }}>Fired</th>
                <th style={{ width: 90, textAlign: 'right' }}>Success</th>
              </tr>
            </thead>
            <tbody>
              {USER_RULES.map(r => (
                <tr key={r.id}>
                  <td className="v2-num v2-muted" style={{ fontSize: 11 }}>{r.id}</td>
                  <td>
                    <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 2 }}>{r.name}</div>
                    <div className="v2-mono v2-dim" style={{ fontSize: 10 }}>
                      {`${r.trigger} → ${r.action}`}
                    </div>
                  </td>
                  <td>
                    <Pill
                      style={{
                        color: BY_COLOR[r.by],
                        borderColor: `color-mix(in oklch, ${BY_COLOR[r.by]} 32%, var(--border))`,
                      }}
                    >
                      {BY_LABEL[r.by]}
                    </Pill>
                  </td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{r.priority}</td>
                  <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>
                    {r.cooldown ? `${r.cooldown} h` : '—'}
                  </td>
                  <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>{r.maxPerDay}</td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{r.fired}</td>
                  <td
                    className="v2-num"
                    style={{
                      textAlign: 'right',
                      color: r.success == null
                        ? 'var(--fg-dim)'
                        : r.success >= 0.7 ? 'var(--pos)' : 'var(--warn)',
                    }}
                  >
                    {r.success == null ? '—' : `${(r.success * 100).toFixed(0)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Das Fenster — module-buddy-knowledge.jsx:146-191. Offen und zu
          sind lebendig; die Felder darin sind es in der Vorlage nicht. */}
      {open && (
        <div className="v2-modal-veil" onClick={() => setOpen(false)}>
          <div className="v2-modal" style={{ width: 600 }} onClick={e => e.stopPropagation()}>
            <div className="v2-modal-h">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>New rule</div>
                <div className="v2-dim" style={{ fontSize: 11 }}>Runs on every event that matches the trigger</div>
              </div>
              <button className="v2-icon-btn" aria-label="Close" onClick={() => setOpen(false)}>
                <Icon name="x" className="v2-ic" />
              </button>
            </div>
            <div className="v2-modal-body">
              <div style={{ marginBottom: 12 }}>
                <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Name</div>
                <input
                  placeholder="e.g. Remind me about casein"
                  aria-label="Name"
                  style={{
                    width: '100%', height: 30, background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: 6,
                    padding: '0 10px', fontSize: 12,
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Category</div>
                  <select
                    aria-label="Category"
                    style={{
                      width: '100%', height: 30, background: 'var(--surface)',
                      border: '1px solid var(--border)', borderRadius: 6,
                      padding: '0 10px', fontSize: 12,
                    }}
                  >
                    <option>nutrition</option>
                    <option>training</option>
                    <option>recovery</option>
                    <option>supplements</option>
                    <option>general</option>
                  </select>
                </div>
                <div>
                  <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Action</div>
                  <select
                    aria-label="Action"
                    style={{
                      width: '100%', height: 30, background: 'var(--surface)',
                      border: '1px solid var(--border)', borderRadius: 6,
                      padding: '0 10px', fontSize: 12,
                    }}
                  >
                    <option>message</option>
                    <option>alert · info</option>
                    <option>alert · warning</option>
                    <option>suppress</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Condition</div>
                <input
                  defaultValue="protein_remaining > 30 AND hour >= 20"
                  aria-label="Condition"
                  style={{
                    width: '100%', height: 30, background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: 6,
                    padding: '0 10px', fontSize: 12, fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Priority</div>
                  <input
                    type="number"
                    defaultValue="5"
                    aria-label="Priority"
                    style={{
                      width: '100%', height: 30, background: 'var(--surface)',
                      border: '1px solid var(--border)', borderRadius: 6,
                      padding: '0 10px', fontSize: 12,
                    }}
                  />
                </div>
                <div>
                  <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Cooldown h</div>
                  <input
                    type="number"
                    defaultValue="24"
                    aria-label="Cooldown h"
                    style={{
                      width: '100%', height: 30, background: 'var(--surface)',
                      border: '1px solid var(--border)', borderRadius: 6,
                      padding: '0 10px', fontSize: 12,
                    }}
                  />
                </div>
                <div>
                  <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Max per day</div>
                  <input
                    type="number"
                    defaultValue="1"
                    aria-label="Max per day"
                    style={{
                      width: '100%', height: 30, background: 'var(--surface)',
                      border: '1px solid var(--border)', borderRadius: 6,
                      padding: '0 10px', fontSize: 12,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="v2-modal-f">
              <button className="v2-btn v2-btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              {/* [cmd] Vorlage :187 — ohne `onClick`. Bleibt ohne. */}
              <button className="v2-btn v2-btn-primary">
                <Icon name="check" className="v2-ic v2-ic-sm" />
                Create rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══ TAB · CLONE & GYM ═══════════════════════════════════════════
// [cmd] module-buddy-knowledge.jsx:197-277.
//
// `[cmd]` Das Wurzelraster der Vorlage (:198) ist `grid` mit
// `gridTemplateColumns: "1.3fr 1fr"` und ohne Haltepunkt. Genommen ist
// `v2-buddy-grid-13` aus buddy.css — dieselben zwei Spalten, plus den
// 1100px-Haltepunkt, der aus zwei Spalten eine macht. Die kleinen Raster
// innerhalb der Kacheln (`180px 1fr` in der Wissenszeile) bleiben inline,
// weil sie nur an dieser einen Stelle stehen.

/** [cmd] module-buddy-knowledge.jsx:214-219 — fest im JSX der Vorlage. */
const CLONE_WISSEN: [string, string][] = [
  ['Programming philosophy', 'RPE-led, never percentage-led. Autoregulation over fixed loads.'],
  ['Deload triggers', 'Three stalled sessions or RPE 9 twice in a week.'],
  ['Exercise preferences', 'Free weights first. Machines only for isolation or rehab.'],
  ['Communication style', 'Short, direct, no filler. Explains the why once.'],
  ['Hard limits', 'Never advises on medical, nutrition specifics or supplements.'],
]

type CloneAnswer = { q: string; a: string; flagged: boolean; at: string }

/** [cmd] module-buddy-knowledge.jsx:231-234 — fest im JSX der Vorlage. */
const CLONE_ANTWORTEN: CloneAnswer[] = [
  {
    q: 'Should I add a set to bench this week?',
    a: "Not this week. You're two sessions into block 2 — hold volume and let intensity settle first.",
    flagged: false, at: 'yesterday',
  },
  {
    q: 'My elbow aches on pressing.',
    a: "That's outside what I answer for Anders. Flagged for him — he'll pick it up before Monday.",
    flagged: true, at: 'May 12',
  },
  {
    q: 'Is RPE 8 too easy for the top set?',
    a: 'No. RPE 8 on the top set is the plan through week 8. Nine is for the peaking block.',
    flagged: false, at: 'May 10',
  },
]

/** [cmd] module-buddy-knowledge.jsx:256 — die geforderte Ausstattung. */
const GYM_AUSSTATTUNG = ['Power rack', 'Barbell 20 kg', 'Plates to 200 kg', 'Pull-up bar', 'Adjustable bench']

type Gym = { n: string; d: string; ok: boolean; note: string }

/** [cmd] module-buddy-knowledge.jsx:260-262 — drei Studios. */
const GYMS: Gym[] = [
  { n: 'McFit Charlottenburg', d: '1.2 km', ok: true, note: 'All equipment present' },
  { n: 'Basefit Kantstraße', d: '2.4 km', ok: true, note: 'All equipment present' },
  { n: "Holmes Place Ku'damm", d: '3.1 km', ok: false, note: 'No plates above 160 kg' },
]

export function BuddyClone() {
  return (
    <div className="v2-buddy-grid-13">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        {/* Banner — module-buddy-knowledge.jsx:200-210. */}
        <div
          style={{
            display: 'flex', gap: 12, padding: 14,
            background: 'color-mix(in oklch, var(--acc-coach) 5%, var(--surface))',
            border: '1px solid color-mix(in oklch, var(--acc-coach) 22%, var(--border))',
            borderRadius: 8,
          }}
        >
          <Icon name="coach" className="v2-ic" style={{ color: 'var(--acc-coach)', flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>AI Clone · Anders Lindqvist</div>
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
              Your training coach has published a clone of his method. Between your weekly calls, it answers in his framework
              and flags him when it can&apos;t.
            </div>
          </div>
          <Pill variant="acc">Coach B2B</Pill>
        </div>

        {/* Was der Klon weiss — module-buddy-knowledge.jsx:212-227. */}
        <Card
          title="What the clone knows"
          sub="trained on 4 years of his coaching corpus"
          attrappe={ATTRAPPE}
        >
          <div className="v2-col-gap" style={{ gap: 5 }}>
            {CLONE_WISSEN.map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: 'grid', gridTemplateColumns: '180px 1fr', gap: 10,
                  padding: '9px 10px', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 5, fontSize: 11.5,
                }}
              >
                <span style={{ fontWeight: 500 }}>{k}</span>
                <span className="v2-muted">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Letzte Antworten — module-buddy-knowledge.jsx:229-246. */}
        <Card title="Recent clone answers" sub="he reviews these weekly" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {CLONE_ANTWORTEN.map((c, i) => (
              <div
                key={i}
                style={{
                  padding: 12, background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {c.flagged
                    ? <Pill variant="warn">escalated to Anders</Pill>
                    : <Pill variant="pos">answered</Pill>}
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>{c.at}</span>
                </div>
                <div style={{ fontSize: 12, marginBottom: 6 }}>{`“${c.q}”`}</div>
                <div
                  className="v2-muted"
                  style={{
                    fontSize: 12, lineHeight: 1.5, paddingLeft: 10,
                    borderLeft: '2px solid var(--acc-coach)',
                  }}
                >
                  {c.a}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Gym finder — module-buddy-knowledge.jsx:249-275. */}
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Gym finder" sub="Pro feature · Google Places" attrappe={ATTRAPPE}>
          <div
            style={{
              padding: 10, background: 'var(--surface-2)', borderRadius: 6,
              marginBottom: 12, fontSize: 11.5, color: 'var(--fg-muted)', lineHeight: 1.5,
            }}
          >
            Used when you travel — filters for the equipment your current block actually needs.
          </div>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Required for block 2</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
            {GYM_AUSSTATTUNG.map(e => <Pill key={e}>{e}</Pill>)}
          </div>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {GYMS.map(g => (
              <div
                key={g.n}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5,
                }}
              >
                <span
                  style={{
                    width: 7, height: 7, borderRadius: 999,
                    background: g.ok ? 'var(--pos)' : 'var(--warn)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{g.n}</div>
                  <div className="v2-dim" style={{ fontSize: 10.5 }}>{g.note}</div>
                </div>
                <span className="v2-num v2-dim" style={{ fontSize: 11 }}>{g.d}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
