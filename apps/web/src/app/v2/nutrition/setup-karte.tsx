'use client'

// Die Setup-Karte — G-353.
//
// `[read]` **Der Unterschied zum Onboarding ist die Freiwilligkeit:**
// *„eine Karte ist ein Angebot, ein Schritt ist ein Weg."*
//
// ## Was sie NICHT ist
//
// `[cmd]` **Nicht `LeerHinweis`** (`leer-hinweis.tsx`, 29 Aufrufer).
// `[read]` **Der erklaert eine Abwesenheit** — *„hier stand ein
// Entwurf mit erfundenen Zahlen"*. **Er bietet nichts an, und das ist
// seine Aufgabe.**
//
// `[read]` **Eine Setup-Karte ist das Gegenteil: sie hat einen
// Knopf.** **Beide Bauformen nebeneinander sind richtig** — sie
// beantworten verschiedene Fragen (*warum ist das leer* gegen *willst
// du es fuellen*).
//
// ## Und sie ist keine Attrappe
//
// `[read]` **Sie traegt keine Attrappenmarke**, weil sie nichts
// vorgibt, was nicht da ist: **sie zeigt genau den Zustand, der
// gemessen wurde** — eine leere Stelle und den Weg dorthin.
import * as React from 'react'
import { Card, Icon } from '@lumeos/ui'

import type { SetupKarte as Karte } from '../../../lib/nutrition/setup-karten'

/**
 * Die eine Karte, die gerade dran ist.
 *
 * `[read]` **Hoechstens eine** — der Leseweg entscheidet welche, die
 * Ansicht zeigt nur, was er zurueckgibt. **Ohne Karte rendert sie
 * nichts**, kein Platzhalter, keine leere Huelle.
 */
export function SetupKarte({ karte }: { karte: Karte | null }) {
  if (!karte) return null
  return (
    <Card>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          display: 'grid', placeItems: 'center',
          background: 'color-mix(in oklch, var(--acc-nutri) 12%, transparent)',
          border: '1px solid color-mix(in oklch, var(--acc-nutri) 30%, var(--border))',
          color: 'var(--acc-nutri)',
        }}>
          <Icon name="goals" className="v2-ic v2-ic-sm" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
            {karte.titel}
          </div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
            {karte.satz}
          </div>
        </div>
        {/* `[read]` **Ein Link, kein Knopf ohne Ziel** — er fuehrt
            dorthin, wo die Sache gesetzt wird. */}
        <a href={karte.ziel} className="v2-btn v2-btn-sm"
           style={{ flexShrink: 0, textDecoration: 'none' }}>
          {karte.knopf}
        </a>
      </div>
    </Card>
  )
}
