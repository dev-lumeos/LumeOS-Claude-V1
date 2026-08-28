'use client'

// Das Trainings-Erfassungsformular — G-217.
//
// `[read]` **Es ruft die Naht aus G-216, es baut keine zweite.**
// Jeder Schreibzugriff geht ueber `sitzung-aktionen.ts` nach
// `lib/training/sitzung-write.ts`.
//
// `[cmd]` **A-30:** aus dem Leseweg kommen hier nur TYPEN, keine
// Werte — `import type`. Ein Wert-Import zoege `next/headers` in das
// Browserpaket.
//
// `[read]` **Der Baum entsteht schrittweise**, und die Oberflaeche
// haelt jeden Zwischenstand aus: keine Sitzung, offene ohne Uebung,
// Uebung ohne Satz, Saetze da. **Jeder Schritt schreibt sofort** —
// es gibt keinen Entwurf, der beim Schliessen verloren ginge.

import React from 'react'

import { Pill, Icon } from '@lumeos/ui'
import {
  standVon, standSatz, darfAbschliessen, OHNE_SATZ_HINWEIS,
  type Stand,
} from '../../../lib/training/stand-aus-sitzung'
import { LEERER_SATZ, type SatzEingabe } from '../../../lib/training/sitzung-regeln'
import type { Uebung } from '../../../lib/training/uebungen-read'
import {
  standAktion, beginnenAktion, uebungAnhaengenAktion, satzAktion,
  abschliessenAktion, verwerfenAktion, uebungssucheAktion,
} from './sitzung-aktionen'

type UebungZeile = {
  id: string
  exercise_name: string
  exercise_order: number | null
  saetze: Array<{
    id: string; set_number: number | null; reps: number | null
    weight_kg: number | null; set_type: string | null
  }>
}

const heuteAls = () => new Date().toISOString().slice(0, 10)

export function SitzungFormular({ onClose }: { onClose: () => void }) {
  const [laedt, setLaedt] = React.useState(true)
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  const [feldFehler, setFeldFehler] = React.useState<Record<string, string>>({})

  const [sitzung, setSitzung] = React.useState<{
    id: string; session_date: string; started_time: string | null
    total_sets: number | null
  } | null>(null)
  const [uebungen, setUebungen] = React.useState<UebungZeile[]>([])
  const [aktiv, setAktiv] = React.useState<string | null>(null)
  const [satz, setSatz] = React.useState<SatzEingabe>(LEERER_SATZ)

  const [suche, setSuche] = React.useState('')
  const [treffer, setTreffer] = React.useState<Uebung[]>([])
  const [suchLaeuft, setSuchLaeuft] = React.useState(false)

  const heute = heuteAls()
  const stand: Stand = standVon(sitzung, heute)
  const saetzeGesamt = uebungen.reduce((n, u) => n + u.saetze.length, 0)

  // ── Stand laden: fortsetzen, nicht fragen ──────────────────────
  const standLaden = React.useCallback(async () => {
    setLaedt(true)
    const a = await standAktion()
    if (!a.ok) {
      setFehler(a.text)
      setLaedt(false)
      return
    }
    setFehler(null)
    setSitzung(a.sitzung
      ? {
          id: a.sitzung.id, session_date: a.sitzung.session_date,
          started_time: a.sitzung.started_time, total_sets: a.sitzung.total_sets,
        }
      : null)
    setUebungen(a.uebungen.map(u => ({
      id: u.id, exercise_name: u.exercise_name, exercise_order: u.exercise_order,
      saetze: u.saetze.map(s => ({
        id: s.id, set_number: s.set_number, reps: s.reps,
        weight_kg: s.weight_kg, set_type: s.set_type,
      })),
    })))
    // Die zuletzt angelegte Uebung ist die, an der weitergearbeitet wird.
    setAktiv(v => v ?? (a.uebungen.length > 0 ? a.uebungen[a.uebungen.length - 1].id : null))
    setLaedt(false)
  }, [])

  React.useEffect(() => { void standLaden() }, [standLaden])

  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  // ── Uebungssuche ───────────────────────────────────────────────
  React.useEffect(() => {
    if (suche.trim().length < 2) { setTreffer([]); return }
    let abgebrochen = false
    setSuchLaeuft(true)
    const id = setTimeout(() => {
      void uebungssucheAktion(suche).then(a => {
        if (abgebrochen) return
        setTreffer(a.zeilen)
        setSuchLaeuft(false)
      })
    }, 250)
    return () => { abgebrochen = true; clearTimeout(id) }
  }, [suche])

  // ── Die Schritte ───────────────────────────────────────────────

  async function beginnen() {
    setLaeuft(true)
    const a = await beginnenAktion({
      session_date: heute, name: '', location: '', notes: '',
    })
    setLaeuft(false)
    if (!a.ok) { setFehler(a.text); return }
    setFehler(null)
    await standLaden()
  }

  async function uebungAnhaengen(u: Uebung) {
    if (!sitzung) return
    setLaeuft(true)
    // `[cmd]` NUR die Kennung geht hin — den Namen friert die Naht
    // aus dem Katalog ein (G-216).
    const a = await uebungAnhaengenAktion(sitzung.id, u.id)
    setLaeuft(false)
    if (!a.ok) { setFehler(a.text); return }
    setFehler(null)
    setSuche('')
    setTreffer([])
    setAktiv(a.id)
    await standLaden()
  }

  async function satzEintragen() {
    if (!aktiv) return
    setLaeuft(true)
    const a = await satzAktion(aktiv, satz)
    setLaeuft(false)
    if (!a.ok) {
      setFeldFehler(Object.fromEntries((a.felder ?? []).map(f => [f.feld, f.text])))
      if ((a.felder ?? []).length === 0) setFehler(a.text)
      return
    }
    setFeldFehler({})
    setFehler(null)
    // `[read]` Gewicht und Satzart bleiben stehen — beim naechsten
    // Satz derselben Uebung aendert sich meist nur die Wiederholung.
    setSatz(s => ({ ...s, reps: '', rpe: '', rir: '' }))
    await standLaden()
  }

  async function abschliessen() {
    if (!sitzung) return
    setLaeuft(true)
    const a = await abschliessenAktion(sitzung.id)
    setLaeuft(false)
    if (!a.ok) { setFehler(a.text); return }
    setSitzung(null)
    setUebungen([])
    setAktiv(null)
    onClose()
  }

  async function verwerfen() {
    if (!sitzung) return
    setLaeuft(true)
    const a = await verwerfenAktion(sitzung.id)
    setLaeuft(false)
    if (!a.ok) { setFehler(a.text); return }
    setSitzung(null)
    setUebungen([])
    setAktiv(null)
    onClose()
  }

  const feld = (name: keyof SatzEingabe, beschriftung: string, breite: number) => (
    <label style={{ display: 'block' }}>
      <span className="v2-eyebrow" style={{ display: 'block', marginBottom: 3 }}>
        {beschriftung}
      </span>
      <input
        className="v2-feld" style={{ width: breite }} inputMode="decimal"
        aria-label={beschriftung}
        value={String(satz[name] ?? '')}
        onChange={ev => setSatz(s => ({ ...s, [name]: ev.target.value }))} />
      {feldFehler[name] && (
        <span style={{ display: 'block', fontSize: 10, color: 'var(--neg)', marginTop: 2 }}>
          {feldFehler[name]}
        </span>
      )}
    </label>
  )

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" style={{ width: 680, maxWidth: '94vw' }}
           role="dialog" aria-modal="true" aria-label="Training erfassen"
           onClick={e => e.stopPropagation()}>

        <div className="v2-modal-h" style={{
          background: 'color-mix(in oklch, var(--acc-train) 12%, var(--bg-elev))',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'color-mix(in oklch, var(--acc-train) 22%, transparent)',
            display: 'grid', placeItems: 'center', color: 'var(--acc-train)', flexShrink: 0,
          }}>
            <Icon name="training" className="v2-ic" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Training erfassen</div>
            <div className="v2-dim" style={{ fontSize: 11 }}>
              {laedt ? 'lädt …' : standSatz(stand, sitzung)}
            </div>
          </div>
          {stand === 'offen_aelter' && <Pill variant="warn">nicht abgeschlossen</Pill>}
          {stand === 'offen_heute' && <Pill variant="acc">läuft</Pill>}
          <button type="button" className="v2-icon-btn" onClick={onClose}
                  aria-label="Schliessen">
            <Icon name="x" className="v2-ic" />
          </button>
        </div>

        <div className="v2-modal-body">
          {fehler && (
            <div style={{
              padding: 10, marginBottom: 12, borderRadius: 6, fontSize: 12,
              background: 'color-mix(in oklch, var(--neg) 12%, transparent)',
              border: '1px solid color-mix(in oklch, var(--neg) 40%, var(--border))',
            }}>
              {fehler}
            </div>
          )}

          {/* ── kein laufendes Training ── */}
          {!laedt && !sitzung && (
            <div style={{ textAlign: 'center', padding: '28px 12px' }}>
              <div className="v2-dim" style={{ fontSize: 12, marginBottom: 14 }}>
                Kein laufendes Training. Der Beginn wird sofort gespeichert —
                du kannst zwischendurch weggehen und später weitermachen.
              </div>
              <button type="button" className="v2-btn v2-btn-primary"
                      disabled={laeuft} onClick={() => void beginnen()}>
                <Icon name="play" className="v2-ic v2-ic-sm" />
                Training beginnen
              </button>
            </div>
          )}

          {/* ── laufendes Training ── */}
          {!laedt && sitzung && (
            <>
              {uebungen.length === 0 && (
                <div className="v2-dim" style={{ fontSize: 12, marginBottom: 12 }}>
                  Noch keine Übung. Such eine aus dem Katalog.
                </div>
              )}

              {uebungen.map(u => (
                <div key={u.id} style={{
                  marginBottom: 10, padding: 10, borderRadius: 6,
                  border: `1px solid ${u.id === aktiv
                    ? 'color-mix(in oklch, var(--acc-train) 45%, var(--border))'
                    : 'var(--border)'}`,
                  background: u.id === aktiv
                    ? 'color-mix(in oklch, var(--acc-train) 6%, transparent)'
                    : 'transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="v2-num v2-dim" style={{ fontSize: 11 }}>
                      {u.exercise_order}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>
                      {u.exercise_name}
                    </span>
                    {u.id !== aktiv && (
                      <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                              onClick={() => setAktiv(u.id)}>
                        Sätze hier eintragen
                      </button>
                    )}
                  </div>
                  {u.saetze.length > 0 && (
                    <div className="v2-num" style={{
                      fontSize: 11, marginTop: 6, color: 'var(--fg-muted)',
                    }}>
                      {u.saetze.map(s => (
                        <span key={s.id} style={{ marginRight: 10 }}>
                          {s.set_number}. {s.reps}
                          {s.weight_kg !== null ? ` × ${s.weight_kg} kg` : ' (Körpergewicht)'}
                          {s.set_type === 'warmup' ? ' · Aufwärmen' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* ── Satz eintragen ── */}
              {aktiv && (
                <div style={{
                  marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)',
                  display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap',
                }}>
                  {feld('reps', 'Wdh.', 70)}
                  {feld('weight_kg', 'kg', 80)}
                  {feld('rpe', 'RPE', 64)}
                  {feld('rir', 'RIR', 64)}
                  <label style={{ display: 'block' }}>
                    <span className="v2-eyebrow" style={{ display: 'block', marginBottom: 3 }}>
                      Art
                    </span>
                    <select className="v2-feld" style={{ width: 118 }} aria-label="Satzart"
                            value={satz.set_type}
                            onChange={ev => setSatz(s => ({
                              ...s, set_type: ev.target.value as SatzEingabe['set_type'],
                            }))}>
                      <option value="working">Arbeitssatz</option>
                      <option value="warmup">Aufwärmen</option>
                      <option value="dropset">Dropsatz</option>
                      <option value="failure">bis Versagen</option>
                    </select>
                  </label>
                  <button type="button" className="v2-btn v2-btn-primary"
                          style={{ marginTop: 16 }} disabled={laeuft}
                          onClick={() => void satzEintragen()}>
                    <Icon name="plus" className="v2-ic v2-ic-sm" />Satz eintragen
                  </button>
                </div>
              )}

              {/* ── Uebung suchen ── */}
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <input className="v2-feld" style={{ width: '100%' }}
                       aria-label="Übung suchen" placeholder="Übung aus dem Katalog suchen …"
                       value={suche} onChange={ev => setSuche(ev.target.value)} />
                {suchLaeuft && (
                  <div className="v2-dim" style={{ fontSize: 11, marginTop: 6 }}>sucht …</div>
                )}
                {!suchLaeuft && suche.trim().length >= 2 && treffer.length === 0 && (
                  <div className="v2-dim" style={{ fontSize: 11, marginTop: 6 }}>
                    Nichts gefunden. Eigene Übungen gibt es noch nicht.
                  </div>
                )}
                {treffer.map(u => (
                  <button key={u.id} type="button" className="v2-med-eingabe-vorschlag"
                          style={{ width: '100%', textAlign: 'left', marginTop: 6 }}
                          disabled={laeuft} onClick={() => void uebungAnhaengen(u)}>
                    <span className="v2-med-eingabe-vorschlag-name">{u.name}</span>
                    {u.equipment_name_de && (
                      <span className="v2-dim" style={{ fontSize: 11, marginLeft: 8 }}>
                        {u.equipment_name_de}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {!laedt && sitzung && (
          <div className="v2-modal-f">
            <button type="button" className="v2-btn v2-btn-ghost"
                    disabled={laeuft} onClick={() => void verwerfen()}>
              Verwerfen
            </button>
            <div style={{ flex: 1 }} />
            {!darfAbschliessen(saetzeGesamt) && (
              <span className="v2-dim" style={{ fontSize: 11, marginRight: 10 }}>
                {OHNE_SATZ_HINWEIS}
              </span>
            )}
            <button type="button" className="v2-btn v2-btn-primary"
                    disabled={laeuft || !darfAbschliessen(saetzeGesamt)}
                    onClick={() => void abschliessen()}>
              <Icon name="check" className="v2-ic v2-ic-sm" />Abschließen
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
