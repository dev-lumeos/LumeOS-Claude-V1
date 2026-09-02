'use client'

// Der Preferences-Tab — **echte Werte.**
//
// FORM: `theme-v1/module-nutrition-spec.jsx`, `FoodPreferencesView`
// (213-332) — sechs Kacheln in zwei Spalten. INHALT:
// `nutrition.food_preferences` und `food_preference_items` ueber
// `food_preferences_read` / `_write` (C-87).
//
// **EINE KACHEL KOMMT DAZU: die Ausschluesse.** `[read]` Mit Tom
// besprochen. Sie liest und schreibt `general_exclusions[]`.
//
// `[cmd]` **C-93 ist waehrend dieses Auftrags fertig geworden.** Der
// Auftrag ging noch davon aus, dass es keinen Preset-Katalog gibt und
// die Kachel einen Leerzustand zeigt; seit 2026-08-19 fuehrt
// `nutrition.exclusion_presets` **elf Presets** in zwei Gruppen
// (persoenlich, religioes) samt `caveat_de`. Gebaut ist deshalb die
// Auswahl — **der Leerzustand bleibt als Rueckfall**, falls der Katalog
// einmal nicht lesbar ist.
//
// **ZWEI ABWEICHUNGEN VOM MOCKUP, beide besprochen:**
//
//   `[cmd]` **Die Allergiekachel fuehrt 20 Eintraege in drei Stufen**
//   (neutral → Sensibel → Allergie), nicht 14 mit an/aus. Grund: die
//   Datenbank trennt `allergies[]` und `intolerances[]`, und die
//   Testdaten nutzen beide (`tree_nuts` als Allergie, `lactose` als
//   Unvertraeglichkeit). **Mit An/Aus-Pillen waere die halbe Spalte
//   nicht bedienbar** und die Laktose-Testdaten unsichtbar. Die Stufung
//   stammt aus dem Vorgaengerrepo (`FoodPreferences.tsx:551-594`),
//   ebenso die Trennung von Milcheiweiss und Laktose.
//
//   `[cmd]` **Kategorien kommen aus dem Katalog**, nicht als feste
//   Achterliste: `food_categories` fuehrt 13 Wurzeln.
//
// **DIE RANGFOLGE WIRKT INZWISCHEN** (Stand G-104): `[cmd]`
// `nutrition.food_search` nimmt seit C-94 einen Nutzerparameter, der
// Erfassungsdialog ruft ihn seit G-13 mit `prefs=1`. Kataloge (Food
// DB, Startliste, /v2/nutrition/suche) bleiben bewusst ungefiltert —
// dort wird nachgeschlagen und bewertet, nicht gegessen.
//
// **EIN KLICKMUSTER** (G-104, Tom: „Allgemein unlogisch zu bedienen"):
// Tippen schaltet weiter, und der Wert steht AM Element — Kategorien
// und Einzel-Lebensmittel als Zyklusknopf (— → +50/+100 → −50/−100),
// Merkmale mit ±30 im Knopf, Allergene mit Stufenwort in der Pille.
//
// **SPEICHERN UNTER C-156:** `food_preferences_write` fuehrt
// schluesselbasiert zusammen und ersetzt nur `source='settings'` —
// Daumen-Eintraege (`search_thumb`) ueberleben einen Kachel-Lauf, und
// die Funktion MELDET, wenn sie weniger schrieb als geschickt wurde
// (kein stilles ok, G-79). Klicks kurz nacheinander laufen ueber eine
// Warteschlange und einen synchronen Stand-Ref — sonst schickte der
// zweite Klick den Stand VOR dem ersten und loeschte ihn wieder.
import * as React from 'react'

// G-72: derselbe Satz wie im Planner — kein zweiter Wortlaut.
import { rasterZeilen } from '../../../lib/nutrition/plan-model'
import { Card, Icon, Pill, Row } from '@lumeos/ui'

import type {
  AusschlussPreset, Grundeinstellungen, Kategorie, TagDefinition, Vorliebe,
  VorliebenStand,
} from '../../../lib/nutrition/vorlieben-lesen'
import type { NutritionFoodSearchRow } from '../../../lib/nutrition/food-search'
import { vorliebenSpeichern, type VorliebeEingabe } from './vorlieben-aktionen'
import { daumenSpeichern } from './daumen-aktion'

export type VorliebenDaten = {
  stand: VorliebenStand
  kategorien: Kategorie[]
  presets: AusschlussPreset[]
  tags: TagDefinition[]
  ladefehler: string | null
}

/** Die acht Ernaehrungsformen der Vorlage (Zeile 215). */
const DIETS = [
  'omnivore', 'vegetarian', 'vegan', 'pescatarian',
  'keto', 'paleo', 'halal', 'kosher',
]

/**
 * Die 20 Allergene des Vorgaengers.
 *
 * `[cmd]` `FoodPreferences.tsx:551-575` — die **EU-14 vollstaendig**
 * plus fuenf haeufige Unvertraeglichkeiten. `[read]` **Milcheiweiss und
 * Laktose stehen getrennt**, und das ist kein Listenfehler: eine
 * Kuhmilchallergie richtet sich gegen das Eiweiss, eine
 * Laktoseintoleranz gegen den Zucker. Wer beides zusammenlegt, kann
 * keines von beiden richtig abbilden.
 */
const ALLERGENE: Array<{ id: string; label: string; eu14: boolean }> = [
  { id: 'gluten', label: 'Gluten / Weizen', eu14: true },
  { id: 'milk_protein', label: 'Milcheiweiß', eu14: true },
  { id: 'lactose', label: 'Laktose', eu14: true },
  { id: 'eggs', label: 'Eier', eu14: true },
  { id: 'fish', label: 'Fisch', eu14: true },
  { id: 'crustaceans', label: 'Krebstiere', eu14: true },
  { id: 'molluscs', label: 'Weichtiere', eu14: true },
  { id: 'peanuts', label: 'Erdnüsse', eu14: true },
  { id: 'tree_nuts', label: 'Baumnüsse', eu14: true },
  { id: 'soy', label: 'Soja', eu14: true },
  { id: 'celery', label: 'Sellerie', eu14: true },
  { id: 'mustard', label: 'Senf', eu14: true },
  { id: 'sesame', label: 'Sesam', eu14: true },
  { id: 'sulfites', label: 'Sulfite', eu14: true },
  { id: 'lupin', label: 'Lupine', eu14: true },
  { id: 'fructose', label: 'Fruktose', eu14: false },
  { id: 'histamine', label: 'Histamin', eu14: false },
  { id: 'sorbitol', label: 'Sorbit', eu14: false },
  { id: 'fodmap', label: 'FODMAP', eu14: false },
  { id: 'nickel', label: 'Nickel', eu14: false },
]

type Stufe = 'neutral' | 'sensibel' | 'allergie'

const NEIGUNGEN = ['liked', 'neutral', 'disliked'] as const

/**
 * Wie viele Lebensmittel eine Allergenmarkierung tragen (G-73).
 *
 * `[cmd]` Gemessen am 2026-08-20 gegen `nutrition.food_tags`:
 * `contains_nuts` 120 · `contains_gluten` 622 ·
 * `contains_lactose` 1.021 von 7.140.
 *
 * `[read]` **Fest eingetragen, mit Stichtag — und das ist Absicht.**
 * Die Zahlen im Warnhinweis duerfen nicht bei jedem Seitenaufruf
 * nachgeladen werden: der Hinweis muss auch dann stehen, wenn die
 * Abfrage ausfaellt. Wer die Kuration erweitert, zieht sie hier nach;
 * die Groessenordnung („ein Bruchteil") bleibt bis dahin richtig.
 */
const ALLERGEN_MARKIERT = {
  nuts: 120,
  gluten: 622,
  lactose: 1021,
  gesamt: 7140,
  stand: '2026-08-20',
} as const
type Neigung = (typeof NEIGUNGEN)[number]

function farbe(n: Neigung | Stufe): string {
  if (n === 'liked') return 'var(--pos)'
  if (n === 'disliked' || n === 'allergie') return 'var(--neg)'
  if (n === 'sensibel') return 'var(--warn)'
  return 'var(--fg-dim)'
}

export function VorliebenTab({ d }: { d: VorliebenDaten }) {
  const [stand, setStand] = React.useState(d.stand)
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  // G-104: der juengste Stand, SYNCHRON. Jeder Klick rechnet auf
  // diesem Ref, nicht auf dem Render-Abzug — zwei schnelle Klicks auf
  // verschiedenen Kacheln wuerden sonst den jeweils anderen ueber den
  // vollstaendig gesendeten Satz zuruecksetzen.
  const standRef = React.useRef(d.stand)
  // Antworten der Reihe nach: nur die juengste setzt den Stand.
  const folgeRef = React.useRef(0)
  // Und die Aufrufe selbst nacheinander — die RPC ersetzt den ganzen
  // settings-Satz, zwei gleichzeitige Laeufe kreuzten sich.
  const ketteRef = React.useRef<Promise<void>>(Promise.resolve())

  const g = stand.grund

  const uebernehmen = React.useCallback((naechster: VorliebenStand) => {
    standRef.current = naechster
    setStand(naechster)
  }, [])

  /**
   * Speichern: Grundeinstellungen und Items **immer vollstaendig**.
   *
   * `[cmd]` `food_preferences_write` (C-156) fuehrt schluesselbasiert
   * zusammen und ersetzt dabei den `settings`-Satz: was der Tab nicht
   * mitschickt, gilt als in den Einstellungen entfernt. Deshalb geht
   * der ganze Stand — Daumen-Eintraege anderer Herkunft bleiben davon
   * unberuehrt. Die Funktion wirft, wenn sie weniger schrieb als
   * geschickt wurde; der Fehler landet sichtbar in der Kopfzeile.
   */
  const speichern = React.useCallback((
    naechsterGrund: Grundeinstellungen,
    naechsteItems: Vorliebe[],
  ) => {
    const nr = ++folgeRef.current
    setLaeuft(true)
    setFehler(null)
    const eingaben: VorliebeEingabe[] = naechsteItems.map(i => ({
      target_type: i.target_type as VorliebeEingabe['target_type'],
      preference: i.preference,
      food_id: i.food_id,
      category_id: i.category_id,
      tag_code: i.tag_code,
      cuisine_code: i.cuisine_code,
      exclusion_preset_code: i.exclusion_preset_code,
      catalog_item_code: i.catalog_item_code,
    }))
    ketteRef.current = ketteRef.current.then(async () => {
      const antwort = await vorliebenSpeichern(naechsterGrund, eingaben)
      // Eine juengere Aenderung ist unterwegs — deren Antwort gilt.
      if (nr !== folgeRef.current) return
      if (antwort.ok) uebernehmen(antwort.stand)
      else setFehler(antwort.fehler)
      setLaeuft(false)
    })
  }, [uebernehmen])

  // Grundeinstellungen aendern — immer auf dem Ref-Stand.
  const grundAendern = (
    weiter: (g0: Grundeinstellungen) => Grundeinstellungen,
  ) => {
    const s0 = standRef.current
    const naechster = weiter(s0.grund)
    uebernehmen({ ...s0, grund: naechster })
    speichern(naechster, s0.items)
  }

  // Items aendern — immer auf dem Ref-Stand.
  const itemsAendern = (weiter: (items: Vorliebe[]) => Vorliebe[]) => {
    const s0 = standRef.current
    const naechste = weiter(s0.items)
    uebernehmen({ ...s0, items: naechste })
    speichern(s0.grund, naechste)
  }

  // ── Allergene: drei Stufen ────────────────────────────────────
  const stufeVon = (id: string): Stufe => {
    if (g.allergies.includes(id)) return 'allergie'
    if (g.intolerances.includes(id)) return 'sensibel'
    return 'neutral'
  }

  /** `[read]` 1× tippen = Sensibel · 2× = Allergie · 3× = Entfernen. */
  const allergenWeiter = (id: string) => {
    grundAendern(g0 => {
      const ohne = (xs: string[]) => xs.filter(x => x !== id)
      const jetzt: Stufe = g0.allergies.includes(id)
        ? 'allergie'
        : g0.intolerances.includes(id) ? 'sensibel' : 'neutral'
      return jetzt === 'neutral'
        ? { ...g0, intolerances: [...g0.intolerances, id] }
        : jetzt === 'sensibel'
          ? { ...g0, intolerances: ohne(g0.intolerances), allergies: [...g0.allergies, id] }
          : { ...g0, allergies: ohne(g0.allergies) }
    })
  }

  // ── Items: Kategorie und Tag ──────────────────────────────────
  const itemFuer = (typ: string, schluessel: string): Vorliebe | undefined =>
    stand.items.find(i => i.target_type === typ
      && (typ === 'category' ? i.category_id === schluessel : i.tag_code === schluessel))

  const neigungVon = (typ: string, schluessel: string): Neigung => {
    const i = itemFuer(typ, schluessel)
    if (!i) return 'neutral'
    return i.preference === 'liked' ? 'liked' : 'disliked'
  }

  /** G-104: EIN Klickmuster — tippen schaltet weiter. */
  const zyklus = (n: Neigung): Neigung =>
    n === 'neutral' ? 'liked' : n === 'liked' ? 'disliked' : 'neutral'

  const neigungSetzen = (
    typ: 'category' | 'tag', schluessel: string, neigung: Neigung, name: string,
  ) => {
    itemsAendern(items => {
      const rest = items.filter(i => !(i.target_type === typ
        && (typ === 'category' ? i.category_id === schluessel : i.tag_code === schluessel)))
      return neigung === 'neutral' ? rest : [...rest, {
        id: '', target_type: typ,
        preference: neigung === 'liked' ? 'liked' : 'disliked',
        strength: neigung === 'liked' ? 'boost' : 'soft_dislike',
        source: 'settings',
        food_id: null, food_name: null, bls_code: null,
        category_id: typ === 'category' ? schluessel : null,
        category_name_de: typ === 'category' ? name : null,
        category_slug: null,
        tag_code: typ === 'tag' ? schluessel : null,
        tag_name_de: typ === 'tag' ? name : null,
        cuisine_code: null, exclusion_preset_code: null, catalog_item_code: null,
      }]
    })
  }

  const itemEntfernen = (id: string) => {
    itemsAendern(items => items.filter(i => i.id !== id))
  }

  // ── Einzelne Lebensmittel (G-104): der Tab nimmt jetzt selbst auf ──
  //
  // ZWEI HERKUENFTE, ZWEI SCHREIBWEGE — GEMESSEN, NICHT GESCHMACK:
  // `[cmd]` C-156 loescht beim Kachel-Lauf nur `source='settings'`.
  // Eine Daumen-Zeile (`search_thumb`), die man hier entfernte, fiele
  // aus dem gesendeten Satz, wuerde vom RPC aber NICHT geloescht — sie
  // waere nach dem Neuladen wieder da. Daumen-Zeilen laufen deshalb
  // ueber den Daumen-Weg (gezielte Einzelzeile, G-67), settings-Zeilen
  // ueber den Satz. Fuer die Bedienung ist es derselbe Zyklusknopf.
  const daumenZeile = async (foodId: string, ziel: Neigung) => {
    setLaeuft(true)
    setFehler(null)
    const e = await daumenSpeichern(foodId, ziel)
    if (!e.ok) {
      setFehler(e.fehler ?? 'Daumen nicht gespeichert.')
      setLaeuft(false)
      return
    }
    const s0 = standRef.current
    const rest = s0.items.filter(i => !(i.target_type === 'food' && i.food_id === foodId))
    uebernehmen({
      ...s0,
      items: ziel === 'neutral' ? rest : s0.items.map(i =>
        i.target_type === 'food' && i.food_id === foodId
          ? {
              ...i,
              preference: ziel,
              strength: ziel === 'liked' ? 'like' : 'soft_dislike',
            }
          : i),
    })
    setLaeuft(false)
  }

  const foodSetzen = (
    foodId: string, name: string, blsCode: string | null, neigung: Neigung,
    quelle?: string | null,
  ) => {
    if (quelle && quelle !== 'settings') {
      void daumenZeile(foodId, neigung)
      return
    }
    itemsAendern(items => {
      const rest = items.filter(i => !(i.target_type === 'food' && i.food_id === foodId))
      return neigung === 'neutral' ? rest : [...rest, {
        id: '', target_type: 'food',
        preference: neigung === 'liked' ? 'liked' : 'disliked',
        strength: neigung === 'liked' ? 'boost' : 'soft_dislike',
        source: 'settings',
        food_id: foodId, food_name: name, bls_code: blsCode,
        category_id: null, category_name_de: null, category_slug: null,
        tag_code: null, tag_name_de: null,
        cuisine_code: null, exclusion_preset_code: null, catalog_item_code: null,
      }]
    })
  }

  const ausschlussEntfernen = (code: string) => {
    grundAendern(g0 => ({
      ...g0,
      general_exclusions: g0.general_exclusions.filter(x => x !== code),
    }))
  }

  const ausschlussUmschalten = (code: string) => {
    grundAendern(g0 => ({
      ...g0,
      general_exclusions: g0.general_exclusions.includes(code)
        ? g0.general_exclusions.filter(x => x !== code)
        : [...g0.general_exclusions, code],
    }))
  }

  const dietSetzen = (d2: string) => {
    grundAendern(g0 => ({ ...g0, diet_type: g0.diet_type === d2 ? null : d2 }))
  }

  // ── Lebensmittelsuche der Kachel (G-104) ──────────────────────
  // Dieselbe Route wie Suchseite und Erfassungsdialog — OHNE
  // `prefs=1`: wer ein Lebensmittel abwerten will, muss es finden
  // koennen; eine gefilterte Suche versteckte genau die Kandidaten.
  const [foodSuche, setFoodSuche] = React.useState('')
  const [foodTreffer, setFoodTreffer] = React.useState<NutritionFoodSearchRow[]>([])
  const [foodSuchFehler, setFoodSuchFehler] = React.useState<string | null>(null)
  const foodAbbruch = React.useRef<AbortController | null>(null)

  React.useEffect(() => {
    const frage = foodSuche.trim()
    if (frage.length < 2) {
      setFoodTreffer([])
      setFoodSuchFehler(null)
      return
    }
    const zeit = setTimeout(async () => {
      foodAbbruch.current?.abort()
      const ctrl = new AbortController()
      foodAbbruch.current = ctrl
      try {
        const a = await fetch(
          `/api/nutrition/foods?q=${encodeURIComponent(frage)}&limit=6`,
          { signal: ctrl.signal },
        )
        if (!a.ok) throw new Error(`HTTP ${a.status}`)
        const daten = await a.json() as { foods?: NutritionFoodSearchRow[] }
        setFoodTreffer(daten.foods ?? [])
        setFoodSuchFehler(null)
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return
        setFoodTreffer([])
        setFoodSuchFehler(e instanceof Error ? e.message : String(e))
      }
    }, 250)
    return () => clearTimeout(zeit)
  }, [foodSuche])

  const foodItems = stand.items.filter(i => i.target_type === 'food')

  // Kategorie-Vorlieben, die NICHT auf eine der gezeigten Wurzeln
  // zeigen — sonst waeren sie unsichtbar und faenden beim naechsten
  // Speichern kein Gegenstueck mehr.
  const wurzelIds = new Set(d.kategorien.map(k => k.id))
  const tiefeKategorien = stand.items.filter(
    i => i.target_type === 'category' && i.category_id && !wurzelIds.has(i.category_id))

  // Presets, die gesetzt sind — fuer die Vorbehalte darunter.
  const gesetztePresets = d.presets.filter(p => g.general_exclusions.includes(p.code))
  // Und gesetzte Codes OHNE Katalogeintrag: `ultra_processed` der
  // Testdaten ist kein Preset, sondern ein Verarbeitungsmerkmal. Es
  // steht in derselben Spalte und darf nicht verschwinden.
  const presetCodes = new Set(d.presets.map(p => p.code))
  const ausschluesseOhnePreset = g.general_exclusions.filter(c => !presetCodes.has(c))
  const zaehlung = {
    mag: stand.items.filter(i => i.preference === 'liked').length,
    magNicht: stand.items.filter(i => i.preference === 'disliked').length,
    aus: stand.items.filter(i => i.preference === 'hard_exclude').length,
  }

  if (d.ladefehler) {
    return (
      <Card title="Preferences" sub="konnten nicht geladen werden">
        <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>{d.ladefehler}</div>
      </Card>
    )
  }

  return (
    <div>
      {/* Ein Speicherhinweis statt eines Knopfs: jede Aenderung
          schreibt sofort. Die Zeile sagt, ob es geklappt hat. */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
        fontSize: 11, color: 'var(--fg-muted)', flexWrap: 'wrap',
      }}>
        <span>{`${zaehlung.mag} 💚 · ${zaehlung.magNicht} ❌ · ${zaehlung.aus} ausgeschlossen`}</span>
        {laeuft && <span className="v2-dim">speichert…</span>}
        {g.updated_at && !laeuft && (
          <span className="v2-dim v2-mono">{`zuletzt ${g.updated_at.slice(0, 16).replace('T', ' ')}`}</span>
        )}
        {fehler && <span style={{ color: 'var(--neg)' }}>{`Fehler: ${fehler}`}</span>}
      </div>

      <div className="v2-grid v2-grid-14" style={{ gap: 14 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Diet type" sub="global — hard filter, applies before all scoring">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DIETS.map(dt => (
                <button
                  key={dt} type="button" onClick={() => dietSetzen(dt)}
                  aria-pressed={g.diet_type === dt}
                  className={g.diet_type === dt ? 'v2-pill v2-pill-acc' : 'v2-pill'}
                  style={{
                    cursor: 'pointer', padding: '5px 12px', fontSize: 11.5,
                    textTransform: 'capitalize',
                  }}
                >{dt}</button>
              ))}
            </div>
            {/* `[read]` Der Vorbehalt, der laut Auftrag sichtbar
                gehoert — und er gilt fuer die Ernaehrungsform genauso
                wie fuer die Presets. */}
            {(g.diet_type === 'halal' || g.diet_type === 'kosher') && (
              <>
                <div className="v2-divider" />
                <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
                  Halal und koscher haengen an der Schlachtung — die
                  Naehrwertdaten kennen sie nicht. Die Einstellung schliesst
                  Zutaten aus; sie prueft keine Zubereitung.
                </div>
              </>
            )}
          </Card>

          <Card
            title="Categories"
            sub={`like +50 · dislike −50 · ${d.kategorien.length} Hauptkategorien`}
          >
            {/* `[cmd]` **Gesetzte Unterkategorien stehen zuerst.** Der
                Katalog fuehrt 518 Kategorien in mehreren Ebenen; die
                Kachel zeigt die 13 Wurzeln. Eine Vorliebe kann aber auf
                einer tieferen Ebene liegen — die Testdaten setzen
                „Kekse & Plätzchen", ein Enkel von „SÜSSES & SNACKS".
                **Ohne diese Zeile waere sie unsichtbar und wuerde beim
                naechsten Speichern still geloescht**, weil die
                Schreibfunktion die Items ersetzt. Gemessen, nicht
                vermutet. */}
            {tiefeKategorien.length > 0 && (
              <>
                <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
                  Gesetzt · Unterkategorien
                </div>
                <div className="v2-col-gap" style={{ gap: 4, marginBottom: 10 }}>
                  {tiefeKategorien.map(i => {
                    const n: Neigung = i.preference === 'liked' ? 'liked' : 'disliked'
                    return (
                      <div key={i.id} className="v2-prefs-kat">
                        <span style={{ flex: 1, fontSize: 12 }}>
                          {i.category_name_de ?? i.category_id}
                        </span>
                        <button
                          type="button" className="v2-prefs-zyklus"
                          title="Tippen: +50 mag ich → −50 mag ich nicht → egal"
                          aria-label={`${i.category_name_de ?? 'Kategorie'}: ${n === 'liked' ? '+50' : '−50'} — tippen wechselt`}
                          onClick={() => i.category_id && neigungSetzen(
                            'category', i.category_id, zyklus(n), i.category_name_de ?? '',
                          )}
                          style={{ background: farbe(n), color: 'var(--bg)' }}
                        >{n === 'liked' ? '+50' : '−50'}</button>
                        <button
                          type="button" className="v2-icon-btn"
                          aria-label={`${i.category_name_de ?? 'Kategorie'} entfernen`}
                          onClick={() => itemEntfernen(i.id)}
                        >
                          <Icon name="x" className="v2-ic v2-ic-sm" />
                        </button>
                      </div>
                    )
                  })}
                </div>
                <div className="v2-divider" />
              </>
            )}
            {d.kategorien.length === 0 ? (
              <div className="v2-dim" style={{ fontSize: 11.5, padding: '12px 0' }}>
                Kein Kategorienkatalog lesbar.
              </div>
            ) : (
              <div className="v2-g-cols-2" style={{ gap: 6 }}>
                {d.kategorien.map(k => {
                  const n = neigungVon('category', k.id)
                  return (
                    <div key={k.id} className="v2-prefs-kat">
                      <span style={{
                        flex: 1, fontSize: 12, whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>{k.name_de}</span>
                      {/* G-104: EIN Knopf statt drei unbeschrifteter —
                          tippen schaltet weiter, der Wert steht drauf. */}
                      <button
                        type="button" className="v2-prefs-zyklus"
                        title="Tippen: +50 mag ich → −50 mag ich nicht → egal"
                        aria-label={`${k.name_de}: ${n === 'liked' ? '+50 mag ich' : n === 'disliked' ? '−50 mag ich nicht' : 'egal'} — tippen wechselt`}
                        onClick={() => neigungSetzen('category', k.id, zyklus(n), k.name_de)}
                        style={n === 'neutral'
                          ? { background: 'var(--surface-2)', color: 'var(--fg-dim)' }
                          : { background: farbe(n), color: 'var(--bg)' }}
                      >{n === 'liked' ? '+50' : n === 'disliked' ? '−50' : '—'}</button>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          <Card
            title="Individual foods"
            sub={`like +100 · dislike −100 · highest priority · ${foodItems.length} gesetzt`}
          >
            {/* G-104: Die Kachel nimmt selbst auf — vorher war sie eine
                Anzeige ohne Bedienung („Individual foods kann man
                nichts setzen", Tom). Suchen, tippen, fertig; derselbe
                Zyklus wie ueberall. Der Daumen in Suche und Detail
                (G-67) schreibt weiter parallel hierher. */}
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <input
                value={foodSuche}
                onChange={e => setFoodSuche(e.target.value)}
                placeholder="Lebensmittel suchen und hinzufuegen …"
                aria-label="Lebensmittel suchen"
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '7px 10px',
                  font: 'inherit', fontSize: 12, color: 'var(--fg)',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 6,
                }}
              />
              {foodSuchFehler && (
                <div style={{ color: 'var(--neg)', fontSize: 11, marginTop: 4 }}>
                  {`Suche fehlgeschlagen: ${foodSuchFehler}`}
                </div>
              )}
              {foodTreffer.length > 0 && (
                <div className="v2-col-gap" style={{ gap: 3, marginTop: 6 }}>
                  {foodTreffer.map(t => {
                    const schonGesetzt = foodItems.some(f => f.food_id === t.id)
                    const name = t.name_display_de || t.name_de
                    return (
                      <button
                        key={t.id} type="button"
                        disabled={schonGesetzt}
                        onClick={() => {
                          foodSetzen(t.id, name, t.bls_code, 'liked')
                          setFoodSuche('')
                          setFoodTreffer([])
                        }}
                        title={schonGesetzt ? 'Schon gesetzt — unten aendern' : 'Als +100 mag ich aufnehmen'}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '6px 10px', fontSize: 12, textAlign: 'left',
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          borderRadius: 6, cursor: schonGesetzt ? 'default' : 'pointer',
                          opacity: schonGesetzt ? 0.5 : 1, color: 'var(--fg)',
                        }}
                      >
                        <span style={{ flex: 1 }}>{name}</span>
                        <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{t.bls_code}</span>
                        {!schonGesetzt && <span style={{ color: 'var(--pos)', fontSize: 11 }}>+100</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {foodItems.length === 0 ? (
              <div style={{ padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                  Noch keine einzelnen Lebensmittel
                </div>
                <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                  Oben suchen und aufnehmen — oder in Suche und Food-Detail
                  den Daumen setzen; beides landet hier.
                </div>
              </div>
            ) : (
              <div className="v2-tbl-wrap">
                <table className="v2-tbl">
                  <tbody>
                    {foodItems.map(f => {
                      const n: Neigung = f.preference === 'liked' ? 'liked' : 'disliked'
                      return (
                        <tr key={f.id}>
                          <td>
                            {f.food_name ?? '—'}
                            {f.bls_code && (
                              <span className="v2-dim v2-mono" style={{ fontSize: 10, marginLeft: 6 }}>
                                {f.bls_code}
                              </span>
                            )}
                            {f.source && f.source !== 'settings' && (
                              <Pill className="v2-mono" style={{ marginLeft: 6, fontSize: 9 }}>
                                {f.source === 'search_thumb' ? 'Daumen' : f.source}
                              </Pill>
                            )}
                          </td>
                          <td style={{ width: 56, textAlign: 'right' }}>
                            <button
                              type="button" className="v2-prefs-zyklus"
                              title="Tippen: +100 mag ich → −100 mag ich nicht → egal"
                              aria-label={`${f.food_name ?? 'Eintrag'}: ${n === 'liked' ? '+100' : '−100'} — tippen wechselt`}
                              onClick={() => f.food_id && foodSetzen(
                                f.food_id, f.food_name ?? '', f.bls_code, zyklus(n), f.source,
                              )}
                              style={{ background: farbe(n), color: 'var(--bg)' }}
                            >{n === 'liked' ? '+100' : '−100'}</button>
                          </td>
                          <td style={{ width: 30 }}>
                            <button
                              type="button" className="v2-icon-btn"
                              aria-label={`${f.food_name ?? 'Eintrag'} entfernen`}
                              onClick={() => f.food_id && f.source !== 'settings'
                                ? foodSetzen(f.food_id, f.food_name ?? '', f.bls_code, 'neutral', f.source)
                                : itemEntfernen(f.id)}
                            >
                              <Icon name="trash" className="v2-ic v2-ic-sm" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card
            title="Allergies"
            sub="hard exclusion · no scoring override"
          >
            <div className="v2-dim" style={{ fontSize: 11, marginBottom: 10, lineHeight: 1.5 }}>
              1× tippen = <span style={{ color: 'var(--warn)' }}>Sensibel</span> ·
              2× = <span style={{ color: 'var(--neg)' }}>Allergie</span> · 3× = entfernen
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {ALLERGENE.map(a => {
                const s = stufeVon(a.id)
                return (
                  <button
                    key={a.id} type="button" onClick={() => allergenWeiter(a.id)}
                    aria-pressed={s !== 'neutral'}
                    title="Tippen: Sensibel → Allergie → entfernen"
                    className="v2-pill"
                    style={{
                      cursor: 'pointer', padding: '4px 10px', fontSize: 11,
                      borderColor: s === 'neutral'
                        ? 'var(--border)'
                        : `color-mix(in oklch, ${farbe(s)} 40%, var(--border))`,
                      color: s === 'neutral' ? 'var(--fg-muted)' : farbe(s),
                      background: s === 'neutral'
                        ? 'var(--surface)'
                        : `color-mix(in oklch, ${farbe(s)} 8%, transparent)`,
                    }}
                  >
                    {a.label}
                    {s === 'allergie' && <span style={{ marginLeft: 5, fontSize: 9.5 }}>Allergie</span>}
                    {s === 'sensibel' && <span style={{ marginLeft: 5, fontSize: 9.5 }}>Sensibel</span>}
                  </button>
                )
              })}
            </div>
            <div className="v2-divider" />
            <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
              Die ersten 15 sind die EU-Kennzeichnungspflicht, die letzten fünf
              häufige Unverträglichkeiten. Milcheiweiß und Laktose stehen
              getrennt — eine Kuhmilchallergie richtet sich gegen das Eiweiß,
              eine Laktoseintoleranz gegen den Zucker.
            </div>

            {/* G-73, Tom 2026-08-19: „Ja, unbedingt einen Warnhinweis —
                aber auch von unserer Seite: `contains_nuts` hat Nuts
                drin, also muss es raus aus der Resultatsliste."

                `[cmd]` Das Ausschliessen greift seit C-94. Die Luecke
                ist die Markierung: `contains_nuts` traegt 120 von
                7.140 Lebensmitteln (1,7 %), `contains_gluten` 622
                (8,7 %), `contains_lactose` 1.021 (14,3 %).

                `[read]` Der Hinweis sagt deshalb DREI Dinge und nicht
                „ohne Gewaehr": was wirkt, was die Grenze ist, und was
                massgeblich bleibt. */}
            <div
              role="note"
              style={{
                marginTop: 12,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid color-mix(in oklch, var(--warn) 35%, var(--border))',
                background: 'color-mix(in oklch, var(--warn) 7%, transparent)',
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5,
              }}>
                <Icon name="alert" className="v2-ic v2-ic-sm"
                      style={{ color: 'var(--warn)' }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--warn)' }}>
                  Was der Ausschluss leistet — und was nicht
                </span>
              </div>
              <div style={{ fontSize: 10.5, lineHeight: 1.5, color: 'var(--fg-muted)' }}>
                Als <strong>Allergie</strong> markierte Stoffe werden aus der
                Trefferliste <strong>entfernt</strong>, nicht nur abgewertet.
                Grundlage ist eine <strong>kuratierte Markierung</strong> im
                Lebensmittelkatalog — sie ist <strong>nicht vollständig</strong>:
                derzeit sind {ALLERGEN_MARKIERT.nuts} von {ALLERGEN_MARKIERT.gesamt} Einträgen
                als nusshaltig erfasst, {ALLERGEN_MARKIERT.gluten} als glutenhaltig,
                {' '}{ALLERGEN_MARKIERT.lactose} als laktosehaltig. Ein Lebensmittel
                ohne Markierung wird <strong>nicht</strong> ausgeschlossen, auch
                wenn es den Stoff enthält.
                {' '}<strong>Bei einer Allergie bleibt die Zutatenliste auf der
                Verpackung massgeblich.</strong>
              </div>
            </div>
          </Card>

          {/* ── DIE KACHEL, DIE DAZUKOMMT ──────────────────────── */}
          <Card
            title="Generelle Ausschlüsse"
            sub={d.presets.length > 0
              ? `gilt über alle Kategorien hinweg · ${d.presets.length} Voreinstellungen`
              : 'gilt über alle Kategorien hinweg'}
          >
            {/* `[cmd]` **C-93 ist waehrend G-65 fertig geworden.** Der
                Auftrag ging von einem Leerzustand aus; seit 2026-08-19
                fuehrt `nutrition.exclusion_presets` elf Presets, und die
                Kachel bietet sie an. Ohne Katalog bleibt sie bedienbar
                und zeigt, was gesetzt ist. */}
            {d.presets.length === 0 ? (
              <div style={{ padding: '14px 8px' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                  {g.general_exclusions.length === 0
                    ? 'Keine generellen Ausschlüsse'
                    : `${g.general_exclusions.length} gesetzt`}
                </div>
                <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                  Voreinstellungen wie „keine Innereien&quot; oder „halal-konform&quot;
                  werden gerade erstellt. Sobald sie da sind, stehen sie hier
                  zur Auswahl.
                </div>
              </div>
            ) : (
              <>
                {(['personal', 'religious'] as const).map(art => {
                  const gruppe = d.presets.filter(p => p.kind === art)
                  if (gruppe.length === 0) return null
                  return (
                    <div key={art} style={{ marginBottom: 10 }}>
                      <div className="v2-eyebrow" style={{ marginBottom: 5 }}>
                        {art === 'personal' ? 'Persönlich' : 'Religiös'}
                      </div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {gruppe.map(p => {
                          const an = g.general_exclusions.includes(p.code)
                          return (
                            <button
                              key={p.code} type="button"
                              aria-pressed={an}
                              title={p.caveat_de ?? undefined}
                              onClick={() => ausschlussUmschalten(p.code)}
                              className="v2-pill"
                              style={{
                                cursor: 'pointer', padding: '4px 10px', fontSize: 11,
                                borderColor: an
                                  ? 'color-mix(in oklch, var(--neg) 40%, var(--border))'
                                  : 'var(--border)',
                                color: an ? 'var(--neg)' : 'var(--fg-muted)',
                                background: an
                                  ? 'color-mix(in oklch, var(--neg) 8%, transparent)'
                                  : 'var(--surface)',
                              }}
                            >
                              {an ? '⊘ ' : ''}{p.name_de}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {/* Der Vorbehalt je gesetztem Preset — **aus der Spalte
                    `caveat_de`, nicht aus dem Code.** `[read]` Der
                    Auftrag verlangt ihn sichtbar; die Datenbank fuehrt
                    ihn bereits, und damit steht er an einer Stelle. */}
                {gesetztePresets.filter(p => p.caveat_de).length > 0 && (
                  <>
                    <div className="v2-divider" />
                    <div className="v2-col-gap" style={{ gap: 6 }}>
                      {gesetztePresets.filter(p => p.caveat_de).map(p => (
                        <div key={p.code} className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
                          <strong>{p.name_de}:</strong> {p.caveat_de}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Gesetzte Codes ohne Katalogeintrag — sie sind echt und
                duerfen nicht verschwinden. `[cmd]` Die Testdaten fuehren
                `ultra_processed`, das kein Preset ist, sondern ein
                Verarbeitungsmerkmal. */}
            {ausschluesseOhnePreset.length > 0 && (
              <>
                <div className="v2-divider" />
                <div className="v2-eyebrow" style={{ marginBottom: 5 }}>
                  Weitere gesetzte Ausschlüsse
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {ausschluesseOhnePreset.map(code => (
                    <span
                      key={code} className="v2-pill"
                      style={{
                        padding: '4px 6px 4px 10px', fontSize: 11,
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        borderColor: 'color-mix(in oklch, var(--neg) 40%, var(--border))',
                        color: 'var(--neg)',
                        background: 'color-mix(in oklch, var(--neg) 8%, transparent)',
                      }}
                    >
                      {code}
                      <button
                        type="button" className="v2-icon-btn"
                        aria-label={`${code} entfernen`}
                        onClick={() => ausschlussEntfernen(code)}
                        style={{ width: 18, height: 18 }}
                      >
                        <Icon name="x" className="v2-ic v2-ic-sm" />
                      </button>
                    </span>
                  ))}
                </div>
              </>
            )}

            <div className="v2-divider" />
            {/* `[read]` Der Vorbehalt gehoert sichtbar — Auftrag G-65.
                Er steht hier als allgemeine Regel; die praezise Fassung
                je Preset kommt aus `caveat_de`. */}
            <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
              Ein Ausschluss schliesst die <strong>Zutat</strong> aus. Halal und
              koscher haengen zusätzlich an der Schlachtung, und davon wissen die
              Nährwertdaten nichts — die Zubereitung wird nicht geprüft.
            </div>
          </Card>

          {/* ══ G-72 / E-47: die Mahlzeitenstruktur ═════════════
              `[cmd]` **`food_preferences` traegt acht Spalten, die
              nirgends einstellbar waren** — gemessen am 2026-09-02:
              zwei Zeilen, alle acht gefuellt, **keine davon im
              Preferences-Tab.**

              `[cmd]` **Drei wirken bereits im Planner**
              (`rasterZeilen`, `plan-model.ts:73`) — **aber nur mit
              den Vorgabewerten**, weil niemand sie aendern konnte.

              ══ DREI SIND AUSGESETZT, NICHT VERGESSEN ═══════════

              `[cmd]` **G-99 hat gemessen, warum sie heute nichts tun
              koennen:**

                  cooking_skill       `recipes.cooking_skill` steht —
                                      aber nichts filtert danach
                  prep_time_max_min   `recipes.prep_time_min` steht —
                                      dasselbe
                  budget_level        **kein Preisfeld in `recipes`**
                                      und keine Preisquelle

              `[read]` **Ein Regler, der nichts bewirkt, ist schlimmer
              als keiner** — er behauptet eine Wirkung. **Deshalb
              stehen sie hier als Kommentar und nicht als Feld**
              (A-59: nicht loeschen, nicht still lassen).

              `[read]` **Sie gehoeren zum Kochmodul**, das es noch
              nicht gibt — mit Rezeptfilterung nach Koennen, Zeit und
              Preis. **Dieser Auftrag baut es ausdruecklich nicht.**

              ══ UND ZWEI BLEIBEN LIEGEN ═══════════════════

              `[cmd]` **`preferred_cuisines`** steht in der Datenbank
              (`{mediterranean}` auf dev), **hier aber bewusst nicht**
              — E-47. **Sie wartet auf denselben Punkt wie
              `thai_food` aus G-134.**

              `[cmd]` **`planner_notes` bekommt ein Feld** — Freitext,
              **nicht ausgewertet, nur gespeichert.** */}
          <Card title="Mahlzeitenstruktur"
                sub="wie viele Mahlzeiten Tagebuch und Planner zeigen">
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ fontSize: 10 }}>
                <span className="v2-eyebrow">Hauptmahlzeiten</span>
                <input
                  className="v2-feld" type="number" min={1} max={5}
                  data-probe="meals-per-day"
                  style={{ width: 76, flex: 'none', fontSize: 12 }}
                  aria-label="Hauptmahlzeiten pro Tag"
                  value={g.meals_per_day ?? 3}
                  onChange={e => {
                    const n = Number(e.target.value)
                    grundAendern(g0 => ({
                      ...g0,
                      meals_per_day: Number.isFinite(n) ? n : g0.meals_per_day,
                    }))
                  }}
                />
              </label>
              <label style={{ fontSize: 10 }}>
                <span className="v2-eyebrow">Snacks</span>
                <input
                  className="v2-feld" type="number" min={0} max={3}
                  data-probe="snacks-per-day"
                  style={{ width: 76, flex: 'none', fontSize: 12 }}
                  aria-label="Snacks pro Tag"
                  value={g.snacks_per_day ?? 0}
                  onChange={e => {
                    const n = Number(e.target.value)
                    grundAendern(g0 => ({
                      ...g0,
                      snacks_per_day: Number.isFinite(n) ? n : g0.snacks_per_day,
                    }))
                  }}
                />
              </label>
              <label style={{
                fontSize: 11.5, display: 'flex', alignItems: 'center',
                gap: 6, alignSelf: 'flex-end', paddingBottom: 7,
              }}>
                <input
                  type="checkbox" data-probe="meal-prep-ok"
                  aria-label="Vorkochen"
                  checked={g.meal_prep_ok ?? false}
                  onChange={e => grundAendern(g0 => ({
                    ...g0, meal_prep_ok: e.target.checked,
                  }))}
                />
                Vorkochen (Meal Prep)
              </label>
            </div>

            {/* `[read]` **Der Satz sagt, was die Zahl TUT** — sonst
                raet man, ob sie ein Ziel oder eine Anzeige ist. */}
            <div className="v2-dim" data-probe="struktur-wirkung"
                 style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
              {/* `[cmd]` **`rasterZeilen` liefert den Satz mit** —
                  dieselbe Funktion, die der Planner benutzt
                  (`plan-model.ts:73`). **Kein zweiter Wortlaut**,
                  sonst sagten Preferences und Planner Verschiedenes
                  ueber dieselbe Zahl. */}
              {rasterZeilen(g.meals_per_day, g.snacks_per_day).grund}
            </div>

            {/* ══ `planner_notes` — gespeichert, nicht ausgewertet ══
                `[read]` **Der Hinweis sagt es**, statt eine Wirkung
                zu versprechen, die es nicht gibt. */}
            <label style={{ fontSize: 10, display: 'block', marginTop: 12 }}>
              <span className="v2-eyebrow">Notizen für die Planung</span>
              <textarea
                className="v2-feld" data-probe="planner-notes"
                style={{ width: '100%', minHeight: 56, fontSize: 11.5 }}
                aria-label="Notizen für die Planung"
                value={g.planner_notes ?? ''}
                onChange={e => grundAendern(g0 => ({
                  ...g0, planner_notes: e.target.value,
                }))}
              />
            </label>
            <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 4, lineHeight: 1.5 }}>
              Freitext für Buddy — etwa {'„abends leicht"'} oder{' '}
              {'„montags keine Zeit"'}. <strong>Wird gespeichert, aber
              noch nicht ausgewertet</strong>; Buddy liest es, sobald
              er plant.
            </div>
          </Card>

          <Card title="Tag preferences" sub={`like +30 · dislike −30 · ${d.tags.length} Merkmale`}>
            {d.tags.length === 0 ? (
              <div className="v2-dim" style={{ fontSize: 11.5, padding: '12px 0' }}>
                Kein Merkmalskatalog lesbar.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {d.tags.map(t => {
                  const i = itemFuer('tag', t.code)
                  const aus = i?.preference === 'hard_exclude'
                  const n = aus ? 'disliked' : neigungVon('tag', t.code)
                  const gesetzt = Boolean(i)
                  return (
                    <button
                      key={t.code} type="button"
                      aria-pressed={gesetzt}
                      // G-104: Ein ⊘-Merkmal stammt aus der Allergieliste —
                      // der Knopf sagt es und aendert es NICHT mehr; vorher
                      // machte ein Klick aus dem Ausschluss ein „mag ich".
                      disabled={aus}
                      title={aus
                        ? 'Aus der Allergieliste — dort aendern'
                        : 'Tippen: +30 mag ich → −30 mag ich nicht → egal'}
                      onClick={() => neigungSetzen('tag', t.code, zyklus(n), t.name_de)}
                      className={gesetzt ? 'v2-pill v2-pill-acc' : 'v2-pill'}
                      style={{
                        cursor: aus ? 'default' : 'pointer', padding: '4px 10px', fontSize: 11,
                        color: gesetzt ? farbe(n) : undefined,
                      }}
                    >
                      {n === 'liked' ? '+30 ' : aus ? '⊘ ' : n === 'disliked' ? '−30 ' : ''}
                      {t.name_de}
                    </button>
                  )
                })}
              </div>
            )}
            <div className="v2-divider" />
            <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
              {'Tippen wechselt zwischen mag ich, mag ich nicht und egal. '}
              {'Ein Merkmal, das als Ausschluss gesetzt ist (⊘), stammt aus der '}
              {'Allergieliste und wird dort geändert.'}
            </div>
          </Card>

          <Card title="Priority order">
            <Row label="1 · Allergen" value="hard exclude" />
            <Row label="2 · Diet type" value="hard exclude" />
            <Row label="3 · Food" value="±100" />
            <Row label="4 · Category" value="±50" />
            <Row label="5 · Tag" value="±30" />
            <Row label="6 · Prefix match" value="+20" />
            <div className="v2-divider" />
            <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.5 }}>
              Specific beats general — a liked food overrides a disliked category.
            </div>
            <div className="v2-divider" />
            {/* G-104: Der alte Text („wirkt noch nicht in der Suche")
                stimmte seit C-94 nicht mehr. Jetzt steht da, WO es
                wirkt und wo bewusst nicht. */}
            <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
              Die Rangfolge <strong>wirkt beim Erfassen</strong>: der Dialog
              ruft die Suche mit deinen Vorlieben auf — Ausschlüsse
              verschwinden, Mag-ich rückt nach oben. Die Kataloge (Food DB,
              Startliste, Suchseite) zeigen bewusst <strong>alles</strong>:
              dort wird nachgeschlagen und bewertet, nicht gegessen.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
