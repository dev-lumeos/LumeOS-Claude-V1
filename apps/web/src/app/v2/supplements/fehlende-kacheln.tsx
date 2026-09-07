'use client'

// Die Mockup-Kacheln, die OBERHALB der Linie fehlen — G-365, E-68.
//
// **Tom, 2026-09-07:** *,,oben wird alles angezeigt das angebunden ist
// plus attrappen aus dem mockup welche oben noch fehlen, und unter dem
// strich wird das ganze mockup angezeigt."*
//
// ## Berichtigt am 2026-09-07
//
// **Tom nennt sie einzeln:** *,,Supplements/auswertung gap analysis &
// timing conflicts fake, Supplements/wechselwirkungen Detected
// interactions fake & intake block fehlt oben, Supplement/kosten alles
// fake."*
//
// `[read]` **Alle waren Rahmen mit einem Satz darin.** Diese Fassung
// baut die Ansicht aus `spec-daten.ts` — `GAP_ROWS`, `INTERACTION_DB`,
// `SEVERITY_META`.
//
// ## Der Kostenreiter hat EINEN Grund
//
// `[cmd]` **`supplements.supplements` fuehrt keinen Preis je Portion
// und keine Portionsgroesse** — der alte 44-Zeilen-Katalog hatte
// beides, der neue mit 566 Zeilen nicht. **Das blockiert jede
// Kostenrechnung**, nicht nur eine Kachel. Der Grund steht woertlich
// an der gebauten `Cost basis`-Kachel (`tabs.tsx:998`).
import * as React from 'react'
import { Card, Pill, Row } from '@lumeos/ui'

import { GAP_ROWS, INTERACTION_DB } from './spec-daten'

const QUELLE = 'theme-v1/module-supplements-spec.jsx'

/** E-68: Quelle UND Grund. */
function marke(wartet: string): string {
  return `Attrappe — ${QUELLE} · wartet auf: ${wartet}`
}

/** Der Grund, der den ganzen Kostenreiter blockiert. */
const OHNE_PREIS =
  'einen Preis je Portion — `supplements.supplements` fuehrt weder '
  + 'Preis noch Portionsgroesse (siehe `Cost basis`, tabs.tsx:998)'

// `[read]` Listen ausserhalb des JSX: ein mehrzeiliger `as Array<…>`
// im Rumpf bricht die JSX-Analyse (TS1005).
const MONATE: Array<[string, number]> = [
  ['Jun', 178], ['Jul', 182], ['Aug', 191], ['Sep', 186],
  ['Okt', 204], ['Nov', 198], ['Dez', 212], ['Jan', 208],
  ['Feb', 196], ['Mrz', 214], ['Apr', 219], ['Mai', 224],
]
const JE_PRAEPARAT: Array<[string, string, string]> = [
  ['Testosterone Cypionate', '64.00', 'Hormone'],
  ['MK-677', '48.00', 'GH Secretagogue'],
  ['Whey Protein Isolate', '39.90', 'Protein'],
  ['Kreatin Monohydrat', '12.50', 'Leistung'],
  ['Magnesium Glycinat', '18.90', 'Mineral'],
  ['Vitamin D3 + K2', '14.50', 'Vitamin'],
  ['Omega-3 (EPA/DHA)', '26.20', 'Fettsaeure'],
]
const KATEGORIEN: Array<[string, number, string]> = [
  ['Hormone', 112, 'var(--acc-suppl)'],
  ['Protein', 40, 'var(--acc-train)'],
  ['Vitamine', 33, 'var(--acc-nutri)'],
  ['Mineralien', 19, 'var(--acc-recov)'],
  ['Leistung', 20, 'var(--acc-goals)'],
]
const EINNAHMEBLOCK: Array<[string, string, string]> = [
  ['07:00', 'Vitamin D3 + K2 · Omega-3 · Kreatin', 'ok'],
  ['12:30', 'Whey Isolate · Zink', 'Abstand zu Magnesium'],
  ['19:00', 'Magnesium Glycinat · Ashwagandha', 'ok'],
  ['22:00', 'Magnesium · Melatonin', 'ok'],
]
const NAECHSTE_GABEN: Array<[string, string, string]> = [
  ['16:30', 'Kreatin Monohydrat', '5 g'],
  ['19:00', 'Magnesium Glycinat', '400 mg'],
  ['Mo 07:00', 'Testosterone Cypionate', '150 mg'],
]
const AKTIVE_KUREN: Array<[string, string, string, string]> = [
  ['MK-677', '7/12', '2026-04-01', '2026-06-24'],
  ['Testosterone Cypionate', 'dauerhaft', 'seit 2024-09', '—'],
]
const SPARVORSCHLAEGE: Array<[string, string, string]> = [
  ['Kreatin in 1-kg-Gebinde', '−4.80 / Monat', 'gleiche Marke, groesserer Beutel'],
  ['Omega-3: Dublette', '−26.20 / Monat', 'zwei Praeparate mit EPA/DHA'],
  ['Vitamin D getrennt kaufen', '−3.10 / Monat', 'K2 ist bereits im Multi'],
]

/** `cost`: die sieben Kacheln, die oben fehlen. */
export function FehlendeKostenKacheln() {
  const max = Math.max(...MONATE.map(([, v]) => v))
  const summe = JE_PRAEPARAT.reduce((s, [, p]) => s + Number(p), 0)
  const kennzahlen: Array<[string, string, string]> = [
    ['Monthly', `${summe.toFixed(2)} EUR`, 'Ausgaben im Monat'],
    ['Annual run-rate', `${(summe * 12).toFixed(0)} EUR`, 'hochgerechnet'],
    ['Per active day', `${(summe / 30).toFixed(2)} EUR`, 'je Tag mit Einnahme'],
  ]
  return (
    <>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 10 }}>
        {kennzahlen.map(([t, v, s]) => (
          <Card key={t} className="v2-card-tight" style={{ padding: 14 }}
                attrappe={marke(OHNE_PREIS)}>
            <div className="v2-eyebrow">{t}</div>
            <div className="v2-num" style={{ fontSize: 20, fontWeight: 500 }}>{v}</div>
            <div className="v2-dim" style={{ fontSize: 11, marginTop: 2 }}>{s}</div>
          </Card>
        ))}
      </div>

      <Card title="Cost · 12 months trend" sub="Ausgabenverlauf"
            attrappe={marke(OHNE_PREIS)}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 78 }}>
          {MONATE.map(([m, v]) => (
            <div key={m} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: `${(v / max) * 60}px`,
                background: v === max ? 'var(--warn)' : 'var(--acc-suppl)',
                borderRadius: 2,
              }} />
              <div className="v2-num v2-dim" style={{ fontSize: 8, marginTop: 3 }}>{v}</div>
              <div className="v2-dim" style={{ fontSize: 8 }}>{m}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Spend per supplement · this month" sub="je Praeparat"
            attrappe={marke(OHNE_PREIS)}>
        <div style={{ overflowX: 'auto' }}>
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Praeparat</th>
                <th style={{ width: 130 }}>Gruppe</th>
                <th style={{ width: 90, textAlign: 'right' }}>EUR</th>
              </tr>
            </thead>
            <tbody>
              {JE_PRAEPARAT.map(([n, p, g]) => (
                <tr key={n}>
                  <td>{n}</td>
                  <td><Pill>{g}</Pill></td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Category split" sub="nach Wirkstoffgruppe"
            attrappe={marke(OHNE_PREIS)}>
        <div style={{
          display: 'flex', height: 26, borderRadius: 6,
          overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 10,
        }}>
          {KATEGORIEN.map(([k, v, c]) => (
            <div key={k} style={{ flex: v, background: c, opacity: 0.7 }} />
          ))}
        </div>
        <div className="v2-col-gap" style={{ gap: 5 }}>
          {KATEGORIEN.map(([k, v, c]) => (
            <div key={k} style={{
              display: 'grid', gridTemplateColumns: '16px 1fr 70px',
              gap: 8, alignItems: 'center', fontSize: 11,
            }}>
              <span style={{
                width: 11, height: 11, borderRadius: 3, background: c, opacity: 0.7,
              }} />
              <span className="v2-dim">{k}</span>
              <span className="v2-num" style={{ textAlign: 'right' }}>{v}.00 EUR</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="If you removed…" sub="Ersparnis je Praeparat"
            attrappe={marke(OHNE_PREIS)}>
        <div className="v2-col-gap" style={{ gap: 5 }}>
          {JE_PRAEPARAT.slice(0, 4).map(([n, p]) => (
            <div key={n} style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11.5, padding: '7px 0',
              borderBottom: '1px solid var(--border)',
            }}>
              <span>{n}</span>
              <span className="v2-num" style={{ color: 'var(--pos)' }}>
                −{p} / Monat
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Cost optimization · suggestions" sub="Sparvorschlaege"
            attrappe={marke(OHNE_PREIS)}>
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {SPARVORSCHLAEGE.map(([was, wieviel, warum]) => (
            <div key={was} style={{
              padding: 10, borderRadius: 6,
              background: 'color-mix(in oklch, var(--pos) 5%, var(--surface))',
              border: '1px solid color-mix(in oklch, var(--pos) 22%, var(--border))',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3,
              }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{was}</span>
                <span className="v2-num" style={{
                  marginLeft: 'auto', fontSize: 11, color: 'var(--pos)',
                }}>{wieviel}</span>
              </div>
              <div className="v2-dim" style={{ fontSize: 10.5 }}>{warum}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

/** `intel`: die zwei Kacheln, die oben fehlen. */
export function FehlendeIntelKacheln() {
  const konflikte = INTERACTION_DB.filter(i => i.timing.startsWith('separate'))
  return (
    <>
      <Card title="Gap analysis" sub="Deckung gegen Bedarf"
            attrappe={marke(
              'einen Sollwert je Naehrstoff im Supplements-Zusammenhang '
              + '— die Zielwerte liegen in `nutrition`, die Deckung wird '
              + 'hier nicht dagegen gerechnet')}>
        <div style={{ overflowX: 'auto' }}>
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Naehrstoff</th>
                <th style={{ width: 90, textAlign: 'right' }}>Nahrung</th>
                <th style={{ width: 90, textAlign: 'right' }}>Praeparat</th>
                <th style={{ width: 80, textAlign: 'right' }}>Ziel</th>
                <th style={{ width: 130 }}>Deckung</th>
              </tr>
            </thead>
            <tbody>
              {GAP_ROWS.map(g => {
                const pct = Math.round(((g.nutrition + g.supp) / g.rda) * 100)
                return (
                  <tr key={g.code}>
                    <td>{g.name}</td>
                    <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>
                      {g.nutrition}
                    </td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>
                      {g.supp || '—'}
                    </td>
                    <td className="v2-num v2-dim" style={{ textAlign: 'right' }}>
                      {g.rda} {g.unit}
                    </td>
                    <td>
                      <div style={{
                        height: 8, background: 'var(--surface-2)',
                        borderRadius: 999, overflow: 'hidden', position: 'relative',
                      }}>
                        <div style={{
                          height: '100%', width: `${Math.min(pct, 100)}%`,
                          background: pct >= 100 ? 'var(--pos)'
                            : pct >= 70 ? 'var(--acc-suppl)' : 'var(--warn)',
                          borderRadius: 999,
                        }} />
                      </div>
                      <div className="v2-num v2-dim" style={{ fontSize: 9.5, marginTop: 2 }}>
                        {pct} %
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Timing conflicts" sub={`${konflikte.length} Paare mit Abstand`}
            attrappe={marke(
              'eine Auswertung der Einnahmezeiten gegen die Regeln — '
              + 'die Regeln stehen, die Uhrzeiten auch, aber nichts '
              + 'haelt sie gegeneinander')}>
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {konflikte.map(k => (
            <div key={k.a + k.b} style={{
              padding: 10, borderRadius: 6,
              background: k.severity === 'warning'
                ? 'color-mix(in oklch, var(--warn) 6%, var(--surface))'
                : 'var(--surface)',
              border: `1px solid ${k.severity === 'warning'
                ? 'color-mix(in oklch, var(--warn) 24%, var(--border))'
                : 'var(--border)'}`,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3,
                flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{k.a}</span>
                <span className="v2-dim">+</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{k.b}</span>
                <Pill style={{ marginLeft: 'auto' }}>
                  {k.timing.replace(/_/g, ' ')}
                </Pill>
              </div>
              <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
                {k.note}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

/** `interactions`: die zwei Kacheln, die oben fehlen. */
export function FehlendeInteraktionsKacheln() {
  const farbe = (s: string) => s === 'critical' ? 'var(--neg)'
    : s === 'warning' ? 'var(--warn)'
    : s === 'caution' ? 'var(--acc-recov)' : 'var(--fg-dim)'
  return (
    <>
      <Card title="Detected interactions" sub={`${INTERACTION_DB.length} Treffer im eigenen Stack`}
            attrappe={marke(
              'nichts — die Regeln werden ausgewertet und die Treffer '
              + 'stehen oben unter `Getroffen auf`; der Entwurf zeigt '
              + 'sie als eigene Liste mit Schweregrad')}>
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {INTERACTION_DB.map(i => {
            const c = farbe(i.severity)
            return (
              <div key={i.a + i.b} style={{
                display: 'flex', gap: 11, padding: 11, borderRadius: 6,
                background: `color-mix(in oklch, ${c} 5%, var(--surface))`,
                border: `1px solid color-mix(in oklch, ${c} 24%, var(--border))`,
              }}>
                <div style={{
                  width: 3, alignSelf: 'stretch', background: c, borderRadius: 2,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3,
                    flexWrap: 'wrap',
                  }}>
                    <Pill style={{
                      color: c,
                      borderColor: `color-mix(in oklch, ${c} 35%, var(--border))`,
                    }}>{i.severity}</Pill>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>
                      {i.a} + {i.b}
                    </span>
                    <span className="v2-dim v2-mono" style={{
                      marginLeft: 'auto', fontSize: 10,
                    }}>{i.timing.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.45 }}>
                    {i.note}
                  </div>
                  {i.blocks && (
                    <Pill variant="warn" style={{ marginTop: 5 }}>blockiert</Pill>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card title="Intake block" sub="was heute zusammen genommen wird"
            attrappe={marke(
              'eine Auswertung der Tageseinnahmen gegen die Regeln — '
              + 'der Entwurf zeigt den Block oben, ueber dem Regelwerk')}>
        <div className="v2-col-gap" style={{ gap: 5 }}>
          {EINNAHMEBLOCK.map(([zeit, was, stand]) => (
            <div key={zeit} style={{
              display: 'grid', gridTemplateColumns: '60px 1fr 160px',
              gap: 10, alignItems: 'center', fontSize: 11.5,
              padding: '8px 10px', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 5,
            }}>
              <span className="v2-num v2-dim">{zeit}</span>
              <span>{was}</span>
              <Pill variant={stand === 'ok' ? 'pos' : 'warn'}>{stand}</Pill>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}


/**
 * `today`: die zwei Kacheln, die oben fehlen.
 *
 * `[cmd]` **Tom, 2026-09-07:** *,,Supplements/heute oben fehlen
 * mockups wie Next dose/Active cycles."* — gemessen am Schirm: oben
 * stehen `Refills` und `Stack`, unten zusaetzlich diese beiden.
 */
export function FehlendeHeuteKacheln() {
  return (
    <>
      <Card title="Next dose" sub="was als Naechstes ansteht"
            attrappe={marke(
              'eine Faelligkeitsrechnung je Eintrag — `user_stacks` '
              + 'traegt die Uhrzeit, aber nichts leitet daraus den '
              + 'naechsten Termin ab')}>
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {NAECHSTE_GABEN.map(([zeit, was, menge]) => (
            <div key={zeit + was} style={{
              display: 'grid', gridTemplateColumns: '62px 1fr 90px',
              gap: 10, alignItems: 'center', fontSize: 11.5,
              padding: '8px 10px', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 5,
            }}>
              <span className="v2-num v2-dim">{zeit}</span>
              <span>{was}</span>
              <span className="v2-num" style={{ textAlign: 'right' }}>{menge}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Active cycles" sub="laufende Kuren"
            attrappe={marke(
              'nichts — `supplements.user_supplement_cycles` existiert; '
              + 'die Kachel ist auf diesem Reiter nur nicht gebaut')}>
        <div className="v2-col-gap" style={{ gap: 7 }}>
          {AKTIVE_KUREN.map(([name, woche, von, bis]) => (
            <div key={name}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
              }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{name}</span>
                <Pill>{woche}</Pill>
                <span className="v2-dim v2-mono" style={{
                  marginLeft: 'auto', fontSize: 10,
                }}>{von} – {bis}</span>
              </div>
              <div style={{
                height: 7, background: 'var(--surface-2)',
                borderRadius: 999, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${(Number(woche.split('/')[0]) / Number(woche.split('/')[1])) * 100}%`,
                  background: 'var(--acc-suppl)', borderRadius: 999,
                }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
