'use client'

// **DIE Liste.** Eine, nicht drei.
//
// `[read]` Der Auftrag G-60: *„Das Mockup ist die Vorgabe. Es bekommt
// echte Daten. Was es zeigt, bleibt — Panels, Filter, Verlauf, Balken,
// Popups. Was nicht aus den Daten kommt, wird gemeldet, nicht
// ersetzt."*
//
// **WAS HIER VERSCHWUNDEN IST:** die Flachliste aus G-46
// (`befund-tabelle.tsx`, eine Zeile je Messung) und die Entwurfstabelle
// der Vorlage mit ihren 48 erfundenen Markern. `[read]` Tom: *„Die zwei
// gebauten Listen verschwinden."* Der Fehler lag im Auftrag G-46, nicht
// in der Umsetzung — er verlangte zwei Dinge, die im Mockup so nicht
// vorkommen.
//
// **FORM: die Attrappe** (`theme-v1/module-medical-v2.jsx:237-309`).
// Spaltenfolge, Filterleiste, Panelpillen, Bereichsbalken, Sparkline
// und die klickbare Zeile stehen wie dort. **INHALT: die Datenbank.**
//
// WAS DIE ATTRAPPE ZEIGT UND HIER FEHLT, mit Grund:
//   `ev A+` / `ev A`  — `[cmd]` Tom: *„Wir haben die Daten für diese
//                       Evidence nicht, also weg."*
//   `match_status`    — `[read]` gehört in den Import-Tab, nicht in
//                       die Liste. Bleibt in der Datenbank.
// Was die Panelzeile leistet und was nicht, steht im Bericht.
import * as React from 'react'
import { Card, Icon, Pill, Sparkline } from '@lumeos/ui'

import type { Lage } from '../../../lib/medical/befund'
import { balkenSkala, type MarkerReihe } from '../../../lib/medical/reihe'
import { useMedical } from './kontext'
import type { LabMarkerEffekt } from './echtdaten'

/** Wortlaut je Lage. Ortsangaben, keine Urteile. */
const LAGE_TEXT: Record<Lage, string> = {
  im_bereich: 'In range',
  darueber: 'Above range',
  darunter: 'Below range',
  unbekannt: 'No range',
}

// `[read]` Der Auftrag: *„Die Attrappe zeigt `Optimal`, `High`, `Low` —
// das sind Lagebezeichnungen, keine Urteile, solange sie sagen, WO ein
// Wert liegt."* `In range` / `Above range` / `Below range` sagt genau
// das und nichts darüber hinaus. `Optimal` sagt es nicht: es benennt
// nicht die Lage, sondern spricht ein Gütesiegel aus — und die
// Attrappe führt dazu `Critical low` und `Critical high`, die
// unzweifelhaft Urteile sind. Ausführlich im Bericht.
const LAGE_FARBE: Record<Lage, string> = {
  im_bereich: 'var(--pos)',
  darueber: 'var(--warn)',
  darunter: 'var(--warn)',
  unbekannt: 'var(--fg-dim)',
}

/**
 * Die Panelzeile.
 *
 * `[cmd]` **Die elf Panels der Attrappe gibt es in den Daten nicht.**
 * `medical.biomarker_catalog` führt `loinc_class`, und das ergibt für
 * die 35 benutzten Marker vier Gruppen statt elf — CHEM trägt 31 davon.
 * Eine Zuordnung „TSH → Thyroid, LDL → Lipid" steht nirgends: nicht im
 * Katalog, nicht in `biomarker_reference_ranges`, nicht in
 * `biomarker_aliases`, und auch nicht im Vorgängerrepo (dort ist
 * `category` ein Probenmaterial-Feld mit `blood`/`hormone`/`vitamin`).
 *
 * `[read]` Gebaut ist deshalb, was da ist: der Filter läuft über
 * `loinc_class` und zählt echt. Erfunden ist nichts. Der Bericht
 * nennt, was fehlt, damit Tom entscheiden kann.
 */
function klassenListe(reihen: MarkerReihe[]): Array<{ id: string; label: string; n: number }> {
  const zaehler = new Map<string, number>()
  for (const r of reihen) {
    const k = r.klasse ?? 'ohne'
    zaehler.set(k, (zaehler.get(k) ?? 0) + 1)
  }
  const gruppen = Array.from(zaehler.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([id, n]) => ({ id, label: id === 'ohne' ? 'Unmapped' : id, n }))
  return [{ id: 'all', label: 'All', n: reihen.length }, ...gruppen]
}

function zahl(n: number | null): string {
  if (n == null) return '—'
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(4)))
}

/** `70–99`; offene Grenzen als `<` oder `>`. */
function bereichText(low: number | null, high: number | null, text: string | null): string {
  if (low != null && high != null) return `${zahl(low)}–${zahl(high)}`
  if (high != null) return `<${zahl(high)}`
  if (low != null) return `>${zahl(low)}`
  return text ?? '—'
}

/**
 * Der Bereichsbalken `LAB · OPTIMAL · YOU`.
 *
 * `[cmd]` Form und Farben der Attrappe (`bausteine.tsx`,
 * `RangeIndicator`), Skala aus `reihe.ts`. **Ein Unterschied mit
 * Grund:** die Attrappe faerbt den Grund rot („outside lab range"),
 * weil sie `critical_low`/`critical_high` kennt. Die Daten führen
 * diese Grenzen nicht — der Grund bleibt hier neutral, sonst behauptete
 * die Farbe eine Schwelle, die niemand gemessen hat.
 */
function Bereichsbalken({ r, hoehe = 16 }: { r: MarkerReihe; hoehe?: number }) {
  const s = balkenSkala(r)
  if (!s) return <span className="v2-dim" style={{ fontSize: 10.5 }}>—</span>

  const spanne = s.bis - s.von || 1
  const pos = (v: number) => Math.max(0, Math.min(100, ((v - s.von) / spanne) * 100))

  return (
    <div style={{
      position: 'relative', height: hoehe, borderRadius: 5, overflow: 'hidden',
      background: 'var(--surface-2)', border: '1px solid var(--border)',
    }}>
      {s.lab && (
        <div style={{
          position: 'absolute', left: `${pos(s.lab[0])}%`,
          width: `${pos(s.lab[1]) - pos(s.lab[0])}%`, top: 0, bottom: 0,
          background: 'color-mix(in oklch, var(--acc-recov) 26%, transparent)',
        }} />
      )}
      {s.opt && (
        <div style={{
          position: 'absolute', left: `${pos(s.opt[0])}%`,
          width: `${pos(s.opt[1]) - pos(s.opt[0])}%`, top: 0, bottom: 0,
          background: 'color-mix(in oklch, var(--pos) 34%, transparent)',
        }} />
      )}
      <div style={{
        position: 'absolute', left: `${pos(s.wert)}%`, top: -2, bottom: -2, width: 2.5,
        background: LAGE_FARBE[r.lage], boxShadow: '0 0 0 1.5px var(--bg)', borderRadius: 2,
      }} />
    </div>
  )
}

/**
 * Der Verlauf: Prozent plus Sparkline.
 *
 * `[cmd]` Die Attrappe rechnet eine Regression über sechs erfundene
 * Punkte und beschriftet sie `Q1 25`…`Q2 26`. Hier stehen vier bis
 * fünf echte Messungen von 2026-02-18 bis 2026-08-19 — die Zahl der
 * Punkte steht deshalb im Titel, damit `+15,9 %` nicht wie ein Wert
 * über sechs Quartale aussieht.
 */
function Verlauf({ r }: { r: MarkerReihe }) {
  const punkte = r.messungen.map(m => m.wert).filter((w): w is number => w != null)
  if (r.trendProzent == null) {
    return <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>n&lt;2</span>
  }
  const pfeil = r.trendProzent > 0 ? '↑' : r.trendProzent < 0 ? '↓' : '→'
  return (
    <span
      className="v2-mono"
      style={{ fontSize: 10.5, color: 'var(--fg-muted)' }}
      title={`${zahl(punkte[0])} → ${zahl(punkte[punkte.length - 1])} ${r.einheit}`
        + ` · ${punkte.length} Messungen · ${r.messungen[0].datum} bis ${r.aktuell.datum}`}
    >
      {pfeil} {r.trendProzent > 0 ? '+' : ''}{r.trendProzent}%
    </span>
  )
}

export function MarkerListe({
  reihen,
  befunde,
  labEffekte,
}: {
  reihen: MarkerReihe[]
  befunde: number
  labEffekte: LabMarkerEffekt[]
}) {
  const { open } = useMedical()
  const [klasse, setKlasse] = React.useState('all')
  const [q, setQ] = React.useState('')
  const [nurAusserhalb, setNurAusserhalb] = React.useState(false)

  const klassen = React.useMemo(() => klassenListe(reihen), [reihen])
  const effekteNachCode = React.useMemo(() => {
    const map = new Map<string, LabMarkerEffekt[]>()
    for (const effekt of labEffekte) {
      if (!effekt.loinc_code) continue
      map.set(effekt.loinc_code, [...(map.get(effekt.loinc_code) ?? []), effekt])
    }
    return map
  }, [labEffekte])

  const liste = reihen
    .filter(r => klasse === 'all' || (r.klasse ?? 'ohne') === klasse)
    .filter(r => !q || (r.name + (r.kurz ?? '') + (r.loinc_code ?? ''))
      .toLowerCase().includes(q.toLowerCase()))
    // `[read]` „Non-optimal only" der Attrappe. Gefiltert wird gegen den
    // Bereich, der gilt — und gegen das Optimalband, wenn es eines gibt:
    // ein Wert kann im Laborbereich liegen und ausserhalb des Optimums,
    // und genau diese Unterscheidung ist die Kernaussage des Moduls.
    .filter(r => !nurAusserhalb
      || r.lage === 'darueber' || r.lage === 'darunter'
      || r.optimalLage === 'darueber' || r.optimalLage === 'darunter')

  const ausserhalb = reihen.filter(r =>
    r.lage === 'darueber' || r.lage === 'darunter'
    || r.optimalLage === 'darueber' || r.optimalLage === 'darunter').length

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
          <Icon name="search" className="v2-ic v2-ic-sm" style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--fg-subtle)',
          }} />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            aria-label="Search biomarkers"
            placeholder={`Search ${reihen.length} biomarkers · name, abbreviation, LOINC…`}
            style={{
              width: '100%', height: 32, background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 7,
              padding: '0 12px 0 30px', fontSize: 12, color: 'var(--fg)',
            }}
          />
        </div>
        <button type="button" onClick={() => setNurAusserhalb(v => !v)}
                aria-pressed={nurAusserhalb}
                className={nurAusserhalb ? 'v2-btn v2-btn-primary' : 'v2-btn'}>
          <Icon name="filter" className="v2-ic v2-ic-sm" />
          {`Non-optimal only · ${ausserhalb}`}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 5, marginBottom: 14, flexWrap: 'wrap' }}>
        {klassen.map(k => (
          <button key={k.id} type="button" onClick={() => setKlasse(k.id)}
                  aria-pressed={klasse === k.id}
                  className={klasse === k.id ? 'v2-pill v2-pill-acc' : 'v2-pill'}
                  style={{ cursor: 'pointer', padding: '3px 10px', fontSize: 11 }}>
            {k.label}
            <span className="v2-dim" style={{ marginLeft: 4 }}>{k.n}</span>
          </button>
        ))}
      </div>

      <Card
        title="Biomarkers"
        sub={`${reihen.length} marker · ${befunde} lab reports · dual-range (lab + optimal)`}
      >
        {reihen.length === 0 ? (
          <div style={{ padding: '28px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              Noch keine Befundwerte
            </div>
            <div className="v2-dim" style={{ fontSize: 11.5 }}>
              Sobald ein Laborbericht erfasst ist, stehen seine Werte hier.
            </div>
          </div>
        ) : (
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  {/* Mindestbreite wie in G-46: „Glucose [Mass/volume]
                      in Serum or Plasma" ist der Rohtext eines Befunds
                      und bricht sonst auf sechs Zeilen um. */}
                  <th style={{ minWidth: 230 }}>Biomarker</th>
                  <th style={{ width: 90 }}>LOINC</th>
                  <th style={{ width: 110, textAlign: 'right' }}>Value</th>
                  <th style={{ width: 170 }}>Lab · optimal · you</th>
                  <th style={{ width: 120 }}>Range</th>
                  <th style={{ width: 130 }}>Position</th>
                  <th style={{ width: 116 }}>Stack link</th>
                  <th style={{ width: 76 }}>Trend</th>
                  <th style={{ width: 80 }}>Sparkline</th>
                  <th style={{ width: 26 }} />
                </tr>
              </thead>
              <tbody>
                {liste.map(r => {
                  const punkte = r.messungen.map(m => m.wert).filter((w): w is number => w != null)
                  const effekte = r.loinc_code ? (effekteNachCode.get(r.loinc_code) ?? []) : []
                  const assay = effekte.some(e => e.effect_type === 'assay_interference')
                  return (
                    <tr key={r.schluessel} style={{ cursor: 'pointer' }}
                        onClick={() => open({ typ: 'markerReihe', r, effekte })}>
                      <td>
                        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{r.name}</div>
                        <div className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>
                          {[r.kurz, r.klasse?.toLowerCase(), r.aktuell.datum]
                            .filter(Boolean).join(' · ')}
                        </div>
                      </td>
                      <td className="v2-mono v2-dim" style={{ fontSize: 10.5 }}>
                        {r.loinc_code ?? '—'}
                      </td>
                      <td className="v2-num" style={{
                        textAlign: 'right', color: LAGE_FARBE[r.lage], fontWeight: 600,
                      }}>
                        {r.aktuell.wert != null
                          ? `${r.aktuell.operator !== '=' ? r.aktuell.operator : ''}${zahl(r.aktuell.wert)}`
                          : (r.aktuell.wertText ?? '—')}
                        <span className="v2-dim" style={{ fontSize: 9.5, marginLeft: 3 }}>
                          {r.einheit}
                        </span>
                      </td>
                      <td style={{ padding: '6px 8px 6px 0' }}>
                        <Bereichsbalken r={r} />
                      </td>
                      <td className="v2-mono v2-muted" style={{ fontSize: 11 }}>
                        {r.bereich
                          ? bereichText(r.bereich.low, r.bereich.high, r.bereich.text)
                          : <span className="v2-dim">—</span>}
                        {/* G-80: **Die Herkunft steht wieder da.**
                            `[read]` G-46 hatte sie ausdruecklich gebaut
                            („Quelle `Katalog`, als solcher beschriftet"),
                            und sie fiel mit der Flachliste weg (G-60).
                            `[cmd]` Ein Rueckfall im Bestand: Calcium.
                            Als Unterzeile statt eigener Spalte — die
                            Vorlage hat dafuer keine, und 138 von 140
                            Zeilen zeigten „Befund" ohne Aussagewert. */}
                        {r.aktuell.reference_source === 'catalog_fallback' && (
                          <div style={{ marginTop: 2 }}>
                            <Pill>Katalog</Pill>
                          </div>
                        )}
                        {r.aktuell.reference_source === 'none' && r.bereich == null && (
                          <div className="v2-dim" style={{ fontSize: 9.5, marginTop: 2 }}>
                            kein Bereich
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ color: LAGE_FARBE[r.lage], fontSize: 11.5 }}>
                          {LAGE_TEXT[r.lage]}
                        </span>
                        {/* Der Doppelbereich: nur zeigen, wenn Labor- und
                            Optimalband auseinanderfallen. Sonst waere es
                            dieselbe Aussage zweimal. */}
                        {r.optimalLage !== 'unbekannt' && r.optimalLage !== r.lage && (
                          <div className="v2-dim" style={{ fontSize: 10 }}>
                            {`optimal: ${LAGE_TEXT[r.optimalLage].toLowerCase()}`}
                          </div>
                        )}
                      </td>
                      <td>
                        {effekte.length > 0 ? (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Pill style={{ fontSize: 9.5 }}>{effekte.length} stack</Pill>
                            {assay && <Pill variant="warn" style={{ fontSize: 9.5 }}>assay</Pill>}
                          </div>
                        ) : (
                          <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>—</span>
                        )}
                      </td>
                      <td><Verlauf r={r} /></td>
                      <td style={{ padding: '4px 8px 4px 0' }}>
                        {punkte.length >= 2
                          ? <Sparkline data={punkte} color={LAGE_FARBE[r.lage]} h={20} />
                          : <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>—</span>}
                      </td>
                      <td>
                        <Icon name="chevron_right" className="v2-ic v2-ic-sm"
                              style={{ color: 'var(--fg-dim)' }} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* `[cmd]` Marker ohne Katalogeintrag stehen mit ihrem Rohtext
            in der Liste. Der Hinweis nennt sie, statt sie wegzulassen —
            aber OHNE `match_status`: der gehoert in den Import-Tab. */}
        {reihen.some(r => !r.loinc_code) && (
          <>
            <div className="v2-divider" />
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
              {`${reihen.filter(r => !r.loinc_code).length} von ${reihen.length} Markern sind `}
              keinem Katalogeintrag zugeordnet. Sie stehen mit dem Rohtext des
              Befunds da — weggelassen wird keiner.
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
