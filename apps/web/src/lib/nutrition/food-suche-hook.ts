'use client'

// ════════════════════════════════════════════════════════════════════
// DIE SUCHE ALS HOOK — G-320
// ════════════════════════════════════════════════════════════════════
//
// **Tom, 2026-09-02:** *„offen planner ist die lebensmittelsuche die
// muss gleich aufgebaut sein wie die suche in food db."*
//
// ══ DER BEFUND, DER DEN AUFTRAG AENDERT ═════════════════════════════
//
// `[cmd]` **Der Auftrag warnt vor *,,einer zweiten Suche"*.**
// `[cmd]` **Gemessen am 2026-09-02: es gibt FUENF.**
//
//     tab-foods.tsx      Sortierung, Filter, Naehrwerte    1.060 Z.
//     mahlzeiten.tsx     Sortierung, Treffergrund,
//                        Portionen, Naehrwerte               982 Z.
//     rezepte-echt.tsx   Filter, Naehrwerte  (ZutatSuche)    G-300
//     tab-vorlieben.tsx  Filter, Treffergrund                976 Z.
//     erfassen.tsx       Portionen, Naehrwerte
//
// `[read]` **Jede ruft `/api/nutrition/foods` selbst, mit eigenem
// Entprellen, eigenem Abbruch und eigenem Zustand.** **Die sechste
// zu bauen waere der Fehler, vor dem der Auftrag warnt** — also
// steht hier die gemeinsame Mechanik, und der Planner ist ihr
// erster Aufrufer.
//
// ══ WAS HIER STEHT UND WARUM ════════════════════════════════════════
//
// `[read]` **Nur die Mechanik, kein Aussehen.** Ein Hook hat kein
// Layout — deshalb kann ihn die Zelle im Wochenraster genauso rufen
// wie der ganzseitige Reiter.
//
// `[cmd]` **Sie traegt sechs Lehren, die sonst je Kopie neu gemacht
// werden muessten:**
//
//     G-70    nur serverseitig sortieren, was die DB kann
//     G-112   mehrere Tags kommagetrennt
//     G-133   `ohne` geht an die Suchfunktion, nicht an die Seite
//     G-154   `prefs=1` — der Katalog ist konfiguriert
//     G-251   `herkunft` ebenso: sie entscheidet `total`
//     G-266   der erste Lauf wird uebersprungen, wenn `start` passt
//
// `[read]` **In vier der fuenf Kopien fehlen davon mindestens
// drei.** **Das ist der eigentliche Schaden einer zweiten Suche:
// nicht die doppelten Zeilen, sondern die Lehren, die nur in einer
// stehen.**

import * as React from 'react'

import type {
  NutritionFoodSearchPayload, NutritionFoodSearchRow,
} from './food-search'
import { serverSort, type Sortierung } from './food-sortierung'
import type { SuchHerkunft } from './herkunft-filter'

/** So viele Treffer je Seite — wie im Food-DB-Reiter. */
export const SEITE_GROESSE = 50

/**
 * Wie viele Treffer ein Modal zeigt.
 *
 * `[read]` **Weniger als der Reiter** — ein Modal blättert nicht, es
 * lässt weitersuchen. **50 Zeilen in einem Modal sind eine Liste,
 * durch die niemand scrollt.**
 */
export const MODAL_GROESSE = 12

export type SuchLage = {
  /** Der Suchbegriff. */
  suche: string
  kategorie: string | null
  /** Mehrere Tags gleichzeitig (G-112). */
  tags: Set<string>
  /** Ausgeschlossene Gruppen (G-133). */
  ohne: Set<string>
  /** Woher das Lebensmittel stammt (G-251). */
  herkunft: SuchHerkunft | null
  sortierung: Sortierung
  seite: number
}

export const LEERE_LAGE: SuchLage = {
  suche: '',
  kategorie: null,
  tags: new Set(),
  ohne: new Set(),
  herkunft: null,
  sortierung: 'relevance',
  seite: 0,
}

/**
 * Die Adresszeile für einen Suchlauf — G-320.
 *
 * `[read]` **Als eigene Funktion, damit sie prüfbar ist.** `[cmd]`
 * **G-315 hat gezeigt, warum:** eine Bedingung mitten im Baustein
 * lässt sich nur über ihren Wortlaut prüfen, nicht über ihre
 * Wirkung — und dann prüft der Wächter das Wort.
 */
export function sucheParams(
  lage: SuchLage, grenze: number, vorlieben = true,
): URLSearchParams {
  const p = new URLSearchParams({
    q: lage.suche,
    limit: String(grenze),
    offset: String(lage.seite * grenze),
    // G-70: nur was die Datenbank kann; der Rest wird auf der Seite
    // sortiert.
    sort: serverSort(lage.sortierung),
  })
  // ══ G-154 / G-331: die Vorlieben gelten — fast immer ════════
  //
  // `[read]` **Die Vorlieben sind die Konfiguration dieses Katalogs.**
  // **Die Kennung kommt serverseitig aus der Sitzung**, nicht aus der
  // Adresse.
  //
  // `[cmd]` **G-331: eine Suche darf sie NICHT anwenden** — die im
  // Vorlieben-Reiter. **Dort sucht man, um eine Vorliebe zu SETZEN**
  // (`foodSetzen(t.id, name, t.bls_code, 'liked')`).
  //
  // `[read]` **Mit `prefs=1` versteckte der Filter genau die
  // Lebensmittel, die man aufnehmen will** — wer Nuesse als Allergie
  // gesetzt hat, faende keine Nuss mehr, um sie zu berichtigen.
  //
  // `[read]` **Deshalb ein Schalter mit `true` als Vorgabe:** wer ihn
  // nicht setzt, bekommt das richtige Verhalten.
  if (vorlieben) p.set('prefs', '1')
  if (lage.kategorie) p.set('category', lage.kategorie)
  // G-112: alle gewählten Tags, kommagetrennt und sortiert — sonst
  // ist dieselbe Auswahl zweimal eine andere Adresse.
  if (lage.tags.size > 0) p.set('tags', Array.from(lage.tags).sort().join(','))
  // G-133: der Ausschluss geht an die Suchfunktion. `[cmd]`
  // **Clientseitig blieben die Ausgeschlossenen auf Seite 2 stehen,
  // und `total` war gelogen.**
  if (lage.ohne.size > 0) p.set('ohne', Array.from(lage.ohne).sort().join(','))
  // G-251: dieselbe Lehre für die Herkunft.
  if (lage.herkunft) p.set('herkunft', lage.herkunft)
  return p
}

export type SuchErgebnis = {
  payload: NutritionFoodSearchPayload | null
  zeilen: readonly NutritionFoodSearchRow[]
  /** Wie viele Treffer die Datenbank kennt — nicht wie viele geladen sind. */
  gesamt: number
  laeuft: boolean
  fehler: string | null
  /** Wie lange der letzte Lauf gedauert hat. */
  dauerMs: number | null
}

/**
 * Die Suche, einmal gebaut — G-320.
 *
 * `[read]` **Entprellen, Abbruch und Zustand sitzen hier**, nicht in
 * jedem Aufrufer. `[cmd]` **Der Abbruch ist kein Beiwerk:** ohne ihn
 * überholt eine langsame ältere Antwort die neuere, und im Feld
 * steht ein Wort, während die Liste ein anderes zeigt.
 *
 * @param lage      Begriff, Filter, Sortierung, Seite
 * @param grenze    Treffer je Seite (`SEITE_GROESSE` / `MODAL_GROESSE`)
 * @param start     Vorgeladene Treffer — dann läuft der erste Lauf
 *                  nicht (G-266). `null` heisst: gleich suchen.
 * @param mindestens Ab wie vielen Zeichen gesucht wird. **Im Modal
 *                  sinnvoll (2), im Reiter nicht (0)** — dort steht
 *                  die Liste schon beim Öffnen.
 */
export function useFoodSuche(
  lage: SuchLage,
  grenze: number,
  start: NutritionFoodSearchPayload | null = null,
  mindestens = 0,
  /** G-331: `false` nur im Vorlieben-Reiter — siehe `sucheParams`. */
  vorlieben = true,
): SuchErgebnis {
  const [payload, setPayload] = React.useState(start)
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const [dauerMs, setDauerMs] = React.useState<number | null>(null)

  // G-266: der erste Lauf wird übersprungen, wenn `start` schon zum
  // Begriff passt. `[read]` **Kam der Begriff aus der Adresse, passt
  // `start` nicht** — dann muss gleich gesucht werden.
  const ersterLauf = React.useRef(start !== null && lage.suche.trim().length === 0)
  const laufend = React.useRef<AbortController | null>(null)

  // Die Filter als Zeichenkette — ein `Set` ist bei jedem Rendern ein
  // neues Objekt und würde den Effekt endlos auslösen.
  const schluessel = React.useMemo(
    () => sucheParams(lage, grenze, vorlieben).toString(),
    [lage, grenze, vorlieben])

  React.useEffect(() => {
    if (ersterLauf.current) { ersterLauf.current = false; return }
    // `[read]` **Unter der Mindestlänge wird nicht gesucht** — sonst
    // liefert ein einzelner Buchstabe 4.970 Zeilen.
    if (lage.suche.trim().length < mindestens) {
      setPayload(null)
      return
    }
    const zeit = setTimeout(async () => {
      laufend.current?.abort()
      const ctrl = new AbortController()
      laufend.current = ctrl
      setLaeuft(true)
      setFehler(null)
      const t0 = performance.now()
      try {
        const a = await fetch(`/api/nutrition/foods?${schluessel}`,
          { signal: ctrl.signal })
        if (!a.ok) throw new Error(`HTTP ${a.status}`)
        const d = await a.json() as NutritionFoodSearchPayload
        setDauerMs(Math.round(performance.now() - t0))
        setPayload(d)
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return
        setFehler(e instanceof Error ? e.message : String(e))
      } finally {
        setLaeuft(false)
      }
    }, 180)
    return () => clearTimeout(zeit)
  }, [schluessel, mindestens, lage.suche])

  const zeilen = React.useMemo(() => payload?.foods ?? [], [payload?.foods])

  return {
    payload,
    zeilen,
    gesamt: payload?.total ?? 0,
    laeuft,
    fehler,
    dauerMs,
  }
}
