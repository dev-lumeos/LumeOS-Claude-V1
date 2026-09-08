'use client'

// Die Bearbeitung eines Stacks — G-373.
//
// `[cmd]` **Siebter Fall von A-71:** `ergaenzePosition`,
// `entfernePosition` und `setzeBestand` standen in `stack-write.ts`
// mit **null Aufrufern**. Diese Datei ist der Aufrufer.
//
// ## Der Mockup nennt die Felder
//
// `[cmd]` **`module-supplements-spec.jsx:562`, „Item customization":**
//
//     Custom name      "Morning Magnesium"
//     Own dose         can deviate from rec.
//     Own timing       any slot
//     Cycling config   {on_weeks, off_weeks}
//
// `[read]` **`cycling` fehlt hier bewusst** — es ist ein Objekt und
// braucht eine eigene Eingabe. **Gemeldet, nicht halb gebaut**
// (C-378: was nicht da ist, wird nicht erfunden).
import * as React from 'react'
import { Icon, Pill } from '@lumeos/ui'

import type { EigenerStack, StackPosten } from '../../../lib/supplements/substanz-read'
import {
  positionErgaenzen, positionEntfernen, bestandSetzen, positionAendern,
} from './stack-aktionen'

/**
 * Die Zeitpunkte, die `stack_items.timing` kennt.
 *
 * `[cmd]` **Aus `stack_items_timing_check` gemessen** (G-152) — in
 * G-373 stand hier `night`, **das der CHECK nicht kennt**: die
 * Auswahl haette beim Speichern abgelehnt. **Und drei erlaubte
 * Werte fehlten** (`bedtime`, `with_meal`, `any`).
 *
 * `[read]` **Eine Auswahlliste ist eine Zusage** — was darin steht,
 * muss die Datenbank annehmen.
 */
const TIMINGS = [
  'morning', 'midday', 'evening', 'pre_workout', 'post_workout',
  'bedtime', 'with_meal', 'any',
]

/**
 * Die Frequenzen, die `stack_items_frequency_check` zulaesst.
 *
 * `[cmd]` **Fuenf, nicht vier** — `cycling` steht auch im CHECK.
 * `[read]` **Es waehlbar zu machen ohne Zyklusfelder waere aber eine
 * halbe Zusage** — siehe den Vermerk zu G-374 unten.
 */
const FREQUENZEN = ['daily', 'weekdays', 'training_days', 'custom']

type Lauf = (was: () => Promise<{ ok: boolean; fehler?: string }>) => Promise<void>

/**
 * Eine Position mit ihren Feldern — der Gegenpart zu
 * *Item customization*.
 */
function PostenZeile({ p, lauf, laeuft }: {
  p: StackPosten; lauf: Lauf; laeuft: boolean
}) {
  const [offen, setOffen] = React.useState(false)
  const [name, setName] = React.useState(p.name)
  const [dosis, setDosis] = React.useState(String(p.dosis ?? ''))
  const [einheit, setEinheit] = React.useState(p.einheit ?? 'mg')
  const [timing, setTiming] = React.useState(p.timing ?? 'morning')
  const [frequenz, setFrequenz] = React.useState(p.frequenz ?? 'daily')
  const [bestand, setBestand] = React.useState(String(p.bestand ?? ''))

  return (
    <div style={{
      padding: 9, borderRadius: 6, background: 'var(--surface)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 12 }}>{p.name}</span>
        <span className="v2-num v2-dim" style={{ fontSize: 10.5 }}>
          {p.dosis ?? '—'} {p.einheit ?? ''}
        </span>
        {p.timing && <Pill style={{ fontSize: 9 }}>{p.timing}</Pill>}
        <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                onClick={() => setOffen(v => !v)}>
          {offen ? 'Zu' : 'Ändern'}
        </button>
        {/* `[cmd]` **G-373: der Knopf trug nur ein Icon** — in der
            Knopfliste stand er als namenlos, und niemand haette ihn
            per Tastatur oder Vorleser gefunden. */}
        <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                aria-label={`${p.name} entfernen`}
                title="Position entfernen"
                disabled={laeuft}
                onClick={() => void lauf(() => positionEntfernen(p.id))}>
          <Icon name="x" className="v2-ic v2-ic-sm" />
        </button>
      </div>

      {offen && (
        <div className="v2-col-gap" style={{ gap: 6, marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <input aria-label="Eigener Name" value={name}
                   onChange={e => setName(e.target.value)}
                   placeholder="Eigener Name"
                   style={{ flex: 2, minWidth: 130 }} className="v2-feld" />
            <input aria-label="Dosis" value={dosis} inputMode="decimal"
                   onChange={e => setDosis(e.target.value)}
                   placeholder="Dosis"
                   style={{ flex: 1, minWidth: 70 }} className="v2-feld" />
            <input aria-label="Einheit" value={einheit}
                   onChange={e => setEinheit(e.target.value)}
                   placeholder="mg"
                   style={{ flex: 1, minWidth: 60 }} className="v2-feld" />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <select aria-label="Timing" value={timing} className="v2-feld"
                    onChange={e => setTiming(e.target.value)}
                    style={{ flex: 1, minWidth: 110 }}>
              {TIMINGS.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
            <select aria-label="Frequenz" value={frequenz} className="v2-feld"
                    onChange={e => setFrequenz(e.target.value)}
                    style={{ flex: 1, minWidth: 110 }}>
              {FREQUENZEN.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
            <button type="button" className="v2-btn v2-btn-sm" disabled={laeuft}
                    onClick={() => void lauf(() => positionAendern(p.id, {
                      custom_name: name,
                      dose: Number(dosis) || undefined,
                      dose_unit: einheit,
                      timing,
                      frequency: frequenz,
                    }))}>
              Speichern
            </button>
          </div>
          {/* `[read]` **Der Bestand ist ein eigener Schreibweg**
              (`setzeBestand`) — er wird beim Verbrauch fortgeschrieben,
              nicht beim Bearbeiten der Dosis. */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className="v2-eyebrow" style={{ minWidth: 60 }}>Bestand</span>
            <input aria-label="Bestand" value={bestand} inputMode="decimal"
                   onChange={e => setBestand(e.target.value)}
                   placeholder={p.bestandEinheit ?? 'Stück'}
                   style={{ flex: 1, minWidth: 80 }} className="v2-feld" />
            <button type="button" className="v2-btn v2-btn-sm" disabled={laeuft}
                    onClick={() => void lauf(
                      () => bestandSetzen(p.id, Number(bestand) || 0))}>
              Bestand setzen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Die Posten eines Stacks — ausklappbar unter seiner Zeile.
 *
 * `[read]` **Nur der geoeffnete Stack zeigt sie** — vier Stacks mit
 * allen Posten waeren eine Liste, keine Uebersicht.
 */
export function StackPosten_Liste({ stack, lauf, laeuft }: {
  stack: EigenerStack; lauf: Lauf; laeuft: boolean
}) {
  const [neuName, setNeuName] = React.useState('')
  const [neuDosis, setNeuDosis] = React.useState('')
  const [neuEinheit, setNeuEinheit] = React.useState('mg')
  const [neuTiming, setNeuTiming] = React.useState('morning')

  return (
    <div className="v2-col-gap" style={{ gap: 6, marginTop: 8, paddingLeft: 10 }}>
      {stack.eintraege.length === 0 && (
        <div className="v2-dim" style={{ fontSize: 11 }}>
          Noch keine Position in diesem Stack.
        </div>
      )}
      {stack.eintraege.map(p => (
        <PostenZeile key={p.id} p={p} lauf={lauf} laeuft={laeuft} />
      ))}

      {/* ══ ergaenzePosition ═══════════════════════════════════════ */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4,
        paddingTop: 8, borderTop: '1px solid var(--border)',
      }}>
        <input aria-label="Neue Position" value={neuName}
               onChange={e => setNeuName(e.target.value)}
               placeholder="Name der Position"
               style={{ flex: 2, minWidth: 140 }} className="v2-feld" />
        <input aria-label="Dosis der neuen Position" value={neuDosis}
               inputMode="decimal"
               onChange={e => setNeuDosis(e.target.value)}
               placeholder="Dosis"
               style={{ flex: 1, minWidth: 70 }} className="v2-feld" />
        <input aria-label="Einheit der neuen Position" value={neuEinheit}
               onChange={e => setNeuEinheit(e.target.value)}
               style={{ flex: 1, minWidth: 60 }} className="v2-feld" />
        <select aria-label="Timing der neuen Position" value={neuTiming}
                className="v2-feld" onChange={e => setNeuTiming(e.target.value)}
                style={{ flex: 1, minWidth: 110 }}>
          {TIMINGS.map(x => <option key={x} value={x}>{x}</option>)}
        </select>
        <button type="button" className="v2-btn v2-btn-sm"
                disabled={laeuft || !neuName.trim() || !neuDosis}
                onClick={() => void lauf(() => positionErgaenzen({
                  stack_id: stack.id,
                  custom_name: neuName,
                  dose: Number(neuDosis),
                  dose_unit: neuEinheit,
                  timing: neuTiming,
                })).then(() => { setNeuName(''); setNeuDosis('') })}>
          <Icon name="plus" className="v2-ic v2-ic-sm" />Position
        </button>
      </div>

      {/* `[read]` **Cycling fehlt** — der Mockup nennt es
          (`{on_weeks, off_weeks}`), aber es ist ein Objekt und
          braucht eine eigene Eingabe. Gemeldet in G-373. */}
      <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 2 }}>
        Cycling ist noch nicht eingebaut — der Mockup führt es unter
        „Item customization&ldquo; als <span className="v2-mono">
        {'{on_weeks, off_weeks}'}</span>. Ohne einen Zyklusbeginn
        ergibt das kein „Wk 5 of 8&ldquo;: <span className="v2-mono">
        stack_items</span> hält in keiner der 17 Spalten ein
        Startdatum (G-374, gemessen).
      </div>
    </div>
  )
}
