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
import type { StoredWaterLog } from '../../../lib/nutrition/water-model'

/**
 * Die Schnellmengen der Kachel (G-101).
 *
 * `[read]` **Tom, 2026-08-20:** *„Hydration erweitern 100ml/250ml/500ml
 * manuelle Eingabe."*
 *
 * `[cmd]` **Nicht `WATER_QUICK_AMOUNTS_ML`** — die Konstante fuehrt
 * `[250, 500, 750, 1000]` aus SPEC_04 und wird auch anderswo gelesen.
 * Toms Mengen sind andere, und eine geteilte Konstante fuer zwei
 * verschiedene Absichten waere die schlechtere Loesung.
 */
const SCHNELLMENGEN = [100, 250, 500] as const

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
  /** Die freie Eingabe in ml (G-101). */
  const [eigene, setEigene] = React.useState('')
  // G-117: die Historie des Tages — Toms Fehlklick-Argument: „ich kann
  // nichts anschauen oder womoeglich einen Fehlklick korrigieren."
  const [zeigeListe, setZeigeListe] = React.useState(false)
  const [eintraege, setEintraege] = React.useState<StoredWaterLog[] | null>(null)
  const [loeschKandidat, setLoeschKandidat] = React.useState<StoredWaterLog | null>(null)
  const tag = frisch ?? geladen

  const ladeListe = React.useCallback(async () => {
    try {
      const a = await fetch(`/api/nutrition/water?datum=${datum}&liste=1`)
      const daten = await a.json()
      if (!a.ok) throw new Error(daten?.error ?? 'Liste nicht lesbar.')
      setEintraege(daten.eintraege as StoredWaterLog[])
      setFrisch(daten.tag as HydrationDay)
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    }
  }, [datum])

  async function loeschen(eintrag: StoredWaterLog) {
    setLaeuft(true)
    setFehler(null)
    try {
      const a = await fetch(
        `/api/nutrition/water?id=${encodeURIComponent(eintrag.id)}&datum=${datum}`,
        { method: 'DELETE' },
      )
      const daten = await a.json()
      if (!a.ok) throw new Error(daten?.error ?? 'Loeschen fehlgeschlagen.')
      setEintraege(daten.eintraege as StoredWaterLog[])
      setFrisch(daten.tag as HydrationDay)
      setLoeschKandidat(null)
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

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

  async function nachtragen(menge: number, quelle: 'quick_add' | 'manual' = 'quick_add') {
    setLaeuft(true)
    setFehler(null)
    try {
      const a = await fetch('/api/nutrition/water', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ entry_date: datum, amount_ml: menge, source: quelle }),
      })
      const daten = await a.json()
      if (!a.ok) throw new Error(daten?.error ?? 'Eintrag fehlgeschlagen.')
      setFrisch(daten.tag as HydrationDay)
      if (quelle === 'manual') setEigene('')
      // G-117: die offene Historie zeigt den neuen Eintrag sofort.
      if (zeigeListe) void ladeListe()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  const eigeneMenge = Number(eigene.replace(',', '.'))
  const eigeneGueltig = Number.isFinite(eigeneMenge) && eigeneMenge > 0

  return (
    <Card
      title="Hydration"
      sub="Today"
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

      {/*
        G-101, Tom 2026-08-20: „Hydration erweitern 100ml/250ml/500ml
        manuelle Eingabe."

        `[cmd]` Der Schreibweg lag bereits vollstaendig vor
        (`/api/nutrition/water`, `addWaterLog`, 181 Eintraege) — es gab
        nur **einen** Knopf, und der trug die erste Menge aus
        `WATER_QUICK_AMOUNTS_ML` (250 ml).

        `[read]` Die Konstante bleibt unangetastet: sie kommt aus
        SPEC_04 und wird auch anderswo gelesen. Die drei Mengen hier
        sind Toms, und die freie Eingabe steht daneben — beides
        schreibt in denselben Pfad, nur mit anderer `source`.
      */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        marginTop: 12, flexWrap: 'wrap',
      }}>
        {SCHNELLMENGEN.map(menge => (
          <button
            key={menge}
            type="button"
            className="v2-btn"
            disabled={laeuft}
            onClick={() => void nachtragen(menge)}
          >
            <Icon name="plus" className="v2-ic v2-ic-sm" />{menge} ml
          </button>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
          <input
            className="v2-feld"
            style={{ width: 78, textAlign: 'right' }}
            inputMode="decimal"
            placeholder="ml"
            aria-label="Menge in Millilitern"
            value={eigene}
            disabled={laeuft}
            onChange={e => setEigene(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && eigeneGueltig) void nachtragen(eigeneMenge, 'manual')
            }}
          />
          <button
            type="button"
            className="v2-btn v2-btn-primary"
            disabled={laeuft || !eigeneGueltig}
            title={eigeneGueltig ? undefined : 'Menge groesser als 0 eingeben'}
            onClick={() => void nachtragen(eigeneMenge, 'manual')}
          >
            Eintragen
          </button>
        </span>
      </div>

      {/* G-117: die Historie des Tages — ansehen und Fehlklicks
          korrigieren. Loeschen mit Sicherheitsabfrage nach dem
          Daumen-Muster (G-67): sie NENNT den Eintrag, statt nur
          „wirklich?" zu fragen. */}
      <div style={{ marginTop: 10 }}>
        <button
          type="button"
          className="v2-btn v2-btn-sm"
          aria-expanded={zeigeListe}
          onClick={() => {
            const naechster = !zeigeListe
            setZeigeListe(naechster)
            if (naechster && eintraege === null) void ladeListe()
          }}
        >
          <Icon name="refresh" className="v2-ic v2-ic-sm" />
          {zeigeListe ? 'Eintraege verbergen' : 'Eintraege ansehen'}
        </button>

        {zeigeListe && (
          eintraege === null ? (
            <p className="v2-dim" style={{ fontSize: 11, marginTop: 8 }}>laedt …</p>
          ) : eintraege.length === 0 ? (
            <p className="v2-dim" style={{ fontSize: 11, marginTop: 8 }}>
              Fuer diesen Tag ist nichts Getrunkenes erfasst — der Balken
              oben kann trotzdem gefuellt sein (Wasser aus Lebensmitteln).
            </p>
          ) : (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {eintraege.map(e => {
                const zeit = e.logged_at
                  ? new Date(e.logged_at).toLocaleTimeString('de-DE', {
                      hour: '2-digit', minute: '2-digit',
                    })
                  : '—'
                const quelle = e.source === 'quick_add'
                  ? 'Schnellknopf'
                  : e.source === 'manual' ? 'Eingabe' : e.source
                return loeschKandidat?.id === e.id ? (
                  <div
                    key={e.id} role="alertdialog"
                    aria-label={`${ml(e.amount_ml)} ml loeschen?`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                      padding: '6px 10px', borderRadius: 6, fontSize: 11.5,
                      border: '1px solid color-mix(in oklch, var(--neg) 40%, var(--border))',
                      background: 'color-mix(in oklch, var(--neg) 7%, transparent)',
                    }}
                  >
                    <span style={{ flex: 1 }}>
                      <strong>{ml(e.amount_ml)} ml</strong> von {zeit} loeschen?
                      Das laesst sich nicht rueckgaengig machen.
                    </span>
                    <button
                      type="button" className="v2-btn v2-btn-sm"
                      disabled={laeuft}
                      style={{ color: 'var(--neg)' }}
                      onClick={() => void loeschen(e)}
                    >Loeschen</button>
                    <button
                      type="button" className="v2-btn v2-btn-sm"
                      onClick={() => setLoeschKandidat(null)}
                    >Abbrechen</button>
                  </div>
                ) : (
                  <div
                    key={e.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '5px 10px', borderRadius: 6, fontSize: 11.5,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                    }}
                  >
                    <span className="v2-num" style={{ color: 'var(--fg-subtle)', width: 38 }}>{zeit}</span>
                    <span className="v2-num" style={{ fontWeight: 600 }}>{ml(e.amount_ml)} ml</span>
                    <span className="v2-dim" style={{ fontSize: 10.5 }}>{quelle}</span>
                    <button
                      type="button" className="v2-icon-btn"
                      style={{ marginLeft: 'auto' }}
                      aria-label={`${ml(e.amount_ml)} ml von ${zeit} loeschen`}
                      onClick={() => setLoeschKandidat(e)}
                    >
                      <Icon name="trash" className="v2-ic v2-ic-sm" />
                    </button>
                  </div>
                )
              })}
            </div>
          )
        )}
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
