'use client'

// Der Vorlieben-Reiter fuer Supplements — G-468.
//
// **Tom, seit fuenf Tagen offen:**
//
// > jedes modul braucht seine preferences
// > nutrition haben wir das schon
// > supplement wuerde das auch sinn machen fuer: allergien nochmals
// > ausweisen, meine bevorzugten marken verwaltbar machen, etc
//
// ══ DIE VORLAGE, UND WAS DAVON UEBERNOMMEN IST ══════════════════════
//
// `[cmd]` **`nutrition/tab-vorlieben.tsx`** (1.107 Zeilen) — gelesen,
// bevor hier etwas entstand.
//
//     Kacheln in zwei Spalten          uebernommen (`v2-grid-14`)
//     ein Klickmuster, Wert AM Element uebernommen (Pillen)
//     Stand-Ref + Warteschlange        uebernommen, siehe unten
//     die geteilte `AllergienKachel`   DIESELBE, nicht nachgebaut
//
// `[cmd]` **NICHT uebernommen: die Dreistufigkeit der Allergene**
// (neutral -> Sensibel -> Allergie). `[read]` **Die gehoert der
// Kachel, und die Kachel ist geteilt** — hier waere sie eine zweite
// Fassung derselben Sache.
//
// ══ TOMS REGEL AUS E-84 ═════════════════════════════════════════════
//
// > solange es an DENSELBEN ORT geschrieben wird
//
// `[cmd]` **Die Allergien werden GEZEIGT, nicht kopiert:**
// `public.user_allergies` bleibt die Wahrheit (C-498), und
// `AllergienKachel` schreibt ueber `settings/allergie-aktionen.ts` —
// **dieselbe Datei, die Settings benutzt.** `[cmd]` **Sie frischt
// `/v2/supplements` bereits mit** (G-455, dort schon vorgesehen).
//
// ══ DER STAND-REF, UND WARUM ════════════════════════════════════════
//
// `[cmd]` **Aus der Vorlage (G-104):** zwei schnelle Klicks auf
// verschiedenen Kacheln schickten sonst jeweils den Stand VOR dem
// anderen — **der zweite loeschte den ersten.** `[read]` **Die RPC
// ersetzt den ganzen Satz**, also rechnet jeder Klick auf einem
// synchronen Ref, und die Laeufe gehen der Reihe nach.
import * as React from 'react'
import { Card, Icon } from '@lumeos/ui'

import type { Allergie } from '../../../lib/allergien/allergie-lage'
import { AllergienKachel } from '../settings/allergien-kachel'
import {
  formenZurWahl, gleich, umschalten, wirkungsSatz,
  type SupplementVorlieben,
} from '../../../lib/supplements/vorlieben-lage'
import { formLabel } from '../../../lib/supplements/produkt-etikett'
import type { MarkenWahl } from '../../../lib/supplements/vorlieben-read'
import { vorliebenSpeichern, markenSuchen } from './vorlieben-aktionen'

export type SuppVorliebenDaten = {
  stand: SupplementVorlieben
  marken: MarkenWahl[]
  fehler: string | null
  /** G-468/A3: aus `public.user_allergies`, GEZEIGT statt kopiert. */
  allergien: Allergie[]
  allergienFehler: string | null
}

/**
 * Die Form eines anklickbaren Pillenknopfes.
 *
 * `[cmd]` **Aus der Vorlage** (`nutrition/tab-vorlieben.tsx:478`):
 * `v2-pill` direkt auf dem `<button>`, nicht als Huelle darum.
 * `[read]` **Eine eigene Klasse waere eine zweite Bauform** — und
 * `v2-pill-knopf` gibt es nicht (gemessen: 0 Treffer in allen CSS).
 */
const KNOPF: React.CSSProperties = {
  cursor: 'pointer', padding: '5px 12px', fontSize: 11.5,
}

export function SuppVorliebenTab({ d }: { d: SuppVorliebenDaten }) {
  const [stand, setStand] = React.useState(d.stand)
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  // `[cmd]` **Der juengste Stand, SYNCHRON** — die Lehre aus G-104.
  const standRef = React.useRef(d.stand)
  const folgeRef = React.useRef(0)
  const ketteRef = React.useRef<Promise<void>>(Promise.resolve())

  /**
   * Einen neuen Stand schreiben.
   *
   * ══ WARUM EINE FUNKTION UND KEIN WERT ═══════════════════════════
   *
   * `[cmd]` **Gemessen 2026-09-24: drei Marken geklickt, nach dem
   * Neuladen stand EINE in der Datenbank** — und der Schirm zeigte
   * drei.
   *
   * `[read]` **Die Ursache war NICHT die Schreibkette**, sondern die
   * Aufrufstelle: `speichern({ ...stand, … })` rechnet aus `stand`,
   * **und das ist der Wert des laufenden Anstrichs.** `[cmd]` **Drei
   * Klicks in einem Renderfenster sehen alle dasselbe `stand`** —
   * jeder schickt „Vorgabe plus MEINE Marke", und der letzte gewinnt.
   *
   * `[read]` **`standRef` ist synchron** (G-104). `[cmd]` **Also
   * bekommt der Aufrufer ihn als Argument, statt ihn sich aus dem
   * Zustand zu holen** — sechs Aufrufstellen, ein Weg. **Wer hier
   * kuenftig `...stand` schreibt, hat denselben Fehler wieder.**
   */
  const speichern = React.useCallback((
    baue: (jetzt: SupplementVorlieben) => SupplementVorlieben,
  ) => {
    const naechster = baue(standRef.current)
    // `[read]` **Ein Klick, der nichts aendert, schreibt nicht** —
    // sonst setzte er `updated_at` und die Quelle neu.
    if (gleich(standRef.current, naechster)) return
    standRef.current = naechster
    setStand(naechster)
    const nr = ++folgeRef.current
    setLaeuft(true)
    setFehler(null)
    ketteRef.current = ketteRef.current.then(async () => {
      // `[read]` **`standRef`, nicht `naechster`** — beim Lauf der
      // Kette ist der Ref der juengste Stand. `[cmd]` **Seit die
      // Aufrufstellen ueber `baue()` rechnen, sind beide gleich** —
      // es bleibt die engere Fassung, weil sie auch dann traegt, wenn
      // jemand spaeter einen Aufruf ausserhalb der Kette baut.
      const a = await vorliebenSpeichern(standRef.current)
      // Eine juengere Aenderung ist unterwegs — deren Antwort gilt.
      if (nr !== folgeRef.current) return
      if (a.ok) {
        // `[read]` **Die ANTWORT uebernehmen, nicht den Entwurf** —
        // die Datenbank sortiert und schneidet Leerstellen weg.
        standRef.current = a.stand
        setStand(a.stand)
      } else setFehler(a.fehler)
      setLaeuft(false)
    })
  }, [])

  // ── Die Markensuche ─────────────────────────────────────────────
  const [markenFrage, setMarkenFrage] = React.useState('')
  const [marken, setMarken] = React.useState(d.marken)

  React.useEffect(() => {
    const q = markenFrage.trim()
    // `[read]` **Entprellt** — 4.907 Marken, und jeder Tastendruck
    // waere eine Rundreise.
    const zeit = setTimeout(() => {
      void markenSuchen(q).then(m => { if (m.length > 0 || q) setMarken(m) })
    }, 300)
    return () => clearTimeout(zeit)
  }, [markenFrage])

  // ── Die gemiedenen Stoffe ───────────────────────────────────────
  const [stoff, setStoff] = React.useState('')

  const formen = formenZurWahl()

  return (
    <div data-probe="supp-vorlieben">
      {/* `[read]` **Der Satz sagt, WAS wirkt** (A4) — eine Vorliebe,
          die nichts tut, ist eine Attrappe.

          `[cmd]` **G-498: die oertliche Farbe ist weg** — hier stand
          `color: 'var(--fg-muted)'`, weil `.v2-hinweis` damals
          `--fg-dim` trug (2,76:1). `[read]` **Die Klasse traegt die
          Farbe jetzt selbst**, also waere die Ueberschreibung eine
          zweite Fassung derselben Entscheidung. */}
      <div className="v2-hinweis" data-probe="vorlieben-wirkung"
           style={{ marginBottom: 12 }}>
        {wirkungsSatz(stand)}
        {laeuft && <span className="v2-muted"> · speichert …</span>}
      </div>

      {fehler && (
        <p className="v2-supp-aktion-fehler" data-probe="vorlieben-fehler">
          {fehler}
        </p>
      )}
      {d.fehler && !fehler && (
        <p className="v2-muted" data-probe="vorlieben-ladefehler">
          Die Vorlieben konnten nicht geladen werden: {d.fehler}
        </p>
      )}

      <div className="v2-grid v2-grid-14" style={{ gap: 14 }}>
        {/* ══ A2: die Marken ══════════════════════════════════════ */}
        <div>
          <Card title="Bevorzugte Marken"
                sub="stehen im Produkte-Reiter zuoberst">
            <input
              className="v2-feld"
              placeholder="Marke suchen …"
              aria-label="Marke suchen"
              data-probe="marken-suche"
              value={markenFrage}
              onChange={e => setMarkenFrage(e.target.value)}
              style={{ width: '100%', marginBottom: 10 }}
            />
            {/* `[read]` **Die gewaehlten IMMER sichtbar**, auch wenn
                die Suche sie nicht traegt — sonst verschwaende die
                eigene Marke beim Tippen. */}
            <div className="v2-row-gap" style={{ flexWrap: 'wrap', gap: 6 }}
                 data-probe="marken-gewaehlt">
              {stand.preferred_brands.map(m => (
                <button key={m} type="button"
                        className="v2-pill v2-pill-acc" aria-pressed="true"
                        style={KNOPF}
                        onClick={() => speichern(j => ({
                          ...j,
                          preferred_brands: umschalten(j.preferred_brands, m),
                        }))}>{m} ×</button>
              ))}
              {stand.preferred_brands.length === 0 && (
                <span className="v2-muted" style={{ fontSize: 11.5 }}>
                  Noch keine Marke gewählt.
                </span>
              )}
            </div>
            <div className="v2-row-gap"
                 style={{ flexWrap: 'wrap', gap: 6, marginTop: 10 }}
                 data-probe="marken-wahl">
              {marken
                .filter(m => !stand.preferred_brands.includes(m.marke))
                .slice(0, 24)
                .map(m => (
                  <button key={m.marke} type="button" className="v2-pill"
                          aria-pressed="false" style={KNOPF}
                          onClick={() => speichern(j => ({
                            ...j,
                            preferred_brands:
                              umschalten(j.preferred_brands, m.marke),
                          }))}>
                    {m.marke}
                    <span className="v2-num" style={{ marginLeft: 5 }}>
                      {m.product_count.toLocaleString('de-DE')}
                    </span>
                  </button>
                ))}
            </div>
          </Card>

          {/* ══ Die Formen ════════════════════════════════════════ */}
          <div style={{ marginTop: 14 }}>
            <Card title="Bevorzugte Darreichungsformen"
                  sub="aus supplements.supplier_products">
              <div className="v2-row-gap" style={{ flexWrap: 'wrap', gap: 6 }}
                   data-probe="formen-wahl">
                {formen.map(f => {
                  const an = stand.preferred_forms.includes(f.code)
                  return (
                    <button key={f.code} type="button" style={KNOPF}
                            className={an ? 'v2-pill v2-pill-acc' : 'v2-pill'}
                            aria-pressed={an}
                            onClick={() => speichern(j => ({
                              ...j,
                              preferred_forms:
                                umschalten(j.preferred_forms, f.code),
                            }))}>
                      {/* `[cmd]` **G-453/4: ohne E-Code** — Tom:
                          *„der E-Code gehoert NICHT in die
                          Anzeige."* */}
                      {formLabel(f.code)}
                      <span className="v2-num" style={{ marginLeft: 5 }}>
                        {f.onMarket.toLocaleString('de-DE')}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Card>
          </div>
        </div>

        <div>
          {/* ══ Die gemiedenen Stoffe ═════════════════════════════ */}
          <Card title="Gemiedene Stoffe"
                sub="markieren Produkte im Produkte-Reiter">
            {/* `[read]` **Weich, nicht hart** — ein gemiedener Stoff
                markiert, eine Allergie filtert. **Der Unterschied
                steht dabei**, sonst haelt man das eine fuer das
                andere (G-455). */}
            <form
              onSubmit={e => {
                e.preventDefault()
                const w = stoff.trim()
                if (!w) return
                speichern(j => ({
                  ...j,
                  avoided_ingredients:
                    umschalten(j.avoided_ingredients, w),
                }))
                setStoff('')
              }}
              style={{ display: 'flex', gap: 6, marginBottom: 10 }}
            >
              <input className="v2-feld" placeholder="Stoff hinzufügen …"
                     aria-label="Gemiedenen Stoff hinzufügen"
                     data-probe="stoff-eingabe"
                     value={stoff} onChange={e => setStoff(e.target.value)}
                     style={{ flex: 1 }} />
              <button type="submit" className="v2-btn v2-btn-sm"
                      data-probe="stoff-hinzu">
                <Icon name="plus" className="v2-ic v2-ic-sm" />
              </button>
            </form>
            <div className="v2-row-gap" style={{ flexWrap: 'wrap', gap: 6 }}
                 data-probe="stoffe-gewaehlt">
              {stand.avoided_ingredients.map(s => (
                <button key={s} type="button" style={KNOPF}
                        className="v2-pill v2-pill-warn"
                        onClick={() => speichern(j => ({
                          ...j,
                          avoided_ingredients:
                            umschalten(j.avoided_ingredients, s),
                        }))}>{s} ×</button>
              ))}
              {stand.avoided_ingredients.length === 0 && (
                <span className="v2-muted" style={{ fontSize: 11.5 }}>
                  Noch nichts gemieden.
                </span>
              )}
            </div>
          </Card>

          {/* ══ Nur erhaeltliche Produkte ═════════════════════════ */}
          <div style={{ marginTop: 14 }}>
            <Card title="Nur erhältliche Produkte"
                  sub="market_status = On Market">
              <button type="button" className="v2-btn v2-btn-sm"
                      aria-pressed={stand.only_on_market}
                      data-probe="only-on-market"
                      onClick={() => speichern(j => ({
                        ...j, only_on_market: !j.only_on_market,
                      }))}>
                <Icon name={stand.only_on_market ? 'check' : 'x'}
                      className="v2-ic v2-ic-sm" />
                {stand.only_on_market ? 'An' : 'Aus'}
              </button>
              <p className="v2-muted" style={{ fontSize: 11, marginTop: 8 }}>
                {/* `[cmd]` **Gemessen: 121.959 von 214.780 sind
                    `On Market`** — die Zahl sagt, was der Schalter
                    kostet. */}
                121.959 von 214.780 Produkten sind erhältlich.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* ══ A3: DIE ALLERGIEN — GEZEIGT, NICHT KOPIERT ═══════════
          **Tom (E-84):** *„solange es an DENSELBEN ORT geschrieben
          wird"*

          `[cmd]` **DIESELBE Kachel wie in Settings und in
          nutrition/Preferences** — `settings/allergien-kachel.tsx`.
          `[read]` **Eine eigene Fassung waere die zweite Wahrheit,
          die E-84 verbietet.**

          `[cmd]` **Der Schreibweg frischt `/v2/supplements` schon
          mit** (`allergie-aktionen.ts`, G-455) — **eine Aenderung
          hier wirkt in Settings und umgekehrt.** */}
      <div style={{ marginTop: 16 }}>
        <AllergienKachel allergien={d.allergien}
                         fehler={d.allergienFehler}
                         ort="preferences" />
      </div>
    </div>
  )
}
