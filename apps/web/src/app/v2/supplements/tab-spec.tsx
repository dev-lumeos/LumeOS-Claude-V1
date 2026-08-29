'use client'

// Die vier Tabs aus `-spec.jsx` (G-45).
//
// QUELLE: theme-v1/module-supplements-spec.jsx
//   SuppCatalogView       Zeile 252-366
//   SuppStacksView        Zeile 509-589
//   SuppIntelligenceView  Zeile 590-702
//   SuppInventoryView     Zeile 775-851
//
// `[read]` Tom, 2026-08-18: „In Supplements nochmal an den
// Subnavigationen checken und das Mockup duplizieren."
//
// `[cmd]` ALLE VIER SIND TABS DESSELBEN RAHMENS, kein eigener
// Bereich: `module-supplements.jsx:240-253` listet sie in der
// Tab-Leiste, `:266-271` rendert sie im selben Rumpf. `app.jsx:123`
// fuehrt genau einen Fall fuer Supplements.
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// wiederkehrende Inline-Raster in `supplements.css`, Fenster ueber
// den Kontext statt `window.dispatchEvent`.
//
// `[cmd]` ALLES IST ATTRAPPE. Das `supplements`-Schema fuehrt seit
// C-68 fuenf Tabellen, aber keine fuer Katalog, Stacks, Luecken oder
// Bestand. Was fehlt, steht im Bericht.
import * as React from 'react'
import { Card, Pill, Icon, Row, Meter, InEntwicklungKnopf } from '@lumeos/ui'

import {
  CATALOG, EVIDENCE_GRADES, gradeMeta, GAP_ROWS, INVENTORY,
  type KatalogEintrag,
} from './spec-daten'
import { useSupp } from './kontext'
import {
  stackListeSatz, vorlagenLageVon, VORLAGEN_LEER_SATZ, frequenzSatz,
} from '../../../lib/supplements/stack-lage'

const ATTRAPPE = 'Es gibt keine Tabelle dafuer — die Zahlen stammen aus der Vorlage.'

/** Das farbige Quadrat mit der Evidenzstufe (Vorlage Zeile 315). */
function Stufe({ g }: { g: string }) {
  const m = gradeMeta(g)
  return (
    <span
      className="v2-supp-grade"
      style={{
        background: `color-mix(in oklch, ${m.c} 18%, transparent)`,
        border: `1px solid color-mix(in oklch, ${m.c} 40%, transparent)`,
        color: m.c,
      }}
    >
      {g}
    </span>
  )
}

// ═══ CATALOG — GELOESCHT (G-172) ══════════════════
//
// `[cmd]` Hier stand `SuppCatalog`: ein Entwurf aus `spec-daten.ts`
// mit der Marke „Es gibt keine Tabelle dafuer — die Zahlen stammen
// aus der Vorlage“. Daneben hing die ECHTE Substanzdatenbank am
// `Database`-Knopf im Kopf — **zwei Einstiege in dieselbe Sache,
// einer davon Vorlage.**
//
// `[read]` **Geloescht, nicht versteckt.** Ein auskommentierter
// Entwurf sieht beim naechsten Lesen aus wie etwas, das man wieder
// einschalten koennte. Der Tab `Katalog` zeigt jetzt
// `SuppDatabase` mit den 566 Substanzen aus `substance_catalog`
// (C-229).

// ═══ STACKS ═══════════════════════════════════════════════════════
//
// `[cmd]` **G-253: die vier Kacheln haengen an echten Tabellen** —
// drei davon an Daten, die die Seite ohnehin schon laedt.
//
//     My stacks           `user_stacks` ueber `ladeEigeneStacks`
//     System templates    `stack_templates` — EXISTIERT, ist LEER
//     Frequency options   `stack_items.frequency`, gezaehlt
//     Item customization  `stack_items` (dose, timing, cycling)
//
// `[read]` **Ein neuer Leser wurde gebaut und wieder verworfen:**
// `ladeEigeneStacks` laedt die Liste bereits, ihr fehlten nur drei
// Felder. **Erweitert statt danebengestellt** — G-249 und G-11
// mussten genau diese Doppelung wieder ausbauen.
export function SuppStacks() {
  const { daten, stacks } = useSupp()
  const positionen = daten?.positionen ?? []

  // Die Frequenzen, die im Bestand vorkommen — gezaehlt, nicht
  // aus einer Liste behauptet.
  const frequenzen = React.useMemo(() => {
    const z = new Map<string, number>()
    for (const p of positionen) z.set(p.frequency, (z.get(p.frequency) ?? 0) + 1)
    return Array.from(z, ([wert, anzahl]) => ({ wert, anzahl }))
      .sort((a, b) => b.anzahl - a.anzahl)
  }, [positionen])

  const listenSatz = stackListeSatz(stacks)
  const vorlagen = vorlagenLageVon(0)   // `stack_templates`: 0 Zeilen (G-253)

  return (
    <div className="v2-grid v2-grid-14" style={{ gap: 14 }}>
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card
          title="Meine Stacks"
          sub={`${stacks.length} angelegt · nur einer aktiv (uq_user_stacks_one_active)`}
          actions={(
            <InEntwicklungKnopf titel="Neuer Stack" className="v2-btn v2-btn-sm">
              <Icon name="plus" className="v2-ic v2-ic-sm" />Neuer Stack
            </InEntwicklungKnopf>
          )}
        >
          {listenSatz
            ? <div className="v2-supp-hinweis">{listenSatz}</div>
            : (
              <div className="v2-col-gap" style={{ gap: 6 }}>
                {stacks.map(s => (
                  <div
                    key={s.id}
                    className="v2-supp-stack-zeile"
                    style={{
                      background: s.is_active
                        ? 'color-mix(in oklch, var(--acc-suppl) 8%, var(--surface))'
                        : 'var(--surface)',
                      border: `1px solid ${s.is_active
                        ? 'color-mix(in oklch, var(--acc-suppl) 32%, var(--border))'
                        : 'var(--border)'}`,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                        {s.is_active && <Pill variant="acc" style={{ fontSize: 9 }}>aktiv</Pill>}
                        {s.quelle && <Pill style={{ fontSize: 9 }}>{s.quelle}</Pill>}
                      </div>
                      <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>
                        {s.posten} {s.posten === 1 ? 'Eintrag' : 'Einträge'}
                        {s.seit ? ` · seit ${s.seit}` : ''}
                        {s.goal ? ` · ${s.goal}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          <div className="v2-supp-hinweis">
            Einnahme-Einträge entstehen nur aus dem aktiven Stack.
          </div>
        </Card>

        <Card
          title="Vorlagen"
          sub="stack_templates"
        >
          {vorlagen === 'tabelle_leer'
            ? <div className="v2-supp-hinweis">{VORLAGEN_LEER_SATZ}</div>
            : null}
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Einnahmefrequenz" sub="aus den Einträgen des aktiven Stacks gezählt">
          {frequenzen.map(f => (
            <Row key={f.wert} label={f.wert}
              value={`${f.anzahl} von ${positionen.length}`} />
          ))}
          {frequenzSatz(frequenzen)
            ? <div className="v2-supp-hinweis">{frequenzSatz(frequenzen)}</div>
            : null}
        </Card>
        <Card title="Je Eintrag hinterlegt" sub={`${positionen.length} Einträge im aktiven Stack`}>
          {positionen.length === 0
            ? <div className="v2-supp-hinweis">Kein aktiver Stack mit Einträgen.</div>
            : positionen.map(p => (
              <Row key={p.id} label={p.name}
                value={`${p.dose} ${p.dose_unit}`}
                sub={`${p.timing} · ${p.frequency}`} />
            ))}
        </Card>
      </div>
    </div>
  )
}

// ═══ INTELLIGENCE ═════════════════════════════════════════════════
export function SuppIntelligence() {
  // Die Rechnung der Vorlage (Zeile 591-597), unveraendert.
  const gaps = GAP_ROWS.map(r => {
    const total = r.nutrition + r.supp
    const pct = Math.round((total / r.rda) * 100)
    return { ...r, total, pct, is_gap: pct < 80, redundant: r.supp > 0 && pct > 150 }
  })
  const luecken = gaps.filter(g => g.is_gap).length
  const doppelt = gaps.filter(g => g.redundant)
  const imStack = CATALOG.filter(s => s.inStack)

  return (
    <div>
      <div className="v2-grid v2-g-cols-4" style={{ gap: 10, marginBottom: 14 }}>
        <Card style={{ padding: 14 }} attrappe={ATTRAPPE}>
          <div className="v2-eyebrow">Gaps · below 80% RDA</div>
          <div className="v2-num" style={{ fontSize: 22, color: luecken ? 'var(--warn)' : 'var(--pos)' }}>
            {luecken}
          </div>
          <div className="v2-dim" style={{ fontSize: 11 }}>of {gaps.length} tracked</div>
        </Card>
        <Card style={{ padding: 14 }} attrappe={ATTRAPPE}>
          <div className="v2-eyebrow">Redundancies</div>
          <div className="v2-num" style={{ fontSize: 22, color: doppelt.length ? 'var(--warn)' : 'var(--pos)' }}>
            {doppelt.length}
          </div>
          <div className="v2-dim" style={{ fontSize: 11 }}>multi-source &gt; 150% RDA</div>
        </Card>
        <Card style={{ padding: 14 }} attrappe={ATTRAPPE}>
          <div className="v2-eyebrow">Session today</div>
          <div className="v2-num" style={{ fontSize: 16 }}>Push B</div>
          <div className="v2-dim" style={{ fontSize: 11 }}>pre/post items active</div>
        </Card>
        <Card style={{ padding: 14 }} attrappe={ATTRAPPE}>
          <div className="v2-eyebrow">Monthly cost</div>
          <div className="v2-num" style={{ fontSize: 22 }}>
            €{imStack.reduce((sum, s) => sum + (s.cost_per_serving ?? 0) * 30, 0).toFixed(0)}
          </div>
          <div className="v2-dim" style={{ fontSize: 11 }}>{imStack.length} active items</div>
        </Card>
      </div>

      <div className="v2-grid v2-grid-15" style={{ gap: 14 }}>
        <Card
          title="Gap analysis"
          sub="Nutrition micros + supplement contribution vs. RDA"
          attrappe={ATTRAPPE}
        >
          <div className="v2-supp-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Nutrient</th>
                  <th style={{ width: 90, textAlign: 'right' }}>Food</th>
                  <th style={{ width: 90, textAlign: 'right' }}>Supps</th>
                  <th style={{ width: 90, textAlign: 'right' }}>Total</th>
                  <th style={{ width: 80, textAlign: 'right' }}>RDA</th>
                  <th style={{ width: 120 }}>Coverage</th>
                  <th style={{ width: 70, textAlign: 'right' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {gaps.map(g => {
                  const ausEssen = Math.min((g.nutrition / g.rda) * 100, 100)
                  const ausSupp = Math.min((g.supp / g.rda) * 100, 100 - ausEssen)
                  return (
                    <tr
                      key={g.code}
                      style={g.is_gap ? { background: 'color-mix(in oklch, var(--warn) 5%, transparent)' } : undefined}
                    >
                      <td>
                        <div style={{ fontSize: 12 }}>{g.name}</div>
                        <div className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>{g.code}</div>
                      </td>
                      <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>{g.nutrition}</td>
                      <td className="v2-num" style={{ textAlign: 'right', color: g.supp > 0 ? 'var(--acc-suppl)' : 'var(--fg-dim)' }}>
                        {g.supp || '—'}
                      </td>
                      <td className="v2-num" style={{ textAlign: 'right', fontWeight: 500 }}>{g.total}</td>
                      <td className="v2-num v2-muted" style={{ textAlign: 'right', fontSize: 11 }}>
                        {g.rda} {g.unit}
                      </td>
                      <td>
                        <div className="v2-supp-abdeckung">
                          <div className="v2-supp-abdeckung-essen" style={{ width: `${ausEssen}%` }} />
                          <div className="v2-supp-abdeckung-supp" style={{ left: `${ausEssen}%`, width: `${ausSupp}%` }} />
                          <div className="v2-supp-abdeckung-marke" />
                        </div>
                      </td>
                      <td
                        className="v2-num"
                        style={{
                          textAlign: 'right',
                          color: g.is_gap ? 'var(--warn)' : g.pct > 150 ? 'var(--acc-goals)' : 'var(--pos)',
                        }}
                      >
                        {g.pct}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 10, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
            <span className="v2-row-gap">
              <span style={{ width: 10, height: 8, background: 'var(--acc-nutri)', borderRadius: 2 }} />from food
            </span>
            <span className="v2-row-gap">
              <span style={{ width: 10, height: 8, background: 'var(--acc-suppl)', borderRadius: 2 }} />from supplements
            </span>
            <span className="v2-row-gap">
              <span style={{ width: 1, height: 10, background: 'var(--fg-dim)' }} />80% gap threshold
            </span>
          </div>
        </Card>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Redundancy detection" sub="multiple sources · over 150% RDA" attrappe={ATTRAPPE}>
            {doppelt.length === 0 ? (
              <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                No redundancies — no nutrient exceeds 150 % RDA from food and supplements combined.
              </div>
            ) : doppelt.map(g => (
              <div key={g.code} className="v2-supp-doppelt">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{g.name}</span>
                  <span className="v2-num" style={{ marginLeft: 'auto', color: 'var(--acc-goals)', fontSize: 12 }}>
                    {g.pct}% RDA
                  </span>
                </div>
                <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
                  {g.nutrition} {g.unit} from food plus {g.supp} {g.unit} supplemented.
                  Consider lowering the dose.
                </div>
              </div>
            ))}
          </Card>

          <Card title="Timing conflicts" sub="absorption windows" attrappe={ATTRAPPE}>
            <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
              Die Vorlage prueft hier Aufnahmefenster gegeneinander — Eisen gegen Kalzium,
              Zink gegen Kupfer. `[cmd]` Das braucht eine Wechselwirkungstabelle mit
              Zeitbezug; `INTERACTION_DB` fuehrt nur Paare ohne Fenster.
            </div>
            <div className="v2-attrappe-flaeche" style={{ height: 90, marginTop: 10 }} />
          </Card>
        </div>
      </div>
    </div>
  )
}

// ═══ INVENTORY ════════════════════════════════════════════════════
export function SuppInventory() {
  const { open } = useSupp()
  // Die Rechnung der Vorlage (Zeile 776-780), unveraendert.
  //
  // `[cmd]` `expMonths` nimmt in der Vorlage ein festes Bezugsdatum
  // ("2026-08-15") statt `new Date()` — uebernommen. Ein bewegliches
  // Heute wuerde die Attrappe von Tag zu Tag anders rechnen und in
  // Next.js ausserdem die Hydration zerlegen (Server und Browser
  // rendern zu verschiedenen Zeitpunkten).
  const BEZUG = new Date('2026-08-15').getTime()
  const rows = INVENTORY.map(i => {
    const daysLeft = Math.floor(i.stock / i.perDay)
    const expMonths = (new Date(`${i.expiry}-01`).getTime() - BEZUG) / (1000 * 60 * 60 * 24 * 30)
    return { ...i, daysLeft, low: daysLeft < i.threshold, expSoon: expMonths < 1 }
  })
  const knapp = rows.filter(r => r.low)
  const laeuftAb = rows.filter(r => r.expSoon)
  const sortiert = [...rows].sort((a, b) => a.daysLeft - b.daysLeft)

  return (
    <div>
      <div className="v2-grid v2-g-cols-4" style={{ gap: 10, marginBottom: 14 }}>
        <Card style={{ padding: 14 }} attrappe={ATTRAPPE}>
          <div className="v2-eyebrow">Items tracked</div>
          <div className="v2-num" style={{ fontSize: 22 }}>{rows.length}</div>
        </Card>
        <Card style={{ padding: 14 }} attrappe={ATTRAPPE}>
          <div className="v2-eyebrow">Low stock</div>
          <div className="v2-num" style={{ fontSize: 22, color: knapp.length ? 'var(--warn)' : 'var(--pos)' }}>
            {knapp.length}
          </div>
          <div className="v2-dim" style={{ fontSize: 11 }}>&lt; threshold days</div>
        </Card>
        <Card style={{ padding: 14 }} attrappe={ATTRAPPE}>
          <div className="v2-eyebrow">Expiring soon</div>
          <div className="v2-num" style={{ fontSize: 22, color: laeuftAb.length ? 'var(--warn)' : 'var(--pos)' }}>
            {laeuftAb.length}
          </div>
          <div className="v2-dim" style={{ fontSize: 11 }}>within 30 days</div>
        </Card>
        <Card style={{ padding: 14 }} attrappe={ATTRAPPE}>
          <div className="v2-eyebrow">Reorder value</div>
          <div className="v2-num" style={{ fontSize: 22 }}>
            €{knapp.reduce((sum, r) =>
              sum + (CATALOG.find(c => c.id === r.id)?.cost_per_serving ?? 0) * 90, 0).toFixed(0)}
          </div>
          <div className="v2-dim" style={{ fontSize: 11 }}>3-month resupply</div>
        </Card>
      </div>

      <Card
        title="Inventory"
        sub="consumption rate → days remaining"
        attrappe={ATTRAPPE}
        actions={(
          <button type="button" className="v2-btn v2-btn-sm" onClick={() => open('reorder')}>
            <Icon name="download" className="v2-ic v2-ic-sm" />Reorder low stock
          </button>
        )}
      >
        <div className="v2-supp-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Item</th>
                <th style={{ width: 90, textAlign: 'right' }}>Stock</th>
                <th style={{ width: 100, textAlign: 'right' }}>Per day</th>
                <th style={{ width: 90, textAlign: 'right' }}>Days left</th>
                <th style={{ width: 140 }}>Runway</th>
                <th style={{ width: 90 }}>Expiry</th>
                <th style={{ width: 100 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortiert.map(r => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>
                    {r.stock} <span className="v2-dim" style={{ fontSize: 10 }}>{r.unit}</span>
                  </td>
                  <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>{r.perDay.toFixed(2)}</td>
                  <td
                    className="v2-num"
                    style={{ textAlign: 'right', fontWeight: 500, color: r.low ? 'var(--warn)' : 'var(--fg)' }}
                  >
                    {r.daysLeft} d
                  </td>
                  <td>
                    <Meter
                      value={Math.min(r.daysLeft, 60)}
                      max={60}
                      color={r.low ? 'var(--warn)' : r.daysLeft < 21 ? 'var(--acc-goals)' : 'var(--pos)'}
                      tall
                    />
                  </td>
                  <td className="v2-num v2-muted" style={{ fontSize: 11, color: r.expSoon ? 'var(--warn)' : undefined }}>
                    {r.expiry}
                  </td>
                  <td>
                    {r.low
                      ? <Pill variant="warn" style={{ fontSize: 9 }}>low stock</Pill>
                      : r.expSoon
                        ? <Pill variant="warn" style={{ fontSize: 9 }}>expiring</Pill>
                        : <Pill variant="pos" style={{ fontSize: 9 }}>ok</Pill>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="v2-divider" />
        <div className="v2-dim v2-mono" style={{ fontSize: 10, lineHeight: 1.7 }}>
          daily_use = Σ (dose × days_per_week / 7) per item<br />
          days_left = current_stock / daily_use<br />
          low_stock alert when days_left &lt; threshold (default 7)<br />
          expiry alert 30 days before date · expired items flagged
        </div>
      </Card>
    </div>
  )
}
