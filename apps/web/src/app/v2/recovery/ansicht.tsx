'use client'

// Das Recovery-Modul der Vorlage, uebernommen.
//
// QUELLE: theme-v1/module-recovery-v2.jsx (899 Zeilen) — der Rahmen.
//
// **WARUM -v2 UND NICHT module-recovery.jsx:** `[cmd]` Die Vorlage
// fuehrt zwei vollstaendige, konkurrierende Rahmen. `app.jsx:122`
// entscheidet:
//
//     case "recovery": return window.RecoveryModuleV2
//       ? <window.RecoveryModuleV2 /> : <RecoveryModule />;
//
// `RecoveryModuleV2` liegt vor (module-recovery-v2.jsx:899), also
// gewinnt es — der alte Rahmen ist der Notnagel, der nie greift.
// Ausfuehrlich im Bericht, Abschnitt „Was die fuenf Vorlagendateien
// enthalten".
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript.
//   2. Klassen auf `v2-`-Praefix.
//   3. `window.RecoveryStress` -> Import; `window.dispatchEvent
//      ("rec-tab")` -> Kontextfunktion `zeigeTab`.
//   4. Knoepfe ohne Ziel oeffnen `InEntwicklung`.
//   5. `@media`-Haltepunkte, weil die Vorlage keine hat.
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst. Die Texte bleiben englisch wie in der Vorlage.
//
// `[cmd]` ALLES IST ATTRAPPE. `recovery` hat kein Schema — der Begriff
// kommt in `supabase/_pipeline/` in keiner SQL-Datei vor. Es ist nichts
// anzubinden.
import * as React from 'react'
import {
  Card, Pill, Icon, Ring, Meter, Row, Tabs, InEntwicklungKnopf,
  ErmuedungsKarte, type TabItem,
} from '@lumeos/ui'

import {
  MUSCLE_GROUPS_BODYMAP, MUSCLE_LABEL, MUSCLE_STATE, CHECKIN, NUTRITION_INPUT,
  MODALITY_BONUS, MODALITY_META, MAX_DAILY_BONUS, TODAY_MODALITIES,
  ACWR_DATA, calcMuscleRecovery, calcRecoveryScore, readinessFor,
  evaluateOvertraining, recoveryPendingActions,
} from './motor'
import { RecoveryKontext, useRecovery, type ModalZustand, type ScoreModus } from './kontext'
// G-26: `./koerperkarte` (der Entwurf) ist raus — die anatomische
// Karte steht in packages/ui, weil drei Module sie brauchen.
import { alsErmuedung, KARTE_ZU_RECOVERY } from './muskel-zuordnung'
import { RecoveryModale } from './modale'
import { RecCheckin } from './tab-checkin'
import { RecMuscleMap, RecHRV, RecSleep } from './tab-messwerte'
import { RecModalities, RecOvertraining, RecProtocols, RecStress } from './tab-protokolle'

/** Die Marke an jeder Kachel. Ein Satz, damit er nicht driftet. */
export const ATTRAPPE =
  'Aus dem Entwurf uebernommen. Die Zahlen sind erfunden — das Schema '
  + '`recovery` gibt es noch nicht.'

// [cmd] module-recovery-v2.jsx:32-42, in dieser Reihenfolge.
function tabs(muskelzahl: number, modalitaeten: number, otZahl: number): TabItem[] {
  return [
    { id: 'today', label: 'Today', icon: 'zap' },
    { id: 'checkin', label: 'Check-in', icon: 'edit' },
    { id: 'muscles', label: 'Muscle map', icon: 'recovery', count: muskelzahl },
    { id: 'hrv', label: 'HRV', icon: 'trend_up' },
    { id: 'sleep', label: 'Sleep', icon: 'moon' },
    { id: 'modalities', label: 'Modalities', icon: 'droplet', count: modalitaeten },
    { id: 'overtraining', label: 'Overtraining', icon: 'alert', count: otZahl },
    { id: 'protocols', label: 'Protocols', icon: 'calendar' },
    { id: 'stress', label: 'Stress', icon: 'brain' },
  ]
}

export function RecoveryAnsicht() {
  const [tab, setTab] = React.useState('today')
  const [modus, setModus] = React.useState<ScoreModus>('hrv')
  const [modal, setModal] = React.useState<ModalZustand | null>(null)

  // Wie in der Vorlage: einmal rechnen, an alle Tabs weiterreichen.
  const sc = React.useMemo(() => calcRecoveryScore(modus), [modus])
  const rd = readinessFor(sc.score)
  const ot = React.useMemo(() => evaluateOvertraining(), [])
  const pending = React.useMemo(() => recoveryPendingActions(), [])

  const kontext = React.useMemo(() => ({
    open: (m: ModalZustand) => setModal(m),
    close: () => setModal(null),
    modus, setModus, sc, rd, ot, pending,
    zeigeTab: setTab,
  }), [modus, sc, rd, ot, pending])

  return (
    <RecoveryKontext.Provider value={kontext}>
      {/* [cmd] module-recovery-v2.jsx:17-31. Die Vorlage benutzt hier
          `module-header` OHNE `module-hero-lite` — anders als Training
          und Dashboard. Uebernommen wie sie ist. */}
      <div className="v2-module-header">
        <div className="v2-module-title-block">
          <div className="v2-module-title-row">
            <span className="v2-module-title">Recovery</span>
            <Pill style={{
              borderColor: `color-mix(in oklch, ${rd.c} 35%, var(--border))`,
              color: rd.c,
              background: `color-mix(in oklch, ${rd.c} 7%, transparent)`,
            }}>Score {sc.score} · {rd.label}</Pill>
            <Pill><span className="v2-dot" style={{ background: 'var(--pos)' }} />Check-in {CHECKIN.logged_at}</Pill>
            {ot.severity !== 'normal' && <Pill variant="warn">{ot.count} OT signals</Pill>}
          </div>
          <div className="v2-module-sub">
            {rd.advice} · score mode: {modus} · {pending.length} pending action{pending.length === 1 ? '' : 's'}
          </div>
        </div>
        <div className="v2-module-actions">
          <button type="button" className="v2-btn" onClick={() => kontext.open({ typ: 'hrvMeasure' })}>
            <Icon name="camera" className="v2-ic v2-ic-sm" />Measure HRV
          </button>
          <button type="button" className="v2-btn" onClick={() => kontext.open({ typ: 'logModality' })}>
            <Icon name="plus" className="v2-ic v2-ic-sm" />Log modality
          </button>
          <button type="button" className="v2-btn v2-btn-primary" onClick={() => setTab('checkin')}>
            <Icon name="edit" className="v2-ic v2-ic-sm" />Morning check-in
          </button>
        </div>
      </div>

      <Tabs items={tabs(18, TODAY_MODALITIES.length, ot.count)} active={tab} onChange={setTab} />

      {tab === 'today' && <RecToday />}
      {tab === 'checkin' && <RecCheckin />}
      {tab === 'muscles' && <RecMuscleMap />}
      {tab === 'hrv' && <RecHRV />}
      {tab === 'sleep' && <RecSleep />}
      {tab === 'modalities' && <RecModalities />}
      {tab === 'overtraining' && <RecOvertraining />}
      {tab === 'protocols' && <RecProtocols />}
      {tab === 'stress' && <RecStress />}

      <RecoveryModale modal={modal} onClose={kontext.close} />
    </RecoveryKontext.Provider>
  )
}

// ═══ TODAY ═══════════════════════════════════════════════════════
// [cmd] module-recovery-v2.jsx:99-242.
function RecToday() {
  const { open, modus, setModus, sc, rd, ot, pending, zeigeTab } = useRecovery()

  const recoveryValues = React.useMemo(() => muskelwerte(), [])

  return (
    <div className="v2-grid-15">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card attrappe={ATTRAPPE}>
          <div className="v2-rec-score-kopf">
            <Ring value={sc.score} max={100} color={rd.c} label={rd.level} size={140} stroke={10} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span className="v2-eyebrow">Readiness</span>
                <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 6, padding: 2, gap: 1, marginLeft: 'auto' }}>
                  {(['manual', 'hrv'] as ScoreModus[]).map(m => (
                    <button key={m} type="button" onClick={() => setModus(m)}
                            aria-pressed={modus === m}
                            className={modus === m ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
                            style={{ height: 20, fontSize: 10, padding: '0 9px', borderRadius: 4 }}>{m}</button>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 19, fontWeight: 600, marginBottom: 5, color: rd.c }}>{rd.label}</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', lineHeight: 1.5, marginBottom: 10 }}>{rd.advice}</div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {([
                  ['HRV', `${CHECKIN.hrv_rmssd} ms`, `z ${sc.hrv.z}`],
                  ['Sleep', `${CHECKIN.sleep_hours} h`, `q ${CHECKIN.sleep_quality}/10`],
                  ['ACWR', String(ACWR_DATA.acwr), `load ${sc.tls.toFixed(2)}`],
                  ['Bonus', `+${sc.bonus.capped}`, sc.bonus.wasCapped ? 'capped' : `of ${MAX_DAILY_BONUS} max`],
                ] as Array<[string, string, string]>).map(([l, v, s]) => (
                  <div key={l}>
                    <div className="v2-eyebrow" style={{ marginBottom: 2 }}>{l}</div>
                    <div className="v2-num" style={{ fontSize: 16, lineHeight: 1 }}>{v}</div>
                    <div className="v2-dim v2-mono" style={{ fontSize: 9.5, marginTop: 2 }}>{s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="v2-divider" />
          <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Score composition · {modus} mode</div>
          <div className="v2-col-gap" style={{ gap: 5 }}>
            {sc.terms.map(t => (
              <div key={t.key} className="v2-rec-term">
                <span style={{ color: 'var(--fg-muted)' }}>{t.label}</span>
                <span className="v2-mono v2-dim" style={{ fontSize: 10 }}>{t.raw}</span>
                <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999 }}>
                  <div style={{ height: '100%', width: `${(t.val / t.w) * 100}%`, background: 'var(--acc-recov)', borderRadius: 999 }} />
                </div>
                <span className="v2-num" style={{ textAlign: 'right' }}>
                  {t.val.toFixed(1)}<span className="v2-dim" style={{ fontSize: 9 }}>/{t.w}</span>
                </span>
              </div>
            ))}
            <div className="v2-rec-term" style={{ paddingTop: 6, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600 }}>Modality bonus</span>
              <span className="v2-mono v2-dim" style={{ fontSize: 10 }}>{TODAY_MODALITIES.length} logged</span>
              <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999 }}>
                <div style={{ height: '100%', width: `${(sc.bonus.capped / MAX_DAILY_BONUS) * 100}%`, background: 'var(--pos)', borderRadius: 999 }} />
              </div>
              <span className="v2-num" style={{ textAlign: 'right', color: 'var(--pos)' }}>+{sc.bonus.capped}</span>
            </div>
            <div className="v2-rec-term" style={{ fontSize: 12, paddingTop: 6, borderTop: '1px solid var(--border-strong)' }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span />
              <span />
              <span className="v2-num" style={{ textAlign: 'right', fontSize: 16, fontWeight: 600, color: rd.c }}>{sc.score}</span>
            </div>
          </div>
        </Card>

        <Card
          title="Muscle readiness" sub="18 groups · click for the calculation"
          attrappe={ATTRAPPE}
          actions={
            <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" onClick={() => zeigeTab('muscles')}>
              Full map →
            </button>
          }
        >
          {/* G-26: die anatomische Karte aus packages/ui ersetzt die
              18 Flaechen des Entwurfs. Die Legende bringt sie mit —
              die drei Zeilen, die hier standen, sind entfallen, weil
              sie dieselbe Skala zweimal beschrieben haetten. */}
          <ErmuedungsKarte
            daten={alsErmuedung(recoveryValues)}
            breite={150}
            onPick={(id, typ) => {
              // Zurueckuebersetzen: die Karte meldet ihre ID, das
              // Fenster erwartet das Recovery-Kuerzel.
              const slug = KARTE_ZU_RECOVERY[id]
              if (typ === 'muscle' && slug) open({ typ: 'muscle', slug })
            }}
          />
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        {/* Die Vorlage zeigt die Kachel nur, wenn es offene Punkte gibt
            (`pending.length > 0`). Uebernommen. */}
        {pending.length > 0 && (
          <Card title="Pending actions" sub={`${pending.length} open`} attrappe={ATTRAPPE}>
            <div className="v2-col-gap" style={{ gap: 5 }}>
              {pending.map(p => {
                const c = p.priority === 'high' ? 'var(--warn)'
                  : p.priority === 'normal' ? 'var(--acc-recov)' : 'var(--fg-dim)'
                return (
                  <div key={p.type} style={{
                    display: 'flex', gap: 9, padding: 9,
                    background: `color-mix(in oklch, ${c} 5%, var(--surface))`,
                    border: `1px solid color-mix(in oklch, ${c} 24%, var(--border))`,
                    borderRadius: 5,
                  }}>
                    <div style={{ width: 3, alignSelf: 'stretch', background: c, borderRadius: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="v2-mono" style={{ fontSize: 10, color: c, marginBottom: 2 }}>
                        {p.type.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: 11.5, lineHeight: 1.4 }}>{p.text}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        <Card
          title="Today's modalities" sub={`bonus +${sc.bonus.capped} of ${MAX_DAILY_BONUS} max`}
          attrappe={ATTRAPPE}
          actions={
            <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                    aria-label="Log modality" onClick={() => open({ typ: 'logModality' })}>
              <Icon name="plus" className="v2-ic v2-ic-sm" />
            </button>
          }
        >
          {TODAY_MODALITIES.length === 0 ? (
            <div className="v2-dim" style={{ fontSize: 11.5, padding: 10, textAlign: 'center' }}>Nothing logged today.</div>
          ) : (
            <div className="v2-col-gap" style={{ gap: 5 }}>
              {TODAY_MODALITIES.map(m => {
                const meta = MODALITY_META[m.type]
                return (
                  <div key={m.id} style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: 9,
                    background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 5,
                  }}>
                    <Icon name={meta.icon as never} className="v2-ic v2-ic-sm" style={{ color: meta.c }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 500 }}>{meta.label}</div>
                      <div className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>{m.time} · {m.duration} min · {m.detail}</div>
                    </div>
                    <span className="v2-num" style={{ fontSize: 11, color: 'var(--pos)' }}>+{MODALITY_BONUS[m.type]}</span>
                  </div>
                )
              })}
              {sc.bonus.wasCapped && (
                <div className="v2-dim" style={{ fontSize: 10.5, padding: '6px 9px', lineHeight: 1.45 }}>
                  Raw bonus {sc.bonus.raw} capped at {MAX_DAILY_BONUS} — prevents score inflation through excessive logging.
                </div>
              )}
            </div>
          )}
        </Card>

        <Card title="Overtraining watch" sub={`${ot.count} of 8 signals · ${ot.severity}`} attrappe={ATTRAPPE}>
          <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
            {ot.results.map(r => (
              <div key={r.id} title={`${r.label} · ${r.detailText}`} style={{
                flex: 1, height: 22, borderRadius: 3,
                background: r.fired ? 'var(--warn)' : 'var(--surface-2)',
                opacity: r.fired ? 0.85 : 1,
              }} />
            ))}
          </div>
          <Row label="Severity" value={ot.severity} />
          <Row label="Threshold" value="3+ moderate · 5+ high · 7+ critical" />
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
            Single signals are normal day-to-day noise. The combination is what matters — that is why severity keys off count, not any one threshold.
          </div>
        </Card>
      </div>
    </div>
  )
}

/** Die Muskelwerte, wie Today und Muscle map sie berechnen. */
export function muskelwerte(): Record<string, number | null> {
  return Object.fromEntries(MUSCLE_GROUPS_BODYMAP.map(slug => {
    const st = MUSCLE_STATE[slug]
    if (!st) return [slug, null]
    return [slug, calcMuscleRecovery({
      hours: st.hours, sets: st.sets, sleepQuality: CHECKIN.sleep_quality,
      proteinPct: NUTRITION_INPUT.proteinPct, caloriePct: NUTRITION_INPUT.caloriePct,
      soreness: st.soreness,
    }).value]
  }))
}
