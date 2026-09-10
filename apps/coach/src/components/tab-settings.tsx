// Einstellungen des Coaches — G-404, NUR DIE FORM.
//
// **Tom, 2026-09-08:** *„ich will nicht settings und workspaces von
// apps/web kopiert haben. das soll fuer coach angelegt werden — mit
// den eigenen settings."* **Und:** *„noch gar nichts mit db, wir
// machen nur ein mockup."*
//
// ══ ELF FELDER, DREI MIT DATEN ══════════════════════════════════════
//
// `[cmd]` **Die Felder stammen aus `CoachProfile.tsx:8-14`** im
// Vorgaengerrepo (`business_name`, `bio`, `contact_email`,
// `website`, `specialties[]`, `certifications[]`, `max_clients`)
// **plus `tier`** (`:53-60`, vier Stufen).
//
// `[cmd]` **`coach.coach_profiles` fuehrt sieben Spalten** — gemessen
// in `information_schema`:
//
//     id  user_id  display_name  email  is_active
//     created_at  updated_at
//
// `[read]` **Davon sind DREI anzeigbar:** `display_name`, `email`,
// `is_active`. **Die uebrigen acht haben keine Spalte**, und jede
// Attrappe nennt die, die fehlt.
//
// ══ WAS HIER NICHT PASSIERT ═════════════════════════════════════════
//
// `[read]` **Kein Schreibweg.** **Keine Server-Aktion, kein
// `formAction`, kein `revalidatePath`.** Die Felder tragen
// `readOnly`, die Listen aendern nur den Zustand im Browser. **Wer
// die Seite neu laedt, sieht wieder die Demo-Werte** — und der
// Vermerk sagt das.
//
// `[read]` **Das ist Toms Vorgabe, keine Bequemlichkeit:** *„noch
// gar nichts mit db"*. **Ein Formular, das speichert, braeuchte
// sieben Spalten, die C-458 erst anlegen muss.**
'use client'

import * as React from 'react'
import { Card, Empty, Pill } from '@lumeos/ui'

import type { PortalStand } from '../lib/daten'

/** Die vier Stufen aus `CoachProfile.tsx:53-58`. */
const STUFEN = ['starter', 'professional', 'business', 'enterprise'] as const
type Stufe = (typeof STUFEN)[number]

/**
 * Ein Feld ohne Spalte.
 *
 * `[read]` **E-72 im Kleinen:** ein leeres Eingabefeld saehe aus wie
 * eines, das man fuellen koennte. **Der Vermerk nennt die Spalte,
 * die fehlt** — dann sucht niemand den Fehler im Code.
 */
function OhneSpalte({ label, spalte, beispiel, mehrzeilig }: {
  label: string
  spalte: string
  beispiel: string
  mehrzeilig?: boolean
}) {
  return (
    <div className="cp-feld">
      <label className="cp-feld-label">
        {label}
        <Pill>Attrappe</Pill>
      </label>
      {mehrzeilig
        ? <textarea className="cp-eingabe" rows={3} defaultValue={beispiel} readOnly />
        : <input className="cp-eingabe" defaultValue={beispiel} readOnly />}
      <div className="cp-feld-grund">
        wartet auf: Spalte <span className="cp-monospace">{spalte}</span> in
        {' '}<span className="cp-monospace">coach.coach_profiles</span>
      </div>
    </div>
  )
}

/**
 * Eine Liste mit Hinzufuegen und Entfernen — A3.
 *
 * **Tom:** *„deklarier Demo, das wird spaeter definiert."*
 *
 * `[cmd]` **Die Bedienung folgt `CoachProfile.tsx:37-45`:** Eingabe,
 * Enter oder Knopf, **kein doppelter Eintrag**, Entfernen je Zeile.
 *
 * `[read]` **Der Zustand lebt im Browser** — es gibt keine Spalte,
 * in die er gehen koennte. **Beim Neuladen stehen wieder die
 * Demo-Werte da**, und der Vermerk sagt es.
 */
function DemoListe({ titel, spalte, vorgabe, platzhalter }: {
  titel: string
  spalte: string
  vorgabe: string[]
  platzhalter: string
}) {
  const [werte, setWerte] = React.useState<string[]>(vorgabe)
  const [neu, setNeu] = React.useState('')

  const hinzu = () => {
    const w = neu.trim()
    // `[read]` **Kein doppelter Eintrag** — wie im Vorgaenger.
    if (!w || werte.includes(w)) return
    setWerte([...werte, w])
    setNeu('')
  }

  return (
    <div className="cp-feld">
      <label className="cp-feld-label">
        {titel}
        <Pill>Demo</Pill>
      </label>

      <div className="cp-marken">
        {werte.length === 0
          ? <span className="cp-hinweis">Noch nichts eingetragen.</span>
          : werte.map(w => (
            <span key={w} className="cp-marke">
              {w}
              <button
                type="button"
                className="cp-marke-weg"
                onClick={() => setWerte(werte.filter(x => x !== w))}
                aria-label={`${w} entfernen`}
              >
                ×
              </button>
            </span>
          ))}
      </div>

      <div className="cp-zeile">
        <input
          className="cp-eingabe"
          value={neu}
          placeholder={platzhalter}
          onChange={e => setNeu(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              hinzu()
            }
          }}
          aria-label={`${titel} hinzufuegen`}
        />
        <button type="button" className="cp-knopf" onClick={hinzu} disabled={!neu.trim()}>
          Hinzufuegen
        </button>
      </div>

      <div className="cp-feld-grund">
        Demo — nichts wird gespeichert. wartet auf: Spalte
        {' '}<span className="cp-monospace">{spalte}</span> in
        {' '}<span className="cp-monospace">coach.coach_profiles</span>
      </div>
    </div>
  )
}

export function TabSettings({ stand }: { stand: PortalStand }) {
  // `[cmd]` **Aus `coach.coach_profiles`, seit G-404 gelesen.**
  // `[cmd]` **Eine Zeile: „Coach Lumeos / coach@lumeos.app"** —
  // gemessen. `[read]` **Mein erster Entwurf setzte hier fest
  // `null`** und haette einen Leerhinweis gezeigt, den es nicht gibt.
  const profil = stand.profil

  return (
    <div className="cp-stapel">
      {/* ══ Was die Datenbank traegt ═══════════════════════════════ */}
      <Card
        title="Konto"
        sub="drei Felder aus coach.coach_profiles — die einzigen, die es gibt"
      >
        <div className="cp-felder">
          <div className="cp-feld">
            <label className="cp-feld-label">Anmelde-Adresse</label>
            <input className="cp-eingabe" defaultValue={stand.email} readOnly />
            <div className="cp-feld-grund">
              aus <span className="cp-monospace">auth.users.email</span> — die
              {' '}Adresse, mit der du dich anmeldest
            </div>
          </div>

          <div className="cp-feld">
            <label className="cp-feld-label">Anzeigename</label>
            {/* `[cmd]` **Gemessen: EINE Zeile** („Coach Lumeos").
                `[read]` **Der Leerzweig bleibt trotzdem** — ein
                zweiter Coach ohne Profilzeile saehe sonst ein leeres
                Feld, und das saehe aus wie ein Name, den niemand
                gesetzt hat (E-72). */}
            {profil
              ? <input className="cp-eingabe" defaultValue={profil.display_name} readOnly />
              : (
                <div className="cp-hinweis">
                  Kein Profil angelegt — dieses Konto hat keine Zeile in
                  {' '}<span className="cp-monospace">coach.coach_profiles</span>.
                  {' '}Die Spalte
                  {' '}<span className="cp-monospace">display_name</span> gibt es.
                </div>
              )}
          </div>

          <div className="cp-feld">
            <label className="cp-feld-label">Konto aktiv</label>
            {profil
              ? <Pill variant={profil.is_active ? 'pos' : undefined}>
                  {profil.is_active ? 'aktiv' : 'stillgelegt'}
                </Pill>
              : (
                <div className="cp-hinweis">
                  Ohne Profilzeile kein Zustand —
                  {' '}<span className="cp-monospace">is_active</span> gibt es.
                </div>
              )}
          </div>
        </div>
      </Card>

      {/* ══ Was keine Spalte hat ═══════════════════════════════════ */}
      <Card
        title="Profil"
        sub="acht Felder aus CoachProfile.tsx — keines hat heute eine Spalte"
      >
        <div className="cp-felder">
          <OhneSpalte
            label="Geschaeftsname"
            spalte="business_name"
            beispiel="Lindqvist Performance"
          />
          <OhneSpalte
            label="Kontakt-Adresse"
            spalte="contact_email"
            beispiel="hallo@lindqvist-performance.se"
          />
          <OhneSpalte
            label="Website"
            spalte="website"
            beispiel="https://lindqvist-performance.se"
          />
          <OhneSpalte
            label="Selbstbeschreibung"
            spalte="bio"
            mehrzeilig
            beispiel={'Krafttraining und Wettkampfvorbereitung, seit 2014. '
              + 'Schwerpunkt auf langfristigem Aufbau statt kurzer Kuren.'}
          />
        </div>

        <div className="cp-felder">
          <DemoListe
            titel="Fachgebiete"
            spalte="specialties[]"
            vorgabe={['Krafttraining', 'Wettkampfvorbereitung', 'Rekomposition']}
            platzhalter="z. B. Ausdauer"
          />
          <DemoListe
            titel="Nachweise"
            spalte="certifications[]"
            vorgabe={['NSCA-CSCS', 'Precision Nutrition L1']}
            platzhalter="z. B. DOSB B-Lizenz"
          />
        </div>
      </Card>

      {/* ══ A4: Abrechnung ═════════════════════════════════════════ */}
      <Card
        title="Abrechnung"
        sub="Stufe und Klientengrenze — beide ohne Spalte"
      >
        <div className="cp-felder">
          <div className="cp-feld">
            <label className="cp-feld-label">
              Stufe
              <Pill>Attrappe</Pill>
            </label>
            <div className="cp-stufen">
              {STUFEN.map(s => (
                <span
                  key={s}
                  className="cp-stufe-marke"
                  data-gewaehlt={s === ('starter' as Stufe) ? 'ja' : undefined}
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="cp-feld-grund">
              wartet auf: Spalte <span className="cp-monospace">tier</span> in
              {' '}<span className="cp-monospace">coach.coach_profiles</span>,
              {' '}mit CHECK auf die vier Stufen
            </div>
          </div>

          <OhneSpalte
            label="Hoechstzahl Klienten"
            spalte="max_clients"
            beispiel="25"
          />
        </div>

        {/* ══ A4: taugen die subscription_plans? ═══════════════════
            **Tom:** *„irgendwas darstellen, wird spaeter definiert."*

            `[cmd]` **Gemessen: `marketplace.subscription_plans` hat
            drei Zeilen** — `Lumeos Basic` (999 ct), `Lumeos Plus`
            (1999), `Lumeos Pro` (2999), je Monat, mit
            `ai_credits_included` 20/50/100.

            `[read]` **Sie taugen NICHT als Anzeige:** das sind die
            Abonnements des ENDNUTZERS mit KI-Guthaben — nicht die
            Stufen eines Coaches (`starter` bis `enterprise`).
            **Gleiche Sache im Namen, andere in der Bedeutung.**

            `[read]` **Sie hier zu zeigen hiesse, dem Coach einen
            Preis zu nennen, der fuer ihn nicht gilt.** */}
        <div className="cp-fehlt">
          <strong>Keine Rechnung, keine Zahlung.</strong>
          {' '}Gemessen: <span className="cp-monospace">marketplace.subscription_plans</span>
          {' '}fuehrt drei Zeilen (Lumeos Basic/Plus/Pro, 9,99–29,99 € im Monat,
          {' '}mit KI-Guthaben) — das sind die Abonnements des <em>Endnutzers</em>,
          {' '}nicht die Stufen eines Coaches. <strong>Sie taugen deshalb nicht
          {' '}als Anzeige</strong>; was ein Coach zahlt, ist nicht definiert.
        </div>
      </Card>

      {/* ══ Warum unter diesem Bereich KEINE Mockup-Linie steht ═══
          `[cmd]` **Gemessen: die Vorlage fuehrt keinen
          `settings`-Reiter** — die sechzehn aus
          `module-coach.jsx:923-940` enden bei `team`, und
          `mockup-referenz.ts` kennt ihn folglich nicht.
          `[read]` **`TabReferenz` rendert dann nichts** (eine leere
          Linie waere ein Rahmen ohne Inhalt, E-72). **Hier steht der
          Grund**, damit die fehlende Linie nicht wie ein Versehen
          aussieht. */}
      <div className="cp-fehlt">
        <strong>Kein Mockup-Gegenstueck.</strong> Die Vorlage
        {' '}(<span className="cp-monospace">module-coach.jsx:923-940</span>)
        {' '}fuehrt sechzehn Reiter, von <span className="cp-monospace">overview</span>
        {' '}bis <span className="cp-monospace">team</span> —
        {' '}<span className="cp-monospace">settings</span> ist keiner davon.
        {' '}Die Felder oben stammen aus
        {' '}<span className="cp-monospace">CoachProfile.tsx</span> im
        {' '}Vorgaengerrepo, nicht aus dem Entwurf. <strong>Deshalb steht
        {' '}unter diesem Bereich keine Trennlinie.</strong>
      </div>

      {/* ══ Alarme und Ruhezeiten — der dritte Block der Vorlage ══ */}
      <Card title="Alarme" sub="Schwellen und Ruhezeiten">
        <Empty
          title="Bewusst leer"
          sub={'Es gibt keine Tabelle fuer Coach-Einstellungen — dieselbe, '
            + 'die G-398 fuer „Settings" und „Coach settings" vermisst und '
            + 'die ein Alarm-Erzeuger braeuchte (G-402/A4). Ohne sie waere '
            + 'jede Schwelle hier eine Zahl ohne Ziel.'}
        />
      </Card>
    </div>
  )
}
