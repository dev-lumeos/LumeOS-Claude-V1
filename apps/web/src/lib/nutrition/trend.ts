// ════════════════════════════════════════════════════════════════════
// DER TREND — G-249
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg, kein
// `next/headers` — A-30.
//
// **Tom, 2026-08-28:** *,,haesslich und nicht was ein bodybuilder
// sehen muss. es geht um trends und nicht einzelne tagesbalken.
// selbst wenn mal tage fehlen kann man einen trend darstellen."*
//
// ══ DREI REGELN AUS DER FACHLITERATUR ═══════════════════════════════
//
// **1 · Linie statt Balken.** `[read]` Balken vergleichen Kategorien,
// Linien zeigen Verlaeufe ueber die Zeit. **Die Balkenform aus G-247
// kam aus einem richtigen Gedanken** — ein fehlender Tag ist keine
// Null — **loest sich aber besser: ein gleitender Mittelwert
// ueberbrueckt Luecken, ohne sie zu erfinden.**
//
// **2 · Nicht bei Null beginnen.** `[read]` Eine Nullbasis drueckt
// echte Schwankungen zu einer flachen Linie. `[cmd]` Vitamin A
// schwankt auf dev zwischen 9,6 und 5.865 µg — mit Nullbasis liegen
// zehn von zwoelf Tagen im untersten Zehntel des Bildes.
//
// **3 · Gleiche Achsenskalierung ueber alle Zeilen einer Gruppe.**
// `[read]` Sonst sehen ungleiche Aenderungen gleich aus. **Hier
// anders geloest als in der Literatur ueblich:** die Naehrstoffe
// einer Gruppe haben voellig verschiedene Groessenordnungen (µg gegen
// g). **Deshalb wird nicht die absolute Achse geteilt, sondern die
// RELATIVE — jede Zeile skaliert auf ihr eigenes Ziel**, und damit
// bedeutet dieselbe Hoehe in jeder Zeile dasselbe: „am Ziel".
//
// ══ WAS EIN BODYBUILDER SEHEN MUSS ══════════════════════════════════
//
// `[read]` **Nicht der einzelne Tag, sondern ob es steigt, faellt
// oder steht** — und wo es gegenueber Ziel und Obergrenze liegt.
// **Zwei Formen, die zusammenpassen:** eine Sparkline fuer die
// Trendform, ein Bullet-Balken fuer Wert gegen Ziel gegen Obergrenze.

/** Ein Tageswert, wie ihn `daily_nutrient_summary_long` liefert. */
export type Tagespunkt = {
  tag: string
  wert: number | null
}

/**
 * Der gleitende Mittelwert.
 *
 * `[read]` **Er ueberbrueckt Luecken, ohne sie zu erfinden:** ein Tag
 * ohne Wert bekommt keinen eigenen Punkt, aber die Linie laeuft
 * ueber ihn hinweg, weil sie aus den umliegenden Tagen mit Wert
 * gebildet wird. **Ein interpolierter Tageswert waere eine
 * Behauptung; ein Mittelwert ueber die Nachbarn ist eine Aussage
 * ueber den Zeitraum.**
 *
 * `[read]` **Die Fensterbreite waechst mit dem Zeitraum**, sonst
 * zappelt die 90-Tage-Linie genauso wie die 7-Tage-Linie.
 */
export function fensterbreite(zeitraum: number): number {
  if (zeitraum <= 7) return 3
  if (zeitraum <= 30) return 7
  return 14
}

export function gleitend(
  punkte: readonly Tagespunkt[], breite: number,
): Array<{ tag: string; wert: number | null }> {
  const halb = Math.floor(breite / 2)
  return punkte.map((p, i) => {
    let summe = 0
    let n = 0
    for (let j = Math.max(0, i - halb); j <= Math.min(punkte.length - 1, i + halb); j++) {
      const w = punkte[j].wert
      if (w !== null) { summe += w; n += 1 }
    }
    return { tag: p.tag, wert: n > 0 ? summe / n : null }
  })
}

/**
 * Die Richtung des Trends.
 *
 * `[read]` **Erste gegen zweite Haelfte**, nicht erster gegen letzter
 * Punkt — ein einzelner Ausreisser am Rand wuerde die Richtung sonst
 * umdrehen.
 *
 * `[read]` **Die 5-Prozent-Schwelle ist keine Bewertung**, sondern
 * die Grenze, unterhalb derer eine Aenderung im Rauschen liegt. Wer
 * sie enger zieht, meldet jeden Tag eine neue Richtung.
 */
export type Richtung = 'steigt' | 'faellt' | 'steht' | 'unbekannt'

export const RICHTUNG_SCHWELLE = 0.05

export function richtungVon(punkte: readonly Tagespunkt[]): Richtung {
  const mit = punkte.filter(p => p.wert !== null)
  if (mit.length < 4) return 'unbekannt'
  const mitte = Math.floor(mit.length / 2)
  const schnitt = (von: number, bis: number) => {
    let s = 0
    for (let i = von; i < bis; i++) s += mit[i].wert as number
    return s / (bis - von)
  }
  const a = schnitt(0, mitte)
  const b = schnitt(mitte, mit.length)
  if (a === 0) return b === 0 ? 'steht' : 'steigt'
  const aenderung = (b - a) / a
  if (Math.abs(aenderung) < RICHTUNG_SCHWELLE) return 'steht'
  return aenderung > 0 ? 'steigt' : 'faellt'
}

export const RICHTUNG_TEXT: Record<Richtung, string> = {
  steigt: 'steigt', faellt: 'fällt', steht: 'gleichbleibend',
  unbekannt: 'zu wenige Tage',
}

export const RICHTUNG_ZEICHEN: Record<Richtung, string> = {
  steigt: '↗', faellt: '↘', steht: '→', unbekannt: '·',
}

// ── Die Sparkline ────────────────────────────────────────────────

/**
 * Die Punkte einer Sparkline als SVG-Pfad.
 *
 * `[read]` **Regel 2: die Achse beginnt nicht bei Null**, sondern am
 * kleinsten dargestellten Wert. **Ausnahme: liegt das Ziel im Bild,
 * gehoert es hinein** — sonst zeigt die Linie eine Bewegung ohne
 * Bezug.
 *
 * `[read]` **Luecken zerschneiden den Pfad nicht**, weil die
 * gleitende Linie sie ueberbrueckt. Bleibt ein Rand ohne Wert
 * (weniger als ein halbes Fenster Nachbarn), faengt der Pfad
 * spaeter an.
 */
export function sparklinePfad(
  punkte: ReadonlyArray<{ tag: string; wert: number | null }>,
  breite: number, hoehe: number, bezug: number | null,
): string {
  const mit = punkte.filter(p => p.wert !== null)
  if (mit.length < 2) return ''

  let min = Math.min(...mit.map(p => p.wert as number))
  let max = Math.max(...mit.map(p => p.wert as number))
  if (bezug !== null && bezug > 0) {
    min = Math.min(min, bezug)
    max = Math.max(max, bezug)
  }
  // Eine flache Linie braucht trotzdem Hoehe, sonst teilt sie durch 0.
  if (max - min < 1e-9) { min -= 1; max += 1 }
  const spanne = max - min
  // `[read]` 8 % Luft, damit die Linie nicht am Rand klebt.
  const rand = hoehe * 0.08

  const teile: string[] = []
  let offen = false
  punkte.forEach((p, i) => {
    if (p.wert === null) { offen = false; return }
    const x = punkte.length === 1 ? 0 : (i / (punkte.length - 1)) * breite
    const y = hoehe - rand - ((p.wert - min) / spanne) * (hoehe - 2 * rand)
    teile.push(`${offen ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`)
    offen = true
  })
  return teile.join(' ')
}

/** Wo die Ziellinie im Sparkline-Bild liegt — oder `null`. */
export function bezugsY(
  punkte: ReadonlyArray<{ wert: number | null }>,
  hoehe: number, bezug: number | null,
): number | null {
  if (bezug === null || bezug <= 0) return null
  const mit = punkte.filter(p => p.wert !== null).map(p => p.wert as number)
  if (mit.length < 2) return null
  const min = Math.min(...mit, bezug)
  const max = Math.max(...mit, bezug)
  if (max - min < 1e-9) return hoehe / 2
  const rand = hoehe * 0.08
  return hoehe - rand - ((bezug - min) / (max - min)) * (hoehe - 2 * rand)
}

// ── Der Bullet-Balken ────────────────────────────────────────────

/**
 * Wert gegen Ziel gegen Obergrenze, auf einer Skala.
 *
 * `[read]` **Regel 3 in ihrer brauchbaren Form:** die Skala ist
 * relativ zum Ziel, nicht absolut. **Damit heisst dieselbe Position
 * in jeder Zeile dasselbe** — bei Vitamin A in µg genauso wie bei
 * Protein in g.
 *
 * `[cmd]` **Die Skala endet bei 100 % des Ziels, der Obergrenze oder
 * dem Wert — je nachdem, was groesser ist.** Ein Wert ueber der
 * Obergrenze darf nicht aus dem Bild laufen.
 */
export type Bullet = {
  /** Anteil der Skala, 0..1. */
  wert: number
  ziel: number | null
  obergrenze: number | null
  /** Der groesste dargestellte Absolutwert — fuer die Beschriftung. */
  skalaMax: number
}

export function bulletVon(
  wert: number | null, ziel: number | null, obergrenze: number | null,
): Bullet | null {
  if (wert === null) return null
  const kandidaten = [wert, ziel ?? 0, obergrenze ?? 0].filter(x => x > 0)
  if (kandidaten.length === 0) return null
  // `[read]` **Die Skala kommt aus dem groessten der drei Werte** —
  // damit kann kein Anteil ueber 1/1,05 = 0,952 steigen. `[cmd]` Ein
  // `Math.min(1, …)` stand hier und war nachweislich toter Code: bei
  // 5.000 wie bei 99.999 ergibt sich derselbe Anteil 0,9524
  // (gemessen 2026-08-29). **Ein Deckel, der nie greift, taeuscht
  // eine Absicherung vor, die es nicht braucht.**
  const max = Math.max(...kandidaten) * 1.05
  return {
    wert: wert / max,
    ziel: ziel !== null && ziel > 0 ? ziel / max : null,
    obergrenze: obergrenze !== null && obergrenze > 0 ? obergrenze / max : null,
    skalaMax: max,
  }
}

/**
 * Ob der Trend ueberhaupt gezeigt wird.
 *
 * `[read]` **Ein Tag hat keinen Trend** — der Auftrag sagt es, und
 * eine Sparkline aus einem Punkt waere ein Strich ohne Aussage.
 */
export function zeigtTrend(zeitraum: number): boolean {
  return zeitraum > 1
}
