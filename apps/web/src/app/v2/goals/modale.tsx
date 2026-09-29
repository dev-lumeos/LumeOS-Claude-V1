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
import * as React from 'react'
import { Card, Pill, Icon, LineChart, InEntwicklungKnopf } from '@lumeos/ui'

// `[read]` **Die Serveraktion, nicht der Schreibweg selbst** — ein
// Wert-Import aus `lib/goals/fotosession-write` zoege den Server-Baum
// ueber die `'use client'`-Grenze (die Lehre aus G-412).
import { fotosessionAnlegenAktion } from './fotosession-aktionen'
// G-422: der Schreibweg fuer Koerpermessungen gibt es seit G-122 —
// nur der Aufrufer fehlte.
import { messungAnlegenAktion } from './koerpermass-aktionen'
// G-537: der Anlegeweg fuer Ziele.
import { zielAnlegenAktion } from './ziel-aktionen'
// `[read]` **Nur Typ und Konstanten** — `koerpermass-rechnung.ts`
// hat kein Server-I/O, aber die Regel bleibt: kein Wert-Import aus
// einem `*-write`-Modul.
import {
  BF_METHODEN, LEERE_MESSUNG, type KoerpermassEingabe,
} from '../../../lib/goals/koerpermass-rechnung'

import {
  zielArtAuswahl, AKTIVE_PLAETZE, type ZielArt,
} from '../../../lib/goals/ziel-arten'
// G-537: die Pruefung, die auch der Schreibweg nutzt.
import { pruefeNeuesZiel } from '../../../lib/goals/ziel-regeln'
// G-537/A3: die Marke fuer „Linked modules" — E-68, eine Zeile.
import { attrappeAus } from './ansicht'

import { MEASUREMENTS, daysToDeadline, type Ziel } from './daten'
import type { ModalZustand } from './kontext'

/** Heute als `YYYY-MM-DD`, in Ortszeit. */
function heuteISO(): string {
  const d = new Date()
  const z = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}

// ── Der Rahmen ──────────────────────────────────────────────────
// [cmd] module-goals.jsx:659-681.
function GModal({
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
function GField({ label, sub, children }: {
  label: React.ReactNode; sub?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5, gap: 8 }}>
        <label className="v2-eyebrow">{label}</label>
        {sub && <span className="v2-dim" style={{ fontSize: 10 }}>{sub}</span>}
      </div>
      {children}
    </div>
  )
}

const FELD: React.CSSProperties = {
  width: '100%', height: 30, background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 6, padding: '0 10px', fontSize: 12, outline: 'none', color: 'var(--fg)',
}

function GInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...FELD, ...(props.style ?? {}) }} />
}

// ── Die Verteilung ──────────────────────────────────────────────
export function GoalsModale({ modal, onClose }: {
  modal: ModalZustand | null; onClose: () => void
}) {
  if (!modal) return null
  switch (modal.typ) {
    case 'newGoal': return <NewGoalModal onClose={onClose} />
    case 'goalDet': return <GoalDetailModal g={modal.ziel} onClose={onClose} />
    case 'logWeight': return <LogWeightModal onClose={onClose} />
    case 'logMeasure': return <LogMeasureModal onClose={onClose} />
    case 'logPhoto': return <LogPhotoModal onClose={onClose} />
    case 'measureDet': return <MeasureDetailModal m={modal.mass} onClose={onClose} />
    default: return null
  }
}

// ── NEW GOAL ────────────────────────────────────────────────────
// [cmd] module-goals.jsx:694-744.

/**
 * Beispieltexte je Zielart — G-354.
 *
 * `[read]` **Platzhalter, keine Werte:** sie stehen im `placeholder`
 * und werden nie gespeichert. **Sie zeigen die Form einer Eingabe,
 * nicht eine gemessene Zahl.**
 */
/**
 * Die fuenf Module, die Daten zu einem Ziel beitragen.
 *
 * `[cmd]` **Aus dem Entwurf** (`module-goals.jsx:734-738`) — **und
 * dieselben fuenf, die `goal_contributions.module` im CHECK
 * nennt** (`DATABASE.md:149`).
 */
const MODULE = ['nutrition', 'training', 'recovery', 'supplements', 'medical'] as const

const BEISPIEL: Record<ZielArt, { titel: string; ist: string; ziel: string }> = {
  body_composition: { titel: 'z. B. auf 12 % Körperfett', ist: '79.4', ziel: '78' },
  performance: { titel: 'z. B. Bankdrücken 1RM · 130 kg', ist: '122.5', ziel: '130' },
  health: { titel: 'z. B. Blutdruck unter 130/80', ist: '138', ziel: '130' },
  lifestyle: { titel: 'z. B. dreimal pro Woche Ausdauer', ist: '1', ziel: '3' },
}
function NewGoalModal({ onClose }: { onClose: () => void }) {
  // ══ G-354: die Arten kommen aus einer Quelle ═══════════════════
  //
  // `[cmd]` **Hier stand eine eigene Liste aus dem Altrepo**
  // (`module-goals.jsx:694-744`) mit sechs Eintraegen: einer
  // abgekuerzten Koerperzusammensetzung, `weight`, `strength`,
  // `performance`, `habit`, `custom`.
  //
  // `[cmd]` **Die abgekuerzte Form kennt die Datenbank nicht** — der
  // CHECK `user_goals_goal_type_check` laesst vier Werte zu, und
  // `body_composition` ist ausgeschrieben. **Ein Ziel mit dem
  // abgekuerzten Wert waere beim Anlegen abgewiesen worden.**
  //
  // `[read]` **Dieselbe Klasse wie die sechste Namensliste in
  // `nutrition/modale.tsx`** (G-339) — **eine Liste, die niemand
  // mitzaehlt, weil sie in einem Fenster steht.**
  const [type, setType] = React.useState<ZielArt>('body_composition')
  // `[read]` **Das Sinnbild bleibt hier** — es ist Darstellung, kein
  // Wert. **Die Zuordnung deckt genau die vier Arten ab.**
  const SINNBILD: Record<ZielArt, React.ComponentProps<typeof Icon>['name']> = {
    body_composition: 'goals',
    performance: 'training',
    health: 'brain',
    lifestyle: 'edit',
  }
  const types = zielArtAuswahl().map(a => ({
    id: a.code, label: a.label, icon: SINNBILD[a.code],
  }))

  // ══ G-537: der Dialog legt jetzt wirklich an ═══════════════════
  //
  // `[cmd]` **Hier stand ein `InEntwicklungKnopf` mit dem Grund**
  // *,,Was fehlt, ist nur das ANLEGEN: `schreiben.ts` kennt genau
  // eine Operation, `.update()`"*. `[cmd]` **`zielAnlegen()` gibt es
  // seit G-537** — der Grund ist eingeloest.
  const [titel, setTitel] = React.useState('')
  const [ist, setIst] = React.useState('')
  const [ziel, setZiel] = React.useState('')
  const [einheit, setEinheit] = React.useState('')
  const [start, setStart] = React.useState(heuteISO())
  const [deadline, setDeadline] = React.useState('')
  const [prio, setPrio] = React.useState(1)
  const [notiz, setNotiz] = React.useState('')
  // `[cmd]` **G-537/A3: die Wahl wird GEHALTEN**, auch wenn sie
  // noch nirgends ankommt — `user_goals` hat keine Spalte dafuer
  // (G-536). `[read]` **Gehalten heisst: sie ist pruefbar.**
  const [module, setModule] = React.useState<string[]>([])
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const [fertig, setFertig] = React.useState(false)

  const zahl = (s: string): number | null => {
    const t = s.trim()
    if (t === '') return null
    const n = Number(t)
    return Number.isFinite(n) ? n : null
  }

  // `[read]` **Die Pruefung liegt in `ziel-regeln.ts`** — dieselbe,
  // die der Schreibweg nutzt. **Zwei Kopien driften.**
  const felder = pruefeNeuesZiel({
    goal_type: type, title: titel, gueltig_ab: start, priority: prio,
    target_value: zahl(ziel), current_value: zahl(ist),
    target_date: deadline || null,
  })
  const feldFehler = (f: string) => felder.find(x => x.feld === f)?.text

  async function anlegen() {
    setLaeuft(true)
    setFehler(null)
    const r = await zielAnlegenAktion({
      goal_type: type,
      title: titel,
      gueltig_ab: start,
      priority: prio,
      target_value: zahl(ziel),
      current_value: zahl(ist),
      start_value: zahl(ist),
      target_unit: einheit || null,
      target_date: deadline || null,
      description: notiz || null,
    })
    setLaeuft(false)
    if (r.ok) {
      setFertig(true)
      // `[read]` **Erst schliessen, wenn die Zeile da ist** — sonst
      // sieht ein Fehlschlag aus wie Erfolg.
      setTimeout(onClose, 900)
    } else {
      setFehler(r.fehler)
    }
  }

  return (
    <GModal title="New goal" subtitle="Choose type · set target · link modules"
            eyebrow="plus" onClose={onClose}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
                <button type="button" className="v2-btn v2-btn-primary"
                        data-ziel-anlegen
                        disabled={laeuft || felder.length > 0}
                        onClick={() => { void anlegen() }}>
                  <Icon name="check" className="v2-ic v2-ic-sm" />
                  {laeuft ? 'Legt an …' : 'Create goal'}
                </button>
              </>
            }>
      <GField label="Goal type">
        <div className="v2-goals-typen">
          {types.map(t => (
            <button key={t.id} type="button" onClick={() => setType(t.id)} aria-pressed={type === t.id}
                    style={{
                      padding: '10px 8px', borderRadius: 6,
                      background: type === t.id ? 'color-mix(in oklch, var(--acc-goals) 12%, var(--surface))' : 'var(--surface)',
                      border: `1px solid ${type === t.id ? 'color-mix(in oklch, var(--acc-goals) 35%, var(--border))' : 'var(--border)'}`,
                      color: type === t.id ? 'var(--acc-goals)' : 'var(--fg-muted)',
                      cursor: 'pointer', fontSize: 11.5,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    }}>
              <Icon name={t.icon as never} className="v2-ic" />
              {t.label}
            </button>
          ))}
        </div>
      </GField>
      {/* ══ G-354: die Beispiele folgen den vier Arten ═════════════
          `[cmd]` **Hier stand `type === 'strength'`** — **`strength`
          war in der Altrepo-Liste eine ART.** `[cmd]` **In der
          Datenbank ist es ein `subtype` unter `performance`.**

          `[read]` **Der Typecheck hat es gefunden, nicht ich** — die
          drei Vergleiche hatten nach dem Anschluss keine
          Ueberschneidung mehr. */}
      <GField label="Title">
        <GInput aria-label="Title" data-zielfeld="titel" value={titel}
                placeholder={BEISPIEL[type].titel}
                onChange={e => setTitel(e.target.value)} />
      </GField>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
        <GField label="Current value">
          <GInput aria-label="Current value" data-zielfeld="ist" value={ist}
                  placeholder={BEISPIEL[type].ist}
                  onChange={e => setIst(e.target.value)} />
        </GField>
        <GField label="Target value">
          <GInput aria-label="Target value" data-zielfeld="ziel" value={ziel}
                  placeholder={BEISPIEL[type].ziel}
                  onChange={e => setZiel(e.target.value)} />
        </GField>
      </div>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
        <GField label="Unit">
          <GInput aria-label="Unit" data-zielfeld="einheit" value={einheit}
                  placeholder="kg · %  · min" onChange={e => setEinheit(e.target.value)} />
        </GField>
        {/* `[read]` **Die Prioritaet gehoert ins Anlegen** — sie
            entscheidet, welchen der drei aktiven Plaetze das Ziel
            belegt, und ist danach nur noch umzusortieren. */}
        <GField label="Priority" sub={`${AKTIVE_PLAETZE} aktive Plätze, jeder einmal`}>
          <select aria-label="Priority" data-zielfeld="prio" value={prio}
                  onChange={e => setPrio(Number(e.target.value))}
                  style={{
                    width: '100%', padding: '7px 9px', fontSize: 12,
                    background: 'var(--surface)', color: 'var(--fg)',
                    border: '1px solid var(--border)', borderRadius: 5,
                  }}>
            {[1, 2, 3].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </GField>
      </div>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
        <GField label="Start date">
          <GInput type="date" aria-label="Start date" data-zielfeld="start"
                  value={start} onChange={e => setStart(e.target.value)} />
        </GField>
        <GField label="Deadline">
          <GInput type="date" aria-label="Deadline" data-zielfeld="deadline"
                  value={deadline} min={start}
                  onChange={e => setDeadline(e.target.value)} />
        </GField>
      </div>
      {feldFehler('target_date') && (
        <div data-zielfehler="target_date" style={{
          marginTop: -4, marginBottom: 10, fontSize: 11.5,
          color: 'var(--neg)',
        }}>{feldFehler('target_date')}</div>
      )}
      {/* ══ G-537/A3: „Linked modules" bekommt einen Platz mit
          MARKE ══════════════════════════════════════════════════
          `[cmd]` **`goals.user_goals` hat keine Spalte dafuer** —
          sie kommt mit G-536 von Codex.

          `[read]` **Eine Zeile, Quelle und Grund** — kein Absatz
          ueber die fehlende Spalte (das war G-534/A1). */}
      {/* `[read]` **Die verknuepften Module sind die DATENQUELLE,
          nicht Schmuck.** `[cmd]` **Der Entwurf gibt jedem Ziel
          `history[]` und `pace`** (`module-goals.jsx:746-779`),
          **und `user_goals` traegt `auto_update`** — **der
          Ist-Wert kommt aus den Modulen, er wird nicht getippt.**

          `[read]` **Deshalb ist die Auswahl BEDIENBAR, obwohl die
          Spalte fehlt** — ein Feld, das man nicht anklicken kann,
          prueft niemand. **Die Marke sagt, dass die Wahl noch
          nirgends ankommt.** */}
      <Card className="v2-card-tight" style={{ padding: 10, marginBottom: 10 }}
            attrappe={attrappeAus('theme-v1/module-goals.jsx',
              'eine Spalte fuer verknuepfte Module — wartet auf: G-536')}>
        <div className="v2-eyebrow">Linked modules · auto-pull data</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
          {MODULE.map(m => {
            const an = module.includes(m)
            return (
              <button key={m} type="button" className="v2-pill"
                      data-zielmodul={m} aria-pressed={an}
                      onClick={() => setModule(v => an
                        ? v.filter(x => x !== m) : [...v, m])}
                      style={{
                        cursor: 'pointer', padding: '4px 10px', fontSize: 11,
                        background: an
                          ? 'color-mix(in oklch, var(--acc-goals) 14%, var(--surface))'
                          : 'var(--surface)',
                        borderColor: an
                          ? 'color-mix(in oklch, var(--acc-goals) 40%, var(--border))'
                          : 'var(--border)',
                        color: an ? 'var(--acc-goals)' : 'var(--fg-muted)',
                      }}>
                {m}
              </button>
            )
          })}
        </div>
      </Card>

      <GField label="Notes (optional)">
        <GInput aria-label="Notes" data-zielfeld="notiz" value={notiz}
                placeholder="Context, sub-goals, reminders…"
                onChange={e => setNotiz(e.target.value)} />
      </GField>

      {/* `[read]` **Der Satz zum belegten Platz kommt aus dem
          Schreibweg** — dieselbe Meldung wie bei `zielAendern`,
          damit der Nutzer eine kennt und nicht zwei. */}
      {fehler && (
        <div data-ziel-fehler style={{
          marginTop: 10, padding: '8px 10px', borderRadius: 5, fontSize: 11.5,
          lineHeight: 1.5,
          background: 'color-mix(in oklch, var(--neg) 8%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--neg) 30%, var(--border))',
        }}>{fehler}</div>
      )}
      {fertig && (
        <div data-ziel-fertig style={{
          marginTop: 10, padding: '8px 10px', borderRadius: 5, fontSize: 11.5,
          background: 'color-mix(in oklch, var(--pos) 8%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--pos) 30%, var(--border))',
        }}>Ziel angelegt.</div>
      )}
    </GModal>
  )
}

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
function LogWeightModal({ onClose }: { onClose: () => void }) {
  const [eingabe, setEingabe] = React.useState<KoerpermassEingabe>({
    ...LEERE_MESSUNG,
    measurement_date: heuteISO(),
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
    const r = await messungAnlegenAktion(eingabe)
    setLaeuft(false)
    if (r.ok) {
      setFertig(true)
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
    <GModal title="Log weight" subtitle="Daily — morning fasted preferred"
            eyebrow="plus" onClose={onClose} width={520}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
                <button type="button" className="v2-btn v2-btn-primary"
                        data-messung-speichern
                        disabled={laeuft || !eingabe.weight_kg.trim()}
                        onClick={() => { void speichern() }}>
                  <Icon name="check" className="v2-ic v2-ic-sm" />
                  {laeuft ? 'Speichert …' : 'Log'}
                </button>
              </>
            }>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
        <GField label="Date">
          <GInput type="date" aria-label="Date" data-messfeld="datum"
                  value={eingabe.measurement_date}
                  onChange={e => setz('measurement_date', e.target.value)} />
        </GField>
        <GField label="Time">
          <GInput type="time" aria-label="Time" data-messfeld="zeit"
                  value={eingabe.measurement_time}
                  onChange={e => setz('measurement_time', e.target.value)} />
        </GField>
      </div>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
        <GField label="Weight" sub="kg">
          <GInput type="number" aria-label="Weight" data-messfeld="gewicht"
                  value={eingabe.weight_kg}
                  onChange={e => setz('weight_kg', e.target.value)} />
        </GField>
        <GField label="Body fat (optional)" sub="%">
          <GInput type="number" aria-label="Body fat" data-messfeld="koerperfett"
                  value={eingabe.body_fat_pct}
                  onChange={e => setz('body_fat_pct', e.target.value)} />
        </GField>
      </div>
      {/* `[cmd]` **Die zehn Werte aus dem CHECK**, nicht drei
          erfundene. */}
      <GField label="Source" sub="aus body_measurements_method_ck">
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

      {/* `[read]` **Feldfehler am Feld, nicht als Sammelsatz** — die
          Pruefung liefert sie einzeln. */}
      {felder.length > 0 && (
        <div style={{
          marginTop: 10, padding: '8px 10px', borderRadius: 5, fontSize: 11.5,
          lineHeight: 1.5,
          background: 'color-mix(in oklch, var(--neg) 8%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--neg) 30%, var(--border))',
        }}>
          {felder.map(f => <div key={f.feld}>{f.feld}: {f.text}</div>)}
        </div>
      )}
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
function LogMeasureModal({ onClose }: { onClose: () => void }) {
  return (
    <GModal title="Update measurements" subtitle="All in cm · fill what you have"
            eyebrow="edit" onClose={onClose} width={620}
            footer={
              <>
                <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
                <InEntwicklungKnopf titel="Save measurements" className="v2-btn v2-btn-primary"
                                    grund="`goals.body_measurements` gibt es (17 Spalten, 362 Zeilen live) und traegt auch die Umfaenge. Was fehlt, ist der Schreibweg.">
                  <Icon name="check" className="v2-ic v2-ic-sm" />Save measurements
                </InEntwicklungKnopf>
              </>
            }>
      <GField label="Date"><GInput type="date" aria-label="Date" defaultValue="2026-05-16" /></GField>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 10 }}>
        {MEASUREMENTS.map(m => (
          <GField key={m.id} label={m.label} sub={`last ${m.current}`}>
            <GInput type="number" aria-label={m.label} defaultValue={m.current} />
          </GField>
        ))}
      </div>
      <GField label="Note (optional)">
        <GInput aria-label="Note" placeholder="Time of day, pump state, etc." />
      </GField>
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
    () => new Date().toISOString().slice(0, 10))
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
