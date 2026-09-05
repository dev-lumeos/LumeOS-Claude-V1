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
// ══ WAS DER PLANNER IST — die Vorfrage aus G-299 ═══════════════════
//
// **Tom, 2026-08-31:** *,,planner ist irgendwas aber noch nicht
// brauchbar"* — und: *,,was ist der Planner, wenn es den
// Meal-plans-Reiter gibt?"*
//
// `[cmd]` **Gemessen am 2026-08-31:** `SPEC_10_COMPONENTS.md` fuehrt
// **acht Meal-Plan-Komponenten und keinen Planner.** `MealPlanDayView`
// heisst dort *,,Ein Tag innerhalb eines Plans"*.
//
// `[cmd]` **Beide Reiter lesen denselben Plan** (`ladePlan`), zeigen
// aber Verschiedenes:
//
//     Meal plans   Karte, Ziele, Lebenszyklus, Herkunft, Einhaltung
//                  -> WAS der Plan ist
//     Planner      Wochengitter, Zelle je Mahlzeit und Tag
//                  -> WANN was gegessen wird
//
// `[read]` **Die Antwort ist deshalb nicht ,,loeschen", sondern
// ,,zustaendig machen":** eine Position gehoert in ein Raster aus Tag
// und Mahlzeit — **genau das ist dieses Gitter.** Der Planner ist ab
// G-298 die **Bearbeitungsflaeche des aktiven Plans**; Meal plans
// bleibt seine Beschreibung.
//
// `[read]` **Keine dritte Ansicht** (Auftrag): das Formular klappt IN
// der Zelle auf, es entsteht kein eigener Ort.
//
// ══ WARUM ER AUF DEM 18.6. OEFFNETE ════════════════════════════════
//
// `[cmd]` **Nicht die Navigation war schuld.** `PlannerEchtTab` sucht
// seit jeher die Woche, in der heute liegt (`findIndex`), und faellt
// auf die erste zurueck. `[cmd]` **Der Plan hat nur drei Wochen:
// 18.6.-24.6., 2.7.-8.7., 9.7.-15.7.** — **heute ist in keiner.**
//
// `[read]` **Der Rueckfall war stumm.** Jetzt sagt die Leiste, dass
// die gezeigte Woche nicht die laufende ist, und **ein Knopf fuehrt
// zur naechstgelegenen.**
//
// **NICHT GEBAUT: der Generator.** `[read]` Tom, im Auftrag: *„Ein
// Plan, den der Nutzer fuellt, ist ein Kalender. Ein Plan, den das
// System vorschlaegt, ist eine Ernaehrungsempfehlung."* Das ist Buddys
// Aufgabe. `Copy week` kopiert deshalb eine vorhandene Woche
// (`copy_meal_plan_week`), es erfindet keine.
import * as React from 'react'
// G-319: der Planeditor.
import { PlanModal } from './plan-modal'

// G-319: die Sperre und ihr Grund.
import { bearbeitbarkeit, herkunftVon }
  from '../../../lib/nutrition/plan-lage'
import { useRouter } from 'next/navigation'

// G-345 / E-64: die Einkaufsliste an der Planwoche.
import { listeHolen, wochenlisteErzeugen } from './einkaufsliste-aktionen'
import { EinkaufslisteModal } from './einkaufsliste-modal'
// `[cmd]` **NUR DER TYP** aus dem Leseweg — er zieht `next/headers`
// mit, und ein Wert-Import brächte HTTP 500 bei gruenem Typecheck
// (G-74, G-79, G-97).
import type { Einkaufsliste } from '../../../lib/nutrition/einkaufsliste-lesen'
// G-331: `InEntwicklungKnopf` ist weg — die letzte Attrappe im
// Planner war ueberholt (der Schreibpfad steht seit C-372).
import { Card, Icon, Pill } from '@lumeos/ui'

// `[cmd]` **NUR TYPEN AUS `plan-lesen.ts`.** Die Datei importiert
// `next/headers`; ein WERT-Import von hier zoege das Server-I/O ins
// Browserbuendel und die Seite antwortete mit HTTP 500 — der Typecheck
// bleibt dabei gruen. Derselbe Fehler wie in G-74 und G-79, hier beim
// Bauen einmal ausgeloest und gemessen.
//
// Die Beschriftung steht deshalb in `plan-model.ts`, ohne Serverbezug.
import type {
  PlanDaten, PlanWoche, PlanEintrag,
} from '../../../lib/nutrition/plan-lesen'
import { SLOT_LABEL } from '../../../lib/nutrition/plan-model'
// G-298: die Positionen bearbeiten - das Formular sitzt in der Zelle.
import {
  EintragForm, EintragLoeschen, type Quelle,
} from './plan-eintrag-editor'
import type { MahlzeitTyp } from '../../../lib/nutrition/plan-eintrag-lage'
import { laufzeitVon, laufzeitSatz, LAUFZEIT_MARKE }
  from '../../../lib/nutrition/plan-eintrag-lage'

const WOCHENTAGE = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** `2026-06-18` zu `18.6.` — kurz, weil sieben davon nebeneinander stehen. */
function tagKurz(iso: string): string {
  const [, m, d] = iso.split('-')
  return d && m ? `${Number(d)}.${Number(m)}.` : iso
}

/**
 * Wohin die kopierte Woche soll — G-319.
 *
 * **Tom, 2026-09-02:** *,,user fragen und vorschlaege bringen wie: ab
 * naechsten ungeplanten tag / anschluss an diese woche / oder
 * usereingabe datum dann muss aber ein kalender oeffnen der schon
 * geplante tage anzeigt zb rot zur info."*
 *
 * `[read]` **Drei Wege, und der Nutzer waehlt** — dieselbe Form wie
 * die Ablauffrage aus C-377.
 *
 * `[cmd]` **`UNIQUE (plan_id, week_start)`** — eine belegte Woche
 * nimmt keine zweite auf. **Der Kalender zeigt sie rot**, statt den
 * Fehler erst beim Speichern zu bringen.
 */
function KopierZiel({ woche, wochen, onFertig, onAbbruch }: {
  /** Die Woche, die kopiert wird. */
  woche: PlanWoche
  /** Alle Wochen des Plans — sie sind die belegten Plaetze. */
  wochen: readonly PlanWoche[]
  onFertig: () => void
  onAbbruch: () => void
}) {
  const belegt = React.useMemo(
    () => new Set(wochen.map(w => w.week_start)), [wochen])

  // `[read]` **Anschluss an DIESE Woche** — sieben Tage weiter.
  const anschluss = tageWeiter(woche.week_start, 7)
  // `[read]` **Der naechste freie Montag ab dem Planende** — nicht
  // ab heute: der Plan soll laenger werden, nicht zerrissen.
  const letzte = [...wochen].map(w => w.week_start).sort().pop()
    ?? woche.week_start
  let frei = tageWeiter(letzte, 7)
  for (let i = 0; i < 52 && belegt.has(frei); i += 1) frei = tageWeiter(frei, 7)

  const [weg, setWeg] = React.useState<'anschluss' | 'ende' | 'datum'>(
    belegt.has(anschluss) ? 'ende' : 'anschluss')
  const [datum, setDatum] = React.useState(frei)
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  const ziel = weg === 'anschluss' ? anschluss : weg === 'ende' ? frei : datum
  const zielBelegt = belegt.has(ziel)

  async function kopieren() {
    if (zielBelegt) {
      setFehler('In dieser Woche liegt schon eine Planwoche.')
      return
    }
    setLaeuft(true); setFehler(null)
    const a = await fetch('/api/nutrition/plan', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        art: 'woche_kopieren', week_id: woche.id, ziel,
      }),
    })
    const k = await a.json().catch(() => null)
    setLaeuft(false)
    if (!a.ok) { setFehler(k?.error ?? `Fehler ${a.status}`); return }
    onFertig()
  }

  return (
    <div style={{
      border: '1px solid var(--acc-nutri)', borderRadius: 6, padding: 10,
      marginTop: 8, background: 'var(--surface-2)',
    }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
        Woche kopieren
      </div>
      <p className="v2-muted" style={{ fontSize: 11, margin: '0 0 8px', lineHeight: 1.5 }}>
        Die Woche ab {deutschesDatum(woche.week_start)} mit allen
        Positionen — wohin?
      </p>

      <div className="v2-col-gap" style={{ gap: 4, marginBottom: 8 }}>
        {([
          ['anschluss', 'Direkt im Anschluss',
           `ab ${deutschesDatum(anschluss)}`, belegt.has(anschluss)],
          ['ende', 'Ans Planende',
           `ab ${deutschesDatum(frei)} — die nächste freie Woche`, false],
          ['datum', 'Datum wählen', 'im Kalender unten', false],
        ] as const).map(([k, titel, satz, gesperrt]) => (
          <button
            key={k} type="button"
            onClick={() => { if (!gesperrt) setWeg(k) }}
            aria-pressed={weg === k}
            disabled={gesperrt}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              gap: 2, padding: '7px 9px', borderRadius: 6,
              cursor: gesperrt ? 'not-allowed' : 'pointer',
              textAlign: 'left', width: '100%', color: 'inherit',
              opacity: gesperrt ? 0.5 : 1,
              background: weg === k ? 'var(--bg-elev)' : 'var(--surface)',
              border: `1px solid ${weg === k ? 'var(--acc-nutri)' : 'var(--border)'}`,
            }}
          >
            <span style={{ fontSize: 11.5, fontWeight: weg === k ? 600 : 400 }}>
              {titel}
              {gesperrt && (
                <span className="v2-dim" style={{ fontWeight: 400 }}>
                  {' '}· belegt
                </span>
              )}
            </span>
            <span className="v2-dim" style={{ fontSize: 10.5 }}>{satz}</span>
          </button>
        ))}
      </div>

      {/* ══ Der Kalender: belegte Wochen rot ═══════════════
          `[read]` **Zwoelf Wochen ab der ersten des Plans** — genug,
          um ein Quartal zu ueberblicken, ohne zu blaettern. */}
      {weg === 'datum' && (
        <div style={{ marginBottom: 8 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>
            Zielwoche — <span style={{ color: 'var(--neg)' }}>rot</span> ist belegt
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4,
          }}>
            {wochenGitter(wochen).map(m => {
              const istBelegt = belegt.has(m)
              const gewaehlt = datum === m
              return (
                <button
                  key={m} type="button"
                  onClick={() => { if (!istBelegt) setDatum(m) }}
                  disabled={istBelegt}
                  aria-pressed={gewaehlt}
                  style={{
                    padding: '5px 4px', borderRadius: 5, fontSize: 10.5,
                    cursor: istBelegt ? 'not-allowed' : 'pointer',
                    color: istBelegt ? 'var(--neg)' : 'inherit',
                    background: gewaehlt ? 'var(--bg-elev)' : 'var(--surface)',
                    border: `1px solid ${gewaehlt
                      ? 'var(--acc-nutri)'
                      : istBelegt
                        ? 'color-mix(in srgb, var(--neg) 35%, var(--border))'
                        : 'var(--border)'}`,
                  }}
                >
                  {deutschesDatum(m)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {fehler && (
        <p style={{ fontSize: 10.5, color: 'var(--neg)', margin: '0 0 6px' }}>{fehler}</p>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        <button type="button" className="v2-btn v2-btn-sm v2-btn-primary"
                disabled={laeuft || zielBelegt} onClick={kopieren}>
          {laeuft ? 'Kopiert…' : `Kopieren nach ${deutschesDatum(ziel)}`}
        </button>
        <button type="button" className="v2-btn v2-btn-sm"
                disabled={laeuft} onClick={onAbbruch}>
          Abbrechen
        </button>
      </div>
    </div>
  )
}

/** Ein ISO-Datum um `n` Tage weiter. */
function tageWeiter(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Ein ISO-Datum deutsch, kurz. */
function deutschesDatum(iso: string): string {
  const [, m, t] = iso.split('-')
  return t && m ? `${Number(t)}.${Number(m)}.` : iso
}

/**
 * Zwoelf Wochenanfaenge ab der ersten Planwoche — G-319.
 *
 * `[read]` **Ab der ERSTEN, nicht ab heute** — so sieht man den Plan
 * im Zusammenhang, samt seiner Luecken.
 */
function wochenGitter(wochen: readonly PlanWoche[]): string[] {
  const start = [...wochen].map(w => w.week_start).sort()[0]
  if (!start) return []
  return Array.from({ length: 12 }, (_, i) => tageWeiter(start, i * 7))
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
  // G-319: welche Woche wird gerade kopiert?
  const [kopieren, setKopieren] = React.useState<string | null>(null)
  // G-319: der Planeditor.  **Vor dem fruehen Ausstieg** —
  // ein Hook nach einem  verletzt die Aufrufreihenfolge.
  const [bearbeiten, setBearbeiten] = React.useState(false)
  // ══ G-345: die Einkaufsliste je Woche ═══════════════════════════
  //
  // `[read]` **Welche Woche schon eine hat** — der Knopf heisst
  // danach *oeffnen* statt *anlegen*. **Kommt vom Server mit**
  // (`d.wochenlisten`), damit kein Ladezustand je Woche entsteht.
  const [listen, setListen] = React.useState<Record<string, string>>(
    () => d.wochenlisten ?? {})
  const [laeuftListe, setLaeuftListe] = React.useState<string | null>(null)
  const [listeOffen, setListeOffen] = React.useState<Einkaufsliste | null>(null)
  const router = useRouter()
  const [woche, setWoche] = React.useState(() => {
    // Die Woche, in der heute liegt — sonst die erste.
    const heute = heuteIso()
    const i = d.wochen.findIndex(w => w.tage.some(t => t.plan_date === heute))
    return i >= 0 ? i : 0
  })

  /**
   * Nach jeder Aenderung neu lesen.
   *
   * `[read]` **`router.refresh()`, kein eigener Zustand.** Die Zahlen
   * der Zelle (kcal je Eintrag) rechnet der Leseweg aus `recipe_nutrition`
   * — sie im Browser nachzuhalten hiesse, dieselbe Rechnung ein
   * zweites Mal zu bauen. **Zwei Wahrheiten statt einer.**
   */
  const neuLaden = React.useCallback(() => { router.refresh() }, [router])

  /**
   * Die Einkaufsliste einer Woche — G-345 / E-64.
   *
   * `[read]` **Gibt es schon eine, wird sie geoeffnet.** **Sonst
   * erzeugt `shopping_list_from_meal_plan_week` sie** (C-407) und
   * oeffnet sie danach.
   *
   * `[cmd]` **Zwei Wirkungen, ein Knopf** — aber nie zweimal
   * anlegen: der Zustand merkt sich die Kennung.
   */
  async function wochenliste(wocheId: string) {
    setLaeuftListe(wocheId)
    try {
      let id = listen[wocheId]
      if (!id) {
        const a = await wochenlisteErzeugen(wocheId)
        if (!a.ok || !a.id) return
        id = a.id
        setListen(v => ({ ...v, [wocheId]: id }))
        router.refresh()
      }
      setListeOffen(await listeHolen(id))
    } finally {
      setLaeuftListe(null)
    }
  }

  /** Die Rezepte als Auswahl — mehr braucht das Formular nicht. */
  const rezeptWahl: Quelle[] = React.useMemo(
    () => d.rezepte.map(r => ({ id: r.id, name: r.name_de })),
    [d.rezepte],
  )

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
        {/* ══ G-331 / G-305 Punkt 2+3: die Attrappe war ueberholt ══
            `[cmd]` **Hier stand ein `InEntwicklungKnopf` mit dem
            Grund *,,der Schreibpfad im Browser ist nicht Teil dieses
            Auftrags (G-97)"*.**

            `[cmd]` **Gemessen am 2026-09-02: der Schreibpfad steht.**
            `planMitWochenAnlegen` (C-372) legt Plan, Wochen und Tage
            an, **und `NeuerPlanForm` ruft ihn** — in der Werkbank,
            zwei Bildschirmzeilen weiter oben.

            `[read]` **Ein Knopf, der falsch informiert, ist
            schlimmer als keiner** (G-305). **Der Verweis fuehrt
            dorthin, wo es geht**, statt eine Sackgasse zu
            behaupten. */}
        <p className="v2-hinweis" data-probe="plan-anlegen-verweis"
           style={{ marginTop: 12 }}>
          <Icon name="plus" className="v2-ic v2-ic-sm" />
          <span>
            Einen Plan legst du in der <strong>Werkbank</strong> oben
            an — dort steht <em>Neuer Plan</em> mit Name, Zielen und
            der Wochenzahl.
          </span>
        </p>
      </Card>
    )
  }

  const w = d.wochen[Math.min(woche, d.wochen.length - 1)]
  const heute = heuteIso()
  const eintraegeDerWoche = w.tage.reduce((s, t) => s + t.eintraege.length, 0)

  // ══ G-298: die Laufzeit, aus den Tagen gelesen ═══════════════════
  //
  // `[cmd]` **`start_date`, `days_count` und `lifecycle_type` sind bei
  // diesem Plan alle `NULL`** (gemessen 2026-08-31) — **die Laufzeit
  // steht nur in den Tageszeilen.** Eine Rechnung aus `start_date`
  // ergaebe `NULL`, und die Karte sagte weiter nur *„aktiv"*.
  const alleTage = d.wochen.flatMap(x => x.tage.map(t => t.plan_date))
  const laufzeit = laufzeitVon(alleTage, heute)

  // `[read]` **Die Coach-Sperre wirkt auch hier.** `[cmd]` G-269:
  // `coach_created` und `marketplace` sind ohne Freigabe gesperrt —
  // sonst liesse sich ein gesperrter Plan ueber seine Positionen
  // umbauen. **Der Schreibweg prueft es ebenfalls**; das hier ist die
  // Anzeige, nicht die Regel.
  const herkunft = d.plan.plan_origin
  const bearbeitbar = herkunft !== 'coach_created' && herkunft !== 'marketplace'
  // G-319: der Satz zur Sperre — je Herkunft ein anderer.
  const recht = bearbeitbarkeit(herkunftVon(herkunft), false)
  const sperrGrund = recht.erlaubt ? '' : recht.satz

  // Die Woche, die heute am naechsten liegt — fuer den Sprungknopf.
  const heuteWoche = d.wochen.findIndex(x => x.tage.some(t => t.plan_date === heute))
  const zeigtLaufende = heuteWoche >= 0 && heuteWoche === woche

  return (
    <div>
      {/* ══ G-298/G-299: sagen, was los ist ═══════════════════════
          **Tom, 2026-08-31:** *,,der Plan laeuft vom 18.06. bis
          08.07., heute ist der 31.08., und die Karte sagt aktiv."*
          `[read]` **Beides stimmt einzeln und ergibt zusammen keinen
          Sinn.** Der Zustand in der Datenbank bleibt `active` — ihn
          beim Lesen umzuschreiben waere ein Schreibvorgang. **Also
          wird er gezeigt UND eingeordnet.** */}
      {laufzeit.art !== 'laeuft' && (
        <div className="v2-insight" style={{ marginBottom: 12 }}>
          <div className="v2-insight-mark" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="v2-insight-title">
              {LAUFZEIT_MARKE[laufzeit.art] ?? 'Laufzeit'}
            </div>
            <div className="v2-insight-body">
              {laufzeitSatz(laufzeit)}
              {!zeigtLaufende && heuteWoche < 0 && (
                <> Der Planner zeigt deshalb die erste Planwoche, nicht die
                  laufende — es gibt für heute keine.</>
              )}
            </div>
          </div>
        </div>
      )}

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

        {/* `[cmd]` **Der Planner oeffnete auf dem 18.6.** (G-299) -
            nicht wegen der Navigation, sondern weil KEINE der drei
            Wochen heute enthaelt. `[read]` **Der Rueckfall war
            stumm; jetzt steht er da.** */}
        {heuteWoche >= 0 && !zeigtLaufende && (
          <button type="button" className="v2-btn v2-btn-sm"
                  onClick={() => setWoche(heuteWoche)}>
            Zur laufenden Woche
          </button>
        )}
        {heuteWoche < 0 && (
          <span className="v2-dim" style={{ fontSize: 10.5 }}>
            keine Planwoche für heute
          </span>
        )}

        {w.name && <Pill>{w.name}</Pill>}
        {/* `[cmd]` `copied_from_week_id` steht in der Tabelle — eine
            kopierte Woche sagt das, statt wie eine eigene auszusehen. */}
        {w.kopiert_von && <Pill variant="acc">kopiert</Pill>}

        <div className="v2-spacer" />
        <span className="v2-num v2-dim" style={{ fontSize: 11 }}>
          {eintraegeDerWoche} Eintr{eintraegeDerWoche === 1 ? 'ag' : 'aege'}
        </span>
        {/* ══ G-319: `Copy week` kopiert wirklich ═════════════
            **Tom, 2026-09-02:** *,,copy week braucht eine
            funktion."*

            `[cmd]` **`nutrition.copy_meal_plan_week(p_week_id,
            p_target_week_start)` steht seit C-150** — mit
            Zeilenschutz (`auth.uid()`), und sie gibt die neue
            Wochen-ID zurueck. **Der Knopf war eine Attrappe ueber
            einer fertigen Funktion.** */}
        <button type="button" className="v2-btn"
                disabled={!bearbeitbar}
                onClick={() => setKopieren(w.id)}>
          <Icon name="copy" className="v2-ic v2-ic-sm" /> Copy week
        </button>
        {/* ══ G-345 / E-64: die Einkaufsliste an der Woche ══════
            **E-64, 2026-09-07:** die Einkaufsliste gehoert an die
            Planwoche. **Der Hauptfall: wer eine Woche plant, kauft
            fuer die Woche.**

            `[cmd]` **`shopping_list_from_meal_plan_week` steht seit
            C-407** — sie summiert gleiche `food_id` in Gramm und
            haelt gleiche Freitextnamen getrennt.

            `[read]` **Der Knopf heisst verschieden, je nachdem, ob
            es die Liste schon gibt** — *anlegen* gegen *oeffnen*.
            **Ein Knopf, der zweimal dasselbe tut, legt zwei Listen
            an.** */}
        <button type="button" className="v2-btn"
                data-probe="wochenliste"
                disabled={laeuftListe === w.id}
                onClick={() => void wochenliste(w.id)}>
          <Icon name="bookmark" className="v2-ic v2-ic-sm" />
          {laeuftListe === w.id
            ? 'Einen Moment…'
            : listen[w.id] ? 'Einkaufsliste öffnen' : 'Einkaufsliste'}
        </button>
        {/* ══ G-319: `New recipe` ist entfernt ═══════════════
            **Tom, 2026-09-02:** *,,+new recipe gibt es nicht in
            planner."*

            `[cmd]` **Der Rezepteditor steht seit G-300** — im
            Rezepte-Reiter, mit Zutatensuche und Naehrwerten.
            `[read]` **Ein zweiter Einstieg hier waere derselbe
            Fehler wie die Rezepte-Auflistung** (G-311/3): doppelt,
            und in keiner Spec.

            `[read]` **A-59: entfernt, nicht auskommentiert.** */}
      </div>

      {/* G-319: der Planeditor — derselbe wie im Meal-plans-Reiter. */}
      {bearbeiten && d.plan && (
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
          onFertig={() => { setBearbeiten(false); neuLaden() }}
        />
      )}

      {/* G-319: der Kopier-Dialog mit Kalender. */}
      {kopieren === w.id && (
        <KopierZiel
          woche={w}
          wochen={d.wochen}
          onFertig={() => { setKopieren(null); neuLaden() }}
          onAbbruch={() => setKopieren(null)}
        />
      )}

      {/* ══ G-345 / E-64: die Einkaufsliste der Woche ══════════
          `[read]` **Dasselbe Fenster wie im Rezept und im eigenen
          Reiter** — drei Orte, eine Ansicht. */}
      {listeOffen && (
        <EinkaufslisteModal
          liste={listeOffen}
          onClose={() => setListeOffen(null)}
          onGeaendert={neuLaden}
        />
      )}

      <Card
        title={d.plan.name}
        sub={d.plan.description ?? undefined}
        /* ══ G-319: Bearbeiten oben rechts ═════════════════
           **Tom, 2026-09-02:** *,,darin bearbeiten button auf der
           rechten oberen seite, falls ein plan nicht bearbeitbar ist
           weil gesperrt muss das ausgewiesen werden und der
           bearbeiten button nicht anwaehlbar sein."*

           `[cmd]` **`bearbeitbarkeit()` steht in `plan-lage.ts` und
           liefert je Herkunft einen eigenen Satz** — sie wurde hier
           nicht benutzt. */
        actions={(
          <>
            {d.plan.is_active && <Pill variant="acc">aktiv</Pill>}
            {!bearbeitbar && <Pill>gesperrt</Pill>}
            <button type="button" className="v2-btn v2-btn-sm"
                    disabled={!bearbeitbar}
                    title={bearbeitbar ? undefined : sperrGrund}
                    onClick={() => setBearbeiten(true)}>
              Bearbeiten
            </button>
          </>
        )}
      >
        {/* `[read]` **Der Grund steht da, nicht nur das Schloss** —
            eine Sperre ohne Begruendung ist eine Sackgasse (G-311). */}
        {!bearbeitbar && (
          <div className="v2-hinweis" style={{ marginBottom: 10 }}>
            {sperrGrund}
          </div>
        )}
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

            {/* ══ G-336: die Zeile traegt ihren Namen mit ═══════
                `[cmd]` **Hier stand `SLOT_LABEL[slot]`** — die feste
                Kategorienliste. `[read]` **Ein Plan-Slot heisst
                *,,Nachmittagssnack"*, nicht `snack`** (E-59), und ein
                Nutzer-Slot heisst, wie der Nutzer ihn nannte (E-58).

                `[read]` **`kategorie` bleibt daneben stehen** — sie
                filtert die Eintraege, denn `meal_plan_entries` traegt
                `meal_type`, nicht die Slotposition. */}
            {d.zeilen.map((zeile, i) => (
              <React.Fragment key={`${zeile.kategorie}-${i}`}>
                <div
                  data-probe="raster-zeile"
                  style={{
                    padding: '10px 6px', fontSize: 11, fontWeight: 500,
                    color: 'var(--fg-muted)', borderTop: '1px solid var(--border)',
                  }}
                >
                  {zeile.label}
                  {zeile.zeit && (
                    <span className="v2-dim v2-num"
                          style={{ fontSize: 9.5, marginLeft: 5 }}>
                      {zeile.zeit}
                    </span>
                  )}
                </div>
                {w.tage.map(t => (
                  <Zelle
                    key={`${t.id}-${zeile.kategorie}-${i}`}
                    tagId={t.id}
                    tag={t.plan_date}
                    heute={heute}
                    eintraege={t.eintraege.filter(
                      e => e.meal_type === zeile.kategorie)}
                    slot={zeile.kategorie as MahlzeitTyp}
                    rezepte={rezeptWahl}
                    alleRezepte={d.rezepte}
                    tagesSumme={tagesSummeVon(t.eintraege)}
                    ziel={d.plan?.target_kcal ?? null}
                    bearbeitbar={bearbeitbar}
                    onAenderung={neuLaden}
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

      {/* ══ G-311: die Rezepte-Auflistung ist entfernt ═════════
          **Tom, 2026-09-01:** *,,darunter rezepte auflistung? fuer
          was ist das zeigt nur irgendwelche daten an."*

          `[cmd]` **Sie stand in keiner Spec und in keinem Mockup.**
          `[read]` **Sie stammt aus der Zeit vor dem Rezepte-Reiter**
          — **und ist seit G-289 doppelt.**

          `[read]` **A-59: geloescht, nicht auskommentiert.** git holt
          sie zurueck. */}
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
 * Die Zutaten eines Rezepts im Raster — G-311.
 *
 * `[cmd]` **Dieselben Angaben wie `RezeptKarte` im Rezepte-Reiter**
 * (`rezepte-echt.tsx` Z. 700): Name und Menge je Zutat.
 *
 * `[read]` **Aus `PlanDaten.rezepte`**, nicht aus einer zweiten
 * Abfrage — der Leseweg holt sie im selben Verbund, der schon fuer
 * die Zaehlung gelesen wurde.
 *
 * `[read]` **`planned_servings` skaliert** — dieselbe Rechnung wie
 * beim Bestaetigen (G-309): `portionen / servings`. **Sonst zeigte
 * das Raster andere Mengen als das Tagebuch.**
 */
function ZutatenListe({ rezeptId, rezepte, portionen }: {
  rezeptId: string | null
  rezepte: PlanDaten['rezepte']
  portionen: number | null
}) {
  const r = rezepte.find(x => x.id === rezeptId)
  if (!r) return null
  if (r.posten.length === 0) {
    return (
      <div className="v2-dim" style={{ fontSize: 10, paddingLeft: 4, marginTop: 2 }}>
        Für dieses Rezept sind keine Zutaten hinterlegt.
      </div>
    )
  }
  const proRezept = r.servings && r.servings > 0 ? r.servings : 1
  const faktor = (portionen ?? 1) / proRezept
  return (
    <div style={{
      marginTop: 4, paddingLeft: 6, borderLeft: '2px solid var(--border)',
    }}>
      {r.posten.map(p => (
        <div key={p.id} style={{
          display: 'flex', justifyContent: 'space-between', gap: 6,
          fontSize: 10, lineHeight: 1.5,
        }}>
          <span className="v2-dim" style={{ minWidth: 0 }}>{p.name}</span>
          <span className="v2-num v2-dim">
            {p.amount_g === null
              ? '—'
              : `${Math.round(p.amount_g * faktor * 10) / 10} g`}
          </span>
        </div>
      ))}
      <div className="v2-dim" style={{ fontSize: 9.5, marginTop: 2 }}>
        {r.zutaten} Zutaten{r.kcal !== null && ` · ${r.kcal} kcal je Rezept`}
      </div>
    </div>
  )
}

/**
 * Eine Zelle des Rasters — seit G-298 bearbeitbar.
 *
 * `[read]` **Eine leere Zelle bleibt leer** — kein Platzhalter, kein
 * „—". Im Entwurf war jede Zelle gefuellt, weil die Daten erfunden
 * waren; echte Plaene haben Luecken, und die leere Woche des Seeds ist
 * genau dafuer da.
 *
 * `[read]` **Der Plus-Knopf erscheint beim Darauffahren**, nicht
 * dauerhaft: 28 sichtbare Plus-Zeichen in einem Gitter sind Rauschen.
 * **Bei Tastaturbedienung erscheint er ueber `:focus-within`** — sonst
 * waere er ohne Maus nicht erreichbar.
 */
/**
 * Was ein Tag schon trägt, in kcal — G-320.
 *
 * `[cmd]` **Aus `PlanEintrag.kcal` gerechnet** — der Wert steht seit
 * G-298 im Leseweg, aus `recipe_nutrition` beziehungsweise
 * `food_nutrient_snapshot`. **Keine zweite Abfrage über denselben
 * Tag.**
 *
 * `[read]` **Trägt KEIN Eintrag einen Wert, ist die Antwort `null`,
 * nicht 0** — ein Tag mit drei Positionen ohne ermittelbare kcal hat
 * nicht null Kalorien, er hat unbekannte. `[read]` **Das ist die
 * Lehre aus `bls-fehlend-heisst-nicht-null`.**
 *
 * `[read]` **Trägt EINER einen Wert, wird summiert, was da ist** —
 * mit einem Strich zu antworten, weil eine von vier Positionen
 * fehlt, wäre unbrauchbarer als eine Untergrenze.
 */
export function tagesSummeVon(eintraege: readonly PlanEintrag[]): number | null {
  const werte = eintraege
    .map(e => e.kcal)
    .filter((k): k is number => typeof k === 'number' && Number.isFinite(k))
  if (werte.length === 0) return null
  return Math.round(werte.reduce((s, k) => s + k, 0))
}

function Zelle({
  tagId, tag, heute, eintraege, slot, rezepte, alleRezepte,
  tagesSumme, ziel, bearbeitbar, onAenderung,
}: {
  tagId: string
  tag: string
  heute: string
  eintraege: PlanEintrag[]
  slot: MahlzeitTyp
  rezepte: readonly Quelle[]
  /**
   * G-320: was der GANZE Tag schon traegt, in kcal.
   *
   * `[cmd]` **Aus den Eintraegen gerechnet, nicht neu geladen** —
   * `PlanEintrag.kcal` steht seit G-298 im Leseweg. **Eine eigene
   * Abfrage waere eine zweite Wahrheit ueber denselben Tag.**
   *
   * `null` heisst: nicht ermittelbar, **nicht null Kalorien.**
   */
  tagesSumme: number | null
  /** G-320: `target_kcal` des Plans — `null`, wenn keines gesetzt ist. */
  ziel: number | null
  /** G-311: die vollen Rezepte — fuer die Zutatenliste beim Klick. */
  alleRezepte: PlanDaten['rezepte']
  /** G-269: bei gesperrter Herkunft wird nichts angeboten. */
  bearbeitbar: boolean
  onAenderung: () => void
}) {
  // G-311: welches Rezept zeigt seine Zutaten?
  const [zutaten, setZutaten] = React.useState<string | null>(null)
  const istHeute = tag === heute
  // `null` = zu, `'neu'` = Formular fuer einen neuen Eintrag,
  // sonst die Id des Eintrags, der bearbeitet wird.
  const [offen, setOffen] = React.useState<string | null>(null)

  const fertig = () => { setOffen(null); onAenderung() }

  return (
    <div
      className="v2-planner-zelle"
      style={{
        padding: 8, minHeight: 60, borderTop: '1px solid var(--border)',
        background: istHeute
          ? 'color-mix(in oklch, var(--acc-nutri) 5%, transparent)'
          : 'transparent',
        fontSize: 11,
      }}
    >
      {eintraege.map(e => (
        <div key={e.id} style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* ══ G-311: ein Rezept laesst sich oeffnen ════════
                  **Tom, 2026-09-01:** *,,eingetragene recipes sind ja
                  ok, aber mindestens bei klick drauf will man sehen
                  was darin ist an lebensmittel und details."*

                  `[read]` **Nur ein Rezept** — ein BLS-Eintrag ist
                  sein eigener Inhalt, da gibt es nichts aufzuklappen.
                  **Ein Knopf, der nichts oeffnet, waere die naechste
                  Sackgasse.** */}
              {e.entry_type === 'recipe' ? (
                <button
                  type="button"
                  onClick={() => setZutaten(z => z === e.id ? null : e.id)}
                  aria-expanded={zutaten === e.id}
                  aria-label={`${e.bezeichnung} — Zutaten`}
                  style={{
                    background: 'none', border: 0, padding: 0, textAlign: 'left',
                    fontSize: 11, color: 'var(--fg)', lineHeight: 1.35,
                    cursor: 'pointer', width: '100%',
                    textDecoration: 'underline', textDecorationStyle: 'dotted',
                    textUnderlineOffset: 2,
                  }}
                >
                  {e.bezeichnung}
                </button>
              ) : (
                <div style={{ fontSize: 11, color: 'var(--fg)', lineHeight: 1.35 }}>
                  {e.bezeichnung}
                </div>
              )}
              <div className="v2-num v2-dim" style={{ fontSize: 10 }}>
                {e.kcal === null ? '—' : `${e.kcal.toLocaleString('de-DE')} kcal`}
                {e.entry_type === 'recipe' && e.planned_servings !== null
                  ? ` · ${e.planned_servings.toLocaleString('de-DE')}×`
                  : e.amount_g !== null
                    ? ` · ${e.amount_g.toLocaleString('de-DE')} g`
                    : ''}
              </div>
            </div>
            {bearbeitbar && offen !== e.id && (
              <span className="v2-planner-werkzeug"
                    style={{ display: 'inline-flex', gap: 1 }}>
                <button
                  type="button"
                  className="v2-btn v2-btn-ghost v2-btn-sm"
                  aria-label={`${e.bezeichnung} ändern`}
                  onClick={() => setOffen(e.id)}
                >
                  <Icon name="edit" className="v2-ic v2-ic-sm" />
                </button>
                <EintragLoeschen id={e.id} onFertig={onAenderung} />
              </span>
            )}
          </div>
          {/* G-311: die Zutaten des Rezepts — dieselben Angaben wie
              im Rezepte-Reiter (`RezeptKarte`): Name und Menge. */}
          {zutaten === e.id && (
            <ZutatenListe
              rezeptId={e.recipe_id}
              rezepte={alleRezepte}
              portionen={e.planned_servings}
            />
          )}
          {offen === e.id && (
            <EintragForm
              tagId={tagId}
              vorhanden={{
                id: e.id,
                entry_type: e.entry_type,
                meal_type: e.meal_type,
                recipe_id: e.recipe_id,
                food_id: e.food_id,
                custom_food_id: null,
                amount_g: e.amount_g,
                planned_servings: e.planned_servings,
                bezeichnung: e.bezeichnung,
              }}
              rezepte={rezepte}
              mahlzeit={slot}
              kontext={{ datum: tag, schonImTag: tagesSumme, ziel }}
              onFertig={fertig}
              onAbbruch={() => setOffen(null)}
            />
          )}
        </div>
      ))}

      {bearbeitbar && offen === 'neu' && (
        <EintragForm
          tagId={tagId}
          vorhanden={null}
          rezepte={rezepte}
          mahlzeit={slot}
          kontext={{ datum: tag, schonImTag: tagesSumme, ziel }}
          onFertig={fertig}
          onAbbruch={() => setOffen(null)}
        />
      )}

      {bearbeitbar && offen === null && (
        <button
          type="button"
          className="v2-btn v2-btn-ghost v2-btn-sm v2-planner-werkzeug v2-planner-werkzeug-unten"
          aria-label={`Eintrag hinzufügen — ${tag}`}
          onClick={() => setOffen('neu')}
          style={{ width: '100%', justifyContent: 'center', padding: '2px 0' }}
        >
          <Icon name="plus" className="v2-ic v2-ic-sm" />
        </button>
      )}
    </div>
  )
}

// ══ G-311: `RezeptListe` ist entfernt ═══════════════════
//
// **Tom, 2026-09-01:** *,,darunter rezepte auflistung? fuer was ist
// das zeigt nur irgendwelche daten an."*
//
// `[cmd]` **Sie stand in keiner Spec und in keinem Mockup** — eine
// Tabelle mit sieben Spalten unter dem Raster. `[read]` **Seit dem
// Rezepte-Reiter (G-289) doppelt**, und dort mit Detail, Bearbeiten
// und Einkaufsliste.
//
// `[read]` **Was der Planner stattdessen kann:** ein Rezept IM Raster
// aufklappen und seine Zutaten sehen (`ZutatenListe`) — das war
// Toms eigentliche Frage.
//
// `[read]` **A-59: geloescht, nicht auskommentiert.** git holt sie
// zurueck.

