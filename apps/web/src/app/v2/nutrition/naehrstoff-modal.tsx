'use client'

// Das Naehrstoff-Detailmodal (G-122).
//
// Vorlage: `NutrientDetailModal` in module-nutrition-nutrients.jsx
// (720 px): Kopf mit Gruppe, „unter {parent}" und Status; Zahlenkarten;
// Erklaerungen; Kinderliste. **Abweichungen von der Vorlage, beide
// beauftragt:**
// - **Beide Zielwerte nebeneinander:** die wissenschaftlichen
//   Referenzen (EFSA/WHO/US, mit `source_url` und Version — „zeig
//   sie, wie bei den Biomarker-Bereichen") UND das persoenliche Ziel
//   aus `daily_reference_assessment`.
// - **Der Trend ist echt:** 14 Tageswerte aus der langen Sicht. In
//   der Vorlage ist er erfunden (Z. 694 „Fake 14-day trend").
//
// **DIE GRENZE:** Die Texte beschreiben Symptome — sie werden
// gezeigt, nicht zugeschrieben. „Bei Mangel treten X auf" ist eine
// Information; ein „Sie haben einen Mangel" kommt hier nicht vor.
// `rda_standard/athlete` aus dem Vorgaengerrepo bleiben Text und sind
// als Altbestand gekennzeichnet (164: nicht als Zielwerte
// interpretieren).
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import type { NaehrstoffKnoten } from '../../../lib/nutrition/naehrstoff-ordnung'
import type { NaehrstoffDetail, Referenzzeile, TrendPunkt } from '../../../lib/nutrition/naehrstoff-detail-read'
import {
  STATUS_TEXT, STATUS_FARBE, zahlMitEinheit as zahl,
} from '../../../lib/nutrition/naehrstoff-anzeige'

/** Die echte 14-Tage-Reihe als kleine Linie. Tage ohne Wert bleiben
 *  Luecken — keine erfundenen Zwischenwerte. */
function Trendlinie({ punkte, farbe }: { punkte: TrendPunkt[]; farbe: string }) {
  const werte = punkte.map(p => p.wert).filter((v): v is number => v !== null)
  if (werte.length < 2) {
    return <span className="v2-dim" style={{ fontSize: 10 }}>zu wenige Tage</span>
  }
  const max = Math.max(...werte, 1)
  const b = 140
  const h = 26
  const xy = punkte
    .map((p, i) => p.wert === null ? null
      : `${(i / Math.max(punkte.length - 1, 1)) * b},${h - (p.wert / max) * (h - 2)}`)
    .filter((s): s is string => s !== null)
  return (
    <svg width={b} height={h} aria-label="14-Tage-Verlauf" role="img">
      <polyline
        points={xy.join(' ')}
        fill="none"
        stroke={farbe}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function bevoelkerung(r: Referenzzeile): string {
  const teile: string[] = []
  if (r.geschlecht && r.geschlecht !== 'both') {
    teile.push(r.geschlecht === 'male' ? 'Maenner' : 'Frauen')
  }
  if (r.alterMin !== null) {
    teile.push(r.alterMax !== null ? `${r.alterMin}–${r.alterMax} J.` : `ab ${r.alterMin} J.`)
  }
  return teile.join(', ') || 'Erwachsene'
}

function referenzWert(r: Referenzzeile): string {
  if (r.wertMin === null && r.wertMax === null) return '—'
  if (r.wertMin !== null && r.wertMax !== null && r.wertMin !== r.wertMax) {
    return `${zahl(r.wertMin, null)}–${zahl(r.wertMax, r.einheit)}`
  }
  return zahl(r.wertMin ?? r.wertMax, r.einheit)
}

export function NaehrstoffModal({ knoten, elternName, datum, fenster, onClose }: {
  knoten: NaehrstoffKnoten
  elternName: string | null
  datum: string
  fenster: number
  onClose: () => void
}) {
  const [detail, setDetail] = React.useState<NaehrstoffDetail | null>(null)
  const [fehler, setFehler] = React.useState<string | null>(null)

  React.useEffect(() => {
    let lebt = true
    fetch(`/api/nutrition/naehrstoff?code=${encodeURIComponent(knoten.code)}&datum=${datum}`)
      .then(async r => {
        if (!r.ok) throw new Error((await r.json().catch(() => null))?.error ?? `HTTP ${r.status}`)
        return r.json() as Promise<NaehrstoffDetail>
      })
      .then(d => { if (lebt) setDetail(d) })
      .catch(e => { if (lebt) setFehler(e instanceof Error ? e.message : String(e)) })
    return () => { lebt = false }
  }, [knoten.code, datum])

  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  const farbe = knoten.status ? STATUS_FARBE[knoten.status] : 'var(--fg-dim)'
  const e = detail?.erklaerung ?? null
  const trendWerte = (detail?.trend ?? []).map(p => p.wert).filter((v): v is number => v !== null)
  const trendSchnitt = trendWerte.length > 0
    ? trendWerte.reduce((s, v) => s + v, 0) / trendWerte.length
    : null

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div
        className="v2-modal"
        style={{ width: 720, maxWidth: '94vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={ev => ev.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={knoten.name}
      >
        <div className="v2-modal-h">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{knoten.name}</span>
              <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{knoten.code}</span>
              <Pill>{knoten.gruppe}</Pill>
              {elternName && <Pill>unter {elternName}</Pill>}
              {knoten.status && <Pill dot={farbe}>{STATUS_TEXT[knoten.status]}</Pill>}
            </div>
            {e?.funktion && (
              <div className="v2-muted" style={{ fontSize: 11.5, marginTop: 3, lineHeight: 1.5 }}>
                {e.funktion}
              </div>
            )}
          </div>
          <button type="button" className="v2-icon-btn" onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic" />
          </button>
        </div>

        <div className="v2-modal-body" style={{ overflowY: 'auto' }}>
          {fehler && (
            <p className="v2-muted" style={{ fontSize: 12 }}>Nicht gelesen: {fehler}</p>
          )}

          {/* Zahlen: gezeigter Wert, persoenliches Ziel, UL, echter Trend */}
          <div className="v2-grid v2-g-cols-4" style={{ gap: 10, marginBottom: 14 }}>
            <Card style={{ padding: 12 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 3 }}>
                {fenster === 1 ? 'Heute' : `Schnitt/Tag (${fenster} T.)`}
              </div>
              <div className="v2-num" style={{ fontSize: 17, fontWeight: 500, color: farbe }}>
                {zahl(knoten.wert, knoten.einheit)}
              </div>
              <div className="v2-dim" style={{ fontSize: 10 }}>
                {knoten.prozent !== null ? `${Math.round(knoten.prozent)} % des Ziels` : ' '}
              </div>
            </Card>
            <Card style={{ padding: 12 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Persoenliches Ziel</div>
              <div className="v2-num" style={{ fontSize: 17, fontWeight: 500 }}>
                {zahl(knoten.ziel, knoten.einheit)}
                {knoten.zielMax !== null && <>–{zahl(knoten.zielMax, null)}</>}
              </div>
              <div className="v2-dim" style={{ fontSize: 10 }}>
                {knoten.zielArt ? `${knoten.zielArt} · fuer dein Profil` : 'keine Referenz'}
              </div>
            </Card>
            <Card style={{ padding: 12 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 3 }}>Obergrenze (UL)</div>
              <div className="v2-num" style={{ fontSize: 17, fontWeight: 500 }}>
                {zahl(knoten.obergrenze, knoten.einheit)}
              </div>
              <div className="v2-dim" style={{ fontSize: 10 }}>
                {knoten.obergrenze !== null ? 'tolerierbare Hoechstmenge' : 'keine UL gefuehrt'}
              </div>
            </Card>
            <Card style={{ padding: 12 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 3 }}>14-Tage-Schnitt</div>
              <div className="v2-num" style={{ fontSize: 17, fontWeight: 500 }}>
                {zahl(trendSchnitt, knoten.einheit)}
              </div>
              {detail ? (
                <Trendlinie punkte={detail.trend} farbe={farbe} />
              ) : (
                <span className="v2-dim" style={{ fontSize: 10 }}>laedt…</span>
              )}
            </Card>
          </div>

          {/* Die wissenschaftlichen Referenzen mit Quelle — beide
              Zielwerte sichtbar, und man sieht, welches gilt. */}
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
            Wissenschaftliche Referenzen
          </div>
          {detail && detail.referenzen.length === 0 && (
            <p className="v2-dim" style={{ fontSize: 11.5, marginBottom: 14 }}>
              Keine Referenzzeile gefuehrt.
            </p>
          )}
          {detail && detail.referenzen.length > 0 && (
            <div className="v2-tbl-wrap" style={{ marginBottom: 14 }}>
              <table className="v2-tbl">
                <thead>
                  <tr>
                    <th style={{ width: 170 }}>Art</th>
                    <th style={{ width: 120 }}>Gilt fuer</th>
                    <th style={{ width: 120 }}>Wert</th>
                    <th>Quelle</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.referenzen.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <span className="v2-mono" style={{ fontSize: 11 }}>{r.art}</span>
                        {r.basis && r.basis !== 'per_day' && (
                          <span className="v2-dim" style={{ fontSize: 9.5, marginLeft: 4 }}>{r.basis}</span>
                        )}
                      </td>
                      <td className="v2-dim" style={{ fontSize: 11 }}>{bevoelkerung(r)}</td>
                      <td className="v2-num">{referenzWert(r)}</td>
                      <td style={{ fontSize: 11 }}>
                        {r.quelleUrl ? (
                          <a href={r.quelleUrl} target="_blank" rel="noreferrer noopener">
                            {r.quelle ?? r.quelleUrl}
                          </a>
                        ) : (r.quelle ?? '—')}
                        {r.quelleVersion && (
                          <span className="v2-dim" style={{ fontSize: 9.5, marginLeft: 4 }}>
                            {r.quelleVersion}
                          </span>
                        )}
                        {r.hinweis && (
                          <div className="v2-dim" style={{ fontSize: 10, lineHeight: 1.45 }}>
                            {r.hinweis}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Erklaerungen — Information, keine Diagnose. */}
          {(e?.beiMangel || e?.beiUeberschuss) && (
            <div className="v2-grid v2-g-cols-2" style={{ gap: 10, marginBottom: 14 }}>
              {e?.beiMangel && (
                <Card style={{
                  padding: 12,
                  background: 'color-mix(in srgb, var(--warn) 5%, var(--surface))',
                  border: '1px solid color-mix(in srgb, var(--warn) 22%, var(--border))',
                }}>
                  <div className="v2-eyebrow" style={{ color: 'var(--warn)', marginBottom: 5 }}>Bei Mangel</div>
                  <div style={{ fontSize: 12, lineHeight: 1.55 }}>{e.beiMangel}</div>
                </Card>
              )}
              {e?.beiUeberschuss && (
                <Card style={{
                  padding: 12,
                  background: 'color-mix(in srgb, var(--neg) 5%, var(--surface))',
                  border: '1px solid color-mix(in srgb, var(--neg) 22%, var(--border))',
                }}>
                  <div className="v2-eyebrow" style={{ color: 'var(--neg)', marginBottom: 5 }}>Bei Ueberschuss</div>
                  <div style={{ fontSize: 12, lineHeight: 1.55 }}>{e.beiUeberschuss}</div>
                </Card>
              )}
            </div>
          )}

          {e?.detail && (
            <p className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.6, marginBottom: 14 }}>
              {e.detail}
            </p>
          )}

          {e && e.quellenListe.length > 0 && (
            <>
              <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Beste Quellen</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {e.quellenListe.map((q, i) => (
                  <span
                    key={q}
                    style={{
                      padding: '5px 10px', background: 'var(--surface)',
                      border: '1px solid var(--border)', borderRadius: 5, fontSize: 11.5,
                    }}
                  >
                    <span className="v2-dim v2-mono" style={{ fontSize: 9.5, marginRight: 5 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {q}
                  </span>
                ))}
              </div>
            </>
          )}

          {e?.wechselwirkungen && (
            <>
              <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Wechselwirkungen</div>
              <p className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55, marginBottom: 14 }}>
                {e.wechselwirkungen}
              </p>
            </>
          )}

          {e?.tipp && (
            <div className="v2-hinweis" style={{ marginBottom: 14 }}>{e.tipp}</div>
          )}

          {/* Kinderliste aus dem echten Baum (C-161). */}
          {knoten.kinder.length > 0 && (
            <>
              <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
                Zusammensetzung · {knoten.kinder.length} untergeordnet
              </div>
              <div className="v2-tbl-wrap" style={{ marginBottom: 14 }}>
                <table className="v2-tbl">
                  <tbody>
                    {knoten.kinder.map(k => (
                      <tr key={k.code}>
                        <td>
                          {k.name}
                          <span className="v2-dim v2-mono" style={{ fontSize: 9.5, marginLeft: 5 }}>{k.code}</span>
                        </td>
                        <td className="v2-num" style={{ width: 110 }}>{zahl(k.wert, k.einheit)}</td>
                        <td style={{ width: 100 }}>
                          {k.status ? (
                            <Pill dot={STATUS_FARBE[k.status]}>{STATUS_TEXT[k.status]}</Pill>
                          ) : (
                            <span className="v2-dim" style={{ fontSize: 11 }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Alttexte: sichtbar, aber als das gekennzeichnet, was sie
              sind — Text aus dem Vorgaengerrepo, keine Referenz (164). */}
          {(e?.rdaStandardText || e?.rdaAthletText) && (
            <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
              Vorgaengerrepo (Text, keine Referenz):
              {e?.rdaStandardText && <> Standard {e.rdaStandardText}.</>}
              {e?.rdaAthletText && <> Sportler {e.rdaAthletText}.</>}
              {e?.ulText && <> UL {e.ulText}.</>}
            </div>
          )}
        </div>

        <div className="v2-modal-f">
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Schliessen</button>
        </div>
      </div>
    </div>
  )
}
