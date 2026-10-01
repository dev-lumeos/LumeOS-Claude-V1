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
  ladeFotosessions, ladeMeilensteine, ladeMessungen, ladeOffenePhasen,
  ladePhasen, ladeProfil,
  ladeUmfaenge, ladeZiele,
  zaehleZukunftsmessungen,
  type AdaptiverTdee, type Koerpermessung, type Koerperzusammensetzung,
  type Fotosession, type Meilenstein, type Phase, type ProfilEingaben,
  type Umfangssatz,
  type ZielFortschritt, type Zielphase,
} from '../../../lib/goals/lesen'
import {
  getZielwerteAm, getZielwertVorschlag,
  type Zielvorschlag, type Zielwerte,
} from '../../../lib/profile/zielwerte-read'
// `[cmd]` **G-541: der Strategiekatalog.** Serverseitig geladen wie
// alles andere — die Ansicht bekommt Daten, keinen Klienten.
import {
  ladeStrategien, ladeStrategieProfil, type Strategie,
} from '../../../lib/goals/strategie-read'
// G-565/A4: die zuletzt gewaehlte Einheit, aus
// `user_display_preferences` — nicht aus der Phase (E-83).
import { ladeEinheit } from '../../../lib/goals/einheit-speichern'
import type { Rateneinheit } from '../../../lib/goals/zielrate-einheit'
import { GoalsAnsicht } from './ansicht'
import './goals.css'

export const metadata: Metadata = {
  title: 'Goals & Body · LumeOS',
}

// Ohne das wuerde Next die Seite zur Bauzeit einfrieren — mit den
// Werten der Bauzeit, also ohne Session und ohne Zeile.
export const dynamic = 'force-dynamic'

export default async function V2GoalsPage({
  searchParams,
}: {
  searchParams?: { datum?: string }
}) {
  // ══ G-375: der Tag kommt aus der Adresse ════════════════
  //
  // `[cmd]` **Hier stand `heute()`, fest.** **Der Tageswechsler
  // der Schale haette darueber gestanden und nichts bewirkt**
  // (C-426: kein Regler ohne Wirkung).
  //
  // `[read]` **Der Stichtag war schon durchgereicht** — er
  // wurde nur nicht entgegengenommen.
  const stichtag = /^\d{4}-\d{2}-\d{2}$/.test(searchParams?.datum ?? '')
    ? searchParams!.datum!
    : heute()

  let ziele: ZielFortschritt[] = []
  let meilensteine: Meilenstein[] = []
  // `[cmd]` **G-564: eine MENGE, keine einzelne Phase** — seit
  // G-559 liefert `phase_am` alle am Tag gueltigen Zielphasen.
  let phasen: Phase[] = []
  let navy: Koerperzusammensetzung | null = null
  let tdee: AdaptiverTdee | null = null
  let vorschlag: Zielvorschlag | null = null
  let zielwerte: Zielwerte | null = null
  let profil: ProfilEingaben | null = null
  let messungen: Koerpermessung[] = []
  let zukunftsmessungen = 0
  let umfaenge: Umfangssatz[] = []
  // `[cmd]` **G-421: `goals.progress_photos` gibt es seit C-463.**
  let fotosessions: Fotosession[] = []
  // `[cmd]` **G-541: 17 Zeilen, fuer alle gleich** — der Katalog
  // traegt kein `user_id`, die RLS-Regel erlaubt `authenticated`
  // genau SELECT.
  let strategien: Strategie[] = []
  let strategieProfil = { experience: null as string | null, hasCoach: false }
  // `[cmd]` **G-544/A1: eine offene Phase JE ZIEL** — seit
  // G-538 erlaubt `uq_goal_phases_one_open` mehrere.
  // `phase_am()` kann sie nicht liefern (`LIMIT 1`).
  let offenePhasen: Zielphase[] = []
  // `[read]` **Eine Darstellung, kein Datum** — faellt sie aus,
  // gilt die Vorgabe, nicht ein Fehler.
  let einheit: Rateneinheit = 'prozent'
  let ladefehler: string | null = null

  try {
    const userId = await angemeldeteNutzerin()
    ;[ziele, meilensteine, phasen, navy, tdee, messungen, zukunftsmessungen, umfaenge,
      profil, fotosessions, strategien, strategieProfil, offenePhasen,
      einheit]
      = await Promise.all([
        ladeZiele(userId, stichtag),
        ladeMeilensteine(userId, stichtag),
        ladePhasen(userId, stichtag),
        ladeKoerperzusammensetzung(userId, stichtag),
        ladeAdaptivenTdee(userId, stichtag),
        ladeMessungen(userId, stichtag),
        zaehleZukunftsmessungen(userId, stichtag),
        ladeUmfaenge(userId, stichtag),
        ladeProfil(userId),
        ladeFotosessions(userId, stichtag),
        ladeStrategien(),
        ladeStrategieProfil(userId),
        ladeOffenePhasen(userId, stichtag),
        ladeEinheit(),
      ])

    // Die zwei Zielwert-Funktionen kommen aus dem bestehenden Lesepfad
    // (GO-03/GO-04) — nicht nachgebaut, sonst gaebe es zwei Wahrheiten.
    //
    // ══ G-568/A2: hier IST ein Ziel bekannt ════════════════════════
    //
    // `[cmd]` **`berechne_zielwerte` nimmt seit G-563 ein
    // `p_goal_id`** — und die alte Fassung wirft bei mehreren
    // offenen Phasen (`23514`).
    //
    // `[read]` **Diese Seite kennt die offenen Phasen schon** (oben
    // geladen) — **also nennt sie das Ziel, statt es die Datenbank
    // raten zu lassen.** `[read]` **Bei genau einer offenen Phase
    // ist es deren Ziel; bei mehreren bleibt es offen**, und die
    // Datenbank meldet die Mehrdeutigkeit als Zustand (A4).
    const einzigesZiel = offenePhasen.length === 1
      ? offenePhasen[0].goal_id
      : null
    ;[zielwerte, vorschlag] = await Promise.all([
      getZielwerteAm(stichtag),
      getZielwertVorschlag(stichtag, einzigesZiel),
    ])
  } catch (e) {
    ladefehler = e instanceof Error ? e.message : String(e)
  }

  return (
    <>
    <GoalsAnsicht
      echt={{
        stichtag,
        ziele,
        meilensteine,
        phasen,
        navy,
        tdee,
        vorschlag,
        zielwerte,
        profil,
        alter: alterAm(profil?.birth_date ?? null, stichtag),
        messungen,
        zukunftsmessungen,
        umfaenge,
        fotosessions,
        strategien,
        strategieProfil,
        offenePhasen,
        einheit,
        ladefehler,
      }}
    />
    </>
  )
}
