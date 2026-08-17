'use client'

// Die Modale des Supplements-Moduls.
//
// `[cmd]` Die Vorlage fuehrt zwoelf (module-supplements.jsx:273-285),
// verteilt auf `module-supplements-modals.jsx` (elf) und den Rahmen.
//
// GEBAUT sind die, die aus den Tabs dieses Auftrags erreichbar sind.
// `[read]` Die uebrigen haengen an den vier Tabs, die dieser Durchgang
// nicht baut (Catalog, Stacks, Intelligence, Inventory, Injections) —
// sie stehen im Bericht.
//
// Alle sind ATTRAPPEN: es gibt kein `supplements`-Schema, also gibt es
// nichts zu speichern. Der Knopf, der speichern wuerde, sagt das.
import * as React from 'react'
import { Pill, Icon, Meter } from '@lumeos/ui'

import { STACK, type StackItem } from './daten'
import type { ModalTyp } from './kontext'

/** Rahmen fuer alle Modale — Vorlage: `SuppModal` in -modals.jsx. */
function Rahmen({
  titel, sub, breite = 520, onClose, children, fuss,
}: {
  titel: string
  sub?: string
  breite?: number
  onClose: () => void
  children: React.ReactNode
  fuss?: React.ReactNode
}) {
  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" style={{ width: breite, maxHeight: '88vh' }}
           role="dialog" aria-modal="true" aria-label={titel}
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          <Icon name="supplements" className="v2-ic v2-ic-sm" />
          <span className="v2-card-title">{titel}</span>
          {sub && <span className="v2-card-sub">{sub}</span>}
          <Pill variant="warn">Attrappe</Pill>
          <div className="v2-spacer" />
          <button type="button" className="v2-icon-btn" onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic v2-ic-sm" />
          </button>
        </div>
        <div className="v2-modal-body">{children}</div>
        <div className="v2-modal-f">
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Schliessen</button>
          {fuss}
        </div>
      </div>
    </div>
  )
}

/** Der Satz, der an jedem Speichern-Knopf steht. */
const OHNE_SCHEMA = 'Es gibt kein `supplements`-Schema — hier laesst sich noch nichts speichern.'

function NichtsZuSpeichern() {
  return (
    <p className="v2-hinweis" style={{ marginTop: 12 }}>
      <Icon name="alert" className="v2-ic v2-ic-sm" />
      <span>{OHNE_SCHEMA}</span>
    </p>
  )
}

export function SupplementsModale({
  modal, onClose,
}: {
  modal: { type: ModalTyp; payload?: unknown } | null
  onClose: () => void
}) {
  if (!modal) return null
  const p = modal.payload as Record<string, unknown> | undefined

  switch (modal.type) {
    case 'add':
    case 'catalogAdd':
    case 'catalogAddEnh':
      return (
        <Rahmen titel="Add supplement"
                sub={modal.type === 'catalogAddEnh' ? 'enhanced' : 'standard'}
                onClose={onClose}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Supplement</div>
          <input className="v2-feld" defaultValue={String(p?.name ?? '')} placeholder="Name" />
          <div className="v2-grid v2-g-cols-2" style={{ gap: 10, marginTop: 10 }}>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Dose</div>
              <input className="v2-feld" placeholder="5 g" />
            </div>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Slot</div>
              <select className="v2-feld">
                <option>Morning</option><option>Pre-workout</option>
                <option>Post-workout</option><option>Evening</option>
              </select>
            </div>
          </div>
          <NichtsZuSpeichern />
        </Rahmen>
      )

    case 'skip':
      return (
        <Rahmen titel="Log skip" sub={String(p?.name ?? '')} onClose={onClose}>
          <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Reason</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Forgot', 'Out of stock', 'Side effect', 'Deliberate', 'Travelling'].map(r => (
              <Pill key={r}>{r}</Pill>
            ))}
          </div>
          <NichtsZuSpeichern />
        </Rahmen>
      )

    case 'product':
      return (
        <Rahmen titel={String(p?.name ?? 'Product')} breite={620}
                sub={p?.inStack ? 'in stack' : 'not in stack'} onClose={onClose}>
          <p className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
            Die Vorlage zeigt hier Herstellerangaben, Preisvergleich und
            Studienlage. `[cmd]` Alles davon braucht einen Produktkatalog
            — es gibt keinen.
          </p>
          <NichtsZuSpeichern />
        </Rahmen>
      )

    case 'interaction':
      return (
        <Rahmen titel="Interaction" breite={600} onClose={onClose}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            {String(p?.pair ?? p?.title ?? '')}
          </div>
          <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
            {String(p?.note ?? p?.detail ?? p?.description ?? '')}
          </div>
        </Rahmen>
      )

    case 'reorder': {
      const posten = Array.isArray(p) ? (p as StackItem[]) : STACK.filter(s => s.servingsLeft / s.servingsTotal < 0.4)
      return (
        <Rahmen titel="Reorder" sub={`${posten.length} items`} breite={560} onClose={onClose}>
          {posten.map(s => (
            <div key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 12, flex: 1 }}>{s.name}</span>
                <span className="v2-num v2-dim" style={{ fontSize: 10.5 }}>
                  {s.servingsLeft} / {s.servingsTotal}
                </span>
              </div>
              <Meter value={s.servingsLeft} max={s.servingsTotal} color="var(--warn)" />
            </div>
          ))}
          <NichtsZuSpeichern />
        </Rahmen>
      )
    }

    case 'addLab':
      return (
        <Rahmen titel="Add lab result" onClose={onClose}>
          <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Marker</div>
              <input className="v2-feld" placeholder="Ferritin" />
            </div>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Value</div>
              <input className="v2-feld" placeholder="142 ng/mL" />
            </div>
          </div>
          <NichtsZuSpeichern />
        </Rahmen>
      )

    case 'addSideEffect':
      return (
        <Rahmen titel="Log side effect" onClose={onClose}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>What happened</div>
          <textarea className="v2-feld" rows={3} placeholder="…" />
          <NichtsZuSpeichern />
        </Rahmen>
      )

    case 'addCompound':
      return (
        <Rahmen titel="Add compound" sub="extended protocol" onClose={onClose}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Compound</div>
          <input className="v2-feld" placeholder="Name" />
          <NichtsZuSpeichern />
        </Rahmen>
      )

    case 'planCycle':
      return (
        <Rahmen titel="Plan cycle" breite={600} onClose={onClose}>
          <p className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
            Die Vorlage plant hier Zyklen mit Beginn, Dauer und Pause.
            `[read]` Das Vorgaengerrepo hat dafuer `CyclePlanner.tsx` und
            `BloodLevelChart.tsx` — beides liegt bereit, braucht aber ein
            Schema.
          </p>
          <NichtsZuSpeichern />
        </Rahmen>
      )

    case 'permissions':
      return (
        <Rahmen titel="Coach permissions" onClose={onClose}>
          <p className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
            Wer sieht welchen Teil des Stacks. Braucht die Coach-Anbindung.
          </p>
          <NichtsZuSpeichern />
        </Rahmen>
      )

    case 'logDose':
      return (
        <Rahmen titel="Log dose" sub={String(p?.name ?? '')} onClose={onClose}>
          <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Amount</div>
              <input className="v2-feld" defaultValue={String(p?.dose ?? '')} />
            </div>
            <div>
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Time</div>
              <input className="v2-feld" type="time" defaultValue="08:00" />
            </div>
          </div>
          <NichtsZuSpeichern />
        </Rahmen>
      )

    default:
      return null
  }
}
