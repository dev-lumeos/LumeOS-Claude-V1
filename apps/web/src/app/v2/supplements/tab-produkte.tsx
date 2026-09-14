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
// Pillen**; deshalb steht die Marke hier als Auswahlliste, nicht als
// Pillenreihe.
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import type {
  ProduktZeile, ProduktSatz, ProduktListe,
} from '../../../lib/supplements/produkte-read'
import {
  etikettZeilen, mengeText, bekanntZaehlen, portionText,
} from '../../../lib/supplements/produkt-etikett'

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

function Kopfzeile({ satz }: { satz: ProduktSatz }) {
  const portion = portionText(satz.portionsgroesse, satz.portionseinheit)
  const packung = portionText(satz.packungsgroesse, satz.packungseinheit)
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
      {satz.marke && <Pill variant="acc">{satz.marke}</Pill>}
      {satz.market_status && <Pill>{satz.market_status}</Pill>}
      {satz.produktform && <Pill>{satz.produktform}</Pill>}
      {portion && <Pill>Portion {portion}</Pill>}
      {packung && <Pill>Packung {packung}</Pill>}
      {/* `[read]` **GTIN mit Beschriftung** — eine nackte 13-stellige
          Zahl neben Mengenangaben sieht aus wie eine Menge. */}
      {satz.gtin && <Pill>GTIN {satz.gtin}</Pill>}
    </div>
  )
}

/**
 * Das Etikett — Makros, Mikros, Zeilen ohne Menge, Mischungen.
 *
 * `[read]` **Eine Tabelle, keine Kacheln.** Auf der Packung steht das
 * Etikett als Liste, und die Einrueckung der Mischungszutaten ist nur
 * in einer Liste lesbar.
 */
function Etikett({ satz }: { satz: ProduktSatz }) {
  const zeilen = React.useMemo(() => etikettZeilen(satz.inhalt), [satz.inhalt])
  const { bekannt, gesamt } = React.useMemo(
    () => bekanntZaehlen(satz.inhalt), [satz.inhalt])

  if (zeilen.length === 0) {
    // `[read]` **Ein benannter Leerhinweis, keine leere Flaeche**
    // (E-72) — ein Produkt ohne Etikettzeilen ist etwas anderes als
    // ein Produkt, das noch laedt.
    return (
      <p className="v2-muted" style={{ fontSize: 12, margin: 0 }}>
        Zu diesem Produkt sind keine Etikettzeilen erfasst.
      </p>
    )
  }

  return (
    <div>
      {/* ══ WAS LUMEOS KENNT — die Zahl steht OBEN ══════════════════
          `[cmd]` **`supplement_id` ist bei 2.698.689 von 3.000.982
          Zeilen null** (89,9 %, gemessen 2026-09-14).
          `[read]` **Zwei Zahlen, keine Quote** — „11 %" sagt nicht,
          ob von neun oder neunhundert die Rede ist. */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 10, flexWrap: 'wrap',
      }}>
        <span className="v2-eyebrow">Etikett · {zeilen.length} Zeilen</span>
        <Pill variant={bekannt > 0 ? 'acc' : undefined}>
          <Icon name="check" className="v2-ic v2-ic-sm" />
          {bekannt} von {gesamt} Zutaten kennt LumeOS
        </Pill>
      </div>

      <table className="v2-tbl">
        <thead>
          <tr>
            <th style={{ paddingLeft: 14 }}>Zutat</th>
            <th style={{ width: 130 }}>Menge</th>
            <th style={{ width: 120 }}>Art</th>
            <th style={{ width: 150 }}>LumeOS</th>
          </tr>
        </thead>
        <tbody>
          {zeilen.map(z => {
            const menge = mengeText(z)
            return (
              <tr key={z.id}>
                <td style={{
                  // `[read]` **Die Einrueckung steht in den Daten**:
                  // wer ein `blend_id` traegt, steht unter seinem Kopf.
                  // `[cmd]` **Gemessen an `21cfe048`** — Zeile 13
                  // traegt 3000 mg, die Zeilen 14/15 zeigen auf sie.
                  paddingLeft: z.eingerueckt ? 38 : 14,
                }}>
                  <span style={{
                    fontSize: 12.5,
                    fontWeight: z.istMischung ? 600 : 400,
                  }}>
                    {/* `[read]` **Ein Zeichen, das die Zugehoerigkeit
                        zeigt** — die Einrueckung allein geht auf einem
                        schmalen Schirm unter. */}
                    {z.eingerueckt && (
                      <span className="v2-dim" style={{ marginRight: 6 }}>↳</span>
                    )}
                    {z.ingredient_name}
                  </span>
                  {z.istMischung && (
                    <div className="v2-dim" style={{ fontSize: 9.5, marginTop: 2 }}>
                      Mischung · die Zutaten darunter stehen ohne
                      Einzelmenge auf dem Etikett
                    </div>
                  )}
                </td>
                <td>
                  {menge
                    ? <span style={{ fontSize: 12.5 }}>{menge}</span>
                    // ══ ZEILEN OHNE MENGE ═══════════════════════════
                    //
                    // `[cmd]` **`not_stated` bei 1.591.063 von
                    // 3.000.982 Zeilen** — die Mehrheit.
                    //
                    // `[read]` **Kein Strich und keine Null.** Ein
                    // Strich saehe aus wie eine Angabe, eine Null waere
                    // eine Behauptung ueber die Packung. Der Hersteller
                    // nennt die Zutat, nur ohne Zahl — und genau das
                    // steht da.
                    : <span className="v2-dim" style={{ fontSize: 10.5 }}>
                        ohne Mengenangabe
                      </span>}
                </td>
                <td>
                  {z.ingredient_category && (
                    <span className="v2-dim" style={{ fontSize: 10.5 }}>
                      {z.ingredient_category}
                    </span>
                  )}
                </td>
                <td>
                  {/* `[read]` **Markiert wird das BEKANNTE, nicht das
                      Unbekannte** — eine Marke auf neun von zehn Zeilen
                      waere kein Hinweis mehr, sondern Rauschen. */}
                  {z.bekannt
                    ? <Pill variant="pos">
                        <Icon name="check" className="v2-ic v2-ic-sm" />
                        auswertbar
                      </Pill>
                    : <span className="v2-dim" style={{ fontSize: 10.5 }}>
                        nicht im Katalog
                      </span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Die Firmen hinter dem Produkt. */}
      {satz.firmen.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <span className="v2-eyebrow">Firmen</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            {satz.firmen.map((f, i) => (
              <Pill key={`${f.name}-${i}`}>
                {f.name}
                {f.land && ` · ${f.land}`}
                {f.rolle && ` · ${f.rolle}`}
              </Pill>
            ))}
          </div>
        </div>
      )}

      {satz.suggested_use && (
        <div style={{ marginTop: 14 }}>
          <span className="v2-eyebrow">Einnahmehinweis des Herstellers</span>
          <p className="v2-muted" style={{ fontSize: 12, margin: '6px 0 0', maxWidth: 620 }}>
            {satz.suggested_use}
          </p>
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
  }, [frage, marke, status, seite])

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
  React.useEffect(() => { setSeite(0) }, [frage, marke, status])

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
    if (q && liste?.weg === 'einfach') {
      return `Kein Produktname enthält „${q}“. `
        + 'Die Smartsuche, die Fehleingaben versteht, ist noch nicht '
        + 'eingespielt (C-495) — bis dahin wird auf genauen Text gesucht.'
    }
    if (q) return `Keine Treffer für „${q}“.`
    if (marke) return `Unter „${marke}“ steht nichts.`
    return 'Keine Treffer.'
  }, [frage, marke, liste])

  return (
    <div>
      {/* ══ Marktstatus — Toms Vorgabe steht als Vorauswahl ═════════
          `[cmd]` **121.959 On Market, 92.821 Off Market**, gemessen
          2026-09-14. Die Zahlen stehen an den Pillen, weil sie fest
          sind und die Kachel A2 sie tragen muss. */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <span className="v2-eyebrow" style={{ alignSelf: 'center', marginRight: 4 }}>
          Markt
        </span>
        <button
          type="button" onClick={() => setStatus(STANDARD_STATUS)}
          className={status === STANDARD_STATUS ? 'v2-pill v2-pill-acc' : 'v2-pill'}
          aria-pressed={status === STANDARD_STATUS}
          style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 11.5 }}
        >
          On Market · 121.959
        </button>
        <button
          type="button" onClick={() => setStatus('Off Market')}
          className={status === 'Off Market' ? 'v2-pill v2-pill-acc' : 'v2-pill'}
          aria-pressed={status === 'Off Market'}
          style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 11.5 }}
        >
          Off Market · 92.821
        </button>
        {/* G-181 Punkt 6b: „Alle" als sichtbarer Weg zurueck. */}
        <button
          type="button" onClick={() => setStatus(null)}
          className={status === null ? 'v2-pill v2-pill-acc' : 'v2-pill'}
          aria-pressed={status === null}
          style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 11.5 }}
        >
          Alle · 214.780
        </button>
      </div>

      {/* EINE Suche — wie im Katalog. */}
      <div className="v2-supp-suche" style={{ marginBottom: 10 }}>
        <Icon name="search" className="v2-ic v2-ic-sm v2-supp-suchsymbol" />
        <input
          className="v2-feld"
          value={frage}
          onChange={e => setFrage(e.target.value)}
          placeholder="Produkt suchen · Name oder Marke…"
          aria-label="Produkt suchen"
          style={{ paddingLeft: 30, paddingRight: 30, width: '100%' }}
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

      {/* ══ Der Markenfilter ════════════════════════════════════════
          `[cmd]` **6.012 Marken** — als Pillenreihe waeren das 6.012
          Knoepfe. `[read]` **Deshalb eine Auswahlliste**: sie ist die
          einzige Bauform, die eine Menge dieser Groesse traegt, ohne
          die Seite zu sprengen. */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap',
        alignItems: 'center', marginBottom: 12,
      }}>
        <span className="v2-eyebrow">Marke</span>
        <select
          className="v2-feld"
          value={marke ?? ''}
          onChange={e => setMarke(e.target.value || null)}
          aria-label="Marke filtern"
          style={{ fontSize: 11.5, padding: '4px 8px', maxWidth: 280 }}
        >
          <option value="">Alle Marken</option>
          {marken.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {marke && (
          <button type="button" className="v2-btn v2-btn-sm v2-btn-ghost"
                  onClick={() => setMarke(null)}>
            Marke zurücksetzen
          </button>
        )}
        {/* `[read]` **Ein Ausschnitt wird als Ausschnitt benannt.**
            `[cmd]` Ohne C-495 kann der Rueckfall kein `DISTINCT` ueber
            214.780 Zeilen — er liefert die Marken der ersten 1.000.
            **Eine Liste, die so tut, als sei sie vollstaendig, waere
            eine Falle.** */}
        {/* `[cmd]` **Verglichen wird gegen 4.907, nicht gegen 6.012.**
            **Gemessen 2026-09-14:** 6.012 Marken ueber ALLE Zeilen,
            **4.907 unter „On Market"** — und der Rueckfall liest nur
            On-Market-Zeilen. `[read]` **Zwei Zahlen aus verschiedenen
            Grundgesamtheiten nebeneinander behaupten eine Fehlmenge,
            die es so nicht gibt.** */}
        {!markenVoll && marken.length > 0 && (
          <span className="v2-dim" style={{ fontSize: 10 }}>
            {marken.length} von 4.907 On-Market-Marken — die vollständige
            Liste kommt mit C-495
          </span>
        )}
      </div>

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
                          : <span className="v2-dim" style={{ fontSize: 10.5 }}>ohne Marke</span>}
                      </td>
                      <td>
                        {p.produktform && (
                          <span className="v2-dim" style={{ fontSize: 10.5 }}>
                            {p.produktform}
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
                    {/* G-180: die aufgeklappte Zeile — kein Modal. */}
                    {istOffen && satz && satz.id === p.id && (
                      <tr className="v2-supp-tafel-zeile">
                        <td colSpan={5} style={{ padding: '14px 18px' }}
                            onClick={e => e.stopPropagation()}>
                          <Kopfzeile satz={satz} />
                          <Etikett satz={satz} />
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
                        setFrage(''); setMarke(null); setStatus(STANDARD_STATUS)
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
          {/* `[read]` **Welcher Weg geantwortet hat, steht da.**
              `[cmd]` Solange C-495 fehlt, laeuft der `ILIKE`-Rueckfall
              — und der findet „gold standart wey" nicht. **Wer das
              nicht sieht, haelt eine fehlende Funktion fuer eine
              fehlende Zeile.** */}
          {liste && (
            <span>
              {liste.weg === 'smart'
                ? 'Smartsuche (pg_trgm, C-495)'
                : 'Textsuche — Smartsuche noch nicht eingespielt (C-495)'}
            </span>
          )}
        </div>

        {ladeFehler && (
          <div style={{ fontSize: 11, color: 'var(--warn)', padding: '0 14px 10px' }}>
            {ladeFehler}
          </div>
        )}
      </Card>

      {/* ── Blaettern ────────────────────────────────────────────────
          `[read]` **Serverseitig, nicht im Browser.** `[cmd]` Bei
          214.780 Zeilen ist eine Liste ohne Seiten keine Liste mehr —
          und `OFFSET` ueber die ganze Menge kostet je Seite voll, was
          bei 50 je Seite bis Seite 100 tragbar bleibt. */}
      {gesamt > zeilen.length + seite * 50 && (
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12,
        }}>
          <button type="button" className="v2-btn v2-btn-sm"
                  disabled={seite === 0}
                  onClick={() => setSeite(s => Math.max(0, s - 1))}>
            Zurück
          </button>
          <span className="v2-dim" style={{ fontSize: 11, alignSelf: 'center' }}>
            Seite {seite + 1}
          </span>
          <button type="button" className="v2-btn v2-btn-sm"
                  onClick={() => setSeite(s => s + 1)}>
            Weiter
          </button>
        </div>
      )}
    </div>
  )
}
