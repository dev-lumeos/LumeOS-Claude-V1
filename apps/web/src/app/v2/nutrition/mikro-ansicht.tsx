'use client'

// Die Mikronaehrstoff-Ansicht — G-239.
//
// **QUELLEN, in dieser Reihenfolge gelesen:**
//   `docs/specs/.../SPEC_10_COMPONENTS.md` — `MicroDashboard`
//     („Mikronaehrstoff-Dashboard mit Tier-System"), `MicroNutrientCard`
//     („aktuell/RDA, Severity-Farbe, Details")
//   `public/mockup/features/nutrition/MicroDashboard.js` — fuenf
//     Gruppen, Vitamine in fett-/wasserloeslich geteilt, aufklappbare
//     Zeilen, Balken, Zusammenfassung in vier Kacheln
//   `referenz/lumeos-2026/.../nutrientDetails.ts` — die Struktur, aus
//     der die `ND`-Tabelle des Mockups stammt
//
// `[cmd]` **Uebernommen:** Gruppen, Teilung der Vitamine, aufklappbare
// Zeile, Balken, Zusammenfassung.
//
// `[read]` **NICHT uebernommen: die Farblogik des Mockups.** `[cmd]`
// Dort gilt `pct>=80` gruen, `>=50` gelb, sonst rot — **in EINE
// Richtung, fuer jeden Naehrstoff gleich.** Bei einer Obergrenze
// faerbt das genau falsch herum: 163 % Vitamin A waere gruen.
// **Das ist Regel 2 aus C-48, und sie geht vor.**
//
// `[cmd]` **A-30:** aus dem Leseweg kommen nur TYPEN. Die Einordnung
// steht serverfrei in `lib/nutrition/mikro-lage.ts`.

import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import {
  lageVon, zeigtProzent, fehlSatz, richtungsSatz, geltungsSatz,
  faelleZusammen, gruppiere, verteilung,
  LAGE_TEXT, LAGE_FARBE, OHNE_REFERENZ_SATZ,
  type Lage, type Naehrstoff, type ZeileMitLage,
} from '../../../lib/nutrition/mikro-lage'
import type {
  ReferenceAssessmentRow, NaehrstoffTag,
} from '../../../lib/nutrition/reference-assessment-read'
// G-247 / E-24: Zeitraum, Spanne und Verlauf — serverfrei.
import {
  ZEITRAEUME, ZEITRAUM_TEXT, ZEITRAUM_STANDARD,
  spanneVon, spannenSatz, lueckenSatzZeitraum, abdeckungsSatz,
  spitzeUeberschreitet, skalaVon, tagesLageImVerlauf,
  type Zeitraum, type Spanne, type Tageswert, type VerlaufLinien,
} from '../../../lib/nutrition/mikro-zeitraum'

/** Ein Naehrstoff mit der Spanne des Zeitraums — G-247. */
type NaehrstoffMitSpanne = Naehrstoff & { spanne: Spanne | null }

function zahl(n: number | null, einheit: string): string {
  if (n === null) return '—'
  const gerundet = Math.abs(n) >= 100 ? Math.round(n) : Math.round(n * 10) / 10
  return `${gerundet.toLocaleString('de-DE')} ${einheit}`
}

export function MikroAnsicht({ zeilen, tageswerte = [], datum }: {
  zeilen: ReferenceAssessmentRow[]
  /** G-247: Tageswerte je Naehrstoff fuer Zeitraum und Verlauf. */
  tageswerte?: NaehrstoffTag[]
  datum?: string
}) {
  const [offen, setOffen] = React.useState<string | null>(null)
  // ══ G-247: Zeitraum und Filter ═══════════════════════════════════
  // `[read]` Der Standard bleibt der Tag (E-24, Mockup:461).
  const [zeitraum, setZeitraum] = React.useState<Zeitraum>(ZEITRAUM_STANDARD)
  const [filter, setFilter] = React.useState<Lage | 'alle'>('alle')

  /** Tageswerte je Naehrstoff, auf den gewaehlten Zeitraum geschnitten. */
  const jeCode = React.useMemo(() => {
    const m = new Map<string, Tageswert[]>()
    if (zeitraum === 1 || !datum) return m
    const von = new Date(`${datum}T00:00:00Z`)
    von.setUTCDate(von.getUTCDate() - (zeitraum - 1))
    const abDatum = von.toISOString().slice(0, 10)
    for (const t of tageswerte) {
      if (t.entry_date < abDatum || t.entry_date > datum) continue
      const l = m.get(t.nutrient_code) ?? []
      l.push({ entry_date: t.entry_date, total_value: t.total_value,
        value_complete: t.value_complete })
      m.set(t.nutrient_code, l)
    }
    return m
  }, [tageswerte, zeitraum, datum])

  const stoffe = React.useMemo(() => {
    const mitLage: ZeileMitLage[] = zeilen.map(z => ({ ...z, lage: lageVon(z) }))
    const zusammen = faelleZusammen(mitLage)
    if (zeitraum === 1) {
      return zusammen.map(s => ({ ...s, spanne: null as Spanne | null }))
    }
    // ══ Erst mitteln, DANN bewerten ═══════════════════════════════
    // `[read]` **Nicht die Tagesbewertung n-mal.** Wer je Tag
    // bewertet und die Urteile zaehlt, bekommt eine andere Aussage
    // als wer erst mittelt (G-247).
    return zusammen.map(s => {
      const spanne = spanneVon(jeCode.get(s.code) ?? [])
      if (spanne.schnitt === null) return { ...s, spanne }
      const neu = (z: typeof s.ziel) => {
        if (!z) return z
        const grenze = z.reference_direction === 'upper_limit'
          ? z.reference_value_max
          : z.reference_value_min
        const pct = grenze !== null && grenze !== 0
          ? Math.round((spanne.schnitt as number / grenze) * 1000) / 10
          : null
        const ersetzt = { ...z, actual_value: spanne.schnitt, reference_pct: pct }
        return { ...ersetzt, lage: lageVon(ersetzt) }
      }
      const ziel = neu(s.ziel)
      const grenze = s.grenze ? neu(s.grenze) : null
      return {
        ...s, ziel, grenze, spanne,
        lage: grenze?.lage === 'zu_viel' ? 'zu_viel' as Lage : ziel.lage,
      }
    })
  }, [zeilen, zeitraum, jeCode])

  // `[read]` **Die Zahlen aendern sich mit dem Zeitraum** — der
  // Auftrag verlangt es ausdruecklich: „4x ueber der Obergrenze"
  // gilt fuer heute.
  const stufen = React.useMemo(() => verteilung(stoffe), [stoffe])

  const gefiltert: NaehrstoffMitSpanne[] = React.useMemo(
    () => filter === 'alle' ? stoffe : stoffe.filter(s => s.lage === filter),
    [stoffe, filter])
  const gruppen = React.useMemo(() => gruppiere(gefiltert), [gefiltert])

  if (zeilen.length === 0) {
    return (
      <Card title="Mikronährstoffe">
        <p className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
          Für diesen Tag ist nichts erfasst. <strong>Das ist keine Aussage
          über deine Zufuhr</strong> — es liegen schlicht keine Einträge vor.
        </p>
      </Card>
    )
  }

  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      <Card title="Mikronährstoffe"
            sub={`${stoffe.length} Nährstoffe bewertet`}>
        {/* ══ G-247: der Zeitraumwechsel ══════════════════════════
            `[cmd]` Vier Stufen aus dem Mockup
            (`module-nutrition-nutrients.jsx:485`). Der Standard
            bleibt der Tag. */}
        <div style={{
          display: 'inline-flex', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 6,
          padding: 2, marginBottom: 10,
        }}>
          {ZEITRAEUME.map(z => (
            <button key={z} type="button"
                    aria-pressed={zeitraum === z}
                    className={zeitraum === z ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
                    style={{ height: 24, fontSize: 11, padding: '0 10px', borderRadius: 4 }}
                    onClick={() => setZeitraum(z)}>
              {ZEITRAUM_TEXT[z]}
            </button>
          ))}
        </div>

        {/* ══ G-247: die Pillen filtern ═══════════════════════════
            `[read]` **Ein Zaehler, der nicht filtert, laesst den
            Nutzer die Liste von Hand durchsuchen, obwohl das System
            die Antwort kennt.** Die Zahlen aendern sich mit dem
            Zeitraum, weil `stufen` aus `stoffe` kommt. */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {/* `[read]` **Knopf um die Pille, nicht `onClick` auf ihr.**
              `Pill` ist ein `<span>` (packages/ui) — ein Klickziel
              ohne Rolle waere per Tastatur nicht erreichbar. Das
              UI-Paket bleibt unangetastet. */}
          <FilterPille aktiv={filter === 'alle'} farbe="var(--fg)"
                       onClick={() => setFilter('alle')}>
            alle ({stoffe.length})
          </FilterPille>
          {stufen.map(({ lage, anzahl }) => (
            <FilterPille key={lage} aktiv={filter === lage}
                         farbe={LAGE_FARBE[lage]}
                         immerVoll={lage === 'zu_viel'}
                         onClick={() => setFilter(filter === lage ? 'alle' : lage)}>
              {anzahl}× {LAGE_TEXT[lage]}
            </FilterPille>
          ))}
        </div>

        {/* ══ Regel 2, als Satz ══════════════════════════════════ */}
        <p className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
          Ein Prozentwert sagt <strong>nur zusammen mit seiner
          Bezugsgröße</strong> etwas: 80 % eines Zielwerts sind zu wenig,
          80 % einer Obergrenze sind unbedenklich. Deshalb steht bei jeder
          Zahl, worauf sie sich bezieht.
        </p>

        {/* ══ Regel 4, als Fusszeile ═════════════════════════════ */}
        <p className="v2-dim" style={{
          fontSize: 11, lineHeight: 1.55, marginTop: 8, marginBottom: 0,
        }}>
          {geltungsSatz(zeilen[0] ?? null)}
        </p>
      </Card>

      {gruppen.length === 0 && (
        <Card>
          <p className="v2-muted" style={{ fontSize: 12 }}>
            Kein Nährstoff in dieser Lage.{' '}
            <button type="button" className="v2-link"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    onClick={() => setFilter('alle')}>Filter aufheben</button>
          </p>
        </Card>
      )}

      {gruppen.map(g => (
        <Card key={g.key} title={g.titel} sub={`${g.stoffe.length}`}>
          <div className="v2-col-gap" style={{ gap: 0 }}>
            {g.stoffe.map(s => (
              <Zeile key={s.code} s={s}
                     spanne={s.spanne ?? null}
                     tage={jeCode.get(s.code) ?? []}
                     zeitraum={zeitraum}
                     offen={offen === s.code}
                     aufklappen={() => setOffen(offen === s.code ? null : s.code)} />
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

function Zeile({ s, spanne, tage, zeitraum, offen, aufklappen }: {
  s: Naehrstoff
  spanne: Spanne | null
  tage: readonly Tageswert[]
  zeitraum: Zeitraum
  offen: boolean
  aufklappen: () => void
}) {
  const farbe = LAGE_FARBE[s.lage]
  const z = s.ziel
  const prozent = zeigtProzent(s.lage, z.reference_pct) ? z.reference_pct : null
  // Der Balken bildet bis 200 Prozent ab — daruber saehe jede
  // Ueberschreitung gleich aus (uebernommen aus dem Mockup).
  const balken = prozent === null ? 0 : Math.min(prozent, 200) / 2

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button type="button" onClick={aufklappen}
              aria-expanded={offen}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '7px 0', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left', color: 'inherit',
              }}>
        <span className="v2-dot" style={{ background: farbe, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 12, minWidth: 0 }}>{s.name}</span>

        <span style={{
          width: 80, height: 4, background: 'var(--surface)',
          borderRadius: 2, overflow: 'hidden', flexShrink: 0,
        }}>
          <span style={{
            display: 'block', height: '100%', width: `${balken}%`,
            background: farbe, borderRadius: 2,
          }} />
        </span>

        <span className="v2-num v2-dim" style={{
          width: 92, textAlign: 'right', fontSize: 10.5, flexShrink: 0,
        }}>
          {zahl(z.actual_value, s.einheit)}
        </span>

        {/* `[read]` **Regel 1 und 3:** kein Prozentwert, wo die
            Funktion keinen liefert — und ein Strich ist keine Null. */}
        <span className="v2-num" style={{
          width: 52, textAlign: 'right', fontSize: 10.5,
          fontWeight: 600, color: farbe, flexShrink: 0,
        }}>
          {prozent !== null ? `${Math.round(prozent)} %` : '—'}
        </span>
        <Icon name={offen ? 'chevron_down' : 'chevron_right'}
              className="v2-ic v2-ic-sm" />
      </button>

      {offen && <Aufgeklappt s={s} spanne={spanne} tage={tage} zeitraum={zeitraum} />}
    </div>
  )
}

function Aufgeklappt({ s, spanne, tage, zeitraum }: {
  s: Naehrstoff
  spanne: Spanne | null
  tage: readonly Tageswert[]
  zeitraum: Zeitraum
}) {
  const z = s.ziel
  return (
    <div style={{
      padding: '8px 0 12px 18px', fontSize: 11.5, lineHeight: 1.6,
      color: 'var(--fg-muted)',
    }}>
      {/* ══ E-24: der Verlauf, nur bei 7/30/90 ═════════════════
          **Tom:** „bau sowas in die details wo die periode anzeigt
          inkl mittelwert, zielwert, obergrenze das sagt am meisten
          aus."
          `[read]` **Im Tagesmodus ist der Tag die Spanne** — ein
          Verlauf aus einem Punkt sagt nichts. */}
      {zeitraum !== 1 && spanne && spanne.tage > 0 && (
        <Verlauf s={s} spanne={spanne} tage={tage} zeitraum={zeitraum} />
      )}

      {/* ══ Regel 1: der Fehlzaehler bleibt sichtbar ═══════════ */}
      {s.lage === 'unvollstaendig' && (
        <div style={{
          padding: 8, marginBottom: 8, borderRadius: 5,
          background: 'color-mix(in oklch, var(--warn) 10%, transparent)',
          border: '1px solid color-mix(in oklch, var(--warn) 35%, var(--border))',
        }}>
          {fehlSatz(z.missing_count)}{' '}
          <strong>Deshalb steht hier kein Prozentwert</strong> — er wäre
          zu niedrig, nicht bloß ungenau.
        </div>
      )}

      {/* ══ Regel 3: ohne Referenz ist keine Null ══════════════ */}
      {s.lage === 'ohne_referenz' && (
        <div style={{ marginBottom: 8 }}>{OHNE_REFERENZ_SATZ}</div>
      )}

      {/* ══ Regel 2: die Bezugsgroesse steht dabei ═════════════ */}
      {zeigtProzent(s.lage, z.reference_pct) && z.reference_pct !== null && (
        <div style={{ marginBottom: 6 }}>
          <strong>{Math.round(z.reference_pct)} %</strong>{' '}
          {richtungsSatz(z.reference_direction)}
          {z.reference_value_min !== null && (
            <> ({zahl(z.reference_value_min, z.reference_unit ?? s.einheit)}
              {z.reference_kind ? `, ${z.reference_kind}` : ''})</>
          )}
        </div>
      )}

      {/* ══ Die zweite Referenz, falls es eine gibt ════════════ */}
      {s.grenze && (
        <div style={{
          marginBottom: 6,
          color: s.grenze.lage === 'zu_viel' ? 'var(--neg)' : undefined,
          fontWeight: s.grenze.lage === 'zu_viel' ? 600 : undefined,
        }}>
          {s.grenze.lage === 'zu_viel' && (
            <Icon name="alert" className="v2-ic v2-ic-sm"
                  style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          )}
          {s.grenze.reference_pct !== null
            ? <>{Math.round(s.grenze.reference_pct)} % der Obergrenze</>
            : <>Obergrenze geführt</>}
          {s.grenze.reference_value_max !== null && (
            <> ({zahl(s.grenze.reference_value_max,
              s.grenze.reference_unit ?? s.einheit)})</>
          )}
        </div>
      )}

      {/* ══ Der Beleg ═════════════════════════════════════════ */}
      {z.source && (
        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 8 }}>
          Quelle: {z.source}
          {z.source_locator ? ` · ${z.source_locator}` : ''}
          {z.reference_basis ? ` · Bezug: ${z.reference_basis}` : ''}
        </div>
      )}
      {z.notes && (
        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 4 }}>
          {z.notes}
        </div>
      )}
    </div>
  )
}

// ══ E-24: der Verlauf mit drei Linien ════════════════════════════
//
// **Tom, 2026-08-28:** *„bau sowas in die details wo die periode
// anzeigt inkl mittelwert, zielwert, obergrenze das sagt am meisten
// aus"*.
//
// `[read]` **Das ist C-48 Regel 2 als Bild.** Bei Vitamin A liegen
// beide Referenzlinien im selben Diagramm — der Verlauf ueber der
// einen, unter der anderen. **Die zwei Prozentzahlen darueber sagen
// dasselbe, das Bild sagt es schneller.**
//
// `[cmd]` **Bewusst als Balken, nicht als Linie:** ein Tag ohne
// Erfassung ist eine Luecke, kein Nullpunkt. Eine durchgezogene
// Linie muesste ihn ueberbruecken und behauptete damit einen Wert.
function Verlauf({ s, spanne, tage, zeitraum }: {
  s: Naehrstoff
  spanne: Spanne
  tage: readonly Tageswert[]
  zeitraum: Zeitraum
}) {
  const z = s.ziel
  const linien: VerlaufLinien = {
    mittelwert: spanne.schnitt,
    zielwert: z.reference_direction === 'upper_limit'
      ? (s.grenze ? s.grenze.reference_value_min : null)
      : z.reference_value_min,
    obergrenze: s.grenze?.reference_value_max
      ?? (z.reference_direction === 'upper_limit' ? z.reference_value_max : null),
  }
  const punkte = tage.map(t => ({
    tag: t.entry_date, wert: t.total_value, vollstaendig: t.value_complete,
  }))
  const skala = skalaVon(punkte, linien)
  const HOCH = 78
  const y = (v: number) => HOCH - (v / skala) * HOCH
  const richtung = s.grenze ? 'upper_limit' : z.reference_direction

  const linie = (wert: number | null, farbe: string, text: string) => {
    if (wert === null || wert > skala) return null
    return (
      <div key={text} style={{
        position: 'absolute', left: 0, right: 0, top: y(wert),
        borderTop: `1px dashed ${farbe}`, pointerEvents: 'none',
      }}>
        <span style={{
          position: 'absolute', right: 0, top: -13, fontSize: 9,
          color: farbe, background: 'var(--bg-elev)', padding: '0 3px',
        }}>{text}</span>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 10 }}>
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
        Verlauf · {ZEITRAUM_TEXT[zeitraum]}
      </div>

      <div style={{
        position: 'relative', height: HOCH, marginBottom: 6,
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'flex-end', gap: 1,
      }}>
        {punkte.map(p => {
          const lage = tagesLageImVerlauf(p.wert, linien, richtung)
          const h = p.wert === null ? 0 : Math.max(1, (p.wert / skala) * HOCH)
          return (
            <span key={p.tag}
                  title={`${p.tag}: ${zahl(p.wert, s.einheit)}`
                    + (p.vollstaendig ? '' : ' · unvollständig')}
                  style={{
                    flex: 1, height: h, minWidth: 2,
                    background: lage ? LAGE_FARBE[lage] : 'var(--fg-dim)',
                    // `[read]` Ein unvollstaendiger Tag wird blasser
                    // gezeigt — der Balken steht, aber er traegt
                    // weniger, als er sollte (C-48 Regel 1).
                    opacity: p.vollstaendig ? 1 : 0.45,
                    borderRadius: '2px 2px 0 0',
                  }} />
          )
        })}
        {linie(linien.obergrenze, 'var(--neg)', 'Obergrenze')}
        {linie(linien.zielwert, 'var(--pos)', 'Zielwert')}
        {linie(linien.mittelwert, 'var(--fg-muted)', 'Mittelwert')}
      </div>

      {/* ══ E-24: die Spanne, mit Tagen ═══════════════════════ */}
      <div style={{ fontSize: 10.5 }}>{spannenSatz(spanne, s.einheit)}</div>

      {/* `[read]` **Der Kern:** eine Ueberschreitung, die im Schnitt
          verschwindet, wird hier benannt. */}
      {spitzeUeberschreitet(spanne, richtung, linien.obergrenze) && (
        <div style={{
          marginTop: 6, padding: 8, borderRadius: 5, fontSize: 11,
          background: 'color-mix(in oklch, var(--neg) 10%, transparent)',
          border: '1px solid color-mix(in oklch, var(--neg) 40%, var(--border))',
          color: 'var(--neg)', fontWeight: 600,
        }}>
          <Icon name="alert" className="v2-ic v2-ic-sm"
                style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          Der Schnitt liegt unter der Obergrenze, der höchste Tag darüber.
        </div>
      )}

      {lueckenSatzZeitraum(spanne) && (
        <div style={{ fontSize: 10.5, marginTop: 4 }}>
          {lueckenSatzZeitraum(spanne)}
        </div>
      )}
      {abdeckungsSatz(spanne, zeitraum) && (
        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 2 }}>
          {abdeckungsSatz(spanne, zeitraum)}
        </div>
      )}
    </div>
  )
}

/**
 * Eine anwaehlbare Pille — G-247.
 *
 * `[read]` **`aria-pressed` statt nur Farbe:** wer die Liste per
 * Tastatur bedient, muss den gewaehlten Filter hoeren koennen.
 */
function FilterPille({ children, aktiv, farbe, immerVoll = false, onClick }: {
  children: React.ReactNode
  aktiv: boolean
  farbe: string
  immerVoll?: boolean
  onClick: () => void
}) {
  const voll = aktiv || immerVoll
  return (
    <button type="button" onClick={onClick} aria-pressed={aktiv}
            style={{
              background: 'none', border: 'none', padding: 0,
              cursor: 'pointer', font: 'inherit',
            }}>
      <Pill style={voll
        ? { color: 'var(--bg)', background: farbe, borderColor: farbe,
            fontWeight: 600, outline: aktiv ? '2px solid var(--fg)' : undefined,
            outlineOffset: aktiv ? 1 : undefined }
        : { color: farbe }}>
        {children}
      </Pill>
    </button>
  )
}
