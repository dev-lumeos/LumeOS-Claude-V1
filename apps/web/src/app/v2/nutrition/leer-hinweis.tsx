'use client'

// Die leere Flaeche, die an die Stelle der Entwurfs-Rueckfaelle tritt
// (G-157 / G-163, 2026-08-23).
//
// ── WARUM EINE LEERE FLAECHE BESSER IST ALS EIN ENTWURF ─────────
//
// `[cmd]` **Gemessen am 2026-08-23:** `nutrients-entwurf.tsx` trug
// **12 Kacheln, 79 erfundene Naehrstoffeintraege und null Marken** —
// dazu einen „Fake 14-day trend" im Detailfenster, ebenfalls
// unmarkiert. `tab-prefs.tsx` trug sechs Kacheln mit sechs Marken,
// **deren Text nicht mehr stimmte**: er behauptete, die Vorlieben
// seien nicht angebunden, obwohl `VorliebenTab` sie seit G-65 liest.
//
// `[read]` **Ein Rueckfall mit veraltetem Text ist schlimmer als
// keiner** — er widerspricht dem echten Zweig, der danebensteht.
// Und eine erfundene 87 sieht aus wie eine gemessene 87 (G-155).
//
// `[read]` **Diese Flaeche zeigt keine Zahl.** Sie sagt, dass nichts
// gelesen wurde, und warum. Das ist die einzige Aussage, die ohne
// Daten belegbar ist.
import * as React from 'react'
import { Card } from '@lumeos/ui'

/**
 * Ein Hinweis statt eines Entwurfs.
 *
 * @param titel  Die Kachelueberschrift.
 * @param grund  Warum nichts dasteht — in einem Satz, ohne Zahl.
 */
export function LeerHinweis({ titel, grund }: { titel: string; grund: string }) {
  return (
    <Card title={titel}>
      <p className="v2-muted" style={{ fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>
        {grund}
      </p>
      <p className="v2-dim" style={{ fontSize: 11, lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>
        Hier stand bis zum 23.08.2026 ein Entwurf mit erfundenen Zahlen.
        Er ist entfernt — eine leere Fläche ist ehrlicher als ein Wert,
        den niemand gemessen hat.
      </p>
    </Card>
  )
}
