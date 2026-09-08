// Der Aktivitaetsstrom — G-152.
//
// `[cmd]` **QUELLE: `theme-v1/module-dashboard.jsx:105`** — die
// Kachel „Activity". **Der Mockup zeigt EINE gemischte Liste**,
// neueste zuerst: Zeit, modulfarbenes Zeichen, Text.
//
// `[read]` **Nicht je Modul getrennt** — das war die Frage im
// Auftrag, und der Mockup beantwortet sie: eine Liste, in der die
// Module durch ihre Farbe unterscheidbar sind.
//
// ## Was die Sicht nicht kann
//
// `[cmd]` **`public.activity_stream` traegt NUR `summary_de`** —
// kein `_en`, kein `_th`. **Die App ist dreisprachig.** Gemessen und
// gemeldet (G-152, A5); hier steht der deutsche Text, weil es keinen
// anderen gibt.
import * as React from 'react'
import { Card, Icon } from '@lumeos/ui'

import type { StromStand } from '../../../lib/dashboard/lesen'

/**
 * Die Zeichen je Modul.
 *
 * `[read]` **Eine feste Zuordnung, kein Cast** — `Icon` nimmt eine
 * Vereinigung von Namen, und `module` aus der Sicht ist freier Text.
 * **Ein unbekanntes Modul bekommt ein neutrales Zeichen**, keinen
 * Absturz.
 */
const ZEICHEN = {
  nutrition: 'nutrition', recovery: 'recovery', training: 'training',
  supplements: 'supplements', medical: 'medical',
} as const

type ZeichenName = (typeof ZEICHEN)[keyof typeof ZEICHEN]

function zeichenFuer(modul: string): ZeichenName | 'alert' {
  return (ZEICHEN as Record<string, ZeichenName>)[modul] ?? 'alert'
}

/** Die Modulfarben, wie der Mockup sie setzt. */
const FARBE: Record<string, string> = {
  nutrition: 'var(--acc-nutri)',
  recovery: 'var(--acc-recov)',
  training: 'var(--acc-train)',
  supplements: 'var(--acc-suppl)',
  medical: 'var(--acc-medic)',
}

/**
 * Die Zeitspalte des Mockups: `08:42` für heute, sonst mit Datum.
 *
 * `[read]` **Der Mockup schreibt „Yesterday 21:14"** — das braucht
 * einen Bezugstag, und den hat nur die Seite. Deshalb kommt er als
 * Parameter, statt hier `new Date()` zu rufen (Hydrationsfalle).
 */
function zeitText(datum: string, zeit: string | null, heute: string): string {
  if (datum === heute) return zeit ?? '—'
  const tag = datum.slice(8, 10) + '.' + datum.slice(5, 7) + '.'
  return zeit ? `${tag} ${zeit}` : tag
}

/**
 * Die Kachel „Aktivität".
 *
 * `[read]` **Kein Leerhinweis, wenn Zeilen da sind; kein erfundener
 * Eintrag, wenn keine da sind** (E-72).
 */
export function Aktivitaetsstrom({ stand, heute }: {
  stand: StromStand; heute: string
}) {
  const mehr = stand.gesamt - stand.ereignisse.length
  return (
    <Card
      title="Aktivität"
      sub={stand.ereignisse.length > 0
        ? `${stand.ereignisse.length} von ${stand.gesamt} · neueste zuerst`
        : 'activity_stream'}
    >
      {stand.fehler && (
        <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
          activity_stream meldet: {stand.fehler}
        </div>
      )}

      {!stand.fehler && stand.ereignisse.length === 0 && (
        // `[read]` **Ein benannter Leerhinweis, keine nackte Null**
        // (E-72): er sagt, WAS leer ist, nicht nur DASS.
        <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
          Für dieses Konto steht noch kein Ereignis in
          <span className="v2-mono"> activity_stream</span>. Der Strom
          entsteht aus den Modulen — sobald dort etwas erfasst ist,
          erscheint es hier.
        </div>
      )}

      {stand.ereignisse.length > 0 && (
        <div className="v2-col-gap" style={{ gap: 0 }}>
          {stand.ereignisse.map((e, i) => (
            <div
              key={`${e.datum}-${e.zeit ?? i}-${i}`}
              style={{
                display: 'flex', gap: 10, padding: '9px 0',
                borderBottom: i < stand.ereignisse.length - 1
                  ? '1px solid var(--border)' : 'none',
              }}
            >
              <div className="v2-num" style={{
                fontSize: 10, color: 'var(--fg-dim)', width: 64,
                paddingTop: 1, flexShrink: 0,
              }}>
                {zeitText(e.datum, e.zeit, heute)}
              </div>
              <div style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                display: 'grid', placeItems: 'center',
                background: `color-mix(in oklch, ${FARBE[e.modul] ?? 'var(--fg-dim)'} 18%, transparent)`,
                border: `1px solid color-mix(in oklch, ${FARBE[e.modul] ?? 'var(--fg-dim)'} 35%, transparent)`,
                color: FARBE[e.modul] ?? 'var(--fg-dim)',
              }}>
                <Icon name={zeichenFuer(e.modul)} className="v2-ic"
                      style={{ width: 10, height: 10, strokeWidth: 2 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--fg)' }}>{e.text}</div>
                <div className="v2-mono" style={{ fontSize: 10, color: 'var(--fg-muted)' }}>
                  {e.modul} · {e.art}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {mehr > 0 && (
        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 8 }}>
          {mehr} weitere Ereignisse in der Sicht — die Kachel zeigt die
          neuesten {stand.ereignisse.length}.
        </div>
      )}

      {stand.ereignisse.length > 0 && (
        // `[cmd]` **Die Sicht hat nur `summary_de`** — der Vermerk
        // steht an der Kachel, damit die Luecke sichtbar bleibt.
        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 4 }}>
          Die Texte kommen als <span className="v2-mono">summary_de</span> aus
          der Sicht — nur auf Deutsch, auch in EN und TH.
        </div>
      )}
    </Card>
  )
}
