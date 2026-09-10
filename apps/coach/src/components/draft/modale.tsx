// Die Modale der Vorlage — G-409/A5.
//
// **Tom, 2026-09-08:** *„Du hast in G-407 gemeldet: fuenfzehn Modale
// sind Knoepfe ohne Ziel. Jetzt bauen — die Vorlage zeigt sie."*
//
// ══ ES SIND DREIZEHN, NICHT FUENFZEHN ══════════════════════════════
//
// `[cmd]` **Nachgezaehlt am 2026-09-10** ueber alle 18 Vorlagendateien:
//
//     module-coach.jsx        CoachDetail, InviteCoach, ScanQR,
//                             MessageThread, AthleteDetail,
//                             NoteDetail, NewPlan          (7)
//     module-coach-gaps.jsx   AlertDetail, CoachSettings,
//                             RuleEdit, InviteTeamMember,
//                             TeamMemberDetail             (5)
//     module-coach-athlete    Proposal                     (1)
//                                                        ----
//                                                         13
//
// `[cmd]` **`KModal` und `CMod` sind die HUELLE, kein Modal** — sie
// tragen Titel, Untertitel, Symbol und Fusszeile fuer die anderen.
// `[read]` **Die fuenfzehn aus meinem G-407-Bericht zaehlten sie
// mit.** **Die Zahl im Auftrag stammt aus meiner eigenen falschen
// Meldung** — hier steht die nachgezaehlte.
//
// ══ WAS SIE KOENNEN UND WAS NICHT ══════════════════════════════════
//
// `[read]` **Sie oeffnen, zeigen die Felder der Vorlage und
// schliessen.** `[cmd]` **Kein Knopf darin schreibt** — es gibt
// keinen Schreibweg, und ein Knopf, der so tut, waere schlimmer als
// einer, der sichtbar nicht kann (C-426).
'use client'

import * as React from 'react'
import { Card, Pill, Icon, Meter, type IconName } from '@lumeos/ui'

import {
  SMART_ALERTS, TEAM_MEMBERS, COACH_ROLES, ACTIVE_RULES,
  RULE_TRIGGERS, COACHES, COACH_NOTES, PORTAL_ATHLETES, COACH_PLANS,
  MESSAGES_THREAD, PENDING_INVITES,
} from './daten-auswertung'
import { Kasten, KastenKopf, Attrappe, Raster, Stapel, Auge, Haken } from './bausteine'

/**
 * Die Huelle — `module-coach.jsx:696` (`KModal`) und
 * `module-coach-gaps.jsx:5` (`CMod`), zwei Namen fuer dieselbe Form.
 */
export function Huelle({
  titel, untertitel, symbol, akzent, breite = 600, fuss, onClose, children,
}: {
  titel: React.ReactNode
  untertitel?: React.ReactNode
  symbol?: IconName
  akzent?: string
  breite?: number
  fuss?: React.ReactNode
  onClose: () => void
  children: React.ReactNode
}) {
  // `[read]` **Escape schliesst** — ein Modal ohne Tastaturausweg
  // faengt den Benutzer.
  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  return (
    <div className="dk-schleier" onClick={onClose} role="presentation">
      <div
        className="dk-modal"
        style={{ width: breite, maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={typeof titel === 'string' ? titel : undefined}
      >
        <div className="dk-modal-kopf">
          {symbol && (
            <div
              className="dk-modal-symbol"
              style={{ ['--ton' as string]: akzent ?? 'var(--acc-coach)' }}
            >
              <Icon name={symbol} className="v2-ic" />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="dk-modal-titel">{titel}</div>
            {untertitel && <div className="v2-dim" style={{ fontSize: 11 }}>{untertitel}</div>}
          </div>
          <button type="button" className="dp-icon-knopf" onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic" />
          </button>
        </div>
        <div className="dk-modal-rumpf">{children}</div>
        {fuss && <div className="dk-modal-fuss">{fuss}</div>}
      </div>
    </div>
  )
}

/** Ein Knopf, der nichts schreibt — und das sagt. */
function Knopf({ text, art, symbol }: {
  text: string
  art?: 'primaer' | 'still' | 'neg'
  symbol?: IconName
}) {
  return (
    <button
      type="button"
      className={`v2-btn${art === 'primaer' ? ' v2-btn-primary' : ''}`}
      style={art === 'neg' ? { color: 'var(--neg)' } : undefined}
      disabled
      title="Attrappe — es gibt keinen Schreibweg fuer diese Aktion"
    >
      {symbol && <Icon name={symbol} className="v2-ic v2-ic-sm" />}
      {text}
    </button>
  )
}

function Schliessen({ onClose }: { onClose: () => void }) {
  return <button type="button" className="v2-btn" onClick={onClose}>Close</button>
}

const FEHLT = 'kein Schreibweg — das Modal zeigt die Felder der Vorlage, '
  + 'es gibt keine Tabelle und keine Aktion dahinter'

const V = (quelle: string) => <Attrappe fehlt={FEHLT} quelle={quelle} />

/** Eine Kennzahlkachel im Modal — die Bauform der Vorlage. */
function Zelle({ label, wert }: { label: string, wert: React.ReactNode }) {
  return (
    <div className="dk-kennzahl" style={{ padding: 10 }}>
      <div className="v2-eyebrow">{label}</div>
      <div className="dk-kennzahl-wert v2-num" style={{ fontSize: 16 }}>{wert}</div>
    </div>
  )
}

// ── 1. AlertDetailModal — `gaps.jsx:149` ────────────────────────

export function ModalAlarm({ id, onClose }: { id: string, onClose: () => void }) {
  const al = SMART_ALERTS.find(a => a.id === id) ?? SMART_ALERTS[0]
  return (
    <Huelle
      titel={al.title}
      untertitel={`${al.athlete} · ${al.type} · ${al.id}`}
      symbol="alert"
      breite={720}
      onClose={onClose}
      fuss={<>
        <Schliessen onClose={onClose} />
        <Knopf text="Mark as false positive" art="neg" />
        <Knopf text="Dismiss" />
        <Knopf text="Open client" art="primaer" symbol="message" />
      </>}
    >
      <Raster spalten="repeat(4, 1fr)" gap={8}>
        <Zelle label="Severity" wert={
          <Pill variant={al.severity === 'CRITICAL' ? 'neg' : 'warn'}>{al.severity}</Pill>
        } />
        <Zelle label="Confidence" wert={`${Math.round(al.confidence * 100)} %`} />
        <Zelle label="FP risk" wert={`${Math.round(al.fpRisk * 100)} %`} />
        <Zelle label="Similar cases" wert={al.similarCases ?? '—'} />
      </Raster>

      <Auge>Why this fired</Auge>
      <Kasten>{al.why}</Kasten>

      <Auge>Predicted outcome if not addressed</Auge>
      <Kasten ton="var(--warn)">{al.predicted}</Kasten>

      <Auge>Similar cases · what worked</Auge>
      <Stapel gap={4}>
        <Kasten>Apr 18 · Lukas Bauer · derselbe Alarm · mit Deload-Woche und
          Schlafberatung geloest · Ausgang positiv</Kasten>
        <Kasten>Mar 2 · Niko Brandt · derselbe Alarm · ignoriert · zwei Wochen
          spaeter Verletzung</Kasten>
      </Stapel>
      {V('SMART_ALERTS')}
    </Huelle>
  )
}

// ── 2. CoachSettingsModal — `gaps.jsx:171` ──────────────────────

export function ModalEinstellungen({ onClose }: { onClose: () => void }) {
  return (
    <Huelle
      titel="Coach settings"
      untertitel="Alerts · batching · quiet hours · escalation"
      symbol="settings"
      breite={620}
      onClose={onClose}
      fuss={<><Schliessen onClose={onClose} /><Knopf text="Save" art="primaer" /></>}
    >
      <Auge>Quiet hours</Auge>
      <Stapel gap={5}>
        <div className="v2-row"><span className="v2-row-l">Von</span><span className="v2-row-r v2-num">22:00</span></div>
        <div className="v2-row"><span className="v2-row-l">Bis</span><span className="v2-row-r v2-num">07:00</span></div>
        <div className="v2-row"><span className="v2-row-l">Ausnahme</span><span className="v2-row-r">CRITICAL immer</span></div>
      </Stapel>
      <Auge>Batching</Auge>
      <Stapel gap={5}>
        <div className="v2-row"><span className="v2-row-l">Sammeln</span><span className="v2-row-r">alle 4 h</span></div>
        <div className="v2-row"><span className="v2-row-l">Ausser</span><span className="v2-row-r">HIGH und darueber</span></div>
      </Stapel>
      <Auge>Eskalation</Auge>
      <Stapel gap={4}>
        <Haken>CRITICAL sofort, auch nachts</Haken>
        <Haken>HIGH innerhalb einer Stunde</Haken>
        <Haken ton="warn">MEDIUM im naechsten Sammelbericht</Haken>
      </Stapel>
      {V('gaps.jsx:171')}
    </Huelle>
  )
}

// ── 3. RuleEditModal — `gaps.jsx:207` ───────────────────────────

export function ModalRegel({ id, onClose }: { id: string, onClose: () => void }) {
  const r = ACTIVE_RULES.find(x => x.id === id) ?? ACTIVE_RULES[0]
  return (
    <Huelle
      titel={r.name}
      untertitel={`${r.severity} · ${r.assignedTo} Athleten · ${r.fired}x ausgeloest`}
      symbol="settings"
      breite={680}
      onClose={onClose}
      fuss={<>
        <Schliessen onClose={onClose} />
        <Knopf text="Regel aussetzen" />
        <Knopf text="Speichern" art="primaer" />
      </>}
    >
      <Raster spalten="repeat(3, 1fr)" gap={8}>
        <Zelle label="Ausgeloest" wert={r.fired} />
        <Zelle label="Fehlalarme" wert={r.falsePositives} />
        <Zelle label="Athleten" wert={r.assignedTo} />
      </Raster>
      <Auge>Ausloeser</Auge>
      <Stapel gap={8}>
        {RULE_TRIGGERS.map(t => (
          <Kasten key={t.id}>
            <KastenKopf name={t.label} />
            <div className="dk-streifen-text">{t.desc}</div>
          </Kasten>
        ))}
      </Stapel>
      <Auge>Zuletzt</Auge>
      <Kasten>{r.lastFired}</Kasten>
      {V('ACTIVE_RULES, RULE_TRIGGERS')}
    </Huelle>
  )
}

// ── 4. InviteTeamMemberModal — `gaps.jsx:356` ───────────────────

export function ModalTeamEinladen({ onClose }: { onClose: () => void }) {
  return (
    <Huelle
      titel="Invite team member"
      untertitel="Rolle und Reichweite festlegen"
      symbol="plus"
      breite={560}
      onClose={onClose}
      fuss={<><Schliessen onClose={onClose} /><Knopf text="Einladung senden" art="primaer" /></>}
    >
      <Auge>Rollen</Auge>
      <Stapel gap={8}>
        {COACH_ROLES.map(r => (
          <Kasten key={r.id}>
            <KastenKopf name={r.label} />
            <Stapel gap={4}>
              {Object.entries(r.caps).map(([c, an]) => (
                <Haken key={c} ton={an ? 'pos' : 'neg'}>{c}</Haken>
              ))}
            </Stapel>
          </Kasten>
        ))}
      </Stapel>
      {V('COACH_ROLES')}
    </Huelle>
  )
}

// ── 5. TeamMemberDetailModal — `gaps.jsx:374` ───────────────────

export function ModalTeamMitglied({ id, onClose }: { id: string, onClose: () => void }) {
  const m = TEAM_MEMBERS.find(x => x.id === id) ?? TEAM_MEMBERS[0]
  const rolle = COACH_ROLES.find(r => r.id === m.role)
  return (
    <Huelle
      titel={m.name}
      untertitel={`${rolle?.label ?? m.role} · ${m.athletes} Athleten · dabei seit ${m.since}`}
      symbol="user"
      breite={640}
      onClose={onClose}
      fuss={<>
        <Schliessen onClose={onClose} />
        <Knopf text="Rolle aendern" />
        <Knopf text="Entfernen" art="neg" />
      </>}
    >
      <Raster spalten="repeat(3, 1fr)" gap={8}>
        <Zelle label="Athleten" wert={m.athletes} />
        <Zelle label="Bewertung" wert={m.rating} />
        <Zelle label="Dabei seit" wert={m.since} />
      </Raster>
      <Auge>Was die Rolle darf</Auge>
      <Stapel gap={4}>
        {rolle && Object.entries(rolle.caps).map(([c, an]) => (
          <Haken key={c} ton={an ? 'pos' : 'neg'}>{c}</Haken>
        ))}
      </Stapel>
      {V('TEAM_MEMBERS, COACH_ROLES')}
    </Huelle>
  )
}

// ── 6. CoachDetailModal — `module-coach.jsx:717` ────────────────

export function ModalCoach({ id, onClose }: { id: string, onClose: () => void }) {
  const c = COACHES.find(x => x.id === id) ?? COACHES[0]
  return (
    <Huelle
      titel={c.name}
      untertitel={`${c.type} coach · ${c.org}`}
      symbol="user"
      akzent={c.color}
      breite={680}
      onClose={onClose}
      fuss={<>
        <Schliessen onClose={onClose} />
        <Knopf text="Rechte aendern" />
        <Knopf text="Nachricht" art="primaer" symbol="message" />
      </>}
    >
      <Raster spalten="repeat(3, 1fr)" gap={8}>
        <Zelle label="Art" wert={c.type} />
        <Zelle label="Seit" wert={c.since} />
        <Zelle label="Stand" wert={<Pill variant="pos">{c.status}</Pill>} />
      </Raster>
      <Auge>Einrichtung</Auge>
      <Kasten>{c.org}</Kasten>
      {V('COACHES')}
    </Huelle>
  )
}

// ── 7. InviteCoachModal — `module-coach.jsx:753` ────────────────

export function ModalCoachEinladen({ onClose }: { onClose: () => void }) {
  return (
    <Huelle
      titel="Invite coach"
      untertitel="Per Kennung oder QR-Code"
      symbol="plus"
      breite={560}
      onClose={onClose}
      fuss={<><Schliessen onClose={onClose} /><Knopf text="Einladung senden" art="primaer" /></>}
    >
      <Auge>Offene Einladungen</Auge>
      <Stapel gap={8}>
        {PENDING_INVITES.map(i => (
          <Kasten key={i.id}>
            <KastenKopf
              name={i.name}
              marken={<Pill>{i.type}</Pill>}
              rechts={`${i.invitedOn} · ${i.expiry}`}
            />
          </Kasten>
        ))}
      </Stapel>
      {V('PENDING_INVITES')}
    </Huelle>
  )
}

// ── 8. ScanQRModal — `module-coach.jsx:789` ─────────────────────

export function ModalQR({ onClose }: { onClose: () => void }) {
  return (
    <Huelle
      titel="Scan QR"
      untertitel="Der Klient zeigt seinen Code"
      symbol="user"
      breite={460}
      onClose={onClose}
      fuss={<Schliessen onClose={onClose} />}
    >
      <div className="dk-qr" aria-hidden="true" />
      <div className="dk-streifen-text" style={{ textAlign: 'center', marginTop: 12 }}>
        Die Vorlage zeigt hier das Kamerabild. Es gibt keinen Leseweg fuer
        einen Code und keine Tabelle, in die eine so entstandene Beziehung
        geschrieben wuerde.
      </div>
      {V('module-coach.jsx:789')}
    </Huelle>
  )
}

// ── 9. MessageThreadModal — `module-coach.jsx:802` ──────────────

export function ModalNachrichten({ onClose }: { onClose: () => void }) {
  return (
    <Huelle
      titel="Nachrichten"
      untertitel={`${MESSAGES_THREAD.length} im Verlauf`}
      symbol="message"
      breite={620}
      onClose={onClose}
      fuss={<><Schliessen onClose={onClose} /><Knopf text="Senden" art="primaer" /></>}
    >
      <Stapel gap={8}>
        {MESSAGES_THREAD.map(m => (
          <Kasten key={m.id} ton={m.direction === 'in' ? 'var(--acc-coach)' : undefined}>
            <KastenKopf name={m.from} rechts={m.at} />
            <div className="dk-streifen-text">{m.body}</div>
          </Kasten>
        ))}
      </Stapel>
      {V('MESSAGES_THREAD')}
    </Huelle>
  )
}

// ── 10. AthleteDetailModal — `module-coach.jsx:824` ─────────────

export function ModalAthlet({ id, onClose }: { id: string, onClose: () => void }) {
  const a = PORTAL_ATHLETES.find(x => x.id === id) ?? PORTAL_ATHLETES[0]
  return (
    <Huelle
      titel={a.name}
      untertitel={`${a.plan} · dabei seit ${a.since}`}
      symbol="user"
      breite={680}
      onClose={onClose}
      fuss={<>
        <Schliessen onClose={onClose} />
        <Knopf text="Akte oeffnen" art="primaer" />
      </>}
    >
      <Raster spalten="repeat(4, 1fr)" gap={8}>
        <Zelle label="Erfuellung" wert={`${a.compliance} %`} />
        <Zelle label="Alarme" wert={a.alerts} />
        <Zelle label="Letzte Einheit" wert={a.lastSession} />
        <Zelle label="Dabei seit" wert={a.since} />
      </Raster>
      <Auge>Erfuellung</Auge>
      <Meter value={a.compliance} color={a.compliance >= 90 ? 'var(--pos)' : 'var(--warn)'} tall />
      <Auge>Merkmale</Auge>
      <div className="dk-akte-coaches">
        {a.tags.map(t => <Pill key={t}>{t}</Pill>)}
      </div>
      {V('PORTAL_ATHLETES')}
    </Huelle>
  )
}

// ── 11. NoteDetailModal — `module-coach.jsx:855` ────────────────

export function ModalNotiz({ id, onClose }: { id: string, onClose: () => void }) {
  const n = COACH_NOTES.find(x => x.id === id) ?? COACH_NOTES[0]
  return (
    <Huelle
      titel={`Notiz · ${n.module}`}
      untertitel={`${n.coach} · ${n.date}`}
      symbol="edit"
      breite={600}
      onClose={onClose}
      fuss={<><Schliessen onClose={onClose} /><Knopf text="Antworten" art="primaer" /></>}
    >
      <Kasten>{n.body}</Kasten>
      {V('COACH_NOTES')}
    </Huelle>
  )
}

// ── 12. NewPlanModal — `module-coach.jsx:868` ───────────────────

export function ModalNeuerPlan({ onClose }: { onClose: () => void }) {
  return (
    <Huelle
      titel="New plan"
      untertitel="Aus einer Vorlage oder leer beginnen"
      symbol="plus"
      breite={640}
      onClose={onClose}
      fuss={<><Schliessen onClose={onClose} /><Knopf text="Plan anlegen" art="primaer" /></>}
    >
      <Auge>Vorlagen</Auge>
      <Stapel gap={8}>
        {COACH_PLANS.map(p => (
          <Kasten key={p.id}>
            <KastenKopf
              name={p.name}
              marken={<Pill>{p.category}</Pill>}
              rechts={`★ ${p.rating} · ${p.assignedTo} zugewiesen`}
            />
          </Kasten>
        ))}
      </Stapel>
      {V('COACH_PLANS')}
    </Huelle>
  )
}

// ── 13. ProposalModal — `athlete.jsx:340` ───────────────────────

export function ModalVorschlag({ onClose }: { onClose: () => void }) {
  return (
    <Huelle
      titel="Vorschlag"
      untertitel="Der Klient bestaetigt — der Coach schreibt nie direkt (F-06 4.3)"
      symbol="check"
      breite={560}
      onClose={onClose}
      fuss={<><Schliessen onClose={onClose} /><Knopf text="Vorschlag senden" art="primaer" /></>}
    >
      <Stapel gap={5}>
        <div className="v2-row"><span className="v2-row-l">Modul</span><span className="v2-row-r">nutrition</span></div>
        <div className="v2-row"><span className="v2-row-l">Titel</span><span className="v2-row-r">Protein leicht anheben</span></div>
        <div className="v2-row"><span className="v2-row-l">Verfaellt</span><span className="v2-row-r">nach 10 Minuten</span></div>
      </Stapel>
      <div className="dk-streifen-text" style={{ marginTop: 10 }}>
        Dieses Modal ist die Attrappe. Der ECHTE Schreibweg steht in der
        Akte unter „Vorschlag senden" — er legt eine `pending_action` an.
      </div>
      {V('athlete.jsx:340')}
    </Huelle>
  )
}

/** Die dreizehn, nach Kennung. */
export const MODALE = {
  alarm: ModalAlarm,
  einstellungen: ModalEinstellungen,
  regel: ModalRegel,
  teamEinladen: ModalTeamEinladen,
  teamMitglied: ModalTeamMitglied,
  coach: ModalCoach,
  coachEinladen: ModalCoachEinladen,
  qr: ModalQR,
  nachrichten: ModalNachrichten,
  athlet: ModalAthlet,
  notiz: ModalNotiz,
  neuerPlan: ModalNeuerPlan,
  vorschlag: ModalVorschlag,
} as const

export type ModalName = keyof typeof MODALE
