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
import { Pill, Icon, Meter, InEntwicklungKnopf } from '@lumeos/ui'

import { STACK, type StackItem } from './daten'
// G-45: Orte und Zustandsrechnung des Injections-Tabs.
import { INJ_ORTE, INJ_PROTOKOLL } from './injektion-daten'
import { ortZustand } from './tab-injektionen'
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

    // G-45: das Fenster des Injections-Tabs
    // (module-supplements-injection.jsx:389-511).
    //
    // `[cmd]` DIE PRUEFUNG IST DER KERN DIESES FENSTERS, nicht
    // Beiwerk: die Vorlage sperrt den Speichern-Knopf, wenn die Menge
    // ueber der Ortsgrenze liegt oder das Ruhefenster noch laeuft.
    // Uebernommen samt Sperre — ein Fenster, das die Grenze zeigt und
    // trotzdem speichern liesse, waere schlechter als keines.
    case 'logInjection':
      return <LogInjektionFenster onClose={onClose} />

    default:
      return null
  }
}

/**
 * Das Fenster zum Erfassen einer Injektion (G-45).
 *
 * QUELLE: theme-v1/module-supplements-injection.jsx:389-511.
 *
 * `[cmd]` Eigene Komponente statt eines `case`-Zweigs, weil es
 * Zustand braucht: Ort, Menge und Schmerz aendern die Pruefung live.
 * Dieselbe Aufteilung wie bei den uebrigen zustandsbehafteten Fenstern.
 */
function LogInjektionFenster({ onClose }: { onClose: () => void }) {
  const [ort, setOrt] = React.useState('vglute_l')
  const [ml, setMl] = React.useState(0.6)
  const [schmerz, setSchmerz] = React.useState(1)

  const s = INJ_ORTE.find(x => x.id === ort)!
  const st = ortZustand(ort)
  const ueberGrenze = ml > s.maxMl
  const zuFrueh = st.status === 'resting'
  const gesperrt = ueberGrenze || zuFrueh

  return (
    <Rahmen
      titel="Log injection"
      sub="Site rotation and volume are validated before saving"
      breite={680}
      onClose={onClose}
      fuss={(
        <>
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
          <div className="v2-spacer" />
          {gesperrt && (
            <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm" style={{ color: 'var(--warn)' }}>
              Override with reason
            </button>
          )}
          {/* `[cmd]` `InEntwicklungKnopf` kennt kein `disabled`
              (packages/ui/src/in-entwicklung.tsx:81-88), und
              packages/ui ist in diesem Auftrag gesperrt. Der gesperrte
              Zustand der Vorlage ist aber kein Zierrat — er verhindert
              das Speichern bei verletzter Grenze. Deshalb hier ein
              echter `<button disabled>`; nur der freigegebene Fall
              geht durch `InEntwicklungKnopf`. **Gemeldet.** */}
          {gesperrt ? (
            <button type="button" className="v2-btn v2-btn-primary" disabled>
              <Icon name="check" className="v2-ic v2-ic-sm" />Log injection
            </button>
          ) : (
            <InEntwicklungKnopf
              titel="Log injection"
              grund={OHNE_SCHEMA}
              className="v2-btn v2-btn-primary"
            >
              <Icon name="check" className="v2-ic v2-ic-sm" />Log injection
            </InEntwicklungKnopf>
          )}
        </>
      )}
    >
      <div className="v2-grid v2-g-cols-3" style={{ gap: 10, marginBottom: 12 }}>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Compound</div>
          <select className="v2-feld" aria-label="Compound">
            {INJ_PROTOKOLL.map(l => l.compound)
              .filter((c, i, a) => a.indexOf(c) === i)
              .map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Date</div>
          <input className="v2-feld v2-mono" type="date" defaultValue="2026-08-15" aria-label="Date" />
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Time</div>
          <input className="v2-feld v2-mono" type="time" defaultValue="07:15" aria-label="Time" />
        </div>
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Site · pick from the list</div>
      <div className="v2-inj-wahl">
        {INJ_ORTE.map(x => {
          const xs = ortZustand(x.id)
          const an = x.id === ort
          return (
            <button
              key={x.id}
              type="button"
              onClick={() => setOrt(x.id)}
              className="v2-inj-wahl-knopf"
              aria-pressed={an}
              style={{
                background: an ? `color-mix(in oklch, ${xs.c} 10%, var(--surface))` : 'var(--surface)',
                border: `1px solid ${an ? `color-mix(in oklch, ${xs.c} 35%, var(--border))` : 'var(--border)'}`,
              }}
            >
              <span
                style={{
                  width: 6, height: 6, borderRadius: 999, background: xs.c,
                  flexShrink: 0, opacity: xs.status === 'resting' ? 0.5 : 1,
                }}
              />
              <span style={{ fontSize: 11, flex: 1, color: an ? 'var(--fg)' : 'var(--fg-muted)' }}>{x.name}</span>
              <span className="v2-dim v2-mono" style={{ fontSize: 9 }}>
                {xs.daysAgo != null ? `${xs.daysAgo}d` : 'new'}
              </span>
            </button>
          )
        })}
      </div>

      <div className="v2-grid v2-g-cols-3" style={{ gap: 10, marginBottom: 12 }}>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Volume · max {s.maxMl} ml</div>
          <input
            className="v2-feld v2-mono"
            type="number"
            step="0.05"
            value={ml}
            onChange={e => setMl(Number(e.target.value))}
            aria-label="Volume"
            style={{
              border: `1px solid ${ueberGrenze ? 'var(--neg)' : 'var(--border)'}`,
              color: ueberGrenze ? 'var(--neg)' : 'var(--fg)',
            }}
          />
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Dose</div>
          <input className="v2-feld v2-mono" defaultValue="150" aria-label="Dose" />
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Needle · recommended</div>
          <input className="v2-feld v2-mono" defaultValue={s.needle} aria-label="Needle" />
        </div>
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Injection pain · 0–3</div>
      <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
        {['none', 'mild', 'moderate', 'severe'].map((l, i) => (
          <button
            key={l}
            type="button"
            onClick={() => setSchmerz(i)}
            className={schmerz === i ? 'v2-btn v2-btn-primary v2-btn-sm' : 'v2-btn v2-btn-sm'}
            style={{ flex: 1 }}
          >
            {i} · {l}
          </button>
        ))}
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Notes</div>
      <input
        className="v2-feld"
        placeholder="Bleeding, lump, unusual soreness…"
        aria-label="Notes"
        style={{ marginBottom: 12 }}
      />

      {gesperrt ? (
        <div className="v2-inj-pruefung-rot">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Icon name="alert" className="v2-ic v2-ic-sm" style={{ color: 'var(--neg)' }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--neg)' }}>Validation</span>
          </div>
          <div className="v2-col-gap" style={{ gap: 3 }}>
            {ueberGrenze && (
              <div className="v2-mono" style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
                volume {ml} ml exceeds {s.name} limit of {s.maxMl} ml
              </div>
            )}
            {zuFrueh && (
              <div className="v2-mono" style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
                {s.name} used {st.daysAgo}d ago · rest window is {s.restDays}d
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="v2-inj-pruefung-gruen">
          <Icon
            name="check"
            className="v2-ic v2-ic-sm"
            style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5, color: 'var(--pos)' }}
          />
          {s.name} is clear · {st.daysAgo != null ? `last used ${st.daysAgo}d ago` : 'never used'}
          {' '}· volume within {s.maxMl} ml limit
        </div>
      )}
    </Rahmen>
  )
}
