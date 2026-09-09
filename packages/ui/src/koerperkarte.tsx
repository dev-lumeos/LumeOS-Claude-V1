'use client'

// Die Koerperkarte — anatomische Muskeldarstellung, vorne und hinten.
//
// QUELLE: `docs/spezifikation/10-plattform/design-system/mockup-zwischenwurf/components/MuscleBodyMap.js`
// (593 Zeilen, Stand 2026-04-28). `[read]` Tom, 2026-08-17: „Die
// Muskelkomponente nehmen wir sicher mit rein und verwenden sie, wo
// gebraucht. Das HTML zeigt schon, was moeglich ist — das ist sehr
// vielseitig."
//
// WARUM IN packages/ui: `[cmd]` Drei Module brauchen sie —
// Recovery (Ermuedung), Training (Aktivierung), Supplements
// (Injektionspunkte). Der Mockup fuehrt fuenf Aufrufarten mit einer
// gemeinsamen Figur; je Modul nachzubauen hiesse, dieselben 200 Zeilen
// Pfaddaten dreimal zu halten.
//
// GEAENDERT GEGENUEBER DEM MOCKUP:
//   1. `window.MuscleBodyMap` als IIFE mit direkter DOM-Manipulation
//      -> React-Komponente. Der Mockup baut Knoten per
//      `document.createElementNS` und haengt Ereignisse von Hand an;
//      in React gehoert das ins JSX, sonst kollidieren die beiden.
//   2. **Feste Farben -> Tokens.** Der Mockup traegt 19 Hex-Werte.
//      Welcher worauf faellt, steht unten bei den Skalen und
//      ausfuehrlich im Bericht.
//   3. Tastaturbedienung ergaenzt. Ein SVG-Pfad mit `onClick` ist per
//      Tastatur nicht erreichbar — dieselbe Begruendung wie bei `Tabs`.
//   4. `clipPath`-IDs je Einbindung eindeutig (`React.useId`).
//      Sonst greifen zwei Karten auf einer Seite auf denselben
//      Beschnitt zu.
//
// NICHT GEAENDERT: die Pfade, die Anordnung, die Schwellen der Skalen
// (25/60 bei Ermuedung, 3/7/14 Tage bei Injektionen).
import * as React from 'react'

import {
  MUSKELN, UMRISS_VORNE, UMRISS_HINTEN, INJEKTIONS_ORTE,
} from './koerperkarte-pfade'

export type KoerperSeite = 'front' | 'back'

/** Ein eingefaerbter Muskel. */
export type MuskelWert = {
  id: string
  /** Farbe als CSS-Wert — in der Regel ein Token. */
  color?: string
  opacity?: number
  /**
   * Nur eine Koerperhaelfte einfaerben — G-396.
   *
   * `[cmd]` **Gemessen: jede Flaeche fuehrt ihre Haelften als eigene
   * Pfade.** `deltoids` hat vier (x = 274, 450 vorne; 981, 1227
   * hinten), `quadriceps` sechs, `gluteal` vier. **Die Mitte der
   * Ansicht liegt bei 362** — der erste `M`-Wert eines Pfades sagt,
   * auf welcher Seite er liegt.
   *
   * `[read]` **Ohne das waere `delt_l` nicht von `delt_r` zu
   * unterscheiden** — beide Injektionsorte teilen sich die Flaeche
   * `deltoids`, und die Karte haette immer beide Schultern
   * eingefaerbt.
   *
   * `[read]` **`undefined` faerbt die ganze Flaeche** — so verhalten
   * sich `ErmuedungsKarte` und `AktivierungsKarte` weiter, die keine
   * Seite angeben.
   */
  seite?: 'links' | 'rechts'
}

/** Ein Punkt auf der Figur (Injektion, Schmerz, beliebig). */
export type KoerperPunkt = {
  id: string
  side: KoerperSeite
  /** 0..1 relativ zur Breite/Hoehe der jeweiligen Ansicht. */
  xPct: number
  yPct: number
  color?: string
  label?: string
  badge?: string | null
  /** Hebt die naechste empfohlene Stelle hervor. */
  pulse?: boolean
  size?: number
  typ?: string
}

export type LegendenEintrag = { color: string; opacity?: number; label: string }

// ---------------------------------------------------------------------
// Die Farbskalen — hier faellt der Mockup auf die Tokens
// ---------------------------------------------------------------------
//
// `[cmd]` DIE ZUORDNUNG IST NICHT ERFUNDEN, sondern folgt der Bedeutung,
// die der Mockup den Farben selbst gibt. Seine Legende sagt bei
// Ermuedung „Ready / Caution / Rest" — das ist genau die Dreiteilung,
// die `--pos` / `--warn` / `--neg` im Theme tragen. Beide Themes fuehren
// alle drei (lume.css:18-20 hell, :87-89 dunkel).
//
// **Keine neuen Farbtokens.** Wo die vorhandenen nicht reichen, steht
// es unten ausdruecklich.

/** Ermuedung: die drei Stufen des Mockups (fatigueColor, Zeile 39-43). */
export function ermuedungsFarbe(pct: number): [string, number] {
  if (pct <= 25) return ['var(--pos)', 0.75]   // Mockup #10B981
  if (pct <= 60) return ['var(--warn)', 0.80]  // Mockup #F59E0B
  return ['var(--neg)', 0.85]                  // Mockup #EF4444
}

/**
 * Aktivierung: VIER Stufen (activationColor, Zeile 45-47).
 *
 * `[cmd]` HIER REICHEN DIE TOKENS NICHT GANZ. Der Mockup staffelt
 * `#fde047` (hellgelb) · `#fb923c` (orange) · `#ef4444` (rot) ·
 * `#991b1b` (dunkelrot) — vier Stufen auf einer Achse. Das Theme fuehrt
 * auf dieser Achse drei: `--warn`, `--acc-nutri` (waermeres Gelb),
 * `--neg`.
 *
 * **Geloest ohne neuen Token:** die vierte Stufe entsteht aus `--neg`
 * per `color-mix` mit dem Hintergrund — dieselbe Farbe, dunkler. Das
 * ist die Technik, die v2.css an 40 Stellen benutzt, kein neuer Wert.
 * Wenn Tom die vierte Stufe als eigenen Token will, ist das eine
 * Entscheidung fuer ihn — gemeldet, nicht selbst getroffen.
 */
export function aktivierungsFarbe(stufe: number): [string, number] {
  const s = Math.min(Math.max(stufe, 1), 4)
  const skala = [
    'var(--warn)',
    'var(--acc-nutri)',
    'var(--neg)',
    'color-mix(in oklch, var(--neg) 70%, black)',
  ]
  return [skala[s - 1], 0.82]
}

/**
 * Injektionen: fuenf Stufen nach Tagen seit der letzten Nutzung
 * (injectionColor, Zeile 49-55).
 *
 * `[cmd]` Der Mockup nimmt hier fuenf Werte; vier davon sind dieselbe
 * Ampel wie oben, der fuenfte ist „nie benutzt" — kein Zustand auf der
 * Ampel, sondern das Fehlen eines Werts. Dafuer gibt es `--fg-dim`.
 */
export function injektionsFarbe(tageSeither: number): string {
  if (tageSeither >= 999) return 'var(--fg-dim)'   // nie benutzt
  if (tageSeither >= 14) return 'var(--pos)'
  if (tageSeither >= 7) return 'var(--warn)'
  if (tageSeither >= 3) return 'var(--acc-nutri)'
  return 'var(--neg)'                              // kuerzlich
}

// `[cmd]` Die drei Farben, die KEINE Bedeutung tragen, sondern die
// Figur zeichnen. Der Mockup nimmt dafuer `#b8bec8` (Grundflaeche),
// `#64748b` (Umriss), `#c8c0b8` (Haut) und `#6b5b4e` (Haare).
// Grundflaeche und Umriss fallen auf Tokens. **Haut und Haare nicht:**
// sie sind keine Statusfarbe und kein Flaechenton, sondern
// gegenstaendliche Farbe. Ein Token dafuer waere ein neuer Token —
// deshalb bleiben sie als Festwert stehen und stehen so im Bericht.
// `[cmd]` G-55, in beiden Modi gemessen (lume.css, oklch-Helligkeit
// gegen den Kartengrund `--surface`):
//
//   Token             dunkel   hell
//   --surface-2        0,030   0,025   unsichtbar
//   --surface-hover    0,050   0,045   knapp
//   --border           0,075   0,090   knapp
//   --border-strong    0,155   0,180   deutlich
//
// **`--surface-2` war der Fehler.** Der Mockup faerbt mit `#b8bec8`
// auf WEISSEM Grund — ein Mittelgrau, das sich klar abhebt. Diese
// Anwendung laeuft im Normalfall DUNKEL, und dort liegt `--surface-2`
// 0,03 ueber dem Kartengrund. Haende, Fuesse und Schienbein
// verschwanden.
//
// **Gewaehlt ist `--border-strong`:** der einzige vorhandene Token,
// der in BEIDEN Modi ueber 0,15 liegt — und schon die Konturfarbe.
// Kein neuer Token.
const GRUNDFLAECHE = 'var(--border-strong)'
const UMRISS_FARBE = 'var(--border-strong)'

// `[cmd]` DAZU EINE KONTUR JE FORM. Der Mockup zeichnet einen
// Gesamtumriss (`OUTLINE_FRONT`) — **der ist dort toter Code:**
// `outlinePath` entsteht in Zeile 310, wird aber nie an `outlineG`
// gehaengt. Am Bildschirm nachgemessen: die Umrissgruppe der
// Testseite ist leer, die volle Figur kommt allein aus `MUSCLES`.
//
// Meine Portierung zeichnet den Umriss zwar, aber seine Pfaddaten
// sind fehlerhaft (118 `C`-Befehle mit vier statt sechs Zahlen), also
// bricht der Browser mittendrin ab. Statt die Daten zu reparieren —
// das waere Arbeit an der Vorlage — bekommt **jede Form ihre eigene
// duenne Kontur.** Das trennt die Flaechen auch dort, wo zwei
// gleichfarbige aneinanderstossen, und braucht keine Pfadreparatur.
const KONTUR = 'color-mix(in oklch, var(--fg-subtle) 55%, transparent)'

const VB_W = 724
const VB_H = 1448

/**
 * Wie weit die Ansicht sich fuer die Beschriftung oeffnet — G-396.
 *
 * `[cmd]` **Gemessen: die Figur fuellt 49..679 von 724** — links und
 * rechts bleiben je 45 px, und die Ansicht ist am Schirm nur 200 px
 * breit. **Fuer Text neben der Figur reicht das nicht.**
 *
 * `[read]` **Also den Rahmen verbreitern, nicht den Text
 * hineinschieben** (so steht es im Auftrag): die Figur wird dadurch
 * schmaler, die Beschriftung bekommt Platz.
 *
 * `[cmd]` **NUR wenn Punkte da sind.** `ErmuedungsKarte` und
 * `AktivierungsKarte` uebergeben keine — ihre Ansicht bleibt
 * unveraendert 724 breit.
 */
const BESCHRIFTUNGSRAND = 200

/** Abstand des Textes vom Rand der erweiterten Ansicht. */
const RAND = 8

export type KoerperkarteProps = {
  /** Eingefaerbte Muskeln. Leer lassen fuer eine reine Punktkarte. */
  muskeln?: MuskelWert[]
  /** Punkte ueber der Figur (Injektionen, Schmerz). */
  punkte?: KoerperPunkt[]
  /** Dimmt die Figur, damit die Punkte im Vordergrund stehen. */
  figurDimmen?: boolean
  legende?: LegendenEintrag[]
  /** Breite EINER Ansicht in Pixeln. Die Karte zeigt immer beide. */
  breite?: number
  beschriftung?: boolean
  onPick?: (id: string, typ: 'muscle' | 'point', daten?: unknown) => void
  /** Beschriftung fuer Vorder-/Rueckansicht. */
  texte?: { vorne: string; hinten: string }
  /**
   * Hebt eine Gruppe hervor.
   *
   * `[cmd]` Der Mockup kennt das nicht — der Entwurf schon
   * (`BodyMap18` hat `selected`, module-recovery-v2.jsx:68), und der
   * Check-in benutzt es: man tippt einen Muskel an und sieht, welcher
   * gerade gemeint ist. Ergaenzt, statt es beim Umbau zu verlieren.
   */
  ausgewaehlt?: string | null
}

function Ansicht({
  seite, farben, punkte, figurDimmen, breite, beschriftung, onPick, id, texte,
  ausgewaehlt,
}: {
  seite: KoerperSeite
  /** G-396: mehrere Werte je Flaeche — je Koerperhaelfte einer. */
  farben: Record<string, MuskelWert[]>
  punkte: KoerperPunkt[]
  figurDimmen: boolean
  breite: number
  beschriftung: boolean
  onPick?: KoerperkarteProps['onPick']
  id: string
  texte: { vorne: string; hinten: string }
  ausgewaehlt?: string | null
}) {
  const hinten = seite === 'back'
  const vbX = hinten ? VB_W : 0
  // G-396: nur eine Punktkarte oeffnet den Rahmen fuer Beschriftung.
  const hatPunkte = punkte.some(p => p.side === seite)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
      {beschriftung && (
        <div className="v2-eyebrow" style={{ marginBottom: 4 }}>
          {hinten ? texte.hinten : texte.vorne}
        </div>
      )}
      <svg
        viewBox={hatPunkte
          ? `${vbX - BESCHRIFTUNGSRAND} 0 ${VB_W + 2 * BESCHRIFTUNGSRAND} ${VB_H}`
          : `${vbX} 0 ${VB_W} ${VB_H}`}
        style={{
          width: '100%',
          // ══ G-396: der Rahmen waechst, die FIGUR bleibt gleich gross ══
          //
          // `[cmd]` **Gemessen: mit `maxWidth: breite` schrumpfte
          // alles.** Der Rahmen ging von 724 auf 1324 Einheiten, die
          // Anzeige blieb bei 200 px ? Faktor 0,151, und die
          // Beschriftung war **4 px hoch**. Unlesbar.
          //
          // `[read]` **Die Breite gilt der FIGUR, nicht dem Rahmen.**
          // Waechst der Rahmen fuer die Beschriftung, waechst die
          // erlaubte Breite im selben Verhaeltnis mit ? sonst zahlt
          // die Figur fuer den Text.
          maxWidth: hatPunkte
            ? breite * ((VB_W + 2 * BESCHRIFTUNGSRAND) / VB_W)
            : breite,
          display: 'block',
          overflow: 'visible',
        }}
        role="img"
        aria-label={hinten ? texte.hinten : texte.vorne}
      >
        <g opacity={figurDimmen ? 0.6 : 1}>
          {/* Der Umriss. `vector-effect` haelt die Linie bei jeder
              Skalierung gleich duenn — sonst wird sie beim
              Herunterrechnen unsichtbar. */}
          <path
            d={hinten ? UMRISS_HINTEN : UMRISS_VORNE}
            fill="none"
            stroke={UMRISS_FARBE}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ vectorEffect: 'non-scaling-stroke' }}
          />
          {Object.entries(MUSKELN).map(([mid, muskel]) => {
            let pfade: string[] | undefined
            if (muskel.side === 'both') pfade = hinten ? muskel.paths_back : muskel.paths_front
            else if ((muskel.side === 'back') === hinten) pfade = muskel.paths
            if (!pfade?.length) return null

            // Bei gedimmter Figur wird nichts eingefaerbt und nichts
            // anklickbar — die Punkte stehen dann im Vordergrund.
            const werte = figurDimmen ? [] : (farben[mid] ?? [])
            const aktiv = ausgewaehlt === mid

            return (
              <g key={mid} data-muskel={mid}>
                {pfade.map((d, i) => {
                  // ══ G-396: welche Haelfte ist dieser Pfad? ════════
                  //
                  // `[cmd]` **Der erste `M`-Wert sagt es**, gemessen
                  // gegen die Mitte der Ansicht (`VB_W / 2`): bei
                  // `deltoids` liegen die Pfade auf 274/450 vorne und
                  // 981/1227 hinten. `[read]` **Der Rueckwaerts-Rest
                  // (`% VB_W`) macht die Rueckansicht vergleichbar** —
                  // ihre Pfade zaehlen ab 724.
                  const ersterX = Number(/^M\s*([\d.]+)/.exec(d)?.[1] ?? NaN)
                  const pfadSeite: 'links' | 'rechts' | null =
                    Number.isFinite(ersterX)
                      ? ((ersterX % VB_W) < VB_W / 2 ? 'links' : 'rechts')
                      : null
                  // `[read]` **Ein Wert ohne Seite gilt fuer die ganze
                  // Flaeche** — so bleiben die zwei Muskelkarten
                  // unveraendert.
                  const wert = werte.find(w => !w.seite || w.seite === pfadSeite)
                  const fuellung = wert?.color ?? muskel.fixedFill ?? GRUNDFLAECHE
                  const deckung = wert?.opacity ?? (muskel.fixedFill ? 1 : 0.85)
                  const klickbar = Boolean(wert && onPick)
                  return (
                  <path
                    key={i}
                    d={d}
                    data-seite={wert?.seite ?? undefined}
                    fill={fuellung}
                    fillOpacity={aktiv ? Math.min(1, deckung + 0.15) : deckung}
                    stroke={aktiv ? 'var(--fg)' : KONTUR}
                    strokeWidth={aktiv ? 6 : 1}
                    style={{
                      cursor: klickbar ? 'pointer' : 'default',
                      vectorEffect: 'non-scaling-stroke',
                    }}
                    onClick={klickbar ? () => onPick?.(mid, 'muscle', wert) : undefined}
                    role={klickbar ? 'button' : undefined}
                    tabIndex={klickbar ? 0 : undefined}
                    onKeyDown={klickbar
                      ? e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onPick?.(mid, 'muscle', wert)
                        }
                      }
                      : undefined}
                  >
                    <title>{wert?.id ?? mid}</title>
                  </path>
                  )
                })}
              </g>
            )
          })}
        </g>

        {/* ══ G-396: die Beschriftung steht AUSSEN, mit Fuehrungslinie ══
            **Tom, 2026-09-09:** *„die beschriftung weiter ausserhalb
            lesbar und mit feinen linien auf den punkt zeigen."*

            `[cmd]` **Vorher: `y + r + 28`, `textAnchor="middle"`** —
            der Text sass 28 px UNTER dem Punkt und mittig darauf.
            **Gemessen: Deltoid und Vastus lateralis ueberlappten**,
            und `vg`/`glute` liegen nur 0.04 auseinander (0.48 gegen
            0.52) — bei 1448 px Hoehe sind das 58 px, weniger als
            zwei Zeilen.

            `[read]` **Betroffen ist nur `InjektionsKarte`** —
            `ErmuedungsKarte` und `AktivierungsKarte` uebergeben
            `muskeln`, nie `punkte`, und kein Aufrufer tut es
            (gemessen). **Die zwei Muskelkarten aendern sich nicht.** */}
        {(() => {
          const eigene = punkte.filter(p => p.side === seite)
          // `[read]` **Je Seite getrennt entzerren** — links und
          // rechts stoeren sich nicht, sie stehen an gegenueber-
          // liegenden Raendern.
          const zeilen = new Map<string, number>()
          for (const lr of ['links', 'rechts'] as const) {
            const gruppe = eigene
              .filter(p => (lr === 'links' ? p.xPct < 0.5 : p.xPct >= 0.5))
              .sort((a, b) => a.yPct - b.yPct)
            let letzte = -Infinity
            for (const p of gruppe) {
              // `[cmd]` **Mindestabstand 46 px** — Schriftgroesse 22
              // plus Luft. Wer naeher liegt, wird nach unten
              // geschoben, statt sich zu ueberlagern.
              const wunsch = p.yPct * VB_H
              const y = Math.max(wunsch, letzte + 46)
              zeilen.set(p.id, y)
              letzte = y
            }
          }
          return eigene.map(p => {
          const x = vbX + p.xPct * VB_W
          const y = p.yPct * VB_H
          const r = p.size ?? 18
          const farbe = p.color ?? 'var(--fg-dim)'
          // Links vom Punkt -> Text linksbuendig am linken Rand,
          // rechts vom Punkt -> rechtsbuendig am rechten Rand.
          const linkeSeite = p.xPct < 0.5
          const textX = linkeSeite
            ? vbX - BESCHRIFTUNGSRAND + RAND
            : vbX + VB_W + BESCHRIFTUNGSRAND - RAND
          const textY = zeilen.get(p.id) ?? y
          return (
            <g
              key={p.id}
              data-punkt={p.id}
              style={{ cursor: onPick ? 'pointer' : 'default' }}
              onClick={onPick ? () => onPick(p.id, 'point', p) : undefined}
              role={onPick ? 'button' : undefined}
              tabIndex={onPick ? 0 : undefined}
              onKeyDown={onPick
                ? e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onPick(p.id, 'point', p)
                  }
                }
                : undefined}
            >
              {p.pulse && (
                <circle cx={x} cy={y} r={r * 1.8} fill="none" stroke={farbe} strokeWidth="4" opacity="0.4">
                  <animate attributeName="r" from={r * 0.8} to={r * 2.5} dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={x} cy={y} r={r} fill={farbe} stroke="var(--bg-elev)" strokeWidth="5" />
              {p.badge != null && (
                <text x={x} y={y - r - 10} textAnchor="middle" fill="var(--fg-muted)" fontSize="22">
                  {p.badge}
                </text>
              )}
              {p.label && (
                <>
                  {/* Die Fuehrungslinie: vom Text zum Punkt, fein und
                      gedaempft — sie soll zeigen, nicht auffallen.
                      `vector-effect` haelt sie bei jeder Skalierung
                      duenn, wie beim Umriss. */}
                  <polyline
                    points={
                      `${textX + (linkeSeite ? 6 : -6)},${textY - 6} `
                      + `${x + (linkeSeite ? -r - 8 : r + 8)},${textY - 6} `
                      + `${x + (linkeSeite ? -r - 2 : r + 2)},${y}`
                    }
                    fill="none"
                    stroke="var(--fg-dim)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    opacity="0.7"
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor={linkeSeite ? 'start' : 'end'}
                    fill="var(--fg)"
                    fontSize="34"
                    fontWeight="600"
                  >
                    {p.label}
                  </text>
                </>
              )}
              <title>{p.label ?? p.id}</title>
            </g>
          )
          })
        })()}
      </svg>
    </div>
  )
}

export function Koerperkarte({
  muskeln = [], punkte = [], figurDimmen = false, legende,
  breite = 130, beschriftung = true, onPick,
  texte = { vorne: 'Front', hinten: 'Back' },
  ausgewaehlt,
}: KoerperkarteProps) {
  const id = React.useId().replace(/:/g, '')
  // ══ G-396: MEHRERE Werte je Flaeche ═══════════════════════════════
  //
  // `[cmd]` **Hier stand `k[m.id] = m`** — ein Wert je Muskel, der
  // letzte gewann. **Zwei Injektionsorte teilen sich aber eine
  // Flaeche** (`delt_l` und `delt_r` beide `deltoids`), und mit einer
  // Seite je Wert sind es bis zu zwei.
  //
  // `[read]` **`ErmuedungsKarte` und `AktivierungsKarte` geben keine
  // Seite an** — dort bleibt es bei einem Eintrag je Flaeche, und die
  // Anzeige aendert sich nicht.
  const farben = React.useMemo(() => {
    const k: Record<string, MuskelWert[]> = {}
    for (const m of muskeln) (k[m.id] ??= []).push(m)
    return k
  }, [muskeln])

  return (
    <div className="v2-koerperkarte">
      <div className="v2-koerperkarte-reihe">
        {(['front', 'back'] as const).map(seite => (
          <Ansicht
            key={seite}
            seite={seite}
            farben={farben}
            punkte={punkte}
            figurDimmen={figurDimmen}
            breite={breite}
            beschriftung={beschriftung}
            onPick={onPick}
            id={id}
            texte={texte}
            ausgewaehlt={ausgewaehlt}
          />
        ))}
      </div>
      {legende && legende.length > 0 && (
        <div className="v2-koerperkarte-legende">
          {legende.map(l => (
            <span key={l.label} className="v2-koerperkarte-legende-eintrag">
              <span
                className="v2-koerperkarte-punkt"
                style={{ background: l.color, opacity: l.opacity ?? 0.85 }}
              />
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------
// Die fuenf Aufrufarten des Mockups
// ---------------------------------------------------------------------

/** Ermuedung (Recovery). `daten`: `{ id, fatigue }` — 0..100. */
export function ErmuedungsKarte({
  daten, ...rest
}: { daten: Array<{ id: string; fatigue: number }> } & Omit<KoerperkarteProps, 'muskeln' | 'legende'>) {
  const muskeln = daten.map(d => {
    const [color, opacity] = ermuedungsFarbe(d.fatigue)
    return { id: d.id, color, opacity }
  })
  return (
    <Koerperkarte
      {...rest}
      muskeln={muskeln}
      legende={[
        { color: 'var(--pos)', opacity: 0.75, label: 'Ready (≤25%)' },
        { color: 'var(--warn)', opacity: 0.80, label: 'Caution (26–60%)' },
        { color: 'var(--neg)', opacity: 0.85, label: 'Rest (>60%)' },
      ]}
    />
  )
}

/** Aktivierung (Training). `daten`: `{ id, intensity }` — Stufe 1..4. */
export function AktivierungsKarte({
  daten, ...rest
}: { daten: Array<{ id: string; intensity: number }> } & Omit<KoerperkarteProps, 'muskeln' | 'legende'>) {
  const muskeln = daten.map(d => {
    const [color, opacity] = aktivierungsFarbe(d.intensity)
    return { id: d.id, color, opacity }
  })
  return (
    <Koerperkarte
      {...rest}
      muskeln={muskeln}
      legende={[1, 2, 3, 4].map((s, i) => ({
        color: aktivierungsFarbe(s)[0],
        opacity: 0.8,
        label: ['Leicht', 'Mittel', 'Hoch', 'Sehr hoch'][i],
      }))}
    />
  )
}

/**
 * Injektionspunkte (Supplements).
 * `daten`: `{ id, daysSince, isNext? }` — `id` aus `INJEKTIONS_ORTE`.
 */
export function InjektionsKarte({
  daten, ...rest
}: {
  daten: Array<{ id: string; daysSince?: number; isNext?: boolean; label?: string }>
} & Omit<KoerperkarteProps, 'punkte' | 'legende' | 'figurDimmen'>) {
  const punkte: KoerperPunkt[] = daten.flatMap(d => {
    const ort = INJEKTIONS_ORTE[d.id]
    if (!ort) return []
    const tage = d.daysSince ?? 999
    return [{
      id: d.id,
      side: ort.side,
      xPct: ort.xPct,
      yPct: ort.yPct,
      color: injektionsFarbe(tage),
      label: d.label ?? ort.label,
      badge: tage < 999 ? `${tage}d` : null,
      pulse: d.isNext === true,
      size: 18,
      typ: 'injection',
    }]
  })
  return (
    <Koerperkarte
      {...rest}
      punkte={punkte}
      figurDimmen
      legende={[
        { color: 'var(--pos)', label: '>14d' },
        { color: 'var(--warn)', label: '7–14d' },
        { color: 'var(--acc-nutri)', label: '3–7d' },
        { color: 'var(--neg)', label: '<3d' },
        { color: 'var(--fg-dim)', label: 'nie' },
      ]}
    />
  )
}

export { INJEKTIONS_ORTE }
