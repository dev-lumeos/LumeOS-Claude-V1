'use client'

// Die sechs Modale des Rahmens.
//
// QUELLE: theme-v1/module-goals.jsx:659-901 — `GModal`, `GField`,
// `GInput` und sechs Modale (New goal, Goal detail, Log weight, Log
// measurements, Log photo, Measurement detail).
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript, `v2-`-Praefix,
// `color-mix(in srgb, …)` -> `in oklch`, Escape schliesst, Felder
// bekommen `aria-label`, Knoepfe ohne Ziel oeffnen `InEntwicklung`.
//
// `[cmd]` ALLES IST ATTRAPPE. Kein Modal schreibt.
//
// `[cmd]` **BERICHTIGT AM 2026-09-06 (G-354):** hier stand *„es gibt
// weder `goals.user_goals` noch `goals.body_measurements`"* (GO-07,
// GO-10). **Beide Tabellen gibt es** — `user_goals` mit 23 Spalten
// und 11 Zeilen, und `lib/goals/schreiben.ts` aendert sie bereits.
//
// `[read]` **Was fehlt, ist das ANLEGEN, nicht die Tabelle.** Ein
// Kommentar, der eine vorhandene Tabelle für abwesend erklärt, ist
// eine Falschaussage, die beim nächsten Auftrag als Grund zitiert
// wird.
import { tagIso } from '@lumeos/shared/datum'
import * as React from 'react'
import { Card, Pill, Icon, LineChart, InEntwicklungKnopf } from '@lumeos/ui'

// `[read]` **Die Serveraktion, nicht der Schreibweg selbst** — ein
// Wert-Import aus `lib/goals/fotosession-write` zoege den Server-Baum
// ueber die `'use client'`-Grenze (die Lehre aus G-412).
import { fotosessionAnlegenAktion } from './fotosession-aktionen'
// G-422: der Schreibweg fuer Koerpermessungen gibt es seit G-122 —
// nur der Aufrufer fehlte.
import { messungAnlegenAktion, messungAendernAktion } from './koerpermass-aktionen'
// G-606: der Aendern-Modus — Typ aus dem Leseweg, Router fuer das Neuladen.
import type { Koerpermessung, ZielFortschritt, Zielphase } from '../../../lib/goals/lesen'
import { useRouter } from 'next/navigation'
// `[read]` **Nur Typ und Konstanten** — `koerpermass-rechnung.ts`
// hat kein Server-I/O, aber die Regel bleibt: kein Wert-Import aus
// einem `*-write`-Modul.
import {
  BF_METHODEN, LEERE_MESSUNG, messungAlsEingabe, type KoerpermassEingabe,
} from '../../../lib/goals/koerpermass-rechnung'

// `[read]` **Nur der Typ** — der Leseweg bleibt auf dem Server.
import type { Strategie } from '../../../lib/goals/strategie-read'
// G-628: „Ziel setzen" ersetzt das alte Anlegemodal.
import { ZielSetzen } from './ziel-setzen'
import { MEASUREMENTS, daysToDeadline, type Ziel } from './daten'
import type { ModalZustand } from './kontext'
// `[cmd]` **G-577: der Schreibweg fuer die Umfaenge.** Die Felder und
// Grenzen kommen aus den CHECKs, nicht aus der Attrappe.
import { umfangAnlegenAktion } from './umfang-aktionen'
import {
  UMFANGSSTELLEN, UMFANG_QUELLEN, LEERE_UMFANGSEINGABE,
  type UmfangEingabe, type Umfangsfeld,
} from '../../../lib/goals/umfang-rechnung'

// G-600: `heuteISO` ist in `tagIso` (`@lumeos/shared/datum`) aufgegangen.

/**
 * Jetzt als `HH:MM`, in Ortszeit — G-577.
 *
 * `[cmd]` **`measurement_time` ist `NOT NULL` und Teil des
 * Eindeutigkeitsschluessels** `(user_id, measurement_date,
 * measurement_time)`. `[read]` **Vorbelegt, weil sie Pflicht ist** —
 * ein leeres Pflichtfeld erzeugt einen Fehler, den der Nutzer nicht
 * verursacht hat. **Er kann sie aendern**, und genau das braucht
 * er fuer eine zweite Messung am selben Tag.
 */
function jetztHHMM(): string {
  const d = new Date()
  const z = (n: number) => String(n).padStart(2, '0')
  return `${z(d.getHours())}:${z(d.getMinutes())}`
}

// ── Der Rahmen ──────────────────────────────────────────────────
// [cmd] module-goals.jsx:659-681.
export function GModal({
  title, subtitle, eyebrow, accent, onClose, footer, children, width = 580,
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
              background: `color-mix(in oklch, ${accent ?? 'var(--acc-goals)'} 18%, transparent)`,
              border: `1px solid color-mix(in oklch, ${accent ?? 'var(--acc-goals)'} 35%, transparent)`,
              color: accent ?? 'var(--acc-goals)', display: 'grid', placeItems: 'center',
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

// [cmd] module-goals.jsx:683-692.
export function GField({ label, sub, fehler, children }: {
  label: React.ReactNode; sub?: React.ReactNode
  /** G-606: der Feldfehler steht AM Feld, nicht in einer Sammelliste. */
  fehler?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5, gap: 8 }}>
        <label className="v2-eyebrow">{label}</label>
        {sub && <span className="v2-dim" style={{ fontSize: 10 }}>{sub}</span>}
      </div>
      {children}
      {fehler && (
        <div role="alert" data-feldfehler style={{ marginTop: 4, fontSize: 11, color: 'var(--neg)' }}>
          {fehler}
        </div>
      )}
    </div>
  )
}

const FELD: React.CSSProperties = {
  width: '100%', height: 30, background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 6, padding: '0 10px', fontSize: 12, outline: 'none', color: 'var(--fg)',
}

export function GInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...FELD, ...(props.style ?? {}) }} />
}

// ── Die Verteilung ──────────────────────────────────────────────
export function GoalsModale({
  modal, onClose, strategien = [], erfahrung = null,
  ziele = [], phasen = [], messungen = [], tdee = null, heute = tagIso(),
}: {
  modal: ModalZustand | null
  onClose: () => void
  /**
   * `[cmd]` **G-554/A1: der Katalog aus `goal_strategies`** — er
   * wird serverseitig geladen (`page.tsx`) und durchgereicht, weil
   * ein Wert-Import aus `strategie-read.ts` `next/headers` ueber
   * die `'use client'`-Grenze zoege (A-30).
   */
  strategien?: Strategie[]
  /** G-610: `profiles.experience_level` — sperrt Varianten ueber dem Grad. */
  erfahrung?: string | null
  /** G-628: was „Ziel setzen" braucht — Steuerung, Messung, TDEE, Stichtag. */
  ziele?: ZielFortschritt[]
  phasen?: Zielphase[]
  messungen?: Koerpermessung[]
  tdee?: number | null
  heute?: string
}) {
  if (!modal) return null
  switch (modal.typ) {
    // G-628: „Ziel setzen" ersetzt „New goal" vollstaendig.
    case 'newGoal': return (
      <ZielSetzen onClose={onClose} strategien={strategien} erfahrung={erfahrung}
                  ziele={ziele} phasen={phasen} messungen={messungen} tdee={tdee}
                  heute={heute} start={modal.start} />
    )
    case 'goalDet': return <GoalDetailModal g={modal.ziel} onClose={onClose} />
    case 'logWeight': return <LogWeightModal onClose={onClose} messung={modal.messung} />
    case 'logMeasure': return <LogMeasureModal onClose={onClose} />
    case 'logPhoto': return <LogPhotoModal onClose={onClose} />
    case 'measureDet': return <MeasureDetailModal m={modal.mass} onClose={onClose} />
    default: return null
  }
}

// ── NEW GOAL ────────────────────────────────────────────────────
// `[cmd]` **G-628: hier stand `NewGoalModal`** — sechs Typ-Knoepfe,
// getippter Istwert, Einheit als Freitext, Prioritaet, Attrappe
// „Linked modules". **Ersetzt durch „Ziel setzen" (`ziel-setzen.tsx`)**
// nach der Vorlage `docs/spezifikation/goals-ziel-setzen/` (Tom 08.10.).

// ── GOAL DETAIL ─────────────────────────────────────────────────
// [cmd] module-goals.jsx:746-779.
function GoalDetailModal({ g, onClose }: { g: Ziel; onClose: () => void }) {
  const paceColor = g.pace === 'ahead' ? 'var(--pos)'
    : g.pace === 'on-track' ? 'var(--acc-recov)' : 'var(--warn)'
  return (
    <GModal title={g.title} subtitle={`${g.type} · started ${g.started}`}
            eyebrow={g.icon as never} accent={g.color} onClose={onClose} width={680}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>
                <InEntwicklungKnopf titel="Edit" className="v2-btn">
                  <Icon name="edit" className="v2-ic v2-ic-sm" />Edit
                </InEntwicklungKnopf>
                <InEntwicklungKnopf titel="Mark complete" className="v2-btn v2-btn-primary">
                  Mark complete
                </InEntwicklungKnopf>
              </>
            }>
      <div className="v2-goals-detail-kopf">
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Progress</div>
          <div className="v2-num" style={{ fontSize: 18, color: g.color }}>{(g.progress * 100).toFixed(0)}%</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Pace</div>
          <Pill style={{ borderColor: `color-mix(in oklch, ${paceColor} 35%, var(--border))`, color: paceColor }}>
            {g.pace}
          </Pill>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Deadline</div>
          <div className="v2-num" style={{ fontSize: 13 }}>{g.deadline}</div>
          <div className="v2-dim" style={{ fontSize: 10 }}>{daysToDeadline(g.deadline)}</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Linked</div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 4 }}>
            {g.linkedModules.map(m => <Pill key={m}>{m}</Pill>)}
          </div>
        </Card>
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Plan vs actual</div>
      <Card className="v2-card-tight" style={{ padding: 12, marginBottom: 14 }}>
        {g.history && g.history.length > 0
          ? <GoalProgressChart g={g} />
          : <div className="v2-dim" style={{ fontSize: 12, textAlign: 'center', padding: 20 }}>No data points logged yet.</div>}
      </Card>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Connected data sources</div>
      <div className="v2-col-gap" style={{ gap: 6, marginBottom: 14 }}>
        {g.linkedModules.includes('training') && <ContextRow icon="training" label="Training compliance" value="22 / 24 sessions · last 30d" />}
        {g.linkedModules.includes('nutrition') && <ContextRow icon="nutrition" label="Calorie balance" value="−420 kcal/day avg · 30d" />}
        {g.linkedModules.includes('recovery') && <ContextRow icon="recovery" label="Recovery score avg" value="78 / 100" />}
        {g.linkedModules.includes('supplements') && <ContextRow icon="supplements" label="Adherence" value="94% · 30d" />}
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Notes</div>
      <div style={{ padding: 12, background: 'var(--surface)', borderRadius: 6, fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
        {g.note}
      </div>
    </GModal>
  )
}

// [cmd] module-goals.jsx:781-787.
function ContextRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5,
    }}>
      <Icon name={icon as never} className="v2-ic" style={{ color: 'var(--fg-muted)' }} />
      <span style={{ fontSize: 12, flex: 1, minWidth: 0 }}>{label}</span>
      <span className="v2-num" style={{ fontSize: 11.5 }}>{value}</span>
    </div>
  )
}

// [cmd] module-goals.jsx:789-825.
function GoalProgressChart({ g }: { g: Ziel }) {
  const isWeight = g.target.weight != null
  const isTime = g.target.time != null
  let data: number[]
  let target: number
  let start: number
  if (isWeight) {
    data = g.history.map(h => h.weight!)
    target = g.target.weight!
    start = g.start.weight!
  } else if (isTime) {
    data = g.history.map(h => h.time! / 60)
    target = g.target.time! / 60
    start = g.start.time! / 60
  } else {
    data = g.history.map(h => h.count!)
    target = g.target.count!
    start = g.start.count!
  }
  const ideal = Array.from({ length: data.length }, (_, i) =>
    start + (target - start) * (i / (data.length - 1)))
  return (
    <>
      <LineChart h={180}
                 range={[Math.min(target, ...data) * 0.97, Math.max(start, ...data) * 1.03]}
                 series={[
                   { data: ideal, color: 'var(--fg-dim)' },
                   { data, color: g.color },
                 ]}
                 xLabels={g.history.map(h => h.d)} />
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
        <span className="v2-row-gap"><span className="v2-dot" style={{ background: 'var(--fg-dim)' }} />ideal path</span>
        <span className="v2-row-gap"><span className="v2-dot" style={{ background: g.color }} />actual</span>
      </div>
    </>
  )
}

// ── LOG WEIGHT ──────────────────────────────────────────────────
/** G-606: die Felder, die im Formular einen eigenen Fehlerplatz haben. */
const MESSFELDER = ['measurement_date', 'measurement_time', 'weight_kg', 'body_fat_pct', 'bf_method']

// [cmd] module-goals.jsx:827-847.
//
// ══ G-422: gebaut und nicht verdrahtet ═══════════════════════════
//
// `[cmd]` **Hier stand ein `InEntwicklungKnopf` mit diesem Grund:**
// *,,`goals.body_measurements` gibt es … Was fehlt, ist der
// Schreibweg — eine eigene Messung eintragen kann die Oberflaeche
// noch nicht."*
//
// `[cmd]` **Der Grund war FALSCH.** `messungAnlegenAktion` gibt es
// seit G-122 (`koerpermass-aktionen.ts:31`), samt Pruefung
// (`koerpermass-rechnung.ts`) und Schreibweg
// (`koerpermass-write.ts`). `[cmd]` **Gemessen 2026-09-28: null
// Aufrufer im ganzen `apps/web/src`** — die Funktion war fertig und
// niemand rief sie.
//
// `[read]` **Ein Vermerk mit falschem Grund ist schlimmer als eine
// fehlende Kachel** — er verhindert, dass jemand nachsieht. **Hier
// hat er genau das getan: das Fehlende lag daneben.**
//
// `[cmd]` **Die Quellenliste kommt aus `BF_METHODEN`**, also aus
// `body_measurements_method_ck` — **vorher standen dort
// `Manual / Smart scale / DXA`, und zwei davon kennt der CHECK
// nicht.**
//
// ══ G-606: DASSELBE MODAL AENDERT ═════════════════════════════════
//
// `[cmd]` **`messungAendernAktion` hatte keinen Aufrufer** — die letzte
// der sechs Aktionen aus G-588. `[read]` **Kein zweites Modal:** mit
// `messung` oeffnet dieses vorbefuellt und speichert ueber
// `messungAendernAktion`. `[cmd]` **Die Groesse rechnet die Oberflaeche
// NICHT** — wird das Datum geaendert, holt der Trigger
// `fill_body_measurement_snapshot` die Profilgroesse neu (gemessen
// 2026-10-05).
function LogWeightModal({ onClose, messung }: {
  onClose: () => void
  /** G-606: gesetzt = Aendern-Modus. */
  messung?: Koerpermessung
}) {
  const router = useRouter()
  const aendern = Boolean(messung)
  const [eingabe, setEingabe] = React.useState<KoerpermassEingabe>(() => messung
    ? messungAlsEingabe(messung)
    : {
      ...LEERE_MESSUNG,
      measurement_date: tagIso(),
      bf_method: 'manual',
    })
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const [felder, setFelder] = React.useState<Array<{ feld: string; text: string }>>([])
  const [fertig, setFertig] = React.useState(false)

  const setz = (k: keyof KoerpermassEingabe, v: string) =>
    setEingabe(e => ({ ...e, [k]: v }))
  const feldFehler = (f: string) => felder.find(x => x.feld === f)?.text

  async function speichern() {
    setLaeuft(true)
    setFehler(null)
    setFelder([])
    const r = messung
      ? await messungAendernAktion(messung.id, eingabe)
      : await messungAnlegenAktion(eingabe)
    setLaeuft(false)
    if (r.ok) {
      setFertig(true)
      // G-606: die Tabelle liest serverseitig — neu holen.
      router.refresh()
      // `[read]` **Erst schliessen, wenn die Zeile da ist** — sonst
      // sieht ein Fehlschlag aus wie Erfolg (dasselbe wie im
      // Fotomodal).
      setTimeout(onClose, 900)
    } else {
      setFelder(r.felder)
      if (r.felder.length === 0) setFehler(r.text)
    }
  }

  return (
    <GModal title={aendern ? 'Edit measurement' : 'Log weight'}
            subtitle={aendern ? `Messung vom ${messung?.measurement_date} ändern`
              : 'Daily — morning fasted preferred'}
            eyebrow={aendern ? 'edit' : 'plus'} onClose={onClose} width={520}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
                <button type="button" className="v2-btn v2-btn-primary"
                        data-messung-speichern
                        disabled={laeuft || !eingabe.weight_kg.trim()}
                        onClick={() => { void speichern() }}>
                  <Icon name="check" className="v2-ic v2-ic-sm" />
                  {laeuft ? 'Speichert …' : aendern ? 'Save' : 'Log'}
                </button>
              </>
            }>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
        <GField label="Date" fehler={feldFehler('measurement_date')}>
          <GInput type="date" aria-label="Date" data-messfeld="datum"
                  value={eingabe.measurement_date}
                  onChange={e => setz('measurement_date', e.target.value)} />
        </GField>
        <GField label="Time" fehler={feldFehler('measurement_time')}>
          <GInput type="time" aria-label="Time" data-messfeld="zeit"
                  value={eingabe.measurement_time}
                  onChange={e => setz('measurement_time', e.target.value)} />
        </GField>
      </div>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
        <GField label="Weight" sub="kg" fehler={feldFehler('weight_kg')}>
          <GInput type="number" aria-label="Weight" data-messfeld="gewicht"
                  value={eingabe.weight_kg}
                  onChange={e => setz('weight_kg', e.target.value)} />
        </GField>
        <GField label="Body fat (optional)" sub="%" fehler={feldFehler('body_fat_pct')}>
          <GInput type="number" aria-label="Body fat" data-messfeld="koerperfett"
                  value={eingabe.body_fat_pct}
                  onChange={e => setz('body_fat_pct', e.target.value)} />
        </GField>
      </div>
      {/* `[cmd]` **Die zehn Werte aus dem CHECK**, nicht drei
          erfundene. */}
      <GField label="Source" sub="aus body_measurements_method_ck" fehler={feldFehler('bf_method')}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {BF_METHODEN.map(s => (
            <button key={s} type="button" data-messfeld-quelle={s}
                    className={`v2-btn${eingabe.bf_method === s ? ' v2-btn-primary' : ''}`}
                    onClick={() => setz('bf_method', s)}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </GField>
      <GField label="Note (optional)">
        <GInput aria-label="Note" data-messfeld="notiz" value={eingabe.notes}
                placeholder="Hydration, cycle phase, salt the night before…"
                onChange={e => setz('notes', e.target.value)} />
      </GField>

      {/* `[cmd]` **G-606: hier stand eine Sammelliste** (`feld: text`)
          unter dem Formular — der Kommentar sagte *„am Feld"*, der Code
          tat es nicht, und `feldFehler()` hatte keinen Aufrufer. **Jetzt
          steht jeder Fehler an seinem Feld** (`GField fehler=`). Nur
          ein Fehler OHNE bekanntes Feld bleibt hier. */}
      {felder.filter(f => !MESSFELDER.includes(f.feld)).map(f => (
        <div key={f.feld} role="alert" style={{ marginTop: 10, fontSize: 11.5, color: 'var(--neg)' }}>
          {f.text}
        </div>
      ))}
      {fehler && (
        <div className="v2-muted" style={{ marginTop: 10, fontSize: 11.5 }}>{fehler}</div>
      )}
      {fertig && (
        <div style={{
          marginTop: 10, padding: '8px 10px', borderRadius: 5, fontSize: 11.5,
          background: 'color-mix(in oklch, var(--pos) 8%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--pos) 30%, var(--border))',
        }}>
          Messung gespeichert.
        </div>
      )}
    </GModal>
  )
}

// ── LOG MEASUREMENTS ────────────────────────────────────────────
// [cmd] module-goals.jsx:849-862.
// ══ G-577: DER VERMERK WAR FALSCH, UND ZWEIFACH ══════════════════
//
// `[cmd]` **Hier stand ein `InEntwicklungKnopf` mit diesem Grund:**
// *„`goals.body_measurements` gibt es (17 Spalten, 362 Zeilen live)
// und traegt auch die Umfaenge. Was fehlt, ist der Schreibweg."*
//
// `[cmd]` **Beide Haelften sind falsch.** `body_measurements` traegt
// Gewicht und Koerperfett; **die Umfaenge liegen in
// `goals.body_circumferences`** (22 Spalten, eigener
// Eindeutigkeitsschluessel). `[cmd]` **Und der Schreibweg existiert
// seit G-535:** `goals.body_circumference_write`, 18 Parameter,
// `SECURITY INVOKER`, geprueft — **mit null Aufrufern in `apps/` und
// `packages/`.**
//
// `[read]` **Ein Vermerk mit falschem Grund ist schlimmer als eine
// fehlende Kachel** — er verhindert, dass jemand nachsieht. **Hier
// hat er zwei Monate lang genau das getan** (G-571).
//
// `[cmd]` **Die Felder kommen aus `UMFANGSSTELLEN`**, also aus dem
// CHECK — **vorher standen dort die zwoelf Attrappenzeilen mit
// EINEM Unterarm** (`daten.ts:150`), **die Tabelle fuehrt dreizehn
// Stellen mit zweien.**
function LogMeasureModal({ onClose }: { onClose: () => void }) {
  const [eingabe, setEingabe] = React.useState<UmfangEingabe>({
    ...LEERE_UMFANGSEINGABE,
    measurement_date: tagIso(),
    measurement_time: jetztHHMM(),
  })
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const [felder, setFelder] = React.useState<Array<{ feld: string; text: string }>>([])
  const [fertig, setFertig] = React.useState(false)

  const feldFehler = (f: string) => felder.find(x => x.feld === f)?.text
  const setzWert = (feld: Umfangsfeld, v: string) =>
    setEingabe(e => ({ ...e, werte: { ...e.werte, [feld]: v } }))

  // `[read]` **Mindestens eine Stelle** — dieselbe Regel wie
  // `body_circumferences_at_least_one_ck`, hier schon am Knopf.
  const hatWert = UMFANGSSTELLEN.some(s => (eingabe.werte[s.feld] ?? '').trim())

  async function speichern() {
    setLaeuft(true)
    setFehler(null)
    setFelder([])
    const r = await umfangAnlegenAktion(eingabe)
    setLaeuft(false)
    if (r.ok) {
      setFertig(true)
      // `[read]` **Erst schliessen, wenn die Zeile da ist** — sonst
      // sieht ein Fehlschlag aus wie Erfolg (wie im Gewichtsmodal).
      setTimeout(onClose, 900)
    } else {
      setFelder(r.felder)
      if (r.felder.length === 0) setFehler(r.text)
    }
  }

  return (
    <GModal title="Update measurements" subtitle="All in cm · fill what you have"
            eyebrow="edit" onClose={onClose} width={620}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
                <button type="button" className="v2-btn v2-btn-primary"
                        data-umfang-speichern
                        disabled={laeuft || !hatWert}
                        onClick={() => { void speichern() }}>
                  <Icon name="check" className="v2-ic v2-ic-sm" />
                  {laeuft ? 'Speichert …' : 'Save measurements'}
                </button>
              </>
            }>
      {/* `[cmd]` **A4: Datum UND Uhrzeit sind Pflicht** — beide sind
          `NOT NULL` und bilden mit `user_id` den
          Eindeutigkeitsschluessel. `[read]` **Zwei Messungen am
          selben Tag sind damit erlaubt**, zur selben Minute nicht. */}
      <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
        <GField label="Date" sub={feldFehler('measurement_date') ?? 'Ortstag'}>
          <GInput type="date" aria-label="Date" data-umfangfeld="datum"
                  value={eingabe.measurement_date}
                  onChange={e => setEingabe(x => ({ ...x, measurement_date: e.target.value }))} />
        </GField>
        <GField label="Time" sub={feldFehler('measurement_time') ?? undefined}>
          <GInput type="time" aria-label="Time" data-umfangfeld="zeit"
                  value={eingabe.measurement_time}
                  onChange={e => setEingabe(x => ({ ...x, measurement_time: e.target.value }))} />
        </GField>
      </div>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 10 }}>
        {UMFANGSSTELLEN.map(s => (
          <GField key={s.feld} label={s.label}
                  sub={feldFehler(s.feld) ?? `${s.min}–${s.max} cm`}>
            <GInput type="number" aria-label={s.label} data-umfangstelle={s.feld}
                    value={eingabe.werte[s.feld] ?? ''}
                    onChange={e => setzWert(s.feld, e.target.value)} />
          </GField>
        ))}
      </div>
      {/* `[cmd]` **Die vier Werte aus `body_circumferences_source_ck`**,
          nicht die zehn aus `BF_METHODEN` — das ist ein anderer CHECK
          an einer anderen Tabelle. */}
      <GField label="Source" sub="aus body_circumferences_source_ck">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {UMFANG_QUELLEN.map(q => (
            <button key={q} type="button" data-umfangquelle={q}
                    className={`v2-btn${eingabe.measurement_source === q ? ' v2-btn-primary' : ''}`}
                    onClick={() => setEingabe(x => ({ ...x, measurement_source: q }))}>
              {q}
            </button>
          ))}
        </div>
      </GField>
      <GField label="Note (optional)">
        <GInput aria-label="Note" data-umfangfeld="notiz" value={eingabe.notes}
                placeholder="Time of day, pump state, etc."
                onChange={e => setEingabe(x => ({ ...x, notes: e.target.value }))} />
      </GField>

      {/* `[read]` **Feldfehler stehen AM Feld** (oben im `sub`) —
          hier bleibt, was keinem Feld zuzuordnen ist. */}
      {(feldFehler('werte') || fehler) && (
        <div data-umfang-fehler style={{
          marginTop: 10, padding: '8px 10px', borderRadius: 5, fontSize: 11.5,
          lineHeight: 1.5, color: 'var(--neg)',
          background: 'color-mix(in oklch, var(--neg) 8%, var(--surface))',
        }}>
          {feldFehler('werte') ?? fehler}
        </div>
      )}
      {fertig && (
        <div data-umfang-fertig style={{
          marginTop: 10, fontSize: 11.5, color: 'var(--pos)',
        }}>
          Gespeichert.
        </div>
      )}
    </GModal>
  )
}

// ── LOG PHOTO ───────────────────────────────────────────────────
// [cmd] module-goals.jsx:864-884.
//
// ══ G-421: DER VERMERK WAR UEBERHOLT ═══════════════════════════════
//
// `[cmd]` **Hier stand:** *„Fotosessions brauchen eine Dateiablage —
// der Umsetzungsplan fuehrt sie unter ,Was nicht gebaut wird'."*
//
// `[cmd]` **C-463 hat beides gebaut**, gemessen 2026-09-11:
// `goals.progress_photos` (13 Spalten) und der private Bucket
// `goals-progress-photos` mit vier Owner-Policies.
//
// `[read]` **Ein Vermerk mit falschem Grund ist schlimmer als eine
// fehlende Kachel** — er verhindert, dass jemand nachsieht.
//
// `[read]` **Die drei Ansichten sind Vierteldrehungen** —
// `pose_type = 'quarter_turns'`, nicht `mandatory_8`: das sind die
// acht Pflichtposen, und drei davon sind keine acht.
function LogPhotoModal({ onClose }: { onClose: () => void }) {
  const [dateien, setDateien] = React.useState<Record<string, File>>({})
  const [datum, setDatum] = React.useState(
    () => tagIso())
  const [notiz, setNotiz] = React.useState('')
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const [fertig, setFertig] = React.useState<number | null>(null)

  const gewaehlt = Object.keys(dateien).length

  async function speichern() {
    setLaeuft(true)
    setFehler(null)
    const daten = new FormData()
    daten.set('session_date', datum)
    // `[cmd]` **Der Wert stammt aus dem CHECK** (`POSE_ARTEN`), nicht
    // aus dem Kopf.
    daten.set('pose_type', 'quarter_turns')
    daten.set('notes', notiz)
    for (const [name, datei] of Object.entries(dateien)) {
      daten.append(`pose-${name}`, datei)
    }
    const r = await fotosessionAnlegenAktion(daten)
    setLaeuft(false)
    if (r.ok) {
      setFertig(r.zeilen.length)
      // `[read]` **Erst schliessen, wenn die Zeilen da sind** — sonst
      // sieht ein Fehlschlag aus wie Erfolg.
      setTimeout(onClose, 900)
    } else {
      setFehler(r.felder.length > 0
        ? r.felder.map(f => `${f.feld}: ${f.text}`).join(' · ')
        : r.text)
    }
  }

  return (
    <GModal title="New photo session" subtitle="Front · side · back · same lighting"
            eyebrow="camera" onClose={onClose}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
                <button type="button" className="v2-btn v2-btn-primary"
                        disabled={laeuft || gewaehlt === 0}
                        onClick={() => { void speichern() }}>
                  <Icon name="download" className="v2-ic v2-ic-sm" />
                  {laeuft ? 'Speichert …' : 'Save session'}
                </button>
              </>
            }>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 8, marginBottom: 14 }}>
        {['Front', 'Side', 'Back'].map(p => (
          <label key={p} className="v2-placeholder-img"
                 style={{
                   aspectRatio: '9/16', borderRadius: 6, cursor: 'pointer',
                   border: `1px dashed ${dateien[p] ? 'var(--pos)' : 'var(--border)'}`,
                   display: 'grid', placeItems: 'center',
                 }}>
            <input type="file" accept="image/*" aria-label={p}
                   style={{ display: 'none' }}
                   onChange={e => {
                     const f = e.target.files?.[0]
                     if (f) setDateien(d => ({ ...d, [p]: f }))
                   }} />
            <div style={{ fontSize: 10, textAlign: 'center', color: 'var(--fg-dim)' }}>
              {p}<br />{dateien[p] ? '✓ gewählt' : 'tap to upload'}
            </div>
          </label>
        ))}
      </div>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 10 }}>
        <GField label="Date">
          <GInput type="date" aria-label="Date" value={datum}
                  onChange={e => setDatum(e.target.value)} />
        </GField>
        {/* `[read]` **Gewicht und Koerperfett haben in
            `progress_photos` KEINE Spalte** — sie gehoeren zu
            `body_measurements`. **Der Entwurf zeigt sie, dieser
            Schreibweg traegt sie nicht**, und das steht hier statt
            zwei Felder anzubieten, die nichts tun. */}
        <GField label="Note (optional)" sub="landet in notes">
          <GInput aria-label="Note" value={notiz}
                  onChange={e => setNotiz(e.target.value)}
                  placeholder="Time of day, pump state, etc." />
        </GField>
      </div>
      {fehler && (
        <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--neg)' }}>
          Nicht gespeichert: {fehler}
        </div>
      )}
      {fertig !== null && (
        <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--pos)' }}>
          {fertig} {fertig === 1 ? 'Foto' : 'Fotos'} in goals.progress_photos gespeichert.
        </div>
      )}
      <div style={{ padding: 10, background: 'var(--surface)', borderRadius: 6, fontSize: 11.5, color: 'var(--fg-muted)', lineHeight: 1.55 }}>
        <Icon name="check" className="v2-ic v2-ic-sm" style={{ display: 'inline', color: 'var(--pos)', marginRight: 4 }} />
        Photos are stored encrypted, never shared with coaches unless you explicitly add them to a goal share.
      </div>
    </GModal>
  )
}

// ── MEASUREMENT DETAIL ──────────────────────────────────────────
// [cmd] module-goals.jsx:886-901.
function MeasureDetailModal({ m, onClose }: {
  m: typeof MEASUREMENTS[number]; onClose: () => void
}) {
  return (
    <GModal title={m.label} subtitle={`Current ${m.current} cm · 6 entries`}
            eyebrow="trend_up" onClose={onClose} width={580}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>
                <InEntwicklungKnopf titel="Update value" className="v2-btn">
                  <Icon name="edit" className="v2-ic v2-ic-sm" />Update value
                </InEntwicklungKnopf>
              </>
            }>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 10, marginBottom: 14 }}>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Current</div>
          <div className="v2-num" style={{ fontSize: 18 }}>{m.current} cm</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">6 entries ago</div>
          <div className="v2-num" style={{ fontSize: 18 }}>{m.history[0]} cm</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Δ</div>
          <div className="v2-num" style={{
            fontSize: 18, color: m.current > m.history[0] ? 'var(--pos)' : 'var(--warn)',
          }}>
            {m.current > m.history[0] ? '+' : ''}{(m.current - m.history[0]).toFixed(1)} cm
          </div>
        </Card>
      </div>
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Trend</div>
      <Card className="v2-card-tight" style={{ padding: 12 }}>
        <LineChart h={140} range={[Math.min(...m.history) - 0.5, Math.max(...m.history) + 0.5]}
                   series={[{ data: m.history, color: 'var(--acc-goals)' }]}
                   xLabels={['6 ago', '', '', '', '', 'now']} />
      </Card>
    </GModal>
  )
}
