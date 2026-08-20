'use client'

// Das Medical-Modul der Vorlage, uebernommen.
//
// QUELLE: theme-v1/module-medical-v2.jsx (818 Zeilen) — der Rahmen.
//
// **WARUM -v2 UND NICHT module-medical.jsx:** `[cmd]` `app.jsx:124`:
//
//     case "medical": return window.MedicalModuleV2
//       ? <window.MedicalModuleV2 /> : <MedicalModule />;
//
// `MedicalModuleV2` liegt vor (`Object.assign(window, …)`,
// module-medical-v2.jsx:818), also gewinnt es — wie bei Recovery ist
// der alte Rahmen der Notnagel, der nie greift.
//
// **DIE REKURSIVE PRUEFUNG, und sie faellt anders aus als bei Goals:**
// `[cmd]` Ein Grep nach `window.` in `-v2.jsx` findet **nichts**. Der
// Rahmen ruft seine Modale und Daten als BLOSSE GLOBALE auf
// (`<BiomarkerDetailModal/>`, `BIOMARKERS`), nicht ueber `window.X` —
// weil alle vier Dateien in denselben Skript-Gueltigkeitsbereich
// geladen werden. Wer nur nach `window.` sucht, haelt den Rahmen
// faelschlich fuer alleinstehend. Ausfuehrlich im Bericht.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript.
//   2. Klassen auf `v2-`-Praefix.
//   3. Blosse Globale -> Importe.
//   4. Knoepfe ohne Ziel oeffnen `InEntwicklung`.
//   5. `@media`-Haltepunkte, weil die Vorlage keine hat.
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst.
//
// `[cmd]` ALLES IST ATTRAPPE. Ein `medical`-Schema gibt es nicht.
import * as React from 'react'
import {
  Card, Pill, Icon, Ring, Meter, Row, Tabs, type TabItem,
} from '@lumeos/ui'

import {
  BIOMARKERS, SYMPTOMS, MEDICATIONS_V2, CORRELATIONS,
  SYSTEM_META, SYSTEM_WEIGHTS,
  calcBiomarkerFlag, calcSystemScore, calcOverallHealthScore, generateAlerts,
} from './daten'
import type { BefundWert, KatalogTreffer } from '../../../lib/medical/lesen'
import type { MarkerReihe } from '../../../lib/medical/reihe'
import { zaehleLagen } from '../../../lib/medical/lagezaehlung'
import { MedicalKontext, useMedical, type ModalZustand } from './kontext'
import { MedicalModale } from './modale'
import { MedBiomarkers, MedImport } from './tab-biomarker'
import { MedTracking, MedInsights } from './tab-tracking'

/** Die Marke an jeder Kachel. Ein Satz, damit er nicht driftet. */
export const ATTRAPPE =
  'Aus dem Entwurf uebernommen. Die Zahlen sind erfunden — ein '
  + '`medical`-Schema gibt es noch nicht.'

// [cmd] module-medical-v2.jsx:33-39, in dieser Reihenfolge.
//
// `[cmd]` SEIT G-60 zaehlt „Biomarkers" echt: 35 Marker der
// angemeldeten Nutzerin statt der 48 erfundenen der Vorlage. Die
// uebrigen drei Zaehler stehen weiter auf Attrappendaten, weil ihre
// Tabs es sind.
function tabs(markerZahl: number): TabItem[] {
  return [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'biomarkers', label: 'Biomarkers', icon: 'trend_up', count: markerZahl },
    { id: 'import', label: 'Import', icon: 'camera' },
    {
      id: 'tracking', label: 'Tracking', icon: 'edit',
      count: SYMPTOMS.filter(s => !s.resolved).length
        + MEDICATIONS_V2.filter(m => m.status === 'active').length,
    },
    { id: 'insights', label: 'Insights', icon: 'sparkles', count: CORRELATIONS.length },
  ]
}

/**
 * Die echten Daten, die die Seite serverseitig geladen hat (G-46).
 *
 * `[cmd]` Sie kommen als Requisiten herein, weil dieser Rahmen eine
 * Client-Komponente ist und `createSessionClient()` Cookies über
 * `next/headers` liest — das geht nur auf dem Server. Dasselbe Muster
 * wie `/v2/settings`: laden in `page.tsx`, durchreichen, hier nur
 * anzeigen.
 */
export type EchteDaten = {
  /**
   * Die Marker mit ihrem Verlauf — 140 flache Werte, gefaltet zu 35
   * Reihen. `[read]` Die Faltung steht in `lib/medical/reihe.ts`, nicht
   * hier: sie ist eine Rechnung und soll ohne React pruefbar bleiben.
   */
  reihen: MarkerReihe[]
  /** Wie viele Laborbefunde die Werte tragen — fuer die Unterzeile. */
  befunde: number
  /**
   * Die Rohwerte, eine Zeile je Messung.
   *
   * `[read]` Der Import-Tab braucht sie: dort steht `match_status`,
   * und der ist eine Aussage ueber die einzelne importierte Zeile, nicht
   * ueber den Marker. In der Liste hat er nichts verloren — Tom:
   * *„In der Liste ist er Testmaterial."*
   */
  werte: BefundWert[]
  katalogStart: KatalogTreffer[]
  katalogGesamt: number
  ladefehler: string | null
}

export function MedicalAnsicht({ echt }: { echt: EchteDaten }) {
  const [tab, setTab] = React.useState('dashboard')
  const [modal, setModal] = React.useState<ModalZustand | null>(null)

  // G-84: die echte Lagezaehlung. `[cmd]` Sie summiert, was die Liste
  // je Zeile ohnehin zeigt — `zuReihen` hat je Marker die juengste
  // Messung gewaehlt und `lage`/`optimalLage` daran gerechnet. Hier
  // wird nichts neu bestimmt.
  const lagen = React.useMemo(() => zaehleLagen(echt.reihen), [echt.reihen])

  const kontext = React.useMemo(() => ({
    open: (m: ModalZustand) => setModal(m),
    close: () => setModal(null),
  }), [])

  return (
    <MedicalKontext.Provider value={kontext}>
      {/* [cmd] module-medical-v2.jsx:16-31. Die Vorlage benutzt hier
          `module-header` OHNE `module-hero-lite` — wie Recovery. */}
      <div className="v2-module-header">
        <div className="v2-module-title-block">
          <div className="v2-module-title-row">
            <span className="v2-module-title">Medical</span>
            <Pill style={{
              borderColor: 'color-mix(in oklch, var(--acc-medic) 35%, var(--border))',
              color: 'var(--acc-medic)',
              background: 'color-mix(in oklch, var(--acc-medic) 6%, transparent)',
            }}>Local-first · encrypted</Pill>
            {/* ── G-84 · DIE LAGEZAEHLUNG IST ECHT ──────────────────
                `[cmd]` Vorher standen hier `Health score 87` aus
                `calcOverallHealthScore()` und `6 alerts` aus
                `generateAlerts()` — beide ueber den erfundenen
                Katalog gerechnet, beide ohne Bezug zu den Befunden
                der angemeldeten Nutzerin.

                **Zwei Zahlen, nicht eine.** `[read]` Tom zu G-84:
                *„Ein Laborbereich ist die Referenz des Labors — die
                steht auf dem Befund. Ein Optimalband ist eine
                Empfehlung aus der Literatur. Sie zu addieren macht
                aus einer Messung und einer Meinung eine Zahl."*

                **Und das Wort „Alert" faellt weg.** `[read]` Tom:
                *„Es sagt ‚etwas stimmt nicht' — das ist ein Urteil.
                ‚1 ueber dem Bereich' sagt dasselbe ohne Wertung."*
                Die Unterzeile schreibt selbst „no diagnosis, no
                therapy advice"; ein Alarmwort daneben widerspraeche
                ihr. */}
            {lagen.ausserhalb_bereich > 0 && (
              <Pill variant="warn">
                {lagen.ausserhalb_bereich} outside lab range
              </Pill>
            )}
            {lagen.ausserhalb_optimal > 0 && (
              <Pill>
                {lagen.ausserhalb_optimal} outside optimal band
              </Pill>
            )}
          </div>
          {/* `[cmd]` **`Health score` ist ersatzlos weg, nicht als
              Attrappe stehengeblieben.** Er wiegt fuenf Systeme und
              braucht dafuer eine Gruppierung der Marker. Gemessen am
              2026-08-20: **23 der 37 Marker lassen sich ueber
              `medical.biomarker_spec_enrichment` zuordnen, 14 nicht**
              — darunter LDL und ApoB.

              `[read]` Toms Entscheidung: *„Ein Gesundheitswert, der
              die beiden wichtigsten Lipidmarker stillschweigend
              auslaesst, ist schlechter als keiner — er sieht aus wie
              ein Gesamtbild und ist ein Ausschnitt."* Die Gewichtung
              waere ausserdem eine zweite, ungetroffene Entscheidung.

              Zahlen und Gruende: docs/ssot/134-medical-score.md */}
          <div className="v2-module-sub">
            {echt.reihen.length} biomarkers · LOINC-mapped · dual-range (lab + optimal) · no diagnosis, no therapy advice
          </div>
          {/* `[read]` **Die Bruecke zum Filter.** Toms Auflage zu
              G-84: *„Wenn der Kopf 1 und 5 zeigt und der Filter
              ‚Non-optimal only · 6', muss erkennbar sein, dass es
              dieselben sechs sind."* Deshalb steht die Summe hier
              ausgeschrieben, mit dem Namen des Filters. */}
          {lagen.auffaellig > 0 && (
            <div className="v2-module-sub" style={{ opacity: 0.75 }}>
              {lagen.ausserhalb_bereich} + {lagen.ausserhalb_optimal} ={' '}
              {lagen.auffaellig} marker{lagen.auffaellig === 1 ? '' : 's'} —
              {' '}die gleichen, die „Non-optimal only" in Biomarkers zeigt
              {lagen.ohne_bereich > 0
                && ` · ${lagen.ohne_bereich} ohne hinterlegten Bereich`}
            </div>
          )}
        </div>
        <div className="v2-module-actions">
          <button type="button" className="v2-btn" onClick={() => kontext.open({ typ: 'export' })}>
            <Icon name="download" className="v2-ic v2-ic-sm" />Doctor export
          </button>
          {/* ABWEICHUNG MIT GRUND: die Vorlage nimmt hier `shield`.
              `[cmd]` Das Symbol gibt es in packages/ui nicht (geprueft
              gegen icons.tsx). Genommen ist `admin` — dasselbe
              Schutzschild-Motiv, das die Seitenleiste fuer den
              Adminbereich benutzt. Gemeldet im Bericht. */}
          <button type="button" className="v2-btn" onClick={() => kontext.open({ typ: 'privacy' })}>
            <Icon name="admin" className="v2-ic v2-ic-sm" />Privacy
          </button>
          <button type="button" className="v2-btn v2-btn-primary" onClick={() => setTab('import')}>
            <Icon name="camera" className="v2-ic v2-ic-sm" />Import lab
          </button>
        </div>
      </div>

      <Tabs items={tabs(echt.reihen.length)} active={tab} onChange={setTab} />

      {tab === 'dashboard' && <MedDashboard />}
      {tab === 'biomarkers' && <MedBiomarkers echt={echt} />}
      {tab === 'import' && <MedImport echt={echt} />}
      {tab === 'tracking' && <MedTracking />}
      {tab === 'insights' && <MedInsights />}

      <MedicalModale modal={modal} onClose={kontext.close} />
    </MedicalKontext.Provider>
  )
}

// ═══ TAB 1 · DASHBOARD ═══════════════════════════════════════════
// [cmd] module-medical-v2.jsx:114-234.
function MedDashboard() {
  const { open } = useMedical()
  const overall = React.useMemo(() => calcOverallHealthScore(), [])
  const alerts = React.useMemo(() => generateAlerts(), [])
  const systems = React.useMemo(
    () => Object.keys(SYSTEM_META).map(k => ({ key: k, ...SYSTEM_META[k], ...calcSystemScore(k) })),
    [])
  const trajectory = 'stable'
  const kritisch = alerts.filter(a => a.severity === 'critical').length

  return (
    <div>
      {kritisch > 0 && (
        <div style={{
          padding: 14,
          background: 'color-mix(in oklch, var(--neg) 8%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--neg) 35%, var(--border))',
          borderRadius: 8, marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Icon name="alert" className="v2-ic" style={{ color: 'var(--neg)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--neg)' }}>
              {kritisch} critical value{kritisch === 1 ? '' : 's'}
            </div>
            <div className="v2-muted" style={{ fontSize: 11.5 }}>
              Contact your doctor immediately. LumeOS does not diagnose.
            </div>
          </div>
        </div>
      )}

      <div className="v2-grid-15">
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card
            title="Health score"
            sub={`weighted across 5 systems · ${Math.round(overall.data_completeness * 100)}% data completeness`}
            attrappe={ATTRAPPE}
          >
            <div className="v2-med-score-kopf">
              <Ring value={overall.score} max={100}
                    color={overall.score >= 85 ? 'var(--pos)' : overall.score >= 70 ? 'var(--acc-recov)' : 'var(--warn)'}
                    label={overall.status} size={132} stroke={9} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="v2-grid v2-g-cols-2" style={{ gap: 8 }}>
                  {systems.map(s => {
                    const farbe = (s.score ?? 0) >= 85 ? 'var(--pos)'
                      : (s.score ?? 0) >= 65 ? 'var(--acc-recov)'
                        : (s.score ?? 0) >= 40 ? 'var(--warn)' : 'var(--neg)'
                    return (
                      <div key={s.key} style={{
                        padding: 10, background: 'var(--bg-elev)',
                        border: '1px solid var(--border)', borderRadius: 6,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span className="v2-dot" style={{ background: s.c, width: 7, height: 7 }} />
                          <span style={{ fontSize: 11.5, fontWeight: 600 }}>{s.label}</span>
                          <span className="v2-num" style={{ marginLeft: 'auto', fontSize: 14, color: farbe }}>
                            {s.score ?? '—'}
                          </span>
                        </div>
                        <Meter value={s.score ?? 0} color={farbe} />
                        <div className="v2-dim v2-mono" style={{ fontSize: 9, marginTop: 3 }}>
                          {s.marker_count} markers{s.missing ? ` · ${s.missing} missing` : ''} · weight {Math.round((SYSTEM_WEIGHTS[s.key] || 0) * 100)}%
                        </div>
                      </div>
                    )
                  })}
                  <div style={{
                    padding: 10, background: 'var(--surface)',
                    border: '1px dashed var(--border)', borderRadius: 6,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  }}>
                    <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Trajectory</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{trajectory}</div>
                    <div className="v2-dim" style={{ fontSize: 10 }}>vs. previous panel</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="v2-divider" />
            {/* Die Herleitung als Text — wie bei Recovery und Goals der
                Beleg, dass die Zahl nicht geraten ist. */}
            <div className="v2-dim v2-mono" style={{ fontSize: 10, lineHeight: 1.7 }}>
              overall = Σ(system_score × weight) / Σ(weight_with_data)<br />
              weights: cardiovascular .25 · metabolic .25 · hormonal .20 · liver .15 · kidney .15<br />
              flag scores: optimal 100 · normal 75 · low/high 40 · critical 10
            </div>
          </Card>

          <Card title="Alerts" sub={`${alerts.length} active · sorted by severity`} attrappe={ATTRAPPE}>
            <div className="v2-col-gap" style={{ gap: 6 }}>
              {alerts.map(a => {
                const c = a.severity === 'critical' ? 'var(--neg)'
                  : a.severity === 'warning' ? 'var(--warn)' : 'var(--acc-recov)'
                return (
                  <div
                    key={a.id}
                    onClick={() => { if (a.biomarker) open({ typ: 'biomarker', b: a.biomarker }) }}
                    style={{
                      display: 'flex', gap: 12, padding: 11,
                      background: `color-mix(in oklch, ${c} 5%, var(--surface))`,
                      border: `1px solid color-mix(in oklch, ${c} 26%, var(--border))`,
                      borderRadius: 6, cursor: a.biomarker ? 'pointer' : 'default',
                    }}
                  >
                    <div style={{ width: 3, alignSelf: 'stretch', background: c, borderRadius: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                        <Pill style={{ borderColor: `color-mix(in oklch, ${c} 35%, var(--border))`, color: c }}>
                          {a.severity}
                        </Pill>
                        <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                          {a.biomarker ? a.biomarker.name : a.medication?.name}
                        </span>
                        {a.biomarker && (
                          <span className="v2-num" style={{ color: c }}>{a.value} {a.biomarker.unit}</span>
                        )}
                        <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
                          {a.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="v2-muted" style={{ fontSize: 11 }}>
                        {a.biomarker
                          ? `lab ${a.biomarker.lab_min}–${a.biomarker.lab_max} · optimal ${a.biomarker.optimal_min}–${a.biomarker.optimal_max} ${a.biomarker.unit}`
                          : `${a.medication?.name} monitoring due ${a.medication?.next_due}`}
                      </div>
                    </div>
                    <div style={{ alignSelf: 'center', textAlign: 'right' }}>
                      <div className="v2-mono" style={{ fontSize: 10.5, color: c }}>{a.action}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Quick actions" attrappe={ATTRAPPE}>
            <div className="v2-qa-grid">
              <button type="button" className="v2-qa" onClick={() => open({ typ: 'manualEntry' })}>
                <Icon name="plus" />Add value
              </button>
              <button type="button" className="v2-qa" onClick={() => open({ typ: 'logSymptom' })}>
                <Icon name="edit" />Log symptom
              </button>
              <button type="button" className="v2-qa" onClick={() => open({ typ: 'export' })}>
                <Icon name="download" />Doctor PDF
              </button>
              <button type="button" className="v2-qa" onClick={() => open({ typ: 'privacy' })}>
                <Icon name="admin" />Privacy tier
              </button>
            </div>
          </Card>

          <Card title="Last panel" sub="23 Apr 2026 · MVZ Lab Berlin" attrappe={ATTRAPPE}>
            <Row label="Markers imported" value="34" />
            <Row label="Flagged non-optimal"
                 value={String(BIOMARKERS.filter(b => calcBiomarkerFlag(b.value, b) !== 'optimal').length)} />
            <Row label="Out of lab range"
                 value={String(BIOMARKERS.filter(b => ['low', 'high', 'critical_low', 'critical_high'].includes(calcBiomarkerFlag(b.value, b))).length)} />
            <Row label="Next panel due" value="15 Jul 2026" />
            <Row label="Days overdue" value="31" />
          </Card>

          <Card title="Non-optimal markers" sub="lab-normal but below optimum" attrappe={ATTRAPPE}>
            <div className="v2-col-gap" style={{ gap: 5 }}>
              {BIOMARKERS
                .filter(b => calcBiomarkerFlag(b.value, b) === 'normal')
                .sort((a, b) => b.prio - a.prio)
                .slice(0, 6)
                .map(b => (
                  <button key={b.id} type="button" onClick={() => open({ typ: 'biomarker', b })}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px',
                            background: 'var(--bg-elev)', border: '1px solid var(--border)',
                            borderRadius: 5, cursor: 'pointer', width: '100%',
                            font: 'inherit', color: 'inherit', textAlign: 'left',
                          }}>
                    <span style={{ fontSize: 11.5, flex: 1, minWidth: 0 }}>{b.name}</span>
                    <span className="v2-num" style={{ fontSize: 11 }}>{b.value}</span>
                    <span className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>
                      opt {b.optimal_min}–{b.optimal_max}
                    </span>
                  </button>
                ))}
            </div>
            <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
              These fall inside the lab&apos;s normal band but outside the performance/longevity optimum. Not abnormal — improvable.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
