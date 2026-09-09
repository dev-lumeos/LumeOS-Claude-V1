'use client'

// Der Injections-Tab des Supplements-Moduls (G-45).
//
// QUELLE: theme-v1/module-supplements-injection.jsx (523 Zeilen).
//   InjBodyMap            Zeile  60-91
//   InjectionPlannerView  Zeile  92-388
//
// `[read]` Tom, 2026-08-18: „Supplements ist nicht fertig als Mockup
// erstellt worden, denn da hat es Injektionsorte mit dieser speziellen
// Map."
//
// `[cmd]` ES IST EIN TAB, KEIN EIGENER BEREICH. `app.jsx:123` fuehrt
// genau einen Fall (`case "supplements"`), und `module-supplements.jsx`
// entscheidet in Zeile 249 (Tab-Eintrag) und 270 (`{tab ===
// "injection" && <InjectionPlannerView/>}`). Die 36 KB aendern daran
// nichts — sie stehen nur in einer eigenen Datei, wie `-spec.jsx` auch.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript.
//   2. Klassen auf `v2-`-Praefix.
//   3. `window.dispatchEvent("supp-modal")` -> Kontextfunktion `open`,
//      wie bei den uebrigen Supplements-Tabs.
//   4. Wiederkehrende Inline-Raster in `supplements.css`.
//   5. Tastaturbedienung an den Kartenpunkten — ein `<g onClick>` im
//      SVG ist per Tastatur nicht erreichbar.
//
// NICHT geaendert: dieselben 16 Orte, dieselben Ruhefenster,
// dieselben Volumengrenzen, dieselbe Silhouette.
//
// `[cmd]` ALLES IST ATTRAPPE. Das `supplements`-Schema fuehrt seit
// C-68 fuenf Tabellen, aber **keine fuer Injektionen** — weder Orte
// noch Protokoll noch Plan. Was dieser Tab braucht, steht im Bericht.
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import { INJ_ORTE, INJ_PROTOKOLL, INJ_PLAN, type InjOrt, type Weg } from './injektion-daten'
// ══ G-388: dieselbe Figur wie recovery, kein zweiter Umriss ═════
import { InjektionsKarte } from '@lumeos/ui'
// `[cmd]` **Die Rechnung aus `injektion-karte.ts`, NICHT aus
// `injektion-read.ts`** — letzteres importiert
// `@lumeos/shared/session`, und ein Wert-Import daraus ergab HTTP 500
// auf jeder Route (gemessen, `tsc` blieb gruen). **Nur der TYP darf
// aus dem Leseweg kommen.**
import { tageSeitInjektion } from '../../../lib/medical/injektion-karte'
import type { InjektionsStand } from '../../../lib/medical/injektion-read'
import { useSupp } from './kontext'

// ══ G-388: der Attrappengrund war eine Falschaussage ═══════════
//
// `[cmd]` **Hier stand:** *„Es gibt keine Tabelle fuer Injektionen —
// weder Orte noch Protokoll noch Plan."* **Es gibt fuenf**, gemessen
// 2026-09-09 gegen die laufende Instanz:
//
//     medical.injection_sites                      4 Zeilen
//     medical.injection_logs                       0 Zeilen
//     medical.injection_site_conditions            0 Zeilen
//     medical.injection_needle_recommendations     8 Zeilen
//     medical.injection_tissue_condition_guidance  1 Zeile
//
// `[read]` **Ein Vermerk mit falschem Grund ist schlimmer als eine
// fehlende Kachel** — er verhindert, dass jemand nachsieht. **Der
// echte Grund ist ein anderer:** es gibt keinen Schreibweg fuer
// `injection_logs` (G-388/A3), also keine Rotationsgeschichte.
const ATTRAPPE = 'Ohne erfasste Injektionen ist die Rotation nicht rechenbar — '
  + 'medical.injection_logs hat 0 Zeilen und keinen Schreibweg. '
  + 'Die Zahlen dieser Kachel stammen aus der Vorlage.'

type Zustand = {
  status: 'fresh' | 'resting' | 'soon' | 'ready'
  c: string
  label: string
  daysAgo: number | null
  site: InjOrt
  last?: typeof INJ_PROTOKOLL[number]
}

/**
 * Der Zustand eines Orts (Vorlage Zeile 38-46), unveraendert.
 *
 * `[cmd]` Die Schwellen stehen so in der Vorlage: mehr als ein Tag
 * Rest uebrig -> `resting`, genau null oder eins -> `soon`, darunter
 * -> `ready`. Ein nie benutzter Ort ist `fresh`.
 */
export function ortZustand(id: string): Zustand {
  const site = INJ_ORTE.find(s => s.id === id)!
  const last = INJ_PROTOKOLL.find(l => l.site === id)
  if (!last) return { status: 'fresh', c: 'var(--pos)', label: 'fresh', daysAgo: null, site }
  const rest = site.restDays - last.daysAgo
  if (rest > 1) return { status: 'resting', c: 'var(--neg)', label: `${rest}d rest left`, daysAgo: last.daysAgo, site, last }
  if (rest >= 0) return { status: 'soon', c: 'var(--warn)', label: 'ready tomorrow', daysAgo: last.daysAgo, site, last }
  return { status: 'ready', c: 'var(--pos)', label: 'ready', daysAgo: last.daysAgo, site, last }
}


export function SuppInjections({ stand = null }: {
  /** G-388: die Orte aus `medical.injection_sites`. */
  stand?: InjektionsStand | null
}) {
  const { open } = useSupp()
  // ══ G-388: die echten Orte, aus der Datenbank ═══════════
  //
  // `[cmd]` **Vier Zeilen, anatomische Regionen ohne Seite**
  // (`deltoid`, `vastus_lateralis`, `ventrogluteal`, `subcutaneous`).
  // **Die Karte zeigt je Region beide Seiten** — die Zuordnung steht
  // in `KARTEN_ORTE`, nicht hier.
  // `[read]` **Ueber `stand` gemerkt, nicht ueber `orte`/`protokoll`**:
  // `stand?.orte ?? []` erzeugt bei jedem Rendern ein NEUES Array, und
  // damit rechnete `useMemo` jedes Mal neu (ESLint sagt es genau so).
  const kartenPunkte = React.useMemo(
    () => tageSeitInjektion(stand?.orte ?? [], stand?.protokoll ?? [], new Date()),
    [stand])
  const orte = stand?.orte ?? []
  const protokoll = stand?.protokoll ?? []
  const [sel, setSel] = React.useState('vglute_l')
  const [route, setRoute] = React.useState<Weg | 'all'>('all')
  const [tab, setTab] = React.useState('rotation')

  const s = INJ_ORTE.find(x => x.id === sel)!
  const st = ortZustand(sel)
  const ruhend = INJ_ORTE.filter(x => ortZustand(x.id).status === 'resting').length
  const bereit = INJ_ORTE.filter(x => ['ready', 'fresh'].includes(ortZustand(x.id).status)).length
  const ueberlastet = INJ_ORTE
    .map(x => ({ site: x, count30: INJ_PROTOKOLL.filter(l => l.site === x.id && l.daysAgo <= 30).length }))
    .filter(x => x.count30 >= 3)

  return (
    <div>
      <div className="v2-inj-leiste">
        <div className="v2-segmented">
          {([['rotation', 'Rotation map'], ['schedule', 'Schedule'],
             ['log', 'Log'], ['guide', 'Site guide']] as const).map(([k, l]) => (
            <button
              key={k} type="button" onClick={() => setTab(k)}
              className={tab === k ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
              style={{ height: 24, fontSize: 11, padding: '0 12px', borderRadius: 5 }}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="v2-segmented">
          {([['all', 'All'], ['im', 'IM'], ['subq', 'SubQ']] as const).map(([k, l]) => (
            <button
              key={k} type="button" onClick={() => setRoute(k)}
              className={route === k ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
              style={{ height: 24, fontSize: 11, padding: '0 10px', borderRadius: 5 }}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="v2-spacer" />
        <button type="button" className="v2-btn v2-btn-primary" onClick={() => open('logInjection')}>
          <Icon name="plus" className="v2-ic v2-ic-sm" />Log injection
        </button>
      </div>

      <div className="v2-grid v2-g-cols-4" style={{ gap: 10, marginBottom: 14 }}>
        <Card style={{ padding: 14 }} attrappe={ATTRAPPE}>
          <div className="v2-eyebrow">Sites ready</div>
          <div className="v2-num" style={{ fontSize: 22, color: 'var(--pos)' }}>{bereit}</div>
          <div className="v2-dim" style={{ fontSize: 11 }}>of {INJ_ORTE.length} tracked</div>
        </Card>
        <Card style={{ padding: 14 }} attrappe={ATTRAPPE}>
          <div className="v2-eyebrow">Resting</div>
          <div className="v2-num" style={{ fontSize: 22, color: ruhend ? 'var(--warn)' : 'var(--fg-dim)' }}>{ruhend}</div>
          <div className="v2-dim" style={{ fontSize: 11 }}>within rest window</div>
        </Card>
        <Card style={{ padding: 14 }} attrappe={ATTRAPPE}>
          <div className="v2-eyebrow">Overused · 30d</div>
          <div className="v2-num" style={{ fontSize: 22, color: ueberlastet.length ? 'var(--warn)' : 'var(--pos)' }}>
            {ueberlastet.length}
          </div>
          <div className="v2-dim" style={{ fontSize: 11 }}>≥ 3 uses per site</div>
        </Card>
        <Card style={{ padding: 14 }} attrappe={ATTRAPPE}>
          <div className="v2-eyebrow">Next injection</div>
          <div className="v2-num" style={{ fontSize: 15 }}>Mon 17 Aug</div>
          <div className="v2-dim" style={{ fontSize: 11 }}>Test Cyp · 0.6 ml IM</div>
        </Card>
      </div>

      {tab === 'rotation' && (
        <div className="v2-grid v2-grid-13" style={{ gap: 14 }}>
          {/* ══ G-388: DIESELBE FIGUR WIE RECOVERY ═══════════════
              `[cmd]` **Hier stand `InjKarte`** — eine ZWEITE Silhouette,
              lokal gezeichnet (`SILHOUETTE`, 8 Zeilen Pfaddaten).
              **`packages/ui/src/koerperkarte.tsx` traegt dieselbe Figur
              schon dreimal**: `ErmuedungsKarte`, `AktivierungsKarte`,
              `InjektionsKarte`.
              `[read]` **Tom, 2026-09-09:** *„diese mockup vorlage ist
              obsolet, da will ich dieselbe grafik wie recovery/muscle
              map."* **Zwei Figuren waeren zwei Wahrheiten** — wer die
              eine anpasst, verschiebt die andere nicht mit. */}
          <Card title="Rotation map"
                sub={kartenPunkte.length > 0
                  ? `${orte.length} Orte aus medical.injection_sites · `
                    + `${protokoll.length} Protokollzeilen`
                  : 'medical.injection_sites'}>
            {kartenPunkte.length > 0
              ? <InjektionsKarte daten={kartenPunkte} breite={200} />
              : (
                /* E-72: kein nackter Leerraum, sondern ein benannter
                   Hinweis — und er nennt, WAS fehlt. */
                <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
                  Keine Injektionsorte gelesen.
                  {' '}<span className="v2-mono">medical.injection_sites</span>
                  {' '}ist leer oder nicht lesbar.
                </div>
              )}
            {/* `[cmd]` **G-388: die zweite Legende ist weg.**
                `InjektionsKarte` bringt ihre eigene mit (>14d / 7-14d /
                3-7d / <3d / nie). **Zwei Legenden unter einer Figur
                widersprachen sich**: die alte nannte `ready`/`resting`
                aus Entwurfskonstanten, die echte nennt Tage seit der
                letzten Injektion. */}
          </Card>

          <div className="v2-col-gap" style={{ gap: 14 }}>
            <Card title={s.name} sub={`${s.route.toUpperCase()} · ${s.note}`} attrappe={ATTRAPPE}>
              <div className="v2-grid v2-g-cols-2" style={{ gap: 8, marginBottom: 12 }}>
                <Card style={{ padding: 10 }}>
                  <div className="v2-eyebrow">Status</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: st.c, marginTop: 2 }}>{st.label}</div>
                </Card>
                <Card style={{ padding: 10 }}>
                  <div className="v2-eyebrow">Last used</div>
                  <div className="v2-num" style={{ fontSize: 13, marginTop: 2 }}>
                    {st.daysAgo != null ? `${st.daysAgo} d ago` : 'never'}
                  </div>
                </Card>
                <Card style={{ padding: 10 }}>
                  <div className="v2-eyebrow">Max volume</div>
                  <div className="v2-num" style={{ fontSize: 13, marginTop: 2 }}>{s.maxMl.toFixed(1)} ml</div>
                </Card>
                <Card style={{ padding: 10 }}>
                  <div className="v2-eyebrow">Rest window</div>
                  <div className="v2-num" style={{ fontSize: 13, marginTop: 2 }}>{s.restDays} d</div>
                </Card>
              </div>

              <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Needle recommendation</div>
              <div className="v2-inj-nadel">
                <div className="v2-num" style={{ fontSize: 13, fontWeight: 600 }}>{s.needle}</div>
                <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 2 }}>
                  {s.route === 'im'
                    ? 'Draw with 21G, inject with listed gauge · aspirate before push'
                    : 'Pinch fold · 45–90° · no aspiration needed'}
                </div>
              </div>

              <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Use history · last 30d</div>
              <div style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: 30 }).map((_, i) => {
                  const d = 30 - i
                  const benutzt = INJ_PROTOKOLL.some(l => l.site === sel && l.daysAgo === d)
                  return (
                    <div
                      key={i}
                      title={`${d}d ago`}
                      style={{
                        flex: 1, height: 18, borderRadius: 2,
                        background: benutzt ? st.c : 'var(--surface-2)',
                        opacity: benutzt ? 0.85 : 1,
                      }}
                    />
                  )
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span className="v2-dim v2-mono" style={{ fontSize: 9 }}>30d ago</span>
                <span className="v2-dim v2-mono" style={{ fontSize: 9 }}>today</span>
              </div>
            </Card>

            {ueberlastet.length > 0 && (
              <Card title="Overuse warnings" sub="≥ 3 injections in 30 days" attrappe={ATTRAPPE}>
                {ueberlastet.map(o => (
                  <div key={o.site.id} className="v2-inj-warnung">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600 }}>{o.site.name}</span>
                      <span className="v2-num" style={{ marginLeft: 'auto', color: 'var(--warn)', fontSize: 12 }}>
                        {o.count30}× / 30d
                      </span>
                    </div>
                    <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
                      Repeated use raises scar-tissue and lipohypertrophy risk. Rotate to a
                      contralateral or alternate site.
                    </div>
                  </div>
                ))}
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === 'schedule' && (
        <div className="v2-grid v2-grid-15" style={{ gap: 14 }}>
          <Card
            title="Rotation plan · next 7 injections"
            sub="site suggested by longest-rest-first algorithm"
            attrappe={ATTRAPPE}
          >
            <div className="v2-supp-tbl-wrap">
              <table className="v2-tbl">
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>Date</th>
                    <th>Compound</th>
                    <th style={{ width: 70 }}>Route</th>
                    <th style={{ width: 70, textAlign: 'right' }}>Volume</th>
                    <th style={{ width: 130 }}>Suggested site</th>
                    <th style={{ width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                  {INJ_PLAN.map((r, i) => {
                    const ort = INJ_ORTE.find(x => x.id === r.suggested)!
                    const ueberGrenze = r.ml > ort.maxMl
                    return (
                      <tr key={i}>
                        <td>
                          <div className="v2-num" style={{ fontSize: 11.5 }}>{r.day} {r.date.slice(8)}</div>
                          <div className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>{r.date.slice(0, 7)}</div>
                        </td>
                        <td style={{ fontSize: 12 }}>{r.compound}</td>
                        <td><Pill style={{ fontSize: 9 }}>{r.route.toUpperCase()}</Pill></td>
                        <td className="v2-num" style={{ textAlign: 'right', color: ueberGrenze ? 'var(--neg)' : 'var(--fg)' }}>
                          {r.ml} ml
                        </td>
                        <td>
                          <div style={{ fontSize: 11.5, fontWeight: 500 }}>{ort.name}</div>
                          <div className="v2-dim" style={{ fontSize: 9.5, lineHeight: 1.35 }}>{r.why}</div>
                        </td>
                        <td>
                          <button type="button" className="v2-icon-btn" aria-label="Change site">
                            <Icon name="edit" className="v2-ic v2-ic-sm" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="v2-divider" />
            <div className="v2-dim v2-mono" style={{ fontSize: 10, lineHeight: 1.7 }}>
              suggestion = argmax(days_since_last) over sites where<br />
              &nbsp;&nbsp;route matches AND volume ≤ site.max_ml AND<br />
              &nbsp;&nbsp;days_since_last ≥ site.rest_days<br />
              tie-break: prefer contralateral to previous injection
            </div>
          </Card>

          <div className="v2-col-gap" style={{ gap: 14 }}>
            <Card title="Volume limits" sub="per site, per injection" attrappe={ATTRAPPE}>
              <div className="v2-supp-tbl-wrap">
                <table className="v2-tbl">
                  <thead>
                    <tr>
                      <th>Site</th>
                      <th style={{ width: 55 }}>Route</th>
                      <th style={{ width: 70, textAlign: 'right' }}>Max</th>
                      <th style={{ width: 60, textAlign: 'right' }}>Rest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INJ_ORTE.filter(x => route === 'all' || x.route === route).map(x => (
                      <tr key={x.id}>
                        <td style={{ fontSize: 11.5 }}>{x.name}</td>
                        <td><Pill style={{ fontSize: 8.5 }}>{x.route.toUpperCase()}</Pill></td>
                        <td className="v2-num" style={{ textAlign: 'right', fontSize: 11 }}>{x.maxMl.toFixed(1)} ml</td>
                        <td className="v2-num v2-muted" style={{ textAlign: 'right', fontSize: 11 }}>{x.restDays} d</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Weekly load" sub="volume by site · last 4 weeks" attrappe={ATTRAPPE}>
              {['glute_l', 'glute_r', 'vglute_l', 'vglute_r', 'quad_l', 'abd_l', 'abd_r'].map(id => {
                const ort = INJ_ORTE.find(x => x.id === id)!
                const ml = INJ_PROTOKOLL
                  .filter(l => l.site === id && l.daysAgo <= 28)
                  .reduce((sum, l) => sum + l.ml, 0)
                // Die Vorlage skaliert den Balken auf 4 ml Wochenlast.
                const pct = Math.min(100, (ml / 4) * 100)
                return (
                  <div key={id} className="v2-inj-last">
                    <span style={{ fontSize: 11 }}>{ort.name}</span>
                    <div className="v2-inj-last-balken">
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--acc-suppl)', borderRadius: 3 }} />
                    </div>
                    <span className="v2-num v2-dim" style={{ fontSize: 10.5, textAlign: 'right' }}>
                      {ml.toFixed(2)} ml
                    </span>
                  </div>
                )
              })}
            </Card>
          </div>
        </div>
      )}

      {tab === 'log' && (
        <Card
          title="Injection log"
          sub={`${INJ_PROTOKOLL.length} entries · last 14 days`}
          attrappe={ATTRAPPE}
          actions={(
            <button type="button" className="v2-btn v2-btn-sm">
              <Icon name="download" className="v2-ic v2-ic-sm" />Export
            </button>
          )}
        >
          <div className="v2-supp-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 100 }}>Date</th>
                  <th>Compound</th>
                  <th style={{ width: 130 }}>Site</th>
                  <th style={{ width: 60 }}>Route</th>
                  <th style={{ width: 80, textAlign: 'right' }}>Volume</th>
                  <th style={{ width: 80, textAlign: 'right' }}>Dose</th>
                  <th style={{ width: 110 }}>Needle</th>
                  <th style={{ width: 90 }}>Pain</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {INJ_PROTOKOLL.map(l => {
                  const ort = INJ_ORTE.find(x => x.id === l.site)!
                  return (
                    <tr key={l.id}>
                      <td>
                        <div className="v2-num" style={{ fontSize: 11.5 }}>{l.date.slice(5)}</div>
                        <div className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>{l.daysAgo}d ago</div>
                      </td>
                      <td style={{ fontSize: 12 }}>{l.compound}</td>
                      <td style={{ fontSize: 11.5 }}>{ort.name}</td>
                      <td><Pill style={{ fontSize: 8.5 }}>{l.route.toUpperCase()}</Pill></td>
                      <td className="v2-num" style={{ textAlign: 'right' }}>{l.ml} ml</td>
                      <td className="v2-num v2-muted" style={{ textAlign: 'right', fontSize: 11 }}>
                        {l.mg != null ? `${l.mg} mg` : '—'}
                      </td>
                      <td className="v2-num v2-muted" style={{ fontSize: 10.5 }}>{l.needle}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[0, 1, 2, 3].map(p => (
                            <div
                              key={p}
                              style={{
                                width: 11, height: 5, borderRadius: 1,
                                background: p <= l.pain
                                  ? (l.pain >= 2 ? 'var(--warn)' : 'var(--pos)')
                                  : 'var(--surface-2)',
                              }}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="v2-dim" style={{ fontSize: 10.5 }}>{l.notes || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'guide' && (
        <div className="v2-grid v2-g-cols-2" style={{ gap: 14 }}>
          <Card title="IM sites" sub="intramuscular · aspirate before injecting" attrappe={ATTRAPPE}>
            {INJ_ORTE.filter(x => x.route === 'im').map(x => (
              <div key={x.id} className="v2-inj-ort">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span className="v2-inj-kuerzel v2-inj-kuerzel-im">{x.short}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{x.name}</span>
                  <span className="v2-num v2-dim" style={{ marginLeft: 'auto', fontSize: 10.5 }}>
                    {x.maxMl} ml · {x.restDays}d · {x.needle}
                  </span>
                </div>
                <div className="v2-dim v2-inj-notiz">{x.note}</div>
              </div>
            ))}
          </Card>

          <div className="v2-col-gap" style={{ gap: 14 }}>
            <Card title="SubQ sites" sub="subcutaneous · pinch fold, no aspiration" attrappe={ATTRAPPE}>
              {INJ_ORTE.filter(x => x.route === 'subq').map(x => (
                <div key={x.id} className="v2-inj-ort">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span className="v2-inj-kuerzel v2-inj-kuerzel-subq">{x.short}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{x.name}</span>
                    <span className="v2-num v2-dim" style={{ marginLeft: 'auto', fontSize: 10.5 }}>
                      {x.maxMl} ml · {x.restDays}d · {x.needle}
                    </span>
                  </div>
                  <div className="v2-dim v2-inj-notiz">{x.note}</div>
                </div>
              ))}
            </Card>

            <Card title="Needle reference" attrappe={ATTRAPPE}>
              <div className="v2-supp-tbl-wrap">
                <table className="v2-tbl">
                  <thead>
                    <tr><th>Purpose</th><th style={{ width: 90 }}>Gauge</th><th style={{ width: 80 }}>Length</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Drawing (all)</td><td className="v2-num">21G</td><td className="v2-num v2-muted">1.5&quot;</td></tr>
                    <tr><td>IM glute / ventroglutal</td><td className="v2-num">23G</td><td className="v2-num v2-muted">1.25–1.5&quot;</td></tr>
                    <tr><td>IM quad / delt</td><td className="v2-num">25G</td><td className="v2-num v2-muted">1&quot;</td></tr>
                    <tr><td>SubQ all sites</td><td className="v2-num">29–31G</td><td className="v2-num v2-muted">0.5&quot;</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="v2-divider" />
              <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.55 }}>
                Reference only. Gauge and length depend on carrier oil viscosity and subcutaneous
                depth — confirm with your physician.
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
