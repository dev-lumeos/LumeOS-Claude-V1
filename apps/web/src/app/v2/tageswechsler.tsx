'use client'

// Der Tageswechsler der Schale — G-375.
//
// **Tom, 2026-09-08:** *„wenn es nur in nutrition im header den
// datumswechsel gibt ist das verwirrend, denn niemand liest oben
// diesen kleinen hinweis. also den daychanger in jedem modul oben in
// der mitte."*
//
// `[cmd]` **G-17 hat das Datum zum Mitreisen gebracht** — steuern
// liess es sich nur in Nutrition. **Wer im Dashboard gestern sehen
// wollte, musste nach Nutrition wechseln, blaettern und zurueck.**
//
// ## Warum nicht in jedem Modul
//
// `[cmd]` **`recovery` fuehrt keinen Tag**, `coach` und `settings`
// auch nicht. `[read]` **Ein Tageswechsler ueber einem Modul, das
// keinen Tag kennt, waere ein Regler ohne Wirkung** — dasselbe
// Muster wie die Autonomieachsen ohne Erlaubnisliste (C-426).
//
// ## Und warum die Entscheidung nicht hier steht
//
// `[read]` **Ein Modul sagt selbst, ob es einen Tag fuehrt** — der
// Auftrag verlangt es so, und es ist auch richtig: eine Liste in der
// Schale veraltet still, sobald ein Modul einen Tag bekommt oder
// verliert.
//
// `[cmd]` **Das Merkmal ist `data-fuehrt-tag`** am Wurzelelement der
// Modulansicht. **Die Schale liest es, statt es zu wissen.**
import * as React from 'react'
import { createPortal } from 'react-dom'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Icon } from '@lumeos/ui'

import { folgetag, heute, istHeute, vortag } from '../../lib/datum'

/** Nur ein Datum in der Form `2026-09-07` gilt. */
function sauber(v: string | null): string | null {
  return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null
}

/** Wochentag und Datum, kurz — wie in der Nutrition-Fassung. */
function datumText(datum: string): string {
  // Mittag als Anker, wie ueberall (siehe lib/datum.ts).
  const d = new Date(`${datum}T12:00:00`)
  return d.toLocaleDateString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

/**
 * Der Wechsler, oben in der Mitte — aber nur, wo das Modul einen Tag
 * fuehrt.
 *
 * `[read]` **Er rendert `null`, wo keiner gefuehrt wird** — **kein
 * ausgegrauter Regler.** Ein abgeblendeter Knopf sagt *„geht gerade
 * nicht"*; hier gibt es nichts, was gehen koennte.
 */
export function Tageswechsler() {
  const pathname = usePathname()
  const router = useRouter()
  const suche = useSearchParams()
  const [platz, setPlatz] = React.useState<Element | null>(null)

  // ══ G-376: der Wechsler gehoert IN den Kopf ═══════════════
  //
  // **Tom, 2026-09-08:** *,,der changer soll in den headerteil rein
  // wie es vorher bei nutrition war und die actions die nun mittig
  // sind zurueck nach rechts in diesem header."*
  //
  // `[cmd]` **G-375 hat ihn ueber den Kopf gesetzt** — ein eigener
  // Kasten darueber, und die Aktionsknoepfe rutschten in die Mitte.
  // **Gemessen: Nutritions Knoepfe standen 221 px vom rechten Rand,
  // die uebrigen Module 21 px.**
  //
  // `[read]` **Der Kopf gehoert dem Modul, der Wechsler der Schale.**
  // **Das Modul stellt einen leeren Platz** (`data-tageswechsler`),
  // **die Schale rendert hinein** — ein Portal, keine zweite
  // Fassung der Komponente.
  React.useEffect(() => {
    const suchen = () => setPlatz(document.querySelector('[data-tageswechsler]'))
    suchen()
    // Die Modulansicht kann nach dem ersten Anstrich erscheinen
    // (Serverkomponente, Streaming). Ein Beobachter faengt das,
    // ohne zu pollen.
    const b = new MutationObserver(suchen)
    b.observe(document.body, { childList: true, subtree: true })
    return () => b.disconnect()
  }, [pathname])

  // `[read]` **Kein Platz, kein Wechsler** — und kein ausgegrauter:
  // wo kein Tag gefuehrt wird, gibt es nichts, was gehen koennte
  // (C-426).
  if (!platz) return null

  const datum = sauber(suche?.get('datum') ?? null) ?? heute()
  const heuteAngezeigt = istHeute(datum)

  function gehe(ziel: string) {
    // `[cmd]` **Die uebrigen Parameter BLEIBEN** (G-117) — vorher warf
    // der Tagwechsel `?tab=` weg und sprang auf Diary.
    //
    // `[read]` **Und der Pfad ist der aktuelle**, nicht `/v2/nutrition`
    // wie in der Modulfassung: derselbe Wechsler steht jetzt ueber
    // mehreren Modulen.
    const p = new URLSearchParams(suche?.toString() ?? '')
    p.set('datum', ziel)
    router.push(`${pathname}?${p.toString()}` as never)
  }

  // `[read]` **Kein eigener Kasten mehr** — der Platz im Kopf
  // bringt seine Ausrichtung selbst mit.
  return createPortal(
    (
      <div className="v2-datumsnav">
        <button
          type="button"
          className="v2-icon-btn"
          aria-label="Vorheriger Tag"
          onClick={() => gehe(vortag(datum))}
        >
          <Icon name="chevron_left" className="v2-ic v2-ic-sm" />
        </button>

        {/* Klick auf das Datum fuehrt auf heute. Steht dort „Heute",
            gibt es nichts zu tun — der Knopf ist dann kein Knopf. */}
        <button
          type="button"
          className="v2-datumsfeld"
          aria-label={heuteAngezeigt ? undefined : 'Zurueck zu heute'}
          aria-current={heuteAngezeigt ? 'date' : undefined}
          disabled={heuteAngezeigt}
          onClick={() => gehe(heute())}
        >
          {heuteAngezeigt ? 'Heute' : datumText(datum)}
        </button>

        <button
          type="button"
          className="v2-icon-btn"
          aria-label="Naechster Tag"
          onClick={() => gehe(folgetag(datum))}
        >
          <Icon name="chevron_right" className="v2-ic v2-ic-sm" />
        </button>
      </div>
    ),
    platz,
  )
}
