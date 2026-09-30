'use client'

// Der Phasen-Editor — G-539. **Persoenlicher Override.**
//
// ══ WAS DER EDITOR IST ═════════════════════════════════════════════
//
// `[cmd]` **`module-goals-editor.jsx:56`:** *„Personal override — the
// shipped defaults stay intact."*
//
// `[read]` **Er aendert NICHT den Katalog** (G-536), sondern legt eine
// persoenliche Abweichung darueber. `[cmd]` **Die traegt
// `goal_phases.parameters`** — `jsonb NOT NULL DEFAULT '{}'`.
//
// ══ WELCHE REITER ERSCHEINEN ═══════════════════════════════════════
//
// `[cmd]` **Aus `goal_strategies.editor_modes`, nicht aus einer Liste
// im Browser** — die Spalte ist in **allen 17** Zeilen gefuellt
// (gemessen 2026-09-30) und deckt sich mit `PE_MODES` des Entwurfs
// (`:3-11`):
//
//     fat_loss-Zeilen   variants · guards · duration
//     lean_bulk-Zeilen  params · guards · duration
//     maintenance       params
//     body_recomp       params · cycling
//     contest_prep      subphases · refeeds · peakweek · guards · anchor
//     reverse_diet      params · exits · guards
//     expert_bb_annual  annual · anchor · overrides
//
// `[read]` **Kein `switch` ueber Strategiecodes** — eine achtzehnte
// Katalogzeile bringt ihre Reiter selbst mit.
//
// ══ WAS LEER IST, BLEIBT LEER ══════════════════════════════════════
//
// `[read]` **Der Auftrag: „Ein Editor, der ein leeres Feld als `0`
// anzeigt, schreibt beim Speichern eine erfundene Null in den
// Override."** `[cmd]` **Von zehn Katalogspalten sind sechs in genau
// einer der 17 Zeilen gefuellt** — der Normalfall ist leer.
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import {
  zyklusmittel, pruefeJahresplan, nurAbweichung, geltenderWert,
  abweichungszahl, schwelleAusText, type Overridewert,
} from '../../../lib/goals/editor-rechnungen'
// `[cmd]` **G-544 hat die Ankerrechnung gebaut** — sie wird BENUTZT,
// nicht nachgebaut. Zwei Rechnungen fuer dasselbe gehen auseinander.
import { ankerplan, gesamtWochen } from '../../../lib/goals/anker'
import type { Strategie } from '../../../lib/goals/strategie-read'

/** Die Beschriftungen des Entwurfs, `module-goals-editor.jsx:63-67`. */
const REITERTEXT: Record<string, string> = {
  variants: 'Variants',
  params: 'Parameters',
  guards: 'Guards',
  duration: 'Duration',
  subphases: 'Sub-phases',
  refeeds: 'Refeeds',
  peakweek: 'Peak week',
  anchor: 'Date anchor',
  annual: 'Annual cycle',
  overrides: 'Per-phase overrides',
  cycling: 'Calorie cycling',
  exits: 'Exit conditions',
}

/** Ein Feld mit Beschriftung — `PEField`, `:13-21`. */
function Feld({ label, sub, children }: {
  label: string; sub?: string; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline',
        justifyContent: 'space-between', marginBottom: 5,
      }}>
        <span className="v2-eyebrow">{label}</span>
        {sub && <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{sub}</span>}
      </div>
      {children}
    </div>
  )
}

/**
 * Eine Zahl mit Einheit — `PENum`, `:23-29`.
 *
 * `[read]` **Leer bleibt leer.** `[cmd]` **Der Platzhalter zeigt den
 * Katalogwert**, damit sichtbar ist, was gilt, ohne ihn in den
 * Override zu schreiben. **Steht keiner im Katalog, sagt das
 * Feld das** — statt eine Null zu behaupten.
 */
function Zahlfeld({ wert, katalog, einheit, onChange, marke }: {
  wert: string
  katalog: number | null
  einheit?: string
  onChange: (v: string) => void
  marke: string
}) {
  return (
    <div style={{ position: 'relative' }}>
      <input type="number" value={wert} data-editorfeld={marke}
             placeholder={katalog !== null ? String(katalog) : 'nicht hinterlegt'}
             onChange={e => onChange(e.target.value)}
             style={{
               width: '100%', height: 30, background: 'var(--surface)',
               border: '1px solid var(--border)', borderRadius: 6,
               padding: `0 ${einheit ? 34 : 10}px 0 10px`, fontSize: 12,
               fontFamily: 'var(--font-mono)', outline: 'none',
               color: 'var(--fg)',
             }} />
      {einheit && (
        <span className="v2-dim v2-mono" style={{
          position: 'absolute', right: 10, top: '50%',
          transform: 'translateY(-50%)', fontSize: 10,
        }}>{einheit}</span>
      )}
    </div>
  )
}

type Entwurf = Record<string, Overridewert>

/**
 * Der Editor.
 *
 * @param strategie  Die Katalogzeile — die Auslieferung.
 * @param override   Was heute in `goal_phases.parameters` steht.
 * @param zieldatum  Fuer den `anchor`-Reiter, aus `target_date`.
 * @param tdee       Fuer `cycling`, oder `null`.
 */
export function PhasenEditor({
  strategie, override, zieldatum, tdee, onClose, onAnwenden,
}: {
  strategie: Strategie
  override: Record<string, Overridewert>
  zieldatum: string | null
  tdee: number | null
  onClose: () => void
  onAnwenden: (abweichung: Record<string, Overridewert>) => void
}) {
  // `[cmd]` **Die Reiter aus der SPALTE**, mit Rueckfall wie im
  // Entwurf (`:57`: `PE_MODES[phaseId] || ["params"]`).
  const reiter = strategie.editor_modes.length > 0
    ? strategie.editor_modes
    : ['params']
  const [tab, setTab] = React.useState(reiter[0])
  const [entwurf, setEntwurf] = React.useState<Entwurf>(() => ({ ...override }))

  // `[read]` **Die Auslieferungswerte als flache Abbildung** — nur
  // die, die ein Feld im Editor haben.
  const katalog: Record<string, Overridewert> = {
    tdee_modifier: strategie.tdee_modifier,
    weight_change_target_percent: strategie.weight_change_target_percent,
    max_duration_weeks: strategie.max_duration_weeks,
    protein_per_kg: strategie.protein_per_kg,
    fat_percent: strategie.fat_percent,
  }

  const abweichung = nurAbweichung(katalog, entwurf)
  const geaendert = abweichungszahl(abweichung)

  const setzen = (feld: string, v: Overridewert) =>
    setEntwurf(d => ({ ...d, [feld]: v }))

  const zahl = (feld: string): string => {
    const v = entwurf[feld]
    return v === null || v === undefined ? '' : String(v)
  }

  // ── Der Anker, aus G-544 ────────────────────────────────────────
  const [anker, setAnker] = React.useState(zieldatum ?? '')
  const plan = React.useMemo(() => ankerplan(
    anker,
    strategie.sub_phases.map(s => ({ name: s.name, weeks: s.weeks })),
    'Zieltag'), [anker, strategie.sub_phases])

  // ── Das Kalorienradeln ──────────────────────────────────────────
  const [tage, setTage] = React.useState(5)
  const [dTraining, setDTraining] = React.useState(200)
  const [dRuhe, setDRuhe] = React.useState(-300)
  const zyklus = zyklusmittel(
    { training: dTraining, ruhe: dRuhe, trainingstage: tage }, tdee)

  // ── Der Jahresplan ──────────────────────────────────────────────
  const jahr = pruefeJahresplan(strategie.annual.map(b => ({
    phase: b.phase,
    // `[cmd]` **`annual.months` ist Text** (`"1–4"`) — die Zahl der
    // Monate ist die Spanne, nicht der Wert.
    monate: monateAusSpanne(b.months),
  })))

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" data-phasen-editor={strategie.code}
           style={{ width: 640, maxWidth: '92vw', maxHeight: '92vh' }}
           role="dialog" aria-modal="true"
           aria-label={`${strategie.label} anpassen`}
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {strategie.label} anpassen
            </div>
            {/* ══ Der Satz aus Zeile 56 ═══════════════════════════ */}
            <div className="v2-dim" data-editor-grundsatz style={{ fontSize: 11 }}>
              Persoenliche Abweichung — die Auslieferung bleibt, wie sie ist.
            </div>
          </div>
          {geaendert > 0 && (
            <span data-editor-geaendert={geaendert}>
              <Pill variant="acc">{geaendert} geaendert</Pill>
            </span>
          )}
          <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                  aria-label="Schliessen" onClick={onClose}>
            <Icon name="x" className="v2-ic" />
          </button>
        </div>

        {/* ── Die Reiter aus der Spalte ───────────────────────────── */}
        <div style={{
          display: 'flex', gap: 4, flexWrap: 'wrap', padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          {reiter.map(r => (
            <button key={r} type="button" data-editorreiter={r}
                    aria-pressed={r === tab} onClick={() => setTab(r)}
                    style={{
                      padding: '5px 10px', borderRadius: 6, fontSize: 11,
                      cursor: 'pointer',
                      background: r === tab
                        ? 'color-mix(in oklch, var(--acc-goals) 14%, var(--surface))'
                        : 'transparent',
                      border: `1px solid ${r === tab
                        ? 'color-mix(in oklch, var(--acc-goals) 40%, var(--border))'
                        : 'var(--border)'}`,
                      color: 'var(--fg)',
                      fontWeight: r === tab ? 600 : 400,
                    }}>
              {REITERTEXT[r] ?? r}
            </button>
          ))}
        </div>

        <div className="v2-modal-body" data-editor-koerper>
          {/* ── PARAMS · VARIANTS ──────────────────────────────────
              `[read]` **Dieselben Felder** — der Entwurf trennt sie
              nach Darstellung (`:110` je Variante, `:138` flach),
              **die Werte sind dieselben Spalten.** */}
          {(tab === 'params' || tab === 'variants') && (
            <div data-editorblock={tab}>
              <Feld label="TDEE-Faktor" sub="Anteil vom Erhaltungsbedarf">
                <Zahlfeld marke="tdee_modifier" wert={zahl('tdee_modifier')}
                          katalog={strategie.tdee_modifier}
                          onChange={v => setzen('tdee_modifier', v === '' ? null : Number(v))} />
              </Feld>
              <Feld label="Zielrate" sub="% Koerpergewicht je Woche">
                <Zahlfeld marke="weight_change_target_percent"
                          wert={zahl('weight_change_target_percent')}
                          katalog={strategie.weight_change_target_percent}
                          einheit="%/Wo"
                          onChange={v => setzen('weight_change_target_percent', v === '' ? null : Number(v))} />
              </Feld>
              <Feld label="Protein" sub="je kg Koerpergewicht">
                <Zahlfeld marke="protein_per_kg" wert={zahl('protein_per_kg')}
                          katalog={strategie.protein_per_kg} einheit="g/kg"
                          onChange={v => setzen('protein_per_kg', v === '' ? null : Number(v))} />
              </Feld>
              <Feld label="Fett" sub="Anteil der Kalorien">
                <Zahlfeld marke="fat_percent" wert={zahl('fat_percent')}
                          katalog={strategie.fat_percent}
                          onChange={v => setzen('fat_percent', v === '' ? null : Number(v))} />
              </Feld>
            </div>
          )}

          {/* ── DURATION ─────────────────────────────────────────── */}
          {tab === 'duration' && (
            <div data-editorblock="duration">
              <Feld label="Hoechstdauer" sub="Wochen">
                <Zahlfeld marke="max_duration_weeks" wert={zahl('max_duration_weeks')}
                          katalog={strategie.max_duration_weeks} einheit="Wo"
                          onChange={v => setzen('max_duration_weeks', v === '' ? null : Number(v))} />
              </Feld>
              {strategie.max_duration_weeks === null && (
                <div className="v2-dim" data-editor-leerhinweis
                     style={{ fontSize: 10.5, lineHeight: 1.5 }}>
                  Der Katalog fuehrt fuer diese Strategie keine Hoechstdauer.
                  Was hier steht, gilt nur fuer dich.
                </div>
              )}
            </div>
          )}

          {/* ── CYCLING ──────────────────────────────────────────── */}
          {tab === 'cycling' && (
            <div data-editorblock="cycling">
              <div className="v2-dim" style={{ fontSize: 11.5, marginBottom: 12, lineHeight: 1.55 }}>
                Das Wochenmittel wird aus der Zahl deiner Trainingstage
                gerechnet, nicht getippt.
              </div>
              <div className="v2-grid v2-g-cols-3" style={{ gap: 12 }}>
                <Feld label="Trainingstage" sub="Delta vom TDEE">
                  <Zahlfeld marke="zyklus_training" wert={String(dTraining)}
                            katalog={null} einheit="kcal"
                            onChange={v => setDTraining(Number(v) || 0)} />
                </Feld>
                <Feld label="Ruhetage" sub="Delta vom TDEE">
                  <Zahlfeld marke="zyklus_ruhe" wert={String(dRuhe)}
                            katalog={null} einheit="kcal"
                            onChange={v => setDRuhe(Number(v) || 0)} />
                </Feld>
                <Feld label="Trainingstage je Woche">
                  <Zahlfeld marke="zyklus_tage" wert={String(tage)}
                            katalog={null} einheit="d"
                            onChange={v => setTage(Number(v) || 0)} />
                </Feld>
              </div>
              <Card className="v2-card-tight" style={{ padding: 12 }}>
                <div className="v2-eyebrow">Gerechnetes Wochenmittel</div>
                {zyklus.grund === null ? (
                  <>
                    <div className="v2-num" data-zyklus-mittel={zyklus.wochenmittel}
                         style={{ fontSize: 18, fontWeight: 600 }}>
                      {zyklus.wochenmittel >= 0 ? '+' : ''}{zyklus.wochenmittel} kcal/Tag
                    </div>
                    <div className="v2-dim" style={{ fontSize: 11, marginTop: 4 }}>
                      {`${tage} × ${dTraining} + ${zyklus.ruhetage} × ${dRuhe} durch 7`}
                      {zyklus.effektiv !== null
                        ? ` · gegen TDEE ${tdee} → effektiv ${zyklus.effektiv} kcal/Tag`
                        : ' · ohne TDEE kein effektiver Wert'}
                    </div>
                  </>
                ) : (
                  <div className="v2-dim" data-zyklus-grund
                       style={{ fontSize: 11, fontStyle: 'italic' }}>
                    — {zyklus.grund}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ── ANCHOR — die Rechnung aus G-544 ──────────────────── */}
          {tab === 'anchor' && (
            <div data-editorblock="anchor">
              <div className="v2-dim" style={{ fontSize: 11.5, marginBottom: 12, lineHeight: 1.55 }}>
                Setz den Zieltag. Alles davor rechnet sich rueckwaerts —
                aus den Teilphasen des Katalogs.
              </div>
              <Feld label="Zieltag" sub="Wettkampf oder Stichtag">
                <input type="date" value={anker} data-editorfeld="anker"
                       onChange={e => setAnker(e.target.value)}
                       style={{
                         width: '100%', height: 30, background: 'var(--surface)',
                         border: '1px solid var(--border)', borderRadius: 6,
                         padding: '0 10px', fontSize: 12,
                         fontFamily: 'var(--font-mono)', color: 'var(--fg)',
                       }} />
              </Feld>
              {plan.length > 1 ? (
                <Card className="v2-card-tight" style={{ padding: 12 }}>
                  <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
                    {`Rueckwaerts gerechnet · ${gesamtWochen(plan)} Wochen`}
                  </div>
                  <table className="v2-tbl" style={{ margin: 0 }}>
                    <tbody>
                      {plan.map(z => (
                        <tr key={`${z.name}-${z.wochenVorher}`}
                            data-editor-ankerzeile={z.name}>
                          <td style={{ fontSize: 11.5 }}>{z.name}</td>
                          <td className="v2-num" style={{ textAlign: 'right', width: 108 }}>
                            {z.datum}
                          </td>
                          <td className="v2-num v2-dim"
                              style={{ textAlign: 'right', width: 80, fontSize: 10 }}>
                            {z.wochenVorher === 0 ? '0' : `${z.wochenVorher} Wo`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              ) : (
                <div className="v2-dim" data-editor-leerhinweis
                     style={{ fontSize: 10.5, lineHeight: 1.5 }}>
                  {/* `[cmd]` **Drei Faelle, drei Saetze** — der
                      mittlere ist seit G-545 der Normalfall: die
                      Teilphasen SIND da, aber ohne `weeks`. */}
                  {!anker
                    ? 'Ohne Zieltag laesst sich nichts rueckwaerts rechnen.'
                    : strategie.sub_phases.length === 0
                      ? 'Diese Strategie fuehrt keine Teilphasen — es gibt nichts zurueckzurechnen.'
                      : `${strategie.sub_phases.length} Teilphasen, aber keine `
                        + 'Wochenangabe. Seit dem Katalognachtrag (G-545) fuehrt '
                        + '`sub_phases` kein `weeks` mehr — ohne sie laesst sich '
                        + 'kein Datum zurueckrechnen.'}
                </div>
              )}
            </div>
          )}

          {/* ── SUBPHASES ────────────────────────────────────────── */}
          {/* ── SUBPHASES ────────────────────────────────────────
              `[cmd]` **Die Form hat sich mit G-545 geaendert:**
              `weeks` und `deficit` gibt es in keiner Zeile mehr,
              `cardio` ist ein Objekt. `[read]` **Deshalb Schluessel
              und Wert, wie sie dastehen** — ein festes Formular
              zeigte vier Gedankenstriche und liesse die neuen
              Felder still fallen. */}
          {tab === 'subphases' && (
            <div data-editorblock="subphases">
              {strategie.sub_phases.length > 0 ? (
                <div className="v2-col-gap" style={{ gap: 10 }}>
                  {strategie.sub_phases.map(s => (
                    <Card key={s.name} className="v2-card-tight"
                          style={{ padding: 10 }}>
                      <div className="v2-eyebrow" data-editor-teilphase={s.name}
                           style={{ marginBottom: 4 }}>{s.name}</div>
                      <FreieForm werte={s.roh} ohne={['name']} />
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="v2-dim" data-editor-leerhinweis style={{ fontSize: 10.5 }}>
                  Der Katalog fuehrt fuer diese Strategie keine Teilphasen.
                </div>
              )}
            </div>
          )}

          {/* ── REFEEDS · PEAKWEEK — freie Form ───────────────────
              `[cmd]` **`refeeds` hat ZWEI Formen im Katalog**
              (gemessen): `{every_weeks, duration_weeks}` und
              `{type, frequency, start_after_week}`. `[read]` **Ein
              festes Formular liesse die jeweils anderen Schluessel
              still fallen** — deshalb Schluessel und Wert, wie sie
              dastehen. */}
          {(tab === 'refeeds' || tab === 'peakweek') && (
            <div data-editorblock={tab}>
              <FreieForm
                werte={tab === 'refeeds'
                  ? strategie.refeeds
                  : strategie.peak_week_details} />
            </div>
          )}

          {/* ── GUARDS ───────────────────────────────────────────── */}
          {tab === 'guards' && (
            <div data-editorblock="guards">
              <div className="v2-dim" style={{ fontSize: 11.5, marginBottom: 12, lineHeight: 1.55 }}>
                Waechter sind die Regeln, die eine Anpassung ausloesen.
              </div>
              {strategie.guards.length > 0 ? (
                <div className="v2-col-gap" style={{ gap: 6 }}>
                  {strategie.guards.map((g, i) => {
                    const s = schwelleAusText(g)
                    return (
                      <Card key={i} className="v2-card-tight" style={{ padding: 10 }}>
                        <div className="v2-mono" data-editor-waechter={i}
                             style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
                          {g}
                        </div>
                        {s !== null && (
                          <div className="v2-dim" data-editor-schwelle={s}
                               style={{ fontSize: 10, marginTop: 4 }}>
                            {`Schwelle ${s} — aus dem Regeltext gelesen`}
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="v2-dim" data-editor-leerhinweis style={{ fontSize: 10.5 }}>
                  Der Katalog fuehrt fuer diese Strategie keine Waechter.
                </div>
              )}
              {/* ══ G-539/5: der BEFUND statt eines Schiebers ═══════
                  `[cmd]` **Der Entwurf zeigt je Waechter einen
                  Schwellwert-Schieber** (`:456-461`). `[cmd]` **Die
                  Schwellen sind nicht einstellbar:** `pruefeWaechter`
                  aus G-520 nimmt keine entgegen, seine Grenzen stehen
                  als Konstanten aus der Spec (`BF_SCHWELLE`, und die
                  uebrigen fest im Rumpf).

                  `[read]` **Der Auftrag, Punkt 5: „Wenn dort kein
                  Schwellwert konfigurierbar ist, ist das ein Befund
                  und kein Grund fuer einen Schieber ohne
                  Wirkung."** */}
              <div className="v2-dim" data-editor-schwellen-befund style={{
                fontSize: 10.5, lineHeight: 1.5, marginTop: 10,
                paddingTop: 8, borderTop: '1px solid var(--border)',
              }}>
                Die Schwellen lassen sich hier nicht verstellen. Die
                Waechter aus G-520 rechnen mit festen Grenzen aus der
                Phasenspec — ein Schieber haette keine Wirkung.
              </div>
            </div>
          )}

          {/* ── EXITS ────────────────────────────────────────────── */}
          {tab === 'exits' && (
            <div data-editorblock="exits">
              {strategie.exits.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {strategie.exits.map((e, i) => (
                    <li key={i} data-editor-ausstieg={i}
                        style={{ fontSize: 11.5, lineHeight: 1.6 }}>{e}</li>
                  ))}
                </ul>
              ) : (
                <div className="v2-dim" data-editor-leerhinweis style={{ fontSize: 10.5 }}>
                  Der Katalog fuehrt fuer diese Strategie keine Ausstiege.
                </div>
              )}
            </div>
          )}

          {/* ── ANNUAL ───────────────────────────────────────────── */}
          {tab === 'annual' && (
            <div data-editorblock="annual">
              {strategie.annual.length > 0 ? (
                <>
                  <table className="v2-tbl" style={{ margin: 0, marginBottom: 8 }}>
                    <tbody>
                      {strategie.annual.map(b => (
                        <tr key={b.phase} data-editor-jahresblock={b.phase}>
                          <td className="v2-num" style={{ width: 90 }}>
                            {`Monat ${b.months}`}
                          </td>
                          <td style={{ fontSize: 11.5, fontWeight: 600 }}>{b.phase}</td>
                          <td className="v2-dim" style={{ textAlign: 'right' }}>
                            {b.focus ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* `[cmd]` **`:336`: „Total must sum to 12 months."** */}
                  <div data-editor-jahressumme={jahr.summe}
                       className={jahr.stimmt ? 'v2-dim' : ''}
                       style={{
                         fontSize: 11, lineHeight: 1.5,
                         color: jahr.stimmt ? undefined : 'var(--warn)',
                       }}>
                    {jahr.stimmt
                      ? `${jahr.summe} von 12 Monaten verteilt.`
                      : `${jahr.summe} von 12 Monaten — ${jahr.satz}`}
                  </div>
                </>
              ) : (
                <div className="v2-dim" data-editor-leerhinweis style={{ fontSize: 10.5 }}>
                  Der Katalog fuehrt fuer diese Strategie keinen Jahreszyklus.
                </div>
              )}
            </div>
          )}

          {/* ── OVERRIDES ────────────────────────────────────────── */}
          {tab === 'overrides' && (
            <div data-editorblock="overrides">
              {geaendert > 0 ? (
                <table className="v2-tbl" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Feld</th>
                      <th style={{ textAlign: 'right' }}>Auslieferung</th>
                      <th style={{ textAlign: 'right' }}>Deins</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(abweichung).map(([k, v]) => (
                      <tr key={k} data-editor-abweichung={k}>
                        <td style={{ fontSize: 11.5 }}>{k}</td>
                        <td className="v2-num v2-dim" style={{ textAlign: 'right' }}>
                          {katalog[k] !== null && katalog[k] !== undefined
                            ? String(katalog[k])
                            : 'nicht hinterlegt'}
                        </td>
                        <td className="v2-num" style={{ textAlign: 'right' }}>
                          {String(v)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="v2-dim" data-editor-leerhinweis style={{ fontSize: 10.5 }}>
                  Noch keine Abweichung. Was hier nicht steht, kommt aus
                  dem Katalog und aendert sich mit ihm.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="v2-modal-f">
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>
            Abbrechen
          </button>
          {/* ══ G-539/4: „Save as my template" bleibt AUS ══════════
              `[cmd]` **Der Entwurf hat zwei Knoepfe** (`:497-498`).
              `[read]` **Der Auftrag: „braucht G-540 und bleibt bis
              dahin aus — kein Knopf, der nichts tut."** */}
          <button type="button" className="v2-btn v2-btn-primary"
                  data-editor-anwenden
                  onClick={() => onAnwenden(abweichung)}>
            <Icon name="check" className="v2-ic v2-ic-sm" />
            {geaendert > 0
              ? `${geaendert} Aenderung${geaendert === 1 ? '' : 'en'} uebernehmen`
              : 'Uebernehmen'}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Schluessel und Wert, wie sie im Katalog stehen.
 *
 * `[read]` **Kein festes Formular** — `refeeds` hat zwei Formen, und
 * ein drittes Feld in einer spaeteren Zeile fiele sonst still weg.
 */
function FreieForm({ werte, ohne = [] }: {
  werte: Record<string, unknown> | null
  /** Schluessel, die anderswo schon stehen. */
  ohne?: string[]
}) {
  const paare = werte
    ? Object.entries(werte).filter(([k]) => !ohne.includes(k))
    : []
  if (paare.length === 0) {
    return (
      <div className="v2-dim" data-editor-leerhinweis style={{ fontSize: 10.5 }}>
        Der Katalog fuehrt dazu nichts fuer diese Strategie.
      </div>
    )
  }
  return (
    <table className="v2-tbl" style={{ margin: 0 }}>
      <tbody>
        {paare.map(([k, v]) => (
          <tr key={k} data-editor-freifeld={k}>
            <td style={{ fontSize: 11.5 }}>{k.replace(/_/g, ' ')}</td>
            <td className="v2-num" style={{ textAlign: 'right' }}>
              {alsText(v)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * Ein jsonb-Wert als Text.
 *
 * `[cmd]` **`cardio` ist seit G-545 ein Objekt** mit Listen darin
 * (`{type: "LISS", minutes: [30, 40], sessions_per_week: [3, 4]}`).
 * `[read]` **`String(v)` gaebe `[object Object]`** — eine Zeile, die
 * aussieht wie ein Fehler und einen Wert verdeckt.
 */
function alsText(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean') return v ? 'ja' : 'nein'
  if (Array.isArray(v)) return v.map(alsText).join('–')
  if (typeof v === 'object') {
    return Object.entries(v as Record<string, unknown>)
      .map(([k, w]) => `${k} ${alsText(w)}`).join(' · ')
  }
  return String(v)
}

/**
 * Monate aus einer Spanne wie `"1–4"`.
 *
 * `[cmd]` **`annual.months` ist Text** — gemessen: `"1–4"`, `"5–6"`,
 * `"11"`. `[read]` **Einzelner Monat zaehlt als 1**, eine Spanne als
 * ihre Laenge einschliesslich beider Enden.
 */
export function monateAusSpanne(s: string): number {
  const teile = s.split(/[–→-]/).map(t => Number(t.trim()))
  if (teile.length === 1) return Number.isFinite(teile[0]) ? 1 : 0
  const [a, b] = teile
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0
  return b - a + 1
}
