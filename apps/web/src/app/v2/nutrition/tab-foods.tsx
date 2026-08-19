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
      const params = new URLSearchParams({ q: suche, limit: '50' })
      if (kategorie) params.set('category', kategorie)
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
  }, [suche, kategorie])

  const alleZeilen: NutritionFoodSearchRow[] = payload?.foods ?? []
  // Abgewertete Zeilen verschwinden aus der Liste — aber erst nach dem
  // Bestaetigen, und nur bis zum naechsten Laden: dann kommen sie gar
  // nicht mehr, sobald C-94 die Suche filtert. Bis dahin ist das
  // Ausblenden die sichtbare Wirkung.
  const zeilen = alleZeilen.filter(f => !ausgeblendet.has(f.id))
  const gesamt = payload?.total ?? 0

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
            placeholder="Search across 7,140 foods · BLS (Bundeslebensmittelschlüssel)"
            style={{
              width: '100%', height: 32, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '0 12px 0 30px', fontSize: 12, outline: 'none', color: 'var(--fg)',
            }}
          />
        </div>
        {/* `[read]` `Filters` bleibt ohne Ziel: die Facetten der Suche
            (Zubereitung, Gruppen, Tags) sind auf der eigenen Seite
            gebaut. Ein zweiter Satz Filter hier waere eine zweite
            Wahrheit. */}
        <InEntwicklungKnopf titel="Filters" className="v2-btn">
          <Icon name="filter" className="v2-ic v2-ic-sm" /> Filters
        </InEntwicklungKnopf>
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
        {zeilen.length < gesamt && (
          <span className="v2-dim" style={{ fontSize: 10.5 }}>
            zeigt die ersten {zeilen.length}
          </span>
        )}
        <Link href={'/v2/nutrition/suche' as Route} className="v2-link"
              style={{ marginLeft: 'auto', fontSize: 11.5 }}>
          Detailsuche mit Nährwerten →
        </Link>
      </div>

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
                <th style={{ width: 90, textAlign: 'right' }}>kcal/100g</th>
                <th style={{ width: 60, textAlign: 'right' }}>P</th>
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
      </Card>
    </div>
  )
}
