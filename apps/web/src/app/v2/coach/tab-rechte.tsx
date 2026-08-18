'use client'

// Zwei Tabs: „Permissions" und „Proposals".
//
// QUELLE: theme-v1/module-coach-athlete.jsx:143-262 (`AthletePermissionsV2`),
// :265-312 (`AthleteProposals`), :314-338 (`ProposalCard`),
// :340-394 (`ProposalModal`).
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript, jede Requisite und jeder Zustand
//      getippt; kein `any`.
//   2. Klassen auf `v2-`-Praefix, jede `<table>` in `v2-tbl-wrap`.
//   3. `window.COACHES` -> Import aus `./daten` (siehe unten).
//   4. `Empty` -> `Leer` aus `./bausteine`.
//   5. Icon `shield` -> `admin` (siehe unten).
//   6. `<Pill variant="block">` -> `variant="neg"` (siehe unten).
//   7. Mehrteilige JSX-Textknoten zu einem Template-Literal
//      zusammengezogen — getrennte Ausdruecke wie `{a} · {b}` erzeugen
//      sonst eine Hydration-Meldung.
//
// `[cmd]` `window.COACHES` (Zeile 146) gibt es hier nicht: Die Vorlage
// laeuft als Sammlung von Skripten in einem Browser, die sich ueber
// `window` sehen. `COACHES` steht in `daten.ts` und wird importiert —
// dieselbe Liste, derselbe Inhalt, nur ohne den globalen Umweg. Der
// Rueckfall `|| []` der Vorlage entfaellt damit; ein Import ist immer da.
//
// `[cmd]` `<Icon name="shield">` (Zeile 152) gibt es in `packages/ui`
// nicht — `icons.tsx` fuehrt den Namen nicht. Genommen ist `admin`
// (icons.tsx:41), dessen Pfad genau ein Schild zeichnet. Der Auftrag
// G-40 sperrt `packages/ui/`; gemeldet ist es im Bericht.
//
// `[cmd]` `<Pill variant="block">` (Zeilen 253, 302) gibt es nicht —
// `PillVariant` in primitives.tsx:80 kennt `pos | warn | neg | acc`.
// Abgebildet auf `neg`; das ist in beiden Faellen die Bedeutung
// („revoked", „declined").
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst. Knoepfe, die in der Vorlage kein `onClick`
// tragen, bleiben ohne — sie stehen da und tun nichts, genau wie dort.
//
// `[cmd]` ALLES IST ATTRAPPE. Ein `coach`-Schema gibt es nicht.
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import { Leer } from './bausteine'
import {
  ACCESS_LEVELS, COACHES, CONSENT_LOG, LEVEL_COLOR, PERM_EXPIRY,
  PERM_GRANTS, PERM_MODULES, PROPOSALS,
  type Grants, type Proposal,
} from './daten'
import { ATTRAPPE } from './ansicht'

// ═══ TAB · PERMISSIONS ═══════════════════════════════════════════
// [cmd] module-coach-athlete.jsx:143-262.
export function AthletePermissionsV2() {
  const [grants, setGrants] = React.useState<Grants>(PERM_GRANTS)
  const set = (coachId: string, mod: string, val: string) =>
    setGrants(g => ({ ...g, [coachId]: { ...g[coachId], [mod]: val } }))
  const coaches = COACHES

  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      {/* Contract banner — module-coach-athlete.jsx:150-160. */}
      <div
        style={{
          display: 'flex', gap: 12, padding: 14,
          background: 'color-mix(in oklch, var(--acc-coach) 5%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--acc-coach) 22%, var(--border))',
          borderRadius: 8,
        }}
      >
        <Icon name="admin" className="v2-ic" style={{ color: 'var(--acc-coach)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>You own your data</div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Coaches read only what you release, and they can never write to your modules — every plan arrives as a proposal you confirm.
            Grants are recorded with a timestamp and revocable at any time.
          </div>
        </div>
      </div>

      {/* Access level legend — module-coach-athlete.jsx:162-173. */}
      <div style={{ display: 'flex', gap: 8 }}>
        {ACCESS_LEVELS.map(l => (
          <div
            key={l.key}
            style={{
              flex: 1, padding: 10, background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span className="v2-dot" style={{ background: LEVEL_COLOR[l.key], width: 7, height: 7 }} />
              <span className="v2-mono" style={{ fontSize: 11.5, fontWeight: 600 }}>{l.label}</span>
            </div>
            <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.45 }}>{l.desc}</div>
          </div>
        ))}
      </div>

      {/* The matrix — module-coach-athlete.jsx:175-235. */}
      <Card
        title="Permission matrix"
        sub="7 modules × your coaches · you are the only one who can change these"
        attrappe={ATTRAPPE}
      >
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th style={{ width: 200 }}>Module</th>
                <th style={{ width: 80 }}>Default</th>
                {coaches.map(c => (
                  <th key={c.id} style={{ width: 120 }}>
                    {c.name.split(' ').slice(-1)[0]}
                    <br /><span className="v2-dim v2-mono" style={{ fontSize: 9 }}>{c.type}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERM_MODULES.map(m => (
                <tr key={m.key}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12.5 }}>{m.label}</span>
                      {m.sensitive && (
                        <Pill
                          style={{
                            fontSize: 9, color: 'var(--warn)',
                            borderColor: 'color-mix(in oklch, var(--warn) 30%, var(--border))',
                          }}
                        >
                          sensitive
                        </Pill>
                      )}
                    </div>
                    {m.note && <div className="v2-dim" style={{ fontSize: 10, marginTop: 2 }}>{m.note}</div>}
                  </td>
                  <td>
                    <span className="v2-mono" style={{ fontSize: 10.5, color: LEVEL_COLOR[m.def] }}>{m.def}</span>
                  </td>
                  {coaches.map(c => {
                    const val = grants[c.id]?.[m.key] ?? 'none'
                    const exp = PERM_EXPIRY[c.id]?.[m.key]
                    return (
                      <td key={c.id}>
                        <select
                          value={val}
                          aria-label={`${m.label} · ${c.name}`}
                          onChange={e => set(c.id, m.key, e.target.value)}
                          style={{
                            width: '100%', height: 24, fontSize: 11, padding: '0 6px', borderRadius: 5,
                            background: 'var(--surface)',
                            border: `1px solid ${val === 'none' ? 'var(--border)' : `color-mix(in oklch, ${LEVEL_COLOR[val]} 35%, var(--border))`}`,
                            color: LEVEL_COLOR[val],
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {ACCESS_LEVELS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
                        </select>
                        {exp && (
                          <div className="v2-dim v2-mono" style={{ fontSize: 9, marginTop: 2 }}>
                            {`expires ${exp}`}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="v2-divider" />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className="v2-btn v2-btn-primary">
            <Icon name="check" className="v2-ic v2-ic-sm" />
            Save grants
          </button>
          <button className="v2-btn v2-btn-ghost">Reset to defaults</button>
          <div className="v2-spacer" />
          <span className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>every change writes a consent-log entry</span>
        </div>
      </Card>

      {/* Consent log — module-coach-athlete.jsx:237-259. */}
      <Card
        title="Consent log"
        sub={`${CONSENT_LOG.length} entries · GDPR record of every grant and revocation`}
        attrappe={ATTRAPPE}
        actions={(
          <button className="v2-btn v2-btn-ghost v2-btn-sm">
            <Icon name="download" className="v2-ic v2-ic-sm" />
            Export
          </button>
        )}
      >
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th style={{ width: 140 }}>When</th>
                <th style={{ width: 160 }}>Coach</th>
                <th style={{ width: 120 }}>Module</th>
                <th style={{ width: 150 }}>Change</th>
                <th style={{ width: 90 }}>Action</th>
                <th>Granted by</th>
              </tr>
            </thead>
            <tbody>
              {CONSENT_LOG.map((e, i) => (
                <tr key={i}>
                  <td className="v2-num v2-muted" style={{ fontSize: 11 }}>{e.ts}</td>
                  <td>{e.coach}</td>
                  <td className="v2-mono" style={{ fontSize: 11 }}>{e.module}</td>
                  <td className="v2-mono" style={{ fontSize: 11 }}>
                    <span style={{ color: LEVEL_COLOR[e.from] }}>{e.from}</span>
                    <span className="v2-dim"> → </span>
                    <span style={{ color: LEVEL_COLOR[e.to] }}>{e.to}</span>
                  </td>
                  <td><Pill variant={e.action === 'granted' ? 'pos' : 'neg'}>{e.action}</Pill></td>
                  <td className="v2-muted" style={{ fontSize: 11.5 }}>{e.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ═══ TAB · PROPOSALS ═════════════════════════════════════════════
// [cmd] module-coach-athlete.jsx:265-312. „Proposal inbox".
export function AthleteProposals() {
  const [sel, setSel] = React.useState<Proposal | null>(null)
  const pending = PROPOSALS.filter(p => p.status === 'pending')
  const decided = PROPOSALS.filter(p => p.status !== 'pending')

  return (
    <>
      <div
        style={{
          display: 'flex', gap: 12, padding: 14,
          background: 'color-mix(in oklch, var(--acc-coach) 5%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--acc-coach) 22%, var(--border))',
          borderRadius: 8, marginBottom: 14,
        }}
      >
        <Icon name="edit" className="v2-ic" style={{ color: 'var(--acc-coach)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Coaches propose — you decide</div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Nothing your coach sends changes a module until you accept it here. Declining is free and needs no reason.
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="v2-num" style={{ fontSize: 20, color: 'var(--warn)' }}>{pending.length}</div>
          <div className="v2-dim" style={{ fontSize: 10 }}>awaiting you</div>
        </div>
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Pending</div>
      <div className="v2-col-gap" style={{ gap: 8, marginBottom: 16 }}>
        {pending.map(p => <ProposalCard key={p.id} p={p} onOpen={() => setSel(p)} />)}
        {pending.length === 0 && (
          <Leer title="Nothing to review" sub="Your coaches have no open proposals." icon="check" />
        )}
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Decided</div>
      <Card attrappe={ATTRAPPE}>
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Proposal</th>
                <th style={{ width: 150 }}>Coach</th>
                <th style={{ width: 110 }}>Decided</th>
                <th style={{ width: 100 }}>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {decided.map(p => (
                <tr key={p.id} className="v2-clickable" style={{ cursor: 'pointer' }} onClick={() => setSel(p)}>
                  <td className="v2-num">{p.id}</td>
                  <td>{p.title}</td>
                  <td className="v2-muted">{p.coach}</td>
                  <td className="v2-num v2-muted">{p.decidedOn}</td>
                  <td><Pill variant={p.status === 'accepted' ? 'pos' : 'neg'}>{p.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {sel && <ProposalModal p={sel} onClose={() => setSel(null)} />}
    </>
  )
}

// [cmd] module-coach-athlete.jsx:314-338.
function ProposalCard({ p, onOpen }: { p: Proposal; onOpen: () => void }) {
  return (
    <Card onClick={onOpen} style={{ cursor: 'pointer' }} attrappe={ATTRAPPE}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 3, alignSelf: 'stretch', background: 'var(--warn)', borderRadius: 2 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span className="v2-mono v2-dim" style={{ fontSize: 10 }}>{p.id}</span>
            <Pill>{p.type}</Pill>
            <Pill variant="warn">needs your confirmation</Pill>
            <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>{p.sent}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.title}</div>
          <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 8 }}>{p.summary}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
            <span className="v2-dim">from</span><span>{p.coach}</span>
            <span className="v2-dim">→</span>
            <span className="v2-mono" style={{ fontSize: 10.5 }}>{p.target}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
          <button className="v2-btn v2-btn-primary v2-btn-sm" onClick={e => e.stopPropagation()}>
            <Icon name="check" className="v2-ic v2-ic-sm" />
            Accept
          </button>
          <button className="v2-btn v2-btn-ghost v2-btn-sm" onClick={e => e.stopPropagation()}>Decline</button>
        </div>
      </div>
    </Card>
  )
}

// [cmd] module-coach-athlete.jsx:340-394.
function ProposalModal({ p, onClose }: { p: Proposal; onClose: () => void }) {
  return (
    <div className="v2-modal-veil" onClick={onClose}>
      <div className="v2-modal" style={{ width: 660, maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          <div
            style={{
              width: 26, height: 26, borderRadius: 6,
              background: 'color-mix(in oklch, var(--acc-coach) 18%, transparent)',
              border: '1px solid color-mix(in oklch, var(--acc-coach) 35%, var(--border))',
              color: 'var(--acc-coach)', display: 'grid', placeItems: 'center',
            }}
          >
            <Icon name="edit" className="v2-ic" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{p.title}</div>
            <div className="v2-dim" style={{ fontSize: 11 }}>
              {`${p.type} · from ${p.coach} · ${p.sent}`}
            </div>
          </div>
          <button className="v2-icon-btn" aria-label="Close" onClick={onClose}>
            <Icon name="x" className="v2-ic" />
          </button>
        </div>
        <div className="v2-modal-body" style={{ overflowY: 'auto' }}>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Why</div>
          <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', lineHeight: 1.55, marginBottom: 14 }}>
            {p.summary}
          </div>

          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>What changes</div>
          <Card className="v2-card-tight" style={{ padding: 0, marginBottom: 14 }} attrappe={ATTRAPPE}>
            <div className="v2-tbl-wrap">
              <table className="v2-tbl">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th style={{ width: 150 }}>Current</th>
                    <th style={{ width: 150 }}>Proposed</th>
                  </tr>
                </thead>
                <tbody>
                  {p.diff.map((d, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 12 }}>{d[0]}</td>
                      <td className="v2-num v2-muted">{d[1]}</td>
                      <td className="v2-num" style={{ color: d[1] === d[2] ? 'var(--fg-dim)' : 'var(--acc-coach)' }}>
                        {d[2]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div
            style={{
              padding: 10, background: 'var(--surface)', borderRadius: 6,
              fontSize: 11.5, color: 'var(--fg-muted)', lineHeight: 1.55,
            }}
          >
            Applies to <span className="v2-mono" style={{ color: 'var(--fg)' }}>{p.target}</span> on accept.
            Your coach cannot write this directly — read-only by contract.
          </div>

          {p.declineReason && (
            <div
              style={{
                marginTop: 12, padding: 10,
                background: 'color-mix(in oklch, var(--neg) 5%, var(--surface))',
                border: '1px solid color-mix(in oklch, var(--neg) 22%, var(--border))',
                borderRadius: 6, fontSize: 11.5,
              }}
            >
              <span className="v2-eyebrow" style={{ color: 'var(--neg)', display: 'block', marginBottom: 3 }}>
                Your reason
              </span>
              {p.declineReason}
            </div>
          )}
        </div>
        {p.status === 'pending' && (
          <div className="v2-modal-f">
            <button className="v2-btn v2-btn-ghost" onClick={onClose}>Later</button>
            <button className="v2-btn">Decline</button>
            <button className="v2-btn v2-btn-primary">
              <Icon name="check" className="v2-ic v2-ic-sm" />
              Accept &amp; apply
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
