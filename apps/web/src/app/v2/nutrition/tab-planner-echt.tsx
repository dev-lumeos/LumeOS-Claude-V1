'use client'

// Der Planner-Tab mit echten Daten (G-97).
//
// VORLAGE: `tab-planner.tsx` (theme-v1/module-nutrition.jsx:598-638).
// **Aufbau uebernommen:** Wochennavigation, `Copy week`, `New recipe`,
// darunter das Raster aus Mahlzeitenreihen ueber sieben Tage, Zelle mit
// Gericht und kcal.
//
// **WAS ANDERS IST ALS IM ENTWURF, UND WARUM:**
//
// 1. `[cmd]` **Die Zeilen sind nicht mehr fest vier.** `meals_per_day`
//    und `snacks_per_day` (G-72) bestimmen sie — bei `dev` 4 und 1,
//    also drei Hauptmahlzeiten plus Snacks. Der Grund steht als Satz
//    an der Karte, damit niemand die Zahl fuer beliebig haelt.
//
// 2. `[read]` **Der Samstag ist nicht mehr hervorgehoben.** Im Entwurf
//    war `di === 5` fest verdrahtet. Hervorgehoben wird jetzt HEUTE —
//    das ist der Tag, den man sucht, wenn man auf einen Wochenplan
//    schaut.
//
// 3. `[cmd]` **Die kcal sind gerechnet, nicht gewuerfelt.** Der Entwurf
//    hatte `Math.round(400 + Math.random() * 400)`. Rezepte rechnen
//    ueber `nutrition.recipe_nutrition`, BLS-Eintraege ueber
//    `food_nutrient_snapshot` — beide aus C-150.
//
// **NICHT GEBAUT: der Generator.** `[read]` Tom, im Auftrag: *„Ein
// Plan, den der Nutzer fuellt, ist ein Kalender. Ein Plan, den das
// System vorschlaegt, ist eine Ernaehrungsempfehlung."* Das ist Buddys
// Aufgabe. `Copy week` kopiert deshalb eine vorhandene Woche
// (`copy_meal_plan_week`), es erfindet keine.
import * as React from 'react'
import { Card, Icon, Pill, InEntwicklungKnopf } from '@lumeos/ui'

// `[cmd]` **NUR TYPEN AUS `plan-lesen.ts`.** Die Datei importiert
// `next/headers`; ein WERT-Import von hier zoege das Server-I/O ins
// Browserbuendel und die Seite antwortete mit HTTP 500 — der Typecheck
// bleibt dabei gruen. Derselbe Fehler wie in G-74 und G-79, hier beim
// Bauen einmal ausgeloest und gemessen.
//
// Die Beschriftung steht deshalb in `plan-model.ts`, ohne Serverbezug.
import type { PlanDaten, PlanWoche } from '../../../lib/nutrition/plan-lesen'
import { SLOT_LABEL } from '../../../lib/nutrition/plan-model'

const WOCHENTAGE = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** `2026-06-18` zu `18.6.` — kurz, weil sieben davon nebeneinander stehen. */
function tagKurz(iso: string): string {
  const [, m, d] = iso.split('-')
  return d && m ? `${Number(d)}.${Number(m)}.` : iso
}

/** Die Woche als Spanne, wie im Entwurf („Week of May 12–18"). */
function wochenSpanne(woche: PlanWoche): string {
  const tage = woche.tage
  if (tage.length === 0) return woche.week_start
  const a = tage[0].plan_date
  const b = tage[tage.length - 1].plan_date
  return `${tagKurz(a)} – ${tagKurz(b)}`
}

function heuteIso(): string {
  const j = new Date()
  const m = String(j.getMonth() + 1).padStart(2, '0')
  const t = String(j.getDate()).padStart(2, '0')
  return `${j.getFullYear()}-${m}-${t}`
}

export function PlannerEchtTab({ d }: { d: PlanDaten }) {
  const [woche, setWoche] = React.useState(() => {
    // Die Woche, in der heute liegt — sonst die erste.
    const heute = heuteIso()
    const i = d.wochen.findIndex(w => w.tage.some(t => t.plan_date === heute))
    return i >= 0 ? i : 0
  })

  if (d.ladefehler) {
    return (
      <div className="v2-insight v2-neg">
        <div className="v2-insight-mark" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="v2-insight-title">Plan nicht gelesen</div>
          <div className="v2-insight-body">{d.ladefehler}</div>
        </div>
      </div>
    )
  }

  // `[read]` KEIN PLAN IST KEIN FEHLER. Wer noch keinen angelegt hat,
  // bekommt den Grund und den Weg — nicht eine leere Tabelle, die wie
  // ein Defekt aussieht.
  if (!d.plan || d.wochen.length === 0) {
    return (
      <Card title="Noch kein Wochenplan" sub="Planner">
        <p className="v2-muted" style={{ fontSize: 12.5, lineHeight: 1.6 }}>
          Es liegt kein Plan vor. Ein Plan besteht aus Wochen, Tagen und
          Eintraegen — angelegt wird er hier, gefuellt aus deinen Rezepten
          oder direkt aus der Lebensmitteldatenbank.
        </p>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <InEntwicklungKnopf
            titel="Neuen Plan anlegen"
            className="v2-btn v2-btn-primary"
            grund={'C-150 hat die Tabellen geliefert; der Schreibpfad im '
              + 'Browser ist nicht Teil dieses Auftrags (G-97).'}
          >
            <Icon name="plus" className="v2-ic v2-ic-sm" /> Neuen Plan anlegen
          </InEntwicklungKnopf>
        </div>
      </Card>
    )
  }

  const w = d.wochen[Math.min(woche, d.wochen.length - 1)]
  const heute = heuteIso()
  const eintraegeDerWoche = w.tage.reduce((s, t) => s + t.eintraege.length, 0)

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          className="v2-btn v2-btn-ghost"
          disabled={woche === 0}
          aria-label="Vorherige Woche"
          onClick={() => setWoche(i => Math.max(0, i - 1))}
        >
          <Icon name="chevron_left" className="v2-ic v2-ic-sm" />
        </button>
        <button type="button" className="v2-btn" disabled>
          {wochenSpanne(w)}
        </button>
        <button
          type="button"
          className="v2-btn v2-btn-ghost"
          disabled={woche >= d.wochen.length - 1}
          aria-label="Naechste Woche"
          onClick={() => setWoche(i => Math.min(d.wochen.length - 1, i + 1))}
        >
          <Icon name="chevron_right" className="v2-ic v2-ic-sm" />
        </button>

        {w.name && <Pill>{w.name}</Pill>}
        {/* `[cmd]` `copied_from_week_id` steht in der Tabelle — eine
            kopierte Woche sagt das, statt wie eine eigene auszusehen. */}
        {w.kopiert_von && <Pill variant="acc">kopiert</Pill>}

        <div className="v2-spacer" />
        <span className="v2-num v2-dim" style={{ fontSize: 11 }}>
          {eintraegeDerWoche} Eintr{eintraegeDerWoche === 1 ? 'ag' : 'aege'}
        </span>
        <InEntwicklungKnopf
          titel="Copy week"
          className="v2-btn"
          grund={'`copy_meal_plan_week` liegt in der Datenbank (C-150) und ist dort '
            + 'gegengeprueft — es fehlt der Schreibpfad im Browser (G-97).'}
        >
          <Icon name="copy" className="v2-ic v2-ic-sm" /> Copy week
        </InEntwicklungKnopf>
        <InEntwicklungKnopf
          titel="New recipe"
          className="v2-btn v2-btn-primary"
          grund={'`recipes` und `recipe_ingredients` stehen (C-150). Der '
            + 'Rezepteditor ist nicht Teil dieses Auftrags (G-97).'}
        >
          <Icon name="plus" className="v2-ic v2-ic-sm" /> New recipe
        </InEntwicklungKnopf>
      </div>

      <Card
        title={d.plan.name}
        sub={d.plan.description ?? undefined}
        actions={d.plan.is_active ? <Pill variant="acc">aktiv</Pill> : undefined}
      >
        {/* Die Ziele des Plans — sie stehen in `meal_plans`, also
            gezeigt. Kein Urteil daneben, nur die Zahlen. */}
        {d.plan.target_kcal !== null && (
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 12 }}>
            <Ziel label="Ziel" wert={d.plan.target_kcal} einheit="kcal" />
            <Ziel label="Protein" wert={d.plan.target_protein_g} einheit="g" />
            <Ziel label="Kohlenhydrate" wert={d.plan.target_carbs_g} einheit="g" />
            <Ziel label="Fett" wert={d.plan.target_fat_g} einheit="g" />
          </div>
        )}

        <div className="v2-planner-wrap">
          <div
            className="v2-planner"
            // Das Raster hat so viele Zeilen wie Mahlzeiten — die
            // Spalten bleiben bei sieben Tagen plus Beschriftung.
            style={{ gridTemplateRows: `auto repeat(${d.zeilen.length}, auto)` }}
          >
            <div />
            {w.tage.map((t, i) => {
              const istHeute = t.plan_date === heute
              return (
                <div
                  key={t.id}
                  style={{
                    padding: 6, fontSize: 11, textAlign: 'center',
                    color: istHeute ? 'var(--acc-nutri)' : 'var(--fg-muted)',
                    fontWeight: istHeute ? 600 : 400,
                  }}
                >
                  {WOCHENTAGE[i] ?? ''}{' '}
                  <span className="v2-num v2-dim" style={{ fontSize: 10 }}>
                    {tagKurz(t.plan_date)}
                  </span>
                </div>
              )
            })}

            {d.zeilen.map(slot => (
              <React.Fragment key={slot}>
                <div style={{
                  padding: '10px 6px', fontSize: 11, fontWeight: 500,
                  color: 'var(--fg-muted)', borderTop: '1px solid var(--border)',
                }}>
                  {SLOT_LABEL[slot]}
                </div>
                {w.tage.map(t => (
                  <Zelle
                    key={`${t.id}-${slot}`}
                    tag={t.plan_date}
                    heute={heute}
                    eintraege={t.eintraege.filter(e => e.meal_type === slot)}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        <p className="v2-muted" style={{ fontSize: 11, marginTop: 10 }}>
          {d.zeilenGrund}
        </p>
      </Card>

      <RezeptListe rezepte={d.rezepte} />
    </div>
  )
}

function Ziel({ label, wert, einheit }: {
  label: string; wert: number | null; einheit: string
}) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span className="v2-eyebrow">{label}</span>
      <span className="v2-num" style={{ fontSize: 13 }}>
        {wert === null ? '—' : wert.toLocaleString('de-DE')}
        <span className="v2-dim" style={{ fontSize: 10, marginLeft: 2 }}>{einheit}</span>
      </span>
    </span>
  )
}

/**
 * Eine Zelle des Rasters.
 *
 * `[read]` **Eine leere Zelle bleibt leer** — kein Platzhalter, kein
 * „—". Im Entwurf war jede Zelle gefuellt, weil die Daten erfunden
 * waren; echte Plaene haben Luecken, und die leere Woche des Seeds ist
 * genau dafuer da.
 */
function Zelle({ tag, heute, eintraege }: {
  tag: string
  heute: string
  eintraege: Array<{ id: string; bezeichnung: string; kcal: number | null
    entry_type: string; amount_g: number | null; planned_servings: number | null }>
}) {
  const istHeute = tag === heute
  return (
    <div style={{
      padding: 8, minHeight: 60, borderTop: '1px solid var(--border)',
      background: istHeute
        ? 'color-mix(in oklch, var(--acc-nutri) 5%, transparent)'
        : 'transparent',
      fontSize: 11,
    }}>
      {eintraege.map(e => (
        <div key={e.id} style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: 'var(--fg)', lineHeight: 1.35 }}>
            {e.bezeichnung}
          </div>
          <div className="v2-num v2-dim" style={{ fontSize: 10 }}>
            {e.kcal === null ? '—' : `${e.kcal.toLocaleString('de-DE')} kcal`}
            {e.entry_type === 'recipe' && e.planned_servings !== null
              ? ` · ${e.planned_servings.toLocaleString('de-DE')}×`
              : e.amount_g !== null
                ? ` · ${e.amount_g.toLocaleString('de-DE')} g`
                : ''}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Die Rezepte des Nutzers.
 *
 * `[cmd]` **Hier wirken zwei weitere G-72-Spalten sichtbar:**
 * `cooking_skill` und die Zubereitungszeit stehen an jedem Rezept, weil
 * `recipes` sie fuehrt — `prep_time_max_min` aus den Vorlieben laesst
 * sich damit vergleichen.
 */
function RezeptListe({ rezepte }: { rezepte: PlanDaten['rezepte'] }) {
  if (rezepte.length === 0) return null
  return (
    <Card
      title="Rezepte"
      sub={`${rezepte.length} — Naehrwerte aus den Zutaten gerechnet`}
      style={{ marginTop: 14 }}
    >
      <div className="v2-tbl-wrap">
        <table className="v2-tbl">
          <thead>
            <tr>
              <th>Rezept</th>
              <th style={{ width: 110 }}>Kueche</th>
              <th style={{ width: 110 }}>Koennen</th>
              <th style={{ width: 90 }}>Zeit</th>
              <th style={{ width: 80 }}>Zutaten</th>
              <th style={{ width: 100 }}>kcal</th>
              <th style={{ width: 90 }}>Protein</th>
            </tr>
          </thead>
          <tbody>
            {rezepte.map(r => {
              const zeit = (r.prep_time_min ?? 0) + (r.cook_time_min ?? 0)
              return (
                <tr key={r.id}>
                  <td>{r.name_de}</td>
                  <td className="v2-dim">{r.cuisine_code ?? '—'}</td>
                  <td className="v2-dim">{r.cooking_skill ?? '—'}</td>
                  <td className="v2-num">{zeit > 0 ? `${zeit} min` : '—'}</td>
                  <td className="v2-num">{r.zutaten}</td>
                  <td className="v2-num">
                    {r.kcal === null ? '—' : Math.round(r.kcal).toLocaleString('de-DE')}
                  </td>
                  <td className="v2-num">
                    {r.protein_g === null ? '—' : `${Math.round(r.protein_g)} g`}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="v2-muted" style={{ fontSize: 11, marginTop: 8 }}>
        Die Werte gelten je Portion und werden bei jedem Aufruf aus den
        Zutaten gerechnet — ein Rezept speichert sie nicht, damit eine
        geaenderte Zutat nicht zwei Wahrheiten hinterlaesst.
      </p>
    </Card>
  )
}
