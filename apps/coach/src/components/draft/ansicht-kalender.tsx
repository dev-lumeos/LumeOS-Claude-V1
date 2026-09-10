// Der Kalender — G-410/A1.
//
// **Tom, 2026-09-08:** *„es soll so aussehen wie ich es will und
// nicht wie du oder der agent es will."*
//
// ══ DAS IST EINE KOPIE ═════════════════════════════════════════════
//
// `[cmd]` **Vorlage: `module-coach-portal-tools.jsx:30`,
// `window.PortalCalendar`, 129 Zeilen.** `[read]` **Zeile fuer
// Zeile nachgebaut** — Raster, Masse, Farben, Saetze.
//
// `[cmd]` **G-409 baute hier eine Liste mit neun Ueberschriften.**
// `[read]` **Die Vorlage zeigt ein MONATSRASTER.** **Das war die
// Abweichung.**
//
// ══ WAS UEBERNOMMEN IST, ZEILE FUER ZEILE ══════════════════════════
//
//     :44   zwei Spalten 1.5fr / 1fr, Abstand 14
//     :45   Titel „September 2026", Untertitel „N scheduled events"
//     :46   drei Knoepfe: zurueck, Today, vor
//     :47   sieben Wochentagskoepfe, mittig, 9,5 px
//     :52   Raster mit sieben Spalten, Abstand 4
//     :60   je Zelle minHeight 62, Polsterung 6, Radius 6
//     :65   die Tageszahl, fett wenn heute
//     :67   bis zu DREI Farbstreifen, Hoehe 3, Deckkraft 0,85
//     :70   „+N" wenn mehr als drei
//     :77   Legende mit fuenf Arten, Quadrat 8 px
//     :86   Tagesspalte mit Uhrzeit, Farbstrich, Name
//     :102  „Upcoming", die naechsten sieben
//
// ══ DIE EINE ABWEICHUNG, UND WARUM ═════════════════════════════════
//
// `[cmd]` **Die Vorlage rechnet das Raster mit `new Date(2026, 8, 1)`
// aus** (`:33-37`). `[cmd]` **Hier steht das ERGEBNIS als Liste.**
//
// `[read]` **Grund: G-390.** **Ein `new Date()` im Browser rechnet in
// einer anderen Zeitzone als der Server** — die Seite wird
// serverseitig gerendert, und dann springt die Hydration.
//
// `[cmd]` **Gerechnet und nachgesehen:** `startDow = 1` (der
// 1.9.2026 ist ein Dienstag), 30 Tage, 35 Zellen. `[read]` **Am
// Schirm steht dasselbe Raster wie in der Vorlage** — nur der Weg
// dahin ist ein anderer.
'use client'

import * as React from 'react'
import { Card, Icon } from '@lumeos/ui'

import { CAL_EVENTS, CAL_KIND } from './daten-portal'
import { Attrappe } from './bausteine'

type Termin = { t: string, who: string, kind: string, label: string }

const TERMINE = CAL_EVENTS as unknown as Record<string, Termin[]>
const ARTEN = CAL_KIND as unknown as Record<string, { c: string, l: string }>

/**
 * Das Zellenraster des Septembers 2026.
 *
 * `[cmd]` **Ausgerechnet aus `new Date(2026, 8, 1)`, wie `:33-37`:**
 * ein leeres Feld vorne (Dienstagsbeginn, montagsgezaehlt), dann
 * 1 bis 30, dann auf 35 aufgefuellt.
 */
const ZELLEN: Array<number | null> = [
  null, 1, 2, 3, 4, 5, 6,
  7, 8, 9, 10, 11, 12, 13,
  14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27,
  28, 29, 30, null, null, null, null,
]

/** `:47` — montagsgezaehlt. */
const WOCHENTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

/** `:39` — der Tag, den die Vorlage als „heute" markiert. */
const HEUTE = 10

/** `:38` */
const schluessel = (d: number) => `2026-09-${String(d).padStart(2, '0')}`

/** `:87` — die Ueberschrift der Tagesspalte, auf Deutsch. */
const TAGESNAMEN = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch',
  'Donnerstag', 'Freitag', 'Samstag']

function tagestitel(k: string): string {
  const tag = Number(k.slice(8))
  // 1.9.2026 ist ein Dienstag (=2), also (tag - 1 + 2) % 7.
  return `${TAGESNAMEN[(tag + 1) % 7]}, ${tag}. September`
}

export function AnsichtKalender() {
  const [gewaehlt, setGewaehlt] = React.useState('2026-09-10')

  const gesamt = Object.values(TERMINE).flat().length
  const desTages = TERMINE[gewaehlt] ?? []

  // `:41` — die naechsten sieben ab dem 10.
  const naechste = Object.entries(TERMINE)
    .flatMap(([d, evs]) => evs.map(e => ({ ...e, d })))
    .filter(e => e.d >= '2026-09-10')
    .slice(0, 7)

  return (
    <div className="dk-kal">
      {/* ── Das Monatsraster — `:45-81` ────────────────────────── */}
      <Card
        title="September 2026"
        sub={`${gesamt} geplante Termine`}
        actions={<>
          <button type="button" className="v2-btn" disabled title="Attrappe — nur September 2026 liegt in der Vorlage">
            <Icon name="chevron_left" className="v2-ic v2-ic-sm" />
          </button>
          <button type="button" className="v2-btn" onClick={() => setGewaehlt(schluessel(HEUTE))}>
            Heute
          </button>
          <button type="button" className="v2-btn" disabled title="Attrappe — nur September 2026 liegt in der Vorlage">
            <Icon name="chevron_right" className="v2-ic v2-ic-sm" />
          </button>
        </>}
      >
        <div className="dk-kal-kopf">
          {WOCHENTAGE.map(d => (
            <div key={d} className="v2-eyebrow dk-kal-wt">{d}</div>
          ))}
        </div>

        <div className="dk-kal-raster">
          {ZELLEN.map((d, i) => {
            if (!d) return <div key={i} />
            const k = schluessel(d)
            const evs = TERMINE[k] ?? []
            const istHeute = d === HEUTE
            const istGewaehlt = k === gewaehlt
            return (
              <div
                key={i}
                className="dk-kal-zelle"
                data-gewaehlt={istGewaehlt ? 'ja' : undefined}
                data-heute={istHeute ? 'ja' : undefined}
                data-hat={evs.length ? 'ja' : undefined}
                onClick={() => setGewaehlt(k)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setGewaehlt(k) }}
                aria-label={`${d}. September, ${evs.length} Termine`}
              >
                <div className="dk-kal-zahl v2-num">{d}</div>
                <div className="dk-kal-streifen">
                  {/* `:67` — hoechstens DREI Streifen. */}
                  {evs.slice(0, 3).map((e, j) => (
                    <div
                      key={j}
                      className="dk-kal-strich"
                      style={{ background: ARTEN[e.kind]?.c }}
                    />
                  ))}
                  {evs.length > 3 && (
                    <span className="v2-dim v2-mono dk-kal-mehr">+{evs.length - 3}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="dk-trenner" />

        {/* `:77` — die Legende mit fuenf Arten. */}
        <div className="dk-kal-legende">
          {Object.entries(ARTEN).map(([k, v]) => (
            <span key={k} className="dk-kal-legende-eintrag">
              <span className="dk-kal-legende-farbe" style={{ background: v.c }} />
              {v.l}
            </span>
          ))}
        </div>
        <Attrappe
          fehlt="keine Tabelle fuer Termine oder einen Kalender"
          quelle="CAL_EVENTS"
        />
      </Card>

      {/* ── Die rechte Spalte — `:85-112` ──────────────────────── */}
      <div className="dk-kal-rechts">
        <Card
          title={tagestitel(gewaehlt)}
          sub={`${desTages.length} Termin${desTages.length === 1 ? '' : 'e'}`}
          actions={
            <button type="button" className="v2-btn" disabled title="Attrappe — kein Schreibweg">
              <Icon name="plus" className="v2-ic v2-ic-sm" />Neu
            </button>
          }
        >
          {desTages.length === 0
            ? <div className="dk-kal-leer">Nichts geplant.</div>
            : desTages.map((e, i) => (
              <div
                key={i}
                className="dk-kal-tageszeile"
                data-letzte={i === desTages.length - 1 ? 'ja' : undefined}
              >
                <span className="dk-kal-uhr v2-num">{e.t}</span>
                <span className="dk-kal-balken" style={{ background: ARTEN[e.kind]?.c }} />
                <div style={{ minWidth: 0 }}>
                  <div className="dk-kal-label">{e.label}</div>
                  <div className="v2-dim dk-kal-wer">{e.who}</div>
                </div>
              </div>
            ))}
          <Attrappe
            fehlt="keine Tabelle fuer Termine oder einen Kalender"
            quelle="CAL_EVENTS"
          />
        </Card>

        <Card title="Als naechstes" sub="die naechsten sieben Termine">
          {naechste.map((e, i) => (
            <div
              key={i}
              className="dk-kal-naechste"
              data-letzte={i === naechste.length - 1 ? 'ja' : undefined}
            >
              <span className="v2-num v2-dim dk-kal-datum">{e.d.slice(8)}. Sep</span>
              <span className="dk-kal-punkt" style={{ background: ARTEN[e.kind]?.c }} />
              <span className="dk-kal-titel">{e.label}</span>
              <span className="v2-dim dk-kal-vorname">{e.who.split(' ')[0]}</span>
            </div>
          ))}
          <Attrappe
            fehlt="keine Tabelle fuer Termine oder einen Kalender"
            quelle="CAL_EVENTS"
          />
        </Card>
      </div>
    </div>
  )
}
