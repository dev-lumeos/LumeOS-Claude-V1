'use client'

// Das Dashboard mit echten Daten (G-100).
//
// VORLAGE: `entwurf.tsx` (theme-v1/module-dashboard.jsx). **Anordnung,
// Reihenfolge und Benennung sind uebernommen** — vier KPI-Kacheln oben,
// darunter zwei Spalten.
//
// **DIE GRENZE, DIE HIER BESONDERS GILT.** `[read]` Zahlen ja, Urteile
// nein. Auf dem Dashboard laeuft alles zusammen; ein Gesamtwert waere
// hier am verfuehrerischsten und am wenigsten belegt. Was der Entwurf
// an Urteilen zeigt, steht deshalb NICHT hier:
//
//   - **„Readiness 84" als Komposit aus fuenf Anteilen** — die Anteile
//     „Sleep quality", „Soreness", „Nutrition", „Stress" sind im
//     Entwurf erfunden, und eine Gewichtung dafuer ist nirgends
//     getroffen. `[cmd]` `recovery.scores` fuehrt einen eigenen Wert
//     mit eigener Gewichtung (G-82) — zwei Gesamtwerte nebeneinander
//     waeren schlimmer als einer.
//   - **„Push hard" und „green light for tonight's Push B"** — ein
//     Ratschlag, kein Messwert.
//   - **„Body battery"** — es gibt keine solche Groesse im Schema.
//
// Sie bleiben im Entwurf stehen, mit Marke. Begruendung im Bericht 149.
import * as React from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { Card, Pill, Icon, KPI, Meter } from '@lumeos/ui'

import type { DashboardDaten, Punkt } from '../../../lib/dashboard/lesen'

/** Eine Zahl fuer die Anzeige, oder ein Strich. */
function z(v: number | null, nach = 0): string {
  return v === null ? '—' : v.toLocaleString('de-DE', {
    minimumFractionDigits: nach, maximumFractionDigits: nach,
  })
}

/** `2026-08-20` zu `20.8.` */
function tagKurz(iso: string | null): string {
  if (!iso) return '—'
  const [, m, t] = iso.split('-')
  return m && t ? `${Number(t)}.${Number(m)}.` : iso
}

/** Die Werte einer Punktreihe fuer die Sparkline. */
function spark(punkte: Punkt[]): number[] {
  return punkte.map(p => p.wert)
}

export function DashboardEcht({ d }: { d: DashboardDaten }) {
  // `[read]` Ohne Sitzung KEINE erfundenen Zahlen und kein Fehlerkasten
  // — „noch nichts da" ist ein gueltiger Zustand. Dasselbe Muster wie
  // beim Preferences-Tab (G-65).
  if (!d.angemeldet) {
    return (
      <Card title="Dashboard" sub="nicht angemeldet">
        <p className="v2-muted" style={{ fontSize: 12.5 }}>
          Ohne Anmeldung stehen keine Werte zur Verfuegung.
        </p>
      </Card>
    )
  }

  const kcalZiel = null

  return (
    <>
      <div className="v2-module-header v2-module-hero-lite">
        <div className="v2-module-title-block">
          <div className="v2-module-title-row">
            <span className="v2-module-title">Today</span>
            <Pill>{tagKurz(d.stichtag)}</Pill>
          </div>
          <div className="v2-module-sub">
            Alle Zahlen fuer den {tagKurz(d.stichtag)} — aus den sieben Modulen gelesen.
          </div>
        </div>
      </div>

      {/* Vier KPI-Kacheln, wie im Entwurf. */}
      <div className="v2-grid v2-g-cols-4" style={{ marginBottom: 16 }}>
        <KPI
          label="Recovery"
          value={d.recovery.heute === null ? '—' : z(d.recovery.heute, 1)}
          unit="/100"
          // `[read]` Der Vergleich ist gerechnet, nicht behauptet: der
          // Schnitt der sieben Tage DAVOR, den Stichtag ausgenommen.
          // `[cmd]` NUR DIE ZAHL, KEIN SATZ. Der Deltatext des
          // `KPI`-Bausteins steht neben der Sparkline; alles, was
          // umbricht, legt sich darueber — gemessen bei „+3,2 vs.
          // 7-Tage-Schnitt". `packages/ui` ist in diesem Auftrag
          // gesperrt, also wird hier gekuerzt statt dort geflickt.
          // Der ganze Satz steht in der Recovery-Kachel darunter.
          delta={d.recovery.schnitt7 === null
            ? '—'
            : `${d.recovery.heute !== null && d.recovery.heute >= d.recovery.schnitt7 ? '+' : ''}`
              + `${z((d.recovery.heute ?? 0) - d.recovery.schnitt7, 1)}`}
          deltaVariant={d.recovery.heute !== null && d.recovery.schnitt7 !== null
            && d.recovery.heute >= d.recovery.schnitt7 ? 'pos' : undefined}
          spark={spark(d.recovery.verlauf)}
          sparkColor="var(--acc-recov)"
        />
        <KPI
          label="Training"
          value={d.training.absolviert}
          unit="absolviert"
          delta={`${d.training.geplant} geplant`}
          spark={[]}
          sparkColor="var(--acc-train)"
        />
        <KPI
          label="Kalorien"
          value={d.nutrition.kcal === null ? '—' : z(Math.round(d.nutrition.kcal))}
          unit={kcalZiel ? `/ ${kcalZiel}` : 'kcal'}
          delta={`${d.nutrition.positionen} Position${d.nutrition.positionen === 1 ? '' : 'en'}`}
          spark={spark(d.nutrition.verlauf)}
          sparkColor="var(--acc-nutri)"
        />
        <KPI
          label="Schlaf"
          value={d.schlaf.stunden === null ? '—' : z(d.schlaf.stunden, 1)}
          unit="h"
          delta={d.schlaf.qualitaet === null
            ? 'ohne Bewertung'
            : `Qualitaet ${z(d.schlaf.qualitaet)}/10`}
          spark={spark(d.schlaf.verlauf)}
          sparkColor="var(--acc-recov)"
        />
      </div>

      <div className="v2-dash-grid">
        <div className="v2-col-gap" style={{ gap: 16 }}>
          <Card
            title="Makros · heute"
            sub={`${d.nutrition.positionen} Position${d.nutrition.positionen === 1 ? '' : 'en'} erfasst`}
            actions={<ModulLink href="/v2/nutrition" text="Nutrition" />}
          >
            <div className="v2-grid v2-g-cols-4" style={{ gap: 10 }}>
              <Makro label="Kalorien" wert={d.nutrition.kcal}
                     ziel={d.nutrition.ziele?.kcal ?? null}
                     einheit="kcal" farbe="var(--acc-nutri)" />
              <Makro label="Protein" wert={d.nutrition.protein}
                     ziel={d.nutrition.ziele?.protein ?? null}
                     einheit="g" farbe="var(--acc-train)" />
              <Makro label="Kohlenhydrate" wert={d.nutrition.carbs}
                     ziel={d.nutrition.ziele?.carbs ?? null}
                     einheit="g" farbe="var(--acc-recov)" />
              <Makro label="Fett" wert={d.nutrition.fat}
                     ziel={d.nutrition.ziele?.fat ?? null}
                     einheit="g" farbe="var(--acc-goals)" />
            </div>
            {d.nutrition.ziele === null && (
              <p className="v2-muted" style={{ fontSize: 11, marginTop: 8 }}>
                Fuer diesen Tag gilt kein Ziel — deshalb steht neben den
                Werten keine Quote.
              </p>
            )}
          </Card>

          <Card
            title="Recovery"
            sub={`Wert am ${tagKurz(d.stichtag)}`}
            actions={<ModulLink href="/v2/recovery" text="Recovery" />}
          >
            {d.recovery.heute === null ? (
              <p className="v2-muted" style={{ fontSize: 12 }}>
                Fuer den {tagKurz(d.stichtag)} liegt kein Wert vor.
              </p>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span className="v2-num" style={{ fontSize: 30 }}>{z(d.recovery.heute, 1)}</span>
                  <span className="v2-dim" style={{ fontSize: 12 }}>von 100</span>
                  {d.recovery.modus && <Pill>{d.recovery.modus}</Pill>}
                </div>
                {/*
                  `[read]` DIE HERKUNFT GEHOERT AN DIE ZAHL. `[cmd]` Bei
                  `dev` steht `nutrition_source` auf `fallback_c123_e9`
                  — ein Rueckfallwert, kein gemessener. Ohne diesen Satz
                  saehe er aus wie eine Messung.
                */}
                <p className="v2-muted" style={{ fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>
                  {d.recovery.nutrition_quelle?.startsWith('fallback')
                    && 'Der Ernaehrungsanteil ist ein Rueckfallwert. '}
                  {d.recovery.hrv_quelle === 'not_used_manual_mode'
                    && 'HRV geht im manuellen Modus nicht ein. '}
                  {d.recovery.schnitt7 !== null
                    && `Schnitt der sieben Tage davor: ${z(d.recovery.schnitt7, 1)}.`}
                </p>
              </>
            )}
          </Card>

          <Card
            title="Ziele"
            sub={`${d.goals.offen} aktiv · ${d.goals.erreicht} erreicht`}
            actions={<ModulLink href="/v2/goals" text="Goals" />}
          >
            {d.goals.aktiv.length === 0 ? (
              <p className="v2-muted" style={{ fontSize: 12 }}>Kein aktives Ziel.</p>
            ) : (
              <div className="v2-col-gap" style={{ gap: 8 }}>
                {d.goals.aktiv.map((g, i) => {
                  const anteil = g.ziel !== null && g.stand !== null && g.ziel !== 0
                    ? Math.max(0, Math.min(100, Math.round((g.stand / g.ziel) * 100)))
                    : null
                  return (
                    <div key={`${g.art}-${i}`}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                        {g.prioritaet !== null && <Pill variant="acc">{g.prioritaet}</Pill>}
                        <span style={{ fontSize: 12.5 }}>{g.art}</span>
                        <span className="v2-num v2-dim" style={{ marginLeft: 'auto', fontSize: 11 }}>
                          {z(g.stand, 1)} / {z(g.ziel, 1)}
                          {anteil !== null && ` · ${anteil} %`}
                        </span>
                      </div>
                      {anteil !== null && <Meter value={anteil} color="var(--acc-goals)" />}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 16 }}>
          <Card
            title="Training"
            sub={`${d.training.absolviert} absolviert · ${d.training.geplant} geplant`}
            accent="var(--acc-train)"
            actions={<ModulLink href="/v2/training" text="Training" />}
          >
            <Zeile label="Zuletzt" wert={d.training.letzte
              ? `${d.training.letzte.name ?? '—'} · ${tagKurz(d.training.letzte.datum)}`
              : 'keine absolvierte Sitzung'} />
            {d.training.letzte && (
              <Zeile
                label="Umfang"
                wert={[
                  d.training.letzte.saetze !== null && `${z(d.training.letzte.saetze)} Saetze`,
                  d.training.letzte.volumen !== null
                    && `${z(Math.round(d.training.letzte.volumen))} kg`,
                  d.training.letzte.dauer !== null && `${z(d.training.letzte.dauer)} min`,
                ].filter(Boolean).join(' · ') || '—'}
              />
            )}
            <Zeile label="Als Naechstes" wert={d.training.naechste
              ? `${d.training.naechste.name ?? '—'} · ${tagKurz(d.training.naechste.datum)}`
                + `${d.training.naechste.zeit ? ` · ${d.training.naechste.zeit}` : ''}`
              : 'nichts geplant'} />
            {d.training.naechste && (
              <Zeile
                label="Geplant"
                wert={[
                  d.training.naechste.dauer !== null && `${z(d.training.naechste.dauer)} min`,
                  d.training.naechste.ort,
                ].filter(Boolean).join(' · ') || '—'}
              />
            )}
          </Card>

          <Card title="Bestleistungen" sub="aus den erfassten Saetzen">
            {d.training.prs.length === 0 ? (
              <p className="v2-muted" style={{ fontSize: 12 }}>Keine Bestleistung erfasst.</p>
            ) : (
              <div className="v2-col-gap">
                {d.training.prs.map((p, i) => (
                  <div key={`${p.uebung}-${i}`} className="v2-row">
                    <span className="v2-row-l">
                      <Icon name="trend_up" className="v2-ic v2-ic-sm" style={{ color: 'var(--pos)' }} />
                      {p.uebung}
                      <span className="v2-dim" style={{ fontSize: 10 }}>{tagKurz(p.datum)}</span>
                    </span>
                    <span className="v2-row-r v2-num">
                      {z(p.gewicht, 1)} kg × {z(p.wdh)}
                      {p.e1rm !== null && (
                        <span className="v2-dim" style={{ fontSize: 10, marginLeft: 4 }}>
                          e1RM {z(p.e1rm, 1)}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card
            title="Medical"
            sub={`${d.medical.werte} Werte · ${d.medical.befunde} Befunde`}
            actions={<ModulLink href="/v2/medical" text="Medical" />}
          >
            {/*
              `[read]` ZWEI ZAHLEN, NICHT EINE — die Entscheidung aus
              G-84. „Ausserhalb des Laborbereichs" ist ein Befund des
              Labors, „ausserhalb des Optimalbands" eine Empfehlung aus
              der Literatur. **Kein Health score**, er haengt an zwei
              Unbekannten (G-85).
            */}
            <Zeile label="Ausserhalb des Laborbereichs"
                   wert={z(d.medical.ausserhalbLabor)} />
            <Zeile label="Nur ausserhalb des Optimalbands"
                   wert={z(d.medical.ausserhalbOptimal)} />
            <Zeile label="Letzter Befund" wert={tagKurz(d.medical.letzterBefund)} />
          </Card>

          <Card
            title="Supplements"
            sub="letzte 30 Tage"
            actions={<ModulLink href="/v2/supplements" text="Supplements" />}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <span className="v2-num" style={{ fontSize: 26 }}>
                {d.supplements.quote === null ? '—' : `${z(d.supplements.quote, 1)} %`}
              </span>
              <span className="v2-dim" style={{ fontSize: 11 }}>eingenommen</span>
            </div>
            <p className="v2-muted" style={{ fontSize: 11 }}>
              {d.supplements.genommen} genommen, {d.supplements.uebersprungen} ausgelassen —
              gerechnet ueber den gemessenen Zeitraum, nicht ueber „immer".
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}

function ModulLink({ href, text }: { href: string; text: string }) {
  return (
    <Link href={href as Route} className="v2-btn v2-btn-ghost"
          style={{ height: 22, fontSize: 11, padding: '0 8px' }}>
      {text} <Icon name="arrow_right" className="v2-ic v2-ic-sm" />
    </Link>
  )
}

function Zeile({ label, wert }: { label: string; wert: string }) {
  return (
    <div className="v2-row">
      <span className="v2-row-l v2-muted">{label}</span>
      <span className="v2-row-r v2-num">{wert}</span>
    </div>
  )
}

/**
 * Eine Makro-Kachel.
 *
 * `[read]` **KEIN BALKEN OHNE ZIEL.** Der Entwurf zeigt je Makro einen
 * Fortschrittsbalken; die Ziele stehen in `goals.zielwerte_am` und
 * gelten nicht fuer jeden Tag. Liegt keines vor, steht der Wert allein
 * da — ein Balken ohne Bezugsgroesse behauptete einen Fortschritt, den
 * niemand gemessen hat.
 */
function Makro({ label, wert, ziel, einheit, farbe }: {
  label: string; wert: number | null; ziel: number | null
  einheit: string; farbe: string
}) {
  const quote = wert !== null && ziel !== null && ziel > 0
    ? Math.round((wert / ziel) * 100)
    : null
  return (
    <div>
      {/*
        `[read]` Beschriftung und Quote UNTEREINANDER, nicht
        nebeneinander: bei vier Kacheln nebeneinander schoben sich
        „Kohlenhydrate" und „154 %" ineinander.
      */}
      <div className="v2-eyebrow" style={{ marginBottom: 4 }}>{label}</div>
      <div className="v2-num" style={{ fontSize: 17, marginBottom: 2 }}>
        {wert === null ? '—' : Math.round(wert).toLocaleString('de-DE')}
        <span style={{ fontSize: 10, color: 'var(--fg-dim)', marginLeft: 3 }}>
          {einheit}
        </span>
      </div>
      <div className="v2-num" style={{ fontSize: 10, color: 'var(--fg-dim)', marginBottom: 4 }}>
        {ziel === null
          ? 'kein Ziel'
          : `von ${Math.round(ziel).toLocaleString('de-DE')}${quote !== null ? ` · ${quote} %` : ''}`}
      </div>
      {quote !== null
        ? <Meter value={Math.min(quote, 100)} color={farbe} tall />
        : <div style={{ height: 3 }} />}
    </div>
  )
}
