'use client'

// Die Phase setzen — G-513.
//
// `[cmd]` **Fuenf Funktionen in der Datenbank, null Aufrufer.** Dies
// ist der Knopf, der gefehlt hat.
//
// ## Die Geste kommt aus der Vorlage, nicht von mir
//
// `[cmd]` **`module-goals-pro.jsx:262-292`:** ein Raster, eine Kachel
// je Phase, **der Klick setzt nur `preview`**. `[cmd]` **`:295-429`:**
// darunter klappt eine Vorschau auf — **kein Modal**. `[cmd]`
// **`:421`:** erst dort steht `Switch to {ph.name}`.
//
// `[read]` **Die Vorschau IST der Bestaetigungsschritt** — einen
// zweiten Dialog kennt die Vorlage nicht. **Also auch hier keiner.**
//
// ## Was die Vorlage NICHT hat, und woher es kommt
//
// `[cmd]` **Ein „Phase beenden" gibt es im ganzen Mockup nicht** —
// weder in `GoalsPhaseView` noch im Editor, und ein Grund wird
// nirgends abgefragt. `[read]` **Die Vorlage denkt das Beenden als
// Nebenwirkung des Wechsels.**
//
// `[cmd]` **Die Datenbank denkt es anders** (`111_…sql:245-253`):
// `goal_phase_start` **weist ab, solange eine Phase laeuft**, und
// `goal_phase_end` **verlangt einen Grund** (`:288`).
//
// `[read]` **Der Datenbank wird gefolgt, nicht der Vorlage** — sie
// ist die Wahrheit ueber den Ist-Zustand. **Deshalb zwei Schritte:
// beenden mit Grund, dann beginnen.**
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import {
  phaseStartenAktion, phaseBeendenAktion, vorschlagBeantwortenAktion,
  type PhaseErgebnis,
} from './phase-aktionen'
import {
  PHASENARTEN, phasenName,
  RATENPFLICHT, RATE_MIN, RATE_MAX, uebergangErlaubt,
  type Phasenart, type Ratenpflicht,
} from '../../../lib/goals/phase-regeln'
// G-534/A7: das Vorschaupanel des Entwurfs.
import { PhaseVorschau } from './phase-vorschau'
// ══ G-565/E-83: der Nutzer waehlt die Einheit ══════════════
//
// `[cmd]` **`kcalDeltaAusRate` aus `phase-regeln.ts` rundete mit
// `Math.round`** — das weicht bei negativen Haelfte-Faellen von
// Postgres ab (gemessen: -2,5 bei 55,5 kg gibt -1526,2 statt
// -1526,3). **`kcalAusRate` rundet wie die Datenbank.**
import {
  kcalAusRate, ausEinheit, inEinheit, type Rateneinheit,
} from '../../../lib/goals/zielrate-einheit'
import { EinheitenSchalter } from './einheiten-schalter'
import { einheitSetzenAktion } from './phase-aktionen'

/**
 * Was die Rate fuer diese Art sein muss — als Satz.
 *
 * `[cmd]` **Aus `goal_phases_zielrate_passt_zur_art` gelesen**,
 * nicht aus der Spec.
 */
function ratenSatz(p: Ratenpflicht | null): string {
  switch (p) {
    case 'negativ':
      return `% Koerpergewicht je Woche — hier negativ, ${RATE_MIN} bis unter 0.`
    case 'positiv':
      return `% Koerpergewicht je Woche — hier positiv, ueber 0 bis ${RATE_MAX}.`
    case 'nahe_null':
      return '% Koerpergewicht je Woche — beim Halten zwischen -0,1 und +0,1.'
    default:
      return '% Koerpergewicht je Woche.'
  }
}
import type { Phase } from '../../../lib/goals/lesen'

/** Ein Feld mit Beschriftung, wie in `modale.tsx:92`. */
function Feld({ label, sub, children }: {
  label: string; sub?: string; children: React.ReactNode
}) {
  return (
    <label style={{ display: 'block', marginBottom: 10 }}>
      <div className="v2-eyebrow" style={{ marginBottom: 4 }}>{label}</div>
      {sub && (
        <div className="v2-dim" style={{ fontSize: 10.5, marginBottom: 4 }}>
          {sub}
        </div>
      )}
      {children}
    </label>
  )
}

const FELD: React.CSSProperties = {
  width: '100%', padding: '7px 9px', fontSize: 12,
  background: 'var(--surface)', color: 'var(--fg)',
  border: '1px solid var(--border)', borderRadius: 5,
}

/** Eine Fehler- oder Erfolgszeile im Kachelkoerper. */
function Meldung({ art, text }: { art: 'fehler' | 'gut'; text: string }) {
  return (
    <div style={{
      marginTop: 10, padding: '8px 10px', borderRadius: 5, fontSize: 11.5,
      lineHeight: 1.5,
      background: art === 'gut'
        ? 'color-mix(in oklch, var(--pos) 8%, var(--surface))'
        : 'color-mix(in oklch, var(--neg) 8%, var(--surface))',
      border: `1px solid color-mix(in oklch, var(--${art === 'gut' ? 'pos' : 'neg'}) 30%, var(--border))`,
    }}>
      {text}
    </div>
  )
}

/** Heute als ISO-Tag — die Vorgabe fuer das Startdatum. */
function heute(stichtag: string): string {
  return stichtag
}

// ── Eine Phase beginnen ──────────────────────────────────────────

/**
 * Das Raster der neun Phasenarten mit Vorschau darunter.
 *
 * `[cmd]` **Neun, nicht sieben** — die Vorlage kennt sieben
 * (`GOAL_PHASES`), der CHECK erlaubt neun. `[read]` **Der CHECK
 * gewinnt:** wer `mini_cut` nicht anbietet, verbietet einen Zustand,
 * den die Datenbank erlaubt (G-515, W2).
 */
export function PhaseBeginnen({ stichtag, aktiv, gewichtKg, einheitVorgabe }: {
  stichtag: string
  /** Die laufende Phase — solange eine da ist, sperrt die Datenbank. */
  aktiv: Phase | null
  /**
   * `[cmd]` **G-519/A5: aus `public.profiles.body_weight_kg`** —
   * NICHT geraten. `[read]` **Fehlt es, faellt die kcal-Anzeige
   * weg, mit Grund.**
   */
  gewichtKg: number | null
  /**
   * `[cmd]` **G-565/A4: die zuletzt gewaehlte Einheit des Nutzers**
   * — aus `user_display_preferences`, nicht aus der Phase (E-83).
   */
  einheitVorgabe: Rateneinheit
}) {
  const [wahl, setWahl] = React.useState<Phasenart | null>(null)
  const [start, setStart] = React.useState(heute(stichtag))
  const [ende, setEnde] = React.useState('')
  const [variante, setVariante] = React.useState('')
  const [laeuft, setLaeuft] = React.useState(false)
  const [erg, setErg] = React.useState<PhaseErgebnis | null>(null)
  // G-519/A5: die Rate in % Koerpergewicht je Woche — die
  // gespeicherte Groesse (E1).
  const [rate, setRate] = React.useState('')

  const gewaehlt = PHASENARTEN.find(p => p.id === wahl) ?? null
  const pflicht = wahl ? RATENPFLICHT[wahl] : null
  const rateZahl = rate.trim() === '' ? null : Number(rate)
  const rateGueltig = rateZahl !== null && Number.isFinite(rateZahl)
  // ══ G-565/A1: eine Groesse, zwei Einheiten, EIN Feld ═══════
  //
  // `[read]` **Der Zustand bleibt die RATE** — das Feld zeigt sie
  // nur umgerechnet. **Zwei Zustaende waeren zwei Wahrheiten
  // (G-529).**
  const [einheit, setEinheit] = React.useState<Rateneinheit>(einheitVorgabe)
  const kcalDelta = kcalAusRate(rateGueltig ? rateZahl : null, gewichtKg)
  // Was im Feld steht: die Rate, in der gewaehlten Einheit.
  const feldwert = einheit === 'prozent'
    ? rate
    : (rateGueltig ? String(kcalAusRate(rateZahl, gewichtKg) ?? '') : rate)

  async function beginnen() {
    if (!wahl) return
    setLaeuft(true)
    setErg(null)
    const r = await phaseStartenAktion({
      phase_type: wahl,
      gueltig_ab: start,
      projected_end_date: ende || null,
      variant: variante.trim() || null,
      // `[read]` **Nur mitschicken, wo die Art eine traegt** — die
      // uebrigen fuenf muessen `null` bleiben (CHECK).
      zielrate_pct_kg_woche: pflicht === 'keine' || !rateGueltig
        ? null : rateZahl,
    })
    setErg(r)
    setLaeuft(false)
    // `[read]` **Nur bei Erfolg zuklappen** — bei einem Fehler bleibt
    // die Eingabe stehen, sonst tippt der Nutzer alles neu.
    if (r.ok) setWahl(null)
  }

  const feldFehler = (feld: string) =>
    erg && !erg.ok ? erg.felder.find(f => f.feld === feld)?.text : undefined

  return (
    <Card title="Phase beginnen"
          // G-534/A1: hier stand „aus dem CHECK von goal_phases" —
          // der Nutzer braucht die Zahl, nicht ihre Herkunft.
          sub={`${PHASENARTEN.length} Arten`}>
      {/* `[read]` **Laeuft eine Phase, sperrt die Datenbank den
          Start** — das gehoert VOR das Raster, nicht als Fehler
          hinterher. */}
      {aktiv && (
        <div className="v2-muted" style={{
          fontSize: 11.5, lineHeight: 1.55, marginBottom: 12,
        }}>
          Es läuft die Phase <strong>{phasenName(aktiv.phase_type)}</strong>
          {aktiv.gueltig_ab && ` seit ${aktiv.gueltig_ab}`}. Eine neue
          beginnt erst, wenn diese beendet ist — mit Grund, damit der
          Verlauf lesbar bleibt.
        </div>
      )}

      <div className="v2-grid" style={{
        gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))',
        opacity: aktiv ? 0.5 : 1,
        pointerEvents: aktiv ? 'none' : 'auto',
      }}>
        {PHASENARTEN.map(ph => {
          const an = ph.id === wahl
          return (
            <button key={ph.id} type="button"
                    data-phasenwahl={ph.id}
                    onClick={() => setWahl(an ? null : ph.id)}
                    style={{
                      textAlign: 'left', padding: 10, borderRadius: 7,
                      cursor: 'pointer',
                      background: an
                        ? 'color-mix(in oklch, var(--acc-goals) 12%, var(--surface))'
                        : 'var(--surface)',
                      border: `1px solid ${an
                        ? 'color-mix(in oklch, var(--acc-goals) 40%, var(--border))'
                        : 'var(--border)'}`,
                      color: 'var(--fg)',
                    }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 3 }}>
                {ph.name}
              </div>
              <div className="v2-dim" style={{ fontSize: 10, lineHeight: 1.4 }}>
                {ph.zweck}
              </div>
            </button>
          )
        })}
      </div>

      {/* ══ Die Vorschau — die Vorlage klappt sie unter dem Raster
          auf, nicht als Modal (module-goals-pro.jsx:295). ══ */}
      {gewaehlt && !aktiv && (
        <>
          <div className="v2-divider" />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{gewaehlt.name}</span>
            <Pill variant="acc">wird begonnen</Pill>
          </div>

          <Feld label="Beginnt am"
                sub="Vorgabe ist der gewählte Tag im Kopf.">
            <input type="date" style={FELD} value={start}
                   data-phasenfeld="start"
                   onChange={e => setStart(e.target.value)} />
          </Feld>
          {feldFehler('gueltig_ab') && <Meldung art="fehler" text={feldFehler('gueltig_ab')!} />}

          <Feld label="Geplantes Ende"
                sub="Freiwillig. Erst dadurch kann ein Wechsel vorgeschlagen werden.">
            <input type="date" style={FELD} value={ende} min={start}
                   data-phasenfeld="ende"
                   onChange={e => setEnde(e.target.value)} />
          </Feld>
          {feldFehler('projected_end_date')
            && <Meldung art="fehler" text={feldFehler('projected_end_date')!} />}

          {/* `[cmd]` **`variant` ist ein freies Textfeld** (`text`,
              kein CHECK) — live stehen dort `moderate`, `baseline`,
              `performance_placeholder`. `[read]` **Keine Auswahlliste
              erfinden:** eine Liste waere eine Zusage, die das Schema
              nicht deckt. */}
          {/* ══ G-519/A5: die Zielrate ═══════════════════════════════
              `[cmd]` **Die Rate ist die GESPEICHERTE Groesse** (E1),
              das Kaloriendelta ist eine Ableitung.
              `[cmd]` **Beide stehen da** (N13). */}
          {pflicht !== 'keine' ? (
            <>
              {/* ══ G-565/A1: EIN Feld, zwei Einheiten ══════════
                  `[read]` **Gespeichert wird die Rate** — wer kcal
                  eintraegt, bekommt sie umgerechnet, und zwar mit
                  derselben Rundung wie die Datenbank. */}
              <Feld label="Zielrate"
                    sub={ratenSatz(pflicht)}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input type="number"
                         step={einheit === 'prozent' ? '0.05' : '10'}
                         style={{ ...FELD, flex: 1 }} value={feldwert}
                         min={einheit === 'prozent' ? RATE_MIN : undefined}
                         max={einheit === 'prozent' ? RATE_MAX : undefined}
                         data-phasenfeld="zielrate"
                         data-feldeinheit={einheit}
                         placeholder={pflicht === 'nahe_null' ? '0' : ''}
                         onChange={e => {
                           const roh = e.target.value
                           if (roh === '') { setRate(''); return }
                           // `[read]` **Immer auf die Rate zurueck** —
                           // der Zustand kennt nur eine Groesse.
                           const r = ausEinheit(Number(roh), gewichtKg, einheit)
                           setRate(r === null ? roh : String(r))
                         }} />
                  <EinheitenSchalter einheit={einheit} gewichtKg={gewichtKg}
                                     onWechsel={e => {
                                       setEinheit(e)
                                       void einheitSetzenAktion(e)
                                     }} />
                </div>
              </Feld>
              {feldFehler('zielrate_pct_kg_woche')
                && <Meldung art="fehler" text={feldFehler('zielrate_pct_kg_woche')!} />}

              {/* `[read]` **Die zweite Zahl, immer daneben** — wer
                  eine Rate waehlt, sieht sofort, was sie am Tag
                  bedeutet. */}
              <div className="v2-dim" style={{
                fontSize: 11, lineHeight: 1.5, marginTop: -4, marginBottom: 10,
              }} data-kcal-delta>
                {/* `[read]` **Immer die ANDERE Einheit** — wer in
                    Prozent tippt, sieht die Kilokalorien; wer in
                    Kilokalorien tippt, sieht die Rate. **Beide
                    stehen da** (N13). */}
                {einheit === 'kcal' && rateGueltig
                  ? <>
                      Das sind <strong>{rateZahl > 0 ? '+' : ''}{rateZahl} % KG/Woche</strong>
                      {' '}bei {gewichtKg} kg.
                    </>
                  : kcalDelta !== null
                  ? <>
                      Das sind <strong>{kcalDelta > 0 ? '+' : ''}{kcalDelta} kcal/Tag</strong>
                      {' '}bei {gewichtKg} kg.
                    </>
                  // `[read]` **Kein Gewicht, keine kcal-Anzeige** —
                  // und der Grund steht dabei (E-72).
                  : gewichtKg === null
                    ? <>Ohne Koerpergewicht im Profil laesst sich das
                        Kaloriendelta nicht ausrechnen.</>
                    : <>Trag eine Rate ein, dann steht hier das
                        Kaloriendelta je Tag.</>}
              </div>

              {/* ── Das Band je Variante: es gibt KEINS ──────────
                  `[cmd]` **`goals.phase_rate_rules` hat 0 Zeilen**,
                  gemessen 2026-09-29. `[read]` **Die Baender je
                  Variante existieren nicht als Daten** — sie warten
                  auf G-521 A1, weil vier tragende Zahlen keinen
                  Seitenbeleg haben.
                  `[read]` **Also ein Strich mit Grund, keine
                  erfundene Spanne und keine aus der Spec
                  abgetippte Zahl.** */}
              {/* `[cmd]` **G-534/A1: hier standen Tabellenname und
                  Punktnummer.** `[read]` **Der Nutzer braucht die
                  Grenze, nicht unsere Ablage.** */}
              <div className="v2-dim" style={{
                fontSize: 10.5, lineHeight: 1.5, marginBottom: 10,
              }} data-bandhinweis>
                Empfohlene Werte je Variante gibt es noch nicht. Erlaubt
                ist {RATE_MIN} bis {RATE_MAX} % pro Woche.
              </div>
            </>
          ) : (
            // `[read]` **Fuenf Arten tragen KEINE Rate** — der CHECK
            // verlangt `NULL`. **Das Feld wegzulassen ist richtig,
            // aber es muss gesagt werden.**
            //
            // `[cmd]` **G-534/A1: hier standen CHECK-Name,
            // Funktionsname und Hinderniswert.** `[read]` **Die
            // WIRKUNG bleibt, die Herkunft geht.**
            <div className="v2-muted" style={{
              fontSize: 11.5, lineHeight: 1.55, marginBottom: 10,
            }} data-ohne-rate>
              <strong>{gewaehlt.name}</strong> laeuft ohne Zielrate — und
              damit ohne eigenes Kalorienziel.
            </div>
          )}

          <Feld label="Variante"
                sub={'Freier Text, z. B. „moderate“. Die Tabelle schreibt nichts vor.'}>
            <input type="text" style={FELD} value={variante}
                   data-phasenfeld="variante" placeholder="optional"
                   onChange={e => setVariante(e.target.value)} />
          </Feld>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="button" className="v2-btn v2-btn-primary"
                    data-phase-start disabled={laeuft} onClick={beginnen}>
              {laeuft ? 'Beginnt …' : `${gewaehlt.name} beginnen`}
            </button>
            <button type="button" className="v2-btn"
                    disabled={laeuft} onClick={() => { setWahl(null); setErg(null) }}>
              Abbrechen
            </button>
          </div>
        </>
      )}

      {erg && !erg.ok && erg.felder.length === 0
        && <Meldung art="fehler" text={erg.text} />}
      {erg?.ok && <Meldung art="gut" text="Die Phase läuft." />}

      {/* `[read]` **Was `parameters` angeht, ist die Kachel ehrlich:**
          sie schreibt nichts hinein, weil nicht entschieden ist, wie
          der Schluessel heisst. */}
      {/* `[cmd]` **G-534/A1: hier stand ein Absatz ueber
          `parameters` und den offenen Schluesselnamen.** `[read]`
          **Richtig, aber eine Entwicklernotiz** — sie steht jetzt im
          Punkt. */}
    </Card>
  )
}

// ── Eine Phase beenden ───────────────────────────────────────────

/**
 * Die laufende Phase beenden.
 *
 * `[cmd]` **Der Grund ist Pflicht** — `goal_phase_end` weist einen
 * leeren mit `22023` ab. `[read]` **Das Feld sagt das vorher**,
 * statt den Nutzer in die Datenbankmeldung laufen zu lassen.
 */
/**
 * Das Raster mit Vorschau — die Geste des Entwurfs, bei laufender
 * Phase.
 *
 * `[cmd]` **`module-goals-pro.jsx:262-292`:** ein Raster, der Klick
 * setzt `preview`; **`:295-429`** klappt die Vorschau darunter auf;
 * **`:421`** traegt `Switch to {name}`.
 *
 * `[read]` **Der Direktwechsel ist bei uns ZWEI Handgriffe** —
 * `goal_phase_start` weist ab, solange eine Phase laeuft (`23505`).
 * `[read]` **Die Vorschau fuehrt deshalb zum Beenden**, statt einen
 * Wechsel vorzutaeuschen, den die Datenbank nicht kennt.
 */
export function PhaseWechseln({ laufend, onBeenden }: {
  laufend: Phasenart | null
  /** Ruft den Beenden-Weg auf — der erste der zwei Handgriffe. */
  onBeenden: () => void
}) {
  const [wahl, setWahl] = React.useState<Phasenart | null>(null)

  return (
    <Card title="Phase wechseln"
          sub="waehle eine Art, um sie zu vergleichen">
      <div className="v2-grid" style={{
        gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))',
      }}>
        {PHASENARTEN.map(ph => {
          const an = ph.id === wahl
          const laeuftGerade = ph.id === laufend
          return (
            <button key={ph.id} type="button"
                    data-wechselwahl={ph.id}
                    disabled={laeuftGerade}
                    onClick={() => setWahl(an ? null : ph.id)}
                    style={{
                      textAlign: 'left', padding: 10, borderRadius: 7,
                      cursor: laeuftGerade ? 'default' : 'pointer',
                      opacity: laeuftGerade ? 0.55 : 1,
                      background: an
                        ? 'color-mix(in oklch, var(--acc-goals) 12%, var(--surface))'
                        : 'var(--surface)',
                      border: `1px solid ${an
                        ? 'color-mix(in oklch, var(--acc-goals) 40%, var(--border))'
                        : 'var(--border)'}`,
                      color: 'var(--fg)',
                    }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3,
              }}>
                <span style={{ fontSize: 11.5, fontWeight: 600 }}>{ph.name}</span>
                {laeuftGerade && <Pill variant="acc" style={{ fontSize: 9 }}>laeuft</Pill>}
              </div>
              {/* [cmd] module-goals-pro.jsx:286-287 — die zwei Marken */}
              {!laeuftGerade && (
                <span className="v2-dim v2-mono" style={{ fontSize: 9.5 }}>
                  {uebergangErlaubt(laufend, ph.id) ? '→ empfohlen' : 'waehlbar'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {wahl && (
        <PhaseVorschau art={wahl} laufend={laufend}
                       onSchliessen={() => setWahl(null)}
                       onWechseln={onBeenden} />
      )}
    </Card>
  )
}

export function PhaseBeenden({ phase, stichtag }: {
  phase: Phase; stichtag: string
}) {
  const [offen, setOffen] = React.useState(false)
  const [grund, setGrund] = React.useState('')
  const [ende, setEnde] = React.useState(stichtag)
  const [laeuft, setLaeuft] = React.useState(false)
  const [erg, setErg] = React.useState<PhaseErgebnis | null>(null)

  async function beenden() {
    setLaeuft(true)
    setErg(null)
    const r = await phaseBeendenAktion(phase.phase_id, grund, ende)
    setErg(r)
    setLaeuft(false)
    if (r.ok) { setOffen(false); setGrund('') }
  }

  const grundFehler = erg && !erg.ok
    ? erg.felder.find(f => f.feld === 'grund')?.text : undefined

  return (
    <Card title="Phase beenden"
          sub="mit Grund — er ist die einzige Spur, warum sie endete">
      {!offen
        ? (
          <>
            <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
              <strong>{phasenName(phase.phase_type)}</strong>
              {phase.gueltig_ab && ` läuft seit ${phase.gueltig_ab}`}.
              Nach dem Beenden kann eine neue Phase beginnen.
            </div>
            <div style={{ marginTop: 10 }}>
              <button type="button" className="v2-btn" data-phase-beenden-oeffnen
                      onClick={() => setOffen(true)}>
                <Icon name="check" className="v2-ic v2-ic-sm" /> Beenden
              </button>
            </div>
          </>
        )
        : (
          <>
            <Feld label="Grund" sub="Pflichtfeld — goal_phase_end weist einen leeren ab.">
              <textarea style={{ ...FELD, minHeight: 64, resize: 'vertical' }}
                        value={grund} data-phasenfeld="grund"
                        placeholder="z. B. Zielgewicht erreicht"
                        onChange={e => setGrund(e.target.value)} />
            </Feld>
            {grundFehler && <Meldung art="fehler" text={grundFehler} />}

            <Feld label="Endet am"
                  sub="Darf nicht vor dem Beginn liegen.">
              <input type="date" style={FELD} value={ende}
                     min={phase.gueltig_ab ?? undefined}
                     data-phasenfeld="endedatum"
                     onChange={e => setEnde(e.target.value)} />
            </Feld>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button type="button" className="v2-btn v2-btn-primary"
                      data-phase-beenden disabled={laeuft || !grund.trim()}
                      onClick={beenden}>
                {laeuft ? 'Beendet …' : 'Phase beenden'}
              </button>
              <button type="button" className="v2-btn" disabled={laeuft}
                      onClick={() => { setOffen(false); setErg(null) }}>
                Abbrechen
              </button>
            </div>
          </>
        )}

      {erg && !erg.ok && !grundFehler && <Meldung art="fehler" text={erg.text} />}
      {erg?.ok && <Meldung art="gut" text="Die Phase ist beendet." />}
    </Card>
  )
}

// ── Der Vorschlagsweg ────────────────────────────────────────────

/**
 * Der Wechselvorschlag, wenn die Datenbank einen hat.
 *
 * `[cmd]` **`phase_transition_recommendation`
 * (`422_…sql:39-52`) liefert nur dann etwas, wenn ZWEI Bedingungen
 * zutreffen:**
 *
 *     projected_end_date <= heute      die Phase ist ueberfaellig
 *     >= 2 Koerpermessungen            es gibt eine Grundlage
 *
 * `[read]` **Deshalb ist die Kachel meistens leer** — und der
 * Leerhinweis nennt beide Bedingungen, statt „kein Vorschlag" zu
 * sagen (E-72).
 *
 * `[cmd]` **`phase_transition_respond` SCHREIBT NUR DIE ANTWORT** —
 * **auch ein Ja wechselt nichts.** `[read]` **Die Kachel behauptet
 * deshalb nichts anderes:** nach dem Annehmen steht da, dass das
 * Beenden der naechste Handgriff ist.
 */
export function PhaseVorschlag({ phase, vorschlag }: {
  phase: Phase
  vorschlag: { recommended_next: string | null; transition_reason: string | null } | null
}) {
  const [laeuft, setLaeuft] = React.useState(false)
  const [erg, setErg] = React.useState<PhaseErgebnis | null>(null)
  const [gewaehlt, setGewaehlt] = React.useState<'accepted' | 'rejected' | null>(null)

  async function antworten(a: 'accepted' | 'rejected') {
    setLaeuft(true)
    setErg(null)
    const r = await vorschlagBeantwortenAktion(phase.phase_id, a)
    setErg(r)
    setGewaehlt(r.ok ? a : null)
    setLaeuft(false)
  }

  return (
    <Card title="Wechselvorschlag" sub="aus phase_transition_recommendation">
      {!vorschlag?.recommended_next
        ? (
          // `[read]` **Ein benannter Leerhinweis, keine Null** (E-72)
          // — er nennt die zwei Bedingungen, die die Funktion stellt.
          <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Kein Vorschlag. Die Regel greift erst, wenn das
            <strong> geplante Ende überschritten</strong> ist und
            <strong> mindestens zwei Körpermessungen</strong> vorliegen.
            {!phase.projected_end_date
              && ' Für diese Phase ist kein geplantes Ende gesetzt.'}
          </div>
        )
        : (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
            }}>
              <Icon name="arrow_right" className="v2-ic v2-ic-sm"
                    style={{ color: 'var(--acc-train)' }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {phasenName(phase.phase_type)} → {phasenName(vorschlag.recommended_next)}
              </span>
            </div>
            {vorschlag.transition_reason && (
              <div className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                {vorschlag.transition_reason}
              </div>
            )}

            {!gewaehlt && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button type="button" className="v2-btn v2-btn-primary"
                        data-vorschlag="accepted" disabled={laeuft}
                        onClick={() => antworten('accepted')}>
                  Annehmen
                </button>
                <button type="button" className="v2-btn"
                        data-vorschlag="rejected" disabled={laeuft}
                        onClick={() => antworten('rejected')}>
                  Bleiben
                </button>
              </div>
            )}

            {/* `[read]` **Kein „gewechselt".** Die Funktion hat nur
                die Antwort gespeichert — der Satz sagt, was wirklich
                geschehen ist und was noch fehlt. */}
            {gewaehlt === 'accepted' && (
              <Meldung art="gut" text={
                'Die Zustimmung ist gespeichert. Gewechselt ist damit '
                + 'noch nichts — beende die Phase, dann beginnt die neue.'} />
            )}
            {gewaehlt === 'rejected' && (
              <Meldung art="gut" text="Notiert — die Phase läuft weiter." />
            )}
          </>
        )}

      {erg && !erg.ok && <Meldung art="fehler" text={erg.text} />}
    </Card>
  )
}
