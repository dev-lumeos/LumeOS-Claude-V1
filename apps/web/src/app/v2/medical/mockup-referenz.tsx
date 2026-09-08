'use client'

// Die Mockup-Reiter von Medical als Referenz unter der Linie —
// G-365, E-69.
//
// ## Was gemessen wurde
//
// `[cmd]` **2026-09-07, je Reiter am Schirm — Attrappen und was
// darunter ANGEBUNDEN ist:**
//
//     dashboard    3 Attr.   Health score · Last panel
//     biomarkers   0 Attr.   die Tabelle
//     import       4 Attr.   Zuordnung
//     tracking     4 Attr.   Symptom -> Biomarker
//     wirkstoffe   1 Attr.   die Liste -- aber KEIN Mockup
//     insights     6 Attr.   nichts angebunden
//
// **Alle ausser `wirkstoffe` tragen eine Linie.**
//
// `[cmd]` **BERICHTIGT — hier stand, nur `biomarkers` brauche eine
// Referenz.** Die Begruendung war *,,die vier Entwurfsreiter SIND der
// Mockup-Stand"*, und sie stuetzte sich auf die Attrappenzahl.
// **Am Schirm gemessen haben drei von ihnen angebundene Kacheln**
// (`Health score`, `Last panel`, `Zuordnung`, `Symptom → Biomarker`).
// **Alle sechs Reiter tragen jetzt eine Linie.** Naeheres weiter
// unten am Abschnitt „Berichtigt".
//
// `[cmd]` **`wirkstoffe` steht in KEINEM Mockup.** Weder
// `module-medical-v2.jsx` (dashboard, biomarkers, import, tracking,
// insights) noch `module-medical.jsx` (overview, labs, meds, history,
// documents, appointments) fuehrt ihn. **Der Reiter ist nach dem
// Entwurf entstanden** — kein Soll-Stand, nichts zu vergleichen.
//
// `[cmd]` **QUELLE: `theme-v1/module-medical-v2.jsx`**, `MedBiomarkers`
// — eine Kachel: die Tabelle mit Suchleiste und Kategoriefiltern.
import * as React from 'react'
import { Card, Pill, Icon, Row } from '@lumeos/ui'

import { ReferenzTrenner } from '@/components/shell/referenz-trenner'
import {
  BIOMARKERS, SYSTEM_META, SYSTEM_MARKERS, SYSTEM_WEIGHTS,
  SYMPTOMS, SYMPTOM_BIOMARKER_MAP, MEDICATIONS_V2,
  CORRELATIONS, BIOMARKER_CATEGORIES, SUPPLEMENT_BIOMARKER_MAP,
  calcSupplementEffectiveness, type Wirksamkeit,
} from './daten'

const QUELLE = 'theme-v1/module-medical-v2.jsx'

const ATTRAPPE =
  `Attrappe — ${QUELLE} · wartet auf: nichts — Referenz zum Vergleich, `
  + 'faellt mit Toms Abnahme'

/** `biomarkers`, wie er im Mockup steht — `MedBiomarkers`. */
/** `module-medical.jsx:62` — die Zeitachse des Entwurfs. */
const VERLAUF_ENTWURF: Array<[string, string, string, string]> = [
  ['2025-03-04', 'Diagnosis', 'Right lateral epicondylopathy',
   'Onset after high-volume pulling block. Confirmed by US ultrasound at PhysioMed.'],
  ['2024-10-04', 'Medication', 'Started Anastrozole 0.25mg',
   'E2 sensitive trending 42 pg/mL after 4 weeks of TRT.'],
  ['2024-09-12', 'Treatment', 'TRT protocol initiated',
   'Test Cyp 150mg/wk + HCG 500 IU 2x/wk. Trough target 600-800 ng/dL.'],
  ['2024-08-22', 'Diagnosis', 'Primary hypogonadism diagnosed',
   'Total T 280 ng/dL on two morning panels 4 weeks apart.'],
]

/** `module-medical.jsx:96` — die Termine des Entwurfs. */
const TERMINE_ENTWURF: Array<[string, string, string, string]> = [
  ['2026-05-21 10:30', 'Sarah Müller · Physio', 'Elbow follow-up', 'upcoming'],
  ['2026-07-15 09:00', 'Dr. M. Kessler', 'Q3 2026 panel + protocol review', 'upcoming'],
  ['2026-09-04 11:00', 'Dr. S. Wagner · GP', 'Annual physical', 'upcoming'],
  ['2026-04-23 08:30', 'MVZ Lab Berlin', 'Q2 2026 lab draw (fasting)', 'done'],
]


export function MedBiomarkersReferenz() {
  const kategorien = ['All', 'Metabolic', 'Lipids', 'Hormones',
                      'Inflammation', 'Vitamins', 'Minerals', 'Organ']
  const zeilen = [
    ['Vitamin D · 25-OH', 'VITD', '1989-3', '42', 'ng/mL'],
    ['Ferritin', 'FERR', '2276-4', '118', 'ng/mL'],
    ['HbA1c', 'HBA1C', '4548-4', '5.1', '%'],
    ['hs-CRP', 'CRP', '30522-7', '0.4', 'mg/L'],
    ['Testosterone · total', 'TT', '2986-8', '648', 'ng/dL'],
  ]
  return (
    <>
      <ReferenzTrenner reiter="Biomarkers" quelle={QUELLE} />
      <div style={{ display: 'flex', gap: 5, marginBottom: 12, flexWrap: 'wrap' }}>
        {kategorien.map((c, i) => (
          <Pill key={c} variant={i === 0 ? 'acc' : undefined}>{c}</Pill>
        ))}
      </div>
      <Card attrappe={ATTRAPPE}>
        <div style={{ overflowX: 'auto' }}>
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Biomarker</th>
                <th style={{ width: 90 }}>LOINC</th>
                <th style={{ width: 90, textAlign: 'right' }}>Value</th>
                <th style={{ width: 190 }}>Lab · optimal · you</th>
                <th style={{ width: 110 }}>Flag</th>
                <th style={{ width: 80 }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {zeilen.map(([name, abbr, loinc, wert, einheit]) => (
                <tr key={loinc}>
                  <td>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{name}</div>
                    <div className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>{abbr}</div>
                  </td>
                  <td className="v2-mono v2-dim" style={{ fontSize: 10.5 }}>{loinc}</td>
                  <td className="v2-num" style={{ textAlign: 'right', fontWeight: 600 }}>
                    {wert}
                    <span className="v2-dim" style={{ fontSize: 9.5, marginLeft: 3 }}>
                      {einheit}
                    </span>
                  </td>
                  <td className="v2-dim" style={{ fontSize: 10.5 }}>
                    Spannenbalken mit Markierung
                  </td>
                  <td><Pill variant="pos">optimal</Pill></td>
                  <td>
                    <Icon name="trend_up" className="v2-ic v2-ic-sm"
                          style={{ color: 'var(--pos)' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="v2-divider" />
        <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
          Der Entwurf zeigt je Zeile Suchtreffer, LOINC, Wert mit
          Einordnung, Spannenbalken, Kennzeichen, Trend und Sparkline.
        </div>
      </Card>
    </>
  )
}

/**
 * `wirkstoffe`: der Vermerk, dass es kein Mockup gibt.
 *
 * `[read]` **Eine leere Stelle sagt nichts.** Wer den Reiter oeffnet
 * und keine Linie sieht, kann nicht wissen, ob sie fehlt oder ob es
 * nichts zu vergleichen gibt. **Deshalb steht es da.**
 */
export function MedWirkstoffeOhneMockup() {
  return (
    <Card title="Kein Mockup-Gegenstueck"
          sub="dieser Reiter entstand nach dem Entwurf"
          attrappe={
            'Attrappe — kein Mockup · wartet auf: nichts — `wirkstoffe` '
            + 'steht in keiner theme-v1-Datei, es gibt keinen '
            + 'Soll-Stand zum Vergleich'
          }>
      <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
        Die uebrigen Reiter zeigen unter einer Linie den Mockup-Entwurf
        als Vergleich. Fuer diesen gibt es keinen — weder
        `module-medical-v2.jsx` noch `module-medical.jsx` fuehrt ihn.
      </div>
    </Card>
  )
}

// ══ Berichtigt am 2026-09-07 ═══════════════════════════════════════
//
// `[cmd]` **Oben stand, nur `biomarkers` brauche eine Linie** — die
// vier uebrigen seien „selbst der Mockup-Stand". **Das war nach der
// Attrappenzahl geurteilt und falsch**, dieselbe Klasse wie bei
// `goals/tdee`:
//
//     dashboard   Health score, Last panel     ANGEBUNDEN
//     import      Zuordnung                    ANGEBUNDEN
//     tracking    Symptom -> Biomarker         ANGEBUNDEN
//     insights    alles Attrappe               Linie trotzdem
//
// `[read]` **Die Attrappenzahl entscheidet nicht ueber die Linie.**
//
// ## Und die erste Fassung war zu duenn
//
// **Tom, 2026-09-07:** *,,ein rahmen und dann ein bisschen text drin
// bringen mir wohl ersichtlich nicht wirklich was."*
//
// `[cmd]` **20 Beschreibungskacheln standen hier** — der schlimmste
// Fall im ganzen Durchgang. **Diese Fassung baut die Ansicht** aus
// `daten.ts`.

/** Die Einordnung eines Markers, wie die Vorlage sie rechnet. */
function einstufung(b: (typeof BIOMARKERS)[number]): string {
  // `[read]` `lab_min`/`lab_max` sind nullbar — ohne Laborspanne kann
  // „ausserhalb" nicht entschieden werden, also faellt der Marker in
  // die Optimalpruefung darunter.
  if (b.lab_min != null && b.lab_max != null
      && (b.value < b.lab_min || b.value > b.lab_max)) return 'out'
  if (b.optimal_min != null && b.optimal_max != null
      && (b.value < b.optimal_min || b.value > b.optimal_max)) return 'normal'
  return 'optimal'
}

/** `dashboard` — `MedDashboard`, 5 Kacheln. */
export function MedDashboardReferenz() {
  const systeme = Object.entries(SYSTEM_META)
  const nichtOptimal = BIOMARKERS.filter(b => einstufung(b) === 'normal')
  const ausserhalb = BIOMARKERS.filter(b => einstufung(b) === 'out')
  return (
    <>
      <ReferenzTrenner reiter="Dashboard" quelle={QUELLE} />
      <div className="v2-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Health score" sub="gewichtet ueber 5 Systeme"
                attrappe={ATTRAPPE}>
            <div className="v2-grid v2-g-cols-2" style={{ gap: 8 }}>
              {systeme.map(([k, s]) => (
                <div key={k} style={{
                  padding: 10, background: 'var(--bg-elev)',
                  border: '1px solid var(--border)', borderRadius: 6,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
                  }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: 999, background: s.c,
                    }} />
                    <span style={{ fontSize: 11.5, fontWeight: 600 }}>{s.label}</span>
                  </div>
                  <div className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>
                    {SYSTEM_MARKERS[k]?.length ?? 0} Marker · Gewicht{' '}
                    {Math.round((SYSTEM_WEIGHTS[k] ?? 0) * 100)} %
                  </div>
                </div>
              ))}
            </div>
            <div className="v2-divider" />
            <div className="v2-dim v2-mono" style={{ fontSize: 10, lineHeight: 1.7 }}>
              overall = Summe(system_score × weight) / Summe(weight_with_data)
              <br />
              Gewichte: cardiovascular .25 · metabolic .25 · hormonal .20 ·
              liver .15 · kidney .15
              <br />
              Einstufung: optimal 100 · normal 75 · low/high 40 · critical 10
            </div>
          </Card>

          <Card title="Alerts" sub={`${ausserhalb.length} ausserhalb der Laborspanne`}
                attrappe={ATTRAPPE}>
            <div className="v2-col-gap" style={{ gap: 6 }}>
              {(ausserhalb.length ? ausserhalb : BIOMARKERS.slice(0, 3)).map(b => (
                <div key={b.id} style={{
                  display: 'flex', gap: 12, padding: 11,
                  background: 'color-mix(in oklch, var(--warn) 5%, var(--surface))',
                  border: '1px solid color-mix(in oklch, var(--warn) 26%, var(--border))',
                  borderRadius: 6,
                }}>
                  <div style={{
                    width: 3, alignSelf: 'stretch',
                    background: 'var(--warn)', borderRadius: 2,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3,
                      flexWrap: 'wrap',
                    }}>
                      <Pill>{einstufung(b)}</Pill>
                      <span style={{ fontSize: 12.5, fontWeight: 600 }}>{b.name}</span>
                      <span className="v2-num">{b.value} {b.unit}</span>
                    </div>
                    <div className="v2-muted" style={{ fontSize: 11 }}>
                      lab {b.lab_min}–{b.lab_max} · optimal{' '}
                      {b.optimal_min}–{b.optimal_max} {b.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Quick actions" sub="haeufige Schritte" attrappe={ATTRAPPE}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Add value', 'Log symptom', 'Doctor PDF', 'Privacy tier'].map(a => (
                <Pill key={a}>{a}</Pill>
              ))}
            </div>
          </Card>

          <Card title="Last panel" sub="23 Apr 2026 · MVZ Lab Berlin"
                attrappe={ATTRAPPE}>
            <Row label="Markers imported" value="34" />
            <Row label="Flagged non-optimal" value={String(nichtOptimal.length)} />
            <Row label="Out of lab range" value={String(ausserhalb.length)} />
            <Row label="Next panel due" value="15 Jul 2026" />
            <Row label="Days overdue" value="31" />
          </Card>

          <Card title="Non-optimal markers" sub="lab-normal but below optimum"
                attrappe={ATTRAPPE}>
            <div className="v2-col-gap" style={{ gap: 5 }}>
              {nichtOptimal.slice(0, 6).map(b => (
                <div key={b.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 9px', background: 'var(--bg-elev)',
                  border: '1px solid var(--border)', borderRadius: 5,
                }}>
                  <span style={{ fontSize: 11.5, flex: 1 }}>{b.name}</span>
                  <span className="v2-num" style={{ fontSize: 11 }}>{b.value}</span>
                  <span className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>
                    opt {b.optimal_min}–{b.optimal_max}
                  </span>
                </div>
              ))}
            </div>
            <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
              These fall inside the lab&apos;s normal band but outside the
              performance/longevity optimum. Not abnormal — improvable.
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

/** `import` — `MedImport`, 7 Kacheln. */
export function MedImportReferenz({ unter = 'upload' }: { unter?: string }) {
  // `[cmd]` **G-365, 2026-09-07:** *,,da passt oben zu unten auch nicht
  // bei den subnavigationen."*
  //
  // `[cmd]` **Gemessen:** unter der Linie standen ALLE SIEBEN Kacheln,
  // egal welcher Unterreiter oben stand. Auf `Manual entry` zeigte
  // oben eine Kachel, unten sieben — nichts lag nebeneinander.
  //
  // `[read]` **Die Vorlage teilt selbst** (`module-medical-v2.jsx:329`,
  // 404, 427, 448): `upload` traegt vier Kacheln, die drei uebrigen je
  // eine. **Die Referenz teilt jetzt genauso.**
  const schritte = [
    ['Texterkennung', 'PDF oder Bild zu Text', 'ocr'],
    ['Zuordnung', 'Textzeile zu Biomarker', 'match'],
    ['Einheitenpruefung', 'Laboreinheit zu Zieleinheit', 'units'],
    ['Freigabe', 'du bestaetigst je Wert', 'confirm'],
  ]
  return (
    <>
      <ReferenzTrenner reiter="Import" quelle={QUELLE} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        {unter === 'upload' && (<>
        <Card title="Upload lab report" sub="PDF oder Bild" attrappe={ATTRAPPE}>
          <div style={{
            padding: 26, textAlign: 'center',
            border: '1px dashed var(--border)', borderRadius: 8,
          }}>
            <Icon name="plus" className="v2-ic"
                  style={{ width: 26, height: 26, color: 'var(--fg-dim)' }} />
            <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 8 }}>
              Befund hierher ziehen
            </div>
            <div className="v2-dim" style={{ fontSize: 11, marginTop: 3 }}>
              PDF, JPG oder PNG · bis 20 MB
            </div>
          </div>
        </Card>

        <Card title="Pipeline" sub={`${schritte.length} Schritte`} attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {schritte.map(([n, w, k], i) => (
              <div key={String(k)} style={{
                display: 'grid', gridTemplateColumns: '24px 160px 1fr',
                gap: 10, alignItems: 'center', fontSize: 11.5,
                padding: '8px 10px', background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 6,
              }}>
                <span className="v2-num v2-dim">{i + 1}</span>
                <span style={{ fontWeight: 600 }}>{n}</span>
                <span className="v2-dim">{w}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Confidence thresholds" sub="ab wann automatisch"
              attrappe={ATTRAPPE}>
          <Row label="Automatisch uebernehmen" value="ab 0.95" />
          <Row label="Zur Bestaetigung" value="0.70 – 0.95" />
          <Row label="Verwerfen" value="unter 0.70" />
        </Card>

        <Card title="Last extraction" sub="der letzte Lauf" attrappe={ATTRAPPE}>
          <Row label="Datei" value="MVZ_Berlin_2026-04-23.pdf" />
          <Row label="Erkannt" value="34 von 36 Zeilen" />
          <Row label="Automatisch" value="29" />
          <Row label="Bestaetigt" value="5" />
          <Row label="Dauer" value="8.2 s" />
        </Card>
        </>)}
        {unter === 'manual' && (
        <Card title="Manual entry" sub="Werte von Hand erfassen" attrappe={ATTRAPPE}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {BIOMARKERS.slice(0, 6).map(b => <Pill key={b.id}>{b.name}</Pill>)}
          </div>
          <div className="v2-dim" style={{ fontSize: 11, marginTop: 8 }}>
            Der Entwurf laesst je Marker Wert, Einheit und Datum eingeben.
          </div>
        </Card>

        )}
        {unter === 'history' && (
        <Card title="Import history" sub="frueher eingelesene Befunde"
              attrappe={ATTRAPPE}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>Datum</th>
                  <th>Datei</th>
                  <th style={{ width: 90, textAlign: 'right' }}>Werte</th>
                </tr>
              </thead>
              <tbody>
                {[['23 Apr 2026', 'MVZ_Berlin.pdf', 34],
                  ['12 Jan 2026', 'Hausarzt_Q1.pdf', 22],
                  ['08 Okt 2025', 'MVZ_Berlin.pdf', 31]].map(([d, f, n]) => (
                  <tr key={String(d)}>
                    <td className="v2-num v2-muted">{d}</td>
                    <td>{f}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        )}
        {unter === 'units' && (
        <Card title="Unit normalization map" sub="Einheiten angleichen"
              attrappe={ATTRAPPE}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Marker</th>
                  <th style={{ width: 110 }}>Labor</th>
                  <th style={{ width: 110 }}>Ziel</th>
                </tr>
              </thead>
              <tbody>
                {BIOMARKERS.slice(0, 5).map(b => (
                  <tr key={b.id}>
                    <td>{b.name}</td>
                    <td className="v2-mono v2-dim">{b.unit}</td>
                    <td className="v2-mono">{b.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        )}
      </div>
    </>
  )
}

/** `tracking` — `MedTracking`, 3 Kacheln. */
export function MedTrackingReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Tracking" quelle={QUELLE} />
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Symptome" sub={`${SYMPTOMS.length} erfasst`} attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 7 }}>
            {SYMPTOMS.map(s => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 11px', background: 'var(--bg-elev)',
                border: '1px solid var(--border)', borderRadius: 6,
              }}>
                <span style={{ flex: 1, fontSize: 12 }}>{s.name}</span>
                <div style={{
                  width: 90, height: 7, background: 'var(--surface-2)',
                  borderRadius: 999, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: `${(s.severity / 10) * 100}%`,
                    background: s.severity >= 7 ? 'var(--warn)' : 'var(--acc-recov)',
                  }} />
                </div>
                <span className="v2-num" style={{ width: 44, textAlign: 'right', fontSize: 11 }}>
                  {s.severity}/10
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Symptom → biomarker map" sub="welcher Marker dazu passt"
              attrappe={ATTRAPPE}>
          <div style={{ overflowX: 'auto' }}>
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 170 }}>Symptom</th>
                  <th>Marker, die es erklaeren koennten</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(SYMPTOM_BIOMARKER_MAP).map(([s, marker]) => (
                  <tr key={s}>
                    <td>{s.replace(/_/g, ' ')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {marker.map(m => <Pill key={m}>{m}</Pill>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Zeitverlauf" sub="Symptome gegen Marker · 30 Tage"
              attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 9 }}>
            {SYMPTOMS.slice(0, 4).map(s => (
              <div key={s.id}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 11, marginBottom: 3,
                }}>
                  <span className="v2-dim">{s.name}</span>
                  <span className="v2-num">{s.severity}/10</span>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: 30 }).map((_, d) => {
                    // `[read]` Die Staerke schwankt um den heutigen Wert.
                    // Feste Zahlen statt Zufall — sonst zeigt jeder
                    // Seitenaufruf ein anderes Bild, und ein Vergleich
                    // braucht ein stehendes Bild.
                    const welle = Math.sin((d + s.name.length) * 0.9)
                                + Math.sin((d + s.id.length) * 0.31)
                    const v = Math.max(0, Math.min(10,
                      Math.round(s.severity + welle * 2.6)))
                    return (
                      <div key={d} title={`Tag ${d + 1}: ${v}/10`} style={{
                        flex: 1, height: 15, borderRadius: 2,
                        background: v === 0 ? 'var(--surface-2)'
                          : v >= 7 ? 'var(--neg)'
                          : v >= 4 ? 'var(--warn)' : 'var(--acc-recov)',
                        opacity: v === 0 ? 1 : 0.35 + (v / 10) * 0.65,
                      }} />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
            Der Entwurf legt Symptomstaerke und Markerwert uebereinander.
            Eine gemeinsame Zeitachse braucht beide Reihen — die Symptome
            haben im Repo kein Datum je Eintrag.
          </div>
        </Card>
      </div>
    </>
  )
}

/** `insights` — `MedInsights`, 1 Kachel. */
/** `module-medical-v2.jsx:734` — die acht Perzentilzeilen. */
const PERZENTILE: Array<[string, string, number, string]> = [
  ['LDL Cholesterol', '102 mg/dL', 73, 'better than 73% of men 35–45'],
  ['HDL Cholesterol', '58 mg/dL', 68, 'better than 68%'],
  ['hs-CRP', '0.6 mg/L', 88, 'better than 88% — low inflammation'],
  ['Total Testosterone', '712 ng/dL', 84, 'higher than 84% (on TRT)'],
  ['HbA1c', '5.4%', 52, 'median range'],
  ['Vitamin D (25-OH)', '48 ng/mL', 91, 'higher than 91%'],
  ['Ferritin', '142 ng/mL', 76, 'higher than 76%'],
  ['Hematocrit', '48%', 82, 'higher than 82% — TRT-associated'],
]

/** `module-medical-v2.jsx:766` — die sechs Berichtsteile. */
const BERICHTSTEILE: Array<[string, string, string]> = [
  ['1', 'Executive summary',
   'current system scores + overall health trajectory'],
  ['2', 'Critical + flagged values',
   'all non-optimal flags with context and reference ranges'],
  ['3', 'Biomarker table',
   'every value: lab range | optimal range | your value | flag | trend'],
  ['4', 'Supplement effectiveness',
   'which supplements demonstrably moved which markers'],
  ['5', 'Symptom overview', 'last 90 days with severity and duration'],
  ['6', 'Medication list', 'active medications with monitoring status'],
]

export function MedInsightsReferenz({ unter = 'correlations' }: { unter?: string }) {
  // `[cmd]` **G-370, 2026-09-08: der vierte Fall derselben Klasse.**
  //
  // `[cmd]` **Gemessen:** die vier Unterreiter tauschen oben
  // vollstaendig verschiedene Kachelsaetze
  // (`Correlations` / `Supplement effect` / `Population` /
  // `Doctor export`), **unten stand immer eine einzige Kachel
  // ,,Erkenntnisse"** — und die war nicht einmal der Mockup-Stand,
  // sondern eine eigene Zusammenstellung auffaelliger Marker.
  //
  // `[read]` **Der Unterreiter ist Zustand von `MedInsights`** und
  // steht nicht in der Adresse; die Referenz hing in `ansicht.tsx`.
  //
  // `[cmd]` **Die Vorlage teilt selbst** —
  // `module-medical-v2.jsx:647` (correlations), `:686` (supplements),
  // `:729` (benchmark), `:762` (export).
  // `[cmd]` **Aufrufform wie im gebauten Reiter** (`tab-tracking.tsx:606`):
  // die Funktion nimmt EINEN Eintrag und gibt `null` zurueck, wenn der
  // Marker fehlt — also ueber `SUPPLEMENT_BIOMARKER_MAP` abbilden und
  // die Leerwerte wegfiltern.
  const wirksamkeit = SUPPLEMENT_BIOMARKER_MAP
    .map(calcSupplementEffectiveness)
    .filter((e): e is Wirksamkeit => Boolean(e))
  return (
    <>
      <ReferenzTrenner reiter="Insights" quelle={QUELLE} />

      {unter === 'correlations' && (
      <div className="v2-col-gap" style={{ gap: 10 }}>
        <div style={{
          padding: 12, borderRadius: 7, display: 'flex',
          alignItems: 'center', gap: 10,
          background: 'color-mix(in oklch, var(--acc-buddy) 5%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--acc-buddy) 22%, var(--border))',
        }}>
          <Icon name="sparkles" className="v2-ic" style={{ color: 'var(--acc-buddy)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>
              Cross-module correlation engine
            </div>
            <div className="v2-muted" style={{ fontSize: 11 }}>
              Biomarker changes matched against Nutrition, Training,
              Recovery, Supplements. Minimum 3 data points. Association,
              never causation.
            </div>
          </div>
        </div>
        {CORRELATIONS.map(c => {
          const farbe = c.confidence === 'strong' ? 'var(--pos)'
            : c.confidence === 'moderate' ? 'var(--acc-recov)' : 'var(--fg-dim)'
          return (
            <Card key={c.id} attrappe={ATTRAPPE}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 3, alignSelf: 'stretch', background: farbe, borderRadius: 2,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginBottom: 5, flexWrap: 'wrap',
                  }}>
                    <Pill style={{
                      borderColor: 'color-mix(in oklch, var(--acc-medic) 35%, var(--border))',
                      color: 'var(--acc-medic)',
                    }}>{c.biomarker}</Pill>
                    <span className="v2-dim">×</span>
                    <Pill>{c.module} · {c.metric}</Pill>
                    <span className="v2-dim v2-mono"
                          style={{ marginLeft: 'auto', fontSize: 10 }}>
                      n={c.n} · r={c.r} · {c.confidence}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.55, marginBottom: 8 }}>
                    {c.finding}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      flex: 1, position: 'relative', height: 5,
                      background: 'var(--surface-2)', borderRadius: 999,
                    }}>
                      <div style={{
                        position: 'absolute', left: '50%', top: -2, bottom: -2,
                        width: 1, background: 'var(--border-strong)',
                      }} />
                      <div style={{
                        position: 'absolute',
                        left: c.r < 0 ? `${50 + c.r * 50}%` : '50%',
                        width: `${Math.abs(c.r) * 50}%`, top: 0, bottom: 0,
                        background: farbe, borderRadius: 999,
                      }} />
                    </div>
                    <span className="v2-num" style={{
                      fontSize: 11, color: farbe, width: 52, textAlign: 'right',
                    }}>r = {c.r}</span>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
      )}

      {unter === 'supplements' && (
      <div>
        <div className="v2-dim" style={{
          fontSize: 11.5, marginBottom: 12, lineHeight: 1.55, maxWidth: 760,
        }}>
          Automatic before/after comparison for every supplement in your
          stack that maps to a tracked biomarker. Baseline is the last
          value before the supplement start date; latest is the most
          recent result.
        </div>
        <div className="v2-grid v2-g-cols-2" style={{ gap: 12 }}>
          {wirksamkeit.map((e, i) => {
            const farbe = e.status === 'effective' ? 'var(--pos)'
              : e.status === 'partial' ? 'var(--acc-recov)'
              : e.status === 'inconclusive' ? 'var(--warn)' : 'var(--fg-dim)'
            return (
              <Card key={i} attrappe={ATTRAPPE}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: 8, flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{e.supplement}</span>
                  <span className="v2-dim">→</span>
                  <Pill>{e.biomarkerObj.name}</Pill>
                  <Pill style={{
                    marginLeft: 'auto',
                    borderColor: `color-mix(in oklch, ${farbe} 35%, var(--border))`,
                    color: farbe,
                  }}>{e.status.replace(/_/g, ' ')}</Pill>
                </div>
                <Row label="Baseline" value={`${e.baseline} ${e.biomarkerObj.unit}`} />
                <Row label="Latest" value={`${e.latest} ${e.biomarkerObj.unit}`} />
                <Row label="Change" value={`${e.changePct > 0 ? '+' : ''}${e.changePct}%`} />
              </Card>
            )
          })}
        </div>
      </div>
      )}

      {unter === 'benchmark' && (
      <Card title="Population benchmark"
            sub="vs. men 35–45 · NHANES reference distribution"
            attrappe={ATTRAPPE}>
        <div style={{ overflowX: 'auto' }}>
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Biomarker</th>
                <th style={{ width: 90, textAlign: 'right' }}>Your value</th>
                <th style={{ width: 220 }}>Percentile</th>
                <th style={{ width: 90, textAlign: 'right' }}>Percentile</th>
                <th>Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {PERZENTILE.map(([name, wert, p, deutung]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{wert}</td>
                  <td>
                    <div style={{
                      position: 'relative', height: 6,
                      background: 'var(--surface-2)', borderRadius: 999,
                    }}>
                      <div style={{
                        position: 'absolute', left: 0, width: `${p}%`,
                        top: 0, bottom: 0, borderRadius: 999,
                        background: p >= 75 ? 'var(--pos)'
                          : p >= 40 ? 'var(--acc-recov)' : 'var(--warn)',
                      }} />
                      <div style={{
                        position: 'absolute', left: '50%', top: -2, bottom: -2,
                        width: 1, background: 'var(--border-strong)',
                      }} />
                    </div>
                  </td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>P{p}</td>
                  <td className="v2-dim" style={{ fontSize: 11 }}>{deutung}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      )}

      {unter === 'export' && (
      <div className="v2-grid" style={{ gridTemplateColumns: '1.3fr 1fr', gap: 14 }}>
        <Card title="Doctor export · report structure"
              sub="6 sections · PDF · legal notice mandatory"
              attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {BERICHTSTEILE.map(([n, titel, d]) => (
              <div key={n} style={{
                display: 'flex', gap: 10, padding: 9,
                background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 6,
              }}>
                <div className="v2-mono" style={{
                  width: 20, height: 20, borderRadius: 4,
                  background: 'var(--surface-2)', color: 'var(--fg-muted)',
                  display: 'grid', placeItems: 'center',
                  fontSize: 10, fontWeight: 700, flexShrink: 0,
                }}>{n}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
                    {titel}
                  </div>
                  <div className="v2-dim" style={{ fontSize: 10.5 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="v2-divider" />
          <div style={{
            padding: 11, borderRadius: 6,
            background: 'color-mix(in oklch, var(--neg) 5%, var(--surface))',
            border: '1px solid color-mix(in oklch, var(--neg) 24%, var(--border))',
          }}>
            <div className="v2-eyebrow" style={{ color: 'var(--neg)', marginBottom: 5 }}>
              Mandatory legal notice in every report
            </div>
            <div style={{
              fontSize: 11.5, lineHeight: 1.6,
              color: 'var(--fg-muted)', fontStyle: 'italic',
            }}>
              Dieser Report wurde von LumeOS erstellt. Die enthaltenen
              Informationen stellen keine medizinische Diagnose oder
              Therapieempfehlung dar. Bitte besprechen Sie alle Befunde
              mit Ihrem Arzt.
            </div>
          </div>
        </Card>
        <Card title="Generate report" attrappe={ATTRAPPE}>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Categories</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
            {BIOMARKER_CATEGORIES.slice(1).map(c => (
              <Pill key={c.id} variant="acc">{c.label}</Pill>
            ))}
          </div>
          <Row label="From" value="2025-08-15" />
          <Row label="To" value="2026-08-15" />
          <Row label="Report type" value="Comprehensive · all sections" />
          <div className="v2-eyebrow" style={{ marginBottom: 4, marginTop: 10 }}>
            Format
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Pill variant="acc">PDF</Pill>
            <Pill>FHIR R4</Pill>
            <Pill>CSV</Pill>
          </div>
        </Card>
      </div>
      )}
    </>
  )
}

export function FehlendeImportKacheln({ unter = 'upload' }: { unter?: string }) {
  // `[cmd]` **G-365: auch die fehlenden Kacheln folgen dem Unterreiter.**
  // Sonst steht ueber der Linie eine Attrappe zu `Manual entry`,
  // waehrend oben `OCR upload` gewaehlt ist — und daneben nichts,
  // womit man sie vergleichen koennte.
  const grund = (was: string) => `Attrappe — ${QUELLE} · wartet auf: ${was}`
  return (
    <>
      {unter === 'manual' && (
      <Card title="Manual entry" sub="Werte von Hand erfassen"
            attrappe={grund(
              'einen Schreibweg fuer einzelne Marker — der Import legt '
              + 'nur ganze Befunde an')}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {BIOMARKERS.slice(0, 6).map(b => <Pill key={b.id}>{b.name}</Pill>)}
        </div>
      </Card>
      )}
      {unter === 'history' && (
      <Card title="Import history" sub="frueher eingelesene Befunde"
            attrappe={grund(
              'eine Laufhistorie — die Einleseschritte werden nicht '
              + 'protokolliert')}>
        <div style={{ overflowX: 'auto' }}>
          <table className="v2-tbl">
            <thead>
              <tr><th style={{ width: 110 }}>Datum</th><th>Datei</th>
                <th style={{ width: 90, textAlign: 'right' }}>Werte</th></tr>
            </thead>
            <tbody>
              {[['23 Apr 2026', 'MVZ_Berlin.pdf', 34],
                ['12 Jan 2026', 'Hausarzt_Q1.pdf', 22]].map(([d, f, n]) => (
                <tr key={String(d)}>
                  <td className="v2-num v2-muted">{d}</td>
                  <td>{f}</td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      )}
      {unter === 'units' && (
      <Card title="Unit normalization map" sub="Einheiten angleichen"
            attrappe={grund(
              'eine Umrechnungstabelle je Labor — es gibt keine '
              + 'Zuordnung Laboreinheit zu Zieleinheit')}>
        <div style={{ overflowX: 'auto' }}>
          <table className="v2-tbl">
            <thead>
              <tr><th>Marker</th><th style={{ width: 110 }}>Labor</th>
                <th style={{ width: 110 }}>Ziel</th></tr>
            </thead>
            <tbody>
              {BIOMARKERS.slice(0, 5).map(b => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td className="v2-mono v2-dim">{b.unit}</td>
                  <td className="v2-mono">{b.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      )}
    </>
  )
}


/**
 * `tracking` · Unterreiter **Medications** — `MedTracking`, der
 * `sub === "medications"`-Zweig.
 *
 * `[cmd]` **Tom, 2026-09-07:** *,,medical/tracking medications zeigt
 * oben nicht was unten im mockup ist."*
 *
 * `[read]` **Der Grund:** die Referenz zeigte auf beiden Unterreitern
 * den SYMPTOM-Teil. **Der Unterreiter steht nicht in der Adresse** —
 * er ist Zustand der Komponente, und die Referenz kannte ihn nicht.
 */
export function MedMedicationsReferenz() {
  const ueberfaellig = MEDICATIONS_V2.filter(m => m.monitoring_overdue)
  return (
    <>
      <ReferenzTrenner reiter="Tracking · Medications" quelle={QUELLE} />
      {ueberfaellig.length > 0 && (
        <div style={{
          padding: 12, marginBottom: 14, borderRadius: 7,
          background: 'color-mix(in oklch, var(--warn) 6%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--warn) 28%, var(--border))',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Icon name="alert" className="v2-ic" style={{ color: 'var(--warn)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>
              {ueberfaellig.length} medications with overdue monitoring
            </div>
            <div className="v2-muted" style={{ fontSize: 11 }}>
              {ueberfaellig.map(m => m.name).join(' · ')} — bloodwork due
              since {ueberfaellig[0]?.next_due}
            </div>
          </div>
          <Pill>Schedule panel</Pill>
        </div>
      )}
      <div className="v2-col-gap" style={{ gap: 12 }}>
        {MEDICATIONS_V2.map(m => (
          <Card key={m.id} attrappe={ATTRAPPE}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 7, flexShrink: 0,
                display: 'grid', placeItems: 'center',
                background: m.type === 'prescription'
                  ? 'color-mix(in oklch, var(--acc-medic) 18%, transparent)'
                  : 'var(--surface-2)',
                border: `1px solid ${m.type === 'prescription'
                  ? 'color-mix(in oklch, var(--acc-medic) 35%, var(--border))'
                  : 'var(--border)'}`,
                color: m.type === 'prescription'
                  ? 'var(--acc-medic)' : 'var(--fg-muted)',
              }}>
                <Icon name="medical" className="v2-ic" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: 5, flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{m.name}</span>
                  <Pill>{m.type}</Pill>
                  {m.rx && (
                    <Pill className="v2-mono" style={{ fontSize: 9.5 }}>{m.rx}</Pill>
                  )}
                  {m.monitoring_overdue && (
                    <Pill variant="warn">monitoring overdue</Pill>
                  )}
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 10, fontSize: 11,
                }}>
                  <div>
                    <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Dose</div>
                    <div className="v2-num">{m.dosage}</div>
                  </div>
                  <div>
                    <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Frequency</div>
                    <div>{m.frequency.replace(/_/g, ' ')}</div>
                  </div>
                  <div>
                    <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Indication</div>
                    <div>{m.indication}</div>
                  </div>
                  <div>
                    <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Monitoring</div>
                    <div className="v2-num">
                      {m.monitoring ? m.monitoring_frequency : 'none'}
                    </div>
                  </div>
                  <div>
                    <div className="v2-eyebrow" style={{ marginBottom: 2 }}>Next due</div>
                    <div className="v2-num" style={{
                      color: m.monitoring_overdue ? 'var(--warn)' : 'var(--fg)',
                    }}>{m.next_due ?? '—'}</div>
                  </div>
                </div>
                {m.targets.length > 0 && (
                  <div style={{
                    display: 'flex', gap: 4, flexWrap: 'wrap',
                    marginTop: 8, alignItems: 'center',
                  }}>
                    <span className="v2-eyebrow" style={{ marginRight: 2 }}>
                      Monitors
                    </span>
                    {m.targets.map(z => <Pill key={z} style={{ fontSize: 9.5 }}>{z}</Pill>)}
                  </div>
                )}
                {m.interactions.length > 0 && (
                  <div style={{
                    marginTop: 8, padding: 8, borderRadius: 5, fontSize: 10.5,
                    background: 'color-mix(in oklch, var(--warn) 5%, var(--surface))',
                    border: '1px solid color-mix(in oklch, var(--warn) 22%, var(--border))',
                    color: 'var(--fg-muted)',
                  }}>
                    Known interaction: {m.interactions.join(' · ')}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}


/**
 * `verlauf`, wie er im Mockup steht — `module-medical.jsx:398`
 * (`MedHistory`) und `:96` (Appointments).
 *
 * `[cmd]` **Der Entwurf zeigt eine senkrechte Zeitachse mit
 * Punktmarken**, Kategorie-Pille und einem Verweis auf das
 * hinterlegte Dokument (`linkedDoc`).
 *
 * `[read]` **Der Verweis IST die Herkunft** — das Mockup hatte den
 * Gedanken schon, E-74 hat ihn benannt und zur Pflicht gemacht.
 */
export function MedVerlaufReferenz() {
  return (
    <>
      <ReferenzTrenner reiter="Verlauf" quelle="theme-v1/module-medical.jsx" />
      <div className="v2-grid v2-grid-14" style={{ gap: 14 }}>
        <Card title="History" sub="timeline · filterable by category"
              attrappe={ATTRAPPE}>
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            <div style={{
              position: 'absolute', left: 8, top: 0, bottom: 0,
              width: 1, background: 'var(--border)',
            }} />
            <div className="v2-col-gap" style={{ gap: 12 }}>
              {VERLAUF_ENTWURF.map(([datum, kat, titel, text]) => (
                <div key={titel} style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: -24, top: 8,
                    width: 16, height: 16, borderRadius: 999,
                    background: 'var(--bg)',
                    border: '2px solid var(--warn)',
                    display: 'grid', placeItems: 'center',
                  }}>
                    <Icon name="alert" className="v2-ic" style={{
                      width: 7, height: 7, color: 'var(--warn)',
                    }} />
                  </div>
                  <div style={{
                    padding: 12, background: 'var(--bg-elev)',
                    border: '1px solid var(--border)', borderRadius: 6,
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
                    }}>
                      <span className="v2-num v2-dim" style={{ fontSize: 10 }}>{datum}</span>
                      <Pill>{kat}</Pill>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                      {titel}
                    </div>
                    <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
                      {text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Appointments" sub="upcoming and past" attrappe={ATTRAPPE}>
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {TERMINE_ENTWURF.map(([wann, wer, grund, status]) => (
              <div key={wann} style={{
                padding: 9, borderRadius: 6, background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                }}>
                  <span className="v2-num v2-dim" style={{ fontSize: 10 }}>{wann}</span>
                  <span style={{ fontSize: 12, flex: 1, minWidth: 0 }}>{wer}</span>
                  <Pill variant={status === 'upcoming' ? 'acc' : undefined}>{status}</Pill>
                </div>
                <div className="v2-muted" style={{ fontSize: 11, marginTop: 3 }}>
                  {grund}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
