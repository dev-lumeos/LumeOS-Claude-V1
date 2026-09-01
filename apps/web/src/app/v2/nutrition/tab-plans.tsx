'use client'

// Der Meal-Plans-Tab des Nutrition-Moduls.
//
// QUELLE: theme-v1/module-nutrition-spec.jsx, `MealPlansView`
// (Zeile 334-521). Drei Unter-Tabs: Active plan · Plan library ·
// Shopping list — und sechs Kacheln, die die Zaehlung nennt:
// Today's ghost entries · Plan settings · Lifecycle types ·
// 7-day compliance · Shopping list · Scale list.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript.
//   2. Klassen auf `v2-`-Praefix.
//   3. `window.MealPlansView` -> Modulexport.
//   4. Wiederkehrende Inline-Raster in `nutrition.css`.
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst.
//
// `[cmd]` ALLES HIER IST ATTRAPPE. Essensplaene, Wochen und Eintraege
// liegen inzwischen im Schema; dieser Entwurfs-Tab ist aber noch nicht
// an `plan-lesen` angebunden. Die Compliance rechnet weiter ueber die
// Vorlagendaten, nicht ueber die Datenbank.
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, Pill, Icon, Row, Ring, Sparkline } from '@lumeos/ui'

import { GHOST_ENTRIES } from './tabs-daten'
import type { GhostStatus } from './typen'
// G-161: die drei Kacheln, die `plan-lesen` tragen kann.
import {
  PlanKopfEcht, PlanEinstellungenEcht,
} from './plans-echt'
import type { PlanDaten, PlanKurz } from '../../../lib/nutrition/plan-lesen'
import {
  LEERER_WECHSELSTAND, type LogZeile, type WechselStand,
} from '../../../lib/nutrition/plan-lage'
import {
  LebenszyklusEcht, EinhaltungEcht, WechselbefundEcht,
  // G-310: alle Plaene — die Bibliothek der Attrappe (Z. 343).
  PlanBibliothekEcht,
} from './plans-echt'
import { PlanModal } from './plan-modal'
import { PlanEintraegeEcht, type TagesEintrag } from './plan-eintraege'
// G-286/G-287/G-290: Karte, Tages-Akkordeon und Aktivierungsdialog.
import {
  // G-315: `MealPlanCard`/`MealPlanDetail` entfernt — der aktive
  // Plan stand dreimal. Das Aktivierungsmodal bleibt.
  MealPlanActivationModal,
} from './plan-detail'

const ATTRAPPE = 'Aus dem Entwurf uebernommen. Dieser Tab ist noch nicht an die vorhandenen Essensplaene angebunden - die Zahlen sind erfunden.'

/** Farbe und Beschriftung je Zustand (Vorlage Zeile 344-349). */
const ZUSTAND: Record<GhostStatus, { c: string; l: string }> = {
  confirmed: { c: 'var(--pos)', l: 'confirmed' },
  deviated: { c: 'var(--warn)', l: 'deviated' },
  skipped: { c: 'var(--neg)', l: 'skipped' },
  pending: { c: 'var(--fg-dim)', l: 'pending' },
}

/** Die sechs Plaene der Bibliothek (Vorlage Zeile 448-455). */
const BIBLIOTHEK = [
  { n: 'Recomp 5-Meal Plan', src: 'coach', days: 7, kcal: 2700, active: true },
  { n: 'Cut · 4-Meal 2200', src: 'coach', days: 14, kcal: 2200 },
  { n: 'High-Protein Lazy Week', src: 'user', days: 7, kcal: 2650 },
  { n: 'Travel week · flexible', src: 'user', days: 5, kcal: 2500 },
  { n: 'Lean bulk 3100', src: 'marketplace', days: 28, kcal: 3100 },
  { n: 'Buddy auto-plan', src: 'buddy', days: 7, kcal: 2700 },
]

/** Die Einkaufsliste (Vorlage Zeile 478-484). */
const EINKAUF: Array<{ cat: string; items: Array<[string, string]> }> = [
  { cat: 'Fleisch & Fisch', items: [['Hähnchenbrust', '1260 g'], ['Lachsfilet', '1400 g']] },
  { cat: 'Milchprodukte', items: [['Hüttenkäse', '1400 g'], ['Whey Isolat', '455 g'], ['Skyr', '1000 g']] },
  { cat: 'Getreide', items: [['Haferflocken', '560 g'], ['Basmatireis', '1400 g'], ['Reiswaffeln', '280 g']] },
  { cat: 'Gemüse & Obst', items: [['Brokkoli', '1050 g'], ['Süßkartoffel', '1750 g'], ['Banane', '840 g'], ['Blaubeeren', '700 g']] },
  { cat: 'Fette & Nüsse', items: [['Mandeln', '140 g'], ['Olivenöl', '150 ml']] },
]

export function MealPlansTab({
  d = null, logs = [], coachFreigabe = false, einkaufslisten = 0,
  tagesEintraege = [], datum = '',
  wechsel = LEERER_WECHSELSTAND, allePlaene = [],
}: {
  d?: PlanDaten | null
  /** G-270: die Ausfuehrung aus `meal_plan_logs` — nicht vom Eintrag. */
  logs?: LogZeile[]
  /** G-269: aus `coach.darf_nutrition_plan_aendern` (E-29). */
  coachFreigabe?: boolean
  /** G-270: wie viele Einkaufslisten der Nutzer hat. */
  einkaufslisten?: number
  /** G-274: die Eintraege des Tages mit ihrem Zustand aus dem Log. */
  tagesEintraege?: TagesEintrag[]
  /** G-274: der Tag, auf den bestaetigt wird (`execution_date`). */
  datum?: string
  /** G-309: Befunde UND Grundgesamtheit, aus EINER Messung. */
  wechsel?: WechselStand
  /** G-310: alle Plaene des Nutzers — die Bibliothek (E-41). */
  allePlaene?: PlanKurz[]
}) {
  // G-267 / G-268: `null` heisst zu, `true` heisst anlegen,
  // ein Objekt heisst bearbeiten.
  const [anlegen, setAnlegen] = React.useState(false)
  const [bearbeiten, setBearbeiten] = React.useState(false)
  // G-290: der Aktivierungsdialog mit LifecyclePicker.
  const [aktivieren, setAktivieren] = React.useState(false)
  const router = useRouter()

  // Die Rechnung der Vorlage (Zeile 336-343), unveraendert.
  const confirmed = GHOST_ENTRIES.filter(g => g.status === 'confirmed').length
  const deviated = GHOST_ENTRIES.filter(g => g.status === 'deviated').length
  const skipped = GHOST_ENTRIES.filter(g => g.status === 'skipped').length
  const pending = GHOST_ENTRIES.filter(g => g.status === 'pending').length
  const compliance = Math.round(
    ((confirmed + deviated) / Math.max(1, confirmed + deviated + skipped)) * 100,
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        {/* ══ G-301: die drei Unterreiter sind weg ═══════════════
            `[cmd]` **`Active plan` / `Plan library` / `Shopping list`
            stehen in keiner Spec.** `[cmd]` **`SPEC_03` Flow 3,
            Schritt 2 kennt EINE Uebersicht:** *,,Uebersicht zeigt alle
            verfuegbaren Plaene"* — und ein Plan DARIN traegt
            `status: active`.

            `[cmd]` **Und die Einkaufsliste gehoert gar nicht
            hierher:** Flow 8 sagt *,,Rezept oeffnen -> Einkaufsliste
            erstellen"*. **Sie steht jetzt im Rezepte-Reiter**
            (G-288). */}
        <span className="v2-eyebrow">Alle Pläne</span>
        <div className="v2-spacer" />
        {/* G-267, Tom: „new plan geht nix". `[cmd]` **Seit dem
            2026-08-30 kann er speichern** — die sechs Spalten stehen
            live, am selben Tag nachgemessen. */}
        <button type="button" className="v2-btn" onClick={() => setAnlegen(true)}>
          <Icon name="plus" className="v2-ic v2-ic-sm" />New plan
        </button>
      </div>

      {/* Flow 3, Schritt 2: der aktive Plan steht OBEN in
          derselben Uebersicht - er ist kein eigener Ort. */}
      <>
        <div className="v2-grid v2-grid-15" style={{ gap: 14 }}>
          <div className="v2-col-gap" style={{ gap: 14 }}>
            {/* G-161: Der Plankopf liest echt, sobald ein Plan da ist.
                `[read]` Ohne Plan bleibt der Entwurf mit seiner Marke —
                dasselbe Muster wie bei `prefs` (G-65) und `planner`
                (G-97): eine leere echte Kachel saehe aus wie ein Befund
                und waere doch nur ein fehlendes Cookie. */}
            {d ? <PlanKopfEcht d={d} logs={logs} /> : (
            <Card attrappe={ATTRAPPE}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Ring value={compliance} max={100} color="var(--acc-nutri)" label="compliance" size={92} stroke={7} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>Recomp 5-Meal Plan</span>
                    <Pill variant="acc">active</Pill>
                    <Pill>rollover</Pill>
                  </div>
                  <div className="v2-muted" style={{ fontSize: 12, marginBottom: 8 }}>
                    Day 3 of 7 · started May 14 · source: coach (Jana Bauer)
                  </div>
                  <div className="v2-dim v2-mono" style={{ fontSize: 10.5 }}>
                    ({confirmed} confirmed + {deviated} deviated) / ({confirmed} + {deviated} + {skipped} skipped)
                    {' '}= {compliance}% · {pending} pending not counted
                  </div>
                </div>
              </div>
            </Card>
            )}

            {/* G-270: die Zustaende kommen aus `meal_plan_logs`.
                `[cmd]` **Der Status liegt im Log, nicht am Eintrag** —
                `meal_plan_entries` hat keine Statusspalte, und wer dort
                sucht, haelt ihn fuer fehlend. */}
            {/* G-274: die Eintraege DES TAGES mit ihren Knoepfen.
                `[read]` **Nicht die Log-Zeilen** — ein Eintrag ohne
                Log ist `pending`, nicht abwesend. Wer nur Logs zeigte,
                saehe am ersten Tag nichts. */}
            {d ? (
              <PlanEintraegeEcht
                eintraege={tagesEintraege}
                datum={datum}
                onGeaendert={() => router.refresh()}
              />
            ) : (
            <Card
              title="Today's ghost entries"
              sub={`${pending} still open · confirm via MealCam or manually`}
              attrappe={ATTRAPPE}
            >
              <div className="v2-col-gap" style={{ gap: 6 }}>
                {GHOST_ENTRIES.map(g => {
                  const st = ZUSTAND[g.status]
                  const offen = g.status === 'pending'
                  return (
                    <div
                      key={g.id}
                      className="v2-ghost-eintrag"
                      style={{
                        background: offen ? 'var(--surface)' : `color-mix(in srgb, ${st.c} 5%, var(--surface))`,
                        border: `1px solid ${offen ? 'var(--border)' : `color-mix(in srgb, ${st.c} 25%, var(--border))`}`,
                        borderStyle: offen ? 'dashed' : 'solid',
                      }}
                    >
                      <div className="v2-ghost-kopf">
                        <span className="v2-num v2-dim" style={{ fontSize: 10, width: 38 }}>{g.time}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{g.meal}</span>
                        <Pill style={{ borderColor: `color-mix(in srgb, ${st.c} 35%, var(--border))`, color: st.c, fontSize: 9.5 }}>
                          {st.l}
                        </Pill>
                        <span className="v2-num v2-dim" style={{ marginLeft: 'auto', fontSize: 11 }}>{g.kcal} kcal</span>
                      </div>
                      <div className="v2-muted v2-ghost-positionen">{g.items.join(' · ')}</div>
                      {g.note && (
                        <div style={{ fontSize: 11, paddingLeft: 46, marginTop: 4, color: 'var(--warn)', fontFamily: 'var(--font-mono)' }}>
                          ↳ {g.note}
                        </div>
                      )}
                      {offen && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, paddingLeft: 46, flexWrap: 'wrap' }}>
                          <button type="button" className="v2-btn v2-btn-primary v2-btn-sm">
                            <Icon name="check" className="v2-ic v2-ic-sm" />Confirm as planned
                          </button>
                          <button type="button" className="v2-btn v2-btn-sm">
                            <Icon name="camera" className="v2-ic v2-ic-sm" />MealCam
                          </button>
                          <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm">Log deviation</button>
                          <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm">Skip</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
            )}
          </div>

          <div className="v2-col-gap" style={{ gap: 14 }}>
            {/* G-161: Was im Schema steht, steht echt da — der Rest
                nicht. Vier der fuenf Zeilen der Vorlage haben keine
                Spalte (`lifecycle`, `started_at`, `next_plan_id`,
                `confirm_mode`); die echte Kachel sagt das aus. */}
            {d ? <PlanEinstellungenEcht d={d} /> : (
            <Card title="Plan settings" attrappe={ATTRAPPE}>
              <Row label="Lifecycle" value="rollover" />
              <Row label="Days count" value="7" />
              <Row label="Started" value="May 14" />
              <Row label="Next restart" value="May 21 · Day 1" />
              <Row label="Confirm mode" value="ask" />
              <div className="v2-divider" />
              <div className="v2-hinweis-warn">
                <Icon
                  name="alert"
                  className="v2-ic v2-ic-sm"
                  style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4, color: 'var(--warn)' }}
                />
                Plan items are read-only while active. To edit: pause → duplicate → edit → re-activate.
                Protects compliance history.
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button type="button" className="v2-btn v2-btn-sm">Pause plan</button>
                <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm">Duplicate</button>
              </div>
            </Card>
            )}

            {/* G-270: der Zyklus DIESES Plans statt einer Legende
                ueber drei Woerter — `lifecycle_type` steht seit dem
                2026-08-30 im Schema. Bei den Bestandsplaenen ist er
                `NULL`, und das wird gezeigt, nicht gefuellt. */}
            {d ? <LebenszyklusEcht d={d} /> : (
            <Card title="Lifecycle types" attrappe={ATTRAPPE}>
              <Row label="once" value="ends after days_count" />
              <Row label="rollover" value="restarts at Day 1" />
              <Row label="sequence" value="activates next_plan_id" />
            </Card>
            )}

            {/* ══ G-310: die Herkunfts-Karte ist entfernt ════════
                `[cmd]` **Sie stand in keiner Attrappe** — sie war
                aus dem Schema abgeleitet, eine Kachel je
                Spaltengruppe.

                `[cmd]` **In der Vorlage steht die Herkunft als BADGE
                an der Plankarte** (`MealPlansView.js` Z. 89,
                `SPEC_03` Flow 3 Schritt 2). **Dorthin ist sie
                gewandert** — `plan-detail.tsx`, `MealPlanCard`.

                `[read]` **Und der Knopf *Plan bearbeiten* gehoerte
                ohnehin nicht hierher.** Tom: *,,irgend einen
                plannamen anpassen und seine laufzeiten ist fuer mich
                nicht planbearbeiten."* **Er fuehrt in den Planner**
                (E-41, G-307). */}

            {/* G-270: die Einhaltung aus dem Log — ohne entschiedene
                Zeilen gibt es keine Quote, nicht null Prozent. */}
            {/* G-309: welche Position regelmaessig gewechselt wird
                — Toms Frage, und etwas anderes als die Quote. */}
            {d && (
              <WechselbefundEcht
                stand={wechsel}
              />
            )}

            {d ? <EinhaltungEcht logs={logs} datum={datum} /> : (
            <Card title="7-day compliance" attrappe={ATTRAPPE}>
              <Sparkline data={[100, 86, 100, 92, 80, 100, compliance]} color="var(--acc-nutri)" h={44} />
              <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11, color: 'var(--fg-muted)' }}>
                <span>Avg <span className="v2-num" style={{ color: 'var(--fg)' }}>94%</span></span>
                <span>Deviations <span className="v2-num" style={{ color: 'var(--warn)' }}>4</span></span>
                <span>Skips <span className="v2-num" style={{ color: 'var(--fg)' }}>1</span></span>
              </div>
            </Card>
            )}
          </div>
        </div>
      </>

      {/* ── G-286/G-287/G-290: die Bibliothek wird benutzbar ───────
          **Tom, 2026-08-31:** *„irgend eine auflistung die gar nichts
          sagt, nichtmal anschaubar ist oder editierbar."*

          `[cmd]` **Vorher:** `PlanBibliothekEcht` — drei Textzeilen
          je Woche, nicht anklickbar. **Jetzt: Karte (G-287), die
          aufs Tages-Akkordeon fuehrt (G-286), plus Aktivieren mit
          Lebenszyklus (G-290).**

          `[cmd]` **BERICHTIGT in G-310:** hier stand *,,Einen Plan,
          nicht zwei — der zweite gehoert `tom.seed@example.com` und
          faellt per RLS heraus."* **Am 2026-09-01 gemessen: vier
          eigene Plaene bei `test-user`, und nur dieser eine wurde
          gezeigt.** `[read]` **Der Satz war eine Erklaerung fuer eine
          Luecke** (A-62). **Die uebrigen stehen jetzt in der
          Bibliothek darunter.** */}
      {/* ══ G-315: der aktive Plan steht EINMAL ══════════════
          **Tom, 2026-09-02:** *,,der untere teil alles ineinander
          verschoben."*

          `[cmd]` **Er stand dreimal:** oben als `PlanKopfEcht`, hier
          als `MealPlanCard` mit Aufklappzeile, unten in der
          Bibliothek.

          `[cmd]` **Die Vorlage trennt in UNTER-TABS** —
          `tab === "active"` (Z. 359) und `tab === "library"`
          (Z. 447). **Sie stehen nie gleichzeitig auf dem Schirm.**

          `[read]` **Wir haben die Unter-Tabs aufgeloest** (G-286:
          `SPEC_03` Flow 3 kennt EINE Uebersicht). **Dann darf der
          aktive Plan aber auch nur einmal erscheinen** — sonst ist
          die Aufloesung eine Verdreifachung.

          `[cmd]` **`MealPlanCard` und `MealPlanDetail` sind entfernt,
          nicht auskommentiert** (A-59). **Was sie zeigten, steht in
          `PlanKopfEcht` (Kopf, Ring, Rechnung) und der Bibliothek
          (die anderen Plaene).** */}

      {/* ══ G-310: die Bibliothek, echt ═════════════════════
          `[cmd]` **Am 2026-09-01 gemessen: vier Plaene bei
          `test-user`, EINER erschien.** `[read]` **`allePlaene` war
          geladen, ging aber nur an den Planner.**

          `[cmd]` **Hier stand: *,,Einen Plan, nicht zwei — der zweite
          gehoert `tom.seed@example.com` und faellt per RLS heraus."***
          **Das begruendete genau die Luecke** (A-62). */}
      {d && allePlaene.length > 0 && (
        <PlanBibliothekEcht
          plaene={allePlaene}
          aktivId={d.plan?.id ?? null}
          onAktivieren={() => setAktivieren(true)}
        />
      )}

      {!d && (
        <div className="v2-grid v2-g-cols-3" style={{ gap: 12 }}>
          {BIBLIOTHEK.map(p => (
            <Card
              key={p.n}
              attrappe={ATTRAPPE}
              style={{
                padding: 14,
                border: p.active ? '1px solid color-mix(in srgb, var(--acc-nutri) 35%, var(--border))' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{p.n}</span>
                {p.active && <Pill variant="acc" style={{ fontSize: 9 }}>active</Pill>}
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                <Pill style={{ fontSize: 9.5 }}>{p.src}</Pill>
                <Pill style={{ fontSize: 9.5 }}>{p.days} days</Pill>
                <Pill style={{ fontSize: 9.5 }}>{p.kcal} kcal</Pill>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {!p.active && <button type="button" className="v2-btn v2-btn-primary v2-btn-sm">Activate</button>}
                <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm">Preview</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ══ G-288/Flow 8: die Einkaufsliste ist umgezogen ══════
          `[cmd]` **`SPEC_03` Flow 8, Schritt 1: *,,Rezept oeffnen ->
          Einkaufsliste erstellen"*.** `[read]` **Sie entsteht aus
          einem REZEPT, nicht aus einer Planwoche** — der Reiter hier
          hat sie nie erzeugen koennen.

          `[cmd]` **Der Unterreiter zeigte eine Attrappe** (*,,from
          Recomp 5-Meal Plan"*, Print/Export ohne Wirkung). **Er ist
          entfernt, nicht abgeschaltet** — A-59. */}

      {/* G-290: Startdatum, Laenge und Lebenszyklus — ein eigener
          Vorgang. `[read]` **`planAnlegen` setzt `status` bewusst auf
          `'assigned'`** (G-267): ein neuer Plan ist noch nicht aktiv,
          und zwei Entscheidungen gehoeren nicht in einen Knopf. */}
      {aktivieren && d?.plan && (
        <MealPlanActivationModal
          d={d}
          onClose={() => setAktivieren(false)}
          onGespeichert={() => router.refresh()}
        />
      )}

      {/* G-267 / G-268: anlegen und bearbeiten. `[read]` Ein Modal
          fuer beides — die Felder sind dieselben, nur die Route
          unterscheidet. */}
      {anlegen && (
        <PlanModal
          vorhanden={null}
          onClose={() => setAnlegen(false)}
          onFertig={() => { setAnlegen(false); router.refresh() }}
        />
      )}
      {bearbeiten && d?.plan && (
        <PlanModal
          vorhanden={{
            id: d.plan.id,
            name: d.plan.name,
            description: d.plan.description,
            target_kcal: d.plan.target_kcal,
            target_protein_g: d.plan.target_protein_g,
            target_carbs_g: d.plan.target_carbs_g,
            target_fat_g: d.plan.target_fat_g,
            lifecycle_type: d.plan.lifecycle_type,
            start_date: d.plan.start_date,
            days_count: d.plan.days_count,
          }}
          onClose={() => setBearbeiten(false)}
          onFertig={() => { setBearbeiten(false); router.refresh() }}
        />
      )}
    </div>
  )
}
