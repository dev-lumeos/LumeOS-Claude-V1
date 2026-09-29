'use client'

// Das Vorschaupanel — G-534/A7.
//
// `[cmd]` **Der Entwurf zeigt es in `module-goals-pro.jsx:295-429`,
// und bis heute fehlte OBEN jedes einzelne Feld davon** (G-534/A5).
//
// ══ WAS ANGEBUNDEN IST UND WAS NICHT ═══════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-29, je Element die Quellenfrage:**
//
//     Uebergaenge (transitions_to)  UEBERGAENGE, aus der Spec  JA
//     Aussengrenze                  CHECK zielrate_aussengrenze JA
//     Vorzeichen je Art             CHECK zielrate_passt_zur_art JA
//     Baender je Variante           phase_rate_rules: 0 Zeilen   NEIN
//     Sub-phases                    keine Tabelle                NEIN
//     Guards                        keine Tabelle                NEIN
//
// `[read]` **Was eine echte Quelle hat, wird angebunden. Was keine
// hat, bleibt Attrappe mit EINER Zeile Marke** — Quelle und Grund,
// keine Fussnote (das war A1).
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import {
  PHASENARTEN, phasenName, RATENPFLICHT, RATE_MIN, RATE_MAX,
  UEBERGAENGE, UEBERGANG_UNBEKANNT, uebergangErlaubt,
  type Phasenart,
} from '../../../lib/goals/phase-regeln'

const QUELLE = 'theme-v1/module-goals-pro.jsx'

/** E-68: Quelle UND Grund, eine Zeile. */
function marke(wartet: string): string {
  return `Attrappe — ${QUELLE} · wartet auf: ${wartet}`
}

/** Was die Rate fuer diese Art sein muss, als Satz. */
function ratenregel(art: Phasenart): string {
  switch (RATENPFLICHT[art]) {
    case 'negativ': return `${RATE_MIN} bis unter 0 % KG/Woche`
    case 'positiv': return `ueber 0 bis ${RATE_MAX} % KG/Woche`
    case 'nahe_null': return '-0,1 bis +0,1 % KG/Woche'
    default: return 'keine Zielrate'
  }
}

/**
 * Die Vorschau einer angeklickten Phasenart.
 *
 * `[cmd]` **Der Entwurf klappt sie UNTER dem Raster auf**
 * (`:295`), nicht als Modal — und zeigt sie nur, wenn die gewaehlte
 * NICHT die laufende ist (`:295`, `preview !== current`).
 *
 * @param art      Die angeklickte Art.
 * @param laufend  Die Art der laufenden Phase, oder `null`.
 */
export function PhaseVorschau({ art, laufend, onSchliessen, onWechseln }: {
  art: Phasenart
  laufend: Phasenart | null
  onSchliessen: () => void
  onWechseln: () => void
}) {
  const ph = PHASENARTEN.find(p => p.id === art)
  if (!ph) return null

  // `[cmd]` **Der Entwurf unterscheidet zwei Faelle** (`:308-310`):
  // `recommended transition` und `manual switch · not in
  // recommended path`. `[read]` **Beides ist bei uns eine ECHTE
  // Frage** — `UEBERGAENGE` kommt aus der Spec (G-519).
  const empfohlen = uebergangErlaubt(laufend, art)
  const ziele = UEBERGAENGE[art]
  const zieleUnbekannt = UEBERGANG_UNBEKANNT.has(art)

  return (
    <div data-phase-vorschau={art} style={{
      marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)',
    }}>
      {/* [cmd] module-goals-pro.jsx:305-312 — Kopf mit Pille */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{ph.name}</span>
        {laufend !== null && (
          empfohlen
            ? <Pill variant="acc">empfohlener Uebergang</Pill>
            : <Pill>kein empfohlener Uebergang</Pill>
        )}
        <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                data-vorschau-schliessen
                style={{ marginLeft: 'auto' }} onClick={onSchliessen}>
          <Icon name="x" className="v2-ic v2-ic-sm" />
        </button>
      </div>

      <div className="v2-muted" style={{ fontSize: 11.5, marginBottom: 10 }}>
        {ph.zweck}
      </div>

      {/* ── ANGEBUNDEN: die Regel fuer die Rate ────────────────────
          `[cmd]` **Aus den zwei CHECKs gelesen**, nicht aus der
          Spec abgetippt. */}
      <div className="v2-col-gap" data-vorschau-regeln style={{ gap: 4, marginBottom: 10 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 11.5, padding: '6px 0',
          borderBottom: '1px solid var(--border)',
        }}>
          <span className="v2-dim">Zielrate</span>
          <span className="v2-num">{ratenregel(art)}</span>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 11.5, padding: '6px 0',
        }}>
          <span className="v2-dim">Danach moeglich</span>
          <span className="v2-num">
            {zieleUnbekannt
              ? '—'
              : ziele.map(z => phasenName(z)).join(' · ')}
          </span>
        </div>
      </div>

      {zieleUnbekannt && (
        <div className="v2-dim" data-vorschau-unbekannt
             style={{ fontSize: 10.5, lineHeight: 1.5, marginBottom: 10 }}>
          Fuer diese Art ist keine Folgephase festgelegt.
        </div>
      )}

      {/* ══ G-541: die Variantenkachel ist WEG ════════════════════
          `[cmd]` **Hier stand eine Attrappe** — „conservative ·
          moderate · aggressive" als drei Woerter ohne eine einzige
          Zahl, weil `goals.phase_rate_rules` 0 Zeilen hatte.

          `[cmd]` **Sie loest sich auf, statt befuellt zu werden:**
          `aggressive_cut`, `moderate_cut` und `conservative_cut`
          sind DREI Zeilen in `goals.goal_strategies`, keine
          Varianten einer Zeile — jede mit eigenem Faktor, eigener
          Rate, eigenen Makros.

          `[read]` **Sie stehen jetzt als eigene Karten in der
          Strategieauswahl** (`strategie-wahl.tsx`), oberhalb der
          Linie. **Eine Attrappe weniger, nicht eine Attrappe
          besser.** */}

      {/* [cmd] module-goals-pro.jsx:420-425 — die Knopfzeile */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="v2-btn v2-btn-primary"
                data-vorschau-wechseln onClick={onWechseln}>
          Zu {ph.name} wechseln
        </button>
        <button type="button" className="v2-btn"
                data-vorschau-abbrechen onClick={onSchliessen}>
          Schliessen
        </button>
      </div>
    </div>
  )
}
