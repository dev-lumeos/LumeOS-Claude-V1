'use client'

// Die Abschnitte des Substanzdetails (G-179, Spezifikation §9).
//
// ── DIE DRITTE REGEL BESTIMMT DEN AUFBAU ────────────────────────────
//
// `[read]` **Kein Block ohne Inhalt.** Jede Komponente hier gibt
// `null` zurueck, wenn ihr Feld leer ist — sie zeigt keinen Titel,
// keinen Strich und keine leere Flaeche.
//
// `[cmd]` **Das ist der Normalfall, nicht die Ausnahme:** gemessen am
// 2026-08-25 ist `zu_wenig_de` bei **241 von 290** leer, `mythen_de`
// bei 30. Bei den drei Kacheln ist es noch deutlicher — eine belegte
// Dosis haben **83 von 318**, eine Obergrenze **38**.
//
// `[read]` **Deshalb steht die Leerprüfung in der Komponente und nicht
// beim Aufrufer.** Wer einen Abschnitt einbaut, bekommt das Verhalten
// mit; wer es beim Aufrufer prueft, vergisst es beim naechsten.
import * as React from 'react'
import { tonFuer } from '../../../lib/supplements/block-ton'
import { Card, Pill } from '@lumeos/ui'

import type { Nutzertexte, Unterform, Frage } from '../../../lib/supplements/substanz-read'

/** Ist an dem Text etwas dran? Leerraum zaehlt nicht. */
function da(v: string | null | undefined): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

/**
 * Ein Textfeld, das auch eine als Text gespeicherte Liste sein kann.
 *
 * `[cmd]` **Gemessen am 2026-08-25 nach dem C-264-Import: 127 von 290
 * `mythen_de` beginnen mit `[`** — es ist ein JSON-Array, das als Text
 * in einer `text`-Spalte liegt. **133 sind normaler Fliesstext.**
 * Andere Felder sind nicht betroffen (`kurz_was_de`, `zu_viel_de`,
 * `wie_wirkt_de` … je 0).
 *
 * `[read]` **Ohne diesen Schritt stand im Fenster
 * `["Mythos: '1-Testosteron ist nur ein Prohormon.' …"]`** — mit
 * Klammern und Anfuehrungszeichen, so gesehen bei 1-Testosterone.
 *
 * `[read]` **Die Texte werden nicht geaendert** — das ist nicht mein
 * Auftrag. Die Anzeige liest beide Gestalten, und wenn der Import die
 * Spalte spaeter vereinheitlicht, bleibt sie richtig.
 */
export type Absatz = { text: string; korrektur?: string }

/**
 * Ein Eintrag aus dem Array — Zeichenkette ODER Objekt.
 *
 * `[cmd]` **G-182: die dritte Gestalt.** G-180 las Zeichenkette und
 * Array, **aber nicht das Array aus Objekten** — und `String({…})`
 * ergibt `[object Object]`. Gemessen am 2026-08-25: **50 der 260
 * gefuellten `mythen_de` sind Arrays AUS OBJEKTEN**, je mit
 * `mythos_de` und `korrektur_de`.
 *
 * `[read]` **Mythos und Korrektur bleiben getrennt**, statt zu einem
 * Satz verklebt zu werden: die Korrektur ist die Aussage, der Mythos
 * nur ihr Anlass.
 */
function einEintrag(e: unknown): Absatz | null {
  if (typeof e === 'string') {
    const s = e.trim()
    if (!s) return null
    // ── G-182 Punkt 6b ────────────────────────────────────────────
    //
    // `[cmd]` **Gemessen 2026-08-25: 30 Eintraege beginnen mit
    // `Mythos:`** und trennen die Korrektur mit einem Gedankenstrich.
    // **Keine Ueberschneidung mit den 50 Objekt-Arrays** — dort steht
    // dasselbe schon in zwei Feldern.
    //
    // `[read]` **Das ist keine eigene Zerlegungsregel**, sondern die
    // Formatierung eines Eintrags, den das Array ohnehin liefert.
    // `[\s\S]` statt des `s`-Flags — das Ziel ist unter es2018.
    const m = s.match(/^Mythos:\s*([\s\S]+?)\s+[–—-]\s+([\s\S]+)$/)
    if (m) {
      // `[cmd]` **G-183: die Anfuehrungszeichen stehen schon im Text.**
      // Gemessen 2026-08-25 an Retatrutid: *„Mythos: „24 Prozent …
      // bewiesen." – Die Zahl stammt …"*. Die Anzeige setzte ein
      // zweites Paar darum und zeigte `„…""`. **Hier werden sie
      // abgeraeumt; das Paar setzt die Anzeige.**
      const roh = m[1].trim().replace(/^[„“"'»]+/, '').replace(/[„“”"'«»]+$/, '')
      return { text: roh, korrektur: m[2].trim() }
    }
    return { text: s }
  }
  if (e && typeof e === 'object') {
    const o = e as Record<string, unknown>
    const nimm = (...schluessel: string[]): string | null => {
      for (const k of schluessel) {
        const w = o[k]
        if (typeof w === 'string' && w.trim()) return w.trim()
      }
      return null
    }
    const roh = nimm('mythos_de', 'mythos_en', 'mythos', 'myth', 'text',
      'behauptung', 'claim')
    // G-183: eigene Anfuehrungszeichen abraeumen — das Paar setzt die
    // Anzeige, sonst stehen zwei.
    const mythos = roh
      ? roh.replace(/^[„“"'»]+/, '').replace(/[„“”"'«»]+$/, '').trim() || roh
      : null
    const korrektur = nimm('korrektur_de', 'korrektur_en', 'korrektur',
      'correction', 'fakt', 'fact')
    if (mythos) return korrektur ? { text: mythos, korrektur } : { text: mythos }
    // `[read]` Kein bekannter Schluessel: lieber die erste
    // Zeichenkette zeigen als `[object Object]`.
    for (const w of Object.values(o)) {
      if (typeof w === 'string' && w.trim()) return { text: w.trim() }
    }
    return null
  }
  return null
}

/**
 * Ein Textfeld in seine Absaetze zerlegen — alle drei Gestalten.
 *
 * `[cmd]` Gemessen 2026-08-25 ueber `mythen_de`: **133 Fliesstext ·
 * 77 Array aus Zeichenketten · 50 Array aus Objekten.**
 */
function alsAbsaetze(v: string | null | undefined): Absatz[] {
  if (!da(v)) return []
  const roh = v.trim()
  if (roh.startsWith('[')) {
    try {
      const liste = JSON.parse(roh) as unknown
      if (Array.isArray(liste)) {
        // `[read]` **Gueltiges JSON-Array: sein Ergebnis gilt, auch
        // wenn es leer ist.** Sonst faellt die Anzeige auf den rohen
        // Text zurueck und zeigt `[{"zahl":5}]` — schlimmer als
        // nichts. Gegengeprobt: der Test „Objekte ganz ohne Text"
        // schlug hier zuerst fehl.
        return liste.map(einEintrag).filter(Boolean) as Absatz[]
      }
    } catch {
      // Kein gueltiges JSON — dann ist es eben Text mit Klammer.
    }
  }
  return [{ text: roh }]
}

/**
 * Einen Absatz in seine Aussagen zerlegen (G-183).
 *
 * ══ WO DIE REGEL GREIFT, UND WO NICHT ══════════════════════════════
 *
 * **Tom, 2026-08-25** zum 6-OXO-Absatz: *„so schreibt und liest kein
 * mensch."*
 *
 * `[read]` **Getrennt wird an Satzgrenzen und nach Semikolon — NIE am
 * Doppelpunkt.** Ein Doppelpunkt steht mitten im Satz:
 * *„WADA-Kategorie S2: jederzeit verboten"* ist eine Zeile, keine
 * zwei. `[cmd]` **5 Texte tragen dieses Muster, 2 Teile enthalten
 * einen Doppelpunkt und bleiben ganz** (gemessen 2026-08-25).
 *
 * `[cmd]` **Die Regel wurde vor dem Bau gemessen**, bezogen auf die
 * GEFUELLTEN Felder:
 *
 *     rechtslage_klartext_de   135 von 136   99 %
 *     ueberwachung_de           63 von  96   66 %
 *     nicht_im_blut_de          67 von 134   50 %
 *     reinheit_de              118 von 134   88 %
 *     irreversibel_de           90 von 112   80 %
 *
 * `[read]` **Die 99 % sind nicht eine zu weite Regel, sondern ein
 * durchweg gegliederter Bestand.** Die Obergrenze von 90 % sollte
 * verhindern, dass ein Absatz zerhackt wird; hier ist jeder Teil eine
 * vollstaendige Aussage, und kein Feld zerfaellt in mehr als fuenf.
 *
 * `[read]` **Wo die Regel nicht greift, bleibt der Absatz stehen** —
 * `Stanozolol` traegt einen Doppelpunkt und bleibt eine Zeile.
 */
export function inAussagen(text: string): string[] {
  const roh = text.trim()
  if (!roh) return []
  // Ein Trennpunkt liegt NACH `.` `;` `!` `?` und VOR Leerraum plus
  // Grossbuchstabe. `[read]` Der Grossbuchstabe schuetzt den Fall
  // „21 USC 333(e); in Thailand …" — dort folgt Kleinschreibung.
  //
  // `[cmd]` **Der Grossbuchstabe allein genuegt aber nicht:** „z. B."
  // zerfiel in „z." und „B. 5 mg" — mein eigener Test hat es
  // gefunden. Im Bestand kommt das einmal vor
  // (`rechtslage_klartext_de`), also selten und trotzdem falsch.
  // Deshalb die gaengigen deutschen Abkuerzungen ausnehmen.
  // `[read]` Eine Abkuerzung endet auf einen Punkt, aber der Satz
  // nicht: „z. B.", „u. a.", „ca.". Einzelne Buchstaben deckt
  // `[a-zA-ZäöüÄÖÜ]\.` ab.
  const ABK = /(?:\b[a-zA-ZäöüÄÖÜ]\.|\bca\.|\bvgl\.|\bNr\.|\bSt\.|\bbzw\.|\bevtl\.|\binkl\.|\bmax\.|\bmin\.|\bggf\.|\bsog\.)$/

  const teile: string[] = []
  let anfang = 0
  // Ueber alle Trennstellen laufen und jede einzeln beurteilen —
  // das ist lesbarer als eine Regex mit Ausnahmen darin.
  const suche = /[.;!?]\s+(?=[A-ZÄÖÜ])/g
  let m: RegExpExecArray | null
  while ((m = suche.exec(roh)) !== null) {
    const bisHier = roh.slice(anfang, m.index + 1)
    if (ABK.test(bisHier)) continue      // Abkuerzung: nicht trennen
    teile.push(bisHier.trim())
    anfang = m.index + m[0].length
  }
  const schluss = roh.slice(anfang).trim()
  if (schluss) teile.push(schluss)
  // `[read]` **Ein einzelner Teil ist keine Aufzaehlung** — dann steht
  // der Absatz da, wie er war. Das ergibt sich hier von selbst: ohne
  // Trennstelle laeuft die Schleife nie, und `schluss` ist der ganze
  // Text.
  //
  // `[cmd]` **Hier stand `teile.length > 1 ? teile : [roh]`** — ein
  // Rest der frueheren `split()`-Fassung. Die Negativprobe blieb
  // gruen, als ich ihn entfernte, **weil er nichts mehr tat**
  // (gegengeprobt 2026-08-25). Wer die Liste verhindern will, prueft
  // die Laenge beim Aufrufer; `AufgeteilterAbschnitt` tut genau das.
  return teile
}

/**
 * Ein Textabschnitt mit Ueberschrift — oder nichts.
 *
 * `[read]` Der Rueckgabewert `null` ist der ganze Sinn: React rendert
 * dann gar nichts, und im Fenster entsteht keine Luecke.
 */
/**
 * Eine Blockueberschrift — G-194.
 *
 * ══ WARUM SIE AN EINER STELLE STEHT ════════════════════════════════
 *
 * **Tom, 2026-08-26:** *„Die Farbe muss etwas BEDEUTEN, sonst ist es
 * Dekoration."* Und: *„dieselbe Bedeutung bekommt ueberall dieselbe
 * Farbe."*
 *
 * `[read]` **Genau das geht nur, wenn die Zuordnung EINMAL steht.**
 * Vorher setzte jeder Block seine Farbe selbst — `style={{ color:
 * 'var(--warn)' }}` an zwei Stellen, sonst gar nichts. So laufen
 * *„Reinheit"* im Ueberblick und *„Nicht im Blut nachweisbar"* in der
 * Sicherheit auseinander, obwohl sie dasselbe sagen.
 *
 * `[cmd]` **Die Bedeutung kommt aus `lib/supplements/block-ton.ts`,
 * das Token aus derselben Tabelle.** Wer eine Ueberschrift hinzufuegt,
 * traegt sie dort ein oder bekommt keine Farbe — geraten wird nicht.
 */
export function BlockTitel(
  { titel, stil }: { titel: string; stil?: React.CSSProperties },
) {
  const ton = tonFuer(titel)
  return (
    <div className="v2-eyebrow" data-ton={ton ?? undefined}
         style={{ marginBottom: 4, ...stil }}>
      {titel}
    </div>
  )
}

export function Abschnitt(
  { titel, text, ton }: { titel: string; text: string | null | undefined; ton?: 'warn' },
) {
  const absaetze = alsAbsaetze(text)
  if (absaetze.length === 0) return null
  return (
    <section style={{ marginBottom: 14 }}>
      <BlockTitel titel={titel} />
      {absaetze.map((a, i) => (
        <div key={a.text} style={{ marginTop: i === 0 ? 0 : 8 }}>
          <p style={{
            fontSize: 12.5, lineHeight: 1.62, margin: 0,
            color: ton === 'warn' ? 'var(--warn)' : undefined,
            // `[read]` G-182: Wo eine Korrektur folgt, ist der erste
            // Teil der MYTHOS — er wird gedaempft gesetzt, damit nicht
            // die Behauptung wie die Aussage aussieht.
            opacity: a.korrektur ? 0.72 : 1,
          }}>
            {a.korrektur ? `„${a.text}"` : a.text}
          </p>
          {a.korrektur && (
            <p style={{
              fontSize: 12.5, lineHeight: 1.62, margin: '3px 0 0',
              color: ton === 'warn' ? 'var(--warn)' : undefined,
            }}>
              {a.korrektur}
            </p>
          )}
        </div>
      ))}
    </section>
  )
}

/**
 * Nur die Aussagen — ohne Ueberschrift, fuer den Rumpf einer Kachel.
 *
 * `[read]` Ein Teil bleibt ein Absatz; mehrere werden eine Liste.
 */
export function Aussagen({ text }: { text: string | null | undefined }) {
  if (!da(text)) return null
  const teile = inAussagen(text)
  if (teile.length <= 1) return <p>{text}</p>
  return (
    <ul className="v2-supp-aussagen">
      {teile.map(t => <li key={t}>{t}</li>)}
    </ul>
  )
}

/**
 * Ein Abschnitt, dessen Absatz in seine Aussagen zerlegt wird (G-183).
 *
 * `[read]` **Wo die Zerlegung nur einen Teil ergibt, steht der Absatz
 * da wie zuvor** — eine Liste mit einem Punkt waere schlimmer als der
 * Absatz. Genau das ist bei `Stanozolol` der Fall (1 von 136).
 *
 * `[read]` **Die Zeile wird schlicht gesetzt, nicht mit Ortsmarke
 * links und Aussage rechts.** Der Auftrag laesst die Wahl; die
 * Ortsmarken sind uneinheitlich (*„In den USA"*, *„in Thailand"*,
 * *„Die WADA"*, *„Fuer Sportler"*), und eine erzwungene Spalte haette
 * bei jedem dritten Text eine leere Haelfte.
 */
export function AufgeteilterAbschnitt(
  { titel, text, ton }: { titel: string; text: string | null | undefined; ton?: 'warn' },
) {
  if (!da(text)) return null
  const teile = inAussagen(text)
  if (teile.length <= 1) {
    return <Abschnitt titel={titel} text={text} ton={ton} />
  }
  return (
    <section style={{ marginBottom: 14 }}>
      <BlockTitel titel={titel} />
      <ul className="v2-supp-aussagen">
        {teile.map(t => (
          <li key={t} style={{ color: ton === 'warn' ? 'var(--warn)' : undefined }}>
            {t}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Eine Stichpunktliste — oder nichts. */
export function Stichpunkte(
  { titel, punkte }: { titel: string; punkte: string[] | null | undefined },
) {
  const rein = (punkte ?? []).filter(da)
  if (rein.length === 0) return null
  return (
    <section style={{ marginBottom: 14 }}>
      <BlockTitel titel={titel} />
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {rein.map(p => (
          <li key={p} style={{ fontSize: 12.5, lineHeight: 1.6 }}>{p}</li>
        ))}
      </ul>
    </section>
  )
}

/** Die Zwecke als Chips (§9: „Zwecke — 2-4 Chips"). */
export function Zwecke({ punkte }: { punkte: string[] | null | undefined }) {
  const rein = (punkte ?? []).filter(da)
  if (rein.length === 0) return null
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
      {rein.map(p => <Pill key={p}>{p}</Pill>)}
    </div>
  )
}

/**
 * Die drei Kacheln: Uebliche Menge · Obergrenze · Einnahme.
 *
 * `[read]` **Zweite Regel aus §9: Zahlen stehen als Zahlen da**, nicht
 * im Fliesstext vergraben und ohne Klick erreichbar.
 *
 * `[cmd]` **Einzeln geprueft, nicht als Gruppe:** eine Substanz kann
 * eine Obergrenze haben und keine uebliche Menge. Fehlen alle drei —
 * bei 143 von 318 ist `dosing.status = 'unbekannt'` — entfaellt die
 * ganze Zeile.
 */
export function DreiKacheln(
  { menge, obergrenze, einnahme, mengeGrund, obergrenzeGrund }:
  {
    menge: string | null; obergrenze: string | null; einnahme: string | null
    /** G-191: warum es keine Menge gibt — statt einer Menge. */
    mengeGrund?: string | null
    obergrenzeGrund?: string | null
  },
) {
  // ══ G-191 ═══════════════════════════════════════════════════════
  //
  // `[cmd]` **Hier stand der Statuscode.** Weil `guideline_dose` ein
  // Objekt ist und die alte Lesefunktion bei `value: null` alle
  // Objektwerte verkettete, stand in dieser Kachel *„No validated
  // clinical guideline dose · CLINICAL_GUIDELINE"* — bei **250 von
  // 412** Substanzen.
  //
  // `[read]` **Wert und Grund sind jetzt zwei Dinge.** Eine Kachel
  // ohne Wert entfaellt (§9) — **ausser sie kann sagen, warum.**
  // *„Keine Leitlinie nennt eine Dosis"* ist eine Aussage, kein
  // fehlender Wert: **es gibt keine, nicht wir wissen es nicht.**
  // Genau die Unterscheidung, an der der Katalog haengt.
  const felder = [
    { label: 'Übliche Menge', wert: menge, grund: mengeGrund },
    { label: 'Obergrenze', wert: obergrenze, grund: obergrenzeGrund },
    { label: 'Einnahme', wert: einnahme, grund: null },
  ].filter(f => da(f.wert) || da(f.grund))
  if (felder.length === 0) return null
  return (
    <div className="v2-supp-dosis-kacheln">
      {felder.map(f => (
        <div key={f.label} className="v2-supp-dosis-kachel">
          <div className="v2-eyebrow" style={{ marginBottom: 3 }}>{f.label}</div>
          {da(f.wert)
            ? <div className="v2-supp-dosis-wert">{f.wert}</div>
            // `[read]` **Klein und gedaempft, nicht als grosse Zahl.**
            // Der Grund darf nicht aussehen wie eine Angabe — sonst
            // waere er nur ein anderer Statuscode.
            : <div className="v2-supp-dosis-grund">{f.grund}</div>}
        </div>
      ))}
    </div>
  )
}

/**
 * Was nicht zurueckkommt — bei Enhanced und Peptiden ganz oben.
 *
 * `[read]` **§9: „Hervorgehoben, nicht als Fussnote."** Deshalb ein
 * eigener Rahmen in Warnfarbe und nicht ein Absatz unter vielen.
 */
export function Irreversibel({ text }: { text: string | null | undefined }) {
  if (!da(text)) return null
  return (
    <div style={{
      padding: '9px 11px', borderRadius: 6, marginBottom: 14,
      // G-196: 9 % -> 5 %. Gemessen: auf 7 % liegt `--warn` im
      // Hellmodus bei 4.44, auf 5 % bei 4.58. Der Farbwert bleibt.
      background: 'color-mix(in oklch, var(--warn) 5%, transparent)',
      border: '1px solid color-mix(in oklch, var(--warn) 38%, var(--border))',
    }}>
      <BlockTitel titel="Was nicht zurückkommt" />
      <p style={{ fontSize: 12.5, lineHeight: 1.62, margin: 0 }}>{text}</p>
    </div>
  )
}

/**
 * Ueberwachung und Reinheit — die Kacheln der Enhanced-Ansicht.
 *
 * `[read]` **§9: Reinheit steht NEBEN der Mengenangabe, nicht drei
 * Abschnitte weiter.** Wenn in Praeparaten wiederholt andere
 * Wirkstoffe gefunden wurden, entwertet das jede Mengenangabe —
 * getrennt gelesen wirkt die Zahl verlaesslicher, als sie ist.
 */
export function UeberwachungUndReinheit(
  { ueberwachung, reinheit }: { ueberwachung: string | null; reinheit: string | null },
) {
  const felder = [
    ['Überwachung', ueberwachung],
    ['Reinheit', reinheit],
  ].filter(([, w]) => da(w as string)) as Array<[string, string]>
  if (felder.length === 0) return null
  return (
    <div style={{
      display: 'grid', gap: 8, marginBottom: 14,
      gridTemplateColumns: `repeat(${felder.length}, minmax(0, 1fr))`,
    }}>
      {felder.map(([label, wert]) => (
        <div key={label} style={{
          padding: '8px 10px', borderRadius: 6,
          background: 'var(--bg-elev)', border: '1px solid var(--border)',
        }}>
          {/* G-194: „Überwachung" und „Reinheit" waren die zwei
              Gruppen, nach denen der Auftrag fragte — beide sagen
              *pruef das*, keine ist Warnung oder Wirkung. */}
          <BlockTitel titel={label} stil={{ marginBottom: 3 }} />
          <div style={{ fontSize: 11.5, lineHeight: 1.55 }}>{wert}</div>
        </div>
      ))}
    </div>
  )
}

/**
 * Die Unterformen unter dem Sammelnamen (§9, vierte Regel).
 *
 * `[cmd]` **29 Formen unter 15 Sammeleintraegen**, jede mit eigenem
 * `form_note_de` und eigenem Evidenzgrad — bis G-179 unsichtbar
 * (C-244). Magnesium hat sieben.
 *
 * `[read]` **Der Sammeleintrag traegt selbst keinen Grad** (gemessen
 * 2026-08-25), die Formen tragen ihn. Deshalb steht der Grad hier je
 * Zeile und nicht im Kopf.
 */
export function Formen(
  { formen, onOeffnen, raster = false }: {
    formen: Unterform[] | null | undefined
    onOeffnen: (id: string) => void
    /**
     * G-180: Karten im Raster statt Zeilen untereinander.
     *
     * `[read]` **Der Gradpunkt rechts oben ist das, was eine Karte von
     * einer Zeile unterscheidet** — ohne ihn waere das Raster nur eine
     * Aufzaehlung in zwei Spalten.
     */
    raster?: boolean
  },
) {
  if (!formen || formen.length === 0) return null

  if (raster) {
    return (
      <div className="v2-supp-formen-raster">
        {formen.map(f => (
          <button
            key={f.id} type="button" className="v2-supp-form-karte"
            onClick={e => { e.stopPropagation(); onOeffnen(f.id) }}
          >
            <span className="v2-supp-form-name">{f.name}</span>
            {f.hinweis && <span className="v2-supp-form-hinweis">{f.hinweis}</span>}
            {f.grad && (
              <span className="v2-supp-form-punkt" data-grad={f.grad}
                    title={`Evidenzgrad ${f.grad}`}>
                {f.grad}
              </span>
            )}
          </button>
        ))}
      </div>
    )
  }

  return (
    <section style={{ marginBottom: 14 }}>
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
        Die Formen · {formen.length}
      </div>
      <div className="v2-col-gap" style={{ gap: 4 }}>
        {formen.map(f => (
          <button
            key={f.id} type="button" onClick={() => onOeffnen(f.id)}
            style={{
              display: 'flex', alignItems: 'baseline', gap: 8, width: '100%',
              padding: '6px 9px', borderRadius: 6, cursor: 'pointer',
              textAlign: 'left', font: 'inherit',
              background: 'var(--surface)', border: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 500 }}>{f.name}</span>
            {f.grad && <Pill style={{ fontSize: 9 }}>{f.grad}</Pill>}
            {f.hinweis && (
              <span className="v2-dim" style={{
                fontSize: 11, flex: 1, minWidth: 0, lineHeight: 1.45,
              }}>
                {f.hinweis}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  )
}

/**
 * Die Alltagsfragen (§9: „3-6, echte Fragen").
 *
 * `[cmd]` Nach dem C-264-Import: **1.279 Zeilen**, im Schnitt 4,4 je
 * Substanz. Vorher waren es drei Antworten, jede 289-mal.
 */
export function Fragen({ fragen }: { fragen: Frage[] | null | undefined }) {
  const rein = (fragen ?? []).filter(f => da(f.frage) && da(f.antwort))
  if (rein.length === 0) return null
  return (
    <section style={{ marginBottom: 14 }}>
      <BlockTitel titel="Fragen" stil={{ marginBottom: 6 }} />
      <div className="v2-col-gap" style={{ gap: 8 }}>
        {rein.map(f => (
          <div key={f.frage}>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 2 }}>
              {f.frage}
            </div>
            <p className="v2-muted" style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>
              {f.antwort}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * Der Rumpf des Details, in der Reihenfolge aus §9.
 *
 * `[read]` **Die Reihenfolge dreht sich bei Enhanced und Peptiden:**
 * dort steht zuerst, was nicht zurueckkommt, dann Ueberwachung und
 * Reinheit — nicht die Dosis. Die Frage ist dort nicht „wirkt es",
 * sondern „was macht es mit dir und was musst du ueberwachen".
 */
export function Rumpf(
  { texte, gruppe, menge, obergrenze, einnahme, formen, fragen, onOeffnen }: {
    texte: Nutzertexte | null | undefined
    gruppe: string | null
    menge: string | null
    obergrenze: string | null
    einnahme: string | null
    formen: Unterform[] | null | undefined
    fragen: Frage[] | null | undefined
    onOeffnen: (id: string) => void
  },
) {
  const heikel = gruppe === 'enhanced' || gruppe === 'peptide'
  const t = texte ?? null

  return (
    <>
      {/* Erster Satz: WAS IST DAS. Kein Grad, kein Feldname. */}
      {da(t?.kurz_was) && (
        <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: '0 0 12px' }}>
          {t?.kurz_was}
        </p>
      )}

      {/* Bei Enhanced/Peptiden zuerst: was bleibt. */}
      {heikel && <Irreversibel text={t?.irreversibel} />}

      <Zwecke punkte={t?.wofuer} />

      {/* `[read]` §9: Bei Enhanced und Peptiden stehen Ueberwachung
          und Reinheit VOR der Menge — die Zahl ist ohne die Reinheit
          nicht zu lesen. Die Kachelzeile kommt danach, einmal. */}
      {heikel && (
        <UeberwachungUndReinheit
          ueberwachung={t?.ueberwachung ?? null} reinheit={t?.reinheit ?? null} />
      )}
      <DreiKacheln menge={menge} obergrenze={obergrenze} einnahme={einnahme} />

      <Abschnitt titel="Zu viel" text={t?.zu_viel} ton="warn" />
      <Abschnitt titel="Zu wenig" text={t?.zu_wenig} />
      <Abschnitt titel="Wie es wirkt" text={t?.wie_wirkt} />
      <Abschnitt titel="Was es bringt" text={t?.was_bringt_es} />
      <Abschnitt titel="Wann und wie" text={t?.wann_wie} />
      <Stichpunkte titel="Wer es nicht nehmen sollte" punkte={t?.wer_nicht} />
      <Abschnitt titel="Mythen" text={t?.mythen} />
      {heikel && <Abschnitt titel="Nicht im Blut nachweisbar" text={t?.nicht_im_blut} />}
      {heikel && <Abschnitt titel="Rechtslage" text={t?.rechtslage_klartext} />}

      <Formen formen={formen} onOeffnen={onOeffnen} />
      <Fragen fragen={fragen} />
    </>
  )
}
