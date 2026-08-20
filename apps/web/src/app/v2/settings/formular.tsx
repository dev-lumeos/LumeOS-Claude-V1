'use client'

// Das Profilformular. Sechs Felder plus zwei Zeitraeume.
//
// `[read]` Die Feldmuster stammen aus `theme-v1/module-onboarding.jsx`
// (Auswahlliste, Zahlenfeld mit Einheit, Aktivitaetsliste mit Faktor).
// Uebernommen wurden die Muster, nicht die Inline-Stile: die Klassen
// aus v2.css leisten dasselbe und sind an einer Stelle beschrieben.
import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Card, Pill, Icon, ModuleHero, Meter } from '@lumeos/ui'

import {
  ACTIVITY_LEVELS,
  ACTIVITY_LEVEL_INFO,
  BIOLOGICAL_SEXES,
  BIOLOGICAL_SEX_LABEL,
  // G-80: die vier Stufen des Erfahrungsgrads (C-118).
  EXPERIENCE_LEVELS,
  EXPERIENCE_LEVEL_INFO,
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
    experience_level: p.experience_level ?? '',
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
  // A-14: zwei Namensraeume — die Seite und das Allgemeine.
  const t = useTranslations('Einstellungen')
  const tA = useTranslations('Allgemein')
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
        title={t('titel')}
        sub={t('untertitel')}
        pills={<><Pill variant="acc">GO-01</Pill><Pill>{t('lesenSchreiben')}</Pill></>}
        stats={[
          { label: t('angegeben'), value: `${stand.gesetzt}/${stand.gesamt}` },
          {
            label: t('referenzwerte'),
            value: hasReferenceProfile(gespeichert) ? t('moeglich') : t('fehlt'),
            sub: t('alterGeschlecht'),
          },
          {
            // Bis GO-04 stand hier „GO-04 rechnet" — eine Ankuendigung.
            // Sie rechnet inzwischen, also sagt die Zeile das auch.
            label: t('tagesziele'),
            value: hasTdeeProfile(gespeichert) ? t('gerechnet') : t('fehlt'),
            sub: hasTdeeProfile(gespeichert)
              ? t('ringeImTagebuch')
              : t('fehlendeFelder'),
          },
        ]}
      />

      {ladefehler && (
        <div className="v2-insight v2-neg" style={{ marginTop: 16 }}>
          <div className="v2-insight-mark" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="v2-insight-title">{t('profilNichtLesbar')}</div>
            <div className="v2-insight-body">{ladefehler}</div>
          </div>
        </div>
      )}

      <form onSubmit={absenden}>
        <div className="v2-grid v2-g-cols-2" style={{ marginTop: 16, alignItems: 'start' }}>
          <Card title={t('koerper')} sub={t('koerperSub')}>
            <div style={{ marginBottom: 14 }}>
              <Meter value={stand.gesetzt} max={stand.gesamt} />
              <div style={{ fontSize: 10.5, color: 'var(--fg-dim)', marginTop: 5 }}>
                {t('freiwillig', { gesetzt: stand.gesetzt, gesamt: stand.gesamt })}
              </div>
            </div>

            {/* `[cmd]` Das Format des Feldes bestimmt der Browser, nicht
                die Seite: `lang="de"` steht am <html>, und mit ihm
                rendert Chrome `tt.mm.jjjj` — auch bei englischer
                Browsersprache (gemessen mit locale en-US). Wer trotzdem
                `mm/dd/yyyy` sieht, hat Chrome auf eine andere
                Anzeigesprache gestellt; das laesst sich von der Seite
                aus nicht ueberschreiben. Deshalb steht die erwartete
                Reihenfolge im Hinweis. */}
            <Feld
              label={t('geburtsdatum')}
              hinweis={t('geburtsdatumHinweis')}
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

            <Feld label={t('geschlecht')} fehler={feldfehler.biological_sex}>
              <select
                className="v2-feld"
                value={werte.biological_sex}
                onChange={e => setze('biological_sex', e.target.value)}
              >
                <option value="">{t('nichtAngegeben')}</option>
                {BIOLOGICAL_SEXES.map(s => (
                  <option key={s} value={s}>
                    {BIOLOGICAL_SEX_LABEL[s as BiologicalSex]}
                  </option>
                ))}
              </select>
            </Feld>

            <div className="v2-grid v2-g-cols-2" style={{ gap: 10 }}>
              <Feld label={t('groesse')} fehler={feldfehler.height_cm}>
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

              <Feld label={t('gewicht')} fehler={feldfehler.body_weight_kg}>
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

            <Feld label={t('zielrichtung')} fehler={feldfehler.nutrition_goal}>
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
            <Card title={t('aktivitaet')} sub={t('aktivitaetSub')}>
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

            {/* ── ERFAHRUNGSGRAD (C-118, G-80) ─────────────────────
                **Tom, 2026-08-19:** *„Wir brauchen in Settings und
                Onboarding eine Deklaration des Users, welches Level er
                hat."*

                `[cmd]` **DIE SPALTE GIBT ES NOCH NICHT.**
                `public.profiles` fuehrt 14 Spalten, keine davon nimmt
                den Grad auf. Die Kachel steht trotzdem: **die Form ist
                da, die Auswahl gesperrt** — dasselbe Muster wie die
                Ausschluss-Kachel in G-65, als der Preset-Katalog noch
                fehlte. Sie war zwei Stunden spaeter bedienbar, ohne
                dass jemand sie neu bauen musste.

                `[read]` **Keine Attrappenmarke:** die sagt „hier stehen
                erfundene Zahlen". Hier stehen keine — es steht nur
                nichts. Ein Leerzustand ist kein Attrappenzustand.

                `[read]` Neben `activity_level`, weil beide dasselbe
                Feld beschreiben und doch verschiedenes messen: wieviel
                gegen wie erfahren. */}
            <Card title="Erfahrungsgrad" sub="Selbsteinschätzung">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {EXPERIENCE_LEVELS.map(stufe => {
                  const info = EXPERIENCE_LEVEL_INFO[stufe]
                  const gewaehlt = werte.experience_level === stufe
                  return (
                    <button
                      key={stufe}
                      type="button"
                      className="v2-wahl"
                      aria-pressed={gewaehlt}
                      style={gewaehlt ? {
                        borderColor: 'color-mix(in oklch, var(--acc) 45%, var(--border))',
                        background: 'color-mix(in oklch, var(--acc) 8%, transparent)',
                      } : undefined}
                      // Ein zweiter Klick nimmt die Angabe zurueck —
                      // „nicht angegeben" ist ein gueltiger Zustand.
                      onClick={() => setze('experience_level', gewaehlt ? '' : stufe)}
                    >
                      <span className="v2-wahl-punkt" />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="v2-wahl-titel">{info.label}</span>
                        <span className="v2-wahl-hinweis">{info.hint}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
              {/* `[cmd]` G-110: Seit C-140 gibt es
                  `profiles.experience_level` — die Auswahl ist
                  entsperrt und wird gespeichert.

                  `[read]` **Sie ist Selbstauskunft, keine
                  Fremdeinschaetzung** (C-71): was die Nutzerin ueber
                  sich sagt, nicht was das System aus ihrem Verhalten
                  ableitet. Deshalb waehlt sie hier selbst — und kann
                  die Angabe mit einem zweiten Klick wieder
                  zuruecknehmen. */}
              <p className="v2-muted" style={{ fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>
                Die Angabe schaltet Flaechen frei, die Erfahrung
                voraussetzen — etwa <strong>Supplements · Extended</strong>{' '}
                ab <em>{EXPERIENCE_LEVEL_INFO.advanced.label}</em>. Sie
                lässt sich jederzeit ändern.
              </p>
            </Card>

            {/* Nur bei `female`. Der Block wird AUSGEBLENDET, nicht
                geleert: `werte` behaelt die Zeitraeume, und das Formular
                schickt sie beim Speichern unveraendert mit. Wer sich
                verklickt, verliert nichts — beim Zurueckwechseln stehen
                die Daten wieder da.
                `[cmd]` Geprueft: Geschlecht auf `male`, speichern,
                zurueck auf `female` — die Zeitraeume sind noch da. */}
            {werte.biological_sex === 'female' && (
            <Card
              title={t('schwangerschaft')}
              sub={t('schwangerschaftSub')}
            >
              <p className="v2-hinweis" style={{ borderTop: 0, paddingTop: 0, marginBottom: 12 }}>
                <Icon name="alert" className="v2-ic v2-ic-sm" />
                <span>
                  {t('zeitraumHinweis')}
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
            )}

            {/* Ausgeblendet, aber nicht vergessen: wer Zeitraeume
                eingetragen hat und das Geschlecht wechselt, soll sehen,
                dass die Angaben noch da sind. Ohne diesen Satz sieht es
                aus, als seien sie weg. */}
            {werte.biological_sex !== 'female'
              && (werte.pregnancy_started_on || werte.lactation_started_on) && (
              <p className="v2-hinweis">
                <Icon name="alert" className="v2-ic v2-ic-sm" />
                <span>
                  {t('zeitraeumeErhalten')} {t('nurWeiblich')}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="v2-formleiste">
          {/* `[cmd]` Vorher `v2-btn-accent`: der faerbt sich aus `--acc`,
              und Settings hat keinen Modulakzent — der Knopf blieb auch
              MIT Aenderungen blassgrau und war vom deaktivierten
              Zustand kaum zu unterscheiden. `v2-btn-primary` ist der
              starke Knopf der Vorlage (dort „Log", „MealCam"). */}
          <button
            type="submit"
            className="v2-btn v2-btn-primary"
            disabled={zustand.art === 'speichert' || !geaendert}
          >
            <Icon name="check" className="v2-ic v2-ic-sm" />
            {zustand.art === 'speichert' ? t('speichertGerade') : tA('speichern')}
          </button>

          {zustand.art === 'gespeichert' && !geaendert && (
            <span style={{ color: 'var(--pos)', fontSize: 12 }}>{t('gespeichert')}</span>
          )}
          {geaendert && zustand.art !== 'speichert' && (
            <span style={{ color: 'var(--fg-dim)', fontSize: 12 }}>
              {t('nichtGespeichert')}
            </span>
          )}
          {zustand.art === 'fehler' && (
            <span style={{ color: 'var(--neg)', fontSize: 12 }}>{zustand.text}</span>
          )}
        </div>
      </form>

      {/* Bis GO-04 stand hier, die Ringe blieben leer, weil noch nichts
          rechnet. `[cmd]` Das ist ueberholt: `goals.berechne_zielwerte`
          liefert Werte, und im Tagebuch stehen gefuellte Ringe. Ein
          Hinweis, der einmal richtig war, wird zur Falschaussage,
          sobald das Gebaute ihn ueberholt. */}
      <p className="v2-hinweis" style={{ marginTop: 16 }}>
        <Icon name="alert" className="v2-ic v2-ic-sm" />
        <span>
          <strong>{t('formelHinweis')}</strong>{' '}
          {t('formelHinweisLang')}{' '}
          <strong>{t('schaetzungKeineMessung')}</strong>
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
  const t = useTranslations('Einstellungen')
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
        {t('beginnEnde')}
      </div>
      {(fehlerVon || fehlerBis) && (
        <div className="v2-feldfehler">{fehlerVon ?? fehlerBis}</div>
      )}
    </div>
  )
}
