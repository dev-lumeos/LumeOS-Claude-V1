'use client'

// ════════════════════════════════════════════════════════════════════
// NACH F5 AUF HEUTE — G-487
// ════════════════════════════════════════════════════════════════════
//
// **Tom, 2026-09-21:** *„der daychooser war auf 18.9. und nicht heute,
// sprich das ist eine boesartige falle"*
//
// `[cmd]` **Die Falle, gemessen:** am 18.09. hat der aktive Plan null
// Eintraege, am 21.09. vier. **Tom sah ,,kein Eintrag" und hielt es
// fuer einen Fehler** — er stand auf dem falschen Tag.
//
// ══ EINMAL JE DOKUMENT, NICHT JE RENDERN ════════════════════════════
//
// `[cmd]` **Gemessen:** `performance`-Navigationstyp bleibt nach einem
// `router.push` auf `reload` stehen. `[read]` **Eine Regel ohne Merker
// spraenge nach dem ersten Blaettern sofort zurueck** — der Nutzer
// koennte keinen anderen Tag mehr ansehen.
//
// `[read]` **Der Merker ist ein Modulzustand** — siehe unten, warum
// `sessionStorage` dafuer das falsche Gedaechtnis ist.
import * as React from 'react'
import { useRouter } from 'next/navigation'

import { heute, springtAufHeute } from './datum'

// ══ Der Merker lebt EIN Dokument lang ══════════════════════════════
//
// `[read]` **Ein Modulzustand, kein `sessionStorage`** — er wird beim
// Neuladen zurueckgesetzt und ueberlebt ein `router.push`.
// **Genau diese Grenze ist gesucht** (gemessen: `sessionStorage`
// ueberlebt F5 und machte die Regel wirkungslos).
let schonGeprueft = false

/**
 * Springt nach einem Neuladen auf heute.
 *
 * @param datum  der Tag aus der Adresse
 * @param pfad   wohin gesprungen wird, z. B. `/v2/nutrition`
 * @param suche  die uebrigen Adressparameter — sie BLEIBEN (G-117)
 *
 * `[read]` **Gibt zurueck, ob gesprungen wird** — die Kachel kann
 * dann den alten Tag gar nicht erst zeichnen.
 */
export function useHeuteNachF5(
  datum: string, pfad: string, suche?: URLSearchParams | null,
): void {
  const router = useRouter()
  React.useEffect(() => {
    // `[read]` **Nur im Browser** — `performance` und `sessionStorage`
    // gibt es beim Serveranstrich nicht (A-30, G-472).
    if (typeof window === 'undefined') return

    // ══ WARUM KEIN sessionStorage ═════════════════════════════════
    //
    // `[cmd]` **Ein erster Entwurf merkte sich die Pruefung dort.**
    // `[cmd]` **GEMESSEN: der Merker stand schon VOR dem F5 auf `1`**
    // — gesetzt vom ersten Aufruf. **Beim Neuladen las die Regel
    // ,,schon geprueft" und tat nichts.**
    //
    // `[read]` **`sessionStorage` ueberlebt ein Neuladen** — genau das
    // Ereignis, das hier unterschieden werden muss. **Er ist das
    // falsche Gedaechtnis.**
    //
    // `[read]` **Ein Modulzustand lebt dagegen genau ein Dokument
    // lang:** F5 laedt das Modul neu und setzt ihn zurueck, ein
    // `router.push` nicht. **Das ist die gesuchte Grenze.**
    if (schonGeprueft) return
    schonGeprueft = true

    let typ: string | null = null
    try {
      const n = performance.getEntriesByType('navigation')[0] as
        PerformanceNavigationTiming | undefined
      typ = n?.type ?? null
    } catch {
      return
    }

    if (!springtAufHeute(typ, false, datum)) return

    // G-117: die uebrigen Parameter bleiben — sonst wirft der Sprung
    // `?tab=` weg und landet auf Diary.
    const p = new URLSearchParams(suche?.toString() ?? '')
    p.set('datum', heute())
    router.replace(`${pfad}?${p.toString()}` as never)
  }, [datum, pfad, suche, router])
}
