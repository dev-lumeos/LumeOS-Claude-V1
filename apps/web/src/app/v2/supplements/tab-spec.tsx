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

// G-372: die Serveraktionen der Kachel.
import {
  stackAktivieren, vorlageUebernehmen,
  stackVeroeffentlichen, stackZurueckziehen,
  stackAnlegen,
} from './stack-aktionen'
// G-373: die Postenliste eines Stacks — der Aufrufer der drei
// Schreibwege, die bis hierher keinen hatten.
import { StackPosten_Liste } from './stack-bearbeiten'
import { Card, Pill, Icon, Row, Meter } from '@lumeos/ui'

import {
  CATALOG, EVIDENCE_GRADES, gradeMeta, GAP_ROWS, INVENTORY,
  type KatalogEintrag,
} from './spec-daten'
import { useSupp } from './kontext'
import { SuppTagesbilanz } from './tab-bilanz'
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
  const { daten, stacks, vorlagen } = useSupp()
  const positionen = React.useMemo(() => daten?.positionen ?? [], [daten?.positionen])

  // Die Frequenzen, die im Bestand vorkommen — gezaehlt, nicht
  // aus einer Liste behauptet.
  const frequenzen = React.useMemo(() => {
    const z = new Map<string, number>()
    for (const p of positionen) z.set(p.frequency, (z.get(p.frequency) ?? 0) + 1)
    return Array.from(z, ([wert, anzahl]) => ({ wert, anzahl }))
      .sort((a, b) => b.anzahl - a.anzahl)
  }, [positionen])

  const listenSatz = stackListeSatz(stacks)
  // ══ G-347b: die Vorlagen sind da ═════════════════════════
  //
  // `[cmd]` **Hier stand `vorlagenLageVon(0)`** — eine fest
  // verdrahtete Null aus der Zeit, als `stack_templates` leer war
  // (G-253). **Die Kachel konnte deshalb nie etwas anderes zeigen als
  // ihren Leerhinweis**, auch nachdem die Tabelle gefuellt war.
  //
  // `[cmd]` **C-423/C-424 haben sie gefuellt:** vier kuratierte und
  // eine vom Nutzer geteilte Vorlage.
  //
  // `[read]` **Die Lage kommt jetzt aus der Zahl, nicht aus einer
  // Konstante** — faellt der Bestand wieder auf null, greift
  // derselbe Leerhinweis von selbst.
  // ══ G-372: die Kachel bekommt Funktionen ═════════════════
  //
  // **Tom, 2026-09-08:** *,,was soll mir eine uebersicht bringen ohne
  // funktionen? ich kann weder reinschauen, noch editieren, noch
  // aktivieren."*
  //
  // `[cmd]` **Vorher: EIN Knopf** (,,Neuer Stack", und der war eine
  // Attrappe).
  const [laeuftId, setLaeuftId] = React.useState<string | null>(null)
  const [meldung, setMeldung] = React.useState<string | null>(null)
  const [offen, setOffen] = React.useState<string | null>(null)
  // G-373: das Formular fuer einen neuen Stack.
  const [neuOffen, setNeuOffen] = React.useState(false)
  const [neuName, setNeuName] = React.useState('')
  const [neuZiel, setNeuZiel] = React.useState('custom')

  /** G-373: dieselbe Fehlerbehandlung, ohne eigene Kennung. */
  async function lauf(was: () => Promise<{ ok: boolean; fehler?: string }>) {
    await tue('__lauf', was)
  }

  async function tue(id: string, was: () => Promise<{ ok: boolean; fehler?: string }>) {
    setLaeuftId(id)
    setMeldung(null)
    try {
      const a = await was()
      // `[read]` **Ein Fehler wird gezeigt, nicht geschluckt** —
      // sonst sieht ein misslungener Klick aus wie keiner.
      if (!a.ok) setMeldung(a.fehler ?? 'Hat nicht geklappt.')
    } finally {
      setLaeuftId(null)
    }
  }

  const vorlagenLage = vorlagenLageVon(vorlagen.length)
  const kuratiert = vorlagen.filter(v => v.herkunft !== 'user')
  const vomNutzer = vorlagen.filter(v => v.herkunft === 'user')

  return (
    <div className="v2-grid v2-grid-14" style={{ gap: 14 }}>
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card
          title="Meine Stacks"
          sub={`${stacks.length} angelegt · nur einer aktiv (uq_user_stacks_one_active)`}
          actions={(
            /* `[cmd]` **G-373: war die letzte Attrappe der Kachel.**
               `authenticated` haelt INSERT auf `user_stacks` — keine
               Datenbankarbeit noetig (in G-372 gemessen). */
            <button type="button" className="v2-btn v2-btn-sm"
                    onClick={() => setNeuOffen(v => !v)}>
              <Icon name="plus" className="v2-ic v2-ic-sm" />Neuer Stack
            </button>
          )}
        >
          {neuOffen && (
            <div style={{
              display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10,
              padding: 10, background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 7,
            }}>
              <input aria-label="Name des Stacks" value={neuName}
                     onChange={e => setNeuName(e.target.value)}
                     placeholder="Name des Stacks"
                     className="v2-feld" style={{ flex: 2, minWidth: 150 }} />
              {/* `[cmd]` **Die Siebenerliste steht im CHECK**
                  (`user_stacks_goal_check`). **C-427 ist offen und wird
                  hier NICHT entschieden** — bis dahin gilt sie, weil
                  sie in der Datenbank steht und die aeltere ist. */}
              <select aria-label="Ziel" value={neuZiel} className="v2-feld"
                      onChange={e => setNeuZiel(e.target.value)}
                      style={{ flex: 1, minWidth: 150 }}>
                {['muscle_building', 'fat_loss', 'recovery_sleep', 'health',
                  'longevity', 'performance', 'custom'].map(x => (
                    <option key={x} value={x}>{x}</option>
                  ))}
              </select>
              <button type="button" className="v2-btn v2-btn-sm"
                      disabled={laeuftId === '__neu' || !neuName.trim()}
                      onClick={() => void tue('__neu',
                        () => stackAnlegen(neuName, neuZiel))
                        .then(() => { setNeuName(''); setNeuOffen(false) })}>
                Anlegen
              </button>
            </div>
          )}
          {listenSatz
            ? <div className="v2-supp-hinweis">{listenSatz}</div>
            : (
              <div className="v2-col-gap" style={{ gap: 6 }}>
                {stacks.map(s => (
                  <div key={s.id}>
                  <div
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
                    {/* `[cmd]` QUELLE: `module-supplements-spec.jsx:527`
                        — dort steht ,,Activate" nur an den INAKTIVEN,
                        und daneben ,,Edit". */}
                    {!s.is_active && (
                      <button
                        type="button"
                        className="v2-btn v2-btn-sm"
                        disabled={laeuftId === s.id}
                        onClick={() => void tue(s.id,
                          () => stackAktivieren(s.id))}
                      >
                        {laeuftId === s.id ? '…' : 'Aktivieren'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="v2-btn v2-btn-ghost v2-btn-sm"
                      disabled={laeuftId === s.id}
                      onClick={() => void tue(s.id, () => s.geteilt
                        ? stackZurueckziehen(s.id)
                        : stackVeroeffentlichen(s.id, 'aus der Stack-Kachel'))}
                    >
                      {s.geteilt ? 'Zurücknehmen' : 'Teilen'}
                    </button>
                    {/* ══ G-373: editieren ══════════════════════
                        `[cmd]` QUELLE: `module-supplements-spec.jsx:530`
                        — dort heisst der Knopf ,,Edit" und steht als
                        letzter in der Zeile. */}
                    <button
                      type="button"
                      className="v2-btn v2-btn-ghost v2-btn-sm"
                      onClick={() => setOffen(v => v === s.id ? null : s.id)}
                    >
                      {offen === s.id ? 'Zu' : 'Bearbeiten'}
                    </button>
                  </div>
                  {/* `[read]` **Nur der geoeffnete Stack zeigt seine
                      Posten** — alle gleichzeitig waeren eine Liste,
                      keine Uebersicht. */}
                  {offen === s.id && (
                    <StackPosten_Liste stack={s} lauf={lauf}
                                       laeuft={laeuftId !== null} />
                  )}
                  </div>
                ))}
              </div>
            )}
          {meldung && (
            <div className="v2-supp-hinweis" style={{ color: 'var(--neg)' }}>
              {meldung}
            </div>
          )}
          <div className="v2-supp-hinweis">
            Einnahme-Einträge entstehen nur aus dem aktiven Stack.
            Wer einen anderen aktiviert, pausiert den bisherigen
            (SPEC_03, Flow 2).
          </div>
        </Card>

        <Card
          title="Vorlagen"
          sub={vorlagenLage === 'tabelle_leer'
            ? 'stack_templates'
            : `${kuratiert.length} kuratiert · ${vomNutzer.length} vom Nutzer`}
        >
          {vorlagenLage === 'tabelle_leer'
            ? <div className="v2-supp-hinweis">{VORLAGEN_LEER_SATZ}</div>
            : (
              <div className="v2-col-gap" style={{ gap: 7 }}>
                {vorlagen.map(v => (
                  <div key={v.id} style={{
                    padding: 10, background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: 6,
                  }}>
                    {/* `[cmd]` **Kein `flexWrap`** — mit Umbruch fiel der
                        Knopf bei langen Zielnamen (`body_composition`)
                        in die zweite Zeile, waehrend er bei kurzen
                        oben blieb. **Der Name kuerzt stattdessen.** */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      marginBottom: v.beschreibung ? 3 : 0,
                    }}>
                      <span style={{
                        fontSize: 12.5, fontWeight: 600, minWidth: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>{v.name}</span>
                      {/* `[read]` Die Herkunft steht dran, weil sie den
                          Unterschied macht: kuratiert ist gepflegt,
                          vom Nutzer geteilt ist es nicht. */}
                      <Pill variant={v.herkunft === 'user' ? undefined : 'acc'}>
                        {v.herkunft === 'user' ? 'vom Nutzer' : 'kuratiert'}
                      </Pill>
                      {v.goal && (
                        <span className="v2-dim v2-mono"
                              style={{ fontSize: 10, minWidth: 0, overflow: 'hidden',
                                       textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {v.goal}
                        </span>
                      )}
                      {/* ══ G-372: uebernehmen ═══════════════════
                          `[cmd]` QUELLE: `module-supplements-spec.jsx:546`
                          — dort heisst der Knopf ,,Use template" und
                          steht rechts in der Kopfzeile der Vorlage.

                          `[cmd]` `SPEC_03`, Flow 2, Schritt 4:
                          *,,[Template uebernehmen]"*. */}
                      <button
                        type="button"
                        className="v2-btn v2-btn-sm"
                        style={{ marginLeft: 'auto' }}
                        disabled={laeuftId === v.id}
                        onClick={() => void tue(v.id,
                          () => vorlageUebernehmen(v.id))}
                      >
                        {laeuftId === v.id ? '…' : 'Übernehmen'}
                      </button>
                    </div>
                    {v.beschreibung && (
                      <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.45 }}>
                        {v.beschreibung}
                      </div>
                    )}
                    {/* ══ G-372: reinschauen ═════════════════════
                        `[cmd]` QUELLE: `module-supplements-spec.jsx:549`
                        — die Vorlage zeigt ihre Posten als Pillenreihe.

                        `[read]` **Ohne Posten waere es wieder eine
                        Zaehlung** — genau das, was Tom bemaengelt hat. */}
                    {v.posten.length > 0 && (
                      <div style={{
                        display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 7,
                      }}>
                        {v.posten.map(p => (
                          <Pill key={p.id} style={{ fontSize: 9.5 }}>
                            {p.name}
                            {p.dosis != null && (
                              <span className="v2-dim" style={{ marginLeft: 4 }}>
                                {p.dosis} {p.einheit ?? ''}
                              </span>
                            )}
                          </Pill>
                        ))}
                      </div>
                    )}
                    {v.posten.length === 0 && (
                      <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 6 }}>
                        Keine Posten hinterlegt.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
  // G-275: die Bilanz kommt aus dem Kontext — dieselbe Quelle wie
  // Stack und Einnahmen, kein eigener Ladeweg.
  const { bilanz, belegteSubstanzen, stichtag } = useSupp()
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
        {/* ══ G-275: die echte Bilanz statt der Attrappe ═══════════
            `[cmd]` **Hier stand „Gap analysis"** — Spalten `FOOD`,
            `SUPPS`, `TOTAL` gegen die RDA, mit erfundenen Zahlen.
            `[cmd]` **Die Summierung verbietet E-35:** jedes Modul
            rechnet seine eigene Bilanz, das Zusammenfuehren gehoert
            ins Dashboard.
            `[read]` **Die Form war richtig, die Rechnung nicht** —
            deshalb ersetzt, nicht danebengestellt (G-253). */}
        <SuppTagesbilanz
          zeilen={bilanz}
          datum={stichtag}
          belegteSubstanzen={belegteSubstanzen}
        />

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
