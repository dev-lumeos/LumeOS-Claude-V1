'use client'
// ════════════════════════════════════════════════════════════════════
// DER EINKAUFSREITER — G-345
// ════════════════════════════════════════════════════════════════════
//
// **E-64, 2026-09-07:** drei Orte fuer Einkaufslisten. `[read]`
// **Hier der dritte: wo man ALLE sieht, offene und archivierte.**
//
// `[cmd]` **Vorbild ist `tab-inventory-echt.tsx`** (Supplements) —
// der Auftrag nennt es: dieselbe Machart.
//
// `[cmd]` **Gemessen am 2026-09-07: drei Listen auf `dev`**, alle aus
// Rezepten, zusammen 11 Posten. **Niemand zeigte sie.**
import * as React from 'react'
import { Card, Icon, Pill } from '@lumeos/ui'

import { EinkaufslisteModal } from './einkaufsliste-modal'
import { listeHolen } from './einkaufsliste-aktionen'
// `[cmd]` **NUR TYPEN** — der Leseweg zieht `next/headers` mit
// (G-74, G-79, G-97).
import type {
  Einkaufsliste, EinkaufslisteKurz,
} from '../../../lib/nutrition/einkaufsliste-lesen'

/** Woher eine Liste stammt, in Worten. */
const HERKUNFT: Record<string, string> = {
  recipe: 'aus einem Rezept',
  meal_plan: 'aus einer Planwoche',
  manual: 'selbst angelegt',
  supplement_reorder: 'Nachbestellung',
}

/** `2026-09-01T12:47:46Z` zu `1.9.` */
function tagKurz(iso: string): string {
  const [d] = iso.split('T')
  const teile = (d ?? '').split('-')
  return teile.length === 3
    ? `${Number(teile[2])}.${Number(teile[1])}.`
    : iso.slice(0, 10)
}

export function EinkaufTab({ listen }: { listen: EinkaufslisteKurz[] }) {
  const [offen, setOffen] = React.useState<Einkaufsliste | null>(null)
  const [laeuft, setLaeuft] = React.useState<string | null>(null)
  // `[read]` **Archivierte sind zu, nicht weg** — der Reiter zeigt
  // sie auf Wunsch. **Das ist der Sinn des Archivierens** (E-64).
  const [zeigeArchiv, setZeigeArchiv] = React.useState(false)

  const aktiv = listen.filter(l => l.status !== 'archived')
  const archiv = listen.filter(l => l.status === 'archived')
  const sichtbar = zeigeArchiv ? archiv : aktiv

  async function oeffnen(id: string) {
    setLaeuft(id)
    try {
      setOffen(await listeHolen(id))
    } finally {
      setLaeuft(null)
    }
  }

  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      <Card
        title="Einkaufslisten"
        sub={`${aktiv.length} offen · ${archiv.length} archiviert`}
        actions={(
          <button
            type="button" className="v2-btn v2-btn-sm"
            data-probe="archiv-umschalten"
            onClick={() => setZeigeArchiv(v => !v)}
          >
            {zeigeArchiv ? 'Offene zeigen' : 'Archiv zeigen'}
          </button>
        )}
      >
        {sichtbar.length === 0 ? (
          <p className="v2-muted" style={{ fontSize: 12, margin: 0, lineHeight: 1.6 }}>
            {zeigeArchiv
              ? 'Noch nichts archiviert.'
              : <>Keine offene Liste. Eine entsteht im <strong>Planner</strong> an
                  der Woche oder bei einem <strong>Rezept</strong>.</>}
          </p>
        ) : (
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {sichtbar.map(l => {
              const fertig = l.posten > 0 && l.abgehakt === l.posten
              return (
                <button
                  key={l.id} type="button"
                  data-probe="listen-zeile"
                  className="v2-zeile-knopf"
                  disabled={laeuft === l.id}
                  onClick={() => void oeffnen(l.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', textAlign: 'left', padding: '8px 6px',
                    borderBottom: '1px solid var(--border)',
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  <Icon name="bookmark" className="v2-ic v2-ic-sm" />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                      {l.name}
                    </span>
                    <span className="v2-dim" style={{
                      display: 'block', fontSize: 10.5, marginTop: 2,
                    }}>
                      {HERKUNFT[l.source_type] ?? l.source_type}
                      {' · '}{tagKurz(l.created_at)}
                    </span>
                  </span>
                  {/* `[read]` **Die Zahl sagt, wie weit** — nicht
                      *,,fertig" als Urteil, sondern abgehakt von
                      gesamt. */}
                  <span className="v2-num v2-dim" style={{ fontSize: 11.5 }}>
                    {l.abgehakt}/{l.posten}
                  </span>
                  {fertig && <Pill variant="acc">vollständig</Pill>}
                  {l.status === 'archived' && <Pill>archiviert</Pill>}
                </button>
              )
            })}
          </div>
        )}
      </Card>

      {/* `[read]` **Dasselbe Fenster wie im Planner** — drei Orte,
          eine Ansicht. */}
      {offen && (
        <EinkaufslisteModal
          liste={offen}
          onClose={() => setOffen(null)}
          onGeaendert={() => { /* die Seite laedt beim Schliessen neu */ }}
        />
      )}
    </div>
  )
}
