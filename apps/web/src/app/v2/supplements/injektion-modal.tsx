'use client'

// Das Modal einer Injektionsflaeche — G-396.
//
// **Tom, 2026-09-09:** *„ein modal mit all den werten betreffs punkt
// und daten dazu."*
//
// ══ WAS DIE TABELLEN TRAGEN, UND WAS NICHT ══════════════════════════
//
// `[cmd]` **Vier Tabellen liefern Felder** (gemessen 2026-09-09):
//
//     injection_sites            16 Zeilen   Weg, Name, Ruhezeit, Rotation
//     injection_logs              0 Zeilen   Datum, Volumen, Stoff, Schmerz
//     needle_recommendations      8 Zeilen   Gauge, Laenge, Viskositaet
//     tissue_condition_guidance   1 Zeile    Meidedauer bei Lipohypertrophie
//
// `[cmd]` **Was es NICHT gibt, wird benannt, nicht erfunden**
// (E-72): **kein Maximalvolumen je Ort** — keine Spalte in
// `injection_sites`; **keine Ruhezeit in Tagen** — NULL bei allen 16,
// mit Begruendung E-57; **keine Nadelzeile fuer Gluteus und
// Latissimus** — die Tabelle fuehrt nur vier Ortsarten.
import * as React from 'react'

import type { FlaechenGruppe, OrtZustand } from '../../../lib/medical/injektion-flaechen'
import { ORT_ZU_NADELART } from '../../../lib/medical/injektion-flaechen'
import type { NadelZeile, GewebeZeile } from '../../../lib/medical/injektion-read'

/** Ein Feld: Beschriftung, Wert, und die Quelle des Werts. */
function Feld({ name, quelle, children }: {
  name: string
  quelle: string
  children: React.ReactNode
}) {
  return (
    <div className="v2-inj-feld">
      <div className="v2-eyebrow">{name}</div>
      <div style={{ fontSize: 12.5, marginTop: 2 }}>{children}</div>
      <div className="v2-dim v2-mono" style={{ fontSize: 9, marginTop: 2 }}>{quelle}</div>
    </div>
  )
}

/**
 * Ein Wert, der fehlt — mit Grund.
 *
 * `[read]` **E-72: entweder Werte oder ein benannter Leerhinweis.**
 * **Ein Strich allein sieht aus wie ein Ergebnis.**
 */
function Fehlt({ grund }: { grund: string }) {
  return <span className="v2-dim" style={{ fontSize: 11.5 }}>— {grund}</span>
}

function OrtBlock({ z, nadeln }: { z: OrtZustand, nadeln: readonly NadelZeile[] }) {
  const art = ORT_ZU_NADELART[z.ort.id]
  const eigene = art ? nadeln.filter(n => n.site === art) : []
  return (
    <div className="v2-inj-modal-ort">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{z.ort.display_name}</span>
        <span className="v2-inj-kuerzel v2-inj-kuerzel-im">{z.ort.route.toUpperCase()}</span>
        <span className="v2-dim v2-mono" style={{ marginLeft: 'auto', fontSize: 9.5 }}>{z.ort.id}</span>
      </div>

      <div className="v2-grid v2-g-cols-2" style={{ gap: 8 }}>
        <Feld name="Zuletzt benutzt" quelle="injection_logs.injected_at">
          {z.letzte
            ? <span className="v2-num">
                {z.letzte.injected_at.slice(0, 10)}
                {z.tageSeither != null && <span className="v2-dim"> · vor {z.tageSeither} d</span>}
              </span>
            : <Fehlt grund="nie benutzt, 0 Protokollzeilen" />}
        </Feld>

        {/* ══ E-57: die Ruhezeit ist absichtlich leer ═════════════
            `[cmd]` **`minimum_rest_days` ist bei ALLEN 16 Orten NULL**,
            und `minimum_rest_days_reason` sagt warum. **Das ist eine
            Angabe, kein fehlender Wert** — deshalb steht der Grund aus
            der Datenbank hier, nicht ein erfundenes „5 d". */}
        <Feld name="Mindestruhezeit" quelle="injection_sites.minimum_rest_days">
          {z.ort.minimum_rest_days != null
            ? <span className="v2-num">{z.ort.minimum_rest_days} d</span>
            : <Fehlt grund={z.ort.minimum_rest_days_reason ?? 'kein Wert hinterlegt'} />}
        </Feld>

        <Feld name="Volumen letzte Gabe" quelle="injection_logs.volume_ml">
          {z.letzte?.volume_ml != null
            ? <span className="v2-num">{z.letzte.volume_ml} ml</span>
            : <Fehlt grund="kein Eintrag" />}
        </Feld>

        <Feld name="Substanz" quelle="injection_logs.substance_name">
          {z.letzte?.substance_name ?? <Fehlt grund="kein Eintrag" />}
        </Feld>

        <Feld name="Schmerz" quelle="injection_logs.pain_score">
          {z.letzte?.pain_score != null
            ? <span className="v2-num">{z.letzte.pain_score}</span>
            : <Fehlt grund="kein Eintrag" />}
        </Feld>

        <Feld name="Komplikation" quelle="injection_logs.complication">
          {z.letzte?.complication ?? <Fehlt grund="kein Eintrag" />}
        </Feld>
      </div>

      <div className="v2-eyebrow" style={{ marginTop: 12, marginBottom: 6 }}>
        Nadelempfehlung
        {art && <span className="v2-dim v2-mono" style={{ fontSize: 9, marginLeft: 6 }}>site = {art}</span>}
      </div>
      {eigene.length > 0
        ? (
          <div className="v2-supp-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                <tr>
                  <th>Viskositaet</th>
                  <th style={{ width: 90 }}>Gauge</th>
                  <th>Laenge</th>
                </tr>
              </thead>
              <tbody>
                {eigene.map((n, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 11 }}>{n.medication_viscosity ?? '—'}</td>
                    <td className="v2-num" style={{ fontSize: 11 }}>{n.gauge_range ?? '—'}</td>
                    <td className="v2-num v2-muted" style={{ fontSize: 10.5 }}>{n.length_range ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        : (
          /* `[cmd]` **Gemessen: Gluteus und Latissimus haben keine
             Zeile.** Die Tabelle fuehrt `deltoid`, `vastus_lateralis`,
             `ventrogluteal`, `subcutaneous` — sonst nichts. */
          <Fehlt grund={art
            ? `keine Zeile fuer site = ${art}`
            : `dieser Ort hat keine Entsprechung in injection_needle_recommendations`} />
        )}
    </div>
  )
}

/**
 * Das Modal einer angeklickten Flaeche.
 *
 * `[read]` **Mehrere Orte je Flaeche** (A8): `deltoids` links traegt
 * `delt_l` (IM) und `sq_delt_l` (SubQ), `gluteal` links `glute_l` und
 * `vglute_l`. **Alle stehen untereinander, jeder mit seinen eigenen
 * Werten.**
 */
export function InjektionsModal({ gruppe, nadeln, gewebe, onClose }: {
  gruppe: FlaechenGruppe
  nadeln: readonly NadelZeile[]
  gewebe: readonly GewebeZeile[]
  onClose: () => void
}) {
  // `[read]` **Escape schliesst** — ein Modal ohne Tastaturausgang
  // sperrt den Nutzer ein.
  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  const titel = gruppe.seite
    ? `${gruppe.flaeche} · ${gruppe.seite}`
    : gruppe.flaeche

  return (
    <div
      className="v2-inj-modal-hinter"
      role="presentation"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="v2-inj-modal" role="dialog" aria-modal="true" aria-label={titel}>
        <div className="v2-inj-modal-kopf">
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{titel}</div>
            <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 2 }}>
              {gruppe.orte.length === 1
                ? '1 Injektionsort auf dieser Flaeche'
                : `${gruppe.orte.length} Injektionsorte auf dieser Flaeche`}
            </div>
          </div>
          <button
            type="button" className="v2-icon-btn" onClick={onClose}
            aria-label="Schliessen"
          >
            ×
          </button>
        </div>

        <div className="v2-inj-modal-rumpf">
          {gruppe.orte.map(z => <OrtBlock key={z.ort.id} z={z} nadeln={nadeln} />)}

          {gewebe.length > 0 && (
            <div className="v2-inj-modal-ort">
              <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
                Gewebehinweise
                <span className="v2-dim v2-mono" style={{ fontSize: 9, marginLeft: 6 }}>
                  injection_tissue_condition_guidance
                </span>
              </div>
              {/* `[cmd]` **Eine Zeile, gemessen:** `lipohypertrophy`,
                  3 bis 6 Monate meiden. **Sie gilt fuer jede Flaeche**
                  — die Tabelle kennt keine Ortszuordnung. */}
              {gewebe.map(g => (
                <div key={g.condition_code} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12 }}>
                    <span style={{ fontWeight: 600 }}>{g.condition_code}</span>
                    {(g.avoidance_min_months != null || g.avoidance_max_months != null) && (
                      <span className="v2-num v2-dim" style={{ marginLeft: 8 }}>
                        {g.avoidance_min_months ?? '?'}–{g.avoidance_max_months ?? '?'} Monate meiden
                      </span>
                    )}
                  </div>
                  {g.rationale && (
                    <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5, marginTop: 2 }}>
                      {g.rationale}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
