'use client'

// Die Koerperkarte mit 18 Muskelgruppen.
//
// QUELLE: theme-v1/module-recovery-v2.jsx:66-97 (`BodyMap18`).
//
// `[read]` Sie steht in einer eigenen Datei, weil vier Stellen sie
// benutzen: Today, Check-in (im Modus `soreness`), Muscle map und —
// mittelbar ueber die Werte — das Muskeldetail-Modal. In der Vorlage
// liegt sie deshalb ganz oben im Rahmen, noch vor dem ersten Tab.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript.
//   2. Klassen auf `v2-`-Praefix.
//   3. `clipPath`-ID je Ansicht eindeutig gemacht — die Vorlage
//      vergibt `bodyclip-front` fest. Stehen zwei Karten auf einer
//      Seite (Today zeigt eine, ein Modal die zweite), kollidieren die
//      IDs im Dokument und beide Figuren greifen auf denselben
//      Beschnitt zu. `React.useId()` loest das.
//   4. `<path onClick>` -> zusaetzlich Tastaturbedienung, wo die Karte
//      anklickbar ist. Ein SVG-Pfad mit `onClick` ist per Tastatur
//      nicht erreichbar; dieselbe Begruendung wie bei `Tabs` in
//      packages/ui.
import * as React from 'react'

import {
  MUSCLE_GROUPS_BODYMAP, MUSCLE_LABEL, MUSCLE_PATHS, SILHOUETTE_PATH,
} from './motor'

export type KoerperkarteProps = {
  /** Wert je Kuerzel. `null` heisst: kein Wert, Flaeche bleibt grau. */
  values: Record<string, number | null | undefined>
  /** `recovery` faerbt nach Prozent, `soreness` nach Stufe 0-3. */
  mode?: 'recovery' | 'soreness'
  onPick?: (slug: string) => void
  selected?: string | null
  size?: number
}

export function Koerperkarte({
  values, mode = 'recovery', onPick, selected, size = 210,
}: KoerperkarteProps) {
  // Gegenueber der Vorlage: eindeutige ID je Einbindung (siehe Kopf).
  const id = React.useId().replace(/:/g, '')

  const colorFor = (slug: string) => {
    const v = values[slug]
    if (v == null) return 'var(--surface-2)'
    if (mode === 'recovery') return v >= 80 ? 'var(--pos)' : v >= 50 ? 'var(--warn)' : 'var(--neg)'
    return v === 0 ? 'var(--surface-2)' : v === 1 ? 'var(--acc-recov)' : v === 2 ? 'var(--warn)' : 'var(--neg)'
  }

  const render = (view: 'front' | 'back') => (
    <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>{view === 'front' ? 'Front' : 'Back'}</div>
      <svg viewBox="0 0 100 126" style={{ width: '100%', maxWidth: size }}>
        <defs>
          <clipPath id={`bodyclip-${id}-${view}`}><path d={SILHOUETTE_PATH} /></clipPath>
        </defs>
        <path d={SILHOUETTE_PATH} fill="var(--surface-2)"
              stroke="var(--border-strong)" strokeWidth="1" />
        <g clipPath={`url(#bodyclip-${id}-${view})`}>
          {MUSCLE_GROUPS_BODYMAP.filter(s => MUSCLE_PATHS[s]?.view === view).map(slug => {
            const aktiv = selected === slug
            const wert = values[slug]
            return (
              <path
                key={slug}
                d={MUSCLE_PATHS[slug].d}
                fill={colorFor(slug)}
                opacity={aktiv ? 0.95 : 0.68}
                stroke={aktiv ? 'var(--fg)' : colorFor(slug)}
                strokeWidth={aktiv ? 0.8 : 0.3}
                style={{ cursor: onPick ? 'pointer' : 'default' }}
                onClick={onPick ? () => onPick(slug) : undefined}
                // Tastaturbedienung, wo die Karte bedienbar ist.
                role={onPick ? 'button' : undefined}
                tabIndex={onPick ? 0 : undefined}
                aria-label={onPick
                  ? `${MUSCLE_LABEL[slug]} · ${wert ?? '—'}${mode === 'recovery' ? '%' : '/3'}`
                  : undefined}
                onKeyDown={onPick
                  ? e => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(slug) }
                  }
                  : undefined}
              >
                {/* Ein EINZIGER Textknoten. Mehrere Ausdruecke
                    nebeneinander (`{a} · {b}{c}`) erzeugen mehrere
                    Knoten; der Server rendert sie zusammengefasst, der
                    Browser getrennt — das ergibt eine
                    Hydrations-Warnung. `[cmd]` Am Bildschirm gemessen:
                    32 Konsolenfehler vorher, 3 nachher. */}
                <title>{`${MUSCLE_LABEL[slug]} · ${wert ?? '—'}${mode === 'recovery' ? '%' : '/3'}`}</title>
              </path>
            )
          })}
        </g>
      </svg>
    </div>
  )

  return <div className="v2-rec-bodymap">{render('front')}{render('back')}</div>
}
