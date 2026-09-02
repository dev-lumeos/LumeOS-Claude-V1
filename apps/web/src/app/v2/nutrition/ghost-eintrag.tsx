'use client'
// ════════════════════════════════════════════════════════════════════
// GHOST ENTRIES — G-309
// ════════════════════════════════════════════════════════════════════
//
// **`SPEC_03` Flow 3, Schritt 7:** *,,Ab Startdatum: Ghost Entries
// erscheinen im Diary."*
//
// ══ ER ERSCHEINT, ER WIRD NICHT GESCHRIEBEN ═════════════════════════
//
// **Tom, 2026-09-01:** *,,Ein Ghost Entry ist eine Absicht, keine
// Erfassung. Wer ihn als `meals` schreibt, hat gegessen, ohne gegessen
// zu haben — und die Tagesbilanz zaehlt es mit."*
//
// `[cmd]` **`SPEC_03` Flow 4:** *,,Ghost Entries haben kein
// automatisches Expiry. User entscheidet jederzeit — auch
// retroaktiv."* `[read]` **Nur eine Anzeige bleibt so offen** — ein
// geschriebener `meals`-Satz waere gegessen oder geloescht.
//
// ══ DAS REZEPT WIRD AUFGELOEST ══════════════════════════════════════
//
// `[cmd]` **`ADR_GHOST_ENTRY_RECIPE`:** *,,Ghost Entries die aus einem
// `MealPlanItem.recipe_id` stammen zeigen immer alle Einzelzutaten —
// nie das Rezept als Einheit."* **Jede Zeile hat ein editierbares
// Mengenfeld.**
//
// `[read]` **Der Rezeptname steht als Ueberschrift** (Flow-4-Patch),
// **die Zutaten einzeln darunter** — jede mit eigenem Feld.
//
// ══ UND KEIN ZWEITER SCHREIBWEG ═════════════════════════════════════
//
// `[cmd]` **`bestaetigen` und `ueberspringen` stehen seit G-274** und
// schreiben `meal_plan_logs` vollstaendig. **Hier wird gerufen, nicht
// nachgebaut.** `[read]` **`addMealItem` aus G-272 friert die
// Naehrwerte ein** — das tut der Schreibweg dahinter bereits.
import * as React from 'react'
import { Card, Icon, InEntwicklung } from '@lumeos/ui'

/** Eine Zutat des Ghost Entry. */
export type GhostPosten = {
  food_id: string
  name: string
  amount_g: number
  kcal: number | null
  // ══ G-329: die Naehrwerte je 100 g ══════════════════
  //
  // **Tom, 2026-09-02:** *,,die positionen sollen gleich abgebildet
  // sein wie in den normalen eintraegen."*
  //
  // `[read]` **Je 100 g, nicht je Menge** — **die Menge ist hier
  // aenderbar**, und ein fester Wert waere nach der ersten Aenderung
  // falsch. `[cmd]` **`vorschauFuer` rechnet daraus**, dieselbe
  // Funktion wie im Rezepteditor (G-325).
  enercc_100: number | null
  prot625_100: number | null
  fat_100: number | null
  cho_100: number | null
}

export type GhostEintrag = {
  id: string
  meal_type: string
  rezept: string | null
  posten: GhostPosten[]
  kcal: number | null
  status: 'pending' | 'confirmed' | 'deviated' | 'skipped'
}

// G-315: die Tabelle steht in `plan-model.ts` — sie stand hier
// doppelt, und die andere Kopie kannte nur vier Slots.
import { MAHLZEIT_LABEL } from '../../../lib/nutrition/plan-model'
// G-329: dieselbe Rechnung wie im Rezepteditor und im Suchmodal.
import { vorschauFuer } from '../../../lib/nutrition/menge-rechnen'
// G-329: dasselbe Suchmodal wie Planner (G-320) und Rezept (G-323).
import { FoodSuchModal } from './food-such-modal'

function z(v: number | null): string {
  return v === null ? '—' : String(Math.round(v))
}

/**
 * Ein Ghost Entry — der Plan-Vorschlag eines Slots.
 *
 * `[read]` **Gestrichelt und in eigener Farbe**, damit er sich von
 * einer erfassten Mahlzeit unterscheidet — Flow 4: *,,gestrichelte
 * Umrandung, andere Farbe"*.
 */
export function GhostEintragKarte({
  eintrag, datum, onGeaendert,
}: {
  eintrag: GhostEintrag
  datum: string
  onGeaendert: () => void
}) {
  // `[read]` **Die Mengen sind editierbar** — das verlangt das ADR
  // ausdruecklich. **Der Ausgangswert ist die Planmenge.**
  const [mengen, setMengen] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(eintrag.posten.map(p => [p.food_id, String(p.amount_g)])))
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  // ══ G-329: Zutaten aendern, nicht nur Mengen ════════════
  //
  // **Tom, 2026-09-02:** *,,bearbeiten (fuer manuelle
  // aenderungen)."*
  //
  // `[cmd]` **Gemessen, bevor gebaut wurde: `planEintragBestaetigen`
  // schreibt nach `meals`, `meal_items` und `meal_plan_logs`** —
  // **`meal_plan_entries` fasst es NICHT an.**
  //
  // `[read]` **Damit ist die Auftragsfrage beantwortet:** Bearbeiten
  // aendert **den Tag, nicht den Plan.** **Und das ist richtig so** —
  // ein Ghost-Eintrag zeigt eine Planposition, er ist keine. Wer
  // heute mehr isst, hat nicht den Plan geaendert.
  //
  // `[read]` **Deshalb leben die Aenderungen NUR in diesem Zustand**
  // und gehen als `mengen` an `bestaetigen`. **Kein Schreibweg in
  // `meal_plan_entries`.**
  const [entfernt, setEntfernt] = React.useState<Set<string>>(new Set())
  const [dazu, setDazu] = React.useState<GhostPosten[]>([])
  const [suchen, setSuchen] = React.useState(false)
  const [mealCam, setMealCam] = React.useState(false)

  // Alle Posten: die geplanten ohne die entfernten, plus die neuen.
  const posten = React.useMemo(
    () => [...eintrag.posten.filter(p => !entfernt.has(p.food_id)), ...dazu],
    [eintrag.posten, entfernt, dazu],
  )

  // `[read]` **Wechselt der Tag, gelten die Mengen des neuen Tages** —
  // sonst stuenden die Zahlen von gestern in den Feldern.
  React.useEffect(() => {
    setMengen(Object.fromEntries(
      eintrag.posten.map(p => [p.food_id, String(p.amount_g)])))
    // G-329: eine neue Planposition setzt die Bearbeitung zurueck.
    setEntfernt(new Set())
    setDazu([])
  }, [eintrag.posten])

  /**
   * Wurde eine Menge angefasst?
   *
   * `[read]` **Leer heisst „stimmt so"** — Flow 4, Case 2, Schritt 4a.
   * **Dann gehen keine Mengen mit, und der Schreibweg nimmt die
   * Planmengen.** So bleibt „unveraendert" von „zufaellig gleich"
   * unterscheidbar.
   */
  function geaenderteMengen(): Array<{ food_id: string; amount_g: number }> | undefined {
    const aus: Array<{ food_id: string; amount_g: number }> = []
    let abweichend = false
    for (const p of posten) {
      const roh = mengen[p.food_id]
      const n = Number(roh)
      if (!Number.isFinite(n) || n <= 0) continue
      aus.push({ food_id: p.food_id, amount_g: n })
      if (Math.abs(n - p.amount_g) > 0.001) abweichend = true
    }
    // `[cmd]` **G-329: eine entfernte oder neue Zutat ist auch eine
    // Abweichung** — nicht nur eine geaenderte Menge. **Ohne das
    // ginge die Bearbeitung still verloren:** `bestaetigen` nimmt bei
    // `undefined` die geplanten Posten.
    if (entfernt.size > 0 || dazu.length > 0) abweichend = true
    return abweichend ? aus : undefined
  }

  async function senden(koerper: Record<string, unknown>) {
    setLaeuft(true)
    setFehler(null)
    try {
      const a = await fetch('/api/nutrition/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(koerper),
      })
      const d = await a.json()
      if (!a.ok) throw new Error(d?.error ?? `HTTP ${a.status}`)
      onGeaendert()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  // `[cmd]` **`confirmation_mode` ist Pflicht** — der
  // `resolution_check` verlangt es bei `confirmed` UND `deviated`.
  // **Ueber diesen Knopf ist es `manual`**; `mealcam` kommt aus dem
  // Kameraweg (Flow 4 Case 1, nicht gebaut).
  const bestaetigen = () => senden({
    art: 'bestaetigen',
    plan_entry_id: eintrag.id,
    execution_date: datum,
    confirmation_mode: 'manual',
    mengen: geaenderteMengen(),
  })

  const auslassen = () => senden({
    art: 'ueberspringen',
    plan_entry_id: eintrag.id,
    execution_date: datum,
  })

  // ══ G-329: die Summe im Kopf, fuenf Werte ═══════════════
  //
  // **Tom, 2026-09-02:** *,,ghost entries haben im header noch keine
  // totals."*
  //
  // `[cmd]` **Hier stand nur die kcal-Summe** — die Zeilen darunter
  // tragen seit G-329 fuenf Werte, der Kopf zeigte einen.
  //
  // `[cmd]` **Und sie rechnete ueber `eintrag.posten`** — die
  // GEPLANTEN. **Eine entfernte Zutat blieb in der Summe, eine
  // hinzugefuegte fehlte.** `[read]` **Jetzt ueber `posten`**, die
  // Liste, die auch gerendert wird: **was oben steht, ist die Summe
  // dessen, was darunter steht.**
  //
  // `[read]` **Dieselbe Rechnung wie in der Zeile** (`vorschauFuer`,
  // gegen `food_nutrient_snapshot` geprueft) — kein zweiter
  // Rechenweg, sonst widersprechen sich Kopf und Zeilen.
  const summen = posten.reduce((s, p) => {
    const n = Number(mengen[p.food_id] ?? p.amount_g)
    const m = vorschauFuer({
      enercc: p.enercc_100, prot625: p.prot625_100,
      fat: p.fat_100, cho: p.cho_100,
    }, Number.isFinite(n) ? n : 0)
    return {
      g: s.g + (Number.isFinite(n) ? n : 0),
      kcal: s.kcal + (m.kcal ?? 0),
      p: s.p + (m.protein ?? 0),
      k: s.k + (m.kh ?? 0),
      f: s.f + (m.fett ?? 0),
    }
  }, { g: 0, kcal: 0, p: 0, k: 0, f: 0 })

  // `[read]` **`null` heisst nicht ermittelbar, nicht 0** — traegt
  // KEIN Posten einen Wert, steht ein Strich (`bls-fehlend-heisst-
  // nicht-null`).
  const summeBekannt = posten.some(p => p.enercc_100 !== null)
  const summe = summen.kcal

  return (
    <Card
      className="v2-card-tight"
      style={{
        padding: 0,
        border: '1px dashed var(--fg-dim)',
        background: 'transparent',
      }}
    >
      <div style={{
        padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {MAHLZEIT_LABEL[eintrag.meal_type] ?? eintrag.meal_type}
        </span>
        <span className="v2-dim" style={{ fontSize: 11 }}>· aus deinem Plan</span>
        <div className="v2-spacer" />
        {/* `[read]` **Dieselbe Form wie im Tagebuch** (G-330) —
            fuenf Werte, Gewicht zuerst. **Die Beschriftung steht in
            der Tabelle darunter**, nicht hier: sie fluchtet dort von
            selbst. */}
        <span data-probe="ghost-kopf-summe" className="v2-num"
              style={{ fontSize: 12, display: 'flex', gap: 10 }}>
          {([
            ['g', summen.g], ['kcal', summen.kcal],
            ['P', summen.p], ['K', summen.k], ['F', summen.f],
          ] as const).map(([kurz, wert]) => (
            <span key={kurz}>
              {summeBekannt || kurz === 'g' ? z(wert) : '—'}
              <span className="v2-dim" style={{ fontSize: 10, marginLeft: 2 }}>
                {kurz}
              </span>
            </span>
          ))}
        </span>
      </div>

      {/* `[cmd]` **Der Rezeptname als Ueberschrift** —
          `SPEC_03_FLOW4_RECIPE_PATCH`. **Die Zutaten stehen einzeln
          darunter, nie das Rezept als Einheit.** */}
      {eintrag.rezept && (
        <div style={{ padding: '0 14px 8px' }}>
          <span className="v2-dim" style={{ fontSize: 11 }}>
            📖 {eintrag.rezept}
          </span>
        </div>
      )}

      {/* ══ G-329: dieselbe Zeilenform wie im Tagebuch ════════
          **Tom, 2026-09-02:** *,,die positionen sollen gleich
          abgebildet sein wie in den normalen eintraegen."*

          `[cmd]` **Vorher: Name, Mengenfeld, kcal** — drei Angaben,
          waehrend die normale Zeile fuenf traegt.

          `[read]` **Dieselbe Tabelle, dieselben Spaltenbreiten**
          (44 / 58 / 40 / 40 / 40) — **so fluchten die Ghost-Zeilen
          mit den Zeilen darueber**, statt daneben zu stehen.

          `[read]` **Das Mengenfeld bleibt** — es ist der
          Unterschied: **ein Ghost-Eintrag ist ein Vorschlag, den man
          aendern darf, bevor man ihn bestaetigt.** */}
      <div style={{ padding: '0 14px 12px' }}>
        {posten.length === 0 && (
          <p className="v2-muted" style={{ fontSize: 12 }}>
            Für diese Planposition sind keine Lebensmittel hinterlegt.
          </p>
        )}
        {posten.length > 0 && (
          <table className="v2-tbl v2-tbl-meal" data-probe="ghost-tabelle">
            <thead data-probe="ghost-spalten">
              <tr>
                <th style={{ width: 18 }} />
                <th />
                <th style={{ width: 44, textAlign: 'right' }}>G</th>
                <th style={{ width: 58, textAlign: 'right' }}>KCAL</th>
                <th style={{ width: 40, textAlign: 'right' }}>P</th>
                <th style={{ width: 40, textAlign: 'right' }}>K</th>
                <th style={{ width: 40, textAlign: 'right' }}>F</th>
                <th style={{ width: 20 }} />
              </tr>
            </thead>
            <tbody>
              {posten.map(p => {
                const g = Number(mengen[p.food_id] ?? p.amount_g)
                const m = vorschauFuer({
                  enercc: p.enercc_100, prot625: p.prot625_100,
                  fat: p.fat_100, cho: p.cho_100,
                }, Number.isFinite(g) ? g : 0)
                return (
                  <tr key={p.food_id} data-probe="ghost-zeile">
                    <td style={{ width: 18 }}>
                      <span className="v2-dot" style={{
                        background: 'var(--fg-dim)', opacity: 0.5,
                      }} />
                    </td>
                    <td className="v2-name">{p.name}</td>
                    {/* `[read]` **Das Mengenfeld sitzt IN der
                        Gewichtsspalte** — so steht die aenderbare
                        Zahl dort, wo in der normalen Zeile das
                        Gewicht steht. */}
                    <td style={{ width: 44, textAlign: 'right' }}>
                      <input
                        type="number" inputMode="decimal" min={0} step={1}
                        aria-label={`Menge ${p.name}`}
                        value={mengen[p.food_id] ?? ''}
                        disabled={laeuft}
                        onChange={e => setMengen(
                          x => ({ ...x, [p.food_id]: e.target.value }))}
                        style={{
                          width: 44, textAlign: 'right', fontSize: 11,
                          flex: 'none',
                        }}
                        className="v2-input"
                      />
                    </td>
                    <td className="v2-num" style={{ width: 58, textAlign: 'right' }}>
                      {m.kcal === null ? '—' : z(m.kcal)}
                      <span className="v2-dim" style={{ fontSize: 10, marginLeft: 2 }}>kcal</span>
                    </td>
                    <td className="v2-num" style={{ width: 40, textAlign: 'right' }}>
                      {m.protein === null ? '—' : z(m.protein)}
                      <span className="v2-dim" style={{ fontSize: 10, marginLeft: 2 }}>g</span>
                    </td>
                    <td className="v2-num" style={{ width: 40, textAlign: 'right' }}>
                      {m.kh === null ? '—' : z(m.kh)}
                      <span className="v2-dim" style={{ fontSize: 10, marginLeft: 2 }}>g</span>
                    </td>
                    <td className="v2-num" style={{ width: 40, textAlign: 'right' }}>
                      {m.fett === null ? '—' : z(m.fett)}
                      <span className="v2-dim" style={{ fontSize: 10, marginLeft: 2 }}>g</span>
                    </td>
                    {/* `[cmd]` **G-329: entfernen** — Tom: *,,keine
                        Zutat austauschen, hinzufuegen, entfernen"* war
                        der Befund. **Tauschen ist entfernen plus
                        hinzufuegen**, deshalb genuegen zwei Knoepfe. */}
                    <td style={{ width: 20 }}>
                      <button
                        type="button" className="v2-icon-btn"
                        data-probe="ghost-entfernen"
                        aria-label={`${p.name} entfernen`}
                        disabled={laeuft}
                        onClick={() => {
                          if (dazu.some(d => d.food_id === p.food_id)) {
                            setDazu(x => x.filter(d => d.food_id !== p.food_id))
                          } else {
                            setEntfernt(s => new Set(s).add(p.food_id))
                          }
                        }}
                      >
                        <Icon name="trash" className="v2-ic v2-ic-sm" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* `[read]` **Hinzufuegen ueber dasselbe Suchmodal** wie
            Planner (G-320) und Rezept (G-323) — keine vierte
            Suche. */}
        <button
          type="button" className="v2-btn v2-btn-sm"
          data-probe="ghost-zutat-suchen"
          style={{ marginTop: 8, gap: 6 }}
          disabled={laeuft}
          onClick={() => setSuchen(true)}
        >
          <Icon name="search" className="v2-ic v2-ic-sm" />
          Zutat hinzufügen
        </button>

        {/* `[cmd]` **G-329: entfernte Zutaten sind sichtbar** — sonst
            waere nicht erkennbar, dass der Vorschlag geaendert wurde,
            und der Nutzer bestaetigte etwas anderes als er sieht. */}
        {entfernt.size > 0 && (
          <p data-probe="ghost-entfernt-hinweis" className="v2-muted"
             style={{ fontSize: 10.5, marginTop: 6, lineHeight: 1.5 }}>
            {entfernt.size} {entfernt.size === 1 ? 'Zutat' : 'Zutaten'} entfernt —
            {' '}
            <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                    style={{ fontSize: 10.5, padding: '0 4px' }}
                    onClick={() => setEntfernt(new Set())}>
              zurücknehmen
            </button>
          </p>
        )}
      </div>

      {fehler && (
        <div style={{ padding: '0 14px 10px' }}>
          <p className="v2-neg" style={{ fontSize: 11 }}>{fehler}</p>
        </div>
      )}

      <div style={{
        padding: '0 14px 12px', display: 'flex', gap: 8,
      }}>
        <button
          type="button" className="v2-btn v2-btn-sm"
          disabled={laeuft || posten.length === 0}
          onClick={bestaetigen}
        >
          Bestätigen
        </button>
        {/* ══ G-329: MealCam an der Ghost-Karte ══════════════
            **Tom, 2026-09-02:** *,,mealcam (fuer visuelle
            bestaetigung oder korrektur)."*

            `[cmd]` **`SPEC_03` Flow 4 nennt ihn fuer Ghost Entries:**
            *,,confirm via MealCam or manually."*

            `[cmd]` **Der Knopf existiert seit G-276 in der LEEREN
            Mahlzeit** (`mahlzeiten.tsx:516`) — **als Attrappe, weil
            es kein Modell gibt.**

            `[read]` **Eine Attrappe an der richtigen Stelle ist
            besser als keine an der falschen** — der Auftrag sagt es
            so, und der Vermerk bleibt: **hier wird nichts
            vorgetaeuscht, was es gibt.** */}
        <button
          type="button" className="v2-btn v2-btn-sm"
          data-probe="ghost-mealcam"
          disabled={laeuft}
          onClick={() => setMealCam(true)}
        >
          <Icon name="camera" className="v2-ic v2-ic-sm" />
          MealCam
        </button>
        <button
          type="button" className="v2-btn v2-btn-sm v2-btn-ghost"
          disabled={laeuft}
          onClick={auslassen}
        >
          Auslassen
        </button>
      </div>

      {/* `[cmd]` **G-276: kein Modell** — der Vermerk sagt es, statt
          einen Ablauf zu zeigen, der nicht existiert. */}
      {mealCam && (
        <div style={{ padding: '0 14px 12px' }}>
          <InEntwicklung
            titel="MealCam"
            grund="Flow 4 nennt MealCam zur visuellen Bestaetigung. Das Modell dahinter gibt es noch nicht (G-276) — der Knopf steht hier, damit der Weg sichtbar ist, nicht weil er schon geht."
            onClose={() => setMealCam(false)}
          />
        </div>
      )}

      {/* ══ G-329: dasselbe Suchmodal wie Planner und Rezept ════
          `[read]` **Der Kontext ist der TAG**, nicht das Rezept —
          ein Ghost-Eintrag gehoert zu einer Mahlzeit an einem
          Datum. */}
      {suchen && (
        <FoodSuchModal
          kontext={{
            art: 'tag',
            datum,
            slot: eintrag.meal_type,
            slotLabel: MAHLZEIT_LABEL[eintrag.meal_type] ?? eintrag.meal_type,
            schonImTag: summeBekannt ? Math.round(summe) : null,
            ziel: null,
          }}
          onClose={() => setSuchen(false)}
          onWaehlen={async (f, mengeG) => {
            // `[read]` **Die Werte je 100 g kommen aus der Suche** —
            // dieselbe Umwandlung wie im Rezepteditor (G-323).
            const n = (v: string | number | null | undefined) => {
              if (v === null || v === undefined || v === '') return null
              const x = typeof v === 'string' ? Number(v) : v
              return Number.isFinite(x) ? x : null
            }
            setDazu(d => [...d, {
              food_id: f.id,
              name: f.name_display_de || f.name_de || 'Unbenannt',
              amount_g: mengeG,
              kcal: null,
              enercc_100: n(f.enercc), prot625_100: n(f.prot625),
              fat_100: n(f.fat), cho_100: n(f.cho),
            }])
            setMengen(m => ({ ...m, [f.id]: String(mengeG) }))
            setSuchen(false)
          }}
        />
      )}
    </Card>
  )
}
