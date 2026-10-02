'use client'

// Das Goals-Modul der Vorlage, uebernommen.
//
// QUELLE: theme-v1/module-goals.jsx (903 Zeilen) — der Rahmen.
//
// **EIN RAHMEN, KEINE WEICHE.** `[cmd]` `app.jsx:125` lautet schlicht
// `case "goals": return <GoalsModule />;` — anders als bei Recovery,
// wo `RecoveryModuleV2 ? … : …` steht. `window.GoalsModule` wird genau
// einmal gesetzt (module-goals.jsx:903); `-pro.jsx` und `-editor.jsx`
// ueberschreiben es NICHT, sondern liefern zu.
//
// Damit sind die drei Dateien ein System wie bei Training:
//   module-goals.jsx      ruft 5× `window.Goals*View`  → -pro.jsx
//   module-goals-pro.jsx  ruft 2× `window.Phase*`      → -editor.jsx
// Ausfuehrlich im Bericht.
//
// GEAENDERT IST NUR DAS TECHNISCHE:
//   1. JSX ohne Typen -> TypeScript.
//   2. Klassen auf `v2-`-Praefix.
//   3. `window.Goals*View` -> Import.
//   4. Knoepfe ohne Ziel oeffnen `InEntwicklung`.
//   5. `Math.random()` in den Verlaufsdaten -> feste Pseudofolge
//      (Begruendung in `daten.ts`).
//   6. `@media`-Haltepunkte, weil die Vorlage keine hat.
//
// NICHT geaendert: keine Kachel weggelassen, keine Zahl ersetzt, keine
// Anordnung angepasst. Die Texte bleiben englisch wie in der Vorlage.
//
// ══ WAS ECHT IST UND WAS ATTRAPPE — G-572, Stand 2026-10-02 ════════
//
// `[read]` **Die Gruende je Kachel stehen in
// `docs/ssot/116-goals-anbindung.md`** — dort, nicht hier. `[cmd]`
// **Jene Datei traegt den Stand 2026-08-18 (GO-16);** seither sind
// acht Punkte durch diese Ansicht gegangen (G-79, G-365, G-539,
// G-544, G-553, G-555, G-565, G-577). **Was hier steht, ist die
// Zaehlung von heute, nicht ihre Wiederholung.**
//
// `[cmd]` **Am 2026-10-02 je Reiter am SCHIRM gezaehlt**
// (`dev@lumeos.app`, Attrappenmarken ueber und unter dem Trenner):
//
//     Reiter            oben  unten   was oben steht
//     ----------------------------------------------------------------
//     Goals                2      7   Zielkarten + Meilensteine echt
//     Phase engine         7      5   PhaseEcht, Editor, Zeitachse,
//                                     Einheitenschalter — alles echt
//     Adaptive TDEE        4      6   Kopfkachel echt, Kurve Entwurf
//     Cross-module         5      5   KEIN echter Teil
//     Timeline             0      1   Zeitachse echt (G-79)
//     Body metrics         0      6   ganz echt
//     Measurements         0      3   ganz echt
//     Composition          0      4   ganz echt
//     Physique ratios      1      4   PhysiqueEcht aus den Umfaengen
//     Pose sessions        3      3   KEIN echter Teil
//
// `[read]` **Attrappe OHNE echten Teil sind heute zwei Reiter:**
// **Cross-module** und **Pose sessions**. `[cmd]` **Hier stand bis
// G-572 eine Liste von fuenf** — Timeline, Phase engine, Cross-module,
// Physique ratios, Pose sessions. **Drei davon sind seither
// angebunden worden**, und der Kopf hat es nicht mitbekommen.
//
// `[read]` **Die uebrigen acht sind GEMISCHT** — echter Teil oben,
// Mockup-Referenz unter dem Trenner (E-68). **Ein Reiter mit Attrappen
// ist nicht dasselbe wie ein Attrappenreiter**, und genau diese
// Verwechslung hat die erste Fassung von G-532 erzeugt.
//
// `[cmd]` **Zehn Trenner, nicht drei:** drei stehen in dieser Datei
// (Phase engine, Physique, Timeline), **sieben in
// `mockup-referenz.tsx`** (Goals, Body metrics, Measurements,
// Composition, Adaptive TDEE, Cross-module, Pose sessions). **Jeder
// Reiter hat genau einen.**
//
// `[read]` **Hier stehen bewusst KEINE Zeilennummern** — sie altern
// mit jedem Punkt, der die Datei anfasst. **Genau daran ist der
// Auftrag zu G-572 selbst gestolpert:** er nannte 616 fuer den
// Phase-engine-Trenner, gemessen waren es 580, und nach diesem
// Kopf sind es wieder andere. `[cmd]` **Nachzaehlen:**
//
//     grep -n 'ReferenzTrenner reiter=' apps/web/src/app/v2/goals/ansicht.tsx
//     grep -rn 'ReferenzTrenner reiter=' apps/web/src/app/v2/goals/mockup-referenz.tsx
//
// **Die fuenf Reiter, die GO-16 angebunden hat** (Stand 2026-08-18,
// unveraendert gueltig):
//   Goals        `ziel-karten.tsx`     user_goals · goal_progress_at
//                                      goal_milestones · _status
//   Adaptive TDEE `tdee-kopf.tsx`      adaptive_tdee (nur die Kopfkachel)
//   Body metrics `tab-koerper.tsx`     body_measurements
//   Measurements `tab-koerper.tsx`     body_circumferences
//   Composition  `tab-composition.tsx` body_composition_navy ·
//                                      berechne_zielwerte · profiles
//
// **Dazu seither** (je mit dem Punkt, der es gebaut hat):
//   Timeline        G-79    `tab-timeline.tsx` — Ziele, Phasen,
//                           Meilensteine mit Datum
//   Phase engine    G-539   Editor · G-544 Zeitachse · G-565
//                           Einheitenschalter · G-513 Schreibwege
//   Physique ratios G-87    `physique-echt.tsx` aus `body_circumferences`
//
// `[read]` **Nachzuzaehlen mit dem Skript aus G-572:** je Reiter die
// Marken ueber und unter `[data-referenz-trenner]`.
import * as React from 'react'
import { useTabParam } from '../../../lib/tab-url'
import { Card, Pill, Icon, Tabs, type TabItem } from '@lumeos/ui'

// `[cmd]` **Von den neun Importen aus `daten.ts` sind zwei uebrig**
// — gezaehlt GO-16 (2026-08-18), **nachgeprueft G-572 (2026-10-02):
// gilt weiter.** Die uebrigen sieben hingen an den vier geloeschten
// Tabs.
//
// `[read]` **Sie gehoeren dem `TimelineTab` UNTER dem Trenner**, nicht
// dem Reiter: **die echte Zeitachse ist `ZeitachseTab`** aus
// `tab-timeline.tsx` (G-79) und liest `echt.ziele`, `echt.phasen`,
// `echt.meilensteine`. **Der Kopf sagte „weil er weiter Attrappe
// ist" — das stimmt fuer die Mockup-Fassung, nicht fuer den Reiter.**
import { ACTIVE_GOALS, COMPLETED_GOALS } from './daten'
import { GoalsKontext, type ModalZustand } from './kontext'
import { GoalsModale } from './modale'
import { GoalsPhaseView, GoalsTDEEView, GoalsCrossModuleView } from './tab-phase'
// G-79: die echte Zeitachse.
import { TimelineTab as ZeitachseTab } from './tab-timeline'
import { ReferenzTrenner } from '../../../components/shell/referenz-trenner'
// `[cmd]` G-365: die vier angebundenen Reiter bekommen ihren
// Mockup-Reiter darunter — sie hatten keine Linie.
import {
  GoalsGoalsReferenz, GoalsMetricsReferenz,
  GoalsMeasureReferenz, GoalsCompReferenz,
  GoalsTdeeReferenz, GoalsCrossReferenz,
} from './mockup-referenz'
import {
  FehlendePhaseKacheln, FehlendeZielKacheln, FehlendeMetrikKacheln,
  FehlendeMessKacheln, FehlendePhysiqueKacheln,
} from './fehlende-kacheln'
import { GoalsPhysiqueView, GoalsPosesView } from './tab-physique'
// G-513: Phase beginnen, beenden, Vorschlag beantworten.
import { PhaseBeginnen, PhaseBeenden, PhaseVorschlag, PhaseWechseln } from './phase-setzen'
// G-534/A7: die Phasenart fuer das Wechselraster.
import type { Phasenart } from '../../../lib/goals/phase-regeln'

/** C-418/3: die Quelle unter der Trennlinie. */
const QUELLE = 'theme-v1/module-goals-pro.jsx'
import { PhaseEcht } from './phase-echt'
import { PhysiqueEcht } from './physique-echt'
import { CompositionTab, type CompDaten } from './tab-composition'
import { KoerperMetriken, KoerperUmfaenge } from './tab-koerper'
import { ZielKarten } from './ziel-karten'
import type {
  AdaptiverTdee, Fotosession, Koerpermessung, Koerperzusammensetzung,
  Meilenstein, Phase, ProfilEingaben, Umfangssatz, ZielFortschritt,
  Zielphase,
} from '../../../lib/goals/lesen'
import type { Zielvorschlag, Zielwerte } from '../../../lib/profile/zielwerte-read'
// `[read]` **Nur der TYP** — `strategie-read.ts` zieht
// `createSessionClient` und damit `next/headers`; ein Wert-Import
// von hier aus beantwortete die Seite mit HTTP 500 (A-30, G-412).
import type { Strategie } from '../../../lib/goals/strategie-read'
import type { Rateneinheit } from '../../../lib/goals/zielrate-einheit'
import { StrategieWahl } from './strategie-wahl'
// G-544: die Zeitachse des Phase-Reiters.
import { PhasenZeitachse } from './phasen-zeitachse'
// `[cmd]` **G-553/A1: reine Funktionen, kein I/O** — sie duerfen aus
// einer `'use client'`-Datei kommen (A-30).
// `[cmd]` **G-555: die Kachel ist geteilt**, der Pfad liegt nicht
// mehr unter `goals/`.
import { LadefehlerKachel } from '../../../components/shell/ladefehler-kachel'

/** Die Marke an jeder Kachel. Ein Satz, damit er nicht driftet. */
export const ATTRAPPE =
  'Aus dem Entwurf uebernommen. Diese Kachel ist noch nicht an die vorhandenen '
  + 'Goals- und Koerperdaten angebunden - die Zahlen sind erfunden.'

/**
 * Eine Attrappenmarke nach E-68 — Quelle UND Grund.
 *
 * **Tom, 2026-09-07:** *,,was nicht anbindbar ist bleibt in der ui
 * als mockup deklariert."*
 *
 * `[cmd]` **Gemessen in G-355: 62 von 69 Vermerken nannten keine
 * Ursache.** `[read]` **Ein Vermerk, der nur *,,noch nicht"* sagt,
 * zwingt den naechsten Auftrag, von vorn zu messen.**
 *
 * `[read]` **Wo der Grund unbekannt ist, gehoert genau das hin** —
 * *,,unbekannt, nie untersucht"* ist ehrlicher als nichts.
 *
 * @param quelle  Die Mockup-Datei, aus der die Kachel stammt.
 * @param wartet  Worauf sie wartet — mit Punktnummer, wenn es eine gibt.
 */
export function attrappeAus(quelle: string, wartet: string): string {
  return `Attrappe — ${quelle} · wartet auf: ${wartet}`
}

// [cmd] module-goals.jsx:172-183, in dieser Reihenfolge.
//
// `[cmd]` Der Zaehler an „Goals" ist seit GO-16 echt — die Ziele der
// angemeldeten Nutzerin statt der fuenf erfundenen der Vorlage.
function tabs(zielZahl: number): TabItem[] {
  return [
  { id: 'goals', label: 'Goals', count: zielZahl },
  { id: 'phase', label: 'Phase engine' },
  { id: 'tdee', label: 'Adaptive TDEE' },
  { id: 'cross', label: 'Cross-module' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'metrics', label: 'Body metrics' },
  { id: 'measure', label: 'Measurements' },
  { id: 'comp', label: 'Composition' },
  { id: 'physique', label: 'Physique ratios' },
  { id: 'poses', label: 'Pose sessions' },
  ]
}

/**
 * Die echten Daten, die die Seite serverseitig geladen hat (GO-16).
 *
 * `[cmd]` Sie kommen als Requisiten herein, weil dieser Rahmen eine
 * Client-Komponente ist und `createSessionClient()` Cookies über
 * `next/headers` liest — das geht nur auf dem Server. Dasselbe Muster
 * wie `/v2/medical` und `/v2/settings`: laden in `page.tsx`,
 * durchreichen, hier nur anzeigen.
 */
export type EchteDaten = {
  /** Das ECHTE Heute, nicht `HEUTE_DER_VORLAGE`. Aus `lib/datum.ts`. */
  stichtag: string
  ziele: ZielFortschritt[]
  meilensteine: Meilenstein[]
  /**
   * `[cmd]` **G-564: alle am Stichtag geltenden Phasen**, nicht eine.
   *
   * `[cmd]` **`phase_am` verliert mit G-559 sein `LIMIT 1`** —
   * `data[0]` waere dann die zuletzt begonnene, nicht ,,die Phase".
   * `[read]` **Und seit G-538 gilt eine offene Phase JE ZIEL**, also
   * gibt es den Fall wirklich.
   */
  phasen: Phase[]
  navy: Koerperzusammensetzung | null
  tdee: AdaptiverTdee | null
  vorschlag: Zielvorschlag | null
  zielwerte: Zielwerte | null
  profil: ProfilEingaben | null
  alter: number | null
  messungen: Koerpermessung[]
  /** Wie viele Messungen NACH dem Stichtag liegen — sie fehlen bewusst. */
  zukunftsmessungen: number
  umfaenge: Umfangssatz[]
  /** `[cmd]` **G-421: `goals.progress_photos`, seit C-463.** */
  fotosessions: Fotosession[]
  /** `[cmd]` **G-541: `goals.goal_strategies`, 17 Zeilen, seit G-538.** */
  strategien: Strategie[]
  /**
   * `[cmd]` **G-541/A4:** Erfahrung aus `profiles.experience_level`,
   * Coach aus `coach.relationships` — beide gemessen, keine Attrappe.
   */
  strategieProfil: { experience: string | null; hasCoach: boolean }
  /**
   * `[cmd]` **G-544/A1: eine offene Phase JE ZIEL** — seit G-538
   * erlaubt `uq_goal_phases_one_open` mehrere. **`phase_am()`
   * kann sie nicht liefern** (`LIMIT 1` im Rumpf).
   */
  offenePhasen: Zielphase[]
  /**
   * `[cmd]` **G-565/A4: die gewaehlte Einheit** — aus
   * `user_display_preferences`, eine Einstellung des NUTZERS
   * und keine Spalte in `goal_phases` (E-83).
   */
  einheit: Rateneinheit
  ladefehler: string | null
}

// `[cmd]` **G-555: die Kachel stand hier und steht jetzt in
// `components/shell/ladefehler-kachel.tsx`** — Medical und Nutrition
// brauchen dieselbe. **Drei Abschriften waeren drei Orte, die
// driften.**

export function GoalsAnsicht({ echt }: { echt: EchteDaten }) {
  // G-117: Tab in der Adresse — Drop-in aus lib/tab-url.
  const [tab, setTab] = useTabParam('goals')
  const [modal, setModal] = React.useState<ModalZustand | null>(null)

  const comp: CompDaten = {
    navy: echt.navy,
    vorschlag: echt.vorschlag,
    zielwerte: echt.zielwerte,
    tdee: echt.tdee,
    profil: echt.profil,
    alter: echt.alter,
    juengsteMessung: echt.messungen.length ? echt.messungen[echt.messungen.length - 1] : null,
    stichtag: echt.stichtag,
    // `[cmd]` **G-568/A3: erst ab zwei nennt die Anzeige das Ziel.**
    // `[read]` **Die Zahl kommt aus `offenePhasen`** (die Tabelle),
    // nicht aus `phasen` — dieselbe Wahl wie in G-564: die Quelle,
    // die heute UND nach dem Einspielen stimmt.
    laufendePhasen: echt.offenePhasen.length,
    // `[read]` **Der Titel zum gerechneten Ziel**, wenn er in den
    // geladenen Zielen steht — sonst `null`, kein geratener Name.
    zielTitel: echt.vorschlag?.goal_id
      ? echt.ziele.find(g => g.goal_id === echt.vorschlag?.goal_id)?.title ?? null
      : null,
  }

  // `[cmd]` **G-513: laufend heisst `actual_end_date == null`.**
  // `phase_am` gibt auch eine beendete Phase zurueck, solange sie am
  // Stichtag noch galt — `PhaseEcht` zeigt sie deshalb mit der Pille
  // „abgeschlossen" (`phase-echt.tsx:119`). **Beenden und Vorschlag
  // gelten aber nur fuer eine, die wirklich laeuft.**
  // ══ G-564/A2: die Menge, und was sie fuer die Bedienung heisst ══
  //
  // `[cmd]` **`phase_am` liefert seit G-559 alle Zielphasen.**
  // `[read]` **Laufend heisst weiterhin `actual_end_date === null`**
  // — `phase_am` gibt auch eine beendete zurueck, solange sie am
  // Stichtag noch galt.
  // ══ G-564: die Zahl kommt aus der ungedeckelten Quelle ══════
  //
  // `[cmd]` **Am Bild gefunden, 2026-09-30:** der Kopf sagte
  // ,,2 Phasen laufen", und darunter standen ,,Phase beenden" und
  // ,,Phase wechseln" fuer EINE — **zwei Quellen, zwei Zahlen auf
  // demselben Schirm.**
  //
  // `[cmd]` **Der Grund:** `echt.phasen` kommt aus `phase_am`, das
  // live noch `LIMIT 1` traegt; `echt.offenePhasen` liest die Tabelle
  // direkt (G-544) und sieht beide.
  //
  // `[read]` **Also entscheidet die Tabelle, wie viele laufen** — sie
  // ist heute UND nach dem Einspielen richtig. **`echt.phasen` traegt
  // weiterhin die Anzeige je Phase**, und sobald `phase_am` beide
  // liefert, stimmen beide Wege ueberein.
  const laufendePhasen = echt.offenePhasen
  // `[read]` **Beenden und Vorschlag brauchen EINE bestimmte Phase.**
  // **Bei mehreren waere jede Wahl eine stille Entscheidung** —
  // deshalb nur, wenn es genau eine gibt; sonst sagt die Ansicht, dass
  // die Wahl fehlt.
  // `[read]` **Die Bedienkacheln brauchen die volle `Phase`** (mit
  // Uebergangsspalten und Zielrate) — die traegt `echt.phasen`.
  // **Nur wenn BEIDE Wege genau eine sehen**, ist die Wahl
  // eindeutig.
  const laufendePhase = laufendePhasen.length === 1
    ? echt.phasen.find(p => !p.actual_end_date) ?? null
    : null

  const kontext = React.useMemo(() => ({
    open: (m: ModalZustand) => setModal(m),
    close: () => setModal(null),
  }), [])

  return (
    <GoalsKontext.Provider value={kontext}>
      <div className="v2-module-header v2-module-hero-lite">
        <div className="v2-module-title-block">
          <div className="v2-module-title-row">
            <span className="v2-module-title">Goals &amp; Body</span>
            {/* `[cmd]` Echt seit GO-16: die Ziele der angemeldeten
                Nutzerin, nicht die fuenf der Vorlage. */}
            <Pill variant="acc">
              {`${echt.ziele.filter(g => g.status === 'active').length} active goals`}
            </Pill>
            {/* ══ G-544: die Kopfmarke zaehlt, statt EINE zu nennen ══
                `[cmd]` **Am Bild gefunden** (2026-09-30): bei zwei
                offenen Phasen stand hier *„Phase lean bulk"* — die
                Marke las `echt.phase` aus `phase_am()`, und deren
                Rumpf endet auf `LIMIT 1`.

                `[read]` **Eine von zwei zu nennen heisst, die andere
                zu verschweigen.** `[cmd]` **Seit G-538 ist eine
                offene Phase JE ZIEL erlaubt** — die Marke sagt jetzt,
                wie viele laufen, und nennt die Art nur, wenn es
                genau eine ist. */}
            {echt.offenePhasen.length > 0 && (
              <span data-kopf-phasen={echt.offenePhasen.length}>
                <Pill>
                  <span className="v2-dot" style={{ background: 'var(--pos)' }} />
                  {echt.offenePhasen.length === 1
                    ? `Phase ${(echt.offenePhasen[0].phase_type ?? '').replace(/_/g, ' ')}`
                    : `${echt.offenePhasen.length} Phasen laufen`}
                </Pill>
              </span>
            )}
          </div>
          <div className="v2-module-sub">
            {`Stand ${echt.stichtag} · ${echt.meilensteine.length} Meilensteine · `}
            {`${echt.messungen.length} Koerpermessungen`}
          </div>
        </div>

        {/* `[cmd]` **G-376: der Platz fuer den Tageswechsler.**
            Die Schale rendert per Portal hinein — der Kopf
            gehoert dem Modul, der Wechsler der Schale. */}
        <div className="v2-kopf-mitte" data-tageswechsler />
        <div className="v2-module-actions">
          <button type="button" className="v2-btn" onClick={() => kontext.open({ typ: 'logWeight' })}>
            <Icon name="plus" className="v2-ic v2-ic-sm" /> Log weight
          </button>
          <button type="button" className="v2-btn" onClick={() => kontext.open({ typ: 'logMeasure' })}>
            <Icon name="edit" className="v2-ic v2-ic-sm" /> Measurements
          </button>
          <button type="button" className="v2-btn v2-btn-primary" onClick={() => kontext.open({ typ: 'newGoal' })}>
            <Icon name="plus" className="v2-ic v2-ic-sm" /> New goal
          </button>
        </div>
      </div>

      <Tabs items={tabs(echt.ziele.length)} active={tab} onChange={setTab} />

      {/* `[cmd]` FUENF TABS SIND SEIT GO-16 ECHT. Der Ladefehler
          ersetzt sie, statt eine leere Kachel zu zeigen — sonst saehe
          „keine Ziele" wie ein Befund aus und waere doch nur ein
          fehlendes Cookie. */}
      {/* G-87: `phase` und `physique` stehen jetzt mit in der Liste —
          sonst sähe eine fehlende Phase nach „keine Phase" aus und
          wäre doch nur ein fehlendes Cookie. */}
      {/* ══ G-553/A2: der Mockup-Teil haengt nicht am Ladefehler ═══
          **Tom, 2026-09-29:** *„lass da zumindest das mockup wieder
          einblenden, wir haben keine seite ohne mockup."*

          `[cmd]` **Hier stand ein Entweder-oder ueber SIEBEN
          Reitern:** lag ein Ladefehler vor, ersetzte die
          Fehlerkachel den ganzen Reiter — **und mit ihm den
          Trennstrich und die Mockup-Referenz.**

          `[cmd]` **`cross`, `timeline` und `poses` standen schon
          ausserhalb** und haben ihren Entwurf behalten. **Die
          anderen sieben nicht** — das ist der Befund, den Tom
          gesehen hat.

          `[read]` **Der Entwurf braucht keine Daten.** Alle sechs
          `…Referenz`-Bauteile sind parameterlos (gemessen: nur
          `GoalsPosesReferenz` nimmt einen Wert, und der hat eine
          Vorgabe). **Sie an einen Ladefehler zu haengen, war eine
          Kopplung ohne Grund.**

          `[read]` **Dieselbe Klasse wie G-359/G-365:** dort
          verdraengte der ECHTE Teil den Entwurf, hier verdraengt ihn
          der FEHLER. **Beide Male war der Quelltext da und nicht
          erreichbar.** */}
      {echt.ladefehler
        && ['goals', 'metrics', 'measure', 'comp', 'tdee', 'phase', 'physique'].includes(tab) && (
        <LadefehlerKachel text={echt.ladefehler} modul="Goals" />
      )}
      {(() => {
        // `[read]` **Nur der ECHTE Teil faellt aus, nicht der
        // Reiter.** Ein Ladefehler heisst: die Daten fehlen — nicht,
        // dass es die Seite nicht gibt.
        const echtAus = echt.ladefehler !== null
        return (
        <>
          {tab === 'goals' && (
            <>
              {!echtAus && (
                <>
                  <ZielKarten
                    ziele={echt.ziele} meilensteine={echt.meilensteine} stichtag={echt.stichtag} />
                  <FehlendeZielKacheln />
                </>
              )}
              <GoalsGoalsReferenz />
            </>
          )}
          {tab === 'tdee' && (
            <>
              {!echtAus && <GoalsTDEEView tdee={echt.tdee} />}
              <GoalsTdeeReferenz />
            </>
          )}
          {tab === 'metrics' && (
            <>
              {!echtAus && (
                <>
                  <KoerperMetriken
                    messungen={echt.messungen} zukunft={echt.zukunftsmessungen}
                    stichtag={echt.stichtag} />
                  <FehlendeMetrikKacheln messungen={echt.messungen} />
                </>
              )}
              <GoalsMetricsReferenz />
            </>
          )}
          {tab === 'measure' && (
            <>
              {!echtAus && (
                <>
                  <KoerperUmfaenge saetze={echt.umfaenge} stichtag={echt.stichtag} />
                  <FehlendeMessKacheln sessions={echt.fotosessions} />
                </>
              )}
              <GoalsMeasureReferenz />
            </>
          )}
          {tab === 'comp' && (
            <>
              {!echtAus && <CompositionTab d={comp} />}
              <GoalsCompReferenz />
            </>
          )}

          {/* ══ G-359 / E-68: der Entwurf verdraengt nicht mehr ═══
              **Tom, 2026-09-07:** *„nun sehe ich dass tonnenweise
              zeugs einfach weg ist aus der ui."*

              `[cmd]` **Hier stand ein Entweder-oder:** lag eine echte
              Phase vor, ersetzte `PhaseEcht` den ganzen Entwurf —
              **und mit ihm die neun Phasenarten, der
              Jahreszyklus-Editor und die Vorlagenbibliothek.**

              `[cmd]` **Am Schirm gemessen (2026-09-06): 18 von 26
              genannten Elementen waren nicht erreichbar**, obwohl
              ihr Quelltext dasteht. **Nicht geloescht — verdraengt.**

              `[read]` **E-68: was nicht angebunden ist, bleibt
              sichtbar.** **Also beides untereinander:** oben, was
              gilt; darunter, was geplant ist, mit Marke. */}
          {tab === 'phase' && (
            <>
              {/* ══ G-564/A2: JE PHASE eine Kachel ═════════════
                  `[cmd]` **Hier stand `echt.phase`** — die erste aus
                  `phase_am`. `[read]` **Bei zwei offenen Phasen
                  zeigte das eine und verschwieg die andere**, und
                  welche, entschied die Sortierung. */}
              {!echtAus && echt.phasen.map(p => (
                <PhaseEcht key={p.phase_id} phase={p} stichtag={echt.stichtag}
                           gewichtKg={echt.profil?.body_weight_kg ?? null}
                           einheit={echt.einheit} />
              ))}
              {/* ══ G-513: der Knopf, der gefehlt hat ══════════════
                  `[cmd]` **Fuenf Funktionen in der Datenbank, null
                  Aufrufer** — `goal_phase_start`, `goal_phase_end`,
                  `phase_transition_recommendation`,
                  `phase_transition_respond`, `phase_am`.

                  `[cmd]` **`phase_am` liefert auch eine BEENDETE
                  Phase**, wenn sie am Stichtag noch galt
                  (`111_…sql:198`). `[read]` **Laufend heisst
                  `actual_end_date == null`** — wer nur auf
                  `echt.phase` prueft, sperrt den Start hinter einer
                  Phase, die laengst vorbei ist. */}
              {/* `[cmd]` **G-519/A5: das Gewicht aus dem Profil** —
                  es traegt die kcal-Anzeige neben der Rate. */}
              {/* `[cmd]` **G-534/A7: nur, wenn KEINE Phase laeuft.**
                  `[read]` **Vorher standen zwei Raster
                  uebereinander** — ein ausgegrautes ,,Phase
                  beginnen" und darunter ,,Phase wechseln" mit
                  derselben Auswahl. **Der Entwurf hat EINES.** */}
              {/* `[cmd]` **G-564: `laufendePhasen.length`, nicht
                  `!laufendePhase`.** `[read]` **Bei ZWEI laufenden
                  Phasen ist `laufendePhase` null** (die Wahl waere
                  willkuerlich) — und dann haette hier ,,Phase
                  beginnen" gestanden, obwohl zwei laufen. */}
              {!echtAus && laufendePhasen.length === 0 && (
                <PhaseBeginnen stichtag={echt.stichtag} aktiv={null}
                               gewichtKg={echt.profil?.body_weight_kg ?? null}
                               einheitVorgabe={echt.einheit} />
              )}
              {/* ══ G-564/A2: bei mehreren sagt die Ansicht das ════
                  `[read]` **Beenden und Wechseln gelten je EINER
                  Phase.** **Welche, kann die Ansicht nicht raten** —
                  also nennt sie die Zahl und verweist auf die
                  Zeitachse, wo jede Phase an ihrem Ziel steht. */}
              {!echtAus && laufendePhasen.length > 1 && (
                <Card title="Mehrere Phasen laufen"
                      sub={`${laufendePhasen.length} offene Phasen an `
                        + `${laufendePhasen.length} Zielen`}>
                  <div className="v2-dim" data-mehrere-phasen={laufendePhasen.length}
                       style={{ fontSize: 11.5, lineHeight: 1.55 }}>
                    Beenden und Wechseln gelten je einer Phase. Welche
                    gemeint ist, steht an ihrem Ziel — in der Zeitachse
                    unten.
                  </div>
                </Card>
              )}
              {!echtAus && laufendePhase && (
                <>
                  {/* `[cmd]` **G-534/A7: das Raster mit Vorschau** —
                      die Geste des Entwurfs
                      (`module-goals-pro.jsx:262-429`). `[read]` **Der
                      Wechsel fuehrt zum Beenden**, weil
                      `goal_phase_start` abweist, solange eine Phase
                      laeuft. */}
                  <PhaseWechseln
                    laufend={laufendePhase.phase_type as Phasenart | null}
                    onBeenden={() => {
                      document.querySelector<HTMLButtonElement>(
                        '[data-phase-beenden-oeffnen]')?.click()
                    }} />
                  <PhaseBeenden phase={laufendePhase} stichtag={echt.stichtag} />
                  {/* `[cmd]` **Der Vorschlag kommt aus der SPALTE,
                      nicht aus dem Funktionsaufruf.**
                      `phase_transition_recommendation` macht ein
                      `UPDATE` (`422_…sql:50`) — **eine Leseseite darf
                      nicht schreiben.** `[read]` **Die Funktion
                      hinterlegt ihr Ergebnis in `recommended_next`
                      und `transition_reason`; genau die zeigt die
                      Kachel.** */}
                  <PhaseVorschlag phase={laufendePhase}
                                  vorschlag={{
                                    recommended_next: laufendePhase.recommended_next,
                                    transition_reason: laufendePhase.transition_reason,
                                  }} />
                </>
              )}
              {/* `[cmd]` G-365: die sechs Mockup-Kacheln, die oben
                  fehlen — OBERHALB der Linie, weil sie zum Soll des
                  Reiters gehoeren. Tom, 2026-09-07: „oben wird alles
                  angezeigt das angebunden ist plus attrappen aus dem
                  mockup welche oben noch fehlen". */}
              {/* ══ G-541: der Strategiekatalog ═══════════════════
                  `[cmd]` **`goals.goal_strategies`, 17 Zeilen, seit
                  G-538** — und damit OBERHALB der Linie: die Karten
                  lesen eine Tabelle, nicht den Entwurf.

                  `[cmd]` **In G-534 meldete ich zehn Elemente des
                  Vorschaupanels ohne Quelle.** `[read]` **Alle zehn
                  haben jetzt eine Spalte** — was die einzelne ZEILE
                  nicht fuehrt, ist ein Strich mit Grund (A2), keine
                  Attrappe: die Quelle steht, der Wert fehlt. */}
              {/* ══ G-544/A1: der Reiter zeigt ZIELE ═══════════════
                  `[cmd]` **Er zeigte neun Phasentypen und null
                  Ziele** — er konnte nicht terminieren, weil er
                  nicht wusste, WAS.

                  `[cmd]` **Seit G-538 erlaubt
                  `uq_goal_phases_one_open` eine offene Phase JE
                  ZIEL** — deshalb `ladeOffenePhasen` und nicht
                  `phase_am()`, deren Rumpf auf `LIMIT 1` endet. */}
              {/* `[read]` **Der angepasste TDEE, sonst der
                  gerechnete** — `adaptive_tdee_kcal` ist null,
                  solange zu wenige Zufuhrtage vorliegen (G-539,
                  `cycling`-Reiter). */}
              {!echtAus && (
                <PhasenZeitachse
                  ziele={echt.ziele} phasen={echt.offenePhasen}
                  strategien={echt.strategien} heute={echt.stichtag}
                  tdee={echt.tdee?.adaptive_tdee_kcal
                    ?? echt.tdee?.formula_tdee_kcal ?? null}
                  gewichtKg={echt.profil?.body_weight_kg ?? null}
                  einheit={echt.einheit}
                  onNeuesZiel={() => kontext.open({ typ: 'newGoal' })} />
              )}
              {!echtAus && (
                <StrategieWahl strategien={echt.strategien}
                               profil={echt.strategieProfil} />
              )}
              <FehlendePhaseKacheln />
              {/* `[cmd]` G-365: die Linie stand unter `echt.phase &&`.
                  Sabotageprobe 2026-09-07 — `phase` auf `null`: die
                  Linie verschwand, und `GoalsPhaseView` stand
                  ununterscheidbar da wie eine echte Ansicht.

                  `[read]` Die Linie beschriftet, was DARUNTER steht,
                  und das steht unbedingt. */}
              <ReferenzTrenner reiter="Phase engine" quelle={QUELLE} />
              <GoalsPhaseView />
            </>
          )}

          {/* G-87: die Verhaeltnisse aus `goals.body_circumferences`.
              **Die Einstufungen bleiben im Entwurf** — „golden target
              1.618", V-Taper und Steve Reeves haben keine Quelle
              ausserhalb der Entwurfs-Begleitdateien. */}
          {/* `[cmd]` **G-359: dieselbe Verdraengung wie beim
              Phasenreiter** — `dev@lumeos.app` hat 54 Umfangszeilen,
              **also lief immer der echte Zweig und der Entwurf war
              nie zu sehen.** */}
          {tab === 'physique' && (
            <>
              {!echtAus && echt.umfaenge.length > 0
                && <PhysiqueEcht saetze={echt.umfaenge} navy={echt.navy} stichtag={echt.stichtag} profil={echt.profil} />}
              {/* `[cmd]` **G-512: der FFMI kommt aus derselben Quelle
                  wie im Composition-Reiter** — `navy.ffmi`, sonst der
                  Wert der juengsten Messung. Vorher stand 22,4 fest im
                  JSX, gemessen sind 21,81. */}
              <FehlendePhysiqueKacheln
                ffmi={echt.navy?.ffmi
                  ?? (echt.messungen.length
                    ? echt.messungen[echt.messungen.length - 1].ffmi ?? null
                    : null)} />
              <ReferenzTrenner reiter="Physique" quelle={QUELLE} />
              <GoalsPhysiqueView />
            </>
          )}
        </>
        )
      })()}

      {tab === 'cross' && (
        <>
          <GoalsCrossModuleView />
          <GoalsCrossReferenz />
        </>
      )}
      {/* G-79: echte Zeitachse aus Zielen, Phasen und
          Meilensteinen. Der Entwurf bleibt als Rueckfall, wenn
          nichts mit Datum vorliegt. */}
      {/* `[cmd]` **G-359: die dritte Verdraengungsstelle.**
          `dev@lumeos.app` hat 11 Ziele und 13 Meilensteine —
          **der Entwurf lief nie.** */}
      {tab === 'timeline' && (
        <>
          {(echt.ziele.length + echt.meilensteine.length) > 0
            && (
              <ZeitachseTab ziele={echt.ziele} phasen={echt.phasen}
                            meilensteine={echt.meilensteine} stichtag={echt.stichtag} />
            )}
          <ReferenzTrenner reiter="Timeline" quelle={QUELLE} />
          <TimelineTab />
        </>
      )}
      {/* `[cmd]` G-365: die Referenz haengt IN `GoalsPosesView` —
          der Posensatz ist Zustand der Komponente und steht nicht in
          der Adresse. Wer sie hier setzt, zeigt unten immer
          `mandatory`, egal was oben gewaehlt ist. */}
      {tab === 'poses' && <GoalsPosesView />}

      {/* `[cmd]` **G-554/A1: der Katalog geht ins Anlegen-Modal** —
          dort erscheint die Strategiewahl, aber nur bei
          `body_composition`. */}
      <GoalsModale modal={modal} onClose={kontext.close}
                   strategien={echt.strategien} />
    </GoalsKontext.Provider>
  )
}

// `[cmd]` **HIER STANDEN VIER TABS DER VORLAGE.** Seit GO-16 tragen
// sie echte Daten und liegen in eigenen Dateien — die Trennung ist an
// der Datei ablesbar, nicht nur am Kommentar:
//
//   Goals        -> `ziel-karten.tsx`   (user_goals + goal_progress_at,
//                                        goal_milestones + _status)
//   Body metrics -> `tab-koerper.tsx`   (body_measurements, 43 Zeilen)
//   Measurements -> `tab-koerper.tsx`   (body_circumferences, 7 Saetze)
//   Composition  -> `tab-composition.tsx` (body_composition_navy,
//                                        berechne_zielwerte, profiles)
//
// `[read]` Dieselbe Regel wie bei Medical (G-60): *„Was angebunden ist,
// verliert die Marke."* Die Attrappenfassungen sind geloescht, nicht
// auskommentiert — toter Code, der aussieht wie eine Alternative, ist
// die naechste falsche Faehrte.

// ── TIMELINE TAB ────────────────────────────────────────────────
// [cmd] module-goals.jsx:332-407.
function TimelineTab() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const all = [
    ...ACTIVE_GOALS.map(g => ({ ...g, status: 'active' as const })),
    ...COMPLETED_GOALS.map(g => ({ ...g, status: 'done' as const })),
  ]
  return (
    <Card title="Goal timeline · 2026"
          sub={`${ACTIVE_GOALS.length} active · ${COMPLETED_GOALS.length} closed`}
          attrappe={ATTRAPPE}>
      <div className="v2-goals-gantt" style={{ marginBottom: 8 }}>
        <div />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2,
          fontSize: 9.5, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)',
        }}>
          {months.map(m => <span key={m} style={{ textAlign: 'left' }}>{m}</span>)}
        </div>
      </div>
      <div className="v2-col-gap" style={{ gap: 6 }}>
        {all.map(g => <GanttRow key={g.id} g={g} />)}
      </div>
      <div className="v2-divider" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div className="v2-dim" style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>Today · May 16, 2026</div>
        <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--fg-muted)', flexWrap: 'wrap' }}>
          <span className="v2-row-gap"><span style={{ width: 10, height: 10, background: 'var(--acc-goals)', borderRadius: 2, opacity: 0.5 }} />elapsed</span>
          <span className="v2-row-gap"><span style={{ width: 10, height: 10, background: 'var(--acc-goals)', borderRadius: 2 }} />remaining</span>
          <span className="v2-row-gap"><span style={{ width: 10, height: 10, background: 'var(--pos)', borderRadius: 2 }} />completed</span>
        </div>
      </div>
    </Card>
  )
}

type GanttZiel = {
  id: string; title: string; icon: string; color: string; status: 'active' | 'done'
  started?: string; deadline?: string; completedOn?: string
}

// [cmd] module-goals.jsx:360-407.
function GanttRow({ g }: { g: GanttZiel }) {
  const monthFraction = (dateStr: string) => {
    const d = new Date(`${dateStr}T12:00:00`)
    return d.getMonth() + d.getDate() / 30
  }
  const start = monthFraction(g.started || g.completedOn || '2026-01-01')
  const end = monthFraction(g.deadline || g.completedOn || '2026-12-31')
  const today = monthFraction('2026-05-16')
  const left = (start / 12) * 100
  const right = (end / 12) * 100
  const width = right - left
  const todayInRange = today > start && today < end
  return (
    <div className="v2-goals-gantt">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <Icon name={g.icon as never} className="v2-ic" style={{ color: g.color, flexShrink: 0 }} />
        <span style={{ fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.title}</span>
      </div>
      <div style={{ position: 'relative', height: 22, background: 'var(--surface-2)', borderRadius: 4 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ position: 'absolute', left: `${(i / 12) * 100}%`, top: 0, bottom: 0, width: 1, background: 'var(--border)' }} />
        ))}
        {g.status === 'done' ? (
          <div style={{ position: 'absolute', top: 3, left: `${left}%`, height: 16, width: `${width}%`, background: 'var(--pos)', borderRadius: 3, opacity: 0.7 }}>
            <div style={{ position: 'absolute', right: -2, top: -1, bottom: -1, width: 4, background: 'var(--pos)' }} />
          </div>
        ) : (
          <>
            {todayInRange && (
              <>
                <div style={{ position: 'absolute', top: 3, left: `${left}%`, height: 16, width: `${((today - start) / (end - start)) * width}%`, background: g.color, borderRadius: '3px 0 0 3px', opacity: 0.45 }} />
                <div style={{ position: 'absolute', top: 3, left: `${left + ((today - start) / (end - start)) * width}%`, height: 16, width: `${((end - today) / (end - start)) * width}%`, background: g.color, borderRadius: '0 3px 3px 0' }} />
              </>
            )}
            {!todayInRange && (
              <div style={{ position: 'absolute', top: 3, left: `${left}%`, height: 16, width: `${width}%`, background: g.color, borderRadius: 3 }} />
            )}
          </>
        )}
        <div style={{ position: 'absolute', left: `${(today / 12) * 100}%`, top: -3, bottom: -3, width: 1, background: 'var(--fg)' }} />
      </div>
    </div>
  )
}
