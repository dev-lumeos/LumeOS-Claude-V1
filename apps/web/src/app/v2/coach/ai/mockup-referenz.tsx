'use client'

// Die Mockup-Reiter des AI-Coach als Referenz — G-365, E-69.
//
// **Tom, 2026-09-07:** *,,und was war noch wegen human coach und ai
// coach? wieso haben die keine linie und mockup darunter?"*
//
// `[cmd]` **Der Grund war ein falscher Messpfad:** ich hatte
// `/v2/coach` gemessen — die Auswahlseite, die auf jedem `?tab=`
// dasselbe zeigt. **Die Reiter liegen unter `/v2/coach/ai`.**
//
// ## Und die erste Fassung war zu duenn
//
// **Tom, 2026-09-07:** *,,ein rahmen und dann ein bisschen text drin
// bringen mir wohl ersichtlich nicht wirklich was."*
//
// `[read]` **Richtig.** Sie setzte Inhaltsangaben in Kacheln statt
// die Kacheln zu bauen. **Diese Fassung portiert die Ansicht** — mit
// den Entwurfsdaten aus `ai/daten.ts`, denselben Konstanten, die der
// gebaute Reiter benutzt.
//
// ## Die Quellen
//
//     module-buddy.jsx          chat, feed, memory, decisions,
//                               settings, states
//     module-buddy-engines.jsx  tiers, engines, journey, watcher
import * as React from 'react'
import { Card, Pill, Icon, Row } from '@lumeos/ui'

import { ReferenzTrenner } from '@/components/shell/referenz-trenner'
import {
  BUDDY_PERSONAS, BUDDY_STATES, BUDDY_CHAT_HISTORY, BUDDY_INSIGHTS_FEED,
  BUDDY_MEMORY, BUDDY_DECISIONS, TIERS, TIER_LABEL, TIER_PRICE,
  GATED_FEATURES, AI_PATHS, PATH_LOG,
  BSS, SIGNATURE, INTERVENTIONS, INTERVENTION_LOAD,
  SAFETY_RULES, GATE_LOG, BUTLER_INTENTS, BUTLER_LOG,
} from './daten'

const QUELLE = 'theme-v1/module-buddy.jsx'
const QUELLE_ENG = 'theme-v1/module-buddy-engines.jsx'

function marke(quelle: string): string {
  return `Attrappe — ${quelle} · wartet auf: nichts — Referenz zum `
    + 'Vergleich, faellt mit Toms Abnahme'
}

/** `chat` — Gespraechsliste und Verlauf. */
export function BuddyChatReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Chat" quelle={QUELLE} />
      <Card title="Verlauf" sub={`${BUDDY_CHAT_HISTORY.length} Nachrichten`}
            attrappe={marke(QUELLE)}>
        <div className="v2-col-gap" style={{ gap: 8 }}>
          {BUDDY_CHAT_HISTORY.map((m, i) => {
            const vonBuddy = m.from === 'buddy'
            return (
              <div key={i} style={{
                alignSelf: vonBuddy ? 'flex-start' : 'flex-end',
                maxWidth: '82%',
                padding: '9px 12px', borderRadius: 8,
                background: vonBuddy
                  ? 'color-mix(in oklch, var(--acc-buddy) 7%, var(--surface))'
                  : 'var(--bg-elev)',
                border: `1px solid ${vonBuddy
                  ? 'color-mix(in oklch, var(--acc-buddy) 22%, var(--border))'
                  : 'var(--border)'}`,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>
                    {vonBuddy ? 'Buddy' : 'Tom'}
                  </span>
                  {m.state && <Pill>{m.state}</Pill>}
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 9.5 }}>
                    {m.at}
                  </span>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.5 }}>{m.body}</div>
              </div>
            )
          })}
        </div>
      </Card>
    </>
  )
}

/** `feed` — der Beitragsstrom. */
export function BuddyFeedReferenz() {
  const farbe = (t: string) => t === 'alert' ? 'var(--warn)'
    : t === 'celebration' ? 'var(--pos)'
    : t === 'pattern' ? 'var(--acc-recov)' : 'var(--acc-buddy)'
  return (
    <>
      <ReferenzTrenner reiter="Feed" quelle={QUELLE} />
      <div className="v2-col-gap" style={{ gap: 10 }}>
        {BUDDY_INSIGHTS_FEED.map(f => (
          <Card key={f.ts + f.title} attrappe={marke(QUELLE)}>
            <div style={{ display: 'flex', gap: 11 }}>
              <div style={{
                width: 3, alignSelf: 'stretch',
                background: farbe(f.type), borderRadius: 2,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
                  flexWrap: 'wrap',
                }}>
                  <span className="v2-mono" style={{ fontSize: 10, color: farbe(f.type) }}>
                    {f.type}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{f.title}</span>
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                    {f.ts}
                  </span>
                </div>
                <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                  {f.body}
                </div>
                <div style={{ display: 'flex', gap: 5, marginTop: 7 }}>
                  {f.actions.map(a => <Pill key={a}>{a}</Pill>)}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}

/** `memory` — das Gedaechtnis als Tabelle. */
export function BuddyMemoryReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Memory" quelle={QUELLE} />
      <Card title="Gedaechtnis" sub={`${BUDDY_MEMORY.length} Eintraege`}
            attrappe={marke(QUELLE)}>
        <div style={{ overflowX: 'auto' }}>
          <table className="v2-tbl">
            <thead>
              <tr>
                <th style={{ width: 110 }}>Kategorie</th>
                <th>Was Buddy weiss</th>
                <th style={{ width: 160 }}>Herkunft</th>
                <th style={{ width: 100 }}>Stand</th>
              </tr>
            </thead>
            <tbody>
              {BUDDY_MEMORY.map(m => (
                <tr key={m.id}>
                  <td><Pill>{m.cat}</Pill></td>
                  <td>{m.fact}</td>
                  <td className="v2-muted v2-mono" style={{ fontSize: 10.5 }}>{m.source}</td>
                  <td className="v2-num v2-muted">{m.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

/** `decisions` — der Entscheidungsstrom. */
export function BuddyDecisionsReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Decisions" quelle={QUELLE} />
      <Card title="Decision feed" sub={`${BUDDY_DECISIONS.length} Entscheidungen`}
            attrappe={marke(QUELLE)}>
        <div style={{ overflowX: 'auto' }}>
          <table className="v2-tbl">
            <thead>
              <tr>
                <th style={{ width: 110 }}>Wann</th>
                <th>Entscheidung</th>
                <th style={{ width: 110 }}>Art</th>
                <th style={{ width: 100 }}>Autonomie</th>
                <th style={{ width: 100 }}>Ergebnis</th>
              </tr>
            </thead>
            <tbody>
              {BUDDY_DECISIONS.map(d => (
                <tr key={d.ts + d.decision}>
                  <td className="v2-num v2-muted">{d.ts}</td>
                  <td>{d.decision}</td>
                  <td><Pill>{d.category}</Pill></td>
                  <td className="v2-mono v2-dim" style={{ fontSize: 10.5 }}>{d.autonomy}</td>
                  <td><Pill variant={d.outcome === 'delivered' ? 'pos' : undefined}>
                    {d.outcome}
                  </Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

/** `settings` — Persona, Autonomie, Ansprache, Meldungen. */
export function BuddySettingsReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Settings" quelle={QUELLE} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Persona" sub={`${BUDDY_PERSONAS.length} zur Wahl`}
              attrappe={marke(QUELLE)}>
          <div className="v2-col-gap" style={{ gap: 7 }}>
            {BUDDY_PERSONAS.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 11px', borderRadius: 6,
                background: i === 0
                  ? 'color-mix(in oklch, var(--acc-buddy) 8%, var(--surface))'
                  : 'var(--surface)',
                border: `1px solid ${i === 0
                  ? 'color-mix(in oklch, var(--acc-buddy) 26%, var(--border))'
                  : 'var(--border)'}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{p.name}</div>
                  <div className="v2-dim" style={{ fontSize: 11 }}>{p.desc}</div>
                </div>
                {i === 0 && <Pill variant="acc">aktiv</Pill>}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Autonomy level" sub="wie weit Buddy allein handelt"
              attrappe={marke(QUELLE)}>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {[
              ['observe', 'nur beobachten und melden'],
              ['advisory', 'vorschlagen, du entscheidest'],
              ['assisted', 'kleine Dinge selbst, Grosses fragt nach'],
              ['autonomous', 'handelt und berichtet danach'],
            ].map(([k, w], i) => (
              <div key={k} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 11px', borderRadius: 6,
                background: i === 1
                  ? 'color-mix(in oklch, var(--acc-buddy) 8%, var(--surface))'
                  : 'var(--surface)',
                border: '1px solid var(--border)',
                fontSize: 11.5,
              }}>
                <span className="v2-mono" style={{ width: 92 }}>{k}</span>
                <span className="v2-dim">{w}</span>
                {i === 1 && <Pill variant="acc" style={{ marginLeft: 'auto' }}>aktiv</Pill>}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Communication" sub="wann und wie oft" attrappe={marke(QUELLE)}>
          <Row label="Taegliche Zusammenfassung" value="07:30" />
          <Row label="Stille Stunden" value="22:00 – 06:30" />
          <Row label="Hoechstens je Tag" value="6 Meldungen" />
          <Row label="Kanal" value="in der App" />
        </Card>

        <Card title="Notifications" sub="was gemeldet wird" attrappe={marke(QUELLE)}>
          {[['Muster erkannt', true], ['Bestwert erreicht', true],
            ['Wert ausserhalb der Spanne', true], ['Erinnerung faellig', true],
            ['Woechentlicher Bericht', false]].map(([l, an]) => (
            <Row key={String(l)} label={String(l)} value={an ? 'an' : 'aus'} />
          ))}
        </Card>

        <Card title="Zuruecksetzen" sub="Gedaechtnis leeren" attrappe={marke(QUELLE)}>
          <Row label="Gemerkte Punkte" value={String(BUDDY_MEMORY.length)} />
          <Row label="Wirkung" value="unumkehrbar" />
          <div className="v2-divider" />
          <div style={{
            padding: 10, borderRadius: 6, fontSize: 11.5, lineHeight: 1.5,
            background: 'color-mix(in oklch, var(--neg) 6%, var(--surface))',
            border: '1px solid color-mix(in oklch, var(--neg) 22%, var(--border))',
          }}>
            <div style={{ fontWeight: 600, marginBottom: 3 }}>
              Alle {BUDDY_MEMORY.length} Punkte verwerfen?
            </div>
            <div className="v2-muted">
              Buddy beginnt ohne Vorgeschichte. Der Entwurf verlangt an
              dieser Stelle eine Bestaetigung.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <Pill variant="neg">Zuruecksetzen</Pill>
            <Pill>Abbrechen</Pill>
          </div>
        </Card>
      </div>
    </>
  )
}

/** `states` — die Zustaende der Flaeche. */
export function BuddyStatesReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="States" quelle={QUELLE} />
      <Card title="Avatar states" sub={`${BUDDY_STATES.length} Zustaende`}
            attrappe={marke(QUELLE)}>
        <div className="v2-grid v2-g-cols-3" style={{ gap: 10 }}>
          {BUDDY_STATES.map(s => (
            <div key={s.id} style={{
              padding: 12, background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 7,
              textAlign: 'center',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 999, margin: '0 auto 8px',
                background: 'color-mix(in oklch, var(--acc-buddy) 22%, transparent)',
                border: '1px solid color-mix(in oklch, var(--acc-buddy) 40%, var(--border))',
              }} />
              <div style={{ fontSize: 12, fontWeight: 600 }}>{s.label}</div>
              <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 2 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

/** `tiers` — die gebuchte Stufe und was gesperrt ist. */
export function BuddyTiersReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Tiers" quelle={QUELLE_ENG} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Your plan" sub="die gebuchte Stufe" attrappe={marke(QUELLE_ENG)}>
          <div className="v2-grid v2-g-cols-4" style={{ gap: 10 }}>
            {TIERS.map((t, i) => (
              <div key={t} style={{
                padding: 12, borderRadius: 7, textAlign: 'center',
                background: i === 2
                  ? 'color-mix(in oklch, var(--acc-buddy) 10%, var(--surface))'
                  : 'var(--surface)',
                border: `1px solid ${i === 2
                  ? 'color-mix(in oklch, var(--acc-buddy) 30%, var(--border))'
                  : 'var(--border)'}`,
              }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                  {TIER_LABEL[t] ?? t}
                </div>
                <div className="v2-num" style={{ fontSize: 15, marginTop: 4 }}>
                  {TIER_PRICE[t] ?? '—'}
                </div>
                {i === 2 && <Pill variant="acc" style={{ marginTop: 6 }}>deine</Pill>}
              </div>
            ))}
          </div>
        </Card>

        <Card title="What\u2019s locked for you right now"
              sub={`${GATED_FEATURES.length} Faehigkeiten`}
              attrappe={marke(QUELLE_ENG)}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Faehigkeit</th>
                  <th style={{ width: 110 }}>ab Stufe</th>
                  <th style={{ width: 100 }}>Zustand</th>
                </tr>
              </thead>
              <tbody>
                {GATED_FEATURES.map((f: Record<string, unknown>) => (
                  <tr key={String(f.id ?? f.label)}>
                    <td>{String(f.label ?? f.name ?? f.id)}</td>
                    <td className="v2-mono v2-dim">{String(f.min ?? f.tier ?? '—')}</td>
                    <td><Pill>gesperrt</Pill></td>
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

/** `engines` — Modelle, Zuteilung, Kosten. */
export function BuddyEnginesReferenz() {
  const summe = PATH_LOG.reduce((s, p) => s + p.cost, 0)
  return (
    <>
      <ReferenzTrenner reiter="Engines" quelle={QUELLE_ENG} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Request routing" sub={`${AI_PATHS.length} Wege`}
              attrappe={marke(QUELLE_ENG)}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {AI_PATHS.map(p => (
              <div key={p.id} style={{
                padding: 11, background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 6,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
                }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{p.label}</span>
                  <Pill>{p.model}</Pill>
                  <span className="v2-num" style={{ marginLeft: 'auto', fontSize: 11 }}>
                    {p.share} %
                  </span>
                </div>
                <div className="v2-dim" style={{ fontSize: 11 }}>{p.when}</div>
                <div className="v2-mono v2-dim" style={{ fontSize: 10, marginTop: 3 }}>
                  {p.cost} je Anfrage
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Cost this month" sub={`${PATH_LOG.length} Anfragen im Protokoll`}
              attrappe={marke(QUELLE_ENG)}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Wann</th>
                  <th>Anfrage</th>
                  <th style={{ width: 100 }}>Weg</th>
                  <th style={{ width: 90, textAlign: 'right' }}>Kosten</th>
                  <th style={{ width: 80, textAlign: 'right' }}>ms</th>
                </tr>
              </thead>
              <tbody>
                {PATH_LOG.map((p, i) => (
                  <tr key={i}>
                    <td className="v2-num v2-muted">{p.at}</td>
                    <td>{p.msg}</td>
                    <td><Pill>{p.path}</Pill></td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>
                      {p.cost === 0 ? '0' : p.cost.toFixed(3)}
                    </td>
                    <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>{p.ms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="v2-divider" />
          <Row label="Summe im Protokoll" value={summe.toFixed(3)} />
        </Card>
      </div>
    </>
  )
}

/** `journey` — die Stationen. */
export function BuddyJourneyReferenz() {
  const stationen = [
    ['Sep 2024', 'Erste Einrichtung', 'Persona gewaehlt, Ziele erfasst'],
    ['Jan 2025', 'Mustererkennung an', 'Schlaf- und Trainingsmuster gelernt'],
    ['Apr 2025', 'Autonomie: advisory', 'darf vorschlagen, nicht handeln'],
    ['Sep 2025', 'Coach-Regeln uebernommen', 'Anders RPE, Jana Trendmakros'],
    ['Mai 2026', '12 Eintraege im Gedaechtnis', 'Profil, Ziele, Vorlieben, Medizin'],
  ]
  return (
    <>
      <ReferenzTrenner reiter="Journey" quelle={QUELLE_ENG} />
      <Card title="Der Weg" sub={`${stationen.length} Stationen`}
            attrappe={marke(QUELLE_ENG)}>
        <div className="v2-col-gap" style={{ gap: 0 }}>
          {stationen.map(([wann, was, wie], i) => (
            <div key={String(wann)} style={{
              display: 'grid', gridTemplateColumns: '92px 20px 1fr',
              gap: 10, alignItems: 'flex-start', padding: '10px 0',
              borderBottom: i < stationen.length - 1
                ? '1px solid var(--border)' : undefined,
            }}>
              <span className="v2-num v2-dim" style={{ fontSize: 11 }}>{wann}</span>
              <span style={{
                width: 9, height: 9, borderRadius: 999, marginTop: 3,
                background: 'var(--acc-buddy)',
              }} />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{was}</div>
                <div className="v2-dim" style={{ fontSize: 11, marginTop: 2 }}>{wie}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

/** `watcher` — Regeln, offene Hinweise, Empfindlichkeit. */
export function BuddyWatcherReferenz() {
  const regeln = [
    ['Schlaf unter 7 h', '3 Naechte in Folge', 'an'],
    ['Gewicht steht', '14 Tage ohne Bewegung', 'an'],
    ['Marker ausserhalb', 'jeder Laborwert', 'an'],
    ['Einnahme vergessen', '2 Tage in Folge', 'an'],
    ['HRV faellt', 'unter Grundlinie minus 15 %', 'aus'],
  ]
  return (
    <>
      <ReferenzTrenner reiter="Watcher" quelle={QUELLE_ENG} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Watcher rules" sub={`${regeln.length} Regeln`}
              attrappe={marke(QUELLE_ENG)}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Worauf</th>
                  <th style={{ width: 200 }}>Ausloeser</th>
                  <th style={{ width: 80 }}>Zustand</th>
                </tr>
              </thead>
              <tbody>
                {regeln.map(([w, a, z]) => (
                  <tr key={String(w)}>
                    <td>{w}</td>
                    <td className="v2-muted">{a}</td>
                    <td><Pill variant={z === 'an' ? 'pos' : undefined}>{z}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Open alerts" sub="offene Hinweise" attrappe={marke(QUELLE_ENG)}>
          <div className="v2-col-gap" style={{ gap: 7 }}>
            {BUDDY_INSIGHTS_FEED.filter(f => f.type === 'alert').map(f => (
              <div key={f.title} style={{
                padding: 10, borderRadius: 6,
                background: 'color-mix(in oklch, var(--warn) 6%, var(--surface))',
                border: '1px solid color-mix(in oklch, var(--warn) 25%, var(--border))',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>
                  {f.title}
                </div>
                <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.45 }}>
                  {f.body}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Watcher settings" sub="Empfindlichkeit" attrappe={marke(QUELLE_ENG)}>
          <Row label="Mindestsicherheit" value="0.70" />
          <Row label="Hoechstens je Tag" value="4 Hinweise" />
          <Row label="Stille Stunden" value="22:00 – 06:30" />
        </Card>
      </div>
    </>
  )
}


// ══ Die zehn Reiter, bei denen ich aufgehoert hatte ════════════════
//
// **Tom, 2026-09-07:** *,,wieso hast bei ai coach(buddy) bei watcher
// aufgehoert?"*
//
// `[cmd]` **Der gebaute Reiter fuehrt ZWANZIG**, ich hatte zehn
// portiert. `[read]` **Die Ursache:** ich uebernahm die Reiterliste
// aus meiner ersten Messung statt aus `ansicht.tsx`.
//
//     module-buddy-engines.jsx    bss · signature · interven ·
//                                 safety · butler
//     module-buddy-voice.jsx      voice
//     module-buddy-knowledge.jsx  knowledge · rules · clone
//     module-coach-meta.jsx       overrides

const QUELLE_VOICE = 'theme-v1/module-buddy-voice.jsx'
const QUELLE_KNOW = 'theme-v1/module-buddy-knowledge.jsx'
const QUELLE_META = 'theme-v1/module-coach-meta.jsx'

/** `bss` — der Verhaltensstabilitaetswert, 5 Kacheln. */
export function BuddyBSSReferenz() {
  const s = BSS.stability
  const a = BSS.alignment
  return (
    <>
      <ReferenzTrenner reiter="BSS" quelle={QUELLE_ENG} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="BSS" sub={`${BSS.period} · Trend ${BSS.trend}`}
              attrappe={marke(QUELLE_ENG)}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 10 }}>
            <span className="v2-num" style={{ fontSize: 34, fontWeight: 600 }}>
              {BSS.total}
            </span>
            <span className="v2-dim">vorher {BSS.prior}</span>
            <span className="v2-num" style={{ color: 'var(--pos)' }}>
              +{BSS.delta}
            </span>
          </div>
          <div className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>
            {BSS.formula}
          </div>
        </Card>

        <Card title="Stability" sub={`Teilwert ${s.stability_score}`}
              attrappe={marke(QUELLE_ENG)}>
          <Row label="Trainingsstetigkeit" value={String(s.training_consistency)} />
          <Row label="Ernaehrungsstabilitaet" value={String(s.nutrition_adherence_stability)} />
          <Row label="Erholungsstabilitaet" value={String(s.recovery_stability)} />
          <Row label="Abbrueche" value={`${s.dropout_events.count} · Wert ${s.dropout_events.score}`} />
          <Row label="Rueckkehrzeit" value={`${s.bounceback_time.avg_days} Tage · Wert ${s.bounceback_time.score}`} />
        </Card>

        <Card title="Goal alignment" sub={`Teilwert ${a.alignment_score}`}
              attrappe={marke(QUELLE_ENG)}>
          <Row label="Training je Woche"
               value={`${a.training.actual_avg} von ${a.training.target_per_week} · ${a.training.alignment} %`} />
          <Row label="Protein getroffen" value={`${a.nutrition.protein_target_hit_rate} %`} />
          <Row label="Kalorien getroffen" value={`${a.nutrition.calorie_target_hit_rate} %`} />
          <Row label="Koerperziel" value={a.body_composition.goal} />
          <Row label="Auf Kurs" value={a.body_composition.on_track ? 'ja' : 'nein'} />
        </Card>

        <Card title="90-day trend" sub={`${BSS.history.length} Punkte`}
              attrappe={marke(QUELLE_ENG)}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
            {BSS.history.map((v, i) => (
              <div key={i} style={{
                flex: 1, height: `${(v / 100) * 100}%`,
                background: 'var(--acc-buddy)', opacity: 0.5 + (i / BSS.history.length) * 0.5,
                borderRadius: 2,
              }} />
            ))}
          </div>
          <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 6 }}>
            {BSS.history[0]} bis {BSS.history[BSS.history.length - 1]}
          </div>
        </Card>

        <Card title="What moves it" sub="woran der Wert haengt"
              attrappe={marke(QUELLE_ENG)}>
          {/* `[cmd]` QUELLE: `module-buddy-engines.jsx:575` — drei
              Hebelkacheln, Wert und Begruendung je Hebel. */}
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {[
              { t: `Calorie target hit rate · ${a.nutrition.calorie_target_hit_rate}%`,
                d: 'The weakest input. Closing it to 80% would move BSS about 6 points.',
                gut: false },
              { t: `Recovery stability · ${s.recovery_stability}`,
                d: 'Sleep variance drives this more than sleep length.',
                gut: false },
              { t: 'Bounceback · 2 days',
                d: 'Your strongest component. Protect it.', gut: true },
            ].map(h => (
              <div key={h.t} style={{
                padding: 10, borderRadius: 6, fontSize: 11.5, lineHeight: 1.5,
                background: `color-mix(in oklch, var(${h.gut ? '--pos' : '--warn'}) 6%, var(--surface))`,
                border: `1px solid color-mix(in oklch, var(${h.gut ? '--pos' : '--warn'}) 22%, var(--border))`,
              }}>
                <div style={{ fontWeight: 600 }}>{h.t}</div>
                <div className="v2-muted">{h.d}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

/** `signature` — die erkannten Verhaltensmuster. */
export function BuddySignatureReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Signature" quelle={QUELLE_ENG} />
      <Card title="Behavioral signature"
            sub={`${SIGNATURE.weeksOfData} Wochen · ${SIGNATURE.eventCount} Ereignisse`}
            attrappe={marke(QUELLE_ENG)}>
        <div className="v2-col-gap" style={{ gap: 8 }}>
          {SIGNATURE.patterns.map(p => (
            <div key={p.key} style={{
              padding: 11, borderRadius: 6,
              background: p.detected
                ? 'color-mix(in oklch, var(--acc-buddy) 6%, var(--surface))'
                : 'var(--surface)',
              border: `1px solid ${p.detected
                ? 'color-mix(in oklch, var(--acc-buddy) 24%, var(--border))'
                : 'var(--border)'}`,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
                flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{p.label}</span>
                <Pill variant={p.detected ? 'acc' : undefined}>
                  {p.detected ? 'erkannt' : 'zu wenig Signal'}
                </Pill>
                <span className="v2-num v2-dim" style={{ marginLeft: 'auto', fontSize: 10.5 }}>
                  Sicherheit {p.confidence} · n = {p.n}
                </span>
              </div>
              <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                {p.detail}
              </div>
              {p.first && (
                <div className="v2-dim v2-mono" style={{ fontSize: 10, marginTop: 4 }}>
                  {p.pattern} · {p.first} bis {p.last}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

/** `interven` — Eingriffsprotokoll, Budget, Arten. */
export function BuddyInterventionsReferenz() {
  const l = INTERVENTION_LOAD
  return (
    <>
      <ReferenzTrenner reiter="Interventions" quelle={QUELLE_ENG} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Intervention log" sub={`${INTERVENTIONS.length} Eintraege`}
              attrappe={marke(QUELLE_ENG)}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>ID</th>
                  <th style={{ width: 110 }}>Art</th>
                  <th>Was gesagt wurde</th>
                  <th style={{ width: 90 }}>Erwartet</th>
                  <th style={{ width: 90 }}>Beobachtet</th>
                  <th style={{ width: 80, textAlign: 'right' }}>Wirkung</th>
                </tr>
              </thead>
              <tbody>
                {INTERVENTIONS.map(iv => (
                  <tr key={iv.id}>
                    <td className="v2-num v2-dim">{iv.id}</td>
                    <td><Pill>{iv.type}</Pill></td>
                    <td className="v2-muted">{iv.content}</td>
                    <td className="v2-mono v2-dim" style={{ fontSize: 10.5 }}>{iv.expected}</td>
                    <td className="v2-mono" style={{ fontSize: 10.5 }}>{iv.observed}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>
                      {iv.effectiveness ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Load budget" sub={l.window} attrappe={marke(QUELLE_ENG)}>
          <Row label="Eingriffe" value={`${l.total} von ${l.max}`} />
          <Row label="Konfrontationen" value={`${l.confrontations} von ${l.maxConfrontations}`} />
          <Row label="Identitaetsaussagen" value={`${l.identity} von ${l.maxIdentity}`} />
        </Card>

        <Card title="Types" sub="die Eingriffsarten" attrappe={marke(QUELLE_ENG)}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {Array.from(new Set(INTERVENTIONS.map(i => i.type))).map(ty => (
              <Pill key={ty}>{ty}</Pill>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

/** `safety` — unveraenderliche Regeln und das Torprotokoll. */
export function BuddySafetyReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Safety" quelle={QUELLE_ENG} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Immutable rules" sub={`${SAFETY_RULES.length} Regeln`}
              attrappe={marke(QUELLE_ENG)}>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {SAFETY_RULES.map(r => (
              <div key={r.rule} style={{
                padding: '9px 11px', background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 6,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
                  {r.rule}
                </div>
                <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.45 }}>
                  {r.detail}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Gate log" sub={`${GATE_LOG.length} Eintraege`}
              attrappe={marke(QUELLE_ENG)}>
          <div className="v2-col-gap" style={{ gap: 8 }}>
            {GATE_LOG.map((g, i) => (
              <div key={i} style={{
                padding: 11, borderRadius: 6,
                background: 'color-mix(in oklch, var(--warn) 5%, var(--surface))',
                border: '1px solid color-mix(in oklch, var(--warn) 24%, var(--border))',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5,
                }}>
                  <Pill>{g.verdict}</Pill>
                  <span className="v2-mono v2-dim" style={{ fontSize: 10.5 }}>
                    {g.reason}
                  </span>
                  <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                    {g.at}
                  </span>
                </div>
                <div className="v2-muted" style={{
                  fontSize: 11, lineHeight: 1.45, textDecoration: 'line-through',
                }}>
                  {g.before}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

/** `butler` — was Buddy auf Zuruf erfasst. */
export function BuddyButlerReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Butler" quelle={QUELLE_ENG} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Recent actions" sub={`${BUTLER_LOG.length} Eintraege`}
              attrappe={marke(QUELLE_ENG)}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>Wann</th>
                  <th>Gesagt</th>
                  <th style={{ width: 120 }}>Absicht</th>
                  <th style={{ width: 70, textAlign: 'right' }}>Sicher</th>
                  <th style={{ width: 110 }}>Stand</th>
                </tr>
              </thead>
              <tbody>
                {BUTLER_LOG.map((b, i) => (
                  <tr key={i}>
                    <td className="v2-num v2-muted">{b.at}</td>
                    <td>{b.said}</td>
                    <td className="v2-mono v2-dim" style={{ fontSize: 10.5 }}>{b.intent}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{b.conf}</td>
                    <td>
                      <Pill variant={b.status === 'executed' ? 'pos' : undefined}>
                        {b.status}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Confidence threshold" sub="ab wann ohne Rueckfrage"
              attrappe={marke(QUELLE_ENG)}>
          <Row label="Sofort ausfuehren" value="ab 0.90" />
          <Row label="Vorschau zeigen" value="0.60 – 0.90" />
          <Row label="Nachfragen" value="unter 0.60" />
        </Card>

        <Card title="What I can write" sub={`${BUTLER_INTENTS.length} Absichten`}
              attrappe={marke(QUELLE_ENG)}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 130 }}>Absicht</th>
                  <th style={{ width: 120 }}>Ziel</th>
                  <th>Beispielsatz</th>
                </tr>
              </thead>
              <tbody>
                {BUTLER_INTENTS.map(b => (
                  <tr key={b.type}>
                    <td>{b.label}</td>
                    <td><Pill>{b.target}</Pill></td>
                    <td className="v2-muted">{b.ex}</td>
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

/** `voice` — Sitzungszustaende und Sprachbefehle. */
export function BuddyVoiceReferenz() {
  const phasen = [
    ['IDLE', 'Idle', 'Waiting for the hotword or a tap'],
    ['SESSION_START', 'Session start', 'Routine loaded · energy check 1-5'],
    ['EXERCISE_INTRO', 'Exercise intro', "Names the lift and last week's numbers"],
    ['SET_ACTIVE', 'Set active', 'Silent — cues only on the last two reps'],
    ['SET_COMPLETE', 'Set complete', 'Asks weight, then reps, then logs'],
    ['REST', 'Rest', 'Timer running · accepts extend / skip'],
    ['SESSION_COMPLETE', 'Session complete', 'Volume, PRs, duration'],
    ['SUMMARY', 'Summary', 'Written back to Training · rating asked'],
  ]
  const befehle = [
    ['set_complete', 'fertig', 'SET_COMPLETE'],
    ['log_weight', '117,5 kilo', 'weight = 117.5'],
    ['log_reps', 'elf reps', 'reps = 11'],
    ['log_rpe', 'rpe 8', 'rpe = 8'],
    ['log_rpe', 'war schwer', 'rpe = 9'],
    ['log_rpe', 'war leicht', 'rpe = 5'],
  ]
  return (
    <>
      <ReferenzTrenner reiter="Voice / Live" quelle={QUELLE_VOICE} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Session state machine" sub={`${phasen.length} Phasen`}
              attrappe={marke(QUELLE_VOICE)}>
          <div className="v2-col-gap" style={{ gap: 5 }}>
            {phasen.map(([id, label, desc], i) => (
              <div key={String(id)} style={{
                display: 'grid', gridTemplateColumns: '30px 150px 1fr',
                gap: 10, alignItems: 'center', fontSize: 11.5,
                padding: '8px 10px', background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 6,
              }}>
                <span className="v2-num v2-dim">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontWeight: 600 }}>{label}</span>
                <span className="v2-dim">{desc}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Gym commands" sub="Mustervergleich auf dem Geraet, kein Modell"
              attrappe={marke(QUELLE_VOICE)}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 140 }}>Absicht</th>
                  <th style={{ width: 160 }}>Beispiel</th>
                  <th>Ergebnis</th>
                </tr>
              </thead>
              <tbody>
                {befehle.map(([i, ex, em]) => (
                  <tr key={String(ex)}>
                    <td className="v2-mono" style={{ fontSize: 10.5 }}>{i}</td>
                    <td>{ex}</td>
                    <td className="v2-mono v2-dim" style={{ fontSize: 10.5 }}>{em}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
            Kein Sprachmodell waehrend der Einheit — die Befehle werden
            gegen feste Muster auf dem Geraet geprueft. Spracherkennung
            ist Whisper.cpp, lokal.
          </div>
        </Card>
      </div>
    </>
  )
}

/** `knowledge` — die Wissensbasis. */
export function BuddyKnowledgeReferenz() {
  const eintraege = [
    ['KB-118', 'Creatine loading is optional', 'Supplements', 0.96,
     'A 20 g/day loading phase saturates muscle stores in about a week; 3-5 g daily reaches the same saturation in three to four weeks.'],
    ['KB-104', 'Protein distribution across the day', 'Nutrition', 0.91,
     'Four doses of roughly 0.4 g/kg spread evenly outperform two large doses for 24-hour muscle protein synthesis.'],
  ]
  return (
    <>
      <ReferenzTrenner reiter="Knowledge" quelle={QUELLE_KNOW} />
      <Card title="Knowledge base" sub="pgvector · Auszug aus 1.240"
            attrappe={marke(QUELLE_KNOW)}>
        <div className="v2-col-gap" style={{ gap: 8 }}>
          {eintraege.map(([id, titel, thema, konf, satz]) => (
            <div key={String(id)} style={{
              padding: 11, background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 6,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
                flexWrap: 'wrap',
              }}>
                <span className="v2-num v2-dim" style={{ fontSize: 10.5 }}>{id}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{titel}</span>
                <Pill>{thema}</Pill>
                <span className="v2-num v2-dim" style={{ marginLeft: 'auto', fontSize: 10.5 }}>
                  Sicherheit {konf}
                </span>
              </div>
              <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                {satz}
              </div>
            </div>
          ))}
        </div>
        <div className="v2-divider" />
        <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
          Der Abruf laeuft vor jeder wissenschaftlichen Aussage. Wird
          nichts gefunden, faellt die Aussage weg — und die Quelle steht
          in einer Karte, nie im gesprochenen Text.
        </div>
      </Card>
    </>
  )
}

/** `rules` — das Regelwerk. */
export function BuddyRulesReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Rules" quelle={QUELLE_KNOW} />
      <Card title="Regelwerk" sub="was Buddy darf und was nicht"
            attrappe={marke(QUELLE_KNOW)}>
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {SAFETY_RULES.slice(0, 6).map(r => (
            <div key={r.rule} style={{
              display: 'grid', gridTemplateColumns: '210px 1fr',
              gap: 10, alignItems: 'baseline', fontSize: 11.5,
              padding: '8px 10px', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 6,
            }}>
              <span style={{ fontWeight: 600 }}>{r.rule}</span>
              <span className="v2-dim">{r.detail}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

/** `overrides` — was der Coach an Buddy uebersteuert. */
export function BuddyOverridesReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Coach overrides" quelle={QUELLE_META} />
      <Card title="Coach overrides" sub="wo der Mensch Buddy uebersteuert"
            attrappe={marke(QUELLE_META)}>
        <div style={{ overflowX: 'auto' }}>
          <table className="v2-tbl">
            <thead>
              <tr>
                <th style={{ width: 170 }}>Bereich</th>
                <th style={{ width: 150 }}>Coach</th>
                <th>Was gilt stattdessen</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Trainingsvorgabe', 'Anders Lindqvist', 'RPE-basiert statt Prozent vom 1RM'],
                ['Makroanpassung', 'Jana Bauer', 'nach Gewichtstrend, nicht nach Absolutwert'],
                ['Erholungseingriff', 'Anders Lindqvist', 'Coach entscheidet ueber Deload, nicht Buddy'],
              ].map(([b, c, w]) => (
                <tr key={String(b)}>
                  <td>{b}</td>
                  <td className="v2-muted">{c}</td>
                  <td className="v2-muted">{w}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

/** `clone` — der Klon und die Studiosuche. */
export function BuddyCloneReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Clone & Gym" quelle={QUELLE_KNOW} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="What the clone knows" sub="was weitergegeben wird"
              attrappe={marke(QUELLE_KNOW)}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {Array.from(new Set(BUDDY_MEMORY.map(m => m.cat))).map(c => (
              <Pill key={c}>{c}</Pill>
            ))}
          </div>
          <div className="v2-dim" style={{ fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>
            Der Klon bekommt die Kategorien des Gedaechtnisses, nicht die
            Einzeleintraege — {BUDDY_MEMORY.length} Punkte stehen dahinter.
          </div>
        </Card>

        <Card title="Recent clone answers" sub="was der Klon beantwortet hat"
              attrappe={marke(QUELLE_KNOW)}>
          <div className="v2-col-gap" style={{ gap: 7 }}>
            {BUDDY_CHAT_HISTORY.filter(m => m.from === 'buddy').slice(0, 3).map((m, i) => (
              <div key={i} style={{
                padding: 10, background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 6,
              }}>
                <div className="v2-dim v2-mono" style={{ fontSize: 10, marginBottom: 3 }}>
                  {m.at}
                </div>
                <div style={{ fontSize: 11.5, lineHeight: 1.5 }}>{m.body}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Gym finder" sub="Studios in der Naehe"
              attrappe={marke(QUELLE_KNOW)}>
          {/* `[read]` **Hier steht bewusst KEINE gebaute Ansicht.**
              Der Entwurf zeigt echte Studios mit Entfernung; die Liste
              haengt an Standortdaten, die es im Repo nicht gibt.
              **Erfundene Studios waeren eine Falschaussage** (C-378) —
              die Leerkachel nennt stattdessen, was fehlt. */}
          <div style={{
            padding: 12, borderRadius: 6,
            background: 'var(--surface-2)', border: '1px dashed var(--border)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              Keine Standortdaten
            </div>
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
              Der Entwurf zeigt Studios mit Entfernung, Geraetebestand und
              Oeffnungszeiten. Im Repo liegt keine Quelle dafuer — und
              erfundene Studios waeren nicht vergleichbar, sondern falsch.
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
