'use client'

// Die aufgeklappte Zeile unter dem Listeneintrag (G-180).
//
// ══ WARUM DAS KEIN MODAL IST ════════════════════════════════════════
//
// **Tom, 2026-08-25:** *„wieso modal und nicht gleich pulldown unter
// dem gewaehlten eintrag?"*
//
// `[read]` **Es gab keinen Grund** — im Entwurf stand ein Modal, weil
// dort schon eines stand. Fuer das Ausklappen spricht mehr:
//
//   - **Der Platz in der Liste bleibt sichtbar.** Man weiss, wo man
//     ist, und scrollt nach dem Schliessen weiter, statt sich neu zu
//     orientieren.
//   - **Zwei Substanzen lassen sich nacheinander aufklappen und
//     vergleichen.** Ein Modal erzwingt Schliessen-Oeffnen.
//   - **Auf dem Telefon ist ein Overlay fast immer schlechter** als
//     eine wachsende Zeile.
//   - **Kein Schliessen-Knopf, den man suchen muss** — ein zweiter
//     Klick auf die Zeile genuegt.
//
// `[read]` **Das steht hier, damit daraus nicht beim naechsten Umbau
// wieder ein Modal wird.**
//
// ══ WARUM REITER UND NICHT UNTEREINANDER ════════════════════════════
//
// **Tom, 2026-08-25:** *„hat nun daten aber plump aufgelistet
// untereinander."*
//
// `[cmd]` **Gemessen am 2026-08-25:** der Rollbehaelter ist **660 px**
// hoch (60vh von 1100), eine zugeklappte Zeile **54 px**. **Fuer den
// Inhalt bleiben rund 560 px.** Alle Bereiche untereinander waeren
// ueber 900 — die Zeile waere hoeher als ihr eigener Behaelter.
//
// `[read]` **Die Reiter sind hier keine Zier, sondern die
// Hoehenbegrenzung.** Immer nur einer offen.
import * as React from 'react'
import { Pill, Icon } from '@lumeos/ui'

import type {
  Nutzertexte, Unterform, Frage, Quelle, Laborwirkung, Wechselwirkung,
} from '../../../lib/supplements/substanz-read'
import type { ReiterId, Zahlen } from '../../../lib/supplements/substanz-reiter'
import { reiterFuer, ersterReiter } from '../../../lib/supplements/substanz-reiter'
import { kachelnFuer, type Kachel } from '../../../lib/supplements/substanz-kacheln'
import {
  Abschnitt, AufgeteilterAbschnitt, Aussagen, Stichpunkte, Formen, Fragen,
} from './substanz-abschnitte'

function da(v: string | null | undefined): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

/**
 * Der Zahlenkasten — „Auf einen Blick".
 *
 * `[read]` **Zeile je Angabe, Wert rechtsbuendig.** Das ist der
 * Unterschied zur Aufzaehlung: Wer nur die Menge sucht, findet sie an
 * derselben Stelle wie bei jeder anderen Substanz.
 *
 * `[cmd]` **Jede Zeile einzeln entfallend** — gemessen ueber die 318:
 * Menge **83**, Obergrenze **38**, Einnahme **19**.
 */
export function Zahlenkasten({ zahlen }: { zahlen: Zahlen }) {
  const zeilen = [
    ['Obergrenze', zahlen.obergrenze],
    ['Einnahme', zahlen.einnahme],
    ['Mit Essen', zahlen.mitEssen],
  ].filter(([, w]) => da(w as string)) as Array<[string, string]>
  if (zeilen.length === 0) return null
  return (
    <div className="v2-supp-kasten">
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>Weitere Angaben</div>
      {zeilen.map(([label, wert]) => (
        <div key={label} className="v2-supp-kasten-zeile">
          <span className="v2-muted">{label}</span>
          <span className="v2-supp-kasten-wert">{wert}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Die Zahlenkacheln (G-181, Punkt 2).
 *
 * `[read]` **Ein Kasten mit einer Zeile wirkt leerer als gar kein
 * Kasten** — bei Kreatin stand dort genau eine Zeile. Jetzt vier
 * Kacheln nebeneinander, je mit grosser Zahl und einer Zeile
 * Erklaerung.
 *
 * `[read]` **Kachel ohne Wert entfaellt.** Drei sind besser als vier
 * mit einem Strich; ein Strich sieht aus wie eine Angabe.
 *
 * `[cmd]` **Feste Breite, kein `1fr`** — Tom: *„nicht dass sich
 * ploetzlich eine kachel dynamisch auf 1600 pixel vergroessert."*
 * `flex: 0 0 auto` mit `width: 196px`; bleibt Platz uebrig, bleibt er
 * leer.
 */
export function Zahlenkacheln({ kacheln }: { kacheln: Kachel[] }) {
  if (kacheln.length === 0) return null
  return (
    <div className="v2-supp-zahlen">
      {kacheln.map(k => (
        <div key={k.id} className="v2-supp-zahl-kachel">
          <span className="v2-supp-zahl-label">{k.label}</span>
          <span className="v2-supp-zahl-wert" data-ton={k.ton}>{k.wert}</span>
          {k.hinweis && <span className="v2-supp-zahl-hinweis">{k.hinweis}</span>}
        </div>
      ))}
    </div>
  )
}

/**
 * „Wie es wirkt" und „Was es bringt" als Kacheln nebeneinander
 * (G-181, Punkt 4).
 *
 * `[read]` **`max-width: 520px` ist die eigentliche Zusage.** Ohne sie
 * wird auf einem breiten Monitor aus einer Textkachel eine Zeile ueber
 * die halbe Wand — der Messwert dafuer ist die Zeilenlaenge in
 * Zeichen, nicht die Pixelbreite.
 *
 * `[read]` **Eine Kachel ohne Inhalt erscheint nicht** (§9).
 */
export function Textkacheln(
  { wieWirkt, wasBringtEs }:
  { wieWirkt: string | null | undefined; wasBringtEs: string | null | undefined },
) {
  const kacheln = [
    { id: 'wirkt', kopf: 'Wie es wirkt', ton: 'acc', text: wieWirkt },
    { id: 'bringt', kopf: 'Was es bringt', ton: 'pos', text: wasBringtEs },
  ].filter(k => da(k.text))
  if (kacheln.length === 0) return null
  return (
    <div className="v2-supp-textkacheln">
      {kacheln.map(k => (
        <div key={k.id} className="v2-supp-textkachel">
          <div className="v2-supp-textkachel-kopf" data-ton={k.ton}>
            <Icon name={k.id === 'wirkt' ? 'zap' : 'trend_up'}
                  className="v2-ic v2-ic-sm" />
            {k.kopf}
          </div>
          <p>{k.text}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * Der obere Kasten bei Enhanced und Peptiden — er TAUSCHT den Inhalt.
 *
 * `[read]` **Nicht „zusaetzlich", sondern „statt".** Die Frage ist
 * dort nicht „wie viel nehme ich", sondern „was macht es mit mir und
 * was muss ich ueberwachen".
 *
 * `[read]` **Reinheit steht neben der Menge**, nicht drei Bloecke
 * weiter: wenn in Praeparaten wiederholt andere Wirkstoffe gefunden
 * wurden, entwertet das jede Dosisangabe. Getrennt gelesen wirkt die
 * Zahl verlaesslicher, als sie ist.
 *
 * `[cmd]` **Heute leer:** `irreversibel_de`, `ueberwachung_de` und
 * `reinheit_de` stehen bei **0 von 290** — der C-264-Import hat sie
 * geleert (vorher 136). Codex fuellt sie in C-266. **Deshalb per Test
 * belegt, nicht am Bild.**
 */
export function WarnKasten(
  { texte }: { texte: Nutzertexte | null | undefined },
) {
  const t = texte ?? null
  // ── G-182 Punkt 3: drei Kacheln nebeneinander, linksbuendig ─────
  //
  // **Tom, 2026-08-25:** *„peptide detail sieh selber rein erste obere
  // kachel unstrukturiert."*
  //
  // `[cmd]` Vorher standen `Ueberwachung` und `Reinheit` als
  // `v2-supp-kasten-zeile` — mit **rechtsbuendigem** Wert. Das ist die
  // Zeile aus dem Zahlenkasten, und **die Rechtsbuendigkeit war fuer
  // ZAHLEN gedacht**: „350 mg" rechts ist ablesbar, ein Satz ueber
  // vier Zeilen rechtsbuendig ist es nicht.
  //
  // `[read]` **Jetzt drei eigene Kacheln nebeneinander**, je mit
  // Ueberschrift und linksbuendigem Text — dieselbe Bauform wie die
  // Textkacheln im Ueberblick.
  const kacheln = [
    { id: 'irr', kopf: 'Was nicht zurückkommt', text: t?.irreversibel, warn: true },
    { id: 'ueb', kopf: 'Überwachung', text: t?.ueberwachung, warn: false },
    { id: 'rein', kopf: 'Reinheit', text: t?.reinheit, warn: false },
  ].filter(k => da(k.text))
  if (kacheln.length === 0) return null
  return (
    <div className="v2-supp-textkacheln">
      {kacheln.map(k => (
        <div key={k.id}
             className={`v2-supp-textkachel${k.warn ? ' v2-supp-textkachel-warn' : ''}`}>
          <div className="v2-supp-textkachel-kopf" data-ton={k.warn ? 'warn' : undefined}>
            {k.warn && <Icon name="alert" className="v2-ic v2-ic-sm" />}
            {k.kopf}
          </div>
          {/* G-183: auch hier zerfaellt der Absatz in seine Aussagen,
              wo er es hergibt — `ueberwachung_de` bei 63 von 96,
              `reinheit_de` bei 118 von 134, `irreversibel_de` bei 90
              von 112 (gemessen 2026-08-25). */}
          <Aussagen text={k.text as string} />
        </div>
      ))}
    </div>
  )
}

/** „Bei zu viel" — eigener Kasten in Warnfarbe, kein Absatz. */
export function ZuVielKasten({ text }: { text: string | null | undefined }) {
  if (!da(text)) return null
  return (
    <div className="v2-supp-kasten v2-supp-kasten-warn">
      <div className="v2-eyebrow" style={{ marginBottom: 4, color: 'var(--warn)' }}>
        Bei zu viel
      </div>
      <p style={{ fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
  )
}

/**
 * Der Laborbezug — kompakt.
 *
 * `[read]` **Er gehoert zur Sicherheit, nicht zum Ueberblick:** dass
 * Kreatin den Kreatininwert anhebt, ohne die Niere zu schaedigen, ist
 * genau dann wichtig, wenn jemand einen Befund in der Hand haelt.
 */
export function Laborbezug({ text }: { text: string | null | undefined }) {
  if (!da(text)) return null
  return (
    <div className="v2-supp-kasten">
      <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Im Labor</div>
      <p style={{ fontSize: 12, lineHeight: 1.55, margin: 0 }}>{text}</p>
    </div>
  )
}

/**
 * Die Quellenliste (G-182, Punkt 4).
 *
 * **Tom, 2026-08-25:** *„quellen haben keine funktion."*
 *
 * `[cmd]` Der Chip zeigte eine Zahl und reagierte nicht. Die Daten
 * lagen die ganze Zeit vor: `sources` als `jsonb`, **290 von 290
 * gefuellt**.
 *
 * `[read]` **`verified` wird mitgezeigt.** Der Bestand fuehrt viele
 * Verweise als ungeprueft — das zu verschweigen waere dieselbe Sorte
 * Fehler wie eine Zahl ohne Herkunft. **Ein ungepruefter Verweis ist
 * mehr als keiner und weniger als ein gepruefter.**
 */
export function Quellenliste({ quellen }: { quellen: Quelle[] | null | undefined }) {
  const rein = (quellen ?? []).filter(q => da(q.ref))
  if (rein.length === 0) return null
  return (
    <div className="v2-col-gap" style={{ gap: 8 }}>
      {rein.map((q, i) => (
        <div key={`${q.ref}-${i}`} className="v2-supp-quelle">
          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <span className="v2-supp-quelle-nr">{i + 1}</span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 12, lineHeight: 1.5 }}>
              {q.ref}
            </span>
            {q.geprueft
              ? <Pill variant="pos" style={{ fontSize: 8.5 }}>geprüft</Pill>
              : <Pill style={{ fontSize: 8.5 }}>ungeprüft</Pill>}
          </div>
          {q.felder.length > 0 && (
            <div className="v2-dim" style={{ fontSize: 10, marginTop: 3, paddingLeft: 22 }}>
              belegt: {q.felder.join(' · ')}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Laborwirkung und Wechselwirkungen (G-186, Punkt 2).
 *
 * ══ WARUM EIN BLOCK UND KEIN EIGENER REITER ════════════════════════
 *
 * `[cmd]` **Gemessen 2026-08-25:** `supplement_lab_effects` **222
 * Zeilen ueber 90 Substanzen**, `supplement_interactions` **78 ueber
 * 78** — **zusammen haben 121 der 318 etwas.**
 *
 * `[read]` **Ein eigener Reiter waere bei 197 Substanzen leer.** Die
 * Blockregel aus §9 laesst ihn dann entfallen — ein Reiter, der bei
 * zwei Dritteln fehlt, ist unberechenbar; ein Block, der entfaellt,
 * ist normal.
 *
 * ══ WAS NICHT GEZEIGT WIRD, UND WARUM ══════════════════════════════
 *
 * `[cmd]` **`entity_transporters` (4.617) und `entity_cyp` (3.001)
 * gehoeren ueberwiegend MEDIKAMENTEN**, nicht Katalogsubstanzen: nur
 * **135 bzw. 816 Zeilen** tragen `entity_type='supplement'`, und
 * davon sind **81 bzw. 251** nicht `not_relevant`. **224 der 318
 * haben gar keine relevante Zeile.**
 *
 * `[read]` **`not_relevant` ist ein Ergebnis, kein fehlender Wert** —
 * deshalb steht es als Fusszeile („geprueft, ohne Befund"), nicht als
 * zehn leere Zeilen.
 */
export function Wechselwirkungsblock(
  { labor, wechsel, geprueft }: {
    labor: Laborwirkung[] | null | undefined
    wechsel: Wechselwirkung[] | null | undefined
    /** Zahl der Transporter/Enzyme, die geprueft und ohne Befund sind. */
    geprueft: number
  },
) {
  const l = labor ?? []
  const w = wechsel ?? []
  if (l.length === 0 && w.length === 0 && geprueft === 0) return null
  return (
    <div className="v2-supp-kasten" style={{ marginBottom: 12 }}>
      <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
        Wechselwirkung und Labor
      </div>

      {w.length > 0 && (
        <div className="v2-col-gap" style={{ gap: 5, marginBottom: l.length ? 10 : 0 }}>
          {w.map(x => (
            <div key={x.partner} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, minWidth: 0 }}>
                {x.partner}
              </span>
              {x.schwere && (
                <Pill variant={x.schwere === 'high' || x.schwere === 'major' ? 'warn' : undefined}
                      style={{ fontSize: 8.5 }}>
                  {x.schwere}
                </Pill>
              )}
              {/* `[cmd]` G-186: bei einigen Zeilen ist die Beschreibung
                  woertlich der Partner — *„stop biotin before lab
                  draws"* stand zweimal nebeneinander. Dann entfaellt
                  sie. */}
              {x.beschreibung
                && x.beschreibung.trim().toLowerCase() !== x.partner.trim().toLowerCase() && (
                <span className="v2-muted" style={{ fontSize: 11, flex: 1, minWidth: 0, lineHeight: 1.5 }}>
                  {x.beschreibung}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {l.length > 0 && (
        <div className="v2-supp-labor">
          {l.map(x => (
            <div key={`${x.analyt}|${x.folge ?? ''}`} className="v2-supp-labor-zeile">
              <span className="v2-supp-labor-analyt">{x.analyt}</span>
              {x.richtung && (
                <Pill variant={/false|missed/i.test(x.richtung) ? 'warn' : undefined}
                      style={{ fontSize: 8.5 }}>
                  {x.richtung.replace(/_/g, ' ')}
                </Pill>
              )}
              {x.folge && (
                <span className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
                  {x.folge}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* `[read]` Der Unterschied zwischen „geprueft, kein Effekt" und
          „nie geprueft" gehoert benannt — als EINE Zeile, nicht als
          zehn leere. */}
      {geprueft > 0 && (
        <div className="v2-dim" style={{ fontSize: 10.5, marginTop: 8 }}>
          {geprueft} weitere Transporter und Enzyme geprüft, ohne Befund.
        </div>
      )}
    </div>
  )
}

/**
 * Der Inhalt eines Reiters.
 *
 * `[read]` **Gestapelt, nicht zweispaltig.** Im Modalentwurf standen
 * Fliesstext links und Zahlen rechts; in einer eingerueckten Zeile
 * fehlt dafuer die Breite.
 */
export function ReiterInhalt(
  { reiter, texte, zahlen, kacheln, formen, fragen, quellen, labor,
    laborwirkungen, wechselwirkungen, geprueft, heikel, onOeffnen }: {
    reiter: ReiterId
    texte: Nutzertexte | null | undefined
    zahlen: Zahlen
    kacheln: Kachel[]
    formen: Unterform[] | null | undefined
    fragen: Frage[] | null | undefined
    quellen: Quelle[] | null | undefined
    labor: string | null
    laborwirkungen: Laborwirkung[] | null | undefined
    wechselwirkungen: Wechselwirkung[] | null | undefined
    geprueft: number
    heikel: boolean
    onOeffnen: (id: string) => void
  },
) {
  const t = texte ?? null

  if (reiter === 'ueberblick') {
    return (
      <>
        {/* Bei Enhanced steht der Warnkasten GANZ oben — vor allem
            anderen, auch vor dem ersten Satz. */}
        {heikel && <WarnKasten texte={texte} />}
        {da(t?.kurz_was) && (
          <p className="v2-supp-erster-satz">{t?.kurz_was}</p>
        )}
        {/* G-181: die Zahlen als Kacheln, nicht als Tabellenzeile. */}
        <Zahlenkacheln kacheln={kacheln} />
        {/* G-181 Punkt 4: als Kacheln nebeneinander, nicht als
            Absaetze mit Mini-Ueberschrift. */}
        <Textkacheln wieWirkt={t?.wie_wirkt} wasBringtEs={t?.was_bringt_es} />
      </>
    )
  }

  if (reiter === 'dosierung') {
    return (
      <>
        {/* G-182 Punkt 2: KEIN Warnkasten hier. Er stand auf drei von
            vier Reitern — dreimal derselbe Text, jedes Mal die halbe
            Tafel. `[read]` Tom: *„es gibt keinen grund oben ueberall
            dasselbe zu zeigen."* Er steht einmal im Ueberblick. */}
        <Zahlenkacheln kacheln={kacheln.filter(k => k.id !== 'beleglage')} />
        {/* Was nicht in eine Kachel passt — Obergrenze, Einnahme —
            steht darunter als Zeilenkasten. */}
        <Zahlenkasten zahlen={zahlen} />
        {/* G-186 Punkt 1: `wann_wie_de` ist das EINZIGE Feld, das bei
            allen 318 gefuellt ist (Menge 83, Obergrenze 38, Einnahme
            19). `[read]` Deshalb bekommt es die Zerlegung aus G-183 —
            aus einem Absatz werden seine Aussagen, und der Reiter
            traegt mehr als zwei Zeilen. */}
        <AufgeteilterAbschnitt titel="Wann und wie" text={t?.wann_wie} />
      </>
    )
  }

  if (reiter === 'sicherheit') {
    return (
      <>
        {/* G-182 Punkt 2: auch hier nicht — siehe „dosierung". */}
        <ZuVielKasten text={t?.zu_viel} />
        {/* G-186 Punkt 2: Wechselwirkungen und Laborwirkung. `[read]`
            Sie stehen in der Sicherheit, nicht im Ueberblick — dass
            Biotin einen Troponinwert faelscht, ist genau dann wichtig,
            wenn jemand einen Befund in der Hand haelt. */}
        <Wechselwirkungsblock
          labor={laborwirkungen} wechsel={wechselwirkungen} geprueft={geprueft} />
        <Laborbezug text={labor} />
        <Abschnitt titel="Zu wenig" text={t?.zu_wenig} />
        <Stichpunkte titel="Wer es nicht nehmen sollte" punkte={t?.wer_nicht} />
        <Abschnitt titel="Mythen" text={t?.mythen} />
        {/* G-183: beide zerfallen an Satzgrenzen in ihre Aussagen —
            `nicht_im_blut_de` bei 67 von 134, `rechtslage_klartext_de`
            bei 135 von 136 (gemessen 2026-08-25). Wo nicht, bleibt der
            Absatz stehen. */}
        {heikel && <AufgeteilterAbschnitt titel="Nicht im Blut nachweisbar"
                                          text={t?.nicht_im_blut} />}
        {heikel && <AufgeteilterAbschnitt titel="Rechtslage"
                                          text={t?.rechtslage_klartext} />}
      </>
    )
  }

  if (reiter === 'formen') {
    return <Formen formen={formen} onOeffnen={onOeffnen} raster />
  }

  if (reiter === 'quellen') {
    return <Quellenliste quellen={quellen} />
  }

  return <Fragen fragen={fragen} />
}

/**
 * Die Reiterleiste.
 *
 * `[read]` **Die Zahl steht nur, wo es eine gibt** — „Formen · 7",
 * „Fragen · 5". Bei Ueberblick waere sie bedeutungslos.
 */
export function Reiterleiste(
  { reiter, offen, onWaehlen }: {
    reiter: Array<{ id: ReiterId; titel: string; zahl: number | null }>
    offen: ReiterId | null
    onWaehlen: (id: ReiterId) => void
  },
) {
  if (reiter.length <= 1) return null
  return (
    <div className="v2-supp-reiter" role="tablist">
      {reiter.map(r => (
        <button
          key={r.id} type="button" role="tab"
          aria-selected={r.id === offen}
          className={`v2-supp-reiter-knopf${r.id === offen ? ' ist-offen' : ''}`}
          onClick={e => { e.stopPropagation(); onWaehlen(r.id) }}
        >
          {r.titel}
          {r.zahl !== null && <span className="v2-supp-reiter-zahl">{r.zahl}</span>}
        </button>
      ))}
    </div>
  )
}

/** Der Fusszeilen-Knopf „Quellen · N", wo es Herkunftsvermerke gibt. */
export function Quellenknopf({ anzahl }: { anzahl: number }) {
  if (anzahl <= 0) return null
  return (
    <Pill style={{ fontSize: 9 }}>Quellen · {anzahl}</Pill>
  )
}

/**
 * Die ganze aufgeklappte Tafel: Reiterleiste, Inhalt, Fusszeile.
 *
 * `[read]` **Der Kopf fehlt hier bewusst.** Name, Gruppe und Grad
 * stehen bereits in der Listenzeile darueber — sie im Ausklappen zu
 * wiederholen waere genau die Doppelung, die ein Modal noetig machte.
 * `[read]` **Was der Kopf sonst rechts trug — Grad und WADA — steht
 * jetzt in der Zeile selbst** (Spalte „Evidenz") und im Zahlenkasten.
 */
export function SubstanzTafel(
  { satz, offenerReiter, onReiter, onOeffnen, imStack, onAdd }: {
    satz: {
      id: string
      slug?: string
      grad?: string | null
      canonical_name: string
      gruppe?: string | null
      texte?: Nutzertexte | null
      formen?: Unterform[]
      fragen?: Frage[]
      quellen?: Quelle[]
      wada_kategorie?: string | null
      laborwirkungen?: Laborwirkung[]
      wechselwirkungen?: Wechselwirkung[]
      geprueft_ohne_befund?: number
      wada_status?: string | null
      evidence?: Record<string, unknown> | null
      evidence_provenance?: Record<string, unknown> | null
      dosing?: Record<string, unknown> | null
      labor?: string | null
    }
    offenerReiter: ReiterId | null
    onReiter: (id: ReiterId) => void
    onOeffnen: (id: string) => void
    imStack: boolean
    onAdd: () => void
  },
) {
  const zahlen = zahlenAus(satz.dosing)
  const labor = satz.labor ?? null
  const heikel = satz.gruppe === 'enhanced' || satz.gruppe === 'peptide'
  // G-181: die Zahlenkacheln. `[read]` Die Wirkungskachel kommt aus
  // einer gepflegten Liste, nicht aus dem Text — Begruendung im Kopf
  // von `substanz-kacheln.ts`.
  const grad = satz.grad
    ?? (typeof satz.evidence?.overall_grade === 'string'
      ? satz.evidence.overall_grade : null)
  const kacheln = kachelnFuer(satz.slug, grad, zahlen.menge, satz.wada_status, satz.wada_kategorie)
  // G-186: „geprueft, ohne Befund" — die Zahl kommt aus dem Lesepfad,
  // wenn sie dort einmal gefuehrt wird; heute 0.
  const geprueft = satz.geprueft_ohne_befund ?? 0
  const reiter = reiterFuer(satz.texte, zahlen, satz.formen, satz.fragen, labor, satz.quellen,
    satz.laborwirkungen, satz.wechselwirkungen)
  const aktiv = (offenerReiter && reiter.some(r => r.id === offenerReiter))
    ? offenerReiter
    : ersterReiter(reiter)

  const quellen = satz.evidence_provenance
    ? Object.keys(satz.evidence_provenance).length : 0

  return (
    <div className="v2-supp-tafel">
      <Reiterleiste reiter={reiter} offen={aktiv} onWaehlen={onReiter} />
      <div className="v2-supp-tafel-inhalt">
        {aktiv
          ? <ReiterInhalt
              reiter={aktiv} texte={satz.texte} zahlen={zahlen}
              kacheln={kacheln}
              formen={satz.formen} fragen={satz.fragen}
              quellen={satz.quellen} labor={labor}
              laborwirkungen={satz.laborwirkungen}
              wechselwirkungen={satz.wechselwirkungen}
              geprueft={geprueft}
              heikel={heikel} onOeffnen={onOeffnen} />
          : (
            // `[read]` Kein Platzhalter: 28 der 318 Eintraege haben
            // weder Texte noch Formen. Ein Satz sagt, was Sache ist.
            <p className="v2-muted" style={{ fontSize: 12, margin: 0 }}>
              Zu dieser Substanz liegen noch keine Angaben vor.
            </p>
          )}
      </div>
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)',
      }}>
        {imStack && <Pill variant="pos" style={{ fontSize: 9 }}>Im Stack</Pill>}
        <Quellenknopf anzahl={quellen} />
        <button type="button" className="v2-btn v2-btn-primary v2-btn-sm"
                style={{ marginLeft: 'auto' }}
                onClick={e => { e.stopPropagation(); onAdd() }}>
          Zum Stack hinzufügen
        </button>
      </div>
    </div>
  )
}

/**
 * Die vier Zahlen aus `supplement_dosing`.
 *
 * `[cmd]` **Die JSON-null-Falle, gemessen in C-107:** `dose_ceiling`
 * ist bei 290 von 290 `is not null`, aber **258 tragen das Literal
 * `null`**. `jsonWert` faengt das ab — sonst stuende „null" im
 * Zahlenkasten, und eine hingeschriebene Null sieht aus wie eine
 * gemessene.
 */
export function zahlenAus(d: Record<string, unknown> | null | undefined): Zahlen {
  return {
    menge: jsonWert(d?.studied_dose_ranges) ?? jsonWert(d?.guideline_dose),
    obergrenze: jsonWert(d?.upper_limit),
    einnahme: textWert(d?.usage_hint_de) ?? textWert(d?.usage_hint_en),
    mitEssen: textWert(d?.dose_unit),
  }
}

function textWert(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

function jsonWert(v: unknown): string | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'string') {
    const s = v.trim()
      // `[cmd]` Das Quellenpraefix gehoert nicht in die Kachel: Kreatin
      // traegt „guideline/ISSN position stand: 3-5 g/day …" — die
      // Quelle steht im Satz unter „Wann und wie".
      .replace(/^(guideline|official|label)?[\s/]*(ISSN|EFSA|NIH|DGE|WHO)?\s*position stand:\s*/i, '')
      .replace(/^(guideline|official label|label)\s*[:/]\s*/i, '')
      .trim()
    return s && s !== 'null' && s !== '[]' && s !== '{}' ? s : null
  }
  if (typeof v === 'number') return String(v)
  if (Array.isArray(v)) {
    const teile = v.map(jsonWert).filter(Boolean) as string[]
    return teile.length ? teile.join(' · ') : null
  }
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>
    const wert = jsonWert(o.value)
    const basis = jsonWert(o.basis)
    if (wert) return basis ? `${wert} (${basis})` : wert
    const teile = Object.values(o).map(jsonWert).filter(Boolean) as string[]
    return teile.length ? teile.join(' · ') : null
  }
  return null
}
