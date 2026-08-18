'use client'

// Der Exercises-Tab mit echten Daten (G-64).
//
// QUELLE: theme-v1/module-training.jsx:439 (`TrainingLibrary`).
//
// UEBERNOMMEN: Aufbau, Reihenfolge, Beschriftung — Suchfeld, zwei
// Auswahlfelder, `+ Custom`, Tabelle, Klick oeffnet `exerciseDetail`.
//
// GEAENDERT, WEIL DIE DATEN ES VERLANGEN:
//   1. `Type` (Compound/Isolation) faellt weg — **Toms Entscheidung
//      2026-08-18**. Es gibt die Angabe in keiner Spalte, und das
//      Vorgaengerrepo filtert stattdessen nach Disziplin. An ihre
//      Stelle tritt `Discipline`.
//   2. Die Geraeteauswahl zeigt die vier Gruppen aus C-90 statt vier
//      einzelner Geraete — 58 Geraete in einer Klappliste waeren
//      unbenutzbar.
//   3. Die Muskelauswahl zeigt 7 Wurzeln mit ihren direkten Kindern.
//      `[cmd]` Der Baum ist vier Ebenen tief; Ebene 2 und 3 sind
//      Einzelmuskeln (`adductor brevis`) und taugen nicht als Filter.
//   4. Ein Schalter „primary only". Begruendung im Bericht: bei
//      „Hamstrings" stehen 100 gegen 384 Treffer.
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import { TrainingKontext } from './kontext'
import { uebungenSuchen } from './uebungen-aktion'
import type {
  Uebung, GeraeteGruppe, MuskelWurzel,
} from '../../../lib/training/uebungen-read'

export function TrainingUebungen({
  start, gesamtKatalog, geraeteGruppen, disziplinen, muskelBaum,
}: {
  start: Uebung[]
  gesamtKatalog: number
  geraeteGruppen: GeraeteGruppe[]
  disziplinen: Array<{ name: string; anzahl: number }>
  muskelBaum: MuskelWurzel[]
}) {
  const t = React.useContext(TrainingKontext)

  const [suche, setSuche] = React.useState('')
  const [geraet, setGeraet] = React.useState('')
  const [disziplin, setDisziplin] = React.useState('')
  const [muskel, setMuskel] = React.useState('')
  const [nurPrimaer, setNurPrimaer] = React.useState(true)

  const [zeilen, setZeilen] = React.useState<Uebung[]>(start)
  const [gesamt, setGesamt] = React.useState(gesamtKatalog)
  const [laeuft, setLaeuft] = React.useState(false)
  const [dauerMs, setDauerMs] = React.useState<number | null>(null)

  // Der erste Lauf zeigt die Startdaten; danach wird nachgeladen.
  const ersterLauf = React.useRef(true)

  React.useEffect(() => {
    if (ersterLauf.current) { ersterLauf.current = false; return }
    let verworfen = false
    // Entprellen: 1.416 Zeilen brauchen keine Abfrage je Tastendruck.
    const zeit = setTimeout(async () => {
      setLaeuft(true)
      const start = performance.now()
      const a = await uebungenSuchen({
        suche: suche || undefined,
        geraeteGruppe: geraet || undefined,
        disziplin: disziplin || undefined,
        muskelId: muskel || undefined,
        nurPrimaer,
      })
      if (verworfen) return
      setDauerMs(Math.round(performance.now() - start))
      setZeilen(a.zeilen)
      setGesamt(a.gesamt)
      setLaeuft(false)
    }, 180)
    return () => { verworfen = true; clearTimeout(zeit) }
  }, [suche, geraet, disziplin, muskel, nurPrimaer])

  const zuruecksetzen = () => {
    setSuche(''); setGeraet(''); setDisziplin(''); setMuskel('')
  }
  const hatFilter = Boolean(suche || geraet || disziplin || muskel)

  return (
    <div>
      <div className="v2-train-lib-filter">
        <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
          <Icon name="search" className="v2-ic v2-ic-sm"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-subtle)' }} />
          <input
            aria-label="Search exercises"
            value={suche}
            onChange={e => setSuche(e.target.value)}
            placeholder={`Search ${gesamtKatalog.toLocaleString('de-DE')} exercises · barbell, dumbbell, machine, bodyweight, cable…`}
            style={{
              width: '100%', height: 32, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '0 12px 0 30px', fontSize: 12, outline: 'none', color: 'var(--fg)',
            }}
          />
        </div>

        <select className="v2-btn" aria-label="Equipment" style={{ padding: '0 10px' }}
                value={geraet} onChange={e => setGeraet(e.target.value)}>
          <option value="">All equipment</option>
          {geraeteGruppen.map(g => (
            <option key={g.key} value={g.key}>{g.label_de} ({g.uebungen})</option>
          ))}
        </select>

        <select className="v2-btn" aria-label="Discipline" style={{ padding: '0 10px' }}
                value={disziplin} onChange={e => setDisziplin(e.target.value)}>
          <option value="">All disciplines</option>
          {disziplinen.map(d => (
            <option key={d.name} value={d.name}>{d.name} ({d.anzahl})</option>
          ))}
        </select>

        {/* Wurzeln als Gruppen, Kinder als Eintraege — die Struktur
            aus C-73, wie bei der Muskelkarte (G-55). */}
        <select className="v2-btn" aria-label="Muscles" style={{ padding: '0 10px' }}
                value={muskel} onChange={e => setMuskel(e.target.value)}>
          <option value="">All muscles</option>
          {muskelBaum.map(w => (
            <optgroup key={w.id} label={`${w.name} (${nurPrimaer ? w.primaer : w.beides})`}>
              <option value={w.id}>
                {w.name} — alle ({nurPrimaer ? w.primaer : w.beides})
              </option>
              {w.kinder.map(k => (
                <option key={k.id} value={k.id}>
                  {k.name} ({nurPrimaer ? k.primaer : k.beides})
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <button type="button" className="v2-btn v2-btn-primary" onClick={() => t?.open('customExercise')}>
          <Icon name="plus" className="v2-ic v2-ic-sm" /> Custom
        </button>
      </div>

      {/* Die Zeile unter den Filtern: Trefferzahl, Rollenschalter,
          Zuruecksetzen. Sie steht nicht im Entwurf — der Entwurf hat
          zehn feste Zeilen und braucht sie nicht. */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap',
      }}>
        <span className="v2-num" style={{ fontSize: 12 }}>
          {laeuft ? '…' : gesamt.toLocaleString('de-DE')}
          <span className="v2-dim"> / {gesamtKatalog.toLocaleString('de-DE')}</span>
        </span>
        {dauerMs != null && !laeuft && (
          <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{dauerMs} ms</span>
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, cursor: 'pointer' }}>
          <input type="checkbox" checked={nurPrimaer}
                 onChange={e => setNurPrimaer(e.target.checked)} />
          <span className="v2-muted">primary muscle only</span>
        </label>
        {hatFilter && (
          <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" onClick={zuruecksetzen}>
            Reset
          </button>
        )}
        {zeilen.length < gesamt && (
          <span className="v2-dim" style={{ fontSize: 10.5, marginLeft: 'auto' }}>
            showing first {zeilen.length}
          </span>
        )}
      </div>

      <Card>
        <div className="v2-tbl-wrap">
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Exercise</th>
                <th style={{ width: 130 }}>Equipment</th>
                <th>Muscles</th>
                <th style={{ width: 90 }}>Discipline</th>
                <th style={{ width: 80, textAlign: 'right' }}>e1RM</th>
                <th style={{ width: 100, textAlign: 'right' }}>Best set</th>
                <th style={{ width: 28 }} />
              </tr>
            </thead>
            <tbody>
              {zeilen.map(ex => (
                <tr key={ex.id} style={{ cursor: 'pointer' }}
                    onClick={() => t?.open('exerciseDetail', ex)}>
                  <td style={{ fontWeight: 500 }}>{ex.name}</td>
                  <td className="v2-muted" style={{ fontSize: 11.5 }}>
                    {ex.equipment_name_de ?? ex.equipment_name ?? '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {ex.primaer.map(m => <Pill key={m}>{m}</Pill>)}
                      {/* Sekundaer nur, wenn der Schalter sie einbezieht. */}
                      {!nurPrimaer && ex.sekundaer.map(m => (
                        <Pill key={m} style={{ opacity: 0.55 }}>{m}</Pill>
                      ))}
                      {ex.primaer.length === 0 && ex.sekundaer.length === 0 && (
                        <span className="v2-dim" style={{ fontSize: 11 }}>—</span>
                      )}
                    </div>
                  </td>
                  <td className="v2-muted">{ex.discipline ?? '—'}</td>
                  <td className="v2-num" style={{ textAlign: 'right' }}>
                    {ex.e1rm != null ? `${ex.e1rm.toFixed(1)} kg` : '—'}
                  </td>
                  <td className="v2-num v2-muted" style={{ textAlign: 'right', fontSize: 11 }}>
                    {ex.bester_satz ?? '—'}
                  </td>
                  <td>
                    <button type="button" className="v2-icon-btn" aria-label={`${ex.name} oeffnen`}
                            onClick={e => { e.stopPropagation(); t?.open('exerciseDetail', ex) }}>
                      <Icon name="more" className="v2-ic v2-ic-sm" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {zeilen.length === 0 && !laeuft && (
          <div className="v2-muted" style={{ fontSize: 12, padding: '14px 0', textAlign: 'center' }}>
            No exercise matches these filters.
          </div>
        )}
      </Card>
    </div>
  )
}
