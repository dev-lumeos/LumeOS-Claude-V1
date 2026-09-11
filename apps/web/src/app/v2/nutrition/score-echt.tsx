// Der Nutrition score, angebunden — G-412/A1, G-417/A1-A3.
//
// ══ DIE FORM IST DIE DER ATTRAPPE ══════════════════════════════════
//
// `[read]` **Ring, Formelspalte, drei Zeilen darunter** — dieselbe
// Bauform wie `NutritionScoreCard` in `diary-entwurf.tsx`.
// `[read]` **Was sich aendert, sind die ZAHLEN:** sie kommen aus
// `nutrition.daily_summary` und dem Profil, nicht aus dem Entwurf.
//
// ══ DIESE KARTE RECHNET NICHT ══════════════════════════════════════
//
// `[cmd]` **Bis G-417 stand hier eine zweite Rechnung** — `roh ×
// Faktor`, mit eigener Deckelung und eigener Normierung.
// `[cmd]` **Jetzt kommt das Ergebnis fertig aus `@lumeos/scoring`.**
//
// `[read]` **Eine Anzeige, die selbst rechnet, laeuft irgendwann
// gegen die Quelle** — und niemand sieht es, weil beide Zahlen
// plausibel aussehen.
//
// ══ BEIDE SPERREN SIND GEFALLEN ════════════════════════════════════
//
// `[cmd]` **1 — Das Ballaststoffziel.** `goals.nutrition_targets.
// fiber_g` ist seit C-464 da, **`dev@lumeos.app` hat 30,0 g.**
// `[cmd]` **Gemessen: Gewicht 0,85 -> 1,00.**
//
// `[cmd]` **2 — Der Stufenfaktor fuer `pro`.** `[cmd]` **E-80
// entscheidet ihn:** `beginner 0,75 · advanced 0,90 · pro 1,00 ·
// elite 1,10`. **Gebaut in `packages/scoring/src/nutrition.ts`**, dem
// Ort, den `SPEC_09_SCORING.md:11` nennt.
//
// `[read]` **Damit zeigt die Karte eine ZAHL** — vorher zwei Gruende.
import { Card, Pill, Ring, Row } from '@lumeos/ui'

// `[cmd]` **Aus dem Paket, NICHT aus `diary-entwurf.tsx`** — die
// traegt `'use client'`, und ein Wert-Import ueber diese Grenze wirft
// zur Laufzeit (gemessen: `stufenFaktor is not a function`, 0 Karten).
import { STUFEN_FAKTOR } from '@lumeos/scoring'

import type { ScoreStand } from '../../../lib/nutrition/score-read'

/** Zwei Nachkommastellen, wie die Vorlage sie zeigt. */
function komma(n: number): string {
  return n.toFixed(2)
}

/** Die vier Stufen als Satz — fuer den Fall, dass eine unbekannt ist. */
const BEKANNTE_STUFEN = Object.keys(STUFEN_FAKTOR).join(' · ')

export function ScoreEcht({ stand }: { stand: ScoreStand }) {
  if (stand.fehler) {
    return (
      <Card title="Nutrition score" sub="aus nutrition.daily_summary">
        <p className="v2-muted" style={{ fontSize: 11.5 }}>
          Nicht geladen: {stand.fehler}
        </p>
      </Card>
    )
  }

  const { score, status, stufe, faktor } = stand

  const band = status === 'offen'
    ? { l: 'offen', c: 'var(--fg-dim)' }
    : status === 'ok'
      ? { l: 'ok', c: 'var(--pos)' }
      : status === 'warn'
        ? { l: 'warn', c: 'var(--warn)' }
        : { l: 'block', c: 'var(--neg)' }

  // `[read]` **Wo keine Zahl steht, steht der Grund** — und der Grund
  // nennt, was fehlt, nicht dass etwas fehlt.
  const offenerGrund = !stufe
    ? 'Keine Erfahrungsstufe im Profil — ohne sie gibt es keinen Faktor '
      + 'und damit keinen Score.'
    : faktor === null
      ? `Die Stufe „${stufe}" kennt E-80 nicht — bekannt sind ${BEKANNTE_STUFEN}.`
      : 'Für diesen Tag liegen keine Werte vor.'

  return (
    <Card
      title="Nutrition score"
      sub="aus nutrition.daily_summary · deterministisch"
      actions={(
        <Pill style={{
          borderColor: `color-mix(in srgb, ${band.c} 35%, var(--border))`,
          color: band.c,
        }}>
          {band.l}
        </Pill>
      )}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
        {score === null
          ? (
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5, flex: 1 }}>
              {offenerGrund}
            </div>
          )
          : (
            <Ring
              value={score}
              max={100}
              color={band.c}
              label="score"
              size={88}
              stroke={7}
            />
          )}
        <div style={{ flex: 1 }}>
          {/* `[read]` **Die Formelspalte der Vorlage, mit echten
              Erfuellungen** — und wo eine fehlt, steht der Grund statt
              einer Zahl. */}
          <div className="v2-dim v2-num" style={{ fontSize: 10.5, lineHeight: 1.7 }}>
            {stand.anteile.map(a => (
              <div key={a.makro}>
                <span style={{ display: 'inline-block', minWidth: 52 }}>{a.makro}</span>
                {a.erfuellung !== null
                  ? `${komma(a.erfuellung)} × ${komma(a.gewicht)}`
                  : <span title={a.grund}>— × {komma(a.gewicht)}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* `[cmd]` **E-80, gebaut in `packages/scoring`** — vier Stufen,
          vier Faktoren, kein Rueckfall auf einen geratenen Wert. */}
      <Row
        label="Level multiplier"
        value={!stufe
          ? 'keine Stufe im Profil'
          : faktor !== null
            ? `${stufe} · ×${komma(faktor)}`
            : `${stufe} · unbekannt`}
        sub={faktor !== null ? 'E-80 · packages/scoring' : undefined}
      />
      <Row label="Thresholds" value="ok ≥ 80 · warn 50–79 · block < 50" />
      {/* `[cmd]` **G-412: gelesen, nicht fest verdrahtet** —
          `public.profiles.experience_level`. */}
      <Row label="Source of level" value="public.profiles.experience_level" />
      <Row
        label="Gewicht gerechnet"
        value={`${komma(stand.gewichtGerechnet)} von 1.00`}
        {...(stand.gewichtGerechnet < 1
          ? {
            sub: stand.anteile
              .filter(a => a.erfuellung === null)
              .map(a => `${a.makro}: ${a.grund}`)
              .join(' · '),
          }
          : {})}
      />
    </Card>
  )
}
