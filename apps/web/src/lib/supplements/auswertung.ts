// Aus Positionen und Einnahmen werden die Kachelzahlen (G-74).
//
// **Reine Rechnung** — ohne Datenbank und ohne React, damit sie
// pruefbar bleibt. Dasselbe Muster wie `lib/training/auswertung.ts`
// (G-69) und `lib/medical/reihe.ts` (G-60).
//
// **KEINE BEWERTUNG.** `[read]` Es wird gezaehlt und geteilt; es gibt
// keine Note dafuer, ob jemand seine Praeparate zuverlaessig nimmt.

// **NUR TYPEN aus `stack-read`.** `[cmd]` Die Datei importiert
// `next/headers`; ein Wert-Import von dort zoege sie in das
// Browserbuendel und die Seite antwortete mit HTTP 500
// („You're importing a component that needs next/headers"). Gemessen
// beim Bau von G-74. **Die Rechnung selbst steht deshalb hier**, nicht
// im I/O-Modul.
import type { EinnahmeZeile, StackPosition } from './stack-read'

/**
 * Die drei Nachfuellstufen — aus der **Reichweite**, nicht je Position.
 *
 * `[read]` Toms Entscheidung zu G-74: *„‚4 d left' sagt mehr als ‚unter
 * 7 Stueck'"* — und eine Schwelle je Position muesste gepflegt werden.
 *
 * | Reichweite | Stufe |
 * |---|---|
 * | ≤ 7 Tage  | `dringend` — bestellen |
 * | ≤ 14 Tage | `warnung` — bestellen |
 * | ≤ 30 Tage | `hinweis` |
 *
 * `[cmd]` **`low_stock_threshold` bleibt der Rueckfall**, wo keine
 * Tagesdosis bekannt ist: ohne `serving_size` oder ohne passende
 * Einheit gibt es keine Reichweite, aber die Schwelle steht in der
 * Tabelle.
 */
export type Nachfuellstufe = 'dringend' | 'warnung' | 'hinweis' | null

export function nachfuellstufe(
  tageBisLeer: number | null,
  unterSchwelle: boolean | null,
): Nachfuellstufe {
  if (tageBisLeer != null) {
    if (tageBisLeer <= 7) return 'dringend'
    if (tageBisLeer <= 14) return 'warnung'
    if (tageBisLeer <= 30) return 'hinweis'
    return null
  }
  // Rueckfall: ohne Reichweite entscheidet die gepflegte Schwelle. Sie
  // kennt keine Abstufung, deshalb die mittlere — eine Warnung ist
  // richtiger als ein Hinweis, wenn man nicht weiss, wie knapp es ist.
  return unterSchwelle ? 'warnung' : null
}

// ── Nachfuellen ─────────────────────────────────────────────────

export type Nachfuellzeile = {
  position: StackPosition
  tage: number | null
  stufe: Nachfuellstufe
}

/**
 * Die Positionen mit ihrer Nachfuellstufe, knappste zuerst.
 *
 * `[read]` Toms Entscheidung zu G-74: die Stufe kommt aus der
 * **Reichweite**, nicht aus einer Schwelle je Position — *„‚4 d left'
 * sagt mehr als ‚unter 7 Stueck'"*.
 */
export function nachfuellliste(positionen: StackPosition[]): Nachfuellzeile[] {
  return positionen
    .filter(p => p.is_active)
    .map(p => ({
      position: p,
      tage: p.tage_bis_leer,
      stufe: nachfuellstufe(p.tage_bis_leer, p.unter_schwelle),
    }))
    .sort((a, b) => {
      // Ohne Reichweite ans Ende — nicht als „reicht ewig" oben.
      if (a.tage == null && b.tage == null) return 0
      if (a.tage == null) return 1
      if (b.tage == null) return -1
      return a.tage - b.tage
    })
}

/** Wie viele Positionen je Stufe. Fuer die Kopfzahlen. */
export function stufenZaehlung(zeilen: Nachfuellzeile[]): {
  dringend: number; warnung: number; hinweis: number; ok: number
} {
  return {
    dringend: zeilen.filter(z => z.stufe === 'dringend').length,
    warnung: zeilen.filter(z => z.stufe === 'warnung').length,
    hinweis: zeilen.filter(z => z.stufe === 'hinweis').length,
    ok: zeilen.filter(z => z.stufe === null).length,
  }
}

/**
 * Was ein Nachkauf kostet, der alle knappen Positionen auf 90 Tage
 * bringt.
 *
 * `[cmd]` Die Vorlage rechnet `cost_per_serving × 90` je knapper
 * Position („3-month resupply"). Uebernommen — aber nur fuer
 * Positionen, die einen Preis fuehren; ohne Preis kommt `null` heraus
 * statt einer zu niedrigen Summe.
 */
export function nachkaufwert(zeilen: Nachfuellzeile[], tage = 90): number | null {
  const knapp = zeilen.filter(z => z.stufe !== null)
  if (knapp.length === 0) return 0
  let summe = 0
  for (const z of knapp) {
    const proTag = z.position.kosten_pro_tag
    if (proTag == null) return null
    summe += proTag * tage
  }
  return summe
}

// ── Compliance ──────────────────────────────────────────────────

export type ComplianceZeile = {
  name: string
  stack_item_id: string | null
  geplant: number
  genommen: number
  ausgelassen: number
  quote: number | null
  /** Die letzten `n` Tage als Zustandsreihe, alt → neu. */
  streifen: Array<'taken' | 'skipped' | 'planned' | 'leer'>
  /** Datum des letzten Auslassers, `null` wenn keiner. */
  letzter_auslasser: string | null
}

/** `YYYY-MM-DD` um `tage` zurueck. Mittag als Anker (wie `lib/datum.ts`). */
export function minusTage(datum: string, tage: number): string {
  const d = new Date(`${datum}T12:00:00`)
  if (Number.isNaN(d.getTime())) return datum
  d.setDate(d.getDate() - tage)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const t = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${t}`
}

/**
 * Die Gesamtquote ueber einen Zeitraum.
 *
 * `[cmd]` **Gezaehlt wird `taken` gegen alle erfassten Zeilen.** Auf
 * `dev@lumeos.app` sind das ueber 30 Tage 116 Zeilen, davon 108
 * genommen — **93,1 %**.
 *
 * `[read]` Der Auftragstext nennt 93,3 %; die Zahl wandert mit dem
 * Fenster, weil der Bestand bei 2026-08-19 endet. **Gemeldet, nicht
 * angeglichen** — eine Anzeige, die eine Zahl festhaelt, damit sie zum
 * Auftrag passt, waere die falsche Richtung.
 */
export function gesamtquote(
  einnahmen: EinnahmeZeile[], bis: string, tage = 30,
): { geplant: number; genommen: number; ausgelassen: number; quote: number | null } {
  const von = minusTage(bis, tage - 1)
  const im = einnahmen.filter(e => e.intake_date >= von && e.intake_date <= bis)
  const genommen = im.filter(e => e.status === 'taken').length
  const ausgelassen = im.filter(e => e.status === 'skipped').length
  return {
    geplant: im.length,
    genommen,
    ausgelassen,
    quote: im.length > 0 ? Math.round((genommen / im.length) * 1000) / 10 : null,
  }
}

/**
 * Die Compliance je Praeparat.
 *
 * `[cmd]` Gruppiert nach `supplement_name_snapshot` — **nicht nach
 * `stack_item_id`**: der Fremdschluessel ist `ON DELETE SET NULL`, ein
 * Eintrag kann seine Position also ueberleben. Wer nach der Id
 * gruppiert, verliert diese Zeilen stillschweigend.
 */
export function complianceJePraeparat(
  einnahmen: EinnahmeZeile[], bis: string, tage = 30,
): ComplianceZeile[] {
  const von = minusTage(bis, tage - 1)
  const im = einnahmen.filter(e => e.intake_date >= von && e.intake_date <= bis)

  const gruppen = new Map<string, EinnahmeZeile[]>()
  for (const e of im) {
    const k = e.supplement_name_snapshot
    const liste = gruppen.get(k)
    if (liste) liste.push(e)
    else gruppen.set(k, [e])
  }

  // Die Tagesachse einmal bauen, damit alle Streifen gleich lang sind.
  const achse: string[] = []
  for (let i = tage - 1; i >= 0; i -= 1) achse.push(minusTage(bis, i))

  const raus: ComplianceZeile[] = []
  for (const [name, zeilen] of Array.from(gruppen.entries())) {
    const jeTag = new Map<string, EinnahmeZeile>()
    for (const z of zeilen) jeTag.set(z.intake_date, z)

    const genommen = zeilen.filter(z => z.status === 'taken').length
    const ausgelassen = zeilen.filter(z => z.status === 'skipped').length
    const auslasser = zeilen
      .filter(z => z.status === 'skipped')
      .map(z => z.intake_date)
      .sort()

    raus.push({
      name,
      stack_item_id: zeilen[0]?.stack_item_id ?? null,
      geplant: zeilen.length,
      genommen,
      ausgelassen,
      quote: zeilen.length > 0 ? Math.round((genommen / zeilen.length) * 1000) / 10 : null,
      streifen: achse.map(t => {
        const e = jeTag.get(t)
        if (!e) return 'leer'
        if (e.status === 'taken') return 'taken'
        if (e.status === 'skipped') return 'skipped'
        return 'planned'
      }),
      letzter_auslasser: auslasser.length ? auslasser[auslasser.length - 1] : null,
    })
  }
  return raus.sort((a, b) => (a.quote ?? 0) - (b.quote ?? 0) || a.name.localeCompare(b.name))
}

/**
 * Die Tagesquoten fuer die Heatmap.
 *
 * `[cmd]` Die Vorlage zeichnet 13 Wochen × 7 Tage mit einem
 * Zufallsgeber. Hier kommt je Tag die echte Quote — und **Tage ohne
 * Eintrag bleiben leer**, statt als 0 % zu erscheinen: „nichts
 * erfasst" und „nichts genommen" sind zwei verschiedene Aussagen.
 */
export function tagesquoten(
  einnahmen: EinnahmeZeile[], bis: string, tage = 90,
): Array<{ datum: string; quote: number | null; genommen: number; gesamt: number }> {
  const jeTag = new Map<string, { genommen: number; gesamt: number }>()
  for (const e of einnahmen) {
    const v = jeTag.get(e.intake_date) ?? { genommen: 0, gesamt: 0 }
    v.gesamt += 1
    if (e.status === 'taken') v.genommen += 1
    jeTag.set(e.intake_date, v)
  }

  const raus: Array<{ datum: string; quote: number | null; genommen: number; gesamt: number }> = []
  for (let i = tage - 1; i >= 0; i -= 1) {
    const datum = minusTage(bis, i)
    const v = jeTag.get(datum)
    raus.push({
      datum,
      quote: v && v.gesamt > 0 ? (v.genommen / v.gesamt) * 100 : null,
      genommen: v?.genommen ?? 0,
      gesamt: v?.gesamt ?? 0,
    })
  }
  return raus
}

// ── Kosten ──────────────────────────────────────────────────────

/**
 * Monatspunkte fuer den Kostenverlauf.
 *
 * `[read]` Der Auftrag: *„3 ehrliche Monatspunkte statt 12. Die Daten
 * reichen 90 Tage zurueck, also drei Monate. Zwoelf zu zeigen waere
 * erfunden."*
 *
 * `[cmd]` Gerechnet wird aus den **tatsaechlich genommenen** Einnahmen
 * je Monat mal dem Tagespreis der Position — nicht aus dem Monatspreis
 * mal zwoelf. Ein ausgelassener Tag kostet nichts.
 *
 * `[cmd]` Der erste und der letzte Monat sind **angeschnitten** (der
 * Bestand beginnt am 22.05. und endet am 19.08.). Das Feld `vollstaendig`
 * sagt es, damit die Anzeige den Punkt nicht als Monatssumme ausgibt.
 */
export function kostenJeMonat(
  einnahmen: EinnahmeZeile[],
  preisJeName: Map<string, number>,
): Array<{ monat: string; kosten: number; tage: number; vollstaendig: boolean }> {
  const jeMonat = new Map<string, { kosten: number; tage: Set<string> }>()
  for (const e of einnahmen) {
    if (e.status !== 'taken') continue
    const preis = preisJeName.get(e.supplement_name_snapshot)
    if (preis == null) continue
    const m = e.intake_date.slice(0, 7)
    const v = jeMonat.get(m) ?? { kosten: 0, tage: new Set<string>() }
    v.kosten += preis
    v.tage.add(e.intake_date)
    jeMonat.set(m, v)
  }

  const monate = Array.from(jeMonat.keys()).sort()
  return monate.map((m, i) => {
    const v = jeMonat.get(m)!
    // Angeschnitten ist, was am Rand liegt — der erste und der letzte.
    const rand = i === 0 || i === monate.length - 1
    const tageImMonat = new Date(
      Number(m.slice(0, 4)), Number(m.slice(5, 7)), 0).getDate()
    return {
      monat: m,
      kosten: Math.round(v.kosten * 100) / 100,
      tage: v.tage.size,
      vollstaendig: !rand && v.tage.size >= tageImMonat - 2,
    }
  })
}

/**
 * „If you removed…" — was der Stack ohne eine Position kostet.
 *
 * `[read]` Der Auftrag: *„reine Subtraktion, baubar."* Genau das —
 * keine Wirksamkeitsabwaegung, keine Empfehlung. `Cost optimization`
 * bleibt draussen, weil es Beratung waere.
 */
export function ohnePosition(
  positionen: StackPosition[],
): Array<{ name: string; monat_ohne: number; ersparnis: number; anteil_pct: number }> {
  const aktive = positionen.filter(p => p.is_active && p.kosten_pro_tag != null)
  const gesamtTag = aktive.reduce((s, p) => s + (p.kosten_pro_tag ?? 0), 0)
  if (gesamtTag <= 0) return []

  return aktive
    .map(p => {
      const eigen = (p.kosten_pro_tag ?? 0) * 30
      const gesamt = gesamtTag * 30
      return {
        name: p.name,
        monat_ohne: Math.round((gesamt - eigen) * 100) / 100,
        ersparnis: Math.round(eigen * 100) / 100,
        anteil_pct: Math.round((eigen / gesamt) * 1000) / 10,
      }
    })
    .sort((a, b) => b.ersparnis - a.ersparnis)
}
