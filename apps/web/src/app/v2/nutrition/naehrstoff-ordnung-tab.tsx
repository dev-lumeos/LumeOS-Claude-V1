'use client'

// Der Nutrients-Tab mit der echten Naehrstoffordnung (G-101, C-54).
//
// **WAS VORHER DASTAND:** `[cmd]` `nutrient-baum.ts` — **79 feste
// Eintraege in 8 Gruppen**, die Zahlen des Entwurfs fuer einen
// erfundenen Athleten (Energy 1847, Water 1.2 L). Die Gruppennamen
// (`Macronutrients`, `Bioactives`) kommen in der Datenbank nicht vor,
// und `parent` war eine eigene Erfindung des Entwurfs.
//
// **WAS DIE DATENBANK FUEHRT:** `[cmd]` **138 Naehrstoffe in 12
// Gruppen**, jeder mit `display_tier` (1–3) und `sort_index`. Kein
// Eintrag ohne Stufe.
//
// `[read]` **Toms Befund *„zeigt nur added sugar"*** war deshalb
// richtig und die Ursache eine andere als vermutet: Die Stufen wurden
// nicht falsch ausgewertet — **sie wurden nie gelesen.**
//
// **DIE GRENZE:** `[read]` Zahlen ja, Urteile nein. Kein „Status", kein
// „needs attention", keine Warnfarbe. Wo die Tagessumme einen Wert
// fuehrt, steht er; wo nicht, steht ein Strich — und die Kachel sagt,
// **wieviele der 138 ueberhaupt messbar sind.**
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import type {
  NaehrstoffOrdnung, NaehrstoffGruppe, NaehrstoffKnoten,
} from '../../../lib/nutrition/naehrstoff-ordnung'

function zahl(v: number | null, einheit: string | null): string {
  if (v === null) return '—'
  const n = v.toLocaleString('de-DE', { maximumFractionDigits: v < 1 ? 3 : 1 })
  return einheit ? `${n} ${einheit}` : n
}

export function NaehrstoffOrdnungTab({ d }: { d: NaehrstoffOrdnung }) {
  // G-117, Tom: „standard eingeklappt". Alle 12 Gruppen zu — die
  // Kopfzeile je Gruppe traegt Zahl und Trefferzahl, der Tab wirkt
  // damit nicht leer, sondern aufgeraeumt. (Vorher war die erste
  // Gruppe offen.)
  const [offen, setOffen] = React.useState<Set<string>>(() => new Set())

  if (d.fehler) {
    return (
      <Card title="Naehrstoffe">
        <p className="v2-muted" style={{ fontSize: 12 }}>Nicht gelesen: {d.fehler}</p>
      </Card>
    )
  }

  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      {/* G-117: HIER kommt spaeter der Zeitfilter hin (1/7/14/30/45/
          60/90 Tage) — er haengt an C-157 (lange Form der Tageswerte,
          Codex) und wird bewusst NICHT vorgebaut: ein Filter, der nur
          einen Zeitraum kann, waere eine Attrappe. Die Klappen darunter
          sind davon unabhaengig — der Filter aendert nur die Werte je
          Zeile, nicht die Gliederung. */}
      <Card title="Naehrstoffordnung" sub={`${d.gesamt} Naehrstoffe in ${d.gruppen.length} Gruppen`}>
        <p className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
          Die Gliederung kommt aus <span className="v2-mono">nutrient_defs</span>:
          jede Zeile traegt eine <strong>Stufe</strong> (1–3), und die
          Einrueckung folgt ihr. <span className="v2-mono">Zucker, gesamt</span>{' '}
          steht auf Stufe 1, die Einfach- und Zweifachzucker darunter.
        </p>
        <p className="v2-muted" style={{ fontSize: 11.5, marginTop: 8, lineHeight: 1.55 }}>
          {/*
            `[read]` DIE ZAHL GEHOERT DAZU. Ein Baum mit 138 Zeilen,
            von denen die meisten einen Strich zeigen, sieht nach einem
            Fehler aus — er ist aber der ehrliche Zustand: die
            Tagessumme fuehrt nicht jeden Naehrstoff als Spalte.
          */}
          <strong>{d.messbar} von {d.gesamt}</strong> tragen fuer diesen Tag
          einen Wert. Die uebrigen stehen mit einem Strich — sie sind
          gegliedert, aber <span className="v2-mono">daily_summary</span>{' '}
          fuehrt keine Spalte dafuer.
        </p>
      </Card>

      {d.gruppen.map(g => (
        <GruppenKarte
          key={g.name}
          g={g}
          offen={offen.has(g.name)}
          umschalten={() => setOffen(s => {
            const n = new Set(s)
            if (n.has(g.name)) n.delete(g.name)
            else n.add(g.name)
            return n
          })}
        />
      ))}
    </div>
  )
}

function GruppenKarte({ g, offen, umschalten }: {
  g: NaehrstoffGruppe; offen: boolean; umschalten: () => void
}) {
  return (
    <Card>
      <button
        type="button"
        onClick={umschalten}
        aria-expanded={offen}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          background: 'none', border: 0, padding: 0, cursor: 'pointer',
          font: 'inherit', color: 'inherit', textAlign: 'left',
        }}
      >
        <Icon name={offen ? 'chevron_down' : 'chevron_right'} className="v2-ic v2-ic-sm" />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{g.name}</span>
        <span className="v2-num v2-dim" style={{ fontSize: 11 }}>
          {g.anzahl} Eintr{g.anzahl === 1 ? 'ag' : 'aege'}
        </span>
        <span style={{ marginLeft: 'auto' }}>
          <Pill>{g.mitWert} mit Wert</Pill>
        </span>
      </button>

      {offen && (
        <div className="v2-tbl-wrap" style={{ marginTop: 10 }}>
          <table className="v2-tbl">
            <thead>
              <tr>
                <th>Naehrstoff</th>
                <th style={{ width: 60 }}>Stufe</th>
                <th style={{ width: 120 }}>Heute</th>
                <th style={{ width: 140 }}>Referenz</th>
              </tr>
            </thead>
            <tbody>
              {g.knoten.map(k => <Zeilen key={k.code} k={k} tiefe={0} />)}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

/** Ein Knoten und alles darunter — die Einrueckung zeigt die Stufe. */
function Zeilen({ k, tiefe }: { k: NaehrstoffKnoten; tiefe: number }): React.ReactElement {
  return (
    <>
      <tr>
        <td style={{ paddingLeft: 8 + tiefe * 18 }}>
          {tiefe > 0 && (
            <span className="v2-dim" style={{ marginRight: 4 }}>└</span>
          )}
          {k.name}
          <span className="v2-dim v2-mono" style={{ fontSize: 9.5, marginLeft: 6 }}>
            {k.code}
          </span>
        </td>
        <td className="v2-num v2-dim">{k.stufe}</td>
        <td className="v2-num">{zahl(k.wert, k.einheit)}</td>
        <td className="v2-num v2-dim">
          {k.referenz === null ? '—' : (
            <>
              {zahl(k.referenz, k.einheit)}
              {k.referenz_art && (
                <span style={{ fontSize: 9.5, marginLeft: 4 }}>{k.referenz_art}</span>
              )}
            </>
          )}
        </td>
      </tr>
      {k.kinder.map(x => <Zeilen key={x.code} k={x} tiefe={tiefe + 1} />)}
    </>
  )
}
