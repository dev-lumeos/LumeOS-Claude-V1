'use client'

// ════════════════════════════════════════════════════════════════════
// PLAN ANLEGEN UND BEARBEITEN — G-267 / G-268 / G-269
// ════════════════════════════════════════════════════════════════════
//
// **Tom, 2026-08-29:** *,,new plan geht nix"* und *,,wenn man plaene
// erstellen kann dann kann man die auch editieren"*.
//
// `[read]` **Im letzten Durchgang blieb der Knopf bewusst stumm** —
// die Haelfte der Felder haette nicht gespeichert werden koennen.
// `[cmd]` **Seit dem 2026-08-30 stehen die sechs Spalten live**, am
// selben Tag nachgemessen (`information_schema`, nicht dem Bericht
// geglaubt — G-273).
//
// `[read]` **Ein Formular, kein Assistent.** Aktivieren ist ein
// eigener Vorgang (`MealPlanActivationModal` in SPEC_10); ihn hier
// mitzumachen hiesse, zwei Entscheidungen in einen Knopf zu legen.
// Deshalb entsteht der Plan mit `status = 'assigned'`.

import * as React from 'react'
import { Icon } from '@lumeos/ui'

import {
  ZYKLUS_TEXT, ZYKLUS_ERKLAERUNG, zyklusVon, type Zyklus,
} from '../../../lib/nutrition/plan-lage'

/** Die drei Zyklen, wie der CHECK sie fuehrt. */
const ZYKLEN: readonly Zyklus[] = ['once', 'rollover', 'sequence']

export type PlanFelder = {
  id?: string
  name: string
  description: string | null
  target_kcal: number | null
  target_protein_g: number | null
  target_carbs_g: number | null
  target_fat_g: number | null
  lifecycle_type: string | null
  start_date: string | null
  days_count: number | null
}

export function PlanModal({
  vorhanden, onClose, onFertig,
}: {
  /** `null` heisst anlegen, sonst bearbeiten. */
  vorhanden: PlanFelder | null
  onClose: () => void
  onFertig: () => void
}) {
  const [name, setName] = React.useState(vorhanden?.name ?? '')
  const [beschreibung, setBeschreibung] = React.useState(vorhanden?.description ?? '')
  const [kcal, setKcal] = React.useState(
    vorhanden?.target_kcal != null ? String(vorhanden.target_kcal) : '')
  const [protein, setProtein] = React.useState(
    vorhanden?.target_protein_g != null ? String(vorhanden.target_protein_g) : '')
  const [kh, setKh] = React.useState(
    vorhanden?.target_carbs_g != null ? String(vorhanden.target_carbs_g) : '')
  const [fett, setFett] = React.useState(
    vorhanden?.target_fat_g != null ? String(vorhanden.target_fat_g) : '')
  // `[cmd]` **Die Spaltenvorgabe ist `'once'`** — ein neuer Plan ist
  // nie ohne Zyklus. Nur die Bestandsplaene tragen `NULL`.
  const [zyklus, setZyklus] = React.useState<Zyklus>(
    zyklusVon(vorhanden?.lifecycle_type ?? 'once'))
  const [start, setStart] = React.useState(vorhanden?.start_date ?? '')
  const [tage, setTage] = React.useState(
    vorhanden?.days_count != null ? String(vorhanden.days_count) : '7')
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  function zahlOderNull(v: string): number | null {
    const n = Number(v)
    return v.trim() !== '' && Number.isFinite(n) ? n : null
  }

  async function speichern() {
    if (name.trim() === '') { setFehler('Der Plan braucht einen Namen.'); return }
    // `[read]` **`sequence` verlangt einen Folgeplan** — der CHECK
    // `meal_plans_sequence_target_check` lehnt es sonst ab. Das hier
    // abzufangen ist freundlicher als ein 500er.
    if (zyklus === 'sequence') {
      setFehler('Für „geht in einen Folgeplan über" fehlt noch die Auswahl des '
        + 'Folgeplans. Wähle so lange einen anderen Lebenszyklus.')
      return
    }
    setLaeuft(true)
    setFehler(null)
    try {
      const felder = {
        name: name.trim(),
        description: beschreibung.trim() === '' ? null : beschreibung.trim(),
        target_kcal: zahlOderNull(kcal),
        target_protein_g: zahlOderNull(protein),
        target_carbs_g: zahlOderNull(kh),
        target_fat_g: zahlOderNull(fett),
        lifecycle_type: zyklus,
        start_date: start.trim() === '' ? null : start.trim(),
        days_count: zahlOderNull(tage),
      }
      const koerper = vorhanden?.id
        ? { art: 'plan_aendern', id: vorhanden.id, ...felder }
        : { art: 'plan', ...felder }
      const a = await fetch('/api/nutrition/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(koerper),
      })
      const d = await a.json()
      if (!a.ok) throw new Error(d?.error ?? 'Speichern fehlgeschlagen.')
      onFertig()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" style={{ width: 560, maxHeight: '88vh', overflow: 'auto' }}
           role="dialog" aria-modal="true"
           aria-label={vorhanden ? 'Plan bearbeiten' : 'Neuen Plan anlegen'}
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          <Icon name={vorhanden ? 'edit' : 'plus'} className="v2-ic v2-ic-sm" />
          <span className="v2-card-title">
            {vorhanden ? 'Plan bearbeiten' : 'Neuer Plan'}
          </span>
          <div className="v2-spacer" />
          <button type="button" className="v2-icon-btn" onClick={onClose}
                  aria-label="Schliessen">
            <Icon name="x" className="v2-ic v2-ic-sm" />
          </button>
        </div>

        <div className="v2-modal-body">
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Name</div>
          <input className="v2-feld" value={name} autoFocus
                 onChange={e => setName(e.target.value)} />

          <div className="v2-eyebrow" style={{ margin: '12px 0 4px' }}>Beschreibung</div>
          <input className="v2-feld" value={beschreibung}
                 onChange={e => setBeschreibung(e.target.value)} />

          <div className="v2-eyebrow" style={{ margin: '12px 0 4px' }}>Tagesziele</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {([['kcal', kcal, setKcal], ['Protein g', protein, setProtein],
               ['KH g', kh, setKh], ['Fett g', fett, setFett]] as const).map(
              ([label, wert, setzen]) => (
                <div key={label} style={{ flex: 1 }}>
                  <div className="v2-dim" style={{ fontSize: 10, marginBottom: 3 }}>{label}</div>
                  <input className="v2-feld" value={wert} inputMode="decimal"
                         onChange={e => setzen(e.target.value)} />
                </div>
              ))}
          </div>

          {/* G-270: der Lebenszyklus — aus `lifecycle_type`, nicht aus
              der Vorlage. Die Erklaerung steht darunter, damit die drei
              Woerter nicht geraten werden muessen. */}
          <div className="v2-eyebrow" style={{ margin: '12px 0 4px' }}>Lebenszyklus</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {ZYKLEN.map(k => (
              <button key={k} type="button"
                      className={zyklus === k ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
                      style={{ height: 26, fontSize: 11, padding: '0 10px' }}
                      aria-pressed={zyklus === k}
                      onClick={() => setZyklus(k)}>
                {ZYKLUS_TEXT[k]}
              </button>
            ))}
          </div>
          <div className="v2-dim" style={{ fontSize: 11, marginTop: 5 }}>
            {ZYKLUS_ERKLAERUNG[zyklus]}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Startdatum</div>
              <input className="v2-feld" type="date" value={start}
                     onChange={e => setStart(e.target.value)} />
            </div>
            <div style={{ width: 110 }}>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Tage</div>
              <input className="v2-feld" value={tage} inputMode="numeric"
                     onChange={e => setTage(e.target.value)} />
            </div>
          </div>

          {fehler && (
            <div className="v2-hinweis" style={{ marginTop: 10, color: 'var(--neg)' }}>
              {fehler}
            </div>
          )}
        </div>

        <div className="v2-modal-f">
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>
            Abbrechen
          </button>
          <button type="button" className="v2-btn v2-btn-primary"
                  disabled={laeuft} onClick={() => void speichern()}>
            {laeuft ? 'Speichert…' : vorhanden ? 'Änderungen speichern' : 'Plan anlegen'}
          </button>
        </div>
      </div>
    </div>
  )
}
