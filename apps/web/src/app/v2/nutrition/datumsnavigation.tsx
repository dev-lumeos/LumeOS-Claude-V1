'use client'

// `‹ Heute ›` — die Datumsnavigation.
//
// `[read]` Tom, 2026-08-17: „Dieses Datumfeld muss in die Mitte und die
// Pfeile links und rechts davon. Dann muss der heutige Tag nicht als
// Datum angezeigt werden, er soll ‚Heute' heissen, dann ist alles klar."
//
// WAS VORHER FALSCH WAR: die Navigation gab es schon — zwei `Link` mit
// `v2-btn-ghost`, blass, links neben „Find food". `[read]` Derselbe
// Fall wie der Speichern-Knopf in C-58: ein Knopf, den man nicht sieht,
// existiert fuer die Nutzerin nicht.
//
// UEBERNOMMEN aus `DateNavigation.tsx` des Vorgaengerrepos: die drei
// Bewegungen `goPrev`/`goNext`/`goToday` und der Gedanke, „Heute" als
// eigenen Zustand zu behandeln statt als Datum wie jedes andere.
// NICHT uebernommen: dort steht das Datum immer, und „Today" ist ein
// zusaetzlicher Knopf daneben. Tom will das Wort AN der Stelle des
// Datums — eine Sache weniger auf dem Bildschirm.
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Icon } from '@lumeos/ui'

import { folgetag, heute, istHeute, istZukunft, vortag } from '../../../lib/datum'

export function Datumsnavigation({
  datum, istAdmin,
}: {
  datum: string
  /**
   * Nur Admins duerfen in die Zukunft blaettern.
   *
   * `[read]` Die Sperre ist ANZEIGE, kein Schutz: wer `?datum=` von
   * Hand tippt, kommt auf einen Zukunftstag. Das ist harmlos, weil dort
   * nichts steht — und die Ansicht sagt es dann auch (siehe
   * `Zukunftshinweis`). Ein echter Schutz waere serverseitig und haette
   * keinen Zweck: es gibt nichts zu schuetzen.
   */
  istAdmin: boolean
}) {
  const t = useTranslations('Nutrition')
  const router = useRouter()

  const zurueckErlaubt = true
  const vorwaertsErlaubt = istAdmin || !istHeute(datum)
  const heuteAngezeigt = istHeute(datum)

  function gehe(ziel: string) {
    router.push(`/v2/nutrition?datum=${ziel}` as never)
  }

  return (
    <div className="v2-datumsnav">
      <button
        type="button"
        className="v2-icon-btn"
        aria-label={t('vorherigerTag')}
        disabled={!zurueckErlaubt}
        onClick={() => gehe(vortag(datum))}
      >
        <Icon name="chevron_left" className="v2-ic v2-ic-sm" />
      </button>

      {/* Klick auf das Datum fuehrt auf heute. Steht dort „Heute",
          gibt es nichts zu tun — der Knopf ist dann kein Knopf. */}
      <button
        type="button"
        className="v2-datumsfeld"
        aria-label={heuteAngezeigt ? undefined : t('zurueckZuHeute')}
        aria-current={heuteAngezeigt ? 'date' : undefined}
        disabled={heuteAngezeigt}
        onClick={() => gehe(heute())}
      >
        {heuteAngezeigt ? t('heute') : datumText(datum)}
      </button>

      <button
        type="button"
        className="v2-icon-btn"
        aria-label={t('naechsterTag')}
        disabled={!vorwaertsErlaubt}
        title={vorwaertsErlaubt ? undefined : t('zukunftGesperrt')}
        onClick={() => gehe(folgetag(datum))}
      >
        <Icon name="chevron_right" className="v2-ic v2-ic-sm" />
      </button>
    </div>
  )
}

/**
 * Sagt, dass ein Zukunftstag ein Zukunftstag ist.
 *
 * `[read]` Ohne diesen Hinweis sieht ein leerer Tag in der Zukunft
 * genauso aus wie ein vergessener Tag in der Vergangenheit — also wie
 * ein Fehler. Er ist keiner.
 */
export function Zukunftshinweis({ datum }: { datum: string }) {
  const t = useTranslations('Nutrition')
  if (!istZukunft(datum)) return null
  return (
    <div className="v2-insight v2-warn" style={{ marginTop: 16 }}>
      <div className="v2-insight-mark" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="v2-insight-title">{t('zukunftTitel')}</div>
        <div className="v2-insight-body">{t('zukunftText')}</div>
      </div>
    </div>
  )
}

/** Wochentag und Datum, kurz. */
function datumText(datum: string): string {
  // Mittag als Anker, wie ueberall (siehe lib/datum.ts).
  const d = new Date(`${datum}T12:00:00`)
  return d.toLocaleDateString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}
