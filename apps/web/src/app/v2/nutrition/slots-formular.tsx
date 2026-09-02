'use client'

// ════════════════════════════════════════════════════════════════════
// DIE MAHLZEITEN BENENNEN UND TERMINIEREN — G-332
// ════════════════════════════════════════════════════════════════════
//
// **Tom, 2026-09-02:** *„kuenftig sagt man wieviele mahlzeiten man hat
// und dann definiert man jede einzelne mit zeit und namen."*
//
// **Zwei Schritte:** Anzahl nennen, dann je Zeile Name und Zeit.
//
// `[read]` **EIN Baustein, zwei Orte** — Preferences und
// `/v2/settings` rufen denselben. **Der Auftrag sagt es:** *„Ein
// Formular, zwei Orte — nicht zwei Formulare."*
//
// `[cmd]` **Die Kollision aus G-72 fällt weg:** dort lagen die Zahlen
// in `food_preferences`, während Settings nach `user_profiles`
// schrieb. **`meal_slots` ist eine eigene Tabelle.**
import * as React from 'react'
import { Card, Icon } from '@lumeos/ui'

import {
  NAMEN_VORSCHLAEGE, aufAnzahl, initialSlots, ohnePosition,
  zeilenFehler, type MahlzeitSlot,
} from '../../../lib/nutrition/slots-lage'
import { slotsSpeichern } from './slots-aktionen'

export function SlotsFormular({ start, titel }: {
  /** Die geladenen Slots — leer heisst: noch keine gesetzt. */
  start: readonly MahlzeitSlot[]
  /** Preferences und Settings zeigen dieselbe Kachel. */
  titel?: string
}) {
  const [slots, setSlots] = React.useState<MahlzeitSlot[]>([...start])
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const [gespeichert, setGespeichert] = React.useState(false)

  // `[read]` **Die Kette hält die Reihenfolge** — zwei schnelle
  // Änderungen dürfen sich nicht überholen, sonst schreibt die
  // ältere zuletzt (dieselbe Vorsicht wie in `tab-vorlieben`, C-156).
  const ketteRef = React.useRef<Promise<void>>(Promise.resolve())

  const speichern = React.useCallback((naechste: MahlzeitSlot[]) => {
    setSlots(naechste)
    setLaeuft(true)
    setFehler(null)
    setGespeichert(false)
    ketteRef.current = ketteRef.current.then(async () => {
      const r = await slotsSpeichern(naechste)
      setLaeuft(false)
      if (r.ok) { setSlots(r.slots); setGespeichert(true) } else setFehler(r.fehler)
    })
  }, [])

  const anzahlSetzen = (n: number) => {
    if (!Number.isFinite(n) || n < 0) return
    speichern(aufAnzahl(slots, n))
  }

  const zeileAendern = (pos: number, weiter: (s: MahlzeitSlot) => MahlzeitSlot) => {
    speichern(slots.map(s => (s.position === pos ? weiter(s) : s)))
  }

  return (
    <Card title={titel ?? 'Meine Mahlzeiten'}
          sub="Anzahl, Name und Zeit — gilt für Tagebuch und Planner">
      {/* ══ Schritt 1: die Anzahl ══════════════════════════════════
          `[cmd]` **Keine Obergrenze** — der CHECK auf `meals_per_day`
          ist seit C-392 weg. `[read]` **`max` bleibt trotzdem
          stehen**, weil ein Zahlenfeld ohne Grenze zu Tippfehlern
          einlädt; **12 ist grosszügig, nicht einschränkend.** */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 10 }}>
          <span className="v2-eyebrow">Wie viele Mahlzeiten?</span>
          <input
            className="v2-feld" type="number" min={0} max={12}
            data-probe="slots-anzahl"
            style={{ width: 84, flex: 'none', fontSize: 12 }}
            aria-label="Anzahl Mahlzeiten"
            value={slots.length}
            disabled={laeuft}
            onChange={e => anzahlSetzen(Number(e.target.value))}
          />
        </label>

        {/* `[read]` **Der Leerzustand bekommt ein Angebot, keinen
            Fehler** — `test-user` trägt null Slots (C-394), und eine
            leere Liste ist kein Defekt. */}
        {slots.length === 0 && (
          <button
            type="button" className="v2-btn v2-btn-sm"
            data-probe="slots-vorschlag"
            disabled={laeuft}
            onClick={() => speichern(initialSlots(4))}
          >
            <Icon name="plus" className="v2-ic v2-ic-sm" />
            Vier Mahlzeiten vorschlagen
          </button>
        )}

        {laeuft && (
          <span className="v2-dim" style={{ fontSize: 10.5 }}>Speichert …</span>
        )}
        {gespeichert && !laeuft && (
          <span style={{ fontSize: 10.5, color: 'var(--pos)' }}>Gespeichert</span>
        )}
      </div>

      {fehler && (
        <p style={{ fontSize: 11, color: 'var(--neg)', margin: '8px 0 0' }}>{fehler}</p>
      )}

      {/* ══ Schritt 2: Name und Zeit je Zeile ══════════════════════
          **Tom:** *„die gaengigsten als pulldown plus manuelle
          eingabe."*

          `[cmd]` **`<datalist>` ist genau das** — eine Auswahl, die
          freien Text nicht verbietet. **Ein `<select>` täte es**, und
          `name` ist in der Datenbank freier Text. */}
      {slots.length === 0 ? (
        <p className="v2-muted" data-probe="slots-leer"
           style={{ fontSize: 11.5, marginTop: 10, lineHeight: 1.6 }}>
          Noch keine Mahlzeiten festgelegt. Nenne oben eine Anzahl —
          Namen und Zeiten kannst du danach frei ändern.
        </p>
      ) : (
        <div className="v2-col-gap" style={{ gap: 6, marginTop: 12 }}>
          <datalist id="slot-namen">
            {NAMEN_VORSCHLAEGE.map(n => <option key={n} value={n} />)}
          </datalist>

          {slots.map(s => {
            const zf = zeilenFehler(s)
            return (
              <div key={s.position} data-probe="slot-zeile" style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5,
              }}>
                <span className="v2-num v2-dim" style={{ width: 18, textAlign: 'right' }}>
                  {s.position}
                </span>
                <input
                  className="v2-feld" list="slot-namen"
                  data-probe="slot-name"
                  style={{ flex: 1, minWidth: 0, fontSize: 11.5 }}
                  aria-label={`Name der ${s.position}. Mahlzeit`}
                  value={s.name}
                  disabled={laeuft}
                  onChange={e => zeileAendern(
                    s.position, x => ({ ...x, name: e.target.value }))}
                />
                <input
                  className="v2-feld" type="time"
                  data-probe="slot-zeit"
                  style={{ width: 106, flex: 'none', fontSize: 11.5 }}
                  aria-label={`Zeit der ${s.position}. Mahlzeit`}
                  value={s.planned_time}
                  disabled={laeuft}
                  onChange={e => zeileAendern(
                    s.position, x => ({ ...x, planned_time: e.target.value }))}
                />
                {/* `[cmd]` **Löschen rückt die Nummern nach** —
                    `ohnePosition` rechnet die Zielliste, der
                    Schreibweg löscht und fügt neu ein. **Ein `UPDATE`
                    liefe in `duplicate key`** (2026-09-02 gemessen). */}
                <button
                  type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                  data-probe="slot-entfernen"
                  aria-label={`${s.name || `Mahlzeit ${s.position}`} entfernen`}
                  disabled={laeuft}
                  onClick={() => speichern(ohnePosition(slots, s.position))}
                >
                  <Icon name="trash" className="v2-ic v2-ic-sm" />
                </button>
                {zf && (
                  <span style={{ fontSize: 10, color: 'var(--neg)' }}>{zf}</span>
                )}
              </div>
            )
          })}

          {/* `[read]` **Der Satz sagt, was die Zeit tut** — sonst hält
              man sie für eine Vorgabe. */}
          <p className="v2-muted" data-probe="slots-hinweis"
             style={{ fontSize: 10.5, marginTop: 6, lineHeight: 1.5 }}>
            Die Zeit ordnet zu, sie schreibt nichts vor: eine Mahlzeit
            landet bei der <strong>nächstliegenden</strong> Zeit.
            Verschiebst du sie später, werden ältere Einträge anders
            gruppiert — <strong>gespeichert bleibt, was du erfasst
            hast</strong>.
          </p>
        </div>
      )}
    </Card>
  )
}
