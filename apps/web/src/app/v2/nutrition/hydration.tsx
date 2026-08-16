'use client'

// Die Hydration-Kachel — angebunden, deshalb ohne Attrappenmarke.
//
// AUFBAU AUS DER VORLAGE (module-nutrition.jsx:232-251): grosse Zahl,
// Balken, zwoelf Glaeser, darunter „x of 12 glasses" und der Vergleich
// mit dem Schnitt. Reihenfolge und Anordnung unveraendert.
//
// DIE EINE STELLE, AN DER DIESE KACHEL UEBER DIE VORLAGE HINAUSGEHT:
// `[read]` Tom, 2026-08-16: „Wir sollten das farblich irgendwie trennen
// von Food und von Trinken."
//
// `[cmd]` Der Fall ist real — am 16.08. stehen 1.242,7 ml KOMPLETT aus
// Lebensmitteln, getrunken wurde nichts. Die Vorlage kennt nur einen
// Balken und eine einfarbige Gläserleiste; sie wuerde daraus „1,2 von
// 3,0 L" machen und verschweigen, dass kein Schluck Wasser dabei war.
//
// Zwei Farben, beide aus vorhandenen Tokens — keine neue erfunden:
//   getrunken       var(--acc-nutri), der Modulakzent, voll
//   aus Lebensmitteln  derselbe Ton, auf 40 % gemischt
// Der gedaempfte Ton sagt „gehoert dazu, ist aber nicht dasselbe".
import * as React from 'react'
import { Card, Icon } from '@lumeos/ui'

import type { HydrationDay } from '../../../lib/nutrition/hydration-day-read'
import { WATER_QUICK_AMOUNTS_ML } from '../../../lib/nutrition/water-model'

const FARBE_GETRUNKEN = 'var(--acc-nutri)'
const FARBE_ESSEN = 'color-mix(in oklch, var(--acc-nutri) 40%, var(--surface-2))'

/** Millilitermenge lesbar: 1.242,7 ml bzw. 1,24 L ab einem Liter. */
function ml(v: number): string {
  return v.toLocaleString('de-DE', { maximumFractionDigits: 1 })
}

export function HydrationKachel({
  tag: geladen, datum,
}: { tag: HydrationDay | null; datum: string }) {
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  // Nach dem Nachtragen kommt der neu gerechnete Tag aus der Antwort —
  // kein zweiter Aufruf, keine eigene Rechnung im Browser.
  const [frisch, setFrisch] = React.useState<HydrationDay | null>(null)
  const tag = frisch ?? geladen

  if (!tag) {
    return (
      <Card title="Hydration" sub="Today">
        <p className="v2-muted" style={{ fontSize: 12 }}>
          Fuer diesen Tag liegt nichts vor.
        </p>
      </Card>
    )
  }

  const ziel = tag.target_ml
  // Anteile am Balken. Ohne Ziel bleibt der Balken leer statt sich an
  // einer erfundenen Bezugsgroesse zu fuellen.
  const nenner = ziel ?? 0
  const anteil = (wert: number) => (nenner > 0 ? Math.min((wert / nenner) * 100, 100) : 0)
  const breiteGetrunken = anteil(tag.logged_ml)
  // Der Essensanteil sitzt HINTER dem getrunkenen; zusammen duerfen sie
  // 100 % nicht ueberschreiten, sonst laeuft der Balken aus der Kachel.
  const breiteEssen = Math.max(0, Math.min(anteil(tag.total_ml) - breiteGetrunken, 100 - breiteGetrunken))

  // Die zwoelf Glaeser der Vorlage. Wie viele davon getrunken sind,
  // entscheidet die Farbe — der Rest bis `glasses_total` kommt aus dem
  // Essen.
  const glaeserZiel = tag.glasses_target ?? 12
  const glaeserGetrunken = tag.glass_size_ml > 0
    ? Math.min(Math.floor(tag.logged_ml / tag.glass_size_ml), glaeserZiel)
    : 0
  const glaeserGesamt = Math.min(tag.glasses_total, glaeserZiel)

  async function nachtragen(menge: number) {
    setLaeuft(true)
    setFehler(null)
    try {
      const a = await fetch('/api/nutrition/water', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ entry_date: datum, amount_ml: menge, source: 'quick_add' }),
      })
      const daten = await a.json()
      if (!a.ok) throw new Error(daten?.error ?? 'Eintrag fehlgeschlagen.')
      setFrisch(daten.tag as HydrationDay)
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  return (
    <Card
      title="Hydration"
      sub="Today"
      actions={
        <button
          type="button"
          className="v2-btn v2-btn-ghost"
          style={{ height: 22, fontSize: 11, padding: '0 8px' }}
          disabled={laeuft}
          onClick={() => nachtragen(WATER_QUICK_AMOUNTS_ML[0])}
        >
          <Icon name="plus" className="v2-ic v2-ic-sm" /> +{WATER_QUICK_AMOUNTS_ML[0]}ml
        </button>
      }
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
        <span className="v2-num" style={{ fontSize: 28, fontWeight: 500 }}>
          {(tag.total_ml / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 })}
        </span>
        <span className="v2-dim" style={{ fontSize: 12 }}>
          / {ziel === null ? '—' : (ziel / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} L
        </span>
        {tag.progress_pct !== null && (
          <span className="v2-num" style={{ fontSize: 12, marginLeft: 'auto', color: 'var(--fg-muted)' }}>
            {Math.round(tag.progress_pct)}%
          </span>
        )}
      </div>

      {/* Der Balken der Vorlage, aber zweifarbig. */}
      <div style={{
        display: 'flex', height: 8, borderRadius: 999,
        background: 'var(--surface-2)', overflow: 'hidden',
      }}>
        <div style={{ width: `${breiteGetrunken}%`, background: FARBE_GETRUNKEN }} />
        <div style={{ width: `${breiteEssen}%`, background: FARBE_ESSEN }} />
      </div>

      {/* Welcher Teil was ist — sonst sind zwei Farben nur zwei Farben. */}
      <div style={{
        display: 'flex', gap: 14, marginTop: 8, fontSize: 10.5,
        color: 'var(--fg-muted)', flexWrap: 'wrap',
      }}>
        <span className="v2-row-gap">
          <span className="v2-dot" style={{ background: FARBE_GETRUNKEN }} />
          getrunken <span className="v2-num" style={{ color: 'var(--fg)' }}>{ml(tag.logged_ml)} ml</span>
        </span>
        <span className="v2-row-gap">
          <span className="v2-dot" style={{ background: FARBE_ESSEN }} />
          aus Lebensmitteln <span className="v2-num" style={{ color: 'var(--fg)' }}>{ml(tag.food_ml)} ml</span>
        </span>
      </div>

      {/* Zwoelf Glaeser, in denselben zwei Farben. */}
      <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
        {Array.from({ length: glaeserZiel }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 20, borderRadius: 2,
            background: i < glaeserGetrunken
              ? FARBE_GETRUNKEN
              : i < glaeserGesamt ? FARBE_ESSEN : 'var(--surface-2)',
          }} />
        ))}
      </div>

      <div style={{
        marginTop: 6, fontSize: 10, color: 'var(--fg-dim)',
        display: 'flex', justifyContent: 'space-between', gap: 8,
      }}>
        <span>{glaeserGesamt} of {glaeserZiel} glasses</span>
        {tag.behind_14d_avg_pct !== null && tag.behind_14d_avg_pct > 0 ? (
          <span className="v2-num">{Math.round(tag.behind_14d_avg_pct)}% behind 14d avg</span>
        ) : tag.avg_14d_total_ml !== null ? (
          <span className="v2-num">14d avg {ml(tag.avg_14d_total_ml)} ml</span>
        ) : null}
      </div>

      {/* Regel wie bei den Naehrstoffen: ein Fehlzaehler ueber null
          macht die Summe zu einer Untergrenze, nicht zur Wahrheit. */}
      {tag.food_ml_missing > 0 && (
        <p className="v2-hinweis" style={{ marginTop: 10 }}>
          <Icon name="alert" className="v2-ic v2-ic-sm" />
          <span>
            <strong>{tag.food_ml_missing} Position(en) ohne Wasserwert.</strong>{' '}
            Der Anteil aus Lebensmitteln ist eine Untergrenze.
          </span>
        </p>
      )}

      {ziel === null && (
        <p className="v2-hinweis" style={{ marginTop: 10 }}>
          <Icon name="alert" className="v2-ic v2-ic-sm" />
          <span>Kein Ziel ableitbar — dafuer fehlt das Koerpergewicht im Profil.</span>
        </p>
      )}

      {fehler && (
        <p className="v2-hinweis" style={{ marginTop: 10, color: 'var(--neg)' }}>
          <Icon name="alert" className="v2-ic v2-ic-sm" />
          <span>{fehler}</span>
        </p>
      )}
    </Card>
  )
}
