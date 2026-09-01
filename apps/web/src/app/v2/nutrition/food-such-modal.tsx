'use client'

// ════════════════════════════════════════════════════════════════════
// DAS SUCHMODAL — G-320
// ════════════════════════════════════════════════════════════════════
//
// **Tom, 2026-09-02:** *„offen planner ist die lebensmittelsuche die
// muss gleich aufgebaut sein wie die suche in food db."*
//
// ══ WARUM MODAL UND NICHT PULLDOWN ══════════════════════════════════
//
// `[cmd]` **Die Zelle im Wochenraster ist rund 150 px breit.**
// `[cmd]` **`food_search` liefert aus 4.970 Lebensmitteln, mit zehn
// Sortierwerten** (G-281). `[read]` **Das passt in kein Pulldown.**
//
// ══ WAS GETEILT IST UND WAS NICHT ═══════════════════════════════════
//
// `[cmd]` **Geteilt: `useFoodSuche`** (`lib/nutrition/food-suche-hook.ts`)
// — Entprellen, Abbruch, Filterparameter, sechs Lehren (G-70, G-112,
// G-133, G-154, G-251, G-266).
//
// `[cmd]` **Geteilt: `vorschauFuer`, `tagesLage`, `mengeAusPortion`**
// (`lib/nutrition/menge-rechnen.ts`).
//
// `[cmd]` **NICHT geteilt: die Darstellung aus `tab-foods.tsx`.**
// `[read]` **Der Grund ist gemessen, nicht vermutet:** die Datei
// exportiert **genau ein** Bauteil — `NutritionFoodsTab`, den ganzen
// Reiter. **Die neun inneren Teile (`FilterChip`, `SortKopf`,
// `DaumenKnoepfe`, `filterLabel`, `facettenZahl`, `makro`, `zahl`,
// `PILLEN`, `FILTERGRUPPEN`) sind privat.**
//
// `[read]` **Sie herauszulösen wäre der richtige Weg, aber ein
// eigener Punkt:** der Reiter trägt 15 `useState`, davon **14 reine
// Suchlogik und einer (`erfassen`) reiterspezifisch** — das ist ein
// Umbau von 1.060 Zeilen, den ein UI-Auftrag nicht nebenbei macht.
// **Gemeldet, nicht stillschweigend nachgebaut.**
//
// `[read]` **Was dieses Modal davon übernimmt, ist die Anordnung:**
// dieselben Spalten (Name/Kategorie, kcal, P, C, F), dieselbe
// Sortierleiste, dieselbe Herkunftsangabe. **Kein zweiter
// Suchmechanismus** — der steht im Hook.

import * as React from 'react'
import { Icon, Pill } from '@lumeos/ui'

import type { NutritionFoodSearchRow } from '../../../lib/nutrition/food-search'
import {
  useFoodSuche, MODAL_GROESSE, LEERE_LAGE, type SuchLage,
} from '../../../lib/nutrition/food-suche-hook'
import {
  ALLE_SORTIERUNGEN, SORT_TEXT, sortiereSeite, type Sortierung,
} from '../../../lib/nutrition/food-sortierung'
import {
  vorschauFuer, tagesLage, mengeAusPortion,
  type Portion, type Vorschau,
} from '../../../lib/nutrition/menge-rechnen'

// ══ G-323: zwei Kontexte, nicht einer mit leeren Feldern ════════════
//
// **Tom, 2026-09-02:** *„das modal ist perfekt, wieso nutzen wir das
// nicht auch fuer rezepte?"*
//
// `[cmd]` **Gemessen, bevor gebaut wurde:** der alte `SuchKontext`
// hatte `datum`, `slot` und `ziel` als PFLICHTFELDER, und der
// Anzeigeblock schrieb *„am {datum}"* und *„für diesen Plan ist kein
// Tagesziel gesetzt"*.
//
// `[read]` **Für ein Rezept wäre beides falsch** — es hat keinen Tag,
// keine Mahlzeit und kein Tagesziel. **Ein Rezept mit `datum: ''` zu
// füttern hiesse, die Anzeige zu belügen** und darauf zu hoffen, dass
// niemand hinsieht.
//
// `[read]` **Also unterscheidet der Typ die beiden Fälle**, statt
// Felder leer zu lassen. **Der Compiler erzwingt dann, dass jeder
// Zweig behandelt wird** — eine vergessene Anzeige fällt beim
// Typecheck auf, nicht beim Nutzer.

/** Eine Position in einem Plantag — Tag, Mahlzeit, Tagesziel. */
export type TagesKontext = {
  art: 'tag'
  /** Der Tag, in den die Position gehört (ISO). */
  datum: string
  /** Die Mahlzeit — `breakfast`, `lunch`, … */
  slot: string
  /** Was der Tag schon trägt, in kcal. `null` = nicht bekannt. */
  schonImTag: number | null
  /** Das Tagesziel des Plans (`target_kcal`). `null` = keines gesetzt. */
  ziel: number | null
  /** Der Name der Mahlzeit, wie er am Schirm steht. */
  slotLabel?: string
}

/**
 * Eine Zutat in einem Rezept — G-323.
 *
 * `[read]` **Kein Tagesziel**, denn ein Rezept hat keines. `[read]`
 * **Was hier zählt, ist das Rezept und was schon drinsteht** — der
 * Auftrag nennt genau das.
 */
export type RezeptKontext = {
  art: 'rezept'
  /** Der Name des Rezepts, wie er im Formular steht. */
  rezeptName: string
  /** Wie viele Zutaten schon drin sind. */
  zutaten: number
  /** Was die bisherigen Zutaten zusammen tragen, in kcal. */
  schonImRezept: number | null
}

export type SuchKontext = TagesKontext | RezeptKontext

const MAKRO = (v: string | null | undefined): string => {
  const n = Number(v)
  return Number.isFinite(n) ? n.toFixed(1) : '—'
}

/**
 * Die Mengen-Eingabe mit Live-Vorschau — `SPEC_10`, Flow 1.
 *
 * **`SPEC_10`:** *„Mengen-Eingabe mit Portions-Selector und
 * Live-Naehrstoff-Preview"*. `[cmd]` **Bis G-320 nirgends gebaut.**
 *
 * `[read]` **Man soll sehen, was 150 g bedeuten, bevor man einträgt.**
 */
export function FoodAmountInput({
  food, portionen, menge, setMenge, kontext,
}: {
  food: NutritionFoodSearchRow
  portionen: readonly Portion[]
  menge: string
  setMenge: (v: string) => void
  kontext: SuchKontext
}) {
  const [portion, setPortion] = React.useState('')
  const [anzahl, setAnzahl] = React.useState('1')

  const g = Number(menge.replace(',', '.'))
  const vorschau: Vorschau = vorschauFuer(food, g)
  // `[read]` **G-323: die Tageslage gibt es nur im Tagesfall.** Ein
  // Rezept hat kein Tagesziel — `tagesLage` mit `null, null` würde
  // zwar rechnen, aber die Zahl hätte keine Bedeutung.
  const lage = kontext.art === 'tag'
    ? tagesLage(kontext.schonImTag, vorschau.kcal, kontext.ziel)
    : { summe: null, anteil: null, ueber: false }

  function waehlePortion(name: string) {
    setPortion(name)
    const m = mengeAusPortion(portionen, name, Number(anzahl))
    if (m !== null) setMenge(String(m))
  }

  function setzeAnzahl(v: string) {
    setAnzahl(v)
    const m = mengeAusPortion(portionen, portion, Number(v))
    if (m !== null) setMenge(String(m))
  }

  return (
    <div className="v2-col-gap" style={{ gap: 8 }}>
      {/* ══ Portion und Menge ═══════════════════════════════════════
          `[read]` **Die Portionen stehen VOR dem Grammfeld** — wer
          „1 Scheibe" wählt, will nicht erst 30 ausrechnen. **Das
          Grammfeld bleibt sichtbar und führt**: es ist der Wert, der
          gespeichert wird. */}
      {portionen.length > 0 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 10 }}>
            <span className="v2-eyebrow">Portion</span>
            <select className="v2-feld" style={{ fontSize: 11, minWidth: 150 }}
                    value={portion} aria-label="Portion"
                    onChange={e => waehlePortion(e.target.value)}>
              <option value="">Custom amount (g)</option>
              {portionen.map(p => (
                <option key={p.name_de} value={p.name_de}>
                  {p.name_de} · {p.amount_g} g
                </option>
              ))}
            </select>
          </label>
          {portion && (
            <label style={{ fontSize: 10 }}>
              <span className="v2-eyebrow">Anzahl</span>
              <input className="v2-feld" type="number" min="0.25" step="0.25"
                     style={{ fontSize: 11, width: 80 }} value={anzahl}
                     aria-label="Anzahl Portionen"
                     onChange={e => setzeAnzahl(e.target.value)} />
            </label>
          )}
        </div>
      )}

      <label style={{ fontSize: 10 }}>
        <span className="v2-eyebrow">Menge (g)</span>
        <input className="v2-feld" type="number" min="1" step="1"
               style={{ fontSize: 12, width: 120 }} value={menge}
               aria-label="Menge in Gramm"
               onChange={e => { setMenge(e.target.value); setPortion('') }} />
      </label>

      {/* ══ Die Live-Vorschau ═══════════════════════════════════════
          `[cmd]` **Gerechnet, nicht gefragt:** `food_nutrient_snapshot`
          rechnet linear (2026-09-02 gegengeprüft, 168.00 = 112·1,5).
          **Eine Rundreise je Tastendruck wäre G-252 in klein.**

          `[read]` **Der gespeicherte Wert kommt weiter vom Server** —
          das hier heisst „Vorschau", weil es eine ist. */}
      <div data-probe="vorschau" style={{
        display: 'flex', gap: 14, flexWrap: 'wrap',
        padding: '8px 10px', borderRadius: 6,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
      }}>
        {([
          ['kcal', vorschau.kcal, ''],
          ['Protein', vorschau.protein, ' g'],
          ['KH', vorschau.kh, ' g'],
          ['Fett', vorschau.fett, ' g'],
        ] as const).map(([label, wert, einheit]) => (
          <div key={label}>
            <div className="v2-eyebrow">{label}</div>
            <div className="v2-num" style={{ fontSize: 14, fontWeight: 600 }}>
              {wert === null ? '—' : `${wert}${einheit}`}
            </div>
          </div>
        ))}
      </div>

      {/* ══ Der Kontext — je nach Art ein anderer ═══════════════════
          **Planner:** *„Wer mittags 800 kcal einträgt, soll sehen, wo
          er landet."*

          **G-323, Rezept:** kein Tag, keine Mahlzeit, kein Tagesziel
          — **sondern das Rezept und was schon drinsteht.** */}
      <div data-probe="tageskontext" className="v2-muted"
           style={{ fontSize: 10.5, lineHeight: 1.6 }}>
        {kontext.art === 'tag' ? (
          <>
            <strong>{kontext.slotLabel ?? kontext.slot}</strong> am{' '}
            {kontext.datum}
            {lage.summe !== null && (
              <>
                {' · Tag danach: '}
                <span className="v2-num" style={{
                  fontWeight: 600,
                  color: lage.ueber ? 'var(--neg)' : 'inherit',
                }}>
                  {lage.summe} kcal
                </span>
                {kontext.ziel !== null && (
                  <>
                    {' von '}
                    <span className="v2-num">{kontext.ziel}</span>
                    {lage.anteil !== null && ` (${lage.anteil} %)`}
                  </>
                )}
              </>
            )}
            {/* `[read]` **Ohne Ziel steht kein Anteil da** — `null` ist
                die ehrliche Antwort, 0 % wäre eine Behauptung. */}
            {kontext.ziel === null
              && ' · für diesen Plan ist kein Tagesziel gesetzt'}
          </>
        ) : (
          <>
            {/* `[read]` **Kein Ziel, kein Prozentsatz** — ein Rezept
                hat keines, und eine Zahl zu zeigen, die es nicht gibt,
                wäre schlimmer als keine. */}
            Zutat für <strong>{kontext.rezeptName || 'das Rezept'}</strong>
            {' · '}
            {kontext.zutaten === 0
              ? 'noch keine Zutat'
              : `${kontext.zutaten} ${kontext.zutaten === 1 ? 'Zutat' : 'Zutaten'}`}
            {kontext.schonImRezept !== null && (
              <>
                {' · bisher '}
                <span className="v2-num" style={{ fontWeight: 600 }}>
                  {kontext.schonImRezept} kcal
                </span>
              </>
            )}
            {vorschau.kcal !== null && (
              <>
                {' · danach '}
                <span className="v2-num" style={{ fontWeight: 600 }}>
                  {Math.round((kontext.schonImRezept ?? 0) + vorschau.kcal)} kcal
                </span>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Das Suchmodal — G-320.
 *
 * `[read]` **Drei Aufrufer sind vorgesehen:** Planner (jetzt),
 * Rezept-Zutaten, Quick-add. **Deshalb bekommt es den Schreibweg von
 * aussen** (`onWaehlen`) statt selbst zu schreiben — ein Modal, das
 * seinen Schreibweg kennt, ist an ihn gebunden.
 */
export function FoodSuchModal({
  kontext, onWaehlen, onClose,
}: {
  kontext: SuchKontext
  /** Wird mit Lebensmittel und Menge gerufen; das Modal schreibt nicht. */
  onWaehlen: (food: NutritionFoodSearchRow, mengeG: number) => Promise<void>
  onClose: () => void
}) {
  const [lage, setLage] = React.useState<SuchLage>(LEERE_LAGE)
  const [gewaehlt, setGewaehlt] = React.useState<NutritionFoodSearchRow | null>(null)
  const [portionen, setPortionen] = React.useState<Portion[]>([])
  const [menge, setMenge] = React.useState('100')
  const [laeuftSchreiben, setLaeuftSchreiben] = React.useState(false)

  // ══ G-321: die verschobene Lage ═══════════════════════════════════
  //
  // **Tom, 2026-09-02:** *„das modal muss bewegbar werden."*
  //
  // `[read]` **Ein Versatz, keine Position** — die Hülle zentriert
  // per Flex, und `top`/`left` würden das aufheben. **`{0,0}` heisst
  // also: da, wo es von selbst steht.**
  const [versatz, setVersatz] = React.useState({ x: 0, y: 0 })
  const [zieht, setZieht] = React.useState(false)
  // `[read]` **Der Griffpunkt in einer Ref, nicht im Zustand** — er
  // ändert sich bei jeder Mausbewegung, und ein `setState` je Pixel
  // wäre ein Neuzeichnen je Pixel.
  const griff = React.useRef<{ mx: number; my: number; x: number; y: number } | null>(null)

  const zugStart = React.useCallback((e: React.MouseEvent) => {
    // `[read]` **Nur die linke Taste** — ein Rechtsklick öffnet das
    // Kontextmenü und liesse das Modal danach an der Maus kleben.
    if (e.button !== 0) return
    griff.current = { mx: e.clientX, my: e.clientY, x: versatz.x, y: versatz.y }
    setZieht(true)
  }, [versatz.x, versatz.y])

  // `[cmd]` **Die Zuhörer hängen am `window`, nicht am Modal** —
  // sonst reisst der Zug ab, sobald die Maus den Kasten verlässt.
  // **Das ist der übliche Fehler bei Ziehflächen**, und er fällt erst
  // bei schnellem Ziehen auf.
  React.useEffect(() => {
    if (!zieht) return
    const bewegen = (e: MouseEvent) => {
      const g = griff.current
      if (!g) return
      setVersatz({ x: g.x + (e.clientX - g.mx), y: g.y + (e.clientY - g.my) })
    }
    const los = () => { setZieht(false); griff.current = null }
    window.addEventListener('mousemove', bewegen)
    window.addEventListener('mouseup', los)
    return () => {
      window.removeEventListener('mousemove', bewegen)
      window.removeEventListener('mouseup', los)
    }
  }, [zieht])
  const [fehler, setFehler] = React.useState<string | null>(null)

  // `[read]` **Erst ab zwei Zeichen** — ein einzelner Buchstabe
  // liefert aus 4.970 Zeilen alles, was damit anfängt.
  const { zeilen, gesamt, laeuft, fehler: suchFehler } =
    useFoodSuche(lage, MODAL_GROESSE, null, 2)

  // G-70: was die Datenbank nicht sortieren kann, wird auf der Seite
  // sortiert — dieselbe Funktion wie im Reiter, kein zweiter Weg.
  const sortiert = React.useMemo(
    () => sortiereSeite(zeilen, lage.sortierung), [zeilen, lage.sortierung])

  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  async function waehle(f: NutritionFoodSearchRow) {
    setGewaehlt(f)
    setPortionen([])
    try {
      const a = await fetch(`/api/nutrition/diary?portionen_fuer=${f.id}`)
      const d = await a.json()
      const p: Portion[] = a.ok ? (d.portionen ?? []) : []
      setPortionen(p)
      const vorgabe = p.find(x => x.is_default)
      if (vorgabe) setMenge(String(vorgabe.amount_g))
    } catch {
      setPortionen([])
    }
  }

  async function eintragen() {
    if (!gewaehlt) return
    const g = Number(menge.replace(',', '.'))
    if (!Number.isFinite(g) || g <= 0) {
      setFehler('Die Menge muss grösser als 0 sein.')
      return
    }
    setLaeuftSchreiben(true)
    setFehler(null)
    try {
      await onWaehlen(gewaehlt, g)
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuftSchreiben(false)
    }
  }

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Lebensmittel suchen"
      // `[cmd]` **G-321: `zieht` bricht das Schliessen ab.**
      // `[read]` **Endet ein Zug auf der Huelle** — was bei
      // schnellem Schieben nach aussen passiert — **kaeme sonst ein
      // Klick an, und das Modal schloesse mitten in der Bewegung.**
      onClick={e => {
        if (!zieht && e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '5vh 16px', overflowY: 'auto',
      }}
    >
      <div
        data-probe="modal-kasten"
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, width: '100%', maxWidth: 760, padding: 16,
          // ══ G-321: die verschobene Lage ═════════════════
          // `[read]` **`translate`, nicht `top`/`left`** — die Hülle
          // zentriert per Flex; ein Positionswechsel würde das
          // aufheben und das Modal beim ersten Zug springen lassen.
          transform: `translate(${versatz.x}px, ${versatz.y}px)`,
        }}
      >
        {/* ══ G-321: die Titelleiste zieht ══════════════════
            **Tom, 2026-09-02:** *„das modal muss bewegbar werden."*

            `[cmd]` **Gemessen: `drag` 0, `transform` 0,
            `onMouseDown` 0.** `[read]` **Es verdeckte das Raster, in
            dem der Nutzer sieht, was der Tag schon trägt** —
            obwohl das Modal die Tagessumme kennt.

            `[read]` **Nur Ziehen** — kein Grössenändern, kein
            Andocken. `[read]` **Und der Schliessen-Knopf ist
            ausgenommen**, sonst wäre jeder Klick darauf ein Zug von
            0 px und das Modal bliebe offen. */}
        <div
          data-probe="titelleiste"
          onMouseDown={zugStart}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
            cursor: zieht ? 'grabbing' : 'grab',
            // `[read]` **Kein Textmarkieren beim Ziehen** — sonst
            // färbt sich der Titel blau, während man schiebt.
            userSelect: 'none',
          }}
        >
          <Icon name="more" className="v2-ic v2-ic-sm" />
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            Lebensmittel suchen
          </span>
          <div style={{ flex: 1 }} />
          {/* `[read]` **Zurücksetzen erscheint erst, wenn verschoben
              wurde** — ein Knopf, der nichts tut, ist keiner. */}
          {(versatz.x !== 0 || versatz.y !== 0) && (
            <button type="button" className="v2-btn v2-btn-sm"
                    onMouseDown={e => e.stopPropagation()}
                    onClick={() => setVersatz({ x: 0, y: 0 })}
                    title="Wieder in die Mitte">
              Zurücksetzen
            </button>
          )}
          <button type="button" className="v2-btn v2-btn-sm"
                  onMouseDown={e => e.stopPropagation()}
                  onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic v2-ic-sm" />
          </button>
        </div>

        {gewaehlt ? (
          // ══ Schritt 2: Menge ══════════════════════════════════════
          <div className="v2-col-gap" style={{ gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
            }}>
              <button type="button" className="v2-btn v2-btn-sm"
                      onClick={() => { setGewaehlt(null); setFehler(null) }}>
                <Icon name="chevron_left" className="v2-ic v2-ic-sm" />
                Zurück
              </button>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {gewaehlt.name_display_de || gewaehlt.name_de}
              </span>
              <Pill>BLS</Pill>
              <span className="v2-muted" style={{ fontSize: 10.5 }}>
                {gewaehlt.category_name_de || '—'}
              </span>
            </div>

            <FoodAmountInput
              food={gewaehlt}
              portionen={portionen}
              menge={menge}
              setMenge={setMenge}
              kontext={kontext}
            />

            {fehler && (
              <p style={{ fontSize: 11, color: 'var(--neg)', margin: 0 }}>{fehler}</p>
            )}

            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" className="v2-btn v2-btn-primary"
                      disabled={laeuftSchreiben} onClick={eintragen}>
                {laeuftSchreiben ? 'Trägt ein…' : 'Eintragen'}
              </button>
              <button type="button" className="v2-btn"
                      disabled={laeuftSchreiben} onClick={onClose}>
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          // ══ Schritt 1: Suchen ═════════════════════════════════════
          <div className="v2-col-gap" style={{ gap: 10 }}>
            <input
              className="v2-feld" autoFocus
              style={{ fontSize: 13, width: '100%' }}
              placeholder="Lebensmittel suchen …"
              aria-label="Lebensmittel suchen"
              value={lage.suche}
              onChange={e => setLage(l => ({ ...l, suche: e.target.value, seite: 0 }))}
            />

            {/* ══ Sortierung — dieselben Werte wie in Food DB ═══════
                `[cmd]` **`ALLE_SORTIERUNGEN` aus `food-sortierung.ts`**
                — keine eigene Liste, sonst gäbe es zwei Wahrheiten
                darüber, wonach sich sortieren lässt. */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ALLE_SORTIERUNGEN.map(s => (
                <button
                  key={s} type="button"
                  className={`v2-btn v2-btn-sm${lage.sortierung === s ? ' v2-btn-primary' : ''}`}
                  aria-pressed={lage.sortierung === s}
                  onClick={() => setLage(l => ({ ...l, sortierung: s as Sortierung, seite: 0 }))}
                >
                  {SORT_TEXT[s]}
                </button>
              ))}
            </div>

            {suchFehler && (
              <p style={{ fontSize: 11, color: 'var(--neg)', margin: 0 }}>{suchFehler}</p>
            )}

            {/* `[read]` **Die Trefferzahl steht da, nicht nur die
                Liste** — 12 von 340 ist etwas anderes als 12 von 12. */}
            {lage.suche.trim().length >= 2 && !laeuft && (
              <div className="v2-muted" data-probe="trefferzahl"
                   style={{ fontSize: 10.5 }}>
                {gesamt === 0
                  ? 'Keine Treffer.'
                  : `${sortiert.length} von ${gesamt} Treffern`}
              </div>
            )}

            {/* ══ G-321: die Tabellenklasse heisst `v2-tbl` ═════════
                **Tom, 2026-09-02:** *„es hat einen spaltenfehler
                drin."*

                `[cmd]` **Hier stand `className="v2-tab"`.** **Das ist
                die Klasse für REITER-Knöpfe** (`v2.css:423`), und sie
                setzt `display: flex`.

                `[cmd]` **Gemessen am 2026-09-02 mit „banane", 24
                Treffer:** `thead` bei y=493, Zeile 1 bei y=275,
                Zeile 8 bei y=520 — **der Kopf stand zwischen den
                Zeilen**, genau wie in Toms Bild. **Und die Werte
                liefen ungetrennt: *79 1.3 15.9 0.4***, weil Flex die
                Zellen zusammenschiebt und keine Spaltenbreite gilt.

                `[cmd]` **Der Verdacht aus dem Auftrag war ein
                anderer** — lange Kategorienamen, waagerechter Lauf.
                **Gemessen: `scrollWidth - clientWidth` = 0 px.** **Es
                lag nie am Überlauf.**

                `[cmd]` **`tab-foods.tsx:875` benutzt `v2-tbl`** — die
                Klasse für Tabellen. `[read]` **Dieselbe wie in Food
                DB, wie Tom es verlangt hat.**

                `[read]` **`overflowX` bleibt** — nicht als Ursache,
                sondern damit schmale Fenster die Tabelle rollen
                können statt die Seite. */}
            {sortiert.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table className="v2-tbl">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th style={{ width: 50 }}>Quelle</th>
                      <th style={{ width: 60, textAlign: 'right' }}>kcal</th>
                      <th style={{ width: 50, textAlign: 'right' }}>P</th>
                      <th style={{ width: 50, textAlign: 'right' }}>C</th>
                      <th style={{ width: 50, textAlign: 'right' }}>F</th>
                      <th style={{ width: 70, textAlign: 'right' }} />
                    </tr>
                  </thead>
                  <tbody>
                    {sortiert.map(f => (
                      <tr key={f.id}>
                        <td>
                          <div style={{ fontSize: 12, fontWeight: 500 }}>
                            {f.name_display_de || f.name_de}
                          </div>
                          <div className="v2-muted" style={{ fontSize: 10 }}>
                            {f.category_name_de || '—'}
                          </div>
                        </td>
                        <td><Pill>BLS</Pill></td>
                        <td className="v2-num" style={{ textAlign: 'right' }}>
                          {Number.isFinite(Number(f.enercc))
                            ? Math.round(Number(f.enercc)) : '—'}
                        </td>
                        <td className="v2-num" style={{ textAlign: 'right' }}>{MAKRO(f.prot625)}</td>
                        <td className="v2-num" style={{ textAlign: 'right' }}>{MAKRO(f.cho)}</td>
                        <td className="v2-num" style={{ textAlign: 'right' }}>{MAKRO(f.fat)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button type="button" className="v2-btn v2-btn-sm"
                                  onClick={() => waehle(f)}
                                  aria-label={`${f.name_display_de || f.name_de} wählen`}>
                            Wählen
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {lage.suche.trim().length < 2 && (
              <p className="v2-muted" style={{ fontSize: 11, margin: 0 }}>
                Mindestens zwei Zeichen eingeben.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
