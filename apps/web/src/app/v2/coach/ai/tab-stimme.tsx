'use client'

// Ein Tab: „Voice / Live".
//
// QUELLE: theme-v1/module-buddy-voice.jsx:63-204 (`BuddyVoice`), die
// Daten :4-61. Die Datei hat 206 Zeilen; uebernommen ist alles ausser
// der `Object.assign`-Zeile am Ende, die es hier nicht braucht.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript, jede Konstante und jeder
//      Rueckruf-Parameter getippt; kein `any`.
//   2. Klassen auf `v2-`-Praefix, jede `<table>` in `v2-tbl-wrap`.
//   3. `window.X` -> Importe, `useState` -> `React.useState`,
//      `React.Fragment` -> `React.Fragment` (bleibt, mit Import).
//   4. `color-mix(in srgb, …)` -> `color-mix(in oklch, …)`, wie im
//      ganzen V2-Bestand.
//   5. Zwei Wurzelraster in Klassen mit Haltepunkt (siehe unten).
//   6. Mehrteilige JSX-Textknoten zu einem Template-Literal
//      zusammengezogen — getrennte Ausdruecke wie `{a} · {b}` erzeugen
//      sonst eine Hydration-Meldung. Betrifft fuenf Stellen:
//      `{l.who === "tom" ? "Tom" : "Buddy"} · {l.phase}` (Zeile 122),
//      `set {h.set}` (:147), `{h.weight} × {h.reps}` (:148),
//      `RPE {h.rpe}` (:149) sowie die beiden `sub`-Literale der
//      Kacheln „Session transcript" (:108) und „Offline queue" (:158).
//
// `[cmd]` DIE FUENF KONSTANTEN STEHEN NICHT IN `./daten` — der Kopf von
// `daten.ts:16-19` fuehrt das ausdruecklich so: „die Sitzungsdaten
// (module-buddy-voice.jsx:4-61) in `tab-stimme.tsx`". Gemessen:
// `grep -n "SESSION_PHASES\|GYM_COMMANDS\|SESSION_SCRIPT\|SESSION_STATE\|OFFLINE_QUEUE"`
// ueber `ai/` findet ausserhalb dieser Datei keine Deklaration. Alle
// fuenf stehen deshalb hier, getippt und mit der Quellzeile benannt.
//
// `[cmd]` DIE RASTER: Der Phasenstreifen (:85) ist `v2-buddy-phasen`
// aus buddy.css — waagerecht rollend, wie in der Vorlage; acht Phasen
// mit Pfeilen passen auf keiner Breite nebeneinander. Das Wurzelraster
// der unteren Haelfte (:106, `1.3fr 1fr` ohne Haltepunkt) ist
// `v2-buddy-grid-13`, dieselben zwei Spalten plus den 1100px-Haltepunkt,
// der aus zwei Spalten eine macht — dieselbe Klasse wie in `BuddyClone`.
//
// `[cmd]` `<Icon name="training">` (:72) gibt es in `packages/ui`:
// icons.tsx fuehrt den Namen. Hier war nichts zu ersetzen — anders als
// bei `file`/`shield` in den Nachbardateien.
//
// `[cmd]` DER MUSTERABGLEICH BLEIBT LEBENDIG. Er ist das einzige Stueck
// echter Logik des Moduls (SPEC_04 F6, „kein Sprachmodell im Studio"):
// die neun Muster stehen unveraendert, samt der doppelten Maskierung
// (`\\d`, `\\s`) und der `ä`-Fluchtform in „naechste". In einer
// TS-Zeichenkette ergibt `'\\d'` genau ein `\d` fuer den `RegExp` —
// dieselbe Zeichenkette wie in der Vorlage. Geprueft am Verhalten:
// „fertig" trifft `set_complete`, „rpe 8" trifft `log_rpe`.
//
// Lebendig bleibt ausserdem, was in der Vorlage lebendig ist: die acht
// Phasenknoepfe (`phase`) und das Testfeld (`test`). Tot bleibt, was
// dort tot ist.
//
// `[cmd]` KEINE HYDRATIONSFALLE: null `Math.random()`, null
// `Date.now()`, null `new Date()`, null `Math.sin`. Jede Zahl steht
// fest.
//
// `[cmd]` ALLES IST ATTRAPPE. Ein Buddy-Schema gibt es nicht.
import * as React from 'react'
import { Card, Pill, Icon, Row } from '@lumeos/ui'

import { ATTRAPPE } from './ansicht'

// ═══ DATEN ═══════════════════════════════════════════════════════
// [cmd] module-buddy-voice.jsx:4-61, 1:1 uebernommen.

export type SessionPhase = { id: string; label: string; desc: string }

/** [cmd] module-buddy-voice.jsx:4-13 — acht Phasen. */
const SESSION_PHASES: SessionPhase[] = [
  { id: 'IDLE', label: 'Idle', desc: 'Waiting for the hotword or a tap' },
  { id: 'SESSION_START', label: 'Session start', desc: 'Routine loaded · energy check 1–5' },
  { id: 'EXERCISE_INTRO', label: 'Exercise intro', desc: "Names the lift and last week's numbers" },
  { id: 'SET_ACTIVE', label: 'Set active', desc: 'Silent — cues only on the last two reps' },
  { id: 'SET_COMPLETE', label: 'Set complete', desc: 'Asks weight, then reps, then logs' },
  { id: 'REST', label: 'Rest', desc: 'Timer running · accepts extend / skip' },
  { id: 'SESSION_COMPLETE', label: 'Session complete', desc: 'Volume, PRs, duration' },
  { id: 'SUMMARY', label: 'Summary', desc: 'Written back to Training · rating asked' },
]

export type GymCommand = { intent: string; pattern: string; ex: string; emits: string }

/**
 * [cmd] module-buddy-voice.jsx:16-26 — neun Muster, Zeichen fuer
 * Zeichen wie dort. Musterabgleich statt Sprachmodell (F6): die
 * doppelte Maskierung (`\\d`, `\\s`, `\\+`) und die `ä`-Fluchtform
 * bleiben stehen, damit der `RegExp` dieselbe Zeichenkette sieht.
 */
const GYM_COMMANDS: GymCommand[] = [
  { intent: 'set_complete', pattern: '^(fertig|done|set|gemacht)$', ex: 'fertig', emits: 'SET_COMPLETE' },
  { intent: 'log_weight', pattern: '^(\\d+(?:\\.\\d+)?)\\s*(kilo|kg|pfund|pounds?)$', ex: '117,5 kilo', emits: 'weight = 117.5' },
  { intent: 'log_reps', pattern: '^(\\d+)\\s*(reps?|wiederholungen?|mal)$', ex: 'elf reps', emits: 'reps = 11' },
  { intent: 'log_rpe', pattern: '^rpe\\s*([1-9]|10)$', ex: 'rpe 8', emits: 'rpe = 8' },
  { intent: 'log_rpe', pattern: '^war\\s*(sehr\\s*)?(schwer|hart)$', ex: 'war schwer', emits: 'rpe = 9' },
  { intent: 'log_rpe', pattern: '^war\\s*(leicht|easy)$', ex: 'war leicht', emits: 'rpe = 5' },
  { intent: 'next_exercise', pattern: '^(nächste?|next|weiter|skip)$', ex: 'weiter', emits: 'EXERCISE_INTRO' },
  { intent: 'pause_session', pattern: '^(pause|stop|halt)$', ex: 'pause', emits: 'paused' },
  { intent: 'extend_rest', pattern: '^(mehr\\s*zeit|more\\s*time|\\+\\d+)$', ex: 'mehr zeit', emits: 'rest + 30 s' },
]

export type ScriptWho = 'buddy' | 'tom' | 'sys'
export type ScriptLine = { phase: string; who: ScriptWho; text: string }

/** [cmd] module-buddy-voice.jsx:28-44 — fuenfzehn Zeilen. */
const SESSION_SCRIPT: ScriptLine[] = [
  { phase: 'SESSION_START', who: 'buddy', text: 'Pull Day, five exercises. Last week you hit 85 % of the target reps. Today we aim for 90. Energy check — one to five?' },
  { phase: 'SESSION_START', who: 'tom', text: 'four' },
  { phase: 'SESSION_START', who: 'buddy', text: "Four out of five — full plan. Let's go." },
  { phase: 'EXERCISE_INTRO', who: 'buddy', text: 'First up: pull-ups. Last week four sets — ten, nine, eight, seven. Today keep every set above eight.' },
  { phase: 'SET_ACTIVE', who: 'sys', text: '[silence during the set]' },
  { phase: 'SET_ACTIVE', who: 'buddy', text: 'Two more! Come on! And again — strong!' },
  { phase: 'SET_COMPLETE', who: 'tom', text: 'fertig' },
  { phase: 'SET_COMPLETE', who: 'buddy', text: 'Weight?' },
  { phase: 'SET_COMPLETE', who: 'tom', text: 'bodyweight' },
  { phase: 'SET_COMPLETE', who: 'buddy', text: 'Reps?' },
  { phase: 'SET_COMPLETE', who: 'tom', text: 'eleven' },
  { phase: 'SET_COMPLETE', who: 'buddy', text: "Eleven reps — that's a PR. Logged. Ninety seconds." },
  { phase: 'REST', who: 'sys', text: "[timer 01:30 · say 'mehr zeit' for +30 s]" },
  { phase: 'SESSION_COMPLETE', who: 'buddy', text: 'Session done. Forty-two minutes, twenty sets, two PRs. Total volume 9,840 kg — eight per cent above last week.' },
  { phase: 'SUMMARY', who: 'buddy', text: 'How was it?' },
]

/** `[cmd]` `weight` ist eine Zeichenkette (`"BW"`, `"82.5 kg"`), :50-52. */
export type SessionHistoryRow = {
  ex: string
  set: number
  weight: string
  reps: number
  rpe: number
  pr: boolean
}

export type WorkoutSessionState = {
  sessionId: string
  routine: string
  exercise: number
  exercises: number
  set: number
  sets: number
  energy: number
  restSeconds: number
  elapsed: string
  history: SessionHistoryRow[]
}

/** [cmd] module-buddy-voice.jsx:46-54 — `WorkoutSessionState`. */
const SESSION_STATE: WorkoutSessionState = {
  sessionId: 'WS-2026-05-16-01', routine: 'Pull Day', exercise: 1, exercises: 5,
  set: 2, sets: 4, energy: 4, restSeconds: 90, elapsed: '04:18',
  history: [
    { ex: 'Pull-up', set: 1, weight: 'BW', reps: 11, rpe: 8, pr: true },
    { ex: 'Pull-up', set: 2, weight: 'BW', reps: 10, rpe: 8, pr: false },
    { ex: 'Barbell Row', set: 1, weight: '82.5 kg', reps: 8, rpe: 7, pr: false },
  ],
}

export type QueueOp = { at: string; op: string; payload: string; synced: boolean }

/** [cmd] module-buddy-voice.jsx:56-61 — vier Eintraege, drei offen. */
const OFFLINE_QUEUE: QueueOp[] = [
  { at: '18:42:11', op: 'log_set', payload: 'Pull-up · BW × 11 · RPE 8', synced: false },
  { at: '18:44:02', op: 'log_set', payload: 'Pull-up · BW × 10 · RPE 8', synced: false },
  { at: '18:48:30', op: 'log_set', payload: 'Row · 82.5 × 8 · RPE 7', synced: false },
  { at: '18:39:00', op: 'session_start', payload: 'Pull Day · energy 4', synced: true },
]

// ═══ TAB · VOICE / LIVE ══════════════════════════════════════════
// [cmd] module-buddy-voice.jsx:63-204.
export function BuddyVoice() {
  const [phase, setPhase] = React.useState('SET_COMPLETE')
  const [test, setTest] = React.useState('')

  // [cmd] Vorlage :66-67, unveraendert — der eine lebendige Abgleich.
  const match = GYM_COMMANDS.find(
    (c: GymCommand) => new RegExp(c.pattern, 'i').test(test.trim().toLowerCase()),
  )
  const idx = SESSION_PHASES.findIndex((p: SessionPhase) => p.id === phase)
  // [cmd] Vorlage :102 schreibt `SESSION_PHASES[idx].desc` ohne
  // Absicherung; in TypeScript braucht es den Rueckfall.
  const aktuell = SESSION_PHASES[idx]

  const offen = OFFLINE_QUEUE.filter((o: QueueOp) => !o.synced).length

  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      {/* Banner — module-buddy-voice.jsx:71-81. */}
      <div
        style={{
          display: 'flex', gap: 12, padding: 14,
          background: 'color-mix(in oklch, var(--acc-buddy) 5%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--acc-buddy) 22%, var(--border))',
          borderRadius: 8,
        }}
      >
        <Icon name="training" className="v2-ic" style={{ color: 'var(--acc-buddy)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Voice in the gym</div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            No language model runs during a session — gym commands are matched against fixed patterns on device, so logging a set
            works with the phone in your pocket and no signal. Speech-to-text is Whisper.cpp, local.
          </div>
        </div>
        <Pill variant="acc">Pro tier</Pill>
      </div>

      {/* Zustandsmaschine — module-buddy-voice.jsx:84-104. */}
      <Card title="Session state machine" sub="click a phase to inspect it" attrappe={ATTRAPPE}>
        <div className="v2-buddy-phasen">
          {SESSION_PHASES.map((p: SessionPhase, i: number) => (
            <React.Fragment key={p.id}>
              <button
                onClick={() => setPhase(p.id)}
                style={{
                  flexShrink: 0, padding: '9px 12px', borderRadius: 6, cursor: 'pointer',
                  textAlign: 'left', minWidth: 128,
                  background: phase === p.id
                    ? 'color-mix(in oklch, var(--acc-buddy) 14%, var(--surface))'
                    : 'var(--surface)',
                  border: `1px solid ${phase === p.id
                    ? 'color-mix(in oklch, var(--acc-buddy) 40%, var(--border))'
                    : 'var(--border)'}`,
                }}
              >
                <div className="v2-mono" style={{ fontSize: 9.5, color: 'var(--fg-dim)', marginBottom: 3 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div
                  style={{
                    fontSize: 11.5, fontWeight: 600,
                    color: phase === p.id ? 'var(--acc-buddy)' : 'var(--fg)',
                  }}
                >
                  {p.label}
                </div>
              </button>
              {i < SESSION_PHASES.length - 1 && (
                <div style={{ alignSelf: 'center', color: 'var(--fg-dim)', fontSize: 11 }}>→</div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 6 }}>
          <div className="v2-mono" style={{ fontSize: 10.5, color: 'var(--acc-buddy)', marginBottom: 4 }}>{phase}</div>
          <div style={{ fontSize: 12.5 }}>{aktuell?.desc ?? ''}</div>
        </div>
      </Card>

      {/* [cmd] Vorlage :106 — `grid` mit `1.3fr 1fr`, ohne Haltepunkt. */}
      <div className="v2-buddy-grid-13">
        {/* Mitschrift — module-buddy-voice.jsx:108-129. */}
        <Card
          title="Session transcript"
          sub={`${SESSION_STATE.routine} · exercise ${SESSION_STATE.exercise} of ${SESSION_STATE.exercises} · ${SESSION_STATE.elapsed}`}
          attrappe={ATTRAPPE}
        >
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {SESSION_SCRIPT.map((l: ScriptLine, i: number) => {
              const isPhase = l.phase === phase
              if (l.who === 'sys') {
                return (
                  <div
                    key={i}
                    className="v2-dim"
                    style={{ fontSize: 11, fontStyle: 'italic', padding: '4px 10px', opacity: isPhase ? 1 : 0.45 }}
                  >
                    {l.text}
                  </div>
                )
              }
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: l.who === 'tom' ? 'flex-end' : 'flex-start',
                    opacity: isPhase ? 1 : 0.45,
                  }}
                >
                  <div
                    style={{
                      maxWidth: '78%', padding: '8px 12px', borderRadius: 9,
                      fontSize: 12.5, lineHeight: 1.5,
                      background: l.who === 'tom'
                        ? 'color-mix(in oklch, var(--acc-buddy) 16%, var(--surface))'
                        : 'var(--surface)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div className="v2-dim v2-mono" style={{ fontSize: 9, marginBottom: 2 }}>
                      {`${l.who === 'tom' ? 'Tom' : 'Buddy'} · ${l.phase}`}
                    </div>
                    {l.text}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          {/* Lebendiger Zustand — module-buddy-voice.jsx:133-155. */}
          <Card title="Live state" sub="WorkoutSessionState" attrappe={ATTRAPPE}>
            <Row label="Session" value={SESSION_STATE.sessionId} />
            <Row label="Phase" value={phase} />
            <Row label="Exercise" value={`${SESSION_STATE.exercise} / ${SESSION_STATE.exercises}`} />
            <Row label="Set" value={`${SESSION_STATE.set} / ${SESSION_STATE.sets}`} />
            <Row label="Energy check" value={`${SESSION_STATE.energy} / 5`} />
            <Row label="Rest target" value={`${SESSION_STATE.restSeconds} s`} />
            <div className="v2-divider" />
            <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Logged this session</div>
            {/* [cmd] Vorlage :142 — ohne `<thead>`. Bleibt ohne. */}
            <div className="v2-tbl-wrap">
              <table className="v2-tbl">
                <tbody>
                  {SESSION_STATE.history.map((h: SessionHistoryRow, i: number) => (
                    <tr key={i}>
                      <td style={{ fontSize: 11.5 }}>{h.ex}</td>
                      <td className="v2-num v2-muted" style={{ fontSize: 11 }}>{`set ${h.set}`}</td>
                      <td className="v2-num" style={{ fontSize: 11 }}>{`${h.weight} × ${h.reps}`}</td>
                      <td className="v2-num v2-muted" style={{ fontSize: 11 }}>{`RPE ${h.rpe}`}</td>
                      <td>{h.pr && <Pill variant="pos" style={{ fontSize: 9 }}>PR</Pill>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Warteschlange — module-buddy-voice.jsx:158-173. */}
          <Card title="Offline queue" sub={`${offen} pending · IndexedDB`} attrappe={ATTRAPPE}>
            <div className="v2-col-gap" style={{ gap: 4 }}>
              {OFFLINE_QUEUE.map((o: QueueOp, i: number) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 5, fontSize: 11,
                  }}
                >
                  <span
                    style={{
                      width: 6, height: 6, borderRadius: 999,
                      background: o.synced ? 'var(--pos)' : 'var(--warn)',
                    }}
                  />
                  <span className="v2-num v2-dim" style={{ fontSize: 10, width: 58 }}>{o.at}</span>
                  <span className="v2-mono" style={{ fontSize: 10, width: 92, color: 'var(--fg-muted)' }}>{o.op}</span>
                  <span className="v2-muted" style={{ flex: 1, fontSize: 11 }}>{o.payload}</span>
                </div>
              ))}
            </div>
            <div className="v2-divider" />
            <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
              Sets are written locally first and pushed when the connection returns. The session never waits for the network.
            </div>
          </Card>
        </div>
      </div>

      {/* Musterabgleich — module-buddy-voice.jsx:178-201. Lebendig. */}
      <Card title="Command parser" sub="regex on device · type something to test it" attrappe={ATTRAPPE}>
        <input
          value={test}
          onChange={e => setTest(e.target.value)}
          placeholder={'try "fertig", "117,5 kilo", "elf reps", "war schwer", "mehr zeit"'}
          aria-label="Test a gym command"
          style={{
            width: '100%', height: 34, background: 'var(--surface)',
            border: `1px solid ${test
              ? (match
                ? 'color-mix(in oklch, var(--pos) 40%, var(--border))'
                : 'color-mix(in oklch, var(--neg) 40%, var(--border))')
              : 'var(--border)'}`,
            borderRadius: 7, padding: '0 12px', fontSize: 13,
            fontFamily: 'var(--font-mono)', marginBottom: 10,
          }}
        />
        {test && (
          <div
            style={{
              padding: 10,
              background: match
                ? 'color-mix(in oklch, var(--pos) 6%, var(--surface))'
                : 'color-mix(in oklch, var(--neg) 6%, var(--surface))',
              border: `1px solid ${match
                ? 'color-mix(in oklch, var(--pos) 25%, var(--border))'
                : 'color-mix(in oklch, var(--neg) 25%, var(--border))'}`,
              borderRadius: 6, marginBottom: 12, fontSize: 12,
            }}
          >
            {match
              ? (
                <>
                  <span className="v2-mono" style={{ color: 'var(--pos)' }}>{match.intent}</span>
                  {' '}
                  <span className="v2-dim">→</span>
                  {' '}
                  <span className="v2-mono">{match.emits}</span>
                </>
              )
              : <span style={{ color: 'var(--neg)' }}>No pattern matched — Buddy would ask you to repeat.</span>}
          </div>
        )}
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th style={{ width: 130 }}>Intent</th>
                <th>Pattern</th>
                <th style={{ width: 130 }}>Example</th>
                <th style={{ width: 150 }}>Emits</th>
              </tr>
            </thead>
            <tbody>
              {GYM_COMMANDS.map((c: GymCommand, i: number) => (
                <tr
                  key={i}
                  style={match === c ? { background: 'color-mix(in oklch, var(--pos) 7%, transparent)' } : undefined}
                >
                  <td className="v2-mono" style={{ fontSize: 11, color: 'var(--acc-buddy)' }}>{c.intent}</td>
                  <td className="v2-mono v2-muted" style={{ fontSize: 10 }}>{c.pattern}</td>
                  <td className="v2-muted" style={{ fontSize: 11, fontStyle: 'italic' }}>{`“${c.ex}”`}</td>
                  <td className="v2-mono" style={{ fontSize: 10.5 }}>{c.emits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
