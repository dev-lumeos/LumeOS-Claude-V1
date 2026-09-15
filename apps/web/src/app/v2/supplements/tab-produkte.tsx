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
  const [marke, setMarke] = React.useState<string | null>(null)
  // Toms Vorgabe: nur On Market als Standard. `null` heisst „alle".
  const [status, setStatus] = React.useState<string | null>(STANDARD_STATUS)
  // G-453: die Kategorie filtert PRODUKTE (Toms Antwort).
  const [kategorie, setKategorie] = React.useState<string | null>(null)
  // G-453: die Darreichungsform, MIT E-Code — die Spalte traegt ihn.
  const [form, setForm] = React.useState<string | null>(null)
  // G-73: der Filterknopf ist das Setup zum Ein- und Ausblenden.
  const [filterOffen, setFilterOffen] = React.useState(false)
  // `[read]` **Heisst nicht mehr „Seite"** — es zaehlt, wie oft
  // nachgeladen wurde. Das Fenster waechst, es wandert nicht (G-453/3).
  const [seite, setSeite] = React.useState(0)
  const [liste, setListe] = React.useState<ProduktListe | null>(null)
  const [laeuft, setLaeuft] = React.useState(false)
  const [marken, setMarken] = React.useState<string[]>([])
  const [markenVoll, setMarkenVoll] = React.useState(true)

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
  React.useEffect(() => {
    const p = new URLSearchParams({ q: frage.trim(), seite: String(seite) })
    if (marke) p.set('marke', marke)
    if (kategorie) p.set('kategorie', kategorie)
    if (form) p.set('form', form)
    p.set('status', status ?? 'alle')

    const zeit = setTimeout(async () => {
      laufend.current?.abort()
      const ctrl = new AbortController()
      laufend.current = ctrl
      setLaeuft(true)
      try {
        const a = await fetch(`/api/supplements/produkte?${p}`, { signal: ctrl.signal })
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
  }, [frage, marke, status, seite, kategorie, form])

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
  React.useEffect(() => { setSeite(0) }, [frage, marke, status, kategorie, form])

  /**
   * Wie viele Filter gesetzt sind — die Zahl am Filterknopf.
   *
   * `[read]` **Der Marktstatus zaehlt nur mit, wenn er NICHT auf der
   * Vorgabe steht.** `[cmd]` Sonst stuende beim Oeffnen des Reiters
   * schon eine 1 am Knopf, und die Zahl hiesse nichts mehr.
   */
  const aktiveFilter = (marke ? 1 : 0) + (kategorie ? 1 : 0) + (form ? 1 : 0)
    + (status === STANDARD_STATUS ? 0 : 1)

  const filterZuruecksetzen = React.useCallback(() => {
    setMarke(null); setKategorie(null); setForm(null)
    setStatus(STANDARD_STATUS)
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

  const zeilen = liste?.zeilen ?? []
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
    if (marke && kategorie) {
      return `„${marke}“ hat kein Produkt mit einer Zeile der Kategorie `
        + `„${kategorie}“.`
    }
    if (marke) return `Unter „${marke}“ steht nichts.`
    if (kategorie) return `Kein Produkt trägt eine Zeile der Kategorie „${kategorie}“.`
    return 'Keine Treffer.'
  }, [frage, marke, kategorie, liste])

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
                <MarkenFeld marken={marken} gewaehlt={marke} onWaehlen={setMarke}
                            vollstaendig={markenVoll} />
                <select
                  className="v2-feld"
                  value={marke ?? ''}
                  onChange={e => setMarke(e.target.value || null)}
                  aria-label="Marke auswählen"
                  style={{ fontSize: 11.5, padding: '4px 8px', maxWidth: 220 }}
                >
                  <option value="">Alle Marken</option>
                  {/* `[read]` Eine gewaehlte Marke, die nicht unter den
                      haeufigsten ist, muss trotzdem dastehen — sonst
                      zeigte das Pulldown „Alle Marken", waehrend
                      gefiltert wird. */}
                  {marke && !MARKEN_PULLDOWN.includes(marke) && (
                    <option value={marke}>{marke}</option>
                  )}
                  {MARKEN_PULLDOWN.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="v2-muted" style={{ fontSize: 10, marginTop: 5 }}>
                {markenVoll
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
                        <td colSpan={5} style={{ padding: 0 }}
                            onClick={e => e.stopPropagation()}>
                          <ProduktTafel satz={satz} />
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
                        setFrage(''); setMarke(null); setKategorie(null)
                        setStatus(STANDARD_STATUS)
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
