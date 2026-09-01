'use client'

// ════════════════════════════════════════════════════════════════════
// EINEN PLANEINTRAG BEARBEITEN — G-298
// ════════════════════════════════════════════════════════════════════
//
// **Tom, 2026-08-31:** *,,meal plans sehe ich noch nichts
// brauchbares."* `[read]` **Ein Plan, den man nur ansehen kann, ist
// ein Ausdruck.**
//
// `[cmd]` **Die einzigen Knoepfe waren *Zuklappen* und *Laufzeit
// aendern*.** Hier entstehen die drei fehlenden: **hinzufuegen,
// aendern, entfernen — je Position.**
//
// ══ KEINE DRITTE ANSICHT ════════════════════════════════════════════
//
// `[read]` **Der Auftrag verbietet sie, und sie waere auch falsch.**
// Das Formular haengt IM Planner-Raster, an der Zelle, die es
// bearbeitet. **Es ist kein eigener Ort, sondern ein aufgeklappter
// Teil des vorhandenen.**
//
// `[read]` **A-30:** nur Typen aus dem Leseweg, kein Wertimport.
import * as React from 'react'
import { Icon } from '@lumeos/ui'

import {
  EINTRAG_TYPEN, MAHLZEIT_TYPEN, feldFuer, FELD_LABEL, FELD_EINHEIT,
  bauEintrag, verletztCheck,
  type EintragTyp, type MahlzeitTyp,
} from '../../../lib/nutrition/plan-eintrag-lage'
// G-320: die Lebensmittelsuche als Modal — dieselbe Mechanik wie in
// Food DB (`useFoodSuche`), nicht eine sechste eigene Suche.
import { FoodSuchModal, type TagesKontext } from './food-such-modal'
import type { NutritionFoodSearchRow } from '../../../lib/nutrition/food-search'

/** Was der Editor zum Auswaehlen braucht. */
export type Quelle = { id: string; name: string }

export type EintragStand = {
  id: string
  entry_type: string
  meal_type: string
  recipe_id: string | null
  food_id: string | null
  custom_food_id: string | null
  amount_g: number | null
  planned_servings: number | null
  bezeichnung: string
}

const TYP_LABEL: Record<EintragTyp, string> = {
  recipe: 'Rezept',
  bls: 'Lebensmittel',
  custom: 'Eigenes',
}

export const MAHLZEIT_LABEL: Record<MahlzeitTyp, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittag',
  dinner: 'Abend',
  snack: 'Snack',
  pre_workout: 'Vor dem Training',
  post_workout: 'Nach dem Training',
  other: 'Sonstiges',
}

/**
 * Das Formular fuer einen Eintrag — neu oder vorhanden.
 *
 * `[read]` **Ein Formular fuer beides.** Anlegen und Aendern
 * unterscheiden sich in einem Feld (`id`) und im Endpunkt; zwei
 * Formulare waeren zwei Stellen, an denen der CHECK verletzt werden
 * kann.
 */
export function EintragForm({
  tagId, vorhanden, rezepte, mahlzeit, kontext, onFertig, onAbbruch,
}: {
  tagId: string
  /** `null` heisst: ein neuer Eintrag. */
  vorhanden: EintragStand | null
  rezepte: readonly Quelle[]
  /** Der Slot, in dem das Formular sitzt. */
  mahlzeit: MahlzeitTyp
  /**
   * G-320: wohin geschrieben wird — Tag, Tagessumme, Tagesziel.
   *
   * `[read]` **Das Modal soll wissen, wo der Nutzer landet.** Der
   * Auftrag: *,,Wer mittags 800 kcal eintraegt, soll sehen, wo er
   * landet."*
   */
  kontext: Omit<TagesKontext, 'art' | 'slot' | 'slotLabel'>
  onFertig: () => void
  onAbbruch: () => void
}) {
  const [typ, setTyp] = React.useState<EintragTyp>(
    () => (EINTRAG_TYPEN as readonly string[]).includes(vorhanden?.entry_type ?? '')
      ? (vorhanden!.entry_type as EintragTyp)
      : 'recipe',
  )
  const [quelleId, setQuelleId] = React.useState(
    () => vorhanden?.recipe_id ?? vorhanden?.food_id ?? vorhanden?.custom_food_id
      ?? rezepte[0]?.id ?? '',
  )
  const [slot, setSlot] = React.useState<MahlzeitTyp>(
    () => (MAHLZEIT_TYPEN as readonly string[]).includes(vorhanden?.meal_type ?? '')
      ? (vorhanden!.meal_type as MahlzeitTyp)
      : mahlzeit,
  )
  const [menge, setMenge] = React.useState(
    () => String(vorhanden?.planned_servings ?? vorhanden?.amount_g ?? 1),
  )
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)
  // G-320: ist die Lebensmittelsuche offen?
  const [suchen, setSuchen] = React.useState(false)
  // G-320: der Name des gewaehlten Lebensmittels — `quelleId` allein
  // ist eine Kennung, und eine Kennung sagt dem Nutzer nichts.
  const [gewaehltName, setGewaehltName] = React.useState(
    () => (vorhanden?.food_id ? vorhanden.bezeichnung : ''),
  )

  const feld = feldFuer(typ)

  // `[read]` **Der Typwechsel setzt die Quelle zurueck.** Ein
  // Rezept-Bezeichner in `food_id` verletzt den Fremdschluessel, und
  // der Fehler erschiene erst beim Speichern.
  const typWechseln = (neu: EintragTyp) => {
    setTyp(neu)
    setQuelleId(neu === 'recipe' ? (rezepte[0]?.id ?? '') : '')
    // G-320: der Name gehoert zur Quelle. `[read]` **Bleibt er
    // stehen, zeigt das Feld ein Lebensmittel an, das nicht mehr
    // gewaehlt ist** — genau die Art stiller Falschaussage, die
    // `zahl-stimmt-aussage-nicht` beschreibt.
    setGewaehltName('')
    setFehler(null)
  }

  // Die Gegenprobe VOR dem Senden — dieselbe Funktion, die der
  // Schreibweg benutzt. Sie sagt, WAS falsch ist.
  const zahl = Number(menge.replace(',', '.'))
  const entwurfFehler = (() => {
    if (!quelleId) return 'Bitte eine Quelle wählen.'
    if (!Number.isFinite(zahl) || zahl <= 0) {
      return 'Die Menge muss größer als 0 sein.'
    }
    return verletztCheck(bauEintrag({
      typ, quelleId, mahlzeit: slot, menge: zahl,
    }))
  })()

  async function speichern() {
    if (entwurfFehler) { setFehler(entwurfFehler); return }
    setLaeuft(true)
    setFehler(null)
    try {
      const antwort = await fetch('/api/nutrition/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(vorhanden
          ? {
            art: 'eintrag_aendern', id: vorhanden.id,
            typ, quelleId, mahlzeit: slot, menge: zahl,
          }
          : {
            art: 'eintrag', day_id: tagId,
            typ, quelleId, mahlzeit: slot, menge: zahl,
          }),
      })
      if (!antwort.ok) {
        const koerper = await antwort.json().catch(() => null)
        setFehler(koerper?.error ?? `Fehler ${antwort.status}`)
        return
      }
      onFertig()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  return (
    <div className="v2-planner-form" style={{
      border: '1px solid var(--acc-nutri)', borderRadius: 6,
      padding: 8, marginTop: 6, background: 'var(--surface-2)',
    }}>
      <div className="v2-col-gap" style={{ gap: 6 }}>
        <label style={{ fontSize: 10 }}>
          <span className="v2-eyebrow">Art</span>
          <select
            className="v2-feld" style={{ fontSize: 11, width: '100%' }}
            value={typ}
            onChange={e => typWechseln(e.target.value as EintragTyp)}
          >
            {EINTRAG_TYPEN.map(t => (
              <option key={t} value={t}>{TYP_LABEL[t]}</option>
            ))}
          </select>
        </label>

        {/* `[read]` **Nur Rezepte sind waehlbar.** `[cmd]` Die
            Lebensmittelsuche haengt an `food_search` und ist ein
            eigener Weg — hier stuende sonst ein Feld, das nichts
            findet. Der Satz darunter sagt es, statt es zu verbergen. */}
        {typ === 'recipe' ? (
          <label style={{ fontSize: 10 }}>
            <span className="v2-eyebrow">Rezept</span>
            <select
              className="v2-feld" style={{ fontSize: 11, width: '100%' }}
              value={quelleId}
              onChange={e => setQuelleId(e.target.value)}
            >
              {rezepte.length === 0 && <option value="">— kein Rezept vorhanden —</option>}
              {rezepte.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </label>
        ) : (
          /* ══ G-320: die Suche, nicht der Satz ══════════════
             **Tom, 2026-09-02:** *,,offen planner ist die
             lebensmittelsuche die muss gleich aufgebaut sein wie die
             suche in food db."*

             `[cmd]` **Hier stand: *,,dieser Weg ist noch nicht
             angebunden."*** `[read]` **Ein ehrlicher Satz, aber eine
             Sackgasse** — genau die Art, die G-311 geschlossen hat.

             `[read]` **Ein vorhandener Eintrag behaelt seine
             Quelle**: sie zu tauschen waere ein anderer Eintrag,
             und dafuer gibt es Loeschen und Neuanlegen. */
          <div className="v2-col-gap" style={{ gap: 6 }}>
            {vorhanden ? (
              <p className="v2-muted" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
                {`Quelle: ${vorhanden.bezeichnung} — sie bleibt, `}
                nur Menge und Mahlzeit sind hier änderbar.
              </p>
            ) : (
              /* ══ G-321: EIN Knopf, kein Feld daneben ═════════════
                 **Tom, 2026-09-02:** *„da ist nicht klar dass man
                 zuerst den suchen button klicken muss."*

                 `[cmd]` **Hier stand ein `<input>` mit
                 `placeholder="— noch keines gewählt —"` und daneben
                 ein Knopf.** `[read]` **Ein Feld mit Platzhalter ist
                 ein Eingabefeld** — wer hineintippt, erwartet
                 Treffer und bekommt nichts, weil es `readOnly` war.

                 `[read]` **Und das Modal sucht beim Tippen** (der
                 Hook entprellt). **Zwei Eingabestellen für dieselbe
                 Sache, von denen nur eine funktioniert.**

                 `[read]` **Also gibt es nur noch eine:** die ganze
                 Zeile ist der Knopf, und der Fokus landet im Modal
                 im Suchfeld. **Kein Platzhalter, der eine Eingabe
                 verspricht.** */
              <div>
                <span className="v2-eyebrow">Lebensmittel</span>
                <button
                  type="button" className="v2-btn"
                  data-probe="lebensmittel-waehlen"
                  style={{
                    fontSize: 11, width: '100%', justifyContent: 'flex-start',
                    gap: 6, marginTop: 2,
                  }}
                  onClick={() => setSuchen(true)}
                >
                  <Icon name="search" className="v2-ic v2-ic-sm" />
                  {gewaehltName || 'Lebensmittel suchen …'}
                </button>
              </div>
            )}
          </div>
        )}

        <label style={{ fontSize: 10 }}>
          <span className="v2-eyebrow">Mahlzeit</span>
          <select
            className="v2-feld" style={{ fontSize: 11, width: '100%' }}
            value={slot}
            onChange={e => setSlot(e.target.value as MahlzeitTyp)}
          >
            {MAHLZEIT_TYPEN.map(m => (
              <option key={m} value={m}>{MAHLZEIT_LABEL[m]}</option>
            ))}
          </select>
        </label>

        {/* `[cmd]` **Das Mengenfeld haengt am Typ, nicht am Geschmack:**
            `meal_plan_entries_target_check` erlaubt bei `recipe` nur
            `planned_servings` und bei `bls`/`custom` nur `amount_g`.
            **Beide zu zeigen hiesse, ein Formular zu bauen, das die
            Datenbank ablehnt.** */}
        <label style={{ fontSize: 10 }}>
          <span className="v2-eyebrow">
            {FELD_LABEL[feld]} ({FELD_EINHEIT[feld]})
          </span>
          <input
            className="v2-feld" style={{ fontSize: 11, width: '100%' }}
            type="number" min="0" step={feld === 'planned_servings' ? '0.25' : '1'}
            value={menge}
            onChange={e => setMenge(e.target.value)}
          />
        </label>

        {fehler && (
          <p style={{ fontSize: 10.5, margin: 0, color: 'var(--neg)' }}>{fehler}</p>
        )}

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className="v2-btn v2-btn-sm v2-btn-primary"
            disabled={laeuft || Boolean(entwurfFehler)}
            title={entwurfFehler ?? undefined}
            onClick={speichern}
          >
            {laeuft ? 'Speichert…' : vorhanden ? 'Übernehmen' : 'Hinzufügen'}
          </button>
          <button type="button" className="v2-btn v2-btn-sm" onClick={onAbbruch}>
            Abbrechen
          </button>
        </div>
      </div>

      {/* ══ G-320: die Lebensmittelsuche ═══════════════════════════
          `[read]` **Das Modal schreibt nicht selbst** — es gibt
          Lebensmittel und Menge zurück, und der Schreibweg bleibt
          `art: 'eintrag'` mit `typ: 'bls'`. **Ein Modal, das seinen
          Schreibweg kennt, wäre an ihn gebunden** und könnte weder
          vom Rezept noch vom Quick-add gerufen werden. */}
      {suchen && (
        <FoodSuchModal
          kontext={{
            art: 'tag', ...kontext, slot, slotLabel: MAHLZEIT_LABEL[slot],
          }}
          onClose={() => setSuchen(false)}
          onWaehlen={async (f: NutritionFoodSearchRow, mengeG: number) => {
            setQuelleId(f.id)
            setGewaehltName(f.name_display_de || f.name_de)
            setMenge(String(mengeG))
            setSuchen(false)
          }}
        />
      )}
    </div>
  )
}

/**
 * Der Entfernen-Knopf.
 *
 * `[read]` **Zweistufig, ohne Dialog.** `[cmd]` Ein `confirm()`
 * blockiert die Seite und ist in der Hausregel ausgeschlossen; ein
 * eigenes Modal fuer eine Position waere zu viel. **Der Knopf fragt
 * sich selbst.**
 */
export function EintragLoeschen({ id, onFertig }: {
  id: string; onFertig: () => void
}) {
  const [sicher, setSicher] = React.useState(false)
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  async function loeschen() {
    setLaeuft(true)
    try {
      const antwort = await fetch('/api/nutrition/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ art: 'eintrag_loeschen', id }),
      })
      if (!antwort.ok) {
        const koerper = await antwort.json().catch(() => null)
        setFehler(koerper?.error ?? `Fehler ${antwort.status}`)
        return
      }
      onFertig()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  if (fehler) {
    return <span style={{ fontSize: 10, color: 'var(--neg)' }}>{fehler}</span>
  }

  if (!sicher) {
    return (
      <button
        type="button"
        className="v2-btn v2-btn-ghost v2-btn-sm"
        aria-label="Eintrag entfernen"
        onClick={() => setSicher(true)}
      >
        <Icon name="trash" className="v2-ic v2-ic-sm" />
      </button>
    )
  }

  return (
    <span style={{ display: 'inline-flex', gap: 4 }}>
      <button
        type="button"
        className="v2-btn v2-btn-sm"
        style={{ color: 'var(--neg)', borderColor: 'var(--neg)' }}
        disabled={laeuft}
        onClick={loeschen}
      >
        {laeuft ? '…' : 'Wirklich'}
      </button>
      <button type="button" className="v2-btn v2-btn-sm"
              onClick={() => setSicher(false)}>
        Nein
      </button>
    </span>
  )
}
