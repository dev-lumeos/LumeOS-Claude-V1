'use client'

// Die aufgeklappte Zeile unter dem Wirkstoff — G-208.
//
// ══ DAS VORBILD, UND WO ES NICHT PASST ══════════════════════════════
//
// `[read]` **Uebernommen aus `substanz-tafel.tsx` (G-180):**
// aufklappende Zeile statt Modal, Kachelraster fester Breite, immer
// nur eine Zeile offen. Die Begruendungen stehen dort und gelten
// unveraendert.
//
// `[read]` **Nicht uebernommen: die Reiterauswahl.** `[cmd]` Bei den
// Supplements entscheidet sich je Substanz, WELCHE Reiter es gibt (15
// von 412 haben Formen). **Hier tragen sechs von acht Reitern bei
// allen 498 Wirkstoffen Inhalt** (gemessen 2026-08-27) — die
// Wegfall-Regel greift nur bei „Schwangerschaft" (449) und „Mythen"
// (383).
//
// ══ WAS STATTDESSEN DIE ARBEIT IST ══════════════════════════════════
//
// `[read]` **Der Unterschied zwischen „begruendet leer" und „nicht
// bearbeitet"** — und er ist nicht kosmetisch. `[cmd]` **9 Wirkstoffe
// ohne CAS-Nummer sind Mischpraeparate und VOLLSTAENDIG; 101 ohne
// Vorsichtsmassnahmen sind es NICHT.** Beides als leeres Feld zu
// zeigen waere dieselbe Luege wie `b?.abbr ?? m` in G-207.
//
// `[read]` **Die Unterscheidung wird nicht erfunden, sondern
// gelesen:** `evidence_provenance.*.missing_reason` und
// `null_context.*.reason_status` tragen sie. Die Zuordnung steht in
// `lib/medical/wirkstoff-luecke.ts`.
import * as React from 'react'
import { Pill, Icon } from '@lumeos/ui'

// ══ A-30: WERTE NUR AUS DER SERVERFREIEN DATEI ══════════════════════
//
// `[cmd]` **Hier stand `import { risikoLabel } from
// '.../wirkstoff-read'`, und der Build brach ab:** dieser Wert-Import
// zog `createSessionClient` und `next/headers` ins Browserbuendel.
// **Aus `wirkstoff-read` kommen ausschliesslich TYPEN** — die werden
// beim Uebersetzen entfernt.
import {
  NICHT_BEARBEITET, zaehleZustaende, risikoLabel, istKurz, type Feld,
} from '../../../lib/medical/wirkstoff-luecke'
import type {
  WirkstoffSatz, WirkstoffFrage, SchwangerschaftsLage,
} from '../../../lib/medical/wirkstoff-read'
import {
  wirkstoffReiter, ersterWirkstoffReiter,
  type WirkstoffReiterId, type WirkstoffReiter,
} from '../../../lib/medical/wirkstoff-reiter'

function da(v: string | null | undefined): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

/**
 * Die Kacheln mit ihren drei Zustaenden — der Kern von G-208.
 *
 * `[read]` **Immer alle Kacheln**, wie in G-199 entschieden: wer drei
 * Wirkstoffe durchklickt, will die CAS-Nummer an derselben Stelle
 * finden. **Eine fehlende Kachel verschiebt alle anderen.**
 *
 * `[read]` **Und die drei Zustaende sehen verschieden aus, nicht
 * verschieden gefaerbt.** Die Farbordnung aus G-196 gilt: Farbe
 * bedeutet Gefahr, Wirkung, Pruefen oder Entwarnung. *„Nicht
 * recherchiert"* ist keins davon — der Unterschied liegt in Schrift,
 * Rahmen und Wortlaut.
 */
export function LueckenKacheln({ felder }: { felder: Feld[] }) {
  if (felder.length === 0) return null
  return (
    <div className="v2-med-wirk-kacheln">
      {felder.map(f => (
        <div key={f.id} className="v2-med-wirk-kachel" data-zustand={f.zustand}>
          <span className="v2-med-wirk-label">{f.label}</span>
          {/* ══ EIN SATZ IST KEINE ZAHL ══════════════════════════════
              `[cmd]` **Beim ersten Bildschirmfoto stand der
              englische Wirkmechanismus in 18-px-Fettschrift und
              sprengte die Kachel.** Die Wertform ist fuer `N04BA`
              und `103-90-2` gebaut.
              `[read]` **Dieselbe Falle wie G-191**, eine Ebene
              hoeher: dort ein Objekt als Zeichenkette, hier ein
              Absatz in der Zahlenform. Die Grenze und ihre Messung
              stehen bei `KURZ_GRENZE`. */}
          {f.zustand === 'wert' && (
            istKurz(f.wert)
              ? <span className="v2-med-wirk-wert">{f.wert}</span>
              : <span className="v2-med-wirk-wert-lang">{f.wert}</span>
          )}
          {/* ══ DER ZWEITE ZUSTAND ═══════════════════════════════════
              `[read]` **Der Satz steht in normaler Schrift, nicht als
              grosse Zahl** — er ist eine Aussage, kein Wert (G-191).
              **Und er sagt ausdruecklich, dass der Datensatz
              vollstaendig ist**, weil das die eigentliche Auskunft
              ist: bei einem Mischpraeparat FEHLT die CAS-Nummer
              nicht, es GIBT keine. */}
          {f.zustand === 'begruendet_leer' && (
            <>
              <span className="v2-med-wirk-grundmarke">
                <Icon name="check" className="v2-ic v2-ic-sm" />
                geprüft
              </span>
              <span className="v2-med-wirk-grund">{f.grundText}</span>
            </>
          )}
          {/* ══ DER DRITTE ZUSTAND ═══════════════════════════════════
              `[read]` **Kein Strich, keine leere Flaeche.** Ein Strich
              waere eine Angabe, eine leere Flaeche saehe aus wie
              „nichts zu berichten". **Beides waere die Luege, gegen
              die dieser Auftrag gebaut ist** — bei 101 Wirkstoffen
              ohne Vorsichtsmassnahmen hat niemand nachgesehen, und
              das ist etwas anderes als „unbedenklich". */}
          {f.zustand === 'nicht_bearbeitet' && (
            <span className="v2-med-wirk-leer">{NICHT_BEARBEITET}</span>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Die Vollstaendigkeitszeile unter den Kacheln.
 *
 * `[read]` **Sie zaehlt, was die Kacheln einzeln zeigen** — dieselbe
 * Linie wie *„5 von 7 Markern"* beim Health score (G-135). Wer
 * wissen will, wie belastbar ein Datensatz ist, soll es nicht aus
 * acht Kacheln zusammenrechnen muessen.
 */
export function Vollstaendigkeit({ felder }: { felder: Feld[] }) {
  const z = zaehleZustaende(felder)
  if (felder.length === 0) return null
  return (
    <div className="v2-dim v2-med-wirk-bilanz">
      {z.wert} von {felder.length} Feldern gefüllt
      {z.begruendet_leer > 0
        && ` · ${z.begruendet_leer} begründet leer`}
      {z.nicht_bearbeitet > 0
        && ` · ${z.nicht_bearbeitet} nicht recherchiert`}
    </div>
  )
}

/** Eine Textkachel mit Ueberschrift — leer erscheint sie nicht (§9). */
function Textkachel(
  { kopf, text, ton, symbol }: {
    kopf: string; text: string | null | undefined
    ton?: string; symbol?: 'zap' | 'trend_up' | 'alert'
  },
) {
  if (!da(text)) return null
  return (
    <div className="v2-med-wirk-textkachel">
      <div className="v2-med-wirk-textkopf" data-ton={ton}>
        {symbol && <Icon name={symbol} className="v2-ic v2-ic-sm" />}
        {kopf}
      </div>
      <p>{text}</p>
    </div>
  )
}

/** Ein Abschnitt mit Ueberschrift und Stichpunkten. */
function Stichpunkte(
  { titel, punkte, ton }: { titel: string; punkte: string[]; ton?: string },
) {
  if (punkte.length === 0) return null
  return (
    <section className="v2-med-wirk-abschnitt">
      <span className="v2-eyebrow" data-ton={ton}>{titel}</span>
      <ul className="v2-med-wirk-liste">
        {punkte.map(p => <li key={p}>{p}</li>)}
      </ul>
    </section>
  )
}

/**
 * Die Vorsichtsmassnahmen — mit ihrem dritten Zustand.
 *
 * `[cmd]` **Hier entscheidet sich der Auftrag:** 393 Wirkstoffe haben
 * welche, **105 nicht — davon 4 begruendet, 101 nicht** (gemessen
 * 2026-08-27).
 *
 * `[read]` **Eine leere Liste ist hier keine Aussage.** Ein
 * Medikament ohne aufgefuehrte Vorsichtsmassnahmen sieht harmlos aus;
 * bei 101 von ihnen weiss das schlicht niemand.
 */
function Vorsichtsblock(
  { punkte, grund }: { punkte: string[]; grund: string | null },
) {
  if (punkte.length > 0) {
    return <Stichpunkte titel="Vorsichtsmassnahmen" punkte={punkte} ton="gefahr" />
  }
  return (
    <section className="v2-med-wirk-abschnitt">
      <span className="v2-eyebrow" data-ton={grund ? undefined : 'pruefen'}>
        Vorsichtsmassnahmen
      </span>
      {grund
        ? (
          <p className="v2-muted v2-med-wirk-satz">
            In den verwendeten Quellen wurde gesucht und nichts gefunden
            {' '}<span className="v2-mono v2-dim">({grund})</span>.
          </p>
          )
        : (
          // `[read]` **Der Satz sagt, was fehlt, und wer es fehlen
          // liess** — nicht „keine bekannt". *Keine bekannt* waere
          // eine Aussage ueber den Wirkstoff; hier ist es eine
          // Aussage ueber die Recherche.
          <p className="v2-med-wirk-satz v2-med-wirk-warnsatz">
            <Icon name="alert" className="v2-ic v2-ic-sm" />
            Für diesen Wirkstoff wurden keine Vorsichtsmassnahmen
            recherchiert. Das heisst nicht, dass es keine gibt.
          </p>
          )}
    </section>
  )
}

/** Die Risikomarker, die auf `true` stehen. */
function Risikomarken({ risiken }: { risiken: string[] }) {
  if (risiken.length === 0) {
    // `[read]` **Auch die Null ist eine Auskunft** — `risk_flags` ist
    // bei allen 498 gefuellt, also wurde jeder der neun Marker
    // geprueft. Das ist der Unterschied zu einem fehlenden Feld.
    return (
      <div className="v2-dim v2-med-wirk-bilanz">
        Neun Risikomarker geprüft, keiner trifft zu.
      </div>
    )
  }
  return (
    <div className="v2-med-wirk-marken">
      {risiken.map(r => (
        <Pill key={r} variant="warn" style={{ fontSize: 9 }}>{risikoLabel(r)}</Pill>
      ))}
      <span className="v2-dim" style={{ fontSize: 10 }}>
        von neun geprüften Markern
      </span>
    </div>
  )
}

/**
 * Schwangerschaft, Stillzeit, Fruchtbarkeit.
 *
 * `[read]` **`state` steht vor dem Text**, weil er die Frage
 * beantwortet, bevor jemand einen Absatz Englisch liest.
 * **`KNOWN_RISK` und `NO_HUMAN_DATA` sind das Gegenteil voneinander**
 * — und ohne den Zustand saehen beide gleich aus.
 */
function SchwangerschaftsBlock({ lage }: { lage: SchwangerschaftsLage }) {
  const teile = [
    { id: 'p', titel: 'Schwangerschaft', stand: lage.schwangerschaftStand, text: lage.schwangerschaftText },
    { id: 'l', titel: 'Stillzeit', stand: lage.stillzeitStand, text: lage.stillzeitText },
    { id: 'f', titel: 'Fruchtbarkeit', stand: lage.fruchtbarkeitStand, text: lage.fruchtbarkeitText },
  ]
  return (
    <div className="v2-col-gap" style={{ gap: 10 }}>
      {teile.map(t => (
        <section key={t.id} className="v2-med-wirk-abschnitt">
          <div className="v2-med-wirk-standkopf">
            <span className="v2-eyebrow">{t.titel}</span>
            {t.stand
              ? (
                <Pill variant={/RISK|CONTRA/i.test(t.stand) ? 'warn' : undefined}
                      style={{ fontSize: 9 }}>
                  {t.stand.replace(/_/g, ' ').toLowerCase()}
                </Pill>
                )
              : <span className="v2-med-wirk-leer">{NICHT_BEARBEITET}</span>}
          </div>
          {da(t.text) && <p className="v2-med-wirk-satz">{t.text}</p>}
        </section>
      ))}
      {/* `[cmd]` **`missing_pregnancy_lactation` ist bei 496 von 498
          gesetzt** — das Etikett berichtet vieles nicht, und die Zahl
          sagt, wie viel. `[read]` Sie steht als eine Zeile, nicht als
          sechs leere Felder (dieselbe Linie wie „geprueft, ohne
          Befund" in G-186). */}
      {lage.nichtBerichtet > 0 && (
        <div className="v2-dim v2-med-wirk-bilanz">
          {lage.nichtBerichtet} weitere Angaben werden im Beipackzettel
          nicht berichtet.
        </div>
      )}
    </div>
  )
}

/** Die Alltagsfragen. */
function Fragen({ fragen }: { fragen: WirkstoffFrage[] }) {
  if (fragen.length === 0) return null
  return (
    <div className="v2-col-gap" style={{ gap: 10 }}>
      {fragen.map(f => (
        <div key={f.frage} className="v2-med-wirk-frage">
          <div className="v2-med-wirk-fragetext">{f.frage}</div>
          <p className="v2-med-wirk-satz">{f.antwort}</p>
        </div>
      ))}
    </div>
  )
}

/** Der Inhalt eines Reiters. */
function ReiterInhalt(
  { reiter, satz }: { reiter: WirkstoffReiterId; satz: WirkstoffSatz },
) {
  if (reiter === 'ueberblick') {
    return (
      <>
        {da(satz.kurz) && <p className="v2-med-wirk-erster">{satz.kurz}</p>}
        <LueckenKacheln felder={satz.ueberblickFelder} />
        <Vollstaendigkeit felder={satz.ueberblickFelder} />
        <Stichpunkte titel="Wofür" punkte={satz.wofuer} ton="wirkung" />
        <div className="v2-med-wirk-textkacheln">
          <Textkachel kopf="Wie es wirkt" text={satz.wieWirkt}
                      ton="wirkung" symbol="zap" />
          <Textkachel kopf="Was es bringt" text={satz.wasBringtEs}
                      ton="wirkung" symbol="trend_up" />
        </div>
        {/* ══ `drug_class` WIRD NICHT GEZEIGT — C-296 ═══════════════
            **Auftrag: *„Wenn du die Klasse zeigst, zeig sie als das,
            was sie ist — ein Feld mit bekannten Fehlern. Oder lass
            sie in dieser Runde weg und sag es."***

            `[cmd]` **Gemessen 2026-08-27, und es ist schlimmer als
            C-296 sagt:** die Spalte fuehrt **fallverdoppelte Tags**
            — `MAOI` (15) UND `maoi` (15), `SSRI` (10) UND `ssri`
            (10), `anticoagulant:doac` (8) UND `anticoagulant_doac`
            (7). **15 Wirkstoffe tragen `maoi`, nicht neun**, und
            sechs davon sind SSRI: Escitalopram, Citalopram,
            Paroxetin, Fluvoxamin, Vilazodon, Vortioxetin — jeder
            traegt `{SSRI, MAOI, maoi, ssri}` gleichzeitig.

            `[read]` **Ein Feld, das denselben Stoff zugleich als SSRI
            und als MAO-Hemmer fuehrt, ist nicht fehlerbehaftet,
            sondern unbrauchbar** — und die Verwechslung ist
            klinisch die gefaehrlichste, die es zwischen
            Antidepressiva gibt. **Deshalb weggelassen und hier
            gesagt**, bis C-296 durch ist. */}
      </>
    )
  }

  if (reiter === 'einnahme') {
    return (
      <>
        <LueckenKacheln felder={satz.einnahmeFelder} />
        <Vollstaendigkeit felder={satz.einnahmeFelder} />
        {da(satz.wannWie) && (
          <section className="v2-med-wirk-abschnitt">
            <span className="v2-eyebrow">Wann und wie</span>
            <p className="v2-med-wirk-satz">{satz.wannWie}</p>
          </section>
        )}
      </>
    )
  }

  if (reiter === 'sicherheit') {
    return (
      <>
        <LueckenKacheln felder={satz.sicherheitFelder} />
        <Vollstaendigkeit felder={satz.sicherheitFelder} />
        <Risikomarken risiken={satz.risiken} />
        <Vorsichtsblock punkte={satz.vorsicht} grund={satz.vorsichtGrund} />
        <Stichpunkte titel="Gegenanzeigen" punkte={satz.gegenanzeigen} ton="gefahr" />
        <Stichpunkte titel="Wer es nicht nehmen sollte" punkte={satz.werNicht}
                     ton="gefahr" />
      </>
    )
  }

  if (reiter === 'wechselwirkung') {
    return (
      <section className="v2-med-wirk-abschnitt">
        <span className="v2-eyebrow" data-ton="pruefen">Im Alltag</span>
        <p className="v2-med-wirk-satz">{satz.wechselwirkung}</p>
      </section>
    )
  }

  if (reiter === 'recht') {
    return (
      <section className="v2-med-wirk-abschnitt">
        <span className="v2-eyebrow">Verschreibungspflicht und Auflagen</span>
        <p className="v2-med-wirk-satz">{satz.recht}</p>
      </section>
    )
  }

  if (reiter === 'schwangerschaft') {
    return satz.schwangerschaft
      ? <SchwangerschaftsBlock lage={satz.schwangerschaft} />
      : null
  }

  if (reiter === 'mythen') {
    return (
      <div className="v2-col-gap" style={{ gap: 10 }}>
        {satz.mythen.map(m => (
          <p key={m} className="v2-med-wirk-satz v2-med-wirk-mythos">{m}</p>
        ))}
      </div>
    )
  }

  return <Fragen fragen={satz.fragen} />
}

/** Die Reiterleiste — Bauform aus `substanz-tafel.tsx` (G-180). */
function Reiterleiste(
  { reiter, offen, onWaehlen }: {
    reiter: WirkstoffReiter[]
    offen: WirkstoffReiterId | null
    onWaehlen: (id: WirkstoffReiterId) => void
  },
) {
  if (reiter.length <= 1) return null
  return (
    <div className="v2-med-wirk-reiter" role="tablist">
      {reiter.map(r => (
        <button
          key={r.id} type="button" role="tab"
          aria-selected={r.id === offen}
          className={`v2-med-wirk-reiter-knopf${r.id === offen ? ' ist-offen' : ''}`}
          onClick={e => { e.stopPropagation(); onWaehlen(r.id) }}
        >
          {r.titel}
          {r.zahl !== null && <span className="v2-med-wirk-reiter-zahl">{r.zahl}</span>}
        </button>
      ))}
    </div>
  )
}

/** Die ganze aufgeklappte Tafel. */
export function WirkstoffTafel(
  { satz, offenerReiter, onReiter }: {
    satz: WirkstoffSatz
    offenerReiter: WirkstoffReiterId | null
    onReiter: (id: WirkstoffReiterId) => void
  },
) {
  const reiter = wirkstoffReiter({
    ueberblickFelder: satz.ueberblickFelder,
    einnahmeFelder: satz.einnahmeFelder,
    sicherheitFelder: satz.sicherheitFelder,
    wechselwirkung: satz.wechselwirkung,
    recht: satz.recht,
    mythen: satz.mythen,
    schwangerschaft: satz.schwangerschaft !== null,
    fragen: satz.fragen.length,
  })
  const aktiv = (offenerReiter && reiter.some(r => r.id === offenerReiter))
    ? offenerReiter
    : ersterWirkstoffReiter(reiter)

  return (
    <div className="v2-med-wirk-tafel">
      <Reiterleiste reiter={reiter} offen={aktiv} onWaehlen={onReiter} />
      <div className="v2-med-wirk-tafel-inhalt">
        {aktiv
          ? <ReiterInhalt reiter={aktiv} satz={satz} />
          : (
            <p className="v2-muted" style={{ fontSize: 12, margin: 0 }}>
              Zu diesem Wirkstoff liegen keine Angaben vor.
            </p>
            )}
      </div>
      {/* ══ WARUM HIER KEIN KNOPF STEHT ══════════════════════════════
          `[read]` **Im Vorbild sitzt hier *„Zum Stack hinzufuegen"*.**
          Der entsprechende Weg waere *„zu meinen Medikamenten"* — und
          der ist **C-302**, nicht dieser Auftrag. `medical.
          user_medications` speichert im Klartext, und **C-285 ist
          unentschieden**.
          `[read]` **Ein Knopf, der nichts tut, waere schlechter als
          keiner** — genau der Befund aus G-182 („quellen haben keine
          funktion"). */}
      {satz.quellen.length > 0 && (
        <div className="v2-med-wirk-fuss">
          <span className="v2-eyebrow">Quellen</span>
          <div className="v2-med-wirk-quellen">
            {satz.quellen.slice(0, 6).map(q => (
              <span key={q} className="v2-mono">{q}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
