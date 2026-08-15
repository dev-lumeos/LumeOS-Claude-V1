'use client'

// Kontextspalte der Oberflaeche v2. Uebersetzt aus shell.jsx.
//
// DER GROSSE UNTERSCHIED ZUR VORLAGE: dort haengt an dieser Komponente
// ein Objekt CONTEXT_DATA mit rund 220 Zeilen erfundener Inhalte —
// HRV-Werte, "€417 Monatsbeitrag", "Tom Müller", "12.402 DAU". Das ist
// Vorfuehrmaterial, kein Baustein. Es wird NICHT uebernommen; die
// Spalte bekommt ihren Inhalt von aussen.
//
// [read] Der Auftrag: "Buddy bleibt eine Attrappe. Bau die Flaeche,
// nicht den Aufruf."
import * as React from 'react'
import { Icon, type IconName } from '../icons'
import { Card, Row } from '../primitives'
import { BuddyOrb, type BuddyState } from './buddy-orb'

export type QuickAction = {
  icon: IconName
  label: string
  onClick?: () => void
}

export type Insight = {
  id: string
  variant?: 'pos' | 'warn' | 'neg'
  title: React.ReactNode
  body: React.ReactNode
  /** Beschriftungen der Knoepfe. Ohne onClick bleiben sie ohne Wirkung. */
  actions?: Array<{ label: string; onClick?: () => void }>
}

export type ContextDetail = {
  label: React.ReactNode
  value: React.ReactNode
}

export type ContextPanelProps = {
  /** Ueberschrift, in der Regel der Modulname. */
  label: string
  /**
   * Buddys Text. [read] In der Vorlage ist er je Modul vorformuliert
   * und klingt, als haette ein Modell ihn erzeugt. Hier kommt er von
   * aussen — heute als fester Text, spaeter aus einem Aufruf.
   */
  buddyMessage?: React.ReactNode
  buddyState?: BuddyState
  actions?: QuickAction[]
  insights?: Insight[]
  details?: ContextDetail[]
  onDismissInsight?: (id: string) => void
}

export function ContextPanel({
  label, buddyMessage, buddyState = 'idle',
  actions = [], insights = [], details = [], onDismissInsight,
}: ContextPanelProps) {
  return (
    <aside className="v2-context" aria-label={`Kontext ${label}`}>
      <div className="v2-ctx-h">
        <div className="v2-ctx-h-title">
          <Icon name="sparkles" className="v2-ic v2-ic-sm"
                style={{ color: 'var(--acc-buddy)' }} />
          Context · {label}
        </div>
        <div className="v2-ctx-h-actions">
          <button type="button" className="v2-icon-btn" disabled title="Anheften (noch nicht verfuegbar)">
            <Icon name="pin" className="v2-ic v2-ic-sm" />
          </button>
          <button type="button" className="v2-icon-btn" disabled title="Mehr (noch nicht verfuegbar)">
            <Icon name="more" className="v2-ic v2-ic-sm" />
          </button>
        </div>
      </div>

      <div className="v2-ctx-body">
        {buddyMessage != null && (
          <div className="v2-orb-wrap">
            <BuddyOrb state={buddyState} size={84} />
            <div className="v2-orb-status">
              <span className="v2-dot" style={{ background: 'var(--pos)', marginRight: 6 }} />
              Buddy · {buddyState}
            </div>
            <div className="v2-orb-msg">{buddyMessage}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <button type="button" className="v2-btn" disabled title="Noch nicht verfuegbar">
                <Icon name="message" className="v2-ic v2-ic-sm" /> Ask
              </button>
              <button type="button" className="v2-btn v2-btn-ghost" disabled title="Noch nicht verfuegbar">
                View memory
              </button>
            </div>
          </div>
        )}

        {actions.length > 0 && (
          <div>
            <div className="v2-ctx-section-title">
              <Icon name="zap" className="v2-ic v2-ic-sm" />
              Quick actions
            </div>
            <div className="v2-qa-grid">
              {actions.map((a, i) => (
                <button key={i} type="button" className="v2-qa"
                        onClick={a.onClick} disabled={!a.onClick}>
                  <Icon name={a.icon} />
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {insights.length > 0 && (
          <div>
            <div className="v2-ctx-section-title">
              <Icon name="alert" className="v2-ic v2-ic-sm" />
              Insights
              <span className="v2-count v2-num"
                    style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--fg-dim)' }}>
                {insights.length}
              </span>
            </div>
            <div className="v2-col-gap" style={{ gap: 8 }}>
              {insights.map(ins => (
                <div key={ins.id}
                     className={`v2-insight ${ins.variant ? `v2-${ins.variant}` : ''}`.trim()}>
                  <div className="v2-insight-mark" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="v2-insight-title">{ins.title}</div>
                    <div className="v2-insight-body">{ins.body}</div>
                    <div className="v2-insight-actions">
                      {ins.actions?.map((a, j) => (
                        <button
                          key={j}
                          type="button"
                          className={`v2-btn ${j === 0 ? 'v2-btn-accent' : 'v2-btn-ghost'}`}
                          style={{ height: 22, fontSize: 11, padding: '0 8px' }}
                          onClick={a.onClick}
                          disabled={!a.onClick}
                        >
                          {a.label}
                        </button>
                      ))}
                      {onDismissInsight && (
                        <button
                          type="button"
                          className="v2-btn v2-btn-ghost"
                          style={{ height: 22, fontSize: 11, padding: '0 8px' }}
                          onClick={() => onDismissInsight(ins.id)}
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {details.length > 0 && (
          <div>
            <div className="v2-ctx-section-title">
              <Icon name="layers" className="v2-ic v2-ic-sm" />
              Module details
            </div>
            <Card className="v2-card-tight">
              {details.map((d, i) => <Row key={i} label={d.label} value={d.value} />)}
            </Card>
          </div>
        )}
      </div>
    </aside>
  )
}
