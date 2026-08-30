'use client'

// ════════════════════════════════════════════════════════════════════
// DAS ERFASSUNGSMODAL FUER `+ Add` — G-272
// ════════════════════════════════════════════════════════════════════
//
// **Tom, 2026-08-29 (ueber G-265):** *,,food db +add falsches modal"*.
//
// ══ DER SCHREIBWEG EXISTIERT — GEMESSEN, NICHT GEBAUT ═══════════════
//
// `[cmd]` **Gemessen am 2026-08-30, vor jeder Zeile Code:**
// `lib/nutrition/diary-write.ts` fuehrt seit C-51/G-56 **sieben**
// Funktionen — `createMeal`, `addMealItem`, `updateMealItemAmount`,
// `removeMealItem`, `listOwnMeals`, `listOwnMealItems`,
// `listPortionsForFood`. **Dazu die Route
// `/api/nutrition/diary`** mit Zod-Pruefung je Vorgang.
//
// `[read]` **Der Auftrag warnte davor, und die Warnung war
// berechtigt:** bei Supplements gab es den Weg seit G-148, und G-138
// hat drei Tage daran vorbeigesucht. **Hier war es dieselbe Lage —
// nichts musste geschrieben werden, nur gerufen.**
//
// ══ WARUM EIN EIGENES MODAL UND NICHT DAS VORHANDENE ════════════════
//
// `[cmd]` **`HinzufuegenModal` in `mahlzeiten.tsx:468` tut fast
// dasselbe** — Suche, Portionswahl, Mengenfeld, derselbe
// Schreibaufruf. **Es ist aber an die Mahlzeitkarte gebunden:** es
// bekommt `slot` und `sicherstellen()` von aussen und fragt selbst
// **weder nach Mahlzeit noch nach Tag.**
//
// `[cmd]` **Der Food-DB-Reiter kennt beides nicht** — er bekommt bis
// heute kein Datum (`NutritionFoodsTab` nimmt `start` und
// `unvertraeglichkeiten`).
//
// `[read]` **Deshalb ergaenzt dieses Modal genau die zwei fehlenden
// Felder und ruft denselben Weg.** **Keine zweite Suche, keine zweite
// Portionslogik, keine zweite Schreibstelle** — das waere die zweite
// Ansicht, die dreimal wieder ausgebaut werden musste (G-249, G-11,
// in G-253 verhindert).
//
// `[read]` **Das Lebensmittel steht bereits fest**, wenn dieses Modal
// aufgeht — es kommt aus der Zeile, auf deren `+ Add` geklickt wurde.
// **Die Suche des anderen Modals waere hier ueberfluessig.**

import * as React from 'react'
import { Icon } from '@lumeos/ui'

/** Eine Portion aus `nutrition.food_portions` (C-51). */
type Portion = {
  name_de: string
  amount_g: number
  is_default: boolean
}

/** Die Mahlzeitarten, wie `mahlzeiten.tsx` sie fuehrt. */
const MAHLZEITEN = [
  ['breakfast', 'Breakfast'],
  ['lunch', 'Lunch'],
  ['dinner', 'Dinner'],
  ['snack', 'Snack'],
  ['pre_workout', 'Pre-workout'],
  ['post_workout', 'Post-workout'],
  ['other', 'Other'],
] as const

/**
 * Welche Mahlzeit zur Tageszeit passt.
 *
 * `[read]` **Ein Vorschlag, keine Festlegung** — die Auswahl steht
 * daneben und ist mit einem Klick geaendert. **Ohne Vorauswahl muesste
 * der Nutzer bei jedem Hinzufuegen dieselbe Entscheidung treffen.**
 */
export function mahlzeitZurZeit(stunde: number): string {
  if (stunde < 10) return 'breakfast'
  if (stunde < 15) return 'lunch'
  if (stunde < 21) return 'dinner'
  return 'snack'
}

export function ErfassenModal({
  food, datum, onClose, onFertig,
}: {
  food: { id: string; name: string; kcal: number | null }
  /** Der Tag, in den geschrieben wird — aus der Seitenadresse. */
  datum: string
  onClose: () => void
  onFertig: () => void
}) {
  const [typ, setTyp] = React.useState<string>(
    () => mahlzeitZurZeit(new Date().getHours()))
  const [portionen, setPortionen] = React.useState<Portion[]>([])
  const [portion, setPortion] = React.useState<string>('')
  const [anzahl, setAnzahl] = React.useState('1')
  const [menge, setMenge] = React.useState('100')
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const [fertig, setFertig] = React.useState(false)

  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  // Die Portionen des Lebensmittels — derselbe Zweig, den das
  // Mahlzeitmodal benutzt (C-51).
  React.useEffect(() => {
    let weg = false
    void (async () => {
      try {
        const a = await fetch(`/api/nutrition/diary?portionen_fuer=${food.id}`)
        const d = await a.json()
        const p: Portion[] = a.ok ? (d.portionen ?? []) : []
        if (weg) return
        setPortionen(p)
        const vorgabe = p.find(x => x.is_default) ?? null
        if (vorgabe) {
          setPortion(vorgabe.name_de)
          setAnzahl('1')
          setMenge(String(vorgabe.amount_g))
        }
      } catch {
        if (!weg) setPortionen([])
      }
    })()
    return () => { weg = true }
  }, [food.id])

  function waehlePortion(name: string) {
    setPortion(name)
    const p = portionen.find(x => x.name_de === name)
    const n = Number(anzahl)
    if (p && Number.isFinite(n) && n > 0) {
      setMenge(String(Math.round(p.amount_g * n * 10) / 10))
    }
  }

  function setzeAnzahl(v: string) {
    setAnzahl(v)
    const p = portionen.find(x => x.name_de === portion)
    const n = Number(v)
    if (p && Number.isFinite(n) && n > 0) {
      setMenge(String(Math.round(p.amount_g * n * 10) / 10))
    }
  }

  async function hinzufuegen() {
    const g = Number(menge)
    if (!Number.isFinite(g) || g <= 0) {
      setFehler('Menge muss groesser als 0 sein.')
      return
    }
    setLaeuft(true)
    setFehler(null)
    try {
      // 1 . Die Mahlzeit des Tages, falls es sie noch nicht gibt.
      //     `[read]` Dieselbe Reihenfolge wie in `mahlzeiten.tsx`:
      //     erst die Mahlzeit, dann die Position. Die Route legt keine
      //     doppelte an — sie liefert die vorhandene zurueck.
      const m = await fetch('/api/nutrition/diary', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ art: 'mahlzeit', entry_date: datum, meal_type: typ }),
      })
      const md = await m.json()
      if (!m.ok) throw new Error(md?.error ?? 'Mahlzeit anlegen fehlgeschlagen.')

      // 2 . Die Position. `[cmd]` Entweder ALLE drei Portionsfelder
      //     oder keines — so prueft es der CHECK in 058a.
      const p = portionen.find(x => x.name_de === portion)
      const n = Number(anzahl)
      const portionsfelder = p && Number.isFinite(n) && n > 0
        ? { portion_name: p.name_de, portion_quantity: n, portion_amount_g: p.amount_g }
        : {}
      const a = await fetch('/api/nutrition/diary', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          art: 'position', meal_id: md.id as string,
          food_id: food.id, amount_g: g, ...portionsfelder,
        }),
      })
      const d = await a.json()
      if (!a.ok) throw new Error(d?.error ?? 'Hinzufuegen fehlgeschlagen.')
      setFertig(true)
      onFertig()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  const label = MAHLZEITEN.find(([k]) => k === typ)?.[1] ?? typ

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" style={{ width: 520 }}
           role="dialog" aria-modal="true"
           aria-label={`${food.name} hinzufuegen`}
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          <Icon name="plus" className="v2-ic v2-ic-sm" />
          <span className="v2-card-title">Zu {label} hinzufügen</span>
          <div className="v2-spacer" />
          <button type="button" className="v2-icon-btn" onClick={onClose}
                  aria-label="Schliessen">
            <Icon name="x" className="v2-ic v2-ic-sm" />
          </button>
        </div>

        <div className="v2-modal-body">
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{food.name}</div>
            <div className="v2-dim v2-mono" style={{ fontSize: 11 }}>
              {food.kcal === null ? '—' : `${Math.round(food.kcal)} kcal je 100 g`}
              {' · '}{datum}
            </div>
          </div>

          {/* Die Mahlzeit — das erste der beiden Felder, die der
              Food-DB-Reiter nicht kennt. */}
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Mahlzeit</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {MAHLZEITEN.map(([k, l]) => (
              <button
                key={k}
                type="button"
                className={typ === k ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
                style={{ height: 26, fontSize: 11, padding: '0 10px' }}
                aria-pressed={typ === k}
                onClick={() => setTyp(k)}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Portion und Menge — dieselbe Rechnung wie im
              Mahlzeitmodal, damit beide Wege dieselbe Zahl ergeben. */}
          {portionen.length > 0 && (
            <>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Portion</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                {portionen.map(p => (
                  <button
                    key={p.name_de}
                    type="button"
                    className={portion === p.name_de ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
                    style={{ height: 26, fontSize: 11, padding: '0 10px' }}
                    aria-pressed={portion === p.name_de}
                    onClick={() => waehlePortion(p.name_de)}
                  >
                    {p.name_de}
                    <span className="v2-dim v2-mono" style={{ marginLeft: 5, fontSize: 10 }}>
                      {p.amount_g} g
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            {portionen.length > 0 && (
              <div style={{ width: 90 }}>
                <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Anzahl</div>
                <input className="v2-feld" value={anzahl} inputMode="decimal"
                       onChange={e => setzeAnzahl(e.target.value)} />
              </div>
            )}
            <div style={{ width: 120 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Menge (g)</div>
              <input className="v2-feld" value={menge} inputMode="decimal" autoFocus
                     onChange={e => { setMenge(e.target.value); setPortion('') }} />
            </div>
          </div>

          {fehler && (
            <div className="v2-hinweis" style={{ marginTop: 10, color: 'var(--neg)' }}>
              {fehler}
            </div>
          )}
          {fertig && !fehler && (
            <div className="v2-hinweis" style={{ marginTop: 10, color: 'var(--pos)' }}>
              Zu {label} hinzugefügt.
            </div>
          )}
        </div>

        <div className="v2-modal-f">
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>
            {fertig ? 'Schließen' : 'Abbrechen'}
          </button>
          <button type="button" className="v2-btn v2-btn-primary"
                  disabled={laeuft} onClick={() => void hinzufuegen()}>
            {laeuft ? 'Speichert…' : 'Hinzufügen'}
          </button>
        </div>
      </div>
    </div>
  )
}
