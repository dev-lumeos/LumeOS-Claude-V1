'use client'

// Zwei Tabs: „Tracking" und „Insights".
//
// QUELLE: theme-v1/module-medical-v2.jsx:471-629 (`MedTracking`),
// :632-816 (`MedInsights`).
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// `color-mix(in srgb, …)` -> `in oklch`, Felder bekommen `aria-label`,
// Knoepfe ohne Ziel oeffnen `InEntwicklung`, und `arr_r` -> `arrow_right`
// (Begruendung an der Stelle).
//
// `[cmd]` ALLES IST ATTRAPPE.
import * as React from 'react'
import { Card, Pill, Icon, Sparkline, InEntwicklungKnopf } from '@lumeos/ui'

import {
  BIOMARKERS, BIOMARKER_CATEGORIES, FLAG_META, SYMPTOMS,
  SYMPTOM_BIOMARKER_MAP, CORRELATIONS, SUPPLEMENT_BIOMARKER_MAP,
  calcBiomarkerFlag, calcSupplementEffectiveness, type Wirksamkeit,
} from './daten'
import { FlagPill } from './bausteine'
import { useMedical } from './kontext'
import { ATTRAPPE } from './ansicht'
import type { EchteDaten, MedikationEcht } from './echtdaten'

const FELD_MONO: React.CSSProperties = {
  width: '100%', height: 30, background: 'var(--surface)',
  border: '1px solid var(--border)', borderRadius: 6, padding: '0 10px',
  fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg)',
}

// ═══ TAB 4 · TRACKING ════════════════════════════════════════════
// [cmd] module-medical-v2.jsx:471-629.
/**
 * Warum „Add medication" noch gesperrt ist (G-123, berichtigt C-142).
 *
 * `[cmd]` **Die alte Begruendung war falsch.** Sie nannte
 * `medical.medications` — *„das Schema gibt es noch nicht."*
 * **`medical.user_medications` gibt es seit C-130**, mit 21 Spalten und
 * 2 Zeilen live.
 *
 * `[cmd]` **Was wirklich fehlt, sind die Ueberwachungsspalten.** Die
 * Kachel der Vorlage zeigt je Medikament `monitoring`,
 * `monitoring_frequency`, `last_test`, `next_due`,
 * `monitoring_overdue`, `targets`, `side_effects`, `physician`, `rx`
 * und `prescription_ref` — **keine einzige davon steht in der Tabelle** (gegen
 * `information_schema` geprueft, 2026-08-20).
 *
 * `[read]` Aus `next_due` und `monitoring_overdue` speisen sich vier
 * der sechs Warnungen im Kopf des Moduls. **Ohne sie waere ein
 * Schreibweg zwar moeglich, die Kachel darueber aber weiter erfunden.**
 */
const MEDIKAMENT_GRUND =
  '`medical.user_medications` gibt es seit C-130 (21 Spalten, 2 Zeilen). '
  + 'Was fehlt, sind die Ueberwachungsspalten der Kachel: monitoring, '
  + 'monitoring_frequency, last_test, next_due, monitoring_overdue, targets, '
  + 'side_effects, physician, rx, prescription_ref — keine davon ist in der Tabelle. Aus '
  + 'next_due und monitoring_overdue kommen vier der sechs Warnungen.'

function dosisText(m: MedikationEcht): string {
  if (m.dose_amount == null && !m.dose_unit) return '—'
  return [m.dose_amount, m.dose_unit].filter(v => v != null && v !== '').join(' ')
}

function frequenzText(m: MedikationEcht): string {
  if (m.doses_per_day == null) return '—'
  return `${m.doses_per_day}/day`
}

export function MedTracking({ echt }: { echt: EchteDaten }) {
  const { open } = useMedical()
  const [sub, setSub] = React.useState<string>('symptoms')
  const active = SYMPTOMS.filter(s => !s.resolved)
  // ── G-207: die Zuordnung aus der Datenbank ──────────────────────
  const stand = echt.symptome
  const zuordnungen = stand.zuordnungen
  const nameJeSymptom = new Map(stand.symptome.map(s2 => [s2.symptom_id, s2.name]))
  const gruppiert = Array.from(
    zuordnungen.reduce((m, z) => {
      const liste = m.get(z.symptom_id) ?? []
      liste.push(z)
      m.set(z.symptom_id, liste)
      return m
    }, new Map<string, typeof zuordnungen>()),
  ).sort((x, y) => (nameJeSymptom.get(x[0]) ?? x[0])
    .localeCompare(nameJeSymptom.get(y[0]) ?? y[0], 'de'))
  const medikationen = echt.medikationen

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 7, padding: 2, gap: 1, flexWrap: 'wrap',
        }}>
          {([
            ['symptoms', `Symptoms · ${active.length}`],
            ['medications', `Medications · ${medikationen.length}`],
          ] as Array<[string, string]>).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setSub(k)} aria-pressed={sub === k}
                    className={sub === k ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
                    style={{ height: 24, fontSize: 11, padding: '0 12px', borderRadius: 5 }}>{l}</button>
          ))}
        </div>
        <div className="v2-spacer" />
        {sub === 'symptoms' && (
          <button type="button" className="v2-btn v2-btn-primary" onClick={() => open({ typ: 'logSymptom' })}>
            <Icon name="plus" className="v2-ic v2-ic-sm" />Log symptom
          </button>
        )}
        {sub === 'medications' && (
          <InEntwicklungKnopf titel="Add medication" className="v2-btn v2-btn-primary"
                              grund={MEDIKAMENT_GRUND}>
            <Icon name="plus" className="v2-ic v2-ic-sm" />Add medication
          </InEntwicklungKnopf>
        )}
      </div>

      {sub === 'symptoms' && (
        <div className="v2-grid-14">
          <div className="v2-col-gap" style={{ gap: 12 }}>
            {/* `[cmd]` Die Vorlage zeigt hier ALLE Symptome, waehrend
                die Tab-Zahl nur die offenen zaehlt. Uebernommen. */}
            {SYMPTOMS.map(s => {
              const linked = (SYMPTOM_BIOMARKER_MAP[s.name] ?? [])
                .map(n => BIOMARKERS.find(b => b.name === n))
                .filter((b): b is NonNullable<typeof b> => Boolean(b))
                .map(b => ({ b, flag: calcBiomarkerFlag(b.value, b) }))
                .filter(x => x.flag !== 'optimal')
              return (
                <Card key={s.id} onClick={() => open({ typ: 'symptom', s })}
                      style={{ cursor: 'pointer' }} attrappe={ATTRAPPE}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 3, alignSelf: 'stretch', flexShrink: 0,
                      background: s.resolved ? 'var(--fg-dim)' : 'var(--warn)', borderRadius: 2,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{s.label}</span>
                        <Pill>{s.cat}</Pill>
                        {s.resolved ? <Pill variant="pos">resolved</Pill> : <Pill variant="warn">active</Pill>}
                        {s.photos > 0 && (
                          <Pill><Icon name="camera" className="v2-ic v2-ic-sm" />{s.photos}</Pill>
                        )}
                        <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                          {s.onset}{s.resolved ? ` → ${s.resolved}` : ''}
                        </span>
                      </div>
                      <div className="v2-med-balken">
                        <div>
                          <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Severity · {s.severity}/10</div>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div key={i} style={{
                                flex: 1, height: 6, borderRadius: 1,
                                background: i < s.severity
                                  ? (s.severity >= 7 ? 'var(--neg)' : s.severity >= 4 ? 'var(--warn)' : 'var(--acc-recov)')
                                  : 'var(--surface-2)',
                              }} />
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Daily impact · {s.impact}/10</div>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div key={i} style={{
                                flex: 1, height: 6, borderRadius: 1,
                                background: i < s.impact ? 'var(--acc-medic)' : 'var(--surface-2)',
                              }} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: linked.length ? 8 : 0 }}>
                        {s.triggers.map(t => <Pill key={t} style={{ fontSize: 9.5 }}>trigger: {t}</Pill>)}
                        {s.relieving.map(t => <Pill key={t} variant="pos" style={{ fontSize: 9.5 }}>helps: {t}</Pill>)}
                      </div>
                      {linked.length > 0 && (
                        <div style={{
                          padding: 9,
                          background: 'color-mix(in oklch, var(--acc-medic) 5%, var(--surface))',
                          border: '1px solid color-mix(in oklch, var(--acc-medic) 22%, var(--border))',
                          borderRadius: 5,
                        }}>
                          <div className="v2-eyebrow" style={{ marginBottom: 4, color: 'var(--acc-medic)' }}>
                            Non-optimal markers linked to this symptom
                          </div>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {linked.map(({ b, flag }) => (
                              <Pill key={b.id} style={{
                                borderColor: `color-mix(in oklch, ${FLAG_META[flag].c} 35%, var(--border))`,
                                color: FLAG_META[flag].c, fontSize: 9.5,
                              }}>{b.abbr} {b.value} {b.unit}</Pill>
                            ))}
                          </div>
                          <div className="v2-dim" style={{ fontSize: 10, marginTop: 5, lineHeight: 1.45 }}>
                            Association only — not a diagnosis. Discuss with your doctor.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* ══ G-207: die Zuordnung kommt aus der Datenbank ═════
              `[cmd]` **Vorher `SYMPTOM_BIOMARKER_MAP`** — 7 Symptome,
              28 Zuordnungen, aufgeloest gegen die Konstante
              `BIOMARKERS`. **Jetzt `medical.symptom_biomarker_map`:
              102 Zuordnungen auf 32 Symptome**, mit LOINC-Kennung,
              Aussagekraft und deutschem Grund.

              `[read]` **Und die Luecken stehen da, statt zu
              verschwinden.** Die alte Zeile schrieb `b?.abbr ?? m` —
              ein unbekannter Marker sah aus wie ein bekannter. */}
          <Card title="Symptom → Biomarker"
                sub={`${zuordnungen.length} Zuordnungen aus dem Katalog`}>
            {stand.fehler && (
              <p className="v2-muted" style={{ fontSize: 12, margin: 0 }}>
                Zuordnungen nicht gelesen: {stand.fehler}
              </p>
            )}
            {!stand.fehler && zuordnungen.length === 0 && (
              <p className="v2-muted" style={{ fontSize: 12, margin: 0 }}>
                Keine Zuordnungen hinterlegt.
              </p>
            )}
            <div className="v2-col-gap" style={{ gap: 8 }}>
              {gruppiert.map(([symptomId, liste]) => (
                <div key={symptomId} style={{
                  padding: 10, background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 6,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'baseline', gap: 8,
                    marginBottom: 5, flexWrap: 'wrap',
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>
                      {nameJeSymptom.get(symptomId) ?? symptomId}
                    </span>
                    {/* `[cmd]` **49 der 102 Zuordnungen** zeigen auf ein
                        Symptom, das der Katalog nicht fuehrt — die
                        Tabelle vermerkt es selbst. */}
                    {liste[0]?.symptomUnbekannt && (
                      <Pill style={{ fontSize: 9 }}>nicht im Katalog</Pill>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    {/* `[cmd]` `Pill` kennt kein `title` — der Grund
                        (bei allen 102 gefuellt) gehoert in eine eigene
                        Zeile, nicht in einen Tooltip. Eigener Punkt,
                        siehe Bericht. */}
                    {liste.map(z => (
                      <Pill key={z.marker_id}
                            variant={z.markerUnbekannt ? 'warn' : undefined}
                            style={{ fontSize: 9.5 }}>
                        {z.analyte ?? z.marker_id}
                        {z.markerUnbekannt ? ' · unbekannt' : ''}
                        {z.spezifitaet === 'HIGH' ? ' · hoch' : ''}
                      </Pill>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* `[read]` **Was beim Lesen auffiel, steht darunter** —
                nicht im Verborgenen. */}
            {stand.befunde.length > 0 && (
              <div className="v2-dim" style={{
                fontSize: 10, marginTop: 8, lineHeight: 1.5,
              }}>
                {stand.befunde.filter(x => x.art === 'marker_unbekannt').length} Zuordnung(en)
                zeigen auf einen Biomarker ausserhalb des Katalogs,
                {' '}{stand.befunde.filter(x => x.art === 'ohne_loinc').length} ohne
                LOINC-Kennung.
              </div>
            )}
          </Card>
        </div>
      )}

      {sub === 'medications' && (
        <div>
          <div className="v2-col-gap" style={{ gap: 12 }}>
            {medikationen.length === 0 && (
              <Card title="Medications">
                <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
                  No medications are stored for this user.
                </div>
              </Card>
            )}
            {medikationen.map(m => (
              <Card key={m.id}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 7, flexShrink: 0,
                    background: 'color-mix(in oklch, var(--acc-medic) 18%, transparent)',
                    border: '1px solid color-mix(in oklch, var(--acc-medic) 35%, var(--border))',
                    color: 'var(--acc-medic)', display: 'grid', placeItems: 'center',
                  }}>
                    <Icon name="medical" className="v2-ic" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{m.name}</span>
                      <Pill>{m.is_active ? 'active' : 'inactive'}</Pill>
                      {m.measurement_source && <Pill className="v2-mono" style={{ fontSize: 9.5 }}>{m.measurement_source}</Pill>}
                    </div>
                    <div className="v2-med-medfelder">
                      <div>
                        <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Dose</div>
                        <div className="v2-num">{dosisText(m)}</div>
                      </div>
                      <div>
                        <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Frequency</div>
                        <div>{frequenzText(m)}</div>
                      </div>
                      <div>
                        <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Indication</div>
                        <div>{m.indication ?? '?'}</div>
                      </div>
                      <div>
                        <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Route</div>
                        <div className="v2-num">{m.route ?? '?'}</div>
                      </div>
                      <div>
                        <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Since</div>
                        <div className="v2-num">{m.start_date ?? '?'}</div>
                      </div>
                    </div>
                    {m.drug_class.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
                        <span className="v2-eyebrow" style={{ marginRight: 2 }}>Classes</span>
                        {m.drug_class.map(c => <Pill key={c} style={{ fontSize: 9.5 }}>{c}</Pill>)}
                      </div>
                    )}
                    {m.cyp_profile.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6, alignItems: 'center' }}>
                        <span className="v2-eyebrow" style={{ marginRight: 2 }}>CYP</span>
                        {m.cyp_profile.map(c => <Pill key={c} style={{ fontSize: 9.5 }}>{c}</Pill>)}
                      </div>
                    )}
                    <div style={{
                      marginTop: 8, padding: 8,
                      background: 'color-mix(in oklch, var(--warn) 5%, var(--surface))',
                      border: '1px solid color-mix(in oklch, var(--warn) 22%, var(--border))',
                      borderRadius: 5, fontSize: 10.5, color: 'var(--fg-muted)',
                    }}>
                      <Icon name="alert" className="v2-ic v2-ic-sm" style={{
                        display: 'inline', verticalAlign: 'middle', marginRight: 5, color: 'var(--warn)',
                      }} />
                      Monitoring columns are not stored yet: monitoring, monitoring_frequency,
                      last_test, next_due, monitoring_overdue, targets, side_effects,
                      physician, rx, prescription_ref.
                    </div>
                    {m.notes && (
                      <div style={{
                        marginTop: 8, padding: 8, background: 'var(--surface)',
                        border: '1px solid var(--border)', borderRadius: 5,
                        fontSize: 10.5, color: 'var(--fg-muted)',
                      }}>
                        {m.notes}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══ TAB 5 · INSIGHTS ════════════════════════════════════════════
// [cmd] module-medical-v2.jsx:632-816.
export function MedInsights() {
  const [sub, setSub] = React.useState('correlations')
  const effectiveness = React.useMemo(
    () => SUPPLEMENT_BIOMARKER_MAP
      .map(calcSupplementEffectiveness)
      .filter((e): e is Wirksamkeit => Boolean(e)),
    [])

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 7, padding: 2, gap: 1, flexWrap: 'wrap',
        }}>
          {([
            ['correlations', 'Correlations'], ['supplements', 'Supplement effect'],
            ['benchmark', 'Population'], ['export', 'Doctor export'],
          ] as Array<[string, string]>).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setSub(k)} aria-pressed={sub === k}
                    className={sub === k ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
                    style={{ height: 24, fontSize: 11, padding: '0 12px', borderRadius: 5 }}>{l}</button>
          ))}
        </div>
      </div>

      {sub === 'correlations' && (
        <div className="v2-col-gap" style={{ gap: 10 }}>
          <div style={{
            padding: 12,
            background: 'color-mix(in oklch, var(--acc-buddy) 5%, var(--surface))',
            border: '1px solid color-mix(in oklch, var(--acc-buddy) 22%, var(--border))',
            borderRadius: 7, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Icon name="sparkles" className="v2-ic" style={{ color: 'var(--acc-buddy)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>Cross-module correlation engine</div>
              <div className="v2-muted" style={{ fontSize: 11 }}>
                Biomarker changes matched against Nutrition, Training, Recovery, Supplements. Minimum 3 data points. Association, never causation.
              </div>
            </div>
          </div>
          {CORRELATIONS.map(c => {
            const strong = c.confidence === 'strong'
            const col = strong ? 'var(--pos)' : c.confidence === 'moderate' ? 'var(--acc-recov)' : 'var(--fg-dim)'
            return (
              <Card key={c.id} attrappe={ATTRAPPE}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 3, alignSelf: 'stretch', background: col, borderRadius: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                      <Pill style={{
                        borderColor: 'color-mix(in oklch, var(--acc-medic) 35%, var(--border))',
                        color: 'var(--acc-medic)',
                      }}>{c.biomarker}</Pill>
                      <span className="v2-dim">×</span>
                      <Pill>
                        <Icon name={c.module as never} className="v2-ic v2-ic-sm" />
                        {c.module} · {c.metric}
                      </Pill>
                      <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                        n={c.n} · r={c.r} · {c.confidence}
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.55, marginBottom: 8 }}>{c.finding}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, position: 'relative', height: 5, background: 'var(--surface-2)', borderRadius: 999 }}>
                        <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 1, background: 'var(--border-strong)' }} />
                        <div style={{
                          position: 'absolute',
                          left: c.r < 0 ? `${50 + c.r * 50}%` : '50%',
                          width: `${Math.abs(c.r) * 50}%`, top: 0, bottom: 0,
                          background: col, borderRadius: 999,
                        }} />
                      </div>
                      <span className="v2-num" style={{ fontSize: 11, color: col, width: 52, textAlign: 'right' }}>
                        r = {c.r}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {sub === 'supplements' && (
        <div>
          <div className="v2-dim" style={{ fontSize: 11.5, marginBottom: 12, lineHeight: 1.55, maxWidth: 760 }}>
            Automatic before/after comparison for every supplement in your stack that maps to a tracked biomarker. Baseline is the last value before the supplement start date; latest is the most recent result.
          </div>
          <div className="v2-grid v2-g-cols-2 v2-med-wirksamkeit">
            {effectiveness.map(e => {
              const statusColor = ({
                effective: 'var(--pos)', partial: 'var(--acc-recov)',
                no_change: 'var(--fg-dim)', inconclusive: 'var(--warn)',
                insufficient_data: 'var(--fg-dim)',
              } as Record<string, string>)[e.status]
              return (
                <Card key={`${e.supplement}-${e.biomarker}`} attrappe={ATTRAPPE}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{e.supplement}</span>
                    <span className="v2-dim">→</span>
                    <Pill>{e.biomarkerObj.name}</Pill>
                    <Pill style={{
                      marginLeft: 'auto',
                      borderColor: `color-mix(in oklch, ${statusColor} 35%, var(--border))`,
                      color: statusColor,
                    }}>{e.status.replace(/_/g, ' ')}</Pill>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Baseline</div>
                      <div className="v2-num" style={{ fontSize: 17 }}>{e.baseline}</div>
                      <FlagPill flag={e.baselineFlag} small />
                    </div>
                    {/* ABWEICHUNG MIT GRUND: die Vorlage schreibt hier
                        `<Icon name="arr_r"/>` (module-medical-v2.jsx:708).
                        `[cmd]` Ein Symbol `arr_r` gibt es nicht — weder
                        in der Vorlage noch in packages/ui; dort zeichnet
                        die Stelle NICHTS. Derselbe Tippfehler steht in
                        vier weiteren Modulen der Vorlage. Hier der
                        gemeinte Pfeil, wie in G-20 und G-21. */}
                    <Icon name="arrow_right" className="v2-ic" style={{ color: 'var(--fg-dim)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Latest</div>
                      <div className="v2-num" style={{ fontSize: 17, color: statusColor }}>{e.latest}</div>
                      <FlagPill flag={e.latestFlag} small />
                    </div>
                    <div style={{ flex: 1, textAlign: 'right', minWidth: 0 }}>
                      <div className="v2-num" style={{
                        fontSize: 20,
                        color: e.changePct > 0 ? 'var(--pos)' : e.changePct < 0 ? 'var(--warn)' : 'var(--fg-dim)',
                      }}>
                        {e.changePct > 0 ? '+' : ''}{e.changePct}%
                      </div>
                      <div className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>
                        {e.biomarkerObj.unit} · since {e.start}
                      </div>
                    </div>
                  </div>
                  <Sparkline data={e.biomarkerObj.hist} color={statusColor} h={28} />
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {sub === 'benchmark' && (
        <Card title="Population benchmark" sub="vs. men 35–45 · NHANES reference distribution"
              attrappe={ATTRAPPE}>
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Biomarker</th>
                  <th style={{ width: 90, textAlign: 'right' }}>Your value</th>
                  <th style={{ width: 220 }}>Percentile</th>
                  {/* Die Vorlage fuehrt „Percentile" zweimal: einmal der
                      Balken, einmal die Zahl. Uebernommen. */}
                  <th style={{ width: 90, textAlign: 'right' }}>Percentile</th>
                  <th>Interpretation</th>
                </tr>
              </thead>
              <tbody>
                {([
                  ['LDL Cholesterol', '102 mg/dL', 73, 'better than 73% of men 35–45'],
                  ['HDL Cholesterol', '58 mg/dL', 68, 'better than 68%'],
                  ['hs-CRP', '0.6 mg/L', 88, 'better than 88% — low inflammation'],
                  ['Total Testosterone', '712 ng/dL', 84, 'higher than 84% (on TRT)'],
                  ['HbA1c', '5.4%', 52, 'median range'],
                  ['Vitamin D (25-OH)', '48 ng/mL', 91, 'higher than 91%'],
                  ['Ferritin', '142 ng/mL', 76, 'higher than 76%'],
                  ['Hematocrit', '48%', 82, 'higher than 82% — TRT-associated'],
                ] as Array<[string, string, number, string]>).map(r => (
                  <tr key={r[0]}>
                    <td>{r[0]}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{r[1]}</td>
                    <td>
                      <div style={{ position: 'relative', height: 6, background: 'var(--surface-2)', borderRadius: 999 }}>
                        <div style={{
                          position: 'absolute', left: 0, width: `${r[2]}%`, top: 0, bottom: 0,
                          background: r[2] >= 75 ? 'var(--pos)' : r[2] >= 40 ? 'var(--acc-recov)' : 'var(--warn)',
                          borderRadius: 999,
                        }} />
                        <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 1, background: 'var(--border-strong)' }} />
                      </div>
                    </td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>P{r[2]}</td>
                    <td className="v2-dim" style={{ fontSize: 11 }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {sub === 'export' && (
        <div className="v2-grid-13">
          <Card title="Doctor export · report structure" sub="6 sections · PDF · legal notice mandatory"
                attrappe={ATTRAPPE}>
            <div className="v2-col-gap" style={{ gap: 6 }}>
              {([
                ['1', 'Executive summary', 'current system scores + overall health trajectory'],
                ['2', 'Critical + flagged values', 'all non-optimal flags with context and reference ranges'],
                ['3', 'Biomarker table', 'every value: lab range | optimal range | your value | flag | trend'],
                ['4', 'Supplement effectiveness', 'which supplements demonstrably moved which markers'],
                ['5', 'Symptom overview', 'last 90 days with severity and duration'],
                ['6', 'Medication list', 'active medications with monitoring status'],
              ] as Array<[string, string, string]>).map(([n, t, d]) => (
                <div key={n} style={{
                  display: 'flex', gap: 10, padding: 9, background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 6,
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 4, background: 'var(--surface-2)',
                    color: 'var(--fg-muted)', display: 'grid', placeItems: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, flexShrink: 0,
                  }}>{n}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{t}</div>
                    <div className="v2-dim" style={{ fontSize: 10.5 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="v2-divider" />
            <div style={{
              padding: 11,
              background: 'color-mix(in oklch, var(--neg) 5%, var(--surface))',
              border: '1px solid color-mix(in oklch, var(--neg) 24%, var(--border))',
              borderRadius: 6,
            }}>
              <div className="v2-eyebrow" style={{ color: 'var(--neg)', marginBottom: 5 }}>
                Mandatory legal notice in every report
              </div>
              {/* `[read]` Der Rechtshinweis steht auf Deutsch in der
                  Vorlage — als einziger Text des Moduls. Er bleibt, wie
                  er ist: er ist die Aussage, dass LumeOS nicht
                  diagnostiziert. */}
              <div style={{ fontSize: 11.5, lineHeight: 1.6, color: 'var(--fg-muted)', fontStyle: 'italic' }}>
                {'"Dieser Report wurde von LumeOS erstellt. Die enthaltenen Informationen stellen keine medizinische Diagnose oder Therapieempfehlung dar. Bitte besprechen Sie alle Befunde mit Ihrem Arzt."'}
              </div>
            </div>
          </Card>

          <Card title="Generate report" attrappe={ATTRAPPE}>
            <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Categories</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
              {BIOMARKER_CATEGORIES.slice(1).map(c => (
                <InEntwicklungKnopf key={c.id} titel={`Kategorie ${c.label}`}
                                    className="v2-pill v2-pill-acc"
                                    style={{ cursor: 'pointer' }}>{c.label}</InEntwicklungKnopf>
              ))}
            </div>
            <div className="v2-grid v2-g-cols-2" style={{ gap: 10, marginBottom: 12 }}>
              <div>
                <div className="v2-eyebrow" style={{ marginBottom: 4 }}>From</div>
                <input type="date" aria-label="From" defaultValue="2025-08-15" style={FELD_MONO} />
              </div>
              <div>
                <div className="v2-eyebrow" style={{ marginBottom: 4 }}>To</div>
                <input type="date" aria-label="To" defaultValue="2026-08-15" style={FELD_MONO} />
              </div>
            </div>
            <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Report type</div>
            <select aria-label="Report type" defaultValue="Comprehensive · all sections"
                    style={{ ...FELD_MONO, fontFamily: undefined, marginBottom: 12 }}>
              <option>Comprehensive · all sections</option>
              <option>Focused · selected categories</option>
              <option>Progress · trends only</option>
              <option>Provider summary · 2 pages</option>
            </select>
            <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Format</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              <InEntwicklungKnopf titel="PDF" className="v2-btn v2-btn-primary v2-btn-sm" style={{ flex: 1 }}>PDF</InEntwicklungKnopf>
              <InEntwicklungKnopf titel="FHIR R4" className="v2-btn v2-btn-sm" style={{ flex: 1 }}>FHIR R4</InEntwicklungKnopf>
              <InEntwicklungKnopf titel="CSV" className="v2-btn v2-btn-sm" style={{ flex: 1 }}>CSV</InEntwicklungKnopf>
            </div>
            <InEntwicklungKnopf titel="Generate report" className="v2-btn v2-btn-primary"
                                grund="Der Arztbericht braucht einen Ausgabeweg (PDF). Die Messwerte liegen vor — `medical.lab_result_values`, 280 Zeilen."
                                style={{ width: '100%', justifyContent: 'center' }}>
              <Icon name="download" className="v2-ic v2-ic-sm" />Generate report
            </InEntwicklungKnopf>
          </Card>
        </div>
      )}
    </div>
  )
}
