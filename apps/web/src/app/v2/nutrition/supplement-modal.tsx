'use client'

// Supplement in die Mahlzeit — G-478, die Kacheln.
//
// **Tom, 2026-09-18:** *„wann kommt eigentlich das todo, dass ich in
// nutrition diary auch supplements wie whey hinzufuegen kann?"*
//
// ══ WAS G-475 SCHON GEMESSEN HAT ════════════════════════════════════
//
// `[cmd]` **Gegen die Datenbank belegt:** Portion `31 Gram(s)`,
// Anzahl 1 -> **120 kcal / 24 g**, Anzahl 2 -> **240 / 48**.
// **Genau die Zahlen von Toms Etikett.**
//
// `[cmd]` **116.200 Portionsoptionen ueber 113.264 Produkte, davon
// 2.760 mit MEHRERER Wahl** — deshalb ein Pulldown und keine feste
// Groesse (A4).
//
// ══ DIE NAEHRWERTE KOMMEN NICHT VON HIER ════════════════════════════
//
// `[read]` **Diese Kachel schickt Produkt, Portion und Anzahl** —
// mehr nicht. `[cmd]` **Der Schreibweg holt die Werte zur gewaehlten
// Portion**, und der Trigger rechnet nach (C-513). **Wuerde der
// Browser Zahlen mitschicken, koennte er sie erfinden.**
import * as React from 'react'

import { ZiehModal } from './zieh-modal'
import {
  OHNE_NAEHRWERTE_SATZ, hatNaehrwerte, portionsLabel, standFuer, vorschau,
  type PortionsWahl, type SupplementTreffer,
} from '../../../lib/nutrition/supplement-posten-lage'

export function SupplementModal({ datum, onClose }: {
  datum: string
  onClose: () => void
}) {
  const [frage, setFrage] = React.useState('')
  const [treffer, setTreffer] = React.useState<SupplementTreffer[]>([])
  const [gewaehlt, setGewaehlt] = React.useState<SupplementTreffer | null>(null)
  const [portion, setPortion] = React.useState<string>('')
  const [anzahl, setAnzahl] = React.useState('1')
  const [mahlzeitId, setMahlzeitId] = React.useState('')
  const [mahlzeiten, setMahlzeiten] = React.useState<
    Array<{ id: string; meal_type: string }>>([])
  const [laeuft, setLaeuft] = React.useState(false)
  const [sucht, setSucht] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  // ══ G-478: nach der Wahl bleibt die Liste ZU ══════════════════════
  //
  // `[cmd]` **Ein erster Entwurf setzte nur `setFrage(t.name)`** — und
  // damit lief die Suche sofort wieder an, die Liste ging wieder auf
  // und **verdeckte den Speichernknopf.** `[cmd]` **Gemessen: 60
  // Klickversuche, jeder abgefangen** (*„subtree intercepts pointer
  // events"*).
  //
  // `[read]` **`gewaehltName` merkt sich, was zuletzt gewaehlt
  // wurde** — der Sucheffekt laesst genau diese Eingabe in Ruhe.
  // `[read]` **Steht VOR dem Effekt**, sonst liest er eine Variable,
  // die es noch nicht gibt.
  const [gewaehltName, setGewaehltName] = React.useState('')

  // `[read]` **Ein Posten braucht eine Mahlzeit** — dieselbe Ladung
  // wie im Quick-Add (G-340).
  React.useEffect(() => {
    let weg = false
    void (async () => {
      try {
        const a = await fetch(`/api/nutrition/diary?datum=${datum}`)
        const d = await a.json()
        if (weg || !a.ok) return
        const liste = (d.meals ?? []) as Array<{ id: string; meal_type: string }>
        setMahlzeiten(liste)
        if (liste[0]) setMahlzeitId(liste[0].id)
      } catch { /* die Auswahl bleibt leer, der Hinweis sagt es */ }
    })()
    return () => { weg = true }
  }, [datum])

  // ── Die Suche ────────────────────────────────────────────────────
  //
  // `[read]` **Entprellt und abbrechbar** — dieselbe Lehre wie in
  // `food-suche-hook.ts` (G-320) und der Allergiekachel (G-459):
  // **ohne Abbruch ueberholt eine langsame aeltere Antwort die
  // neuere.**
  const laufend = React.useRef<AbortController | null>(null)
  React.useEffect(() => {
    const q = frage.trim()
    if (q.length < 2) { setTreffer([]); return }
    // `[read]` **Steht im Feld genau der gewaehlte Name, ist nichts
    // zu suchen** — sonst geht die Liste nach der Wahl wieder auf
    // und verdeckt den Knopf darunter.
    if (q === gewaehltName) { setTreffer([]); return }
    const zeit = setTimeout(async () => {
      laufend.current?.abort()
      const ctrl = new AbortController()
      laufend.current = ctrl
      setSucht(true)
      try {
        const a = await fetch(
          `/api/nutrition/supplement-suche?q=${encodeURIComponent(q)}`,
          { signal: ctrl.signal })
        if (!a.ok) throw new Error(`HTTP ${a.status}`)
        const d = await a.json() as { treffer?: SupplementTreffer[] }
        setTreffer(d.treffer ?? [])
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return
        setTreffer([])
      } finally {
        setSucht(false)
      }
    }, 200)
    return () => clearTimeout(zeit)
  }, [frage, gewaehltName])

  const wahl: PortionsWahl | null = React.useMemo(() => {
    if (!gewaehlt) return null
    return gewaehlt.portionen.find(p => p.serving_size === portion) ?? null
  }, [gewaehlt, portion])

  const anzahlZahl = React.useMemo(() => {
    const n = Number(anzahl.trim().replace(',', '.'))
    return Number.isFinite(n) && n > 0 ? n : Number.NaN
  }, [anzahl])

  const schau = vorschau(wahl, anzahlZahl)
  const ohneWerte = gewaehlt ? !hatNaehrwerte(gewaehlt) : false
  const bereit = !!gewaehlt && mahlzeitId.length > 0
    && Number.isFinite(anzahlZahl)
    && (ohneWerte || portion.length > 0)

  function waehle(t: SupplementTreffer) {
    setGewaehlt(t)
    // `[read]` **Eine einzige Portion wird gleich gesetzt** — wer nur
    // eine Wahl hat, soll nicht waehlen muessen.
    setPortion(t.portionen.length > 0 ? t.portionen[0].serving_size : '')
    setTreffer([])
    setGewaehltName(t.name)
    setFrage(t.name)
  }

  async function anlegen() {
    if (!bereit || !gewaehlt) return
    setLaeuft(true)
    setFehler(null)
    try {
      const a = await fetch('/api/nutrition/diary', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          art: 'supplement',
          meal_id: mahlzeitId,
          product_id: gewaehlt.product_id,
          // `[cmd]` **Ohne Naehrwerte MUSS `serving_size` null sein**
          // — sonst wirft der Trigger (*„must remain visibly
          // unknown"*).
          serving_size: ohneWerte ? null : portion,
          serving_quantity: anzahlZahl,
          nutrient_status: standFuer(gewaehlt),
          food_name: gewaehlt.name,
        }),
      })
      if (!a.ok) {
        const d = await a.json().catch(() => null)
        setFehler(d?.error ?? `Fehler ${a.status}`)
        return
      }
      onClose()
      // `[read]` **Neu laden** — Tagessumme und Ringe kommen aus der
      // Serverkomponente.
      window.location.reload()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  return (
    <ZiehModal
      titel="Supplement hinzufügen"
      aria="Ein Supplement einer Mahlzeit hinzufügen"
      breite={480}
      probe="supplement-add"
      onClose={() => { if (!laeuft) onClose() }}
    >
      <div className="v2-col-gap" style={{ gap: 10 }}>
        <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.5 }}>
          Aus dem Produktkatalog — die Nährwerte kommen vom Etikett,
          nicht aus einer Schätzung.
        </div>

        {/* ── Die Suche ────────────────────────────────────────── */}
        <div style={{ position: 'relative' }}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Produkt</div>
          <input
            value={frage}
            onChange={e => { setFrage(e.target.value); setGewaehlt(null) }}
            placeholder={'z. B. „Gold Standard Whey"'}
            aria-label="Produkt suchen"
            data-probe="supplement-suche"
            className="v2-feld"
            style={{ height: 34, fontSize: 13, width: '100%' }}
          />
          {sucht && (
            <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 3 }}>
              Sucht…
            </div>
          )}
          {treffer.length > 0 && (
            <div className="v2-supp-trefferliste" data-probe="supplement-treffer">
              {treffer.map(t => (
                <button
                  key={t.product_id}
                  type="button"
                  className="v2-supp-treffer"
                  onClick={() => waehle(t)}
                >
                  <span className="v2-supp-treffer-name">{t.name}</span>
                  <span className="v2-supp-treffer-rand">
                    {t.marke ?? '—'}
                    {/* `[read]` **Die Zahl sagt, ob es eine Wahl
                        gibt** — 0 heisst: keine Naehrwerte (A5). */}
                    {t.portionen.length > 1
                      ? ` · ${t.portionen.length} Portionsgrößen`
                      : t.portionen.length === 0
                        ? ' · ohne Nährwerte'
                        : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── A5: das Produkt ohne Naehrwerte ──────────────────── */}
        {gewaehlt && ohneWerte && (
          <div className="v2-supp-ohne-werte" data-probe="supplement-ohne-werte">
            {OHNE_NAEHRWERTE_SATZ}
          </div>
        )}

        {/* ── A4: die Portionswahl ─────────────────────────────── */}
        {gewaehlt && !ohneWerte && (
          <div>
            <div className="v2-eyebrow" style={{ marginBottom: 4 }}>
              Portionsgröße
              {gewaehlt.portionen.length > 1 && (
                <span className="v2-dim">
                  {' '}— {gewaehlt.portionen.length} zur Wahl
                </span>
              )}
            </div>
            <select
              className="v2-feld"
              value={portion}
              onChange={e => setPortion(e.target.value)}
              aria-label="Portionsgröße"
              data-probe="supplement-portion"
              style={{ height: 34, fontSize: 13, width: '100%' }}
            >
              {gewaehlt.portionen.map(p => (
                <option key={p.serving_size} value={p.serving_size}>
                  {portionsLabel(p)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ── Anzahl ───────────────────────────────────────────── */}
        {gewaehlt && (
          <div>
            <div className="v2-eyebrow" style={{ marginBottom: 4 }}>
              Anzahl Portionen
            </div>
            <input
              value={anzahl}
              onChange={e => setAnzahl(e.target.value)}
              aria-label="Anzahl Portionen"
              data-probe="supplement-anzahl"
              className="v2-feld"
              style={{ height: 34, fontSize: 13, width: 120 }}
            />
            {/* `[read]` **Die Vorschau rechnet NUR fuer die Anzeige**
                — geschrieben wird nichts davon. */}
            {schau.enercc !== null && (
              <div className="v2-dim" style={{ fontSize: 11, marginTop: 4 }}
                   data-probe="supplement-vorschau">
                Ergibt {schau.enercc.toLocaleString('de-DE')} kcal
                {schau.prot625 !== null
                  && ` · ${schau.prot625.toLocaleString('de-DE')} g Protein`}
              </div>
            )}
          </div>
        )}

        {/* ── Die Mahlzeit ─────────────────────────────────────── */}
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Mahlzeit</div>
          {mahlzeiten.length === 0
            ? (
              <div className="v2-dim" style={{ fontSize: 11 }}>
                Für diesen Tag gibt es noch keine Mahlzeit. Erst eine
                anlegen, dann das Supplement hinzufügen.
              </div>
              )
            : (
              <select
                className="v2-feld"
                value={mahlzeitId}
                onChange={e => setMahlzeitId(e.target.value)}
                aria-label="Mahlzeit"
                data-probe="supplement-mahlzeit"
                style={{ height: 34, fontSize: 13, width: '100%' }}
              >
                {mahlzeiten.map(m => (
                  <option key={m.id} value={m.id}>{m.meal_type}</option>
                ))}
              </select>
              )}
        </div>

        {fehler && (
          <div className="v2-supp-fehler" data-probe="supplement-fehler">
            {fehler}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" className="v2-btn v2-btn-ghost"
                  onClick={onClose} disabled={laeuft}>
            Abbrechen
          </button>
          <button type="button" className="v2-btn v2-btn-primary"
                  onClick={() => void anlegen()}
                  disabled={!bereit || laeuft}
                  data-probe="supplement-speichern">
            {laeuft ? 'Speichert…' : 'Hinzufügen'}
          </button>
        </div>
      </div>
    </ZiehModal>
  )
}
