'use client'

// G-640 (+ G-639) — Archivieren, Loeschen, Neu starten; seit G-648 in der Form
// des Entwurfs (`entwurf/Main.dc.html`, Bestaetigungskaesten je Ort).
//
// `[read]` **Die Kette prueft, die App fragt nur.** Der Entwurf fragt EINMAL
// und nennt den Verlust im Satz („Verlauf und Meilensteine gehen verloren") —
// wer dort „Endgueltig loeschen" klickt, hat den Verlauf bestaetigt
// (`p_confirm_history = true`). `[cmd]` **Vorher kam eine zweite Stufe „Lieber
// beenden?", und der Satz der Kette wiederholte die Frage** (Schirm G-640, 16.10.).
// Jede Ablehnung steht als Satz da (`kettenfehler`), nie als Rohtext.
import * as React from 'react'
import { useRouter } from 'next/navigation'

import {
  zielArchivierenAktion, zielLoeschenAktion, zielNeuStartenAktion, zielSpeichern,
} from './ziel-aktionen'
import type { Lebenszyklus } from '../../../lib/goals/lebenszyklus-write'

const tagPlus = (tag: string, n: number) => {
  const [j, m, t] = tag.split('-').map(Number)
  const d = new Date(Date.UTC(j!, m! - 1, t! + n))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}
const tageZwischen = (a: string, b: string) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000)

export const Satz = ({ r }: { r: Lebenszyklus | { ok: boolean; satz?: string | null; art?: string } | null }) =>
  r && !r.ok ? <div data-lebenszyklus-fehler={'art' in r ? r.art : 'block'} style={{ fontSize: 11.5, color: 'var(--neg)' }}>{'satz' in r ? r.satz : ''}</div> : null

/**
 * Der Bestaetigungskasten des Entwurfs. `art`:
 *   steuer         „Ziel und seine Phasen endgueltig loeschen?" + Stattdessen beenden
 *   mess           „„Titel" endgueltig loeschen? Verlauf und Meilensteine gehen verloren."
 *   abgeschlossen  „Endgueltig loeschen?"
 */
export function LoeschenFrage({ ziel, art, verlaufWochen, onZu }: {
  ziel: { goal_id: string; title: string }
  art: 'steuer' | 'mess' | 'abgeschlossen'
  verlaufWochen?: number | null
  onZu: () => void
}) {
  const router = useRouter()
  const [laeuft, setLaeuft] = React.useState(false)
  const [r, setR] = React.useState<Lebenszyklus | null>(null)
  const los = async () => {
    setLaeuft(true); setR(null)
    const x = await zielLoeschenAktion(ziel.goal_id, true)
    setLaeuft(false); setR(x)
    if (x.ok) { onZu(); router.refresh() }
  }
  const beenden = async () => {
    setLaeuft(true); setR(null)
    const e = await zielSpeichern(ziel.goal_id, { status: 'abandoned' })
    setLaeuft(false)
    if (e.ok) { onZu(); router.refresh() } else setR({ ok: false, art: 'block', schluessel: null, satz: e.fehler ?? 'Beenden ging nicht.' })
  }
  const knopf = (
    <button type="button" className="ge-btn ge-btn-r" data-loeschen-bestaetigen={art} disabled={laeuft} onClick={() => { void los() }}>
      {art === 'abgeschlossen' ? 'Löschen' : 'Endgültig löschen'}</button>
  )
  const abbrechen = <button type="button" className="ge-btn" disabled={laeuft} onClick={onZu}>Abbrechen</button>
  if (art === 'steuer') {
    return (
      <div data-loeschen-frage={art} className="ge-hinweis-rot" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <b>Ziel und seine Phasen endgültig löschen?</b>
        <span style={{ fontSize: 12.5 }}>
          {verlaufWochen ? `Dieses Ziel hat ${verlaufWochen} Wochen Verlauf. ` : ''}<b>Beenden</b> behält die Historie, Löschen entfernt sie.
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {abbrechen}
          <button type="button" className="ge-btn" data-loeschen-stattdessen="beenden" disabled={laeuft} onClick={() => { void beenden() }}>Stattdessen beenden</button>
          {knopf}
        </div>
        <Satz r={r} />
      </div>
    )
  }
  return (
    <div data-loeschen-frage={art} className="ge-hinweis-rot" style={{
      padding: art === 'mess' ? '12px 14px' : '10px 12px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
      justifyContent: 'space-between', flexBasis: '100%',
    }}>
      {art === 'mess'
        ? <span><b>„{ziel.title}“ endgültig löschen?</b> Verlauf und Meilensteine gehen verloren.</span>
        : <span>Endgültig löschen?</span>}
      <div style={{ display: 'flex', gap: 8 }}>{abbrechen}{knopf}</div>
      <Satz r={r} />
    </div>
  )
}

export function ArchivierenKnopf({ goalId, vorherBeenden = false }: { goalId: string; vorherBeenden?: boolean }) {
  const router = useRouter()
  const [r, setR] = React.useState<Lebenszyklus | null>(null)
  const [laeuft, setLaeuft] = React.useState(false)
  // `[cmd]` **`goal_archive` nimmt nur eingefrorene Ziele** (`G611_BLOCK:erst_beenden`).
  // Im Bearbeiten eines laufenden Messziels heisst Archivieren deshalb: beenden, dann archivieren.
  const los = async () => {
    setLaeuft(true); setR(null)
    if (vorherBeenden) {
      const e = await zielSpeichern(goalId, { status: 'abandoned' })
      if (!e.ok) { setLaeuft(false); setR({ ok: false, art: 'block', schluessel: null, satz: e.fehler ?? 'Beenden ging nicht.' }); return }
    }
    const x = await zielArchivierenAktion(goalId)
    setLaeuft(false); setR(x)
    if (x.ok) router.refresh()
  }
  return (
    <>
      <button type="button" className="ge-btn" data-ziel-archivieren={goalId} disabled={laeuft} onClick={() => { void los() }}>Archivieren</button>
      <Satz r={r} />
    </>
  )
}

/**
 * Neustart (`goal_restart`): vorbelegt mit heute bis heute + der alten
 * Laufzeit. `[read]` **Das neue Ziel steht zurueckgestellt da** (`on_hold`,
 * 611 Zeile 387) — aktiv wird es ueber Bearbeiten oder Fortsetzen.
 */
export function NeuStartenFluss({ ziel, heute, primaer = false }: {
  ziel: { goal_id: string; title: string; gueltig_ab: string | null; target_date: string | null }
  heute: string
  primaer?: boolean
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
      <button type="button" className={`ge-btn${primaer ? ' ge-btn-p' : ''}`} data-ziel-neu-starten={ziel.goal_id}
              onClick={() => setOffen(true)}>Neustart</button>
    )
  }
  return (
    <div data-neu-starten-dialog={ziel.goal_id} className="ge-hinweis-grau" style={{ padding: '10px 12px', fontSize: 12.5, flexBasis: '100%' }}>
      <b>„{ziel.title}“ neu starten</b> — mit denselben Werten, neuem Zeitraum.
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'end' }}>
        <div><label className="ge-lbl" htmlFor={`ns-s-${ziel.goal_id}`}>Start</label>
          <input id={`ns-s-${ziel.goal_id}`} className="ge-inp ge-num" type="date" data-neu-starten-feld="start" value={start} min={heute} onChange={e => setStart(e.target.value)} /></div>
        <div><label className="ge-lbl" htmlFor={`ns-e-${ziel.goal_id}`}>Frist</label>
          <input id={`ns-e-${ziel.goal_id}`} className="ge-inp ge-num" type="date" data-neu-starten-feld="ende" value={ende} min={start} onChange={e => setEnde(e.target.value)} /></div>
        <button type="button" className="ge-btn ge-btn-p" data-neu-starten-los disabled={laeuft}
                onClick={async () => {
                  setLaeuft(true); setR(null)
                  const x = await zielNeuStartenAktion(ziel.goal_id, start, ende)
                  setLaeuft(false); setR(x)
                  if (x.ok) router.refresh()
                }}>Neu anlegen</button>
        <button type="button" className="ge-btn ge-btn-g" onClick={() => setOffen(false)}>Abbrechen</button>
      </div>
      {r?.ok && <div data-neu-starten-fertig style={{ marginTop: 6 }}>Neu angelegt. Es steht zurückgestellt bei deinen Zielen — aktiv wird es über Bearbeiten.</div>}
      <Satz r={r} />
    </div>
  )
}
