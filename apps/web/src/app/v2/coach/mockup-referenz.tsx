'use client'

// Die Mockup-Reiter des Human-Coach als Referenz — G-365, E-69.
//
// **Tom, 2026-09-07:** *,,und was war noch wegen human coach und ai
// coach? wieso haben die keine linie und mockup darunter?"*
//
// ## Warum sie uebersehen wurden
//
// `[cmd]` **Coach hat DREI Routen**, nicht eine:
//
//     /v2/coach          die Auswahlseite
//     /v2/coach/human    zehn Reiter, gemeinsame `ansicht.tsx`
//     /v2/coach/ai       zehn Reiter, eigene `ai/ansicht.tsx`
//
// `[cmd]` **Gemessen wurde `/v2/coach`** — und die zeigte auf jedem
// `?tab=` dasselbe. `[read]` **Ich hielt das fuer ein Werkzeugproblem**
// („misst vor der Hydration") und meldete es als solches. **Es war der
// falsche Pfad.**
//
// ## Und die erste Fassung war zu duenn
//
// **Tom, 2026-09-07:** *,,ein rahmen und dann ein bisschen text drin
// bringen mir wohl ersichtlich nicht wirklich was."*
//
// `[read]` **Richtig.** Die erste Fassung setzte Inhaltsangaben in
// Kacheln („Der Entwurf zeigt je Coach eine Karte mit Bild…") statt
// die Kacheln zu bauen. **Das ist kein Vergleichsstand.**
//
// `[cmd]` **Diese Fassung portiert die Ansicht** — mit den
// Entwurfsdaten aus `daten.ts` (`COACHES`, `COACH_NOTES`), denselben
// Konstanten, die der gebaute Reiter benutzt.
//
// ## Die Quellen
//
//     module-coach.jsx           overview, coaches, messages, notes
//     module-coach-athlete.jsx   permissions, proposals, autonomy,
//                                checkins
//
// `[cmd]` **`invites` und `onboard` stehen in keinem Mockup** — beide
// sind nach dem Entwurf entstanden (G-185 bzw. der Einrichtungsablauf).
import * as React from 'react'
import { Card, Pill, Icon, Row, Sparkline } from '@lumeos/ui'

import { ReferenzTrenner } from '@/components/shell/referenz-trenner'
import {
  COACHES, COACH_NOTES, PROPOSALS, CLIENT_AUTONOMY,
  AUTONOMY_LADDER, CHECKIN_TEMPLATES, CHECKIN_HISTORY,
} from './daten'

// `[cmd]` Gemessen 2026-09-07: `coach.relationships` traegt zwei
// Zeilen mit `status='invited'`, dazu die Spalten `invited_by`,
// `expires_at` und `invite_note`. Die Werte hier sind die der
// Vorlage — die Kachel ist anbindbar, nur nicht gebaut.
const OFFENE_EINLADUNGEN: Array<[string, string, string, string]> = [
  ['Dr. M. Kessler', 'Medical', '12. Mai', 'laeuft 26. Mai ab'],
  ['S. Lindgren', 'Nutrition', '14. Mai', 'laeuft 28. Mai ab'],
]

const QUELLE = 'theme-v1/module-coach.jsx'
const QUELLE_ATH = 'theme-v1/module-coach-athlete.jsx'

function marke(quelle: string): string {
  return `Attrappe — ${quelle} · wartet auf: nichts — Referenz zum `
    + 'Vergleich, faellt mit Toms Abnahme'
}

/** Die kleine Coachkarte der Uebersicht — `CoachCardMini`. */
function CoachKarteKlein({ c }: { c: (typeof COACHES)[number] }) {
  return (
    <div style={{
      padding: 11, background: 'var(--bg-elev)',
      border: '1px solid var(--border)', borderRadius: 7,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: c.color,
          color: 'var(--bg)', display: 'grid', placeItems: 'center',
          fontWeight: 600, fontSize: 12, flexShrink: 0,
        }}>{c.avatar}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>{c.name}</div>
          <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>{c.type}</div>
        </div>
      </div>
      <div className="v2-dim" style={{ fontSize: 10.5 }}>{c.activePlan}</div>
    </div>
  )
}

/** `overview` — `AthleteOverview`, 6 Kacheln. */
export function CoachOverviewReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Overview" quelle={QUELLE} />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Your coaches" sub={`${COACHES.length} of 4 categories`}
                attrappe={marke(QUELLE)}>
            <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
              {COACHES.map(c => <CoachKarteKlein key={c.id} c={c} />)}
            </div>
          </Card>

          <Card title="Latest from your coaches" sub={`${COACH_NOTES.length} notes`}
                attrappe={marke(QUELLE)}>
            <div className="v2-col-gap" style={{ gap: 6 }}>
              {COACH_NOTES.slice(0, 4).map(n => (
                <div key={n.id} style={{
                  padding: 10, background: 'var(--bg-elev)',
                  border: '1px solid var(--border)', borderRadius: 6,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{n.coach}</span>
                    <Pill>{n.module}</Pill>
                    <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                      {n.date}
                    </span>
                  </div>
                  <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.45 }}>
                    {n.body}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Pending invites" sub="0"
                attrappe={
                  `Attrappe — ${QUELLE} · wartet auf: nichts — `
                  + 'gemessen 2026-09-07: `coach.relationships` traegt '
                  + '2 Zeilen mit status=invited, dazu `invited_by`, '
                  + '`expires_at` und `invite_note`; die Kachel ist '
                  + 'auf der Uebersicht nur nicht gebaut'
                }>
            <div className="v2-col-gap" style={{ gap: 6 }}>
          {OFFENE_EINLADUNGEN.map(([name, art, wann, ablauf]) => (
            <div key={name} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', background: 'var(--bg-elev)',
              border: '1px solid var(--border)', borderRadius: 5,
            }}>
              <span style={{ flex: 1, fontSize: 12.5 }}>
                {name}
                <span className="v2-dim v2-mono" style={{ fontSize: 10, marginLeft: 6 }}>
                  {art}
                </span>
              </span>
              <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>
                {wann} · {ablauf}
              </span>
              <Pill>Resend</Pill>
              <Pill>Cancel</Pill>
            </div>
          ))}
        </div>
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Coaching balance" sub="monthly investment"
                attrappe={marke(QUELLE)}>
            <Row label="Training" value="180 EUR" />
            <Row label="Nutrition" value="120 EUR" />
            <Row label="Supplements" value="60 EUR" />
            <Row label="Medical (annualized)" value="57 EUR" />
            <div className="v2-divider" />
            <Row label="Total" value="417 EUR / mo" />
            <Row label="Vs. last month" value="+60 EUR" />
          </Card>

          <Card title="Trust circle" sub="who sees what" attrappe={marke(QUELLE)}>
            {COACHES.map(c => (
              <Row key={c.id} label={c.name}
                   value={`${c.sharedModules.length} mod${c.sharedModules.length === 1 ? '' : 's'}`} />
            ))}
          </Card>

          <Card title="Coach activity · 30d" sub="Notizen, Nachrichten, Planwechsel"
                attrappe={marke(QUELLE)}>
            <Sparkline data={[3, 4, 6, 5, 7, 8, 5, 6, 7, 9, 8, 7, 6, 8]}
                       color="var(--acc-coach)" h={40} />
            <div style={{
              display: 'flex', gap: 14, marginTop: 8,
              fontSize: 11, color: 'var(--fg-muted)',
            }}>
              <span>Notes <span className="v2-num" style={{ color: 'var(--fg)' }}>42</span></span>
              <span>Messages <span className="v2-num" style={{ color: 'var(--fg)' }}>86</span></span>
              <span>Plan changes <span className="v2-num" style={{ color: 'var(--fg)' }}>4</span></span>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

/** `coaches` — `AthleteCoaches`: eine Karte je Coach. */
export function CoachCoachesReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Coaches" quelle={QUELLE} />
      <div className="v2-col-gap" style={{ gap: 12 }}>
        {COACHES.map(c => (
          <Card key={c.id} attrappe={marke(QUELLE)}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 12, background: c.color,
                color: 'var(--bg)', display: 'grid', placeItems: 'center',
                fontWeight: 600, fontSize: 18, flexShrink: 0,
              }}>{c.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: 4, flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</span>
                  <Pill style={{
                    borderColor: `color-mix(in oklch, ${c.color} 35%, var(--border))`,
                    color: c.color,
                  }}>{c.type}</Pill>
                  {c.status === 'active' && <Pill variant="pos">active</Pill>}
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                    since {c.since}
                  </span>
                </div>
                <div className="v2-muted" style={{ fontSize: 12, marginBottom: 8, lineHeight: 1.45 }}>
                  {c.title} · {c.org}
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  gap: 12, fontSize: 11, marginBottom: 10,
                }}>
                  <div><div className="v2-eyebrow">Cadence</div><div>{c.cadence}</div></div>
                  <div><div className="v2-eyebrow">Active plan</div><div>{c.activePlan}</div></div>
                  <div><div className="v2-eyebrow">Fee</div><div className="v2-num">{c.fee}</div></div>
                  <div><div className="v2-eyebrow">Rating</div><div className="v2-num">{c.rating} *</div></div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <span className="v2-eyebrow" style={{ marginRight: 4, alignSelf: 'center' }}>
                    Sees
                  </span>
                  {c.sharedModules.map(m => <Pill key={m}>{m}</Pill>)}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="v2-btn" style={{ pointerEvents: 'none', opacity: 0.7 }}>
                  <Icon name="message" className="v2-ic v2-ic-sm" />
                  Message{c.unread > 0 ? ` · ${c.unread}` : ''}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}

/** `permissions` — `AthletePermissionsV2`: Rechtetafel und Protokoll. */
export function CoachPermissionsReferenz() {
  const bereiche = ['Training', 'Nutrition', 'Recovery', 'Goals',
                    'Supplements', 'Medical']
  return (
    <>
      <ReferenzTrenner reiter="Permissions" quelle={QUELLE_ATH} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Permission matrix" sub="je Coach und Bereich"
              attrappe={marke(QUELLE_ATH)}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Bereich</th>
                  {COACHES.map(c => (
                    <th key={c.id} style={{ width: 110 }}>{c.name.split(' ')[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bereiche.map(b => (
                  <tr key={b}>
                    <td>{b}</td>
                    {COACHES.map(c => (
                      <td key={c.id}>
                        {c.sharedModules.includes(b)
                          ? <Pill variant="pos">lesen</Pill>
                          : <span className="v2-dim">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Consent log" sub="wer wann was freigegeben hat"
              attrappe={marke(QUELLE_ATH)}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>Datum</th>
                  <th>Aenderung</th>
                  <th style={{ width: 150 }}>Coach</th>
                </tr>
              </thead>
              <tbody>
                {COACHES.map(c => (
                  <tr key={c.id}>
                    <td className="v2-num v2-muted">{c.since}</td>
                    <td>{c.sharedModules.join(' · ')} freigegeben</td>
                    <td className="v2-muted">{c.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}

/** `proposals` — `AthleteProposals`: Hinweisband, Offene, Entschiedene. */
export function CoachProposalsReferenz() {
  const offen = PROPOSALS.filter(p => p.status === 'pending')
  const entschieden = PROPOSALS.filter(p => p.status !== 'pending')
  return (
    <>
      <ReferenzTrenner reiter="Proposals" quelle={QUELLE_ATH} />
      <div style={{
        display: 'flex', gap: 12, padding: 14,
        background: 'color-mix(in oklch, var(--acc-coach) 5%, var(--surface))',
        border: '1px solid color-mix(in oklch, var(--acc-coach) 22%, var(--border))',
        borderRadius: 8, marginBottom: 14,
      }}>
        <Icon name="edit" className="v2-ic"
              style={{ color: 'var(--acc-coach)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
            Coaches propose — you decide
          </div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Nothing your coach sends changes a module until you accept it
            here. Declining is free and needs no reason.
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="v2-num" style={{ fontSize: 20, color: 'var(--warn)' }}>
            {offen.length}
          </div>
          <div className="v2-dim" style={{ fontSize: 10 }}>awaiting you</div>
        </div>
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Pending</div>
      <div className="v2-col-gap" style={{ gap: 8, marginBottom: 16 }}>
        {offen.map(p => (
          <Card key={p.id} attrappe={marke(QUELLE_ATH)}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 6, flexWrap: 'wrap',
            }}>
              <span className="v2-num v2-dim" style={{ fontSize: 11 }}>{p.id}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{p.title}</span>
              <Pill>{p.type}</Pill>
              <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                {p.coach} · {p.sent}
              </span>
            </div>
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5, marginBottom: 8 }}>
              {p.summary}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="v2-tbl">
                <thead>
                  <tr>
                    <th>Was</th>
                    <th style={{ width: 130 }}>Jetzt</th>
                    <th style={{ width: 130 }}>Vorgeschlagen</th>
                  </tr>
                </thead>
                <tbody>
                  {p.diff.map(([was, jetzt, neu]) => (
                    <tr key={was}>
                      <td>{was}</td>
                      <td className="v2-num v2-muted">{jetzt}</td>
                      <td className="v2-num">{neu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Decided</div>
      <Card attrappe={marke(QUELLE_ATH)}>
        <div style={{ overflowX: 'auto' }}>
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
              {entschieden.map(p => (
                <tr key={p.id}>
                  <td className="v2-num">{p.id}</td>
                  <td>{p.title}</td>
                  <td className="v2-muted">{p.coach}</td>
                  <td className="v2-num v2-muted">{p.decidedOn ?? '—'}</td>
                  <td>
                    <Pill variant={p.status === 'accepted' ? 'pos' : undefined}>
                      {p.status}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

/** `autonomy` — `AthleteAutonomy`: Leiter, Verlauf, Bewertungen. */
export function CoachAutonomyReferenz() {
  const a = CLIENT_AUTONOMY
  return (
    <>
      <ReferenzTrenner reiter="Autonomy" quelle={QUELLE_ATH} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="The ladder" sub="5 Stufen · aktuelle Stufe hervorgehoben"
              attrappe={marke(QUELLE_ATH)}>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {AUTONOMY_LADDER.map(s => {
              const aktiv = s.lvl === a.level
              return (
                <div key={s.lvl} style={{
                  display: 'grid', gridTemplateColumns: '28px 130px 1fr 1fr 1fr',
                  gap: 10, alignItems: 'center', fontSize: 11,
                  padding: '8px 10px', borderRadius: 6,
                  background: aktiv
                    ? 'color-mix(in oklch, var(--acc-coach) 10%, var(--surface))'
                    : 'var(--surface)',
                  border: `1px solid ${aktiv
                    ? 'color-mix(in oklch, var(--acc-coach) 32%, var(--border))'
                    : 'var(--border)'}`,
                }}>
                  <span className="v2-num">{s.lvl}</span>
                  <span style={{ fontWeight: aktiv ? 600 : 400 }}>{s.name}</span>
                  <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{s.cadence}</span>
                  <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{s.threshold}</span>
                  <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{s.flex}</span>
                </div>
              )
            })}
          </div>
        </Card>

        <Card title="History" sub="Verlauf der Einstufungen" attrappe={marke(QUELLE_ATH)}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 100 }}>Datum</th>
                  <th style={{ width: 80 }}>Von → Auf</th>
                  <th style={{ width: 100 }}>Art</th>
                  <th>Grund</th>
                </tr>
              </thead>
              <tbody>
                {a.history.map(h => (
                  <tr key={h.date}>
                    <td className="v2-num v2-muted">{h.date}</td>
                    <td className="v2-num">{h.from ?? '—'} → {h.to}</td>
                    <td><Pill>{h.type}</Pill></td>
                    <td className="v2-muted">{h.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Assessment scores" sub="woraus sich die Stufe ergibt"
              attrappe={marke(QUELLE_ATH)}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {Object.entries(a.scores).map(([k, v]) => (
              <div key={k} style={{
                display: 'grid', gridTemplateColumns: '140px 1fr 44px',
                gap: 10, alignItems: 'center', fontSize: 11,
              }}>
                <span style={{ color: 'var(--fg-muted)' }}>{k.replace(/_/g, ' ')}</span>
                <div style={{
                  height: 8, background: 'var(--surface-2)', borderRadius: 999,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: `${v * 100}%`,
                    background: 'var(--acc-coach)', borderRadius: 999,
                  }} />
                </div>
                <span className="v2-num" style={{ textAlign: 'right' }}>
                  {(v * 100).toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="What this means" sub={`Stufe ${a.level} · ${a.levelName}`}
              attrappe={marke(QUELLE_ATH)}>
          <Row label="Check-in-Rhythmus" value={a.checkInFrequency} />
          <Row label="Eingriffsschwelle" value={a.interventionThreshold} />
          <Row label="Planfreiheit" value={a.planFlexibility} />
          <Row label="Naechste Beurteilung" value={a.nextAssessment} />
          <Row label="Rueckstufungsrisiko" value={`${(a.regressionRisk * 100).toFixed(0)} %`} />
          <div className="v2-divider" />
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
            {a.reason}
          </div>
        </Card>
      </div>
    </>
  )
}

/** `checkins` — `AthleteCheckins`: Vorlagen, Verlauf, naechster. */
export function CoachCheckinsReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Check-ins" quelle={QUELLE_ATH} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Templates" sub={`${CHECKIN_TEMPLATES.length} Vorlagen`}
              attrappe={marke(QUELLE_ATH)}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {CHECKIN_TEMPLATES.map(v => (
              <div key={v.id} style={{
                padding: 11, background: 'var(--bg-elev)',
                border: '1px solid var(--border)', borderRadius: 6,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5,
                }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{v.name}</span>
                  {v.active && <Pill variant="pos">aktiv</Pill>}
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                    {v.cadence} · {v.coach}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {v.fields.map(f => <Pill key={f}>{f}</Pill>)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="History" sub="frueher eingereicht" attrappe={marke(QUELLE_ATH)}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Datum</th>
                  <th style={{ width: 150 }}>Vorlage</th>
                  <th style={{ width: 100 }}>Stand</th>
                  <th>Antwort des Coaches</th>
                </tr>
              </thead>
              <tbody>
                {CHECKIN_HISTORY.map(h => (
                  <tr key={h.date + h.template}>
                    <td className="v2-num v2-muted">{h.date}</td>
                    <td>{h.template}</td>
                    <td>
                      <Pill variant={h.status === 'submitted' ? 'pos' : 'warn'}>
                        {h.status}
                      </Pill>
                    </td>
                    <td className="v2-muted">{h.reply ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Next check-in" sub="was als Naechstes ansteht"
              attrappe={marke(QUELLE_ATH)}>
          <Row label="Vorlage" value={CHECKIN_TEMPLATES[0]!.name} />
          <Row label="Faellig" value={CHECKIN_TEMPLATES[0]!.cadence} />
          <Row label="Coach" value={CHECKIN_TEMPLATES[0]!.coach} />
          <Row label="Felder" value={`${CHECKIN_TEMPLATES[0]!.fields.length}`} />
        </Card>
      </div>
    </>
  )
}

/** `messages` — `AthleteMessages`: Gespraechsliste und Fenster. */
export function CoachMessagesReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Messages" quelle={QUELLE} />
      <div className="v2-grid" style={{ gridTemplateColumns: '320px 1fr', gap: 12 }}>
        <Card title="Threads" sub={`${COACHES.length} coaches`}
              attrappe={marke(QUELLE)}>
          <div className="v2-col-gap" style={{ gap: 0 }}>
            {COACHES.map(c => (
              <div key={c.id} style={{
                padding: 12, borderBottom: '1px solid var(--border)',
                display: 'flex', gap: 10,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, background: c.color,
                  color: 'var(--bg)', display: 'grid', placeItems: 'center',
                  fontWeight: 600, fontSize: 10, flexShrink: 0,
                }}>{c.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</span>
                    {c.unread > 0 && (
                      <span style={{
                        width: 6, height: 6, borderRadius: 999,
                        background: 'var(--acc-coach)', display: 'inline-block',
                      }} />
                    )}
                    <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 9 }}>
                      {c.lastMsgAt}
                    </span>
                  </div>
                  <div className="v2-muted" style={{
                    fontSize: 11, whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{c.lastMsg}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card attrappe={marke(QUELLE)}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Icon name="message" className="v2-ic"
                  style={{ width: 32, height: 32, color: 'var(--fg-dim)' }} />
            <div style={{ fontSize: 14, fontWeight: 600, margin: '10px 0 4px' }}>
              Select a thread
            </div>
            <div className="v2-dim" style={{ fontSize: 12 }}>
              Click any coach in the left panel to open the conversation.
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}

/** `notes` — `AthleteNotes`: Filterleiste und Notizkarten. */
export function CoachNotesReferenz() {
  // `[read]` NICHT `module` — der Name ist in Next belegt
  // (`no-assign-module-variable`).
  const bereiche = ['All', ...Array.from(new Set(COACH_NOTES.map(n => n.module)))]
  return (
    <>
      <ReferenzTrenner reiter="Notes" quelle={QUELLE} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        <span className="v2-eyebrow" style={{ alignSelf: 'center', marginRight: 6 }}>
          Filter
        </span>
        {bereiche.map((m, i) => (
          <Pill key={m} variant={i === 0 ? 'acc' : undefined}>{m}</Pill>
        ))}
      </div>
      <div className="v2-col-gap" style={{ gap: 8 }}>
        {COACH_NOTES.map(n => {
          const coach = COACHES.find(c => c.id === n.coachId)
          return (
            <Card key={n.id} attrappe={marke(QUELLE)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: coach?.color, color: 'var(--bg)',
                  display: 'grid', placeItems: 'center',
                  fontWeight: 600, fontSize: 11, flexShrink: 0,
                }}>{coach?.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginBottom: 4, flexWrap: 'wrap',
                  }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{n.coach}</span>
                    <Pill>{n.module}</Pill>
                    {n.tags.map(t => <Pill key={t}>{t}</Pill>)}
                    <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                      {n.date}
                    </span>
                  </div>
                  <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
                    {n.body}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}

/**
 * `invites` und `onboard`: der Vermerk, dass es kein Mockup gibt.
 *
 * `[cmd]` Weder `module-coach.jsx` noch `module-coach-athlete.jsx`
 * fuehrt sie. **Beide sind nach dem Entwurf entstanden.**
 */
// ══ G-391: der Vermerk war falsch, und zwar zweimal ════════════════
//
// `[cmd]` **Hier stand:** *„`invites`/`onboard` steht in keiner
// theme-v1-Datei, es gibt keinen Soll-Stand zum Vergleich."*
// **Beides ist gemessen widerlegt:**
//
//     onboard   module-coach-meta.jsx:77-147  ONBOARD_STEPS und
//               CoachOnboardingWizard -- die QUELLE dieses Reiters,
//               sie steht im Kopf von `tab-onboarding.tsx`
//     invites   module-coach.jsx:249  "Pending invites"
//               module-coach.jsx:475  "Invites"
//
// `[read]` **Ein Vermerk mit falschem Grund ist schlimmer als eine
// fehlende Kachel** — er verhindert, dass jemand nachsieht. **Und in
// einer Suche zaehlt er als Deckung.**
//
// `[cmd]` **Was stimmt: unter der Linie stand nichts** — die Funktion
// setzte eine Karte, aber KEINEN `ReferenzTrenner`. **Gemessen: auf
// beiden Reitern `Trenner=NEIN`**, waehrend die anderen acht ihn
// haben. `[read]` **Ohne Linie gibt es kein Oben und Unten** — und
// genau die verlangt E-69.

/** Woher der Reiter stammt — gemessen, nicht behauptet. */
const OHNE_MOCKUP: Record<string, { quelle: string, was: string }> = {
  invites: {
    quelle: 'theme-v1/module-coach.jsx:249, :475',
    was: 'Die Vorlage fuehrt „Pending invites" (Uebersicht) und '
      + '„Invites" (eigene Ansicht). Beide zeigen dieselbe Liste, die '
      + 'dieser Reiter aus `coach.relationships` liest.',
  },
  onboard: {
    quelle: 'theme-v1/module-coach-meta.jsx:77-147',
    was: '`ONBOARD_STEPS` und `CoachOnboardingWizard` — die Quelle '
      + 'dieses Reiters, genannt im Kopf von `tab-onboarding.tsx`. '
      + 'Der Assistent oben IST die portierte Vorlage.',
  },
}

export function CoachOhneMockup({ reiter }: { reiter: string }) {
  const e = OHNE_MOCKUP[reiter]
  return (
    <>
      {/* `[read]` **Die Linie gehoert ans Reiterende** — sie trennt
          das Gebaute von der Referenz, und ohne sie ist die
          Dreiteilung aus E-69 nicht ablesbar. */}
      <ReferenzTrenner reiter={reiter} quelle={e?.quelle ?? 'kein Mockup'} />
      <Card title="Die Vorlage ist bereits portiert"
            sub={e ? e.quelle : 'dieser Reiter entstand nach dem Entwurf'}>
        <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
          {e
            ? (
              <>
                {e.was}{' '}
                <strong>Deshalb steht hier keine zweite Fassung</strong> —
                {' '}eine Referenz, die dasselbe zeigt wie die Kachel
                {' '}darueber, waere eine Verdopplung, kein Vergleich.
              </>
            )
            : (
              <>
                Fuer <span className="v2-mono">{reiter}</span> fuehrt keine
                {' '}theme-v1-Datei ein Gegenstueck.
              </>
            )}
        </div>
      </Card>
    </>
  )
}

// ══ Was OBERHALB der Linie fehlt ═══════════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-07, Titel gegen Titel.** Uebersetzungen
// abgezogen (`History` -> `Historie der Einstufungen`, `Templates` ->
// `Vorlagen`, `Consent log` -> `Historie der Freigaben`), blieben
// fuenf. **Sie tragen denselben Inhalt wie unten** — mit dem
// Unterschied, dass hier der Grund steht, warum sie nicht angebunden
// sind.

function fehlt(quelle: string, wartet: string): string {
  return `Attrappe — ${quelle} · wartet auf: ${wartet}`
}

/** `overview`: `Pending invites` fehlt oben. */
export function FehlendeOverviewKachel() {
  return (
    <Card title="Pending invites" sub="offene Einladungen"
          attrappe={fehlt(QUELLE,
            'nichts — gemessen 2026-09-07: `coach.relationships` traegt '
            + '2 Zeilen mit status=invited; auf der Uebersicht fehlt '
            + 'die Kachel nur')}>
      <div className="v2-col-gap" style={{ gap: 6 }}>
          {OFFENE_EINLADUNGEN.map(([name, art, wann, ablauf]) => (
            <div key={name} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', background: 'var(--bg-elev)',
              border: '1px solid var(--border)', borderRadius: 5,
            }}>
              <span style={{ flex: 1, fontSize: 12.5 }}>
                {name}
                <span className="v2-dim v2-mono" style={{ fontSize: 10, marginLeft: 6 }}>
                  {art}
                </span>
              </span>
              <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>
                {wann} · {ablauf}
              </span>
              <Pill>Resend</Pill>
              <Pill>Cancel</Pill>
            </div>
          ))}
        </div>
    </Card>
  )
}

/** `autonomy`: die Leiter, die Bewertungen und die Wirkung fehlen. */
export function FehlendeAutonomyKacheln() {
  const a = CLIENT_AUTONOMY
  return (
    <>
      <Card title="The ladder" sub="5 Stufen · aktuelle hervorgehoben"
            attrappe={fehlt(QUELLE_ATH,
              'die Stufendefinition — es gibt keine Tabelle mit Rhythmus, '
              + 'Schwelle und Planfreiheit je Stufe')}>
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {AUTONOMY_LADDER.map(s => (
            <div key={s.lvl} style={{
              display: 'grid', gridTemplateColumns: '28px 130px 1fr 1fr 1fr',
              gap: 10, alignItems: 'center', fontSize: 11,
              padding: '8px 10px', borderRadius: 6,
              background: s.lvl === a.level
                ? 'color-mix(in oklch, var(--acc-coach) 10%, var(--surface))'
                : 'var(--surface)',
              border: '1px solid var(--border)',
            }}>
              <span className="v2-num">{s.lvl}</span>
              <span style={{ fontWeight: s.lvl === a.level ? 600 : 400 }}>{s.name}</span>
              <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{s.cadence}</span>
              <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{s.threshold}</span>
              <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{s.flex}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Assessment scores" sub="woraus sich die Stufe ergibt"
            attrappe={fehlt(QUELLE_ATH,
              'die Einzelbewertungen — gespeichert ist nur die Stufe, '
              + 'nicht wie sie zustande kam')}>
        <div className="v2-col-gap" style={{ gap: 8 }}>
          {Object.entries(a.scores).map(([k, v]) => (
            <div key={k} style={{
              display: 'grid', gridTemplateColumns: '140px 1fr 44px',
              gap: 10, alignItems: 'center', fontSize: 11,
            }}>
              <span style={{ color: 'var(--fg-muted)' }}>{k.replace(/_/g, ' ')}</span>
              <div style={{
                height: 8, background: 'var(--surface-2)',
                borderRadius: 999, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${v * 100}%`,
                  background: 'var(--acc-coach)', borderRadius: 999,
                }} />
              </div>
              <span className="v2-num" style={{ textAlign: 'right' }}>
                {(v * 100).toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="What this means" sub={`Stufe ${a.level} · ${a.levelName}`}
            attrappe={fehlt(QUELLE_ATH,
              'eine Zuordnung Stufe zu Befugnis — welche Handlung bei '
              + 'welcher Stufe ohne Rueckfrage erlaubt ist, steht nirgends')}>
        <Row label="Check-in-Rhythmus" value={a.checkInFrequency} />
        <Row label="Eingriffsschwelle" value={a.interventionThreshold} />
        <Row label="Planfreiheit" value={a.planFlexibility} />
        <Row label="Naechste Beurteilung" value={a.nextAssessment} />
      </Card>
    </>
  )
}

/** `checkins`: `Next check-in` fehlt oben. */
export function FehlendeCheckinKachel() {
  const v = CHECKIN_TEMPLATES[0]!
  return (
    <Card title="Next check-in" sub="was als Naechstes ansteht"
          attrappe={fehlt(QUELLE_ATH,
            'eine Faelligkeit je Vorlage — die Vorlagen haben keinen '
            + 'gespeicherten Rhythmus, also laesst sich kein Termin ableiten')}>
      <Row label="Vorlage" value={v.name} />
      <Row label="Faellig" value={v.cadence} />
      <Row label="Coach" value={v.coach} />
      <Row label="Felder" value={`${v.fields.length}`} />
    </Card>
  )
}
