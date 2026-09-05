'use client'
// ════════════════════════════════════════════════════════════════════
// DIE EINKAUFSLISTE — G-345
// ════════════════════════════════════════════════════════════════════
//
// **E-64, 2026-09-07.** `[cmd]` **Drei Orte, EIN Fenster:** der
// Planner (Hauptfall), das Rezept (Nebenfall) und der eigene Reiter.
//
// `[read]` **Auf derselben Huelle wie Suche (G-320/321),
// Mahlzeiten-Modal (G-336) und Quick-Add (G-340)** — der Auftrag
// sagt es seit G-336: dieselbe Machart, keine neue.
//
// `[cmd]` **Was die Liste kann** (E-64): abhaken, bearbeiten,
// archivieren, teilen.
//
// `[read]` **Loeschen gibt es nicht** — `authenticated` hat kein
// DELETE auf `shopping_lists` (gemessen 2026-09-07). **Eine
// Einkaufsliste ist ein Beleg, was man gekauft hat.**
import * as React from 'react'
import { Icon } from '@lumeos/ui'

import { ZiehModal } from './zieh-modal'
import type { Einkaufsliste } from '../../../lib/nutrition/einkaufsliste-lesen'
import {
  listeArchivieren, postenAbhaken, postenEntfernen, postenHinzufuegen,
  postenMenge,
} from './einkaufsliste-aktionen'

/** Menge und Einheit eines Postens, wie sie dastehen sollen. */
function mengeText(p: Einkaufsliste['posten'][number]): string {
  const wert = p.amount_g ?? p.quantity
  if (wert === null) return '—'
  const n = wert.toLocaleString('de-DE', { maximumFractionDigits: 1 })
  return `${n} ${p.unit_display}`
}

export function EinkaufslisteModal({
  liste, onClose, onGeaendert,
}: {
  liste: Einkaufsliste
  onClose: () => void
  onGeaendert?: () => void
}) {
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  // `[read]` **Der Haken wirkt sofort im Bild**, die Datenbank folgt
  // — beim Einkaufen steht man im Laden, nicht vor einem Ladebalken.
  const [gehakt, setGehakt] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(liste.posten.map(p => [p.id, p.is_checked])))
  const [entfernt, setEntfernt] = React.useState<Set<string>>(new Set())
  const [neuName, setNeuName] = React.useState('')
  const [neuMenge, setNeuMenge] = React.useState('')

  const sichtbar = liste.posten.filter(p => !entfernt.has(p.id))
  const offen = sichtbar.filter(p => !gehakt[p.id]).length

  async function fuehreAus(
    f: () => Promise<{ ok: boolean; fehler?: string }>,
  ) {
    setLaeuft(true)
    setFehler(null)
    try {
      const a = await f()
      if (!a.ok) setFehler(a.fehler ?? 'Nicht gespeichert.')
      else onGeaendert?.()
    } finally {
      setLaeuft(false)
    }
  }

  async function haken(id: string, wert: boolean) {
    setGehakt(v => ({ ...v, [id]: wert }))
    const a = await postenAbhaken(id, wert)
    if (!a.ok) {
      // `[read]` **Zurueckdrehen, wenn es nicht ankam** — ein Haken,
      // der nur im Bild steht, ist schlimmer als keiner.
      setGehakt(v => ({ ...v, [id]: !wert }))
      setFehler(a.fehler)
    } else onGeaendert?.()
  }

  return (
    <ZiehModal
      titel={liste.name}
      aria={`Einkaufsliste ${liste.name}`}
      breite={560}
      probe="einkaufsliste"
      onClose={() => { if (!laeuft) onClose() }}
    >
      <div className="v2-col-gap" style={{ gap: 12 }}>
        <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.5 }}>
          {sichtbar.length} {sichtbar.length === 1 ? 'Posten' : 'Posten'} ·{' '}
          <strong>{offen} offen</strong>
          {liste.status === 'archived' && <> · <em>archiviert</em></>}
        </div>

        {/* ── Die Posten ─────────────────────────────────────── */}
        <div className="v2-col-gap" style={{ gap: 4 }}>
          {sichtbar.length === 0 && (
            <p className="v2-muted" style={{ fontSize: 11.5, margin: 0 }}>
              Diese Liste ist leer.
            </p>
          )}
          {sichtbar.map(p => (
            <div
              key={p.id} data-probe="listen-posten"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 0', borderBottom: '1px solid var(--border)',
              }}
            >
              <input
                type="checkbox"
                data-probe="posten-haken"
                aria-label={`${p.food_name} abhaken`}
                checked={gehakt[p.id] ?? false}
                disabled={laeuft || liste.status === 'archived'}
                onChange={e => void haken(p.id, e.target.checked)}
              />
              <span style={{
                flex: 1, fontSize: 12.5,
                // `[read]` **Abgehakt heisst durchgestrichen, nicht
                // weg** — wer im Laden zurueckblaettert, will sehen,
                // was er schon hat.
                textDecoration: gehakt[p.id] ? 'line-through' : 'none',
                opacity: gehakt[p.id] ? 0.55 : 1,
              }}>
                {p.food_name}
                {p.item_source === 'manual' && (
                  <span className="v2-dim" style={{ fontSize: 9.5, marginLeft: 5 }}>
                    frei
                  </span>
                )}
              </span>
              <span className="v2-num v2-dim" style={{ fontSize: 11.5 }}>
                {mengeText(p)}
              </span>
              {liste.status !== 'archived' && (
                <button
                  type="button" className="v2-icon-btn"
                  data-probe="posten-entfernen"
                  aria-label={`${p.food_name} entfernen`}
                  disabled={laeuft}
                  onClick={() => {
                    setEntfernt(s => new Set(s).add(p.id))
                    void fuehreAus(() => postenEntfernen(p.id))
                  }}
                >
                  <Icon name="trash" className="v2-ic v2-ic-sm" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ── Einen freien Posten dazu ───────────────────────── */}
        {liste.status !== 'archived' && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
            <label style={{ fontSize: 10, flex: 1 }}>
              <span className="v2-eyebrow">Posten hinzufügen</span>
              <input
                className="v2-feld" data-probe="posten-name"
                style={{ fontSize: 12, width: '100%' }}
                aria-label="Name des Postens"
                placeholder="z. B. Spülmittel"
                value={neuName}
                disabled={laeuft}
                onChange={e => setNeuName(e.target.value)}
              />
            </label>
            <label style={{ fontSize: 10 }}>
              <span className="v2-eyebrow">Menge</span>
              <input
                className="v2-feld v2-mono" data-probe="posten-menge"
                style={{ fontSize: 12, width: 78 }}
                aria-label="Menge"
                placeholder="1"
                value={neuMenge}
                disabled={laeuft}
                onChange={e => setNeuMenge(e.target.value)}
              />
            </label>
            <button
              type="button" className="v2-btn v2-btn-sm"
              data-probe="posten-anlegen"
              disabled={laeuft || neuName.trim().length === 0}
              onClick={() => {
                const m = Number(neuMenge.replace(',', '.'))
                void fuehreAus(() => postenHinzufuegen(
                  liste.id, neuName,
                  Number.isFinite(m) && m > 0 ? m : 1, 'Stk'))
                setNeuName('')
                setNeuMenge('')
              }}
            >
              <Icon name="plus" className="v2-ic v2-ic-sm" />
            </button>
          </div>
        )}

        {fehler && (
          <p style={{ fontSize: 11, color: 'var(--neg)', margin: 0 }}
             data-probe="listen-fehler">{fehler}</p>
        )}

        {/* ── Teilen und archivieren ─────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
          {/* `[read]` **Teilen heisst hier: als Text kopieren.**
              `[cmd]` **SPEC_03 Flow 8, Schritt 6 nennt es** — ohne
              Empfaenger, ohne Konto, ohne Freigabe. **Die
              Zwischenablage ist der kleinste Weg, der wirklich
              teilt.** */}
          <button
            type="button" className="v2-btn v2-btn-sm"
            data-probe="liste-teilen"
            onClick={() => {
              const text = [
                liste.name, '',
                ...sichtbar.map(p =>
                  `${gehakt[p.id] ? '[x]' : '[ ]'} ${p.food_name} — ${mengeText(p)}`),
              ].join('\n')
              void navigator.clipboard?.writeText(text)
                .then(() => setFehler(null))
                .catch(() => setFehler('Die Zwischenablage ist gesperrt.'))
            }}
          >
            <Icon name="share" className="v2-ic v2-ic-sm" /> Als Text kopieren
          </button>

          {liste.status !== 'archived' && (
            <button
              type="button" className="v2-btn v2-btn-sm"
              data-probe="liste-archivieren"
              disabled={laeuft}
              onClick={() => void fuehreAus(async () => {
                const a = await listeArchivieren(liste.id)
                if (a.ok) onClose()
                return a
              })}
            >
              <Icon name="check" className="v2-ic v2-ic-sm" /> Archivieren
            </button>
          )}
        </div>

        {/* `[read]` **Warum kein *Loeschen*:** `authenticated` hat
            kein DELETE auf `shopping_lists`. **Die Datenbank setzt
            E-64 durch, nicht dieser Knopf.** */}
        <p className="v2-muted" style={{ fontSize: 10.5, margin: 0, lineHeight: 1.5 }}>
          Archivierte Listen bleiben lesbar — eine Einkaufsliste ist ein
          Beleg, was du gekauft hast.
        </p>
      </div>
    </ZiehModal>
  )
}
