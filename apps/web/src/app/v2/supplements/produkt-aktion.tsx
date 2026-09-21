'use client'

// ════════════════════════════════════════════════════════════════════
// WAS MAN MIT EINEM PRODUKT TUN KANN — G-484
// ════════════════════════════════════════════════════════════════════
//
// **Tom, 2026-09-19:** *„in supplements, wenn ich ein produkt suche
// und waehlen will, muss die funktion her, dass ich es einem stack
// zuweisen kann mit den noetigen angaben, oder einem meal hinzufuegen
// kann"*
//
// **Und:** *„das muss natuerlich so gebaut werden, dass man waehlen
// kann, in welchen stack / in welches heutige meal"*
//
// `[read]` **Nicht eine Aktion, sondern eine WAHL** — deshalb je ein
// Pulldown, auch wenn es heute nur einen Stack gibt.
//
// `[cmd]` **Die Formregel kommt aus G-480** (`darfInMahlzeit`) —
// **gerufen, nicht nachgebaut.**
import * as React from 'react'
import { Icon } from '@lumeos/ui'

import {
  FREQUENZEN, FREQUENZ_TEXT, NUR_STACK_SATZ, TIMINGS, TIMING_TEXT,
  dosisEinheitVorgabe, pruefeStackEingabe, stackName, zieleFuer,
  type Frequenz, type Timing,
} from '../../../lib/supplements/produkt-aktion-lage'

export type StackWahl = { id: string; name: string; aktiv: boolean }
export type MahlzeitWahl = { id: string; typ: string; name: string; zeit: string | null }

/** Die Portionen des Produkts — fuer die Mahlzeit (A7). */
export type PortionWahl = { serving_size: string; enercc: number | null }

export function ProduktAktion({
  produktId, name, marke, produktform, portionseinheit, portionen,
}: {
  produktId: string
  name: string
  marke: string | null
  produktform: string | null
  portionseinheit: string | null
  /** Aus `ladeProdukt` -- ueber die ID geholt, nicht ueber den Namen. */
  portionen: PortionWahl[]
}) {
  // ══ G-484: die Portionen kommen ueber die ID ══════════════════
  //
  // `[cmd]` **Ein erster Entwurf suchte sie ueber den NAMEN.**
  // `[cmd]` **Gemessen: fuenf Produkte heissen ,,Gold Standard 100%
  // Whey Vanilla Ice Cream"**, die Namenssuche deckelt bei 150
  // Treffern, und die Id der offenen Tafel war nicht darunter.
  // **Die Kachel schrieb ,,keine Naehrwerte hinterlegt", obwohl das
  // Produkt eine Portion hat** — eine Falschaussage, erzeugt von
  // der Anzeige.
  //
  // `[read]` **Jetzt aus `ladeProdukt(id)`** — dieselbe Abfrage,
  // die die Tafel ohnehin macht.
  const ziele = zieleFuer(produktform)
  const kannMahlzeit = ziele.includes('mahlzeit')

  const [offen, setOffen] = React.useState<'stack' | 'mahlzeit' | null>(null)
  const [stacks, setStacks] = React.useState<StackWahl[] | null>(null)
  const [mahlzeiten, setMahlzeiten] = React.useState<MahlzeitWahl[] | null>(null)
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const [fertig, setFertig] = React.useState<string | null>(null)

  // Die Angaben fuer den Stack.
  const [stackId, setStackId] = React.useState('')
  const [dose, setDose] = React.useState('1')
  const [einheit, setEinheit] = React.useState(dosisEinheitVorgabe(portionseinheit))
  const [timing, setTiming] = React.useState<Timing>('morning')
  const [frequenz, setFrequenz] = React.useState<Frequenz>('daily')

  // Die Angaben fuer die Mahlzeit.
  const [mahlzeitId, setMahlzeitId] = React.useState('')
  const [portion, setPortion] = React.useState(portionen[0]?.serving_size ?? '')
  const [anzahl, setAnzahl] = React.useState('1')

  // `[read]` **Erst laden, wenn jemand die Wahl oeffnet** — der
  // Produkte-Reiter zeigt 214.780 Zeilen; eine Abfrage je Tafel waere
  // eine Rundreise fuer nichts.
  React.useEffect(() => {
    if (offen === null) return
    let abgebrochen = false
    fetch(`/api/supplements/produkt-ziele?datum=${new Date().toISOString().slice(0, 10)}`)
      .then(a => a.ok ? a.json() : null)
      .then(d => {
        if (abgebrochen || !d) return
        setStacks(d.stacks ?? [])
        setMahlzeiten(d.mahlzeiten ?? [])
        // `[read]` **Der aktive Stack ist die Vorgabe** — wer nur
        // einen hat, soll nichts waehlen muessen.
        const aktiv = (d.stacks ?? []).find((s: StackWahl) => s.aktiv)
        setStackId(v => v || aktiv?.id || (d.stacks ?? [])[0]?.id || '')
        setMahlzeitId(v => v || (d.mahlzeiten ?? [])[0]?.id || '')
      })
      .catch(() => { /* die Meldung kommt beim Absenden */ })
    return () => { abgebrochen = true }
  }, [offen])

  async function inDenStack() {
    const eingabe = {
      stack_id: stackId,
      dose: Number(dose.replace(',', '.')),
      dose_unit: einheit.trim(),
      frequency: frequenz,
      timing,
    }
    const meldung = pruefeStackEingabe(eingabe)
    if (meldung) { setFehler(meldung); return }
    setLaeuft(true); setFehler(null)
    try {
      const a = await fetch('/api/supplements/intake?was=position', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          // ══ C-518: der NAME, nicht eine geratene Substanz ═══════
          //
          // `[cmd]` **`stack_items` fuehrt Substanzen** — *„fuer die
          // sieben Stack-Stoffe gibt es 1.478 bis 29.004
          // Produktkandidaten, nie genau einer"*.
          //
          // `[read]` **Eine davon auszusuchen waere eine Behauptung.**
          // **Der CHECK laesst `custom_name` zu** — das Produkt steht
          // unter seinem eigenen Namen.
          supplement_id: null,
          custom_name: stackName(name, marke),
          ...eingabe,
          notes: `Produkt-Id ${produktId}`,
        }),
      })
      if (!a.ok) {
        const d = await a.json().catch(() => null)
        setFehler(d?.error ?? `Fehler ${a.status}`)
        return
      }
      const s = stacks?.find(x => x.id === stackId)
      setFertig(`In den Stack „${s?.name ?? 'Stack'}" übernommen.`)
      setOffen(null)
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally { setLaeuft(false) }
  }

  async function inDieMahlzeit() {
    if (!mahlzeitId) { setFehler('Bitte eine Mahlzeit wählen.'); return }
    setLaeuft(true); setFehler(null)
    try {
      const a = await fetch('/api/nutrition/diary', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          art: 'supplement',
          meal_id: mahlzeitId,
          product_id: produktId,
          // A7: ohne Portionen gibt es keine Naehrwerte — dann MUSS
          // `serving_size` null sein (Trigger C-513).
          serving_size: portionen.length > 0 ? portion : null,
          serving_quantity: Number(anzahl.replace(',', '.')) || 1,
          nutrient_status: portionen.length > 0
            ? 'available' : 'no_nutrients_available',
          food_name: name,
        }),
      })
      if (!a.ok) {
        const d = await a.json().catch(() => null)
        setFehler(d?.error ?? `Fehler ${a.status}`)
        return
      }
      const m = mahlzeiten?.find(x => x.id === mahlzeitId)
      setFertig(`Zu „${m?.name ?? 'Mahlzeit'}" hinzugefügt.`)
      setOffen(null)
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally { setLaeuft(false) }
  }

  return (
    <div className="v2-supp-aktion" data-probe="produkt-aktion">
      <div className="v2-supp-aktion-knoepfe">
        <button
          type="button" className="v2-btn v2-btn-sm"
          data-probe="aktion-stack"
          aria-pressed={offen === 'stack'}
          onClick={() => { setOffen(o => o === 'stack' ? null : 'stack'); setFertig(null) }}
        >
          <Icon name="plus" className="v2-ic v2-ic-sm" />
          In den Stack
        </button>

        {/* ══ A5/A6: die Form entscheidet ═══════════════════════════
            **Tom:** *„pillen/tablet/capsule gehoeren nicht in
            meals."* `[read]` **Der Knopf fehlt nicht stillschweigend
            — der Satz daneben sagt warum** (G-486). */}
        {kannMahlzeit ? (
          <button
            type="button" className="v2-btn v2-btn-sm"
            data-probe="aktion-mahlzeit"
            aria-pressed={offen === 'mahlzeit'}
            onClick={() => { setOffen(o => o === 'mahlzeit' ? null : 'mahlzeit'); setFertig(null) }}
          >
            <Icon name="plus" className="v2-ic v2-ic-sm" />
            Zu einer Mahlzeit
          </button>
        ) : (
          <span className="v2-supp-aktion-grund" data-probe="nur-stack-grund">
            {NUR_STACK_SATZ}
          </span>
        )}
      </div>

      {fertig && (
        <p className="v2-supp-aktion-fertig" data-probe="aktion-fertig">{fertig}</p>
      )}

      {/* ══ A1/A2: in den Stack, mit Wahl ═════════════════════════ */}
      {offen === 'stack' && (
        <div className="v2-supp-aktion-form" data-probe="stack-form">
          <label>
            <span className="v2-eyebrow">Stack</span>
            <select className="v2-feld" value={stackId} data-probe="stack-wahl"
                    aria-label="Stack wählen"
                    onChange={e => setStackId(e.target.value)}>
              {(stacks ?? []).map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.aktiv ? ' · aktiv' : ''}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="v2-eyebrow">Dosis</span>
            <input className="v2-feld" type="number" min="0.25" step="0.25"
                   value={dose} aria-label="Dosis" data-probe="stack-dosis"
                   onChange={e => setDose(e.target.value)} />
          </label>
          <label>
            <span className="v2-eyebrow">Einheit</span>
            <input className="v2-feld" value={einheit} aria-label="Einheit"
                   data-probe="stack-einheit"
                   onChange={e => setEinheit(e.target.value)} />
          </label>
          <label>
            <span className="v2-eyebrow">Zeitpunkt</span>
            <select className="v2-feld" value={timing} data-probe="stack-timing"
                    aria-label="Zeitpunkt"
                    onChange={e => setTiming(e.target.value as Timing)}>
              {TIMINGS.map(t => (
                <option key={t} value={t}>{TIMING_TEXT[t]}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="v2-eyebrow">Häufigkeit</span>
            <select className="v2-feld" value={frequenz} data-probe="stack-frequenz"
                    aria-label="Häufigkeit"
                    onChange={e => setFrequenz(e.target.value as Frequenz)}>
              {FREQUENZEN.map(f => (
                <option key={f} value={f}>{FREQUENZ_TEXT[f]}</option>
              ))}
            </select>
          </label>
          <button type="button" className="v2-btn v2-btn-sm v2-btn-primary"
                  disabled={laeuft} data-probe="stack-speichern"
                  onClick={inDenStack}>
            {laeuft ? 'Übernimmt…' : 'Übernehmen'}
          </button>
        </div>
      )}

      {/* ══ A3/A4: in eine HEUTIGE Mahlzeit ═══════════════════════ */}
      {offen === 'mahlzeit' && (
        <div className="v2-supp-aktion-form" data-probe="mahlzeit-form">
          <label>
            <span className="v2-eyebrow">Mahlzeit heute</span>
            <select className="v2-feld" value={mahlzeitId} data-probe="mahlzeit-wahl"
                    aria-label="Mahlzeit wählen"
                    onChange={e => setMahlzeitId(e.target.value)}>
              {(mahlzeiten ?? []).map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}{m.zeit ? ` · ${m.zeit.slice(0, 5)}` : ''}
                </option>
              ))}
            </select>
          </label>

          {/* A7: ohne Naehrwerte keine Portionswahl — und der Satz
              sagt es (derselbe wie im Suchmodal, G-478/A5). */}
          {portionen.length > 0 ? (
            <>
              <label>
                <span className="v2-eyebrow">Portionsgröße</span>
                <select className="v2-feld" value={portion} data-probe="mahlzeit-portion"
                        aria-label="Portionsgröße"
                        onChange={e => setPortion(e.target.value)}>
                  {portionen.map(p => (
                    <option key={p.serving_size} value={p.serving_size}>
                      {p.serving_size}
                      {p.enercc !== null ? ` · ${Math.round(p.enercc)} kcal` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="v2-eyebrow">Anzahl</span>
                <input className="v2-feld" type="number" min="0.25" step="0.25"
                       value={anzahl} aria-label="Anzahl" data-probe="mahlzeit-anzahl"
                       onChange={e => setAnzahl(e.target.value)} />
              </label>
            </>
          ) : (
            <p className="v2-supp-aktion-grund" data-probe="ohne-naehrwerte">
              Für dieses Produkt sind keine Nährwerte hinterlegt. Es wird
              erfasst, zählt aber nicht in die Tagesbilanz.
            </p>
          )}

          <button type="button" className="v2-btn v2-btn-sm v2-btn-primary"
                  disabled={laeuft} data-probe="mahlzeit-speichern"
                  onClick={inDieMahlzeit}>
            {laeuft ? 'Fügt hinzu…' : 'Hinzufügen'}
          </button>
        </div>
      )}

      {fehler && (
        <p className="v2-supp-aktion-fehler" data-probe="aktion-fehler">{fehler}</p>
      )}
    </div>
  )
}
