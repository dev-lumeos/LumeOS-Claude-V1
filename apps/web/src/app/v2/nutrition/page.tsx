// Tagebuch der Oberflaeche v2 (G-03).
//
// Vorlage: module-nutrition.jsx.
//
// DIESE SEITE LIEST. [read] Der Auftrag: "Keine Schreibpfade ins
// Tagebuch. meals und meal_items haben 0 Zeilen; das Erfassen ist C-03
// und ein eigener Auftrag."
//
// Serverkomponente: die Tagessumme und die Referenzbewertung kommen aus
// der geteilten Datenschicht, beide mit der Identitaet der Sitzung
// (security_invoker bzw. SECURITY INVOKER). Kein Service-Client.
import type { Metadata } from 'next'

import { getDailySummary } from '../../../lib/nutrition/diary-summary-read'
import {
  getReferenceAssessment, getLueckenZahl,
} from '../../../lib/nutrition/reference-assessment-read'
import type { DailySummaryRow } from '../../../lib/nutrition/diary-summary'
import type { ReferenceAssessmentRow } from '../../../lib/nutrition/reference-assessment-read'
import { getZielwerteAm, getZielwertVorschlag } from '../../../lib/profile/zielwerte-read'
import type { Zielvorschlag, Zielwerte } from '../../../lib/profile/zielwerte-read'
import { getHydrationDay } from '../../../lib/nutrition/hydration-day-read'
import type { HydrationDay } from '../../../lib/nutrition/hydration-day-read'
import { getLocalFoodSearch } from '../../../lib/nutrition/food-search'
import type { NutritionFoodSearchPayload } from '../../../lib/nutrition/food-search'
import { createSessionClient } from '@lumeos/shared/session'
import { isAdminFromAppMetadata } from '@lumeos/shared/auth/role'

import {
  angemeldeteNutzerin, ladeKategorien, ladePresets, ladeTags, ladeVorlieben,
  leererStand,
} from '../../../lib/nutrition/vorlieben-lesen'
import type { VorliebenDaten } from './tab-vorlieben'
// G-97: der Wochenplan aus den C-150-Tabellen.
import {
  ladePlan, ladePlanLogs, ladeCoachFreigabe, ladeEinkaufslistenZahl,
  ladeTagesEintraege,
  type PlanDaten,
} from '../../../lib/nutrition/plan-lesen'
import type { TagesEintrag } from './plan-eintraege'
import type { LogZeile as PlanLogZeile } from '../../../lib/nutrition/plan-lage'
// G-101: die zwei Mikronaehrstoff-Kacheln des Diary.
import { ladeMikro, type MikroStand } from '../../../lib/nutrition/mikro-read'
// G-101/C-54: die Naehrstoffordnung; seit G-121 mit Zeitfenster
// (C-157). `[cmd]` G-140: **der Baum kommt aus `parent_code`**
// (C-161) — hier stand *„aus display_tier"*, und das ist keine
// Baumtiefe.
//
// `[cmd]` **BERICHTIGT IN G-285 am 2026-08-31.** Hier stand weiter,
// `display_tier` sei *„das Abo-Gate"*. **Das ist es nicht** — G-235
// hat es am 2026-08-31 gemessen:
//
//     Stufe 1   31 Codes   ALC, CA, CHO, CHORL, ENERCC
//     Stufe 2   47 Codes   AAE9, ASH, BIOT, CARTB, CHOCAL
//     Stufe 3   60 Codes   ACEAC, ALA, ARG, ASP, CAROTPAXB
//
// `[read]` **Stufe 1 sind Alltagswerte, Stufe 3 Aminosaeuren und
// Carotinoide** — das ist ANZEIGETIEFE. `[cmd]` **Ein Abo-Tier gibt
// es im Schema `nutrition` nicht** (G-235: die Suche nach
// `%micros_tier%`, `%subscription%`, `%abo%`, `tier` findet dort
// nichts).
//
// `[read]` **Dreimal geklaert, dreimal hier stehengeblieben** —
// G-140, G-239, G-235. **Deshalb sichert ein Waechter diese Zeile
// (G-285/G-173).**
import { ladeOrdnung, type NaehrstoffOrdnung } from '../../../lib/nutrition/naehrstoff-ordnung'
import { fensterOderTag } from '../../../lib/nutrition/naehrstoff-anzeige'
// G-101: Kalorienbilanz und Makroschnitt fuer die Insights.
import { ladeInsights, type InsightsStand } from '../../../lib/nutrition/insights-read'
// G-258/E-29: ueber die Funktion, nicht direkt in `coach.*`.
import {
  ladeOffeneAktionen, type OffeneAktionenStand,
} from '../../../lib/coach/offene-aktionen'
// G-262: die naechste geplante Trainingseinheit (Modulgrenze
// gemessen, Begruendung in der Datei).
import {
  ladeNaechsteSitzung, type SitzungStand,
} from '../../../lib/training/naechste-sitzung'

import { datumOderHeute, heute } from '../../../lib/datum'
import { TagebuchAnsicht } from './ansicht'

export const metadata: Metadata = {
  title: 'Tagebuch · LumeOS',
}

export const dynamic = 'force-dynamic'

export default async function V2NutritionPage({
  searchParams,
}: {
  searchParams?: { datum?: string; tab?: string; fenster?: string }
}) {
  const datum = datumOderHeute(searchParams?.datum)

  // G-14: die Rolle kommt aus `app_metadata` — NICHT aus
  // `user_metadata`. `[read]` Letzteres kann die Nutzerin selbst
  // setzen (belegt am 2026-08-06); ersteres nicht. Die Pruefung ist
  // dieselbe wie im Admin-Bereich, damit es nur eine Regel gibt.
  let istAdmin = false
  try {
    const supabase = createSessionClient()
    const { data: { user } } = await supabase.auth.getUser()
    istAdmin = isAdminFromAppMetadata(
      user?.app_metadata as Record<string, unknown> | null | undefined)
  } catch {
    istAdmin = false
  }

  // Der aktive Tab steht in der Adresse, damit die Tagesdaten
  // serverseitig geladen bleiben (Begruendung in tableiste.tsx).
  // Unbekannte Werte fallen auf `diary` zurueck statt eine leere Seite
  // zu zeigen.
  const ERLAUBT = ['diary', 'insights', 'nutrients', 'foods', 'plans', 'prefs', 'planner']
  const tab = ERLAUBT.includes(searchParams?.tab ?? '') ? searchParams!.tab! : 'diary'

  let summe: DailySummaryRow | null = null
  let bewertung: ReferenceAssessmentRow[] = []
  let fehler: string | null = null
  let bewertungFehler: string | null = null

  // Getrennt abgefangen: die Tagessumme und die Referenzbewertung sind
  // zwei Aussagen. Faellt die zweite aus, ist die erste trotzdem
  // gueltig — sie beide hinter einem Fehler verschwinden zu lassen
  // waere mehr Verlust als noetig.
  try {
    summe = await getDailySummary(datum)
  } catch (e) {
    fehler = e instanceof Error ? e.message : String(e)
  }

  try {
    bewertung = await getReferenceAssessment(datum)
  } catch (e) {
    bewertungFehler = e instanceof Error ? e.message : String(e)
  }

  // G-248: die Gesamtzahl der Naehrstoffe mit Luecken. `[read]`
  // Getrennt abgefangen — ohne sie bleibt das Tagebuch nutzbar,
  // nur der Sammelhinweis fehlt.
  let luecken: { unvollstaendig: number; gesamt: number } | null = null
  if (tab === 'diary') {
    try {
      luecken = await getLueckenZahl(datum)
    } catch {
      luecken = null
    }
  }

  // G-247/E-24: die Tageswerte fuer Zeitraum und Verlauf. `[read]`
  // **Getrennt abgefangen** — ohne sie bleibt der Tagesmodus
  // vollstaendig nutzbar, nur 7/30/90 zeigen dann nichts.
  // `[cmd]` 90 Tage, alle Naehrstoffe: 222 ms (explain analyze).

  // GO-03/GO-04: Was gilt, und was gelten koennte. Getrennt gelesen —
  // ein Fehler der einen Frage macht die andere nicht ungueltig.
  let ziele: Zielwerte | null = null
  let vorschlag: Zielvorschlag | null = null
  let zielFehler: string | null = null
  try {
    ziele = await getZielwerteAm(datum)
    if (!ziele) vorschlag = await getZielwertVorschlag(datum)
  } catch (e) {
    // [cmd] Solange `goals` nicht in supabase/config.toml als
    // exponiertes Schema steht, antwortet PostgREST mit PGRST106
    // ("Invalid schema: goals"). Die Zeile ist ergaenzt, greift aber
    // erst nach einem Neustart des lokalen Stacks — siehe Bericht.
    // Bis dahin bleibt `vorschlag` null, und die Seite zeigt denselben
    // Hinweis wie ohne Profil. Kein eigener Fehlerkasten: die Nutzerin
    // kann daran nichts aendern.
    zielFehler = e instanceof Error ? e.message : String(e)
  }

  // Der Wasserhaushalt. Eigener try: faellt er aus, bleibt der Rest
  // des Tagebuchs gueltig.
  let wasser: HydrationDay | null = null
  try {
    wasser = await getHydrationDay(datum)
  } catch {
    wasser = null
  }

  // G-66: die erste Trefferseite des Food-DB-Tabs. Nur laden, wenn der
  // Tab auch gezeigt wird — 7.140 Lebensmittel sind kein Beiwerk fuer
  // das Tagebuch. `[cmd]` Die RPC braucht ohne Filter rund 250 ms.
  let foodsStart: NutritionFoodSearchPayload | null = null
  /** G-154: fuer den Hinweis im Foods-Tab. */
  let unvertraeglichkeiten: string[] = []
  if (tab === 'foods') {
    try {
      // G-154: auch die erste Seite kommt mit Preferences. `[read]`
      // Ohne das zeigte der erste Anblick den ganzen Katalog und der
      // Nachladevorgang schnitte ihn dann zusammen — ein Sprung, der
      // aussieht wie ein Fehler.
      foodsStart = await getLocalFoodSearch('', undefined, {
        limit: 50, applyPreferences: true,
      })
      // G-154: nur die Unvertraeglichkeiten, nicht der ganze
      // Vorliebenstand — der Foods-Tab braucht sie fuer einen
      // Hinweissatz, nicht fuer die Bearbeitung.
      unvertraeglichkeiten = (await ladeVorlieben(await angemeldeteNutzerin()))
        .grund.intolerances
    } catch {
      // Faellt sie aus, laedt der Tab im Browser nach und zeigt dort
      // seinen Fehler — die uebrige Seite bleibt gueltig.
      foodsStart = null
    }
  }

  // G-65: die Vorlieben. Nur laden, wenn der Tab gezeigt wird — wie
  // beim Food-DB-Tab darueber. Drei Abfragen, ein `try`: der
  // Kategorien- und Merkmalskatalog sind ohne den Stand nutzlos, und
  // umgekehrt.
  let vorlieben: VorliebenDaten | null = null
  if (tab === 'prefs') {
    try {
      const userId = await angemeldeteNutzerin()
      const [stand, kategorien, tags, presets] = await Promise.all([
        ladeVorlieben(userId),
        ladeKategorien(),
        ladeTags(),
        ladePresets(),
      ])
      vorlieben = { stand, kategorien, tags, presets, ladefehler: null }
    } catch (e) {
      // Ohne Sitzung ist der Leerzustand richtig, kein Fehlerkasten:
      // „noch nichts eingestellt" ist ein gueltiger Zustand.
      vorlieben = {
        stand: leererStand(), kategorien: [], tags: [], presets: [],
        ladefehler: e instanceof Error ? e.message : String(e),
      }
    }
  }

  // G-97: der Wochenplan. Nur laden, wenn der Tab gezeigt wird — wie
  // bei Food-DB und Vorlieben darueber. `[read]` Faellt er aus, bleibt
  // `plan` null und der Entwurf steht mit seiner Marke da; die uebrige
  // Seite ist davon nicht betroffen.
  let plan: PlanDaten | null = null
  // G-161: auch `plans` liest jetzt echt. `[cmd]` Derselbe Lesepfad wie
  // beim Planner (G-97) — vier Ebenen in einem Aufruf, nicht nachgebaut.
  // G-267 ff.: die Ausfuehrung, das Bearbeitungsrecht und die
  // Einkaufslisten. `[read]` **Gleichzeitig, nicht nacheinander** —
  // ein `await` je Aufruf kostet je Durchlauf voll (G-252).
  let planLogs: PlanLogZeile[] = []
  let coachFreigabe = false
  let einkaufslisten = 0
  let tagesEintraege: TagesEintrag[] = []
  if (tab === 'planner' || tab === 'plans') {
    try {
      const [p, l, f, e, te] = await Promise.all([
        ladePlan(),
        ladePlanLogs(datum, 7).catch(() => []),
        ladeCoachFreigabe().catch(() => false),
        ladeEinkaufslistenZahl().catch(() => 0),
        // G-274: die Eintraege des Tages mit ihrem Zustand.
        ladeTagesEintraege(datum).catch(() => []),
      ])
      plan = p
      planLogs = l
      coachFreigabe = f
      einkaufslisten = e
      tagesEintraege = te
    } catch {
      plan = null
    }
  }

  // G-101: Mikronaehrstoffe — nur fuer das Tagebuch, wie Plan und
  // Vorlieben auch. Faellt es aus, bleibt der Entwurf mit Marke stehen.
  let mikro: MikroStand | null = null
  if (tab === 'diary') {
    try {
      mikro = await ladeMikro(datum)
    } catch {
      mikro = null
    }
  }

  // G-101/C-54: die Naehrstoffordnung. Nur fuer den Nutrients-Tab.
  // G-121: das Zeitfenster steht in der Adresse (`?fenster=7`), damit
  // die Werte serverseitig geladen werden und der Zustand messbar
  // bleibt. G-122: OHNE Parameter gilt die gespeicherte Ansicht
  // (`user_display_preferences`), erst danach der Tag — die Adresse
  // gewinnt, weil ein geteilter Link zeigen soll, was er sagt.
  let ordnung: NaehrstoffOrdnung | null = null
  if (tab === 'nutrients') {
    try {
      ordnung = await ladeOrdnung(
        datum,
        searchParams?.fenster === undefined ? null : fensterOderTag(searchParams.fenster),
      )
    } catch {
      ordnung = null
    }
  }

  // G-258/E-29: die offenen Coach-Aktionen dieses Moduls. Nur fuer das
  // Tagebuch — dort steht die Kachel.
  //
  // `[read]` **Ueber `coach.offene_aktionen('nutrition')`, nicht ueber
  // einen Lesezugriff auf `coach.pending_actions`.** Die Funktion ist
  // `SECURITY DEFINER` und nimmt keine Kennung: **der Klient kommt aus
  // `auth.uid()`.** Damit gibt es hier nichts zu pruefen und nichts
  // nachzubauen — das ist der Sinn von E-29.
  //
  // `[read]` **Faellt sie aus, bleibt der Entwurf mit Marke stehen** —
  // dasselbe Verhalten wie bei Mikro und Insights.
  let offeneAktionen: OffeneAktionenStand | null = null
  if (tab === 'diary') {
    try {
      offeneAktionen = await ladeOffeneAktionen('nutrition')
    } catch {
      offeneAktionen = null
    }
  }

  // G-262: die naechste geplante Trainingseinheit. Nur fuers Tagebuch.
  //
  //  **Ab HEUTE, nicht ab dem angezeigten Datum.** Wer im
  // Tagebuch zurueckblaettert, will nicht wissen, was am 20.08. das
  // naechste Training war — die Kachel sagt, wann als naechstes
  // trainiert wird.
  let sitzung: SitzungStand | null = null
  if (tab === 'diary') {
    try {
      sitzung = await ladeNaechsteSitzung(heute())
    } catch {
      sitzung = null
    }
  }

  // G-101: die zwei Insights-Kacheln. Nur fuer den Insights-Tab.
  let einsichten: InsightsStand | null = null
  if (tab === 'insights') {
    try {
      // `[read]` **30 Tage, nicht 14.** Die Heatmap braucht 28, und
      // der Verlauf schneidet 7/14/30 im Browser aus derselben Reihe
      // — ein Fensterwechsel kostet so keinen Serverlauf.
      einsichten = await ladeInsights(datum, 30)
    } catch {
      einsichten = null
    }
  }

  return (
    <TagebuchAnsicht
      datum={datum}
      tab={tab}
      plan={plan}
      planLogs={planLogs}
      coachFreigabe={coachFreigabe}
      einkaufslisten={einkaufslisten}
      tagesEintraege={tagesEintraege}
      mikro={mikro}
      ordnung={ordnung}
      einsichten={einsichten}
      offeneAktionen={offeneAktionen}
      sitzung={sitzung}
      istAdmin={istAdmin}
      vorlieben={vorlieben}
      unvertraeglichkeiten={unvertraeglichkeiten}
      wasser={wasser}
      summe={summe}
      bewertung={bewertung}
      lueckenGesamt={luecken}
      fehler={fehler}
      bewertungFehler={bewertungFehler}
      ziele={ziele}
      vorschlag={vorschlag}
      zielFehler={zielFehler}
      foodsStart={foodsStart}
    />
  )
}
