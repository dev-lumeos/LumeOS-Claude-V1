'use client'

// Die aufgeklappte Produkttafel — G-453.
//
// **Tom, 2026-09-08, nach G-452:** *„das sind keine sauberen details,
// lass da eine strukturierte detailansicht mit allen daten erstellen,
// nicht so verstreut auf die breite und lesbar (check kontraste), zb
// wie medical sauber strukturiert."*
//
// ══ WAS VORHER DASTAND UND WARUM ES FALSCH WAR ══════════════════════
//
// `[cmd]` **G-452 zeigte EINE Tabelle ueber die volle Breite:** `Zutat`
// ganz links, `Menge` in der Mitte, `Art` und `LumeOS` ganz rechts.
// **Bei 1.600 px und 28 Zeilen ist das je Zeile ein Meter Augenweg**
// — und die vier Spalten standen fuer JEDE Zeile da, auch wo drei
// davon nichts sagten.
//
// `[read]` **Der Fehler war nicht die Tabelle, sondern ihre Breite und
// ihre Gleichbehandlung.** Calories 20 und FD&C Blue No. 1 sind nicht
// dasselbe und gehoeren nicht in dieselbe Zeilenform.
//
// ══ WAS AUS `medical/wirkstoff-tafel.tsx` UEBERNOMMEN IST ═══════════
//
//     Kopf          Name, ein Satz, Marken darunter
//     Kacheln       feste Breite, nebeneinander, abgegrenzt
//     Bilanzzeile   „3 von 3 Feldern gefuellt"
//     Abschnitte    Ueberschrift in `v2-eyebrow`, Inhalt darunter
//     Fuss          Quellen/Firmen unten, abgesetzt
//
// `[cmd]` **NICHT uebernommen: die Reiterleiste.** Der Auftrag sagt es
// ausdruecklich — **ein Produkt hat keine Rechtslage und keine
// Schwangerschaftshinweise.** `[read]` **Das Aussehen, nicht die
// Gliederung.** Bei den Wirkstoffen tragen sechs von acht Reitern bei
// allen 498 Inhalt; hier gaebe es zwei, und einer davon je nach
// Produkt leer.
//
// ══ DIE KONTRASTE ═══════════════════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-14 mit `tools/_g453-kontrast.mjs`, VOR
// dem Umbau: drei von sieben Textfarben unter WCAG AA.**
//
//     v2-eyebrow   10 px   2,88:1   Soll 4,5:1
//     th           10 px   2,88:1   Soll 4,5:1
//     v2-dim     10,5 px   2,88:1   Soll 4,5:1
//
// `[cmd]` **Alle drei sind dieselbe Farbe:** `--fg-dim`,
// `oklch(0.68 0.005 270)` auf Weiss. **Das ist genau, was Tom
// gesehen hat** — *„Art und LumeOS so blass, dass sie kaum lesbar
// sind"*.
//
// `[read]` **`--fg-dim` wird NICHT geaendert.** Der Wert steht in
// `apps/web/src/styles/themes/lume.css` und gilt fuer jedes Modul —
// eine Farbaenderung dort ist eine Entscheidung ueber die ganze
// Anwendung, nicht ueber diesen Reiter.
//
// `[cmd]` **Stattdessen `.v2-muted`** — dieselbe Rolle, aber
// `oklch(0.40 0.005 270)` und **gemessen 9,19:1**. `[read]` **Fuer
// Fliesstext gilt hier durchweg `v2-muted`; `v2-dim` bleibt nur dort,
// wo es keine Aussage traegt.**
import * as React from 'react'
import { Pill, Icon } from '@lumeos/ui'

import type { ProduktSatz } from '../../../lib/supplements/produkte-read'
// G-455: der weiche Meidestoff-Abgleich — serverfreie Rechnung (A-30).
import { meideTreffer } from '../../../lib/allergien/allergie-lage'
import {
  etikettBuendel, mengeText, bekanntZaehlen, portionText, formLabel,
  type EtikettZeile,
} from '../../../lib/supplements/produkt-etikett'
// G-492/A14: die geteilte Reiterleiste — dieselbe wie bei den
// Substanzen, nicht nachgebaut.
import { TafelReiterleiste } from './tafel-reiterleiste'
// G-492/A15-A18: welche Reiter es gibt und was die wartenden sagen.
import {
  produktReiter, ersterProduktReiter, WARTET_AUF,
  type ProduktReiterId,
} from '../../../lib/supplements/produkt-reiter-lage'

function da(v: string | null | undefined): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

/**
 * Die Kacheln des Kopfes — Medical-Vorbild, drei Zustaende.
 *
 * `[read]` **Immer alle drei, auch leer** (G-199/G-208): wer drei
 * Produkte durchklickt, will die Portion an derselben Stelle finden.
 * **Eine fehlende Kachel verschiebt alle anderen.**
 *
 * `[read]` **Und eine leere Kachel sagt, dass sie leer IST** — kein
 * Strich, der wie eine Angabe aussieht.
 */
function KopfKacheln({ satz }: { satz: ProduktSatz }) {
  const kacheln = [
    { id: 'portion', label: 'Portion',
      wert: portionText(satz.portionsgroesse, satz.portionseinheit) },
    { id: 'packung', label: 'Packung',
      wert: portionText(satz.packungsgroesse, satz.packungseinheit) },
    // `[read]` **GTIN in Schreibmaschinenschrift** — eine 13-stellige
    // Zahl ist eine Kennung, kein Wert, und liest sich nur
    // gleichschrittig.
    { id: 'gtin', label: 'GTIN', wert: satz.gtin, mono: true },
  ]
  const gefuellt = kacheln.filter(k => da(k.wert)).length
  return (
    <>
      <div className="v2-supp-prod-kacheln">
        {kacheln.map(k => (
          <div key={k.id} className="v2-supp-prod-kachel"
               data-zustand={da(k.wert) ? 'wert' : 'leer'}>
            <span className="v2-supp-prod-kachel-label">{k.label}</span>
            {da(k.wert)
              ? (
                <span className={`v2-supp-prod-kachel-wert${k.mono ? ' v2-mono' : ''}`}>
                  {k.wert}
                </span>
                )
              : (
                // `[read]` **Der Wortlaut sagt, WER nichts gesagt hat.**
                // „unbekannt" waere eine Aussage ueber das Produkt;
                // hier fehlt die Angabe in der Quelle.
                <span className="v2-supp-prod-kachel-leer">
                  im Etikett nicht angegeben
                </span>
                )}
          </div>
        ))}
      </div>
      {/* Die Bilanzzeile des Vorbilds. */}
      <div className="v2-supp-prod-bilanz">
        {gefuellt} von {kacheln.length} Feldern gefüllt
      </div>
    </>
  )
}

/** Eine Zeile des Etiketts. */
function Zutatzeile({ z }: { z: EtikettZeile }) {
  const menge = mengeText(z)
  return (
    <li className={`v2-supp-prod-zutat${z.eingerueckt ? ' ist-kind' : ''}`}
        data-mischung={z.istMischung ? '' : undefined}>
      <span className="v2-supp-prod-zutat-name">
        {/* `[read]` **Das Zeichen bleibt aus G-452** — die Einrueckung
            allein geht auf einem schmalen Schirm unter. */}
        {z.eingerueckt && <span className="v2-supp-prod-ast">↳</span>}
        {z.ingredient_name}
      </span>
      {/* ══ DIE MENGE STEHT NEBEN DEM NAMEN ═══════════════════════════
          `[cmd]` **Das ist der eigentliche Umbau.** Vorher lag
          zwischen Name und Menge die halbe Fensterbreite; jetzt
          stehen sie in EINER Zeile nebeneinander, und der Block ist
          auf `max-width` begrenzt. */}
      {menge
        ? <span className="v2-supp-prod-zutat-menge">{menge}</span>
        // `[cmd]` **`not_stated` bei 1.591.063 von 3.000.982 Zeilen**
        // — die Mehrheit. `[read]` **Kein Strich, keine Null.**
        : <span className="v2-supp-prod-zutat-ohne">ohne Mengenangabe</span>}
      {/* `[read]` **Nur das BEKANNTE wird markiert** (G-452) — bei
          89,9 % ohne `supplement_id` waere die Gegenmarke Rauschen.
          `[cmd]` Und sie steht jetzt AN der Zutat, nicht in einer
          vierten Spalte am rechten Rand. */}
      {z.bekannt && (
        <span className="v2-supp-prod-zutat-marke">
          <Icon name="check" className="v2-ic v2-ic-sm" />
          auswertbar
        </span>
      )}
    </li>
  )
}

/**
 * Ein Buendel — Naehrwerte, Wirkstoffe, Mischungen, Hilfsstoffe.
 *
 * `[read]` **Ueberschrift wie im Medical-Vorbild** (`v2-eyebrow`),
 * Inhalt als Liste darunter.
 */
function Buendel(
  { titel, zeilen }: { titel: string; zeilen: EtikettZeile[] },
) {
  return (
    <section className="v2-supp-prod-abschnitt">
      <span className="v2-eyebrow">{titel} · {zeilen.length}</span>
      <ul className="v2-supp-prod-liste">
        {zeilen.map(z => <Zutatzeile key={z.id} z={z} />)}
      </ul>
    </section>
  )
}

export function ProduktTafel({ satz, meidestoffe = [], aktion }: {
  satz: ProduktSatz
  /**
   * G-493/N5: was rechts in der Reiterleiste steht — meist NICHTS.
   *
   * **Tom:** *„dann erweitert gleich darunter derselbe button? dann
   * kann man es gleich weglassen"*
   *
   * `[read]` **Die Tafel klappt unter ihrer Zeile auf, und die Zeile
   * traegt den Knopf schon.** `[cmd]` **Der einzige Aufrufer
   * (`tab-produkte.tsx:1265`) setzt ihn deshalb nicht.**
   *
   * `[read]` **Das Prop bleibt** — ein Aufrufer ohne eigene Zeile
   * braeuchte es. **Es wird nur nicht belegt.**
   */
  aktion?: React.ReactNode
  /**
   * G-455: die Meidestoffe — der WEICHE Filter.
   *
   * **Tom:** *„MEIDESTOFFE … WEICH: Produkt wird markiert. ‚Keine
   * Farbstoffe' ist eine Haltung, keine Diagnose."*
   *
   * ══ WARUM DIE MARKE IN DER TAFEL STEHT, NICHT IN DER LISTE ═══════
   *
   * `[cmd]` **Gemessen 2026-09-15:** eine Abfrage *„welche Produkte
   * enthalten <Stoff>"* kostet **291 ms** (`DISTINCT product_id` ueber
   * `product_contents`, `LIKE '%lactose%'`). **Bei drei Meidestoffen
   * und jedem Tastendruck waere das knapp eine Sekunde extra** — und
   * der harte Allergiefilter laeuft daneben schon.
   *
   * `[read]` **Die Tafel hat die Zutaten ohnehin** — dort kostet die
   * Pruefung nichts. **Und sie ist der Ort, an dem die Frage
   * aufkommt:** wer wissen will, ob etwas drin ist, macht das Produkt
   * auf.
   */
  meidestoffe?: string[]
}) {
  const buendel = React.useMemo(
    () => etikettBuendel(satz.inhalt), [satz.inhalt])
  const { bekannt, gesamt } = React.useMemo(
    () => bekanntZaehlen(satz.inhalt), [satz.inhalt])

  // G-455: trifft ein Meidestoff eine der Zutaten?
  const gemieden = React.useMemo(
    () => meideTreffer(satz.inhalt.map(z => z.ingredient_name), meidestoffe),
    [satz.inhalt, meidestoffe])


  // ══ G-492/A15: die vier Reiter ═══════════════════════════════════
  //
  // `[read]` **Der Zustand liegt in der Tafel, nicht im Reiter
  // darueber** — jede Tafel hat ihren eigenen offenen Reiter, und
  // wer ein zweites Produkt aufklappt, faengt wieder beim Ueberblick
  // an. `[cmd]` **Das ist die Bauform der Substanz-Tafel nicht** —
  // dort haelt `substanz-detail.tsx` den Reiter fuer ALLE Zeilen,
  // damit er beim Durchklicken stehenbleibt. `[read]` **Hier waere
  // das falsch:** der Ueberblick ist der Reiter, den man sehen will.
  const [reiterOffen, setReiter] =
    React.useState<ProduktReiterId>(ersterProduktReiter())
  const reiter = React.useMemo(
    () => produktReiter({ etikettZeilen: gesamt }), [gesamt])
  const aktiv = reiter.some(r => r.id === reiterOffen)
    ? reiterOffen : ersterProduktReiter()


  return (
    <div className="v2-supp-prod-tafel">
      {/* ── Kopf: Name, Marken, Kacheln ───────────────────────────── */}
      <div className="v2-supp-prod-kopf">
        <div className="v2-supp-prod-name">{satz.name_en}</div>
        <div className="v2-supp-prod-marken">
          {satz.marke && <Pill variant="acc">{satz.marke}</Pill>}
          {satz.market_status && <Pill>{satz.market_status}</Pill>}
          {/* `[cmd]` **G-453/4: ohne E-Code** — Tom: *„der E-Code
              (E0159 etc.) gehoert NICHT in die Anzeige."* */}
          {satz.produktform && <Pill>{formLabel(satz.produktform)}</Pill>}
          {/* ══ G-455: der WEICHE Filter markiert ═══════════════════
              **Tom:** *„MEIDESTOFFE … WEICH: Produkt wird markiert."*

              `[read]` **Eine Marke, kein Verschwinden** — und sie
              nennt die Zutat, die getroffen hat. **„Enthaelt etwas,
              das du meidest" ohne das Wort waere eine Behauptung, der
              man nicht nachgehen kann.**

              `[read]` **`warn`, nicht `neg`** — es ist keine Gefahr,
              nur unerwuenscht. Die Farbordnung aus G-196 gilt. */}
          {/* `[cmd]` **`Pill` nimmt kein `title`** (`packages/ui`,
              `PillProps`) — und das Paket gehoert allen Apps.
              `[read]` **Also ein `<span>` darum**, statt die
              Schnittstelle fuer einen Reiter zu erweitern. */}
          {gemieden && (
            <span title={`„${gemieden}" steht auf deiner Meideliste — `
              + 'markiert, nicht entfernt.'}>
              <Pill variant="warn">
                <Icon name="alert" className="v2-ic v2-ic-sm" />
                Meidestoff: {gemieden}
              </Pill>
            </span>
          )}
        </div>
      </div>

      {/* ══ G-492/A11+A12: DIE REITERLEISTE MIT DER AKTION ════════
          **Tom, 2026-09-08:** *„bauen das wie bei supplements mit
          subnav, dann muss man nicht mehr soviel runternavigieren"*

          `[cmd]` **Gemessen VOR dem Umbau** (`_g492-vorher.mjs`):
          **keine Leiste, Aktionsblock bei y=1625** — ausserhalb des
          Schirms. `[read]` **Die Aktion steht jetzt in der Leiste
          und bleibt sichtbar, egal welcher Reiter offen ist (A12).**

          `[cmd]` **Dieselbe Bauform wie die Substanz-Tafel** (A14) —
          `TafelReiterleiste`, nicht nachgebaut. */}
      {/* ══ G-493/N5: EIN KNOPF, NICHT ZWEI ═══════════════════════
          **Tom, 2026-09-08, mit Pfeilen im Foto:** *„dann erweitert
          gleich darunter derselbe button? dann kann man es gleich
          weglassen"*

          `[cmd]` **Gemessen: die Tafel klappt DIREKT unter ihrer
          Zeile auf** — und die Zeile traegt den Knopf schon
          (`tab-produkte.tsx`, Aktionsspalte aus G-492/A1).
          **Zwei gleiche Knoepfe untereinander, 4 px auseinander.**

          `[read]` **Der zweite faellt weg** — nicht der erste: die
          Zeile ist der Ort, an dem man die Aktion sucht, ohne
          aufzuklappen.

          `[cmd]` **`aktion` bleibt ein PROP der Leiste** — die
          Substanz-Tafel braucht ihn weiter (A13/A14), und ein
          Aufrufer, der die Tafel ohne eigene Zeile zeigt, koennte
          ihn wieder setzen. `[read]` **Hier wird er nur nicht
          belegt.** */}
      <TafelReiterleiste
        reiter={reiter} offen={aktiv} onWaehlen={setReiter}
        aktion={aktion}
      />

      {aktiv === 'ueberblick' && <>
      <KopfKacheln satz={satz} />

      {/* ── Das Etikett, nach Kategorie gebuendelt ────────────────── */}
      {buendel.length > 0
        ? (
          <>
            <div className="v2-supp-prod-etikettkopf">
              <span className="v2-eyebrow">Etikett · {gesamt} Zeilen</span>
              {/* `[read]` **Zwei Zahlen, keine Quote** (G-452) —
                  „6 %" sagt nicht, ob von achtzehn oder achtzehnhundert
                  die Rede ist. */}
              <Pill variant={bekannt > 0 ? 'acc' : undefined}>
                <Icon name="check" className="v2-ic v2-ic-sm" />
                {bekannt} von {gesamt} Zutaten kennt LumeOS
              </Pill>
            </div>
            <div className="v2-supp-prod-buendel">
              {buendel.map(b => (
                <Buendel key={b.id} titel={b.titel} zeilen={b.zeilen} />
              ))}
            </div>
          </>
          )
        : (
          // A7: ein Produkt ohne Etikettzeilen.
          // `[read]` **Ein benannter Leerhinweis** (E-72) — sonst sieht
          // ein Produkt ohne erfasste Zutaten aus wie eines, das noch
          // laedt.
          <p className="v2-muted v2-supp-prod-satz">
            Zu diesem Produkt sind keine Etikettzeilen erfasst.
          </p>
          )}

      </>}

      {/* ══ REITER 2: ANWENDUNG ═══════════════════════════════════
          `[read]` **Der Einnahmehinweis stand bisher mitten in der
          Tafel** — jetzt traegt er einen eigenen Reiter, weil er die
          einzige Angabe ist, die man LIEST statt ueberfliegt. */}
      {aktiv === 'anwendung' && (
      <section className="v2-supp-prod-abschnitt">
        <span className="v2-eyebrow">Einnahmehinweis des Herstellers</span>
        {da(satz.suggested_use)
          ? (
            // `[read]` **Woertlich, auf Englisch, in Anfuehrung** — es
            // ist ein Zitat vom Etikett, keine Empfehlung von LumeOS.
            // **Keine Uebersetzung erfinden** (C-489).
            <p className="v2-muted v2-supp-prod-satz v2-supp-prod-zitat">
              {satz.suggested_use}
            </p>
            )
          : (
            // A7: ein Produkt ohne Hinweis.
            // `[read]` **Der Satz sagt, WO nichts steht** — nicht
            // „keine Einnahmeempfehlung". Letzteres waere eine Aussage
            // ueber das Produkt.
            <p className="v2-muted v2-supp-prod-satz">
              Das Etikett nennt keinen Einnahmehinweis.
            </p>
            )}
      </section>
      )}

      {/* ══ REITER 3 UND 4: VORBEREITET, NICHT LEER ═══════════════
          **Tom:** *„einbauen und ausdokumentieren, sobald daten da
          sind einbinden."*

          `[read]` **A17: ein SATZ, kein leeres Feld** — die Lehre
          aus G-482 und G-486: eine leere Flaeche ohne Grund sieht
          aus wie ein Fehler, und G-486 wurde deshalb VIERMAL
          gemeldet.

          `[cmd]` **A18: Quelle und Punkt stehen in
          `produkt-reiter-lage.ts`** — gemessen, nicht geraten:
          `information_schema` kennt die Spalten heute nicht (0
          Zeilen), und C-527 ist ein Recherchepunkt ohne
          festgelegte Namen. */}
      {aktiv === 'hinweise' && <WartenderReiter welcher="hinweise" />}

      {/* ══ G-495: DER ETIKETT-REITER ═════════════════════
          **Tom, 2026-09-08:** *„beim aufruf des produktes den link
          abrufen und sicherheitshalber ein not available bild
          anlegen, das wir zeigen koennen, wenn nichts kommt"*

          `[read]` **Der LINK steht immer** — er wird aus `dsld_id`
          berechnet und faellt nie aus. `[read]` **Das BILD steht
          nicht**, und warum, sagt die Flaeche selbst. */}
      {aktiv === 'etikett' && <EtikettReiter dsldId={satz.dsld_id} />}

      {/* ── Der Fuss: die Firmen ──────────────────────────────────── */}
      {aktiv === 'ueberblick' && (
      <div className="v2-supp-prod-fuss">
        <span className="v2-eyebrow">Firmen</span>
        {satz.firmen.length > 0
          ? (
            <div className="v2-supp-prod-firmen">
              {satz.firmen.map((f, i) => (
                <div key={`${f.name}-${i}`} className="v2-supp-prod-firma">
                  <span className="v2-supp-prod-firma-name">{f.name}</span>
                  {(f.land || f.rolle) && (
                    <span className="v2-muted v2-supp-prod-firma-rolle">
                      {[f.rolle, f.land].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </div>
              ))}
            </div>
            )
          : (
            <p className="v2-muted v2-supp-prod-satz">
              Zu diesem Produkt ist keine Firma hinterlegt.
            </p>
            )}
      </div>
      )}

      {/* ══ G-493/N5: DAS MODAL HAENGT AN DER ZEILE ═════════
          `[cmd]` **Hier stand `{modalOffen && <ProduktAktionModal
          …>}`** — erreichbar nur ueber den Knopf in der
          Reiterleiste, und der ist mit N5 weggefallen.

          `[read]` **Ein Zustand, den nichts mehr setzen kann, ist
          kein Rueckfall, sondern eine Attrappe** (G-163): er laedt
          dazu ein, ihn fuer gebaut zu halten.

          `[cmd]` **Das Modal steht weiter — in `tab-produkte.tsx`**,
          am Knopf der Zeile (G-492/A2). **Ein Modal, ein Ort.** */}
    </div>
  )
}

/**
 * Ein Reiter, der auf Daten wartet — A17.
 *
 * `[read]` **Er sagt, WAS kommt und WOHER** — nicht nur „noch
 * nichts". `[cmd]` **Die Lehre aus G-486:** ein wortloses Fehlen
 * wurde viermal als Fehler gemeldet.
 */
function WartenderReiter({ welcher }: { welcher: 'hinweise' | 'etikett' }) {
  const w = WARTET_AUF[welcher]
  return (
    <section className="v2-supp-prod-abschnitt" data-probe={`wartet-${welcher}`}>
      <p className="v2-muted v2-supp-prod-satz">{w.satz}</p>
      {/* `[read]` **Die Quelle steht MIT auf dem Schirm**, nicht nur
          im Quelltext — wer den Reiter offen hat, soll sehen, dass
          das Warten einen Grund und eine Adresse hat.

          `[cmd]` **`v2-muted`, nicht `v2-dim`** — der G-453-Waechter
          hat das gefangen: `v2-dim` misst **2,88:1**, WCAG AA
          verlangt **4,5:1**; `v2-muted` liegt bei **9,19:1**.
          `[read]` **Die Quelle SOLL gelesen werden** — sonst braucht
          sie nicht dazustehen. */}
      <p className="v2-muted v2-supp-prod-satz" style={{ fontSize: 10.5 }}>
        Quelle: {w.quelle} · {w.punkt}
      </p>
    </section>
  )
}

/**
 * Der Etikett-Reiter — G-495.
 *
 * ══ WAS GEMESSEN WURDE, BEVOR HIER ETWAS ENTSTAND ═══════════════════
 *
 * **Tom, 2026-09-08:** *„beim aufruf des produktes den link abrufen
 * und sicherheitshalber ein not available bild anlegen, das wir
 * zeigen koennen, wenn nichts kommt"*
 *
 * `[cmd]` **Zwanzig echte DSLD-Ids gegen
 * `api.ods.od.nih.gov/dsld/v9/label/<id>` gemessen**
 * (`tools/_g495-messen.mjs`, 2026-09-22):
 *
 *     Antworten 200        20/20
 *     MIT thumbnail        11/20
 *     Median               288 ms   (279 bis 1.069 ms)
 *
 * `[cmd]` **Die Punktdatei nannte das Doku-Beispiel mit BEIDEN
 * Feldern leer** — `"pdf": "", "thumbnail": ""`. `[read]` **Das war
 * nicht der Regelfall:** 11 von 20 tragen einen Wert.
 *
 * ══ UND DANN DIE LUECKE, DIE DAS BAUEN STOPPT ═══════════════════════
 *
 * `[cmd]` **`thumbnail` ist ein DATEINAME, keine Adresse:**
 * `"296171_thumbnail.jpg"`.
 *
 * `[cmd]` **Sieben Grundadressen gemessen, keine liefert ein Bild:**
 *
 *     api.ods.od.nih.gov/dsld/s3/thumbnails/…   403
 *     dsld.od.nih.gov/api/label/<id>/thumbnail  403
 *     dsld.od.nih.gov/images/…                  403
 *     api…/v9/label/<id>/thumbnail              200, aber text/html
 *     api…/v9/thumbnail/…                       200, aber text/html
 *     api…/v9/images/…                          200, aber text/html
 *     dsld-assets.od.nih.gov                    kein DNS
 *
 * `[cmd]` **Die Schnittstellenbeschreibung nennt sieben Endpunkte**
 * (`/v9/label/{id}`, `/v9/search-filter`, `/v9/browse-*`, …) —
 * **KEINEN fuer Bilder.**
 *
 * `[cmd]` **Auch die Etikettseite selbst antwortet unserem Aufruf mit
 * 403** (Botschutz), waehrend die Schnittstelle 200 gibt.
 *
 * `[read]` **Ohne Grundadresse gibt es kein Bild zu zeigen** —
 * **A2 („ein Produkt MIT Bild") ist mit dieser Quelle nicht
 * erfuellbar.** `[read]` **Gemeldet, nicht geraten:** eine
 * zusammengebaute Adresse waere eine Behauptung, die bei jedem
 * Produkt bricht.
 *
 * ══ WAS DESHALB HIER STEHT ══════════════════════════════════════════
 *
 * `[read]` **Der Link — er ist aus `dsld_id` berechnet und faellt
 * nie aus** (A5). **Und der Rueckfallsatz, den Tom verlangt hat.**
 *
 * `[cmd]` **Kein `fetch` beim Oeffnen:** solange es keine Bildadresse
 * gibt, waere ein Abruf je Tafel eine Rundreise fuer nichts —
 * 288 ms Median, ohne Ergebnis.
 */
function EtikettReiter({ dsldId }: { dsldId: number | null }) {
  // `[read]` **Ohne `dsld_id` gibt es keine Etikettseite** — das
  // Produkt stammt dann nicht aus dem DSLD-Import.
  if (dsldId === null) {
    return (
      <section className="v2-supp-prod-abschnitt" data-probe="etikett-ohne-id">
        <p className="v2-muted v2-supp-prod-satz">
          Dieses Produkt stammt nicht aus dem DSLD-Katalog — es gibt
          keine Etikettseite dazu.
        </p>
      </section>
    )
  }
  const seite = `https://dsld.od.nih.gov/label/${dsldId}`
  const bild = `/api/supplements/etikett?dsld_id=${dsldId}`

  // ══ G-496: DREI ZUSTAENDE, KEIN VIERTER ════════════════
  //
  // `[read]` **`laedt` ist nicht dasselbe wie `kein Bild`** — ohne
  // den Unterschied zeigte die Flaeche waehrend des Abrufs den
  // Rueckfallsatz und widerriefe ihn eine Sekunde spaeter.
  const [stand, setStand] = React.useState<'laedt' | 'da' | 'ohne'>('laedt')

  // `[read]` **Beim Wechsel des Produkts zurueck auf `laedt`** —
  // sonst stuende das Bild des vorigen Produkts, bis das neue kommt.
  React.useEffect(() => { setStand('laedt') }, [dsldId])

  return (
    <section className="v2-supp-prod-abschnitt" data-probe="etikett">
      {/* ══ A12: DAS BILD, NICHT DAS PDF ══════════════════
          `[cmd]` **Gemessen 2026-09-23: 20/20 Ids liefern ein echtes
          JPEG, Median 21 KB** — gegen 274 KB je PDF. `[read]` **Kein
          Rendern, kein Betrachter, kein fremdes Paket.**

          `[read]` **`<img>` ueber die EIGENE Route** — die NIH
          schickt `X-Frame-Options: DENY`, und ein direkter Verweis
          auf ihre Adresse gaebe unsere Nutzer an sie weiter.

          `[cmd]` **`onError` entscheidet, nicht ein Vorab-Abruf:**
          der Browser laedt das Bild ohnehin: ein zweiter Abruf, nur
          um zu fragen, ob es existiert, zaehlte doppelt gegen die
          1.000 je Stunde. */}
        {/* ══ KEIN `loading="lazy"`, KEIN `display: none` ═════
            `[cmd]` **Gemessen 2026-09-23: das Bild wurde NIE
            abgerufen** — `netz: []`, `complete: false`, und die
            Flaeche blieb auf *„lädt …"* stehen.

            `[read]` **Ein `loading="lazy"`-Bild, das `display: none`
            traegt, ist nie im Sichtfeld** — also laedt es nie, also
            wird es nie sichtbar. **Die Bedingung verhinderte genau
            das Ereignis, auf das sie wartete.**

            `[cmd]` **Jetzt `visibility` statt `display`**: das Bild
            belegt seinen Platz und laedt, ist aber unsichtbar, bis
            `onLoad` kommt. `[read]` **Und ohne `lazy`** — der Reiter
            wird erst auf Klick gerendert, spaeter geht es nicht. */}
      <img
        src={bild}
        alt={`Etikett des Produkts, DSLD ${dsldId}`}
        className="v2-supp-prod-etikett-bild"
        data-probe="etikett-bild"
        style={{
          visibility: stand === 'da' ? 'visible' : 'hidden',
          position: stand === 'da' ? 'static' : 'absolute',
        }}
        onLoad={() => setStand('da')}
        onError={() => setStand('ohne')}
      />

      {stand === 'laedt' && (
        <p className="v2-muted v2-supp-prod-satz" data-probe="etikett-laedt">
          Das Etikett wird geladen …
        </p>
      )}

      {/* ══ A5: DAS RUECKFALLFELD ══════════════════════
          **Tom:** *„ein not available bild"*

          `[read]` **Ein ruhiges Feld mit einem Satz, KEIN leeres** —
          die Lehre aus den Ghostentries (G-482, G-486): eine leere
          Flaeche ohne Grund sieht aus wie ein Fehler. */}
      {stand === 'ohne' && (
        <div className="v2-supp-prod-etikett-leer" data-probe="etikett-rueckfall">
          <Icon name="alert" className="v2-ic" />
          <p className="v2-muted v2-supp-prod-satz" style={{ margin: 0 }}>
            Für dieses Produkt liegt kein Etikettenbild vor.
          </p>
          <p className="v2-muted" style={{ fontSize: 10.5, margin: 0 }}>
            Die NIH führt zu dieser Kennung kein Bild — die Etikettseite
            steht trotzdem offen.
          </p>
        </div>
      )}

      {/* `[read]` **Der Link steht IMMER** (A7) — er ist berechnet,
          nicht abgerufen, und faellt in keinem der drei Zustaende aus.
          `[cmd]` **`rel="noreferrer"`**: ein fremder Ort braucht
          unsere Herkunft nicht. */}
      <p className="v2-supp-prod-satz" style={{ marginTop: 10 }}>
        <a href={seite} target="_blank" rel="noreferrer noopener"
           data-probe="etikett-link">
          Etikett bei der NIH ansehen
        </a>
        <span className="v2-muted" style={{ fontSize: 10.5, marginLeft: 8 }}>
          dsld.od.nih.gov/label/{dsldId}
        </span>
      </p>

      {/* ══ A14: DIE QUELLE, WO DAS BILD STEHT ═════════════
          `[cmd]` **Die Daten sind gemeinfrei (CC0 1.0)** — **die
          Quelle ist trotzdem zu nennen**, und zwar dort, wo das Bild
          steht, nicht nur im Quelltext. */}
      {/* `[cmd]` **`v2-muted`, nicht `v2-dim`** — der G-453-Waechter
          hat `v2-dim` mit **2,88:1** gemessen, WCAG AA verlangt 4,5.
          `[read]` **Eine Quellenangabe, die man nicht lesen kann,
          ist keine.**

          `[read]` **Der Name steht auf EINER Zeile** — umgebrochen
          traegt das DOM *„Office of Dietary\n Supplements"*, und
          eine Suche nach dem Namen faende ihn nicht. */}
      <p className="v2-muted" style={{ fontSize: 10, marginTop: 2 }}
         data-probe="etikett-quelle">
        Quelle: National Institutes of Health, Office of Dietary Supplements
        {' · '}Dietary Supplement Label Database (CC0 1.0)
      </p>
    </section>
  )
}
