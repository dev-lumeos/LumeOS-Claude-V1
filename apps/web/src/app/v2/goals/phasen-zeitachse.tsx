'use client'

// Die Zeitachse des Phase-Reiters — G-544/A1, A2, A3.
//
// ══ DER BEFUND ═════════════════════════════════════════════════════
//
// **Tom, 2026-09-29:** *„subnav phase engine: user kann seine goals
// planen, terminieren, editieren."*
//
// `[cmd]` **Der Reiter zeigte neun Phasentypen zur Auswahl und NULL
// Ziele.** `[read]` **Er konnte nicht terminieren, weil er nicht
// wusste, WAS er terminieren soll.**
//
// ══ MEHRERE ZIELE PARALLEL ═════════════════════════════════════════
//
// `[cmd]` **Seit G-538 erlaubt der Eindeutigkeitsindex eine offene
// Phase JE ZIEL**, nicht mehr eine je Nutzer — gemessen 2026-09-30:
//
//     CREATE UNIQUE INDEX uq_goal_phases_one_open
//       ON goals.goal_phases (goal_id) WHERE actual_end_date IS NULL
//
// `[cmd]` **`phase_am()` kann das nicht zeigen:** ihr Rumpf endet auf
// `LIMIT 1`. `[read]` **Deshalb liest `ladeOffenePhasen` die Tabelle**
// — und deshalb zeigt diese Achse zwei Ziele mit je einer offenen
// Phase, was vorher verboten war.
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import { restTage } from '../../../lib/goals/pace'
import { ankerplan, gesamtWochen, type Ankerzeile } from '../../../lib/goals/anker'
import { phasenName } from '../../../lib/goals/phase-regeln'
import type { ZielFortschritt, Zielphase } from '../../../lib/goals/lesen'
import type { Strategie } from '../../../lib/goals/strategie-read'

/** Ein Ziel mit dem, was daran haengt. */
type Zeile = {
  ziel: ZielFortschritt
  phase: Zielphase | null
  strategie: Strategie | null
}

/**
 * Der Balken eines Zeitfensters.
 *
 * `[read]` **Er zeigt VERHAELTNISSE, keine Zahlen** — die Zahlen
 * stehen daneben. `[read]` **Ohne Fenster kein Balken**, statt eines
 * Strichs von Null bis Null.
 */
function Fenster({ von, bis, heute }: {
  von: string | null; bis: string | null; heute: string
}) {
  if (!von || !bis) return null
  const dauer = restTage(bis, von)
  const hin = restTage(heute, von)
  if (dauer === null || hin === null || dauer <= 0) return null
  // `[read]` **Beidseitig begrenzt** — vor dem Start ist nichts
  // verstrichen, nach dem Ende nicht mehr als alles.
  const anteil = Math.min(1, Math.max(0, -hin / dauer))
  return (
    <div data-zeitfenster style={{
      position: 'relative', height: 6, borderRadius: 3,
      background: 'var(--surface-2)', overflow: 'hidden', marginTop: 6,
    }}>
      <div style={{
        width: `${(anteil * 100).toFixed(1)}%`, height: '100%',
        background: 'var(--acc-goals)',
      }} />
    </div>
  )
}

/**
 * Die Ankertafel — A2.
 *
 * `[cmd]` **`module-goals-editor.jsx:295-330`.** `[read]` **Die
 * Rechnung steht in `lib/goals/anker.ts`**, nicht hier — G-539
 * braucht sie erneut.
 */
function Ankertafel({ zeilen, anker }: {
  zeilen: Ankerzeile[]; anker: string
}) {
  const gesamt = gesamtWochen(zeilen)
  return (
    <div data-ankertafel style={{ marginTop: 10 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6,
      }}>
        <span className="v2-eyebrow">Rueckwaerts gerechnet</span>
        {gesamt !== null && (
          <span className="v2-dim v2-num" style={{ fontSize: 10.5 }}>
            {gesamt} Wochen ab {anker}
          </span>
        )}
      </div>
      <table className="v2-tbl" style={{ margin: 0 }}>
        <tbody>
          {zeilen.map(z => (
            <tr key={`${z.name}-${z.wochenVorher}`} data-ankerzeile={z.name}>
              <td style={{ fontSize: 11.5 }}>
                {z.anker ? <strong>{z.name}</strong> : z.name}
              </td>
              <td className="v2-num" style={{ textAlign: 'right', width: 110 }}>
                {z.datum}
              </td>
              <td className="v2-num v2-dim"
                  style={{ textAlign: 'right', width: 84, fontSize: 10 }}>
                {z.wochenVorher === 0 ? '0' : `${z.wochenVorher} Wo davor`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Eine Zielzeile mit ihrem Zeitfenster.
 *
 * `[read]` **Titel, Fenster, laufende Strategie** — was A1 verlangt.
 */
function Zielzeile({ z, heute }: { z: Zeile; heute: string }) {
  const [offen, setOffen] = React.useState(false)
  const g = z.ziel
  const rest = restTage(g.target_date, heute)

  // `[cmd]` **Die Teilphasen der laufenden Strategie** — nur
  // `contest_prep` fuehrt sie (1 von 17, gemessen).
  const plan = React.useMemo(() => {
    if (!g.target_date || !z.strategie) return []
    return ankerplan(
      g.target_date,
      z.strategie.sub_phases.map(s => ({ name: s.name, weeks: s.weeks })),
      g.title)
  }, [g.target_date, g.title, z.strategie])

  return (
    <div data-zielzeile={g.goal_id} style={{
      padding: 10, borderRadius: 8, border: '1px solid var(--border)',
      background: 'var(--surface)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{g.title}</span>
        {/* ── Die laufende Phase, wenn eine haengt ──────────────── */}
        {z.phase
          ? (
            // `[cmd]` **Die Marke am `span`, nicht an der `Pill`** —
            // `Pill` nimmt nur benannte Requisiten und liesse
            // `data-…` fallen (`primitives.tsx:125`). **Am Schirm
            // gemessen: 0 statt 1.**
            <span data-zielphase={z.phase.phase_type ?? ''}>
              <Pill variant="acc">{phasenName(z.phase.phase_type)}</Pill>
            </span>
          )
          : (
            <span className="v2-dim" data-zielphase=""
                  style={{ fontSize: 10.5, fontStyle: 'italic' }}>
              keine laufende Phase
            </span>
          )}
        {/* `[read]` **Die Strategie NENNEN, nicht nur die Art** —
            `lean_bulk` sagt die Phase, `Clean Bulk` die Strategie. */}
        {z.strategie && (
          <span data-zielstrategie-lauf={z.strategie.code}>
            <Pill>{z.strategie.label}</Pill>
          </span>
        )}
        <span className="v2-dim v2-mono" style={{
          marginLeft: 'auto', fontSize: 10,
        }}>
          {g.gueltig_ab ?? '—'} → {g.target_date ?? '—'}
          {rest !== null && ` · ${rest >= 0 ? `noch ${rest}` : `${-rest} ueberfaellig`} Tage`}
        </span>
      </div>

      <Fenster von={g.gueltig_ab} bis={g.target_date} heute={heute} />

      {/* ── A2: terminieren ───────────────────────────────────────
          `[read]` **Nur wo es etwas zu rechnen gibt** — eine Tafel
          ohne Teilphasen waere eine leere Zusage. */}
      {plan.length > 1 && (
        <>
          <button type="button" data-anker-auf={g.goal_id}
                  className="v2-btn v2-btn-ghost v2-btn-sm"
                  aria-expanded={offen}
                  style={{ marginTop: 8, fontSize: 10.5 }}
                  onClick={() => setOffen(v => !v)}>
            <Icon name={offen ? 'chevron_up' : 'chevron_down'}
                  className="v2-ic v2-ic-sm" />
            Terminplan {offen ? 'schliessen' : 'zeigen'}
          </button>
          {offen && g.target_date && (
            <Ankertafel zeilen={plan} anker={g.target_date} />
          )}
        </>
      )}

      {/* ── A3: was danach moeglich ist ───────────────────────────
          `[cmd]` **`goal_strategies.next_codes`** — gemessen: 8 von
          17 Zeilen fuehren sie. `[read]` **Genannt, nicht verlinkt**
          — ein Wechsel schriebe eine Phase, und das ist der Editor
          (G-539, A4). */}
      {z.strategie && z.strategie.next_codes.length > 0 && (
        <div className="v2-dim" data-zielfolge={z.strategie.code}
             style={{ fontSize: 10.5, marginTop: 6 }}>
          Danach moeglich: {z.strategie.next_codes.join(' · ')}
        </div>
      )}
    </div>
  )
}

/**
 * Die Zeitachse.
 *
 * @param ziele       Alle Ziele der Nutzerin.
 * @param phasen      Die offenen Phasen — eine je Ziel (G-538).
 * @param strategien  Der Katalog, zum Aufloesen von `strategie_code`.
 * @param heute       Der Stichtag. **Kein `Date.now()`.**
 */
export function PhasenZeitachse({ ziele, phasen, strategien, heute, onNeuesZiel }: {
  ziele: ZielFortschritt[]
  phasen: Zielphase[]
  strategien: Strategie[]
  heute: string
  onNeuesZiel: () => void
}) {
  const zeilen: Zeile[] = ziele.map(z => {
    const p = phasen.find(x => x.goal_id === z.goal_id) ?? null
    // `[read]` **Der Code, wenn er da ist** — bis G-558 traegt ihn
    // keine Phase, dann greift die Phasenart als Rueckfall.
    const s = p?.strategie_code
      ? strategien.find(x => x.code === p.strategie_code) ?? null
      : (p?.phase_type
        ? strategien.find(x => x.code === p.phase_type) ?? null
        : null)
    return { ziel: z, phase: p, strategie: s }
  })

  return (
    <Card title="Ziele und ihre Zeitfenster"
          sub="planen · terminieren — je Ziel eine offene Phase">
      {/* ══ Kein Ziel ist kein leerer Reiter ══════════════════════
          `[read]` **A1: „Kein Ziel ist kein leerer Reiter, sondern
          der Weg zum Anlegen (G-537)."** */}
      {zeilen.length === 0 ? (
        <div data-zeitachse-leer className="v2-col-gap"
             style={{ gap: 8, padding: '14px 0', textAlign: 'center' }}>
          <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Noch kein Ziel. Eine Phase braucht ein Ziel, an dem sie
            haengt — sonst weiss sie nicht, worauf sie hinarbeitet.
          </div>
          <div>
            <button type="button" className="v2-btn v2-btn-primary v2-btn-sm"
                    data-zeitachse-neu onClick={onNeuesZiel}>
              <Icon name="plus" className="v2-ic v2-ic-sm" />
              Ziel anlegen
            </button>
          </div>
        </div>
      ) : (
        <div className="v2-col-gap" data-zeitachse style={{ gap: 8 }}>
          {zeilen.map(z => (
            <Zielzeile key={z.ziel.goal_id} z={z} heute={heute} />
          ))}
        </div>
      )}

      {/* `[cmd]` **A4: kein Knopf in den Editor** — den gibt es erst
          mit G-539. `[read]` **Ein Knopf ohne Ziel ist eine
          Zusage.** */}
      <div className="v2-dim" data-zeitachse-grenze style={{
        fontSize: 10.5, lineHeight: 1.5, marginTop: 10, paddingTop: 8,
        borderTop: '1px solid var(--border)',
      }}>
        Einzelne Phasen bearbeiten — Teilphasen, Refeeds, Protokolle —
        braucht den Editor aus G-539.
      </div>
    </Card>
  )
}
