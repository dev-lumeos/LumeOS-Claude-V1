// Die Seitenleiste des Coach-Portals — G-401/A2.
//
// **Tom, 2026-09-08:** *„die coachplattform soll gleich aufgebaut
// sein wie lumeos. genau gleiche strukturen, also ja: sidenav und
// modulnav wie lumeos."*
//
// ══ WARUM EINE EIGENE LISTE UND NICHT `nav.ts` AUS DEM PAKET ════════
//
// `[cmd]` **`packages/ui/src/shell/nav.ts` fuehrt die sieben Module
// von `apps/web`** (dashboard, nutrition, training, recovery,
// supplements, goals, medical) **fest verdrahtet** — und
// `Sidebar.tsx:85` rendert `MODULES.map(...)`, ohne dass eine
// Requisite sie ersetzen koennte.
//
// `[cmd]` **Gemessen:** `SidebarProps` (`sidebar.tsx:37-50`) nimmt
// `pathname`, `linkAs`, `userName`, `userStatus`, `userInitials`,
// `userMenu`, `version` — **keine Navigationsliste.**
//
// `[read]` **Die Paketschale zeigte dem Coach also die Module des
// Athleten.** **Sie einspeisbar zu machen ist eine Aenderung in
// `packages/ui`** — die verbietet dieser Auftrag. **Gemeldet, nicht
// gebaut** (siehe Bericht).
//
// `[read]` **Die KLASSEN sind dieselben** (`v2-sidebar`,
// `v2-nav-group`, `v2-nav-item` …) — sie stehen in `v2.css`, und die
// laedt das Portal schon. **Gleiche Struktur, gleiche Optik, eigene
// Einträge.**
//
// ══ DIE GRUPPEN ═════════════════════════════════════════════════════
//
// `[cmd]` **Das Altrepo fuehrte fuenf Gruppen**
// (`referenz/lumeos-2026/apps/coach/components/Sidebar.tsx:22-48`) —
// **Struktur uebernommen, kein Code:**
//
//     (ohne Titel)   Dashboard
//     Kunden         Klienten, Nachrichten, Check-ins, Alerts
//     Programme      Ernaehrung, Training, Feedback
//     AI & Buddy     AI Butler, Buddy, Regeln, Wissen,
//                    Automations, Autonomie
//     (ohne Titel)   Analytics, Einstellungen
//
// `[cmd]` **Und es hatte Zaehler mit Stufen:** `badge`, dazu `warn`
// (ungelesene Nachrichten, offene Check-ins) und `critical`
// (kritische Alerts).
//
// `[read]` **Die sechzehn Reiter von heute sind darauf verteilt** —
// je Reiter gemessen, in welche Gruppe er gehoert. **Was das Portal
// nicht hat, steht auch nicht in der Liste**: kein AI Butler, kein
// Buddy, keine Wissensbasis — dafuer gibt es weder Reiter noch
// Tabelle.

// `[cmd]` **`IconName` ist exportiert** (`packages/ui/src/index.ts:29`)
// — ein `string` haette jeden Tippfehler durchgelassen, und `Icon`
// zeichnet dann nichts. `[read]` **Kein Cast**: ein Cast schaltet
// genau die Pruefung ab, die den Tippfehler findet.
import type { IconName } from '@lumeos/ui'

/** Ein Eintrag der Seitenleiste. */
export type PortalNavEintrag = {
  /** Der Bereich — gleich dem `?bereich=`-Parameter. */
  id: string
  label: string
  /** Ein Icon aus `@lumeos/ui` — getippt, nicht `string`. */
  icon: IconName
  /**
   * Die Reiter DIESES Bereichs — nicht alle sechzehn.
   *
   * `[read]` **Das ist der Kern von A4:** LumeOS zeigt je Modul eine
   * eigene Reiterleiste, nicht eine Zeile mit allem.
   */
  //
  // `[read]` **Ein Aussenlink fuehrt keine Reiter** — er verlaesst
  // das Portal, also gibt es hier nichts zu gliedern.
  reiter?: Array<{ id: string, label: string }>
  /**
   * Woraus der Zaehler faellt — oder `null`, wenn er nicht rechenbar
   * ist.
   *
   * `[read]` **Ein Zaehler ohne Daten bleibt weg** (G-400/A3): eine
   * erfundene Zahl in der Leiste waere schlimmer als keine.
   */
  zaehler?: 'klienten' | 'ungelesen' | 'checkins' | 'alerts'
    | 'vorschlaege' | 'rechte' | 'autonomie' | 'einladungen' | null
  /** Die Stufe, wenn der Zaehler ueber null steht. */
  stufe?: 'warn' | 'critical'
  /**
   * Ein Ziel ausserhalb des Portals — G-404.
   *
   * `[read]` **Ohne `href` baut die Schale `/?bereich=<id>`** — der
   * Normalfall. **Mit `href` und `extern` fuehrt der Eintrag
   * hinaus**, und die Seitenleiste zeichnet ihn als `<a target=
   * "_blank" rel="noopener noreferrer">`, wie `apps/web` es tut.
   */
  href?: string
  extern?: boolean
}

export type PortalNavGruppe = {
  /** Ohne Titel bleibt die Gruppenbeschriftung weg — wie im Altrepo. */
  label: string | null
  eintraege: PortalNavEintrag[]
}

export const PORTAL_NAV: PortalNavGruppe[] = [
  {
    label: null,
    eintraege: [
      {
        id: 'uebersicht',
        label: 'Dashboard',
        icon: 'dashboard',
        reiter: [{ id: 'overview', label: 'Overview' }],
        zaehler: null,
      },
    ],
  },
  {
    label: 'Kunden',
    eintraege: [
      {
        id: 'klienten',
        label: 'Klienten',
        icon: 'user',
        // `[cmd]` **`athletes` und `onboard` gehoeren zusammen** — die
        // Liste und der Weg, wie einer dazukommt.
        reiter: [
          { id: 'athletes', label: 'Athletes' },
          { id: 'onboard', label: 'Onboarding' },
        ],
        zaehler: 'klienten',
      },
      {
        id: 'nachrichten',
        label: 'Nachrichten',
        icon: 'message',
        reiter: [{ id: 'messages', label: 'Messages' }],
        zaehler: 'ungelesen',
        stufe: 'warn',
      },
      {
        id: 'checkins',
        label: 'Check-ins',
        icon: 'check',
        reiter: [{ id: 'workflows', label: 'Check-ins' }],
        zaehler: 'checkins',
        stufe: 'warn',
      },
      {
        id: 'alerts',
        label: 'Alerts',
        icon: 'bell',
        // `[cmd]` **`alerts`, `patterns` und `intervene` sind EIN
        // Vorgang:** ein Alarm entsteht, man sieht das Muster, man
        // greift ein. **Die Vorlage fuehrt sie als drei Reiter**, das
        // Altrepo als einen Bereich.
        reiter: [
          { id: 'alerts', label: 'Smart alerts' },
          { id: 'patterns', label: 'Patterns' },
          { id: 'intervene', label: 'Interventions' },
        ],
        zaehler: 'alerts',
        stufe: 'critical',
      },
    ],
  },
  {
    label: 'Programme',
    eintraege: [
      {
        id: 'plaene',
        label: 'Plaene',
        icon: 'file',
        reiter: [
          { id: 'plans', label: 'Plans' },
          { id: 'programs', label: 'Programs' },
        ],
        zaehler: null,
      },
    ],
  },
  {
    label: 'Regeln & Rechte',
    eintraege: [
      {
        id: 'regeln',
        label: 'Regeln',
        icon: 'bolt',
        reiter: [{ id: 'rules', label: 'Rules' }],
        zaehler: null,
      },
      {
        id: 'autonomie',
        label: 'Autonomie',
        icon: 'shield',
        reiter: [{ id: 'autonomy', label: 'Autonomy' }],
        zaehler: 'autonomie',
      },
      {
        id: 'freigaben',
        label: 'Freigaben',
        icon: 'shield',
        reiter: [{ id: 'consent', label: 'Consent' }],
        zaehler: 'rechte',
      },
    ],
  },
  {
    label: null,
    eintraege: [
      {
        id: 'auswertung',
        label: 'Auswertung',
        icon: 'trend_up',
        reiter: [
          { id: 'analytics', label: 'Analytics' },
          { id: 'revenue', label: 'Revenue' },
        ],
        zaehler: null,
      },
      {
        id: 'einstellungen',
        label: 'Team & Audit',
        icon: 'shield',
        reiter: [{ id: 'team', label: 'Team & Audit' }],
        zaehler: null,
      },
    ],
  },
  // ══ G-404/A5: Einstellungen als eigener BEREICH ═══════════════════
  //
  // **Der Auftrag sagt:** *„Das Portal hat einen `settings`-Reiter,
  // er zeigt heute `TabLeer`."*
  //
  // `[cmd]` **Gemessen: den Reiter gibt es nicht.** Die sechzehn aus
  // `module-coach.jsx:923-940` enden bei `team`; `LEERE_TABS` fuehrt
  // acht, `settings` ist keiner davon. **Die Frage „Reiter oder
  // Bereich" stellt sich also gar nicht.**
  //
  // ══ WARUM EIN EIGENER BEREICH, UND KEIN SIEBZEHNTER REITER ══════
  //
  // `[read]` **Die sechzehn Reiter sind die ARBEIT am Klienten** —
  // sie kommen aus der Vorlage und beschreiben, was ein Coach mit
  // seinen Athleten tut. **Die eigenen Stammdaten sind keine
  // Arbeit an einem Klienten.**
  //
  // `[read]` **`apps/web` trennt genauso:** Module oben, `Settings`
  // unten unter SYSTEM — nicht als achtes Modul.
  //
  // `[cmd]` **Und ein siebzehnter Reiter waere eine Abweichung von
  // der Vorlage**, die sich nicht belegen liesse: die Liste in
  // `module-coach.jsx` ist abgelesen, nicht erfunden (G-401/A2).
  {
    label: 'System',
    eintraege: [
      {
        id: 'settings',
        label: 'Einstellungen',
        icon: 'settings',
        reiter: [{ id: 'settings', label: 'Einstellungen' }],
        zaehler: null,
      },
    ],
  },
  // ══ G-404/A1: die drei Wege HINAUS ═══════════════════════════════
  //
  // **Tom, 2026-09-08:** *„eigenen links zu lumeos, marketplace,
  // admin."*
  //
  // `[cmd]` **NICHT „Coach Portal"** — `packages/ui/src/shell/nav.ts`
  // fuehrt ihn in `WORKSPACES`, und aus dem Portal waere er ein
  // Verweis auf sich selbst. **Genau deshalb blieb die Gruppe in
  // G-402 weg**; jetzt steht sie da, ohne den Kreis.
  //
  // `[cmd]` **`nav.ts` bleibt unberuehrt** — die Liste hier ist die
  // des Portals, und die Requisite `gruppen` aus G-402 traegt sie.
  {
    label: 'Workspaces',
    eintraege: [
      {
        id: 'zu-lumeos',
        label: 'LumeOS',
        icon: 'dashboard',
        href: 'http://localhost:3200',
        extern: true,
      },
      {
        id: 'zu-marketplace',
        label: 'Marketplace',
        icon: 'marketplace',
        // `[cmd]` **Ortlich laeuft kein Marketplace** — gemessen: die
        // Anwendung gibt es unter `apps/` nicht. `[read]` **Der Link
        // zeigt deshalb auf die Adresse, die `nav.ts` fuehrt** —
        // dieselbe Wahrheit wie in `apps/web`, kein zweiter Ort.
        href: 'https://marketplace.lumeos.app',
        extern: true,
      },
      {
        id: 'zu-admin',
        label: 'Admin',
        icon: 'admin',
        href: 'http://localhost:3210',
        extern: true,
      },
    ],
  },
]

/** Alle Eintraege, flach — fuer Zaehlungen und Waechter. */
export function alleEintraege(): PortalNavEintrag[] {
  return PORTAL_NAV.flatMap(g => g.eintraege)
}

/**
 * Welcher Bereich einen Reiter fuehrt.
 *
 * `[read]` **Damit bleibt `?tab=` gueltig** — ein Link auf
 * `?tab=patterns` findet weiter seinen Platz, jetzt im Bereich
 * `alerts`. **Kein Lesezeichen wird ungueltig.**
 */
export function bereichFuerReiter(tab: string): PortalNavEintrag | null {
  for (const g of PORTAL_NAV) {
    for (const e of g.eintraege) {
      // `[read]` **Ein Aussenlink hat keine Reiter** — `?.some` statt
      // `.some`, sonst faellt die Suche ueber ihn.
      if (e.reiter?.some(r => r.id === tab)) return e
    }
  }
  return null
}
