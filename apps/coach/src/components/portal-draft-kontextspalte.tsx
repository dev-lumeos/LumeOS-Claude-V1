// Die Kontextspalte — G-405/A4, nach `module-coach-portal-context.jsx`.
//
// `[cmd]` **306 px** (`:148`), **kennt den Bereich und navigiert**
// (`:144`: `({ section, onNav })`).
//
// `[read]` **Was hier steht, ist Vorfuehrmaterial des Drafts** —
// „Lukas · peak week Monday". **Kein Modellaufruf, keine Tabelle.**
// `[cmd]` **Der Kopf sagt es**, und jede Kachel traegt ihre Herkunft.
'use client'

import * as React from 'react'
import Link from 'next/link'
import { Icon } from '@lumeos/ui'

import { DRAFT_KONTEXT } from './portal-draft-kontext'

const FARBE: Record<string, string> = {
  warn: 'var(--warn)',
  neg: 'var(--neg)',
  pos: 'var(--pos)',
  '': 'var(--acc-buddy)',
}

export function DraftKontextspalte({ bereich, echteDetails }: {
  bereich: string
  /**
   * Kennzahlen, die das Portal wirklich messen kann.
   *
   * `[read]` **Sie ersetzen die des Drafts** — je Beschriftung.
   * **Was nicht ersetzt wird, traegt den Vermerk.**
   */
  echteDetails: Record<string, string>
}) {
  const c = DRAFT_KONTEXT[bereich] ?? DRAFT_KONTEXT.overview
  const [weg, setWeg] = React.useState<string[]>([])
  const sichtbar = c.insights.filter(i => !weg.includes(i.t))

  return (
    <aside className="dp-kontext" aria-label={`Kontext ${bereich}`}>
      {/* `:150-175` — der Assistent oben */}
      <div className="dp-kontext-kopf">
        <div className="dp-orb" data-state={c.state} aria-hidden="true" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="dp-kontext-titel">
            Ops
            <span className="dp-dim dp-mono">· {c.state}</span>
          </div>
          <div className="dp-dim dp-mono">your assistant</div>
        </div>
        {/* `:169` — der Sprung in den Assistenten. `[cmd]` Das ist
            `onNav("assist")` aus dem Draft, hier als Verweis. */}
        <Link href="/?draft=assist" className="dp-icon-knopf" title="Open assistant">
          <Icon name="arrow_right" className="v2-ic v2-ic-sm" />
        </Link>
      </div>

      <div className="dp-kontext-msg">{c.msg}</div>

      {/* Woher das kommt — einmal je Spalte, nicht je Kachel. */}
      <div className="dp-kontext-herkunft">
        Aus dem Draft (<span className="dp-mono">OPS_CTX.{bereich}</span>) —
        {' '}Vorfuehrmaterial, kein Modellaufruf. Die Kennzahlen unten sind
        {' '}ersetzt, wo das Portal sie messen kann.
      </div>

      {/* `:178-186` — Schnellaktionen */}
      <div className="v2-eyebrow">Quick actions</div>
      <div className="dp-kontext-aktionen">
        {c.actions.map(([ic, l]) => (
          <button
            key={l}
            type="button"
            className="v2-btn"
            disabled
            title={`Attrappe — OPS_CTX.${bereich}.actions · kein Schreibweg`}
          >
            <Icon name={(ic || 'sparkles') as 'sparkles'} className="v2-ic v2-ic-sm" />
            {l}
          </button>
        ))}
      </div>

      {/* `:188-215` — Erkenntnisse, wegklickbar */}
      <div className="v2-eyebrow">Insights</div>
      <div className="dp-kontext-insights">
        {sichtbar.length === 0
          ? (
            <div className="dp-dim" style={{ fontSize: 11 }}>
              Alle weggeklickt — beim Neuladen stehen sie wieder da.
              Es gibt keine Tabelle, die den Zustand haelt.
            </div>
          )
          : sichtbar.map(i => (
            <div key={i.t} className="dp-insight" style={{ ['--ins' as string]: FARBE[i.v] ?? FARBE[''] }}>
              <div className="dp-insight-kopf">
                <span className="dp-insight-titel">{i.t}</span>
                <button
                  type="button"
                  className="dp-insight-weg"
                  onClick={() => setWeg([...weg, i.t])}
                  aria-label={`${i.t} ausblenden`}
                >
                  ×
                </button>
              </div>
              <div className="dp-insight-text">{i.b}</div>
            </div>
          ))}
      </div>

      {/* `:217-230` — die Kennzahlen unten */}
      <div className="v2-eyebrow">Details</div>
      <div className="dp-kontext-details">
        {c.details.map(([l, w]) => {
          const echt = echteDetails[l]
          return (
            <div key={l} className="dp-detail">
              <span className="dp-detail-label">{l}</span>
              <span
                className="dp-detail-wert dp-mono"
                data-echt={echt ? 'ja' : undefined}
                title={echt ? 'aus der Datenbank gezaehlt' : 'aus dem Draft'}
              >
                {echt ?? w}
              </span>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
