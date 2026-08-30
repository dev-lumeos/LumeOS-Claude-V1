'use client'

// Die acht Modale des Medical-Moduls.
//
// QUELLE: theme-v1/module-medical-modals.jsx (453 Zeilen) — `MMod`
// (der Rahmen) und acht Modale.
//
// `[cmd]` Der Rahmen `-v2.jsx` ruft sie als BLOSSE GLOBALE auf
// (`<BiomarkerDetailModal/>`), nicht ueber `window.X` — obwohl die
// Datei sie als `window.X = …` definiert. Beides funktioniert im
// selben Skript-Gueltigkeitsbereich; ein `window.`-Grep im Rahmen
// findet sie deshalb nicht. Siehe Bericht.
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// `color-mix(in srgb, …)` -> `in oklch`, Escape schliesst, Felder
// bekommen `aria-label`, Knoepfe ohne Ziel oeffnen `InEntwicklung`.
//
// `[cmd]` ALLES IST ATTRAPPE. Kein Modal schreibt — es gibt kein
// `medical`-Schema.
import * as React from 'react'
import { Card, Pill, Icon, Row, LineChart, InEntwicklungKnopf } from '@lumeos/ui'

import {
  BIOMARKERS, FLAG_META, SYMPTOM_BIOMARKER_MAP, SUPPLEMENT_BIOMARKER_MAP,
  MEDICATIONS_V2, OCR_EXTRACTED,
  calcBiomarkerFlag, calcBiomarkerTrend, calcSupplementEffectiveness,
  type Biomarker, type Symptom, type Medikament, type Wirksamkeit,
} from './daten'
import { RangeIndicator, FlagPill } from './bausteine'
import type { ModalZustand } from './kontext'
// `[read]` Das Marker-Modal steht in einer eigenen Datei, weil diese
// hier Attrappe ist und jenes echte Werte zeigt — dieselbe Trennung an
// der Datei wie schon bei `marker-liste.tsx`.
import { MarkerReihenModal } from './marker-modal'

// ── Der Rahmen ──────────────────────────────────────────────────
// [cmd] module-medical-modals.jsx:3-18.
//
// `[read]` EXPORTIERT seit G-60: das Marker-Modal mit den echten
// Werten liegt in `marker-modal.tsx` und benutzt denselben Rahmen.
// Zwei Rahmen waeren zwei Wahrheiten ueber Kopfzeile, Escape und
// Fusszeile — der Rahmen ist die Vorlage, nicht die Attrappe.
export function MMod({
  title, subtitle, eyebrow, accent, onClose, footer, children, width = 660,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  eyebrow?: React.ComponentProps<typeof Icon>['name']
  accent?: string
  onClose: () => void
  footer?: React.ReactNode
  children: React.ReactNode
  width?: number
}) {
  // Wie in `InEntwicklung`: ohne Escape ist das Modal per Tastatur eine
  // Sackgasse. Die Vorlage hat das nicht.
  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" style={{ width, maxWidth: '94vw', maxHeight: '92vh' }}
           role="dialog" aria-modal="true"
           aria-label={typeof title === 'string' ? title : undefined}
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          {eyebrow && (
            <div style={{
              width: 26, height: 26, borderRadius: 6, flexShrink: 0,
              background: `color-mix(in oklch, ${accent ?? 'var(--acc-medic)'} 18%, transparent)`,
              border: `1px solid color-mix(in oklch, ${accent ?? 'var(--acc-medic)'} 35%, var(--border))`,
              color: accent ?? 'var(--acc-medic)', display: 'grid', placeItems: 'center',
            }}><Icon name={eyebrow} className="v2-ic" /></div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
            {subtitle && <div className="v2-dim" style={{ fontSize: 11 }}>{subtitle}</div>}
          </div>
          <button type="button" className="v2-icon-btn" onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic" />
          </button>
        </div>
        <div className="v2-modal-body" style={{ overflowY: 'auto' }}>{children}</div>
        {footer && <div className="v2-modal-f">{footer}</div>}
      </div>
    </div>
  )
}

const FELD: React.CSSProperties = {
  width: '100%', height: 30, background: 'var(--surface)',
  border: '1px solid var(--border)', borderRadius: 6, padding: '0 10px',
  fontSize: 12, color: 'var(--fg)',
}
const FELD_MONO: React.CSSProperties = { ...FELD, fontFamily: 'var(--font-mono)' }

// ── Die Verteilung ──────────────────────────────────────────────
export function MedicalModale({ modal, onClose }: {
  modal: ModalZustand | null; onClose: () => void
}) {
  if (!modal) return null
  switch (modal.typ) {
    case 'biomarker': return <BiomarkerDetailModal b={modal.b} onClose={onClose} />
    case 'markerReihe': return <MarkerReihenModal r={modal.r} effekte={modal.effekte ?? []} onClose={onClose} />
    case 'symptom': return <SymptomDetailModal s={modal.s} onClose={onClose} />
    case 'logSymptom': return <LogSymptomModal onClose={onClose} />
    case 'med': return <MedicationDetailModal m={modal.m} onClose={onClose} />
    case 'export': return <DoctorExportModal onClose={onClose} />
    case 'privacy': return <PrivacyTiersModal onClose={onClose} />
    case 'ocrReview': return <OCRReviewModal onClose={onClose} />
    case 'manualEntry': return <ManualEntryModal onClose={onClose} />
    default: return null
  }
}

// ── Biomarker-Detail ────────────────────────────────────────────
// [cmd] module-medical-modals.jsx:21-129.
export function BiomarkerDetailModal({ b, onClose }: { b: Biomarker; onClose: () => void }) {
  const flag = calcBiomarkerFlag(b.value, b)
  const meta = FLAG_META[flag]
  const trend = calcBiomarkerTrend(b.hist)
  const suppl = SUPPLEMENT_BIOMARKER_MAP
    .filter(s => s.biomarker === b.id)
    .map(calcSupplementEffectiveness)
    .filter((e): e is Wirksamkeit => Boolean(e))
  const relatedSymptoms = Object.entries(SYMPTOM_BIOMARKER_MAP)
    .filter(([, names]) => names.includes(b.name))
    .map(([s]) => s)
  const meds = MEDICATIONS_V2.filter(m => m.targets.includes(b.abbr))

  return (
    <MMod title={b.name}
          subtitle={`${b.de} · ${b.abbr} · LOINC ${b.loinc} · ${b.cat.replace(/_/g, ' ')}`}
          eyebrow="trend_up" onClose={onClose} width={760}
          footer={
            <>
              <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>
              <InEntwicklungKnopf titel="Add value" className="v2-btn">
                <Icon name="plus" className="v2-ic v2-ic-sm" />Add value
              </InEntwicklungKnopf>
              <InEntwicklungKnopf titel="Export trend" className="v2-btn">
                <Icon name="download" className="v2-ic v2-ic-sm" />Export trend
              </InEntwicklungKnopf>
            </>
          }>
      <div className="v2-grid v2-g-cols-4 v2-med-vier" style={{ gap: 10, marginBottom: 14 }}>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Current</div>
          <div className="v2-num" style={{ fontSize: 20, fontWeight: 600, color: meta.c }}>
            {b.value}<span className="v2-dim" style={{ fontSize: 10, marginLeft: 3 }}>{b.unit}</span>
          </div>
          <div style={{ marginTop: 4 }}><FlagPill flag={flag} small /></div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Lab range</div>
          <div className="v2-num" style={{ fontSize: 14, color: 'var(--acc-recov)' }}>
            {b.lab_min} – {b.lab_max}
          </div>
          <div className="v2-dim" style={{ fontSize: 9.5, marginTop: 3 }}>clinical normal</div>
        </Card>
        <Card className="v2-card-tight" style={{
          padding: 12,
          background: 'color-mix(in oklch, var(--pos) 6%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--pos) 26%, var(--border))',
        }}>
          <div className="v2-eyebrow" style={{ marginBottom: 3, color: 'var(--pos)' }}>Optimal range</div>
          <div className="v2-num" style={{ fontSize: 14, color: 'var(--pos)' }}>
            {b.optimal_min} – {b.optimal_max}
          </div>
          <div className="v2-dim" style={{ fontSize: 9.5, marginTop: 3 }}>performance / longevity</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Trend · {trend.n} points</div>
          <div className="v2-num" style={{ fontSize: 14 }}>
            {trend.direction === 'rising' ? '↑' : trend.direction === 'falling' ? '↓' : '→'}{' '}
            {trend.change_pct > 0 ? '+' : ''}{trend.change_pct}%
          </div>
          <div className="v2-dim" style={{ fontSize: 9.5, marginTop: 3 }}>
            {trend.strength} · next ≈ {trend.projected}
          </div>
        </Card>
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Where you sit</div>
      <Card className="v2-card-tight" style={{ padding: 14, marginBottom: 14 }}>
        <RangeIndicator b={b} height={30} />
        <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 10, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
          <span className="v2-row-gap">
            <span style={{ width: 12, height: 10, borderRadius: 2, background: 'color-mix(in oklch, var(--neg) 20%, var(--surface-2))' }} />
            outside lab range
          </span>
          <span className="v2-row-gap">
            <span style={{ width: 12, height: 10, borderRadius: 2, background: 'color-mix(in oklch, var(--acc-recov) 26%, transparent)' }} />
            lab normal
          </span>
          <span className="v2-row-gap">
            <span style={{ width: 12, height: 10, borderRadius: 2, background: 'color-mix(in oklch, var(--pos) 34%, transparent)' }} />
            optimal
          </span>
          <span className="v2-row-gap">
            <span style={{ width: 2.5, height: 11, background: meta.c }} />your value
          </span>
        </div>
      </Card>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>History · 6 panels</div>
      <Card className="v2-card-tight" style={{ padding: 12, marginBottom: 14 }}>
        <LineChart h={150}
                   range={[
                     Math.min(...b.hist, b.optimal_min ?? Infinity) * 0.92,
                     Math.max(...b.hist, b.optimal_max ?? 0) * 1.08,
                   ]}
                   xLabels={['Q1 25', 'Q2 25', 'Q3 25', 'Q4 25', 'Q1 26', 'Q2 26']}
                   series={[
                     { data: b.hist, color: meta.c },
                     { data: Array(b.hist.length).fill(b.optimal_min), color: 'var(--pos)' },
                     { data: Array(b.hist.length).fill(b.optimal_max), color: 'var(--pos)' },
                   ]} />
        <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 10.5, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
          <span className="v2-row-gap"><span className="v2-dot" style={{ background: meta.c }} />your values</span>
          <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--pos)' }} />optimal band</span>
          <span style={{ marginLeft: 'auto' }} className="v2-mono">slope {trend.slope} / panel</span>
        </div>
      </Card>

      <div className="v2-grid v2-g-cols-2" style={{ gap: 12, marginBottom: 14 }}>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 5 }}>Clinical significance</div>
          <div style={{ fontSize: 11.5, lineHeight: 1.55, color: 'var(--fg-muted)' }}>{b.sig}</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 5 }}>Testing</div>
          <Row label="Recommended frequency" value={b.freq} />
          <Row label="Fasting required" value={b.fasting ? 'yes' : 'no'} />
          <Row label="Evidence level" value={b.ev} />
          <Row label="Sample" value="serum" />
        </Card>
      </div>

      {(suppl.length > 0 || meds.length > 0 || relatedSymptoms.length > 0) && (
        <>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Linked across modules</div>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {suppl.map(e => (
              <div key={`${e.supplement}-${e.biomarker}`} style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: 9,
                background: 'color-mix(in oklch, var(--acc-suppl) 5%, var(--surface))',
                border: '1px solid color-mix(in oklch, var(--acc-suppl) 22%, var(--border))',
                borderRadius: 5, flexWrap: 'wrap',
              }}>
                <Icon name="supplements" className="v2-ic v2-ic-sm" style={{ color: 'var(--acc-suppl)' }} />
                <span style={{ fontSize: 11.5, flex: 1, minWidth: 0 }}>{e.supplement} since {e.start}</span>
                <span className="v2-num" style={{ fontSize: 11 }}>{e.baseline} → {e.latest}</span>
                <Pill variant={e.status === 'effective' ? 'pos' : undefined} style={{ fontSize: 9.5 }}>
                  {e.status.replace(/_/g, ' ')}
                </Pill>
              </div>
            ))}
            {meds.map(m => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: 9,
                background: 'color-mix(in oklch, var(--acc-medic) 5%, var(--surface))',
                border: '1px solid color-mix(in oklch, var(--acc-medic) 22%, var(--border))',
                borderRadius: 5, flexWrap: 'wrap',
              }}>
                <Icon name="medical" className="v2-ic v2-ic-sm" style={{ color: 'var(--acc-medic)' }} />
                <span style={{ fontSize: 11.5, flex: 1, minWidth: 0 }}>{m.name} monitors this marker</span>
                <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{m.monitoring_frequency}</span>
                {m.monitoring_overdue && <Pill variant="warn" style={{ fontSize: 9.5 }}>overdue</Pill>}
              </div>
            ))}
            {relatedSymptoms.map(s => (
              <div key={s} style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: 9,
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5,
              }}>
                <Icon name="edit" className="v2-ic v2-ic-sm" style={{ color: 'var(--fg-muted)' }} />
                <span style={{ fontSize: 11.5, flex: 1, minWidth: 0 }}>
                  Associated with symptom:{' '}
                  <span style={{ textTransform: 'capitalize' }}>{s.replace(/_/g, ' ')}</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </MMod>
  )
}

// ── Symptom-Detail ──────────────────────────────────────────────
// [cmd] module-medical-modals.jsx:132-184.
function SymptomDetailModal({ s, onClose }: { s: Symptom; onClose: () => void }) {
  const linked = (SYMPTOM_BIOMARKER_MAP[s.name] ?? [])
    .map(n => BIOMARKERS.find(b => b.name === n))
    .filter((b): b is Biomarker => Boolean(b))

  return (
    <MMod title={s.label}
          subtitle={`${s.cat} · onset ${s.onset}${s.resolved ? ` · resolved ${s.resolved}` : ' · ongoing'}`}
          eyebrow="edit" accent="var(--warn)" onClose={onClose}
          footer={
            <>
              <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>
              <InEntwicklungKnopf titel="Update" className="v2-btn">
                <Icon name="edit" className="v2-ic v2-ic-sm" />Update
              </InEntwicklungKnopf>
              {!s.resolved && (
                <InEntwicklungKnopf titel="Mark resolved" className="v2-btn v2-btn-primary">
                  <Icon name="check" className="v2-ic v2-ic-sm" />Mark resolved
                </InEntwicklungKnopf>
              )}
            </>
          }>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 10, marginBottom: 14 }}>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Severity</div>
          <div className="v2-num" style={{
            fontSize: 18,
            color: s.severity >= 7 ? 'var(--neg)' : s.severity >= 4 ? 'var(--warn)' : 'var(--acc-recov)',
          }}>{s.severity}<span className="v2-dim" style={{ fontSize: 11 }}>/10</span></div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Daily impact</div>
          <div className="v2-num" style={{ fontSize: 18 }}>
            {s.impact}<span className="v2-dim" style={{ fontSize: 11 }}>/10</span>
          </div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Duration</div>
          <div className="v2-num" style={{ fontSize: 14 }}>{s.resolved ? 'resolved' : 'ongoing'}</div>
          <div className="v2-dim" style={{ fontSize: 10 }}>since {s.onset}</div>
        </Card>
      </div>

      <div className="v2-grid v2-g-cols-2" style={{ gap: 12, marginBottom: 14 }}>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 5 }}>Potential triggers</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {s.triggers.map(t => <Pill key={t}>{t}</Pill>)}
          </div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 5 }}>Relieving factors</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {s.relieving.map(t => <Pill key={t} variant="pos">{t}</Pill>)}
          </div>
        </Card>
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Biomarkers associated with this symptom</div>
      <div className="v2-tbl-wrap">
        <table className="v2-tbl">
          <thead>
            <tr>
              <th>Biomarker</th>
              <th style={{ width: 90, textAlign: 'right' }}>Value</th>
              <th style={{ width: 160 }}>Range</th>
              <th style={{ width: 110 }}>Flag</th>
            </tr>
          </thead>
          <tbody>
            {linked.map(b => {
              const f = calcBiomarkerFlag(b.value, b)
              return (
                <tr key={b.id}>
                  <td style={{ fontSize: 12 }}>{b.name}</td>
                  <td className="v2-num" style={{ textAlign: 'right', color: FLAG_META[f].c }}>
                    {b.value} <span className="v2-dim" style={{ fontSize: 9.5 }}>{b.unit}</span>
                  </td>
                  <td><RangeIndicator b={b} height={12} showLabels={false} /></td>
                  <td><FlagPill flag={f} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: 12, padding: 11, background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: 6,
        fontSize: 11, color: 'var(--fg-muted)', lineHeight: 1.55,
      }}>
        This is a statistical association from the biomarker catalog, not a diagnosis. Non-optimal values here may or may not relate to your symptom. Discuss with your doctor.
      </div>

      {s.photos > 0 && (
        <>
          <div className="v2-eyebrow" style={{ marginTop: 14, marginBottom: 6 }}>Photos · {s.photos}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Array.from({ length: s.photos }).map((_, i) => (
              <div key={i} className="v2-placeholder-img"
                   style={{ width: 100, aspectRatio: '1', borderRadius: 6, fontSize: 9 }}>
                photo {i + 1}
              </div>
            ))}
          </div>
        </>
      )}
    </MMod>
  )
}

// ── Symptom erfassen ────────────────────────────────────────────
// [cmd] module-medical-modals.jsx:187-245.
function LogSymptomModal({ onClose }: { onClose: () => void }) {
  const [sev, setSev] = React.useState(5)
  const [impact, setImpact] = React.useState(4)
  const [name, setName] = React.useState('fatigue')
  const linked = (SYMPTOM_BIOMARKER_MAP[name] ?? [])
    .map(n => BIOMARKERS.find(b => b.name === n))
    .filter((b): b is Biomarker => Boolean(b))

  return (
    <MMod title="Log symptom" subtitle="Tracked over time · correlated with biomarkers"
          eyebrow="plus" accent="var(--warn)" onClose={onClose}
          footer={
            <>
              <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
              {/* @abwesend medical.symptom_log
                  G-278: Was hier fehlt, ist ein Protokoll je Nutzer —
                  nicht der Katalog. Kommt die Tabelle, faellt
                  `tools/abwesenheit-pruefen.mjs` und nennt diese
                  Zeile, statt dass der Grund still falsch wird. */}
              <InEntwicklungKnopf titel="Log symptom" className="v2-btn v2-btn-primary"
                                  grund="`medical.symptoms` gibt es (8 Spalten, 34 Zeilen live) — aber als Katalog: die Tabelle führt Namen, keine Einträge je Nutzer und kein Datum. Was zum Erfassen fehlt, ist ein Protokoll (Nutzer, Symptom, Zeitpunkt, Ausprägung). Gemessen 2026-08-30.">
                <Icon name="check" className="v2-ic v2-ic-sm" />Log symptom
              </InEntwicklungKnopf>
            </>
          }>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 10, marginBottom: 12 }}>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Symptom</div>
          <select value={name} aria-label="Symptom" onChange={e => setName(e.target.value)} style={FELD}>
            {Object.keys(SYMPTOM_BIOMARKER_MAP).map(k => (
              <option key={k} value={k}>{k.replace(/_/g, ' ')}</option>
            ))}
            <option value="other">other (describe)</option>
          </select>
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Category</div>
          <select aria-label="Category" defaultValue="physical" style={FELD}>
            <option>physical</option><option>mental</option><option>digestive</option>
            <option>sleep</option><option>skin</option><option>respiratory</option>
          </select>
        </div>
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 5 }}>Severity · {sev}/10</div>
      <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <button key={i} type="button" onClick={() => setSev(i + 1)}
                  aria-label={`Severity ${i + 1} of 10`} aria-pressed={i + 1 === sev}
                  style={{
                    flex: 1, height: 26, borderRadius: 4, cursor: 'pointer', border: 0,
                    background: i < sev
                      ? (sev >= 7 ? 'var(--neg)' : sev >= 4 ? 'var(--warn)' : 'var(--acc-recov)')
                      : 'var(--surface-2)',
                    color: i + 1 === sev ? 'var(--bg)' : 'var(--fg-dim)',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                  }}>{i + 1}</button>
        ))}
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 5 }}>Impact on daily life · {impact}/10</div>
      <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <button key={i} type="button" onClick={() => setImpact(i + 1)}
                  aria-label={`Impact ${i + 1} of 10`} aria-pressed={i + 1 === impact}
                  style={{
                    flex: 1, height: 26, borderRadius: 4, cursor: 'pointer', border: 0,
                    background: i < impact ? 'var(--acc-medic)' : 'var(--surface-2)',
                    color: i + 1 === impact ? 'var(--bg)' : 'var(--fg-dim)',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                  }}>{i + 1}</button>
        ))}
      </div>

      <div className="v2-grid v2-g-cols-2" style={{ gap: 10, marginBottom: 12 }}>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Onset</div>
          <input type="datetime-local" aria-label="Onset" defaultValue="2026-08-15T09:00" style={FELD_MONO} />
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Photos</div>
          <InEntwicklungKnopf titel="Attach" className="v2-btn"
                              style={{ width: '100%', height: 30, justifyContent: 'center' }}>
            <Icon name="camera" className="v2-ic v2-ic-sm" />Attach
          </InEntwicklungKnopf>
        </div>
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Potential triggers · comma-separated</div>
      <input aria-label="Potential triggers" placeholder="late caffeine, poor sleep, travel…"
             style={{ ...FELD, marginBottom: 12 }} />

      {linked.length > 0 && (
        <div style={{
          padding: 11,
          background: 'color-mix(in oklch, var(--acc-medic) 5%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--acc-medic) 22%, var(--border))',
          borderRadius: 6,
        }}>
          <div className="v2-eyebrow" style={{ marginBottom: 5, color: 'var(--acc-medic)' }}>
            Markers LumeOS will check against this symptom
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {linked.map(b => {
              const f = calcBiomarkerFlag(b.value, b)
              return (
                <Pill key={b.id} style={f !== 'optimal'
                  ? {
                    borderColor: `color-mix(in oklch, ${FLAG_META[f].c} 35%, var(--border))`,
                    color: FLAG_META[f].c,
                  }
                  : undefined}>{b.abbr} {b.value}</Pill>
              )
            })}
          </div>
        </div>
      )}
    </MMod>
  )
}

// ── Medikamenten-Detail ─────────────────────────────────────────
// [cmd] module-medical-modals.jsx:248-302.
function MedicationDetailModal({ m, onClose }: { m: Medikament; onClose: () => void }) {
  return (
    <MMod title={m.name}
          subtitle={`${m.type} · ${m.dosage} · ${m.frequency.replace(/_/g, ' ')}`}
          eyebrow="medical" onClose={onClose}
          footer={
            <>
              <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>
              <InEntwicklungKnopf titel="Edit" className="v2-btn">
                <Icon name="edit" className="v2-ic v2-ic-sm" />Edit
              </InEntwicklungKnopf>
              {m.monitoring_overdue && (
                <InEntwicklungKnopf titel="Schedule bloodwork" className="v2-btn v2-btn-primary">
                  Schedule bloodwork
                </InEntwicklungKnopf>
              )}
            </>
          }>
      <div className="v2-grid v2-g-cols-4 v2-med-vier" style={{ gap: 10, marginBottom: 14 }}>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Started</div>
          <div className="v2-num" style={{ fontSize: 13 }}>{m.start ?? '—'}</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Monitoring</div>
          <div className="v2-num" style={{ fontSize: 13 }}>{m.monitoring ? m.monitoring_frequency : 'none'}</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Last test</div>
          <div className="v2-num" style={{ fontSize: 13 }}>{m.last_test ?? '—'}</div>
        </Card>
        <Card className="v2-card-tight" style={{
          padding: 12,
          background: m.monitoring_overdue ? 'color-mix(in oklch, var(--warn) 6%, var(--surface))' : undefined,
          border: m.monitoring_overdue ? '1px solid color-mix(in oklch, var(--warn) 28%, var(--border))' : undefined,
        }}>
          <div className="v2-eyebrow" style={m.monitoring_overdue ? { color: 'var(--warn)' } : undefined}>
            Next due
          </div>
          <div className="v2-num" style={{ fontSize: 13, color: m.monitoring_overdue ? 'var(--warn)' : 'var(--fg)' }}>
            {m.next_due ?? '—'}
          </div>
        </Card>
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 5 }}>Indication</div>
      <div style={{ fontSize: 12.5, marginBottom: 14 }}>{m.indication}</div>

      {m.targets.length > 0 && (
        <>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Monitored biomarkers</div>
          <div className="v2-tbl-wrap" style={{ marginBottom: 14 }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Marker</th>
                  <th style={{ width: 100, textAlign: 'right' }}>Current</th>
                  <th style={{ width: 150 }}>Range</th>
                  <th style={{ width: 110 }}>Flag</th>
                </tr>
              </thead>
              <tbody>
                {m.targets.map(t => {
                  const b = BIOMARKERS.find(x => x.abbr === t)
                  if (!b) return null
                  const f = calcBiomarkerFlag(b.value, b)
                  return (
                    <tr key={t}>
                      <td style={{ fontSize: 12 }}>{b.name}</td>
                      <td className="v2-num" style={{ textAlign: 'right', color: FLAG_META[f].c }}>
                        {b.value} <span className="v2-dim" style={{ fontSize: 9.5 }}>{b.unit}</span>
                      </td>
                      <td><RangeIndicator b={b} height={12} showLabels={false} /></td>
                      <td><FlagPill flag={f} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {m.side_effects.length > 0 && (
        <>
          <div className="v2-eyebrow" style={{ marginBottom: 5 }}>Reported side effects</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
            {m.side_effects.map(s => <Pill key={s} variant="warn">{s}</Pill>)}
          </div>
        </>
      )}

      {m.interactions.length > 0 && (
        <div style={{
          padding: 11,
          background: 'color-mix(in oklch, var(--warn) 5%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--warn) 24%, var(--border))',
          borderRadius: 6,
        }}>
          <div className="v2-eyebrow" style={{ marginBottom: 5, color: 'var(--warn)' }}>Known interactions</div>
          {m.interactions.map(x => (
            <div key={x} style={{ fontSize: 11.5, color: 'var(--fg-muted)', lineHeight: 1.5 }}>· {x}</div>
          ))}
        </div>
      )}

      {m.physician && (
        <div style={{ marginTop: 12 }}>
          <Row label="Prescriber" value={m.physician} />
          <Row label="Prescription" value={m.rx ?? '—'} />
        </div>
      )}
    </MMod>
  )
}

// ── OCR-Pruefung ────────────────────────────────────────────────
// [cmd] module-medical-modals.jsx:305-355.
function OCRReviewModal({ onClose }: { onClose: () => void }) {
  const auto = OCR_EXTRACTED.filter(x => x.action === 'auto')
  const review = OCR_EXTRACTED.filter(x => x.action === 'review')
  const reject = OCR_EXTRACTED.filter(x => x.action === 'reject')

  return (
    <MMod title="Review extracted values"
          subtitle={`Q2 2026 panel · ${OCR_EXTRACTED.length} of 34 shown · ${auto.length} auto-accepted, ${review.length} need review`}
          eyebrow="camera" onClose={onClose} width={860}
          footer={
            <>
              <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel import</button>
              <div className="v2-spacer" />
              <span className="v2-dim v2-mono" style={{ fontSize: 10.5, alignSelf: 'center', marginRight: 8 }}>
                {auto.length + review.length} values will be saved
              </span>
              {/* @abwesend medical.biomarker_results
                  G-278: Der Import-Knopf begruendet sich damit, dass es sie nicht gibt. Kommt die Tabelle,
                  faellt `tools/abwesenheit-pruefen.mjs` und nennt
                  diese Zeile — statt dass der Grund still falsch
                  wird (A-62). Gemessen 2026-08-30: FEHLT. */}
              <InEntwicklungKnopf titel="Confirm + save" className="v2-btn v2-btn-primary"
                                  grund="Der Import braucht eine Tabelle medical.biomarker_results — die gibt es nicht. Gemessene Werte stehen in `medical.lab_result_values` (280 Zeilen); ein eigener Schreibweg fehlt.">
                <Icon name="check" className="v2-ic v2-ic-sm" />Confirm + save
              </InEntwicklungKnopf>
            </>
          }>
      <div className="v2-tbl-wrap">
        <table className="v2-tbl">
          <thead>
            <tr>
              <th style={{ width: 26 }} />
              <th>Raw OCR text</th>
              <th>Matched biomarker</th>
              <th style={{ width: 80 }}>LOINC</th>
              <th style={{ width: 120, textAlign: 'right' }}>Value</th>
              <th style={{ width: 130 }}>Normalized</th>
              <th style={{ width: 70, textAlign: 'right' }}>Conf</th>
              <th style={{ width: 80 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {OCR_EXTRACTED.map(x => {
              const c = x.conf >= 0.85 ? 'var(--pos)' : x.conf >= 0.6 ? 'var(--warn)' : 'var(--neg)'
              return (
                <tr key={x.raw} style={{
                  background: x.action === 'review' ? 'color-mix(in oklch, var(--warn) 4%, transparent)'
                    : x.action === 'reject' ? 'color-mix(in oklch, var(--neg) 4%, transparent)' : undefined,
                }}>
                  <td>
                    <input type="checkbox" defaultChecked={x.action !== 'reject'}
                           aria-label={`${x.raw} uebernehmen`}
                           style={{ accentColor: 'var(--acc-medic)' }} />
                  </td>
                  <td className="v2-mono" style={{ fontSize: 11 }}>{x.raw}</td>
                  <td style={{ fontSize: 11.5 }}>
                    {x.matched ?? <span style={{ color: 'var(--neg)' }}>no catalog match</span>}
                  </td>
                  <td className="v2-mono v2-dim" style={{ fontSize: 10 }}>{x.loinc ?? '—'}</td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>
                    {x.value} <span className="v2-dim" style={{ fontSize: 9.5 }}>{x.unit}</span>
                  </td>
                  <td>
                    {x.converted
                      ? (
                        <span className="v2-mono" style={{ fontSize: 10.5, color: 'var(--acc-recov)' }}>
                          × {x.converted.factor} → {x.converted.result} {x.converted.to}
                        </span>
                      )
                      : <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>no conversion</span>}
                  </td>
                  <td className="v2-num" style={{ textAlign: 'right', color: c }}>{x.conf.toFixed(2)}</td>
                  <td>
                    <Pill variant={x.action === 'auto' ? 'pos' : x.action === 'review' ? 'warn' : 'neg'}
                          style={{ fontSize: 9 }}>{x.action}</Pill>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {reject.length > 0 && (
        <div style={{
          marginTop: 12, padding: 11,
          background: 'color-mix(in oklch, var(--neg) 5%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--neg) 24%, var(--border))',
          borderRadius: 6, fontSize: 11.5, color: 'var(--fg-muted)', lineHeight: 1.55,
        }}>
          <Icon name="alert" className="v2-ic v2-ic-sm" style={{
            display: 'inline', verticalAlign: 'middle', marginRight: 5, color: 'var(--neg)',
          }} />
          {reject.length} value below the 0.60 confidence floor and unmatched in the catalog ({reject.map(r => r.raw).join(', ')}). Enter manually if needed.
        </div>
      )}
    </MMod>
  )
}

// ── Manuelle Eingabe ────────────────────────────────────────────
// [cmd] module-medical-modals.jsx:358-372.
function ManualEntryModal({ onClose }: { onClose: () => void }) {
  return (
    <MMod title="Add biomarker value" subtitle="manual entry · counts toward system scores"
          eyebrow="plus" onClose={onClose}
          footer={
            <>
              <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
              {/* @abwesend medical.biomarker_results
                  G-278: derselbe Grund an einem zweiten Knopf.
                  Gemessen 2026-08-30: FEHLT. */}
              <InEntwicklungKnopf titel="Save value" className="v2-btn v2-btn-primary"
                                  grund="Eigene Messwerte brauchen eine Tabelle medical.biomarker_results — die gibt es nicht. Gemessene Werte stehen in `medical.lab_result_values` (280 Zeilen); ein eigener Schreibweg fehlt.">
                <Icon name="check" className="v2-ic v2-ic-sm" />Save value
              </InEntwicklungKnopf>
            </>
          }>
      <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Biomarker</div>
      <input aria-label="Biomarker" placeholder="Search name, abbreviation, LOINC…"
             style={{ ...FELD, height: 32, borderRadius: 7, padding: '0 12px', marginBottom: 12 }} />
      <div className="v2-grid v2-g-cols-4 v2-med-vier" style={{ gap: 10, marginBottom: 12 }}>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Value</div>
          <input aria-label="Value" placeholder="0.0" style={FELD_MONO} />
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Unit</div>
          <input aria-label="Unit" placeholder="ng/mL" style={FELD_MONO} />
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Date</div>
          <input type="date" aria-label="Date" defaultValue="2026-08-15" style={FELD_MONO} />
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Fasting</div>
          <select aria-label="Fasting" defaultValue="fasting" style={FELD}>
            <option>fasting</option><option>non-fasting</option><option>unknown</option>
          </select>
        </div>
      </div>
      <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Lab</div>
      <input aria-label="Lab" defaultValue="MVZ Lab Berlin" style={FELD} />
    </MMod>
  )
}

// ── Arztbericht ─────────────────────────────────────────────────
// [cmd] module-medical-modals.jsx:375-400.
function DoctorExportModal({ onClose }: { onClose: () => void }) {
  return (
    <MMod title="Generate doctor report" subtitle="PDF · 6 sections · legal notice included"
          eyebrow="download" onClose={onClose}
          footer={
            <>
              <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
              <InEntwicklungKnopf titel="Share link (30d)" className="v2-btn">
                <Icon name="share" className="v2-ic v2-ic-sm" />Share link (30d)
              </InEntwicklungKnopf>
              <InEntwicklungKnopf titel="Generate PDF" className="v2-btn v2-btn-primary"
                                  grund="Der Arztbericht braucht einen Ausgabeweg (PDF). Die Messwerte liegen vor — `medical.lab_result_values`, 280 Zeilen.">
                <Icon name="download" className="v2-ic v2-ic-sm" />Generate PDF
              </InEntwicklungKnopf>
            </>
          }>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 10, marginBottom: 12 }}>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Report type</div>
          <select aria-label="Report type" defaultValue="Comprehensive" style={FELD}>
            <option>Comprehensive</option><option>Focused</option>
            <option>Progress</option><option>Provider summary</option>
          </select>
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Format</div>
          <select aria-label="Format" defaultValue="PDF" style={FELD}>
            <option>PDF</option><option>FHIR R4 bundle</option><option>CSV</option>
          </select>
        </div>
      </div>
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Included sections</div>
      <div className="v2-col-gap" style={{ gap: 4, marginBottom: 12 }}>
        {[
          'Executive summary · system scores',
          'Critical + flagged values',
          'Full biomarker table (dual ranges)',
          'Supplement effectiveness',
          'Symptom overview · 90 days',
          'Medication list + monitoring',
        ].map(s => (
          <label key={s} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 5, fontSize: 11.5, cursor: 'pointer',
          }}>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--acc-medic)' }} />{s}
          </label>
        ))}
      </div>
      <div style={{
        padding: 11,
        background: 'color-mix(in oklch, var(--neg) 5%, var(--surface))',
        border: '1px solid color-mix(in oklch, var(--neg) 24%, var(--border))',
        borderRadius: 6, fontSize: 11, lineHeight: 1.6,
        color: 'var(--fg-muted)', fontStyle: 'italic',
      }}>
        {'Every report carries: "Dieser Report wurde von LumeOS erstellt. Die enthaltenen Informationen stellen keine medizinische Diagnose oder Therapieempfehlung dar. Bitte besprechen Sie alle Befunde mit Ihrem Arzt."'}
      </div>
    </MMod>
  )
}

// ── Vertraulichkeitsstufen ──────────────────────────────────────
// [cmd] module-medical-modals.jsx:403-453.
function PrivacyTiersModal({ onClose }: { onClose: () => void }) {
  const [tier, setTier] = React.useState(1)
  const tiers = [
    { n: 1, name: 'Local-first', sub: 'default', desc: 'SQLite on device. No cloud sync. LumeOS never sees your medical data.', detail: ['Zero-knowledge by construction', 'No server-side copy exists', 'Backup is your responsibility', 'Coach sharing unavailable'], c: 'var(--pos)' },
    { n: 2, name: 'E2E encrypted cloud', sub: 'opt-in', desc: 'You hold the encryption key. Cloud stores ciphertext only.', detail: ['User-generated key, never transmitted', 'Cross-device sync', 'LumeOS cannot decrypt', 'Key loss = data loss'], c: 'var(--acc-recov)' },
    { n: 3, name: 'Provider sharing', sub: 'opt-in, time-boxed', desc: 'Time-limited access tokens for named providers.', detail: ['Max 30-day expiry per token', 'Per-category scoping', 'One-time access links', 'Full audit trail of every view'], c: 'var(--acc-medic)' },
  ]

  return (
    // ABWEICHUNG MIT GRUND: die Vorlage nimmt `shield`. `[cmd]` Das
    // Symbol gibt es in packages/ui nicht — genommen ist `admin`,
    // dasselbe Schutzschild-Motiv. Gemeldet im Bericht.
    <MMod title="Privacy architecture"
          subtitle="Medical data is the most sensitive category — defaults are restrictive"
          eyebrow="admin" onClose={onClose} width={720}
          footer={
            <>
              <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>
              <InEntwicklungKnopf titel={`Apply tier ${tier}`} className="v2-btn v2-btn-primary">
                Apply tier {tier}
              </InEntwicklungKnopf>
            </>
          }>
      <div className="v2-col-gap" style={{ gap: 8, marginBottom: 14 }}>
        {tiers.map(t => (
          <button key={t.n} type="button" onClick={() => setTier(t.n)} aria-pressed={tier === t.n}
                  style={{
                    padding: 14, borderRadius: 8, cursor: 'pointer', width: '100%',
                    textAlign: 'left', font: 'inherit', color: 'inherit',
                    background: tier === t.n ? `color-mix(in oklch, ${t.c} 7%, var(--surface))` : 'var(--surface)',
                    border: `1px solid ${tier === t.n ? `color-mix(in oklch, ${t.c} 35%, var(--border))` : 'var(--border)'}`,
                  }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5, flexWrap: 'wrap' }}>
              <div style={{
                width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                background: tier === t.n ? t.c : 'var(--surface-2)',
                color: tier === t.n ? 'var(--bg)' : 'var(--fg-dim)',
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
              }}>{t.n}</div>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t.name}</span>
              <Pill style={{ borderColor: `color-mix(in oklch, ${t.c} 35%, var(--border))`, color: t.c }}>
                {t.sub}
              </Pill>
              {tier === t.n && <Pill variant="pos" style={{ marginLeft: 'auto' }}>active</Pill>}
            </div>
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5, marginBottom: 8 }}>{t.desc}</div>
            <div className="v2-med-tier-detail">
              {t.detail.map(d => (
                <div key={d} style={{
                  fontSize: 10.5, color: 'var(--fg-dim)',
                  display: 'flex', gap: 5, alignItems: 'flex-start',
                }}>
                  <span style={{ color: t.c }}>·</span>{d}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Compliance</div>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 8 }}>
        {([
          ['HIPAA', 'RLS + encryption at rest'],
          ['GDPR', 'right to deletion, data export'],
          ['LOINC', 'all biomarkers mapped'],
          ['FHIR R4', 'export format for provider sharing'],
        ] as Array<[string, string]>).map(([k, v]) => (
          <div key={k} style={{
            padding: 9, background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 5,
          }}>
            <div className="v2-eyebrow" style={{ marginBottom: 2 }}>{k}</div>
            <div className="v2-dim" style={{ fontSize: 10.5 }}>{v}</div>
          </div>
        ))}
      </div>
    </MMod>
  )
}
