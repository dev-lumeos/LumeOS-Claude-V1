// ════════════════════════════════════════════════════════════════════
// OFFENE COACH-AKTIONEN IM TAGEBUCH — G-258, E-29
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Die echte Kachel.** Sie ersetzt `NutritionPendingActions`
// aus `diary-entwurf.tsx`, sobald gelesen wurde — **Muster G-90:** der
// Entwurf bleibt nur, solange gar nichts geladen wurde.
//
// `[read]` **A-30: kein Wertimport aus dem Leseweg.** Von
// `lib/coach/offene-aktionen` kommen nur Typen und reine Funktionen
// (`lageVon`, `fristSatz`) — kein `createSessionClient`, kein Aufruf.
// Das Laden geschieht in `page.tsx`, serverseitig.
import * as React from 'react'
import { Card, Pill, Empty } from '@lumeos/ui'

import {
  lageVon, fristSatz, LAGE_TEXT,
  type OffeneAktion, type OffeneAktionenStand, type AktionLage,
} from '../../../lib/coach/offene-aktionen'

/** Farbe je Lage — dieselbe Bedeutung wie ueberall in v2. */
const FARBE: Record<AktionLage, string> = {
  offen: 'var(--acc-nutri)',
  abgelaufen: 'var(--warn)',
  erledigt: 'var(--fg-dim)',
}

const PILLE: Record<AktionLage, 'acc' | 'warn' | undefined> = {
  offen: 'acc',
  abgelaufen: 'warn',
  erledigt: undefined,
}

const LAGE_LABEL: Record<AktionLage, string> = {
  offen: 'offen',
  abgelaufen: 'abgelaufen',
  erledigt: 'erledigt',
}

/**
 * Die Beschriftung einer Aktion.
 *
 * `[cmd]` **`preview` ist ein `jsonb`** und traegt, was der Coach
 * vorgeschlagen hat. `[read]` **Was darin steht, ist nicht garantiert**
 * — deshalb ein Rueckfall auf `action_type`, statt eine Struktur
 * vorauszusetzen, die niemand zugesichert hat.
 */
export function titelVon(a: OffeneAktion): string {
  const p = a.preview
  if (p) {
    for (const schluessel of ['title', 'titel', 'label', 'summary']) {
      const w = p[schluessel]
      if (typeof w === 'string' && w.trim()) return w.trim()
    }
  }
  // `adjust_macro_targets` -> `Adjust macro targets`
  const roh = a.action_type.replace(/_/g, ' ').trim()
  return roh ? roh.charAt(0).toUpperCase() + roh.slice(1) : 'Coach-Aktion'
}

export function NutritionPendingEcht({
  stand, jetzt,
}: {
  stand: OffeneAktionenStand
  /**
   * Die Zeit als Prop, nicht `new Date()` im Bauteil.
   *
   * `[read]` **Sonst rechnet der Server eine andere Minute als der
   * Browser**, und React bricht die Hydration ab — derselbe Fehler,
   * den `tab-insights.tsx` mit `Math.random()` hatte. **Und
   * pruefbar ist es nebenbei auch.**
   */
  jetzt: string
}) {
  // `[read]` **`gelesenUm` ist leer, wenn niemand angemeldet war.**
  // Dann gibt es auch keine Aktionen — aber ein `new Date('')` waere
  // `Invalid Date`, und jede Frist damit `NaN`. Der Rueckfall haelt die
  // Rechnung gueltig, statt sie stillschweigend falsch zu machen.
  const roh = new Date(jetzt)
  const zeit = Number.isNaN(roh.getTime()) ? new Date(0) : roh
  const mitLage = stand.aktionen.map(a => ({ a, lage: lageVon(a, zeit) }))

  // `[read]` **Offene zuerst, dann abgelaufene.** Wer eine Frist
  // verpasst hat, soll das sehen — aber nicht ueber dem, was noch
  // entschieden werden kann.
  const rang: Record<AktionLage, number> = { offen: 0, abgelaufen: 1, erledigt: 2 }
  mitLage.sort((x, y) => rang[x.lage] - rang[y.lage]
    || x.a.created_at.localeCompare(y.a.created_at))

  const offene = mitLage.filter(m => m.lage === 'offen').length
  const abgelaufene = mitLage.filter(m => m.lage === 'abgelaufen').length

  return (
    <Card
      title="Pending actions"
      sub={untertitel(offene, abgelaufene, stand)}
    >
      {stand.fehler ? (
        // `[read]` „Nicht geladen" ist nicht „nichts vorhanden" — der
        // Grund steht daneben, sonst sieht ein Fehler aus wie Leere.
        <Empty
          title="Nicht geladen"
          sub={stand.fehler}
          icon="alert"
        />
      ) : mitLage.length === 0 ? (
        <Empty
          title="Keine offenen Aktionen"
          sub="Schlägt dein Coach etwas vor, erscheint es hier."
        />
      ) : (
        <div className="v2-col-gap" style={{ gap: 6 }}>
          {mitLage.map(({ a, lage }) => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: 10,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 6,
            }}>
              <div style={{
                width: 3, alignSelf: 'stretch', background: FARBE[lage],
                borderRadius: 2,
              }} />
                {/* `[cmd]` **Tom, 2026-09-08: die Karte brach Wort fuer
                    Wort um.** `[read]` **Vier Elemente nebeneinander -
                    Balken, Text, Frist, Pille - passen in die schmale
                    rechte Spalte nicht.** `[read]` **Zwei Zeilen statt
                    vier Spalten.** */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 500, minWidth: 0 }}>
                      {titelVon(a)}
                    </span>
                    <span style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      <Pill variant={PILLE[lage]}>{LAGE_LABEL[lage]}</Pill>
                    </span>
                  </div>
                  <div className="v2-dim" style={{
                    fontSize: 10.5, marginTop: 3,
                    display: 'flex', gap: 8, flexWrap: 'wrap',
                  }}>
                    {LAGE_TEXT[lage] && <span>{LAGE_TEXT[lage]}</span>}
                    <span className="v2-num" style={{ fontSize: 9.5 }}>
                      {fristSatz(a, zeit)}
                    </span>
                  </div>
                </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

/**
 * Der Untertitel nennt die Lage, nicht nur eine Zahl.
 *
 * `[cmd]` **Der Befund aus C-354:** beide `dev`-Zeilen sind `pending`
 * mit vergangener Frist. **Ein Untertitel „2 open" waere damit
 * falsch** — offen ist keine.
 */
export function untertitel(
  offene: number, abgelaufene: number, stand: OffeneAktionenStand,
): string {
  if (stand.fehler) return 'nicht geladen'
  if (offene === 0 && abgelaufene === 0) return 'keine offenen'
  const teile: string[] = []
  if (offene > 0) teile.push(`${offene} offen`)
  if (abgelaufene > 0) teile.push(`${abgelaufene} abgelaufen`)
  return teile.join(' · ')
}
