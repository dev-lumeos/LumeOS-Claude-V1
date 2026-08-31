'use client'

// ════════════════════════════════════════════════════════════════════
// REZEPTE UND EINKAUFSLISTEN — G-289 / G-288 / G-300
// ════════════════════════════════════════════════════════════════════
//
// **Grundlage: `SPEC_03` Flow 7 und Flow 8, am 2026-08-31 gelesen.**
// **Entscheidung: `E-39`** — `ADR_RECIPES_SCHEMA_ONLY` abgeloest.
//
// `[cmd]` **`SPEC_10` nennt fuenf Rezeptkomponenten:** `RecipeList`,
// `RecipeCard`, `RecipeBuilder`, `RecipeDetail`, `RecipeLogModal`.
// **Gebaut war keine.**
//
// ══ FLOW 7, SCHRITT FUER SCHRITT ════════════════════════════════════
//
//     1  „Neues Rezept"                    RezeptListe
//     2  Name, Portionen, Zeiten, ...      RezeptBauer
//     3  Zutaten via Food Search + g       ZutatSuche (G-300)
//        Live-Preview Gesamt + je Portion  Vorschau
//     4  Speichern                         POST art=rezept
//     5  „Als Mahlzeit loggen"             LogModal
//        -> Meal + MealItems, eingefroren  POST art=rezept_loggen
//
// `[read]` **A-30:** nur Typen aus dem Leseweg, kein Wertimport.
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, Pill, Icon, Empty, Row } from '@lumeos/ui'

import type {
  Rezept, Einkaufsliste, RezeptStand,
} from '../../../lib/nutrition/rezept-lesen'
import {
  summeVon, jePortion, quellenEtikett, skaliert, mengeAnzeige, fortschritt,
  KOENNEN, KOENNEN_LABEL, KOENNEN_VORGABE, UNVOLLSTAENDIG_SATZ,
  type ZutatEntwurf, type Koennen, type Naehrwerte,
} from '../../../lib/nutrition/rezept-lage'

const MAHLZEITEN = [
  ['breakfast', 'Frühstück'], ['lunch', 'Mittag'], ['dinner', 'Abend'],
  ['snack', 'Snack'], ['pre_workout', 'Vor dem Training'],
  ['post_workout', 'Nach dem Training'], ['other', 'Sonstiges'],
] as const

function z(v: number | null, nach = 0): string {
  return v === null ? '—' : v.toLocaleString('de-DE', {
    minimumFractionDigits: nach, maximumFractionDigits: nach,
  })
}

async function senden(koerper: unknown): Promise<{ ok: boolean; fehler?: string }> {
  const antwort = await fetch('/api/nutrition/rezept', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(koerper),
  })
  if (antwort.ok) return { ok: true }
  const k = await antwort.json().catch(() => null)
  return { ok: false, fehler: k?.error ?? `Fehler ${antwort.status}` }
}

// ════════════════════════════════════════════════════════════════════
// G-300 — Flow 7 Schritt 3: Zutaten via Food Search
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **`/api/nutrition/foods?q=` steht** — dieselbe Route, die
// der Erfassungsdialog benutzt. **Die Suche gehoert ins Rezept**, wie
// Flow 7 sie beschreibt, nicht in den Plan.

// `[cmd]` **`NutritionFoodSearchRow` liefert die Naehrwerte als
// ZEICHENKETTEN** (`enercc: string`), nicht als Zahlen — gemessen am
// 2026-08-31 am Typ.
//
// `[read]` **Ohne Umwandlung rechnet die Vorschau mit Text:**
// `'309' * 2 / 100` ergaebe zwar 6,18, aber `null`-Pruefungen und
// Summen liefen ins Leere, und `NaN` saehe aus wie ein fehlender
// Wert. **`zahlOderNull` ist deshalb keine Kosmetik.**
type Treffer = {
  id: string; name_display_de?: string | null; name_de?: string | null
  enercc?: string | number | null; prot625?: string | number | null
  fat?: string | number | null; cho?: string | number | null
}

function zahlOderNull(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'string' ? Number(v) : v
  return Number.isFinite(n) ? n : null
}

function ZutatSuche({ onWaehlen }: {
  onWaehlen: (z: ZutatEntwurf) => void
}) {
  const [frage, setFrage] = React.useState('')
  const [treffer, setTreffer] = React.useState<Treffer[]>([])
  const [sucht, setSucht] = React.useState(false)
  const [gewaehlt, setGewaehlt] = React.useState<Treffer | null>(null)
  const [menge, setMenge] = React.useState('100')

  async function suchen(e: React.FormEvent) {
    e.preventDefault()
    if (!frage.trim()) return
    setSucht(true)
    try {
      const a = await fetch(`/api/nutrition/foods?q=${encodeURIComponent(frage)}&limit=12`)
      const d = await a.json()
      setTreffer(Array.isArray(d.foods) ? d.foods : [])
    } finally {
      setSucht(false)
    }
  }

  function uebernehmen() {
    if (!gewaehlt) return
    const g = Number(menge.replace(',', '.'))
    if (!Number.isFinite(g) || g <= 0) return
    onWaehlen({
      food_id: gewaehlt.id,
      name: gewaehlt.name_display_de || gewaehlt.name_de || 'Unbenannt',
      amount_g: g,
      enercc_100: zahlOderNull(gewaehlt.enercc),
      prot625_100: zahlOderNull(gewaehlt.prot625),
      fat_100: zahlOderNull(gewaehlt.fat),
      cho_100: zahlOderNull(gewaehlt.cho),
    })
    setGewaehlt(null); setFrage(''); setTreffer([]); setMenge('100')
  }

  return (
    <div className="v2-suchblock">
      <form onSubmit={suchen} style={{ display: 'flex', gap: 6 }}>
        <input
          className="v2-feld" value={frage} placeholder="Zutat suchen …"
          aria-label="Zutat suchen"
          onChange={e => setFrage(e.target.value)}
        />
        <button type="submit" className="v2-btn" disabled={!frage.trim() || sucht}>
          <Icon name="search" className="v2-ic v2-ic-sm" />
        </button>
      </form>

      {treffer.length > 0 && !gewaehlt && (
        <div style={{ marginTop: 6, maxHeight: 180, overflowY: 'auto' }}>
          {treffer.map(t => (
            <button
              key={t.id} type="button" className="v2-hit"
              onClick={() => { setGewaehlt(t); setTreffer([]) }}
            >
              {t.name_display_de || t.name_de}
              <span className="v2-num v2-dim" style={{ marginLeft: 6, fontSize: 10 }}>
                {zahlOderNull(t.enercc) === null
                  ? '—'
                  : `${Math.round(zahlOderNull(t.enercc)!)} kcal/100 g`}
              </span>
            </button>
          ))}
        </div>
      )}

      {gewaehlt && (
        <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'flex-end' }}>
          <span style={{ flex: 1, fontSize: 11.5 }}>
            {gewaehlt.name_display_de || gewaehlt.name_de}
          </span>
          <label style={{ fontSize: 10 }}>
            <span className="v2-eyebrow">Menge (g)</span>
            <input
              className="v2-feld" type="number" min="0" step="1" value={menge}
              aria-label="Menge in Gramm" style={{ width: 90 }}
              onChange={e => setMenge(e.target.value)}
            />
          </label>
          <button type="button" className="v2-btn v2-btn-sm v2-btn-primary"
                  onClick={uebernehmen}>
            Hinzufügen
          </button>
          <button type="button" className="v2-btn v2-btn-sm"
                  onClick={() => setGewaehlt(null)}>
            Abbrechen
          </button>
        </div>
      )}
    </div>
  )
}

/** Gesamt und je Portion nebeneinander — Flow 7, Schritt 3. */
function Vorschau({ gesamt, portionen }: {
  gesamt: Naehrwerte; portionen: number
}) {
  const je = jePortion(gesamt, portionen)
  const unvollstaendig = gesamt.kcal === null
  return (
    <div style={{ marginTop: 10 }}>
      <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Live-Vorschau</div>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
        <div>
          <div className="v2-eyebrow" style={{ fontSize: 9 }}>Gesamt</div>
          <Row label="kcal" value={z(gesamt.kcal)} />
          <Row label="Protein" value={`${z(gesamt.protein, 1)} g`} />
          <Row label="Fett" value={`${z(gesamt.fett, 1)} g`} />
          <Row label="Kohlenhydrate" value={`${z(gesamt.kohlenhydrate, 1)} g`} />
        </div>
        <div>
          <div className="v2-eyebrow" style={{ fontSize: 9 }}>
            je Portion ({z(portionen, 0)})
          </div>
          <Row label="kcal" value={z(je.kcal)} />
          <Row label="Protein" value={`${z(je.protein, 1)} g`} />
          <Row label="Fett" value={`${z(je.fett, 1)} g`} />
          <Row label="Kohlenhydrate" value={`${z(je.kohlenhydrate, 1)} g`} />
        </div>
      </div>
      {unvollstaendig && (
        <p className="v2-muted" style={{ fontSize: 10.5, marginTop: 6, lineHeight: 1.5 }}>
          {UNVOLLSTAENDIG_SATZ}
        </p>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// RecipeBuilder — Flow 7, Schritte 1-4
// ════════════════════════════════════════════════════════════════════

export function RezeptBauer({ vorhanden, onFertig, onAbbruch }: {
  vorhanden: Rezept | null
  onFertig: () => void
  onAbbruch: () => void
}) {
  const [name, setName] = React.useState(vorhanden?.name_de ?? '')
  const [portionen, setPortionen] = React.useState(String(vorhanden?.servings ?? 4))
  const [beschreibung, setBeschreibung] = React.useState(vorhanden?.description ?? '')
  const [anleitung, setAnleitung] = React.useState(vorhanden?.instructions ?? '')
  const [vorzeit, setVorzeit] = React.useState(String(vorhanden?.prep_time_min ?? ''))
  const [garzeit, setGarzeit] = React.useState(String(vorhanden?.cook_time_min ?? ''))
  const [koennen, setKoennen] = React.useState<Koennen>(
    (KOENNEN as readonly string[]).includes(vorhanden?.cooking_skill ?? '')
      ? (vorhanden!.cooking_skill as Koennen) : KOENNEN_VORGABE,
  )
  // `[read]` **Ein bestehendes Rezept bringt seine Zutaten OHNE
  // Naehrwerte je 100 g mit** — der Leseweg liefert die Summe, nicht
  // die Einzelwerte. **Die Vorschau zeigt dann die gespeicherten
  // Werte, nicht die gerechneten** (siehe unten).
  const [zutaten, setZutaten] = React.useState<ZutatEntwurf[]>(
    () => (vorhanden?.zutaten ?? []).map(x => ({
      food_id: x.food_id ?? '', name: x.name, amount_g: x.amount_g,
      enercc_100: null, prot625_100: null, fat_100: null, cho_100: null,
    })),
  )
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  const portionen_n = Number(portionen.replace(',', '.'))
  const gesamt = summeVon(zutaten)

  // `[read]` **Bei einem bestehenden Rezept rechnet die Datenbank
  // schon** — dann zeigen wir ihre Zahlen, nicht null. **Zwei Quellen
  // fuer dieselbe Groesse waeren zwei Wahrheiten;** hier gewinnt die
  // gespeicherte, solange keine Zutat neu dazugekommen ist.
  const alleOhneWerte = zutaten.length > 0 && zutaten.every(x => x.enercc_100 === null)
  const angezeigt: Naehrwerte = alleOhneWerte && vorhanden?.naehrwerte
    ? {
      kcal: vorhanden.naehrwerte.kcal,
      protein: vorhanden.naehrwerte.protein,
      fett: vorhanden.naehrwerte.fett,
      kohlenhydrate: vorhanden.naehrwerte.kohlenhydrate,
    }
    : gesamt

  const bereit = name.trim().length >= 2
    && Number.isFinite(portionen_n) && portionen_n > 0
    && zutaten.length > 0
    && zutaten.every(x => x.food_id)

  async function speichern() {
    setLaeuft(true); setFehler(null)
    const zahlOderNull = (s: string) => {
      const n = Number(s.replace(',', '.'))
      return s.trim() === '' || !Number.isFinite(n) ? null : Math.round(n)
    }
    const felder = {
      name_de: name.trim(),
      servings: portionen_n,
      description: beschreibung.trim() || null,
      instructions: anleitung.trim() || null,
      prep_time_min: zahlOderNull(vorzeit),
      cook_time_min: zahlOderNull(garzeit),
      cooking_skill: koennen,
      zutaten: zutaten.map(x => ({ food_id: x.food_id, amount_g: x.amount_g })),
    }
    const r = await senden(vorhanden
      ? { art: 'rezept_aendern', id: vorhanden.id, ...felder }
      : { art: 'rezept', ...felder })
    setLaeuft(false)
    if (!r.ok) { setFehler(r.fehler ?? 'Fehler'); return }
    onFertig()
  }

  return (
    <Card
      title={vorhanden ? 'Rezept bearbeiten' : 'Neues Rezept'}
      sub="SPEC_03 Flow 7"
    >
      <div className="v2-col-gap" style={{ gap: 8 }}>
        <label style={{ fontSize: 10 }}>
          <span className="v2-eyebrow">Name</span>
          <input className="v2-feld" style={{ width: '100%' }} value={name}
                 aria-label="Rezeptname"
                 onChange={e => setName(e.target.value)} />
        </label>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 10 }}>
            <span className="v2-eyebrow">Portionen</span>
            <input className="v2-feld" type="number" min="1" step="1"
                   style={{ width: 90 }} value={portionen}
                   aria-label="Portionen"
                   onChange={e => setPortionen(e.target.value)} />
          </label>
          <label style={{ fontSize: 10 }}>
            <span className="v2-eyebrow">Vorbereitung (min)</span>
            <input className="v2-feld" type="number" min="0" style={{ width: 110 }}
                   value={vorzeit} aria-label="Vorbereitungszeit"
                   onChange={e => setVorzeit(e.target.value)} />
          </label>
          <label style={{ fontSize: 10 }}>
            <span className="v2-eyebrow">Garzeit (min)</span>
            <input className="v2-feld" type="number" min="0" style={{ width: 110 }}
                   value={garzeit} aria-label="Garzeit"
                   onChange={e => setGarzeit(e.target.value)} />
          </label>
          {/* `[cmd]` **`cooking_skill` ist NOT NULL mit CHECK** und
              steht in KEINEM Flow — das Feld ist sichtbar, damit die
              Vorgabe eine Wahl ist und keine stille Setzung. */}
          <label style={{ fontSize: 10 }}>
            <span className="v2-eyebrow">Können</span>
            <select className="v2-feld" value={koennen} aria-label="Können"
                    onChange={e => setKoennen(e.target.value as Koennen)}>
              {KOENNEN.map(k => (
                <option key={k} value={k}>{KOENNEN_LABEL[k]}</option>
              ))}
            </select>
          </label>
        </div>

        <label style={{ fontSize: 10 }}>
          <span className="v2-eyebrow">Beschreibung (optional)</span>
          <input className="v2-feld" style={{ width: '100%' }} value={beschreibung}
                 aria-label="Beschreibung"
                 onChange={e => setBeschreibung(e.target.value)} />
        </label>

        <label style={{ fontSize: 10 }}>
          <span className="v2-eyebrow">Anleitung (optional)</span>
          <textarea className="v2-feld" style={{ width: '100%', minHeight: 60 }}
                    value={anleitung} aria-label="Anleitung"
                    onChange={e => setAnleitung(e.target.value)} />
        </label>

        <div className="v2-divider" />
        <div className="v2-eyebrow">Zutaten</div>

        {zutaten.length === 0 && (
          <p className="v2-muted" style={{ fontSize: 11.5 }}>
            Noch keine Zutat. Ein Rezept braucht mindestens eine.
          </p>
        )}
        {zutaten.map((x, i) => (
          <div key={`${x.food_id}-${i}`} style={{
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5,
          }}>
            <span style={{ flex: 1, minWidth: 0 }}>{x.name}</span>
            <input
              className="v2-feld" type="number" min="1" style={{ width: 80 }}
              value={String(x.amount_g)}
              aria-label={`Menge ${x.name}`}
              onChange={e => {
                const g = Number(e.target.value)
                setZutaten(alt => alt.map((y, j) =>
                  j === i ? { ...y, amount_g: Number.isFinite(g) ? g : 0 } : y))
              }}
            />
            <span className="v2-dim" style={{ fontSize: 10 }}>g</span>
            <button type="button" className="v2-btn v2-btn-ghost v2-btn-sm"
                    aria-label={`${x.name} entfernen`}
                    onClick={() => setZutaten(alt => alt.filter((_, j) => j !== i))}>
              <Icon name="trash" className="v2-ic v2-ic-sm" />
            </button>
          </div>
        ))}

        <ZutatSuche onWaehlen={neu => setZutaten(alt => [...alt, neu])} />

        <Vorschau gesamt={angezeigt} portionen={portionen_n} />

        {fehler && (
          <p style={{ fontSize: 11, color: 'var(--neg)', margin: 0 }}>{fehler}</p>
        )}

        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="v2-btn v2-btn-primary"
                  disabled={!bereit || laeuft} onClick={speichern}>
            {laeuft ? 'Speichert…' : 'Speichern'}
          </button>
          <button type="button" className="v2-btn" onClick={onAbbruch}>
            Abbrechen
          </button>
        </div>
      </div>
    </Card>
  )
}

// ════════════════════════════════════════════════════════════════════
// RecipeLogModal — Flow 7, Schritt 5
// ════════════════════════════════════════════════════════════════════

export function LogModal({ rezept, datum, onFertig, onClose }: {
  rezept: Rezept; datum: string; onFertig: () => void; onClose: () => void
}) {
  const [portionen, setPortionen] = React.useState('1')
  const [typ, setTyp] = React.useState<string>('lunch')
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  const p = Number(portionen.replace(',', '.'))
  const bereit = Number.isFinite(p) && p > 0

  async function loggen() {
    setLaeuft(true); setFehler(null)
    const r = await senden({
      art: 'rezept_loggen', recipe_id: rezept.id,
      portionen: p, meal_type: typ, entry_date: datum,
    })
    setLaeuft(false)
    if (!r.ok) { setFehler(r.fehler ?? 'Fehler'); return }
    onFertig()
  }

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" role="dialog" aria-modal="true"
           aria-label="Als Mahlzeit loggen"
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          <Icon name="plus" className="v2-ic v2-ic-sm" />
          <span className="v2-card-title">Als Mahlzeit loggen</span>
          <div className="v2-spacer" />
          <button type="button" className="v2-icon-btn" onClick={onClose}
                  aria-label="Schliessen">
            <Icon name="x" className="v2-ic v2-ic-sm" />
          </button>
        </div>
        <div className="v2-modal-body">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
            {rezept.name_de}
          </div>

          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Portionen</div>
          <input className="v2-feld" type="number" min="0.25" step="0.25"
                 style={{ width: '100%', marginBottom: 12 }} value={portionen}
                 aria-label="Anzahl Portionen"
                 onChange={e => setPortionen(e.target.value)} />

          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Mahlzeit</div>
          <select className="v2-feld" style={{ width: '100%', marginBottom: 12 }}
                  value={typ} aria-label="Mahlzeitentyp"
                  onChange={e => setTyp(e.target.value)}>
            {MAHLZEITEN.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>

          {/* `[cmd]` **`ADR_GHOST_ENTRY_RECIPE`: ein Rezept ist eine
              Vorlage.** `[read]` **Der Satz steht hier, weil die
              Erwartung sonst „eine Zeile" waere** — es werden so viele
              Zeilen wie Zutaten. */}
          <p className="v2-muted" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
            Es entstehen <strong>{rezept.zutaten.length} Einzelzutaten</strong> im
            Tagebuch, nicht ein Sammeleintrag — die Nährwerte werden dabei
            eingefroren und lassen sich je Zutat weiter anpassen.
          </p>

          {fehler && (
            <p style={{ fontSize: 11, color: 'var(--neg)' }}>{fehler}</p>
          )}
        </div>
        <div className="v2-modal-f">
          <button type="button" className="v2-btn" onClick={onClose}>Abbrechen</button>
          <button type="button" className="v2-btn v2-btn-primary"
                  disabled={!bereit || laeuft} onClick={loggen}>
            {laeuft ? 'Trägt ein…' : 'Bestätigen'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// Flow 8 — Einkaufsliste aus einem REZEPT
// ════════════════════════════════════════════════════════════════════

export function ListeModal({ rezept, onFertig, onClose }: {
  rezept: Rezept; onFertig: () => void; onClose: () => void
}) {
  // Flow 8, Schritt 2: *„Standard: Rezept-Portionen"*.
  const [portionen, setPortionen] = React.useState(String(rezept.servings))
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  const p = Number(portionen.replace(',', '.'))
  const bereit = Number.isFinite(p) && p > 0

  async function erstellen() {
    setLaeuft(true); setFehler(null)
    const r = await senden({
      art: 'einkaufsliste', recipe_id: rezept.id, portionen: p,
    })
    setLaeuft(false)
    if (!r.ok) { setFehler(r.fehler ?? 'Fehler'); return }
    onFertig()
  }

  return (
    <div className="v2-modal-veil" onClick={onClose} role="presentation">
      <div className="v2-modal" role="dialog" aria-modal="true"
           aria-label="Einkaufsliste erstellen"
           onClick={e => e.stopPropagation()}>
        <div className="v2-modal-h">
          <Icon name="bookmark" className="v2-ic v2-ic-sm" />
          <span className="v2-card-title">Einkaufsliste erstellen</span>
          <div className="v2-spacer" />
          <button type="button" className="v2-icon-btn" onClick={onClose}
                  aria-label="Schliessen">
            <Icon name="x" className="v2-ic v2-ic-sm" />
          </button>
        </div>
        <div className="v2-modal-body">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
            {rezept.name_de}
          </div>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>
            Für wie viele Portionen?
          </div>
          <input className="v2-feld" type="number" min="1" step="1"
                 style={{ width: '100%', marginBottom: 12 }} value={portionen}
                 aria-label="Portionen für die Liste"
                 onChange={e => setPortionen(e.target.value)} />

          {/* Die Vorschau der Mengen — Flow 8, Schritt 3. */}
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Vorschau</div>
          <div className="v2-col-gap" style={{ gap: 2 }}>
            {rezept.zutaten.map(zt => (
              <div key={zt.id} style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 11.5,
              }}>
                <span>{zt.name}</span>
                <span className="v2-num">
                  {mengeAnzeige(skaliert(zt.amount_g, rezept.servings, p))}
                </span>
              </div>
            ))}
          </div>

          {fehler && (
            <p style={{ fontSize: 11, color: 'var(--neg)', marginTop: 8 }}>{fehler}</p>
          )}
        </div>
        <div className="v2-modal-f">
          <button type="button" className="v2-btn" onClick={onClose}>Abbrechen</button>
          <button type="button" className="v2-btn v2-btn-primary"
                  disabled={!bereit || laeuft} onClick={erstellen}>
            {laeuft ? 'Erstellt…' : 'Generieren'}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Flow 8, Schritte 4-5 — anzeigen und abhaken. */
export function EinkaufslisteKarte({ liste, onAenderung }: {
  liste: Einkaufsliste; onAenderung: () => void
}) {
  const f = fortschritt(liste.posten)
  const [laeuft, setLaeuft] = React.useState<string | null>(null)

  async function haken(id: string, jetzt: boolean) {
    setLaeuft(id)
    await senden({ art: 'posten_haken', id, is_checked: !jetzt })
    setLaeuft(null)
    onAenderung()
  }

  return (
    <Card
      title={liste.name}
      sub={`${f.erledigt} von ${f.gesamt} erledigt`}
      actions={<Pill variant={f.anteil === 100 ? 'pos' : undefined}>
        {f.anteil === null ? 'leer' : `${f.anteil} %`}
      </Pill>}
    >
      <div className="v2-col-gap" style={{ gap: 2 }}>
        {liste.posten.map(p => (
          <button
            key={p.id} type="button"
            onClick={() => haken(p.id, p.is_checked)}
            disabled={laeuft === p.id}
            aria-pressed={p.is_checked}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              background: 'none', border: 0, padding: '4px 0', cursor: 'pointer',
              color: 'inherit', textAlign: 'left', fontSize: 12,
              opacity: p.is_checked ? 0.55 : 1,
            }}
          >
            {/* `[cmd]` **Es gibt kein `square`-Symbol** (57 Namen in
                `icons.tsx`, gemessen). `[read]` **`more` sah aus wie
                „…" und nicht wie ein Kaestchen** — deshalb ein
                echtes Kaestchen aus CSS statt eines geliehenen
                Symbols. */}
            {p.is_checked
              ? <Icon name="check" className="v2-ic v2-ic-sm" />
              : (
                <span aria-hidden style={{
                  width: 13, height: 13, flexShrink: 0, borderRadius: 3,
                  border: '1.5px solid var(--fg-dim)',
                }} />
              )}
            <span style={{
              flex: 1, textDecoration: p.is_checked ? 'line-through' : 'none',
            }}>
              {p.food_name}
            </span>
            <span className="v2-num v2-dim">
              {mengeAnzeige(p.amount_g, p.unit_display)}
            </span>
          </button>
        ))}
      </div>
      {/* `[cmd]` **Flow 8, Schritt 6 nennt *„Teilen / Exportieren"* —
          ohne Format, ohne Ziel, ohne Mechanismus.** `[read]` **Nicht
          gebaut, sondern gemeldet** (Auftrag: nicht ausdenken). */}
      <p className="v2-muted" style={{ fontSize: 10.5, marginTop: 8, lineHeight: 1.5 }}>
        Flow 8 nennt als sechsten Schritt „Teilen / Exportieren" —{' '}
        <strong>ohne Format und ohne Ziel</strong>. Der Schritt ist gemeldet,
        nicht erfunden.
      </p>
    </Card>
  )
}

// ════════════════════════════════════════════════════════════════════
// RecipeList + RecipeCard + RecipeDetail
// ════════════════════════════════════════════════════════════════════

function RezeptKarte({ r, offen, onOeffnen, onBearbeiten, onLoggen, onListe }: {
  r: Rezept; offen: boolean
  onOeffnen: () => void; onBearbeiten: () => void
  onLoggen: () => void; onListe: () => void
}) {
  const etikett = quellenEtikett(r.quelle, r.quelle_detail)
  const w = r.naehrwerte
  const je = w
    ? jePortion({
      kcal: w.kcal, protein: w.protein, fett: w.fett,
      kohlenhydrate: w.kohlenhydrate,
    }, r.servings)
    : null

  return (
    <Card>
      <button
        type="button" onClick={onOeffnen} aria-expanded={offen}
        style={{
          background: 'none', border: 0, padding: 0, width: '100%',
          textAlign: 'left', cursor: 'pointer', color: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Icon name={offen ? 'chevron_down' : 'chevron_right'}
                className="v2-ic v2-ic-sm" />
          <span style={{ fontSize: 14, fontWeight: 600 }}>{r.name_de}</span>
          {/* `[cmd]` **Flow 3, Schritt 2: eigene ohne Label.** `[read]`
              **Wenn alles ein Etikett traegt, unterscheidet keines.** */}
          {etikett && <Pill variant="acc">{etikett}</Pill>}
          <span className="v2-num v2-dim" style={{ marginLeft: 'auto', fontSize: 10.5 }}>
            {r.zutaten.length} Zutaten · {z(r.servings, 0)} Portionen
            {je?.kcal !== null && je !== null && <> · {z(je.kcal)} kcal/Portion</>}
          </span>
        </div>
      </button>

      {r.description && (
        <div className="v2-muted" style={{ fontSize: 11.5, marginTop: 6 }}>
          {r.description}
        </div>
      )}

      {offen && (
        <div style={{ marginTop: 10 }}>
          <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Zutaten</div>
          <div className="v2-col-gap" style={{ gap: 2 }}>
            {r.zutaten.map(zt => (
              <div key={zt.id} style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 11.5,
              }}>
                <span>{zt.name}</span>
                <span className="v2-num v2-dim">{mengeAnzeige(zt.amount_g)}</span>
              </div>
            ))}
          </div>

          {w && (
            <>
              <div className="v2-divider" />
              <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
                <div>
                  <div className="v2-eyebrow" style={{ fontSize: 9 }}>Gesamt</div>
                  <Row label="kcal" value={z(w.kcal)} />
                  <Row label="Protein" value={`${z(w.protein, 1)} g`} />
                </div>
                <div>
                  <div className="v2-eyebrow" style={{ fontSize: 9 }}>je Portion</div>
                  <Row label="kcal" value={z(je?.kcal ?? null)} />
                  <Row label="Protein" value={`${z(je?.protein ?? null, 1)} g`} />
                </div>
              </div>
            </>
          )}

          {r.instructions && (
            <>
              <div className="v2-divider" />
              <div className="v2-eyebrow" style={{ marginBottom: 4 }}>Anleitung</div>
              <p style={{ fontSize: 11.5, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {r.instructions}
              </p>
            </>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        <button type="button" className="v2-btn v2-btn-sm" onClick={onOeffnen}>
          {offen ? 'Zuklappen' : 'Ansehen'}
        </button>
        <button type="button" className="v2-btn v2-btn-sm" onClick={onBearbeiten}>
          Bearbeiten
        </button>
        <button type="button" className="v2-btn v2-btn-sm v2-btn-primary"
                onClick={onLoggen}>
          Als Mahlzeit loggen
        </button>
        <button type="button" className="v2-btn v2-btn-sm" onClick={onListe}>
          <Icon name="bookmark" className="v2-ic v2-ic-sm" /> Einkaufsliste
        </button>
      </div>
    </Card>
  )
}

export function RezepteTab({ d, datum }: { d: RezeptStand; datum: string }) {
  const router = useRouter()
  const neuLaden = React.useCallback(() => { router.refresh() }, [router])

  const [bauen, setBauen] = React.useState(false)
  const [bearbeiten, setBearbeiten] = React.useState<Rezept | null>(null)
  const [offen, setOffen] = React.useState<string | null>(null)
  const [loggen, setLoggen] = React.useState<Rezept | null>(null)
  const [liste, setListe] = React.useState<Rezept | null>(null)

  if (d.fehler) {
    return (
      <div className="v2-insight v2-neg">
        <div className="v2-insight-mark" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="v2-insight-title">Rezepte nicht gelesen</div>
          <div className="v2-insight-body">{d.fehler}</div>
        </div>
      </div>
    )
  }

  if (bauen || bearbeiten) {
    return (
      <RezeptBauer
        vorhanden={bearbeiten}
        onFertig={() => { setBauen(false); setBearbeiten(null); neuLaden() }}
        onAbbruch={() => { setBauen(false); setBearbeiten(null) }}
      />
    )
  }

  return (
    <div className="v2-col-gap" style={{ gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="v2-eyebrow">Rezepte</span>
        <span className="v2-num v2-dim" style={{ fontSize: 10.5 }}>
          {d.rezepte.length}
        </span>
        <div className="v2-spacer" />
        <button type="button" className="v2-btn v2-btn-sm v2-btn-primary"
                onClick={() => setBauen(true)}>
          <Icon name="plus" className="v2-ic v2-ic-sm" /> Neues Rezept
        </button>
      </div>

      {d.rezepte.length === 0 && (
        <Card>
          <Empty
            title="Noch kein Rezept"
            sub="Ein Rezept besteht aus Zutaten mit Mengen — die Nährwerte rechnet die Datenbank daraus."
            icon="nutrition"
          />
        </Card>
      )}

      {d.rezepte.map(r => (
        <RezeptKarte
          key={r.id} r={r} offen={offen === r.id}
          onOeffnen={() => setOffen(o => (o === r.id ? null : r.id))}
          onBearbeiten={() => setBearbeiten(r)}
          onLoggen={() => setLoggen(r)}
          onListe={() => setListe(r)}
        />
      ))}

      {d.listen.length > 0 && (
        <>
          <div className="v2-eyebrow" style={{ marginTop: 4 }}>Einkaufslisten</div>
          {d.listen.map(l => (
            <EinkaufslisteKarte key={l.id} liste={l} onAenderung={neuLaden} />
          ))}
        </>
      )}

      {loggen && (
        <LogModal
          rezept={loggen} datum={datum}
          onFertig={() => { setLoggen(null); neuLaden() }}
          onClose={() => setLoggen(null)}
        />
      )}
      {liste && (
        <ListeModal
          rezept={liste}
          onFertig={() => { setListe(null); neuLaden() }}
          onClose={() => setListe(null)}
        />
      )}
    </div>
  )
}
