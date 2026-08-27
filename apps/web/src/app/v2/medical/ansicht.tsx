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
// `[cmd]` TEILE SIND ECHT: Katalog, Befunde und Laborwerte liegen im
// `medical`-Schema. Was hier weiter markiert ist, ist nicht an diese
// Daten angebunden oder braucht eine spezifische fehlende Tabelle.
import * as React from 'react'
import { useTabParam } from '../../../lib/tab-url'
import {
  Card, Pill, Icon, Ring, Meter, Row, Tabs, type TabItem,
} from '@lumeos/ui'

import {
  BIOMARKERS, SYMPTOMS, CORRELATIONS,
  calcBiomarkerFlag, generateAlerts,
} from './daten'
import { zaehleLagen } from '../../../lib/medical/lagezaehlung'
import {
  GEWICHT, PUNKTE, SYSTEM_LABEL, type System,
} from '../../../lib/medical/systemscore'
import { MedicalKontext, useMedical, type ModalZustand } from './kontext'
import { MedicalModale } from './modale'
import { MedBiomarkers, MedImport } from './tab-biomarker'
import { MedTracking, MedInsights } from './tab-tracking'
// G-208: der Wirkstoffkatalog.
import { MedWirkstoffe } from './tab-wirkstoffe'
import type { EchteDaten } from './echtdaten'

/** Die Marke an jeder Kachel. Ein Satz, damit er nicht driftet. */
export const ATTRAPPE =
  'Aus dem Entwurf uebernommen. Diese Kachel ist noch nicht an die vorhandenen '
  + 'Medical-Daten angebunden - die Zahlen sind erfunden.'

// [cmd] module-medical-v2.jsx:33-39, in dieser Reihenfolge.
//
// `[cmd]` SEIT G-60 zaehlt „Biomarkers" echt: 35 Marker der
// angemeldeten Nutzerin statt der 48 erfundenen der Vorlage. Die
// uebrigen drei Zaehler stehen weiter auf Attrappendaten, weil ihre
// Tabs es sind.
function tabs(
  markerZahl: number, medikationen: number, wirkstoffe: number,
): TabItem[] {
  return [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'biomarkers', label: 'Biomarkers', icon: 'trend_up', count: markerZahl },
    { id: 'import', label: 'Import', icon: 'camera' },
    {
      id: 'tracking', label: 'Tracking', icon: 'edit',
      count: SYMPTOMS.filter(s => !s.resolved).length
        + medikationen,
    },
    // ══ G-208 · DER WIRKSTOFFKATALOG ═══════════════════════════════
    //
    // `[cmd]` **498 Wirkstoffe, 2.313 FAQ-Antworten** — seit dem
    // 2026-08-27 in der Datenbank, bis hierher ohne Seite.
    //
    // `[read]` **Die Stelle ist gewaehlt, nicht angehaengt:** hinter
    // *Tracking*, wo die EIGENE Medikation steht, und vor *Insights*.
    // **Ein Nachschlagewerk kommt nach dem eigenen Bestand** — wer
    // etwas nachschlaegt, hat meist gerade dort hineingesehen.
    { id: 'wirkstoffe', label: 'Wirkstoffe', icon: 'search', count: wirkstoffe },
    { id: 'insights', label: 'Insights', icon: 'sparkles', count: CORRELATIONS.length },
  ]
}

export function MedicalAnsicht({ echt }: { echt: EchteDaten }) {
  // G-117: Tab in der Adresse — Drop-in aus lib/tab-url.
  const [tab, setTab] = useTabParam('dashboard')
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
          {/* `[cmd]` **Der `Health score` steht seit G-135 im
              Dashboard-Tab — hier im Kopf bleibt er weg.** Zwei
              Zahlen nebeneinander („87" und „1 ueber dem Bereich")
              waeren zwei Antworten auf dieselbe Frage.

              `[cmd]` **Die zwei Unbekannten aus G-84 sind geloest:**
              Gruppierung und Gewichtung stehen in
              `docs/specs/Medical/SPEC_09_SCORING.md` und in
              `biomarker_spec_enrichment.system_groups`.

              `[cmd]` **Toms Einwand von damals — *„ein
              Gesundheitswert, der die beiden wichtigsten Lipidmarker
              stillschweigend auslaesst"* — gilt zur Haelfte weiter:**
              **LDL ist zugeordnet** (13457-7), **ApoB nicht.** Der
              Bestand fuehrt ihn unter 1884-6, `enrichment` unter
              1869-7 — **dieselbe Groesse, zwei LOINC-Codes.**

              `[read]` **Der Unterschied zu damals ist das Wort
              „stillschweigend":** Die Karte nennt je System
              `marker_count` von `erwartet` — Herz-Kreislauf steht als
              „5 von 7 Markern" da, nicht als glatte Zahl.

              Zahlen und Gruende: docs/ssot/171-health-score.md */}
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

      <Tabs items={tabs(echt.reihen.length,
                        echt.medikationen.filter(m => m.is_active).length,
                        echt.wirkstoffe.length)}
            active={tab} onChange={setTab} />

      {tab === 'dashboard' && <MedDashboard echt={echt} />}
      {tab === 'biomarkers' && <MedBiomarkers echt={echt} />}
      {tab === 'import' && <MedImport echt={echt} />}
      {tab === 'tracking' && <MedTracking echt={echt} />}
      {/* G-208: lesend. `[read]` Kein Erfassungsweg — das ist C-302. */}
      {tab === 'wirkstoffe' && <MedWirkstoffe liste={echt.wirkstoffe} />}
      {tab === 'insights' && <MedInsights />}

      <MedicalModale modal={modal} onClose={kontext.close} />
    </MedicalKontext.Provider>
  )
}

// ═══ TAB 1 · DASHBOARD ═══════════════════════════════════════════
// [cmd] module-medical-v2.jsx:114-234.
function MedDashboard({ echt }: { echt: EchteDaten }) {
  const { open } = useMedical()
  // `[cmd]` **Der Score kommt aus `echt.scores`, serverseitig gerechnet.**
  //
  // `[read]` **Was hier NICHT stehen darf:** eine Ableitung aus
  // `calcOverallHealthScore()` / `SYSTEM_META`. Das sind die erfundenen
  // Zahlen des Entwurfs — sie sind fuer jedes Konto gleich. **Am
  // 2026-08-21 gemessen:** ein Konto mit 0 Biomarkern zeigte dieselben
  // 81 wie das Konto mit 140 Werten. Das sah aus wie ein Zeilenschutzleck
  // und war der Entwurf.
  const alerts = React.useMemo(() => generateAlerts(), [])
  const kritisch = alerts.filter(a => a.severity === 'critical').length
  const scores = echt.scores

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
          {/*
            G-135: Der Health score ist angebunden — deshalb ohne
            Attrappenmarke.

            `[read]` **Kein Statuswort.** Die Spec kennt `warn` und
            `critical`; das sind Urteile ueber eine Lage, und G-60 hat
            schon „Optimal" entschaerft. **Gezeigt werden die Zahl, wie
            viele Marker sie traegt und wie viel Gewicht erfasst ist** —
            die Schwellen stehen im Rechenweg darunter.
          */}
          <Card
            title="Health score"
            sub={scores === null
              ? 'Systemzuordnung nicht geladen'
              : `${scores.systeme_mit_wert} von 5 Systemen · `
                + `${Math.round(scores.gewicht_erfasst * 100)} % des Gewichts erfasst`}
          >
            {scores === null || scores.score === null ? (
              <p className="v2-muted" style={{ fontSize: 12 }}>
                {scores === null
                  ? 'Die Systemzuordnung liess sich nicht laden — ohne sie gibt es keinen Wert.'
                  : 'Kein System hat einen bewertbaren Marker. Ein Wert entsteht, sobald ein '
                    + 'Befund einen Marker mit Laborbereich enthaelt.'}
              </p>
            ) : (
              <div className="v2-med-score-kopf">
                <Ring value={scores.score} max={100} color="var(--acc-medic)"
                      label={`${scores.score}`} size={132} stroke={9} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="v2-grid v2-g-cols-2" style={{ gap: 8 }}>
                    {scores.systeme.map(s => (
                      <div key={s.system} style={{
                        padding: 10, background: 'var(--bg-elev)',
                        border: '1px solid var(--border)', borderRadius: 6,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 600 }}>
                            {SYSTEM_LABEL[s.system]}
                          </span>
                          <span className="v2-num" style={{ marginLeft: 'auto', fontSize: 14 }}>
                            {s.score ?? '—'}
                          </span>
                        </div>
                        <Meter value={s.score ?? 0} color="var(--acc-medic)" />
                        {/* `marker_count` und `missing` wie bei den
                            Naehrstoffen „11 von 14 Positionen" (G-121):
                            die Zahl sagt selbst, wie vollstaendig sie ist. */}
                        <div className="v2-dim v2-mono" style={{ fontSize: 9, marginTop: 3 }}>
                          {s.score === null
                            ? `kein Wert · ${s.erwartet} Marker zugeordnet`
                            : `${s.marker_count} von ${s.erwartet} Markern`}
                          {s.ohne_bereich > 0 && ` · ${s.ohne_bereich} ohne Bereich`}
                          {' · '}Gewicht {Math.round(GEWICHT[s.system] * 100)} %
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="v2-divider" />
            {/* Die Herleitung als Text — wie bei Recovery und Goals der
                Beleg, dass die Zahl nicht geraten ist. */}
            <div className="v2-dim v2-mono" style={{ fontSize: 10, lineHeight: 1.7 }}>
              overall = Σ(system_score × weight) / Σ(weight_with_data)<br />
              weights: cardiovascular .25 · metabolic .25 · hormonal .20 · liver .15 · kidney .15<br />
              je Marker: im Laborbereich und im Optimalband {PUNKTE.optimal} ·
              {' '}im Laborbereich {PUNKTE.normal} ·
              {' '}ausserhalb des Laborbereichs {PUNKTE.ausserhalb}<br />
              Zuordnung ueber LOINC aus <code>biomarker_spec_enrichment.system_groups</code>
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
