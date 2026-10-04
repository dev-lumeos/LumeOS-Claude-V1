'use client'

// Leer oder nicht geladen — zwei Zustaende, eine Kachel (G-601).
//
// ══ DER BEFUND ═════════════════════════════════════════════════════
//
// `[cmd]` **Vier Kacheln titelten „Nicht geladen", auch wenn die
// Abfrage gelang und nur keine Zeile lieferte** — Erholungswert und
// Today's modalities (`ansicht.tsx`), HRV und Sleep (`tab-messwerte.tsx`).
// Der Untertitel sagte dabei *„kam leer zurueck"*: **Titel und Satz
// widersprachen sich.**
//
// `[read]` **G-553: ein Ladefehler ist ein eigener Zustand.** Wer
// „Nicht geladen" liest, sucht einen Fehler — und findet keinen, weil
// es keinen gibt. G-598 hat es fuer die Protokolle schon so gemacht.
//
// `[read]` **Eine Kachel, nicht vier Abschriften** — sonst driftet die
// Unterscheidung an der naechsten Stelle wieder auseinander.
import * as React from 'react'
import { Card, Empty, type IconName } from '@lumeos/ui'

/** Was ein Leseweg mindestens meldet. */
type Stand = { fehler: string | null }

/**
 * Die Kachel, wenn KEINE Daten zu zeigen sind — aus einem von zwei
 * Gruenden.
 *
 * @param stand   Der Stand des Lesewegs. **Fehlt er, ist das ein
 *                Ladefehler** — `page.tsx` reicht ihn immer durch, ein
 *                fehlender Stand heisst: niemand hat gelesen (wie G-598).
 * @param quelle  Die Tabelle, fuer den Fehlersatz.
 */
export function LadeHinweis({ titel, icon, quelle, stand, leerTitel, leerSatz }: {
  titel: string
  icon: IconName
  quelle: string
  stand?: Stand | null
  leerTitel: string
  leerSatz: string
}) {
  const fehler = !stand ? 'kein Stand übergeben' : stand.fehler
  return (
    <Card title={titel}>
      {/* `[cmd]` Die Marke am `span` — `Card` laesst `data-…` fallen. */}
      <span data-ladezustand={fehler ? 'fehler' : 'leer'} hidden />
      <Empty
        title={fehler ? 'Nicht geladen' : leerTitel}
        sub={fehler ? `${quelle} meldet: ${fehler}` : leerSatz}
        icon={icon}
      />
    </Card>
  )
}
