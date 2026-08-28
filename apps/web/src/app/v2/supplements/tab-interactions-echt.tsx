'use client'

// Der Interactions-Tab aus dem Regelwerk (G-110, C-133).
//
// **WAS G-91 GEMELDET HAT, GILT NICHT MEHR.** `[cmd]` Damals war der
// Tab blockiert, weil es kein Regelwerk gab. C-133 hat es geliefert:
// `supplements.rule_catalog` mit **64 Regeln** und
// `rule_assessment(user, datum)` mit **drei Zustaenden**.
//
// **DIE GRENZE** (C-108, F-02): *„Nennen ja, bewerten nein."*
//
//   - **Kein Score.** Es gibt keine Zahl, die den Stack benotet.
//   - **Keine Blockade.** Nichts wird gesperrt oder abgeraten.
//   - **Keine Zeitplan-Urteile.** F-02 nennt *„your current schedule
//     is fine"* ausdruecklich als das, was draussen bleibt.
//   - **Der einzige Effekt ist `physician_referral`** — und der steht
//     als Wort da („aerztlich abklaeren"), nicht als Handlung.
//
// `[read]` Die Texte kommen unveraendert aus `message_de` des
// Katalogs. **Sie sind kuratiert, nicht generiert** — hier wird kein
// Satz gebildet, nur einer gezeigt.
import * as React from 'react'
import { Card, Pill, Icon } from '@lumeos/ui'

import type { Regel, RegelStand } from '../../../lib/supplements/regeln-read'
// G-218: die feinstufige Bewertung. Farben, Rangfolge, Klartext und
// die Messung dahinter stehen dort — serverfrei, deshalb hier nur
// Werte und keine Datenbanknaehe (A-30).
import {
  STUFEN_FARBE, STUFEN_TEXT, HANDLUNG_TEXT,
  istHervorgehoben, istArztsache, nachStufe, verteilung,
} from '../../../lib/supplements/regel-stufen'

/** Die Regelart im Klartext — `lab_interference` sagt allein nichts. */
const ART_TEXT: Record<string, string> = {
  interaction: 'Wechselwirkung',
  nutrient_gap: 'Naehrstoffluecke',
  safety: 'Sicherheit',
  monitoring: 'Beobachtung',
  information: 'Information',
  lab_interference: 'Laborstoerung',
  lab_monitoring: 'Laborkontrolle',
}

export function InteractionsEchtTab({ d }: { d: RegelStand }) {
  if (d.fehler) {
    return (
      <Card title="Interactions">
        <p className="v2-muted" style={{ fontSize: 12 }}>
          Regelwerk nicht gelesen: {d.fehler}
        </p>
      </Card>
    )
  }

  // Schwerste zuerst — die Farbe allein ordnet nicht, siehe
  // `SCHWERE_RANG`.
  const erfuellt = nachStufe(d.regeln.filter(r => r.zustand === 'fulfilled'))
  const fehlend = nachStufe(d.regeln.filter(r => r.zustand === 'missing_input'))
  // G-218: die Verteilung der ZUTREFFENDEN Regeln, nicht des Katalogs.
  const stufen = verteilung(erfuellt)

  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      <Card title="Regelwerk" sub={`${d.regeln.length} von ${d.katalog} Regeln geprueft`}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 10 }}>
          <Zaehler label="Zutreffend" wert={d.erfuellt} farbe="var(--neg)" />
          <Zaehler label="Nicht zutreffend" wert={d.nichtErfuellt} farbe="var(--fg-dim)" />
          <Zaehler label="Daten fehlen" wert={d.fehlend} farbe="var(--warn)" />
        </div>
        {/* ══ G-218: die Verteilung der zutreffenden Regeln ═════════
            `[read]` **Gezaehlt wird, was ZUTRIFFT, nicht der
            Katalog.** Eine Kopfzeile „10 kritisch" waere eine
            Falschmeldung, solange keine davon feuert. */}
        {stufen.length > 0 && (
          <div style={{
            display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10,
          }}>
            {stufen.map(({ stufe, anzahl }) => (
              <Pill key={stufe} style={stufe === 'critical'
                ? {
                    color: 'var(--bg)', background: 'var(--neg)',
                    borderColor: 'var(--neg)', fontWeight: 600,
                  }
                : { color: STUFEN_FARBE[stufe] }}>
                {anzahl}× {STUFEN_TEXT[stufe]}
              </Pill>
            ))}
          </div>
        )}
        {/*
          `[read]` DER SATZ MUSS DASTEHEN. Ohne ihn liest sich eine
          zutreffende Regel wie ein Befund ueber den Nutzer. Sie ist
          aber nur: beide Seiten sind im Stack, und dazu gibt es eine
          kuratierte Zeile.
        */}
        <p className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
          Eine <strong>zutreffende</strong> Regel heisst: beide Seiten
          stehen in deinem Stack. Sie ist ein <strong>Hinweis, keine
          Bewertung</strong> — LumeOS gibt keine Dosierung vor, sperrt
          nichts und rechnet daraus keine Note.
        </p>
        {/* ══ G-188/189: die Zusage aus G-187 lebt hier weiter ══════
            `[cmd]` **Sie stand bis G-189 in `SuppInteractions`** —
            dem Rueckfallzweig, der entfernt wurde, weil er nicht
            erreichbar war. **Damit waere sie ersatzlos verschwunden.**

            `[read]` **Ohne diesen Satz liest man Medikamentenhinweise
            als Stack-Paarungen** — und das waere eine Aussage, die die
            Daten nicht hergeben. `[cmd]` `supplement_interactions`
            fuehrt **77 gegen Medikamente, 1 gegen Alkohol, 0 zwischen
            zwei Supplements** (gemessen 2026-08-28). */}
        <p className="v2-dim" style={{
          fontSize: 11, lineHeight: 1.55, marginTop: 8, marginBottom: 0,
        }}>
          Der Katalog führt <strong>78 Wechselwirkungen — alle gegen
          Medikamente oder Alkohol</strong>, keine zwischen zwei
          Supplements. Paarungen zwischen zwei Supplements werden hier
          also nicht geprüft.
        </p>
      </Card>

      {erfuellt.length > 0 && (
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 8 }}>
            Zutreffend
          </div>
          <div className="v2-col-gap" style={{ gap: 10 }}>
            {erfuellt.map(r => <RegelKarte key={r.rule_id} r={r} />)}
          </div>
        </div>
      )}

      {fehlend.length > 0 && (
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>
            Daten fehlen ({fehlend.length})
          </div>
          {/*
            `[read]` **Der Kern von C-132:** Eine Regel, die auf
            fehlende Daten trifft, **faellt nicht stumm durch.** Sie
            sagt, WAS fehlt — dieselbe Sprache wie „braucht ACWR" beim
            Erholungswert und `NO_REFERENCE` bei den Naehrstoffen.
          */}
          <p className="v2-muted" style={{ fontSize: 11.5, marginBottom: 8, lineHeight: 1.5 }}>
            Diese Regeln liessen sich nicht pruefen. <strong>Sie sind
            weder zutreffend noch ausgeschlossen</strong> — es fehlen
            Angaben.
          </p>
          <div className="v2-col-gap" style={{ gap: 10 }}>
            {fehlend.map(r => <RegelKarte key={r.rule_id} r={r} />)}
          </div>
        </div>
      )}

      <Card>
        <p className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
          <strong>{d.nichtErfuellt} Regeln treffen nicht zu</strong> und
          stehen deshalb nicht einzeln da. Sie werden bei jeder Aenderung
          am Stack neu geprueft.
        </p>
      </Card>
    </div>
  )
}

function Zaehler({ label, wert, farbe }: { label: string; wert: number; farbe: string }) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span className="v2-eyebrow">{label}</span>
      <span className="v2-num" style={{ fontSize: 20, color: farbe }}>{wert}</span>
    </span>
  )
}

function RegelKarte({ r }: { r: Regel }) {
  const farbe = STUFEN_FARBE[r.severity ?? ''] ?? 'var(--acc-suppl)'
  const fehlt = r.zustand === 'missing_input'
  // ══ G-218: die zwei Achsen, getrennt ausgezeichnet ═════════════
  // `[cmd]` **`critical` und `high` rendern beide in `--neg`**
  // (`oklch(0.50 0.16 22)`, gemessen 2026-08-28). Ein zweiter Rotton
  // daneben waere nicht unterscheidbar — **`critical` bekommt
  // deshalb Flaeche statt Farbe.**
  const hervor = !fehlt && istHervorgehoben(r.severity)
  const arzt = !fehlt && istArztsache(r.aktion)
  return (
    <Card style={hervor
      ? {
          borderColor: 'color-mix(in oklch, var(--neg) 55%, var(--border))',
          background: 'color-mix(in oklch, var(--neg) 7%, transparent)',
        }
      : undefined}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 6, flexWrap: 'wrap',
      }}>
        <span className="v2-dot" style={{ background: fehlt ? 'var(--warn)' : farbe }} />
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>
          {r.rule_kind ? ART_TEXT[r.rule_kind] ?? r.rule_kind : r.rule_type}
        </span>
        {r.severity && !fehlt && (
          <Pill style={hervor
            ? {
                color: 'var(--bg)', background: 'var(--neg)',
                borderColor: 'var(--neg)', fontWeight: 600,
              }
            : { color: farbe }}>
            {STUFEN_TEXT[r.severity] ?? r.severity}
          </Pill>
        )}
        {/* `[read]` **Die Handlungsart, nicht die Schwere, sagt was zu
            tun ist.** `[cmd]` `physician_referral` steht bei 33 von 64
            Regeln und bei DREI Schweregraden — sie darf deshalb nicht
            aussehen wie eine Kontextmarke. */}
        {r.aktion && !fehlt && (
          <Pill style={arzt
            ? {
                color: 'var(--neg)',
                borderColor: 'color-mix(in oklch, var(--neg) 55%, var(--border))',
                fontWeight: 600,
              }
            : undefined}>
            {arzt && <Icon name="alert" className="v2-ic v2-ic-sm" />}
            {HANDLUNG_TEXT[r.aktion] ?? r.aktion}
          </Pill>
        )}
        {/* Die Kennung steht dabei — ohne sie laesst sich eine Regel
            nicht nachschlagen. */}
        <span className="v2-dim v2-mono" style={{ fontSize: 9.5, marginLeft: 'auto' }}>
          {r.rule_id}
        </span>
      </div>

      {r.message && (
        <p className="v2-muted" style={{ fontSize: 11.5, lineHeight: 1.55, margin: 0 }}>
          {r.message}
        </p>
      )}

      {fehlt && r.fehlt.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Es fehlt</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {r.fehlt.map(pfad => (
              <span key={pfad} className="v2-pill v2-mono"
                    style={{ fontSize: 10, padding: '2px 7px' }}>
                {pfad}
              </span>
            ))}
          </div>
        </div>
      )}

      {!fehlt && r.kontext && <Kontext k={r.kontext} />}
    </Card>
  )
}

/**
 * Was die Regel im Stack gefunden hat.
 *
 * `[read]` **Nur die Merkmale, nicht das ganze JSON.** `matched_context`
 * fuehrt auch Kennungen wie `sub_4480fcfa86` — die sagen einem
 * Menschen nichts. Gezeigt werden die lesbaren Angaben; wer mehr
 * braucht, hat die `rule_id`.
 */
function Kontext({ k }: { k: Record<string, unknown> }) {
  const merkmale = Array.isArray(k.medication_traits)
    ? k.medication_traits.filter((x): x is string => typeof x === 'string')
    : []
  const zustaende = Array.isArray(k.conditions)
    ? k.conditions.filter((x): x is string => typeof x === 'string')
    : []
  if (merkmale.length === 0 && zustaende.length === 0) return null

  return (
    <div style={{ marginTop: 8 }}>
      <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Getroffen auf</div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {[...merkmale, ...zustaende].map(m => (
          <span key={m} className="v2-pill v2-mono"
                style={{ fontSize: 10, padding: '2px 7px' }}>
            {m}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Der Hinweis unter dem Tab — er gehoert zu jeder Fassung. */
export function RegelHinweis() {
  return (
    <p className="v2-hinweis" style={{ marginTop: 12 }}>
      <Icon name="alert" className="v2-ic v2-ic-sm" />
      <span>
        Das Regelwerk ist kuratiert und ersetzt keine aerztliche
        Beratung. <strong>Keine Diagnose, keine Therapieempfehlung.</strong>
      </span>
    </p>
  )
}
