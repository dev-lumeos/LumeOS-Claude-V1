'use client'

// Zwei Bausteine der Vorlage: die Beziehungskarte einer Trainerin und
// der fuenfschrittige Onboarding-Assistent.
//
// QUELLE: theme-v1/module-coach-meta.jsx:23-75 (`CoachRelationshipCard`),
// :77-147 (`ONBOARD_STEPS` und `CoachOnboardingWizard`).
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript, jede Requisite getippt; kein `any`.
//   2. Klassen auf `v2-`-Praefix.
//   3. `COACH_META`, `ASSIGNMENT_DESC`, `STYLE_DESC`, `ROLE_LABEL` und
//      `ONBOARD_STEPS` -> Import aus `./daten` (siehe unten).
//   4. `color-mix(in srgb, …)` -> `in oklch`, wie in jeder V2-Datei.
//   5. Der Schrittbalken traegt `v2-coach-schritte` aus `coach.css`
//      statt eines handgeschriebenen `display:flex` — nur dort haengt
//      der 1100px-Haltepunkt (siehe unten).
//   6. Mehrteilige JSX-Textknoten zu einem Template-Literal
//      zusammengezogen — getrennte Ausdruecke wie `{a} · {b}` erzeugen
//      sonst eine Hydration-Meldung.
//
// `[cmd]` `COACH_META` und die drei Beschreibungstabellen (Zeilen 4-21)
// stehen hier nicht noch einmal: Die Vorlage laeuft als Sammlung von
// Skripten in einem Browser, die sich ueber den gemeinsamen Modulraum
// sehen. Dieselben Tabellen liegen in `daten.ts` — derselbe Inhalt,
// dieselben Zahlen, nur importiert statt global.
//
// `[cmd]` DIE HAKENREIHENFOLGE DER VORLAGE BLEIBT: `const m =
// COACH_META[coach.id]` steht **vor** `useState`, das `if (!m) return
// null` **danach** (Vorlage Zeilen 24-26). Das ist kein Zufall und wird
// nicht „aufgeraeumt": Zoege man den fruehen Ausstieg vor den `useState`,
// liefe der Haken nur bedingt — React zaehlt Haken pro Aufruf, und ein
// uebersprungener Haken bricht die Reihenfolge beim naechsten Rendern.
// So wie es dasteht, laeuft `useState` immer.
//
// `[cmd]` EIN TOTER ZWEIG, 1:1 uebernommen: Der Symbolfarbtest der
// Detailzeilen lautet `step > s.n` (Vorlage Zeile 133). Da `s =
// ONBOARD_STEPS[step - 1]` gilt, ist `s.n === step` immer wahr — die
// Bedingung ist damit dauerhaft falsch, die Haken bleiben stets
// `--fg-dim`. Nicht korrigiert: Die Vorlage ist die Vorgabe, und eine
// stille Farbaenderung waere eine Gestaltungsentscheidung, keine
// Uebersetzung. Gemeldet, nicht behoben.
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst. Die lebenden Knoepfe bleiben lebendig — fuenf
// Schritte, Zurueck/Weiter, fuenf Sterne.
//
// `[cmd]` ALLES IST ATTRAPPE. Ein `coach`-Schema gibt es nicht.
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import {
  ASSIGNMENT_DESC, COACH_META, ONBOARD_STEPS, ROLE_LABEL, STYLE_DESC,
  type Coach,
} from './daten'
import { ATTRAPPE } from './ansicht'

// ═══ BEZIEHUNGSKARTE ═════════════════════════════════════════════
// [cmd] module-coach-meta.jsx:23-75.
export function CoachRelationshipCard({ coach }: { coach: Coach }) {
  // [cmd] Reihenfolge wie in der Vorlage: Nachschlagen, dann `useState`,
  // dann erst der Ausstieg. So bleibt der Haken unbedingt.
  const m = COACH_META[coach.id]
  const [rating, setRating] = React.useState<number>(m?.rated ?? 0)
  if (!m) return null

  return (
    <div className="v2-col-gap" style={{ gap: 12 }}>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 10 }}>
        <Card className="v2-card-tight" style={{ padding: 12 }} attrappe={ATTRAPPE}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Assignment</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, textTransform: 'capitalize' }}>
            {m.assignment}
          </div>
          <div className="v2-muted" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
            {ASSIGNMENT_DESC[m.assignment]}
          </div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }} attrappe={ATTRAPPE}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Coaching style</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{m.style.replace('_', '-')}</div>
          <div className="v2-muted" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
            {STYLE_DESC[m.style]}
          </div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }} attrappe={ATTRAPPE}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Role &amp; roster</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{ROLE_LABEL[m.role]}</div>
          <div className="v2-muted v2-mono" style={{ fontSize: 10.5 }}>
            {`${m.current} of ${m.maxClients} clients · ${m.years} yr`}
          </div>
        </Card>
      </div>

      <Card className="v2-card-tight" style={{ padding: 12 }} attrappe={ATTRAPPE}>
        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Certifications</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {m.certs.map(c => <Pill key={c}>{c}</Pill>)}
        </div>
      </Card>

      <Card className="v2-card-tight" style={{ padding: 12 }} attrappe={ATTRAPPE}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Your rating</div>
            <div className="v2-muted" style={{ fontSize: 11 }}>
              Only aggregated averages are shown to the coach.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                aria-label={`${n} stars`}
                onClick={() => setRating(n)}
                style={{
                  width: 26, height: 26, borderRadius: 5, cursor: 'pointer',
                  background: n <= rating
                    ? 'color-mix(in oklch, var(--acc-goals) 20%, transparent)'
                    : 'var(--surface-2)',
                  border: `1px solid ${n <= rating
                    ? 'color-mix(in oklch, var(--acc-goals) 40%, var(--border))'
                    : 'var(--border)'}`,
                  color: n <= rating ? 'var(--acc-goals)' : 'var(--fg-dim)',
                  fontSize: 13,
                }}
              >
                ★
              </button>
            ))}
          </div>
          <span className="v2-num" style={{ width: 28, textAlign: 'right', fontSize: 13 }}>
            {`${rating}.0`}
          </span>
        </div>
      </Card>
    </div>
  )
}

// ═══ TAB · ONBOARDING ════════════════════════════════════════════
// [cmd] module-coach-meta.jsx:91-147. Fuenf Schritte, SPEC_05 §1.
export function CoachOnboardingWizard() {
  const [step, setStep] = React.useState(2)
  const s = ONBOARD_STEPS[step - 1]

  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      {/* Kopfzeile — module-coach-meta.jsx:96-104. */}
      <div
        style={{
          display: 'flex', gap: 12, padding: 14,
          background: 'color-mix(in oklch, var(--acc-coach) 5%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--acc-coach) 22%, var(--border))',
          borderRadius: 8,
        }}
      >
        <Icon name="user" className="v2-ic" style={{ color: 'var(--acc-coach)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Starting with a new coach</div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Thirty to sixty minutes, once. Nothing is written to your modules until you accept each proposal in step three.
          </div>
        </div>
      </div>

      <Card attrappe={ATTRAPPE}>
        {/* Schrittbalken — module-coach-meta.jsx:107-125. `v2-coach-schritte`
            traegt den 1100px-Haltepunkt aus coach.css. */}
        <div className="v2-coach-schritte">
          {ONBOARD_STEPS.map(x => (
            <React.Fragment key={x.n}>
              <button
                onClick={() => setStep(x.n)}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: 6, cursor: 'pointer', textAlign: 'left',
                  background: step === x.n
                    ? 'color-mix(in oklch, var(--acc-coach) 12%, var(--surface))'
                    : x.n < step
                      ? 'color-mix(in oklch, var(--pos) 6%, var(--surface))'
                      : 'var(--surface)',
                  border: `1px solid ${step === x.n
                    ? 'color-mix(in oklch, var(--acc-coach) 38%, var(--border))'
                    : 'var(--border)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <div
                    style={{
                      width: 18, height: 18, borderRadius: 999, display: 'grid', placeItems: 'center',
                      fontSize: 9.5, fontWeight: 600,
                      background: x.n < step ? 'var(--pos)' : step === x.n ? 'var(--acc-coach)' : 'var(--surface-2)',
                      color: x.n <= step ? 'var(--bg)' : 'var(--fg-dim)',
                    }}
                  >
                    {x.n < step ? '✓' : x.n}
                  </div>
                  <span
                    style={{
                      fontSize: 11.5, fontWeight: 600,
                      color: step === x.n ? 'var(--acc-coach)' : 'var(--fg)',
                    }}
                  >
                    {x.title}
                  </span>
                </div>
              </button>
              {x.n < 5 && <div style={{ alignSelf: 'center', color: 'var(--fg-dim)', fontSize: 11 }}>→</div>}
            </React.Fragment>
          ))}
        </div>

        {/* Der gewaehlte Schritt — module-coach-meta.jsx:127-138. */}
        <div style={{ padding: 16, background: 'var(--surface-2)', borderRadius: 7 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{`Step ${s.n} · ${s.title}`}</div>
          <div className="v2-muted" style={{ fontSize: 12.5, lineHeight: 1.55, marginBottom: 12 }}>{s.desc}</div>
          <div className="v2-col-gap" style={{ gap: 5 }}>
            {s.detail.map((d, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 5, fontSize: 11.5,
                }}
              >
                {/* [cmd] `step > s.n` ist nie wahr — s ist immer der aktuelle
                    Schritt. Toter Zweig der Vorlage, absichtlich stehen
                    gelassen; siehe Kopf der Datei. */}
                <Icon name="check" className="v2-ic v2-ic-sm" style={{ color: step > s.n ? 'var(--pos)' : 'var(--fg-dim)' }} />
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation — module-coach-meta.jsx:140-143. */}
        <div style={{ display: 'flex', gap: 6, marginTop: 14, justifyContent: 'flex-end' }}>
          <button
            className="v2-btn v2-btn-ghost"
            disabled={step === 1}
            onClick={() => setStep(x => Math.max(1, x - 1))}
          >
            Back
          </button>
          <button
            className="v2-btn v2-btn-primary"
            disabled={step === 5}
            onClick={() => setStep(x => Math.min(5, x + 1))}
          >
            Next step →
          </button>
        </div>
      </Card>
    </div>
  )
}
