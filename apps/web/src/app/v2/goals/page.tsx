// Goals der Oberflaeche v2 — seit GO-16 teils angebunden.
//
// `[cmd]` Die Seitenleiste fuehrt seit G-02 einen Eintrag `Goals & Body`
// mit `href: /v2/goals`. Seit G-28 stand dort der Entwurf, ganz
// Attrappe; seit den Kettenschritten 110-113 gibt es das Schema:
//   goals.user_goals / goal_phases            2 / 2
//   goals.goal_milestones                        3
//   goals.body_measurements / _circumferences 43 / 7
//   goals.nutrition_targets                      1
// dazu elf Funktionen, darunter `adaptive_tdee` und
// `body_composition_navy`.
//
// DIESE SEITE LIEST JETZT. Serverseitig, mit der Identitaet der
// angemeldeten Nutzerin — dasselbe Muster wie `/v2/medical`
// (`page.tsx:39`): laden, Fehler auffangen, durchreichen. Der Rahmen
// ist eine Client-Komponente und kann selbst nicht lesen, weil
// `createSessionClient()` Cookies ueber `next/headers` holt.
//
// **DAS DATUM IST DAS ECHTE.** `[read]` Der Auftrag GO-16: *„Sobald
// echte Daten fliessen, muss es das echte Datum sein — `lib/datum.ts`
// rechnet ueber Mittag, dieselbe Loesung, keine zweite."* Das feste
// „Heute" der Vorlage (`HEUTE_DER_VORLAGE = '2026-05-16'`) gilt nur
// noch fuer die Kacheln, die weiter Attrappe sind.
//
// `[read]` Was noch Attrappe bleibt und warum, steht in
// docs/ssot/116-goals-anbindung.md.
import type { Metadata } from 'next'

import { heute } from '../../../lib/datum'
import {
  alterAm, angemeldeteNutzerin, ladeAdaptivenTdee, ladeKoerperzusammensetzung,
  ladeMeilensteine, ladeMessungen, ladePhase, ladeProfil, ladeUmfaenge, ladeZiele,
  zaehleZukunftsmessungen,
  type AdaptiverTdee, type Koerpermessung, type Koerperzusammensetzung,
  type Meilenstein, type Phase, type ProfilEingaben, type Umfangssatz,
  type ZielFortschritt,
} from '../../../lib/goals/lesen'
import {
  getZielwerteAm, getZielwertVorschlag,
  type Zielvorschlag, type Zielwerte,
} from '../../../lib/profile/zielwerte-read'
import { GoalsAnsicht } from './ansicht'
import './goals.css'

export const metadata: Metadata = {
  title: 'Goals & Body · LumeOS',
}

// Ohne das wuerde Next die Seite zur Bauzeit einfrieren — mit den
// Werten der Bauzeit, also ohne Session und ohne Zeile.
export const dynamic = 'force-dynamic'

export default async function V2GoalsPage() {
  const stichtag = heute()

  let ziele: ZielFortschritt[] = []
  let meilensteine: Meilenstein[] = []
  let phase: Phase | null = null
  let navy: Koerperzusammensetzung | null = null
  let tdee: AdaptiverTdee | null = null
  let vorschlag: Zielvorschlag | null = null
  let zielwerte: Zielwerte | null = null
  let profil: ProfilEingaben | null = null
  let messungen: Koerpermessung[] = []
  let zukunftsmessungen = 0
  let umfaenge: Umfangssatz[] = []
  let ladefehler: string | null = null

  try {
    const userId = await angemeldeteNutzerin()
    ;[ziele, meilensteine, phase, navy, tdee, messungen, zukunftsmessungen, umfaenge, profil]
      = await Promise.all([
        ladeZiele(userId, stichtag),
        ladeMeilensteine(userId, stichtag),
        ladePhase(userId, stichtag),
        ladeKoerperzusammensetzung(userId, stichtag),
        ladeAdaptivenTdee(userId, stichtag),
        ladeMessungen(userId, stichtag),
        zaehleZukunftsmessungen(userId, stichtag),
        ladeUmfaenge(userId, stichtag),
        ladeProfil(userId),
      ])

    // Die zwei Zielwert-Funktionen kommen aus dem bestehenden Lesepfad
    // (GO-03/GO-04) — nicht nachgebaut, sonst gaebe es zwei Wahrheiten.
    ;[zielwerte, vorschlag] = await Promise.all([
      getZielwerteAm(stichtag),
      getZielwertVorschlag(stichtag),
    ])
  } catch (e) {
    ladefehler = e instanceof Error ? e.message : String(e)
  }

  return (
    <GoalsAnsicht
      echt={{
        stichtag,
        ziele,
        meilensteine,
        phase,
        navy,
        tdee,
        vorschlag,
        zielwerte,
        profil,
        alter: alterAm(profil?.birth_date ?? null, stichtag),
        messungen,
        zukunftsmessungen,
        umfaenge,
        ladefehler,
      }}
    />
  )
}
