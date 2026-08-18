'use client'

// Die fuenf Modale des Athletenbereichs und ihr geteilter Rahmen.
//
// QUELLE: theme-v1/module-coach.jsx — `KModal` :696-715 (der Rahmen),
// `CoachDetailModal` :717-751, `InviteCoachModal` :753-787,
// `ScanQRModal` :789-800, `MessageThreadModal` :802-822,
// `NoteDetailModal` :855-866.
//
// NICHT uebernommen: `AthleteDetailModal` (:824-853) und `NewPlanModal`
// (:868-…). `[cmd]` Beide gehoeren zum Trainerarbeitsplatz, den
// `CoachPortalStandalone` traegt — der Athletenzweig oeffnet sie nie.
// Sie stehen in der Vorlage nur deshalb in derselben Datei, weil
// `module-coach.jsx` beide Seiten der Beziehung fuehrt. Dieselbe
// Abgrenzung wie in `kontext.tsx`: fuenf Modaltypen, nicht sieben.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript, jede Requisite getippt; kein `any`.
//   2. Klassen auf `v2-`-Praefix.
//   3. `color-mix(in srgb, …)` -> `in oklch`.
//   4. `MESSAGES_THREAD` und `COACHES` als blosse Globale -> Importe
//      aus `./daten`; `window.CoachRelationshipCard` -> Import.
//   5. `arr_r` -> `arrow_right` (siehe unten).
//   6. `Math.random()` im QR-Muster -> `QR_MUSTER` (siehe unten).
//   7. Mehrteilige JSX-Textknoten zu je einem Template-Literal
//      zusammengezogen — getrennte Ausdruecke wie `{a} · {b}` erzeugen
//      sonst eine Hydration-Meldung.
//
// `[cmd]` `<Icon name="arr_r">` (module-coach.jsx:808, Knopf „Send")
// ist derselbe Tippfehler fuer `arrow_right` wie in G-20, G-21 und
// G-36 — nicht uebernommen. `arrow_right` steht in icons.tsx; `arr_r`
// nicht. Auch in `coach.css:19-21` festgehalten.
//
// `[cmd]` EINE HYDRATIONSFALLE, entschaerft: `InviteCoachModal`
// (module-coach.jsx:778) zeichnet sein QR-Muster mit
// `Math.random() > 0.5` ueber 64 Zellen. Auf dem Server faellt der
// Wuerfel anders als im Browser — 64 Abweichungen in einem Modal.
// Ersetzt durch das feste Bitmuster `QR_MUSTER`: dieselbe Optik, kein
// Zufall. Der Name steht so in `coach.css:27`.
//
// `[cmd]` `window.CoachRelationshipCard &&` (module-coach.jsx:740) ist
// die Vorsichtsklausel eines Skriptbuendels, in dem eine Datei fehlen
// kann. Hier ist `CoachRelationshipCard` ein Import aus
// `./tab-onboarding` — ein Import ist immer da, die Klausel entfaellt,
// die Karte steht unbedingt.
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst. Knoepfe, die in der Vorlage kein `onClick`
// tragen, bleiben ohne — sie stehen da und tun nichts, genau wie dort.
// Lebendig sind nur die vier Wege, die auch die Vorlage kennt: der
// Schleier, das X, die Knoepfe „Close"/„Cancel" und das Antwortfeld.
//
// `[cmd]` ALLES IST ATTRAPPE. Ein `coach`-Schema gibt es nicht.
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import { COACHES, MESSAGES_THREAD, type Coach, type CoachNote } from './daten'
import { useCoach, type ModalZustand } from './kontext'
import { CoachRelationshipCard } from './tab-onboarding'

/** `[cmd]` Ersatz fuer `Math.random() > 0.5` — 64 Zellen, 8 × 8, fest.
 *  Die drei Ecken tragen die Suchmarken eines echten QR-Codes, der Rest
 *  ist gestreut. Die Vorlage wuerfelt hier; siehe Kopfkommentar. */
const QR_MUSTER: number[] = [
  1, 1, 1, 0, 1, 1, 1, 1,
  1, 0, 1, 1, 0, 0, 0, 1,
  1, 1, 1, 0, 1, 1, 0, 1,
  0, 0, 1, 1, 0, 1, 1, 0,
  1, 1, 0, 1, 1, 0, 1, 1,
  1, 0, 1, 0, 0, 1, 0, 1,
  1, 1, 1, 0, 1, 1, 1, 0,
  1, 0, 1, 1, 0, 1, 0, 1,
]

/** Die Eingabefelder der drei Formularmodale — dieselben Werte wie in
 *  der Vorlage (module-coach.jsx:766, :770, :798, :807). */
const FELD: React.CSSProperties = {
  width: '100%', height: 30, background: 'var(--surface)',
  border: '1px solid var(--border)', borderRadius: 6, padding: '0 10px',
  fontSize: 12,
}

// ── Der Rahmen ───────────────────────────────────────────────────────
// [cmd] module-coach.jsx:696-715.
function KModal({
  title, subtitle, eyebrow, accent, onClose, footer, children, width = 600,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  eyebrow?: React.ComponentProps<typeof Icon>['name']
  accent?: string
  onClose: () => void
  footer?: React.ReactNode
  children: React.ReactNode
  width?: number
}) {
  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div
        className="v2-modal"
        style={{ width, maxHeight: '92vh' }}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        onClick={e => e.stopPropagation()}
      >
        <div className="v2-modal-h">
          {eyebrow && (
            <div
              style={{
                width: 26, height: 26, borderRadius: 6,
                background: `color-mix(in oklch, ${accent ?? 'var(--acc-coach)'} 18%, transparent)`,
                border: `1px solid color-mix(in oklch, ${accent ?? 'var(--acc-coach)'} 35%, transparent)`,
                color: accent ?? 'var(--acc-coach)', display: 'grid', placeItems: 'center',
              }}
            >
              <Icon name={eyebrow} className="v2-ic" />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
            {subtitle && <div className="v2-dim" style={{ fontSize: 11 }}>{subtitle}</div>}
          </div>
          <button className="v2-icon-btn" aria-label="Close" onClick={onClose}>
            <Icon name="x" className="v2-ic" />
          </button>
        </div>
        <div className="v2-modal-body" style={{ overflowY: 'auto' }}>{children}</div>
        {footer && <div className="v2-modal-f">{footer}</div>}
      </div>
    </div>
  )
}

// ── Die Verteilung ───────────────────────────────────────────────────
// `[cmd]` Die Vorlage rendert die Modale einzeln im Rahmen
// (module-coach.jsx:209-215). Hier steht eine Weiche, wie in
// `medical/modale.tsx` — `ansicht.tsx` ruft nur `<CoachModale
// zustand={modal} />`, `close` kommt aus `useCoach()`.
export function CoachModale({ zustand }: { zustand: ModalZustand | null }) {
  const { close } = useCoach()
  if (!zustand) return null
  switch (zustand.typ) {
    case 'coachDetail': return <CoachDetailModal c={zustand.c} onClose={close} />
    case 'invite': return <InviteCoachModal onClose={close} />
    case 'scan': return <ScanQRModal onClose={close} />
    case 'thread': return <MessageThreadModal c={zustand.c} onClose={close} />
    case 'noteDet': return <NoteDetailModal n={zustand.n} onClose={close} />
    default: return null
  }
}

// ── Trainerdetail ────────────────────────────────────────────────────
// [cmd] module-coach.jsx:717-751.
function CoachDetailModal({ c, onClose }: { c: Coach; onClose: () => void }) {
  return (
    <KModal
      title={c.name}
      subtitle={`${c.type} coach · ${c.org}`}
      eyebrow="user"
      accent={c.color}
      onClose={onClose}
      width={680}
      footer={(
        <>
          <button className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>
          <button className="v2-btn">
            <Icon name="message" className="v2-ic v2-ic-sm" />
            Message
          </button>
          <button className="v2-btn v2-btn-ghost" style={{ color: 'var(--neg)' }}>End coaching</button>
        </>
      )}
    >
      <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
        <div
          style={{
            width: 64, height: 64, borderRadius: 14, background: c.color, color: 'var(--bg)',
            display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 22, flexShrink: 0,
          }}
        >
          {c.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.55 }}>{c.bio}</div>
        </div>
      </div>

      <div className="v2-grid v2-g-cols-3" style={{ gap: 10, marginBottom: 16 }}>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Since</div>
          <div className="v2-num" style={{ fontSize: 14 }}>{c.since}</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Cadence</div>
          <div style={{ fontSize: 12 }}>{c.cadence}</div>
        </Card>
        <Card className="v2-card-tight" style={{ padding: 12 }}>
          <div className="v2-eyebrow">Fee</div>
          <div className="v2-num" style={{ fontSize: 14 }}>{c.fee}</div>
        </Card>
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Active plan</div>
      <Card className="v2-card-tight" style={{ padding: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{c.activePlan}</div>
        <div className="v2-muted" style={{ fontSize: 11.5 }}>
          {`Assigned by ${c.name} · auto-syncs to your active modules`}
        </div>
      </Card>

      {/* [cmd] Die Vorlage schreibt hier `window.CoachRelationshipCard &&`
          (Zeile 740) — die Vorsichtsklausel eines Skriptbuendels. Der
          Import ist immer da; die Klausel entfaellt. */}
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Relationship</div>
      <div style={{ marginBottom: 14 }}><CoachRelationshipCard coach={c} /></div>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Shared modules</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
        {c.sharedModules.map(m => <Pill key={m}>{m}</Pill>)}
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Last message</div>
      <div
        style={{
          padding: 12, background: 'var(--surface)', borderRadius: 6,
          fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.55,
        }}
      >
        <span className="v2-dim v2-mono" style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>
          {c.lastMsgAt}
        </span>
        {c.lastMsg}
      </div>
    </KModal>
  )
}

// ── Einladung ────────────────────────────────────────────────────────
// [cmd] module-coach.jsx:753-787.
function InviteCoachModal({ onClose }: { onClose: () => void }) {
  return (
    <KModal
      title="Invite a coach"
      subtitle="Send a link or generate a QR code"
      eyebrow="plus"
      onClose={onClose}
      footer={(
        <>
          <button className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="v2-btn v2-btn-primary">Send invite</button>
        </>
      )}
    >
      <div style={{ marginBottom: 14 }}>
        <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Coach type</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {['Training', 'Nutrition', 'Supplement', 'Medical'].map(t => (
            <button key={t} className="v2-btn" style={{ height: 36 }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Email</div>
        <input aria-label="Email" placeholder="coach@example.com" style={FELD} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Personal note (optional)</div>
        <input
          aria-label="Personal note"
          placeholder="Hey — added you to my LumeOS as Training coach. Let's sync."
          style={FELD}
        />
      </div>

      <div
        style={{
          padding: 12, background: 'var(--surface)', borderRadius: 6,
          fontSize: 11.5, color: 'var(--fg-muted)', lineHeight: 1.5, marginBottom: 10,
        }}
      >
        Default access on accept: <span style={{ color: 'var(--fg)' }}>only the module matching their type</span>.
        You can grant more later in the Permissions tab. Invite link expires in 7 days.
      </div>

      <div
        style={{
          padding: 16, background: 'var(--surface)', borderRadius: 6,
          display: 'flex', alignItems: 'center', gap: 16,
        }}
      >
        <div
          style={{
            width: 80, height: 80, background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 6, display: 'grid', placeItems: 'center', flexShrink: 0,
          }}
        >
          {/* [cmd] Vorlage: `Math.random() > 0.5` ueber 64 Zellen —
              ersetzt durch `QR_MUSTER`. Siehe Kopfkommentar. */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 1.5, width: 60, height: 60 }}>
            {QR_MUSTER.map((bit, i) => (
              <div key={i} style={{ background: bit === 1 ? 'var(--fg)' : 'transparent' }} />
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>QR code</div>
          <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.45 }}>
            Coach scans this in their LumeOS app to accept instantly. No email needed.
          </div>
        </div>
      </div>
    </KModal>
  )
}

// ── QR scannen ───────────────────────────────────────────────────────
// [cmd] module-coach.jsx:789-800.
function ScanQRModal({ onClose }: { onClose: () => void }) {
  return (
    <KModal
      title="Scan coach QR code"
      subtitle="Or paste an invite link"
      eyebrow="camera"
      onClose={onClose}
      footer={(
        <>
          <button className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="v2-btn v2-btn-primary">Accept invite</button>
        </>
      )}
    >
      <div
        style={{
          aspectRatio: '4/3', background: 'var(--surface-2)', borderRadius: 6,
          position: 'relative', display: 'grid', placeItems: 'center',
          marginBottom: 14, border: '1px dashed var(--border)',
        }}
      >
        <div style={{ position: 'absolute', inset: '20%', border: '2px solid var(--acc-coach)', borderRadius: 8 }} />
        <Icon name="camera" className="v2-ic" style={{ width: 32, height: 32, color: 'var(--fg-dim)' }} />
      </div>

      <div className="v2-dim" style={{ fontSize: 11, textAlign: 'center', marginBottom: 14 }}>
        Point camera at QR code or…
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Paste invite link</div>
      <input
        aria-label="Paste invite link"
        placeholder="https://lumeos.app/invite/…"
        style={{ ...FELD, fontFamily: 'var(--font-mono)' }}
      />
    </KModal>
  )
}

// ── Gespraech ────────────────────────────────────────────────────────
// [cmd] module-coach.jsx:802-822.
function MessageThreadModal({ c, onClose }: { c: Coach; onClose: () => void }) {
  const [msg, setMsg] = React.useState('')

  return (
    <KModal
      title={c.name}
      subtitle={`${c.type} coach · ${c.cadence}`}
      eyebrow="message"
      accent={c.color}
      onClose={onClose}
      width={680}
      footer={(
        <>
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            aria-label="Reply"
            placeholder="Reply…"
            style={{ ...FELD, width: undefined, flex: 1 }}
          />
          {/* [cmd] Vorlage: `<Icon name="arr_r">` — Tippfehler fuer
              `arrow_right`, siehe Kopfkommentar. */}
          <button className="v2-btn v2-btn-primary">
            <Icon name="arrow_right" className="v2-ic v2-ic-sm" />
            Send
          </button>
        </>
      )}
    >
      <div className="v2-col-gap" style={{ gap: 8 }}>
        {MESSAGES_THREAD.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.direction === 'out' ? 'flex-end' : 'flex-start' }}>
            <div
              style={{
                maxWidth: '75%', padding: '8px 12px',
                background: m.direction === 'out'
                  ? 'color-mix(in oklch, var(--acc-coach) 18%, var(--surface))'
                  : 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 8,
              }}
            >
              <div className="v2-dim v2-mono" style={{ fontSize: 9.5, marginBottom: 2 }}>
                {`${m.from} · ${m.at}`}
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.5 }}>{m.body}</div>
            </div>
          </div>
        ))}
      </div>
    </KModal>
  )
}

// ── Notizdetail ──────────────────────────────────────────────────────
// [cmd] module-coach.jsx:855-866.
function NoteDetailModal({ n, onClose }: { n: CoachNote; onClose: () => void }) {
  const coach = COACHES.find(c => c.id === n.coachId)

  return (
    <KModal
      title={`Note from ${n.coach}`}
      subtitle={`${n.module} · ${n.date}`}
      eyebrow="message"
      accent={coach?.color}
      onClose={onClose}
      footer={(
        <>
          <button className="v2-btn v2-btn-ghost" onClick={onClose}>Close</button>
          <button className="v2-btn">
            <Icon name="message" className="v2-ic v2-ic-sm" />
            Reply
          </button>
        </>
      )}
    >
      <div
        style={{
          padding: 14, background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 6, fontSize: 13, lineHeight: 1.6, color: 'var(--fg)', marginBottom: 14,
        }}
      >
        {n.body}
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {n.tags.map(t => <Pill key={t}>{t}</Pill>)}
      </div>
    </KModal>
  )
}
