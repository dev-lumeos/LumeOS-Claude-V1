'use client'

// Body metrics und Measurements — **echte Werte.**
//
// FORM: `theme-v1/module-goals.jsx:366-452` (Metrics, drei Kennzahlen
// mit Sparkline) und `:453-546` (Measurements, die Umfangstabelle).
// INHALT: `goals.body_measurements` (43 Zeilen) und
// `goals.body_circumferences` (7 Zeilen).
//
// **NUR BIS ZUM STICHTAG.** `[cmd]` Von 43 Messungen liegen **26 in
// der Zukunft** (bis 2026-09-13) — die Testdaten decken einen ganzen
// Zeitraum ab. Eine Kurve, die sie mitzeichnet, behauptet Messungen,
// die es noch nicht gibt. Der Lesepfad schneidet bei `heute()`, und
// **die Zahl der ausgelassenen steht in der Anzeige**, nicht nur im
// Bericht.
//
// **KEINE BEWERTUNG.** Die Attrappe schreibt an jede Kennzahl ein
// Urteil (`deltaVariant="pos"`, „All within 1 cm. Right-side dominance
// is consistent and small — within normal range"). `[read]` Das ist
// eine Aussage über einen Menschen. Hier steht die Änderung als Zahl
// mit Richtung; was sie bedeutet, sagt die Anzeige nicht.
import * as React from 'react'
import { Card, Row, Sparkline } from '@lumeos/ui'

import type { Koerpermessung, Umfangssatz } from '../../../lib/goals/lesen'

function z(n: number | null | undefined, stellen = 1): string {
  return n == null ? '—' : n.toFixed(stellen)
}

/**
 * Die zwölf Zeilen der Attrappe, auf die Spalten der Tabelle.
 *
 * `[cmd]` `MEASUREMENTS` (`daten.ts:142`) führt zwölf Einträge, davon
 * **einen** Unterarm. `goals.body_circumferences` führt **zwei**
 * (`forearm_left_cm`, `forearm_right_cm`). Beide werden gezeigt — es
 * wären sonst 13 statt 12 Zeilen, und das ist die eine Abweichung von
 * der Vorlage. Im Bericht.
 */
const UMFAENGE: Array<{ label: string; feld: keyof Umfangssatz }> = [
  { label: 'Neck', feld: 'neck_cm' },
  { label: 'Shoulders', feld: 'shoulders_cm' },
  { label: 'Chest', feld: 'chest_cm' },
  { label: 'Waist (navel)', feld: 'waist_cm' },
  { label: 'Hip', feld: 'hip_cm' },
  { label: 'Arm · right', feld: 'upper_arm_right_cm' },
  { label: 'Arm · left', feld: 'upper_arm_left_cm' },
  { label: 'Forearm · right', feld: 'forearm_right_cm' },
  { label: 'Forearm · left', feld: 'forearm_left_cm' },
  { label: 'Thigh · right', feld: 'thigh_right_cm' },
  { label: 'Thigh · left', feld: 'thigh_left_cm' },
  { label: 'Calf · right', feld: 'calf_right_cm' },
  { label: 'Calf · left', feld: 'calf_left_cm' },
]

/** Eine Kennzahl mit Verlauf. [cmd] module-goals.jsx:420-451. */
function MetrikKachel({ label, werte, einheit, farbe }: {
  label: string
  werte: Array<{ datum: string; wert: number | null }>
  einheit: string
  farbe: string
}) {
  const zahlen = werte.map(w => w.wert).filter((v): v is number => v != null)
  const aktuell = zahlen.length ? zahlen[zahlen.length - 1] : null
  const erst = zahlen.length ? zahlen[0] : null
  const delta = aktuell != null && erst != null ? aktuell - erst : null

  return (
    <Card>
      <div className="v2-eyebrow" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <span className="v2-num" style={{ fontSize: 24, fontWeight: 600 }}>
          {z(aktuell, 2)}
        </span>
        <span className="v2-dim" style={{ fontSize: 11 }}>{einheit}</span>
      </div>
      {/* Die Aenderung als Zahl mit Richtung — ohne Farbe fuer „gut". */}
      <div className="v2-dim v2-mono" style={{ fontSize: 10.5, marginBottom: 8 }}>
        {delta != null
          ? `${delta > 0 ? '+' : ''}${delta.toFixed(2)} ${einheit} über ${zahlen.length} Messungen`
          : 'zu wenig Messungen'}
      </div>
      {zahlen.length >= 2
        ? <Sparkline data={zahlen} color={farbe} h={40} />
        : <div className="v2-dim v2-mono" style={{ fontSize: 10 }}>—</div>}
    </Card>
  )
}

export function KoerperMetriken({ messungen, zukunft, stichtag }: {
  messungen: Koerpermessung[]
  zukunft: number
  stichtag: string
}) {
  const reihe = (feld: keyof Koerpermessung) =>
    messungen.map(m => ({ datum: m.measurement_date, wert: m[feld] as number | null }))

  return (
    <div>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 12, marginBottom: 14 }}>
        <MetrikKachel label="Weight" werte={reihe('weight_kg')} einheit="kg"
                      farbe="var(--acc-goals)" />
        <MetrikKachel label="Body fat" werte={reihe('body_fat_pct')} einheit="%"
                      farbe="var(--acc-suppl)" />
        <MetrikKachel label="Lean mass" werte={reihe('lean_mass_kg')} einheit="kg"
                      farbe="var(--acc-train)" />
      </div>

      <Card
        title="Messungen"
        sub={`${messungen.length} bis ${stichtag}`}
      >
        {messungen.length === 0 ? (
          <div className="v2-dim" style={{ fontSize: 11.5, padding: '14px 0' }}>
            Noch keine Koerpermessungen.
          </div>
        ) : (
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>Datum</th>
                  <th style={{ textAlign: 'right' }}>Gewicht</th>
                  <th style={{ textAlign: 'right' }}>Koerperfett</th>
                  <th style={{ textAlign: 'right' }}>Magermasse</th>
                  <th style={{ textAlign: 'right' }}>BMI</th>
                  <th style={{ textAlign: 'right' }}>FFMI</th>
                </tr>
              </thead>
              <tbody>
                {messungen.slice().reverse().slice(0, 14).map(m => (
                  <tr key={m.measurement_date}>
                    <td className="v2-num v2-muted">{m.measurement_date}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{z(m.weight_kg, 2)}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{z(m.body_fat_pct, 2)}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{z(m.lean_mass_kg, 2)}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{z(m.bmi, 2)}</td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>{z(m.ffmi, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Was NICHT gezeigt wird, und warum — mit der Zahl. */}
        {zukunft > 0 && (
          <>
            <div className="v2-divider" />
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
              {`${zukunft} weitere Messungen tragen ein Datum nach dem ${stichtag} und `}
              {'stehen deshalb nicht in der Kurve — sie waeren Messungen, die es '}
              {'noch nicht gibt. Sie bleiben in der Datenbank.'}
            </div>
          </>
        )}
        {messungen.length > 14 && (
          <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 6 }}>
            {`Tabelle zeigt die letzten 14 von ${messungen.length}; die Kurven nutzen alle.`}
          </div>
        )}
      </Card>
    </div>
  )
}

export function KoerperUmfaenge({ saetze, stichtag }: {
  saetze: Umfangssatz[]
  stichtag: string
}) {
  const juengster = saetze.length ? saetze[saetze.length - 1] : null
  const vorheriger = saetze.length > 1 ? saetze[saetze.length - 2] : null

  return (
    <div className="v2-grid-14">
      <Card
        title="Circumferences"
        sub={juengster ? `zuletzt ${juengster.measurement_date} · cm` : 'cm'}
      >
        {!juengster ? (
          <div className="v2-dim" style={{ fontSize: 11.5, padding: '14px 0' }}>
            Noch keine Umfangsmessung bis {stichtag}.
          </div>
        ) : (
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Stelle</th>
                  <th style={{ width: 90, textAlign: 'right' }}>Aktuell</th>
                  <th style={{ width: 90, textAlign: 'right' }}>Vorher</th>
                  <th style={{ width: 90, textAlign: 'right' }}>Δ</th>
                  <th style={{ width: 90 }}>Verlauf</th>
                </tr>
              </thead>
              <tbody>
                {UMFAENGE.map(({ label, feld }) => {
                  const jetzt = juengster[feld] as number | null
                  const vor = vorheriger ? vorheriger[feld] as number | null : null
                  const delta = jetzt != null && vor != null ? jetzt - vor : null
                  const verlauf = saetze
                    .map(s => s[feld] as number | null)
                    .filter((v): v is number => v != null)
                  return (
                    <tr key={feld}>
                      <td style={{ fontSize: 12.5 }}>{label}</td>
                      <td className="v2-num" style={{ textAlign: 'right', fontWeight: 500 }}>
                        {z(jetzt, 1)}
                      </td>
                      <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>
                        {z(vor, 1)}
                      </td>
                      <td className="v2-num v2-muted" style={{ textAlign: 'right' }}>
                        {delta != null ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}` : '—'}
                      </td>
                      <td style={{ padding: '4px 8px 4px 0' }}>
                        {verlauf.length >= 2
                          ? <Sparkline data={verlauf} color="var(--acc-goals)" h={18} />
                          : <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Seitenvergleich" sub="links gegen rechts">
          {juengster ? (
            <>
              {([
                ['Arme', 'upper_arm_right_cm', 'upper_arm_left_cm'],
                ['Unterarme', 'forearm_right_cm', 'forearm_left_cm'],
                ['Oberschenkel', 'thigh_right_cm', 'thigh_left_cm'],
                ['Waden', 'calf_right_cm', 'calf_left_cm'],
              ] as Array<[string, keyof Umfangssatz, keyof Umfangssatz]>).map(([l, r, li]) => {
                const rechts = juengster[r] as number | null
                const links = juengster[li] as number | null
                const d = rechts != null && links != null ? rechts - links : null
                return (
                  <Row
                    key={l} label={`${l} · R / L`}
                    value={rechts != null && links != null
                      ? `${z(rechts, 1)} / ${z(links, 1)} cm · ${d! > 0 ? '+' : ''}${d!.toFixed(1)}`
                      : '—'}
                  />
                )
              })}
              <div className="v2-divider" />
              {/* `[read]` Die Attrappe steht hier: „within normal range
                  for a right-handed athlete." Das ist eine Aussage
                  ueber einen Menschen — sie kommt nicht mit. */}
              <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
                Differenz rechts minus links, aus der juengsten Messung.
              </div>
            </>
          ) : (
            <div className="v2-dim" style={{ fontSize: 11.5 }}>Keine Messung.</div>
          )}
        </Card>

        <Card title="Messreihe" sub={`${saetze.length} Saetze bis ${stichtag}`}>
          {saetze.slice().reverse().map(s => (
            <Row
              key={s.measurement_date}
              label={s.measurement_date}
              value={`Taille ${z(s.waist_cm, 1)} · Brust ${z(s.chest_cm, 1)} cm`}
            />
          ))}
        </Card>
      </div>
    </div>
  )
}
