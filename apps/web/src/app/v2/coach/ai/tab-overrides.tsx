'use client'

// Ein Tab: „Coach overrides".
//
// QUELLE: theme-v1/module-coach-meta.jsx:161-198 (`BuddyCoachOverrides`),
// Datenkonstante :150-159 (`COACH_OVERRIDES`).
//
// ─────────────────────────────────────────────────────────────────
// `[cmd]` WARUM EIN BUDDY-TAB IN EINER COACH-DATEI STEHT
//
// Diese Kachel gehoert zur Ansicht von Buddy, ihre Vorlage steht aber
// in KEINER `module-buddy-*.jsx`. Gemessen, nicht vermutet:
//
//   grep -rn "BuddyCoachOverrides" theme-v1/
//     module-buddy.jsx:132       {tab === "overrides" && window.BuddyCoachOverrides && <window.BuddyCoachOverrides/>}
//     module-coach-meta.jsx:161  window.BuddyCoachOverrides = () => (
//
// Genau zwei Treffer: der Rahmen von Buddy ruft, die Coach-Datei
// definiert. Kein weiterer Setzer, keine V2-Weiche.
//
// **Das ist kein Versehen der Vorlage, sondern ihre Bauweise.** Die
// Entwurfsdateien laufen als lose Skripte in einem Browser und sehen
// sich ueber `window`. Wer wo definiert, ist damit rein thematisch
// entschieden — und thematisch ist diese Kachel eine
// Coach-Angelegenheit: sie zeigt, was Coaches an Buddy verstellt haben.
// Der Rahmen von Buddy zeigt sie nur an.
//
// Fuer die Uebernahme heisst das zweierlei:
//   1. Die Komponente liegt hier, im `ai/`-Ordner, weil der Rahmen von
//      Buddy sie einhaengt (`ansicht.tsx`, Tab „overrides").
//   2. Ihre Daten liegen NICHT hier. `COACH_OVERRIDES` ist bei der
//      Uebernahme des Moduls Human Coaches (G-40) bereits nach
//      `apps/web/src/app/v2/coach/daten.ts:437` gewandert — zusammen mit
//      den uebrigen fuenf Konstanten aus `module-coach-meta.jsx`, wie
//      der Kopf jener Datei (`daten.ts:10-11`) auffuehrt.
//
// `[cmd]` DER IMPORT GEHT DESHALB EINEN ORDNER HOCH: `../daten` statt
// `./daten`. Das ist Absicht und kein Versehen. Die Liste zweimal zu
// fuehren hiesse, sie zweimal zu pflegen — und beim ersten Zahlendreher
// zeigten Coach-Modul und Buddy-Modul verschiedene Werte fuer dieselbe
// Sache. Eine Liste, ein Ort. Dass die Ordnergrenze dabei ueberschritten
// wird, spiegelt genau die Lage der Vorlage: die Kachel steht zwischen
// den beiden Modulfamilien.
// ─────────────────────────────────────────────────────────────────
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript, strict; kein `any`.
//   2. Klassen auf `v2-`-Praefix, die `<table>` in `v2-tbl-wrap`.
//   3. `window.COACH_OVERRIDES` -> Import aus `../daten`.
//   4. `color-mix(in srgb, …)` -> `color-mix(in oklch, …)`.
//
// `[cmd]` `<Pill variant="">` kennt `PillVariant` (primitives.tsx:80)
// nicht — gueltig sind `pos | warn | neg | acc`. Die Vorlage benutzt
// hier `acc` und die Grundform ohne Variante; beides ist gueltig und
// bleibt unveraendert.
//
// `[cmd]` Alle gebrauchten Symbole liegen in icons.tsx: `coach`
// (icons.tsx:38). Nichts zu ersetzen.
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst. Die Vorlage hat in dieser Komponente keinen
// Zustand und keinen Knopf — sie ist reine Anzeige und bleibt es.
//
// `[cmd]` KEINE HYDRATIONSFALLE: null `Math.random()`, null `Date.now()`,
// null `new Date()`, null `Math.sin`.
//
// `[cmd]` ALLES IST ATTRAPPE. Ein Buddy-Schema gibt es nicht.
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

// [cmd] Ordnergrenze mit Absicht — Begruendung im Kopf dieser Datei.
import { COACH_OVERRIDES } from '../daten'
import { ATTRAPPE } from './ansicht'

// ═══ TAB · COACH OVERRIDES ═══════════════════════════════════════
// [cmd] module-coach-meta.jsx:161-198.
export function BuddyCoachOverrides() {
  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      {/* Banner — module-coach-meta.jsx:163-172. */}
      <div
        style={{
          display: 'flex', gap: 12, padding: 14,
          background: 'color-mix(in oklch, var(--acc-coach) 5%, var(--surface))',
          border: '1px solid color-mix(in oklch, var(--acc-coach) 22%, var(--border))',
          borderRadius: 8,
        }}
      >
        <Icon name="coach" className="v2-ic" style={{ color: 'var(--acc-coach)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>What your coaches changed about me</div>
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            A coach can tighten my behaviour for their domain — never loosen it past your own settings, and never past the nine safety rules.
            Everything they set is listed here.
          </div>
        </div>
      </div>

      {/* Die Tabelle — module-coach-meta.jsx:173-196. */}
      <Card attrappe={ATTRAPPE}>
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th style={{ width: 160 }}>Coach</th>
                <th style={{ width: 100 }}>Domain</th>
                <th style={{ width: 210 }}>Setting</th>
                <th style={{ width: 130 }}>Yours</th>
                <th style={{ width: 150 }}>Their override</th>
                <th style={{ width: 70 }}>Active</th>
              </tr>
            </thead>
            <tbody>
              {COACH_OVERRIDES.map((o, i) => (
                <tr key={i} style={{ opacity: o.active ? 1 : 0.55 }}>
                  <td>{o.coach}</td>
                  <td><Pill>{o.type}</Pill></td>
                  <td>
                    <div className="v2-mono" style={{ fontSize: 11 }}>{o.field}</div>
                    <div className="v2-muted" style={{ fontSize: 10.5, marginTop: 2, lineHeight: 1.4 }}>{o.why}</div>
                  </td>
                  <td className="v2-mono v2-muted" style={{ fontSize: 11 }}>{o.yours}</td>
                  <td className="v2-mono" style={{ fontSize: 11, color: 'var(--acc-coach)' }}>{o.theirs}</td>
                  <td>{o.active ? <Pill variant="acc">on</Pill> : <Pill>declined</Pill>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="v2-divider" />
        <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
          You can decline any override. Medical blocks are the exception — those come from the safety layer, not from Dr. Kessler personally.
        </div>
      </Card>
    </div>
  )
}
