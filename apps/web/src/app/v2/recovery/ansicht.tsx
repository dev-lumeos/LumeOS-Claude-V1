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
// `[cmd]` TEILE SIND ECHT: Check-ins, Scores und Modalitaeten lesen aus
// `recovery`. Was hier weiter markiert ist, ist noch nicht an diese
// Tabellen angebunden oder braucht weitere Tabellen.
import * as React from 'react'
import { useTabParam } from '../../../lib/tab-url'
import {
  Card, Pill, Icon, Ring, Meter, Row, Tabs, InEntwicklungKnopf,
  Empty, ErmuedungsKarte, type TabItem,
} from '@lumeos/ui'

// G-163: die Modalitaeten-Entwurfsdaten und die Evidenz-Fussnote sind
// mit den Rueckfallfassungen gefallen — die Evidenzbindung lebt in der
// echten ModalitaetenKachel weiter.
import {
  MUSCLE_GROUPS_BODYMAP, MUSCLE_LABEL, MUSCLE_STATE, CHECKIN, NUTRITION_INPUT,
  calcMuscleRecovery, calcRecoveryScore, readinessFor,
  evaluateOvertraining, recoveryPendingActions,
} from './motor'
import { RecoveryKontext, useRecovery, type ModalZustand, type ScoreModus } from './kontext'
// G-26: `./koerperkarte` (der Entwurf) ist raus — die anatomische
// Karte steht in packages/ui, weil drei Module sie brauchen.
import { alsErmuedung, KARTE_ZU_RECOVERY } from './muskel-zuordnung'
import { RecoveryModale } from './modale'
// G-55: die erfassten Check-ins.
import type { CheckinStand } from '../../../lib/recovery/checkin-read'
// G-82: der Erholungswert kommt aus `recovery.scores`, nicht mehr aus
// einer Browserrechnung. `lib/recovery/score.ts` (G-76) bleibt — aber
// nur noch als Vorschau im Check-in-Entwurf, nicht mehr hier.
import type { ScoreStand, ModalitaetenStand } from '../../../lib/recovery/scores-read'
import { ScoreKachel, ScoreVerlauf } from './score-kachel'
import { ModalitaetenKachel } from './modalitaeten-kachel'
import { CheckinStreifen } from './checkin-streifen'
import { RecCheckin } from './tab-checkin'
import { RecMuscleMap, RecHRV, RecSleep } from './tab-messwerte'
import { RecModalities, RecOvertraining, RecProtocols, RecStress } from './tab-protokolle'

/** Die Marke an jeder Kachel. Ein Satz, damit er nicht driftet. */
export const ATTRAPPE =
  'Aus dem Entwurf uebernommen. Diese Kachel ist noch nicht an die vorhandenen '
  + 'Recovery-Daten angebunden - die Zahlen sind erfunden.'

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

export function RecoveryAnsicht({
  checkins, scores, modalitaeten,
}: {
  checkins?: CheckinStand
  scores?: ScoreStand
  modalitaeten?: ModalitaetenStand
}) {
  // G-117: Tab in der Adresse — Drop-in aus lib/tab-url.
  const [tab, setTab] = useTabParam('today')
  const [modus, setModus] = React.useState<ScoreModus>('hrv')
  const [modal, setModal] = React.useState<ModalZustand | null>(null)

  // Wie in der Vorlage: einmal rechnen, an alle Tabs weiterreichen.
  const sc = React.useMemo(() => calcRecoveryScore(modus), [modus])
  const rd = readinessFor(sc.score)
  const ot = React.useMemo(() => evaluateOvertraining(), [])
  const pending = React.useMemo(() => recoveryPendingActions(), [])

  // G-82: Die juengste Zeile aus `recovery.scores`. `null`, wenn keine
  // vorliegt — dann bleiben Kopf und Kachel beim Entwurf.
  //
  // `[cmd]` **Hier wurde vorher gerechnet, und zwar anders.** G-76 rief
  // `berechneScore` und kam ueber fuenf gemessene Tage auf −7,0 bis
  // +2,6 gegenueber der Tabelle. Der Grund: die Browserrechnung liess
  // Trainingslast und Ernaehrung ganz weg (Basis 75), die Tabelle
  // fuellt beide mit Rueckfallwerten (Basis 100) und benutzt den
  // gemessenen ACWR, wo es einen gibt — auf 118 von 170 Tagen.
  // C-181: der ACWR-Term ist seither per Evidenzregister entfernt;
  // ob die DB-Formel nachzieht, entscheidet Codex (`scores.acwr_used`).
  const echterScore = scores?.neuster ?? null

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
            {/* G-76/G-82: Der Kopf zeigt die ZAHL aus der Tabelle, ohne
                Einordnung. G-163: die Entwurfspille (mit der
                Urteilsstufe „Good") ist raus — ohne echte Zeile steht
                hier keine Zahl, und die Kachel darunter sagt warum. */}
            {echterScore && (
              <Pill style={{
                borderColor: 'color-mix(in oklch, var(--acc-recov) 35%, var(--border))',
                color: 'var(--acc-recov)',
                background: 'color-mix(in oklch, var(--acc-recov) 7%, transparent)',
              }}>Score {echterScore.score.toFixed(1)}</Pill>
            )}
            {/* G-163: auch die Check-in-Zeit faellt nicht mehr auf die
                Entwurfskonstante zurueck — ohne Check-in keine Pille. */}
            {checkins?.neuster?.checkin_time && (
              <Pill><span className="v2-dot" style={{ background: 'var(--pos)' }} />
                Check-in {checkins.neuster.checkin_time.slice(0, 5)}
              </Pill>
            )}
            {ot.severity !== 'normal' && <Pill variant="warn">{ot.count} OT signals</Pill>}
          </div>
          <div className="v2-module-sub">
            {/* G-82: Statt „x von 100 Gewichtspunkten gerechnet" steht
                hier, WOHER die Zahl kommt — die Tabelle rechnet immer
                alle 100, aber nicht immer aus gemessenen Werten. Die
                Zahl der Rueckfaelle sagt, wie viel davon gestuetzt ist. */}
            {echterScore
              ? <>aus <span className="v2-mono">recovery.scores</span> · {echterScore.mode} mode
                  {' · '}{echterScore.entry_date}
                  {scores && scores.gesamt > 1 ? ` · ${scores.gesamt} Tage erfasst` : ''}
                  {' · '}{pending.length} pending action{pending.length === 1 ? '' : 's'}</>
              : <>{rd.advice} · score mode: {modus} · {pending.length} pending
                  action{pending.length === 1 ? '' : 's'}</>}
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

      {/* G-163: der Modalities-Zaehler kommt aus der Tabelle, nicht
          mehr aus der Entwurfsliste (die zeigte fest 2). */}
      <Tabs items={tabs(18, modalitaeten?.gesamt ?? 0, ot.count)} active={tab} onChange={setTab} />

      {tab === 'today' && (
        <RecToday checkins={checkins} scores={scores} modalitaeten={modalitaeten} />
      )}
      {tab === 'checkin' && <RecCheckin />}
      {tab === 'muscles' && <RecMuscleMap />}
      {/* G-160: HRV und Sleep zeigen die erfassten Werte, sobald
          Check-ins geladen sind — der Entwurf ist nur noch Rueckfall. */}
      {tab === 'hrv' && <RecHRV stand={checkins} />}
      {tab === 'sleep' && <RecSleep stand={checkins} />}
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
function RecToday({
  checkins, scores, modalitaeten,
}: {
  checkins?: CheckinStand
  scores?: ScoreStand
  modalitaeten?: ModalitaetenStand
}) {
  const { open, modus, setModus, sc, rd, ot, pending, zeigeTab } = useRecovery()

  const recoveryValues = React.useMemo(() => muskelwerte(), [])

  // G-82: dieselbe Zeile wie im Kopf — einmal gelesen, weitergereicht.
  const echterScore = scores?.neuster ?? null

  return (
    <div className="v2-grid-15">
      <div className="v2-col-gap" style={{ gap: 14 }}>
        {/* G-55: die einzige Kachel mit echten Daten. Sie steht oben,
            weil sie den Unterschied zum Rest sichtbar macht — alles
            darunter traegt die Attrappenmarke. */}
        <CheckinStreifen stand={checkins} />

        {/* G-82: Der Erholungswert aus `recovery.scores`. Liegt keine
            Zeile vor, bleibt die Entwurfskachel darunter stehen — mit
            ihrer Marke. `[read]` Der Check-in kommt nur noch fuer die
            Rohwerte daneben (HRV, Schlafqualitaet) mit; gerechnet wird
            aus ihm nichts mehr. */}
        {echterScore && (
          <ScoreKachel zeile={echterScore} checkin={checkins?.neuster ?? null} />
        )}

        {/* G-82: Die Kurve — der Grund, aus dem die Tabelle gelesen
            wird. `[cmd]` 170 Tage; im Browser waere jeder davon ein
            eigener Check-in-Abruf. */}
        {scores && scores.verlauf.length > 1 && (
          <ScoreVerlauf verlauf={scores.verlauf} gesamt={scores.gesamt} />
        )}

        {/* G-163: die Rueckfallfassung des Erholungswerts ist raus —
            Tom, 2026-08-23: „sie fliegen." Kommt keine Zeile aus
            `recovery.scores`, steht hier der Grund, nicht der Entwurf
            mit erfundenen Zahlen (und nicht ein Strich: ein Strich
            hiesse „leer" statt „nicht gelesen", G-161). */}
        {!echterScore && (
          <Card title="Erholungswert">
            <Empty
              title="Nicht geladen"
              sub={scores?.fehler
                ? `recovery.scores meldet: ${scores.fehler}`
                : 'recovery.scores kam für dieses Konto leer zurück — es liegt keine Score-Zeile vor.'}
              icon="recovery"
            />
          </Card>
        )}

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

        {/* G-82: Kachel #4 des Entwurfs, an `recovery.modality_log`
            gebunden. `[cmd]` 89 Zeilen, vier Arten. Liegt nichts vor,
            bleibt die Entwurfskachel darunter mit ihrer Marke. */}
        {modalitaeten && modalitaeten.gesamt > 0 && (
          <ModalitaetenKachel stand={modalitaeten} />
        )}

        {/* G-163: der Modalitaeten-Rueckfall ist raus. Ohne Zeile aus
            `recovery.modality_log` steht hier der Grund — nicht die
            erfundene Tagesliste des Entwurfs. */}
        {!(modalitaeten && modalitaeten.gesamt > 0) && (
          <Card title="Today's modalities">
            <Empty
              title="Nicht geladen"
              sub={modalitaeten?.fehler
                ? `recovery.modality_log meldet: ${modalitaeten.fehler}`
                : 'recovery.modality_log kam für dieses Konto leer zurück — keine erfasste Modalität.'}
              icon="droplet"
            />
          </Card>
        )}

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
