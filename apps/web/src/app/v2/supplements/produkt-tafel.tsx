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
import {
  etikettBuendel, mengeText, bekanntZaehlen, portionText, formLabel,
  type EtikettZeile,
} from '../../../lib/supplements/produkt-etikett'

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

export function ProduktTafel({ satz }: { satz: ProduktSatz }) {
  const buendel = React.useMemo(
    () => etikettBuendel(satz.inhalt), [satz.inhalt])
  const { bekannt, gesamt } = React.useMemo(
    () => bekanntZaehlen(satz.inhalt), [satz.inhalt])

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
        </div>
      </div>

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

      {/* ── Der Einnahmehinweis des Herstellers ───────────────────── */}
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

      {/* ── Der Fuss: die Firmen ──────────────────────────────────── */}
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
    </div>
  )
}
