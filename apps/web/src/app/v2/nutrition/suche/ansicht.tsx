'use client'

// Suche, Trefferliste, Detailansicht.
//
// DIE DATENSCHICHT WIRD GETEILT, NICHT KOPIERT. Diese Seite ruft
// `/api/nutrition/foods` auf — dieselbe Route, die die bestehende Seite
// benutzt. Dort sitzen `getLocalFoodSearch` UND `recordFoodSearchEvent`
// in einem Aufruf; [cmd] deshalb schreibt jede Suche von hier eine
// Zeile nach `nutrition.search_events`, ohne dass diese Seite das
// Protokoll selbst kennt.
//
// [cmd] Die Sitzungskennung setzt `middleware.ts` fuer Pfade unter
// `/api/nutrition/foods` — also beim ersten Aufruf von hier. An der
// Middleware war nichts zu aendern.
import * as React from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import {
  Card, Pill, Icon, Row, Tabs, ModuleHero,
} from '@lumeos/ui'
import type {
  NutritionFoodSearchPayload,
  NutritionFoodSearchRow,
  NutritionFoodNutrientRow,
} from '../../../../lib/nutrition/food-search'
// G-67: der Daumen an der Detailansicht.
import { DaumenKnoepfe, type Daumen } from '../daumen'
import { daumenLesen } from '../daumen-aktion'

type Zustand =
  | { art: 'leer' }
  | { art: 'laeuft' }
  | { art: 'fehler'; text: string; code?: string }
  | { art: 'fertig'; payload: NutritionFoodSearchPayload }

function zahl(text: string): number | null {
  const n = Number(text)
  return Number.isFinite(n) ? n : null
}

/** kcal je 100 g, wie die Suche sie liefert. */
function kcal(row: NutritionFoodSearchRow): string {
  const n = zahl(row.enercc)
  return n === null ? '—' : `${Math.round(n)} kcal`
}

export function SucheAnsicht() {
  const [eingabe, setEingabe] = React.useState('')
  const [zustand, setZustand] = React.useState<Zustand>({ art: 'leer' })
  const [gewaehlt, setGewaehlt] = React.useState<string | undefined>()
  // G-67: der Daumenstand des gewaehlten Lebensmittels.
  const [daumen, setDaumen] = React.useState<Record<string, Daumen>>({})
  const [reiter, setReiter] = React.useState('naehrwerte')

  // Laufende Anfrage abbrechen, wenn eine neue startet: sonst kann eine
  // langsame aeltere Antwort eine neuere ueberschreiben.
  const laufend = React.useRef<AbortController | null>(null)

  const suche = React.useCallback(async (q: string, foodId?: string) => {
    laufend.current?.abort()
    const ctrl = new AbortController()
    laufend.current = ctrl

    setZustand({ art: 'laeuft' })
    const params = new URLSearchParams({ q, limit: '40' })
    if (foodId) params.set('food', foodId)

    try {
      const antwort = await fetch(`/api/nutrition/foods?${params}`, {
        signal: ctrl.signal,
      })
      const daten = await antwort.json()
      if (!antwort.ok) {
        setZustand({
          art: 'fehler',
          text: daten?.error ?? `HTTP ${antwort.status}`,
          code: daten?.code,
        })
        return
      }
      setZustand({ art: 'fertig', payload: daten as NutritionFoodSearchPayload })
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      setZustand({ art: 'fehler', text: e instanceof Error ? e.message : String(e) })
    }
  }, [])

  function absenden(e: React.FormEvent) {
    e.preventDefault()
    setGewaehlt(undefined)
    void suche(eingabe)
  }

  function waehle(row: NutritionFoodSearchRow) {
    setGewaehlt(row.id)
    // Erneut mit `food` abfragen: die Route protokolliert dann auch,
    // WELCHER Treffer gewaehlt wurde und auf welchem Rang.
    void suche(eingabe, row.id)
  }

  // ══ G-265: den Zustand aus der Adresse uebernehmen ═══════════════
  //
  // **Tom, 2026-08-29:** *,,food db +add falsches modal"*.
  //
  // `[cmd]` **Gemessen am 2026-08-29:** `+ Add` im Food-DB-Reiter ist
  // ein `Link` auf `/v2/nutrition/suche?food=<id>` — **kein Modal.**
  // `[cmd]` **Und der Parameter wurde hier nie gelesen:** `page.tsx`
  // ruehrt `searchParams` nicht an, `foodId` floss nur in ABGEHENDE
  // Anfragen. **Wer auf `+ Add` klickte, landete auf einer leeren
  // Suchseite** — Feld leer, null Treffer, das Lebensmittel nirgends
  // genannt.
  //
  // `[read]` **Der Knopf verliess also den Reiter UND tat nichts.**
  // Diese Stelle behebt die zweite Haelfte: der Zustand kommt mit.
  // **Was `+ Add` eigentlich sein sollte — ein Erfassungsmodal im
  // Reiter — ist gemeldet, nicht gebaut:** dafuer fehlt der Weg vom
  // Lebensmittel ins Tagebuch, und den gibt es hier nirgends.
  const startRef = React.useRef(false)
  React.useEffect(() => {
    if (startRef.current) return
    startRef.current = true
    const p = new URLSearchParams(window.location.search)
    const food = p.get('food') ?? undefined
    const q = p.get('q') ?? ''
    // Ohne beides bleibt die Seite, wie sie war.
    if (!food && !q) return
    if (q) setEingabe(q)
    if (food) setGewaehlt(food)
    // `[read]` **Die Route braucht einen Suchbegriff**, um Treffer zu
    // liefern; mit `food` allein bliebe die Liste leer. Deshalb wird
    // die Kennung auch als Anfrage geschickt — die Route loest sie
    // ueber `selected_food` auf.
    void suche(q, food)
  }, [suche])

  const payload = zustand.art === 'fertig' ? zustand.payload : null
  const treffer = payload?.foods ?? []
  const detail = payload?.selected_food ?? null

  // G-67: den Daumenstand des gewaehlten Lebensmittels nachladen.
  const detailId = detail?.id
  React.useEffect(() => {
    if (!detailId) return
    let verworfen = false
    void daumenLesen([detailId]).then(stand => {
      if (!verworfen) setDaumen(d => ({ ...d, ...stand }))
    })
    return () => { verworfen = true }
  }, [detailId])

  return (
    <>
      {/*
        G-266 / E-33, Weg C: die eigene Seite bleibt, der Zustand
        wandert mit — **in beide Richtungen.**

        `[cmd]` **Der Hinweg steht seit G-265** (`?food=` und `?q=`
        werden beim Start gelesen). `[read]` **Der Rueckweg fehlte
        ganz** — es gab keinen Verweis zurueck, nur den Zurueck-Knopf
        des Browsers. **Wer ueber `+ Add` hierherkam, verlor beim
        Zurueckgehen seine Trefferliste**, und genau das war Toms
        Einwand gegen die eigene Seite.

        `[read]` **Der Verweis nimmt den Suchbegriff mit**, damit der
        Reiter ihn wiederfindet — nicht die Kennung: dort ist kein
        einzelnes Lebensmittel ausgewaehlt, sondern eine Liste.
      */}
      <div style={{ marginBottom: 10 }}>
        <Link
          href={(eingabe.trim()
            ? `/v2/nutrition?tab=foods&q=${encodeURIComponent(eingabe.trim())}`
            : '/v2/nutrition?tab=foods') as Route}
          className="v2-btn v2-btn-ghost"
          style={{ height: 26, fontSize: 11.5, padding: '0 10px' }}
        >
          <Icon name="chevron_left" className="v2-ic v2-ic-sm" />
          Zurück zur Food DB
        </Link>
      </div>

      <ModuleHero
        icon="search"
        title="Lebensmittelsuche"
        sub="Volltextsuche ueber den BLS-Bestand. Jede Suche wird protokolliert."
        pills={<Pill variant="acc">G-03</Pill>}
        stats={[
          { label: 'Treffer', value: payload ? String(payload.total) : '—' },
          { label: 'Angezeigt', value: String(treffer.length) },
          {
            label: 'Normalisiert',
            value: payload?.normalized_query || '—',
            sub: payload ? 'so gesucht' : undefined,
          },
        ]}
      />

      <div className="v2-grid v2-g-cols-2" style={{ marginTop: 16, alignItems: 'start' }}>
        {/* G-73: „Bestand: BLS 4.0" entfernt — Tom, 2026-08-19: „wir
            muessen der Konkurrenz ja nicht mitteilen, mit was fuer
            Daten wir arbeiten, und der User hat eh keinen Plan, was
            das ist." Kein Ersatztext: die Trefferzahl steht schon in
            der Kopfzeile darueber. */}
        <Card title="Suche">
          <form onSubmit={absenden} style={{ display: 'flex', gap: 8 }}>
            <input
              className="v2-feld"
              value={eingabe}
              onChange={e => setEingabe(e.target.value)}
              placeholder="z. B. Huehnerbrust, Haferflocken, Apfel"
              aria-label="Lebensmittel suchen"
            />
            <button type="submit" className="v2-btn v2-btn-accent" disabled={!eingabe.trim()}>
              <Icon name="search" className="v2-ic v2-ic-sm" /> Suchen
            </button>
          </form>

          <div style={{ marginTop: 12, minHeight: 120 }}>
            {zustand.art === 'leer' && (
              <p className="v2-muted" style={{ fontSize: 12 }}>
                Noch nichts gesucht.
              </p>
            )}

            {zustand.art === 'laeuft' && (
              <p className="v2-muted" style={{ fontSize: 12 }}>Suche laeuft …</p>
            )}

            {zustand.art === 'fehler' && (
              <div className="v2-insight v2-neg">
                <div className="v2-insight-mark" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="v2-insight-title">
                    {zustand.code === 'LOCAL_DB_UNAVAILABLE'
                      ? 'Datenbank nicht erreichbar'
                      : 'Suche fehlgeschlagen'}
                  </div>
                  <div className="v2-insight-body">{zustand.text}</div>
                </div>
              </div>
            )}

            {zustand.art === 'fertig' && treffer.length === 0 && (
              <p className="v2-muted" style={{ fontSize: 12 }}>
                Kein Treffer fuer „{payload?.query}". Normalisiert:{' '}
                <code>{payload?.normalized_query || '—'}</code>
              </p>
            )}

            {treffer.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {treffer.map(row => (
                  <button
                    key={row.id}
                    type="button"
                    className="v2-hit"
                    data-selected={gewaehlt === row.id ? 'true' : undefined}
                    onClick={() => waehle(row)}
                  >
                    <span className="v2-hit-name">{row.name_display_de || row.name_de}</span>
                    <span className="v2-hit-kcal v2-num">{kcal(row)}</span>
                    <span className="v2-hit-meta">
                      <span className="v2-num">{row.bls_code}</span>
                      {row.category_name_de && <span>· {row.category_name_de}</span>}
                      {row.tags.slice(0, 3).map(t => (
                        <span key={t} className="v2-pill" style={{ fontSize: 9, padding: '1px 5px' }}>
                          {t}
                        </span>
                      ))}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card
          title={detail ? (detail.name_display_de || detail.name_de) : 'Detail'}
          sub={detail ? detail.bls_code : 'kein Treffer gewaehlt'}
          accent={detail ? 'var(--acc)' : undefined}
        >
          {!detail && (
            <p className="v2-muted" style={{ fontSize: 12 }}>
              Einen Treffer waehlen, um die Naehrwerte zu sehen.
            </p>
          )}

          {detail && payload && (
            <>
              {/* G-67: der Daumen an der Detailansicht. Tom: „Der User
                  kann, wenn er sich ein Resultat anschaut, das gleich
                  klassifizieren fuer sich." */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 12, flexWrap: 'wrap',
              }}>
                <DaumenKnoepfe
                  foodId={detail.id}
                  name={detail.name_display_de || detail.name_de}
                  zustand={daumen[detail.id] ?? 'neutral'}
                  onGesetzt={neu => setDaumen(d => ({ ...d, [detail.id]: neu }))}
                  gross
                />
                <span className="v2-muted" style={{ fontSize: 11.5 }}>
                  {daumen[detail.id] === 'liked' ? 'Mag ich'
                    : daumen[detail.id] === 'disliked' ? 'Mag ich nicht'
                      : 'Noch nicht bewertet'}
                </span>
              </div>

              <div className="v2-grid v2-g-cols-4" style={{ marginBottom: 12 }}>
                {([
                  ['Energie', detail.enercc, 'kcal'],
                  ['Protein', detail.prot625, 'g'],
                  ['Fett', detail.fat, 'g'],
                  ['Kohlenhydrate', detail.cho, 'g'],
                ] as const).map(([l, v, u]) => {
                  const n = zahl(v)
                  return (
                    <div key={l} className="v2-kpi">
                      <span className="v2-kpi-acc-bar" />
                      <div className="v2-kpi-label">{l}</div>
                      <div className="v2-kpi-value v2-num">
                        {n === null ? '—' : n.toLocaleString('de-DE', { maximumFractionDigits: 1 })}
                        <span className="v2-unit">{u}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <p className="v2-muted" style={{ fontSize: 11, marginBottom: 10 }}>
                Alle Werte je 100 g. Herkunft: {detail.source_label}
              </p>

              <Tabs
                items={[
                  { id: 'naehrwerte', label: 'Naehrwerte', count: payload.nutrients.length },
                  { id: 'namen', label: 'Namen' },
                ]}
                active={reiter}
                onChange={setReiter}
              />

              {reiter === 'naehrwerte' && (
                <div style={{ marginTop: 10, maxHeight: 420, overflowY: 'auto' }}>
                  {payload.nutrients.length === 0 && (
                    <p className="v2-muted" style={{ fontSize: 12 }}>
                      Keine Naehrwerte hinterlegt.
                    </p>
                  )}
                  {payload.nutrients.map((n: NutritionFoodNutrientRow) => (
                    <NaehrwertZeile key={n.nutrient_code} n={n} />
                  ))}
                </div>
              )}

              {reiter === 'namen' && (
                <div style={{ marginTop: 10 }}>
                  <Row label="Anzeigename" value={detail.name_display_de || '—'} />
                  <Row label="BLS-Name" value={detail.name_de || '—'} />
                  <Row label="Englisch" value={detail.name_display_en || detail.name_en || '—'} />
                  <Row label="Kategorie" value={detail.category_name_de || '—'} />
                  <Row label="Sortiergewicht" value={String(detail.sort_weight)} />
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </>
  )
}

/**
 * Ein Naehrwert des gewaehlten Lebensmittels.
 *
 * Bewusst `Row` und NICHT `CoverageRow`: das sind Werte je 100 g, nicht
 * die Tagessumme. [read] Ein Deckungsgrad braeuchte einen Referenzwert
 * UND eine verzehrte Menge — beides gehoert zur Tagesbilanz, nicht zum
 * Stammdatensatz. `CoverageRow` mit `not_applicable` haette hier
 * "kein Einzelwert" neben jeden Naehrstoff geschrieben, und das waere
 * falsch: der Wert ist bekannt, nur die Bezugsgroesse fehlt.
 */
function NaehrwertZeile({ n }: { n: NutritionFoodNutrientRow }) {
  const wert = zahl(n.value)
  return (
    <Row
      label={n.name_de || n.nutrient_code}
      value={
        <>
          {wert === null
            ? '—'
            : wert.toLocaleString('de-DE', { maximumFractionDigits: 2 })}
          {wert !== null && <span className="v2-unit">{n.unit}</span>}
        </>
      }
    />
  )
}
