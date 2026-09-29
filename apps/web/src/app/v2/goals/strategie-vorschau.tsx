'use client'

// Die Vorschau einer Strategie — G-541/A1, A2.
//
// ══ WAS SICH GEGEN G-534 GEAENDERT HAT ═════════════════════════════
//
// `[cmd]` **In G-534 meldete ich sieben Elemente ohne Quelle** —
// Sub-phases, Guards, Exit conditions, Success metrics,
// Jahreszyklus, Best for, Purpose. Dazu Hoechstdauer und Protein als
// Strich und eine Variantenkachel „ohne jede Zahl".
//
// `[cmd]` **Alle zehn haben seit G-538 eine Spalte** — und das ist
// nicht dasselbe wie einen Wert. **Gemessen 2026-09-29, wie viele
// der 17 Zeilen INHALT tragen:**
//
//     editor_modes  17     guards         7     purpose    1
//     protein       16     sub_phases     1     exits      1
//     max_duration   9     best_for       1     success    1
//                                              annual     1
//
// `[read]` **Deshalb entscheidet die ZEILE ueber den Strich, nicht
// das Element** (A2): `contest_prep` zeigt vier Teilphasen,
// `aggressive_cut` zeigt an derselben Stelle einen Strich — **und
// der Grund daneben sagt, dass die Spalte da ist und die Zeile leer,
// nicht dass das Feature fehlt.**
//
// `[read]` **Die Variantenkachel ist ersatzlos weg.** `[cmd]` **Sie
// zeigte „conservative · moderate · aggressive" als drei Woerter,
// weil `phase_rate_rules` 0 Zeilen hatte.** `[read]` **Die drei sind
// keine Varianten einer Zeile — sie sind drei Katalogzeilen mit
// eigenem Faktor, eigener Rate, eigenen Makros, und sie stehen
// jetzt als eigene Karten in der Auswahl.**
import * as React from 'react'
import { Icon } from '@lumeos/ui'

import { tdeeProzent } from '../../../lib/goals/strategie-regeln'
import type { Strategie } from '../../../lib/goals/strategie-read'

/**
 * Warum ein Feld leer ist.
 *
 * `[read]` **Ein Strich ohne Grund zwingt den naechsten Auftrag, von
 * vorn zu messen** (E-68, G-355). `[read]` **Hier ist der Grund
 * immer derselbe und immer wahr:** die Spalte steht, diese Zeile
 * fuehrt nichts. **Das ist keine Attrappe** — es ist ein gemessener
 * Leerstand, und deshalb traegt er keine Attrappenmarke.
 */
const LEER = 'im Katalog fuer diese Strategie nicht hinterlegt'

/**
 * Der kurze Grund fuer die Zahlenzeile.
 *
 * `[cmd]` **Am BILD gefunden, nicht am Zaehler** (2026-09-29): in der
 * rechtsbuendigen Wertspalte lief der lange Satz bis an die Kante,
 * und bei sieben leeren Feldern stand er siebenmal untereinander.
 * `[read]` **Kein Element lief ueber den Panelrand hinaus** — die
 * Messung war gruen, lesbar war es trotzdem nicht.
 *
 * `[read]` **Der Grund verschwindet nicht, er wandert:** in der
 * engen Zahlenspalte steht er kurz, an der Kachel als Titel.
 */
const LEER_KURZ = 'nicht hinterlegt'

/**
 * Ein Strich mit Grund — A2.
 *
 * @param kurz  In der Zahlenzeile: der kurze Satz, voll im `title`.
 */
function Strich({ grund = LEER, kurz = false }: {
  grund?: string; kurz?: boolean
}) {
  return (
    <span className="v2-dim" data-feld-leer
          title={kurz ? grund : undefined}
          style={{ fontSize: 11, fontStyle: 'italic' }}>
      — {kurz && grund === LEER ? LEER_KURZ : grund}
    </span>
  )
}

/** Eine Zeile im Kennzahlenblock. */
function Zeile({ label, children }: {
  label: string; children: React.ReactNode
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', gap: 12,
      fontSize: 11.5, padding: '6px 0', alignItems: 'baseline',
      borderBottom: '1px solid var(--border)',
    }}>
      <span className="v2-dim" style={{ flexShrink: 0 }}>{label}</span>
      <span className="v2-num" style={{ textAlign: 'right' }}>{children}</span>
    </div>
  )
}

/**
 * Die sechs Listenfelder, in der Reihenfolge der Anzeige.
 *
 * `[read]` **Eine Liste statt sechs Aufrufen** — so lassen sich die
 * gefuellten von den leeren trennen, ohne die Namen zu verdoppeln.
 */
const LISTEN = [
  ['Wofuer', 'best_for'],
  ['Zweck', 'purpose'],
  ['Waechter', 'guards'],
  ['Ausstiege', 'exits'],
  ['Erfolgsmerkmale', 'success'],
  ['Warnungen', 'warnings'],
] as const satisfies ReadonlyArray<readonly [string, keyof Strategie]>

/**
 * Ein Abschnitt mit einer Liste — oder einem Strich.
 *
 * `[read]` **Die Ueberschrift steht auch dann, wenn die Liste leer
 * ist.** Sonst waere nicht zu sehen, dass es das Feld gibt — und
 * genau das war der Zustand vor G-538.
 */
function Liste({ titel, werte, marke }: {
  titel: string; werte: string[]; marke: string
}) {
  return (
    <div data-vorschau-block={marke} style={{ marginBottom: 10 }}>
      <div className="v2-eyebrow" style={{ marginBottom: 4 }}>{titel}</div>
      {werte.length === 0 ? <Strich /> : (
        <ul style={{
          margin: 0, paddingLeft: 16, display: 'flex',
          flexDirection: 'column', gap: 3,
        }}>
          {werte.map((w, i) => (
            <li key={i} style={{ fontSize: 11, lineHeight: 1.45 }}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Die Vorschau.
 *
 * `[cmd]` **Der Entwurf klappt sie UNTER dem Raster auf**
 * (`module-goals-pro.jsx:295`), nicht als Modal.
 */
export function StrategieVorschau({ s, onSchliessen }: {
  s: Strategie
  onSchliessen: () => void
}) {
  const tdee = tdeeProzent(s)

  return (
    <div data-strategie-vorschau={s.code} style={{
      marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
        <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                data-vorschau-schliessen
                style={{ marginLeft: 'auto' }} onClick={onSchliessen}>
          <Icon name="x" className="v2-ic v2-ic-sm" />
        </button>
      </div>

      {/* ── Die Zahlen ───────────────────────────────────────────────
          `[cmd]` **Vier Spalten, je mit eigener Deckung** —
          `protein` 16 von 17, `max_duration` 9 von 17. */}
      <div data-vorschau-zahlen style={{ marginBottom: 12 }}>
        <Zeile label="TDEE-Faktor">
          {tdee ?? <Strich kurz />}
        </Zeile>
        <Zeile label="Zielrate">
          {s.weight_change_target_percent !== null
            ? `${s.weight_change_target_percent > 0 ? '+' : ''}${s.weight_change_target_percent} % KG/Woche`
            : <Strich kurz />}
        </Zeile>
        <Zeile label="Hoechstdauer">
          {s.max_duration_weeks !== null
            ? `${s.max_duration_weeks} Wochen`
            : <Strich kurz grund="unbegrenzt" />}
        </Zeile>
        <Zeile label="Protein">
          {s.protein_per_kg !== null
            ? `${s.protein_per_kg} g/kg`
            : <Strich kurz />}
        </Zeile>
        <Zeile label="Fett">
          {s.fat_percent !== null
            ? `${Math.round(s.fat_percent * 100)} % der Kalorien`
            : <Strich kurz />}
        </Zeile>
      </div>

      {/* ── Die sechs Listen ────────────────────────────────────────
          `[read]` **Alle sechs lesen eine Spalte** — und fuenf davon
          sind in genau EINER der 17 Zeilen gefuellt. Der Strich ist
          hier der Normalfall, nicht die Ausnahme. */}
      {LISTEN.filter(([, f]) => s[f].length > 0).map(([titel, feld]) => (
        <Liste key={feld} titel={titel} werte={s[feld]} marke={feld} />
      ))}

      {/* ── Was diese Zeile nicht fuehrt, in EINER Zeile ───────────
          `[cmd]` **Am Bild gefunden** (2026-09-29): bei
          `reverse_diet` standen vier Listenueberschriften mit
          viermal demselben Satz darunter — der Leerstand nahm mehr
          Platz ein als der Inhalt.

          `[read]` **Der Grund faellt nicht weg, er steht einmal.**
          **Die Namen bleiben sichtbar** — sonst waere nicht zu
          sehen, dass es das Feld gibt, und genau das war der Zustand
          vor G-538. */}
      {LISTEN.some(([, f]) => s[f].length === 0) && (
        <div data-vorschau-leerliste style={{ marginBottom: 10 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>
            Ohne Eintrag
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 3 }}>
            {LISTEN.filter(([, f]) => s[f].length === 0).map(([titel, feld]) => (
              <span key={feld} data-vorschau-block={feld} className="v2-dim"
                    style={{
                      fontSize: 10.5, padding: '3px 7px', borderRadius: 5,
                      border: '1px dashed var(--border)',
                    }}>{titel}</span>
            ))}
          </div>
          <Strich /></div>
      )}

      {/* ── Teilphasen ─────────────────────────────────────────────
          `[cmd]` **1 von 17 Zeilen** — `contest_prep`, vier
          Abschnitte. `[read]` **`weeks` ist mal Text, mal Zahl.** */}
      <div data-vorschau-block="sub_phases" style={{ marginBottom: 10 }}>
        <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Teilphasen</div>
        {s.sub_phases.length === 0 ? <Strich /> : (
          <div className="v2-col-gap" style={{ gap: 3 }}>
            {s.sub_phases.map((t, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, fontSize: 11,
                padding: '4px 0', alignItems: 'baseline',
              }}>
                <span style={{ fontWeight: 600, minWidth: 74 }}>{t.name}</span>
                <span className="v2-dim v2-num" style={{ minWidth: 52 }}>
                  {t.weeks !== null ? `${t.weeks} Wo` : '—'}
                </span>
                <span className="v2-dim">
                  {[
                    t.deficit !== null ? `${t.deficit > 0 ? '+' : ''}${t.deficit} kcal` : null,
                    t.cardio !== null ? `Cardio ${t.cardio}` : null,
                    t.special ? 'gesondert' : null,
                  ].filter(Boolean).join(' · ') || '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Jahreszyklus ───────────────────────────────────────────
          `[cmd]` **1 von 17** — `expert_bb_annual`, fuenf Bloecke. */}
      <div data-vorschau-block="annual" style={{ marginBottom: 10 }}>
        <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Jahreszyklus</div>
        {s.annual.length === 0 ? <Strich /> : (
          <div className="v2-col-gap" style={{ gap: 3 }}>
            {s.annual.map((b, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, fontSize: 11,
                padding: '4px 0', alignItems: 'baseline',
              }}>
                <span className="v2-dim v2-num" style={{ minWidth: 52 }}>
                  Monat {b.months}
                </span>
                <span style={{ fontWeight: 600, minWidth: 108 }}>{b.phase}</span>
                <span className="v2-dim">{b.focus ?? '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Editor ─────────────────────────────────────────────────
          `[cmd]` **17 von 17 Zeilen tragen `editor_modes`.**
          `[read]` **Die Namen werden GENANNT, nicht angeboten** —
          der Editor ist G-539, und ein Knopf ohne Ziel waere eine
          Zusage (A5). */}
      <div data-vorschau-block="editor_modes" style={{ marginBottom: 10 }}>
        <div className="v2-eyebrow" style={{ marginBottom: 4 }}>
          Einstellbar im Editor
        </div>
        {s.editor_modes.length === 0 ? <Strich /> : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {s.editor_modes.map(m => (
              <span key={m} className="v2-dim" style={{
                fontSize: 10.5, padding: '3px 7px', borderRadius: 5,
                border: '1px solid var(--border)',
              }}>{m}</span>
            ))}
          </div>
        )}
      </div>

      {/* ── Folgestrategien ────────────────────────────────────────
          `[read]` **Genannt, nicht verlinkt** — ein Wechsel schriebe
          `strategie_code`, und den Weg gibt es noch nicht (G-538). */}
      <Liste titel="Danach moeglich" werte={s.next_codes} marke="next_codes" />

      {/* ── Was diese Anzeige NICHT tut ────────────────────────────
          `[cmd]` **`goal_phases.strategie_code` ist ein
          Fremdschluessel auf `goal_strategies.code`, aber
          `goals.goal_phase_start` nimmt ihn nicht entgegen** —
          gemessen an `pg_get_function_arguments`, 2026-09-29.
          `[read]` **Ein Satz, kein Knopf** (A5). */}
      <div data-vorschau-grenze className="v2-dim" style={{
        fontSize: 10.5, lineHeight: 1.5, marginTop: 12, paddingTop: 10,
        borderTop: '1px solid var(--border)',
      }}>
        Die Wahl gilt fuer diese Ansicht. Eine Strategie an eine Phase zu
        binden, braucht den Schreibweg aus G-538.
      </div>
    </div>
  )
}
