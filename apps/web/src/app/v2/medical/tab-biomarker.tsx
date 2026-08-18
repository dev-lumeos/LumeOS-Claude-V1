'use client'

// Zwei Tabs: „Biomarkers" und „Import".
//
// QUELLE: theme-v1/module-medical-v2.jsx:237-309 (`MedBiomarkers`),
// :312-468 (`MedImport`).
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// `color-mix(in srgb, …)` -> `in oklch`, Felder bekommen `aria-label`,
// Knoepfe ohne Ziel oeffnen `InEntwicklung`.
//
// `[cmd]` ALLES IST ATTRAPPE.
import * as React from 'react'
import { Card, Pill, Icon, Sparkline, InEntwicklungKnopf } from '@lumeos/ui'

import {
  BIOMARKERS, BIOMARKER_CATEGORIES, FLAG_META, OCR_EXTRACTED,
  LAB_REPORTS, UNIT_CONVERSIONS, calcBiomarkerFlag,
} from './daten'
import { RangeIndicator, FlagPill, TrendBadge } from './bausteine'
import { useMedical } from './kontext'
import { ATTRAPPE, type EchteDaten } from './ansicht'
import { katalogSuchen } from './aktionen'
import { BefundTabelle } from './befund-tabelle'
import { KatalogSuche } from './katalog-suche'

const FELD: React.CSSProperties = {
  width: '100%', height: 30, background: 'var(--surface)',
  border: '1px solid var(--border)', borderRadius: 6, padding: '0 10px',
  fontSize: 12, color: 'var(--fg)',
}
const FELD_MONO: React.CSSProperties = { ...FELD, fontFamily: 'var(--font-mono)' }

/**
 * Warum die Entwurfstabelle ihre Marke behaelt, obwohl daneben echte
 * Werte stehen (G-46).
 *
 * `[cmd]` Eigener Satz statt `ATTRAPPE`, weil der Grund hier ein
 * anderer ist: nicht „kein Schema", sondern „Schema da, Spalten leer".
 */
const ENTWURFSKATALOG =
  'Bleibt Attrappe: die Tabelle zeigt Zeitreihe, Sparkline und '
  + 'Bereichsbalken. `medical.lab_result_values` fuehrt heute sechs '
  + 'Testwerte und keine Zeitreihe — die Spalten haetten nichts zu '
  + 'zeigen. Die echten Werte stehen oben.'

// ═══ TAB 2 · BIOMARKERS ══════════════════════════════════════════
// [cmd] module-medical-v2.jsx:237-309.
//
// **SEIT G-46 GETEILT.** Oben stehen die echten Daten — die Befundwerte
// der angemeldeten Nutzerin und die Suche über den Katalog mit 11.676
// Markern. Sie tragen KEINE Attrappenmarke mehr.
//
// Darunter steht die Entwurfstabelle der Vorlage mit ihren 48
// erfundenen Markern. `[read]` Der Auftrag: *„Was angebunden ist,
// verliert die Marke. Alles andere behält sie."* Sie behält sie,
// **und der Untertitel sagt, warum sie noch da ist**: sie zeigt
// Verlauf, Sparkline und Bereichsbalken, für die es noch keine Daten
// gibt — `lab_result_values` führt sechs Testwerte, keine Zeitreihe.
export function MedBiomarkers({ echt }: { echt: EchteDaten }) {
  const { open } = useMedical()
  const [cat, setCat] = React.useState('all')
  const [q, setQ] = React.useState('')
  const [onlyFlagged, setOnlyFlagged] = React.useState(false)

  const list = BIOMARKERS
    .filter(b => cat === 'all' || b.cat === cat)
    .filter(b => !q || (b.name + b.de + b.abbr + b.loinc).toLowerCase().includes(q.toLowerCase()))
    .filter(b => !onlyFlagged || calcBiomarkerFlag(b.value, b) !== 'optimal')
    .slice()
    .sort((a, b) => b.prio - a.prio)

  return (
    <div>
      {/* ── ECHT: die Befundwerte ─────────────────────────────── */}
      {echt.ladefehler ? (
        <Card title="Befundwerte" sub="konnten nicht geladen werden">
          <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
            {echt.ladefehler}
          </div>
        </Card>
      ) : (
        <BefundTabelle werte={echt.werte} />
      )}

      <div style={{ height: 14 }} />

      {/* ── ECHT: die Katalogsuche ────────────────────────────── */}
      <KatalogSuche
        start={echt.katalogStart}
        gesamt={echt.katalogGesamt}
        suchen={katalogSuchen}
      />

      <div className="v2-divider" style={{ marginTop: 18, marginBottom: 14 }} />

      <div className="v2-eyebrow" style={{ marginBottom: 8 }}>
        Aus dem Entwurf · noch ohne Datenquelle
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
          <Icon name="search" className="v2-ic v2-ic-sm" style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--fg-subtle)',
          }} />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            aria-label="Search biomarkers"
            placeholder={`Search ${BIOMARKERS.length} biomarkers · name, abbreviation, LOINC…`}
            style={{
              width: '100%', height: 32, background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 7,
              padding: '0 12px 0 30px', fontSize: 12, color: 'var(--fg)',
            }}
          />
        </div>
        <button type="button" onClick={() => setOnlyFlagged(v => !v)}
                aria-pressed={onlyFlagged}
                className={onlyFlagged ? 'v2-btn v2-btn-primary' : 'v2-btn'}>
          <Icon name="filter" className="v2-ic v2-ic-sm" />Non-optimal only
        </button>
      </div>

      <div style={{ display: 'flex', gap: 5, marginBottom: 14, flexWrap: 'wrap' }}>
        {BIOMARKER_CATEGORIES.map(c => (
          <button key={c.id} type="button" onClick={() => setCat(c.id)}
                  aria-pressed={cat === c.id}
                  className={cat === c.id ? 'v2-pill v2-pill-acc' : 'v2-pill'}
                  style={{ cursor: 'pointer', padding: '3px 10px', fontSize: 11 }}>
            {c.label}
            <span className="v2-dim" style={{ marginLeft: 4 }}>
              {c.id === 'all' ? BIOMARKERS.length : BIOMARKERS.filter(b => b.cat === c.id).length}
            </span>
          </button>
        ))}
      </div>

      <Card
        title="Entwurfskatalog"
        sub="48 erfundene Marker mit Verlauf und Bereichsbalken"
        attrappe={ENTWURFSKATALOG}
      >
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Biomarker</th>
                <th style={{ width: 90 }}>LOINC</th>
                <th style={{ width: 90, textAlign: 'right' }}>Value</th>
                <th style={{ width: 190 }}>Lab · optimal · you</th>
                <th style={{ width: 110 }}>Flag</th>
                <th style={{ width: 80 }}>Trend</th>
                <th style={{ width: 80 }}>Sparkline</th>
                <th style={{ width: 26 }} />
              </tr>
            </thead>
            <tbody>
              {list.map(b => {
                const flag = calcBiomarkerFlag(b.value, b)
                const m = FLAG_META[flag]
                return (
                  <tr key={b.id} style={{ cursor: 'pointer' }}
                      onClick={() => open({ typ: 'biomarker', b })}>
                    <td>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{b.name}</div>
                      <div className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>
                        {b.abbr} · {b.cat.replace(/_/g, ' ')} · ev {b.ev}
                      </div>
                    </td>
                    <td className="v2-mono v2-dim" style={{ fontSize: 10.5 }}>{b.loinc}</td>
                    <td className="v2-num" style={{ textAlign: 'right', color: m.c, fontWeight: 600 }}>
                      {b.value}
                      <span className="v2-dim" style={{ fontSize: 9.5, marginLeft: 3 }}>{b.unit}</span>
                    </td>
                    <td style={{ padding: '6px 8px 6px 0' }}>
                      <RangeIndicator b={b} height={16} showLabels={false} />
                    </td>
                    <td><FlagPill flag={flag} /></td>
                    <td><TrendBadge hist={b.hist} /></td>
                    <td style={{ padding: '4px 8px 4px 0' }}>
                      <Sparkline data={b.hist} color={m.c} h={20} />
                    </td>
                    <td>
                      <Icon name="chevron_right" className="v2-ic v2-ic-sm" style={{ color: 'var(--fg-dim)' }} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ═══ TAB 3 · IMPORT ══════════════════════════════════════════════
// [cmd] module-medical-v2.jsx:312-468.
export function MedImport() {
  const { open } = useMedical()
  const [sub, setSub] = React.useState('upload')

  const auto = OCR_EXTRACTED.filter(x => x.action === 'auto').length
  const review = OCR_EXTRACTED.filter(x => x.action === 'review').length
  const reject = OCR_EXTRACTED.filter(x => x.action === 'reject').length

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 7, padding: 2, gap: 1, flexWrap: 'wrap',
        }}>
          {([
            ['upload', 'OCR upload'], ['manual', 'Manual entry'],
            ['history', 'Import history'], ['units', 'Unit conversions'],
          ] as Array<[string, string]>).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setSub(k)} aria-pressed={sub === k}
                    className={sub === k ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
                    style={{ height: 24, fontSize: 11, padding: '0 12px', borderRadius: 5 }}>{l}</button>
          ))}
        </div>
      </div>

      {sub === 'upload' && (
        <div className="v2-grid v2-g-cols-2 v2-med-upload">
          <div className="v2-col-gap" style={{ gap: 14 }}>
            <Card title="Upload lab report"
                  sub="PDF or photo · max 20 MB · Claude Vision extraction"
                  attrappe={ATTRAPPE}>
              <div style={{
                padding: 36, border: '1px dashed var(--border)', borderRadius: 8,
                textAlign: 'center', background: 'var(--surface)', marginBottom: 12,
              }}>
                <Icon name="camera" className="v2-ic" style={{
                  width: 30, height: 30, color: 'var(--fg-dim)', margin: '0 auto 10px',
                }} />
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Drop PDF or image here</div>
                <div className="v2-dim" style={{ fontSize: 11 }}>
                  or use camera · German, English, Thai lab formats supported
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <InEntwicklungKnopf titel="Camera" className="v2-btn"
                                    grund="Der Kamera-Import braucht eine Dateiablage und den OCR-Dienst — beides gibt es noch nicht.">
                  <Icon name="camera" className="v2-ic v2-ic-sm" />Camera
                </InEntwicklungKnopf>
                {/* ABWEICHUNG MIT GRUND: die Vorlage nimmt `file`.
                    `[cmd]` Das Symbol gibt es in packages/ui nicht.
                    Genommen ist `copy` — das Blattmotiv des Satzes.
                    Gemeldet im Bericht. */}
                <InEntwicklungKnopf titel="Choose file" className="v2-btn">
                  <Icon name="copy" className="v2-ic v2-ic-sm" />Choose file
                </InEntwicklungKnopf>
                <div className="v2-spacer" />
                <button type="button" className="v2-btn v2-btn-primary"
                        onClick={() => open({ typ: 'ocrReview' })}>
                  Simulate extraction →
                </button>
              </div>
            </Card>

            <Card title="Pipeline" sub="7 steps · SPEC_04 Feature 2" attrappe={ATTRAPPE}>
              <div className="v2-col-gap" style={{ gap: 5 }}>
                {([
                  ['1', 'Upload to storage', 'file → Supabase Storage, LabReport row created'],
                  ['2', 'Claude Vision call', 'system prompt requests JSON with per-value confidence'],
                  ['3', 'Entity matching', 'extracted name → alias table → LOINC → biomarker_id'],
                  ['4', 'Unit normalization', 'mmol/L → mg/dL etc. via conversion map'],
                  ['5', 'Plausibility check', 'value outside biologically possible range → flag'],
                  ['6', 'Review UI', 'confidence < 0.85 or no biomarker match'],
                  ['7', 'Confirm + insert', 'user accepts → UserBiomarkerResult rows written'],
                ] as Array<[string, string, string]>).map(([n, t, d]) => (
                  <div key={n} style={{
                    display: 'flex', gap: 10, padding: 9, background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: 6,
                  }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: 999, background: 'var(--acc-medic)',
                      color: 'var(--bg)', display: 'grid', placeItems: 'center',
                      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, flexShrink: 0,
                    }}>{n}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{t}</div>
                      <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="v2-col-gap" style={{ gap: 14 }}>
            <Card title="Confidence thresholds" attrappe={ATTRAPPE}>
              <div className="v2-col-gap" style={{ gap: 6 }}>
                {([
                  ['≥ 0.85', 'Auto-accept', 'var(--pos)', `${auto} values`],
                  ['0.60 – 0.84', 'User review required', 'var(--warn)', `${review} values`],
                  ['< 0.60', 'Reject · manual entry', 'var(--neg)', `${reject} value`],
                ] as Array<[string, string, string, string]>).map(([r, a, c, n]) => (
                  <div key={r} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: 10,
                    background: `color-mix(in oklch, ${c} 5%, var(--surface))`,
                    border: `1px solid color-mix(in oklch, ${c} 26%, var(--border))`,
                    borderRadius: 6,
                  }}>
                    <span className="v2-num" style={{ fontSize: 12, color: c, width: 78, flexShrink: 0 }}>{r}</span>
                    <span style={{ fontSize: 12, flex: 1, minWidth: 0 }}>{a}</span>
                    <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{n}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Last extraction" sub="Q2 2026 panel · 12 of 34 shown"
                  attrappe={ATTRAPPE}
                  actions={
                    <button type="button" className="v2-btn v2-btn-sm"
                            onClick={() => open({ typ: 'ocrReview' })}>Open review</button>
                  }>
              <div className="v2-tbl-wrap">
                <table className="v2-tbl">
                  <thead>
                    <tr>
                      <th>Raw text</th>
                      <th>Matched</th>
                      <th style={{ width: 70, textAlign: 'right' }}>Conf</th>
                      <th style={{ width: 70 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {OCR_EXTRACTED.slice(0, 7).map(x => (
                      <tr key={x.raw}>
                        <td className="v2-mono" style={{ fontSize: 11 }}>{x.raw}</td>
                        <td style={{ fontSize: 11.5 }}>
                          {x.matched ?? <span className="v2-dim">no match</span>}
                        </td>
                        <td className="v2-num" style={{
                          textAlign: 'right',
                          color: x.conf >= 0.85 ? 'var(--pos)' : x.conf >= 0.6 ? 'var(--warn)' : 'var(--neg)',
                        }}>{x.conf.toFixed(2)}</td>
                        <td>
                          <Pill variant={x.action === 'auto' ? 'pos' : x.action === 'review' ? 'warn' : 'neg'}
                                style={{ fontSize: 9 }}>{x.action}</Pill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {sub === 'manual' && (
        <Card title="Manual entry" sub="search catalog → enter value" attrappe={ATTRAPPE}>
          <div style={{ maxWidth: 640 }}>
            <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Biomarker</div>
            <input aria-label="Biomarker" placeholder="Search by name, abbreviation, or LOINC…"
                   style={{ ...FELD, height: 32, borderRadius: 7, padding: '0 12px', marginBottom: 12 }} />
            <div className="v2-grid v2-g-cols-4" style={{ gap: 10, marginBottom: 12 }}>
              <div>
                <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Value</div>
                <input aria-label="Value" placeholder="0.0" style={FELD_MONO} />
              </div>
              <div>
                <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Unit</div>
                <input aria-label="Unit" placeholder="ng/mL" style={FELD_MONO} />
              </div>
              <div>
                <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Test date</div>
                <input type="date" aria-label="Test date" defaultValue="2026-08-15" style={FELD_MONO} />
              </div>
              <div>
                <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Fasting</div>
                <select aria-label="Fasting" defaultValue="fasting" style={FELD}>
                  <option>fasting</option><option>non-fasting</option><option>unknown</option>
                </select>
              </div>
            </div>
            <div className="v2-grid v2-g-cols-3" style={{ gap: 10, marginBottom: 12 }}>
              <div>
                <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Lab name</div>
                <input aria-label="Lab name" defaultValue="MVZ Lab Berlin" style={FELD} />
              </div>
              <div>
                <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Lab range min</div>
                <input aria-label="Lab range min" placeholder="optional" style={FELD_MONO} />
              </div>
              <div>
                <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Lab range max</div>
                <input aria-label="Lab range max" placeholder="optional" style={FELD_MONO} />
              </div>
            </div>
            <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Notes</div>
            <input aria-label="Notes" placeholder="Context, symptoms at time of test…"
                   style={{ ...FELD, marginBottom: 14 }} />
            <InEntwicklungKnopf titel="Save value" className="v2-btn v2-btn-primary"
                                grund="Eigene Messwerte brauchen eine Tabelle medical.biomarker_results — das Schema gibt es noch nicht.">
              <Icon name="check" className="v2-ic v2-ic-sm" />Save value
            </InEntwicklungKnopf>
          </div>
        </Card>
      )}

      {sub === 'history' && (
        <Card title="Import history"
              sub={`${LAB_REPORTS.length} reports · ${LAB_REPORTS.reduce((s, r) => s + r.markers, 0)} markers total`}
              attrappe={ATTRAPPE}>
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>ID</th>
                  <th style={{ width: 100 }}>Date</th>
                  <th>Lab</th>
                  <th>File</th>
                  <th style={{ width: 80, textAlign: 'right' }}>Markers</th>
                  <th style={{ width: 100, textAlign: 'right' }}>Needs review</th>
                  <th style={{ width: 100 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {LAB_REPORTS.map(r => (
                  <tr key={r.id}>
                    <td className="v2-num">{r.id}</td>
                    <td className="v2-num v2-muted">{r.date}</td>
                    <td>{r.lab}</td>
                    <td className="v2-mono v2-dim" style={{ fontSize: 10.5 }}>{r.file} · {r.size}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{r.markers}</td>
                    <td className="v2-num" style={{
                      textAlign: 'right',
                      color: r.needs_review ? 'var(--warn)' : 'var(--fg-dim)',
                    }}>{r.needs_review || '—'}</td>
                    <td><Pill variant="pos">{r.status}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {sub === 'units' && (
        <Card title="Unit normalization map" sub="applied automatically during OCR import"
              attrappe={ATTRAPPE}>
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Analyte</th>
                  <th style={{ width: 110 }}>From</th>
                  <th style={{ width: 110 }}>To</th>
                  <th style={{ width: 110, textAlign: 'right' }}>Factor</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                {UNIT_CONVERSIONS.map(c => (
                  <tr key={c.analyte}>
                    <td>{c.analyte}</td>
                    <td className="v2-mono">{c.from}</td>
                    <td className="v2-mono">{c.to}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>× {c.factor}</td>
                    <td className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>
                      5.66 {c.from} → {(5.66 * c.factor).toFixed(2)} {c.to}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
