// Zaehlt die Vollstaendigkeit der v2-Mockups gegen die Vorlage.
//
// **Gezaehlt wird nach NAMEN, nicht nach Zeilen.** Der Aufrufbaum ist das
// Mass: ein Tab-Rumpf mit 46 Zeilen kann acht Komponenten mit 365 Zeilen
// rufen (so geschehen bei `SuppExtended`, G-29).
//
// Verallgemeinert aus `apps/web/src/app/v2/medical/vollstaendigkeit.mjs`
// (G-37, Medical-Agent). Neu gegenueber der Vorlage:
//   - Modul und Vorlagendateien sind Parameter, nicht fest verdrahtet
//   - eine UMBENANNT-Tabelle mit Begruendung je Eintrag
//   - `--json` fuer die Weiterverarbeitung
//
// Aufruf (aus dem Repo-Wurzelverzeichnis):
//   node tools/vollstaendigkeit.mjs            — alle Module
//   node tools/vollstaendigkeit.mjs nutrition  — ein Modul
//
// Rueckgabe 0 = alles vollstaendig, 1 = es fehlt etwas.
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = process.cwd()
const VORLAGE = path.join(WURZEL, 'docs/spezifikation/10-plattform/design-system/theme-v1')
const V2 = path.join(WURZEL, 'apps/web/src/app/v2')

// ---------------------------------------------------------------------
// Die drei Regeln aus `theme-v1-umsetzung.md` (G-33)
// ---------------------------------------------------------------------
// 1. Der Aufrufbaum zaehlt, nicht die Zeilenzahl des Tab-Rumpfs.
// 2. Gesucht wird in ALLEN Vorlagendateien eines Moduls — `CalendarView`
//    stand in `-modals.jsx` und galt faelschlich als undefiniert (G-33).
// 3. Eigene Zustaende sind eigene Bildschirme: ein Tab, der leer,
//    ladend und gefuellt unterschiedlich aussieht, ist dreimal zu pruefen.
//    Das misst dieses Skript NICHT — es steht als Merkposten im Bericht.

/** Die Bausteine aus packages/ui — sie sind kein Modulinhalt. */
const GETEILT = new Set([
  'Card', 'Pill', 'Icon', 'Ring', 'Meter', 'Row', 'Tabs', 'KPI',
  'Sparkline', 'LineChart', 'RadarChart', 'ProgressRing', 'CoverageRow',
  'ModuleHero', 'InEntwicklung', 'InEntwicklungKnopf', 'React', 'Fragment',
  'Modal', 'Drawer', 'Bar', 'Stat', 'Badge', 'Toggle', 'Segmented',
])

// ---------------------------------------------------------------------
// UMBENANNT — die Zuordnungstabelle
// ---------------------------------------------------------------------
// „Eine Zuordnung ohne Beleg ist eine Behauptung." Jeder Eintrag traegt
// deshalb `warum` — und `warum` muss auf VERHALTEN zeigen, nicht auf
// aehnliche Schreibweise. Geprueft wurde jeder Eintrag von Hand am Code.
//
// WICHTIG: Ein Treffer per Textsuche genuegt NICHT. `MealCard` und
// `NutritionDiary` stehen in der Umsetzung — aber nur als
// Herkunftskommentar („VORLAGE: ... `MealCard` (Zeile 294-354)").
// Wer nur `grep` fragt, zaehlt Kommentare als Umsetzung.
const UMBENANNT = {
  nutrition: {
    NutritionModule: {
      ziel: 'TagebuchAnsicht',
      warum: 'ansicht.tsx:87 — traegt Kopfzeile, `<Tableiste>` mit '
        + 'denselben sieben Tabs und die Tab-Weiche (`tab !== "diary"` '
        + '-> AndererTab). Heisst nach dem Tagebuch, weil das Modul '
        + 'unter /v2/nutrition als Tagebuch einsteigt; es ist eine '
        + 'async Server-Komponente, daher kein `-Ansicht`-Zwilling.',
    },
    MealCard: {
      ziel: 'MahlzeitKarte',
      warum: 'mahlzeiten.tsx:177 — nimmt datum/typ/mahlzeit/onGeaendert, '
        + 'rendert eine Mahlzeit mit ihren Positionen und dem Aendern-Knopf. '
        + 'Gleiche Rolle wie MealCard (module-nutrition.jsx:294).',
    },
    NutritionDiary: {
      ziel: 'Mahlzeiten',
      warum: 'mahlzeiten.tsx — listet die Mahlzeiten des Tages in der '
        + 'Reihenfolge der Vorlage (Kommentar Zeile 13 nennt sie). '
        + 'NutritionDiary ist der Tab-Rumpf, Mahlzeiten ist es hier.',
    },
    // G-38 hat diese vier Tabs und den Verteiler gebaut. Sie tragen
    // den Namen des Tabs, nicht den der Vorlage — dieselbe Benennung
    // wie `SuppExtended` -> `tab-extended.tsx`.
    FoodPreferencesView: {
      ziel: 'FoodPreferencesTab',
      warum: 'tab-prefs.tsx — dieselben sechs Kacheln in derselben '
        + 'Anordnung (Diet type · Categories · Individual foods | '
        + 'Allergies · Tag preferences · Priority order), dieselben '
        + 'acht Ernaehrungsformen und EU-14-Allergene.',
    },
    MealPlansView: {
      ziel: 'MealPlansTab',
      warum: 'tab-plans.tsx — dieselben drei Unter-Tabs (Active plan · '
        + 'Plan library · Shopping list) und dieselbe '
        + 'Compliance-Rechnung ueber GHOST_ENTRIES.',
    },
    NutritionInsights: {
      ziel: 'NutritionInsightsTab',
      warum: 'tab-insights.tsx — Calorie balance, Macro split und die '
        + 'Micronutrient-Heatmap ueber dieselben acht Naehrstoffe und '
        + '30 Tage.',
    },
    NutritionPlanner: {
      ziel: 'NutritionPlannerTab',
      warum: 'tab-planner.tsx — dieselbe Wochenmatrix aus vier '
        + 'Mahlzeitenreihen und sieben Tagen, dieselben Gerichte.',
    },
    NutritionModalLauncher: {
      ziel: 'NutritionModale',
      warum: 'modale.tsx:520 — verteilt dieselben vier Fenster unter '
        + 'denselben Schluesseln (quickadd, customfood, nutsettings, '
        + 'mealcam). Die Vorlage verteilt per window-Ereignis, hier '
        + 'uebernimmt das ein Zustand — wie bei TrainingModale.',
    },
    // `NutritionFoods` ist bewusst NICHT zugeordnet: siehe
    // `bekanntOffen` unten. Eine Zuordnung waere hier falsch, weil die
    // Umsetzung mehr tut als die Vorlage, nicht dasselbe anders.
    MacroRing: {
      ziel: 'ProgressRing',
      warum: 'ansicht.tsx nutzt den geteilten ProgressRing aus packages/ui '
        + 'statt eines modul-eigenen Rings — dieselbe Darstellung, '
        + 'einmal statt fuenfmal gebaut.',
    },
  },
  training: {
    TrainingToolLauncher: {
      ziel: 'TrainingModale',
      warum: 'modale.tsx:107 — verteilt dieselben drei Werkzeugfenster '
        + 'unter denselben drei Schluesseln: `plates` -> '
        + 'PlateCalculatorModal (677), `warmup` -> WarmupCalculatorModal '
        + '(745), `aigen` -> AIWorkoutGenModal (806). Die Vorlage '
        + 'verteilt per `window.addEventListener("training-modal")`, die '
        + 'Umsetzung per React-Kontext — das ist die dokumentierte '
        + 'technische Anpassung, nicht weniger Funktion.',
    },
  },
  dashboard: {
    DashboardModule: {
      ziel: 'DashboardEntwurf',
      warum: 'entwurf.tsx:60 — der Rahmen des Dashboards, nimmt '
        + '`echteMakros` und rendert Ringe, KPIs, DayTimeline und '
        + 'MacroGrid. Heisst `-Entwurf`, nicht `-Ansicht` wie die '
        + 'uebrigen Module; `[cmd]` per grep geprueft, es gibt keine '
        + '`DashboardAnsicht`.',
    },
  },
  nutritionRahmen: {},
}

// Rahmen-Umbenennung gilt fuer jedes Modul: `<Modul>Module` -> `<Modul>Ansicht`.
// `ModuleV2` faellt mit ab: der Rahmen heisst hier `RecoveryAnsicht`,
// nicht `RecoveryV2Ansicht` — die Umsetzung fuehrt nur einen Rahmen.
function rahmenAlias(name) {
  const m = /^([A-Z][A-Za-z0-9]*?)Module(V2)?$/.exec(name)
  return m ? `${m[1]}Ansicht` : null
}

// ---------------------------------------------------------------------
// Die Module
// ---------------------------------------------------------------------
const MODULE = {
  dashboard: {
    dateien: ['module-dashboard.jsx'],
    rahmen: 'DashboardModule',
    rahmenDatei: 'module-dashboard.jsx',
    tabs: null, // Dashboard hat keine Tabs — nur den Rahmen.
  },
  nutrition: {
    dateien: ['module-nutrition.jsx', 'module-nutrition-nutrients.jsx', 'module-nutrition-spec.jsx'],
    rahmen: 'NutritionModule',
    rahmenDatei: 'module-nutrition.jsx',
    tabs: null, // aus dem Rahmen ermittelt
    // `[cmd]` BEWUSSTE ABWEICHUNG, kein Versaeumnis. Die Vorlage
    // fuehrt in `NutritionFoods` eine Tabelle mit zwoelf fest
    // eingetragenen Lebensmitteln. Die Umsetzung hat unter
    // `/v2/nutrition/suche` eine echte Suche gegen die BLS-Daten
    // (293 Zeilen, G-03), auf die der Food-DB-Tab verlinkt. Die zwoelf
    // Zeilen nachzubauen hiesse, funktionierenden Code durch eine
    // Attrappe zu ersetzen. Steht so im Bericht.
    bekanntOffen: ['NutritionFoods'],
  },
  training: {
    dateien: ['module-training.jsx', 'module-training-extras.jsx',
      'module-training-spec.jsx', 'module-training-offline-hr.jsx'],
    rahmen: 'TrainingModule',
    rahmenDatei: 'module-training.jsx',
    tabs: null,
  },
  recovery: {
    dateien: ['module-recovery.jsx', 'module-recovery-v2.jsx', 'module-recovery-engine.jsx',
      'module-recovery-modals.jsx', 'module-recovery-modals2.jsx'],
    // `[cmd]` NICHT `RecoveryModule`. Die Vorlage fuehrt zwei
    // konkurrierende Rahmen; `app.jsx:122` entscheidet:
    //   case "recovery": return window.RecoveryModuleV2
    //     ? <window.RecoveryModuleV2 /> : <RecoveryModule />;
    // `RecoveryModuleV2` liegt vor (module-recovery-v2.jsx:899), also
    // gewinnt es — der alte Rahmen ist der Notnagel, der nie greift.
    // Gegen den alten Rahmen gemessen meldete dieses Skript 22
    // Phantomluecken (RecoveryToday, RecoverySleep, ...), weil die
    // Umsetzung dem RICHTIGEN Rahmen folgt.
    rahmen: 'RecoveryModuleV2',
    rahmenDatei: 'module-recovery-v2.jsx',
    tabs: null,
  },
  goals: {
    dateien: ['module-goals.jsx', 'module-goals-pro.jsx', 'module-goals-editor.jsx'],
    rahmen: 'GoalsModule',
    rahmenDatei: 'module-goals.jsx',
    tabs: null,
  },
  supplements: {
    dateien: ['module-supplements.jsx', 'module-supplements-modals.jsx'],
    rahmen: 'SupplementsModule',
    rahmenDatei: 'module-supplements.jsx',
    tabs: null,
    // G-31 besitzt die fuenf ungebauten Tabs — sie zaehlen hier als bekannt.
    bekanntOffen: ['SuppCatalogView', 'SuppStacksView', 'SuppIntelligenceView',
      'SuppInventoryView', 'InjectionPlannerView'],
  },
  // ─────────────────────────────────────────────────────────────────
  // Coach — ZWEI Unterbereiche unter einem Menuepunkt (G-40).
  //
  // `[cmd]` `app.jsx:126-128` fuehrt drei Faelle:
  //     case "coach": case "coach-human": return <CoachModule />;
  //     case "coach-ai":                  return <BuddyModule />;
  //     case "portal":                    return <CoachPortalStandalone />;
  //
  // Deshalb zwei Eintraege statt einem. `portal` gehoert NICHT dazu —
  // es steht seit G-02 unter WORKSPACES als externer Link.
  //
  // `[cmd]` Der Coach-Rahmen ruft auch die Portal-Ansichten auf
  // (`CoachPortal*`, `Portal*`): `module-coach.jsx` traegt beide
  // Seiten der Beziehung in einer Datei. Die Portal-Ansichten zaehlen
  // deshalb als `bekanntOffen` — sie gehoeren zum externen Arbeitsplatz,
  // nicht zum Athletenbereich.
  coach: {
    dateien: ['module-coach.jsx', 'module-coach-extras.jsx', 'module-coach-gaps.jsx',
      'module-coach-athlete.jsx', 'module-coach-meta.jsx', 'module-coach-programs.jsx'],
    rahmen: 'CoachModule',
    rahmenDatei: 'module-coach.jsx',
    tabs: null,
    bekanntOffen: [
      // 1. Der Arbeitsplatz der Trainerin — eigener Menuepunkt, eigener
      //    Auftrag. `[cmd]` `module-coach.jsx:137` verdrahtet
      //    `const side = "athlete"` fest; ueber diese Weiche ist der
      //    Portalzweig im Athletenbereich **nie erreichbar**. Er steht
      //    seit G-02 unter WORKSPACES als externer Link
      //    (`nav.ts:86`, coach.lumeos.app).
      'CoachPortalStandalone', 'CoachPortalAnalytics', 'CoachPortalAutonomy',
      'CoachPortalRules', 'CoachPortalSmartAlerts', 'CoachPortalTeam',
      'PortalAthletesV2', 'PortalClientOnboarding', 'PortalPrograms',
      'PortalWorkflows', 'ClientDashboardCard',
      'PortalOverview', 'PortalAthletes', 'PortalPlans', 'PortalMessages',
      'PortalRevenue', 'PortalAlerts',
      // 2. Die zwei Modale des Portalzweigs. `[cmd]`
      //    `module-coach.jsx:213/215` oeffnet sie ueber `athleteDet` und
      //    `newPlan` — beide Schluessel setzt nur der Portalzweig.
      'AthleteDetailModal', 'NewPlanModal',
      // 3. Die Daten des Portalzweigs. `[cmd]` `PORTAL_ATHLETES` liest
      //    nur PortalOverview/-Athletes/-Alerts, `COACH_PLANS` nur
      //    PortalPlans — alle drei stehen unter 1.
      'PORTAL_ATHLETES', 'COACH_PLANS',
      // 4. Der abgeloeste Vorgaenger. `[cmd]` `module-coach.jsx:199`:
      //        window.AthletePermissionsV2
      //          ? <window.AthletePermissionsV2/> : <AthletePermissions/>
      //    `AthletePermissionsV2` liegt vor (`Object.assign(window, …)`,
      //    module-coach-athlete.jsx:565), also gewinnt es immer — wie bei
      //    Recovery und Medical ist der alte Stand der Notnagel, der nie
      //    greift. Uebernommen ist V2, samt seiner Kachel
      //    „Permission matrix"; die V1-Kachel „Per-coach permissions
      //    matrix" ist deren abgeloeste Fassung, nicht eine zweite.
      'AthletePermissions',
      // 5. Der Werkzeugkasten von `-gaps.jsx`. `[cmd]`
      //    `module-coach.jsx:216` haengt `CoachExtrasLauncher`
      //    bedingungslos an den Rahmen; er oeffnet sechs Modale, von
      //    denen **fuenf dem Portalzweig gehoeren** (Alarmdetail,
      //    Regeleditor, Trainereinstellungen, Teameinladung,
      //    Teammitglied). Das sechste, `AthleteDetailEnhanced`, ersetzt
      //    `AthleteDetailModal` — auch das Portalzweig (siehe 2.).
      //    Faellt mit dem Portalauftrag an, nicht hier.
      'CoachExtrasLauncher', 'AlertDetailModal', 'AthleteDetailEnhanced',
      'CoachSettingsModal', 'InviteTeamMemberModal', 'RuleEditModal',
      'TeamMemberDetailModal',
    ],
  },
  'coach-ai': {
    dateien: ['module-buddy.jsx', 'module-buddy-engines.jsx',
      'module-buddy-knowledge.jsx', 'module-buddy-voice.jsx'],
    rahmen: 'BuddyModule',
    rahmenDatei: 'module-buddy.jsx',
    tabs: null,
  },
}

// ---------------------------------------------------------------------
// Die Werkzeuge (aus der Medical-Vorlage uebernommen)
// ---------------------------------------------------------------------
function definierte(quelle) {
  const namen = new Set()
  for (const m of quelle.matchAll(/^(?:const|function)\s+([A-Z][A-Za-z0-9_]*)/gm)) namen.add(m[1])
  for (const m of quelle.matchAll(/^window\.([A-Z][A-Za-z0-9_]*)\s*=/gm)) namen.add(m[1])
  return namen
}

function benutzte(quelle) {
  const namen = new Set()
  for (const m of quelle.matchAll(/<([A-Z][A-Za-z0-9_]*)[\s/>]/g)) namen.add(m[1])
  for (const m of quelle.matchAll(/window\.([A-Z][A-Za-z0-9_]*)/g)) namen.add(m[1])
  return namen
}

/**
 * Der Rumpf einer Komponente — ueber Klammernzaehlung bis zum echten Ende.
 * `[read]` Die Medical-Vorlage haelt fest, warum nicht bis zur naechsten
 * `const`-Zeile geschnitten wird: das trifft auch verschachtelte
 * Konstanten INNERHALB der Komponente und meldete drei Tabs faelschlich
 * mit „0 Unterkomponenten".
 */
function rumpf(quelle, name) {
  const start = quelle.search(
    new RegExp(`^(?:const|function|window\\.)\\s*${name}\\b`, 'm'))
  if (start < 0) return ''
  const ab = quelle.indexOf('{', start)
  if (ab < 0) return ''
  let tiefe = 0
  for (let i = ab; i < quelle.length; i++) {
    if (quelle[i] === '{') tiefe++
    else if (quelle[i] === '}') {
      tiefe--
      if (tiefe === 0) return quelle.slice(start, i + 1)
    }
  }
  return quelle.slice(start)
}

/** Zaehlt `<Card ... title="X"` und liefert die Titel. */
function kartentitel(koerper) {
  const titel = []
  for (const m of koerper.matchAll(/<Card\b[^>]*?\stitle=(?:"([^"]+)"|\{`([^`]+)`\})/gs)) {
    titel.push((m[1] ?? m[2]).replace(/\$\{[^}]+\}/g, '…').trim())
  }
  return titel
}

/**
 * Die Umsetzung als Text — aber OHNE Kommentare.
 *
 * `[cmd]` DER GRUND: `mahlzeiten.tsx:6` traegt „VORLAGE: ... `MealCard`".
 * Wer den Rohtext durchsucht, findet `MealCard` und meldet sie als
 * vorhanden. Sie ist es nicht — sie heisst `MahlzeitKarte`. Ein
 * Herkunftskommentar ist kein Bauteil.
 *
 * Laengenerhaltend ersetzt (Leerzeichen statt Entfernen), damit
 * Zeilennummern in Fehlermeldungen stimmen.
 */
function ohneKommentare(quelle) {
  return quelle
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/^([^\n]*?)\/\/[^\n]*/gm, (m, vor) =>
      vor + ' '.repeat(m.length - vor.length))
}

// ---------------------------------------------------------------------
// Ein Modul messen
// ---------------------------------------------------------------------
function miss(name, cfg) {
  const quellen = cfg.dateien.map(d => {
    const p = path.join(VORLAGE, d)
    if (!fs.existsSync(p)) throw new Error(`Vorlagendatei fehlt: ${d}`)
    return fs.readFileSync(p, 'utf8')
  })
  // Regel 2: in ALLEN Vorlagendateien suchen.
  const alleVorlagen = quellen.join('\n')
  const vorlageDefiniert = new Set()
  for (const q of quellen) for (const n of definierte(q)) vorlageDefiniert.add(n)

  const modulVerz = path.join(V2, name)
  if (!fs.existsSync(modulVerz)) throw new Error(`Modul fehlt: apps/web/src/app/v2/${name}`)

  const dateien = fs.readdirSync(modulVerz, { recursive: true })
    .filter(f => typeof f === 'string' && (f.endsWith('.tsx') || f.endsWith('.ts')))
  const roh = dateien
    .map(f => fs.readFileSync(path.join(modulVerz, f), 'utf8'))
    .join('\n')
  const umsetzung = ohneKommentare(roh)

  const umgesetzt = new Set([
    ...definierte(umsetzung),
    ...[...umsetzung.matchAll(/^export\s+(?:async\s+)?function\s+([A-Z][A-Za-z0-9_]*)/gm)].map(m => m[1]),
    ...[...umsetzung.matchAll(/^export\s+const\s+([A-Z][A-Za-z0-9_]*)/gm)].map(m => m[1]),
  ])

  const benutztImModul = benutzte(umsetzung)
  const karte = UMBENANNT[name] ?? {}
  const bekannt = new Set(cfg.bekanntOffen ?? [])

  /** Gilt `n` als vorhanden — direkt, per Umbenennung, oder als bekannt offen? */
  function vorhanden(n) {
    if (umgesetzt.has(n)) return { ok: true }
    // Die geprueften Eintraege der Tabelle gehen VOR der Faustregel —
    // `[cmd]` das Dashboard heisst `DashboardEntwurf`, nicht
    // `DashboardAnsicht`. Wer die Regel zuerst greifen laesst, sucht
    // nach einem Namen, den es nicht gibt, und meldet den Rahmen als
    // fehlend, obwohl er dasteht.
    const eintrag = karte[n]
    if (eintrag) {
      // Das Ziel kann im Modul DEFINIERT oder — wenn es ein geteilter
      // Baustein aus packages/ui ist — nur BENUTZT sein. `[cmd]`
      // MacroRing -> ProgressRing ist genau dieser Fall: ansicht.tsx:225
      // ruft ihn, definiert ihn aber nicht.
      if (umgesetzt.has(eintrag.ziel) || benutztImModul.has(eintrag.ziel)) {
        return { ok: true, via: eintrag.ziel, warum: eintrag.warum }
      }
    }
    // Erst danach die Faustregel `<Modul>Module` -> `<Modul>Ansicht`.
    const alias = rahmenAlias(n)
    if (alias && umgesetzt.has(alias)) {
      return { ok: true, via: alias, warum: 'Rahmen: deutsche Benennung wie in allen v2-Modulen.' }
    }
    if (bekannt.has(n)) return { ok: true, offen: true }
    return { ok: false }
  }

  // Die Tabs aus dem Rahmen holen: alles, was der Rahmen ruft und die
  // Vorlage definiert.
  const rahmenKoerper = rumpf(alleVorlagen, cfg.rahmen)
  const aufgerufen = [...benutzte(rahmenKoerper)]
    .filter(n => !GETEILT.has(n) && vorlageDefiniert.has(n))
    .sort()

  const zeilen = []
  let gesamt = 0, fehlend = 0
  const umbenannt = []
  const offen = []

  // Der Rahmen selbst.
  gesamt++
  const r = vorhanden(cfg.rahmen)
  if (!r.ok) { fehlend++; zeilen.push(`FEHLT Rahmen ${cfg.rahmen}`) }
  else if (r.via) umbenannt.push({ von: cfg.rahmen, nach: r.via, warum: r.warum })

  // Jeder Tab mit seinem eigenen Aufrufbaum (Regel 1).
  for (const tab of aufgerufen) {
    const koerper = rumpf(alleVorlagen, tab)
    const kinder = [...benutzte(koerper)]
      .filter(n => !GETEILT.has(n) && vorlageDefiniert.has(n) && n !== tab)
      .sort()
    const titel = kartentitel(koerper)

    const pruef = [tab, ...kinder].map(n => [n, vorhanden(n)])
    const fehlt = pruef.filter(([, v]) => !v.ok).map(([n]) => n)
    for (const [n, v] of pruef) {
      if (v.via) umbenannt.push({ von: n, nach: v.via, warum: v.warum })
      if (v.offen) offen.push(n)
    }
    // Die Kacheln eines bewusst offenen Tabs zaehlen nicht mit. `[cmd]`
    // Sonst faellt die Begruendung auf halbem Weg: `AthletePermissions`
    // ist als abgeloester Vorgaenger eingetragen und wird bei den
    // Komponenten uebersprungen — seine Kachel „Per-coach permissions
    // matrix" wurde aber weiter als Luecke gemeldet. Genau diese Kachel
    // steht in der abloesenden Fassung als „Permission matrix" da; sie
    // zu bauen hiesse, den ueberholten Stand nachzureichen.
    const tabOffen = bekannt.has(tab)
    const titelFehlt = tabOffen ? [] : titel.filter(t => {
      const kern = t.split('…')[0].trim()
      return kern.length > 2 && !umsetzung.includes(kern)
    })

    gesamt += pruef.length + titel.length
    fehlend += fehlt.length + titelFehlt.length
    const heil = !fehlt.length && !titelFehlt.length
    zeilen.push(`${heil ? 'OK  ' : 'FEHLT'} ${tab.padEnd(24)}`
      + ` ${kinder.length} Unterkomp., ${titel.length} Kacheln`
      + (fehlt.length ? `\n        FEHLENDE KOMPONENTEN: ${fehlt.join(', ')}` : '')
      + (titelFehlt.length ? `\n        FEHLENDE KACHELN: ${titelFehlt.join(' | ')}` : ''))
  }

  // Die Modale — sie haengen nicht am Rahmen, sondern stehen fuer sich.
  //
  // `[cmd]` ABER: nur Modale, die der LEBENDE Rahmen auch erreicht.
  // Recovery fuehrt zwei konkurrierende Rahmen; `-modals.jsx` bedient
  // den abgeloesten. `LogProtocolModal`, `LogSleepModal`,
  // `ReadinessCheckinModal` und `WearableSyncModal` kommen in
  // `module-recovery-v2.jsx` NULLMAL vor. Wer sie mitzaehlt, meldet
  // vier Luecken, die keine sind — die Vorlage selbst ruft sie nicht.
  // Ein Modal zaehlt, wenn die Datei des lebenden Rahmens es erwaehnt.
  const rahmenQuelle = quellen[cfg.dateien.indexOf(cfg.rahmenDatei ?? cfg.dateien[0])]
  const modalNamen = [...vorlageDefiniert]
    .filter(n => /Modal$/.test(n))
    .filter(n => new RegExp(`\\b${n}\\b`).test(rahmenQuelle))
    .sort()
  const modalFehlt = modalNamen.filter(n => !vorhanden(n).ok)
  gesamt += modalNamen.length
  fehlend += modalFehlt.length
  if (modalNamen.length) {
    zeilen.push(`${modalFehlt.length ? 'FEHLT' : 'OK  '} ${'(Modale)'.padEnd(24)}`
      + ` ${modalNamen.length} Stueck`
      + (modalFehlt.length ? `\n        FEHLEN: ${modalFehlt.join(', ')}` : ''))
  }

  // Daten und Formeln: GROSSKONSTANTEN und calc*/generate*-Funktionen.
  // `[cmd]` Auch hier nur, was der lebende Rahmen erreicht:
  // `PROTOCOL_DEFS` und `RECOMMENDATIONS` stehen in
  // `module-recovery-modals.jsx` und kommen in `-v2.jsx` nullmal vor.
  // Sie gehoeren zum abgeloesten Rahmen — als Luecke gezaehlt waeren
  // sie zwei Posten, die niemand bauen soll.
  const datenNamen = [...new Set(
    [...alleVorlagen.matchAll(/^(?:const|function)\s+([A-Za-z_][A-Za-z0-9_]*)/gm)].map(m => m[1])
      .filter(n => /^[A-Z][A-Z0-9_]{2,}$/.test(n) || n.startsWith('calc') || n.startsWith('generate'))
      .filter(n => new RegExp(`\\b${n}\\b`).test(rahmenQuelle)),
  )].sort()
  // `bekanntOffen` gilt hier genauso wie bei den Komponenten. `[cmd]`
  // Vorher tat es das nicht: Coach meldete `PORTAL_ATHLETES` und
  // `COACH_PLANS` als Luecke, obwohl beide zum Portalzweig gehoeren,
  // der eingetragen offen ist. Ein Modul konnte eine Datenkonstante
  // nicht als bewusst offen erklaeren — die Komponente daneben schon.
  const datenFehlt = datenNamen
    .filter(n => !new RegExp(`\\b${n}\\b`).test(umsetzung))
    .filter(n => !bekannt.has(n))
  gesamt += datenNamen.length
  fehlend += datenFehlt.length
  if (datenNamen.length) {
    zeilen.push(`${datenFehlt.length ? 'FEHLT' : 'OK  '} ${'(Daten/Formeln)'.padEnd(24)}`
      + ` ${datenNamen.length} Stueck`
      + (datenFehlt.length ? `\n        FEHLEN: ${datenFehlt.join(', ')}` : ''))
  }

  return { name, gesamt, fehlend, zeilen, umbenannt, offen }
}

// ---------------------------------------------------------------------
// Ausgabe
// ---------------------------------------------------------------------
const nurEins = process.argv[2]
const auswahl = nurEins ? { [nurEins]: MODULE[nurEins] } : MODULE
if (nurEins && !MODULE[nurEins]) {
  console.error(`Unbekanntes Modul "${nurEins}". Bekannt: ${Object.keys(MODULE).join(', ')}`)
  process.exit(2)
}

let summeFehlend = 0
for (const [name, cfg] of Object.entries(auswahl)) {
  console.log(`\n=== ${name.toUpperCase()} ${'='.repeat(50 - name.length)}`)
  let e
  try { e = miss(name, cfg) } catch (err) {
    console.log(`  ABBRUCH: ${err.message}`)
    summeFehlend++
    continue
  }
  for (const z of e.zeilen) console.log('  ' + z)
  if (e.umbenannt.length) {
    console.log('\n  UMBENANNT (mit Beleg):')
    for (const u of e.umbenannt) console.log(`    ${u.von} -> ${u.nach}\n      ${u.warum}`)
  }
  if (e.offen.length) {
    // Der Grund steht je Modul in `bekanntOffen` — nicht pauschal
    // „G-31", das gilt nur fuer Supplements.
    console.log(`\n  BEWUSST OFFEN: ${[...new Set(e.offen)].join(', ')}`
      + `\n    (Begruendung je Eintrag im Kopf dieses Skripts unter MODULE.${e.name})`)
  }
  console.log(`\n  ${e.gesamt - e.fehlend} von ${e.gesamt} vorhanden.`)
  summeFehlend += e.fehlend
}

console.log(`\n${summeFehlend === 0 ? 'Alles vorhanden.' : `Insgesamt fehlen ${summeFehlend} Posten.`}`)
process.exit(summeFehlend === 0 ? 0 : 1)
