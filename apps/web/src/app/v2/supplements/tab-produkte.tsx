'use client'

// Der Produkte-Reiter — G-452.
//
// **Tom, 2026-09-08, mit Tobias (IFBB-Profi):** *„die supplier produkte
// inklusive details in supplements links neben katalog, einen neuen
// navigationspunkt namens supplements, und soll aussehen wie die
// mockupvorlage von katalog inkl aller details als pulldown."*
//
// ══ DIE BAUFORM IST DIE DES KATALOGS ════════════════════════════════
//
// `[read]` **Uebernommen aus `substanz-detail.tsx` (C-229/G-180):**
// Pillenreihe zum Filtern, EINE Suche mit dem X darin, `v2-tbl` im
// `v2-supp-tbl-wrap`, Klick auf die Zeile klappt eine zweite `<tr>`
// darunter auf, Fusszeile mit *„N von M"*, benannter Grund bei null
// Treffern.
//
// `[read]` **Kein Modal** — die Begruendung steht im Kopf von
// `substanz-tafel.tsx` und gilt hier genauso: der Platz in der Liste
// bleibt sichtbar, zwei Produkte lassen sich nacheinander vergleichen,
// und ein zweiter Klick schliesst.
//
// ══ WAS ANDERS IST, UND WARUM ═══════════════════════════════════════
//
// `[cmd]` **Der Katalog haelt 566 Zeilen im Browser und filtert dort**
// (`substanz-detail.tsx:151`). **Hier sind es 214.780** — das
// 380-fache. `[cmd]` **G-176 hat die 566 gemessen (4.713 DOM-Knoten,
// 3.270–3.494 ms) und den Satz dazugeschrieben:** *„Wenn der Katalog
// einmal Tausende traegt, ist die Messung zu wiederholen."*
//
// `[read]` **Das AUSSEHEN ist die Vorlage, die MECHANIK nicht.**
// Gesucht, gefiltert und geblaettert wird in der Datenbank; die
// Zeilenform, die Pillen und das Ausklappen bleiben, wie Tom sie
// kennt.
//
// `[cmd]` **Auch `tab-foods.tsx` taugt als Vorlage nur halb** — seine
// Filterleiste ist fuer 7.140 Lebensmittel gebaut und bietet Facetten
// mit Zaehlern je Kategorie. **Bei 6.012 Marken waeren das 6.012
// Pillen**; deshalb steht die Marke hier nicht als Pillenreihe.
//
// ══ G-453: Toms drei Punkte nach dem Ansehen ════════════════════════
//
// **1 — *„marken filter per eingabe oben, dass man nicht 2 meter
// scrollen muss"*.** `[cmd]` **Hier stand ein `<select>`** — mit 62
// Marken aus dem Rueckfall ertraeglich, **mit den 4.907 aus C-495
// nicht mehr** (gemessen 2026-09-14). **Jetzt ein Eingabefeld, das
// tippend filtert.**
//
// **2 — die Tafel.** `[cmd]` **Die Vierspaltentabelle ueber die volle
// Breite ist raus**; was sie ersetzt, steht in `produkt-tafel.tsx`
// samt Kontrastmessung.
//
// **3 — *„nach parent/child, kategorie als parent"*.** `[cmd]` **Zwei
// Orte:** in der Tafel buendeln die Kategorien die Zeilen
// (`etikettBuendel`), und hier oben filtern sie die TREFFERLISTE.
//
// **Tom, 2026-09-14, auf die Rueckfrage:** *„Kategorienfilter: auf
// PRODUKTE. Trefferliste einschraenken, Tafel zeigt weiter ALLE
// Zeilen. Der Filter ist ein Suchwerkzeug. Wer ein Produkt aufmacht,
// will das ganze Etikett."*
import * as React from 'react'
import { Card, Pill, Icon, InEntwicklungKnopf } from '@lumeos/ui'

import type {
  ProduktZeile, ProduktSatz, ProduktListe,
} from '../../../lib/supplements/produkte-read'
// ══ A-30: WERTE NUR AUS DER SERVERFREIEN DATEI ══════════════════════
//
// `[cmd]` **`KATEGORIEN` stand zuerst in `produkte-read.ts`, und die
// Seite gab 500 zurueck:** *„You're importing a component that needs
// next/headers."* **Aus `produkte-read` kommen ausschliesslich
// TYPEN** — die werden beim Uebersetzen entfernt. **Werte kommen aus
// `produkt-etikett.ts`.**
import {
  KATEGORIEN, FORMEN, MARKEN_PULLDOWN, FENSTER, portionText, formLabel,
} from '../../../lib/supplements/produkt-etikett'
// G-453: die strukturierte Tafel nach Medical-Vorbild.
import { ProduktTafel } from './produkt-tafel'
// ══ G-455: der Daumen je Produkt ═══════════════════════════════════
//
// `[read]` **Die Rechnung serverfrei, der Schreibweg als
// Serveraktion** — dieselbe Teilung wie in nutrition (G-67) und
// dieselbe A-30-Grenze wie ueberall in diesem Reiter.
import {
  naechsterProduktDaumen, nachDaumen, type Daumen,
} from '../../../lib/supplements/produkt-daumen-lage'
import { produktDaumenSpeichern } from './daumen-aktion'

/**
 * Zwei Knoepfe, drei Zustaende — die Bauform aus `nutrition/daumen.tsx`.
 *
 * `[cmd]` **Dieselben Zeichen wie dort:** `check` und `x`, gruen bzw.
 * rot. **`packages/ui` fuehrt kein `thumb_up`/`thumb_down`**, und das
 * Vorgaengerrepo benutzt genau diese beiden (G-67).
 *
 * `[read]` **KEINE Sicherheitsabfrage beim Abwerten** — anders als bei
 * den Lebensmitteln. `[cmd]` **Dort verschwindet die Zeile aus der
 * Liste**, ein Fehlklick ist also nicht mehr zu finden. **Hier bleibt
 * das Produkt stehen und rutscht nur nach unten** — ein zweiter Klick
 * hebt auf.
 */
function ProduktDaumen({ zustand, name, onKlick }: {
  zustand: Daumen
  name: string
  onKlick: (richtung: 'liked' | 'disliked') => void
}) {
  const knopf = (richtung: 'liked' | 'disliked') => {
    const aktiv = zustand === richtung
    const farbe = richtung === 'liked' ? 'var(--pos)' : 'var(--neg)'
    return (
      <button
        type="button"
        aria-pressed={aktiv}
        aria-label={richtung === 'liked'
          ? `${name} mag ich${aktiv ? ' — Bewertung aufheben' : ''}`
          : `${name} mag ich nicht${aktiv ? ' — Bewertung aufheben' : ''}`}
        title={richtung === 'liked' ? 'Mag ich' : 'Mag ich nicht'}
        onClick={e => { e.stopPropagation(); e.preventDefault(); onKlick(richtung) }}
        style={{
          width: 22, height: 22, padding: 0,
          display: 'grid', placeItems: 'center',
          borderRadius: 6, cursor: 'pointer',
          background: aktiv
            ? `color-mix(in oklch, ${farbe} 16%, transparent)` : 'transparent',
          border: `1px solid ${aktiv ? farbe : 'var(--border)'}`,
          // `[read]` **`--fg-muted`, nicht `--fg-dim`** — die
          // Kontrastmessung aus G-453 gilt weiter (9,19:1 gegen 2,88:1).
          color: aktiv ? farbe : 'var(--fg-muted)',
        }}
      >
        <Icon name={richtung === 'liked' ? 'check' : 'x'}
              className="v2-ic v2-ic-sm" />
      </button>
    )
  }
  return (
    <span style={{ display: 'inline-flex', gap: 4 }}>
      {knopf('liked')}{knopf('disliked')}
    </span>
  )
}

/**
 * Der Marktstatus, den der Reiter beim Oeffnen zeigt.
 *
 * **Toms Antwort auf die Frage:** *„Marktstatus — nur On Market als
 * Standard."*
 *
 * `[cmd]` **Gemessen 2026-09-14: 121.959 von 214.780 sind On Market**,
 * 92.821 Off Market.
 */
const STANDARD_STATUS = 'On Market'

/** `[cmd]` **Die gemessene Gesamtzahl** — der Nenner in der Fusszeile. */
const GESAMT_BESTAND = 214780

/**
 * Der Markenfilter als Eingabefeld — G-453, Toms Punkt 1.
 *
 * **Tom, 2026-09-08:** *„marken filter per eingabe oben, dass man
 * nicht 2 meter scrollen muss"*
 *
 * ══ WAS HIER VORHER STAND ═══════════════════════════════════════════
 *
 * `[cmd]` **Ein `<select>` mit allen Marken.** **Solange der
 * C-495-Rueckfall lief, waren es 62** — ertraeglich. `[cmd]` **Seit
 * C-495 eingespielt ist, sind es 4.907** (gemessen 2026-09-14 gegen
 * `supplements.supplier_product_brands`).
 *
 * `[read]` **4.907 Eintraege in einem Pulldown sind genau die zwei
 * Meter, die Tom meint** — und ein Pulldown kann man nicht tippen,
 * nur suchen, indem man die Anfangsbuchstaben schnell genug
 * hintereinander drueckt.
 *
 * ══ WARUM KEIN `<datalist>` ═════════════════════════════════════════
 *
 * `[read]` **`<datalist>` waere vier Zeilen und saehe zunaechst
 * richtig aus.** `[cmd]` **Aber es filtert nur auf den ANFANG des
 * Wortes** — wer *„optimum"* tippt, faende `Optimum Nutrition`, aber
 * nicht `ON Optimum Nutrition`. **Und beide gibt es** (gemessen
 * 2026-09-14: 48 bzw. 122 On-Market-Produkte).
 *
 * `[read]` **Deshalb eine eigene Liste mit `includes`** — sie findet
 * die Marke an jeder Stelle des Namens.
 *
 * `[read]` **Die Mechanik ist die von `tab-foods.tsx`** (G-320): im
 * Browser filtern, weil die Liste schon da ist — **4.907 Zeichenketten
 * sind kein Grund fuer einen Serverweg**, anders als die 214.780
 * Produkte.
 */
function MarkenFeld(
  { marken, gewaehlt, onWaehlen, vollstaendig }: {
    marken: string[]
    gewaehlt: string | null
    onWaehlen: (m: string | null) => void
    vollstaendig: boolean
  },
) {
  const [text, setText] = React.useState('')
  const [offen, setOffen] = React.useState(false)
  const feld = React.useRef<HTMLDivElement>(null)

  // Ein Klick daneben schliesst die Liste.
  // `[read]` **Ohne das bliebe sie ueber der Trefferliste stehen** und
  // verdeckte genau das, was der Filter gerade eingeengt hat.
  React.useEffect(() => {
    if (!offen) return
    function daneben(e: MouseEvent) {
      if (feld.current && !feld.current.contains(e.target as Node)) setOffen(false)
    }
    document.addEventListener('mousedown', daneben)
    return () => document.removeEventListener('mousedown', daneben)
  }, [offen])

  const treffer = React.useMemo(() => {
    const f = text.trim().toLowerCase()
    if (!f) return marken.slice(0, 200)
    // `[read]` **`includes`, nicht `startsWith`** — siehe Kopf.
    // `[cmd]` **Gedeckelt bei 200**: mehr passt in keine Liste, durch
    // die jemand sieht, und wer 200 Treffer hat, tippt weiter.
    return marken.filter(m => m.toLowerCase().includes(f)).slice(0, 200)
  }, [marken, text])

  return (
    <div className="v2-supp-prod-markenfeld" ref={feld}>
      <input
        className="v2-feld"
        value={gewaehlt && !offen ? gewaehlt : text}
        onChange={e => { setText(e.target.value); setOffen(true) }}
        onFocus={() => { setText(''); setOffen(true) }}
        placeholder="Marke tippen…"
        aria-label="Marke filtern"
        role="combobox"
        aria-expanded={offen}
        aria-controls="v2-supp-markenliste"
        style={{ fontSize: 11.5, padding: '4px 8px', width: '100%' }}
      />
      {offen && (
        <div className="v2-supp-prod-markenliste" id="v2-supp-markenliste"
             role="listbox">
          {/* `[read]` **„Alle Marken" als erster Eintrag** — G-181
              Punkt 6b: *„diverse filter haengen wenn man sie
              abwaehlt."* **Der Weg zurueck muss sichtbar sein.** */}
          <button
            type="button" className="v2-supp-prod-markenknopf"
            role="option" aria-selected={gewaehlt === null}
            onClick={() => { onWaehlen(null); setText(''); setOffen(false) }}
          >
            Alle Marken
          </button>
          {treffer.map(m => (
            <button
              key={m} type="button" className="v2-supp-prod-markenknopf"
              role="option" aria-selected={gewaehlt === m}
              onClick={() => { onWaehlen(m); setText(''); setOffen(false) }}
            >
              {m}
            </button>
          ))}
          {treffer.length === 0 && (
            // `[read]` **Auch hier ein benannter Grund**, kein leerer
            // Kasten — und er nennt den getippten Text, damit man den
            // Tippfehler sieht.
            <div className="v2-supp-prod-markenleer">
              Keine Marke enthält „{text.trim()}“.
              {!vollstaendig && ' Die Markenliste ist nur ein Ausschnitt.'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function SuppProdukte() {
  const [frage, setFrage] = React.useState('')
  // ══ G-455: MEHRERE MARKEN ═══════════════════════════════════════
  //
  // **Tom (G-453):** *„marken muessen noch besser geloest werden, dass
  // ein user seine filtermasken mit marken setzen kann und nicht nur
  // eine marke waehlen."*
  //
  // `[cmd]` **Hier stand `useState<string | null>`.** `[read]` **Jetzt
  // eine Liste, ODER-verknuepft** — und der Leseweg filtert damit in
  // der DATENBANK (`.in()`), nicht auf der geladenen Seite.
  // `[read]` **`gewaehlteMarken`, nicht `marken`** — letzteres ist
  // seit G-453 die Liste der VERFUEGBAREN Marken (4.907 aus C-495).
  // **Zwei Listen mit einem Namen waeren die naechste Falle.**
  const [gewaehlteMarken, setGewaehlteMarken] = React.useState<string[]>([])

  /** Eine Marke dazu oder weg — derselbe Knopf in beide Richtungen. */
  const markeSchalten = React.useCallback((m: string | null) => {
    if (m === null) { setGewaehlteMarken([]); return }
    setGewaehlteMarken(alt => alt.includes(m)
      ? alt.filter(x => x !== m)
      : [...alt, m].sort())
  }, [])
  // Toms Vorgabe: nur On Market als Standard. `null` heisst „alle".
  const [status, setStatus] = React.useState<string | null>(STANDARD_STATUS)
  // G-453: die Kategorie filtert PRODUKTE (Toms Antwort).
  const [kategorie, setKategorie] = React.useState<string | null>(null)
  // G-453: die Darreichungsform, MIT E-Code — die Spalte traegt ihn.
  const [form, setForm] = React.useState<string | null>(null)
  // ══ G-455: der harte Allergiefilter ═══════════════════════════════
  //
  // **Tom:** *„MEINE ALLERGIEN … HART: Produkt verschwindet."*
  //
  // `[read]` **Vorgabe AN** — eine Allergie ist keine Einstellung, die
  // man erst suchen muss. **Abschaltbar bleibt sie trotzdem**: wer
  // nachsehen will, was der Filter wegnimmt, braucht den Schalter
  // (und die Gegenprobe A8 auch).
  const [allergienAn, setAllergienAn] = React.useState(true)
  // G-73: der Filterknopf ist das Setup zum Ein- und Ausblenden.
  const [filterOffen, setFilterOffen] = React.useState(false)
  // `[read]` **Heisst nicht mehr „Seite"** — es zaehlt, wie oft
  // nachgeladen wurde. Das Fenster waechst, es wandert nicht (G-453/3).
  const [seite, setSeite] = React.useState(0)
  const [liste, setListe] = React.useState<ProduktListe | null>(null)
  const [laeuft, setLaeuft] = React.useState(false)
  const [marken, setMarken] = React.useState<string[]>([])
  const [markenVoll, setMarkenVoll] = React.useState(true)

  // ══ G-455: der Daumen je Produkt ══════════════════════════════════
  //
  // **Tom:** *„Der Daumen je Produkt, gruene zuoberst."*
  //
  // `[cmd]` **C-497 hat `food_preference_items.supplement_product_id`
  // gebaut** — in G-453 war genau das noch unmoeglich (der `food_id`-FK
  // zeigte auf `nutrition.foods`, und ein Produkt-Insert fiel an der
  // Datenbank). **Der Befund ging als Messung an C-497.**
  const [daumen, setDaumen] = React.useState<Record<string, Daumen>>({})
  const [daumenFehler, setDaumenFehler] = React.useState<string | null>(null)

  // ══ G-455: die Meidestoffe — der WEICHE Filter ══════════════════
  //
  // `[read]` **Einmal geholt, nicht je Suchlauf** — sie aendern sich
  // nur in den Vorlieben.
  const [meidestoffe, setMeidestoffe] = React.useState<string[]>([])
  React.useEffect(() => {
    void (async () => {
      try {
        const a = await fetch('/api/supplements/meidestoffe')
        if (!a.ok) return
        const j = await a.json() as { codes?: string[] }
        setMeidestoffe(j.codes ?? [])
      } catch { /* ohne Meidestoffe wird nichts markiert */ }
    })()
  }, [])

  const [offeneZeile, setOffeneZeile] = React.useState<string | null>(null)
  const [satz, setSatz] = React.useState<ProduktSatz | null>(null)
  const [ladeFehler, setLadeFehler] = React.useState<string | null>(null)

  const laufend = React.useRef<AbortController | null>(null)

  // ── Die Suche ────────────────────────────────────────────────────
  //
  // `[read]` **Entprellt und abbrechbar** — dieselbe Lehre wie in
  // `food-suche-hook.ts` (G-320): `[cmd]` **ohne Abbruch ueberholt eine
  // langsame aeltere Antwort die neuere**, und im Feld steht ein Wort,
  // waehrend die Liste ein anderes zeigt.
  //
  // ══ G-455: DIE ADRESSE IST DER SCHLUESSEL ═════════════════════════
  //
  // `[cmd]` **Die Abhaengigkeitsliste enthielt `gewaehlteMarken`** —
  // ein ARRAY, und damit bei jedem Anstrich ein NEUES Objekt.
  // **Gemessen 2026-09-15: die Anfrage ging mit `marken=NOW` hinaus
  // und wurde abgebrochen**, `requestfinished` feuerte nie, die Liste
  // blieb bei 458 — waehrend die Pillen oben richtig dastanden.
  // **Der Filter sah aus, als griffe er nicht.**
  //
  // `[read]` **Dieselbe Falle steht schon in `food-suche-hook.ts`
  // (G-320):** *„ein `Set` ist bei jedem Rendern ein neues Objekt und
  // wuerde den Effekt endlos ausloesen."* **Dort ist die Antwort
  // dieselbe: die Adresse als Zeichenkette.**
  const schluessel = React.useMemo(() => {
    const p = new URLSearchParams({ q: frage.trim(), seite: String(seite) })
    // `[read]` **Sortiert und kommagetrennt** — dieselbe Auswahl
    // ergibt immer dieselbe Adresse (G-112), sonst liefe der
    // Zwischenspeicher doppelt.
    if (gewaehlteMarken.length > 0) {
      p.set('marken', [...gewaehlteMarken].sort().join(','))
    }
    if (!allergienAn) p.set('allergien', '0')
    if (kategorie) p.set('kategorie', kategorie)
    if (form) p.set('form', form)
    p.set('status', status ?? 'alle')
    return p.toString()
  }, [frage, gewaehlteMarken, status, seite, kategorie, form, allergienAn])

  React.useEffect(() => {
    const zeit = setTimeout(async () => {
      laufend.current?.abort()
      const ctrl = new AbortController()
      laufend.current = ctrl
      setLaeuft(true)
      try {
        const a = await fetch(`/api/supplements/produkte?${schluessel}`,
          { signal: ctrl.signal })
        if (!a.ok) throw new Error(`HTTP ${a.status}`)
        setListe(await a.json() as ProduktListe)
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return
        setListe({
          zeilen: [], gesamt: 0, weg: 'einfach',
          fehler: e instanceof Error ? e.message : String(e),
        })
      } finally {
        setLaeuft(false)
      }
    }, 180)
    return () => clearTimeout(zeit)
  }, [schluessel])

  // Die Markenliste — einmal.
  React.useEffect(() => {
    void (async () => {
      try {
        const a = await fetch('/api/supplements/marken')
        if (!a.ok) return
        const j = await a.json() as { marken: string[]; vollstaendig: boolean }
        setMarken(j.marken ?? [])
        setMarkenVoll(j.vollstaendig !== false)
      } catch { /* ohne Marken bleibt der Filter leer, die Suche laeuft */ }
    })()
  }, [])

  // Ein Filterwechsel setzt die Seite zurueck — sonst steht man auf
  // Seite 12 einer Menge, die nur noch drei Seiten hat.
  // `[read]` **Ein Filterwechsel faengt das Fenster neu an** — sonst
  // haette man 1.500 Zeilen geladen und saehe die ersten 500 einer
  // ganz anderen Menge.
  //
  // ══ G-455: AUCH HIER EINE ZEICHENKETTE ════════════════════════════
  //
  // `[cmd]` **Hier stand `gewaehlteMarken` (ein Array) in der
  // Abhaengigkeitsliste** — bei jedem Anstrich ein neues Objekt.
  // **Der Effekt lief also bei JEDEM Rendern, rief `setSeite(0)`,
  // loeste damit den naechsten Anstrich aus** — und der Suchlauf
  // daneben brach seine eigene Anfrage ab, bevor sie ankam.
  //
  // `[cmd]` **Gemessen 2026-09-15: die Anfrage ging mit `marken=NOW`
  // hinaus, `requestfinished` feuerte nie, die Liste blieb bei 458.**
  //
  // `[read]` **Zwei Effekte, dieselbe Falle** — und die zweite war
  // die eigentliche Ursache. **Ein Array als Abhaengigkeit ist immer
  // ein Verdacht.**
  const filterSchluessel = [
    frage, [...gewaehlteMarken].sort().join(','), status ?? '',
    kategorie ?? '', form ?? '', allergienAn ? '1' : '0',
  ].join('|')
  React.useEffect(() => { setSeite(0) }, [filterSchluessel])

  /**
   * Wie viele Filter gesetzt sind — die Zahl am Filterknopf.
   *
   * `[read]` **Der Marktstatus zaehlt nur mit, wenn er NICHT auf der
   * Vorgabe steht.** `[cmd]` Sonst stuende beim Oeffnen des Reiters
   * schon eine 1 am Knopf, und die Zahl hiesse nichts mehr.
   */
  // `[read]` **Jede gewaehlte Marke zaehlt einzeln** — wer drei
  // gesetzt hat, soll die Drei am Knopf sehen.
  const aktiveFilter = gewaehlteMarken.length + (kategorie ? 1 : 0)
    + (form ? 1 : 0)
    + (allergienAn ? 0 : 1)
    + (status === STANDARD_STATUS ? 0 : 1)

  const filterZuruecksetzen = React.useCallback(() => {
    setGewaehlteMarken([]); setKategorie(null); setForm(null)
    setStatus(STANDARD_STATUS)
    // `[read]` **Der Allergiefilter geht NICHT mit zurueck** — er ist
    // kein Suchfilter, sondern ein Schutz. **„Alles zuruecksetzen"
    // darf ihn nicht stillschweigend abschalten.**
  }, [])

  async function oeffne(id: string) {
    setLadeFehler(null)
    try {
      const a = await fetch(`/api/supplements/produkt?id=${encodeURIComponent(id)}`)
      const j = await a.json() as { satz?: ProduktSatz; error?: string }
      if (!a.ok || !j.satz) { setLadeFehler(j.error ?? 'Nicht geladen.'); return }
      setSatz(j.satz)
      setOffeneZeile(j.satz.id)
    } catch (e) {
      setLadeFehler(e instanceof Error ? e.message : String(e))
    }
  }

  /** Ein Klick auf die Zeile: aufklappen — oder wieder zu (G-180). */
  function schalteZeile(id: string) {
    if (offeneZeile === id) { setOffeneZeile(null); setSatz(null); return }
    void oeffne(id)
  }

  const rohZeilen = React.useMemo(() => liste?.zeilen ?? [], [liste])

  // ── Den Daumenstand zu den gezeigten Produkten holen ─────────────
  //
  // `[read]` **Nach jeder Suche neu** — die Liste wechselt, und ein
  // alter Stand faerbte die falschen Zeilen.
  React.useEffect(() => {
    if (rohZeilen.length === 0) { setDaumen({}); return }
    let verworfen = false
    void (async () => {
      try {
        // `[cmd]` **POST, nicht GET** — 500 Ids sind 18.500 Zeichen
        // Adresse, und Node deckelt Kopfzeilen bei 16.384. **Die
        // erste Fassung bekam HTTP 431 und riss die Produktsuche
        // daneben mit** (gemessen 2026-09-15).
        const a = await fetch('/api/supplements/daumen', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ids: rohZeilen.map(z => z.id) }),
        })
        if (!a.ok) throw new Error(`HTTP ${a.status}`)
        const j = await a.json() as { stand: Record<string, Daumen> }
        if (!verworfen) { setDaumen(j.stand ?? {}); setDaumenFehler(null) }
      } catch (e) {
        // `[read]` **Gemeldet, nicht verschluckt** — sonst saehe der
        // Nutzer seine Bewertungen verschwinden und hielte sie fuer
        // geloescht.
        if (!verworfen) {
          setDaumenFehler(e instanceof Error ? e.message : String(e))
        }
      }
    })()
    return () => { verworfen = true }
  }, [rohZeilen])

  /**
   * Die Liste, gruene zuoberst.
   *
   * **Tom:** *„Der Daumen je Produkt, gruene zuoberst."*
   *
   * `[cmd]` **Die Sortierung steht laut Auftrag in
   * `search_supplier_products`** (liked → neutral → disliked).
   * `[read]` **Aber nur dort** — der Tabellenweg sortiert nach
   * `name_en`, und der laeuft, sobald ein Kategorie- oder Formfilter
   * gesetzt ist oder kein Suchbegriff dasteht (G-453).
   *
   * `[read]` **Deshalb hier nachsortiert, STABIL** — die Reihenfolge
   * innerhalb einer Gruppe bleibt die der Datenbank. **Sonst
   * sprangen die Zeilen bei jedem Klick.**
   */
  const zeilen = React.useMemo(
    () => nachDaumen(rohZeilen, daumen), [rohZeilen, daumen])

  /** Ein Klick auf den Daumen — der Zustand wandert sofort mit. */
  const daumenKlick = React.useCallback(async (
    id: string, richtung: 'liked' | 'disliked',
  ) => {
    const neu = naechsterProduktDaumen(daumen[id] ?? 'neutral', richtung)
    // `[read]` **Erst zeigen, dann schreiben** — ein Daumen, der eine
    // Netzrunde lang nichts tut, wird zweimal geklickt.
    setDaumen(d => ({ ...d, [id]: neu }))
    const a = await produktDaumenSpeichern(id, neu)
    if (!a.ok) {
      // Zurueckdrehen und sagen, was war.
      setDaumen(d => ({ ...d, [id]: daumen[id] ?? 'neutral' }))
      setDaumenFehler(a.fehler)
    }
  }, [daumen])
  const gesamt = liste?.gesamt ?? 0

  /**
   * Warum die Liste leer ist — in einem Satz (G-182, Punkt 1).
   *
   * `[read]` **Der Grund wird benannt, nicht geraten**, und in der
   * Reihenfolge geprueft, in der ein Filter greift.
   *
   * `[cmd]` **Der Suchweg gehoert in den Satz:** solange C-495 nicht
   * eingespielt ist, laeuft der `ILIKE`-Rueckfall, und der findet eine
   * Fehleingabe nicht. **Ein blosses „keine Treffer" liesse offen, ob
   * es das Produkt nicht gibt oder die Smartsuche fehlt.**
   */
  const grundFuerLeer = React.useMemo(() => {
    const q = frage.trim()
    if (liste?.fehler) return `Die Abfrage ist fehlgeschlagen: ${liste.fehler}`
    // `[cmd]` **G-453: der Satz ist nachgezogen.** In G-452 hiess
    // `einfach`, dass C-495 fehlt; **seit dem 2026-09-14 ist die
    // Funktion da**, und `einfach` heisst jetzt: **diese Abfrage
    // nutzt sie nicht** (Kategoriefilter gesetzt).
    if (q && liste?.weg === 'einfach' && kategorie) {
      return `Kein Produktname enthält „${q}“ in der Kategorie `
        + `„${kategorie}“. Mit einem Kategoriefilter sucht LumeOS auf `
        + 'genauen Text — die Smartsuche, die Fehleingaben versteht, '
        + 'kennt keinen Kategorieparameter.'
    }
    if (q) return `Keine Treffer für „${q}“.`
    // `[read]` **Zwei Filter, zwei Saetze** — wer Marke UND Kategorie
    // gesetzt hat, soll wissen, dass beide gelten. `[cmd]` Ein Satz
    // mit nur einem der beiden liesse den anderen unsichtbar wirken.
    const markeText = gewaehlteMarken.length === 1
      ? `„${gewaehlteMarken[0]}“`
      : `den ${gewaehlteMarken.length} gewählten Marken`
    if (gewaehlteMarken.length > 0 && kategorie) {
      return `${markeText} hat kein Produkt mit einer Zeile der Kategorie `
        + `„${kategorie}“.`
    }
    if (gewaehlteMarken.length > 0) return `Unter ${markeText} steht nichts.`
    if (kategorie) return `Kein Produkt trägt eine Zeile der Kategorie „${kategorie}“.`
    return 'Keine Treffer.'
  }, [frage, gewaehlteMarken, kategorie, liste])

  return (
    <div>
      {/* ══ G-453: DIE LEISTE WIE IN FOODSDB ════════════════════════
          **Tom, 2026-09-15:** *„Suchfeld und Filter wie in foodsdb:
          Sucheingabe, daneben ,Filter ein-/ausblenden', dann die
          Aktion ,Custom Supplement'. Darunter die Kategorien schoener
          dargestellt."*

          `[cmd]` **Die Bauform ist `tab-foods.tsx:661-700`:**
          `.v2-train-lib-filter` traegt Suchfeld, Filterknopf mit der
          Zahl der aktiven Filter und die Aktion — in dieser Folge.
          **Die Klasse steht in `packages/ui`**, wird also geteilt und
          nicht kopiert.

          `[read]` **Was darunter liegt, ist die Lehre aus G-73:**
          *„Wir haben so viel Platz — lass die Filter einfach logisch
          darunter aufbauen, und der Filterknopf ist das Setup zum
          Filter ein- oder ausblenden."* **Die Filter stehen unter der
          Leiste, nicht hinter dem Knopf.** */}
      <div className="v2-train-lib-filter" style={{ marginBottom: 14 }}>
        <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
          <Icon name="search" className="v2-ic v2-ic-sm"
                style={{
                  position: 'absolute', left: 10, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--fg-muted)',
                }} />
          <input
            aria-label="Produkt suchen"
            value={frage}
            onChange={e => setFrage(e.target.value)}
            placeholder={`${GESAMT_BESTAND.toLocaleString('de-DE')} Produkte durchsuchen`}
            style={{
              width: '100%', height: 32, background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 6,
              padding: '0 30px 0 30px', fontSize: 12, outline: 'none',
              color: 'var(--fg)',
            }}
          />
          {frage.length > 0 && (
            <button
              type="button" className="v2-supp-suche-x"
              onClick={() => setFrage('')}
              aria-label="Suche leeren" title="Suche leeren"
            >
              ×
            </button>
          )}
        </div>
        {/* `[read]` **Die Zahl am Knopf sagt, dass etwas gesetzt ist,
            auch wenn die Leiste zu ist** — ohne sie waere ein
            zugeklappter Filter ein unsichtbarer Filter. */}
        <button
          type="button"
          className={filterOffen ? 'v2-btn v2-btn-primary' : 'v2-btn'}
          aria-expanded={filterOffen}
          aria-controls="v2-supp-prod-filter"
          onClick={() => setFilterOffen(o => !o)}
        >
          <Icon name="filter" className="v2-ic v2-ic-sm" /> Filter
          {aktiveFilter > 0 && (
            <span className="v2-num" style={{ marginLeft: 6 }}>{aktiveFilter}</span>
          )}
        </button>
        {/* `[read]` **`InEntwicklungKnopf` wie bei *Custom food*** —
            der Weg ist nicht gebaut, und ein Knopf, der nichts tut,
            waere schlechter als einer, der es sagt (G-182). */}
        <InEntwicklungKnopf titel="Custom Supplement" className="v2-btn v2-btn-primary">
          <Icon name="plus" className="v2-ic v2-ic-sm" /> Custom Supplement
        </InEntwicklungKnopf>
      </div>

      {/* ══ Die Kategorien, schoener dargestellt ════════════════════
          **Tom:** *„Darunter die Kategorien schoener dargestellt."*

          ══ FUENF SIND RAUS ══════════════════════════════════════════

          **Tom, 2026-09-15:** *„WEG: diese Kategorien ganz raus, sie
          sagen nichts aus — other ingredient, botanical,
          non-nutrient/non-botanical, other, animal part or source."*

          `[cmd]` **Damit fallen auch der Zusatz *„fast alle"* und die
          50-%-Schwelle weg** — keine der verbliebenen vierzehn liegt
          ueber einem Drittel. **Nicht auskommentiert, sondern weg**
          (G-163).

          `[read]` **Die fuenf bleiben in den DATEN** — die Tafel zeigt
          `other ingredient` weiter als groesstes Buendel
          *Hilfsstoffe*. **Sie sind kein Filter, kein verbotener
          Inhalt.** */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span className="v2-eyebrow" style={{ marginRight: 2 }}>Kategorie</span>
        <button
          type="button" onClick={() => setKategorie(null)}
          style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
          aria-pressed={kategorie === null}
        >
          <Pill variant={kategorie === null ? 'acc' : undefined}>Alle</Pill>
        </button>
        {KATEGORIEN.map(k => {
          const aktiv = kategorie === k.code
          return (
            <button
              key={k.code} type="button"
              onClick={() => setKategorie(aktiv ? null : k.code)}
              aria-pressed={aktiv}
              title={`${k.produkte.toLocaleString('de-DE')} Produkte · `
                + `${Math.round(k.anteil * 1000) / 10} % der On-Market-Produkte`}
              style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
            >
              <Pill variant={aktiv ? 'acc' : undefined}>
                {k.code}
                {/* `[read]` **Die Zahl gedaempft, aber lesbar** —
                    `v2-muted` misst 9,19:1, `v2-dim` 2,88:1 (G-453). */}
                <span className="v2-muted" style={{ marginLeft: 5 }}>
                  {k.produkte.toLocaleString('de-DE')}
                </span>
              </Pill>
            </button>
          )
        })}
      </div>

      {/* ══ Die aufklappbare Filterleiste (G-73) ════════════════════ */}
      {filterOffen && (
        <div id="v2-supp-prod-filter" className="v2-supp-prod-filter">
          <div className="v2-supp-prod-filter-kopf">
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>Filter</span>
            {aktiveFilter > 0 && (
              <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                      onClick={filterZuruecksetzen}>
                Zurücksetzen
              </button>
            )}
          </div>

          <div className="v2-supp-prod-filter-gruppen">
            {/* ── Markt ────────────────────────────────────────────
                `[cmd]` **121.959 On Market, 92.821 Off Market**,
                gemessen 2026-09-14. **Toms Vorgabe aus G-452 bleibt
                die Vorauswahl.** */}
            <div>
              {/* ══ G-455: MEINE ALLERGIEN — der HARTE Filter ══════
                  **Tom:** *„MEINE ALLERGIEN … HART: Produkt
                  verschwindet. Eine Nussallergie gilt ueberall."*

                  `[cmd]` **Die Treffer kommen aus
                  `public.supplier_product_allergy_matches` (C-498)**
                  — sie loest die Aliase auf, und sie wird GERUFEN,
                  nicht nachgebaut.

                  `[read]` **Vorgabe AN.** Eine Allergie ist keine
                  Einstellung, die man erst suchen muss. **Der
                  Schalter bleibt trotzdem** — wer sehen will, was
                  weggefiltert wird, braucht ihn. */}
              <div style={{ marginBottom: 14 }}>
                <span className="v2-eyebrow">Meine Allergien</span>
                <div className="v2-supp-prod-filter-reihe">
                  <button
                    type="button" onClick={() => setAllergienAn(true)}
                    aria-pressed={allergienAn}
                    style={{ background: 'none', border: 0, padding: 0,
                      cursor: 'pointer' }}
                  >
                    <Pill variant={allergienAn ? 'acc' : undefined}>
                      <Icon name="check" className="v2-ic v2-ic-sm" />
                      Ausblenden
                    </Pill>
                  </button>
                  <button
                    type="button" onClick={() => setAllergienAn(false)}
                    aria-pressed={!allergienAn}
                    style={{ background: 'none', border: 0, padding: 0,
                      cursor: 'pointer' }}
                  >
                    <Pill variant={!allergienAn ? 'acc' : undefined}>
                      Alle zeigen
                    </Pill>
                  </button>
                </div>
                {/* ══ WAS DER FILTER TUT — IMMER SICHTBAR ═══════════
                    `[read]` **Auch die Null ist eine Auskunft** (E-72):
                    *„0 Produkte betroffen"* heisst etwas anderes als
                    ein fehlender Satz.

                    `[cmd]` **Und sie hat einen gemessenen Grund:** die
                    Trefferfunktion braucht einen Alias oder einen
                    exakt gleichen Zutatnamen. **`lactose` hat keinen
                    Alias und trifft deshalb nichts**, obwohl 418
                    Zutatzeilen woertlich so heissen (gemessen
                    2026-09-15). */}
                <div className="v2-prod-filterhinweis">
                  {!allergienAn
                    ? 'Der Allergiefilter ist aus — die Liste zeigt auch '
                      + 'Produkte mit deinen Allergenen.'
                    : liste?.allergieProdukte === undefined
                      ? 'Allergien werden geprüft…'
                      : liste.allergieProdukte === 0
                        ? 'Keine deiner Allergien trifft ein Produkt. '
                          + 'Getroffen wird über die Zutatenliste — ein Stoff '
                          + 'ohne hinterlegte Schreibweisen findet nichts.'
                        : `${liste.allergieProdukte.toLocaleString('de-DE')} `
                          + 'Produkte enthalten eines deiner Allergene'
                          + (liste.hartEntfernt
                            ? ` · ${liste.hartEntfernt} davon aus dieser Liste entfernt`
                            : '')}
                  {liste?.allergieFehler && (
                    <span style={{ color: 'var(--warn)' }}>
                      {' '}· {liste.allergieFehler}
                    </span>
                  )}
                </div>
              </div>

              <span className="v2-eyebrow">Markt</span>
              <div className="v2-supp-prod-filter-reihe">
                {[
                  { wert: STANDARD_STATUS, label: 'On Market', zahl: 121959 },
                  { wert: 'Off Market', label: 'Off Market', zahl: 92821 },
                  { wert: null, label: 'Alle', zahl: 214780 },
                ].map(m => (
                  <button
                    key={m.label} type="button" onClick={() => setStatus(m.wert)}
                    aria-pressed={status === m.wert}
                    style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
                  >
                    <Pill variant={status === m.wert ? 'acc' : undefined}>
                      {m.label}
                      <span className="v2-muted" style={{ marginLeft: 5 }}>
                        {m.zahl.toLocaleString('de-DE')}
                      </span>
                    </Pill>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Darreichungsform ─────────────────────────────────
                **Tom:** *„FORM, ohne die Klammern ... der E-Code
                (E0159 etc.) gehoert NICHT in die Anzeige."*

                `[cmd]` **Gefiltert wird MIT Code** (`Capsule
                [E0159]`), **angezeigt ohne** — die Spalte traegt ihn,
                und ein Vergleich gegen `Capsule` traefe nichts.

                `[cmd]` **Die Zahl richtet sich nach dem Marktstatus:**
                `Capsule` hat 43.301 On-Market- und 79.822 Produkte
                insgesamt. **Eine 79.822 neben einer On-Market-Liste
                waere eine Zahl fuer eine Ansicht, die niemand sieht.** */}
            <div>
              <span className="v2-eyebrow">Darreichungsform</span>
              <div className="v2-supp-prod-filter-reihe">
                <button
                  type="button" onClick={() => setForm(null)}
                  aria-pressed={form === null}
                  style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
                >
                  <Pill variant={form === null ? 'acc' : undefined}>Alle</Pill>
                </button>
                {FORMEN.map(f => {
                  const aktiv = form === f.code
                  const zahl = status === null ? f.alle
                    : status === STANDARD_STATUS ? f.onMarket
                    : f.alle - f.onMarket
                  return (
                    <button
                      key={f.code} type="button"
                      onClick={() => setForm(aktiv ? null : f.code)}
                      aria-pressed={aktiv}
                      style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
                    >
                      <Pill variant={aktiv ? 'acc' : undefined}>
                        {f.label}
                        <span className="v2-muted" style={{ marginLeft: 5 }}>
                          {zahl.toLocaleString('de-DE')}
                        </span>
                      </Pill>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Marke: Pulldown UND Eingabefeld ──────────────────
                **Tom, 2026-09-15:** *„MARKE: im Pulldown anwaehlbar,
                plus das Eingabefeld aus Punkt 1 des urspruenglichen
                Auftrags."*

                `[read]` **Beides, nicht eins von beiden** — und es ist
                KEIN zweiter Schreibweg: dieselbe Zustandsgroesse,
                zwei Bedienungen. **Wer den Namen kennt, tippt; wer
                stoebern will, klappt auf.**

                `[cmd]` **Das Pulldown traegt NICHT alle 4.907** —
                gemessen, dass so viele Optionen genau das Scrollen
                sind, das Tom weghaben wollte. **Es traegt die
                haeufigsten; der Rest geht ueber das Feld**, und die
                Zeile darunter sagt es. */}
            <div>
              <span className="v2-eyebrow">Marke</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap',
                alignItems: 'center', marginTop: 6 }}>
                {/* `[read]` **Beide Wege setzen dieselbe Liste** —
                    das Feld fuer den, der den Namen kennt, das
                    Pulldown fuer den, der stoebert. */}
                <MarkenFeld marken={marken} gewaehlt={null}
                            onWaehlen={markeSchalten}
                            vollstaendig={markenVoll} />
                <select
                  className="v2-feld"
                  value=""
                  onChange={e => {
                    if (e.target.value) markeSchalten(e.target.value)
                  }}
                  aria-label="Marke auswählen"
                  style={{ fontSize: 11.5, padding: '4px 8px', maxWidth: 220 }}
                >
                  {/* `[cmd]` **G-455: das Pulldown FUEGT HINZU, es
                      ersetzt nicht.** `[read]` Deshalb steht es immer
                      auf der Aufforderung und nie auf einem Wert — ein
                      Pulldown, das eine von drei Marken anzeigt, waere
                      eine Falschaussage. */}
                  <option value="">Marke hinzufügen…</option>
                  {MARKEN_PULLDOWN
                    .filter(m => !gewaehlteMarken.includes(m))
                    .map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* ══ G-455: die gewaehlten Marken als Pillen ═════════
                  **Tom:** *„dass ein user seine filtermasken mit
                  marken setzen kann und nicht nur eine marke waehlen."*

                  `[read]` **Jede Pille ist ihr eigener
                  Entfernen-Knopf** — G-181 Punkt 6b: *„diverse filter
                  haengen wenn man sie abwaehlt."* Der Weg zurueck muss
                  sichtbar sein, je Marke. */}
              {gewaehlteMarken.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap',
                  marginTop: 8, alignItems: 'center' }}>
                  {gewaehlteMarken.map(m => (
                    <button
                      key={m} type="button"
                      onClick={() => markeSchalten(m)}
                      aria-label={`${m} entfernen`}
                      title={`${m} entfernen`}
                      style={{ background: 'none', border: 0, padding: 0,
                        cursor: 'pointer' }}
                    >
                      <Pill variant="acc">{m} ×</Pill>
                    </button>
                  ))}
                  <button type="button" className="v2-btn v2-btn-sm v2-btn-ghost"
                          onClick={() => markeSchalten(null)}>
                    Alle Marken
                  </button>
                </div>
              )}

              <div className="v2-muted" style={{ fontSize: 10, marginTop: 5 }}>
                {gewaehlteMarken.length > 1
                  ? `${gewaehlteMarken.length} Marken — ODER-verknüpft, `
                    + 'ein Produkt genügt einer davon'
                  : markenVoll
                    ? `${marken.length.toLocaleString('de-DE')} Marken · `
                      + `im Pulldown die ${MARKEN_PULLDOWN.length} häufigsten, `
                      + 'alle übrigen über das Eingabefeld'
                    : `${marken.length} Marken — nur ein Ausschnitt`}
              </div>
            </div>
          </div>
        </div>
      )}

      <Card style={{ padding: 0 }}>
        <div className="v2-supp-tbl-wrap">
          <table className={`v2-tbl${offeneZeile ? ' hat-offene' : ''}`}>
            <thead>
              <tr>
                <th style={{ paddingLeft: 14 }}>Produkt</th>
                <th style={{ width: 190 }}>Marke</th>
                <th style={{ width: 120 }}>Form</th>
                <th style={{ width: 110 }}>Portion</th>
                {/* `[read]` **Der Daumen bekommt KEINE Ueberschrift** —
                    dieselbe Linie wie die Aktionsspalte im Katalog:
                    ein Wort darueber sagt nichts, was die zwei Knoepfe
                    nicht selbst sagen. */}
                <th style={{ width: 62 }} />
                <th style={{ width: 90, textAlign: 'right' }} />
              </tr>
            </thead>
            <tbody>
              {zeilen.map((p: ProduktZeile) => {
                const istOffen = offeneZeile === p.id
                const portion = portionText(p.portionsgroesse, p.portionseinheit)
                return (
                  <React.Fragment key={p.id}>
                    <tr style={{ cursor: 'pointer' }}
                        aria-expanded={istOffen}
                        onClick={() => schalteZeile(p.id)}>
                      <td style={{ paddingLeft: 14 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{p.name_en}</div>
                        {/* `[read]` **Der Marktstatus steht an der
                            Zeile, sobald der Filter ihn nicht mehr
                            garantiert** — wer „Alle" gewaehlt hat, muss
                            je Zeile sehen, was er vor sich hat. */}
                        {status === null && p.market_status && (
                          <div className="v2-dim" style={{ fontSize: 9.5, marginTop: 2 }}>
                            {p.market_status}
                          </div>
                        )}
                      </td>
                      <td>
                        {p.marke
                          ? <span style={{ fontSize: 11.5 }}>{p.marke}</span>
                          : <span className="v2-muted" style={{ fontSize: 10.5 }}>ohne Marke</span>}
                      </td>
                      <td>
                        {/* `[cmd]` **G-453/4: ohne E-Code.** Hier stand
                            `{p.produktform}` und damit `Capsule
                            [E0159]` auf dem Schirm. **Tom:** *„der
                            E-Code gehoert NICHT in die Anzeige."*
                            `[read]` **Gefiltert wird weiter MIT Code**
                            — die Spalte traegt ihn. */}
                        {p.produktform && (
                          <span className="v2-muted" style={{ fontSize: 10.5 }}>
                            {formLabel(p.produktform)}
                          </span>
                        )}
                      </td>
                      <td>
                        {portion && <span style={{ fontSize: 11 }}>{portion}</span>}
                      </td>
                      {/* ══ G-455: der Daumen ═══════════════════════
                          `[read]` **Die Zeile fuehrt ins Detail, der
                          Daumen nicht** — ohne `stopPropagation`
                          bewertet man, was man ansehen wollte (die
                          Lehre aus G-67). */}
                      <td onClick={e => e.stopPropagation()}>
                        <ProduktDaumen
                          zustand={daumen[p.id] ?? 'neutral'}
                          name={p.name_en}
                          onKlick={r => void daumenKlick(p.id, r)}
                        />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                                onClick={e => { e.stopPropagation(); schalteZeile(p.id) }}>
                          {istOffen ? 'Zu' : 'Details'}
                        </button>
                      </td>
                    </tr>
                    {/* G-180: die aufgeklappte Zeile — kein Modal.
                        `[cmd]` **G-453: der Inhalt ist jetzt
                        `ProduktTafel`** statt der zwei Bausteine, die
                        hier standen. **Das Polster liegt in der Tafel
                        selbst** (`.v2-supp-prod-tafel`), damit sie in
                        einer Zelle genauso sitzt wie ausserhalb. */}
                    {istOffen && satz && satz.id === p.id && (
                      <tr className="v2-supp-tafel-zeile">
                        <td colSpan={6} style={{ padding: 0 }}
                            onClick={e => e.stopPropagation()}>
                          <ProduktTafel satz={satz} meidestoffe={meidestoffe} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>

          {/* ── Bei 0 Treffern sagen WARUM (G-182, Punkt 1) ────────── */}
          {!laeuft && zeilen.length === 0 && (
            <div style={{ padding: '22px 14px', textAlign: 'center' }}>
              <p className="v2-muted" style={{
                fontSize: 12.5, margin: '0 0 10px',
                maxWidth: 560, marginLeft: 'auto', marginRight: 'auto',
              }}>
                {grundFuerLeer}
              </p>
              <button type="button" className="v2-btn v2-btn-sm"
                      onClick={() => {
                        setFrage(''); setKategorie(null); setForm(null)
                        setGewaehlteMarken([]); setStatus(STANDARD_STATUS)
                      }}>
                Filter zurücksetzen
              </button>
            </div>
          )}
          {laeuft && zeilen.length === 0 && (
            <div style={{ padding: '22px 14px', textAlign: 'center' }}>
              <span className="v2-dim" style={{ fontSize: 12 }}>Sucht…</span>
            </div>
          )}
        </div>

        {/* ── Die Fusszeile: gezeigt gegen Bestand ─────────────────── */}
        <div className="v2-dim" style={{
          fontSize: 10.5, padding: '8px 14px',
          display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <span>
            {zeilen.length} von {gesamt.toLocaleString('de-DE')} Treffern
            {' · '}
            {GESAMT_BESTAND.toLocaleString('de-DE')} Produkte
            {' · supplements.supplier_products'}
          </span>
          {/* ══ WELCHER WEG GEANTWORTET HAT ═══════════════════════
              `[read]` **Der Satz bleibt, sein Grund hat sich
              geaendert.** `[cmd]` **In G-452 hiess `einfach`: C-495
              fehlt.** **Seit 2026-09-14, 15:31 Uhr ist die Funktion
              da** — jetzt heisst es: **diese Abfrage kann sie nicht
              nutzen.**
              `[cmd]` **Zwei Faelle, beide gemessen:** ohne Suchbegriff
              (eine Aehnlichkeitssuche braucht einen) und mit
              Kategoriefilter (**die Funktion nimmt vier Argumente,
              eine Kategorie ist nicht darunter**).
              `[read]` **Er steht weiterhin da, weil der Unterschied
              sichtbar sein muss:** nur der Smartweg findet „gold
              standart wey". */}
          {liste && (
            <span>
              {liste.weg === 'smart'
                ? 'Smartsuche (pg_trgm, C-495)'
                : kategorie
                  ? 'Textsuche — der Kategoriefilter läuft über die Tabelle'
                  : 'Textsuche — die Smartsuche braucht einen Suchbegriff'}
            </span>
          )}
        </div>

        {ladeFehler && (
          <div style={{ fontSize: 11, color: 'var(--warn)', padding: '0 14px 10px' }}>
            {ladeFehler}
          </div>
        )}
      </Card>

      {/* ══ G-453/3: MEHR LADEN STATT BLAETTERN ═════════════════════
          **Tom, 2026-09-15:** *„Ergebnisse NICHT blaetterbar. Miss,
          was stattdessen traegt."*

          `[cmd]` **Hier standen `Zurück · Seite N · Weiter`.**
          **Gemessen 2026-09-15, was die Seitenzahlen gekostet haben:**

              LIMIT 50                    17,4 ms
              LIMIT 500                   23,0 ms
              OFFSET 100.000 LIMIT 50    113,1 ms

          `[read]` **Teuer ist das tiefe Blaettern, nicht die Menge**
          — und im Browser kosten 500 Zeilen **3.002 DOM-Knoten und
          68 ms**, **unter den 4.713, die G-176 als unauffaellig
          gemessen hat.** (1.000 waeren 6.002 Knoten, 140 ms und
          37.000 px Rollweg — die Grenze ist gemessen, nicht geraten.)

          `[read]` **Also ein wachsendes Fenster:** der Knopf haengt
          die naechsten 500 an, statt die vorhandenen zu ersetzen.
          **Keine Seitenzahl, kein Weg zurueck** — wer enger will,
          filtert. */}
      {gesamt > zeilen.length && (
        <div style={{
          display: 'flex', gap: 10, justifyContent: 'center',
          alignItems: 'center', marginTop: 12,
        }}>
          <button type="button" className="v2-btn v2-btn-sm"
                  disabled={laeuft}
                  onClick={() => setSeite(s => s + 1)}>
            {laeuft
              ? 'Lädt…'
              : `${Math.min(FENSTER, gesamt - zeilen.length).toLocaleString('de-DE')} weitere laden`}
          </button>
          {/* `[read]` **Die Zahl sagt, wie weit man ist** — ohne
              Seitenzahl braucht es einen anderen Anker. */}
          <span className="v2-muted" style={{ fontSize: 11 }}>
            {zeilen.length.toLocaleString('de-DE')} von{' '}
            {gesamt.toLocaleString('de-DE')} geladen
          </span>
        </div>
      )}
    </div>
  )
}
