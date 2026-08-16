'use client'

// Mahlzeiten erfassen (C-03) — der erste Schreibpfad mit fachlichem
// Inhalt.
//
// [read] Was hier entsteht, kann spaeter niemand rekonstruieren: die
// Naehrwerte werden beim Erfassen EINGEFROREN. Wird ein Lebensmittel
// morgen korrigiert, bleibt das Fruehstueck von heute, wie es war.
// Deshalb zeigt diese Flaeche den Zeitpunkt und die Menge, aus der
// gerechnet wurde — nicht nur einen Namen.
//
// Die Suche teilt sich diese Seite mit /v2/nutrition/suche: derselbe
// Aufruf an /api/nutrition/foods, dieselbe Protokollzeile in
// search_events.
import * as React from 'react'
import { Card, Pill, Icon, Row } from '@lumeos/ui'

import { MEAL_TYPES, type MealType } from '../../../lib/nutrition/diary-model'
import type { NutritionFoodSearchRow } from '../../../lib/nutrition/food-search'

const TYP_LABEL: Record<MealType, string> = {
  breakfast: 'Fruehstueck',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
  snack: 'Snack',
  pre_workout: 'vor dem Training',
  post_workout: 'nach dem Training',
  other: 'Sonstiges',
}

type Position = {
  id: string
  food_name: string
  amount_g: number
  enercc: number | null
  prot625: number | null
  fat: number | null
  cho: number | null
}

type Mahlzeit = {
  id: string
  entry_date: string
  meal_type: MealType
  notes: string | null
  items: Position[]
}

/** Was an die Route geht, wenn eine Portion gewaehlt wurde. */
type PortionsWahl = {
  portion_name: string
  portion_quantity: number
  portion_amount_g: number
}

type Portion = { name_de: string; amount_g: number; is_default: boolean }

type Zustand =
  | { art: 'ruhe' }
  | { art: 'laeuft' }
  | { art: 'fehler'; text: string }

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

export function Erfassen({ datum }: { datum: string }) {
  const [mahlzeiten, setMahlzeiten] = React.useState<Mahlzeit[]>([])
  const [zustand, setZustand] = React.useState<Zustand>({ art: 'ruhe' })
  const [offen, setOffen] = React.useState<string | null>(null)

  const laden = React.useCallback(async () => {
    try {
      const a = await fetch(`/api/nutrition/diary?datum=${datum}`)
      const d = await a.json()
      if (!a.ok) {
        setZustand({ art: 'fehler', text: d?.error ?? `HTTP ${a.status}` })
        return
      }
      setMahlzeiten(Array.isArray(d.meals) ? d.meals : [])
      setZustand({ art: 'ruhe' })
    } catch (e) {
      setZustand({ art: 'fehler', text: e instanceof Error ? e.message : String(e) })
    }
  }, [datum])

  React.useEffect(() => { void laden() }, [laden])

  async function schicke(methode: string, koerper: unknown, suffix = '') {
    setZustand({ art: 'laeuft' })
    try {
      const a = await fetch(`/api/nutrition/diary${suffix}`, {
        method: methode,
        headers: koerper ? { 'content-type': 'application/json' } : undefined,
        body: koerper ? JSON.stringify(koerper) : undefined,
      })
      const d = await a.json().catch(() => ({}))
      if (!a.ok) {
        setZustand({ art: 'fehler', text: d?.error ?? `HTTP ${a.status}` })
        return false
      }
      await laden()
      // Die Seite neu rendern, damit Tagessumme, Ringe und Deckung
      // stimmen — sie kommen aus der Serverkomponente.
      window.location.reload()
      return true
    } catch (e) {
      setZustand({ art: 'fehler', text: e instanceof Error ? e.message : String(e) })
      return false
    }
  }

  return (
    <Card
      title="Mahlzeiten erfassen"
      sub={`fuer den ${datum}`}
      actions={<Pill variant="acc">C-03</Pill>}
    >
      {zustand.art === 'fehler' && (
        <div className="v2-insight v2-neg" style={{ marginBottom: 12 }}>
          <div className="v2-insight-mark" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="v2-insight-title">Nicht gespeichert</div>
            <div className="v2-insight-body">{zustand.text}</div>
          </div>
        </div>
      )}

      <NeueMahlzeit
        datum={datum}
        vorhanden={mahlzeiten.map(m => m.meal_type)}
        laeuft={zustand.art === 'laeuft'}
        onAnlegen={typ => schicke('POST', { art: 'mahlzeit', entry_date: datum, meal_type: typ })}
      />

      {mahlzeiten.length === 0 && zustand.art !== 'laeuft' && (
        <p className="v2-muted" style={{ fontSize: 12, marginTop: 12 }}>
          Noch keine Mahlzeit an diesem Tag.
        </p>
      )}

      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mahlzeiten.map(m => (
          <MahlzeitKarte
            key={m.id}
            mahlzeit={m}
            offen={offen === m.id}
            onOeffnen={() => setOffen(offen === m.id ? null : m.id)}
            onHinzufuegen={(foodId, menge, portion) =>
              schicke('POST', {
                art: 'position', meal_id: m.id, food_id: foodId, amount_g: menge,
                ...(portion ?? {}),
              })}
            onMenge={(itemId, menge) =>
              schicke('PATCH', { id: itemId, amount_g: menge })}
            onEntfernen={itemId => schicke('DELETE', null, `?id=${itemId}`)}
          />
        ))}
      </div>
    </Card>
  )
}

function NeueMahlzeit({
  datum, vorhanden, laeuft, onAnlegen,
}: {
  datum: string
  vorhanden: MealType[]
  laeuft: boolean
  onAnlegen: (typ: MealType) => void
}) {
  return (
    <div>
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Mahlzeit anlegen</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {MEAL_TYPES.map(typ => {
          // `[cmd]` 052 hat ein UNIQUE auf (user_id, entry_date,
          // meal_type) — zweimal Fruehstueck am selben Tag ist ein
          // Konflikt (409). Besser gar nicht erst anbieten.
          const schonDa = vorhanden.includes(typ)
          return (
            <button
              key={typ}
              type="button"
              className="v2-btn"
              disabled={laeuft || schonDa}
              title={schonDa ? 'Fuer diesen Tag schon angelegt' : undefined}
              onClick={() => onAnlegen(typ)}
            >
              <Icon name="plus" className="v2-ic v2-ic-sm" /> {TYP_LABEL[typ]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MahlzeitKarte({
  mahlzeit, offen, onOeffnen, onHinzufuegen, onMenge, onEntfernen,
}: {
  mahlzeit: Mahlzeit
  offen: boolean
  onOeffnen: () => void
  onHinzufuegen: (foodId: string, menge: number, portion?: PortionsWahl) => void
  onMenge: (itemId: string, menge: number) => void
  onEntfernen: (itemId: string) => void
}) {
  const summe = mahlzeit.items.reduce((s, i) => s + (zahl(i.enercc) ?? 0), 0)

  return (
    <div className="v2-meal">
      <div className="v2-meal-kopf">
        <button type="button" className="v2-meal-titel" onClick={onOeffnen}
                aria-expanded={offen}>
          <Icon name={offen ? 'chevron_down' : 'chevron_right'} className="v2-ic v2-ic-sm" />
          {TYP_LABEL[mahlzeit.meal_type]}
        </button>
        <span className="v2-num v2-dim" style={{ fontSize: 11.5 }}>
          {mahlzeit.items.length} Position{mahlzeit.items.length === 1 ? '' : 'en'}
          {summe > 0 && ` · ${Math.round(summe)} kcal`}
        </span>
      </div>

      {mahlzeit.items.map(p => (
        <PositionZeile
          key={p.id}
          position={p}
          onMenge={menge => onMenge(p.id, menge)}
          onEntfernen={() => onEntfernen(p.id)}
        />
      ))}

      {offen && <Suchfeld onWaehlen={onHinzufuegen} />}
    </div>
  )
}

function PositionZeile({
  position, onMenge, onEntfernen,
}: {
  position: Position
  onMenge: (menge: number) => void
  onEntfernen: () => void
}) {
  const [menge, setMenge] = React.useState(String(position.amount_g))
  const geaendert = Number(menge) !== position.amount_g && Number(menge) > 0

  return (
    <div className="v2-position">
      <span className="v2-position-name">{position.food_name}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <input
          type="number"
          className="v2-feld"
          style={{ width: 78, textAlign: 'right' }}
          value={menge}
          min="0.1"
          step="1"
          aria-label={`Menge fuer ${position.food_name} in Gramm`}
          onChange={e => setMenge(e.target.value)}
        />
        <span className="v2-dim" style={{ fontSize: 11 }}>g</span>
      </span>
      <span className="v2-num v2-position-kcal">
        {zahl(position.enercc) === null ? '—' : `${Math.round(zahl(position.enercc)!)} kcal`}
      </span>
      <span style={{ display: 'flex', gap: 4 }}>
        <button
          type="button"
          className="v2-btn"
          disabled={!geaendert}
          title={geaendert ? 'Menge uebernehmen — Naehrwerte werden neu eingefroren' : 'Menge unveraendert'}
          onClick={() => onMenge(Number(menge))}
        >
          <Icon name="check" className="v2-ic v2-ic-sm" />
        </button>
        <button
          type="button"
          className="v2-btn v2-btn-ghost"
          title="Position entfernen"
          onClick={onEntfernen}
        >
          <Icon name="trash" className="v2-ic v2-ic-sm" />
        </button>
      </span>
    </div>
  )
}

/**
 * Lebensmittel suchen und mit Menge uebernehmen.
 *
 * Ruft dieselbe Route wie /v2/nutrition/suche — damit schreibt auch
 * diese Suche eine Zeile nach `search_events`, ohne davon zu wissen.
 */
function Suchfeld({ onWaehlen }: {
  onWaehlen: (foodId: string, menge: number, portion?: PortionsWahl) => void
}) {
  const [frage, setFrage] = React.useState('')
  const [treffer, setTreffer] = React.useState<NutritionFoodSearchRow[]>([])
  const [gewaehlt, setGewaehlt] = React.useState<NutritionFoodSearchRow | null>(null)
  const [menge, setMenge] = React.useState('100')
  const [sucht, setSucht] = React.useState(false)
  const [portionen, setPortionen] = React.useState<Portion[]>([])
  // Der Index in `portionen`; -1 heisst „direkt in Gramm".
  const [wahl, setWahl] = React.useState(-1)
  const [anzahl, setAnzahl] = React.useState('1')

  // Portionen laden, sobald ein Lebensmittel gewaehlt ist (C-51).
  React.useEffect(() => {
    if (!gewaehlt) { setPortionen([]); setWahl(-1); return }
    let aktiv = true
    void fetch(`/api/nutrition/diary?portionen_fuer=${gewaehlt.id}`)
      .then(a => a.json())
      .then(d => { if (aktiv) setPortionen(Array.isArray(d.portionen) ? d.portionen : []) })
      .catch(() => { if (aktiv) setPortionen([]) })
    return () => { aktiv = false }
  }, [gewaehlt])

  // Portion gewaehlt -> Menge folgt daraus. `[cmd]` Der CHECK in 058a
  // verlangt amount_g = Anzahl x Gramm je Portion.
  const anzahl_n = Number(anzahl)
  const aktivePortion = wahl >= 0 ? portionen[wahl] : null
  React.useEffect(() => {
    if (aktivePortion && anzahl_n > 0) {
      setMenge(String(Math.round(aktivePortion.amount_g * anzahl_n * 100) / 100))
    }
  }, [aktivePortion, anzahl_n])

  async function suche(e: React.FormEvent) {
    e.preventDefault()
    if (!frage.trim()) return
    setSucht(true)
    try {
      const a = await fetch(`/api/nutrition/foods?q=${encodeURIComponent(frage)}&limit=12`)
      const d = await a.json()
      setTreffer(Array.isArray(d.foods) ? d.foods : [])
    } finally {
      setSucht(false)
    }
  }

  const kcal = gewaehlt ? zahl(gewaehlt.enercc) : null
  const menge_n = Number(menge)
  const hochgerechnet = kcal !== null && menge_n > 0
    ? Math.round(kcal * menge_n / 100)
    : null

  return (
    <div className="v2-suchblock">
      <form onSubmit={suche} style={{ display: 'flex', gap: 6 }}>
        <input
          className="v2-feld"
          value={frage}
          placeholder="Lebensmittel suchen …"
          aria-label="Lebensmittel suchen"
          onChange={e => setFrage(e.target.value)}
        />
        <button type="submit" className="v2-btn" disabled={!frage.trim() || sucht}>
          <Icon name="search" className="v2-ic v2-ic-sm" />
        </button>
      </form>

      {treffer.length > 0 && !gewaehlt && (
        <div style={{ marginTop: 6, maxHeight: 190, overflowY: 'auto' }}>
          {treffer.map(t => (
            <button
              key={t.id}
              type="button"
              className="v2-hit"
              onClick={() => { setGewaehlt(t); setTreffer([]) }}
            >
              <span className="v2-hit-name">{t.name_display_de || t.name_de}</span>
              <span className="v2-hit-kcal v2-num">
                {zahl(t.enercc) === null ? '—' : `${Math.round(zahl(t.enercc)!)} kcal`}
              </span>
            </button>
          ))}
        </div>
      )}

      {gewaehlt && (
        <div style={{ marginTop: 8 }}>
          <Row
            label={gewaehlt.name_display_de || gewaehlt.name_de}
            value={<span className="v2-dim" style={{ fontSize: 11 }}>je 100 g</span>}
          />
          {portionen.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <select
                className="v2-feld"
                style={{ flex: 1 }}
                value={wahl}
                aria-label="Portion waehlen"
                onChange={e => setWahl(Number(e.target.value))}
              >
                <option value={-1}>direkt in Gramm</option>
                {portionen.map((p, i) => (
                  <option key={`${p.name_de}-${i}`} value={i}>
                    {p.name_de} — {p.amount_g} g
                  </option>
                ))}
              </select>
              {aktivePortion && (
                <>
                  <input
                    type="number"
                    className="v2-feld"
                    style={{ width: 68 }}
                    value={anzahl}
                    min="0.1"
                    step="0.5"
                    aria-label="Anzahl Portionen"
                    onChange={e => setAnzahl(e.target.value)}
                  />
                  <span className="v2-dim" style={{ fontSize: 11 }}>×</span>
                </>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <input
              type="number"
              className="v2-feld"
              style={{ width: 90 }}
              readOnly={aktivePortion !== null}
              title={aktivePortion ? 'Ergibt sich aus Portion x Anzahl' : undefined}
              value={menge}
              min="0.1"
              step="10"
              aria-label="Menge in Gramm"
              onChange={e => setMenge(e.target.value)}
            />
            <span className="v2-dim" style={{ fontSize: 11 }}>g</span>
            {hochgerechnet !== null && (
              <span className="v2-num v2-dim" style={{ fontSize: 11.5 }}>
                ≈ {hochgerechnet} kcal
              </span>
            )}
            <button
              type="button"
              className="v2-btn v2-btn-accent"
              disabled={!(menge_n > 0)}
              onClick={() => onWaehlen(
                gewaehlt.id,
                menge_n,
                aktivePortion && anzahl_n > 0
                  ? {
                      portion_name: aktivePortion.name_de,
                      portion_quantity: anzahl_n,
                      portion_amount_g: aktivePortion.amount_g,
                    }
                  : undefined,
              )}
              style={{ marginLeft: 'auto' }}
            >
              <Icon name="plus" className="v2-ic v2-ic-sm" /> Hinzufuegen
            </button>
            <button type="button" className="v2-btn v2-btn-ghost"
                    onClick={() => setGewaehlt(null)}>
              Zurueck
            </button>
          </div>
          <p style={{ fontSize: 10.5, color: 'var(--fg-dim)', marginTop: 6 }}>
            Beim Hinzufuegen werden die Naehrwerte <strong>eingefroren</strong> —
            eine spaetere Korrektur am Lebensmittel aendert diese Position
            nicht mehr.
          </p>
        </div>
      )}
    </div>
  )
}
