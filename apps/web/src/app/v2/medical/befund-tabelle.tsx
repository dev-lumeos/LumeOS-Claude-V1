'use client'

// Die Befundtabelle — echte Werte aus `medical.lab_result_values`.
//
// **DIESE KACHEL IST KEINE ATTRAPPE MEHR.** `[read]` Der Auftrag G-46:
// *„Was angebunden ist, verliert die Marke. Alles andere behält sie."*
//
// WAS SIE ZEIGT UND WAS NICHT:
// `[read]` *„Ob ein Wert gut ist, ist eine medizinische Aussage. Die
// Anzeige sagt, wo er liegt — im Bereich, darüber, darunter — nicht,
// was er bedeutet und schon gar nicht, was jemand tun soll."*
//
// Deshalb steht in der Lagespalte `Im Bereich`, `Über dem Bereich`,
// `Unter dem Bereich` oder `Ohne Bereich` — und nicht `Optimal`,
// `Critical high` oder ein Ratschlag. `[cmd]` Die Attrappe führte
// genau diese Urteile (`daten.ts:33-40`); sie sind hier nicht
// übernommen.
import * as React from 'react'
import { Card, Icon, Pill } from '@lumeos/ui'

import {
  gueltigerBereich, lageImBereich, bereichAusText, zuordnung,
  type Lage,
} from '../../../lib/medical/befund'
import type { BefundWert } from '../../../lib/medical/lesen'

/** Wortlaut je Lage. Ortsangaben, keine Urteile. */
const LAGE_TEXT: Record<Lage, string> = {
  im_bereich: 'Im Bereich',
  darueber: 'Über dem Bereich',
  darunter: 'Unter dem Bereich',
  unbekannt: 'Ohne Bereich',
}

// `[cmd]` Die Farbe folgt der Lage, nicht einer Bewertung: innerhalb
// neutral-positiv, ausserhalb aufmerksam, ohne Bereich gedämpft. Kein
// Rot — Rot hiesse „gefährlich", und das ist eine ärztliche Aussage.
const LAGE_FARBE: Record<Lage, string> = {
  im_bereich: 'var(--pos)',
  darueber: 'var(--warn)',
  darunter: 'var(--warn)',
  unbekannt: 'var(--fg-dim)',
}

const HERKUNFT_TEXT: Record<string, string> = {
  lab_report: 'Befund',
  catalog_fallback: 'Katalog',
  none: '—',
}

function formatZahl(n: number | null): string {
  if (n == null) return '—'
  // Keine erfundene Genauigkeit: ganze Zahlen bleiben ganz.
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(4)))
}

/** `70–99` aus zwei Zahlen; offene Grenzen als `<` oder `>`. */
function bereichText(low: number | null, high: number | null, text: string | null): string {
  if (low != null && high != null) return `${formatZahl(low)}–${formatZahl(high)}`
  if (high != null) return `<${formatZahl(high)}`
  if (low != null) return `>${formatZahl(low)}`
  return text ?? '—'
}

export function BefundTabelle({ werte }: { werte: BefundWert[] }) {
  const [nurAusserhalb, setNurAusserhalb] = React.useState(false)
  const [q, setQ] = React.useState('')

  const zeilen = React.useMemo(() => werte.map(w => {
    const bereich = gueltigerBereich(w)
    const lage = lageImBereich(w.value_numeric, bereich)
    const opt = w.optimal_low != null || w.optimal_high != null
      ? { low: w.optimal_low ?? null, high: w.optimal_high ?? null }
      : bereichAusText(w.optimal_text ?? null)
    const optLage = opt
      ? lageImBereich(w.value_numeric, { ...opt, text: null, unit: null })
      : 'unbekannt' as Lage
    return { w, bereich, lage, opt, optLage, zu: zuordnung(w) }
  }), [werte])

  const gefiltert = zeilen
    .filter(z => !nurAusserhalb || z.lage === 'darueber' || z.lage === 'darunter')
    .filter(z => !q || (z.w.marker_name + (z.w.loinc_code ?? ''))
      .toLowerCase().includes(q.toLowerCase()))

  const ausserhalb = zeilen.filter(z => z.lage === 'darueber' || z.lage === 'darunter').length
  const ohneZuordnung = zeilen.filter(z => z.zu !== 'zugeordnet').length

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
          <Icon
            name="search"
            className="v2-ic v2-ic-sm"
            style={{
              position: 'absolute', left: 10, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--fg-subtle)',
            }}
          />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            aria-label="Befundwerte durchsuchen"
            placeholder={`${werte.length} Werte · Name oder LOINC…`}
            style={{
              width: '100%', height: 32, background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 7,
              padding: '0 12px 0 30px', fontSize: 12, color: 'var(--fg)',
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => setNurAusserhalb(v => !v)}
          aria-pressed={nurAusserhalb}
          className={nurAusserhalb ? 'v2-btn v2-btn-primary' : 'v2-btn'}
        >
          <Icon name="filter" className="v2-ic v2-ic-sm" />
          {`Nur ausserhalb · ${ausserhalb}`}
        </button>
      </div>

      <Card
        title="Befundwerte"
        sub={`${werte.length} aus ${new Set(werte.map(w => w.report_id)).size} Befunden`}
      >
        {werte.length === 0 ? (
          <div style={{ padding: '28px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              Noch keine Befundwerte
            </div>
            <div className="v2-dim" style={{ fontSize: 11.5 }}>
              Sobald ein Laborbericht erfasst ist, stehen seine Werte hier.
            </div>
          </div>
        ) : (
          <div className="v2-tbl-wrap">
            <table className="v2-tbl">
              <thead>
                {/* `[cmd]` Die Markerspalte braucht eine Mindestbreite:
                    „Glucose [Mass/volume] in Serum or Plasma" ist der
                    Rohtext eines Befunds und bricht sonst auf sechs
                    Zeilen um, waehrend rechts Platz frei bleibt. Die
                    Tabelle rollt ohnehin (`v2-tbl-wrap`). */}
                <tr>
                  <th style={{ minWidth: 260 }}>Marker</th>
                  <th style={{ width: 90 }}>LOINC</th>
                  <th style={{ width: 110, textAlign: 'right' }}>Wert</th>
                  <th style={{ width: 120 }}>Bereich</th>
                  <th style={{ width: 90 }}>Herkunft</th>
                  <th style={{ width: 120 }}>Optimalband</th>
                  <th style={{ width: 150 }}>Lage</th>
                  <th style={{ width: 96 }}>Befund</th>
                </tr>
              </thead>
              <tbody>
                {gefiltert.map(({ w, bereich, lage, opt, optLage, zu }) => (
                  <tr key={w.id}>
                    <td>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{w.marker_name}</div>
                      {zu !== 'zugeordnet' && (
                        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 2 }}>
                          {zu === 'mehrdeutig'
                            ? `Rohtext des Befunds · nicht eindeutig zugeordnet${
                              w.entry_confidence != null
                                ? ` · Konfidenz ${w.entry_confidence.toFixed(2)}` : ''}`
                            : 'Rohtext des Befunds · im Katalog nicht gefunden'}
                        </div>
                      )}
                      {/* Bei Mehrdeutigkeit die Kandidaten NENNEN, nicht
                          einen davon waehlen. `[cmd]` Die Datenbank
                          fuehrt sie samt Konfidenz in `match_candidates`
                          — bei der Glukose drei Stueck. Welcher gilt,
                          entscheidet ein Mensch, nicht die Anzeige. */}
                      {zu === 'mehrdeutig' && (w.match_candidates?.length ?? 0) > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                          {w.match_candidates!.slice(0, 3).map(k => (
                            <Pill key={k.loinc_code}>
                              {`${k.loinc_code} · ${k.confidence.toFixed(2)}`}
                            </Pill>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="v2-mono" style={{ fontSize: 11 }}>
                      {w.loinc_code ?? <span className="v2-dim">—</span>}
                    </td>
                    <td className="v2-num" style={{ textAlign: 'right' }}>
                      {w.value_numeric != null
                        ? `${w.value_operator !== '=' ? w.value_operator : ''}${formatZahl(w.value_numeric)} ${w.unit}`
                        : (w.value_text ?? '—')}
                    </td>
                    <td className="v2-mono v2-muted" style={{ fontSize: 11 }}>
                      {bereich
                        ? bereichText(bereich.low, bereich.high, bereich.text)
                        : <span className="v2-dim">—</span>}
                    </td>
                    <td>
                      {w.reference_source === 'none'
                        ? <span className="v2-dim" style={{ fontSize: 11 }}>—</span>
                        : (
                          <Pill variant={w.reference_source === 'lab_report' ? 'acc' : undefined}>
                            {HERKUNFT_TEXT[w.reference_source]}
                          </Pill>
                        )}
                    </td>
                    <td className="v2-mono v2-muted" style={{ fontSize: 11 }}>
                      {opt
                        ? bereichText(opt.low, opt.high, w.optimal_text ?? null)
                        : (w.optimal_text ?? <span className="v2-dim">—</span>)}
                    </td>
                    <td>
                      <span style={{ color: LAGE_FARBE[lage], fontSize: 11.5 }}>
                        {LAGE_TEXT[lage]}
                      </span>
                      {/* Der Doppelbereich: nur zeigen, wenn die beiden
                          Bereiche auseinanderfallen. Sonst wäre es
                          dieselbe Aussage zweimal. */}
                      {opt && optLage !== 'unbekannt' && optLage !== lage && (
                        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 2 }}>
                          {`Optimalband: ${LAGE_TEXT[optLage].toLowerCase()}`}
                        </div>
                      )}
                    </td>
                    <td className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>
                      {w.report_date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {ohneZuordnung > 0 && (
          <>
            <div className="v2-divider" />
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
              {`${ohneZuordnung} von ${werte.length} Werten sind keinem Katalogeintrag `}
              zugeordnet. Sie stehen mit dem Rohtext des Befunds da und sind
              ungeprüft — weggelassen wird keiner.
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
