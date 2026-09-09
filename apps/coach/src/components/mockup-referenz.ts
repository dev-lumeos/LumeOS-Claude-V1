// Die 44 Portalkarten der Vorlage, je Reiter eingeordnet — G-398.
//
// **Tom, 2026-09-08:** *„mit allen ansichten das komplette portal
// will ich morgen sehen — mit schon angebundenen sachen die schon
// vorhanden sind, und die mockups."*
//
// ══ WOHER DIE 44 KOMMEN ═════════════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-09-09: die acht Vorlagen tragen 62 Karten
// mit Namen** (`<Card|CMod … title=`). `[cmd]` **44 davon gehoeren
// einem der sechzehn Portalreiter**, 18 der Klientensicht
// (`AthleteOverview`, `AthleteAutonomy`, … — die stehen in
// `apps/web`, nicht hier).
//
// `[cmd]` **Die Zuordnung Reiter -> Komponente steht in
// `module-coach.jsx:941-957`** — nicht geraten, abgelesen:
//
//     overview  -> PortalOverview        patterns  -> PatternAnalysisView
//     athletes  -> PortalAthletesV2      intervene -> InterventionEngineView
//     analytics -> CoachPortalAnalytics  consent   -> ConsentFlowView
//     alerts    -> CoachPortalSmartAlerts plans    -> PortalPlans
//     rules     -> CoachPortalRules      workflows -> PortalWorkflows
//     autonomy  -> CoachPortalAutonomy   onboard   -> PortalClientOnboarding
//     programs  -> PortalPrograms        messages  -> PortalMessages
//     revenue   -> PortalRevenue         team      -> CoachPortalTeam + AuditLogV2
//
// `[read]` **Damit ist auch der Streit aus G-397 entschieden:**
// `PatternAnalysisView`, `InterventionEngineView` und
// `ConsentFlowView` sind Portalreiter — die Zeilen 948, 949 und 950
// sagen es woertlich. **Sie gehoeren hierher, nicht nach
// `/v2/coach/human`.**
//
// ══ DIE DREITEILUNG ═════════════════════════════════════════════════
//
//     angebunden   eine Tabelle traegt sie UND ein Leseweg liest sie
//     baubar       Tabelle da, kein Leseweg
//     blockiert    keine Tabelle -- und WELCHE fehlt
//
// `[cmd]` **Gemessen gegen die laufende Instanz, 2026-09-09:** das
// Schema `coach` fuehrt **15 Tabellen, 58 Zeilen, 3 leer**
// (`client_consent_log`, `coach_profiles`, `pending_invites`).
//
// `[read]` **Der Auftrag nennt 55 Zeilen und 5 leer** — die Zahl ist
// gewandert, seit er geschrieben wurde. **Gemessen gilt.**
//
// `[cmd]` **`apps/coach/src/lib/daten.ts` liest ZWOELF der 15**
// (elf direkt, `relationships` ueber die Funktion `klienten()`).
// **Ungelesen: `client_consent_log`, `coach_profiles`,
// `pending_invites`** — genau die drei leeren. `[read]` **Das ist
// kein Zufall: ohne Zeilen gibt es nichts zu lesen.**

export type Stufe = 'angebunden' | 'baubar' | 'blockiert'

export type RefKarte = {
  /** Der Titel, wie er in der Vorlage steht. */
  titel: string
  /** Woher — Datei und Komponente. */
  quelle: string
  stufe: Stufe
  /**
   * Bei `angebunden`/`baubar`: die Tabellen.
   * Bei `blockiert`: leer, dann traegt `fehlt` den Grund.
   */
  tabellen?: string[]
  /** Nur bei `blockiert`: WELCHE Tabelle fehlt (A3). */
  fehlt?: string
  /** Was das Altrepo dazu hat (A8) — melden, nicht uebernehmen. */
  altrepo?: string
  /**
   * Der Aufbau der Kachel, damit sie nicht nur ein Rahmen ist.
   *
   * `[read]` **`zeilenPaar` statt `liste`**, wo rechts eine ZAHL
   * steht: die Liste setzt den zweiten Wert als Fliesstext, das Paar
   * rechtsbuendig. **Ein `as never` waere hier ein Cast gewesen** —
   * und ein Cast schaltet genau die Pruefung ab, die den Tippfehler
   * findet.
   */
  art: 'liste' | 'zeilenPaar' | 'balken' | 'text'
  zeilen?: Array<[string, string]>
  balken?: Array<[string, number]>
  text?: string
}

export type RefReiter = {
  /** Die Vorlage, aus der dieser Reiter stammt. */
  quelle: string
  karten: RefKarte[]
}

// `[read]` **Die Werte stammen aus den Vorlagen** — abgeschrieben,
// nicht erfunden. **Angebunden wird hier nichts** (der Auftrag sagt
// es ausdruecklich): die Kachel zeigt, WIE es aussehen soll.
export const REFERENZ: Record<string, RefReiter> = {
  overview: {
    quelle: 'theme-v1/module-coach.jsx · PortalOverview',
    karten: [
      {
        titel: 'Athletes needing attention',
        quelle: 'module-coach.jsx:502',
        // `[cmd]` **Vom Waechter berichtigt:** ich hatte `baubar`
        // gesetzt, aber `coach.alerts` STEHT im Leseweg
        // (`daten.ts`, elfte Abfrage). **Der Reiter „Alerts" zeigt
        // sie heute schon** — was fehlt, ist die Sicht auf der
        // Uebersicht, nicht der Zugang zu den Daten.
        stufe: 'angebunden',
        tabellen: ['coach.alerts'],
        altrepo: 'buddyWatcher.ts (37 KB) · CoachDashboard.tsx (33 KB)',
        art: 'liste',
        zeilen: [
          ['Sarah Johnson', 'Adherence 62 % · 3 Wochen fallend'],
          ['Max Schmidt', 'Check-in seit 9 Tagen offen'],
          ['dev', 'Schlaf unter Zielwert'],
        ],
      },
      {
        titel: "Today's sessions logged",
        quelle: 'module-coach.jsx:518',
        // `[cmd]` **`coach.relationships` ist hier NICHT zu nennen** —
        // sie wird gelesen, und ein Waechter haette die Karte
        // deshalb als angebunden gemeldet. **Die tragende Tabelle
        // ist `training.workout_sessions`**, und die liest das
        // Portal nur je Athlet (`.eq('user_id', clientId)`),
        // nicht ueber alle Klienten eines Tages.
        //
        // `[read]` **Eine Tabelle, die schon gelesen wird, gehoert
        // nicht in die Liste dessen, worauf gewartet wird** — sie
        // verwischt genau die Grenze, die die Dreiteilung zieht.
        stufe: 'baubar',
        tabellen: ['training.workout_sessions'],
        altrepo: 'CoachDashboard.tsx (33 KB)',
        art: 'text',
        text: 'Die Einheiten gibt es — `training.workout_sessions` traegt 66 '
          + 'Zeilen, und das Portal liest sie bereits fuer die Athletenseite. '
          + 'Was fehlt, ist die Zusammenfassung ueber ALLE Klienten des Tages.',
      },
      {
        titel: 'Recent achievements',
        quelle: 'module-coach.jsx:522',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Erfolge oder Meilensteine',
        art: 'text',
        text: 'Der Entwurf zeigt PRs und erreichte Ziele je Klient. Es gibt '
          + 'keine Tabelle, die einen Meilenstein festhaelt — `user_goals` '
          + 'traegt Ziele, aber kein Ereignis „erreicht am".',
      },
    ],
  },

  athletes: {
    quelle: 'theme-v1/module-coach-gaps.jsx · AthleteDetailEnhanced',
    karten: [
      {
        titel: 'Athletendetail (Modal)',
        quelle: 'module-coach-gaps.jsx:23',
        // `[cmd]` **Vom Waechter berichtigt:** alle drei Tabellen
        // stehen im Leseweg, und `/athlet/[id]` zeigt sie. **Die
        // Daten fehlen nicht, die Bauform ist eine andere** — Seite
        // statt Fenster. `[read]` **Das ist keine Luecke, sondern
        // eine Entwurfsabweichung**, und die Stufe muss das sagen.
        stufe: 'angebunden',
        tabellen: ['coach.relationships', 'coach.checkins', 'coach.alerts'],
        altrepo: 'ClientDetail.tsx (38 KB)',
        art: 'text',
        text: 'Der Entwurf oeffnet je Athlet ein Fenster mit Reitern: '
          + 'Adherence, Autonomie, Verlauf. Das Portal hat statt dessen eine '
          + 'eigene Seite (`/athlet/[id]`) — dieselbe Sache, andere Bauform. '
          + 'Die Daten sind da, das Fenster ist es nicht.',
      },
    ],
  },

  analytics: {
    quelle: 'theme-v1/module-coach-extras.jsx · CoachPortalAnalytics',
    karten: [
      {
        titel: 'Coach efficiency',
        quelle: 'module-coach-extras.jsx:171',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Zeit oder Aufwand je Coach',
        altrepo: 'research/b2b/ (50 KB)',
        art: 'balken',
        balken: [['Antwortzeit', 72], ['Betreute Klienten', 60], ['Aufwand je Klient', 45]],
      },
      {
        titel: 'Business impact',
        quelle: 'module-coach-extras.jsx:184',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Umsatz',
        altrepo: 'research/b2b/ (50 KB)',
        art: 'text',
        text: 'Geld gehoert zum Marketplace, nicht ins Portal (F-06 T8) — '
          + 'derselbe Grund, den `tab-leer.tsx` fuer den Reiter „Revenue" '
          + 'nennt.',
      },
      {
        titel: 'Adherence per dimension',
        quelle: 'module-coach-extras.jsx:194',
        stufe: 'angebunden',
        tabellen: ['coach.checkins'],
        altrepo: 'buddyWatcher.ts (37 KB)',
        art: 'balken',
        balken: [['Nutrition', 84], ['Training', 76], ['Recovery', 61],
          ['Supplements', 88], ['Sleep', 55]],
      },
    ],
  },

  alerts: {
    quelle: 'theme-v1/module-coach-extras.jsx · CoachPortalSmartAlerts',
    karten: [
      {
        titel: 'Alarmdetail (Modal)',
        quelle: 'module-coach-gaps.jsx:149',
        stufe: 'angebunden',
        tabellen: ['coach.alerts'],
        altrepo: 'buddyWatcher.ts (37 KB)',
        art: 'zeilenPaar',
        zeilen: [
          ['Severity', 'HIGH'], ['Confidence', '0,82'],
          ['FP-Risiko', 'niedrig'], ['Aehnliche Faelle', '4'],
        ],
      },
      {
        titel: 'Batched',
        quelle: 'module-coach-portal-v2.jsx:314',
        stufe: 'angebunden',
        tabellen: ['coach.pending_actions'],
        art: 'text',
        text: 'Der Entwurf buendelt mehrere Vorschlaege zu EINER Freigabe. '
          + '`coach.pending_actions` traegt `status` und `expires_at` — die '
          + 'Buendelung selbst hat keine Spalte, sie waere eine Ansichtssache.',
      },
      {
        titel: 'All open alerts',
        quelle: 'module-coach.jsx:677',
        stufe: 'angebunden',
        tabellen: ['coach.alerts'],
        altrepo: 'buddyWatcher.ts (37 KB)',
        art: 'text',
        text: 'Die Kachel gibt es im Portal schon — der Reiter „Alerts" liest '
          + '`coach.alerts` und zeigt sie nach Status. Der Entwurf ordnet '
          + 'zusaetzlich nach Schweregrad und rechnet einen Prioritaetswert '
          + '(`smartPriorityScore`, module-coach-gaps.jsx:134).',
      },
    ],
  },

  rules: {
    quelle: 'theme-v1/module-coach-extras.jsx · CoachPortalRules',
    karten: [
      {
        titel: 'Building blocks',
        quelle: 'module-coach-extras.jsx:314',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Coach-Regeln',
        altrepo: 'CoachRuleBuilder.tsx (27 KB)',
        art: 'liste',
        zeilen: [
          ['Trigger', 'adherence faellt unter X %'],
          ['Trigger', 'kein Check-in seit N Tagen'],
          ['Condition', 'Autonomiestufe hoechstens N'],
          ['Action', 'Nachricht aus Vorlage senden'],
          ['Action', 'Planaenderung vorschlagen'],
        ],
      },
      {
        titel: 'Rule canvas',
        quelle: 'module-coach-extras.jsx:331',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Coach-Regeln',
        altrepo: 'CoachRuleBuilder.tsx (27 KB)',
        art: 'text',
        text: 'Eine Flaeche, auf der Bausteine zu einer Regel verbunden '
          + 'werden. Ohne Tabelle gibt es nichts zu speichern — die Flaeche '
          + 'waere ein Formular ohne Ziel. `wissen.rule_engine_rules` gibt es '
          + '(64 Zeilen), das sind aber Substanz-Wechselwirkungen.',
      },
      {
        titel: 'Settings',
        quelle: 'module-coach-extras.jsx:357',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Coach-Einstellungen',
        art: 'text',
        text: 'Ruhezeiten, Buendelung, Eskalationsstufen. Es gibt keine '
          + 'Tabelle, die eine Einstellung je Coach haelt — `coach_profiles` '
          + 'traegt Name und E-Mail, sonst nichts (7 Spalten, 0 Zeilen).',
      },
      {
        titel: 'Rule fire history · 30 days',
        quelle: 'module-coach-extras.jsx:422',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Coach-Regeln',
        altrepo: 'CoachRuleBuilder.tsx (27 KB)',
        art: 'text',
        text: 'Wann welche Regel gegriffen hat. Setzt die Regeln selbst '
          + 'voraus — dieselbe fehlende Tabelle wie oben.',
      },
      {
        titel: 'Regel bearbeiten (Modal)',
        quelle: 'module-coach-gaps.jsx:207',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Coach-Regeln',
        altrepo: 'CoachRuleBuilder.tsx (27 KB)',
        art: 'text',
        text: 'Bedingungen, Aktionen, Zielgruppe. Ohne Regeltabelle gibt es '
          + 'nichts zu bearbeiten.',
      },
    ],
  },

  autonomy: {
    quelle: 'theme-v1/module-coach-extras.jsx · CoachPortalAutonomy',
    karten: [
      {
        titel: 'Athletes by autonomy level',
        quelle: 'module-coach-extras.jsx:566',
        stufe: 'angebunden',
        tabellen: ['coach.client_autonomy'],
        altrepo: 'AUTONOMY_ARCHITECTURE.md:165',
        art: 'balken',
        balken: [['Stufe 1 · begleitet', 1], ['Stufe 2', 2], ['Stufe 3', 1],
          ['Stufe 4', 0], ['Stufe 5 · frei', 0]],
      },
    ],
  },

  patterns: {
    quelle: 'theme-v1/module-coach-gaps.jsx · PatternAnalysisView',
    karten: [
      {
        titel: 'Adherence forecast · 30 days',
        quelle: 'module-coach-gaps.jsx:243',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Vorhersagen',
        art: 'text',
        text: 'Eine Kurve mit Konfidenzband. Eine Vorhersage ist eine '
          + 'Rechnung, kein Messwert — sie braucht ein Modell und einen Ort, '
          + 'an dem ihr Ergebnis steht. `coach.checkins` traegt 6 Zeilen '
          + 'Ist-Werte, keine Prognose.',
      },
      {
        titel: 'Risk indicators',
        quelle: 'module-coach-gaps.jsx:257',
        stufe: 'angebunden',
        tabellen: ['coach.alerts'],
        altrepo: 'buddyWatcher.ts (37 KB)',
        art: 'zeilenPaar',
        zeilen: [
          ['Adherence faellt 3 Wochen', '4'], ['Check-in ueberfaellig', '3'],
          ['Schlaf unter Zielwert', '2'], ['Gewicht ausserhalb Band', '1'],
        ],
      },
      {
        titel: 'Day-of-week pattern',
        quelle: 'module-coach-gaps.jsx:271',
        stufe: 'angebunden',
        tabellen: ['coach.checkins'],
        art: 'balken',
        balken: [['Mo', 82], ['Di', 78], ['Mi', 74], ['Do', 71],
          ['Fr', 63], ['Sa', 48], ['So', 51]],
      },
      {
        titel: 'Event impact analysis',
        quelle: 'module-coach-gaps.jsx:288',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Lebensereignisse',
        art: 'text',
        text: 'Der Entwurf setzt Ereignisse (Reise, Krankheit, Umzug) neben '
          + 'den Adherence-Verlauf. `medical.health_events` gibt es, sie '
          + 'traegt aber medizinische Ereignisse — nicht Urlaub oder Umzug. '
          + 'Es gibt kein Feld, in das ein Klient sie eintragen koennte.',
      },
    ],
  },

  intervene: {
    quelle: 'theme-v1/module-coach-gaps.jsx · InterventionEngineView',
    karten: [
      {
        titel: 'Active interventions',
        quelle: 'module-coach-gaps.jsx:329',
        stufe: 'angebunden',
        tabellen: ['coach.pending_actions', 'coach.action_log'],
        altrepo: 'buddyWatcher.ts (37 KB)',
        art: 'liste',
        zeilen: [
          ['laeuft', 'Nachricht statt Anruf · seit 4 d'],
          ['laeuft', 'Plan um eine Woche gestreckt · seit 11 d'],
          ['beendet', 'Check-in-Rhythmus halbiert · vor 3 d'],
        ],
      },
    ],
  },

  consent: {
    quelle: 'theme-v1/module-coach-gaps.jsx · ConsentFlowView',
    karten: [
      {
        titel: 'Client consent · per module sharing',
        quelle: 'module-coach-gaps.jsx:405',
        stufe: 'baubar',
        tabellen: ['coach.client_consent_log'],
        altrepo: 'CoachOverridePanel.tsx (15 KB)',
        art: 'text',
        text: 'Der Reiter zeigt heute die Freigaben aus '
          + '`coach.client_permissions` — der Entwurf will zusaetzlich das '
          + 'PROTOKOLL: wer wann was freigegeben und widerrufen hat. '
          + '`coach.client_consent_log` gibt es (9 Spalten), sie ist aber '
          + 'leer: 0 Zeilen. Erst schreiben, dann lesen.',
      },
    ],
  },

  plans: {
    quelle: 'theme-v1/module-coach.jsx · PortalPlans',
    karten: [
      {
        titel: 'Plan library',
        quelle: 'module-coach.jsx:605',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Plaene',
        altrepo: 'ProgramBuilder.tsx (49 KB)',
        art: 'liste',
        zeilen: [
          ['12-Wochen Aufbau', '4 Athleten · 8 Bloecke'],
          ['Cut · moderat', '2 Athleten · 6 Bloecke'],
          ['Wettkampfvorbereitung', '1 Athlet · 12 Bloecke'],
        ],
      },
    ],
  },

  workflows: {
    quelle: 'theme-v1/module-coach-portal-workflows.jsx · PortalWorkflows',
    karten: [
      {
        titel: 'Steps',
        quelle: 'module-coach-portal-workflows.jsx:122',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Ablaeufe',
        art: 'liste',
        zeilen: [
          ['1', 'Daten sichten'], ['2', 'Abweichung benennen'],
          ['3', 'Anpassung vorschlagen'], ['4', 'Rueckmeldung einholen'],
        ],
      },
      {
        titel: 'Peak-week protocol',
        quelle: 'module-coach-portal-workflows.jsx:182',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Ablaeufe',
        art: 'text',
        text: 'Ein mehrschrittiger Ablauf mit Zustand je Schritt. Es gibt '
          + 'keine Tabelle, die einen laufenden Ablauf haelt.',
      },
      {
        titel: 'Recent runs',
        quelle: 'module-coach-portal-workflows.jsx:210',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Ablaeufe',
        art: 'text',
        text: 'Welcher Ablauf wann fuer wen gelaufen ist. Setzt die Ablaeufe '
          + 'selbst voraus.',
      },
    ],
  },

  onboard: {
    quelle: 'theme-v1/module-coach-portal-workflows.jsx · PortalClientOnboarding',
    karten: [
      {
        titel: 'Client onboarding',
        quelle: 'module-coach-portal-workflows.jsx:239',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Ablaeufe',
        art: 'liste',
        zeilen: [
          ['erledigt', 'Einladung versandt'], ['erledigt', 'Konto verbunden'],
          ['erledigt', 'Freigaben erteilt'], ['laeuft', 'Erstgespraech'],
          ['offen', 'Zielsetzung'], ['offen', 'Plan zugewiesen'],
        ],
      },
      {
        titel: 'Pending invites',
        quelle: 'module-coach-portal-workflows.jsx:279',
        stufe: 'baubar',
        tabellen: ['coach.pending_invites'],
        art: 'text',
        text: 'Offene Einladungen mit Ablaufdatum. `coach.pending_invites` '
          + 'gibt es (15 Spalten), sie ist aber leer: 0 Zeilen — und kein '
          + 'Leseweg im Portal fuehrt dorthin.',
      },
      {
        titel: 'What the client controls',
        quelle: 'module-coach-portal-workflows.jsx:296',
        stufe: 'angebunden',
        tabellen: ['coach.client_permissions'],
        altrepo: 'AutonomyLevelConfig.tsx (11 KB)',
        art: 'text',
        text: 'Was der Klient selbst entscheidet und was er dem Coach '
          + 'ueberlaesst. Der Reiter „Consent" zeigt das schon — der Entwurf '
          + 'stellt es waehrend des Onboardings dar, damit beide es sehen.',
      },
    ],
  },

  programs: {
    quelle: 'theme-v1/module-coach-programs.jsx · PortalPrograms',
    karten: [
      {
        titel: 'Programs',
        quelle: 'module-coach-programs.jsx:82',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Programme',
        altrepo: 'ProgramBuilder.tsx (49 KB)',
        art: 'liste',
        zeilen: [
          ['Hypertrophie 12', '12 Wochen · 4 Athleten'],
          ['Kraft 8', '8 Wochen · 2 Athleten'],
          ['Rekomp 16', '16 Wochen · 1 Athlet'],
        ],
      },
      {
        titel: 'Programmdetail',
        quelle: 'module-coach-programs.jsx:105',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Programme',
        altrepo: 'ProgramBuilder.tsx (49 KB)',
        art: 'text',
        text: 'Bloecke, Wochen, Uebungen je Programm. Ohne Programmtabelle '
          + 'gibt es kein Detail.',
      },
      {
        titel: 'Delivery',
        quelle: 'module-coach-programs.jsx:126',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Programme',
        altrepo: 'ProgramBuilder.tsx (49 KB)',
        art: 'text',
        text: 'Automatische Auslieferung je Woche. Zusaetzlich offen: E-4 '
          + 'fragt, ob ein bestaetigtes Programm selbstaendig ausliefert — '
          + 'derselbe Grund, den `tab-leer.tsx` heute nennt.',
      },
      {
        titel: 'Live assignment',
        quelle: 'module-coach-programs.jsx:151',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Programme',
        altrepo: 'ProgramBuilder.tsx (49 KB)',
        art: 'text',
        text: 'Wer laeuft gerade auf welchem Programm, in welcher Woche.',
      },
      {
        titel: 'Delivery log',
        quelle: 'module-coach-programs.jsx:184',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Programme',
        altrepo: 'ProgramBuilder.tsx (49 KB)',
        art: 'text',
        text: 'Was wann an wen ausgeliefert wurde. `coach.action_log` traegt '
          + 'Coach-Aktionen mit Ruecknahme — aber keine Auslieferung, weil es '
          + 'nichts auszuliefern gibt.',
      },
    ],
  },

  messages: {
    quelle: 'theme-v1/module-coach.jsx · PortalMessages',
    karten: [
      {
        titel: 'Recent messages · all athletes',
        quelle: 'module-coach.jsx:628',
        stufe: 'angebunden',
        tabellen: ['coach.messages'],
        art: 'text',
        text: 'Alle Verlaeufe nebeneinander statt je Athlet. Der Reiter zeigt '
          + 'das heute schon — `coach.messages` traegt 6 Zeilen und wird '
          + 'gelesen. Der Entwurf legt eine Suche und einen Filter darueber.',
      },
    ],
  },

  revenue: {
    quelle: 'theme-v1/module-coach.jsx · PortalRevenue',
    karten: [
      {
        titel: 'Revenue · 12 months',
        quelle: 'module-coach.jsx:655',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Umsatz',
        altrepo: 'research/b2b/ (50 KB)',
        art: 'balken',
        balken: [['Sep', 42], ['Okt', 55], ['Nov', 61], ['Dez', 58],
          ['Jan', 72], ['Feb', 80]],
      },
      {
        titel: 'Revenue split',
        quelle: 'module-coach.jsx:665',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Umsatz',
        altrepo: 'research/b2b/ (50 KB)',
        art: 'text',
        text: 'Aufteilung nach Plan und Klient. Geld gehoert zum Marketplace '
          + '(F-06 T8), nicht ins Portal — der Reiter sagt das heute schon.',
      },
    ],
  },

  team: {
    quelle: 'theme-v1/module-coach-extras.jsx · CoachPortalTeam',
    karten: [
      {
        titel: 'Team',
        quelle: 'module-coach-extras.jsx:616',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Coach-Teams',
        art: 'liste',
        zeilen: [
          ['Inhaber', 'A. Lindqvist · alle Rechte'],
          ['Coach', 'J. Bauer · Nutrition'],
          ['Assistenz', 'M. Weber · nur lesen'],
        ],
      },
      {
        titel: 'Permission matrix',
        quelle: 'module-coach-extras.jsx:633',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Coach-Teams',
        altrepo: 'AutonomyLevelConfig.tsx (11 KB)',
        art: 'text',
        text: 'Wer im Team welches Modul sehen darf. `coach.client_permissions` '
          + 'regelt, was der KLIENT dem Coach freigibt — nicht, was ein Coach '
          + 'seinem Team weiterreicht. Andere Richtung, andere Tabelle.',
      },
      {
        titel: 'Audit log · last 30 days',
        quelle: 'module-coach-extras.jsx:662',
        stufe: 'angebunden',
        tabellen: ['coach.action_log'],
        art: 'text',
        text: 'Wer wann was geaendert hat. `coach.action_log` traegt '
          + '`executed_at`, `executed_by`, `undone_at` und `undo_data` — die '
          + 'Ruecknahme ist vorgesehen, und das Portal liest die Tabelle '
          + 'bereits.',
      },
      {
        titel: 'Coach settings',
        quelle: 'module-coach-gaps.jsx:171',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Coach-Einstellungen',
        art: 'text',
        text: 'Alarme, Buendelung, Ruhezeiten, Eskalation. Dieselbe fehlende '
          + 'Tabelle wie bei „Settings" im Reiter Rules.',
      },
      {
        titel: 'Invite team member',
        quelle: 'module-coach-gaps.jsx:357',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Coach-Teams',
        art: 'text',
        text: 'Ein Coach laedt einen zweiten in sein Team. '
          + '`coach.pending_invites` laedt KLIENTEN ein, nicht Kollegen — '
          + 'die Spalte `coach_id` ist der Einladende, nicht der Eingeladene.',
      },
      {
        titel: 'Teammitglied (Modal)',
        quelle: 'module-coach-gaps.jsx:375',
        stufe: 'blockiert',
        fehlt: 'keine Tabelle fuer Coach-Teams',
        art: 'text',
        text: 'Rechte und Verlauf eines Teammitglieds.',
      },
      {
        titel: 'Audit log (V2)',
        quelle: 'module-coach-portal-v2.jsx:360',
        stufe: 'angebunden',
        tabellen: ['coach.action_log'],
        art: 'text',
        text: 'Dieselbe Sache wie oben, mit Filtern nach Art und Zeitraum. '
          + 'Die zweite Fassung des Entwurfs — nicht eine zweite Kachel.',
      },
    ],
  },
}

/** Alle Karten, flach — fuer Zaehlungen und Waechter. */
export function alleKarten(): Array<RefKarte & { reiter: string }> {
  const raus: Array<RefKarte & { reiter: string }> = []
  for (const [reiter, r] of Object.entries(REFERENZ)) {
    for (const k of r.karten) raus.push({ ...k, reiter })
  }
  return raus
}
