// Die Mockup-Referenz unter der Linie — G-398, E-69.
//
// **Tom, 2026-09-08:** *„mit allen ansichten das komplette portal
// will ich morgen sehen — mit schon angebundenen sachen die schon
// vorhanden sind, und die mockups."*
//
// `[read]` **Oben das Gebaute, darunter die Vorlage** — je Reiter
// eine Linie, je Karte ihre Stufe und ihr Grund. `[cmd]` **Vorher:
// null Referenzen auf 3220** (gemessen 2026-09-09, alle 16 Reiter).
//
// `[read]` **Je Kachel eine eigene Referenz, kein Block** — sonst
// laesst es sich nicht zaehlen (E-69).
// G-402: die Trennlinie kommt aus dem Paket — sie stand zweimal
// im Haus (G-399).
import { Card, ReferenzTrenner } from '@lumeos/ui'
import { REFERENZ, type RefKarte } from './mockup-referenz'

/**
 * Die Stufe als Marke.
 *
 * `[read]` **Drei Farben, drei Bedeutungen** — wer die Kachel sieht,
 * soll den Vermerk nicht lesen muessen, um zu wissen, woran es liegt.
 */
function Stufe({ art }: { art: RefKarte['stufe'] }) {
  const farbe = art === 'angebunden' ? 'var(--pos)'
    : art === 'baubar' ? 'var(--warn)' : 'var(--fg-subtle)'
  return <span className="cp-stufe" style={{ color: farbe }}>{art}</span>
}

/**
 * Der Vermerk unter dem Titel: WORAUF gewartet wird.
 *
 * `[read]` **Ein Vermerk mit falschem Grund ist schlimmer als eine
 * fehlende Kachel** — er verhindert, dass jemand nachsieht. **Also
 * die gemessene Tabelle, nicht eine Vermutung.**
 */
function Vermerk({ k }: { k: RefKarte }) {
  const wartet = k.stufe === 'blockiert'
    ? k.fehlt
    : k.stufe === 'baubar'
      ? `einen Leseweg — ${(k.tabellen ?? []).join(', ')} gibt es, `
        + 'aber keine Datei im Portal liest sie'
      : `nichts — ${(k.tabellen ?? []).join(', ')} wird gelesen; `
        + 'die Kachel ist nur nicht gebaut'
  return (
    <div className="cp-vermerk">
      Attrappe — {k.quelle} · wartet auf: {wartet}
      {k.altrepo && <> · Altrepo: {k.altrepo}</>}
    </div>
  )
}

function Rumpf({ k }: { k: RefKarte }) {
  if (k.art === 'balken') {
    return (
      <div className="cp-stapel">
        {(k.balken ?? []).map(([name, wert]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 130, fontSize: 11.5 }}>{name}</span>
            <div className="cp-ref-balken">
              <div style={{ width: `${wert}%` }} />
            </div>
            <span className="cp-monospace" style={{ fontSize: 10.5, width: 34, textAlign: 'right' }}>
              {wert}
            </span>
          </div>
        ))}
      </div>
    )
  }
  if (k.art === 'zeilenPaar') {
    return (
      <div className="cp-stapel">
        {(k.zeilen ?? []).map(([links, rechts]) => (
          <div key={links} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ flex: 1, fontSize: 11.5 }}>{links}</span>
            <span className="cp-monospace" style={{ fontSize: 11.5 }}>{rechts}</span>
          </div>
        ))}
      </div>
    )
  }
  if (k.art === 'liste') {
    return (
      <div className="cp-stapel">
        {(k.zeilen ?? []).map(([marke, text]) => (
          <div key={marke + text} className="cp-ref-zeile">
            <span className="v2-pill" style={{ fontSize: 8.5 }}>{marke}</span>
            <span style={{ fontSize: 11.5 }}>{text}</span>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div style={{ fontSize: 11.5, lineHeight: 1.6, color: 'var(--fg-subtle)' }}>
      {k.text}
    </div>
  )
}

/**
 * Die Referenz eines Reiters.
 *
 * `[read]` **Gibt es keine Vorlagenkarte, wird nichts gerendert** —
 * eine leere Linie waere ein Rahmen ohne Inhalt, und E-72 verbietet
 * genau das.
 */
export function TabReferenz({ tab }: { tab: string }) {
  const r = REFERENZ[tab]
  if (!r || r.karten.length === 0) return null
  return (
    <div className="cp-referenz">
      <ReferenzTrenner reiter={tab} quelle={r.quelle} />
      <div className="cp-stapel">
        {r.karten.map(k => (
          <Card key={k.titel} title={k.titel} actions={<Stufe art={k.stufe} />}>
            <Vermerk k={k} />
            <Rumpf k={k} />
          </Card>
        ))}
      </div>
    </div>
  )
}
