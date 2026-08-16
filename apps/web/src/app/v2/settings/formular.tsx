'use client'

// Das Profilformular. Sechs Felder plus zwei Zeitraeume.
//
// `[read]` Die Feldmuster stammen aus `theme-v1/module-onboarding.jsx`
// (Auswahlliste, Zahlenfeld mit Einheit, Aktivitaetsliste mit Faktor).
// Uebernommen wurden die Muster, nicht die Inline-Stile: die Klassen
// aus v2.css leisten dasselbe und sind an einer Stelle beschrieben.
import * as React from 'react'
import { Card, Pill, Icon, ModuleHero, Meter } from '@lumeos/ui'

import {
  ACTIVITY_LEVELS,
  ACTIVITY_LEVEL_INFO,
  BIOLOGICAL_SEXES,
  BIOLOGICAL_SEX_LABEL,
  HEIGHT_MAX,
  HEIGHT_MIN,
  NUTRITION_GOALS,
  NUTRITION_GOAL_LABEL,
  WEIGHT_MAX,
  WEIGHT_MIN,
  hasReferenceProfile,
  hasTdeeProfile,
  profileCompleteness,
  type ActivityLevel,
  type BiologicalSex,
  type NutritionGoal,
  type StoredProfile,
} from '../../../lib/profile/profile-model'

/** Formularwerte sind Zeichenketten — leer heisst „nicht angegeben". */
type Formwerte = Record<keyof StoredProfile, string>

function zuFormwerten(p: StoredProfile): Formwerte {
  return {
    birth_date: p.birth_date ?? '',
    biological_sex: p.biological_sex ?? '',
    height_cm: p.height_cm === null ? '' : String(p.height_cm),
    body_weight_kg: p.body_weight_kg === null ? '' : String(p.body_weight_kg),
    activity_level: p.activity_level ?? '',
    nutrition_goal: p.nutrition_goal ?? '',
    pregnancy_started_on: p.pregnancy_started_on ?? '',
    pregnancy_ended_on: p.pregnancy_ended_on ?? '',
    lactation_started_on: p.lactation_started_on ?? '',
    lactation_ended_on: p.lactation_ended_on ?? '',
  }
}

type Zustand =
  | { art: 'ruhe' }
  | { art: 'speichert' }
  | { art: 'gespeichert' }
  | { art: 'fehler'; text: string; felder?: Record<string, string> }

export function ProfilFormular({
  start, ladefehler,
}: {
  start: StoredProfile
  ladefehler: string | null
}) {
  const [werte, setWerte] = React.useState<Formwerte>(() => zuFormwerten(start))
  const [gespeichert, setGespeichert] = React.useState<StoredProfile>(start)
  const [zustand, setZustand] = React.useState<Zustand>({ art: 'ruhe' })

  const stand = profileCompleteness(gespeichert)
  const geaendert = JSON.stringify(werte) !== JSON.stringify(zuFormwerten(gespeichert))

  function setze(feld: keyof Formwerte, wert: string) {
    setWerte(w => ({ ...w, [feld]: wert }))
    setZustand({ art: 'ruhe' })
  }

  async function absenden(e: React.FormEvent) {
    e.preventDefault()
    setZustand({ art: 'speichert' })
    try {
      const antwort = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(werte),
      })
      const daten = await antwort.json()
      if (!antwort.ok) {
        const felder: Record<string, string> = {}
        for (const d of daten?.details ?? []) {
          if (d?.feld) felder[d.feld] = d.meldung
        }
        setZustand({ art: 'fehler', text: daten?.error ?? `HTTP ${antwort.status}`, felder })
        return
      }
      setGespeichert(daten as StoredProfile)
      setWerte(zuFormwerten(daten as StoredProfile))
      setZustand({ art: 'gespeichert' })
    } catch (e) {
      setZustand({ art: 'fehler', text: e instanceof Error ? e.message : String(e) })
    }
  }

  const feldfehler = zustand.art === 'fehler' ? (zustand.felder ?? {}) : {}

  return (
    <>
      <ModuleHero
        icon="settings"
        title="Einstellungen"
        sub="Profil — Grundlage fuer Referenzwerte und Tagesziele."
        pills={<><Pill variant="acc">GO-01</Pill><Pill>lesen und schreiben</Pill></>}
        stats={[
          { label: 'Angegeben', value: `${stand.gesetzt}/${stand.gesamt}` },
          {
            label: 'Referenzwerte',
            value: hasReferenceProfile(gespeichert) ? 'moeglich' : 'fehlt',
            sub: 'Alter + Geschlecht',
          },
          {
            label: 'TDEE-Formel',
            value: hasTdeeProfile(gespeichert) ? 'moeglich' : 'fehlt',
            sub: 'GO-04 rechnet',
          },
        ]}
      />

      {ladefehler && (
        <div className="v2-insight v2-neg" style={{ marginTop: 16 }}>
          <div className="v2-insight-mark" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="v2-insight-title">Profil nicht lesbar</div>
            <div className="v2-insight-body">{ladefehler}</div>
          </div>
        </div>
      )}

      <form onSubmit={absenden}>
        <div className="v2-grid v2-g-cols-2" style={{ marginTop: 16, alignItems: 'start' }}>
          <Card title="Koerper" sub="Grundlage der Formeln">
            <div style={{ marginBottom: 14 }}>
              <Meter value={stand.gesetzt} max={stand.gesamt} />
              <div style={{ fontSize: 10.5, color: 'var(--fg-dim)', marginTop: 5 }}>
                {stand.gesetzt} von {stand.gesamt} Angaben — alles freiwillig,
                aber ohne sie bleibt gerechnet, was ungerechnet bleiben muss.
              </div>
            </div>

            <Feld
              label="Geburtsdatum"
              hinweis="Datum, nicht Alter — ein gespeichertes Alter ist am naechsten Geburtstag falsch."
              fehler={feldfehler.birth_date}
            >
              <input
                type="date"
                className="v2-feld"
                value={werte.birth_date}
                max={new Date().toISOString().slice(0, 10)}
                onChange={e => setze('birth_date', e.target.value)}
              />
            </Feld>

            <Feld label="Biologisches Geschlecht" fehler={feldfehler.biological_sex}>
              <select
                className="v2-feld"
                value={werte.biological_sex}
                onChange={e => setze('biological_sex', e.target.value)}
              >
                <option value="">— nicht angegeben —</option>
                {BIOLOGICAL_SEXES.map(s => (
                  <option key={s} value={s}>
                    {BIOLOGICAL_SEX_LABEL[s as BiologicalSex]}
                  </option>
                ))}
              </select>
            </Feld>

            <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
              <Feld label="Groesse" fehler={feldfehler.height_cm}>
                <div style={{ position: 'relative', display: 'flex' }}>
                  <input
                    type="number"
                    className="v2-feld"
                    value={werte.height_cm}
                    min={HEIGHT_MIN}
                    max={HEIGHT_MAX}
                    step="0.5"
                    onChange={e => setze('height_cm', e.target.value)}
                  />
                  <span className="v2-feld-einheit">cm</span>
                </div>
              </Feld>

              <Feld label="Gewicht" fehler={feldfehler.body_weight_kg}>
                <div style={{ position: 'relative', display: 'flex' }}>
                  <input
                    type="number"
                    className="v2-feld"
                    value={werte.body_weight_kg}
                    min={WEIGHT_MIN}
                    max={WEIGHT_MAX}
                    step="0.1"
                    onChange={e => setze('body_weight_kg', e.target.value)}
                  />
                  <span className="v2-feld-einheit">kg</span>
                </div>
              </Feld>
            </div>

            <Feld label="Zielrichtung" fehler={feldfehler.nutrition_goal}>
              <select
                className="v2-feld"
                value={werte.nutrition_goal}
                onChange={e => setze('nutrition_goal', e.target.value)}
              >
                <option value="">— nicht angegeben —</option>
                {NUTRITION_GOALS.map(g => (
                  <option key={g} value={g}>
                    {NUTRITION_GOAL_LABEL[g as NutritionGoal]}
                  </option>
                ))}
              </select>
            </Feld>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card title="Aktivitaet" sub="bestimmt den TDEE-Faktor">
              {/* `[read]` Die Vorlage zeigt den Faktor neben jeder Stufe.
                  Ohne ihn ist „massig aktiv" eine leere Behauptung. */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ACTIVITY_LEVELS.map(stufe => {
                  const info = ACTIVITY_LEVEL_INFO[stufe as ActivityLevel]
                  const aktiv = werte.activity_level === stufe
                  return (
                    <button
                      key={stufe}
                      type="button"
                      className="v2-wahl"
                      data-on={aktiv ? 'true' : undefined}
                      aria-pressed={aktiv}
                      onClick={() => setze('activity_level', aktiv ? '' : stufe)}
                    >
                      <span className="v2-wahl-punkt" />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="v2-wahl-titel">{info.label}</span>
                        <span className="v2-wahl-hinweis">{info.hint}</span>
                      </span>
                      <span className="v2-num v2-dim" style={{ fontSize: 11.5 }}>
                        × {info.factor}
                      </span>
                    </button>
                  )
                })}
              </div>
              {feldfehler.activity_level && (
                <div className="v2-feldfehler">{feldfehler.activity_level}</div>
              )}
            </Card>

            <Card
              title="Schwangerschaft und Stillzeit"
              sub="Zeitraeume, keine Eigenschaften"
            >
              <p className="v2-hinweis" style={{ borderTop: 0, paddingTop: 0, marginBottom: 12 }}>
                <Icon name="alert" className="v2-ic v2-ic-sm" />
                <span>
                  Beides sind Zustaende auf Zeit, deshalb Beginn und Ende.
                  Referenzwerte fuer einen Tag richten sich danach, ob der
                  Tag im Zeitraum liegt — nicht danach, ob irgendwann
                  einmal ein Haken gesetzt wurde.
                </span>
              </p>

              <Zeitraum
                titel="Schwangerschaft"
                von={werte.pregnancy_started_on}
                bis={werte.pregnancy_ended_on}
                onVon={v => setze('pregnancy_started_on', v)}
                onBis={v => setze('pregnancy_ended_on', v)}
                fehlerVon={feldfehler.pregnancy_started_on}
                fehlerBis={feldfehler.pregnancy_ended_on}
              />

              <Zeitraum
                titel="Stillzeit"
                von={werte.lactation_started_on}
                bis={werte.lactation_ended_on}
                onVon={v => setze('lactation_started_on', v)}
                onBis={v => setze('lactation_ended_on', v)}
                fehlerVon={feldfehler.lactation_started_on}
                fehlerBis={feldfehler.lactation_ended_on}
              />
            </Card>
          </div>
        </div>

        <div className="v2-formleiste">
          <button
            type="submit"
            className="v2-btn v2-btn-accent"
            disabled={zustand.art === 'speichert' || !geaendert}
          >
            <Icon name="check" className="v2-ic v2-ic-sm" />
            {zustand.art === 'speichert' ? 'Speichert …' : 'Speichern'}
          </button>

          {zustand.art === 'gespeichert' && !geaendert && (
            <span style={{ color: 'var(--pos)', fontSize: 12 }}>Gespeichert.</span>
          )}
          {geaendert && zustand.art !== 'speichert' && (
            <span style={{ color: 'var(--fg-dim)', fontSize: 12 }}>
              Nicht gespeicherte Aenderungen.
            </span>
          )}
          {zustand.art === 'fehler' && (
            <span style={{ color: 'var(--neg)', fontSize: 12 }}>{zustand.text}</span>
          )}
        </div>
      </form>

      <p className="v2-hinweis" style={{ marginTop: 16 }}>
        <Icon name="alert" className="v2-ic v2-ic-sm" />
        <span>
          <strong>Diese Seite erfasst, sie rechnet nicht.</strong> Aus
          diesen Angaben entstehen spaeter Tagesziele (GO-03, GO-04) und
          die Referenzwerte der Naehrstoffbewertung. Solange das nicht
          gebaut ist, bleiben die Ringe im Tagebuch leer — auch mit
          vollstaendigem Profil.
        </span>
      </p>
    </>
  )
}

function Feld({
  label, hinweis, fehler, children,
}: {
  label: string
  hinweis?: string
  fehler?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="v2-eyebrow" style={{ marginBottom: 4 }}>{label}</div>
      {children}
      {hinweis && !fehler && (
        <div style={{ fontSize: 10.5, color: 'var(--fg-dim)', marginTop: 4 }}>{hinweis}</div>
      )}
      {fehler && <div className="v2-feldfehler">{fehler}</div>}
    </div>
  )
}

function Zeitraum({
  titel, von, bis, onVon, onBis, fehlerVon, fehlerBis,
}: {
  titel: string
  von: string
  bis: string
  onVon: (v: string) => void
  onBis: (v: string) => void
  fehlerVon?: string
  fehlerBis?: string
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="v2-eyebrow" style={{ marginBottom: 4 }}>{titel}</div>
      <div className="v2-grid v2-g-cols-2" style={{ gap: 8 }}>
        <input
          type="date"
          className="v2-feld"
          value={von}
          aria-label={`${titel} — Beginn`}
          onChange={e => onVon(e.target.value)}
        />
        <input
          type="date"
          className="v2-feld"
          value={bis}
          aria-label={`${titel} — Ende (leer = laufend)`}
          onChange={e => onBis(e.target.value)}
        />
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--fg-dim)', marginTop: 4 }}>
        Beginn und Ende. Ende leer heisst: laeuft noch.
      </div>
      {(fehlerVon || fehlerBis) && (
        <div className="v2-feldfehler">{fehlerVon ?? fehlerBis}</div>
      )}
    </div>
  )
}
