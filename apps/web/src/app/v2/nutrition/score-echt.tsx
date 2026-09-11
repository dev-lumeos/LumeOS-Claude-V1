// Der Nutrition score, angebunden — G-412/A1.
//
// ══ DIE FORM IST DIE DER ATTRAPPE ══════════════════════════════════
//
// `[read]` **Ring, Formelspalte, drei Zeilen darunter** — dieselbe
// Bauform wie `NutritionScoreCard` in `diary-entwurf.tsx`.
// `[read]` **Was sich aendert, sind die ZAHLEN:** sie kommen aus
// `nutrition.daily_summary` und dem Profil, nicht aus dem Entwurf.
//
// `[cmd]` **Und die Zeile *„Source of level: fest im Entwurf · liest
// kein Profil"* faellt weg** — hier wird das Profil gelesen.
//
// ══ ZWEI GRENZEN, BEIDE GEMESSEN ═══════════════════════════════════
//
// `[cmd]` **1 — Kein Ballaststoffziel.** Der fuenfte Anteil (0,15)
// ist nicht rechenbar; die Zeile steht da und sagt warum.
//
// `[cmd]` **2 — Fuer `pro` ist kein Stufenfaktor entschieden**
// (G-228), und `dev@lumeos.app` steht auf `pro`. `[read]` **Dann
// gibt es keinen Score, sondern den Grund** — die Entscheidung dazu
// stammt aus G-283 und wird hier nur benutzt.
import { Card, Pill, Ring, Row } from '@lumeos/ui'

// `[cmd]` **Aus `lib/`, NICHT aus `diary-entwurf.tsx`** — die traegt
// `'use client'`, und ein Wert-Import ueber diese Grenze wirft zur
// Laufzeit (gemessen: `stufenFaktor is not a function`, 0 Karten).
import {
  stufenFaktor, stufeGilt,
  STUFE_OFFEN_SATZ, STUFE_UNBEKANNT_SATZ,
} from '../../../lib/nutrition/stufenfaktor'
import type { ScoreStand } from '../../../lib/nutrition/score-read'

/** Zwei Nachkommastellen, wie die Vorlage sie zeigt. */
function komma(n: number): string {
  return n.toFixed(2)
}

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

  const stufe = stand.stufe
  // `[read]` **Ohne Stufe im Profil gibt es keinen Faktor** — und
  // damit keinen Score. **Kein Rueckfall auf einen Vorgabewert**
  // (G-283).
  const faktor = stufe ? stufenFaktor(stufe) : null

  // `[cmd]` **Der Score wird aus den GERECHNETEN Anteilen gebildet
  // und auf deren Gewicht normiert** — sonst zoege der fehlende
  // Ballaststoffanteil (0,15) den Wert um 15 Punkte nach unten, ohne
  // dass der Nutzer etwas falsch gemacht haette.
  const gerechnet = stand.anteile.filter(a => a.deckung !== null)
  const roh = stand.gewichtGerechnet > 0
    ? gerechnet.reduce((s, a) => s + (a.deckung ?? 0) * a.gewicht, 0)
      / stand.gewichtGerechnet
    : null

  // `[read]` **`nutritionScore()` erwartet alle fuenf Anteile** — hier
  // ist einer nicht rechenbar, also waere jeder Aufruf eine Luege
  // ueber den fuenften. `[cmd]` **Stattdessen dieselbe Rechnung mit
  // dem normierten Rohwert:** `roh × Faktor`, gerundet wie dort.
  const score = roh !== null && faktor !== null
    ? Math.round(roh * faktor * 100) / 100
    : null

  const band = score === null
    ? { l: 'offen', c: 'var(--fg-dim)' }
    : score >= 80
      ? { l: 'ok', c: 'var(--pos)' }
      : score >= 50
        ? { l: 'warn', c: 'var(--warn)' }
        : { l: 'block', c: 'var(--neg)' }

  const offenerGrund = !stufe
    ? 'Keine Erfahrungsstufe im Profil — ohne sie gibt es keinen Faktor '
      + 'und damit keinen Score.'
    : faktor === null
      ? (stufeGilt(stufe) ? STUFE_OFFEN_SATZ : STUFE_UNBEKANNT_SATZ)
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
              value={Math.round(score * 100)}
              max={100}
              color={band.c}
              label="score"
              size={88}
              stroke={7}
            />
          )}
        <div style={{ flex: 1 }}>
          {/* `[read]` **Die Formelspalte der Vorlage, mit echten
              Deckungen** — und wo eine fehlt, steht der Grund statt
              einer Zahl. */}
          <div className="v2-dim v2-num" style={{ fontSize: 10.5, lineHeight: 1.7 }}>
            {stand.anteile.map(a => (
              <div key={a.code}>
                <span style={{ display: 'inline-block', minWidth: 52 }}>{a.label}</span>
                {a.deckung !== null
                  ? `${komma(a.deckung)} × ${komma(a.gewicht)}`
                  : <span title={a.grund}>— × {komma(a.gewicht)}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Row
        label="Level multiplier"
        value={!stufe
          ? 'keine Stufe im Profil'
          : faktor !== null
            ? `${stufe} · ×${faktor}`
            : stufeGilt(stufe)
              ? `${stufe} · offen (G-228)`
              : `${stufe} · unbekannt`}
      />
      <Row label="Thresholds" value="ok ≥ 80 · warn 50–79 · block < 50" />
      {/* `[cmd]` **G-412: gelesen, nicht fest verdrahtet** —
          `public.profiles.experience_level`. */}
      <Row label="Source of level" value="public.profiles.experience_level" />
      {/* `[cmd]` **Der fuenfte Anteil ist nicht rechenbar** — und das
          steht da, statt eine Ballaststoffgrenze zu erfinden. */}
      <Row
        label="Gewicht gerechnet"
        value={`${komma(stand.gewichtGerechnet)} von 1.00`}
        sub={stand.gewichtGerechnet < 1
          ? 'Ballaststoffe: kein Ziel im Schema'
          : undefined}
      />
    </Card>
  )
}
