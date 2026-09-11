'use client'

// ════════════════════════════════════════════════════════════════════
// DIE VIER NEUEN INSIGHTS-KACHELN — G-291 / G-292 / G-293 / G-295
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **SPEC_10 nennt sechs Komponenten, gebaut waren zwei.**
// Diese Datei traegt vier davon:
//
//     TrendChart          G-291   Kalorien und Makros ueber die Zeit
//     NutrientHeatmap     G-295   ein Tag je Feld, Farbe = Deckung
//     MacroDetail         G-293   die Fetthierarchie, aufklappbar
//     MicroFlagsList      G-292   die Warnungen, nach Schwere
//
// **DeficitSuggestions ist gemeldet, nicht gebaut** — der Widerspruch
// steht in `insights-lage.ts` als `DEFIZIT_WIDERSPRUCH` und unten am
// Ort. **CrossModuleInsights wartet auf C-324.**
//
// `[read]` **Alles Rechnende liegt in `insights-lage.ts`** (A-30) —
// hier steht nur, wie es aussieht.
import * as React from 'react'
import { Card, Pill, Row, Meter } from '@lumeos/ui'

import type { InsightsStand } from '../../../lib/nutrition/insights-read'
import {
  FENSTER, imFenster, schnitt, pfadMitLuecken, flaecheMitLuecken,
  deckung, stufeVon, STUFE_FARBE, STUFE_TEXT,
  istVollstaendig, luekenSatz, restVon,
  anteil, belastbarkeit, sortiere, DUENN_SATZ,
  DEFIZIT_WIDERSPRUCH,
} from '../../../lib/nutrition/insights-lage'
import type {
  Fenster, TrendTag, MakroKnoten, Flag, Stufe,
} from '../../../lib/nutrition/insights-lage'

function z(v: number | null, nach = 0): string {
  return v === null ? '—' : v.toLocaleString('de-DE', {
    minimumFractionDigits: nach, maximumFractionDigits: nach,
  })
}

/** Ein Datum als `5.9.` — die Achse hat keinen Platz fuer mehr. */
function kurzDatum(iso: string): string {
  const [, m, t] = iso.split('-')
  return `${Number(t)}.${Number(m)}.`
}

// ════════════════════════════════════════════════════════════════════
// G-291 — TrendChart
// ════════════════════════════════════════════════════════════════════
//
// `[read]` **Nicht `LineChart` aus dem Baukasten.** Der nimmt
// `number[]` — ein Tag ohne Eintrag muesste dort 0 werden oder
// wegfallen. **Beides luegt:** 0 kcal behauptet Fasten, das Weglassen
// zieht die Kurve ueber die Luecke, als waere nichts gewesen.
//
// `[cmd]` **Hier bleibt die Luecke eine Luecke** — der Pfad bricht ab
// und setzt neu an, und die Zahl darunter nennt, wie viele Tage
// getragen haben.

type Feld = 'kcal' | 'protein' | 'carbs' | 'fett'

const FELDER: Array<{ feld: Feld; label: string; farbe: string; einheit: string }> = [
  { feld: 'kcal', label: 'Kalorien', farbe: 'var(--acc-nutri)', einheit: 'kcal' },
  { feld: 'protein', label: 'Protein', farbe: 'var(--acc-train)', einheit: 'g' },
  { feld: 'carbs', label: 'Kohlenhydrate', farbe: 'var(--acc-recov)', einheit: 'g' },
  { feld: 'fett', label: 'Fett', farbe: 'var(--acc-goals)', einheit: 'g' },
]

function TrendGrafik({ tage, feld, farbe }: {
  tage: readonly TrendTag[]; feld: Feld; farbe: string
}) {
  const werte = tage.map(t => t[feld])
  const belegt = werte.filter((w): w is number => w !== null)
  if (belegt.length < 2) {
    return (
      <p className="v2-muted" style={{ fontSize: 12 }}>
        Zu wenige Tage mit Eintrag — eine Kurve braucht mindestens zwei.
      </p>
    )
  }

  const min = Math.min(...belegt), max = Math.max(...belegt)
  const spanne = max - min || 1
  // `[read]` Ein Zehntel Luft oben und unten, damit der hoechste
  // Punkt nicht auf dem Rahmen klebt.
  const unten = min - spanne * 0.1, oben = max + spanne * 0.1
  const w = 600, h = 170
  const pad = { l: 34, r: 8, t: 8, b: 18 }
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b
  const n = werte.length
  const zuX = (i: number) => pad.l + (n > 1 ? (i / (n - 1)) * iw : iw / 2)
  const zuY = (v: number) => pad.t + ih - ((v - unten) / (oben - unten)) * ih
  const mittel = belegt.reduce((s, v) => s + v, 0) / belegt.length
  // `[read]` **`useId`, nicht `Math.random()`** — der Server
  // rendert vor, und eine Zufallszahl waere im Browser eine andere.
  const uid = React.useId().replace(/:/g, '')

  // Erster, mittlerer und letzter Tag — mehr passt auf 375 px nicht.
  const marken = n <= 2 ? [0, n - 1] : [0, Math.floor((n - 1) / 2), n - 1]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h }}
         preserveAspectRatio="none" aria-hidden focusable="false">
      {[0, 0.5, 1].map(t => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={pad.t + t * ih} y2={pad.t + t * ih}
                stroke="var(--border)" strokeWidth="1" />
          <text x={pad.l - 6} y={pad.t + t * ih + 3} textAnchor="end" fontSize="9"
                fill="var(--fg-dim)" fontFamily="var(--font-mono)">
            {Math.round(oben - t * (oben - unten))}
          </text>
        </g>
      ))}
      {/* Der Schnitt als gestrichelte Linie — der Bezug, gegen den
          man den einzelnen Tag liest. */}
      <line x1={pad.l} x2={w - pad.r} y1={zuY(mittel)} y2={zuY(mittel)}
            stroke="var(--fg-dim)" strokeWidth="1" strokeDasharray="4 4" />
      {/* ══ G-416/A2: die Flaeche, ECKIG ═══════════════════════
          **Tom, 2026-09-11:** *„die grafik auch abbilden wie in
          calorie balance, aber nicht geglaettet — sprich die untere
          flaeche schattiert."*
          `[read]` **Je zusammenhaengendem Stueck eine eigene
          Flaeche** — sie zieht nicht ueber eine Luecke. */}
      <defs>
        <linearGradient id={`${uid}-f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={farbe} stopOpacity="0.45" />
          <stop offset="100%" stopColor={farbe} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={flaecheMitLuecken(werte, zuX, zuY, pad.t + ih)}
            fill={`url(#${uid}-f)`} />
      <path d={pfadMitLuecken(werte, zuX, zuY)} fill="none" stroke={farbe}
            strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      {werte.map((v, i) => (
        v === null ? null : <circle key={i} cx={zuX(i)} cy={zuY(v)} r="2" fill={farbe} />
      ))}
      {marken.map(i => (
        <text key={i} x={zuX(i)} y={h - 4} textAnchor="middle" fontSize="9"
              fill="var(--fg-dim)" fontFamily="var(--font-mono)">
          {kurzDatum(tage[i].datum)}
        </text>
      ))}
    </svg>
  )
}

export function TrendKachel({ d, heute }: { d: InsightsStand; heute: string }) {
  const [fenster, setFenster] = React.useState<Fenster>(30)
  const [feld, setFeld] = React.useState<Feld>('kcal')
  const tage = React.useMemo(
    () => imFenster(d.reihe, fenster, heute), [d.reihe, fenster, heute],
  )
  const gewaehlt = FELDER.find(f => f.feld === feld) ?? FELDER[0]
  const belegte = tage.filter(t => t[feld] !== null).length

  if (d.reihe.length === 0) {
    return (
      <Card title="Verlauf" sub="Kalorien und Makros ueber die Zeit">
        <p className="v2-muted" style={{ fontSize: 12 }}>
          Fuer den Zeitraum liegen keine Tagessummen vor.
        </p>
      </Card>
    )
  }

  return (
    <Card
      title="Verlauf"
      sub={`${gewaehlt.label} · ${fenster} Tage`}
      actions={
        <div className="v2-segmented" role="group" aria-label="Zeitfenster">
          {FENSTER.map(t => (
            <button
              key={t}
              type="button"
              className={fenster === t ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
              aria-pressed={fenster === t}
              onClick={() => setFenster(t)}
            >
              {t}d
            </button>
          ))}
        </div>
      }
    >
      <div className="v2-segmented" role="group" aria-label="Groesse"
           style={{ marginBottom: 8 }}>
        {FELDER.map(f => (
          <button
            key={f.feld}
            type="button"
            className={feld === f.feld ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-ghost'}
            aria-pressed={feld === f.feld}
            onClick={() => setFeld(f.feld)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <TrendGrafik tage={tage} feld={feld} farbe={gewaehlt.farbe} />

      <div className="v2-divider" />
      <Row label="Schnitt" value={`${z(schnitt(tage, feld))} ${gewaehlt.einheit}`} />
      {/*
        `[read]` **Die Zahl der Tage steht neben dem Schnitt**, nicht
        im Kleingedruckten: ein Mittel aus 12 Tagen ist etwas anderes
        als eines aus 30, und beide heissen sonst „30 Tage".
      */}
      <Row label="Tage mit Eintrag" value={`${belegte} von ${tage.length}`} />
      {belegte < tage.length && (
        <p className="v2-muted" style={{ fontSize: 11, marginTop: 8 }}>
          Die Kurve bricht an den Tagen ohne Eintrag ab — sie wird nicht
          ueber die Luecke gezogen.
        </p>
      )}
    </Card>
  )
}

// ════════════════════════════════════════════════════════════════════
// G-295 — NutrientHeatmap
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Vorlage `HeatmapView.js` (68 Zeilen):** Kalendergitter,
// ein Feld je Tag, Farbe nach Deckung, Legende in fuenf Stufen.
//
// `[read]` **Warum sie NICHT dasselbe zeigt wie die Sparkline im
// Nutrients-Reiter:** die Sparkline zeigt EINEN Naehrstoff ueber die
// Zeit; die Heatmap zeigt EINEN TAG je Feld. **Nicht „wie lief
// Vitamin C", sondern „welche Tage waren gut".**
//
// `[cmd]` **Meine Abnahme vom 30.08. hat die Attrappe zu Recht
// entfernt und daraus zu Unrecht geschlossen, die Kachel sei
// entbehrlich.** Tom hat das am 31.08. berichtigt.

const WOCHENTAG = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

/** Montag = 0. `getDay()` zaehlt ab Sonntag. */
function spalte(iso: string): number {
  const tag = new Date(`${iso}T00:00:00`).getDay()
  return (tag + 6) % 7
}

export function HeatmapKachel({ d, heute }: { d: InsightsStand; heute: string }) {
  // `[read]` **28 Tage, nicht 30** — vier volle Wochen ergeben ein
  // Gitter ohne angebrochene Zeile. Der Auftrag nennt sie so.
  const tage = React.useMemo(() => {
    const dreissig = imFenster(d.reihe, 30, heute)
    return dreissig.slice(Math.max(0, dreissig.length - 28))
  }, [d.reihe, heute])

  if (tage.length === 0) {
    return (
      <Card title="Tagesdeckung" sub="28 Tage">
        <p className="v2-muted" style={{ fontSize: 12 }}>
          Fuer den Zeitraum liegen keine Tagessummen vor.
        </p>
      </Card>
    )
  }

  if (d.zielKcal === null) {
    // `[read]` **Ohne Ziel keine Deckung.** Die Vorlage rechnet gegen
    // ein festes `calTarget = 2100`; **eine erfundene Zahl faerbt hier
    // 28 Felder**, und niemand saehe, dass sie erfunden ist.
    return (
      <Card title="Tagesdeckung" sub="28 Tage">
        <p className="v2-muted" style={{ fontSize: 12 }}>
          Kein Kalorienziel hinterlegt — ohne Ziel gibt es keine
          Deckung. Die Felder blieben alle gleich, und das waere keine
          Aussage.
        </p>
      </Card>
    )
  }

  // Fuehrende Leerfelder, damit der erste Tag in seiner Spalte steht.
  const vorlauf = spalte(tage[0].datum)
  const stufen: Array<{ tag: TrendTag; pct: number | null; stufe: Stufe }> =
    tage.map(t => {
      const pct = deckung(t.kcal, d.zielKcal)
      return { tag: t, pct, stufe: stufeVon(pct) }
    })
  const gezaehlt = (s: Stufe) => stufen.filter(x => x.stufe === s).length

  // ══ G-297: die Kachelhoehe AUSFUELLEN ══════════════════════════
  //
  // **Tom, 2026-08-31:** *,,die hoehe ist nun definiert fuer
  // tagesdeckung, wieso verteilt man dann nicht auf optimale groesse
  // die grafik darin?"*
  //
  // `[read]` **Der vorige Auftrag hiess *,,kleiner"* und war falsch
  // gestellt.** `[cmd]` **Gemessen am 2026-08-31: beide Kacheln sind
  // 386 px hoch** — die Hoehe richtet sich nach der Verlaufskachel
  // daneben. **Unter dem 26-px-Gitter blieben 58 px leer.**
  //
  // `[cmd]` **Die Karte ist 398 px breit.** Sieben Spalten mit 4 px
  // Abstand lassen rund **50 px je Feld** — fast das Doppelte.
  //
  // `[read]` **Also `1fr` statt einer festen Obergrenze:** das Gitter
  // nimmt die Breite, die die Karte hergibt, und `aspectRatio: 1`
  // macht daraus die Hoehe. **Es waechst mit der Kachel, statt in
  // ihrer Ecke zu sitzen.**
  return (
    <Card title="Tagesdeckung" sub={`28 Tage · Ziel ${z(d.zielKcal)} kcal`}>
      <div style={{
        display: 'grid',
        // `[read]` **`minmax(0, 1fr)`, nicht `1fr`:** ohne die 0 kann
        // eine Spalte nicht unter ihre Inhaltsbreite schrumpfen, und
        // das Gitter sprengt die Karte auf schmalen Schirmen.
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        // `[cmd]` **`:419`: `gap: 2`** — bei 16 px Zellen frassen
        // 4 px Abstand ein Viertel der Flaeche.
        gap: 2, marginBottom: 8,
      }}>
        {WOCHENTAG.map(w => (
          <div key={w} className="v2-eyebrow"
               style={{ textAlign: 'center', fontSize: 8.5 }}>
            {w}
          </div>
        ))}
        {Array.from({ length: vorlauf }, (_, i) => (
          <div key={`leer-${i}`} aria-hidden />
        ))}
        {stufen.map(({ tag, pct, stufe }) => (
          <div
            key={tag.datum}
            title={`${kurzDatum(tag.datum)} — ${pct === null ? 'kein Eintrag' : `${pct} % des Ziels`}`}
            style={{
              // ══ G-416/A4: die Masse der Vorlage ═══════════════
              //
              // **Tom, 2026-09-11:** *„Die ZELLHOEHE 16 ist der
              // Massstab, nicht die Kachelhoehe."*
              //
              // `[cmd]` **`module-nutrition.jsx:420`: `height: 16`.**
              // `[cmd]` **Vorher `aspectRatio: 1`** — die Zelle wuchs
              // mit der Kachelbreite und wurde rund 50 px hoch.
              height: 16,
              borderRadius: 2,
              background: STUFE_FARBE[stufe],
              // `[cmd]` **`:422`: `opacity: 0.25 + v * 0.7`.**
              // `[read]` **Die Deckkraft haengt am WERT** — genau
              // das fehlte, und deshalb wirkten die Farben schrill.
              // `[read]` **Ein leeres Feld bleibt blass**, damit es
              // als Luecke lesbar ist.
              opacity: pct === null ? 0.3 : 0.25 + Math.min(1, pct / 100) * 0.7,
            }}
          />
        ))}
      </div>

      <div className="v2-divider" />
      {/* `[cmd]` **Die Legende der Vorlage ist eine FLEX-ZEILE**
          (`HeatmapView.js:38`) — fuenf Zeilen wurden zu einer.
          `[read]` **Die Zahl bleibt daneben:** ohne sie waere die
          Farbe eine Behauptung ohne Beleg. */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', rowGap: 4 }}>
        {(['optimal', 'gut', 'knapp', 'gering', 'leer'] as Stufe[]).map(s => (
          <div key={s} style={{
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5,
          }}>
            <span style={{
              width: 10, height: 10, borderRadius: 2, flexShrink: 0,
              background: STUFE_FARBE[s], border: '1px solid var(--border)',
            }} />
            <span className="v2-dim">{STUFE_TEXT[s]}</span>
            <span className="v2-num">{gezaehlt(s)}</span>
          </div>
        ))}
      </div>
      <p className="v2-muted" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
        Ein Feld je Tag, gefaerbt nach der Deckung des Kalorienziels.
        <strong> Das ist nicht der Verlauf eines Naehrstoffs</strong> —
        den zeigt der Nutrients-Reiter je Zeile.
      </p>
    </Card>
  )
}

// ════════════════════════════════════════════════════════════════════
// G-293 — MacroDetail
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Gemessen am 2026-08-31 ueber 30 Tage:** `FAT` 65,40 g im
// Schnitt, darunter `FASAT` 14,07 · `FAMS` 29,95 · `FAPU` 11,29 — und
// unter `FAPU` wiederum `FAPUN3` 4,44 · `FAPUN6` 6,84.
//
// `[read]` **Die Teile ergeben nicht das Ganze:** 55,31 gegen 65,40.
// **Das steht als eigene Zeile da**, nicht als Rundungsfehler
// weggelassen.

function MakroZeile({ k, tiefe }: { k: MakroKnoten; tiefe: number }) {
  const [offen, setOffen] = React.useState(tiefe === 0)
  const rest = restVon(k)
  const hatKinder = k.kinder.length > 0

  return (
    <div style={{ marginLeft: tiefe * 14 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8, padding: '4px 0',
      }}>
        {hatKinder ? (
          <button
            type="button"
            className="v2-btn v2-btn-ghost"
            style={{ padding: '0 4px', fontSize: 10, lineHeight: 1.6 }}
            aria-expanded={offen}
            aria-label={`${k.name} ${offen ? 'zuklappen' : 'aufklappen'}`}
            onClick={() => setOffen(o => !o)}
          >
            {offen ? '▾' : '▸'}
          </button>
        ) : (
          <span style={{ width: 18 }} aria-hidden />
        )}
        <span style={{ flex: 1, fontSize: tiefe === 0 ? 13 : 12 }}>
          {k.name}
          {/*
            `[read]` **Die Luecke steht an der Zahl, nicht im
            Fussnotentext.** `FAMS` ist an 25 von 30 Tagen
            vollstaendig — ohne diesen Zusatz liest sich der Schnitt
            wie einer aus 30.
          */}
          {!istVollstaendig(k) && k.tage > 0 && (
            <span className="v2-dim" style={{ fontSize: 10.5 }}> · {luekenSatz(k)}</span>
          )}
        </span>
        <span className="v2-num" style={{ fontSize: 12 }}>
          {z(k.wert, 2)} <span className="v2-dim">{k.einheit}</span>
        </span>
      </div>
      {offen && hatKinder && (
        <>
          {k.kinder.map(kind => (
            <MakroZeile key={kind.code} k={kind} tiefe={tiefe + 1} />
          ))}
          {/*
            `[read]` **Was die Teile nicht erklaeren, bekommt eine
            Zeile.** Wer die Differenz weglaesst, behauptet eine
            vollstaendige Aufteilung.
          */}
          {rest !== null && Math.abs(rest) >= 0.01 && (
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 8,
              padding: '4px 0', marginLeft: (tiefe + 1) * 14,
            }}>
              <span style={{ width: 18 }} aria-hidden />
              <span className="v2-dim" style={{ flex: 1, fontSize: 12 }}>
                nicht aufgeschluesselt
              </span>
              <span className="v2-num v2-dim" style={{ fontSize: 12 }}>
                {z(rest, 2)} <span className="v2-dim">{k.einheit}</span>
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function MakroDetailKachel({ d, fenster }: {
  d: InsightsStand; fenster: number
}) {
  if (d.makroBaum.length === 0) {
    return (
      <Card title="Makros im Detail" sub={`${fenster} Tage`}>
        <p className="v2-muted" style={{ fontSize: 12 }}>
          Fuer den Zeitraum liegen keine Naehrstoffsummen vor.
        </p>
      </Card>
    )
  }

  return (
    <Card title="Makros im Detail" sub={`Schnitt je Tag · ${fenster} Tage`}>
      <div className="v2-col-gap" style={{ gap: 0 }}>
        {d.makroBaum.map(k => <MakroZeile key={k.code} k={k} tiefe={0} />)}
      </div>
      <p className="v2-muted" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
        Jede Zahl ist der Schnitt je Tag, nicht die Summe des Zeitraums.
        <strong> Wo Untergliederungen die Obergroesse nicht ausschoepfen</strong>,
        steht die Differenz als eigene Zeile — der BLS fuehrt weitere
        Bestandteile, die keine der Gruppen traegt.
      </p>
    </Card>
  )
}

// ════════════════════════════════════════════════════════════════════
// G-292 — MicroFlagsList
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **`reference_assessment_window_flags` liefert je Naehrstoff
// drei Zahlen:** getroffene, bewertete und unvollstaendige Tage.
//
// `[cmd]` **Gemessen bei 30 Tagen: 11 Warnungen** — von Wasser 30/30
// bis Chlorid mit **4 getroffenen von 8 bewerteten Tagen und 22
// unvollstaendigen.**
//
// `[read]` **Beides gleich zu zeigen waere falsch.** Deshalb sortiert
// `sortiere()` das Duenne nach hinten UND die Zeile sagt es.

// `[cmd]` **Gemessen am 2026-08-31 ueber 30 Tage: die Funktion
// liefert genau zwei Richtungen** — `target` (9 der 11 Zeilen) und
// `upper_limit` (Magnesium, Niacin). **Kein `min`, kein `max`.**
//
// `[read]` **Deshalb steht kein erfundener Schluessel hier.** Ein
// unbekannter Wert faellt unten auf den Rohtext zurueck und ist damit
// sichtbar, statt still als etwas anderes uebersetzt zu werden.
const RICHTUNG_TEXT: Record<string, string> = {
  target: 'ausserhalb des Zielbereichs',
  upper_limit: 'ueber der Obergrenze',
}

export function WarnungenKachel({ d, fenster }: {
  d: InsightsStand; fenster: number
}) {
  const sortiert = React.useMemo(
    () => sortiere(d.flags, fenster), [d.flags, fenster],
  )

  if (sortiert.length === 0) {
    return (
      <Card title="Auffaellige Naehrstoffe" sub={`${fenster} Tage`}>
        <p className="v2-muted" style={{ fontSize: 12 }}>
          Keine Auffaelligkeit im Zeitraum — oder zu wenige bewertbare
          Tage, um eine festzustellen.
        </p>
      </Card>
    )
  }

  const duenn = sortiert.filter(f => belastbarkeit(f, fenster) === 'duenn').length

  return (
    <Card
      title="Auffaellige Naehrstoffe"
      sub={`${sortiert.length} im Zeitraum · ${fenster} Tage`}
      actions={duenn > 0 ? <Pill>{duenn} duenn belegt</Pill> : undefined}
    >
      <div className="v2-col-gap" style={{ gap: 10, marginTop: 4 }}>
        {sortiert.map(f => {
          const a = anteil(f)
          const schmal = belastbarkeit(f, fenster) === 'duenn'
          return (
            <div key={f.code}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'baseline', marginBottom: 4, gap: 8,
              }}>
                <span className="v2-eyebrow" style={{
                  opacity: schmal ? 0.65 : 1,
                }}>
                  {f.name}
                </span>
                <span className="v2-num" style={{ fontSize: 11 }}>
                  {a === null ? '—' : `${a} %`}
                  <span className="v2-dim"> · {f.getroffen} von {f.bewertet} Tagen</span>
                </span>
              </div>
              <Meter
                value={a ?? 0} max={100}
                color={schmal ? 'var(--fg-dim)' : 'var(--warn)'}
                tall
              />
              <p className="v2-muted" style={{ fontSize: 10.5, marginTop: 3 }}>
                {RICHTUNG_TEXT[f.richtung] ?? f.richtung}
                {f.unvollstaendig > 0 && (
                  <> · {f.unvollstaendig} Tage nicht bewertbar</>
                )}
              </p>
              {/*
                `[read]` **Der Satz steht an der Zeile, nicht nur in
                der Sortierung.** Wer nur sortiert, verlaesst sich
                darauf, dass jemand die Reihenfolge deutet.
              */}
              {schmal && (
                <p className="v2-muted" style={{ fontSize: 10.5, marginTop: 2 }}>
                  {DUENN_SATZ}
                </p>
              )}
            </div>
          )
        })}
      </div>
      <div className="v2-divider" />
      <Row label="Bezugsgroesse" value="bewertete Tage, nicht das Fenster" />
      <p className="v2-muted" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
        Der Anteil rechnet gegen die Tage, an denen der Naehrstoff
        bewertbar war. <strong>Gegen das ganze Fenster gerechnet</strong>{' '}
        saehe ein selten messbarer Naehrstoff harmlos aus.
      </p>
    </Card>
  )
}

// ════════════════════════════════════════════════════════════════════
// DeficitSuggestions — GEMELDET, NICHT GEBAUT
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **SPEC_10 nennt sie**, `C-108/F-02` verbietet sie. Der
// Widerspruch liegt als `DEFIZIT_WIDERSPRUCH` in `insights-lage.ts`
// und ist im G-291-Bericht gemeldet.
//
// `[read]` **Er steht hier als Konstante, nicht als Kachel** — A-59:
// eine Kachel, die den Widerspruch erklaert, ist auch eine Kachel.
// **Der Verweis gehoert in den Quelltext, die Entscheidung zu Tom.**
export const DEFIZIT_HINWEIS = DEFIZIT_WIDERSPRUCH

// `[cmd]` **CrossModuleInsights wartet auf C-324** — die sechste
// Komponente aus SPEC_10. Sie braucht den Score, und der ist nicht
// entschieden (E-25).
