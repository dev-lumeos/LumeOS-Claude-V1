'use client'

// G-630 — die Steuerungskarte im Zustand „kein Ziel" (Entwurf
// `Main.dc.html`). `[read]` **Hier ist der Weg ein Knopf, kein Link:**
// „Ziel setzen" oeffnet den Dialog, „Fortsetzen" setzt das ruhende Ziel
// wieder aktiv — nur den Status, die Phase bleibt gespeichert.
import * as React from 'react'
import { useRouter } from 'next/navigation'

import { KeinZielWarnung } from '../kein-ziel-warnung'
import { zielSpeichern } from './ziel-aktionen'
import { ohneZiel } from '../../../lib/profile/zielwerte-hindernis'
import type { Zielwerte } from '../../../lib/profile/zielwerte-read'

export function SteuerungOhneZiel({ zielwerte, onZielSetzen }: {
  zielwerte: Zielwerte | null
  onZielSetzen: () => void
}) {
  const router = useRouter()
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  if (!zielwerte || !ohneZiel(zielwerte.herkunft)) return null
  const ruhend = zielwerte.ruhendes_ziel

  const fortsetzen = async () => {
    if (!ruhend) return
    setLaeuft(true); setFehler(null)
    const r = await zielSpeichern(ruhend.goal_id, { status: 'active' })
    setLaeuft(false)
    if (r.ok) router.refresh()
    else setFehler(r.fehler)
  }

  return (
    <div data-steuerung-ohne-ziel style={{ marginBottom: 14 }}>
      <KeinZielWarnung herkunft={zielwerte.herkunft} kcal={zielwerte.kcal} protein={zielwerte.protein_g}
                       ruhend={ruhend} weg={
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ruhend && (
            <button type="button" className="v2-btn v2-btn-primary v2-btn-sm" data-kein-ziel-fortsetzen
                    disabled={laeuft} onClick={() => { void fortsetzen() }}>
              {laeuft ? 'Setzt fort …' : `„${ruhend.title}“ fortsetzen`}
            </button>
          )}
          <button type="button" className={`v2-btn v2-btn-sm ${ruhend ? '' : 'v2-btn-primary'}`} data-kein-ziel-setzen
                  onClick={onZielSetzen}>Ziel setzen</button>
        </div>
      } />
      {fehler && <div data-kein-ziel-fehler style={{ marginTop: 6, fontSize: 11.5, color: 'var(--neg)' }}>{fehler}</div>}
    </div>
  )
}
