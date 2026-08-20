'use client'

// Der Tab „Food DB" mit echten Daten (G-66).
//
// QUELLE: theme-v1/module-nutrition.jsx:520 (`NutritionFoods`).
//
// UEBERNOMMEN: Aufbau und Reihenfolge — Suchfeld, `Filters`,
// `+ Custom food`, eine Reihe Kategorie-Pillen, Tabelle mit
// ★ · Food · Source · kcal/100g · P · C · F · Add.
//
// DIE DATENSCHICHT WIRD GETEILT, NICHT KOPIERT. Der Tab ruft
// `/api/nutrition/foods` auf — dieselbe Route wie `/v2/nutrition/suche`.
// `[cmd]` Dort sitzen `getLocalFoodSearch` und `recordFoodSearchEvent`
// in einem Aufruf; jede Suche von hier schreibt also eine Zeile nach
// `nutrition.search_events`, ohne dass dieser Tab das Protokoll kennt.
//
// `[read]` WARUM DIE EIGENE SEITE BLEIBT: `/v2/nutrition/suche` traegt
// die Detailansicht mit Naehrwertreitern, Portionen und
// Zerlegungsanzeige — das ist eine Arbeitsflaeche, kein Tab-Inhalt.
// Der Tab ist die Uebersicht des Entwurfs; wer ein Lebensmittel
// wirklich ansehen will, geht auf die Seite. Der Tab verlinkt sie.
import * as React from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { Card, Pill, Icon, InEntwicklungKnopf } from '@lumeos/ui'

import type {
  NutritionFoodSearchPayload, NutritionFoodSearchRow,
} from '../../../lib/nutrition/food-search'
// G-67: der Daumen in der Trefferliste.
import { DaumenKnoepfe, type Daumen } from './daumen'
import { daumenLesen } from './daumen-aktion'

/**
 * Die Pillen des Entwurfs, auf die Kategoriewurzeln abgebildet.
 *
 * `[cmd]` Der Entwurf zeigt zehn: All · Favorites · Recent · Meat ·
 * Fish · Grains · Dairy · Produce · Beverages · Supplements.
 *
 * `[read]` Sieben davon tragen. Was fehlt, steht im Bericht:
 *   - `Favorites` und `Recent` sind KEINE Kategorien. Favorites haengt
 *     an `food_preference_items` (C-94, ausdruecklich nicht dieser
 *     Auftrag), Recent am Protokoll `meal_items`.
 *   - `Supplements` hat keine Entsprechung — der BLS fuehrt keine
 *     Nahrungsergaenzung; das ist das Supplements-Modul.
 *   - `Produce` deckt ZWEI Wurzeln (Gemuese 717 + Obst 275).
 */
const PILLEN: Array<{ label: string; slug: string | null }> = [
  { label: 'All', slug: null },
  { label: 'Meat', slug: 'fleisch-gefluegel' },
  { label: 'Fish', slug: 'fisch-meeresfruechte' },
  { label: 'Grains', slug: 'getreide-brot-pasta' },
  { label: 'Dairy', slug: 'milch-kaese' },
  { label: 'Produce', slug: 'gemuese' },
  { label: 'Fruit', slug: 'obst' },
  { label: 'Beverages', slug: 'getraenke' },
  { label: 'Eggs', slug: 'eier' },
  { label: 'Fats & oils', slug: 'fette-oele' },
  { label: 'Sweets', slug: 'suesses-snacks' },
  { label: 'Legumes & nuts', slug: 'huelsenfruechte-nuesse-samen' },
  { label: 'Spices', slug: 'wuerzmittel-gewuerze' },
]

/** Zeilen je Seite. `[read]` 50 wie bisher — nur jetzt blaetterbar. */
const SEITE_GROESSE = 50

/** Die Sortierungen, die `nutrition.food_search` kennt. */
type Sortierung = 'relevance' | 'protein_desc' | 'kcal_asc' | 'name_asc'

/**
 * Die Filtergruppen (G-73).
 *
 * `[cmd]` Alle Zahlen am 2026-08-20 gegen `nutrition.food_tags`
 * gemessen. Sie stehen an der Option, damit niemand zwei Filter
 * kombiniert, die zusammen null Treffer ergeben.
 *
 * `[cmd]` **`halal`, `kosher` und `thai_food` fehlen bewusst** — die
 * ersten beiden sind Presets (C-93), `thai_food` hat null Zuordnungen.
 *
 * `[read]` **Die Allergene schalten anders:** man sucht *ohne*
 * Laktose, nicht *mit*. Sie stehen deshalb in einer eigenen Gruppe mit
 * eigener Beschriftung — die Zahl daneben ist die Zahl der
 * MARKIERTEN, nicht die der uebrigbleibenden.
 */
const FILTERGRUPPEN: Array<{
  titel: string
  art: 'auswahl' | 'ausschluss'
  optionen: Array<{ code: string; label: string; anzahl: number }>
}> = [
  {
    titel: 'Ernährungsform',
    art: 'auswahl',
    optionen: [
      // `[cmd]` Jeder vegane Eintrag traegt auch `vegetarian` — die
      // 1.377 sind eine Teilmenge der 1.751. Deshalb stehen sie
      // nebeneinander und nicht als „oder".
      { code: 'vegan', label: 'Vegan', anzahl: 1377 },
      { code: 'vegetarian', label: 'Vegetarisch', anzahl: 1751 },
    ],
  },
  {
    titel: 'Nährwert',
    art: 'auswahl',
    optionen: [
      { code: 'high_protein', label: 'Proteinreich', anzahl: 1400 },
      { code: 'low_carb', label: 'Low-Carb', anzahl: 4659 },
      { code: 'low_fat', label: 'Fettarm', anzahl: 2648 },
      { code: 'high_fiber', label: 'Ballaststoffreich', anzahl: 558 },
    ],
  },
  {
    titel: 'Verarbeitung',
    art: 'auswahl',
    optionen: [
      { code: 'whole_food', label: 'Grundnahrungsmittel', anzahl: 2884 },
      { code: 'ultra_processed', label: 'Hochverarbeitet', anzahl: 927 },
    ],
  },
]

/**
 * Die Allergene — Ausschluss, nicht Auswahl.
 *
 * `[read]` Man sucht *ohne* Laktose. Das ist die umgekehrte Schaltung
 * der Gruppen oben, und es geht **nicht ueber die Suchfunktion**:
 * `nutrition.food_search` nimmt `p_tag_code` als AUSWAHL entgegen, es
 * gibt keinen Parameter fuer „ohne". Ausschliessen kann die Funktion
 * nur ueber die gespeicherten Vorlieben (C-94, `hard_exclude`).
 *
 * `[cmd]` Deshalb wirkt dieser Schalter auf die geladene Seite, nicht
 * auf den ganzen Bestand — die Trefferzahl daneben sagt das an. Wer
 * dauerhaft ohne Laktose sucht, setzt es unter Preferences; dann
 * greift C-94 ueber alle 7.140.
 */
/**
 * Die Beschriftung eines Tag-Codes (G-101).
 *
 * `[read]` Der Code steht im Zustand, aber `high_protein` ist nichts,
 * was man einem Nutzer hinschreibt. Die Gruppen fuehren die
 * Beschriftung ohnehin — hier wird sie nur gefunden.
 */
function filterLabel(code: string): string {
  for (const g of FILTERGRUPPEN) {
    const o = g.optionen.find(x => x.code === code)
    if (o) return o.label
  }
  return code
}

/** Ein gesetzter Filter ueber der Liste, mit Weg-Knopf (G-101). */
function FilterChip({ label, onWeg }: { label: string; onWeg: () => void }) {
  return (
    <span
      className="v2-pill"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 6px 3px 10px', fontSize: 11,
        borderColor: 'color-mix(in oklch, var(--acc-nutri) 45%, var(--border))',
        color: 'var(--acc-nutri)',
        background: 'color-mix(in oklch, var(--acc-nutri) 10%, transparent)',
      }}
    >
      {label}
      <button
        type="button"
        aria-label={`Filter ${label} aufheben`}
        onClick={onWeg}
        style={{
          background: 'none', border: 0, padding: 0, cursor: 'pointer',
          color: 'inherit', display: 'inline-flex', alignItems: 'center',
        }}
      >
        <Icon name="x" className="v2-ic v2-ic-sm" />
      </button>
    </span>
  )
}

const ALLERGEN_AUSSCHLUSS: Array<{ code: string; label: string; anzahl: number }> = [
  { code: 'contains_lactose', label: 'Ohne Laktose', anzahl: 1021 },
  { code: 'contains_gluten', label: 'Ohne Gluten', anzahl: 622 },
  { code: 'contains_nuts', label: 'Ohne Nüsse', anzahl: 120 },
]

/**
 * Eine sortierbare Spaltenueberschrift.
 *
 * `[read]` Ein Klick setzt die Sortierung, ein zweiter nimmt sie
 * zurueck auf `relevance`. Die Suchfunktion kennt je Spalte nur EINE
 * Richtung (`kcal_asc`, `protein_desc`) — deshalb kein Umkehren,
 * sondern an/aus. Ein Pfeil, der eine Richtung verspricht, die die
 * Datenbank nicht liefert, waere schlimmer als keiner.
 */
function SortKopf({
  label, wert, aktiv, setzen,
}: {
  label: string
  wert: Sortierung
  aktiv: Sortierung
  setzen: (s: Sortierung) => void
}) {
  const an = aktiv === wert
  return (
    <button
      type="button"
      aria-pressed={an}
      title={an ? 'Sortierung aufheben' : `Nach ${label} sortieren`}
      onClick={() => setzen(an ? 'relevance' : wert)}
      style={{
        background: 'none', border: 0, padding: 0, cursor: 'pointer',
        font: 'inherit', color: an ? 'var(--acc-nutri)' : 'inherit',
        display: 'inline-flex', alignItems: 'center', gap: 3,
      }}
    >
      {label}
      {an && <Icon name={wert === 'kcal_asc' ? 'arrow_up' : 'arrow_down'}
                   className="v2-ic v2-ic-sm" />}
    </button>
  )
}

function zahl(text: string): number | null {
  const n = Number(text)
  return Number.isFinite(n) ? n : null
}

/** Ein Makro auf eine Nachkommastelle, oder ein Strich. */
function makro(text: string): string {
  const n = zahl(text)
  if (n === null) return '—'
  return n >= 10 ? String(Math.round(n)) : n.toFixed(1)
}

export function NutritionFoodsTab({
  start,
}: {
  start: NutritionFoodSearchPayload | null
}) {
  const [suche, setSuche] = React.useState('')
  const [kategorie, setKategorie] = React.useState<string | null>(null)
  const [payload, setPayload] = React.useState<NutritionFoodSearchPayload | null>(start)
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const [dauerMs, setDauerMs] = React.useState<number | null>(null)

  // G-73: Filterleiste, Blaettern und Sortierung.
  const [filterOffen, setFilterOffen] = React.useState(false)
  const [tag, setTag] = React.useState<string | null>(null)
  const [seite, setSeite] = React.useState(0)
  const [sortierung, setSortierung] = React.useState<Sortierung>('relevance')
  /** Allergene, die auf der geladenen Seite ausgeblendet werden. */
  const [ohne, setOhne] = React.useState<Set<string>>(new Set())

  // G-67: der Daumenstand je Lebensmittel, und was nach dem Abwerten
  // ausgeblendet ist.
  const [daumen, setDaumen] = React.useState<Record<string, Daumen>>({})
  const [ausgeblendet, setAusgeblendet] = React.useState<Set<string>>(new Set())

  const daumenGesetzt = React.useCallback((foodId: string, neu: Daumen) => {
    setDaumen(d => ({ ...d, [foodId]: neu }))
    // `[read]` Tom: „Sicherheitsabfrage, dann weg." Die Zeile
    // verschwindet erst nach dem Bestaetigen — die Abfrage sitzt im
    // Knopf, hier kommt nur noch das Ergebnis an.
    setAusgeblendet(s => {
      const n = new Set(s)
      if (neu === 'disliked') n.add(foodId)
      else n.delete(foodId)
      return n
    })
  }, [])

  const ersterLauf = React.useRef(true)
  const laufend = React.useRef<AbortController | null>(null)

  React.useEffect(() => {
    if (ersterLauf.current) { ersterLauf.current = false; return }
    const zeit = setTimeout(async () => {
      // Laufende Anfrage abbrechen, sonst ueberholt eine langsame
      // aeltere Antwort die neuere — dieselbe Vorsicht wie auf
      // `/v2/nutrition/suche`.
      laufend.current?.abort()
      const ctrl = new AbortController()
      laufend.current = ctrl

      setLaeuft(true)
      setFehler(null)
      const start = performance.now()
      const params = new URLSearchParams({
        q: suche,
        limit: String(SEITE_GROESSE),
        offset: String(seite * SEITE_GROESSE),
        sort: sortierung,
      })
      if (kategorie) params.set('category', kategorie)
      if (tag) params.set('tag', tag)
      try {
        const antwort = await fetch(`/api/nutrition/foods?${params.toString()}`,
          { signal: ctrl.signal })
        if (!antwort.ok) throw new Error(`HTTP ${antwort.status}`)
        // Die Route gibt die Nutzlast unverpackt zurueck.
        const daten = await antwort.json() as NutritionFoodSearchPayload
        setDauerMs(Math.round(performance.now() - start))
        setPayload(daten)
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return
        setFehler(e instanceof Error ? e.message : String(e))
      } finally {
        setLaeuft(false)
      }
    }, 180)
    return () => clearTimeout(zeit)
  }, [suche, kategorie, tag, seite, sortierung])

  // Jede Filteraenderung beginnt wieder auf Seite 1 — sonst stuende
  // man nach dem Filtern auf einer Seite, die es nicht mehr gibt.
  React.useEffect(() => { setSeite(0) }, [suche, kategorie, tag, sortierung])

  const alleZeilen: NutritionFoodSearchRow[] = payload?.foods ?? []
  // Abgewertete Zeilen verschwinden aus der Liste — aber erst nach dem
  // Bestaetigen, und nur bis zum naechsten Laden. `[read]` C-94 KANN
  // diese Liste laengst filtern (prefs=1 an der Route); sie tut es
  // BEWUSST nicht: das hier ist ein Katalog, und ein Katalog, dem
  // Eintraege fehlen, ist kaputt (G-13-Entscheidung, G-104 geprueft).
  const zeilen = alleZeilen
    .filter(f => !ausgeblendet.has(f.id))
    // G-73: Allergene ausblenden. Wirkt auf die geladene Seite —
    // Begruendung an `ALLERGEN_AUSSCHLUSS`.
    .filter(f => ohne.size === 0 || !f.tags.some(t => ohne.has(t)))
  const gesamt = payload?.total ?? 0
  const seiten = Math.max(1, Math.ceil(gesamt / SEITE_GROESSE))
  // Die Groesse des GANZEN Katalogs — aus dem ersten, ungefilterten
  // Laden. `gesamt` aendert sich beim Tippen und taugt nicht fuer den
  // Platzhalter.
  const katalogGroesse = start?.total ?? 0
  const aktiveFilter = (tag ? 1 : 0) + ohne.size
  const filterZuruecksetzen = React.useCallback(() => {
    setTag(null)
    setOhne(new Set())
  }, [])

  // G-67: den Daumenstand zu den sichtbaren Treffern nachladen.
  // `[read]` Ohne ihn saehe jede Zeile unbewertet aus, auch wenn sie es
  // nicht ist — der Auftrag verlangt ausdruecklich, dass der Zustand
  // beim Wiederoeffnen dasteht.
  React.useEffect(() => {
    const ids = alleZeilen.map(f => f.id)
    if (ids.length === 0) return
    let verworfen = false
    void daumenLesen(ids).then(stand => {
      if (verworfen) return
      setDaumen(stand)
      // Was schon abgewertet ist, gehoert beim Laden gleich ausgeblendet.
      setAusgeblendet(new Set(
        Object.entries(stand).filter(([, v]) => v === 'disliked').map(([k]) => k)))
    })
    return () => { verworfen = true }
  }, [payload])

  return (
    <div style={{ marginTop: 16 }}>
      <div className="v2-train-lib-filter" style={{ marginBottom: 16 }}>
        <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
          <Icon name="search" className="v2-ic v2-ic-sm"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-subtle)' }} />
          <input
            aria-label="Search foods"
            value={suche}
            onChange={e => setSuche(e.target.value)}
            // G-73: „· BLS (Bundeslebensmittelschluessel)" entfernt,
            // wie im Kopf, in der Suche und im Erfassungsfenster.
            placeholder={katalogGroesse > 0
              ? `Search across ${katalogGroesse.toLocaleString('en-US')} foods`
              : 'Search foods'}
            style={{
              width: '100%', height: 32, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '0 12px 0 30px', fontSize: 12, outline: 'none', color: 'var(--fg)',
            }}
          />
        </div>
        {/* G-73, Tom 2026-08-18: „Wir haben so viel Platz — lass die
            Filter einfach logisch darunter aufbauen, und der
            Filterknopf ist das Setup zum Filter ein- oder
            ausblenden." */}
        <button
          type="button"
          className={filterOffen ? 'v2-btn v2-btn-primary' : 'v2-btn'}
          aria-expanded={filterOffen}
          aria-controls="v2-food-filter"
          onClick={() => setFilterOffen(o => !o)}
        >
          <Icon name="filter" className="v2-ic v2-ic-sm" /> Filters
          {aktiveFilter > 0 && (
            <span className="v2-num" style={{ marginLeft: 6 }}>{aktiveFilter}</span>
          )}
        </button>
        <InEntwicklungKnopf titel="Custom food" className="v2-btn v2-btn-primary">
          <Icon name="plus" className="v2-ic v2-ic-sm" /> Custom food
        </InEntwicklungKnopf>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {PILLEN.map(p => {
          const aktiv = p.slug === kategorie
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => setKategorie(p.slug)}
              style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
            >
              <Pill variant={aktiv ? 'acc' : undefined}>{p.label}</Pill>
            </button>
          )
        })}
      </div>

      {/* G-73: die Filter stehen darunter, nicht hinter dem Knopf.
          Auf 375 px wird daraus ein Vollbild-Fenster (nutrition.css). */}
      {filterOffen && (
        <div id="v2-food-filter" className="v2-food-filter">
          <div className="v2-food-filter-kopf">
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>Filter</span>
            {aktiveFilter > 0 && (
              <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                      onClick={filterZuruecksetzen}>
                Zurücksetzen
              </button>
            )}
            <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => setFilterOffen(false)}>
              <Icon name="x" className="v2-ic v2-ic-sm" />
              <span className="v2-food-filter-schliessen-text">Schliessen</span>
            </button>
          </div>

          <div className="v2-food-filter-gruppen">
            {FILTERGRUPPEN.map(g => (
              <div key={g.titel}>
                <div className="v2-eyebrow" style={{ marginBottom: 6 }}>{g.titel}</div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {g.optionen.map(o => {
                    const aktiv = tag === o.code
                    return (
                      <button
                        key={o.code} type="button"
                        aria-pressed={aktiv}
                        className="v2-pill"
                        style={{
                          cursor: 'pointer', padding: '4px 10px', fontSize: 11,
                          borderColor: aktiv
                            ? 'color-mix(in oklch, var(--acc-nutri) 45%, var(--border))'
                            : 'var(--border)',
                          color: aktiv ? 'var(--acc-nutri)' : 'var(--fg-muted)',
                          background: aktiv
                            ? 'color-mix(in oklch, var(--acc-nutri) 10%, transparent)'
                            : 'var(--surface)',
                        }}
                        onClick={() => setTag(aktiv ? null : o.code)}
                      >
                        {o.label}
                        <span className="v2-num v2-dim" style={{ marginLeft: 5, fontSize: 10 }}>
                          {o.anzahl.toLocaleString('de-DE')}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Die Allergene schalten umgekehrt — „ohne" statt „mit". */}
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
                Allergene ausschliessen
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {ALLERGEN_AUSSCHLUSS.map(o => {
                  const aktiv = ohne.has(o.code)
                  return (
                    <button
                      key={o.code} type="button"
                      aria-pressed={aktiv}
                      className="v2-pill"
                      style={{
                        cursor: 'pointer', padding: '4px 10px', fontSize: 11,
                        borderColor: aktiv
                          ? 'color-mix(in oklch, var(--neg) 45%, var(--border))'
                          : 'var(--border)',
                        color: aktiv ? 'var(--neg)' : 'var(--fg-muted)',
                        background: aktiv
                          ? 'color-mix(in oklch, var(--neg) 10%, transparent)'
                          : 'var(--surface)',
                      }}
                      onClick={() => setOhne(s => {
                        const n = new Set(s)
                        if (n.has(o.code)) n.delete(o.code)
                        else n.add(o.code)
                        return n
                      })}
                    >
                      {o.label}
                      <span className="v2-num v2-dim" style={{ marginLeft: 5, fontSize: 10 }}>
                        {o.anzahl.toLocaleString('de-DE')}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="v2-dim" style={{ fontSize: 10, marginTop: 5, lineHeight: 1.4 }}>
                Blendet auf der angezeigten Seite aus. Dauerhaft und über den
                ganzen Bestand wirkt der Ausschluss über
                {' '}<strong>Preferences · Allergies</strong>.
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap',
      }}>
        <span className="v2-num" style={{ fontSize: 12 }}>
          {laeuft ? '…' : gesamt.toLocaleString('de-DE')}
          <span className="v2-dim"> Treffer</span>
        </span>
        {dauerMs != null && !laeuft && (
          <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{dauerMs} ms</span>
        )}
        {/* G-73, Tom: „Wenn man Treffer 279 zeigt, dann gibt man auch
            die Moeglichkeit, die alle anzuschauen." Statt „die ersten
            50" steht hier, WELCHE 50 — und die Knoepfe daneben. */}
        {gesamt > 0 && (
          <span className="v2-dim v2-num" style={{ fontSize: 10.5 }}>
            {(seite * SEITE_GROESSE + 1).toLocaleString('de-DE')}–
            {Math.min((seite + 1) * SEITE_GROESSE, gesamt).toLocaleString('de-DE')}
          </span>
        )}
        <Link href={'/v2/nutrition/suche' as Route} className="v2-link"
              style={{ marginLeft: 'auto', fontSize: 11.5 }}>
          Detailsuche mit Nährwerten →
        </Link>
      </div>

      {/*
        G-101, Tom 2026-08-20: „die angezeigte Liste filtermaessig
        anzeigen."

        `[cmd]` **Der Filter griff — man sah es nur nicht.** Gemessen
        am 2026-08-20: nach einem Klick auf „Proteinreich" steht die
        Trefferzahl auf 1.400, Avocado und Banane verschwinden aus der
        Liste. **Aber sobald das Filterband zu ist, kommt das Wort
        „Proteinreich" auf der ganzen Seite null Mal vor** — nur eine
        kleine `1` am Knopf.

        `[read]` Wer eine gefilterte Liste sieht, ohne zu wissen wonach,
        haelt sie fuer die ganze. Deshalb stehen die gesetzten Filter
        jetzt ueber der Liste — mit ihrem Namen, und jeder einzeln
        abwaehlbar.
      */}
      {aktiveFilter > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginBottom: 12, flexWrap: 'wrap',
        }}>
          <span className="v2-eyebrow">Gefiltert nach</span>
          {tag && (
            <FilterChip
              label={filterLabel(tag)}
              onWeg={() => setTag(null)}
            />
          )}
          {Array.from(ohne).map(code => (
            <FilterChip
              key={code}
              label={ALLERGEN_AUSSCHLUSS.find(a => a.code === code)?.label ?? code}
              onWeg={() => setOhne(s => {
                const n = new Set(s)
                n.delete(code)
                return n
              })}
            />
          ))}
          <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                  onClick={filterZuruecksetzen}>
            Alle aufheben
          </button>
        </div>
      )}

      {fehler && (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--neg)' }}>
            Die Suche antwortet nicht: {fehler}
          </div>
        </Card>
      )}

      <Card>
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                {/* G-67: die schmale erste Spalte des Entwurfs traegt
                    jetzt den Daumen. Sie war fuer das Lesezeichen
                    gedacht; Favorit und Daumen sind zwei Absichten,
                    und `food_preference_items` traegt beide. */}
                <th style={{ width: 58 }} />
                <th>Food</th>
                <th style={{ width: 70 }}>Source</th>
                {/* G-73: kcal und P sortieren. `[cmd]` Die Suchfunktion
                    kennt vier Sortierungen — `relevance`, `kcal_asc`,
                    `protein_desc`, `name_asc`. **C und F haben keine**,
                    deshalb bleiben sie unsortierbare Ueberschriften;
                    eine Sortierung im Browser waere nur die geladene
                    Seite und damit eine Falschaussage. */}
                <th style={{ width: 90, textAlign: 'right' }}>
                  <SortKopf label="kcal/100g" wert="kcal_asc"
                            aktiv={sortierung} setzen={setSortierung} />
                </th>
                <th style={{ width: 60, textAlign: 'right' }}>
                  <SortKopf label="P" wert="protein_desc"
                            aktiv={sortierung} setzen={setSortierung} />
                </th>
                <th style={{ width: 60, textAlign: 'right' }}>C</th>
                <th style={{ width: 60, textAlign: 'right' }}>F</th>
                <th style={{ width: 80, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {zeilen.map(f => {
                const k = zahl(f.enercc)
                return (
                  <tr key={f.id}>
                    <td>
                      <DaumenKnoepfe
                        foodId={f.id}
                        name={f.name_display_de || f.name_de}
                        zustand={daumen[f.id] ?? 'neutral'}
                        onGesetzt={neu => daumenGesetzt(f.id, neu)}
                      />
                    </td>
                    <td>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>
                        {f.name_display_de || f.name_de}
                      </div>
                      <div className="v2-muted" style={{ fontSize: 10.5 }}>
                        {f.category_name_de || '—'}
                      </div>
                    </td>
                    <td><Pill>BLS</Pill></td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>
                      {k === null ? '—' : Math.round(k)}
                    </td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{makro(f.prot625)}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{makro(f.cho)}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{makro(f.fat)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {/* `[read]` `Add` schreibt ins Tagebuch — das ist
                          der Erfassungspfad und ein eigener Auftrag.
                          Der Knopf fuehrt auf die Detailsuche, wo das
                          Erfassen gebaut ist. */}
                      <Link href={`/v2/nutrition/suche?food=${f.id}` as Route}
                            className="v2-btn"
                            style={{ height: 22, fontSize: 11, padding: '0 8px' }}>
                        <Icon name="plus" className="v2-ic v2-ic-sm" />Add
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {zeilen.length === 0 && !laeuft && !fehler && (
          <div className="v2-muted" style={{ fontSize: 12, padding: '14px 0', textAlign: 'center' }}>
            Kein Lebensmittel passt zu dieser Auswahl.
          </div>
        )}

        {/* G-73: Blaettern. `[cmd]` `nutrition.food_search` nimmt
            `p_offset` — gemessen: Offset 0 liefert „Tofu", Offset 50
            „Rind Oberschale, roh". */}
        {seiten > 1 && (
          <div className="v2-food-blaettern">
            <button type="button" className="v2-btn v2-btn-sm"
                    disabled={seite === 0 || laeuft}
                    onClick={() => setSeite(s => Math.max(0, s - 1))}>
              <Icon name="chevron_left" className="v2-ic v2-ic-sm" />
              Zurück
            </button>
            <span className="v2-num v2-dim" style={{ fontSize: 11 }}>
              Seite {(seite + 1).toLocaleString('de-DE')} von {seiten.toLocaleString('de-DE')}
            </span>
            <button type="button" className="v2-btn v2-btn-sm"
                    disabled={seite + 1 >= seiten || laeuft}
                    onClick={() => setSeite(s => Math.min(seiten - 1, s + 1))}>
              Weiter
              <Icon name="chevron_right" className="v2-ic v2-ic-sm" />
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}
