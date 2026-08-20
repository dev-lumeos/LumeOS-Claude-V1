'use client'

// Die Kopfkachel des Adaptive-TDEE-Tabs — **echte Werte.**
//
// FORM: `theme-v1/module-goals-pro.jsx:491-574` (die Kopfzeile) — links
// die grosse Zahl mit `EMA α`, rechts vier Zeilen mit Formelgrundlage,
// Delta, Zufuhrschnitt und Gewichtsänderung. INHALT:
// `goals.adaptive_tdee`.
//
// **BEIDE ZAHLEN BLEIBEN SICHTBAR, MIT IHRER HERKUNFT.** `[read]` Der
// Auftrag GO-16: *„Beide bleiben sichtbar, mit ihrer Herkunft — der
// Mockup zeigt ‚Formula baseline' und ‚Adaptive TDEE' nebeneinander,
// und das ist richtig."*
//
// **UND DIE ANZEIGE VERSCHLEIERT NICHTS.** `[cmd]` Zwei Dinge, die die
// Attrappe verschweigt und die hier stehen:
//
//   1. **Der adaptive Wert ist heute `null`.** Die Funktion verlangt
//      `complete_intake_days >= window_days`
//      (`113_goal_milestones_adaptive_tdee.sql:172`) — alle 14 Tage mit
//      vollständiger Zufuhr. `dev@lumeos.app` hat 13. `status` steht
//      auf `insufficient_intake_days`, und genau das zeigt die Kachel:
//      **die Bedingung, nicht eine ersatzweise Zahl.**
//
//   2. **`alpha = 0.3` heisst: der adaptive Wert bleibt zu 70 % an der
//      Formel.** `[read]` Der Auftrag: *„Nicht ändern — aber wenn die
//      Anzeige es verschleiert, melden."* Die Kachel schreibt es aus,
//      statt nur `α=0.3` hinzuschreiben; wer das Kürzel nicht kennt,
//      liest sonst eine Eigenständigkeit, die die Zahl nicht hat.
//      Offen seit GO-15, Toms Entscheidung steht aus.
import * as React from 'react'
import { Card, Pill, Row } from '@lumeos/ui'

import type { AdaptiverTdee } from '../../../lib/goals/lesen'

/** Was die Statuswerte der Funktion auf Deutsch heissen. */
const STATUS_TEXT: Record<string, string> = {
  ok: 'belastbar',
  insufficient_intake_days: 'nicht genug vollstaendige Zufuhrtage',
  insufficient_weight_measurements: 'nicht genug Gewichtsmessungen',
  insufficient_span: 'Messzeitraum zu kurz',
  no_profile: 'kein Profil',
}

function z(n: number | null | undefined, stellen = 0): string {
  return n == null ? '—' : n.toFixed(stellen)
}

export function TdeeKopf({ t }: { t: AdaptiverTdee | null }) {
  if (!t) {
    return (
      <Card title="Adaptive TDEE">
        <div className="v2-dim" style={{ fontSize: 11.5, padding: '14px 0' }}>
          Keine Daten fuer den adaptiven Gesamtumsatz.
        </div>
      </Card>
    )
  }

  const hat = t.adaptive_tdee_kcal != null
  const fehlendeTage = t.window_days != null && t.complete_intake_days != null
    ? t.window_days - t.complete_intake_days
    : null

  return (
    <Card>
      <div className="v2-goals-tdee-kopf">
        <div>
          <div className="v2-eyebrow">Adaptive TDEE</div>
          {hat ? (
            <>
              <div className="v2-num" style={{
                fontSize: 34, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1,
              }}>
                {t.adaptive_tdee_kcal!.toLocaleString('de-DE', { maximumFractionDigits: 0 })}
              </div>
              <div className="v2-dim v2-mono" style={{ fontSize: 11, marginTop: 4 }}>
                {`kcal / day · EMA α=${t.alpha ?? '—'}`}
              </div>
            </>
          ) : (
            <>
              {/* Kein Ersatzwert. Die Bedingung steht da, wo die Zahl
                  staende — wer hier eine Zahl saehe, hielte sie fuer
                  gemessen. */}
              <div className="v2-num" style={{
                fontSize: 34, fontWeight: 600, letterSpacing: '-0.03em',
                lineHeight: 1, color: 'var(--fg-dim)',
              }}>—</div>
              <div style={{ marginTop: 6 }}>
                <Pill variant="warn">
                  {STATUS_TEXT[t.status ?? ''] ?? t.status ?? 'nicht belastbar'}
                </Pill>
              </div>
            </>
          )}
        </div>

        <div className="v2-goals-tdee-trenner" />

        <div style={{ flex: 1, minWidth: 0 }}>
          <Row
            label="Formula baseline (Mifflin × Aktivitaetsfaktor)"
            value={t.formula_tdee_kcal != null
              ? `${t.formula_tdee_kcal.toLocaleString('de-DE', { maximumFractionDigits: 0 })} kcal`
              : '—'}
          />
          <Row
            label="Adaptive delta"
            value={t.delta_to_formula_kcal != null
              ? `${t.delta_to_formula_kcal > 0 ? '+' : ''}${t.delta_to_formula_kcal.toFixed(0)} kcal`
              : '—'}
          />
          <Row
            label={`Zufuhrschnitt (${z(t.window_days)} Tage)`}
            value={t.avg_intake_kcal != null
              ? `${t.avg_intake_kcal.toLocaleString('de-DE', { maximumFractionDigits: 0 })} kcal`
              : '—'}
          />
          <Row
            label="Gewicht Δ im Zeitraum"
            value={t.weight_delta_kg != null ? `${t.weight_delta_kg > 0 ? '+' : ''}${t.weight_delta_kg.toFixed(3)} kg` : '—'}
          />
        </div>
      </div>

      <div className="v2-divider" />

      {/* Warum die Zahl fehlt — mit der Zahl, die fehlt. */}
      {!hat && (
        <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55, marginBottom: 8 }}>
          {`Der adaptive Wert braucht ${z(t.window_days)} von ${z(t.window_days)} Tagen mit `}
          {`vollstaendiger Zufuhr; vorliegen ${z(t.complete_intake_days)}`}
          {fehlendeTage != null && fehlendeTage > 0 ? ` (es fehlen ${fehlendeTage})` : ''}
          {`. Gewichtsmessungen im Zeitraum: ${z(t.weight_measurement_count)}. `}
          <strong>Die Formelgrundlage steht daneben und ist gerechnet, nicht geschaetzt.</strong>
        </div>
      )}

      {/* `[read]` Der Glaettungsfaktor ausgeschrieben — GO-15 offen. */}
      <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
        {t.alpha != null ? (
          <>
            {/* G-79: Der Satz endete bis hierher mit „er bleibt damit
                nahe an der Formel". `[cmd]` Seit C-119 ist
                `alpha = 1,0` — der adaptive Wert IST die Messung, und
                von einer Glaettung bleibt nichts. Der Zusatz stimmte
                nur fuer alpha < 1 und ist deshalb weg. */}
            {t.alpha >= 1
              ? `EMA-Glaettung α = ${t.alpha}: keine Glaettung — der adaptive Wert ist der gemessene. `
              : `EMA-Glaettung α = ${t.alpha}: der adaptive Wert uebernimmt je Schritt `
                + `${Math.round(t.alpha * 100)} % aus der Messung und behaelt `
                + `${Math.round((1 - t.alpha) * 100)} % des Vorwerts. `}
          </>
        ) : null}
        {`Energiedichte ${z(t.kcal_per_kg)} kcal/kg · Zeitraum ${t.period_start ?? '—'} bis ${t.period_end ?? '—'} · `}
        {`Vertrauen ${t.confidence ?? '—'}${t.reliable ? '' : ' · nicht belastbar'}.`}
      </div>
    </Card>
  )
}
