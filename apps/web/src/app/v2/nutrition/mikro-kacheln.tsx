'use client'

// Die zwei Mikronaehrstoff-Kacheln des Diary, angebunden (G-101).
//
// VORLAGE: `diary-entwurf.tsx` — `MicronutrientSnapshot` (Radar, acht
// Achsen) und `BelowThreshold` (Liste mit Balken). **Aufbau und
// Reihenfolge uebernommen**, die Zahlen kommen jetzt aus
// `nutrition.micronutrient_snapshot` und
// `micronutrient_below_threshold` (beide in der Datenbank).
//
// **DREI STELLEN, AN DENEN DIE ECHTE FASSUNG VOM ENTWURF ABWEICHT:**
//
// 1. `[cmd]` **Der Entwurf zeigt „3 of 117"** — eine feste Zahl. Echt
//    sind es **3 von 21 geprueften**; 117 waere die Zahl aller
//    Naehrstoffe, aber nur 21 haben fuer diesen Tag einen Wert UND eine
//    Referenz. Die Kachel sagt beides.
//
// 2. `[cmd]` **Der Entwurf faerbt alles unter der Schwelle `warn`.**
//    `[read]` Eine Warnfarbe ist ein Urteil. Hier steht die Zahl in der
//    Modulfarbe, und der Satz darunter sagt, was die Schwelle IST —
//    eine Anzeigegrenze, keine medizinische.
//
// 3. `[cmd]` **Wo die Tagessumme unvollstaendig ist, fehlt der
//    Prozentwert.** Die Funktion meldet `reference_status`; bei
//    `incomplete` steht ein Strich statt einer Zahl. **Vitamin C ist
//    heute genau so ein Fall.**
import * as React from 'react'
import { Card, Meter, Icon, Pill } from '@lumeos/ui'

import type { MikroStand, MikroZeile } from '../../../lib/nutrition/mikro-read'

/** Zahl mit Einheit, oder ein Strich. */
function wert(v: number | null, einheit: string | null, nach = 1): string {
  if (v === null) return '—'
  return `${v.toLocaleString('de-DE', { maximumFractionDigits: nach })}${einheit ? ` ${einheit}` : ''}`
}

/**
 * Die Beschriftung der Referenzart.
 *
 * `[read]` `PRI`, `AI`, `UL` sind Fachbegriffe der EFSA — sie bleiben
 * stehen, aber mit einem Wort dahinter, das sie einordnet. Wer „AI"
 * liest, soll nicht raten muessen.
 */
const ART_TEXT: Record<string, string> = {
  PRI: 'Zufuhrempfehlung',
  AI: 'Schaetzwert',
  UL: 'Obergrenze',
  GOAL: 'Zielwert',
  FORMULA: 'aus Formel',
  NO_REFERENCE: 'keine Referenz',
}

export function MikroSchnappschuss({ d }: { d: MikroStand }) {
  if (d.fehler) {
    return (
      <Card title="Micronutrient snapshot" sub="vs target · today">
        <p className="v2-muted" style={{ fontSize: 12 }}>
          Nicht gelesen: {d.fehler}
        </p>
      </Card>
    )
  }
  if (d.zeilen.length === 0) {
    return (
      <Card title="Micronutrient snapshot" sub="vs target · today">
        <p className="v2-muted" style={{ fontSize: 12 }}>
          Fuer diesen Tag liegen keine Werte vor.
        </p>
      </Card>
    )
  }

  return (
    <Card
      title="Micronutrient snapshot"
      sub={`${d.zeilen.length} Naehrstoffe · heute`}
      actions={
        <a href="/v2/nutrition?tab=nutrients" className="v2-btn v2-btn-ghost"
           style={{ height: 22, fontSize: 11, padding: '0 8px' }}>Deep dive →</a>
      }
    >
      <div className="v2-col-gap" style={{ gap: 8 }}>
        {d.zeilen.map(z => <MikroZeileAnzeige key={z.code} z={z} />)}
      </div>
      <p className="v2-muted" style={{ fontSize: 10.5, marginTop: 10, lineHeight: 1.5 }}>
        Der Balken zeigt den Anteil an der jeweiligen Referenz.{' '}
        <strong>Ueber 100 % ist kein Fehler</strong> — bei einer
        Zufuhrempfehlung ist mehr die Regel, bei einer Obergrenze waere
        es etwas anderes; die Art steht an jeder Zeile.
      </p>
    </Card>
  )
}

function MikroZeileAnzeige({ z }: { z: MikroZeile }) {
  const unvollstaendig = z.vollstaendigkeit === 'incomplete'
  // Der Balken laeuft bis 100 %; darueber bleibt er voll und die Zahl
  // sagt den Rest.
  const balken = z.prozent === null ? null : Math.max(0, Math.min(z.prozent, 100))
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3,
      }}>
        <span style={{ fontSize: 12 }} title={z.name_lang ?? undefined}>{z.label}</span>
        {z.referenz_art && (
          <span className="v2-dim" style={{ fontSize: 9.5 }}>
            {ART_TEXT[z.referenz_art] ?? z.referenz_art}
          </span>
        )}
        <span className="v2-num" style={{ marginLeft: 'auto', fontSize: 11 }}>
          {wert(z.wert, z.einheit)}
          <span className="v2-dim"> / {wert(z.referenz, z.einheit, 0)}</span>
        </span>
        <span className="v2-num" style={{ width: 46, textAlign: 'right', fontSize: 11 }}>
          {z.prozent === null ? '—' : `${Math.round(z.prozent)} %`}
        </span>
      </div>
      {balken !== null
        ? <Meter value={balken} color="var(--acc-nutri)" />
        : (
          // `[read]` KEIN BALKEN OHNE PROZENTWERT. Wo die Tagessumme
          // unvollstaendig ist, waere jede Fuellung geraten.
          <p className="v2-muted" style={{ fontSize: 10, margin: 0 }}>
            Tagessumme unvollstaendig — kein Anteil ausweisbar.
          </p>
        )}
      {unvollstaendig && balken !== null && (
        <p className="v2-muted" style={{ fontSize: 10, margin: '2px 0 0' }}>
          Untergrenze: nicht jede Position traegt diesen Wert.
        </p>
      )}
    </div>
  )
}

export function UnterSchwelle({ d }: { d: MikroStand }) {
  if (d.fehler) return null

  return (
    <Card
      title="Below threshold"
      sub={`${d.unterSchwelle.length} von ${d.geprueft} geprueften`}
      actions={<Pill>{'<'} {d.schwelle} %</Pill>}
    >
      {d.unterSchwelle.length === 0 ? (
        <p className="v2-muted" style={{ fontSize: 12 }}>
          Kein Naehrstoff unter {d.schwelle} % seiner Referenz.
        </p>
      ) : (
        d.unterSchwelle.map((n, i) => (
          <div key={n.code} style={{
            padding: '8px 0',
            borderBottom: i < d.unterSchwelle.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 12 }}>{n.name}</span>
              {n.referenz_art && (
                <span className="v2-dim" style={{ fontSize: 9.5 }}>
                  {ART_TEXT[n.referenz_art] ?? n.referenz_art}
                </span>
              )}
              <span className="v2-num" style={{ marginLeft: 'auto', fontSize: 11 }}>
                {wert(n.wert, n.einheit)}
                <span className="v2-dim"> / {wert(n.referenz, n.einheit, 0)}</span>
              </span>
            </div>
            {/*
              `[read]` **Modulfarbe, nicht Warnfarbe.** Der Entwurf
              faerbt diese Balken `warn`. „Unter der Schwelle" ist eine
              Lage; eine Warnfarbe machte daraus ein Urteil.
            */}
            <Meter value={n.prozent ?? 0} color="var(--acc-nutri)" />
          </div>
        ))
      )}
      <p className="v2-muted" style={{ fontSize: 10.5, marginTop: 10, lineHeight: 1.5 }}>
        <Icon name="alert" className="v2-ic v2-ic-sm" />{' '}
        Die Schwelle von {d.schwelle} % ist eine <strong>Anzeigegrenze</strong>,
        keine medizinische. Geprueft werden nur Naehrstoffe, die fuer
        diesen Tag einen Wert <em>und</em> eine Referenz haben — heute{' '}
        {d.geprueft}.
      </p>
    </Card>
  )
}
