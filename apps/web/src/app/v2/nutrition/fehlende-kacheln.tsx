'use client'

// Die Mockup-Kacheln, die OBERHALB der Linie fehlen — G-365, E-68.
//
// **Tom, 2026-09-07:** *,,oben wird alles angezeigt das angebunden ist
// plus attrappen aus dem mockup welche oben noch fehlen, und unter dem
// strich wird das ganze mockup angezeigt."*
//
// ## Was gemessen wurde
//
// `[cmd]` **2026-09-07, Titelabgleich am Schirm je Reiter.** Der
// Vergleich meldet Verdachtsfaelle; **jeder wurde von Hand
// entschieden**, weil gebaute Kacheln deutsche Namen tragen:
//
//     Macro split · 14d avg    gebaut als `Macro split · 30d avg`
//     Naehrstoffbaum           gebaut als `Naehrstoffordnung`
//     Diet type/Categories/…   gebaut, prefs deckt sich
//
// **Was uebrig blieb:**
//
//     insights  Micronutrient trend
//     plans     Shopping list · Scale list
//
// `[cmd]` **Und `diary` blieb NICHT uebrig** — der Vergleich meldete
// dort vier, alle vier sind gebaut. Begruendung unten am
// diary-Vermerk. **Das ist die Grenze des Titelvergleichs**, nicht
// ein Befund am Produkt.
import * as React from 'react'
import { Card, Pill } from '@lumeos/ui'

const QUELLE = 'theme-v1/module-nutrition.jsx'
const QUELLE_SPEC = 'theme-v1/module-nutrition-spec.jsx'

function marke(quelle: string, wartet: string): string {
  return `Attrappe — ${quelle} · wartet auf: ${wartet}`
}

function Vermerk({ titel, sub, quelle, wartet, was }: {
  titel: string
  sub: string
  quelle: string
  wartet: string
  was: string
}) {
  return (
    <Card title={titel} sub={sub} attrappe={marke(quelle, wartet)}>
      <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
        {was}
      </div>
    </Card>
  )
}

/**
 * `diary`: KEINE fehlende Kachel.
 *
 * `[cmd]` **Der Titelvergleich meldete vier** — `Pre-workout window`,
 * `Hydration`, `Micronutrient snapshot`, `Below threshold`. **Alle
 * vier sind gebaut**, gemessen 2026-09-07 in `ansicht.tsx:589-605`:
 * `PreWorkoutEcht`, `HydrationKachel`, `MikroSchnappschuss`,
 * `UnterSchwelle`.
 *
 * `[read]` **Sie fielen auf, weil die gebauten Kacheln keinen
 * `.v2-card-title` tragen** — der Vergleich sah oben keinen Titel und
 * hielt sie fuer abwesend. **Das ist die Grenze des Werkzeugs, kein
 * Befund am Produkt.**
 *
 * `[read]` **Diese Komponente bleibt als Vermerk stehen**, damit der
 * naechste Durchgang nicht dieselben vier erneut als Luecke meldet.
 */

// `[read]` Listen ausserhalb des JSX: ein mehrzeiliger `as Array<…>`
// im Rumpf bricht die JSX-Analyse (TS1005).
const MIKRO_30T: Array<[string, number]> = [
  ['Vit C', 82], ['Vit D', 42], ['Iron', 91], ['Ca', 74],
  ['Mg', 68], ['Zn', 85], ['B12', 93], ['Omega-3', 55],
]
const EINKAUF: Array<[string, string, string]> = [
  ['Haferflocken', '560 g', 'Fruehstueck x7'],
  ['Whey · Vanille', '245 g', 'Fruehstueck x7'],
  ['Haehnchenbrust', '1260 g', 'Mittag x7'],
  ['Basmati', '1400 g', 'Mittag x7'],
  ['Lachs', '400 g', 'Abend x2'],
  ['Huettenkaese', '1400 g', 'Snack x7'],
]
const SKALIERUNG: Array<[string, string, string]> = [
  ['1 Person', '560 g', '1260 g'],
  ['2 Personen', '1120 g', '2520 g'],
  ['4 Personen', '2240 g', '5040 g'],
]

/** `insights`: die eine Kachel, die oben fehlt. */
export function FehlendeInsightsKacheln() {
  return (
    <Card title="Micronutrient trend" sub="30 days · top 8"
          attrappe={marke(QUELLE,
            'eine Waermekarte ueber 30 Tage — die Tagesdeckung liegt '
            + 'vor, die Reihe darueber wird nicht gebildet')}>
      <div className="v2-col-gap" style={{ gap: 3 }}>
        {MIKRO_30T.map(([n, basis]) => (
          <div key={n} style={{
            display: 'grid', gridTemplateColumns: '68px 1fr 40px',
            gap: 8, alignItems: 'center',
          }}>
            <span className="v2-dim" style={{ fontSize: 10.5 }}>{n}</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: 30 }).map((_, d) => {
                const v = Math.max(20, Math.min(100,
                  basis + ((d * 7 + n.length * 11) % 25) - 12))
                return (
                  <div key={d} style={{
                    flex: 1, height: 14, borderRadius: 2,
                    background: v >= 80 ? 'var(--pos)'
                      : v >= 60 ? 'var(--acc-nutri)' : 'var(--warn)',
                    opacity: 0.35 + (v / 100) * 0.65,
                  }} />
                )
              })}
            </div>
            <span className="v2-num" style={{ fontSize: 10.5, textAlign: 'right' }}>
              {basis}%
            </span>
          </div>
        ))}
      </div>
      <div className="v2-divider" />
      <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
        Gruen ab 80 % der Zielmenge, orange darunter. Die Zahl rechts
        ist der heutige Stand.
      </div>
    </Card>
  )
}

/** `plans`: die zwei Kacheln, die oben fehlen. */
export function FehlendePlanKacheln() {
  return (
    <>
      <Card title="Shopping list" sub="aus der Planwoche abgeleitet"
            attrappe={marke(QUELLE_SPEC,
              'nichts — Einkaufslisten sind gebaut und stehen auf '
              + '`einkauf` (E-64); im Planreiter fehlt der Einstieg')}>
        <div style={{ overflowX: 'auto' }}>
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Zutat</th>
                <th style={{ width: 90, textAlign: 'right' }}>Menge</th>
                <th style={{ width: 130 }}>woher</th>
              </tr>
            </thead>
            <tbody>
              {EINKAUF.map(([z, m, woher]) => (
                <tr key={z}>
                  <td>{z}</td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{m}</td>
                  <td className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>{woher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Scale list" sub="Mengen je Portionszahl"
            attrappe={marke(QUELLE_SPEC,
              'einen Skalierungsfaktor je Liste — `shopping_lists` '
              + 'kennt kein Feld dafuer')}>
        <div style={{ overflowX: 'auto' }}>
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Umfang</th>
                <th style={{ width: 110, textAlign: 'right' }}>Haferflocken</th>
                <th style={{ width: 130, textAlign: 'right' }}>Haehnchenbrust</th>
              </tr>
            </thead>
            <tbody>
              {SKALIERUNG.map(([wer, a, b], i) => (
                <tr key={wer}>
                  <td>
                    {wer}
                    {i === 0 && <Pill style={{ marginLeft: 6 }}>aktuell</Pill>}
                  </td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{a}</td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
