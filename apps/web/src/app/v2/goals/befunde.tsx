// G-628 Teil 2 — die Befunde von `ziel_grenzen_pruefen`, geteilt von „Ziel setzen"
// und dem Planer (G-629).
//
// `[read]` **Bewusst ohne `'use client'`:** die Komponente hat keine Hooks und
// wird nur INNERHALB von Client-Komponenten gerendert (ziel-setzen.tsx,
// plan-seite.tsx). Ihr `Set` geht deshalb nie ueber die Grenze Server → Client,
// gegen die A-60 (`client-grenze.test.ts`) wacht — dort kaeme es leer an.
import * as React from 'react'

import type { Pruefung } from '../../../lib/goals/zielpruefung'

/**
 * G-628 Teil 2 — die Befunde der Pruefung (Dossier 8.2): Sperre rot mit
 * Satz und dem Grad, der sie freigibt; Warnung mit Pflicht-Haken.
 * `[read]` **Text und Schluessel kommen unveraendert aus der Funktion.**
 */
export function Befunde({ pruefung, bestaetigt, setBestaetigt }: {
  pruefung: Pruefung | null
  bestaetigt: Set<string>
  setBestaetigt: React.Dispatch<React.SetStateAction<Set<string>>>
}) {
  if (!pruefung) return <div className="v2-dim" data-pruefung-stand="laeuft" style={{ fontSize: 11 }}>Prüfungen nach Grad …</div>
  if (pruefung.stand === 'nicht_eingespielt') {
    return (
      <div className="v2-dim" data-pruefung-stand="nicht_eingespielt" style={{ fontSize: 11 }}>
        Die Prüfungen nach Erfahrungsgrad sind noch nicht eingespielt (G-626) — es wird nichts geprüft.
      </div>
    )
  }
  if (pruefung.stand === 'fehler') {
    return (
      <div data-pruefung-stand="fehler" style={{ fontSize: 11.5, color: 'var(--neg)' }}>
        Die Prüfung ist fehlgeschlagen: {pruefung.text}
      </div>
    )
  }
  if (pruefung.befunde.length === 0) return null
  return (
    <div className="v2-col-gap" style={{ gap: 6 }} data-pruefung-stand="geprueft">
      {pruefung.befunde.map(b => (
        <div key={b.schluessel} data-befund={b.schluessel} data-befund-art={b.art}
             style={{
               padding: '8px 10px', borderRadius: 6, fontSize: 11.5, lineHeight: 1.5,
               background: b.art === 'sperre'
                 ? 'color-mix(in oklch, var(--neg) 8%, var(--surface))'
                 : 'color-mix(in oklch, var(--warn) 10%, var(--surface))',
               border: `1px solid color-mix(in oklch, ${b.art === 'sperre' ? 'var(--neg)' : 'var(--warn)'} 35%, var(--border))`,
             }}>
          <strong>{b.art === 'sperre' ? 'Gesperrt:' : 'Warnung:'}</strong> {b.hinweis}
          {b.art === 'sperre' && (
            <span data-befund-frei> {b.freiAb ? `Frei ab ${b.freiAb}.` : 'Für keinen Grad frei.'}</span>
          )}
          {b.art === 'warnung' && (
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4, cursor: 'pointer' }}>
              <input type="checkbox" data-befund-haken={b.schluessel} checked={bestaetigt.has(b.schluessel)}
                     onChange={e => setBestaetigt(s => {
                       const n = new Set(s)
                       if (e.target.checked) n.add(b.schluessel)
                       else n.delete(b.schluessel)
                       return n
                     })} />
              verstanden
            </label>
          )}
        </div>
      ))}
    </div>
  )
}
