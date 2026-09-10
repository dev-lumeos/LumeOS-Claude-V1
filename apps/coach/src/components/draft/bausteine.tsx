// Die Bausteine der Draft-Kacheln — G-407.
//
// ══ WAS HIER STEHT UND WAS NICHT ═══════════════════════════════════
//
// `[read]` **Nur was die Vorlage wiederholt und das Paket nicht
// hat.** `[cmd]` **Gemessen: `Card`, `Pill`, `KPI`, `Row`, `Meter`,
// `Ring`, `Sparkline`, `LineChart`, `RadarChart`, `Empty` liegen im
// Paket** — die werden gerufen, nicht nachgebaut.
//
// `[read]` **Was fehlt, sind die vier Formen, die in fast jeder
// Vorlagendatei vorkommen:** der Hinweisstreifen oben, die
// Aufzaehlung mit Haken, der Fortschrittsbalken mit Beschriftung
// und das Kaestchen mit Zitat.
//
// ══ DER VERMERK ════════════════════════════════════════════════════
//
// `[cmd]` **Tom, G-407:** *„Mit den Zahlen der Vorlage, wo keine
// Tabelle da ist — und dem Attrappenvermerk daneben, wie bisher."*
//
// `[read]` **`Attrappe` ist der Traeger dieses Vermerks.** **Er
// nennt die fehlende Tabelle, nicht „noch nicht angebunden".**
import * as React from 'react'
import { Icon, Pill, type IconName } from '@lumeos/ui'

/**
 * Der Streifen ueber einer Ansicht — `programs.jsx:71`,
 * `clone.jsx:45` und in elf weiteren Dateien dieselbe Form.
 */
export function Streifen({ icon, titel, text, aktion, ton = 'coach' }: {
  icon: IconName
  titel: string
  text: React.ReactNode
  aktion?: React.ReactNode
  ton?: 'coach' | 'warn' | 'buddy'
}) {
  const farbe = ton === 'warn' ? 'var(--warn)'
    : ton === 'buddy' ? 'var(--acc-buddy)' : 'var(--acc-coach)'
  return (
    <div className="dk-streifen" style={{ ['--ton' as string]: farbe }}>
      <Icon name={icon} className="v2-ic dk-streifen-icon" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="dk-streifen-titel">{titel}</div>
        <div className="dk-streifen-text">{text}</div>
      </div>
      {aktion}
    </div>
  )
}

/** Eine Zeile mit Haken — die Vorlage nennt sie „Extracted". */
export function Haken({ children, ton = 'pos' }: {
  children: React.ReactNode
  ton?: 'pos' | 'neg' | 'warn'
}) {
  const f = ton === 'neg' ? 'var(--neg)' : ton === 'warn' ? 'var(--warn)' : 'var(--pos)'
  return (
    <div className="dk-haken">
      <Icon
        name={ton === 'neg' ? 'x' : 'check'}
        className="v2-ic v2-ic-sm"
        style={{ color: f, flexShrink: 0, marginTop: 2 }}
      />
      <span>{children}</span>
    </div>
  )
}

/** Balken mit Beschriftung und Wert — `clone.jsx:CLONE_FIDELITY`. */
export function Balken({ label, wert, max = 100, note, farbe }: {
  label: React.ReactNode
  wert: number
  max?: number
  note?: React.ReactNode
  farbe?: string
}) {
  const p = max === 0 ? 0 : Math.max(0, Math.min(100, (wert / max) * 100))
  // Die Vorlage faerbt nach Hoehe: unter 60 schwach, unter 80 mittel.
  const f = farbe ?? (p < 60 ? 'var(--neg)' : p < 80 ? 'var(--warn)' : 'var(--pos)')
  return (
    <div className="dk-balken">
      <div className="dk-balken-kopf">
        <span className="dk-balken-label">{label}</span>
        <span className="dk-balken-wert v2-num">{wert}{max === 100 ? ' %' : ''}</span>
      </div>
      <div className="v2-meter"><i style={{ width: `${p}%`, background: f }} /></div>
      {note && <div className="dk-balken-note">{note}</div>}
    </div>
  )
}

/** Ein Kasten mit Zitat — die Vorlage benutzt ihn fuer rohe Rede. */
export function Zitat({ children }: { children: React.ReactNode }) {
  return <div className="dk-zitat">{children}</div>
}

/** Eine Kachel innerhalb einer Kachel — Liste mit Rahmen. */
export function Kasten({ children, ton }: {
  children: React.ReactNode
  ton?: string
}) {
  return (
    <div className="dk-kasten" style={ton ? { ['--ton' as string]: ton } : undefined}>
      {children}
    </div>
  )
}

/** Die Kopfzeile eines Kastens: Name, Marken, rechts die Zeit. */
export function KastenKopf({ name, marken, rechts }: {
  name: React.ReactNode
  marken?: React.ReactNode
  rechts?: React.ReactNode
}) {
  return (
    <div className="dk-kasten-kopf">
      <span className="dk-kasten-name">{name}</span>
      {marken}
      {rechts && <span className="dk-kasten-rechts v2-mono">{rechts}</span>}
    </div>
  )
}

/**
 * Der Attrappenvermerk einer Kachel.
 *
 * `[read]` **Er steht IN der Kachel, unter dem Inhalt** — nicht
 * statt des Inhalts. **Die Zahlen der Vorlage stehen darueber, und
 * darunter steht, warum sie nicht gemessen sind.**
 *
 * `[cmd]` **Er nennt die fehlende Tabelle** (E-72, G-398).
 */
export function Attrappe({ fehlt, quelle }: {
  /** Was fehlt — mit Tabellennamen. */
  fehlt: string
  /** Woher die Zahlen darueber stammen. */
  quelle: string
}) {
  return (
    <div className="dk-attrappe">
      <Pill variant="warn">Attrappe</Pill>
      <span>
        Zahlen aus <span className="v2-mono">{quelle}</span> — {fehlt}.
      </span>
    </div>
  )
}

/** Zwei oder drei Spalten, wie `className="grid"` der Vorlage. */
export function Raster({ spalten, children, gap = 14 }: {
  spalten: string
  children: React.ReactNode
  gap?: number
}) {
  return (
    <div className="dk-raster" style={{ gridTemplateColumns: spalten, gap }}>
      {children}
    </div>
  )
}

/** Untereinander mit Abstand — `className="col-gap"`. */
export function Stapel({ children, gap = 14 }: {
  children: React.ReactNode
  gap?: number
}) {
  return <div className="dk-stapel" style={{ gap }}>{children}</div>
}

/** Die kleine Ueberschrift ueber einer Liste. */
export function Auge({ children }: { children: React.ReactNode }) {
  return <div className="v2-eyebrow">{children}</div>
}
