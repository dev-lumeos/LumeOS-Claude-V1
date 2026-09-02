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

// G-72: die Reihen aus den Vorlieben.
import type { Slot } from '../../../lib/nutrition/plan-model'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, Icon, InEntwicklung } from '@lumeos/ui'

import { MEAL_TYPES, type MealType } from '../../../lib/nutrition/diary-model'
import { vortag } from '../../../lib/datum'
import type { NutritionFoodSearchRow } from '../../../lib/nutrition/food-search'
// G-309: die Plantage erscheinen als Ghost Entries — Flow 3, Schritt 7.
import { GhostEintragKarte, type GhostEintrag } from './ghost-eintrag'
// G-331: dasselbe Suchmodal wie Planner (G-320), Rezept (G-323)
// und Ghost-Eintrag (G-329) — keine fuenfte Suche.
import { FoodSuchModal } from './food-such-modal'
// G-332: die benannten Slots (C-392) und ihre Zuordnung.
import {
  slotFuerZeit, slotFuerTyp, kategorieAuswahl, KATEGORIE_TEXT,
  type MahlzeitSlot,
} from '../../../lib/nutrition/slots-lage'
// G-336: dieselbe Modalhuelle wie die Suche (G-320/G-321) —
// keine zweite Ziehlogik.
import { ZiehModal } from './zieh-modal'

/** Die Slots der Vorlage, in ihrer Reihenfolge. */
// ══ G-335: die eigene Namensliste ist weg ═════════════════
//
// `[cmd]` **Hier stand `SLOT_LABEL` mit englischen Bezeichnungen** —
// eine von ACHT Listen, mit vier Schreibweisen fuer `pre_workout`.
//
// `[read]` **`meal_type` ist eine Kategorie, keine Beschriftung**
// (E-58). **`KATEGORIE_TEXT` ist der Rueckfall**, wenn keine Quelle
// einen Namen liefert.
const SLOT_LABEL = KATEGORIE_TEXT

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
  datum, slots = null, mahlzeitSlots = [], ghostSlots, onGeaendert,
}: {
  datum: string
  /**
   * G-332: die benannten Slots aus `meal_slots` (C-392).
   *
   * `[cmd]` **Sie bestimmen, wie die Zeilen HEISSEN** — `slots`
   * (aus G-72) bestimmt weiterhin, WELCHE `meal_type` es gibt.
   *
   * `[read]` **Leer heisst: keine gesetzt** — dann bleibt es bei
   * `SLOT_LABEL`, den festen Bezeichnungen.
   */
  mahlzeitSlots?: readonly MahlzeitSlot[]
  /**
   * G-336: die Slots des AKTIVEN Plans, fuer die Ghost-Eintraege.
   *
   * **Tom, 2026-09-02:** *,,ghostentries bilden ab was im plan drin
   * ist, also muss der plan angepasst werden."*
   *
   * `[read]` **Ein Ghost gehoert dem Plan** — er zeigt, was der Plan
   * vorsieht. **Also gilt dessen Benennung** (E-59).
   *
   * `[read]` **Getrennt von `mahlzeitSlots`, nicht statt dessen:**
   * die EIGENEN Karten des Tages heissen weiter nach den eigenen
   * Slots (E-58). **Nur die Ghosts folgen dem Plan.**
   *
   * `[read]` **Ohne Angabe gilt `mahlzeitSlots`** — der Rueckfall aus
   * G-335 bleibt damit unveraendert bestehen.
   */
  ghostSlots?: readonly MahlzeitSlot[]
  /**
   * G-72: welche Mahlzeitenreihen der Tag zeigt.
   *
   * `[cmd]` **Aus `meals_per_day` und `snacks_per_day`** — dieselbe
   * Funktion, die der Planner benutzt (`rasterZeilen`).
   *
   * `[read]` **`null` heisst: nicht lesbar**, dann gilt die Vorlage.
   */
  slots?: Slot[] | null
  onGeaendert?: () => void
}) {
  const [mahlzeiten, setMahlzeiten] = React.useState<Mahlzeit[]>([])
  // G-309: die Plantage des Tages, sofern ein Plan aktiv ist.
  const [ghosts, setGhosts] = React.useState<GhostEintrag[]>([])
  // ══ G-332 Punkt 5: eine Mahlzeit ausserhalb der Slots ═══════
  //
  // **Tom, 2026-09-02:** *,,ein user kann auch jederzeit im diary
  // eine neue mahlzeit anlegen und nutrients reinpacken."*
  //
  // `[cmd]` **Gemessen, bevor gebaut wurde: der Weg fehlte nicht
  // erst seit G-331.** `sicherstellen()` legt seit C-03 Mahlzeiten
  // an — **aber nur fuer die vordefinierten Slots.** Eine leere
  // Karte entsteht je `reihen`-Eintrag; wer um 22:00 isst, hatte
  // keine.
  //
  // `[read]` **E-58: der Slot ordnet, die Buchung ist die
  // Wahrheit.** **Deshalb ist die Zeit frei waehlbar**, und die
  // Slots stehen nur als Vorschlag daneben.
  const [freieMahlzeit, setFreieMahlzeit] = React.useState(false)
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
  // ══ G-72 / E-47: die Reihen kommen aus den Vorlieben ════════
  //
  // `[cmd]` **Hier stand eine feste Liste aus fuenf Slots.** `[cmd]`
  // **`meals_per_day` und `snacks_per_day` wirkten nur im Planner**
  // — wer zwei Mahlzeiten isst, sah im Tagebuch trotzdem fuenf leere
  // Karten.
  //
  // `[read]` **Die Vorlage bleibt als Rueckfall** — sind die
  // Vorlieben nicht lesbar, ist eine zu lange Liste besser als eine
  // leere. **`post_workout` steht nur dort:** `rasterZeilen` kennt
  // ihn nicht, und ihn hier zu ergaenzen hiesse, zwei Wahrheiten
  // ueber die Reihen zu fuehren.
  const VORLAGE: MealType[] = ['breakfast', 'snack', 'lunch', 'dinner', 'post_workout']
  const reihen: MealType[] = slots && slots.length > 0
    ? (slots as MealType[])
    : VORLAGE
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
  const leereSlots = reihen.filter(
    typ => !belegteTypen.has(typ) && !ghostTypen.has(typ))

  // ══ G-332 Punkt 4: die Zeilen heissen wie die Slots ════════
  //
  // **Der Auftrag:** *,,Die Zuordnung macht die Zeit —
  // naechstliegende Slot-Zeit, ohne gespeicherte Kennung."*
  //
  // `[cmd]` **0 von 2.899 `meals` sind ohne `meal_time`**
  // (2026-09-02) — die Zuordnung greift lueckenlos.
  //
  // `[read]` **E-58: kein gespeicherter Wert aendert sich.** Wer eine
  // Slot-Zeit verschiebt, sieht alte Eintraege anders gruppiert —
  // **das ist gewollt.**
  const nameFuer = React.useCallback((
    typ: MealType, zeit: string | null,
  ): string => {
    const s = slotFuerZeit(mahlzeitSlots, zeit)
    return s?.name ?? SLOT_LABEL[typ]
  }, [mahlzeitSlots])

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
          name={nameFuer(m.meal_type, m.meal_time)}
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
          // G-335: die Ghost-Karte heisst wie der Slot, nicht wie die
          // Kategorie — Toms Befund *,,Breakfast statt Fruehstueck"*.
          //
          // G-336: und zwar wie der Slot DES PLANS, wenn er einen hat
          // (E-59) — sonst wie der eigene. `ghostSlots` traegt bereits
          // die Entscheidung; hier steht nur der Rueckfall.
          slots={ghostSlots ?? mahlzeitSlots}
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
          // `[read]` **Eine leere Karte hat keine Uhrzeit** — der
          // Name kommt dann aus dem Slot mit derselben Nummer, nicht
          // ueber die Zeit. **`SLOT_LABEL` bleibt der Rueckfall.**
          name={slotFuerTyp(mahlzeitSlots, typ, reihen) ?? SLOT_LABEL[typ]}
          onGeaendert={neuLaden}
        />
      ))}

      {/* ══ G-332 Punkt 5: eine Mahlzeit ausserhalb der Slots ═════
          **Tom, 2026-09-02:** *,,in diary unten mahlzeit
          hinzufuegen, das ist verschwunden. ein user kann auch
          jederzeit im diary eine neue mahlzeit anlegen und nutrients
          reinpacken."*

          `[cmd]` **Gemessen: der Knopf ist nicht mit G-331
          verschwunden** — `sicherstellen()` legt seit C-03 an, und
          der Code ist gegen `HEAD` unveraendert. **Es gab ihn nie
          fuer eine FREIE Mahlzeit:** leere Karten entstehen je
          vordefiniertem Slot, **wer um 22:00 isst, hatte keine.**

          `[read]` **E-58: der Slot ordnet, die Buchung ist die
          Wahrheit.** **Die Zeit ist frei**, die Slots stehen als
          Vorschlag daneben. */}
      <FreieMahlzeit
        datum={datum}
        slots={mahlzeitSlots}
        offen={freieMahlzeit}
        setOffen={setFreieMahlzeit}
        onGeaendert={neuLaden}
      />
    </>
  )
}

/**
 * Eine Mahlzeit anlegen, die in keinen Slot passt — G-332.
 *
 * `[read]` **Name und Zeit frei** — die Slots sind ein Vorschlag,
 * keine Auswahlpflicht. `[cmd]` **`meal_type` bleibt unangetastet**
 * (der Auftrag sagt es): die Karte waehlt eine Kategorie, der Name
 * kommt aus der Zeit.
 */
function FreieMahlzeit({ datum, slots, offen, setOffen, onGeaendert }: {
  datum: string
  slots: readonly MahlzeitSlot[]
  offen: boolean
  setOffen: (v: boolean) => void
  onGeaendert: () => void
}) {
  const [zeit, setZeit] = React.useState('')
  const [typ, setTyp] = React.useState<MealType>('other')
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  // ══ G-336: die Auswahl kennt zwei Arten von Eintrag ═══════════════
  //
  // `[read]` **Ein Slot ist etwas anderes als eine Kategorie:** der
  // Slot bringt Namen UND Zeit mit, die Kategorie nur einen Text.
  // **Der Wert traegt deshalb, woher er kommt** — `slot:2` oder
  // `kat:breakfast`.
  //
  // `[cmd]` **Der gespeicherte Wert bleibt `meal_type`** — die
  // Datenbank kennt keine Slotspalte in `meals`. **Der Slot waehlt
  // die Kategorie ueber seine Stellung**, wie im Raster (G-336).
  const [wahl, setWahl] = React.useState('kat:other')
  const [name, setName] = React.useState('')

  // `[read]` **Die Kategorien in ihrer Reihenfolge** — sie ordnet den
  // Slots ihre Kategorie zu. **Dieselbe Ordnung wie im Raster.**
  const reihen = React.useMemo(
    () => Object.keys(KATEGORIE_TEXT), [])

  /**
   * Eine Wahl uebernehmen — G-336.
   *
   * `[read]` **Ein Slot setzt Zeit und Name mit**, weil er beides
   * kennt. **Beide bleiben danach frei**: die Wahl ist ein Vorschlag,
   * keine Festlegung (E-58).
   */
  function waehle(wert: string) {
    setWahl(wert)
    if (wert.startsWith('slot:')) {
      const pos = Number(wert.slice(5))
      const s = slots.find(x => x.position === pos)
      if (s) {
        setZeit(s.planned_time)
        setName(s.name)
        // Die Kategorie folgt der Stellung, nicht dem Namen.
        const i = slots.findIndex(x => x.position === pos)
        setTyp((reihen[i] ?? 'other') as MealType)
      }
      return
    }
    const kat = wert.slice(4)
    setTyp(kat as MealType)
    // `[read]` **Der Name bleibt, wenn der Nutzer ihn getippt hat** —
    // nur der Vorschlag aus einem Slot wird ersetzt.
    setName(n => (slots.some(s => s.name === n) ? '' : n))
  }

  // `[read]` **Die Vorgabe ist die aktuelle Uhrzeit** — wer jetzt
  // isst, muss sie nicht tippen. **Auf volle Minuten**, weil
  // `meals_meal_time_minute_check` Sekunden verbietet.
  React.useEffect(() => {
    if (!offen) return
    const j = new Date()
    setZeit(`${String(j.getHours()).padStart(2, '0')}:${String(j.getMinutes()).padStart(2, '0')}`)
  }, [offen])

  // `[read]` **Der Slot-Vorschlag folgt der Zeit** — er sagt, wohin
  // die Mahlzeit fallen WIRD, ohne sie dorthin zu zwingen.
  const vorschlag = slotFuerZeit(slots, zeit)

  async function anlegen() {
    setLaeuft(true)
    setFehler(null)
    try {
      const a = await fetch('/api/nutrition/diary', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          art: 'mahlzeit', entry_date: datum, meal_type: typ, meal_time: zeit,
          // `[read]` **Leer heisst: keine Notiz** — ein leerer String
          // waere eine Aussage, wo keine gemacht wurde.
          ...(name.trim().length > 0 ? { notes: name.trim() } : {}),
        }),
      })
      if (!a.ok) {
        const k = await a.json().catch(() => null)
        setFehler(k?.error ?? `Fehler ${a.status}`)
        return
      }
      setOffen(false)
      setName('')
      onGeaendert()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  // ══ G-336: der Knopf bleibt stehen ════════════════════════════════
  //
  // **Tom, 2026-09-02:** *,,das unten in diary auch nicht geloest, ich
  // denke da ist ein modal besser."*
  //
  // `[cmd]` **Gemessen vor dem Bau:** der Knopf lag bei **y = 2720**,
  // und beim Klick war er weg (`knopf_noch_da: 0`) — **das Formular
  // stand an seiner Stelle, unterhalb des sichtbaren Bereichs.**
  //
  // `[read]` **Der Knopf verschwand nicht durch einen Fehler, sondern
  // durch die Bauweise:** er WAR das Formular, an derselben Stelle.
  // **Im Modal steht er weiter da, und das Formular liegt darueber.**
  return (
    <>
      <button
        type="button" className="v2-btn v2-btn-sm"
        data-probe="freie-mahlzeit-oeffnen"
        style={{ marginTop: 10, gap: 6 }}
        onClick={() => setOffen(true)}
      >
        <Icon name="plus" className="v2-ic v2-ic-sm" />
        Mahlzeit hinzufügen
      </button>

      {offen && (
        <ZiehModal
          titel="Mahlzeit hinzufügen"
          aria="Mahlzeit hinzufügen"
          breite={520}
          probe="freie-mahlzeit"
          onClose={() => { if (!laeuft) setOffen(false) }}
        >
          <div className="v2-col-gap" style={{ gap: 12 }}>
            <label style={{ fontSize: 10, display: 'block' }}>
              <span className="v2-eyebrow">Uhrzeit</span>
              <input
                className="v2-feld" type="time"
                data-probe="freie-zeit"
                style={{ width: 130, fontSize: 12 }}
                aria-label="Uhrzeit der Mahlzeit"
                value={zeit}
                disabled={laeuft}
                onChange={e => setZeit(e.target.value)}
              />
            </label>

            {/* ══ G-336: die eigenen Slots als Auswahl ═══════════
                **Der Auftrag:** *,,Die Auswahl bietet die eigenen
                Slots mit ihrer Zeit — und Freitext daneben."*

                `[cmd]` **Hier stand `SLOT_LABEL`** — die sieben
                Kategorien, mit *Sonstiges* als Vorgabe. `[cmd]`
                **Gemessen: die Auswahl zeigte Fruehstueck,
                Mittagessen, Abendessen, Snack, Vor dem Training,
                Nach dem Training, Sonstiges** — **kein einziger
                Name des Nutzers.**

                `[read]` **Ein Slot traegt seine Zeit mit:** wer
                *Nachmittagssnack* waehlt, meint 16:00. **Die Zeit
                folgt der Wahl** — aber sie bleibt danach frei
                (E-58). */}
            <label style={{ fontSize: 10, display: 'block' }}>
              <span className="v2-eyebrow">Mahlzeit</span>
              <select
                className="v2-feld" data-probe="freie-art"
                style={{ fontSize: 12, width: '100%' }}
                aria-label="Art der Mahlzeit"
                value={wahl}
                disabled={laeuft}
                onChange={e => waehle(e.target.value)}
              >
                {slots.map(s => (
                  <option key={`slot-${s.position}`} value={`slot:${s.position}`}>
                    {s.name} ({s.planned_time})
                  </option>
                ))}
                {slots.length > 0 && (
                  <option disabled>── ohne eigenen Slot ──</option>
                )}
                {/* `[cmd]` **Ohne Slots aufgerufen, mit Absicht.**
                    `kategorieAuswahl(slots, …)` loeste die Kategorien
                    ueber die Nutzerslots auf — **gemessen am
                    2026-09-02: beide Haelften zeigten dieselben fuenf
                    Namen, und *Vor dem Training* fehlte ganz**, weil
                    es von einem Slotnamen verdeckt wurde.

                    `[read]` **Hier ist die Kategorie gemeint, nicht
                    ihr Slotname** — die Slots stehen schon darueber. */}
                {kategorieAuswahl().map(k => (
                  <option key={k.code} value={`kat:${k.code}`}>
                    {k.label}
                  </option>
                ))}
              </select>
            </label>

            {/* ══ G-336: Freitext daneben ════════════════════════
                **Der Auftrag:** *,,und Freitext daneben."*

                `[read]` **Der Text ist frei** — die Auswahl setzt ihn
                als Vorschlag, wer will, ueberschreibt ihn. **Sie
                ordnet, sie schreibt nicht vor** (E-58).

                `[cmd]` **Er geht nach `meals.notes`, nicht in eine
                Namensspalte** — **`nutrition.meals` hat keine**
                (gemessen 2026-09-02: `id, user_id, entry_date,
                meal_type, notes, created_at, updated_at, meal_time,
                entry_source, source_detail`).

                `[read]` **Deshalb heisst das Feld *Notiz*, nicht
                *Name*** — ein Name, der als Notiz gespeichert wird,
                waere eine Beschriftung, die ihr Feld nicht haelt.
                **Die fehlende Spalte ist gemeldet.** */}
            <label style={{ fontSize: 10, display: 'block' }}>
              <span className="v2-eyebrow">Notiz (frei)</span>
              <input
                className="v2-feld" type="text"
                data-probe="freie-name"
                style={{ fontSize: 12, width: '100%' }}
                aria-label="Name der Mahlzeit"
                placeholder="z. B. Spätmahlzeit"
                value={name}
                disabled={laeuft}
                onChange={e => setName(e.target.value)}
              />
            </label>

            {/* `[read]` **Der Vorschlag sagt, wohin sie faellt** —
                ohne passenden Slot steht es genauso da. **Das ist
                der 22-Uhr-Fall aus dem Auftrag**, und er steht
                jetzt im Modal statt unter einem halb verdeckten
                Feld. */}
            <p className="v2-muted" data-probe="freie-hinweis"
               style={{ fontSize: 11, lineHeight: 1.5, margin: 0 }}>
              {vorschlag
                ? <>Wird bei <strong>{vorschlag.name}</strong> ({vorschlag.planned_time})
                    einsortiert — die nächstliegende Zeit.</>
                : <>Für diese Zeit gibt es keinen Slot. <strong>Die Mahlzeit wird
                    trotzdem erfasst</strong> und steht mit ihrer Uhrzeit da.</>}
            </p>

            {fehler && (
              <p style={{ fontSize: 11, color: 'var(--neg)', margin: 0 }}>{fehler}</p>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              <button
                type="button" className="v2-btn v2-btn-sm v2-btn-primary"
                data-probe="freie-anlegen"
                disabled={laeuft || !zeit}
                onClick={anlegen}
              >
                {laeuft ? 'Legt an…' : 'Anlegen'}
              </button>
              <button type="button" className="v2-btn v2-btn-sm"
                      disabled={laeuft} onClick={() => setOffen(false)}>
                Abbrechen
              </button>
            </div>
          </div>
        </ZiehModal>
      )}
    </>
  )
}

function MahlzeitKarte({
  datum, typ, mahlzeit, name, onGeaendert,
}: {
  datum: string
  typ: MealType
  mahlzeit: Mahlzeit | null
  /**
   * G-332: wie die Zeile heisst.
   *
   * `[read]` **Aus `meal_slots`, ueber die Zeit zugeordnet** — ohne
   * gesetzte Slots faellt es auf `SLOT_LABEL` zurueck. **Der
   * Aufrufer entscheidet das**, nicht die Karte: sie kennt die
   * Slots nicht.
   */
  name: string
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
        <span data-probe="karten-name"
              style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
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

      {/* ══ G-331: dasselbe Modal wie Planner, Rezept und Ghost ════
          `[read]` **Der Kontext ist der TAG** — Datum und Mahlzeit
          stehen fest, das Tagesziel kennt diese Karte nicht.
          `[read]` **`ziel: null` heisst: kein Ziel bekannt** — die
          Anzeige schreibt dann keinen Prozentsatz, statt einen zu
          erfinden. */}
      {sucheAuf && (
        <FoodSuchModal
          kontext={{
            art: 'tag',
            datum,
            slot: typ,
            slotLabel: name,
            schonImTag: summe.kcal > 0 ? Math.round(summe.kcal) : null,
            ziel: null,
          }}
          onClose={() => setSucheAuf(false)}
          onWaehlen={async (f, mengeG) => {
            // `[read]` **Der Schreibweg bleibt hier** — das Modal
            // gibt Lebensmittel und Menge zurueck, mehr nicht.
            // **Ein Modal, das seinen Schreibweg kennt, waere an ihn
            // gebunden.**
            const mealId = await sicherstellen()
            const a = await fetch('/api/nutrition/diary', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                art: 'position', meal_id: mealId,
                food_id: f.id, amount_g: mengeG,
              }),
            })
            if (!a.ok) {
              const k = await a.json().catch(() => null)
              throw new Error(k?.error ?? `Fehler ${a.status}`)
            }
            setSucheAuf(false)
            onGeaendert()
          }}
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

// ══ G-331: `HinzufuegenModal` ist ENTFERNT ═══════════════
//
// `[cmd]` **380 Zeilen, seit C-03** — mit eigenem Suchfeld, eigenem
// `fetch`, eigener Trefferliste, eigener Portionswahl.
//
// `[cmd]` **Gemessen am 2026-09-02: ihr fehlten sechs der acht
// Lehren** — Abbruch, G-70 (Seitensortierung), G-112 (mehrere Tags),
// G-133 (`ohne`), G-251 (Herkunft), G-266 (Erstlauf). **Entprellen
// und `prefs=1` hatte sie.**
//
// `[read]` **`FoodSuchModal` (G-320) tut dasselbe** — suchen,
// waehlen, Menge, Live-Vorschau — **und traegt alle acht.** Es
// schreibt nicht selbst: der Schreibweg (`art: 'position'`) bleibt
// hier, wo er war.
//
// `[cmd]` **Was dabei dazukommt:** zehn Sortierwerte, Filter,
// Treffergrund, die Naehrwertvorschau je Menge — alles, was der
// Food-DB-Reiter kann.
//
// `[read]` **A-59: entfernt, nicht auskommentiert** — git holt die
// 380 Zeilen zurueck, wenn jemand nachsehen will.

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
