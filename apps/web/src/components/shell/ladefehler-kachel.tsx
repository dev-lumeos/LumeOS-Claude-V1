'use client'

// Die Fehlerkachel — G-553/A1, geteilt seit G-555.
//
// ══ WARUM SIE HIER STEHT UND NICHT IN goals/ansicht.tsx ═══════════
//
// `[cmd]` **G-553 hat sie in `goals/ansicht.tsx` gebaut.** `[cmd]`
// **G-555 hat denselben Fehler in zwei weiteren Modulen gefunden:**
// `medical/tab-biomarker.tsx:56` und `nutrition/tab-vorlieben.tsx:447`
// — **beide zeigten den rohen Fehlertext**, ohne die Unterscheidung
// Sitzung/Daten und ohne Weg zur Anmeldung.
//
// `[read]` **Drei Abschriften derselben Kachel waeren drei Orte, die
// driften.** Ein Modul haette den Anmeldeknopf bekommen, zwei nicht
// — und niemand haette es gemerkt, weil jeder Reiter fuer sich
// aussieht wie gewollt.
//
// `[read]` **Sie liegt neben `ReferenzTrenner`**, aus demselben
// Grund: ein Bauteil, das jedes Modul braucht, gehoert einmal
// gebaut (E-69, C-418/3).
import * as React from 'react'
import { Card } from '@lumeos/ui'

import { fehlerart, fehlertexte } from '../../lib/fehler/ladefehler'

/**
 * Die Fehlerkachel, in beiden Faellen mit technischem Text.
 *
 * `[cmd]` **Hier stand eine Kachel fuer beide Faelle:** *„Goals ·
 * konnten nicht geladen werden"*, darunter der technische Text.
 * `[read]` **Bei `JWT issued at future` schickt das auf die falsche
 * Suche** — der Nutzer prueft seine Ziele, und das Problem ist die
 * Anmeldung.
 *
 * `[read]` **Der technische Text BLEIBT** — er hat diesen Befund
 * moeglich gemacht.
 *
 * @param text   Die Meldung, wie `page.tsx` sie gefangen hat.
 * @param modul  Der Reitername fuer den Datenfall. **Beim
 *               Sitzungsfall ungenutzt** — eine abgelaufene Sitzung
 *               betrifft die Anmeldung, nicht das Modul.
 * @param code   Der Fehlercode, wenn einer bekannt ist
 *               (`NO_SESSION` ist eindeutig).
 */
export function LadefehlerKachel({
  text, modul, code,
}: {
  text: string
  modul?: string
  code?: string | null
}) {
  const art = fehlerart(text, code)
  const t = fehlertexte(art, modul)
  return (
    <Card title={t.titel} sub={art === 'sitzung' ? undefined : t.satz}>
      {/* `[cmd]` **Die Marke steht am `span`, nicht an der `Card`** —
          `Card` nimmt nur benannte Requisiten und liesse `data-…`
          fallen (gemessen in `primitives.tsx:61-63`). */}
      <span data-ladefehler={art} hidden />
      {art === 'sitzung' && (
        <div style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 10 }}>
          {t.satz}
        </div>
      )}
      {/* `[read]` **Der Weg, nicht nur der Satz.** Ein Hinweis
          „melde dich neu an" ohne Knopf laesst den Nutzer suchen. */}
      {art === 'sitzung' && (
        <a className="v2-btn v2-btn-primary v2-btn-sm" href="/login"
           data-ladefehler-anmelden
           style={{ display: 'inline-flex', marginBottom: 10 }}>
          Zur Anmeldung
        </a>
      )}
      <div className="v2-muted" data-ladefehler-text
           style={{ fontSize: 12, lineHeight: 1.55 }}>
        {text}
      </div>
    </Card>
  )
}
