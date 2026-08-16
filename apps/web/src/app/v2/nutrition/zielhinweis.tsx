// Was fehlt, damit die Ringe rechnen — und wohin man geht.
//
// ANLASS: Der Umsetzungsplan hatte diesen Schritt nicht; er ist beim
// Bauen von GO-01 aufgefallen und in den Auftrag uebernommen worden.
//
// [read] Dieselbe Logik wie beim Ring, der ohne Ziel keine Fuellung
// zeigt: Eine leere Anzeige, die ihren Grund nennt, ist ehrlich. Eine,
// die schweigt, sieht aus wie ein Fehler.
//
// Heute sagt das Tagebuch „keine Ziele". Das war richtig, solange es
// keine Zieltabelle gab. Jetzt gibt es sie — und der Satz muss sagen,
// WAS fehlt.
'use client'

import * as React from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { Icon } from '@lumeos/ui'

import type { Zielvorschlag, Zielwerte } from '../../../lib/profile/zielwerte-read'

/** Klartext je Profilfeld. Die Kennungen sind Spaltennamen. */
const FELDNAME: Record<string, string> = {
  birth_date: 'Geburtsdatum',
  biological_sex: 'biologisches Geschlecht',
  height_cm: 'Groesse',
  body_weight_kg: 'Gewicht',
  activity_level: 'Aktivitaetsstufe',
  nutrition_goal: 'Zielrichtung',
}

function liste(felder: string[]): string {
  const namen = felder.map(f => FELDNAME[f] ?? f)
  if (namen.length === 0) return ''
  if (namen.length === 1) return namen[0]
  return `${namen.slice(0, -1).join(', ')} und ${namen[namen.length - 1]}`
}

export function Zielhinweis({
  ziele, vorschlag, fehler,
}: {
  ziele: Zielwerte | null
  vorschlag: Zielvorschlag | null
  /** Zielwerte gar nicht lesbar — heute: `goals` nicht exponiert. */
  fehler?: string | null
}) {
  // Fall 0: die Zielwerte sind nicht erreichbar. Die Nutzerin kann
  // daran nichts aendern, deshalb kein roter Kasten — aber schweigen
  // waere falsch, denn ohne diesen Satz sieht die leere Karte nach
  // einem Fehler ihres Profils aus.
  if (fehler && !ziele && !vorschlag) {
    return (
      <p className="v2-hinweis">
        <Icon name="alert" className="v2-ic v2-ic-sm" />
        <span>
          <strong>Zielwerte sind gerade nicht abrufbar.</strong> Die
          Tabelle und die Formel stehen (GO-03, GO-04); erreichbar wird
          beides, sobald der lokale Stack die ergaenzte Schemaliste
          uebernommen hat. Am Profil liegt es nicht.
        </span>
      </p>
    )
  }
  // Fall 1: Es gelten Ziele. Dann braucht es keinen Hinweis, sondern
  // eine Herkunftsangabe — eine geschaetzte Zahl ist keine gemessene.
  if (ziele) {
    return (
      <p className="v2-hinweis">
        <Icon name="alert" className="v2-ic v2-ic-sm" />
        <span>
          Ziele gelten seit {ziele.gueltig_ab}
          {ziele.herkunft === 'formel'
            ? ' und sind aus dem Profil geschaetzt'
            : ' und von Hand gesetzt'}
          {ziele.tdee !== null && ` (TDEE ${Math.round(ziele.tdee)} kcal)`}.{' '}
          <strong>Eine Schaetzung ist keine Messung</strong> — belegt wird
          sie erst durch den Verlauf ueber Wochen (GO-13).{' '}
          <Link href={'/v2/settings' as Route} className="v2-link">
            Profil anpassen
          </Link>
        </span>
      </p>
    )
  }

  // Fall 2: Kein Profil, oder ein unvollstaendiges.
  if (vorschlag?.hindernis === 'profil_unvollstaendig') {
    const fehlt = vorschlag.fehlende_felder
    return (
      <div className="v2-empty">
        <Icon name="settings" />
        <div>
          <strong>
            {fehlt.length === 6
              ? 'Keine Ringe, weil das Profil leer ist.'
              : `Keine Ringe — es fehlt ${fehlt.length === 1 ? 'eine Angabe' : `${fehlt.length} Angaben`}.`}
          </strong>
          <p style={{ marginTop: 6 }}>
            {fehlt.length > 0 ? (
              <>Die Formel braucht {liste(fehlt)}.</>
            ) : (
              <>Die Formel braucht Angaben aus dem Profil.</>
            )}{' '}
            Ohne sie gibt es kein Tagesziel, und ein Ring ohne Ziel zeigt
            besser nichts als eine erfundene Zahl.
          </p>
          <p style={{ marginTop: 6 }}>
            <Link href={'/v2/settings' as Route} className="v2-link">
              Im Profil eintragen
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // Fall 3: Das Profil ist vollstaendig, aber die Zielrichtung hat
  // keinen Kalorienzuschlag. [cmd] Das trifft heute genau 'health' —
  // die Luecke ist vorgelegt, nicht gefuellt.
  if (vorschlag?.hindernis === 'zielrichtung_ohne_faktor') {
    return (
      <div className="v2-empty">
        <Icon name="alert" />
        <div>
          <strong>
            Fuer die Zielrichtung
            {vorschlag.nutrition_goal ? ` „${vorschlag.nutrition_goal}"` : ''}{' '}
            gibt es noch keinen Kalorienzuschlag.
          </strong>
          <p style={{ marginTop: 6 }}>
            Das Profil ist vollstaendig — was fehlt, ist eine
            Entscheidung: um wie viel Prozent soll das Tagesziel vom
            Erhaltungsbedarf abweichen? Bis die getroffen ist, wird hier
            nichts geraten.
          </p>
          <p style={{ marginTop: 6 }}>
            <Link href={'/v2/settings' as Route} className="v2-link">
              Andere Zielrichtung waehlen
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // Fall 4: Die Formel rechnet, aber es ist noch nichts gesetzt.
  if (vorschlag && vorschlag.kcal !== null) {
    return (
      <div className="v2-empty">
        <Icon name="check" />
        <div>
          <strong>Das Profil reicht — ein Vorschlag steht bereit.</strong>
          <p style={{ marginTop: 6 }}>
            Aus dem Profil ergibt sich ein Tagesziel von{' '}
            <span className="v2-num">{Math.round(vorschlag.kcal)}</span> kcal
            {vorschlag.protein_g !== null && (
              <>
                {' '}bei <span className="v2-num">{Math.round(vorschlag.protein_g)}</span> g
                Protein
              </>
            )}
            {vorschlag.tdee !== null && (
              <> (Erhaltungsbedarf <span className="v2-num">{Math.round(vorschlag.tdee)}</span> kcal)</>
            )}
            . Gesetzt ist es noch nicht — <strong>rechnen und speichern sind
            getrennt</strong>, damit nicht jede Profilaenderung ein neues Ziel
            anlegt.
          </p>
          <div style={{ marginTop: 10 }}>
            <ZielSetzen />
          </div>
        </div>
      </div>
    )
  }

  return null
}


/**
 * Aus dem Vorschlag ein Ziel machen.
 *
 * `[read]` Der eine Klick, der Rechnen und Speichern verbindet. Ohne
 * ihn bliebe die Trennung aus GO-04 eine Sackgasse: die Formel rechnet,
 * und niemand kann das Ergebnis festhalten.
 */
function ZielSetzen() {
  const [laeuft, setLaeuft] = React.useState(false)
  const [fehler, setFehler] = React.useState<string | null>(null)

  async function setzen() {
    setLaeuft(true)
    setFehler(null)
    try {
      const a = await fetch('/api/profile/ziele', { method: 'POST' })
      const d = await a.json().catch(() => ({}))
      if (!a.ok) {
        setFehler(d?.error ?? `HTTP ${a.status}`)
        return
      }
      window.location.reload()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaeuft(false)
    }
  }

  return (
    <>
      <button type="button" className="v2-btn v2-btn-accent"
              disabled={laeuft} onClick={setzen}>
        <Icon name="check" className="v2-ic v2-ic-sm" />
        {laeuft ? 'Wird gesetzt …' : 'Als Tagesziel setzen'}
      </button>
      <span style={{ marginLeft: 10, fontSize: 10.5, color: 'var(--fg-dim)' }}>
        gilt ab heute — aeltere Tage behalten ihr Ziel
      </span>
      {fehler && (
        <div className="v2-feldfehler" style={{ marginTop: 6 }}>{fehler}</div>
      )}
    </>
  )
}
