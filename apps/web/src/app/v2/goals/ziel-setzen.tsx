'use client'

// G-628 — „Ziel setzen" nach dem Entwurf (Teil 1).
//
// `[cmd]` **Vorlage `docs/spezifikation/goals-ziel-setzen/`** — README,
// `entwurf/ZielSetzen.dc.html` fuer Aufbau, Texte und Zustaende, bei
// Abweichung das Dossier Kap. 8.1–8.3. Tom 08.10. 12:16: *„dieser stand
// ist fuer mich vertretbar kannst umsetzen"*.
//
// `[read]` **Ersetzt das Modal „New goal" vollstaendig:** keine sechs
// Typ-Knoepfe, kein getippter Istwert, keine Einheit als Freitext, keine
// Prioritaet, keine Attrappe „Linked modules" (Dossier 8.3, „Faellt weg").
//
// `[read]` **Teil 1 baut Schritt 0 und Weg A.** Die Pruefungen nach Grad
// (Teil 2, G-626) und Weg B (Teil 3, G-617, `messziel-setzen.tsx`) stehen;
// „Eigene Werte" (Teil 4, G-625) folgt.
//
// `[read]` **Die Rechnung steht in `lib/goals/zielrechnung.ts`** — eine
// Stelle fuer drei Groessen, Tempo, kcal und Protein.
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@lumeos/ui'

import { GField, GInput, GModal, Karte } from './modale'
import { Befunde } from './befunde'
import { phasenzielAnlegenAktion, zielPruefenAktion, zielSpeichern } from './ziel-aktionen'
import {
  bestaetigteSchluessel, waechterSatz, weiterErlaubt, type Pruefung,
} from '../../../lib/goals/zielpruefung'
import { messungAnlegenAktion } from './koerpermass-aktionen'
import { MesszielSetzen } from './messziel-setzen'
import {
  fmt, letzteGewichtsmessung, rechneZiel, richtungsVorzeichen, tempoGespeichert, type Groesse,
} from '../../../lib/goals/zielrechnung'
import {
  gesperrt, naechsteNamen, planStrategien, richtungen, varianten,
} from '../../../lib/goals/zielwahl'
import { phasenartFuerStrategie } from '../../../lib/goals/strategie-regeln'
import { unterartFuer } from '../../../lib/goals/ziel-arten'
import { pruefeRate, type Phasenart } from '../../../lib/goals/phase-regeln'

import type { Strategie } from '../../../lib/goals/strategie-read'
import type { Koerpermessung, ZielFortschritt, Zielphase } from '../../../lib/goals/lesen'

type Schritt = 's0' | 'A1' | 'A2' | 'A3' | 'B1' | 'fertig'

const datumDe = (iso: string | null) => iso ? iso.split('-').reverse().join('.') : '–'
const zahlAus = (s: string) => { const n = Number(s.replace(',', '.')); return s.trim() !== '' && Number.isFinite(n) ? n : null }


export function ZielSetzen({ onClose, strategien, erfahrung, ziele, phasen, messungen, tdee, heute, start }: {
  onClose: () => void
  strategien: Strategie[]
  erfahrung: string | null
  ziele: ZielFortschritt[]
  phasen: Zielphase[]
  messungen: Koerpermessung[]
  tdee: number | null
  heute: string
  /** „+ Messziel" springt direkt zu B1. */
  start?: 'B1'
}) {
  const router = useRouter()
  const [schritt, setSchritt] = React.useState<Schritt>(start ?? 's0')
  const [gruppe, setGruppe] = React.useState<string | null>(null)
  const [gewichtHeute, setGewichtHeute] = React.useState('')
  const [gemessen, setGemessen] = React.useState<number | null>(null)
  const [fest, setFest] = React.useState<Groesse[]>([])
  const [zielText, setZielText] = React.useState('')
  const [datum, setDatum] = React.useState('')
  const [programm, setProgramm] = React.useState<string | null>(null)
  const [listeOffen, setListeOffen] = React.useState(false)
  const [titel, setTitel] = React.useState('')
  const [wahl, setWahl] = React.useState<'pausieren' | 'beenden' | null>(null)
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  // `[cmd]` **G-553: ein Tokenfehler ist kein Datenfehler** — sonst
  // aendert der Nutzer seine Eingaben, und das Problem ist die Anmeldung.
  const [sitzungsfehler, setSitzungsfehler] = React.useState(false)
  // `[cmd]` **Gemessen am Schirm 2026-10-08:** nach dem Start laedt die
  // Seite neu, und `steuerung` ist dann das NEUE Ziel — die Meldung nannte
  // „„G-628 Probe" ist pausiert". Deshalb beim Start festhalten.
  const [fertigSatz, setFertigSatz] = React.useState('')
  // ── G-628 Teil 2 ──────────────────────────────────────────────────
  // `[read]` **„später starten" (Dossier 8.2, A3)** — das Startdatum ist
  // auch der Stichtag der Rechnung und der Pruefung (`gueltig_ab`).
  const [startdatum, setStartdatum] = React.useState(heute)
  const [spaeterOffen, setSpaeterOffen] = React.useState(false)
  // `[read]` **Die Befunde kommen aus `goals.ziel_grenzen_pruefen`** (G-626) —
  // keine Regel, kein Grenzwert in dieser Datei.
  const [pruefung, setPruefung] = React.useState<Pruefung | null>(null)
  const [bestaetigt, setBestaetigt] = React.useState<Set<string>>(new Set())

  // ── Gemessen, nicht getippt (Dossier 8.2, A1) ────────────────────
  // `[read]` **Die juengste Gewichtsmessung der letzten 14 Tage**; fehlt
  // sie, fragt A1 nach „Gewicht heute" — eine MESSUNG, kein Zielfeld.
  const letzte = React.useMemo(() => letzteGewichtsmessung(messungen, heute), [messungen, heute])
  const startKg = gemessen ?? letzte?.weight_kg ?? null

  // ── Laeuft schon eine Steuerung? ─────────────────────────────────
  const steuerung = ziele.find(z => z.status === 'active' && phasen.some(p => p.goal_id === z.goal_id)) ?? null
  const steuerVariante = steuerung
    ? strategien.find(s => s.code === phasen.find(p => p.goal_id === steuerung.goal_id)?.strategie_code) ?? null
    : null

  const richtungsListe = richtungen(strategien)
  const richtung = richtungsListe.find(r => r.gruppe === gruppe) ?? null
  const liste = gruppe ? varianten(strategien, gruppe) : []
  const vz = richtungsVorzeichen(liste)
  // `[read]` **Die TDEE des Waechters** (`tdee_basis_am`), sobald die
  // Pruefung sie liefert — sonst die der Seite. Eine Zahl, nicht zwei.
  const tdeeBasis = pruefung?.stand === 'geprueft' && pruefung.tdee !== null ? pruefung.tdee : tdee
  const ergebnis = gruppe && startKg !== null ? rechneZiel({
    varianten: liste, startKg, heute: startdatum, fest,
    ziel: zahlAus(zielText), datum: datum || null, programm, grad: erfahrung, tdee: tdeeBasis,
  }) : null
  const p = ergebnis?.programm ?? null
  const phasenart = p ? phasenartFuerStrategie(p.code, p.category) as Phasenart | null : null
  const tempo = ergebnis?.tempoPct !== null && ergebnis?.tempoPct !== undefined
    ? tempoGespeichert(ergebnis.tempoPct) : null
  const rateFehler = phasenart ? pruefeRate(phasenart, vz === 0 ? null : tempo)[0]?.text ?? null : null

  // ── Die Pruefung, live (A2/A3) ───────────────────────────────────
  // `[read]` **Dieselben Eingaben, die der Waechter beim Schreiben nimmt:**
  // Start, Ziel, Startdatum, Zieldatum, Programm, Tempo. Eine spaete
  // Antwort ueberschreibt keine neuere (`lauf`).
  const pruefZiel = vz === 0 ? null : ergebnis?.ziel ?? null
  const pruefDatum = ergebnis?.datum ?? null
  const pruefbar = !!(gruppe && p && startKg !== null && (schritt === 'A2' || schritt === 'A3')
    && (vz === 0 || (ergebnis?.wochen !== null && !ergebnis?.fehler)))
  const lauf = React.useRef(0)
  /** Eine Pruefung mit den aktuellen Eingaben; eine spaete Antwort ueberschreibt keine neuere. */
  const pruefeJetzt = React.useCallback(async (): Promise<Pruefung | null> => {
    if (!gruppe || !p || startKg === null) return null
    const nr = ++lauf.current
    const r = await zielPruefenAktion({
      richtung: gruppe, startKg, zielKg: pruefZiel, startdatum, zieldatum: pruefDatum,
      programm: p.code, tempo: vz === 0 ? null : tempo,
    })
    if (nr === lauf.current) setPruefung(r)
    return r
  }, [gruppe, p, startKg, pruefZiel, pruefDatum, startdatum, vz, tempo])
  React.useEffect(() => {
    if (!pruefbar) { setPruefung(null); return }
    const t = setTimeout(() => { void pruefeJetzt() }, 350)
    return () => clearTimeout(t)
  }, [pruefbar, pruefeJetzt])
  const befunde = pruefung?.stand === 'geprueft' ? pruefung.befunde : []
  const pruefungFrei = weiterErlaubt(pruefung, bestaetigt)
  const planerFrei = planStrategien(strategien).some(s => !gesperrt(s, erfahrung))

  /** Festlegen: hoechstens zwei — das aelteste faellt (Dossier 8.2, drei Groessen). */
  function feststellen(g: Groesse, an = true) {
    setFest(f => {
      const ohne = f.filter(x => x !== g)
      return an ? [...ohne, g].slice(-2) : ohne
    })
  }

  const titelVorschlag = !richtung ? '' : vz === 0
    ? `Halten um ${fmt(startKg ?? 0)} kg`
    : `${richtung.standard.label} auf ${ergebnis?.ziel !== null && ergebnis?.ziel !== undefined ? fmt(ergebnis.ziel) : '?'} kg`

  async function messungSpeichern() {
    const kg = zahlAus(gewichtHeute)
    if (kg === null) return
    setLaeuft(true); setFehler(null)
    const jetzt = new Date()
    const r = await messungAnlegenAktion({
      measurement_date: heute,
      measurement_time: `${String(jetzt.getHours()).padStart(2, '0')}:${String(jetzt.getMinutes()).padStart(2, '0')}`,
      weight_kg: String(kg), body_fat_pct: '', bf_method: '', notes: '',
    })
    setLaeuft(false)
    if (r.ok) { setGemessen(kg); router.refresh() } else setFehler(r.text)
  }

  async function starten() {
    if (!p || !phasenart || startKg === null || !ergebnis) return
    setLaeuft(true); setFehler(null); setSitzungsfehler(false)
    // ── 1 · die laufende Steuerung pausieren oder beenden ──────────
    if (steuerung) {
      const r = await zielSpeichern(steuerung.goal_id, { status: wahl === 'pausieren' ? 'on_hold' : 'abandoned' })
      if (!r.ok) { setLaeuft(false); setFehler(r.fehler); return }
    }
    // ── 2 · Ziel und Phase in einem Schritt (G-554) ────────────────
    // `[cmd]` **G-618: kein Platz mehr** — `uq_user_goals_active_slot` gibt
    // es live nicht (2026-10-09); `priority` ist NOT NULL ohne Vorgabe, das
    // eine Steuerziel traegt 1. Messziele begrenzt das nicht.
    const platz = 1
    const r = await phasenzielAnlegenAktion({
      ziel: {
        goal_type: 'body_composition',
        subtype: unterartFuer('body_comp', p.category),
        title: titel.trim() || titelVorschlag,
        gueltig_ab: startdatum,
        priority: platz,
        start_value: startKg, current_value: startKg,
        target_value: vz === 0 ? null : ergebnis.ziel,
        target_unit: 'kg',
        target_date: ergebnis.datum,
      },
      phase: {
        phase_type: phasenart, strategie_code: p.code, zielrate_pct_kg_woche: vz === 0 ? null : tempo,
        // G-626: die bestaetigten Warnschluessel — der Waechter liest genau diese.
        parameters: { g626_confirmed_warnings: bestaetigteSchluessel(pruefung, bestaetigt) },
      },
    })
    setLaeuft(false)
    if (!r.ok) {
      // `[read]` **Zurueck, was Schritt 1 geaendert hat** — sonst stuende
      // der Nutzer ohne Steuerung da.
      if (steuerung) await zielSpeichern(steuerung.goal_id, { status: 'active' })
      setSitzungsfehler(r.art === 'sitzung')
      // `[read]` **G626_BLOCK / G626_CONFIRM als Satz**, nicht als Code.
      // `[cmd]` **Der Waechter kann einen Schluessel melden, den die Vorschau
      // nicht kannte** (Grad, Groesse oder Datum haben sich dazwischen
      // geaendert). Deshalb sofort neu pruefen: die neue Warnung steht dann
      // mit Haken da, und der Satz traegt ihren Hinweistext.
      if (/G626_(BLOCK|CONFIRM):/.test(r.fehler)) {
        const neu = await pruefeJetzt()
        const neueBefunde = neu?.stand === 'geprueft' ? neu.befunde : befunde
        setFehler(waechterSatz(r.fehler, neueBefunde) ?? r.fehler)
      } else {
        setFehler(r.fehler)
      }
      return
    }
    setFertigSatz(steuerung
      ? `„${steuerung.title}“ ist ${wahl === 'pausieren' ? 'pausiert' : 'beendet'}.` : '')
    setSchritt('fertig')
  }

  const kopf = schritt === 's0' ? 'Ziel setzen' : schritt.startsWith('A') ? 'Richtung festlegen'
    : 'Fertig'
  const schritte = schritt.startsWith('A')
    ? ['1 Richtung', '2 Ziel, Datum, Programm', '3 Bestätigen'].map((l, i) => ({ l, an: Number(schritt[1]) - 1 === i }))
    : []

  const weiterA2 = (vz === 0 ? !!p : !!(p && ergebnis && ergebnis.wochen !== null && !ergebnis.fehler && !rateFehler))
    && pruefungFrei

  const fuss = (
    <>
      {schritt === 'A1' && <>
        <button type="button" className="v2-btn v2-btn-ghost" onClick={() => setSchritt('s0')}>Zurück</button>
        <button type="button" className="v2-btn v2-btn-primary" data-ziel-weiter
                disabled={!gruppe || startKg === null} onClick={() => setSchritt('A2')}>Weiter</button>
      </>}
      {schritt === 'A2' && <>
        <button type="button" className="v2-btn v2-btn-ghost" onClick={() => setSchritt('A1')}>Zurück</button>
        <button type="button" className="v2-btn v2-btn-primary" data-ziel-weiter disabled={!weiterA2}
                onClick={() => { setTitel(t => t || titelVorschlag); setSchritt('A3') }}>Weiter</button>
      </>}
      {schritt === 'A3' && <>
        <button type="button" className="v2-btn v2-btn-ghost" onClick={() => setSchritt('A2')}>Zurück</button>
        <button type="button" className="v2-btn v2-btn-primary" data-ziel-starten
                disabled={laeuft || (!!steuerung && !wahl) || !pruefungFrei} onClick={() => { void starten() }}>
          <Icon name="check" className="v2-ic v2-ic-sm" /> {laeuft ? 'Startet …' : 'Ziel starten'}
        </button>
      </>}
      {schritt === 's0' && (
        <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Abbrechen</button>
      )}
      {schritt === 'fertig' && (
        <button type="button" className="v2-btn v2-btn-primary" onClick={onClose}>Zu den Zielen</button>
      )}
    </>
  )

  // G-628 Teil 3: Weg B ist ein eigener Dialog — er teilt mit Weg A nur den Einstieg.
  if (schritt === 'B1') {
    return <MesszielSetzen heute={heute} onClose={onClose} zurueck={start === 'B1' ? null : () => setSchritt('s0')}
                           steuerung={steuerVariante ? { gruppe: steuerVariante.auswahl_gruppe, name: steuerVariante.label } : null} />
  }

  return (
    <GModal title={kopf} subtitle={schritte.length ? (
      <span data-ziel-schritte>{schritte.map(s => (
        <span key={s.l} style={{ fontWeight: s.an ? 700 : 400, marginRight: 10 }}>{s.l}</span>
      ))}</span>) : undefined}
            eyebrow="goals" onClose={onClose} footer={fuss} width={640}>
      <div data-ziel-setzen={schritt}>

        {/* ══ Schritt 0 (Dossier 8.1) ═══════════════════════════════ */}
        {schritt === 's0' && (
          <div className="v2-col-gap" style={{ gap: 10 }}>
            <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
              <Karte marke="richtung" onClick={() => setSchritt('A1')} kopf="Richtung festlegen">
                Abnehmen · Halten · Aufbauen<br />Steuert Kalorien und Makros. Immer nur eine.
                {steuerung && (
                  <span data-ziel-steuerung style={{ display: 'block', marginTop: 6, color: 'var(--fg)' }}>
                    aktiv: {steuerVariante ? steuerVariante.label : steuerung.title}
                  </span>
                )}
              </Karte>
              <Karte marke="messziel" onClick={() => setSchritt('B1')} kopf="Messziel hinzufügen">
                Gewicht, Körperfett, Kraft, Gewohnheit …<br />Steuert nichts, misst Fortschritt. Beliebig viele.
              </Karte>
            </div>
            <div className="v2-dim" data-ziel-planer style={{ fontSize: 11.5 }}>
              Wettkampf oder Jahresplan?{' '}
              {planerFrei
                ? <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                          onClick={() => { onClose(); router.push('/v2/goals?tab=phase') }}>Zum Planer</button>
                : <span>Zum Planer (ab pro – für dich gesperrt)</span>}
            </div>
          </div>
        )}

        {/* ══ A1 Richtung ═══════════════════════════════════════════ */}
        {schritt === 'A1' && (
          <div className="v2-col-gap" style={{ gap: 10 }}>
            <div className="v2-grid v2-g-cols-3" style={{ gap: 8 }}>
              {richtungsListe.map(r => {
                const rt = r.standard.weight_change_target_percent
                return (
                  <Karte key={r.gruppe} marke={`richtung-${r.gruppe}`} an={gruppe === r.gruppe}
                         onClick={() => { setGruppe(r.gruppe); setFest([]); setProgramm(null); setZielText(''); setDatum('') }}
                         kopf={r.standard.label}>
                    {r.standard.description}<br />
                    <strong>{rt === null ? 'Standard: kein Tempo' : `Standard ${fmt(Math.abs(rt))} % Körpergewicht pro Woche`}</strong>
                  </Karte>
                )
              })}
            </div>
            {letzte ? (
              <div className="v2-dim" data-ziel-start style={{ fontSize: 11.5 }}>
                Letzte Gewichtsmessung: {fmt(letzte.weight_kg!)} kg am {datumDe(letzte.measurement_date)}.
              </div>
            ) : gemessen !== null ? (
              <div className="v2-dim" data-ziel-start style={{ fontSize: 11.5 }}>
                Gewicht heute gespeichert: {fmt(gemessen)} kg.
              </div>
            ) : (
              <div data-ziel-gewicht-heute style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ maxWidth: 200 }}>
                  <GField label="Gewicht heute (kg)" sub="keine Messung der letzten 14 Tage">
                    <GInput aria-label="Gewicht heute" data-zielfeld="gewicht-heute" inputMode="decimal"
                            value={gewichtHeute} onChange={e => setGewichtHeute(e.target.value)} />
                  </GField>
                </div>
                <button type="button" className="v2-btn v2-btn-sm" data-ziel-messung-speichern
                        disabled={laeuft || zahlAus(gewichtHeute) === null} onClick={() => { void messungSpeichern() }}
                        style={{ marginBottom: 12 }}>Messung speichern</button>
              </div>
            )}
          </div>
        )}

        {/* ══ A2 Ziel, Datum, Programm ══════════════════════════════ */}
        {schritt === 'A2' && ergebnis && startKg !== null && (
          <div className="v2-col-gap" style={{ gap: 10 }}>
            {vz === 0 ? (
              <div style={{ fontSize: 12, lineHeight: 1.6 }} data-ziel-halten>
                Halten hat kein Zielgewicht und kein Tempo. Vorschlag Wohlfühlbereich um dein Gewicht:{' '}
                <strong>{fmt(ergebnis.halten!.von)} – {fmt(ergebnis.halten!.bis)} kg</strong>
              </div>
            ) : (
              <>
                <div className="v2-dim" style={{ fontSize: 11.5 }}>
                  Leg fest, was dir wichtig ist – Zielgewicht, Zieldatum oder Programm. Den Rest rechnet LumeOS.
                </div>
                {/* `[cmd]` **Ein Trendgewicht gibt es nicht** (gemessen 2026-10-08:
                    weder eine Funktion noch eine Spalte) — die Quelle wird genannt. */}
                <div style={{ fontSize: 12 }} data-ziel-startquelle>
                  Start <strong>{fmt(startKg)} kg</strong>{' '}
                  <span className="v2-dim">
                    {gemessen !== null ? 'heute gemessen' : `letzte Messung am ${datumDe(letzte?.measurement_date ?? null)}`}
                    {' '}· kein Trendwert vorhanden
                  </span>
                </div>
                <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
                  <GField label="Zielgewicht (kg)" sub={ergebnis.quelle.ziel === 'festgelegt' ? '📌 festgelegt' : 'berechnet'}>
                    <GInput aria-label="Zielgewicht" data-zielfeld="ziel" inputMode="decimal"
                            value={ergebnis.quelle.ziel === 'festgelegt' ? zielText : (ergebnis.ziel !== null ? fmt(ergebnis.ziel) : '')}
                            onChange={e => { setZielText(e.target.value); feststellen('ziel', e.target.value.trim() !== '') }} />
                  </GField>
                  <GField label="Zieldatum" sub={ergebnis.quelle.datum === 'festgelegt' ? '📌 festgelegt' : 'berechnet'}>
                    <GInput type="date" aria-label="Zieldatum" data-zielfeld="datum" min={heute}
                            value={ergebnis.quelle.datum === 'festgelegt' ? datum : (ergebnis.datum ?? '')}
                            onChange={e => { setDatum(e.target.value); feststellen('datum', e.target.value !== '') }} />
                  </GField>
                </div>
              </>
            )}
            <div style={{ fontSize: 12 }} data-ziel-programm={p?.code ?? ''}>
              Programm <strong>{p ? p.label : '–'}</strong>{' '}
              <span className="v2-dim">· {ergebnis.quelle.programm === 'festgelegt' ? '📌 festgelegt' : `berechnet${ergebnis.warum ? ': ' + ergebnis.warum : ''}`}
                {ergebnis.noetigPct !== null && ` (nötig ${fmt(ergebnis.noetigPct, 2)} %/Woche)`}</span>
            </div>
            <Befunde pruefung={pruefung} bestaetigt={bestaetigt} setBestaetigt={setBestaetigt} />
            {(ergebnis.fehler || ergebnis.hinweis || rateFehler) && (
              <div data-ziel-rechenfehler style={{ fontSize: 11.5, color: ergebnis.fehler || rateFehler ? 'var(--neg)' : 'var(--warn)' }}>
                {ergebnis.fehler ?? ergebnis.hinweis ?? rateFehler}
                {ergebnis.planer && planerFrei && (
                  <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                          onClick={() => { onClose(); router.push('/v2/goals?tab=phase') }}> Zum Planer</button>
                )}
              </div>
            )}
            {!ergebnis.fehler && (
              <div className="v2-grid v2-g-cols-4" style={{ gap: 8 }} data-ziel-ergebnis>
                {[
                  ['Tempo', ergebnis.kgProWoche !== null && vz !== 0 ? `${ergebnis.kgProWoche > 0 ? '+' : '−'}${fmt(Math.abs(ergebnis.kgProWoche), 2)} kg/Wo` : '–'],
                  ['Tagesziel', ergebnis.kcal !== null ? `${fmt(ergebnis.kcal, 0)} kcal` : '– (ohne TDEE)'],
                  ['Protein', ergebnis.proteinG !== null ? `${ergebnis.proteinG} g` : '–'],
                  ['Dauer', ergebnis.wochen !== null ? `${fmt(ergebnis.wochen, 1)} Wo · bis ${datumDe(ergebnis.datum)}` : '–'],
                ].map(([k, w]) => (
                  <div key={k} data-ziel-wert={k}>
                    <div className="v2-eyebrow">{k}</div>
                    <div className="v2-num" style={{ fontSize: 12.5, fontWeight: 600 }}>{w}</div>
                  </div>
                ))}
              </div>
            )}
            {/* ── Vorgehen anpassen · Programme ─────────────────────── */}
            <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" data-vorgehen-auf
                    aria-expanded={listeOffen} onClick={() => setListeOffen(o => !o)} style={{ alignSelf: 'flex-start' }}>
              {listeOffen ? '▴' : '▾'} Vorgehen anpassen · Programme
            </button>
            {listeOffen && (
              <div className="v2-col-gap" style={{ gap: 4 }} data-vorgehen>
                {liste.map(v => {
                  const lage = ergebnis.lagen.find(l => l.code === v.code)
                  const zu = lage?.status === 'gesperrt'
                  const rt = v.weight_change_target_percent
                  return (
                    <button key={v.code} type="button" data-zielvariante={v.code} disabled={zu}
                            aria-pressed={p?.code === v.code}
                            onClick={() => { setProgramm(v.code); feststellen('programm') }}
                            style={{
                              textAlign: 'left', padding: '8px 10px', borderRadius: 6, width: '100%',
                              border: '1px solid var(--border)', background: p?.code === v.code
                                ? 'color-mix(in oklch, var(--acc-goals) 10%, var(--surface))' : 'var(--surface)',
                              opacity: zu ? 0.55 : 1, cursor: zu ? 'not-allowed' : 'pointer', color: 'var(--fg)',
                            }}>
                      <span style={{ fontWeight: 600 }}>{v.label}</span>
                      {v.standard && <span className="v2-dim"> · Standard</span>}
                      <span data-variante-lage={lage?.status} style={{ float: 'right', fontSize: 10.5 }}>
                        {zu ? `🔒 ${lage?.text}` : lage?.text}
                      </span>
                      <span className="v2-dim" style={{ display: 'block', fontSize: 10.5, marginTop: 2 }}>
                        {v.description} · {[
                          rt !== null ? `${fmt(Math.abs(rt), 2)} %/Wo` : null,
                          v.protein_per_kg !== null ? `${fmt(v.protein_per_kg, 1)} g/kg Protein` : null,
                          v.max_duration_weeks !== null ? `max ${v.max_duration_weeks} Wo` : 'ohne Limit',
                        ].filter(Boolean).join(' · ')}
                      </span>
                    </button>
                  )
                })}
                {fest.includes('programm') && (
                  <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" data-programm-auto
                          onClick={() => { setProgramm(null); feststellen('programm', false) }} style={{ alignSelf: 'flex-start' }}>
                    Programm automatisch wählen
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ A3 Bestätigen ═════════════════════════════════════════ */}
        {schritt === 'A3' && ergebnis && p && startKg !== null && (
          <div className="v2-col-gap" style={{ gap: 10 }}>
            <div data-ziel-satz style={{ fontSize: 13, lineHeight: 1.6 }}>
              {vz === 0
                ? `Halten um ${fmt(startKg)} kg (Wohlfühlbereich ${fmt(ergebnis.halten!.von)}–${fmt(ergebnis.halten!.bis)} kg). `
                : `${richtung?.standard.label} von ${fmt(startKg)} auf ${fmt(ergebnis.ziel ?? 0)} kg mit ${fmt(Math.abs(ergebnis.tempoPct ?? 0), 2)} % pro Woche (${p.label}). `}
              {ergebnis.kcal !== null ? `Ab heute ${fmt(ergebnis.kcal, 0)} kcal` : 'Ab heute (ohne TDEE keine kcal)'}
              {ergebnis.proteinG !== null && ` und ${ergebnis.proteinG} g Protein`}.
              {vz !== 0 && ergebnis.datum && ` Voraussichtlich erreicht am ${datumDe(ergebnis.datum)}.`}
            </div>
            {naechsteNamen(p, strategien).length > 0 && (
              <div className="v2-dim" data-ziel-danach style={{ fontSize: 11.5 }}>
                Danach empfohlen: {naechsteNamen(p, strategien).join(' oder ')}.
              </div>
            )}
            <GField label="Titel">
              <GInput aria-label="Titel" data-zielfeld="titel" value={titel} placeholder={titelVorschlag}
                      onChange={e => setTitel(e.target.value)} />
            </GField>
            <div className="v2-dim" style={{ fontSize: 11 }} data-ziel-startdatum={startdatum}>
              Start: {startdatum === heute ? 'ab heute, ' : 'ab '}{datumDe(startdatum)}{' '}
              {!spaeterOffen && (
                <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" data-ziel-spaeter
                        onClick={() => setSpaeterOffen(true)}>später starten</button>
              )}
            </div>
            {spaeterOffen && (
              <div style={{ maxWidth: 200 }}>
                <GField label="Startdatum">
                  <GInput type="date" aria-label="Startdatum" data-zielfeld="startdatum" min={heute}
                          value={startdatum} onChange={e => setStartdatum(e.target.value || heute)} />
                </GField>
              </div>
            )}
            {/* Ein spaeteres Startdatum aendert die Rechnung — die Pruefung laeuft neu. */}
            <Befunde pruefung={pruefung} bestaetigt={bestaetigt} setBestaetigt={setBestaetigt} />
            {steuerung && (
              <div data-ziel-rueckfrage style={{ fontSize: 12 }}>
                Dein aktuelles Ziel „{steuerung.title}“ läuft noch. Was soll damit passieren?
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {(['pausieren', 'beenden'] as const).map(w => (
                    <button key={w} type="button" data-ziel-wahl={w} aria-pressed={wahl === w}
                            className="v2-btn v2-btn-sm" onClick={() => setWahl(w)}
                            style={{ background: wahl === w ? 'color-mix(in oklch, var(--acc-goals) 14%, var(--surface))' : undefined }}>
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {schritt === 'fertig' && (
          <div data-ziel-fertig style={{ fontSize: 13, lineHeight: 1.6 }}>
            Ziel gestartet. {fertigSatz}
          </div>
        )}

        {fehler && (sitzungsfehler ? (
          <div data-ziel-sitzungsfehler style={{ marginTop: 10, fontSize: 11.5, color: 'var(--neg)' }}>
            Deine Anmeldung ist abgelaufen. Bitte neu anmelden — deine Eingaben sind nicht das Problem.
          </div>
        ) : (
          <div data-ziel-fehler style={{ marginTop: 10, fontSize: 11.5, color: 'var(--neg)' }}>{fehler}</div>
        ))}
      </div>
    </GModal>
  )
}
