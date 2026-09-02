'use client'

// Die vier Modale des Nutrition-Moduls.
//
// QUELLE:
//   MealCamModal           theme-v1/module-nutrition.jsx:655-734
//   CustomFoodModal        theme-v1/module-nutrition-spec.jsx:71-157
//   QuickAddModal          theme-v1/module-nutrition-spec.jsx:158-212
//   NutritionSettingsModal theme-v1/module-nutrition-spec.jsx:547-628
//
// Der Verteiler ersetzt `NutritionModalLauncher` (module-nutrition.jsx:56).
// `[cmd]` Die Vorlage verteilt ueber `window.addEventListener
// ("open-nutrition-modal")`; hier uebernimmt das ein Zustand im
// Rahmen — dieselbe Rolle, dieselben vier Schluessel. Das ist die
// gleiche technische Anpassung wie bei `TrainingModale` (G-05).
//
// GEAENDERT IST NUR DAS TECHNISCHE: Typen, `v2-`-Praefix, Verteiler.
// NICHT geaendert: dieselben Felder, dieselben Texte, dieselbe Abfolge.
//
// `[cmd]` ALLE VIER SIND ATTRAPPEN. Keines schreibt: es gibt weder
// `custom_foods` noch `nutrition_settings`, MealCam hat kein Modell.
// Der Knopf, der speichern wuerde, sagt das.
import * as React from 'react'
import { Card, Pill, Icon, InEntwicklungKnopf, type IconName } from '@lumeos/ui'

import { EU14_ALLERGENS } from './tabs-daten'
// G-339: EINE Namensquelle statt sechs (E-58).
import { KATEGORIE_TEXT } from '../../../lib/nutrition/slots-lage'

export type NutritionModalTyp = 'mealcam' | 'customfood' | 'quickadd' | 'recipe'

// ══ G-339: die sechste Namensliste ist weg ══════════════════════════
//
// `[cmd]` **Hier stand eine eigene Liste** — fuenf englische Namen
// (`Breakfast`, `Pre-workout`) mit dem Schluessel `preworkout`.
//
// `[cmd]` **Gemessen am 2026-09-02: `preworkout` steht NICHT im
// CHECK.** `nutrition.meals.meal_type` kennt `breakfast`, `lunch`,
// `dinner`, `snack`, `pre_workout`, `post_workout`, `other`.
//
// `[cmd]` **Und schlimmer als der Schluessel war seine Abwesenheit:**
// die `<option>` trug gar kein `value`, **also waere der LABEL
// abgeschickt worden** — `Pre-workout`. **Am Schirm gemessen.**
//
// `[read]` **G-335 hat fuenf Listen zusammengefuehrt; diese ist
// durchgerutscht**, weil sie einen anderen Schluessel schrieb und
// deshalb keiner Suche nach `pre_workout` auffiel.
//
// `[read]` **Jetzt kommt der Name aus `KATEGORIE_TEXT`** (E-58) —
// **eine Quelle, nicht sechs.**
//
// `[cmd]` **Die sieben Kategorien statt fuenf:** `post_workout` und
// `other` fehlten. **Sie stehen im CHECK und gehoeren in die
// Auswahl.**
const MEAL_TYPES = Object.entries(KATEGORIE_TEXT)
  .map(([id, label]) => ({ id, label }))


/** Rahmen fuer alle Modale — wie `Rahmen` im Supplements-Modul. */
function Rahmen({
  titel, sub, symbol, breite = 520, onClose, children, fuss,
}: {
  titel: string
  sub?: string
  symbol: IconName
  breite?: number
  onClose: () => void
  children: React.ReactNode
  fuss?: React.ReactNode
}) {
  React.useEffect(() => {
    const auf = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', auf)
    return () => window.removeEventListener('keydown', auf)
  }, [onClose])

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div
        className="v2-modal"
        style={{ width: breite, maxWidth: '94vw', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={titel}
      >
        <div className="v2-modal-h">
          <div className="v2-modal-symbol"><Icon name={symbol} className="v2-ic" /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{titel}</div>
            {sub && <div className="v2-dim" style={{ fontSize: 11 }}>{sub}</div>}
          </div>
          <button type="button" className="v2-icon-btn" onClick={onClose} aria-label="Schliessen">
            <Icon name="x" className="v2-ic" />
          </button>
        </div>
        <div className="v2-modal-body">{children}</div>
        {fuss && <div className="v2-modal-f">{fuss}</div>}
      </div>
    </div>
  )
}

/** Ein beschriftetes Feld (Vorlage: `Fld`). */
function Feld({ label, req, sub, children }: {
  label: string
  req?: boolean
  sub?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <label className="v2-eyebrow">
          {label}{req && <span style={{ color: 'var(--neg)', marginLeft: 3 }}>*</span>}
        </label>
        {sub && <span className="v2-dim v2-mono" style={{ fontSize: 10 }}>{sub}</span>}
      </div>
      {children}
    </div>
  )
}

/** Ein Eingabefeld (Vorlage: `Inp`). */
function Eingabe({ mono, ...p }: React.InputHTMLAttributes<HTMLInputElement> & { mono?: boolean }) {
  return <input {...p} className={mono ? 'v2-feld v2-mono' : 'v2-feld'} />
}

// --- MealCam ---------------------------------------------------------
function MealCamModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = React.useState(1) // 1=capture, 2=detect, 3=review

  const treffer = [
    { n: 'Chicken breast · grilled', q: 180, kcal: 297, conf: 94 },
    { n: 'Basmati rice · cooked', q: 200, kcal: 260, conf: 87 },
    { n: 'Mixed greens + olive oil', q: 150, kcal: 124, conf: 76 },
  ]

  return (
    <Rahmen
      titel="MealCam"
      sub={`Step ${step} of 3 · AI food recognition`}
      symbol="camera"
      breite={720}
      onClose={onClose}
      fuss={(
        <>
          {step > 1 ? (
            <button type="button" className="v2-btn v2-btn-ghost" onClick={() => setStep(s => s - 1)}>
              <Icon name="chevron_left" className="v2-ic v2-ic-sm" /> Back
            </button>
          ) : <div />}
          <div className="v2-spacer" />
          {step < 3 ? (
            <button type="button" className="v2-btn v2-btn-primary" onClick={() => setStep(s => s + 1)}>
              Next <Icon name="arrow_right" className="v2-ic v2-ic-sm" />
            </button>
          ) : (
            <InEntwicklungKnopf titel="Log meal" className="v2-btn v2-btn-primary">
              <Icon name="check" className="v2-ic v2-ic-sm" /> Log meal
            </InEntwicklungKnopf>
          )}
        </>
      )}
    >
      {step === 1 && (
        <>
          <div className="v2-attrappe-flaeche" style={{ aspectRatio: '4/3', marginBottom: 12, fontSize: 11 }}>
            drop photo · paste · take picture
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="v2-btn">
              <Icon name="camera" className="v2-ic v2-ic-sm" /> Capture
            </button>
            <button type="button" className="v2-btn">Upload photo</button>
            <button type="button" className="v2-btn v2-btn-ghost">Paste URL</button>
          </div>
          <div className="v2-dim" style={{ fontSize: 11, marginTop: 10 }}>
            Tip: Capture the full plate from above for best detection. Online only.
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div
            className="v2-cam-frame"
            style={{ marginBottom: 12, background: 'linear-gradient(135deg, oklch(0.32 0.04 80), oklch(0.28 0.03 120))' }}
          >
            <div className="v2-bbox" style={{ left: '8%', top: '22%', width: '38%', height: '44%' }}>
              <span className="v2-bbox-label">CHICKEN · 180g · 94%</span>
            </div>
            <div className="v2-bbox" style={{ left: '48%', top: '12%', width: '42%', height: '32%' }}>
              <span className="v2-bbox-label">RICE · 200g · 87%</span>
            </div>
            <div className="v2-bbox" style={{ left: '52%', top: '52%', width: '38%', height: '38%' }}>
              <span className="v2-bbox-label">GREENS · 150g · 76%</span>
            </div>
          </div>
          <div className="v2-dim" style={{ fontSize: 11 }}>3 foods detected · adjusting weights in step 3</div>
        </>
      )}

      {step === 3 && (
        <div className="v2-col-gap">
          {treffer.map(f => (
            <Card key={f.n} style={{ padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="v2-dot" style={{ background: 'var(--acc-nutri)' }} />
                <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{f.n}</span>
                <Pill variant={f.conf >= 90 ? 'pos' : 'warn'}>{f.conf}% confident</Pill>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
                <input
                  type="range" min="50" max="400" defaultValue={f.q}
                  aria-label={`${f.n} Menge`}
                  style={{ flex: 1, accentColor: 'var(--acc-nutri)' }}
                />
                <span className="v2-num" style={{ width: 60, textAlign: 'right' }}>{f.q}g</span>
                <span className="v2-num v2-dim" style={{ width: 60, textAlign: 'right' }}>{f.kcal} kcal</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Rahmen>
  )
}

// --- Custom food -----------------------------------------------------
function CustomFoodModal({ onClose }: { onClose: () => void }) {
  const [allergene, setAllergene] = React.useState<string[]>([])
  const um = (a: string) =>
    setAllergene(s => (s.includes(a) ? s.filter(x => x !== a) : [...s, a]))

  return (
    <Rahmen
      titel="Custom food"
      sub="Only visible to you · never merged into BLS data"
      symbol="plus"
      breite={720}
      onClose={onClose}
      fuss={(
        <>
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
          <div className="v2-spacer" />
          <span className="v2-dim v2-mono" style={{ fontSize: 10, alignSelf: 'center', marginRight: 8 }}>
            {allergene.length} allergens flagged
          </span>
          <InEntwicklungKnopf titel="Create food" className="v2-btn v2-btn-primary">
            <Icon name="check" className="v2-ic v2-ic-sm" />Create food
          </InEntwicklungKnopf>
        </>
      )}
    >
      <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Names · 3-language</div>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 10 }}>
        <Feld label="Name DE" req><Eingabe placeholder="z.B. Protein-Bowl" /></Feld>
        <Feld label="Name EN"><Eingabe placeholder="optional" /></Feld>
        <Feld label="Name TH"><Eingabe placeholder="optional" /></Feld>
      </div>
      <div className="v2-grid v2-g-cols-3" style={{ gap: 10 }}>
        <Feld label="Brand"><Eingabe placeholder="optional" /></Feld>
        <Feld label="Serving size" sub="g"><Eingabe mono placeholder="100" /></Feld>
        <Feld label="Barcode" sub="Phase 2"><Eingabe mono placeholder="—" disabled /></Feld>
      </div>

      <div className="v2-divider" />
      <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Required macros · per 100g</div>
      <div className="v2-grid v2-g-cols-4" style={{ gap: 10 }}>
        <Feld label="Energy" req sub="kcal"><Eingabe mono placeholder="0" /></Feld>
        <Feld label="Protein" req sub="g"><Eingabe mono placeholder="0" /></Feld>
        <Feld label="Fat" req sub="g"><Eingabe mono placeholder="0" /></Feld>
        <Feld label="Carbs" req sub="g"><Eingabe mono placeholder="0" /></Feld>
      </div>

      <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Optional</div>
      <div className="v2-grid v2-g-cols-4" style={{ gap: 10 }}>
        <Feld label="Fiber" sub="g"><Eingabe mono placeholder="—" /></Feld>
        <Feld label="Sugar" sub="g"><Eingabe mono placeholder="—" /></Feld>
        <Feld label="Saturated" sub="g"><Eingabe mono placeholder="—" /></Feld>
        <Feld label="Salt" sub="g"><Eingabe mono placeholder="—" /></Feld>
      </div>

      <div className="v2-divider" />
      <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Allergens · EU-14</div>
      <div className="v2-dim" style={{ fontSize: 11, marginBottom: 8, lineHeight: 1.5 }}>
        Smart Search excludes these identically to BLS <span className="v2-mono">allergen_*</span> tags.
        Custom foods need no other tags.
      </div>
      <div className="v2-allergen-gitter">
        {EU14_ALLERGENS.map(a => {
          const an = allergene.includes(a)
          return (
            <button
              key={a}
              type="button"
              onClick={() => um(a)}
              className="v2-allergen"
              style={{
                background: an ? 'color-mix(in srgb, var(--neg) 10%, var(--surface))' : 'var(--surface)',
                border: `1px solid ${an ? 'color-mix(in srgb, var(--neg) 35%, var(--border))' : 'var(--border)'}`,
                color: an ? 'var(--neg)' : 'var(--fg-muted)',
              }}
            >
              <span
                className="v2-allergen-haken"
                style={{
                  border: `1px solid ${an ? 'var(--neg)' : 'var(--border-strong)'}`,
                  background: an ? 'var(--neg)' : 'transparent',
                }}
              >
                {an && <Icon name="check" className="v2-ic" style={{ width: 9, height: 9, color: 'var(--bg)', strokeWidth: 3 }} />}
              </span>
              {a}
            </button>
          )
        })}
      </div>
    </Rahmen>
  )
}

// --- Quick-add -------------------------------------------------------
function QuickAddModal({ onClose }: { onClose: () => void }) {
  const [v, setV] = React.useState({ kcal: '', p: '', c: '', f: '', label: '' })
  const setze = (k: keyof typeof v, wert: string) => setV(s => ({ ...s, [k]: wert }))

  const Zahl = ({ k, suffix }: { k: 'kcal' | 'p' | 'c' | 'f'; suffix: string }) => (
    <div style={{ position: 'relative' }}>
      <input
        value={v[k]}
        onChange={e => setze(k, e.target.value)}
        placeholder="0"
        aria-label={suffix}
        className="v2-feld v2-mono"
        style={{ height: 34, padding: '0 40px 0 10px', fontSize: 13 }}
      />
      <span className="v2-dim v2-mono v2-feld-suffix">{suffix}</span>
    </div>
  )

  return (
    <Rahmen
      titel="Quick-add macros"
      sub="No food lookup · for meal prep in bulk"
      symbol="bolt"
      breite={460}
      onClose={onClose}
      fuss={(
        <>
          <button type="button" className="v2-btn v2-btn-ghost" onClick={onClose}>Cancel</button>
          <InEntwicklungKnopf titel="Add" className="v2-btn v2-btn-primary">
            <Icon name="plus" className="v2-ic v2-ic-sm" />Add
          </InEntwicklungKnopf>
        </>
      )}
    >
      <div className="v2-col-gap" style={{ gap: 10 }}>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Calories</div>
          <Zahl k="kcal" suffix="kcal" />
        </div>
        <div className="v2-grid v2-g-cols-3" style={{ gap: 8 }}>
          <div><div className="v2-eyebrow" style={{ marginBottom: 4 }}>Protein</div><Zahl k="p" suffix="g" /></div>
          <div><div className="v2-eyebrow" style={{ marginBottom: 4 }}>Carbs</div><Zahl k="c" suffix="g" /></div>
          <div><div className="v2-eyebrow" style={{ marginBottom: 4 }}>Fat</div><Zahl k="f" suffix="g" /></div>
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Label</div>
          <input
            value={v.label}
            onChange={e => setze('label', e.target.value)}
            placeholder={'z.B. "Meal Prep Bowl"'}
            aria-label="Label"
            className="v2-feld"
            style={{ height: 34, fontSize: 13 }}
          />
        </div>
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Meal</div>
          <select className="v2-feld" style={{ height: 34, fontSize: 12.5 }} aria-label="Meal">
            {/* `[cmd]` **G-339: `value` gesetzt.** Ohne es
                schickt der Browser den LABEL — gemessen am
                2026-09-02: `Pre-workout` statt `pre_workout`. */}
            {MEAL_TYPES.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="v2-hinweis" style={{ marginTop: 14 }}>
        <Icon
          name="alert"
          className="v2-ic v2-ic-sm"
          style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4, color: 'var(--warn)' }}
        />
        Quick-add produces no micronutrient data. The micro dashboard will show this entry as
        {' '}&ldquo;no micro data&rdquo;.
      </div>
    </Rahmen>
  )
}


/**
 * Der Verteiler — Vorlage: `NutritionModalLauncher`
 * (module-nutrition.jsx:56-75).
 *
 * `recipe` fuehrt die Vorlage im Planner-Knopf, ohne ein Fenster dafuer
 * zu definieren (Zeile 609 wirft das Ereignis, Zeile 68-70 fangen es
 * nicht). `[cmd]` Nachgesehen: es gibt kein `RecipeModal` in den drei
 * Nutrition-Dateien. Hier faellt der Fall deshalb auf `null` — wie in
 * der Vorlage, wo nichts aufgeht.
 */
export function NutritionModale({ modal, onClose }: {
  modal: NutritionModalTyp | null
  onClose: () => void
}) {
  if (!modal) return null
  if (modal === 'mealcam') return <MealCamModal onClose={onClose} />
  if (modal === 'customfood') return <CustomFoodModal onClose={onClose} />
  if (modal === 'quickadd') return <QuickAddModal onClose={onClose} />
  // ══ G-342: `nutsettings` ist entfernt ══════════════════
  //
  // `[cmd]` **Es hatte keinen Aufrufer** — der Typ stand hier, der
  // Verteiler auch, **aber nichts setzte ihn** (gemessen 2026-09-02
  // in G-339).
  //
  // `[cmd]` **Sein `meal_schedule`-Block ist seit E-58 ueberholt:**
  // die Mahlzeitenstruktur liegt in `nutrition.meal_slots` (C-392),
  // gepflegt im Vorlieben-Reiter (G-332) und in den Einstellungen
  // verlinkt (G-335). **Der Ort existiert, und er schreibt.**
  //
  // `[read]` **Ein zweiter Block waere ein zweiter Schreibweg** —
  // genau das, was G-72 vermieden hat.
  //
  // `[read]` **A-59: geloescht, nicht auskommentiert.**
  return null
}
