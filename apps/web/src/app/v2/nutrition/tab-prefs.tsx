'use client'

// Der Preferences-Tab des Nutrition-Moduls.
//
// QUELLE: theme-v1/module-nutrition-spec.jsx, `FoodPreferencesView`
// (Zeile 213-332). Sechs Kacheln in zwei Spalten (1.4fr 1fr):
// Diet type · Categories · Individual foods | Allergies ·
// Tag preferences · Priority order.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript.
//   2. Klassen auf `v2-`-Praefix.
//   3. `window.FoodPreferencesView` -> Modulexport.
//   4. Inline-Raster, die es schon gibt, benutzen statt nachbauen.
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst. Die Texte bleiben wie in der Vorlage.
//
// `[cmd]` ALLES HIER IST ATTRAPPE. Vorlieben liegen in
// `food_preferences` und `food_preference_items`; dieser
// Entwurfs-Tab ist aber nicht der echte Schreibweg.
import * as React from 'react'
import { Card, Pill, Icon, Row } from '@lumeos/ui'

import { DIET_TAGS, EU14_ALLERGENS } from './tabs-daten'
import type { Neigung } from './typen'

const ATTRAPPE = 'Aus dem Entwurf uebernommen. Dieser Tab ist nicht an die vorhandenen Vorlieben-Tabellen angebunden - die Schalter schreiben nichts.'

/** Die acht Ernaehrungsformen der Vorlage (Zeile 215). */
const DIETS = [
  'omnivore', 'vegetarian', 'vegan', 'pescatarian',
  'keto', 'paleo', 'halal', 'kosher',
]

/** Die acht Kategorien der Vorlage (Zeile 217-222). */
const KATEGORIEN: Array<{ n: string; s: Neigung }> = [
  { n: 'Fleisch', s: 'like' }, { n: 'Fisch', s: 'like' },
  { n: 'Milchprodukte', s: 'neutral' }, { n: 'Gemüse', s: 'like' },
  { n: 'Obst', s: 'neutral' }, { n: 'Getreide', s: 'neutral' },
  { n: 'Hülsenfrüchte', s: 'dislike' }, { n: 'Süßwaren', s: 'dislike' },
]

/** Die fünf Einzellebensmittel der Vorlage (Zeile 223-229). */
const LEBENSMITTEL: Array<{ n: string; s: Neigung }> = [
  { n: 'Lachs · Atlantik', s: 'like' },
  { n: 'Hähnchenbrust', s: 'like' },
  { n: 'Haferflocken', s: 'like' },
  { n: 'Rosenkohl', s: 'dislike' },
  { n: 'Leber', s: 'dislike' },
]

const zeichen = (s: Neigung) => (s === 'like' ? '+' : s === 'dislike' ? '−' : '')
const farbe = (s: Neigung) =>
  s === 'like' ? 'var(--pos)' : s === 'dislike' ? 'var(--neg)' : 'var(--fg-dim)'

export function FoodPreferencesTab() {
  const [diet, setDiet] = React.useState('omnivore')
  const [allergien, setAllergien] = React.useState<string[]>(['Schalenfrüchte'])

  return (
    <div className="v2-grid v2-grid-14" style={{ gap: 14 }}>
      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card
          title="Diet type"
          sub="global — hard filter, applies before all scoring"
          attrappe={ATTRAPPE}
        >
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DIETS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDiet(d)}
                className={diet === d ? 'v2-pill v2-pill-acc' : 'v2-pill'}
                style={{ cursor: 'pointer', padding: '5px 12px', fontSize: 11.5, textTransform: 'capitalize' }}
              >
                {d}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Categories" sub="like +50 · dislike −50" attrappe={ATTRAPPE}>
          <div className="v2-g-cols-2" style={{ gap: 6 }}>
            {KATEGORIEN.map(c => (
              <div key={c.n} className="v2-prefs-kat">
                <span style={{ flex: 1, fontSize: 12 }}>{c.n}</span>
                <span
                  className="v2-num"
                  style={{ fontSize: 12, color: farbe(c.s), width: 30, textAlign: 'right' }}
                >
                  {zeichen(c.s)}{c.s !== 'neutral' ? 50 : '—'}
                </span>
                <div style={{ display: 'flex', gap: 2 }}>
                  {(['like', 'neutral', 'dislike'] as Neigung[]).map(s => (
                    <button
                      key={s}
                      type="button"
                      className="v2-prefs-schalter"
                      style={{
                        background: c.s === s ? farbe(s) : 'var(--surface-2)',
                        color: c.s === s ? 'var(--bg)' : 'var(--fg-dim)',
                      }}
                    >
                      {s === 'like' ? '+' : s === 'dislike' ? '−' : '·'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Individual foods"
          sub="like +100 · dislike −100 · highest priority"
          attrappe={ATTRAPPE}
        >
          <table className="v2-tbl">
            <tbody>
              {LEBENSMITTEL.map(f => (
                <tr key={f.n}>
                  <td>{f.n}</td>
                  <td className="v2-num" style={{ width: 60, textAlign: 'right', color: farbe(f.s) }}>
                    {zeichen(f.s)}100
                  </td>
                  <td style={{ width: 90 }}><Pill style={{ color: farbe(f.s) }}>{f.s}</Pill></td>
                  <td style={{ width: 30 }}>
                    <button type="button" className="v2-icon-btn">
                      <Icon name="trash" className="v2-ic v2-ic-sm" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="v2-btn v2-btn-sm" style={{ marginTop: 10 }}>
            <Icon name="plus" className="v2-ic v2-ic-sm" />Add food preference
          </button>
        </Card>
      </div>

      <div className="v2-col-gap" style={{ gap: 14 }}>
        <Card title="Allergies" sub="hard exclusion · no scoring override" attrappe={ATTRAPPE}>
          <div className="v2-dim" style={{ fontSize: 11, marginBottom: 10, lineHeight: 1.5 }}>
            Applies to BLS foods via <span className="v2-mono">allergen_*</span> tags and custom
            foods via <span className="v2-mono">custom_allergens[]</span>.
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {EU14_ALLERGENS.map(a => {
              const an = allergien.includes(a)
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAllergien(s => (an ? s.filter(x => x !== a) : [...s, a]))}
                  className="v2-pill"
                  style={{
                    cursor: 'pointer', padding: '4px 10px', fontSize: 11,
                    borderColor: an ? 'color-mix(in srgb, var(--neg) 40%, var(--border))' : 'var(--border)',
                    color: an ? 'var(--neg)' : 'var(--fg-muted)',
                    background: an ? 'color-mix(in srgb, var(--neg) 8%, transparent)' : 'var(--surface)',
                  }}
                >
                  {a}
                </button>
              )
            })}
          </div>
        </Card>

        <Card title="Tag preferences" sub="like +30 · dislike −30" attrappe={ATTRAPPE}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {DIET_TAGS.slice(0, 10).map((t, i) => (
              <button
                key={t.code}
                type="button"
                className={i < 3 ? 'v2-pill v2-pill-acc' : 'v2-pill'}
                style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 11 }}
              >
                {i < 3 ? '+ ' : ''}{t.de}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Priority order" attrappe={ATTRAPPE}>
          <Row label="1 · Allergen" value="hard exclude" />
          <Row label="2 · Diet type" value="hard exclude" />
          <Row label="3 · Food" value="±100" />
          <Row label="4 · Category" value="±50" />
          <Row label="5 · Tag" value="±30" />
          <Row label="6 · Prefix match" value="+20" />
          <div className="v2-divider" />
          <div className="v2-dim" style={{ fontSize: 11, lineHeight: 1.5 }}>
            Specific beats general — a liked food overrides a disliked category.
          </div>
        </Card>
      </div>
    </div>
  )
}
