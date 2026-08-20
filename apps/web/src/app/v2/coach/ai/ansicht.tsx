'use client'

// Das AI-Coach-Modul der Vorlage, uebernommen.
//
// QUELLE: theme-v1/module-buddy.jsx (414 Zeilen) — der Rahmen.
//
// **WELCHER RAHMEN GILT:** `[cmd]` `app.jsx:127`:
//     case "coach-ai": return <BuddyModule />;
// `module-buddy.jsx:414` setzt `window.BuddyModule` genau einmal, keine
// zweite Datei ueberschreibt es. Keine V2-Weiche, der Rahmen ist
// eindeutig — wie bei Human Coaches (G-40).
//
// **WO DIE ZULIEFERER STECKEN:** `[cmd]` Der Rahmen ruft fuenfzehn
// Namen ueber `window.*`. Der Auftrag vermutete, elf davon haetten
// keine Datei. **Gemessen: alle fuenfzehn sind vorhanden**, verteilt
// auf vier Dateien — und eine davon gehoert Human Coaches:
//     module-buddy-engines.jsx    9  Tiers, Engines, Journey, Watcher,
//                                    BSS, Signature, Interventions,
//                                    Safety, Butler
//     module-buddy-knowledge.jsx  3  Knowledge, Rules, Clone
//     module-buddy-voice.jsx      1  Voice
//     module-coach-meta.jsx       1  CoachOverrides  ← andere Modulfamilie
// Ausfuehrlich im Bericht.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript, strict.
//   2. Klassen auf `v2-`-Praefix.
//   3. `window.X` -> Importe.
//   4. `@media`-Haltepunkte, weil die Vorlage keine hat.
//   5. `arr_r` -> `arrow_right` (Tippfehler der Vorlage).
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst.
//
// `[cmd]` KEINE HYDRATIONSFALLE in den vier Vorlagendateien: null
// `Math.random()`, null `Date.now()`, null `Math.sin`. Belegt in
// buddy.css und geprueft in v2-attrappen.test.ts.
//
// `[cmd]` ALLES IST ATTRAPPE. Ein Buddy-Schema gibt es nicht.
import * as React from 'react'
import { useTabParam } from '../../../../lib/tab-url'
import {
  Card, Pill, Icon, Row, Tabs, type TabItem,
} from '@lumeos/ui'

import {
  BUDDY_PERSONAS, BUDDY_STATES, BUDDY_CHAT_HISTORY,
  BUDDY_INSIGHTS_FEED, BUDDY_MEMORY, BUDDY_DECISIONS,
  TIER_LABEL,
} from './daten'
import { BuddyKontext, useBuddy } from './kontext'
import { BuddyOrb } from './orb'
import {
  BuddyBSS, BuddyButler, BuddyEngines, BuddyInterventions,
  BuddyJourney, BuddySafety, BuddySignature, BuddyTiers, BuddyWatcher,
} from './tab-motoren'
import { BuddyCoachOverrides } from './tab-overrides'
import { BuddyVoice } from './tab-stimme'
import { BuddyClone, BuddyKnowledge, BuddyRules } from './tab-wissen'

/** Die Marke an jeder Kachel. Ein Satz, damit er nicht driftet. */
export const ATTRAPPE =
  'Aus dem Entwurf uebernommen. Die Zahlen sind erfunden — ein '
  + 'Buddy-Schema gibt es noch nicht.'

// [cmd] module-buddy.jsx:91-112, in dieser Reihenfolge. Zwanzig.
function tabs(): TabItem[] {
  return [
    { id: 'chat', label: 'Chat' },
    { id: 'feed', label: 'Insights feed', count: BUDDY_INSIGHTS_FEED.length },
    { id: 'memory', label: 'Memory', count: BUDDY_MEMORY.length },
    { id: 'decisions', label: 'Decisions', count: BUDDY_DECISIONS.length },
    { id: 'settings', label: 'Personality' },
    { id: 'states', label: 'Avatar states' },
    { id: 'tiers', label: 'Plan & gate' },
    { id: 'engines', label: 'Engines' },
    { id: 'journey', label: 'Journey' },
    { id: 'watcher', label: 'Watcher' },
    { id: 'bss', label: 'BSS' },
    { id: 'signature', label: 'Signature' },
    { id: 'interven', label: 'Interventions' },
    { id: 'safety', label: 'Safety' },
    { id: 'butler', label: 'Butler' },
    { id: 'voice', label: 'Voice / Live' },
    { id: 'knowledge', label: 'Knowledge' },
    { id: 'rules', label: 'Rules' },
    { id: 'overrides', label: 'Coach overrides' },
    { id: 'clone', label: 'Clone & Gym' },
  ]
}

export function BuddyAnsicht() {
  // G-117: Tab in der Adresse — Drop-in aus lib/tab-url.
  const [tab, setTab] = useTabParam('chat')
  const [persona, setPersona] = React.useState('friend')
  const [autonomy, setAutonomy] = React.useState(3)
  const [tier, setTier] = React.useState('pro')

  const kontext = React.useMemo(
    () => ({ persona, setPersona, autonomy, setAutonomy, tier, setTier }),
    [persona, autonomy, tier],
  )

  // [cmd] module-buddy.jsx:79. Die Vorlage schreibt `.find(...).name`
  // ohne Absicherung; in TypeScript braucht es den Rueckfall.
  const personaName = BUDDY_PERSONAS.find(p => p.id === persona)?.name ?? persona

  return (
    <BuddyKontext.Provider value={kontext}>
      {/* [cmd] module-buddy.jsx:75-90. */}
      <div className="v2-module-header v2-module-hero-lite">
        <div className="v2-module-title-block">
          <div className="v2-module-title-row">
            <span className="v2-module-title">Buddy</span>
            <Pill variant="acc">{personaName}</Pill>
            <Pill>{`autonomy · L${autonomy}`}</Pill>
            <Pill variant="acc">{TIER_LABEL[tier]}</Pill>
            <Pill dot="var(--pos)">idle</Pill>
          </div>
          <div className="v2-module-sub">
            {`Persistent AI buddy · knows your data · cross-module aware · ${BUDDY_MEMORY.length} memories`}
          </div>
        </div>
        <div className="v2-module-actions">
          <button className="v2-btn">
            <Icon name="bell" className="v2-ic v2-ic-sm" />
            Notifications
          </button>
          <button className="v2-btn v2-btn-primary">
            <Icon name="message" className="v2-ic v2-ic-sm" />
            New chat
          </button>
        </div>
      </div>

      <Tabs items={tabs()} active={tab} onChange={setTab} />

      {tab === 'chat' && <BuddyChat />}
      {tab === 'feed' && <BuddyFeed />}
      {tab === 'memory' && <BuddyMemoryView />}
      {tab === 'decisions' && <BuddyDecisions />}
      {tab === 'settings' && <BuddySettings />}
      {tab === 'states' && <BuddyStatesShowcase />}
      {tab === 'tiers' && <BuddyTiers />}
      {tab === 'engines' && <BuddyEngines />}
      {tab === 'journey' && <BuddyJourney />}
      {tab === 'watcher' && <BuddyWatcher />}
      {tab === 'bss' && <BuddyBSS />}
      {tab === 'signature' && <BuddySignature />}
      {tab === 'interven' && <BuddyInterventions />}
      {tab === 'safety' && <BuddySafety />}
      {tab === 'butler' && <BuddyButler />}
      {tab === 'voice' && <BuddyVoice />}
      {tab === 'knowledge' && <BuddyKnowledge />}
      {tab === 'rules' && <BuddyRules />}
      {tab === 'overrides' && <BuddyCoachOverrides />}
      {tab === 'clone' && <BuddyClone />}
    </BuddyKontext.Provider>
  )
}

// ── Chat ─────────────────────────────────────────────────────────────
// [cmd] module-buddy.jsx:173-231.

/** [cmd] module-buddy.jsx:180-186 — sechs Gespraeche, fest im JSX. */
const THREADS = [
  { name: "Today's training prep", at: '14:19', last: 'stay with 17:30 for this week', active: true },
  { name: 'Glucose trend question', at: '09:32', last: 'tagged for Medical panel', active: false },
  { name: 'Bench PR celebration', at: '07:43', last: 'Strength block hitting target', active: false },
  { name: 'Sleep onset shift', at: 'yesterday', last: 'caffeine timing', active: false },
  { name: 'Cold plunge effect', at: 'yesterday', last: '+4.2ms HRV next morning', active: false },
  { name: 'Supplement streak', at: 'Mon', last: '23-day streak', active: false },
]

const SCHNELLTEXTE = ['Log meal', 'Start workout', 'Sleep score', 'Recovery suggestion', 'Plan tonight']

function BuddyChat() {
  const { persona } = useBuddy()
  const personaName = BUDDY_PERSONAS.find(p => p.id === persona)?.name ?? persona

  return (
    <div className="v2-buddy-chat">
      <Card title="Threads" sub="recent" className="v2-card-tight" style={{ padding: 0 }} attrappe={ATTRAPPE}>
        <div className="v2-col-gap" style={{ gap: 0 }}>
          {THREADS.map((t, i) => (
            <div
              key={i}
              style={{
                padding: 10, borderBottom: '1px solid var(--border)', cursor: 'pointer',
                background: t.active ? 'color-mix(in oklch, var(--acc-buddy) 6%, transparent)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 12, fontWeight: t.active ? 600 : 500 }}>{t.name}</span>
                <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 9.5 }}>{t.at}</span>
              </div>
              <div
                className="v2-muted"
                style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {t.last}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 0, display: 'flex', flexDirection: 'column' }} attrappe={ATTRAPPE}>
        <div
          style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <BuddyOrb state="responding" size={36} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Today&apos;s training prep</div>
            <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>
              {`${personaName} persona · 4 messages`}
            </div>
          </div>
          <Pill variant="pos" dot>online</Pill>
        </div>

        <div
          style={{
            flex: 1, padding: 16, overflowY: 'auto', display: 'flex',
            flexDirection: 'column', gap: 8, maxHeight: 420,
          }}
        >
          {BUDDY_CHAT_HISTORY.slice().reverse().map((m, i) => (
            <div
              key={i}
              style={{ display: 'flex', justifyContent: m.from === 'tom' ? 'flex-end' : 'flex-start' }}
            >
              <div
                style={{
                  maxWidth: '75%', padding: '10px 14px',
                  background: m.from === 'tom'
                    ? 'color-mix(in oklch, var(--acc-buddy) 18%, var(--surface))'
                    : 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 10,
                }}
              >
                <div className="v2-dim v2-mono" style={{ fontSize: 9.5, marginBottom: 3 }}>
                  {m.from === 'buddy'
                    ? `Buddy${m.state ? ` · ${m.state}` : ''} · ${m.at}`
                    : `Tom · ${m.at}`}
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--fg)' }}>{m.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            {SCHNELLTEXTE.map(q => (
              <span key={q} className="v2-pill" style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 11 }}>
                {q}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              placeholder="Ask Buddy anything…"
              aria-label="Ask Buddy anything"
              style={{
                flex: 1, height: 34, background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 7,
                padding: '0 12px', fontSize: 12.5,
              }}
            />
            <button className="v2-icon-btn" style={{ width: 34, height: 34 }} aria-label="Foto">
              <Icon name="camera" className="v2-ic" />
            </button>
            {/* [cmd] Vorlage: `<Icon name="arr_r">` — Tippfehler fuer
                `arrow_right`, wie in G-20/21/36/40. Nicht uebernommen. */}
            <button className="v2-btn v2-btn-primary" aria-label="Senden">
              <Icon name="arrow_right" className="v2-ic v2-ic-sm" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ── Insights feed ────────────────────────────────────────────────────
// [cmd] module-buddy.jsx:233-257.

const FEED_FARBE: Record<string, string> = {
  suggestion: 'var(--acc-recov)',
  alert: 'var(--warn)',
  celebration: 'var(--pos)',
  pattern: 'var(--acc-buddy)',
}

function BuddyFeed() {
  return (
    <div className="v2-col-gap" style={{ gap: 8 }}>
      {BUDDY_INSIGHTS_FEED.map((f, i) => {
        const color = FEED_FARBE[f.type]
        return (
          <Card key={i} attrappe={ATTRAPPE}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 3, alignSelf: 'stretch', background: color, borderRadius: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Pill
                    style={{
                      borderColor: `color-mix(in oklch, ${color} 35%, var(--border))`,
                      color, textTransform: 'uppercase',
                    }}
                  >
                    {f.type}
                  </Pill>
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>{f.ts}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{f.title}</div>
                <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 10 }}>{f.body}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {f.actions.map((a, j) => (
                    <button
                      key={a}
                      className={j === 0 ? 'v2-btn v2-btn-primary v2-btn-sm' : 'v2-btn v2-btn-ghost v2-btn-sm'}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// ── Memory ───────────────────────────────────────────────────────────
// [cmd] module-buddy.jsx:259-298.

function BuddyMemoryView() {
  const [cat, setCat] = React.useState('All')
  const cats = ['All', ...Array.from(new Set(BUDDY_MEMORY.map(m => m.cat)))]
  const gefiltert = cat === 'All' ? BUDDY_MEMORY : BUDDY_MEMORY.filter(m => m.cat === cat)

  return (
    <div>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: 14,
          background: 'color-mix(in oklch, var(--acc-buddy) 5%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--acc-buddy) 22%, var(--border))',
          borderRadius: 8, marginBottom: 14,
        }}
      >
        <Icon name="brain" className="v2-ic" style={{ color: 'var(--acc-buddy)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>What Buddy knows about you</div>
          <div className="v2-muted" style={{ fontSize: 11 }}>
            Editable · sourced · always reviewable. Buddy never has unrevealed memory.
          </div>
        </div>
        <button className="v2-btn">
          <Icon name="download" className="v2-ic v2-ic-sm" />
          Export memory
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {cats.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cat === c ? 'v2-pill v2-pill-acc' : 'v2-pill'}
            style={{ cursor: 'pointer', padding: '3px 10px', fontSize: 11 }}
          >
            {c}
          </button>
        ))}
      </div>

      <Card attrappe={ATTRAPPE}>
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Category</th>
                <th>Fact</th>
                <th style={{ width: 180 }}>Source</th>
                <th style={{ width: 90 }}>Updated</th>
                <th style={{ width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {gefiltert.map(m => (
                <tr key={m.id}>
                  <td><Pill>{m.cat}</Pill></td>
                  <td style={{ fontSize: 12.5 }}>{m.fact}</td>
                  <td className="v2-dim v2-mono" style={{ fontSize: 11 }}>{m.source}</td>
                  <td className="v2-num v2-muted">{m.updated}</td>
                  <td>
                    <button className="v2-icon-btn" aria-label={`${m.cat} bearbeiten`}>
                      <Icon name="edit" className="v2-ic v2-ic-sm" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ── Decisions ────────────────────────────────────────────────────────
// [cmd] module-buddy.jsx:300-317.

function BuddyDecisions() {
  return (
    <Card
      title="Decision feed"
      sub={`${BUDDY_DECISIONS.length} of 412 · last 7 days`}
      attrappe={ATTRAPPE}
      actions={(
        <button className="v2-btn v2-btn-ghost">
          <Icon name="download" className="v2-ic v2-ic-sm" />
          Export
        </button>
      )}
    >
      <div className="v2-tbl-wrap">
        <table className="v2-tbl">
          <thead>
            <tr>
              <th style={{ width: 120 }}>When</th>
              <th>Decision</th>
              <th style={{ width: 110 }}>Category</th>
              <th style={{ width: 90 }}>Autonomy</th>
              <th style={{ width: 110 }}>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {BUDDY_DECISIONS.map((d, i) => (
              <tr key={i}>
                <td className="v2-num v2-muted">{d.ts}</td>
                <td style={{ fontSize: 12 }}>{d.decision}</td>
                <td><Pill>{d.category}</Pill></td>
                <td><Pill variant={d.autonomy === 'auto' ? undefined : 'warn'}>{d.autonomy}</Pill></td>
                <td>
                  <Pill variant={d.outcome === 'delivered' || d.outcome === 'logged' ? 'pos' : undefined}>
                    {d.outcome}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ── Personality ──────────────────────────────────────────────────────
// [cmd] module-buddy.jsx:319-392.

/** [cmd] module-buddy.jsx:356-360, ueber `[autonomy - 1]` gewaehlt. */
const AUTONOMIE_TEXT = [
  'Supervised · confirms every action',
  'Cautious · asks for routine actions',
  'Collaborative (default) · independent on low-risk',
  'Independent · acts on most decisions, asks on changes',
  'Autonomous · acts within safety bounds, summarizes weekly',
]

function BuddySettings() {
  const { persona, setPersona, autonomy, setAutonomy } = useBuddy()

  return (
    <div className="v2-grid v2-grid-14">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Persona" sub="how Buddy speaks to you" attrappe={ATTRAPPE}>
          <div className="v2-grid v2-g-cols-2" style={{ gap: 8 }}>
            {BUDDY_PERSONAS.map(p => (
              <button
                key={p.id}
                onClick={() => setPersona(p.id)}
                style={{
                  padding: 12, borderRadius: 7, cursor: 'pointer', textAlign: 'left',
                  background: persona === p.id
                    ? 'color-mix(in oklch, var(--acc-buddy) 10%, var(--surface))'
                    : 'var(--surface)',
                  border: `1px solid ${persona === p.id
                    ? 'color-mix(in oklch, var(--acc-buddy) 35%, var(--border))'
                    : 'var(--border)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Icon
                    name={p.icon}
                    className="v2-ic"
                    style={{ color: persona === p.id ? 'var(--acc-buddy)' : 'var(--fg-muted)' }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                  {persona === p.id && <Pill variant="acc">active</Pill>}
                </div>
                <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.45 }}>{p.desc}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card title="Autonomy level" sub="how independently Buddy acts" attrappe={ATTRAPPE}>
          <div className="v2-dim" style={{ fontSize: 11.5, marginBottom: 12, lineHeight: 1.5 }}>
            Level 1 confirms every action · Level 5 acts autonomously within safety bounds.
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4, 5].map(l => (
              <button
                key={l}
                onClick={() => setAutonomy(l)}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: 6, cursor: 'pointer',
                  background: autonomy === l ? 'var(--acc-buddy)' : 'var(--surface)',
                  color: autonomy === l ? 'var(--bg)' : 'var(--fg-muted)',
                  border: `1px solid ${autonomy === l ? 'var(--acc-buddy)' : 'var(--border)'}`,
                  fontFamily: 'var(--font-mono)', fontWeight: 600,
                }}
              >
                {`L${l}`}
              </button>
            ))}
          </div>
          <div className="v2-muted" style={{ fontSize: 11.5, marginTop: 10, lineHeight: 1.5 }}>
            {AUTONOMIE_TEXT[autonomy - 1]}
          </div>
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Communication" attrappe={ATTRAPPE}>
          <Row label="Language" value="English (auto-detect)" />
          <Row label="Tone" value="Professional · friendly" />
          <Row label="Voice" value="Off · text only" />
          <Row label="Wake word" value={'"hey buddy" (off)'} />
        </Card>

        <Card title="Notifications" attrappe={ATTRAPPE}>
          <Row label="Frequency" value="Smart · ML-balanced" />
          <Row label="Critical alerts" value="Always · push + chat" />
          <Row label="Achievements" value="Push notification" />
          <Row label="Patterns" value="In-app only" />
          <Row label="Daily summary" value="07:00 · email" />
          <Row label="Quiet hours" value="22:00 — 06:00" />
        </Card>

        <Card title="Privacy" attrappe={ATTRAPPE}>
          <Row label="Memory access" value="On · editable" />
          <Row label="Cross-module aware" value="On · all 11" />
          <Row label="Share with coaches" value="aggregate only" />
          <Row label="Anonymous learning" value="Opted in" />
        </Card>
      </div>
    </div>
  )
}

// ── Avatar states ────────────────────────────────────────────────────
// [cmd] module-buddy.jsx:394-412.

function BuddyStatesShowcase() {
  return (
    <Card title="Avatar states" sub="5 states reflect what Buddy is doing" attrappe={ATTRAPPE}>
      {/* [cmd] Seit G-56 steht `v2-g-cols-5` in v2.css — vorher war es
          modul-lokal als `v2-buddy-zustaende` nachgebaut. */}
      <div className="v2-grid v2-g-cols-5" style={{ gap: 12 }}>
        {BUDDY_STATES.map(s => (
          <div
            key={s.id}
            style={{
              padding: 16, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, textAlign: 'center',
            }}
          >
            <div style={{ display: 'grid', placeItems: 'center', marginBottom: 10 }}>
              <BuddyOrb state={s.id} size={96} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{s.label}</div>
            <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.45 }}>{s.desc}</div>
          </div>
        ))}
      </div>
      <div className="v2-divider" />
      <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
        Buddy&apos;s state is visible in the right context panel of every module · pulse-animation
        indicates active processing · color shifts when an alert needs attention. Click the orb to
        open this chat.
      </div>
    </Card>
  )
}
