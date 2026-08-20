'use client'

// Der Preferences-Tab — **echte Werte.**
//
// FORM: `theme-v1/module-nutrition-spec.jsx`, `FoodPreferencesView`
// (213-332) — sechs Kacheln in zwei Spalten. INHALT:
// `nutrition.food_preferences` und `food_preference_items` ueber
// `food_preferences_read` / `_write` (C-87).
//
// **EINE KACHEL KOMMT DAZU: die Ausschluesse.** `[read]` Mit Tom
// besprochen. Sie liest und schreibt `general_exclusions[]`.
//
// `[cmd]` **C-93 ist waehrend dieses Auftrags fertig geworden.** Der
// Auftrag ging noch davon aus, dass es keinen Preset-Katalog gibt und
// die Kachel einen Leerzustand zeigt; seit 2026-08-19 fuehrt
// `nutrition.exclusion_presets` **elf Presets** in zwei Gruppen
// (persoenlich, religioes) samt `caveat_de`. Gebaut ist deshalb die
// Auswahl — **der Leerzustand bleibt als Rueckfall**, falls der Katalog
// einmal nicht lesbar ist.
//
// **ZWEI ABWEICHUNGEN VOM MOCKUP, beide besprochen:**
//
//   `[cmd]` **Die Allergiekachel fuehrt 20 Eintraege in drei Stufen**
//   (neutral → Sensibel → Allergie), nicht 14 mit an/aus. Grund: die
//   Datenbank trennt `allergies[]` und `intolerances[]`, und die
//   Testdaten nutzen beide (`tree_nuts` als Allergie, `lactose` als
//   Unvertraeglichkeit). **Mit An/Aus-Pillen waere die halbe Spalte
//   nicht bedienbar** und die Laktose-Testdaten unsichtbar. Die Stufung
//   stammt aus dem Vorgaengerrepo (`FoodPreferences.tsx:551-594`),
//   ebenso die Trennung von Milcheiweiss und Laktose.
//
//   `[cmd]` **Kategorien kommen aus dem Katalog**, nicht als feste
//   Achterliste: `food_categories` fuehrt 13 Wurzeln.
//
// **KEINE BEWERTUNG, KEINE SUCHE.** `[read]` Die Rangfolge wird
// angezeigt, weil das Mockup sie zeigt — **sie wirkt heute nicht**:
// `nutrition.food_search` hat keinen Nutzerparameter. Das steht in der
// Kachel und im Bericht.
import * as React from 'react'
import { Card, Icon, Pill, Row } from '@lumeos/ui'

import type {
  AusschlussPreset, Grundeinstellungen, Kategorie, TagDefinition, Vorliebe,
  VorliebenStand,
} from '../../../lib/nutrition/vorlieben-lesen'
import { vorliebenSpeichern, type VorliebeEingabe } from './vorlieben-aktionen'

export type VorliebenDaten = {
  stand: VorliebenStand
  kategorien: Kategorie[]
  presets: AusschlussPreset[]
  tags: TagDefinition[]
  ladefehler: string | null
}

/** Die acht Ernaehrungsformen der Vorlage (Zeile 215). */
const DIETS = [
  'omnivore', 'vegetarian', 'vegan', 'pescatarian',
  'keto', 'paleo', 'halal', 'kosher',
]

/**
 * Die 20 Allergene des Vorgaengers.
 *
 * `[cmd]` `FoodPreferences.tsx:551-575` — die **EU-14 vollstaendig**
 * plus fuenf haeufige Unvertraeglichkeiten. `[read]` **Milcheiweiss und
 * Laktose stehen getrennt**, und das ist kein Listenfehler: eine
 * Kuhmilchallergie richtet sich gegen das Eiweiss, eine
 * Laktoseintoleranz gegen den Zucker. Wer beides zusammenlegt, kann
 * keines von beiden richtig abbilden.
 */
const ALLERGENE: Array<{ id: string; label: string; eu14: boolean }> = [
  { id: 'gluten', label: 'Gluten / Weizen', eu14: true },
  { id: 'milk_protein', label: 'Milcheiweiß', eu14: true },
  { id: 'lactose', label: 'Laktose', eu14: true },
  { id: 'eggs', label: 'Eier', eu14: true },
  { id: 'fish', label: 'Fisch', eu14: true },
  { id: 'crustaceans', label: 'Krebstiere', eu14: true },
  { id: 'molluscs', label: 'Weichtiere', eu14: true },
  { id: 'peanuts', label: 'Erdnüsse', eu14: true },
  { id: 'tree_nuts', label: 'Baumnüsse', eu14: true },
  { id: 'soy', label: 'Soja', eu14: true },
  { id: 'celery', label: 'Sellerie', eu14: true },
  { id: 'mustard', label: 'Senf', eu14: true },
  { id: 'sesame', label: 'Sesam', eu14: true },
  { id: 'sulfites', label: 'Sulfite', eu14: true },
  { id: 'lupin', label: 'Lupine', eu14: true },
  { id: 'fructose', label: 'Fruktose', eu14: false },
  { id: 'histamine', label: 'Histamin', eu14: false },
  { id: 'sorbitol', label: 'Sorbit', eu14: false },
  { id: 'fodmap', label: 'FODMAP', eu14: false },
  { id: 'nickel', label: 'Nickel', eu14: false },
]

type Stufe = 'neutral' | 'sensibel' | 'allergie'

const NEIGUNGEN = ['liked', 'neutral', 'disliked'] as const

/**
 * Wie viele Lebensmittel eine Allergenmarkierung tragen (G-73).
 *
 * `[cmd]` Gemessen am 2026-08-20 gegen `nutrition.food_tags`:
 * `contains_nuts` 120 · `contains_gluten` 622 ·
 * `contains_lactose` 1.021 von 7.140.
 *
 * `[read]` **Fest eingetragen, mit Stichtag — und das ist Absicht.**
 * Die Zahlen im Warnhinweis duerfen nicht bei jedem Seitenaufruf
 * nachgeladen werden: der Hinweis muss auch dann stehen, wenn die
 * Abfrage ausfaellt. Wer die Kuration erweitert, zieht sie hier nach;
 * die Groessenordnung („ein Bruchteil") bleibt bis dahin richtig.
 */
const ALLERGEN_MARKIERT = {
  nuts: 120,
  gluten: 622,
  lactose: 1021,
  gesamt: 7140,
  stand: '2026-08-20',
} as const
type Neigung = (typeof NEIGUNGEN)[number]

function farbe(n: Neigung | Stufe): string {
  if (n === 'liked') return 'var(--pos)'
  if (n === 'disliked' || n === 'allergie') return 'var(--neg)'
  if (n === 'sensibel') return 'var(--warn)'
  return 'var(--fg-dim)'
}

export function VorliebenTab({ d }: { d: VorliebenDaten }) {
  const [stand, setStand] = React.useState(d.stand)
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  const g = stand.grund

  /**
   * Speichern: Grundeinstellungen und Items **immer vollstaendig**.
   *
   * `[cmd]` `food_preferences_write` ersetzt die Items atomar — wer nur
   * die Aenderung schickt, loescht den Rest. Deshalb wird der ganze
   * Stand gesendet.
   */
  const speichern = React.useCallback(async (
    naechsterGrund: Grundeinstellungen,
    naechsteItems: Vorliebe[],
  ) => {
    setLaeuft(true)
    setFehler(null)
    const eingaben: VorliebeEingabe[] = naechsteItems.map(i => ({
      target_type: i.target_type as VorliebeEingabe['target_type'],
      preference: i.preference,
      food_id: i.food_id,
      category_id: i.category_id,
      tag_code: i.tag_code,
      cuisine_code: i.cuisine_code,
      exclusion_preset_code: i.exclusion_preset_code,
      catalog_item_code: i.catalog_item_code,
    }))
    const antwort = await vorliebenSpeichern(naechsterGrund, eingaben)
    if (antwort.ok) setStand(antwort.stand)
    else setFehler(antwort.fehler)
    setLaeuft(false)
  }, [])

  // ── Allergene: drei Stufen ────────────────────────────────────
  const stufeVon = (id: string): Stufe => {
    if (g.allergies.includes(id)) return 'allergie'
    if (g.intolerances.includes(id)) return 'sensibel'
    return 'neutral'
  }

  /** `[read]` 1× tippen = Sensibel · 2× = Allergie · 3× = Entfernen. */
  const allergenWeiter = (id: string) => {
    const jetzt = stufeVon(id)
    const ohne = (xs: string[]) => xs.filter(x => x !== id)
    const naechster: Grundeinstellungen = jetzt === 'neutral'
      ? { ...g, intolerances: [...g.intolerances, id] }
      : jetzt === 'sensibel'
        ? { ...g, intolerances: ohne(g.intolerances), allergies: [...g.allergies, id] }
        : { ...g, allergies: ohne(g.allergies) }
    setStand(s => ({ ...s, grund: naechster }))
    void speichern(naechster, stand.items)
  }

  // ── Items: Kategorie und Tag ──────────────────────────────────
  const itemFuer = (typ: string, schluessel: string): Vorliebe | undefined =>
    stand.items.find(i => i.target_type === typ
      && (typ === 'category' ? i.category_id === schluessel : i.tag_code === schluessel))

  const neigungVon = (typ: string, schluessel: string): Neigung => {
    const i = itemFuer(typ, schluessel)
    if (!i) return 'neutral'
    return i.preference === 'liked' ? 'liked' : 'disliked'
  }

  const neigungSetzen = (
    typ: 'category' | 'tag', schluessel: string, neigung: Neigung, name: string,
  ) => {
    const rest = stand.items.filter(i => !(i.target_type === typ
      && (typ === 'category' ? i.category_id === schluessel : i.tag_code === schluessel)))
    const naechste: Vorliebe[] = neigung === 'neutral' ? rest : [...rest, {
      id: '', target_type: typ,
      preference: neigung === 'liked' ? 'liked' : 'disliked',
      strength: neigung === 'liked' ? 'boost' : 'soft_dislike',
      source: 'settings',
      food_id: null, food_name: null, bls_code: null,
      category_id: typ === 'category' ? schluessel : null,
      category_name_de: typ === 'category' ? name : null,
      category_slug: null,
      tag_code: typ === 'tag' ? schluessel : null,
      tag_name_de: typ === 'tag' ? name : null,
      cuisine_code: null, exclusion_preset_code: null, catalog_item_code: null,
    }]
    setStand(s => ({ ...s, items: naechste }))
    void speichern(g, naechste)
  }

  const itemEntfernen = (id: string) => {
    const naechste = stand.items.filter(i => i.id !== id)
    setStand(s => ({ ...s, items: naechste }))
    void speichern(g, naechste)
  }

  const ausschlussEntfernen = (code: string) => {
    const naechster = { ...g, general_exclusions: g.general_exclusions.filter(x => x !== code) }
    setStand(s => ({ ...s, grund: naechster }))
    void speichern(naechster, stand.items)
  }

  const ausschlussUmschalten = (code: string) => {
    const an = g.general_exclusions.includes(code)
    const naechster = {
      ...g,
      general_exclusions: an
        ? g.general_exclusions.filter(x => x !== code)
        : [...g.general_exclusions, code],
    }
    setStand(s => ({ ...s, grund: naechster }))
    void speichern(naechster, stand.items)
  }

  const dietSetzen = (d2: string) => {
    const naechster = { ...g, diet_type: g.diet_type === d2 ? null : d2 }
    setStand(s => ({ ...s, grund: naechster }))
    void speichern(naechster, stand.items)
  }

  const foodItems = stand.items.filter(i => i.target_type === 'food')

  // Kategorie-Vorlieben, die NICHT auf eine der gezeigten Wurzeln
  // zeigen — sonst waeren sie unsichtbar und faenden beim naechsten
  // Speichern kein Gegenstueck mehr.
  const wurzelIds = new Set(d.kategorien.map(k => k.id))
  const tiefeKategorien = stand.items.filter(
    i => i.target_type === 'category' && i.category_id && !wurzelIds.has(i.category_id))

  // Presets, die gesetzt sind — fuer die Vorbehalte darunter.
  const gesetztePresets = d.presets.filter(p => g.general_exclusions.includes(p.code))
  // Und gesetzte Codes OHNE Katalogeintrag: `ultra_processed` der
  // Testdaten ist kein Preset, sondern ein Verarbeitungsmerkmal. Es
  // steht in derselben Spalte und darf nicht verschwinden.
  const presetCodes = new Set(d.presets.map(p => p.code))
  const ausschluesseOhnePreset = g.general_exclusions.filter(c => !presetCodes.has(c))
  const zaehlung = {
    mag: stand.items.filter(i => i.preference === 'liked').length,
    magNicht: stand.items.filter(i => i.preference === 'disliked').length,
    aus: stand.items.filter(i => i.preference === 'hard_exclude').length,
  }

  if (d.ladefehler) {
    return (
      <Card title="Preferences" sub="konnten nicht geladen werden">
        <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>{d.ladefehler}</div>
      </Card>
    )
  }

  return (
    <div>
      {/* Ein Speicherhinweis statt eines Knopfs: jede Aenderung
          schreibt sofort. Die Zeile sagt, ob es geklappt hat. */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
        fontSize: 11, color: 'var(--fg-muted)', flexWrap: 'wrap',
      }}>
        <span>{`${zaehlung.mag} 💚 · ${zaehlung.magNicht} ❌ · ${zaehlung.aus} ausgeschlossen`}</span>
        {laeuft && <span className="v2-dim">speichert…</span>}
        {g.updated_at && !laeuft && (
          <span className="v2-dim v2-mono">{`zuletzt ${g.updated_at.slice(0, 16).replace('T', ' ')}`}</span>
        )}
        {fehler && <span style={{ color: 'var(--neg)' }}>{`Fehler: ${fehler}`}</span>}
      </div>

      <div className="v2-grid v2-grid-14" style={{ gap: 14 }}>
        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card title="Diet type" sub="global — hard filter, applies before all scoring">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DIETS.map(dt => (
                <button
                  key={dt} type="button" onClick={() => dietSetzen(dt)}
                  aria-pressed={g.diet_type === dt}
                  className={g.diet_type === dt ? 'v2-pill v2-pill-acc' : 'v2-pill'}
                  style={{
                    cursor: 'pointer', padding: '5px 12px', fontSize: 11.5,
                    textTransform: 'capitalize',
                  }}
                >{dt}</button>
              ))}
            </div>
            {/* `[read]` Der Vorbehalt, der laut Auftrag sichtbar
                gehoert — und er gilt fuer die Ernaehrungsform genauso
                wie fuer die Presets. */}
            {(g.diet_type === 'halal' || g.diet_type === 'kosher') && (
              <>
                <div className="v2-divider" />
                <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
                  Halal und koscher haengen an der Schlachtung — die
                  Naehrwertdaten kennen sie nicht. Die Einstellung schliesst
                  Zutaten aus; sie prueft keine Zubereitung.
                </div>
              </>
            )}
          </Card>

          <Card
            title="Categories"
            sub={`like +50 · dislike −50 · ${d.kategorien.length} Hauptkategorien`}
          >
            {/* `[cmd]` **Gesetzte Unterkategorien stehen zuerst.** Der
                Katalog fuehrt 518 Kategorien in mehreren Ebenen; die
                Kachel zeigt die 13 Wurzeln. Eine Vorliebe kann aber auf
                einer tieferen Ebene liegen — die Testdaten setzen
                „Kekse & Plätzchen", ein Enkel von „SÜSSES & SNACKS".
                **Ohne diese Zeile waere sie unsichtbar und wuerde beim
                naechsten Speichern still geloescht**, weil die
                Schreibfunktion die Items ersetzt. Gemessen, nicht
                vermutet. */}
            {tiefeKategorien.length > 0 && (
              <>
                <div className="v2-eyebrow" style={{ marginBottom: 6 }}>
                  Gesetzt · Unterkategorien
                </div>
                <div className="v2-col-gap" style={{ gap: 4, marginBottom: 10 }}>
                  {tiefeKategorien.map(i => (
                    <div key={i.id} className="v2-prefs-kat">
                      <span style={{ flex: 1, fontSize: 12 }}>
                        {i.category_name_de ?? i.category_id}
                      </span>
                      <span className="v2-num" style={{
                        fontSize: 12, width: 30, textAlign: 'right',
                        color: farbe(i.preference === 'liked' ? 'liked' : 'disliked'),
                      }}>
                        {i.preference === 'liked' ? '+50' : '−50'}
                      </span>
                      <button
                        type="button" className="v2-icon-btn"
                        aria-label={`${i.category_name_de ?? 'Kategorie'} entfernen`}
                        onClick={() => itemEntfernen(i.id)}
                      >
                        <Icon name="x" className="v2-ic v2-ic-sm" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="v2-divider" />
              </>
            )}
            {d.kategorien.length === 0 ? (
              <div className="v2-dim" style={{ fontSize: 11.5, padding: '12px 0' }}>
                Kein Kategorienkatalog lesbar.
              </div>
            ) : (
              <div className="v2-g-cols-2" style={{ gap: 6 }}>
                {d.kategorien.map(k => {
                  const n = neigungVon('category', k.id)
                  return (
                    <div key={k.id} className="v2-prefs-kat">
                      <span style={{
                        flex: 1, fontSize: 12, whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>{k.name_de}</span>
                      <span className="v2-num" style={{
                        fontSize: 12, color: farbe(n), width: 30, textAlign: 'right',
                      }}>
                        {n === 'liked' ? '+50' : n === 'disliked' ? '−50' : '—'}
                      </span>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {NEIGUNGEN.map(s => (
                          <button
                            key={s} type="button" className="v2-prefs-schalter"
                            aria-label={`${k.name_de}: ${s}`}
                            aria-pressed={n === s}
                            onClick={() => neigungSetzen('category', k.id, s, k.name_de)}
                            style={{
                              background: n === s ? farbe(s) : 'var(--surface-2)',
                              color: n === s ? 'var(--bg)' : 'var(--fg-dim)',
                              cursor: 'pointer',
                            }}
                          >{s === 'liked' ? '+' : s === 'disliked' ? '−' : '·'}</button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          <Card
            title="Individual foods"
            sub={`like +100 · dislike −100 · highest priority · ${foodItems.length} gesetzt`}
          >
            {foodItems.length === 0 ? (
              <div style={{ padding: '18px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                  Noch keine einzelnen Lebensmittel
                </div>
                <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                  Einzelne Lebensmittel werden in der Suche markiert — dort steht
                  der ganze Bestand.
                </div>
              </div>
            ) : (
              <div className="v2-tbl-wrap">
                <table className="v2-tbl">
                  <tbody>
                    {foodItems.map(f => (
                      <tr key={f.id}>
                        <td>
                          {f.food_name ?? '—'}
                          {f.bls_code && (
                            <span className="v2-dim v2-mono" style={{ fontSize: 10, marginLeft: 6 }}>
                              {f.bls_code}
                            </span>
                          )}
                        </td>
                        <td className="v2-num" style={{
                          width: 60, textAlign: 'right', color: farbe(f.preference === 'liked' ? 'liked' : 'disliked'),
                        }}>
                          {f.preference === 'liked' ? '+100' : '−100'}
                        </td>
                        <td style={{ width: 90 }}>
                          <Pill style={{ color: farbe(f.preference === 'liked' ? 'liked' : 'disliked') }}>
                            {f.preference}
                          </Pill>
                        </td>
                        <td style={{ width: 30 }}>
                          <button
                            type="button" className="v2-icon-btn"
                            aria-label={`${f.food_name ?? 'Eintrag'} entfernen`}
                            onClick={() => itemEntfernen(f.id)}
                          >
                            <Icon name="trash" className="v2-ic v2-ic-sm" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="v2-col-gap" style={{ gap: 14 }}>
          <Card
            title="Allergies"
            sub="hard exclusion · no scoring override"
          >
            <div className="v2-dim" style={{ fontSize: 11, marginBottom: 10, lineHeight: 1.5 }}>
              1× tippen = <span style={{ color: 'var(--warn)' }}>Sensibel</span> ·
              2× = <span style={{ color: 'var(--neg)' }}>Allergie</span> · 3× = entfernen
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {ALLERGENE.map(a => {
                const s = stufeVon(a.id)
                return (
                  <button
                    key={a.id} type="button" onClick={() => allergenWeiter(a.id)}
                    aria-pressed={s !== 'neutral'}
                    className="v2-pill"
                    style={{
                      cursor: 'pointer', padding: '4px 10px', fontSize: 11,
                      borderColor: s === 'neutral'
                        ? 'var(--border)'
                        : `color-mix(in oklch, ${farbe(s)} 40%, var(--border))`,
                      color: s === 'neutral' ? 'var(--fg-muted)' : farbe(s),
                      background: s === 'neutral'
                        ? 'var(--surface)'
                        : `color-mix(in oklch, ${farbe(s)} 8%, transparent)`,
                    }}
                  >
                    {a.label}
                    {s === 'allergie' && <span style={{ marginLeft: 5, fontSize: 9.5 }}>Allergie</span>}
                    {s === 'sensibel' && <span style={{ marginLeft: 5, fontSize: 9.5 }}>Sensibel</span>}
                  </button>
                )
              })}
            </div>
            <div className="v2-divider" />
            <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
              Die ersten 15 sind die EU-Kennzeichnungspflicht, die letzten fünf
              häufige Unverträglichkeiten. Milcheiweiß und Laktose stehen
              getrennt — eine Kuhmilchallergie richtet sich gegen das Eiweiß,
              eine Laktoseintoleranz gegen den Zucker.
            </div>

            {/* G-73, Tom 2026-08-19: „Ja, unbedingt einen Warnhinweis —
                aber auch von unserer Seite: `contains_nuts` hat Nuts
                drin, also muss es raus aus der Resultatsliste."

                `[cmd]` Das Ausschliessen greift seit C-94. Die Luecke
                ist die Markierung: `contains_nuts` traegt 120 von
                7.140 Lebensmitteln (1,7 %), `contains_gluten` 622
                (8,7 %), `contains_lactose` 1.021 (14,3 %).

                `[read]` Der Hinweis sagt deshalb DREI Dinge und nicht
                „ohne Gewaehr": was wirkt, was die Grenze ist, und was
                massgeblich bleibt. */}
            <div
              role="note"
              style={{
                marginTop: 12,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid color-mix(in oklch, var(--warn) 35%, var(--border))',
                background: 'color-mix(in oklch, var(--warn) 7%, transparent)',
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5,
              }}>
                <Icon name="alert" className="v2-ic v2-ic-sm"
                      style={{ color: 'var(--warn)' }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--warn)' }}>
                  Was der Ausschluss leistet — und was nicht
                </span>
              </div>
              <div style={{ fontSize: 10.5, lineHeight: 1.5, color: 'var(--fg-muted)' }}>
                Als <strong>Allergie</strong> markierte Stoffe werden aus der
                Trefferliste <strong>entfernt</strong>, nicht nur abgewertet.
                Grundlage ist eine <strong>kuratierte Markierung</strong> im
                Lebensmittelkatalog — sie ist <strong>nicht vollständig</strong>:
                derzeit sind {ALLERGEN_MARKIERT.nuts} von {ALLERGEN_MARKIERT.gesamt} Einträgen
                als nusshaltig erfasst, {ALLERGEN_MARKIERT.gluten} als glutenhaltig,
                {' '}{ALLERGEN_MARKIERT.lactose} als laktosehaltig. Ein Lebensmittel
                ohne Markierung wird <strong>nicht</strong> ausgeschlossen, auch
                wenn es den Stoff enthält.
                {' '}<strong>Bei einer Allergie bleibt die Zutatenliste auf der
                Verpackung massgeblich.</strong>
              </div>
            </div>
          </Card>

          {/* ── DIE KACHEL, DIE DAZUKOMMT ──────────────────────── */}
          <Card
            title="Generelle Ausschlüsse"
            sub={d.presets.length > 0
              ? `gilt über alle Kategorien hinweg · ${d.presets.length} Voreinstellungen`
              : 'gilt über alle Kategorien hinweg'}
          >
            {/* `[cmd]` **C-93 ist waehrend G-65 fertig geworden.** Der
                Auftrag ging von einem Leerzustand aus; seit 2026-08-19
                fuehrt `nutrition.exclusion_presets` elf Presets, und die
                Kachel bietet sie an. Ohne Katalog bleibt sie bedienbar
                und zeigt, was gesetzt ist. */}
            {d.presets.length === 0 ? (
              <div style={{ padding: '14px 8px' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                  {g.general_exclusions.length === 0
                    ? 'Keine generellen Ausschlüsse'
                    : `${g.general_exclusions.length} gesetzt`}
                </div>
                <div className="v2-dim" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                  Voreinstellungen wie „keine Innereien" oder „halal-konform"
                  werden gerade erstellt. Sobald sie da sind, stehen sie hier
                  zur Auswahl.
                </div>
              </div>
            ) : (
              <>
                {(['personal', 'religious'] as const).map(art => {
                  const gruppe = d.presets.filter(p => p.kind === art)
                  if (gruppe.length === 0) return null
                  return (
                    <div key={art} style={{ marginBottom: 10 }}>
                      <div className="v2-eyebrow" style={{ marginBottom: 5 }}>
                        {art === 'personal' ? 'Persönlich' : 'Religiös'}
                      </div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {gruppe.map(p => {
                          const an = g.general_exclusions.includes(p.code)
                          return (
                            <button
                              key={p.code} type="button"
                              aria-pressed={an}
                              title={p.caveat_de ?? undefined}
                              onClick={() => ausschlussUmschalten(p.code)}
                              className="v2-pill"
                              style={{
                                cursor: 'pointer', padding: '4px 10px', fontSize: 11,
                                borderColor: an
                                  ? 'color-mix(in oklch, var(--neg) 40%, var(--border))'
                                  : 'var(--border)',
                                color: an ? 'var(--neg)' : 'var(--fg-muted)',
                                background: an
                                  ? 'color-mix(in oklch, var(--neg) 8%, transparent)'
                                  : 'var(--surface)',
                              }}
                            >
                              {an ? '⊘ ' : ''}{p.name_de}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {/* Der Vorbehalt je gesetztem Preset — **aus der Spalte
                    `caveat_de`, nicht aus dem Code.** `[read]` Der
                    Auftrag verlangt ihn sichtbar; die Datenbank fuehrt
                    ihn bereits, und damit steht er an einer Stelle. */}
                {gesetztePresets.filter(p => p.caveat_de).length > 0 && (
                  <>
                    <div className="v2-divider" />
                    <div className="v2-col-gap" style={{ gap: 6 }}>
                      {gesetztePresets.filter(p => p.caveat_de).map(p => (
                        <div key={p.code} className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
                          <strong>{p.name_de}:</strong> {p.caveat_de}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Gesetzte Codes ohne Katalogeintrag — sie sind echt und
                duerfen nicht verschwinden. `[cmd]` Die Testdaten fuehren
                `ultra_processed`, das kein Preset ist, sondern ein
                Verarbeitungsmerkmal. */}
            {ausschluesseOhnePreset.length > 0 && (
              <>
                <div className="v2-divider" />
                <div className="v2-eyebrow" style={{ marginBottom: 5 }}>
                  Weitere gesetzte Ausschlüsse
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {ausschluesseOhnePreset.map(code => (
                    <span
                      key={code} className="v2-pill"
                      style={{
                        padding: '4px 6px 4px 10px', fontSize: 11,
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        borderColor: 'color-mix(in oklch, var(--neg) 40%, var(--border))',
                        color: 'var(--neg)',
                        background: 'color-mix(in oklch, var(--neg) 8%, transparent)',
                      }}
                    >
                      {code}
                      <button
                        type="button" className="v2-icon-btn"
                        aria-label={`${code} entfernen`}
                        onClick={() => ausschlussEntfernen(code)}
                        style={{ width: 18, height: 18 }}
                      >
                        <Icon name="x" className="v2-ic v2-ic-sm" />
                      </button>
                    </span>
                  ))}
                </div>
              </>
            )}

            <div className="v2-divider" />
            {/* `[read]` Der Vorbehalt gehoert sichtbar — Auftrag G-65.
                Er steht hier als allgemeine Regel; die praezise Fassung
                je Preset kommt aus `caveat_de`. */}
            <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
              Ein Ausschluss schliesst die <strong>Zutat</strong> aus. Halal und
              koscher haengen zusätzlich an der Schlachtung, und davon wissen die
              Nährwertdaten nichts — die Zubereitung wird nicht geprüft.
            </div>
          </Card>

          <Card title="Tag preferences" sub={`like +30 · dislike −30 · ${d.tags.length} Merkmale`}>
            {d.tags.length === 0 ? (
              <div className="v2-dim" style={{ fontSize: 11.5, padding: '12px 0' }}>
                Kein Merkmalskatalog lesbar.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {d.tags.map(t => {
                  const i = itemFuer('tag', t.code)
                  const aus = i?.preference === 'hard_exclude'
                  const n = aus ? 'disliked' : neigungVon('tag', t.code)
                  const gesetzt = Boolean(i)
                  return (
                    <button
                      key={t.code} type="button"
                      aria-pressed={gesetzt}
                      onClick={() => neigungSetzen(
                        'tag', t.code, n === 'liked' ? 'disliked' : n === 'disliked' ? 'neutral' : 'liked',
                        t.name_de,
                      )}
                      className={gesetzt ? 'v2-pill v2-pill-acc' : 'v2-pill'}
                      style={{
                        cursor: 'pointer', padding: '4px 10px', fontSize: 11,
                        color: gesetzt ? farbe(n) : undefined,
                      }}
                    >
                      {n === 'liked' ? '+ ' : aus ? '⊘ ' : n === 'disliked' ? '− ' : ''}
                      {t.name_de}
                    </button>
                  )
                })}
              </div>
            )}
            <div className="v2-divider" />
            <div className="v2-dim" style={{ fontSize: 10.5, lineHeight: 1.45 }}>
              {'Tippen wechselt zwischen mag ich, mag ich nicht und egal. '}
              {'Ein Merkmal, das als Ausschluss gesetzt ist (⊘), stammt aus der '}
              {'Allergieliste und wird dort geändert.'}
            </div>
          </Card>

          <Card title="Priority order">
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
            <div className="v2-divider" />
            {/* `[cmd]` Die Rangfolge ist gespeichert, aber wirkungslos:
                `nutrition.food_search` hat keinen Nutzerparameter. Das
                muss dastehen, sonst verspricht die Kachel etwas. */}
            <div className="v2-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
              Die Reihenfolge ist hinterlegt, <strong>wirkt aber noch nicht in
              der Suche</strong> — die Suchfunktion kennt die Vorlieben bisher
              nicht. Was hier eingestellt wird, ist gespeichert und wartet
              darauf.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
