'use client'

// Ein Ziel bearbeiten (G-79).
//
// **Tom, 2026-08-18:** *„Bestehende muessen auch editierbar sein."*
//
// `[read]` **Das schliesst die Luecke aus GO-16.** Dort stand: „die
// angebundenen Dateien haben kein einziges [Eingabefeld], und
// `lesen.ts` hat keinen Schreibweg." Der Schreibweg ist jetzt
// `lib/goals/schreiben.ts`; dies ist die Flaeche dazu.
//
// **KEINE BEWERTUNG.** Der Editor schreibt, was eingegeben wird. Er
// prueft die Grenzen der Tabelle — nicht, ob ein Ziel sinnvoll ist.
import * as React from 'react'
import { Icon } from '@lumeos/ui'

import { zielSpeichern } from './ziel-aktionen'
import { waechterSatz } from '../../../lib/goals/zielpruefung'
import { einheitLesbar } from '../../../lib/goals/messziel'
import {
  STATUS_WERTE, STATUS_LABEL,
  pruefeAenderung, type ZielStatus, type ZielAenderung,
} from '../../../lib/goals/ziel-regeln'
import type { ZielFortschritt } from '../../../lib/goals/lesen'

export function ZielEditor({
  ziel, onFertig,
}: {
  ziel: ZielFortschritt
  onFertig: () => void
}) {
  const [titel, setTitel] = React.useState(ziel.title)
  const [status, setStatus] = React.useState<ZielStatus>(
    (ziel.status as ZielStatus) ?? 'active')
  const [zielwert, setZielwert] = React.useState(
    ziel.target_value == null ? '' : String(ziel.target_value))
  const [frist, setFrist] = React.useState(ziel.target_date ?? '')
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  // `[cmd]` **G-618: kein Prioritaetsfeld mehr.** `user_goals_check1`
  // (aktiv nur 1–3) und `uq_user_goals_active_slot` gibt es live nicht
  // mehr (gemessen 2026-10-09); steuernd ist `goal_role`.

  const speichern = async () => {
    // `[cmd]` **G-628, gemessen 2026-10-08:** der Editor schickte IMMER
    // `target_value` und `target_date` mit — auch unveraendert. Seit G-626
    // laeuft dann `g626_guard_controlling_goal_update`, und ein Statuswechsel
    // eines alten Ziels ohne Zielwert scheiterte an
    // `G626_BLOCK:bmi_nicht_pruefbar,ziel_oder_datum`. **Nur, was sich
    // geaendert hat, wird geschrieben.**
    const neuWert = zielwert.trim() === '' ? null : Number(zielwert)
    const neuFrist = frist.trim() === '' ? null : frist
    const a: ZielAenderung = {
      ...(titel !== ziel.title ? { title: titel } : {}),
      ...(status !== ziel.status ? { status } : {}),
      ...(neuWert !== (ziel.target_value ?? null) ? { target_value: neuWert } : {}),
      ...(neuFrist !== (ziel.target_date ?? null) ? { target_date: neuFrist } : {}),
    }
    if (Object.keys(a).length === 0) { onFertig(); return }
    const lokal = pruefeAenderung(a)
    if (lokal) { setFehler(lokal); return }

    setLaeuft(true)
    setFehler(null)
    const e = await zielSpeichern(ziel.goal_id, a)
    setLaeuft(false)
    if (e.ok) onFertig()
    // `[read]` **G626_BLOCK / G626_CONFIRM als Satz**, nicht als Code.
    else setFehler(e.fehler ? waechterSatz(e.fehler, []) ?? e.fehler : e.fehler)
  }


  return (
    <div style={{
      border: '1px solid color-mix(in oklch, var(--acc-goals) 35%, var(--border))',
      borderRadius: 'var(--radius)',
      background: 'color-mix(in oklch, var(--acc-goals) 4%, var(--surface))',
      padding: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>Ziel bearbeiten</span>
        <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                style={{ marginLeft: 'auto' }}
                onClick={onFertig} disabled={laeuft}>
          <Icon name="x" className="v2-ic v2-ic-sm" />
        </button>
      </div>

      <div className="v2-col-gap" style={{ gap: 10 }}>
        <label style={{ display: 'block' }}>
          <span className="v2-eyebrow">Titel</span>
          <input className="v2-feld" style={{ width: '100%', marginTop: 3 }}
                 value={titel} onChange={e => setTitel(e.target.value)} />
        </label>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <label style={{ flex: 1, minWidth: 130 }}>
            <span className="v2-eyebrow">Status</span>
            <select className="v2-feld" style={{ width: '100%', marginTop: 3 }}
                    value={status}
                    onChange={e => setStatus(e.target.value as ZielStatus)}>
              {STATUS_WERTE.map(s => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <label style={{ flex: 1, minWidth: 130 }}>
            <span className="v2-eyebrow">
              Zielwert{ziel.target_unit ? ` (${einheitLesbar(ziel.target_unit)})` : ''}
            </span>
            <input className="v2-feld" type="number" step="0.1"
                   style={{ width: '100%', marginTop: 3 }}
                   value={zielwert} onChange={e => setZielwert(e.target.value)} />
          </label>
          <label style={{ flex: 1, minWidth: 130 }}>
            <span className="v2-eyebrow">Frist</span>
            <input className="v2-feld" type="date" style={{ width: '100%', marginTop: 3 }}
                   value={frist} onChange={e => setFrist(e.target.value)} />
          </label>
        </div>


        {fehler && (
          <div style={{ fontSize: 11.5, color: 'var(--neg)' }}>{fehler}</div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" className="v2-btn v2-btn-ghost"
                  onClick={onFertig} disabled={laeuft}>
            Abbrechen
          </button>
          <button type="button" className="v2-btn v2-btn-primary"
                  onClick={() => void speichern()} disabled={laeuft}>
            {laeuft ? 'Speichert…' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}
