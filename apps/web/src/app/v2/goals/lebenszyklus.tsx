'use client'

// G-640 (+ Loeschknopf aus G-639) — Archivieren, Loeschen, Neu starten.
//
// `[read]` **Die Kette prueft, die App fragt nur:** `goal_delete` weist ein
// Ziel mit Verlauf mit `G611_CONFIRM:beenden_statt_loeschen` ab — daraus wird
// die Rueckfrage „lieber beenden?" mit beiden Wegen. Jede Ablehnung steht als
// Satz da (`kettenfehler`), nie als Rohtext.
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@lumeos/ui'

import {
  zielArchivierenAktion, zielLoeschenAktion, zielNeuStartenAktion, zielSpeichern,
} from './ziel-aktionen'
import { istEingefroren, type Zustand } from '../../../lib/goals/zustand'
import type { Lebenszyklus } from '../../../lib/goals/lebenszyklus-write'

const tagPlus = (tag: string, n: number) => {
  const [j, m, t] = tag.split('-').map(Number)
  const d = new Date(Date.UTC(j!, m! - 1, t! + n))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}
const tageZwischen = (a: string, b: string) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000)

const Satz = ({ r }: { r: Lebenszyklus | null }) =>
  r && !r.ok ? <div data-lebenszyklus-fehler={r.art} style={{ fontSize: 11.5, color: 'var(--neg)', marginTop: 6 }}>{r.satz}</div> : null

export function LoeschenFluss({ ziel }: { ziel: { goal_id: string; title: string; zustand: Zustand } }) {
  const router = useRouter()
  const [stufe, setStufe] = React.useState<'zu' | 'frage' | 'verlauf'>('zu')
  const [laeuft, setLaeuft] = React.useState(false)
  const [r, setR] = React.useState<Lebenszyklus | null>(null)
  const eis = istEingefroren(ziel.zustand)
  const fertig = (x: Lebenszyklus) => { setR(x); if (x.ok) { setStufe('zu'); router.refresh() } }

  const loeschen = async (bestaetigt: boolean) => {
    setLaeuft(true); setR(null)
    const x = await zielLoeschenAktion(ziel.goal_id, bestaetigt)
    setLaeuft(false)
    if (!x.ok && x.art === 'confirm') { setStufe('verlauf'); setR(x); return }
    fertig(x)
  }
  const stattdessen = async () => {
    setLaeuft(true); setR(null)
    const x: Lebenszyklus = eis
      ? await zielArchivierenAktion(ziel.goal_id)
      : await zielSpeichern(ziel.goal_id, { status: 'abandoned' }).then(e => e.ok ? { ok: true as const }
        : { ok: false as const, art: 'block' as const, schluessel: null, satz: e.fehler ?? 'Beenden ging nicht.' })
    setLaeuft(false)
    fertig(x)
  }

  if (stufe === 'zu') {
    return (
      <>
        <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" data-ziel-loeschen={ziel.goal_id}
                aria-label={`${ziel.title} löschen`} onClick={() => setStufe('frage')} style={{ color: 'var(--neg)' }}>
          <Icon name="trash" className="v2-ic v2-ic-sm" />
        </button>
        <Satz r={r} />
      </>
    )
  }
  return (
    <div data-loeschen-stufe={stufe} style={{
      border: '1px solid color-mix(in srgb, var(--neg) 40%, var(--border))', borderRadius: 8, padding: '9px 12px',
      fontSize: 12, marginTop: 6, width: '100%',
    }}>
      {stufe === 'frage' ? (
        <><b>„{ziel.title}“ endgültig löschen?</b> Verlauf und Meilensteine gehen verloren.</>
      ) : (
        <><b>Lieber {eis ? 'archivieren' : 'beenden'}?</b> {r && !r.ok ? r.satz : ''}</>
      )}
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <button type="button" className="v2-btn v2-btn-sm" onClick={() => { setStufe('zu'); setR(null) }} disabled={laeuft}>Abbrechen</button>
        {stufe === 'verlauf' && (
          <button type="button" className="v2-btn v2-btn-sm v2-btn-primary" data-loeschen-stattdessen={eis ? 'archivieren' : 'beenden'}
                  disabled={laeuft} onClick={() => { void stattdessen() }}>{eis ? 'Archivieren' : 'Beenden'}</button>
        )}
        <button type="button" className="v2-btn v2-btn-sm" data-loeschen-bestaetigen={stufe}
                disabled={laeuft} onClick={() => { void loeschen(stufe === 'verlauf') }}
                style={{ color: 'var(--neg)' }}>{stufe === 'verlauf' ? 'Trotzdem löschen' : 'Löschen'}</button>
      </div>
      {stufe === 'frage' && <Satz r={r} />}
    </div>
  )
}

export function ArchivierenKnopf({ goalId }: { goalId: string }) {
  const router = useRouter()
  const [r, setR] = React.useState<Lebenszyklus | null>(null)
  const [laeuft, setLaeuft] = React.useState(false)
  return (
    <>
      <button type="button" className="v2-btn v2-btn-sm" data-ziel-archivieren={goalId} disabled={laeuft}
              onClick={async () => { setLaeuft(true); const x = await zielArchivierenAktion(goalId); setLaeuft(false); setR(x); if (x.ok) router.refresh() }}>
        Archivieren
      </button>
      <Satz r={r} />
    </>
  )
}

/**
 * Neu starten (`goal_restart`): vorbelegt mit heute bis heute + der alten
 * Laufzeit. `[read]` **Das neue Ziel steht zurueckgestellt da** (`on_hold`,
 * 611 Zeile 387) — aktiv wird es ueber Bearbeiten oder Fortsetzen.
 */
export function NeuStartenFluss({ ziel, heute }: {
  ziel: { goal_id: string; title: string; gueltig_ab: string | null; target_date: string | null }
  heute: string
}) {
  const router = useRouter()
  const dauer = ziel.gueltig_ab && ziel.target_date ? Math.max(7, tageZwischen(ziel.gueltig_ab, ziel.target_date)) : 84
  const [offen, setOffen] = React.useState(false)
  const [start, setStart] = React.useState(heute)
  const [ende, setEnde] = React.useState(tagPlus(heute, dauer))
  const [laeuft, setLaeuft] = React.useState(false)
  const [r, setR] = React.useState<Lebenszyklus | null>(null)
  if (!offen) {
    return (
      <button type="button" className="v2-btn v2-btn-sm v2-btn-primary" data-ziel-neu-starten={ziel.goal_id}
              onClick={() => setOffen(true)}>Neu starten</button>
    )
  }
  return (
    <div data-neu-starten-dialog={ziel.goal_id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 12, marginTop: 6, width: '100%' }}>
      <b>„{ziel.title}“ neu starten</b> — mit denselben Werten, neuem Zeitraum.
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'end' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><span className="v2-eyebrow">Start</span>
          <input className="v2-feld" type="date" data-neu-starten-feld="start" value={start} min={heute} onChange={e => setStart(e.target.value)} /></label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><span className="v2-eyebrow">Frist</span>
          <input className="v2-feld" type="date" data-neu-starten-feld="ende" value={ende} min={start} onChange={e => setEnde(e.target.value)} /></label>
        <button type="button" className="v2-btn v2-btn-sm v2-btn-primary" data-neu-starten-los disabled={laeuft}
                onClick={async () => {
                  setLaeuft(true); setR(null)
                  const x = await zielNeuStartenAktion(ziel.goal_id, start, ende)
                  setLaeuft(false); setR(x)
                  if (x.ok) router.refresh()
                }}>Neu anlegen</button>
        <button type="button" className="v2-btn v2-btn-sm v2-btn-ghost" onClick={() => setOffen(false)}>Abbrechen</button>
      </div>
      {r?.ok && <div data-neu-starten-fertig style={{ marginTop: 6 }}>Neu angelegt. Es steht zurückgestellt bei deinen Zielen — aktiv wird es über Bearbeiten.</div>}
      <Satz r={r} />
    </div>
  )
}
