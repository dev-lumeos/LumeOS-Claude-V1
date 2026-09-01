'use client'

// Inventory und Compliance — **echte Werte** (G-74).
//
// FORM: `theme-v1/module-supplements-spec.jsx:775-851` (Inventory) und
// `module-supplements.jsx:700-760` (Compliance). INHALT:
// `supplements.stack_items` und `supplements.intake_logs`.
//
// **DIE DREI NACHFUELLSTUFEN KOMMEN AUS DER REICHWEITE.** `[read]` Toms
// Entscheidung zu G-74: *„‚4 d left' sagt mehr als ‚unter 7 Stueck'"* —
// und eine Schwelle je Position muesste gepflegt werden.
//
//   ≤ 1 Woche  → dringend, bestellen
//   ≤ 2 Wochen → Warnung, bestellen
//   ≤ 1 Monat  → Hinweis
//
// `[cmd]` **Die Reichweite haengt an der Einheit** — siehe `ableiten`
// in `lib/supplements/stack-read.ts`. Kreatin fuehrt 30 **g** bei
// 5 g/Tag und reicht **6 Tage**, nicht 30.
//
// **KEINE BEWERTUNG.** Gezaehlt und geteilt wird; es gibt keine Note
// dafuer, ob jemand seine Praeparate zuverlaessig nimmt.
import * as React from 'react'
import { Card, Icon, Meter, Pill } from '@lumeos/ui'

import type { StackDaten } from '../../../lib/supplements/stack-read'
import {
  complianceJePraeparat, gesamtquote, kostenJeMonat, nachfuellliste,
  nachkaufwert, ohnePosition, stufenZaehlung, tagesquoten,
  type ComplianceZeile, type Nachfuellzeile,
} from '../../../lib/supplements/auswertung'

/** Beschriftung und Farbe je Nachfuellstufe. */
const STUFE = {
  dringend: { text: 'bestellen', farbe: 'var(--neg)', sub: 'unter 1 Woche' },
  warnung: { text: 'bestellen', farbe: 'var(--warn)', sub: 'unter 2 Wochen' },
  hinweis: { text: 'im Blick behalten', farbe: 'var(--acc-goals)', sub: 'unter 1 Monat' },
} as const

function tage(n: number | null): string {
  return n == null ? '—' : `${Math.floor(n)} d`
}

function euro(n: number | null): string {
  return n == null ? '—' : `${n.toFixed(2)} €`
}

// ═══ INVENTORY ════════════════════════════════════════════════════

export function InventoryEcht({ d, heute }: { d: StackDaten; heute: string }) {
  const zeilen = nachfuellliste(d.positionen)
  const z = stufenZaehlung(zeilen)
  const wert = nachkaufwert(zeilen)
  const knapp = zeilen.filter(x => x.stufe !== null)

  // Die laengste Reichweite als Massstab des Balkens — nicht 60 fest
  // wie in der Vorlage: bei vier Positionen unter 30 Tagen waere der
  // Balken sonst durchgehend im linken Viertel.
  const maxTage = Math.max(30, ...zeilen.map(x => x.tage ?? 0))

  return (
    <div>
      <div className="v2-grid v2-g-cols-4" style={{ gap: 10, marginBottom: 14 }}>
        <Card style={{ padding: 14 }}>
          <div className="v2-eyebrow">Positionen</div>
          <div className="v2-num" style={{ fontSize: 22 }}>{zeilen.length}</div>
          <div className="v2-dim" style={{ fontSize: 11 }}>im aktiven Stack</div>
        </Card>
        <Card style={{ padding: 14 }}>
          <div className="v2-eyebrow">Bestellen</div>
          <div className="v2-num" style={{
            fontSize: 22,
            color: z.dringend > 0 ? 'var(--neg)' : z.warnung > 0 ? 'var(--warn)' : 'var(--pos)',
          }}>{z.dringend + z.warnung}</div>
          <div className="v2-dim" style={{ fontSize: 11 }}>
            {z.dringend > 0 ? `${z.dringend} davon dringend` : 'unter 2 Wochen'}
          </div>
        </Card>
        <Card style={{ padding: 14 }}>
          <div className="v2-eyebrow">Im Blick</div>
          <div className="v2-num" style={{
            fontSize: 22, color: z.hinweis > 0 ? 'var(--acc-goals)' : 'var(--fg)',
          }}>{z.hinweis}</div>
          <div className="v2-dim" style={{ fontSize: 11 }}>unter 1 Monat</div>
        </Card>
        <Card style={{ padding: 14 }}>
          <div className="v2-eyebrow">Nachkauf · 90 Tage</div>
          <div className="v2-num" style={{ fontSize: 22 }}>{euro(wert)}</div>
          <div className="v2-dim" style={{ fontSize: 11 }}>
            {knapp.length > 0 ? `${knapp.length} Positionen` : 'nichts knapp'}
          </div>
        </Card>
      </div>

      <Card title="Bestand" sub="Verbrauch je Tag → Reichweite">
        {zeilen.length === 0 ? (
          <div className="v2-dim" style={{ fontSize: 11.5, padding: '14px 0' }}>
            Keine aktiven Positionen im Stack.
          </div>
        ) : (
          <div className="v2-supp-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Präparat</th>
                  <th style={{ width: 110, textAlign: 'right' }}>Bestand</th>
                  <th style={{ width: 110, textAlign: 'right' }}>Je Tag</th>
                  <th style={{ width: 90, textAlign: 'right' }}>Reichweite</th>
                  <th style={{ width: 150 }}>Verlauf</th>
                  <th style={{ width: 140 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {zeilen.map(({ position: p, tage: t, stufe }) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontSize: 12.5 }}>{p.name}</div>
                      <div className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>
                        {`${p.dose} ${p.dose_unit} · ${p.frequency}`}
                      </div>
                    </td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>
                      {p.stock_remaining != null ? p.stock_remaining : '—'}
                      <span className="v2-dim" style={{ fontSize: 10, marginLeft: 3 }}>
                        {p.stock_unit ?? ''}
                      </span>
                    </td>
                    <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>
                      {/* Bei gleicher Einheit ist der Tagesverbrauch die
                          Dosis selbst, sonst die Portionszahl. */}
                      {p.stock_unit != null
                        && p.stock_unit.trim().toLowerCase() === p.dose_unit.trim().toLowerCase()
                        ? `${p.dose} ${p.dose_unit}`
                        : (p.portionen_pro_tag != null
                          ? `${p.portionen_pro_tag.toFixed(2)} ${p.stock_unit ?? 'Stk'}`
                          : '—')}
                    </td>
                    <td className="v2-num" style={{
                      textAlign: 'right', fontWeight: 500,
                      color: stufe ? STUFE[stufe].farbe : 'var(--fg)',
                    }}>{tage(t)}</td>
                    <td>
                      {t != null ? (
                        <Meter
                          value={Math.min(t, maxTage)} max={maxTage}
                          color={stufe ? STUFE[stufe].farbe : 'var(--pos)'} tall
                        />
                      ) : <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>—</span>}
                    </td>
                    <td>
                      {stufe ? (
                        <Pill style={{
                          fontSize: 9,
                          borderColor: `color-mix(in oklch, ${STUFE[stufe].farbe} 40%, var(--border))`,
                          color: STUFE[stufe].farbe,
                          background: `color-mix(in oklch, ${STUFE[stufe].farbe} 8%, transparent)`,
                        }}>{STUFE[stufe].text}</Pill>
                      ) : <Pill variant="pos" style={{ fontSize: 9 }}>reicht</Pill>}
                      {stufe && (
                        <div className="v2-dim" style={{ fontSize: 9.5, marginTop: 2 }}>
                          {STUFE[stufe].sub}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="v2-divider" />
        {/* Was die Rechnung tut — und was sie nicht kann. */}
        <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.55 }}>
          {'Die Reichweite folgt der Einheit: steht der Bestand in derselben '}
          {'Einheit wie die Dosis, wird geteilt (30 g bei 5 g/Tag = 6 Tage); '}
          {'steht er in Stück, ist ein Stück eine Portion. '}
          <strong>Ein Verfallsdatum führt die Datenbank nicht</strong>
          {' — die Spalte des Entwurfs bleibt deshalb leer statt geraten.'}
        </div>
        {zeilen.some(x => x.tage == null) && (
          <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 6 }}>
            {`${zeilen.filter(x => x.tage == null).length} Position(en) ohne Reichweite — `}
            {'dort entscheidet die gepflegte Schwelle `low_stock_threshold`.'}
          </div>
        )}
      </Card>
    </div>
  )
}

// ═══ COMPLIANCE ═══════════════════════════════════════════════════

/** Farbe je Tagesquote — dieselben Stufen wie die Legende der Vorlage. */
function quotenFarbe(q: number | null): string {
  if (q == null) return 'var(--surface-2)'
  if (q >= 100) return 'var(--pos)'
  if (q >= 80) return 'color-mix(in oklch, var(--pos) 60%, var(--surface-2))'
  if (q >= 50) return 'var(--warn)'
  return 'var(--neg)'
}

export function ComplianceEcht({ d, heute }: { d: StackDaten; heute: string }) {
  const gesamt = gesamtquote(d.einnahmen, heute, 30)
  const jePraeparat = complianceJePraeparat(d.einnahmen, heute, 30)
  const quoten = tagesquoten(d.einnahmen, heute, 90)

  // 13 Wochen à 7 Tage, spaltenweise — wie die Beitragsgrafik der
  // Vorlage. Die Reihe endet heute, also steht der jüngste Tag rechts.
  const wochen: Array<typeof quoten> = []
  for (let i = 0; i < quoten.length; i += 7) wochen.push(quoten.slice(i, i + 7))

  const letzterAuslasser = d.einnahmen
    .filter(e => e.status === 'skipped')
    .map(e => e.intake_date)
    .sort()
    .pop() ?? null
  const auslasserAmTag = letzterAuslasser
    ? d.einnahmen.filter(e => e.status === 'skipped' && e.intake_date === letzterAuslasser).length
    : 0

  return (
    <div className="v2-grid-14">
      <Card
        title="Compliance · 90 Tage"
        sub={`${d.protokoll_tage} Tage erfasst · ${d.einnahmen.length} Einträge`}
      >
        <div style={{ display: 'flex', gap: 3, overflowX: 'auto', paddingBottom: 4 }}>
          {wochen.map((w, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {w.map(t => (
                <div
                  key={t.datum}
                  title={t.gesamt > 0
                    ? `${t.datum}: ${t.genommen} von ${t.gesamt}`
                    : `${t.datum}: nichts erfasst`}
                  style={{
                    width: 11, height: 11, borderRadius: 2,
                    background: quotenFarbe(t.quote),
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div style={{
          display: 'flex', gap: 16, marginTop: 14, fontSize: 11,
          color: 'var(--fg-muted)', flexWrap: 'wrap',
        }}>
          <div className="v2-row-gap">
            <span className="v2-dot" style={{ background: 'var(--pos)' }} />100 %
          </div>
          <div className="v2-row-gap">
            <span className="v2-dot" style={{
              background: 'color-mix(in oklch, var(--pos) 60%, var(--surface-2))',
            }} />80–99 %
          </div>
          <div className="v2-row-gap">
            <span className="v2-dot" style={{ background: 'var(--warn)' }} />50–79 %
          </div>
          <div className="v2-row-gap">
            <span className="v2-dot" style={{ background: 'var(--surface-2)' }} />nichts erfasst
          </div>
        </div>
        <div className="v2-divider" />
        {/* „nichts erfasst" ist nicht „nichts genommen" — das muss
            dastehen, sonst liest sich eine Lücke wie ein Versäumnis. */}
        <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
          Leere Felder heissen: an diesem Tag wurde nichts erfasst. Das ist
          etwas anderes als „nichts genommen&quot;.
        </div>
      </Card>

      <Card title="30 Tage" sub={`${gesamt.geplant} Einträge`}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
          <span className="v2-num" style={{ fontSize: 30, fontWeight: 600 }}>
            {gesamt.quote != null ? gesamt.quote.toFixed(1) : '—'}
          </span>
          <span className="v2-dim" style={{ fontSize: 13 }}>%</span>
        </div>
        <div className="v2-row">
          <span className="v2-row-l">Genommen</span>
          <span className="v2-row-r">{gesamt.genommen}</span>
        </div>
        <div className="v2-row">
          <span className="v2-row-l">Ausgelassen</span>
          <span className="v2-row-r" style={{ color: 'var(--warn)' }}>{gesamt.ausgelassen}</span>
        </div>
        <div className="v2-divider" />
        {/* `[read]` Der Auftrag verlangt „Last skip · reason". Das
            Datum ist echt, der Text nicht: die `notes` der
            ausgelassenen Zeilen tragen einen Erzeugungsvermerk, keinen
            eingegebenen Grund. Toms Entscheidung: Datum zeigen, und
            sagen, was fehlt. */}
        {letzterAuslasser ? (
          <>
            <div className="v2-row">
              <span className="v2-row-l">Letzter Auslasser</span>
              <span className="v2-row-r v2-mono">{letzterAuslasser}</span>
            </div>
            <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 4, lineHeight: 1.45 }}>
              {auslasserAmTag > 1
                ? `${auslasserAmTag} Präparate an diesem Tag. `
                : ''}
              Ein Grund ist nicht hinterlegt — beim Auslassen wird bisher keiner
              erfasst.
            </div>
          </>
        ) : (
          <div className="v2-dim" style={{ fontSize: 11 }}>Kein Auslasser im Bestand.</div>
        )}
      </Card>

      <Card title="Je Präparat" sub="30 Tage" className="v2-span-2">
        {jePraeparat.length === 0 ? (
          <div className="v2-dim" style={{ fontSize: 11.5, padding: '14px 0' }}>
            Keine Einnahmen in den letzten 30 Tagen.
          </div>
        ) : (
          <div className="v2-supp-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Präparat</th>
                  <th style={{ width: 80 }}>Genommen</th>
                  <th style={{ width: 80 }}>Erfasst</th>
                  <th style={{ width: 90, textAlign: 'right' }}>Quote</th>
                  <th style={{ width: 280 }}>Letzte 30 Tage</th>
                  <th style={{ width: 130 }}>Letzter Auslasser</th>
                </tr>
              </thead>
              <tbody>
                {jePraeparat.map(c => (
                  <tr key={c.name}>
                    <td style={{ fontSize: 12 }}>{c.name}</td>
                    <td className="v2-num">{c.genommen}</td>
                    <td className="v2-num v2-muted">{c.geplant}</td>
                    <td className="v2-num" style={{
                      textAlign: 'right',
                      color: c.quote != null && c.quote >= 100 ? 'var(--pos)'
                        : c.quote != null && c.quote >= 90 ? 'var(--fg)' : 'var(--warn)',
                    }}>{c.quote != null ? `${c.quote} %` : '—'}</td>
                    <td><Streifen zeile={c} /></td>
                    <td className="v2-muted v2-mono" style={{ fontSize: 10.5 }}>
                      {c.letzter_auslasser ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

/** Der 30-Tage-Streifen je Präparat. */
function Streifen({ zeile }: { zeile: ComplianceZeile }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {zeile.streifen.map((s, i) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          style={{
            flex: 1, height: 14, borderRadius: 2,
            background: s === 'taken' ? 'var(--pos)'
              : s === 'skipped' ? 'var(--warn)'
                : s === 'planned' ? 'var(--acc-suppl)' : 'var(--surface-2)',
          }}
        />
      ))}
    </div>
  )
}

// ═══ COST · die zwei fehlenden Kacheln ════════════════════════════

/**
 * Kostenverlauf und „If you removed…".
 *
 * `[read]` Der Auftrag: *„Trend — 3 ehrliche Monatspunkte statt 12"*
 * und *„If you removed… — reine Subtraktion, baubar"*.
 * **`Cost optimization` bleibt draussen** — *„Beratung, keine
 * Rechnung."*
 */
export function CostErgaenzung({ d }: { d: StackDaten }) {
  const preise = new Map<string, number>()
  for (const p of d.positionen) {
    if (p.kosten_pro_tag != null) preise.set(p.name, p.kosten_pro_tag)
  }
  // Die Protokollnamen sind Schnappschuesse und koennen von den
  // Positionsnamen abweichen („Creatine Monohydrate" gegen „Kreatin
  // Monohydrat"). Beide Schreibweisen eintragen, sonst faellt der
  // Monat auf null.
  for (const e of d.einnahmen) {
    if (preise.has(e.supplement_name_snapshot)) continue
    const treffer = d.positionen.find(p =>
      p.katalog?.name === e.supplement_name_snapshot
      || p.name === e.supplement_name_snapshot)
    if (treffer?.kosten_pro_tag != null) {
      preise.set(e.supplement_name_snapshot, treffer.kosten_pro_tag)
    }
  }

  const monate = kostenJeMonat(d.einnahmen, preise)
  const ohne = ohnePosition(d.positionen)
  const maxKosten = Math.max(1, ...monate.map(m => m.kosten))

  return (
    <>
      <Card
        title="Kostenverlauf"
        sub={`${monate.length} Monate aus dem Protokoll`}
      >
        {monate.length === 0 ? (
          <div className="v2-dim" style={{ fontSize: 11.5, padding: '14px 0' }}>
            Kein Protokoll mit Preisen — kein Verlauf.
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex', gap: 10, alignItems: 'flex-end', height: 110,
            }}>
              {monate.map(m => (
                <div key={m.monat} style={{ flex: 1, textAlign: 'center' }}>
                  <div className="v2-num" style={{ fontSize: 11, marginBottom: 4 }}>
                    {m.kosten.toFixed(2)}
                  </div>
                  <div
                    title={`${m.monat}: ${m.kosten.toFixed(2)} € über ${m.tage} Tage`}
                    style={{
                      height: `${Math.max(6, (m.kosten / maxKosten) * 70)}px`,
                      background: m.vollstaendig
                        ? 'var(--acc-suppl)'
                        : 'color-mix(in oklch, var(--acc-suppl) 45%, transparent)',
                      border: m.vollstaendig
                        ? 'none'
                        : '1px dashed color-mix(in oklch, var(--acc-suppl) 60%, var(--border))',
                      borderRadius: 3,
                    }}
                  />
                  <div className="v2-dim v2-mono" style={{ fontSize: 9.5, marginTop: 4 }}>
                    {m.monat.slice(5)}
                  </div>
                  <div className="v2-dim" style={{ fontSize: 9 }}>{`${m.tage} d`}</div>
                </div>
              ))}
            </div>
            <div className="v2-divider" />
            {/* Warum drei und nicht zwölf, und warum manche gestrichelt. */}
            <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.55 }}>
              {'Gerechnet aus den tatsächlich genommenen Einnahmen — ein '}
              {'ausgelassener Tag kostet nichts. '}
              <strong>Das Protokoll reicht 90 Tage zurück</strong>
              {', mehr Monatspunkte gäbe es nicht. Gestrichelte Balken sind '}
              {'angeschnittene Monate.'}
            </div>
          </>
        )}
      </Card>

      <Card title="Ohne dieses Präparat" sub="reine Subtraktion, keine Empfehlung">
        {ohne.length === 0 ? (
          <div className="v2-dim" style={{ fontSize: 11.5, padding: '14px 0' }}>
            Keine Position mit Preis.
          </div>
        ) : (
          <>
            <div className="v2-supp-tbl-wrap">
              <table className="v2-tbl">
                <thead>
                  <tr>
                    <th>Präparat</th>
                    <th style={{ width: 100, textAlign: 'right' }}>Spart / Monat</th>
                    <th style={{ width: 100, textAlign: 'right' }}>Rest / Monat</th>
                    <th style={{ width: 70, textAlign: 'right' }}>Anteil</th>
                  </tr>
                </thead>
                <tbody>
                  {ohne.map(o => (
                    <tr key={o.name}>
                      <td style={{ fontSize: 12 }}>{o.name}</td>
                      <td className="v2-num" style={{ textAlign: 'right' }}>
                        {o.ersparnis.toFixed(2)} €
                      </td>
                      <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>
                        {o.monat_ohne.toFixed(2)} €
                      </td>
                      <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>
                        {o.anteil_pct} %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="v2-divider" />
            <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
              Was ein Präparat kostet, nicht was es bringt. Ob es sich lohnt,
              sagt diese Tabelle nicht.
            </div>
          </>
        )}
      </Card>
    </>
  )
}
