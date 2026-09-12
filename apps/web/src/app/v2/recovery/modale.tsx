'use client'

// Die vier Modale des Recovery-Moduls.
//
// QUELLE: theme-v1/module-recovery-modals2.jsx (266 Zeilen) —
// `RMod` (der Rahmen), `HRVMeasureModal`, `LogModalityModal`,
// `MuscleDetailModal2`, `ProtocolDetailModal`.
//
// `[cmd]` **NICHT `-modals.jsx`.** Jene Datei (567 Zeilen) fuehrt sechs
// ANDERE Modale — LogSleepModal, ReadinessCheckinModal,
// LogProtocolModal, WearableSyncModal, ProtocolDetail, MuscleDetail —
// und alle sechs werden ausschliesslich von `module-recovery.jsx`
// benutzt, dem Rahmen, der nicht gewinnt. Der Name `MuscleDetailModal2`
// sagt es selbst: die „2" ist die Fassung fuer den zweiten Rahmen.
// Ausfuehrlich im Bericht.
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// `color-mix(in srgb, …)` -> `in oklch`, Escape schliesst, Felder
// bekommen `aria-label`.
//
// `[read]` Die Messung im HRV-Modal laeuft wirklich — 60 Schritte zu
// 50 ms, wie in der Vorlage (`setInterval(…, 50)`; sie zaehlt schneller
// als Echtzeit, damit man die Attrappe nicht 60 Sekunden lang
// ansehen muss). Das Ergebnis ist fest: 64 ms.
import * as React from 'react'
import { Card, Pill, Icon, Ring, LineChart, InEntwicklungKnopf } from '@lumeos/ui'

import {
  CHECKIN, HRV_BASELINE, MUSCLE_LABEL, MUSCLE_STATE, MUSCLE_SLUG_MAP,
  MODALITY_EVIDENZ, MODALITY_META, TODAY_MODALITIES,
  ACTIVE_PROTOCOL, NUTRITION_INPUT,
  calcHRVScore, calcMuscleRecovery, baseRecoveryCurve,
  type Protocol,
} from './motor'
// G-55: die dritte Ebene — welche Muskeln auf eine Flaeche fallen.
import { flaechenFuer, KARTE_ZU_RECOVERY } from './muskel-zuordnung'
// ══ G-430: NUR aus `hierarchie.ts`, nie aus `hierarchie-read.ts` ══
//
// `[cmd]` **Der erste Versuch importierte von `-read`** — und ergab
// **HTTP 500 auf jeder Route**, weil `createSessionClient` dort
// `next/headers` mitzieht. **`tsc` blieb gruen.** **Nur der Typ darf
// aus dem Leseweg kommen; hier kommt auch er aus der Rechnung.**
import {
  elternteilMitAufteilung, nameVon, LUECKEN,
  type HierarchieStand,
} from '../../../lib/koerper/hierarchie'
import { muskelnZurFlaeche } from './muskel-ebenen'
// G-432: welche Ebene der Hierarchie eine Flaeche zeigt.
import { EBENEN } from '../../../lib/koerper/ebenen'
// G-432/A5+A6: die Zugehoerigkeit und die vollstaendige Hierarchie.
import {
  baueBaum, wurzelVon, deckung, type Ast, type MuskelbaumStand,
} from '../../../lib/koerper/muskelbaum'
import type { ModalZustand } from './kontext'

// ── Der Rahmen ──────────────────────────────────────────────────
// [cmd] module-recovery-modals2.jsx:3-18.
function RMod({
  title, subtitle, eyebrow, accent, onClose, footer, children, width = 620,
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
      <div className="v2-modal" style={{ width, maxWidth: '92vw', maxHeight: '92vh' }}
           role="dialog" aria-modal="true"
           aria-label={typeof title === 'string' ? title : undefined}
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          {eyebrow && (
            <div style={{
              width: 26, height: 26, borderRadius: 6, flexShrink: 0,
              background: `color-mix(in oklch, ${accent ?? 'var(--acc-recov)'} 18%, transparent)`,
              border: `1px solid color-mix(in oklch, ${accent ?? 'var(--acc-recov)'} 35%, var(--border))`,
              color: accent ?? 'var(--acc-recov)', display: 'grid', placeItems: 'center',
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
  width: '100%', height: 30, background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 6, padding: '0 10px', fontSize: 12, color: 'var(--fg)',
}

// ── Die Verteilung ──────────────────────────────────────────────
export function RecoveryModale({ modal, onClose, hierarchie, muskelbaum }: {
  modal: ModalZustand | null
  onClose: () => void
  /** G-430: der Flaechenbaum — fuer „Per-muscle detail zeigt den Elternteil". */
  hierarchie?: HierarchieStand
  /** G-432/A6: alle 95 Muskelgruppen, fuer die vollstaendige Hierarchie. */
  muskelbaum?: MuskelbaumStand
}) {
  if (!modal) return null
  switch (modal.typ) {
    case 'hrvMeasure': return <HRVMeasureModal onClose={onClose} />
    case 'logModality': return <LogModalityModal onClose={onClose} />
    case 'muscle': return <MuscleDetailModal slug={modal.slug} onClose={onClose}
                                             hierarchie={hierarchie}
                                             muskelbaum={muskelbaum} />
    case 'protocol': return <ProtocolDetailModal p={modal.protokoll} onClose={onClose} />
    default: return null
  }
}

// ── HRV-Messung mit der Handykamera ─────────────────────────────
// [cmd] module-recovery-modals2.jsx:21-111.
function HRVMeasureModal({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = React.useState<'ready' | 'measuring' | 'done'>('ready')
  const [t, setT] = React.useState(0)

  React.useEffect(() => {
    if (phase !== 'measuring') return
    const id = setInterval(() => setT(x => {
      if (x >= 60) { clearInterval(id); setPhase('done'); return 60 }
      return x + 1
    }), 50)
    return () => clearInterval(id)
  }, [phase])

  const result = calcHRVScore(64)

  return (
    <RMod title="HRV measurement" subtitle="Phone camera PPG · 60 seconds · no wearable needed"
          eyebrow="camera" onClose={onClose}
          footer={phase === 'done'
            ? (
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Discard</button>
                {/* @abwesend recovery.hrv_readings
                    G-278: Der Messwert-Knopf begruendet sich damit. Kommt die Tabelle,
                    faellt `tools/abwesenheit-pruefen.mjs` und nennt
                    diese Zeile — statt dass der Grund still falsch
                    wird (A-62). Gemessen 2026-08-30: FEHLT. */}
                <InEntwicklungKnopf titel="Save · 64 ms" className="v2-btn v2-btn-primary"
                                    grund="Messwerte brauchen eine Tabelle recovery.hrv_readings — die gibt es nicht. HRV steht heute in `recovery.checkins.hrv_rmssd` (43 von 170 Tagen).">
                  <Icon name="check" className="v2-ic v2-ic-sm" />Save · 64 ms
                </InEntwicklungKnopf>
              </>
            )
            : (
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
                {phase === 'ready' && (
                  <button type="button" className="v2-btn v2-btn-primary"
                          onClick={() => { setT(0); setPhase('measuring') }}>
                    <Icon name="play" className="v2-ic v2-ic-sm" />Start measurement
                  </button>
                )}
              </>
            )}>

      {phase === 'ready' && (
        <>
          <div style={{ padding: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 14 }}>
            <div className="v2-eyebrow" style={{ marginBottom: 10 }}>Before you start</div>
            <div className="v2-col-gap" style={{ gap: 7 }}>
              {[
                'Sit still, breathe normally — do not control your breath',
                'Cover the rear camera lens and flash fully with your index finger',
                'Light pressure only · pressing hard distorts the signal',
                'Best taken on waking, before standing up',
              ].map(x => (
                <div key={x} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 11.5, color: 'var(--fg-muted)' }}>
                  <Icon name="check" className="v2-ic v2-ic-sm" style={{ color: 'var(--pos)', marginTop: 2, flexShrink: 0 }} />{x}
                </div>
              ))}
            </div>
          </div>
          <div className="v2-grid v2-g-cols-3" style={{ gap: 10 }}>
            <Card className="v2-card-tight" style={{ padding: 11 }}>
              <div className="v2-eyebrow">Duration</div>
              <div className="v2-num" style={{ fontSize: 15 }}>60 s</div>
            </Card>
            <Card className="v2-card-tight" style={{ padding: 11 }}>
              <div className="v2-eyebrow">Accuracy</div>
              <div className="v2-num" style={{ fontSize: 15 }}>r = 0.98</div>
              <div className="v2-dim" style={{ fontSize: 9.5 }}>vs chest strap</div>
            </Card>
            <Card className="v2-card-tight" style={{ padding: 11 }}>
              <div className="v2-eyebrow">Your baseline</div>
              <div className="v2-num" style={{ fontSize: 15 }}>{HRV_BASELINE.avg_rmssd} ms</div>
              <div className="v2-dim" style={{ fontSize: 9.5 }}>± {HRV_BASELINE.stddev_rmssd}</div>
            </Card>
          </div>
        </>
      )}

      {phase === 'measuring' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ position: 'relative', width: 150, height: 150, margin: '0 auto 18px' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--surface-2)" strokeWidth="7" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--acc-recov)" strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 44}
                      strokeDashoffset={2 * Math.PI * 44 * (1 - t / 60)} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span className="v2-num" style={{ fontSize: 32, fontWeight: 600 }}>{60 - t}</span>
              <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>seconds left</span>
            </div>
          </div>
          <div className="v2-eyebrow" style={{ marginBottom: 8 }}>PPG signal</div>
          <svg viewBox="0 0 300 50" style={{ width: '100%', height: 50, marginBottom: 12 }} aria-hidden>
            <path d={Array.from({ length: 60 }).map((_, i) => {
              const x = i * 5
              const beat = i % 7
              const y = beat === 0 ? 8 : beat === 1 ? 42 : beat === 2 ? 26 : 30 + Math.sin(i) * 2
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
            }).join(' ')} fill="none" stroke="var(--acc-recov)" strokeWidth="1.5" />
          </svg>
          <div className="v2-dim" style={{ fontSize: 11 }}>Detecting R-R intervals · keep your finger still</div>
        </div>
      )}

      {phase === 'done' && (
        <>
          <div className="v2-rec-ring-zeile" style={{ marginBottom: 14 }}>
            <Ring value={result.score} max={100} color="var(--pos)" label="hrv" size={104} stroke={8} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="v2-num" style={{ fontSize: 28, lineHeight: 1, marginBottom: 4 }}>
                64 <span className="v2-dim" style={{ fontSize: 13 }}>ms RMSSD</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--pos)', marginBottom: 6 }}>
                +{(64 - HRV_BASELINE.avg_rmssd).toFixed(1)} ms above your baseline
              </div>
              <div className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>
                z-score {result.z > 0 ? '+' : ''}{result.z} · signal quality 0.94
              </div>
            </div>
          </div>
          <div className="v2-dim v2-mono v2-rec-formel" style={{ marginBottom: 12 }}>
            R-R intervals captured: 61 · artifacts removed: 2<br />
            deviation = (64 − {HRV_BASELINE.avg_rmssd}) / {HRV_BASELINE.stddev_rmssd} = {result.z}<br />
            score = 70 + {result.z} × 15 = {result.score}
          </div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Note (optional)</div>
          <input placeholder="Travel, illness, late meal…" aria-label="Note" style={FELD} />
        </>
      )}
    </RMod>
  )
}

// ── Modalitaet erfassen ─────────────────────────────────────────
// [cmd] module-recovery-modals2.jsx:114-160.
function LogModalityModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = React.useState('sauna')
  const [rating, setRating] = React.useState(7)
  // C-124: kein „bonus after logging" mehr — es gibt keinen Bonus.
  const evidenz = MODALITY_EVIDENZ[type]

  return (
    <RMod title="Log recovery modality"
          subtitle="Wirkung laut Evidenzregister, ohne Punktbonus (C-124)"
          eyebrow="plus" onClose={onClose} width={640}
          footer={
            <>
              <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
              <InEntwicklungKnopf titel="Log" className="v2-btn v2-btn-primary"
                                  grund="`recovery.modality_log` gibt es (17 Spalten, 178 Zeilen live) und die Kachel liest sie. Was fehlt, ist der Schreibweg.">
                <Icon name="check" className="v2-ic v2-ic-sm" />Log
              </InEntwicklungKnopf>
            </>
          }>
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Modality</div>
      <div className="v2-rec-modalitaeten">
        {Object.keys(MODALITY_EVIDENZ).map(k => {
          const meta = MODALITY_META[k]
          const on = type === k
          return (
            <button key={k} type="button" onClick={() => setType(k)} aria-pressed={on}
                    style={{
                      padding: '10px 6px', borderRadius: 6, cursor: 'pointer',
                      background: on ? `color-mix(in oklch, ${meta.c} 12%, var(--surface))` : 'var(--surface)',
                      border: `1px solid ${on ? `color-mix(in oklch, ${meta.c} 38%, var(--border))` : 'var(--border)'}`,
                      color: on ? meta.c : 'var(--fg-muted)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    }}>
              <Icon name={meta.icon as never} className="v2-ic" />
              <span style={{ fontSize: 10.5, textAlign: 'center', lineHeight: 1.25 }}>{meta.label}</span>
            </button>
          )
        })}
      </div>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 10, marginBottom: 14 }}>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Date</div>
          <input type="date" defaultValue="2026-08-15" aria-label="Date"
                 style={{ ...FELD, fontFamily: 'var(--font-mono)' }} />
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Time</div>
          <input type="time" defaultValue="19:30" aria-label="Time"
                 style={{ ...FELD, fontFamily: 'var(--font-mono)' }} />
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Duration · min</div>
          <input type="number" defaultValue="20" aria-label="Duration in minutes"
                 style={{ ...FELD, fontFamily: 'var(--font-mono)' }} />
        </div>
      </div>
      <div className="v2-eyebrow" style={{ marginBottom: 5 }}>How did it feel · {rating}/10</div>
      <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <button key={i} type="button" onClick={() => setRating(i + 1)}
                  aria-label={`Rating ${i + 1} of 10`} aria-pressed={i + 1 === rating}
                  style={{
                    flex: 1, height: 26, borderRadius: 4, border: 0, cursor: 'pointer',
                    background: i < rating ? MODALITY_META[type].c : 'var(--surface-2)',
                    opacity: i < rating ? 0.4 + (i / 10) * 0.6 : 1,
                    color: i + 1 === rating ? 'var(--bg)' : 'var(--fg-dim)',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                  }}>{i + 1}</button>
        ))}
      </div>
      <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Detail</div>
      <input placeholder="Temperature, routine, location…" aria-label="Detail"
             style={{ ...FELD, marginBottom: 12 }} />
      {/* C-124: statt „Bonus after logging: +2.0" steht hier, was das
          Register ueber die gewaehlte Modalitaet sagt — Richtung,
          Endpunkt, Quelle. Kein Punktversprechen. */}
      <div style={{
        padding: 11,
        background: 'color-mix(in oklch, var(--acc-recov) 5%, var(--surface))',
        border: '1px solid color-mix(in oklch, var(--acc-recov) 24%, var(--border))',
        borderRadius: 6, fontSize: 11.5, color: 'var(--fg-muted)', lineHeight: 1.5,
      }}>
        {evidenz?.grad
          ? <>
              {MODALITY_META[type].label}: {evidenz.aussage}
              {' '}<span className="v2-mono v2-dim" style={{ fontSize: 10 }}>
                (Grad {evidenz.grad} · {evidenz.quelle})
              </span>. Morgen frueh wirst du nach der Nachwirkung gefragt.
            </>
          : <>
              {MODALITY_META[type].label} hat keinen Eintrag im
              Evidenzregister (crawl_025) — geloggt wird sie trotzdem,
              behauptet wird nichts. Morgen frueh wirst du nach der
              Nachwirkung gefragt.
            </>}
      </div>
    </RMod>
  )
}

// ── Muskeldetail ────────────────────────────────────────────────
// [cmd] module-recovery-modals2.jsx:163-235.
function MuscleDetailModal({ slug, onClose, hierarchie, muskelbaum }: {
  slug: string
  onClose: () => void
  hierarchie?: HierarchieStand
  muskelbaum?: MuskelbaumStand
}) {
  const st = MUSCLE_STATE[slug]
  if (!st) return null

  const c = calcMuscleRecovery({
    hours: st.hours, sets: st.sets, sleepQuality: CHECKIN.sleep_quality,
    proteinPct: NUTRITION_INPUT.proteinPct, caloriePct: NUTRITION_INPUT.caloriePct,
    soreness: st.soreness,
  })
  const col = c.value >= 80 ? 'var(--pos)' : c.value >= 50 ? 'var(--warn)' : 'var(--neg)'
  const trainingName = Object.entries(MUSCLE_SLUG_MAP).find(([, v]) => v === slug)?.[0]
  const curve = [0, 12, 24, 36, 48, 60, 72, 84, 96]
    .map(h => Math.round(baseRecoveryCurve(h) * c.vm * c.sm * c.nm * c.som))

  return (
    <RMod title={MUSCLE_LABEL[slug]}
          subtitle={`${st.lastSession} · ${st.hours}h ago · ${st.sets} sets`}
          eyebrow="recovery" onClose={onClose}
          footer={
            <>
              <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>
              <a href="/v2/training" className="v2-btn">
                <Icon name="training" className="v2-ic v2-ic-sm" />Open Training
              </a>
            </>
          }>
      {/* ══ G-430/A5: der Elternteil, aus der Datenbank ═══════════
          **Tom, 2026-09-08:** *„ein bodybuilder nutzt uebungen fuer
          einzelne muskeln sowie gebuendelt."* — und ausdruecklich:
          *„Per-muscle detail zeigt den Elternteil."*

          `[cmd]` **Die Kette kommt aus `public.koerperflaechen`**
          (C-468), nicht aus einer Liste im Code. */}
      {(() => {
        const baum = hierarchie?.flaechen ?? []
        if (baum.length === 0) return null
        const flaechen = flaechenFuer(slug)
        const zeilen = flaechen
          .map(code => ({ code, ...elternteilMitAufteilung(baum, code) }))
          .filter(z => z.eltern)
        if (zeilen.length === 0) return null
        return (
          <div style={{
            marginBottom: 14, padding: 10, borderRadius: 6,
            background: 'var(--bg-elev)', border: '1px solid var(--border)',
          }}>
            <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
              Parent · public.koerperflaechen
            </div>
            <div className="v2-col-gap" style={{ gap: 4 }}>
              {zeilen.map(z => {
                const eigen = baum.find(f => f.code === z.code)
                return (
                  <div key={z.code} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 11.5, flexWrap: 'wrap',
                  }}>
                    <Pill>{nameVon(z.eltern!)}</Pill>
                    <Icon name="chevron_right" className="v2-ic v2-ic-sm"
                          style={{ color: 'var(--fg-dim)' }} />
                    <span style={{ fontWeight: 600 }}>
                      {eigen ? nameVon(eigen) : z.code}
                    </span>
                    <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>
                      {z.code}
                    </span>
                    {/* `[read]` **Ehrlich benannt, wenn geerbt** —
                        die fuenf Flaechen aus der Aufteilung stehen
                        noch nicht in `koerperflaechen`. */}
                    {z.ueberBruecke && (
                      <span className="v2-dim" style={{ fontSize: 10 }}>
                        · geerbt — diese Fläche steht noch nicht in
                        {' '}public.koerperflaechen
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            {/* ══ G-430/A6: die Luecke, sichtbar statt erfunden ════
                `[read]` **Drei Muskeln haben keinen Pfad** — sie
                werden NICHT gezeichnet, und das steht hier, statt
                stillschweigend zu fehlen. */}
            {(() => {
              const offen = LUECKEN.filter(l =>
                zeilen.some(z => nameVon(z.eltern!) === l.elternteil
                  || z.eltern!.name_en === l.elternteil))
              if (offen.length === 0) return null
              return (
                <div className="v2-muted" style={{
                  fontSize: 10.5, marginTop: 8, paddingTop: 8,
                  borderTop: '1px solid var(--border)', lineHeight: 1.5,
                }}>
                  {offen.map(l => (
                    <div key={l.muskel}>
                      <strong>{l.muskel}</strong> gehört hierher, hat aber
                      keinen Pfad auf der Karte — {l.grund}
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        )
      })()}

      <div className="v2-rec-ring-zeile" style={{ marginBottom: 16 }}>
        <Ring value={c.value} max={100} color={col} label="recovered" size={104} stroke={8} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="v2-grid v2-g-cols-2" style={{ gap: 8 }}>
            {([
              ['Hours since', `${st.hours} h`],
              ['Sets logged', String(st.sets)],
              ['Soreness', `${st.soreness}/3`],
              ['Body-map slug', slug],
            ] as Array<[string, string]>).map(([l, v]) => (
              <div key={l} style={{ padding: 9, background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 5 }}>
                <div className="v2-eyebrow" style={{ marginBottom: 2 }}>{l}</div>
                <div className="v2-num" style={{ fontSize: 13 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ G-432/A5: die Zugehoerigkeit ═══════════════════════════
          **Tom:** *„die details zeigen die zugehoerigkeit."*

              Latissimus dorsi
              gehoert zu: Ruecken

          `[cmd]` **Die Wurzel kommt aus `training.muscle_groups`** —
          nicht aus einer Liste im Code. */}
      {(() => {
        const knoten = muskelbaum?.knoten ?? []
        if (knoten.length === 0) return null
        const zeilen = flaechenFuer(slug)
          .map(f => ({ f, name: EBENEN[f]?.name ?? null }))
          .filter(z => z.name)
          .map(z => ({ ...z, wurzel: wurzelVon(knoten, z.name!) }))
          .filter(z => z.wurzel)
        if (zeilen.length === 0) return null
        return (
          <div style={{
            marginBottom: 14, padding: 10, borderRadius: 6,
            background: 'var(--bg-elev)', border: '1px solid var(--border)',
          }}>
            <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
              Zugehörigkeit · training.muscle_groups
            </div>
            {/* `[read]` **Je Muskel eine eigene Zeile** — die erste
                Fassung setzte sie ohne Abstand aneinander, und am
                Schirm stand `BackTeres Major`. */}
            <div className="v2-col-gap" style={{ gap: 5 }}>
              {zeilen.map(z => (
                <div key={z.f} style={{
                  display: 'flex', alignItems: 'baseline', gap: 6,
                  fontSize: 12, flexWrap: 'wrap',
                }}>
                  <strong>{z.name}</strong>
                  <span className="v2-dim">gehört zu:</span>
                  <Pill>{z.wurzel}</Pill>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* G-55: die dritte Ebene. `[read]` Der Auftrag: „Der Klick auf
          eine Flaeche zeigt ihre Gruppen, der Klick auf eine Gruppe
          ihre Muskeln." Hier steht das Ende der Kette — welche der 96
          aus C-73 auf diese Flaeche fallen. */}
      {(() => {
        // `[cmd]` **G-430: ueber alle Flaechen des Kuerzels** — seit
        // der Aufteilung traegt `upper_back` drei, und die Muskeln
        // der zwei uebrigen waeren sonst verschwunden.
        const flaechen = flaechenFuer(slug)
        // `[read]` **Der Baum noch einmal** — er steckt im Block
        // darueber in einer eigenen IIFE.
        const baum = hierarchie?.flaechen ?? []
        // `[read]` **Ohne `Set`** — das Ziel dieses Pakets kann es
        // nicht iterieren (`TS2802`), dieselbe Falle wie in G-428.
        const muskeln = flaechen.flatMap(f => muskelnZurFlaeche(f))
          .filter((n, i, a) => a.indexOf(n) === i).sort()
        if (muskeln.length === 0) return null

        // ══ G-431/A4+A5: Gruppe aufschluesseln, Kind nur dieses ═════
        //
        // **Tom, 2026-09-08:** *„wenn gruppe, wird im modal
        // aufgeschluesselt, und wenn child, dann nur dieses."*
        //
        // `[cmd]` **Gemessen: die Liste kam aus `MUSKEL_ZU_FLAECHE`**
        // (`muskelnZurFlaeche`, Zeile 509) — eine flache Reihe von
        // Namen, ohne Hierarchie. **Das ist Toms Befund
        // *„werden die alten gelistet"*.**
        //
        // `[read]` **Die FARBE kommt weiter aus der Handliste** — sie
        // deckt 96 Namen, die Tabelle nur 60 (G-430). **Die LISTE
        // zeigt jetzt die Hierarchie:** je Flaeche ihre Muskeln, mit
        // dem Elternteil darueber.
        const istGruppe = flaechen.length > 1
        return (
          <>
            <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
              {istGruppe
                ? `Group · ${flaechen.length} muscles · ${muskeln.length} of 96 (C-73)`
                : `Muscle · ${muskeln.length} of 96 (C-73)`}
            </div>
            <Card className="v2-card-tight" style={{ padding: 12, marginBottom: 14 }}>
              {/* `[read]` **Je Flaeche ein Block** — bei einer einzigen
                  Flaeche ist das genau ein Block, also „nur dieses". */}
              <div className="v2-col-gap" style={{ gap: 10 }}>
                {flaechen.map(f => {
                  const eigene = muskelnZurFlaeche(f)
                  const eintrag = baum.find(x => x.code === f)
                  const wert = MUSCLE_STATE[KARTE_ZU_RECOVERY[f] ?? '']
                  return (
                    <div key={f}>
                      <div style={{
                        display: 'flex', alignItems: 'baseline', gap: 6,
                        marginBottom: 5, flexWrap: 'wrap',
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>
                          {eintrag ? nameVon(eintrag) : f}
                        </span>
                        <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{f}</span>
                        {/* ══ G-432: welche EBENE zeigt diese Flaeche? ══
                            **Tom:** *„quadrizeps ist eine muskelgruppe
                            und hat x muskeln."* `[cmd]` **Gemessen gegen
                            `training.muscle_groups`** — die Marke sagt,
                            ob hier eine Gruppe oder ein einzelner
                            Muskel steht. */}
                        {EBENEN[f] && EBENEN[f].name && (
                          <Pill variant={EBENEN[f].art === 'gruppe' ? 'acc' : undefined}
                                style={{ fontSize: 9 }}>
                            {EBENEN[f].art === 'gruppe' ? 'Gruppe' : 'Muskel'}
                          </Pill>
                        )}
                        {/* `[read]` **Je Kind sein eigener Wert** — das
                            ist der Unterschied zu einer blossen Liste. */}
                        {wert && (
                          <span className="v2-num" style={{ fontSize: 11, marginLeft: 'auto' }}>
                            {wert.soreness}/3 · {wert.hours} h
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {eigene.map(m => (
                          <Pill key={m} style={{ fontSize: 9.5 }}>{m}</Pill>
                        ))}
                      </div>
                      {/* ══ G-432/A3: der Elternteil und die Kinder ═══
                          `[read]` **Wo NICHT geteilt wird, steht hier
                          WARUM** — und welche Kinder `muscle_groups`
                          fuehrt, die die Vorlage nicht zeichnet. */}
                      {EBENEN[f]?.weg && EBENEN[f].weg.length > 1 && (
                        <div className="v2-dim v2-mono" style={{ fontSize: 9.5, marginTop: 4 }}>
                          {EBENEN[f].weg.join(' › ')}
                        </div>
                      )}
                      {EBENEN[f]?.kinder.length > 0 && (
                        <div className="v2-muted" style={{ fontSize: 10, marginTop: 4, lineHeight: 1.45 }}>
                          <strong>Nicht gezeichnet:</strong>{' '}
                          {EBENEN[f].kinder.join(', ')}
                          {EBENEN[f].grund ? ` — ${EBENEN[f].grund}` : ''}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
                {istGruppe
                  ? 'Diese Gruppe fasst mehrere Muskeln zusammen — je Muskel '
                    + 'sein eigener Wert. Die Flaeche traegt das Mittel, nicht '
                    + 'ihr Maximum.'
                  : 'Die Flaeche traegt das Mittel dieser Muskeln, nicht ihr '
                    + 'Maximum — sonst faerbte ein einzelner platter Muskel die '
                    + 'ganze Flaeche rot.'}
              </div>
            </Card>
          </>
        )
      })()}

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Calculation</div>
      <Card className="v2-card-tight" style={{ padding: 12, marginBottom: 14 }}>
        <div className="v2-col-gap" style={{ gap: 5 }}>
          {([
            ['Base curve', `${st.hours}h`, String(c.base), 'from the 0→96h recovery curve'],
            ['Volume modifier', `${st.sets} sets`, `× ${c.vm.toFixed(2)}`,
              st.sets <= 6 ? '≤6 sets speeds recovery' : st.sets <= 12 ? '6–12 sets neutral' : st.sets <= 18 ? '13–18 sets slows it' : 'high volume, slow'],
            ['Sleep modifier', `q ${CHECKIN.sleep_quality}/10`, `× ${c.sm.toFixed(2)}`,
              CHECKIN.sleep_quality >= 8.5 ? 'excellent sleep' : 'adequate sleep'],
            ['Nutrition modifier', 'P 79% · kcal 68%', `× ${c.nm.toFixed(2)}`, 'protein below 80% of target'],
            ['Soreness modifier', `${st.soreness}/3`, `× ${c.som.toFixed(2)}`,
              st.soreness === 0 ? 'no soreness reported' : st.soreness === 1 ? 'mild soreness' : 'significant soreness'],
          ] as Array<[string, string, string, string]>).map(([l, input, factor, note]) => {
            const wert = parseFloat(factor.replace('× ', ''))
            return (
              <div key={l} className="v2-rec-rechnung">
                <span style={{ color: 'var(--fg-muted)' }}>{l}</span>
                <span className="v2-mono v2-dim" style={{ fontSize: 10 }}>{input}</span>
                <span className="v2-num" style={{ color: factor.includes('×') && wert < 1 ? 'var(--warn)' : 'var(--fg)' }}>
                  {factor}
                </span>
                <span className="v2-dim" style={{ fontSize: 10 }}>{note}</span>
              </div>
            )
          })}
          <div className="v2-rec-rechnung" style={{ fontSize: 12, paddingTop: 6, borderTop: '1px solid var(--border-strong)' }}>
            <span style={{ fontWeight: 700 }}>Result</span>
            <span />
            <span className="v2-num" style={{ fontSize: 15, fontWeight: 600, color: col }}>{c.value}%</span>
            <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>
              {c.base} × {c.vm} × {c.sm} × {c.nm} × {c.som}
            </span>
          </div>
        </div>
      </Card>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Projected recovery for this muscle</div>
      <LineChart h={130} range={[0, 105]} xLabels={['0h', '', '24h', '', '48h', '', '72h', '', '96h']}
                 series={[
                   { data: curve, color: col },
                   { data: Array(9).fill(80), color: 'var(--pos)' },
                 ]} />
      <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 10.5, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
        <span className="v2-row-gap"><span className="v2-dot" style={{ background: col }} />with your current modifiers</span>
        <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--pos)' }} />80% ready threshold</span>
      </div>
      {trainingName && (
        <div style={{ marginTop: 12, padding: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11, color: 'var(--fg-muted)' }}>
          Mapped from Training module muscle group{' '}
          <span className="v2-mono" style={{ color: 'var(--fg)' }}>{trainingName}</span> via MUSCLE_SLUG_MAP.
        </div>
      )}

      {/* ══ G-432/A6: ALLE Gruppen und Kinder ══════════════════════
          **Tom:** *„per muscle detail bildet ALLE muskelgruppen und
          deren childs ab."* **Und:** *„Was nicht gezeichnet ist,
          steht als Luecke drin — nicht weggelassen."*

          `[cmd]` **95 Namen in vier Ebenen**, aus
          `training.muscle_groups`. `[cmd]` **21 davon zeichnet die
          Karte, 74 nicht** — gemessen 2026-09-12. */}
      {(() => {
        const knoten = muskelbaum?.knoten ?? []
        if (knoten.length === 0) return null
        // ══ G-432: „gezeichnet" kommt aus EBENEN, NICHT aus
        //    MUSKEL_ZU_FLAECHE ══════════════════════════════════════
        //
        // `[cmd]` **Die erste Fassung nahm `MUSKEL_ZU_FLAECHE`** — und
        // meldete *„95 von 95 gezeichnet, 0 Luecken"*. **Gemessen sind
        // es 21 von 95.**
        //
        // `[read]` **Der Grund:** jene Abbildung sagt, WELCHE Flaeche
        // der Wert eines Muskels faerbt — `Rhomboids` faellt auf
        // `trapezius`, obwohl er nicht gezeichnet ist. **Sie
        // beantwortet eine andere Frage.**
        //
        // `[read]` **`EBENEN` nennt je Flaeche den Muskel, den sie
        // WIRKLICH zeigt** — das ist die Deckung.
        const zeigt: Record<string, string> = {}
        for (const [code, e] of Object.entries(EBENEN)) {
          if (e.name) zeigt[e.name] = code
        }
        const baum = baueBaum(knoten, zeigt)
        const d = deckung(knoten, zeigt)
        const eigene = flaechenFuer(slug)

        function zeile(a: Ast): React.ReactNode {
          const hier = a.flaeche && eigene.includes(a.flaeche)
          const wert = a.flaeche ? MUSCLE_STATE[KARTE_ZU_RECOVERY[a.flaeche] ?? ''] : null
          return (
            <div key={`${a.name}-${a.ebene}`}>
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 6,
                paddingLeft: (a.ebene - 1) * 14, fontSize: 11.5,
                lineHeight: 1.7,
                color: a.flaeche ? 'var(--fg)' : 'var(--fg-dim)',
                fontWeight: hier ? 600 : 400,
              }}>
                <span>{a.name}</span>
                {/* `[read]` **Die Luecke wird BENANNT, nicht
                    weggelassen** — das ist der Kern von A6. */}
                {!a.flaeche && (
                  <span className="v2-dim" style={{ fontSize: 10 }}>
                    (nicht gezeichnet)
                  </span>
                )}
                {hier && <Pill variant="acc" style={{ fontSize: 9 }}>hier</Pill>}
                {wert && (
                  <span className="v2-num" style={{ fontSize: 10.5, marginLeft: 'auto' }}>
                    {wert.soreness}/3
                  </span>
                )}
              </div>
              {a.kinder.map(k => zeile(k))}
            </div>
          )
        }

        return (
          <>
            <div className="v2-eyebrow" style={{ marginTop: 16, marginBottom: 6 }}>
              Alle Muskelgruppen · {d.gezeichnet} von {d.gesamt} gezeichnet
              · {d.luecken} Lücken
            </div>
            <Card className="v2-card-tight" style={{ padding: 12 }}>
              <div className="v2-col-gap" style={{ gap: 8 }}>
                {baum.map(a => zeile(a))}
              </div>
            </Card>
          </>
        )
      })()}
    </RMod>
  )
}

// ── Protokolldetail ─────────────────────────────────────────────
// [cmd] module-recovery-modals2.jsx:238-266.
function ProtocolDetailModal({ p, onClose }: { p: Protocol; onClose: () => void }) {
  const isActive = p.id === ACTIVE_PROTOCOL.id
  return (
    <RMod title={p.name} subtitle={`${p.goal} · ${p.days} days`}
          eyebrow="calendar" onClose={onClose}
          footer={
            <>
              <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>
              {isActive
                ? (
                  <InEntwicklungKnopf titel="End protocol" className="v2-btn v2-btn-ghost"
                                      style={{ color: 'var(--neg)' }}>
                    End protocol
                  </InEntwicklungKnopf>
                )
                : (
                                      // @abwesend recovery.protocols
                    // G-278: Der Protokoll-Knopf begruendet sich damit.
                    // Kommt die Tabelle, faellt der Gate-Waechter und
                    // nennt diese Zeile (A-62). 2026-08-30: FEHLT.
                  <InEntwicklungKnopf titel="Activate protocol" className="v2-btn v2-btn-primary"
                                      grund="Protokolle brauchen eine Tabelle recovery.protocols — die gibt es nicht. Das Schema `recovery` steht (3 Tabellen), diese eine fehlt.">
                    <Icon name="play" className="v2-ic v2-ic-sm" />Activate protocol
                  </InEntwicklungKnopf>
                )}
            </>
          }>
      {isActive && (
        <div style={{
          padding: 11, background: 'color-mix(in oklch, var(--acc-recov) 7%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--acc-recov) 28%, var(--border))',
          borderRadius: 6, marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Pill variant="acc">active</Pill>
            <span style={{ fontSize: 12 }}>Day {ACTIVE_PROTOCOL.day} of {ACTIVE_PROTOCOL.of}</span>
            <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 10 }}>
              started {ACTIVE_PROTOCOL.started}
            </span>
          </div>
        </div>
      )}
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Daily activities</div>
      <div className="v2-col-gap" style={{ gap: 5, marginBottom: 14 }}>
        {p.activities.map(a => (
          <div key={a} style={{
            display: 'flex', gap: 9, padding: '9px 11px', background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 5, fontSize: 12,
          }}>
            <Icon name="check" className="v2-ic v2-ic-sm" style={{ color: 'var(--acc-recov)', marginTop: 1, flexShrink: 0 }} />{a}
          </div>
        ))}
      </div>
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>How it works</div>
      <div style={{
        padding: 11, background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 6, fontSize: 11.5, color: 'var(--fg-muted)', lineHeight: 1.6,
      }}>
        Activating this protocol writes its activities into your Today view as daily tasks — the same pattern nutrition meal plans use for ghost entries. Tasks can be confirmed, skipped, or edited. The protocol ends automatically after {p.days} days, or you can end it early.
      </div>
    </RMod>
  )
}
