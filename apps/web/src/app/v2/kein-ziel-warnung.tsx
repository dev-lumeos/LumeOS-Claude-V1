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

const zahl = (n: number) => Math.round(n).toLocaleString('de-DE')

export function KeinZielWarnung({ herkunft, kcal, protein, ruhend, weg }: {
  herkunft: Herkunft | null | undefined
  kcal: number | null
  protein: number | null
  ruhend: { title: string } | null
  /** Ohne Angabe: ein Link in den Goals-Reiter. */
  weg?: React.ReactNode
}) {
  const satz = ohneZielSatz(herkunft)
  if (!satz) return null
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
        Ohne Ziel gibt es keinen Plan, keine Prognose und keine Anpassung.
      </span>
      <div>
        {weg ?? (
          <Link href={'/v2/goals' as Route} className="v2-link" data-kein-ziel-weg>
            {ruhend ? `„${ruhend.title}“ fortsetzen oder neues Ziel setzen` : 'Ziel setzen'}
          </Link>
        )}
      </div>
    </div>
  )
}
