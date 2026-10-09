// G-630 — die Warnung ohne aktives Ziel, eine Fassung fuer Today,
// Nutrition und Goals.
//
// `[read]` **Tom 2026-10-08:** *„erhaltung aktiv aber klare warnung dass
// kein goal aktiv ist, der user muss wissen dass er planlos laeuft"*.
// Entwurf `docs/spezifikation/goals-ziel-setzen/entwurf/Main.dc.html`,
// Zustand „kein Ziel".
//
// `[read]` **Ohne Hooks und ohne Serverimport** — sie steht in Server- und
// Client-Baeumen (A-30). Den Weg (Link oder Knoepfe) gibt der Aufrufer.
import * as React from 'react'
import Link from 'next/link'
import type { Route } from 'next'

import { ohneZielSatz, type Herkunft } from '../../lib/profile/zielwerte-hindernis'
import { PHASENARTEN } from '../../lib/goals/phase-regeln'

const zahl = (n: number) => Math.round(n).toLocaleString('de-DE')
const datumDe = (iso: string) => iso.split('-').reverse().join('.')

/** G-637: die Phasenluecke, wie `ziel_ohne_laufende_phase_am` sie liefert. */
export type Luecke = { title: string | null; letzte_phase_ende: string | null; recommended_next: string | null }

/** Der Satz zur Luecke — Punkt G-637: Titel, seit wann, und was zu tun ist. */
export function lueckenSatz(l: Luecke): string {
  const wer = l.title ? `„${l.title}“` : 'Dein Ziel'
  const seit = l.letzte_phase_ende ? ` seit ${datumDe(l.letzte_phase_ende)}` : ''
  return `${wer} ist aktiv, hat aber${seit} keine laufende Phase – du läufst auf Erhaltung.`
}

export function KeinZielWarnung({ herkunft, kcal, protein, ruhend, luecke = null, weg }: {
  herkunft: Herkunft | null | undefined
  kcal: number | null
  protein: number | null
  ruhend: { title: string } | null
  luecke?: Luecke | null
  /** Ohne Angabe: ein Link in den Goals-Reiter. */
  weg?: React.ReactNode
}) {
  const ohnePhase = herkunft === 'ziel_ohne_laufende_phase'
  const satz = ohnePhase && luecke ? lueckenSatz(luecke) : ohneZielSatz(herkunft)
  if (!satz) return null
  const empfohlen = luecke?.recommended_next
    ? PHASENARTEN.find(p => p.id === luecke.recommended_next)?.name ?? null : null
  return (
    <div role="status" data-kein-ziel={herkunft} style={{
      display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 14px', borderRadius: 8, fontSize: 12.5,
      background: 'color-mix(in oklch, var(--neg) 9%, var(--surface))',
      border: '1px solid color-mix(in oklch, var(--neg) 35%, var(--border))',
    }}>
      <strong style={{ color: 'var(--neg)', fontSize: 13.5 }}>{satz}</strong>
      <span className="v2-dim">
        {kcal !== null && <>Tagesziel <span className="v2-num">{zahl(kcal)}</span> kcal (Erhaltung aus deinem TDEE)
          {protein !== null && <> · <span className="v2-num">{zahl(protein)}</span> g Protein</>}. </>}
        {ruhend && <>„{ruhend.title}“ ruht. </>}
        {ohnePhase
          ? <>Ohne laufende Phase gibt es kein Tempo und keine Anpassung.{empfohlen && <> Empfohlen als nächste Phase: {empfohlen}.</>}</>
          : 'Ohne Ziel gibt es keinen Plan, keine Prognose und keine Anpassung.'}
      </span>
      <div>
        {weg ?? (ohnePhase ? (
          <Link href={'/v2/goals?tab=phase' as Route} className="v2-link" data-kein-ziel-weg="phase">
            Nächste Phase wählen
          </Link>
        ) : (
          <Link href={'/v2/goals' as Route} className="v2-link" data-kein-ziel-weg>
            {ruhend ? `„${ruhend.title}“ fortsetzen oder neues Ziel setzen` : 'Ziel setzen'}
          </Link>
        ))}
      </div>
    </div>
  )
}
