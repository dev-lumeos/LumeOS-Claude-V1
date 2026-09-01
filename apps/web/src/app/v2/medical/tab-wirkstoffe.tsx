'use client'

// Der Wirkstoffkatalog — G-208.
//
// ══ DER ANLASS ══════════════════════════════════════════════════════
//
// `[cmd]` **Seit dem 2026-08-27 stehen 498 Wirkstoffe mit deutschen
// Texten und 2.313 FAQ-Antworten in der Datenbank — und es gab keine
// Seite, auf der man das sehen konnte.** Diese Datei ist sie.
//
// ══ DIE BAUFORM KOMMT AUS DEM SUBSTANZKATALOG ═══════════════════════
//
// `[read]` **Uebernommen aus `substanz-detail.tsx`:** eine Suche,
// Zeilenklick klappt auf, zweiter Klick schliesst, Nachbarzeilen
// werden gedaempft, das Detail laedt ueber eine Route nach.
//
// `[cmd]` **Und die Zahl, die dafuer entscheidet, ist hier eine
// andere:** Listenzeilen **83 kB**, Nutzertexte **1.145 kB**,
// FAQ-Antworten **700 kB** (gemessen 2026-08-27). **Die Liste kommt
// mit der Seite, 1,8 MB Detail nicht.**
//
// ══ KEIN ERFASSUNGSWEG ══════════════════════════════════════════════
//
// `[read]` **Diese Ansicht liest, sie schreibt nie.**
// `medical.user_medications` wird nicht angefasst — Anlegen, Aendern
// und Absetzen eigener Medikamente ist **C-302**, und **C-285**
// (Klartextspeicherung) ist unentschieden.
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import type { WirkstoffZeile, WirkstoffSatz } from '../../../lib/medical/wirkstoff-read'
import type { WirkstoffReiterId } from '../../../lib/medical/wirkstoff-reiter'
// G-210: Marken. `[read]` **Werte nur aus der serverfreien Datei** —
// `wirkstoff-read` zieht `next/headers` und darf hier nur Typen
// liefern (A-30, in G-208 am Build gelernt).
import {
  MAERKTE, passendeMarken, herstellerZahl, type Marke,
} from '../../../lib/medical/wirkstoff-marke'
import { WirkstoffTafel } from './wirkstoff-tafel'

/**
 * Trifft die Suche?
 *
 * `[read]` **Name, ATC-Code, Einzeiler und Indikationen** — `[cmd]`
 * `wofuer_de` ist bei allen 498 gefuellt (2 bis 4 Eintraege) und
 * enthaelt Alltagssprache: *„Bluthochdruck"*, *„Nachbehandlung nach
 * Herzinfarkt"*. **Wer den Wirkstoffnamen nicht kennt, findet ihn
 * ueber die Indikation** — und das ist der haeufigere Fall.
 *
 * ══ G-210: UND DER HANDELSNAME ══════════════════════════════════════
 *
 * **Tom hat nach *Scemblix* gesucht und nichts gefunden.** `[cmd]`
 * Scemblix stand die ganze Zeit da — in `medication_products`, eine
 * Ebene tiefer, wo diese Funktion nicht hinsah.
 *
 * `[cmd]` **428 Marken werden dadurch auffindbar**, davon **164
 * echte Handelsnamen**, die den Wirkstoffnamen NICHT enthalten
 * (Aldactone → Spironolactone, Bactrim → Trimethoprim-
 * sulfamethoxazole). **Die uebrigen 264 wiederholen ihn** und haetten
 * ohnehin getroffen.
 *
 * `[read]` **Der Rest sind 149 Wirkstoffe, die ohne diese Zeile nur
 * unter ihrem Freinamen erreichbar waren** — also unter dem Namen,
 * den niemand auf der Packung liest.
 */
export function trifft(z: WirkstoffZeile, f: string): boolean {
  if (!f) return true
  const q = f.toLowerCase()
  if (z.name.toLowerCase().includes(q)) return true
  if (z.atc.some(a => a.toLowerCase().includes(q))) return true
  if (z.kurz?.toLowerCase().includes(q)) return true
  if (z.wofuer.some(w => w.toLowerCase().includes(q))) return true
  // G-210: der Handelsname. `[read]` Zuletzt geprueft, weil er der
  // seltenere Treffer ist — nicht, weil er weniger zaehlt.
  return z.marken.some(m => m.name.toLowerCase().includes(q))
}

export function MedWirkstoffe({ liste }: { liste: WirkstoffZeile[] }) {
  const [frage, setFrage] = React.useState('')
  const [satz, setSatz] = React.useState<WirkstoffSatz | null>(null)
  const [offeneZeile, setOffeneZeile] = React.useState<string | null>(null)
  const [offenerReiter, setOffenerReiter] = React.useState<WirkstoffReiterId | null>(null)
  const [ladeFehler, setLadeFehler] = React.useState<string | null>(null)

  const treffer = React.useMemo(() => {
    const f = frage.trim().toLowerCase()
    // ── Kein Limit ────────────────────────────────────────────────
    //
    // `[read]` **Dieselbe Entscheidung wie G-176 im Substanzkatalog.**
    // `[cmd]` Dort waren 290 Zeilen 4.713 DOM-Knoten und die Ladezeit
    // stieg nicht messbar; **498 Zeilen liegen in derselben
    // Groessenordnung.** Ein Katalog ist zum Blaettern da, und *„Suche
    // verfeinern fuer mehr"* geht ins Leere, wenn man den Namen nicht
    // kennt.
    return f ? liste.filter(z => trifft(z, f)) : liste
  }, [liste, frage])

  /**
   * Welche Marke einen Treffer traegt — je Wirkstoff.
   *
   * `[read]` **Nur bei aktiver Suche.** Ohne Suchwort traegt keine
   * Marke einen Treffer, und 428 Markenzeilen unter 498 Wirkstoffen
   * waeren Rauschen.
   *
   * `[read]` **Die Entdoppelung steckt in `passendeMarken`** — zwei
   * Produktzeilen mit demselben Markennamen ergeben eine Begruendung,
   * nicht zwei.
   */
  const gefundeneMarken = React.useMemo(() => {
    const f = frage.trim()
    const aus = new Map<string, Marke[]>()
    if (!f) return aus
    for (const z of treffer) {
      const m = passendeMarken(z.marken, f)
      if (m.length > 0) aus.set(z.id, m)
    }
    return aus
  }, [treffer, frage])

  /**
   * Wie viele verschiedene Handelsnamen der Katalog fuehrt.
   *
   * `[cmd]` **Gezaehlt, nicht hingeschrieben: 428** (gemessen
   * 2026-08-27). `[read]` **Aus den geladenen Daten gerechnet**, damit
   * die Zahl im Leerergebnis nicht veraltet, wenn C-308 Produkte
   * nachtraegt.
   */
  const markenGesamt = React.useMemo(() => {
    const namen = new Set<string>()
    for (const z of liste) for (const m of z.marken) namen.add(m.name)
    return namen.size
  }, [liste])

  async function oeffne(id: string) {
    setLadeFehler(null)
    try {
      const antwort = await fetch(
        `/api/medical/wirkstoff?id=${encodeURIComponent(id)}`)
      const j = await antwort.json() as { satz?: WirkstoffSatz; error?: string }
      if (!antwort.ok || !j.satz) {
        setLadeFehler(j.error ?? 'Nicht geladen.')
        return
      }
      setSatz(j.satz)
      setOffeneZeile(j.satz.id)
      // `[read]` Der Reiter wird zurueckgesetzt: der naechste Wirkstoff
      // hat womoeglich keine „Mythen", und ein leerer Reiter zeigte
      // sonst eine leere Flaeche.
      setOffenerReiter(null)
    } catch (e) {
      setLadeFehler(e instanceof Error ? e.message : String(e))
    }
  }

  function schalteZeile(id: string) {
    if (offeneZeile === id) {
      setOffeneZeile(null)
      setSatz(null)
      return
    }
    void oeffne(id)
  }

  return (
    <div>
      {/* ══ WAS DIESE ANSICHT IST — UND WAS NICHT ═══════════════════
          `[read]` **Der Satz steht oben, nicht im Kleingedruckten.**
          Wer eine Medikamentenliste sieht, nimmt an, dass es die
          eigene ist. **Es ist ein Nachschlagewerk** — die eigenen
          Medikamente stehen im Tracking-Reiter. */}
      <div className="v2-med-wirk-hinweis">
        <Icon name="search" className="v2-ic v2-ic-sm" />
        <div>
          <strong>Nachschlagewerk, keine eigene Medikation.</strong>
          {' '}Was hier steht, gilt für den Wirkstoff allgemein.
          Die eigenen Medikamente stehen unter <em>Tracking</em>.
        </div>
      </div>

      <div className="v2-med-wirk-suche">
        <Icon name="search" className="v2-ic v2-ic-sm v2-med-wirk-suchsymbol" />
        <input
          className="v2-feld"
          value={frage}
          onChange={e => setFrage(e.target.value)}
          placeholder="Wirkstoff, ATC-Code oder Anwendungsgebiet…"
          aria-label="Wirkstoff suchen"
          style={{ paddingLeft: 30, paddingRight: 30, width: '100%' }}
        />
        {frage.length > 0 && (
          <button
            type="button" className="v2-med-wirk-suche-x"
            onClick={() => setFrage('')}
            aria-label="Suche leeren" title="Suche leeren"
          >
            ×
          </button>
        )}
      </div>

      <Card style={{ padding: 0 }}>
        <div className="v2-med-wirk-tbl-wrap">
          <table className={`v2-tbl${offeneZeile ? ' hat-offene' : ''}`}>
            <thead>
              <tr>
                <th style={{ paddingLeft: 14 }}>Wirkstoff</th>
                <th style={{ width: 130 }}>ATC</th>
                <th style={{ width: 90, textAlign: 'right' }} />
              </tr>
            </thead>
            <tbody>
              {treffer.map(z => {
                const istOffen = offeneZeile === z.id
                return (
                  <React.Fragment key={z.id}>
                    <tr style={{ cursor: 'pointer' }}
                        aria-expanded={istOffen}
                        onClick={() => schalteZeile(z.id)}>
                      <td style={{ paddingLeft: 14 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{z.name}</div>
                        {/* ══ G-210: WARUM DIESE ZEILE EIN TREFFER IST ══
                            **Auftrag: *„Wer Scemblix eingibt und
                            Asciminib bekommt, muss sehen, dass das
                            dasselbe ist — sonst wirkt es wie ein
                            Fehler."***

                            `[read]` **Die Zeile erscheint nur, wenn die
                            Marke den Treffer TRAEGT** — also wenn
                            gesucht wurde und der Name passt. Sie
                            dauerhaft anzuzeigen waere Rauschen: 264 der
                            428 Marken wiederholen ohnehin den
                            Wirkstoffnamen. */}
                        {gefundeneMarken.get(z.id)?.map(m => (
                          <div key={m.name} className="v2-med-wirk-markentreffer">
                            <Icon name="check" className="v2-ic v2-ic-sm" />
                            <strong>{m.name}</strong>
                            <span>ist ein Handelsname von {z.name}</span>
                            {m.hersteller && (
                              <span className="v2-dim">· {m.hersteller}</span>
                            )}
                            {/* `[cmd]` **20 Marken haben zwei
                                Produktzeilen mit verschiedenen
                                Herstellerschreibweisen** — Scemblix als
                                `Novartis` und `NOVARTIS PHARMACEUTICALS
                                CANADA INC`. `[read]` **Der Wirkstoff
                                steht trotzdem einmal**; die Zahl sagt,
                                dass es mehr gibt. */}
                            {herstellerZahl(z.marken, m.name) > 1 && (
                              <span className="v2-dim">
                                · noch {herstellerZahl(z.marken, m.name) - 1} Hersteller
                              </span>
                            )}
                          </div>
                        ))}
                        {z.kurz && (
                          <div className="v2-muted" style={{
                            fontSize: 10.5, maxWidth: 560, overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {z.kurz}
                          </div>
                        )}
                      </td>
                      <td>
                        {/* `[cmd]` **Die Spalte traegt bei 419 von 497
                            einen JSON-Array als Zeichenkette** —
                            `["J05AF", "J05AR"]`. `atcCodes()` holt sie
                            heraus; ungefiltert stuenden die Klammern
                            hier woertlich (dieselbe Falle wie G-191). */}
                        {z.atc.length > 0
                          ? (
                            <div className="v2-med-wirk-atc">
                              {z.atc.slice(0, 2).map(a => (
                                <Pill key={a} style={{ fontSize: 9 }}>{a}</Pill>
                              ))}
                              {z.atc.length > 2 && (
                                <span className="v2-dim" style={{ fontSize: 9.5 }}>
                                  +{z.atc.length - 2}
                                </span>
                              )}
                            </div>
                            )
                          : (
                            // `[read]` **Kein Strich.** Auch hier gilt
                            // die Regel des Auftrags: ein Strich sieht
                            // aus wie eine Angabe.
                            <span className="v2-med-wirk-leer" style={{ fontSize: 10.5 }}>
                              ohne ATC
                            </span>
                            )}
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: 14 }}>
                        <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                                onClick={e => { e.stopPropagation(); schalteZeile(z.id) }}>
                          {istOffen ? 'Zu' : 'Ansehen'}
                        </button>
                      </td>
                    </tr>
                    {istOffen && satz && satz.id === z.id && (
                      <tr className="v2-med-wirk-tafel-zeile">
                        <td colSpan={3} style={{ padding: 0 }}
                            onClick={e => e.stopPropagation()}>
                          <WirkstoffTafel
                            satz={satz}
                            offenerReiter={offenerReiter}
                            onReiter={setOffenerReiter} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
          {/* ══ G-210: EIN LEERES ERGEBNIS SCHWEIGT NICHT ═══════════
              **Auftrag: *„Ein leeres Ergebnis ohne Erklaerung sieht
              aus wie ‚gibt es nicht', und das ist bei Concor
              falsch."***

              `[cmd]` **Concor ist Bisoprolol, und Bisoprolol STEHT im
              Katalog** — mit einem Produkt, das `Bisoprolol fumarate`
              heisst und `{US}` traegt. **Nicht der Wirkstoff fehlt,
              sondern der europaeische Handelsname.**

              `[cmd]` **Gemessen 2026-08-27, verschiedene Marken je
              Rechtsraum:** US 380 · CA 92 · TH 62 · UK 60 · AU 58 ·
              EU 56 · **DE 0**.

              `[read]` **Deshalb nennt der Satz die Maerkte.** Wer
              sieht, dass der Katalog keinen deutschen Markt fuehrt,
              weiss, dass sein Suchwort vielleicht richtig war — und
              sucht den Freinamen. */}
          {treffer.length === 0 && (
            <div className="v2-med-wirk-leerergebnis">
              <p className="v2-med-wirk-leer-kopf">
                <Icon name="search" className="v2-ic v2-ic-sm" />
                Weder ein Wirkstoff noch ein Handelsname enthält
                {' '}„{frage.trim()}&quot;.
              </p>
              <p className="v2-med-wirk-leer-satz">
                <strong>Das heisst nicht, dass es das Medikament nicht
                gibt.</strong> Der Katalog führt {markenGesamt} Handelsnamen,
                und die stammen aus diesen Märkten:
              </p>
              <div className="v2-med-wirk-maerkte">
                {MAERKTE.map(m => (
                  <Pill key={m.markt} style={{ fontSize: 9 }}>
                    {m.markt} · {m.marken}
                  </Pill>
                ))}
                <Pill variant="warn" style={{ fontSize: 9 }}>DE · 0</Pill>
              </div>
              <p className="v2-med-wirk-leer-satz">
                Ein Wirkstoff heisst je Markt anders — <em>Bisoprolol</em>
                {' '}wird in den USA als <em>Zebeta</em> verkauft, in
                Grossbritannien als <em>Cardicor</em>, im deutschsprachigen
                Raum als <em>Concor</em>. <strong>Der Wirkstoff steht im
                Katalog, der deutsche Handelsname nicht.</strong> Such ihn
                über den Wirkstoffnamen oder das Anwendungsgebiet.
              </p>
              <button type="button" className="v2-btn v2-btn-sm"
                      onClick={() => setFrage('')}>
                Suche zurücksetzen
              </button>
            </div>
          )}
        </div>
        <div className="v2-dim" style={{ fontSize: 10.5, padding: '8px 14px' }}>
          {`${treffer.length} von ${liste.length} Wirkstoffen · `}
          <span className="v2-mono">medical.medication_active_substances</span>
        </div>
        {ladeFehler && (
          <div style={{ fontSize: 11, color: 'var(--warn)', padding: '0 14px 10px' }}>
            {ladeFehler}
          </div>
        )}
      </Card>
    </div>
  )
}
