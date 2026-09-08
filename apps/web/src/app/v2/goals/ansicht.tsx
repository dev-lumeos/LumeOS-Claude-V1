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
// **SEIT GO-16 SIND FUENF TABS ECHT** und liegen in eigenen Dateien:
//   Goals        `ziel-karten.tsx`     user_goals · goal_progress_at
//                                      goal_milestones · _status
//   Adaptive TDEE `tdee-kopf.tsx`      adaptive_tdee (nur die Kopfkachel)
//   Body metrics `tab-koerper.tsx`     body_measurements
//   Measurements `tab-koerper.tsx`     body_circumferences
//   Composition  `tab-composition.tsx` body_composition_navy ·
//                                      berechne_zielwerte · profiles
//
// `[cmd]` Was hier bleibt, ist Attrappe: Timeline, Phase engine,
// Cross-module, Physique ratios, Pose sessions — und der groessere
// Teil des Adaptive-TDEE-Tabs. Gruende je Kachel in
// docs/ssot/116-goals-anbindung.md.
import * as React from 'react'
import { useTabParam } from '../../../lib/tab-url'
import { Card, Pill, Icon, Tabs, type TabItem } from '@lumeos/ui'

// `[cmd]` Von den neun Importen aus `daten.ts` sind seit GO-16 zwei
// uebrig: der Timeline-Tab braucht sie, weil er weiter Attrappe ist.
// Die uebrigen sieben hingen an den vier geloeschten Tabs.
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

/** C-418/3: die Quelle unter der Trennlinie. */
const QUELLE = 'theme-v1/module-goals-pro.jsx'
import { PhaseEcht } from './phase-echt'
import { PhysiqueEcht } from './physique-echt'
import { CompositionTab, type CompDaten } from './tab-composition'
import { KoerperMetriken, KoerperUmfaenge } from './tab-koerper'
import { ZielKarten } from './ziel-karten'
import type {
  AdaptiverTdee, Koerpermessung, Koerperzusammensetzung, Meilenstein,
  Phase, ProfilEingaben, Umfangssatz, ZielFortschritt,
} from '../../../lib/goals/lesen'
import type { Zielvorschlag, Zielwerte } from '../../../lib/profile/zielwerte-read'

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
  phase: Phase | null
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
  ladefehler: string | null
}

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
  }

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
            {echt.phase?.phase_type && (
              <Pill>
                <span className="v2-dot" style={{ background: 'var(--pos)' }} />
                {`Phase ${echt.phase.phase_type.replace(/_/g, ' ')}`}
              </Pill>
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
      {echt.ladefehler
        && ['goals', 'metrics', 'measure', 'comp', 'tdee', 'phase', 'physique'].includes(tab) ? (
        <Card title="Goals" sub="konnten nicht geladen werden">
          <div className="v2-muted" style={{ fontSize: 12, lineHeight: 1.55 }}>
            {echt.ladefehler}
          </div>
        </Card>
      ) : (
        <>
          {tab === 'goals' && (
            <>
              <ZielKarten
                ziele={echt.ziele} meilensteine={echt.meilensteine} stichtag={echt.stichtag} />
              <FehlendeZielKacheln />
              <GoalsGoalsReferenz />
            </>
          )}
          {tab === 'tdee' && (
            <>
              <GoalsTDEEView tdee={echt.tdee} />
              <GoalsTdeeReferenz />
            </>
          )}
          {tab === 'metrics' && (
            <>
              <KoerperMetriken
                messungen={echt.messungen} zukunft={echt.zukunftsmessungen}
                stichtag={echt.stichtag} />
              <FehlendeMetrikKacheln />
              <GoalsMetricsReferenz />
            </>
          )}
          {tab === 'measure' && (
            <>
              <KoerperUmfaenge saetze={echt.umfaenge} stichtag={echt.stichtag} />
              <FehlendeMessKacheln />
              <GoalsMeasureReferenz />
            </>
          )}
          {tab === 'comp' && (
            <>
              <CompositionTab d={comp} />
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
              {echt.phase
                && <PhaseEcht phase={echt.phase} stichtag={echt.stichtag} />}
              {/* `[cmd]` G-365: die sechs Mockup-Kacheln, die oben
                  fehlen — OBERHALB der Linie, weil sie zum Soll des
                  Reiters gehoeren. Tom, 2026-09-07: „oben wird alles
                  angezeigt das angebunden ist plus attrappen aus dem
                  mockup welche oben noch fehlen". */}
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
              {echt.umfaenge.length > 0
                && <PhysiqueEcht saetze={echt.umfaenge} navy={echt.navy} stichtag={echt.stichtag} profil={echt.profil} />}
              <FehlendePhysiqueKacheln />
              <ReferenzTrenner reiter="Physique" quelle={QUELLE} />
              <GoalsPhysiqueView />
            </>
          )}
        </>
      )}

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
              <ZeitachseTab ziele={echt.ziele} phase={echt.phase}
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

      <GoalsModale modal={modal} onClose={kontext.close} />
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
