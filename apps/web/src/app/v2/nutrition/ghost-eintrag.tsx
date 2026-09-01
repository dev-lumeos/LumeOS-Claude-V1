'use client'
// ════════════════════════════════════════════════════════════════════
// GHOST ENTRIES — G-309
// ════════════════════════════════════════════════════════════════════
//
// **`SPEC_03` Flow 3, Schritt 7:** *,,Ab Startdatum: Ghost Entries
// erscheinen im Diary."*
//
// ══ ER ERSCHEINT, ER WIRD NICHT GESCHRIEBEN ═════════════════════════
//
// **Tom, 2026-09-01:** *,,Ein Ghost Entry ist eine Absicht, keine
// Erfassung. Wer ihn als `meals` schreibt, hat gegessen, ohne gegessen
// zu haben — und die Tagesbilanz zaehlt es mit."*
//
// `[cmd]` **`SPEC_03` Flow 4:** *,,Ghost Entries haben kein
// automatisches Expiry. User entscheidet jederzeit — auch
// retroaktiv."* `[read]` **Nur eine Anzeige bleibt so offen** — ein
// geschriebener `meals`-Satz waere gegessen oder geloescht.
//
// ══ DAS REZEPT WIRD AUFGELOEST ══════════════════════════════════════
//
// `[cmd]` **`ADR_GHOST_ENTRY_RECIPE`:** *,,Ghost Entries die aus einem
// `MealPlanItem.recipe_id` stammen zeigen immer alle Einzelzutaten —
// nie das Rezept als Einheit."* **Jede Zeile hat ein editierbares
// Mengenfeld.**
//
// `[read]` **Der Rezeptname steht als Ueberschrift** (Flow-4-Patch),
// **die Zutaten einzeln darunter** — jede mit eigenem Feld.
//
// ══ UND KEIN ZWEITER SCHREIBWEG ═════════════════════════════════════
//
// `[cmd]` **`bestaetigen` und `ueberspringen` stehen seit G-274** und
// schreiben `meal_plan_logs` vollstaendig. **Hier wird gerufen, nicht
// nachgebaut.** `[read]` **`addMealItem` aus G-272 friert die
// Naehrwerte ein** — das tut der Schreibweg dahinter bereits.
import * as React from 'react'
import { Card } from '@lumeos/ui'

/** Eine Zutat des Ghost Entry. */
export type GhostPosten = {
  food_id: string
  name: string
  amount_g: number
  kcal: number | null
}

export type GhostEintrag = {
  id: string
  meal_type: string
  rezept: string | null
  posten: GhostPosten[]
  kcal: number | null
  status: 'pending' | 'confirmed' | 'deviated' | 'skipped'
}

// G-315: die Tabelle steht in `plan-model.ts` — sie stand hier
// doppelt, und die andere Kopie kannte nur vier Slots.
import { MAHLZEIT_LABEL } from '../../../lib/nutrition/plan-model'

function z(v: number | null): string {
  return v === null ? '—' : String(Math.round(v))
}

/**
 * Ein Ghost Entry — der Plan-Vorschlag eines Slots.
 *
 * `[read]` **Gestrichelt und in eigener Farbe**, damit er sich von
 * einer erfassten Mahlzeit unterscheidet — Flow 4: *,,gestrichelte
 * Umrandung, andere Farbe"*.
 */
export function GhostEintragKarte({
  eintrag, datum, onGeaendert,
}: {
  eintrag: GhostEintrag
  datum: string
  onGeaendert: () => void
}) {
  // `[read]` **Die Mengen sind editierbar** — das verlangt das ADR
  // ausdruecklich. **Der Ausgangswert ist die Planmenge.**
  const [mengen, setMengen] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(eintrag.posten.map(p => [p.food_id, String(p.amount_g)])))
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  // `[read]` **Wechselt der Tag, gelten die Mengen des neuen Tages** —
  // sonst stuenden die Zahlen von gestern in den Feldern.
  React.useEffect(() => {
    setMengen(Object.fromEntries(
      eintrag.posten.map(p => [p.food_id, String(p.amount_g)])))
  }, [eintrag.posten])

  /**
   * Wurde eine Menge angefasst?
   *
   * `[read]` **Leer heisst „stimmt so"** — Flow 4, Case 2, Schritt 4a.
   * **Dann gehen keine Mengen mit, und der Schreibweg nimmt die
   * Planmengen.** So bleibt „unveraendert" von „zufaellig gleich"
   * unterscheidbar.
   */
  function geaenderteMengen(): Array<{ food_id: string; amount_g: number }> | undefined {
    const aus: Array<{ food_id: string; amount_g: number }> = []
    let abweichend = false
    for (const p of eintrag.posten) {
      const roh = mengen[p.food_id]
      const n = Number(roh)
      if (!Number.isFinite(n) || n <= 0) continue
      aus.push({ food_id: p.food_id, amount_g: n })
      if (Math.abs(n - p.amount_g) > 0.001) abweichend = true
    }
    return abweichend ? aus : undefined
  }

  async function senden(koerper: Record<string, unknown>) {
    setLaeuft(true)
    setFehler(null)
    try {
      const a = await fetch('/api/nutrition/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(koerper),
      })
      const d = await a.json()
      if (!a.ok) throw new Error(d?.error ?? `HTTP ${a.status}`)
      onGeaendert()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  // `[cmd]` **`confirmation_mode` ist Pflicht** — der
  // `resolution_check` verlangt es bei `confirmed` UND `deviated`.
  // **Ueber diesen Knopf ist es `manual`**; `mealcam` kommt aus dem
  // Kameraweg (Flow 4 Case 1, nicht gebaut).
  const bestaetigen = () => senden({
    art: 'bestaetigen',
    plan_entry_id: eintrag.id,
    execution_date: datum,
    confirmation_mode: 'manual',
    mengen: geaenderteMengen(),
  })

  const auslassen = () => senden({
    art: 'ueberspringen',
    plan_entry_id: eintrag.id,
    execution_date: datum,
  })

  const summe = eintrag.posten.reduce((s, p) => {
    const n = Number(mengen[p.food_id])
    // Die kcal skalieren mit der Menge — der Snapshot gilt fuer die
    // Planmenge. `[read]` **Eine Schaetzung fuer die Anzeige**; die
    // verbindliche Zahl rechnet der Schreibweg neu.
    if (p.kcal === null || !Number.isFinite(n) || p.amount_g <= 0) return s
    return s + p.kcal * (n / p.amount_g)
  }, 0)
  const summeBekannt = eintrag.posten.some(p => p.kcal !== null)

  return (
    <Card
      className="v2-card-tight"
      style={{
        padding: 0,
        border: '1px dashed var(--fg-dim)',
        background: 'transparent',
      }}
    >
      <div style={{
        padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {MAHLZEIT_LABEL[eintrag.meal_type] ?? eintrag.meal_type}
        </span>
        <span className="v2-dim" style={{ fontSize: 11 }}>· aus deinem Plan</span>
        <div className="v2-spacer" />
        <span className="v2-num" style={{ fontSize: 12 }}>
          {summeBekannt ? z(summe) : '—'}
          <span className="v2-dim" style={{ fontSize: 10 }}> kcal</span>
        </span>
      </div>

      {/* `[cmd]` **Der Rezeptname als Ueberschrift** —
          `SPEC_03_FLOW4_RECIPE_PATCH`. **Die Zutaten stehen einzeln
          darunter, nie das Rezept als Einheit.** */}
      {eintrag.rezept && (
        <div style={{ padding: '0 14px 8px' }}>
          <span className="v2-dim" style={{ fontSize: 11 }}>
            📖 {eintrag.rezept}
          </span>
        </div>
      )}

      <div style={{ padding: '0 14px 12px', display: 'grid', gap: 6 }}>
        {eintrag.posten.length === 0 && (
          <p className="v2-muted" style={{ fontSize: 12 }}>
            Für diese Planposition sind keine Lebensmittel hinterlegt.
          </p>
        )}
        {eintrag.posten.map(p => (
          <div key={p.food_id} style={{
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
          }}>
            <span style={{ flex: 1, minWidth: 0 }}>{p.name}</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              aria-label={`Menge ${p.name}`}
              value={mengen[p.food_id] ?? ''}
              disabled={laeuft}
              onChange={e => setMengen(m => ({ ...m, [p.food_id]: e.target.value }))}
              style={{ width: 68, textAlign: 'right' }}
              className="v2-input"
            />
            <span className="v2-dim" style={{ fontSize: 10, width: 12 }}>g</span>
            <span className="v2-num v2-dim" style={{ fontSize: 11, width: 54, textAlign: 'right' }}>
              {z(p.kcal)} kcal
            </span>
          </div>
        ))}
      </div>

      {fehler && (
        <div style={{ padding: '0 14px 10px' }}>
          <p className="v2-neg" style={{ fontSize: 11 }}>{fehler}</p>
        </div>
      )}

      <div style={{
        padding: '0 14px 12px', display: 'flex', gap: 8,
      }}>
        <button
          type="button" className="v2-btn v2-btn-sm"
          disabled={laeuft || eintrag.posten.length === 0}
          onClick={bestaetigen}
        >
          Bestätigen
        </button>
        <button
          type="button" className="v2-btn v2-btn-sm v2-btn-ghost"
          disabled={laeuft}
          onClick={auslassen}
        >
          Auslassen
        </button>
      </div>
    </Card>
  )
}
