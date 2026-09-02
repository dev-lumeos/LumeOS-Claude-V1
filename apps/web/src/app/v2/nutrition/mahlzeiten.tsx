'use client'

// Die Mahlzeitenkarten des Tagebuchs — Anzeige nach der Vorlage,
// Bearbeitung dahinter.
//
// VORLAGE: theme-v1/module-nutrition.jsx, `MealCard` (Zeile 294-354).
// Uebernommen ist der Aufbau Zeile fuer Zeile:
//   Kopf   Uhrzeit · Name · „N items" · Summe „606 kcal · 40g P" · + · Pfeil
//   Zeile  Punkt · Name · Menge · kcal · P · C · F · `···`
//   leer   MealCam · Search · Same as yesterday
//
// WAS VORHER FALSCH WAR (G-03/C-03): die Umsetzung war ein Formular.
// Je Position ein Eingabefeld, ein Haken und ein Muelleimer; darueber
// sieben Knoepfe „Mahlzeit anlegen"; keine leeren Karten; nur ein Wert
// je Zeile statt vier. Das ist zurueckgenommen — die Menge steht als
// Text, geaendert wird ueber `···`.
//
// ANGEBUNDEN ist alles, was Daten hat: Positionen, Summen, Suche,
// Portionen, Same as yesterday. MealCam bleibt Attrappe.
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, Icon, InEntwicklung } from '@lumeos/ui'

import { MEAL_TYPES, type MealType } from '../../../lib/nutrition/diary-model'
import { vortag } from '../../../lib/datum'
import type { NutritionFoodSearchRow } from '../../../lib/nutrition/food-search'
// G-309: die Plantage erscheinen als Ghost Entries — Flow 3, Schritt 7.
import { GhostEintragKarte, type GhostEintrag } from './ghost-eintrag'

/** Die Slots der Vorlage, in ihrer Reihenfolge. */
const SLOT_LABEL: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  pre_workout: 'Pre-workout',
  post_workout: 'Post-workout',
  other: 'Other',
}

type Position = {
  id: string
  food_id: string | null
  food_name: string
  amount_g: number
  enercc: number | null
  prot625: number | null
  fat: number | null
  cho: number | null
  portion_name?: string | null
  portion_quantity?: number | null
}

type Mahlzeit = {
  id: string
  meal_type: MealType
  /** G-15: `HH:MM:SS`. `null` heisst: keine Zeit hinterlegt. */
  meal_time: string | null
  notes: string | null
  items: Position[]
}

type Portion = { name_de: string; amount_g: number; is_default: boolean }

/**
 * Die Filter des Erfassungsdialogs (G-13).
 *
 * `[read]` BEWUSST WENIGER ALS IM FOOD-DB-REGISTER. Dort sind es neun
 * Pillen plus dreizehn Kategorien — das ist ein Katalog, den man
 * durchstoebert. Hier sucht jemand ein Lebensmittel, das er GERADE
 * GEGESSEN hat; er kennt dessen Namen und tippt ihn. Ein Filterband,
 * das breiter ist als die Trefferliste, steht dabei im Weg.
 *
 * `[cmd]` Geblieben sind die vier, die eine Mahlzeit wirklich
 * einschraenken. Alle Zahlen am 2026-08-20 gegen `nutrition.food_tags`
 * gemessen — dieselben Werte, die G-73 nennt.
 *
 * `[cmd]` Es ist EINFACHAUSWAHL, weil `food_search` `p_tag_code` im
 * Singular nimmt (C-120): kein ODER, kein UND, kein Ausschluss. Zwei
 * Filter gleichzeitig kann die Funktion nicht, und danebengebaut wird
 * hier nicht.
 */
const FILTER: Array<{ code: string; label: string; anzahl: number }> = [
  { code: 'vegetarian', label: 'Vegetarisch', anzahl: 1751 },
  { code: 'vegan', label: 'Vegan', anzahl: 1377 },
  { code: 'high_protein', label: 'Proteinreich', anzahl: 1400 },
  { code: 'whole_food', label: 'Grundnahrungsmittel', anzahl: 2884 },
]

/**
 * Die Sortierungen, die `nutrition.food_search` kennt.
 *
 * `[read]` `kcal_asc` und `name_asc` fehlen absichtlich. Wer erfasst,
 * was er gegessen hat, sucht nicht das kalorienaermste Lebensmittel —
 * er sucht SEINES. Relevanz ist die richtige Vorgabe, und Protein ist
 * die eine Frage, die beim Erfassen wirklich gestellt wird.
 */
const SORTIERUNGEN: Array<{ code: 'relevance' | 'protein_desc'; label: string }> = [
  { code: 'relevance', label: 'Relevanz' },
  { code: 'protein_desc', label: 'Protein' },
]

/**
 * Der Stil einer Filterpille — uebernommen aus `tab-foods.tsx` (G-73),
 * damit beide Flaechen gleich aussehen.
 *
 * `[read]` Ueber `color-mix` gegen die Themenvariablen, nicht mit
 * festen Farben: so traegt dieselbe Pille hell wie dunkel.
 */
function pillenStil(aktiv: boolean): React.CSSProperties {
  return {
    cursor: 'pointer', padding: '4px 10px', fontSize: 11,
    borderColor: aktiv
      ? 'color-mix(in oklch, var(--acc-nutri) 45%, var(--border))'
      : 'var(--border)',
    color: aktiv ? 'var(--acc-nutri)' : 'var(--fg-muted)',
    background: aktiv
      ? 'color-mix(in oklch, var(--acc-nutri) 10%, transparent)'
      : 'var(--surface)',
  }
}

/** Die Suche liefert numeric als Zeichenkette (PostgREST). */
function n(v: string | null | undefined): string {
  const x = v === null || v === undefined ? NaN : Number(v)
  return Number.isFinite(x) ? Math.round(x).toLocaleString('de-DE') : '—'
}

/** `HH:MM:SS` zu `HH:MM`. Ohne Zeit bleibt die Spalte leer. */
function uhrzeit(v: string | null | undefined): string {
  return typeof v === 'string' && v.length >= 5 ? v.slice(0, 5) : '—'
}

/** Zahl ohne Nachkommastellen, wie in der Vorlage. */
function z(v: number | null): string {
  return v === null ? '—' : Math.round(v).toLocaleString('de-DE')
}

export function Mahlzeiten({
  datum, onGeaendert,
}: {
  datum: string
  onGeaendert?: () => void
}) {
  const [mahlzeiten, setMahlzeiten] = React.useState<Mahlzeit[]>([])
  // G-309: die Plantage des Tages, sofern ein Plan aktiv ist.
  const [ghosts, setGhosts] = React.useState<GhostEintrag[]>([])
  const [laden, setLaden] = React.useState(true)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const router = useRouter()
  const t = useTranslations('Nutrition')
  const tA = useTranslations('Allgemein')

  const laden_ = React.useCallback(async () => {
    setLaden(true)
    try {
      // `[read]` **Gleichzeitig, nicht nacheinander** — sonst wartet
      // das Tagebuch auf den Plan (G-252).
      const [aM, aG] = await Promise.all([
        fetch(`/api/nutrition/diary?datum=${datum}`),
        fetch(`/api/nutrition/plan?datum=${datum}`),
      ])
      const d = await aM.json()
      if (!aM.ok) throw new Error(d?.error ?? `HTTP ${aM.status}`)
      setMahlzeiten(d.meals ?? [])
      // `[read]` **Ein Planfehler darf das Tagebuch nicht leeren** —
      // ohne aktiven Plan gibt es schlicht keine Ghost Entries.
      setGhosts(aG.ok ? ((await aG.json())?.eintraege ?? []) : [])
      setFehler(null)
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaden(false)
    }
  }, [datum])

  React.useEffect(() => { void laden_() }, [laden_])

  const neuLaden = React.useCallback(async () => {
    await laden_()
    // Tagessumme, Ringe und Naehrstoffdeckung stehen in der
    // Serverkomponente. `refresh()` laedt sie nach, ohne die Seite neu
    // aufzubauen — sonst zeigten die Ringe den Stand von vorher.
    router.refresh()
    onGeaendert?.()
  }, [laden_, onGeaendert, router])

  // G-15: JEDE vorhandene Mahlzeit bekommt eine eigene Karte.
  //
  // `[cmd]` Vorher stand hier `new Map(m => [m.meal_type, m])` — ein
  // Schluessel je Typ. Zwei Snacks am selben Tag (14.08., 10:14 und
  // 16:00) kollabierten damit zu einem; der erste verschwand
  // spurlos, weil `Map` beim zweiten ueberschreibt. Seit
  // Kettenschritt 052a ist der UNIQUE-Index weg, der das frueher
  // verhinderte — die Ansicht hatte die Annahme behalten.
  //
  // Die Sortierung kommt aus der Datenbank (nach `meal_time`), nicht
  // aus einer festen Liste. Fuer Typen OHNE Eintrag stehen weiterhin
  // leere Karten da — sonst gaebe es keinen Platz fuer „Search" und
  // „Same as yesterday".
  const VORLAGE: MealType[] = ['breakfast', 'snack', 'lunch', 'dinner', 'post_workout']
  const belegteTypen = new Set(mahlzeiten.map(m => m.meal_type))

  // ══ G-309: die Ghost Entries ══════════════════════════════════════
  //
  // `[read]` **Nur die offenen.** `[cmd]` **Ein bestaetigter Eintrag
  // hat eine Mahlzeit erzeugt** (`actual_meal_id`), **die schon oben
  // steht** — ihn daneben nochmal als Vorschlag zu zeigen, waere
  // derselbe Tag zweimal. **Ein ausgelassener ist entschieden.**
  //
  // `[read]` **Kein Expiry:** ein `pending` von vorgestern steht
  // weiter da — Flow 4, *,,auch retroaktiv"*.
  const offeneGhosts = ghosts.filter(g => g.status === 'pending')
  const ghostTypen = new Set(offeneGhosts.map(g => g.meal_type))

  // `[read]` **Ein Slot mit Ghost Entry bekommt keine leere Karte** —
  // sonst stuenden „Empty" und der Plan-Vorschlag nebeneinander.
  const leereSlots = VORLAGE.filter(
    typ => !belegteTypen.has(typ) && !ghostTypen.has(typ))

  if (laden && mahlzeiten.length === 0) {
    return <Card><p className="v2-muted" style={{ fontSize: 12 }}>{tA('laedt')}</p></Card>
  }

  return (
    <>
      {fehler && (
        <div className="v2-insight v2-neg">
          <div className="v2-insight-mark" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="v2-insight-title">{t('tagebuchNichtLesbar')}</div>
            <div className="v2-insight-body">{fehler}</div>
          </div>
        </div>
      )}

      {/* Erst die erfassten, in ihrer zeitlichen Reihenfolge. */}
      {mahlzeiten.map(m => (
        <MahlzeitKarte
          key={m.id}
          datum={datum}
          typ={m.meal_type}
          mahlzeit={m}
          onGeaendert={neuLaden}
        />
      ))}

      {/* G-309: dann, was der Plan fuer den Tag vorsieht — gestrichelt,
          noch nicht erfasst. `[read]` **Zwischen dem Erfassten und den
          leeren Slots**, weil er beides zugleich ist: es steht etwas
          da, aber gegessen ist es nicht. */}
      {offeneGhosts.map(g => (
        <GhostEintragKarte
          key={`ghost-${g.id}`}
          eintrag={g}
          datum={datum}
          onGeaendert={neuLaden}
        />
      ))}

      {/* Dann die Slots der Vorlage, fuer die nichts erfasst ist. */}
      {leereSlots.map(typ => (
        <MahlzeitKarte
          key={`leer-${typ}`}
          datum={datum}
          typ={typ}
          mahlzeit={null}
          onGeaendert={neuLaden}
        />
      ))}
    </>
  )
}

function MahlzeitKarte({
  datum, typ, mahlzeit, onGeaendert,
}: {
  datum: string
  typ: MealType
  mahlzeit: Mahlzeit | null
  onGeaendert: () => void
}) {
  const items = mahlzeit?.items ?? []
  const [offen, setOffen] = React.useState(items.length > 0)
  const [sucheAuf, setSucheAuf] = React.useState(false)
  const [mealCam, setMealCam] = React.useState(false)
  const [aendern, setAendern] = React.useState<Position | null>(null)
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  React.useEffect(() => { setOffen(items.length > 0) }, [items.length])

  // ══ G-330: fuenf Werte, nicht zwei ═══════════════════
  //
  // **Tom, 2026-09-02:** *,,dann zaehlt die auch fuer den inhalt."*
  //
  // `[cmd]` **Hier stand *413 kcal · 23g P*** — zwei von fuenf,
  // waehrend die Zeilen darunter alle fuenf tragen.
  //
  // `[cmd]` **Das Gewicht gehoert dazu** — Tom: *,,die einzige
  // Angabe, die man direkt nachwiegen kann."*
  //
  // `[read]` **Reihenfolge: Gewicht, kcal, Protein, Kohlenhydrate,
  // Fett** — dieselbe wie in den Zeilen, sonst beschriftet die
  // Kopfzeile die falsche Spalte.
  const summe = items.reduce(
    (a, it) => ({
      g: a.g + (it.amount_g ?? 0),
      kcal: a.kcal + (it.enercc ?? 0),
      p: a.p + (it.prot625 ?? 0),
      k: a.k + (it.cho ?? 0),
      f: a.f + (it.fat ?? 0),
    }),
    { g: 0, kcal: 0, p: 0, k: 0, f: 0 },
  )

  /** Mahlzeit anlegen, falls es sie noch nicht gibt. Liefert die id. */
  async function sicherstellen(): Promise<string> {
    if (mahlzeit) return mahlzeit.id
    const a = await fetch('/api/nutrition/diary', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ art: 'mahlzeit', entry_date: datum, meal_type: typ }),
    })
    const d = await a.json()
    if (!a.ok) throw new Error(d?.error ?? 'Mahlzeit anlegen fehlgeschlagen.')
    return d.id as string
  }

  /** Gestern dieselbe Mahlzeit, Positionen NEU eingefroren. */
  async function wieGestern() {
    setLaeuft(true)
    setFehler(null)
    try {
      // `vortag` rechnet ueber Mittag — an Zeitumstellungstagen
      // kippte die fruehere Mitternachtsrechnung um einen Tag.
      const a = await fetch(`/api/nutrition/diary?datum=${vortag(datum)}`)
      const d = await a.json()
      if (!a.ok) throw new Error(d?.error ?? 'Vortag nicht lesbar.')
      const quelle = (d.meals ?? []).find((m: Mahlzeit) => m.meal_type === typ)
      if (!quelle || quelle.items.length === 0) {
        setFehler('Gestern gibt es fuer diese Mahlzeit nichts zu uebernehmen.')
        return
      }
      const ziel = await sicherstellen()
      // `[read]` Die Naehrwerte werden NEU eingefroren, nicht kopiert:
      // es ist eine Erfassung von heute. Deshalb geht nur `food_id` und
      // `amount_g` mit — den Rest rechnet `addMealItem`.
      for (const it of quelle.items) {
        if (!it.food_id) continue
        await fetch('/api/nutrition/diary', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            art: 'position', meal_id: ziel,
            food_id: it.food_id, amount_g: it.amount_g,
          }),
        })
      }
      onGeaendert()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  const leer = items.length === 0

  return (
    <Card className="v2-card-tight" style={{ padding: leer ? 14 : 0 }}>
      <div
        style={{
          padding: leer ? 0 : '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: leer ? 'default' : 'pointer',
        }}
        onClick={() => { if (!leer) setOffen(o => !o) }}
      >
        {/* G-15: die Uhrzeit steht jetzt da. `[cmd]` Bis
            Kettenschritt 052a fuehrte `meals` nur `entry_date`; die
            Spalte zeigte deshalb einen Strich. Heute traegt jede der
            686 Mahlzeiten eine Zeit — die Vorlage zeigt „07:42
            Breakfast", und genau das steht hier. */}
        <span className="v2-num" style={{ fontSize: 10, color: 'var(--fg-dim)', width: 40 }}>
          {uhrzeit(mahlzeit?.meal_time)}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{SLOT_LABEL[typ]}</span>
        <span className="v2-dim" style={{ fontSize: 11 }}>
          · {leer ? 'Empty' : `${items.length} items`}
        </span>
        <div className="v2-spacer" />
        {/* ══ G-330: fuenf Werte statt zwei ══════════════════
            **Tom, 2026-09-02:** *,,dann zaehlt die auch fuer den
            inhalt."*

            `[cmd]` **Hier stand *413 kcal · 23g P*** — zwei von
            fuenf, waehrend die Zeilen darunter alle fuenf tragen.

            `[cmd]` **Das Gewicht gehoert dazu** — Tom: *,,die
            einzige Angabe, die man direkt nachwiegen kann."*

            `[read]` **Die Beschriftung steht in der Tabelle**, nicht
            hier: **die Kopfzeile traegt rechts zwei Knoepfe**, und
            eine Spalte, die daran vorbei fluchten muesste, waere
            beim naechsten Knopf wieder daneben. */}
        {!leer && (
          <span data-probe="kopf-summe" className="v2-num"
                style={{ fontSize: 12, display: 'flex', gap: 10 }}>
            {([
              ['g', z(summe.g)], ['kcal', z(summe.kcal)],
              ['P', z(summe.p)], ['K', z(summe.k)], ['F', z(summe.f)],
            ] as const).map(([kurz, wert]) => (
              <span key={kurz}>
                {wert}
                <span className="v2-dim" style={{ fontSize: 10, marginLeft: 2 }}>
                  {kurz}
                </span>
              </span>
            ))}
          </span>
        )}
        <button
          type="button" className="v2-icon-btn" aria-label="Position hinzufuegen"
          onClick={e => { e.stopPropagation(); setSucheAuf(true) }}
        >
          <Icon name="plus" className="v2-ic v2-ic-sm" />
        </button>
        {!leer && (
          <button type="button" className="v2-icon-btn" aria-label={offen ? 'Zuklappen' : 'Aufklappen'}
                  onClick={e => { e.stopPropagation(); setOffen(o => !o) }}>
            <Icon name="chevron_down" className="v2-ic v2-ic-sm"
                  style={{ transform: offen ? '' : 'rotate(-90deg)', transition: '0.2s' }} />
          </button>
        )}
      </div>

      {offen && !leer && (
        <div style={{ padding: '0 14px 10px' }}>
          <table className="v2-tbl v2-tbl-meal">
            {/* ══ G-330: die Spaltenbeschriftung ══════════════
                **Tom, 2026-09-02:** *,,wer *6 g 31 g 1 g* liest, muss
                raten."* — und: *,,die spalten muessen senkrecht
                fluchten."*

                `[cmd]` **Ein erster Versuch setzte sie in die
                Kopfzeile, mit gerechnetem Abstand.** `[cmd]`
                **Gemessen: 66 px daneben** (zwei Knoepfe rechts der
                Summe), **und der Ausgleich verschob die ganze
                Karte.**

                `[read]` **Hier fluchtet sie von selbst** — dieselbe
                Tabelle, dieselben Spalten. **Kein gerechneter
                Abstand, der beim naechsten Knopf falsch waere.** */}
            <thead data-probe="spalten-kopf">
              <tr>
                <th style={{ width: 18 }} />
                <th />
                <th style={{ width: 44, textAlign: 'right' }}>G</th>
                <th style={{ width: 58, textAlign: 'right' }}>KCAL</th>
                <th style={{ width: 40, textAlign: 'right' }}>P</th>
                <th style={{ width: 40, textAlign: 'right' }}>K</th>
                <th style={{ width: 40, textAlign: 'right' }}>F</th>
                <th style={{ width: 20 }} />
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it.id}>
                  <td style={{ width: 18 }}>
                    <span className="v2-dot" style={{ background: 'var(--acc-nutri)', opacity: 0.5 }} />
                  </td>
                  <td className="v2-name">
                    {it.food_name}
                    {/* C-51: die gewaehlte Portion, wenn eine benutzt
                        wurde. Die Vorlage kennt sie nicht — sie zeigt nur
                        Gramm. Ohne diese Zeile waere nicht erkennbar,
                        dass „2 Scheiben" gemeint waren. */}
                    {it.portion_name && (
                      <span className="v2-dim" style={{ fontSize: 10, marginLeft: 6 }}>
                        {it.portion_quantity ?? 1} × {it.portion_name}
                      </span>
                    )}
                  </td>
                  <td className="v2-muted v2-num" style={{ width: 44, textAlign: 'right' }}>
                    {z(it.amount_g)}<span className="v2-dim" style={{ fontSize: 10, marginLeft: 2 }}>g</span>
                  </td>
                  <td className="v2-num" style={{ width: 58, textAlign: 'right' }}>
                    {z(it.enercc)}<span className="v2-dim" style={{ fontSize: 10, marginLeft: 2 }}>kcal</span>
                  </td>
                  <td className="v2-num" style={{ width: 40, textAlign: 'right' }}>
                    {z(it.prot625)}<span className="v2-dim" style={{ fontSize: 10, marginLeft: 2 }}>g</span>
                  </td>
                  <td className="v2-num" style={{ width: 40, textAlign: 'right' }}>
                    {z(it.cho)}<span className="v2-dim" style={{ fontSize: 10, marginLeft: 2 }}>g</span>
                  </td>
                  <td className="v2-num" style={{ width: 40, textAlign: 'right' }}>
                    {z(it.fat)}<span className="v2-dim" style={{ fontSize: 10, marginLeft: 2 }}>g</span>
                  </td>
                  <td style={{ width: 20 }}>
                    <button type="button" className="v2-icon-btn" aria-label="Position bearbeiten"
                            onClick={() => setAendern(it)}>
                      <Icon name="more" className="v2-ic v2-ic-sm" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {leer && (
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          <button type="button" className="v2-btn" onClick={() => setMealCam(true)}>
            <Icon name="camera" className="v2-ic v2-ic-sm" /> MealCam
          </button>
          <button type="button" className="v2-btn" onClick={() => setSucheAuf(true)}>
            <Icon name="search" className="v2-ic v2-ic-sm" /> Search
          </button>
          <button type="button" className="v2-btn" disabled={laeuft} onClick={() => void wieGestern()}>
            <Icon name="copy" className="v2-ic v2-ic-sm" /> Same as yesterday
          </button>
        </div>
      )}

      {fehler && (
        <p className="v2-hinweis" style={{ marginTop: 10, color: 'var(--neg)' }}>
          <Icon name="alert" className="v2-ic v2-ic-sm" />
          <span>{fehler}</span>
        </p>
      )}

      {sucheAuf && (
        <HinzufuegenModal
          slot={SLOT_LABEL[typ]}
          onClose={() => setSucheAuf(false)}
          onFertig={() => { setSucheAuf(false); onGeaendert() }}
          sicherstellen={sicherstellen}
        />
      )}
      {aendern && (
        <AendernModal
          position={aendern}
          onClose={() => setAendern(null)}
          onFertig={() => { setAendern(null); onGeaendert() }}
        />
      )}
      {mealCam && (
        <InEntwicklung
          titel="MealCam"
          grund="Bilderkennung fuer Mahlzeiten — es gibt weder Modell noch Endpunkt."
          onClose={() => setMealCam(false)}
        />
      )}
    </Card>
  )
}

/**
 * Suchen, Portion waehlen, Menge angeben — ohne Seitenwechsel.
 *
 * `[read]` Aufbau uebernommen aus `AddFoodModal.tsx` des
 * Vorgaengerrepos: Suchfeld, Trefferliste mit vier Naehrwerten, nach
 * der Auswahl Portionsliste („Custom amount (g)" zuerst) und
 * Mengenfeld, darunter die Werte je 100 g.
 *
 * ANGEPASST ans neue Schema: dort `public.foods` mit UUID und
 * `food.kcal`; hier `nutrition.foods` mit `bls_code` und die Suche
 * ueber `/api/nutrition/foods`. Die Portionen kommen aus
 * `foods_portions` (C-51), nicht aus einem eigenen Hook.
 */
function HinzufuegenModal({
  slot, onClose, onFertig, sicherstellen,
}: {
  slot: string
  onClose: () => void
  onFertig: () => void
  sicherstellen: () => Promise<string>
}) {
  const [frage, setFrage] = React.useState('')
  const [treffer, setTreffer] = React.useState<NutritionFoodSearchRow[]>([])
  const [sucht, setSucht] = React.useState(false)
  const [gewaehlt, setGewaehlt] = React.useState<NutritionFoodSearchRow | null>(null)
  const [portionen, setPortionen] = React.useState<Portion[]>([])
  const [portion, setPortion] = React.useState<string>('')
  const [anzahl, setAnzahl] = React.useState('1')
  const [menge, setMenge] = React.useState('100')
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  // G-13: Filter, Sortierung und die Wirkung der Vorlieben.
  const [tag, setTag] = React.useState<string | null>(null)
  const [sortierung, setSortierung] = React.useState<'relevance' | 'protein_desc'>('relevance')
  const [verborgen, setVerborgen] = React.useState<number | null>(null)
  const [vorliebenAktiv, setVorliebenAktiv] = React.useState(false)

  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  // Suche mit kurzer Verzoegerung — sonst eine Abfrage je Tastendruck.
  React.useEffect(() => {
    if (gewaehlt || frage.trim().length < 2) { setTreffer([]); return }
    let weg = false
    const t = setTimeout(async () => {
      setSucht(true)
      try {
        const params = new URLSearchParams({
          q: frage,
          limit: '12',
          sort: sortierung,
          // `[read]` DIE VORLIEBEN GELTEN HIER (C-94). Ohne diesen
          // Schalter sucht die Route den ganzen Katalog — dann stuenden
          // Nuesse in der Liste, obwohl sie als Allergie hinterlegt
          // sind. Die Kennung schickt der Browser NICHT mit; sie kommt
          // serverseitig aus der Sitzung.
          prefs: '1',
        })
        if (tag) params.set('tag', tag)
        const a = await fetch(`/api/nutrition/foods?${params.toString()}`)
        const d = await a.json()
        if (!weg) {
          setTreffer(a.ok ? (d.foods ?? []) : [])
          setVerborgen(typeof d.preferences_hidden === 'number' ? d.preferences_hidden : null)
          setVorliebenAktiv(d.preferences_applied === true)
        }
      } catch {
        if (!weg) setTreffer([])
      } finally {
        if (!weg) setSucht(false)
      }
    }, 250)
    return () => { weg = true; clearTimeout(t) }
  }, [frage, gewaehlt, tag, sortierung])

  async function waehle(f: NutritionFoodSearchRow) {
    setGewaehlt(f)
    // G-93: **hier bleibt `name_de`, und zwar mit Grund.** Dieser Wert
    // geht zurueck ins Suchfeld, ist also ein SUCHBEGRIFF, keine
    // Anzeige. `[cmd]` `name_display_de` als Suchbegriff liefert 0
    // Treffer (G-265, belegt in add-und-plaene.test.ts:38) — die
    // Klammerzusaetze stehen so nicht im Suchindex.
    setFrage(f.name_de)
    // `[cmd]` Dieser Aufruf schreibt die Protokollzeile mit
    // `selected_bls_code` und `selected_rank` — ohne ihn fehlt genau
    // die Nutzung, die uns interessiert.
    void fetch(`/api/nutrition/foods?food=${encodeURIComponent(f.id)}&q=${encodeURIComponent(frage)}`)
    try {
      const a = await fetch(`/api/nutrition/diary?portionen_fuer=${f.id}`)
      const d = await a.json()
      const p: Portion[] = a.ok ? (d.portionen ?? []) : []
      setPortionen(p)
      // Die Vorgabeportion ist vorausgewaehlt (Auftrag).
      const vorgabe = p.find(x => x.is_default) ?? null
      if (vorgabe) {
        setPortion(vorgabe.name_de)
        setAnzahl('1')
        setMenge(String(vorgabe.amount_g))
      } else {
        setPortion('')
        setMenge('100')
      }
    } catch {
      setPortionen([])
    }
  }

  function waehlePortion(name: string) {
    setPortion(name)
    const p = portionen.find(x => x.name_de === name)
    const n = Number(anzahl) || 1
    if (p) setMenge(String(Math.round(p.amount_g * n * 10) / 10))
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
    if (!gewaehlt) return
    const g = Number(menge)
    if (!Number.isFinite(g) || g <= 0) { setFehler('Menge muss groesser als 0 sein.'); return }
    setLaeuft(true)
    setFehler(null)
    try {
      const mealId = await sicherstellen()
      const p = portionen.find(x => x.name_de === portion)
      const n = Number(anzahl)
      // Entweder alle drei Portionsfelder oder keines — so prueft es
      // der CHECK in 058a. Bei direkter Grammeingabe bleiben sie leer.
      const portionsfelder = p && Number.isFinite(n) && n > 0
        ? { portion_name: p.name_de, portion_quantity: n, portion_amount_g: p.amount_g }
        : {}
      const a = await fetch('/api/nutrition/diary', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          art: 'position', meal_id: mealId,
          food_id: gewaehlt.id, amount_g: g, ...portionsfelder,
        }),
      })
      const d = await a.json()
      if (!a.ok) throw new Error(d?.error ?? 'Hinzufuegen fehlgeschlagen.')
      onFertig()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  const je100 = gewaehlt

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" style={{ width: 640, maxHeight: '88vh' }}
           role="dialog" aria-modal="true" aria-label={`Zu ${slot} hinzufuegen`}
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          <Icon name="search" className="v2-ic v2-ic-sm" />
          <span className="v2-card-title">Add food to {slot}</span>
          <div className="v2-spacer" />
          <button type="button" className="v2-icon-btn" onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic v2-ic-sm" />
          </button>
        </div>

        <div className="v2-modal-body">
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Search for food</div>
          <input
            className="v2-feld"
            value={frage}
            autoFocus
            // G-73: „— BLS 4.0" entfernt, wie im Kopf und in der Suche.
            placeholder="Lebensmittel suchen"
            onChange={e => { setFrage(e.target.value); setGewaehlt(null) }}
          />

          {!gewaehlt && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4,
              marginTop: 8,
            }}>
              <Icon name="filter" className="v2-ic v2-ic-sm v2-dim" />
              {FILTER.map(f => {
                const an = tag === f.code
                return (
                  <button
                    key={f.code}
                    type="button"
                    className="v2-pill"
                    aria-pressed={an}
                    style={pillenStil(an)}
                    // `[cmd]` Die Zahl steht am Filter, damit niemand
                    // raet, wie gross die Einschraenkung ist.
                    title={`${f.anzahl.toLocaleString('de-DE')} Lebensmittel`}
                    onClick={() => setTag(an ? null : f.code)}
                  >
                    {f.label}
                    <span className="v2-num v2-dim" style={{ marginLeft: 5, fontSize: 10 }}>
                      {f.anzahl.toLocaleString('de-DE')}
                    </span>
                  </button>
                )
              })}
              {/*
                `[read]` Eigene Zeile statt `marginLeft: auto`: bei vier
                Filtern bleibt rechts kein Platz, die Sortierung bricht
                ohnehin um — und `auto` wirkt nach einem Umbruch nicht
                mehr. Lieber ein bewusster Umbruch als ein zufaelliger.
              */}
              <span style={{
                flexBasis: '100%', display: 'flex', gap: 4,
                justifyContent: 'flex-end',
              }}>
                <span className="v2-eyebrow" style={{ marginRight: 'auto' }}>
                  Sortierung
                </span>
                {SORTIERUNGEN.map(s => (
                  <button
                    key={s.code}
                    type="button"
                    className="v2-pill"
                    aria-pressed={sortierung === s.code}
                    style={pillenStil(sortierung === s.code)}
                    title={`Nach ${s.label} sortieren`}
                    onClick={() => setSortierung(s.code)}
                  >
                    {s.label}
                  </button>
                ))}
              </span>
            </div>
          )}

          {sucht && <p className="v2-muted" style={{ fontSize: 12, marginTop: 10 }}>Sucht …</p>}

          {/*
            `[read]` WARUM DIESER HINWEIS SEIN MUSS: `[cmd]` „mandel"
            liefert fuer `dev@lumeos.app` **0 von 64** Treffern, weil 63
            davon `contains_nuts` tragen und die Nussallergie hart
            ausschliesst. Ohne den Hinweis sieht das aus, als kenne die
            Datenbank keine Mandeln — und der Nutzer sucht weiter.
          */}
          {!gewaehlt && !sucht && verborgen !== null && verborgen > 0 && (
            <p className="v2-muted" style={{ fontSize: 11.5, marginTop: 10 }}>
              {treffer.length === 0 ? 'Kein Treffer — ' : ''}
              {verborgen} {verborgen === 1 ? 'Eintrag ist' : 'Eintraege sind'} durch
              deine Vorlieben ausgeblendet.
            </p>
          )}

          {!gewaehlt && !sucht && verborgen === null
            && frage.trim().length >= 2 && treffer.length === 0 && (
            <p className="v2-muted" style={{ fontSize: 11.5, marginTop: 10 }}>
              Kein Treffer{tag ? ' mit diesem Filter' : ''}
              {/*
                `[read]` Wenn die Vorlieben griffen und trotzdem nichts
                verborgen ist, liegt es NICHT an ihnen — das gehoert
                dazugesagt, sonst sucht jemand den Fehler bei seinen
                Einstellungen.
              */}
              {vorliebenAktiv ? ' — auch ohne deine Vorlieben nicht' : ''}.
              {tag && (
                <>
                  {' '}
                  <button
                    type="button"
                    onClick={() => setTag(null)}
                    style={{
                      background: 'none', border: 0, padding: 0, font: 'inherit',
                      cursor: 'pointer', color: 'var(--acc-nutri)',
                    }}
                  >
                    Filter aufheben
                  </button>
                </>
              )}
            </p>
          )}

          {!gewaehlt && treffer.length > 0 && (
            <div className="v2-col-gap" style={{ gap: 6, marginTop: 10 }}>
              {treffer.map(f => (
                <button
                  key={f.id}
                  type="button"
                  className="v2-wahl"
                  style={{ textAlign: 'left' }}
                  onClick={() => void waehle(f)}
                >
                  <span style={{ flex: 1, minWidth: 0 }}>
                    {/* G-93: der Anzeigename, sonst der Rohname. */}
                    <span className="v2-wahl-titel">{f.name_display_de || f.name_de}</span>
                    <span className="v2-wahl-hinweis">
                      {n(f.enercc)} kcal · {n(f.prot625)}g P · {n(f.cho)}g C · {n(f.fat)}g F
                      <span className="v2-dim"> je 100 g</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {gewaehlt && (
            <div style={{ marginTop: 12 }}>
              <div className="v2-insight" style={{ marginBottom: 12 }}>
                <div className="v2-insight-mark" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* G-93: der Anzeigename, sonst der Rohname. */}
                  <div className="v2-insight-title">{gewaehlt.name_display_de || gewaehlt.name_de}</div>
                  <div className="v2-insight-body v2-num">
                    {n(je100!.enercc)} kcal · {n(je100!.prot625)}g P ·{' '}
                    {n(je100!.cho)}g C · {n(je100!.fat)}g F — je 100 g
                  </div>
                </div>
              </div>

              {portionen.length > 0 && (
                <div className="v2-grid v2-g-cols-2" style={{ gap: 10, marginBottom: 10 }}>
                  <div>
                    <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Portion</div>
                    <select className="v2-feld" value={portion}
                            onChange={e => waehlePortion(e.target.value)}>
                      <option value="">Menge in Gramm</option>
                      {portionen.map(p => (
                        <option key={p.name_de} value={p.name_de}>
                          {p.name_de} ({z(p.amount_g)} g){p.is_default ? ' · Vorgabe' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Anzahl</div>
                    <input className="v2-feld" type="number" min="0.25" step="0.25"
                           value={anzahl} disabled={!portion}
                           onChange={e => setzeAnzahl(e.target.value)} />
                  </div>
                </div>
              )}

              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Menge</div>
              <div style={{ position: 'relative', display: 'flex' }}>
                <input
                  className="v2-feld" type="number" min="1" step="1" value={menge}
                  onChange={e => { setMenge(e.target.value); setPortion('') }}
                />
                <span className="v2-feld-einheit">g</span>
              </div>
              <p style={{ fontSize: 10.5, color: 'var(--fg-dim)', marginTop: 6 }}>
                {portion
                  ? 'Portion gewaehlt — Name, Anzahl und Grammgewicht werden mitgespeichert.'
                  : 'Direkte Grammeingabe — die Portionsfelder bleiben leer.'}
              </p>
            </div>
          )}

          {fehler && <p className="v2-feldfehler" style={{ marginTop: 10 }}>{fehler}</p>}
        </div>

        <div className="v2-modal-f">
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Abbrechen</button>
          <button type="button" className="v2-btn v2-btn-primary"
                  disabled={!gewaehlt || laeuft} onClick={() => void hinzufuegen()}>
            <Icon name="plus" className="v2-ic v2-ic-sm" />
            {laeuft ? 'Fuegt hinzu …' : 'Hinzufuegen'}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Menge aendern oder Position entfernen.
 *
 * `[read]` Aus `AdjustMealModal.tsx` des Vorgaengerrepos uebernommen:
 * ein Feld fuer die Menge, Loeschen als eigener Knopf. Die Vorlage
 * fuehrt dafuer das `···` in der Zeile.
 */
function AendernModal({
  position, onClose, onFertig,
}: {
  position: Position
  onClose: () => void
  onFertig: () => void
}) {
  const [menge, setMenge] = React.useState(String(position.amount_g))
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  async function speichern() {
    const g = Number(menge)
    if (!Number.isFinite(g) || g <= 0) { setFehler('Menge muss groesser als 0 sein.'); return }
    setLaeuft(true)
    setFehler(null)
    try {
      const a = await fetch('/api/nutrition/diary', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: position.id, amount_g: g }),
      })
      const d = await a.json()
      if (!a.ok) throw new Error(d?.error ?? 'Aendern fehlgeschlagen.')
      onFertig()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  async function entfernen() {
    setLaeuft(true)
    setFehler(null)
    try {
      const a = await fetch(`/api/nutrition/diary?id=${position.id}`, { method: 'DELETE' })
      if (!a.ok) {
        const d = await a.json().catch(() => null)
        throw new Error(d?.error ?? 'Entfernen fehlgeschlagen.')
      }
      onFertig()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" style={{ width: 460 }}
           role="dialog" aria-modal="true" aria-label={position.food_name}
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          <Icon name="edit" className="v2-ic v2-ic-sm" />
          <span className="v2-card-title">{position.food_name}</span>
          <div className="v2-spacer" />
          <button type="button" className="v2-icon-btn" onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic v2-ic-sm" />
          </button>
        </div>
        <div className="v2-modal-body">
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Menge</div>
          <div style={{ position: 'relative', display: 'flex' }}>
            <input className="v2-feld" type="number" min="1" step="1" value={menge}
                   onChange={e => setMenge(e.target.value)} />
            <span className="v2-feld-einheit">g</span>
          </div>
          <p style={{ fontSize: 10.5, color: 'var(--fg-dim)', marginTop: 6 }}>
            Die Naehrwerte werden <strong>neu eingefroren</strong> — sie
            passen danach zur neuen Menge.
          </p>
          {fehler && <p className="v2-feldfehler" style={{ marginTop: 10 }}>{fehler}</p>}
        </div>
        <div className="v2-modal-f">
          <button type="button" className="v2-btn v2-btn-ghost" disabled={laeuft}
                  onClick={() => void entfernen()}>
            <Icon name="trash" className="v2-ic v2-ic-sm" /> Entfernen
          </button>
          <div className="v2-spacer" />
          <button type="button" className="v2-btn v2-btn-primary" disabled={laeuft}
                  onClick={() => void speichern()}>
            <Icon name="check" className="v2-ic v2-ic-sm" />
            {laeuft ? 'Speichert …' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}

export { MEAL_TYPES }
