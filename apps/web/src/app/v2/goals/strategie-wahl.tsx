'use client'

// Die Strategieauswahl — G-541/A3, A4.
//
// `[cmd]` **Die Vorlage lief:**
// `referenz/lumeos-2026/src/modules/goals/components/nutrition/GoalSelector.tsx`
// (248 Zeilen). **Uebernommen sind der Aufbau und die Regeln,
// nicht der Code:** die drei `simple` offen, `advanced` hinter einem
// Schalter, fuenf Reiter, `isGoalAvailable` als Sperre, `warnings`
// auf der Karte.
//
// `[cmd]` **Gemessen 2026-09-29: 3 simple, 14 advanced, 6
// Kategorien.**
//
// ── Die Grenze (A5) ────────────────────────────────────────────────
//
// `[read]` **Diese Datei zeigt und waehlt. Sie schreibt nicht.**
// `[cmd]` **`goal_phases.strategie_code` existiert als
// Fremdschluessel, aber `goals.goal_phase_start` hat keinen
// Parameter dafuer** — gemessen an `pg_get_function_arguments`. **Die
// Terminierung ist G-538 und liegt bei Codex, der Editor ist G-539.**
//
// `[read]` **Deshalb gibt es hier keinen Knopf, der dorthin zeigt.**
// Die Wahl wird gehalten und angezeigt — am Tag der Einspielung wird
// sie nur noch durchgereicht.
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import {
  REITER, strategienFuerReiter, einfacheStrategien, istWaehlbar,
  merkmale, tdeeProzent, type Reiter, type Profil,
} from '../../../lib/goals/strategie-regeln'
import type { Strategie } from '../../../lib/goals/strategie-read'
import { StrategieVorschau } from './strategie-vorschau'

/** Eine Zeile Kennzahl auf der Karte. */
function Kennzahl({ label, wert }: { label: string; wert: string }) {
  return (
    <span className="v2-dim" style={{ fontSize: 10.5 }}>
      {label} <span className="v2-num" style={{ color: 'var(--fg)' }}>{wert}</span>
    </span>
  )
}

/**
 * Eine Strategiekarte.
 *
 * `[cmd]` **`GoalSelector.tsx:168-247`** — Kopf mit Abzeichen,
 * Kennzahlenband, Merkmale, und unten ENTWEDER der Sperrgrund ODER
 * die erste Warnung ODER der Knopf (`:230-243`).
 *
 * `[read]` **Die Reihenfolge ist die Aussage:** eine gesperrte
 * Strategie zeigt den Grund STATT des Knopfes, nicht daneben.
 */
function StrategieKarte({ s, gewaehlt, profil, onWahl }: {
  s: Strategie
  gewaehlt: boolean
  profil: Profil
  onWahl: () => void
}) {
  const frei = istWaehlbar(s.requirements, profil)
  const m = merkmale(s)
  const tdee = tdeeProzent(s)

  return (
    <div data-strategie={s.code}
         data-strategie-gesperrt={frei.frei ? undefined : 'ja'}
         style={{
           display: 'flex', flexDirection: 'column',
           borderRadius: 9, padding: 12,
           background: gewaehlt
             ? 'color-mix(in oklch, var(--acc-goals) 10%, var(--surface))'
             : 'var(--surface)',
           border: `1px solid ${gewaehlt
             ? 'color-mix(in oklch, var(--acc-goals) 45%, var(--border))'
             : 'var(--border)'}`,
           opacity: frei.frei ? 1 : 0.6,
         }}>
      {/* [cmd] :202-206 — Titel und Abzeichen */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4,
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>
          {s.label}
        </span>
        {s.badge && (
          <span style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <Pill>{s.badge}</Pill>
          </span>
        )}
      </div>

      <div className="v2-dim" style={{
        fontSize: 10.5, lineHeight: 1.45, marginBottom: 8,
      }}>
        {s.description}
      </div>

      {/* ── Das Kennzahlenband ────────────────────────────────────
          [cmd] :209-219. `[read]` **Was `null` ist, fehlt hier
          ganz** — die Vorlage macht es genauso (`&&`), und eine
          erfundene Null waere eine Aussage (A2). Der Strich MIT
          Grund steht in der Vorschau, wo Platz dafuer ist. */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8,
      }}>
        {tdee !== null && <Kennzahl label="TDEE" wert={tdee} />}
        {s.weight_change_target_percent !== null && (
          <Kennzahl label="Rate"
                    wert={`${s.weight_change_target_percent > 0 ? '+' : ''}${s.weight_change_target_percent} %/Wo`} />
        )}
        {s.max_duration_weeks !== null && (
          <Kennzahl label="max" wert={`${s.max_duration_weeks} Wo`} />
        )}
      </div>

      {/* [cmd] :222-227 — die vier Merkmale */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10,
      }}>
        {m.length > 0
          ? m.map(x => <Pill key={x}>{x}</Pill>)
          : <span className="v2-dim" style={{ fontSize: 10 }}>
              Einfache Konfiguration
            </span>}
      </div>

      {/* ── Sperrgrund ODER Warnung ODER Knopf ────────────────────
          [cmd] :230-243 */}
      <div style={{ marginTop: 'auto' }}>
        {!frei.frei ? (
          <div data-strategie-grund className="v2-dim" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 10.5, padding: '7px 9px', borderRadius: 6,
            background: 'var(--surface-2)',
          }}>
            <Icon name="shield" className="v2-ic v2-ic-sm" />
            <span>{frei.grund}</span>
          </div>
        ) : (
          <>
            {s.warnings[0] && (
              <div data-strategie-warnung className="v2-dim" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 10.5, padding: '7px 9px', borderRadius: 6,
                marginBottom: 6,
                background: 'color-mix(in oklch, var(--warn) 12%, var(--surface))',
              }}>
                <Icon name="alert" className="v2-ic v2-ic-sm" />
                <span>{s.warnings[0]}</span>
              </div>
            )}
            <button type="button"
                    data-strategie-waehlen={s.code}
                    className={`v2-btn v2-btn-sm ${gewaehlt ? 'v2-btn-primary' : ''}`}
                    style={{ width: '100%' }}
                    onClick={onWahl}>
              {gewaehlt ? 'Gewaehlt' : 'Auswaehlen'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Die Auswahl mit Reitern und Schalter.
 *
 * @param strategien  Alle 17 Zeilen, serverseitig geladen.
 * @param profil      Fuer die Sperre (A4).
 */
export function StrategieWahl({ strategien, profil }: {
  strategien: Strategie[]
  profil: Profil
}) {
  const [advanced, setAdvanced] = React.useState(false)
  const [reiter, setReiter] = React.useState<Reiter>('fat_loss')
  const [wahl, setWahl] = React.useState<string | null>(null)

  const einfach = einfacheStrategien(strategien)
  const imReiter = strategienFuerReiter(strategien, reiter)
  const gewaehlt = strategien.find(s => s.code === wahl) ?? null

  return (
    <Card title="Strategie waehlen"
          sub="Wie die Phase gefahren wird — Faktor, Rate und Makros">
      {/* ── Die drei einfachen, ohne Schalter ──────────────────────
          [cmd] GoalSelector.tsx:55-63 */}
      {!advanced && (
        <div className="v2-col-gap" data-strategie-einfach style={{ gap: 8 }}>
          {einfach.map(s => (
            <StrategieKarte key={s.code} s={s} profil={profil}
                            gewaehlt={s.code === wahl}
                            onWahl={() => setWahl(s.code === wahl ? null : s.code)} />
          ))}
        </div>
      )}

      {/* [cmd] :66-79 — der Schalter */}
      <button type="button" data-strategie-advanced
              aria-pressed={advanced}
              className="v2-btn"
              style={{
                width: '100%', marginTop: advanced ? 0 : 10,
                marginBottom: advanced ? 10 : 0,
                borderStyle: 'dashed', justifyContent: 'space-between',
              }}
              onClick={() => setAdvanced(v => !v)}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 11.5, fontWeight: 600 }}>
            Advanced Strategien
          </span>
          <Pill>{strategien.filter(s => s.tier === 'advanced').length}</Pill>
        </span>
        <Icon name={advanced ? 'chevron_up' : 'chevron_down'}
              className="v2-ic v2-ic-sm" />
      </button>

      {advanced && (
        <div data-strategie-advanced-offen>
          {/* [cmd] :84-97 — die fuenf Reiter */}
          <div style={{
            display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10,
            borderBottom: '1px solid var(--border)', paddingBottom: 8,
          }}>
            {REITER.map(r => {
              const an = r.id === reiter
              return (
                <button key={r.id} type="button" data-strategie-reiter={r.id}
                        aria-pressed={an}
                        onClick={() => setReiter(r.id)}
                        style={{
                          padding: '5px 10px', borderRadius: 6, fontSize: 11,
                          cursor: 'pointer',
                          background: an
                            ? 'color-mix(in oklch, var(--acc-goals) 14%, var(--surface))'
                            : 'transparent',
                          border: `1px solid ${an
                            ? 'color-mix(in oklch, var(--acc-goals) 40%, var(--border))'
                            : 'var(--border)'}`,
                          color: 'var(--fg)',
                          fontWeight: an ? 600 : 400,
                        }}>
                  {r.name}
                </button>
              )
            })}
          </div>

          {/* [cmd] :109-118 — das Raster, mit Leersatz (E-72) */}
          <div data-strategie-raster style={{
            display: 'grid', gap: 8,
            gridTemplateColumns: 'repeat(auto-fill, minmax(215px, 1fr))',
          }}>
            {imReiter.map(s => (
              <StrategieKarte key={s.code} s={s} profil={profil}
                              gewaehlt={s.code === wahl}
                              onWahl={() => setWahl(s.code === wahl ? null : s.code)} />
            ))}
          </div>
          {imReiter.length === 0 && (
            <div className="v2-dim" data-strategie-leer
                 style={{ fontSize: 11, padding: '16px 0', textAlign: 'center' }}>
              In diesem Reiter liegt keine Strategie.
            </div>
          )}
        </div>
      )}

      {gewaehlt && (
        <StrategieVorschau s={gewaehlt} onSchliessen={() => setWahl(null)} />
      )}
    </Card>
  )
}
